---
id: 04-training-in-simulation
title: "Training in Simulation"
module: "isaac"
chapter: 4
estimated_reading_time: 30
difficulty: "advanced"
keywords: ["reinforcement-learning", "synthetic-data", "domain-randomization", "sim-to-real"]
---

# Training in Simulation

Isaac Sim enables large-scale AI training through GPU-accelerated parallel simulation, synthetic data generation, and domain randomization. This chapter covers reinforcement learning workflows, dataset generation, and transfer learning for real robots.

## Reinforcement Learning in Isaac Sim

### Isaac Gym Integration

**Isaac Gym** provides RL environment creation for massively parallel training.

**Architecture:**
```
┌──────────────────────────────────────────────────┐
│         RL Training Loop (PyTorch/TensorFlow)    │
└───────────────────┬──────────────────────────────┘
                    │ (Actions)
┌───────────────────▼──────────────────────────────┐
│          Isaac Gym VecEnv (1024 envs)             │
│  ┌─────┐ ┌─────┐ ┌─────┐     ┌─────┐             │
│  │Env 1│ │Env 2│ │Env 3│ ... │Env N│             │
│  └─────┘ └─────┘ └─────┘     └─────┘             │
└───────────────────┬──────────────────────────────┘
                    │ (States, Rewards)
┌───────────────────▼──────────────────────────────┐
│            NVIDIA PhysX (GPU)                     │
└──────────────────────────────────────────────────┘
```

### Setting Up Isaac Gym Environment

**Installation:**
```bash
# Clone Isaac Gym (requires NVIDIA GPU)
cd ~/
git clone https://github.com/NVIDIA-Omniverse/IsaacGymEnvs.git
cd IsaacGymEnvs

# Install dependencies
pip install -e .

# Verify installation
python train.py task=Cartpole
```

### Creating Custom Humanoid Task

```python
# humanoid_walk_task.py
from omni.isaac.gym.vec_env import VecEnvBase
import torch
import numpy as np

class HumanoidWalkTask(VecEnvBase):
    def __init__(self, cfg, sim_params, physics_engine, device):
        self.cfg = cfg
        self.max_episode_length = 500

        # Action and observation spaces
        self.num_actions = 12  # 12 joint torques
        self.num_obs = 48  # Joint positions, velocities, body orientation, etc.

        super().__init__(cfg, sim_params, physics_engine, device)

        # Initialize buffers on GPU
        self.obs_buf = torch.zeros((self.num_envs, self.num_obs), device=self.device)
        self.rew_buf = torch.zeros(self.num_envs, device=self.device)
        self.reset_buf = torch.ones(self.num_envs, device=self.device, dtype=torch.long)

    def create_sim(self):
        """Create parallel simulation environments"""
        self.gym.create_sim(...)

        # Load humanoid asset
        asset_root = "assets/"
        asset_file = "humanoid.urdf"

        asset_options = gymapi.AssetOptions()
        asset_options.default_dof_drive_mode = gymapi.DOF_MODE_EFFORT

        humanoid_asset = self.gym.load_asset(
            self.sim, asset_root, asset_file, asset_options
        )

        # Create environments
        num_per_row = int(np.sqrt(self.num_envs))
        spacing = 2.0

        for i in range(self.num_envs):
            env = self.gym.create_env(self.sim, gymapi.Vec3(-spacing, 0.0, -spacing),
                                      gymapi.Vec3(spacing, spacing, spacing), num_per_row)

            # Spawn humanoid
            pose = gymapi.Transform()
            pose.p = gymapi.Vec3(0.0, 0.0, 1.0)

            humanoid_handle = self.gym.create_actor(
                env, humanoid_asset, pose, "humanoid", i, 1
            )

            self.envs.append(env)
            self.humanoid_handles.append(humanoid_handle)

    def compute_observations(self):
        """Extract state information for policy"""
        # Get joint positions and velocities
        self.gym.refresh_dof_state_tensor(self.sim)
        self.gym.refresh_actor_root_state_tensor(self.sim)

        # Joint positions (12)
        self.obs_buf[:, :12] = self.dof_pos

        # Joint velocities (12)
        self.obs_buf[:, 12:24] = self.dof_vel

        # Base linear velocity (3)
        self.obs_buf[:, 24:27] = self.root_states[:, 7:10]

        # Base angular velocity (3)
        self.obs_buf[:, 27:30] = self.root_states[:, 10:13]

        # Base orientation (quaternion, 4)
        self.obs_buf[:, 30:34] = self.root_states[:, 3:7]

        # Projected gravity (3)
        self.obs_buf[:, 34:37] = self.compute_projected_gravity()

        # Target velocity command (2: forward, yaw)
        self.obs_buf[:, 37:39] = self.commands[:, :2]

        # Previous actions (12)
        self.obs_buf[:, 39:51] = self.actions

    def compute_reward(self):
        """Reward function for walking"""
        # Forward velocity reward
        forward_vel = self.root_states[:, 7]  # Linear velocity in x
        target_vel = self.commands[:, 0]
        vel_reward = torch.exp(-torch.abs(forward_vel - target_vel))

        # Upright reward (penalize tipping over)
        up_vector = self.compute_up_vector()
        upright_reward = torch.clamp(up_vector[:, 2], 0, 1)

        # Energy penalty (discourage large torques)
        energy_penalty = torch.sum(torch.square(self.actions), dim=1)

        # Alive bonus (encourage staying upright)
        alive_bonus = torch.ones_like(forward_vel)

        # Total reward
        self.rew_buf = (
            2.0 * vel_reward +
            0.5 * upright_reward +
            0.01 * alive_bonus -
            0.0001 * energy_penalty
        )

    def compute_reset(self):
        """Determine which environments need reset"""
        # Reset if fallen (z position too low)
        self.reset_buf = torch.where(
            self.root_states[:, 2] < 0.3,
            torch.ones_like(self.reset_buf),
            self.reset_buf
        )

        # Reset if max episode length reached
        self.reset_buf = torch.where(
            self.progress_buf >= self.max_episode_length,
            torch.ones_like(self.reset_buf),
            self.reset_buf
        )

    def pre_physics_step(self, actions):
        """Apply actions to simulation"""
        self.actions = actions.clone().to(self.device)

        # Scale actions to torque limits
        torques = self.actions * self.motor_strength

        # Apply torques to joints
        self.gym.set_dof_actuation_force_tensor(self.sim, gymtorch.unwrap_tensor(torques))

    def post_physics_step(self):
        """Update states after physics step"""
        self.progress_buf += 1

        self.compute_observations()
        self.compute_reward()
        self.compute_reset()

        # Handle resets
        env_ids = self.reset_buf.nonzero(as_tuple=False).squeeze(-1)
        if len(env_ids) > 0:
            self.reset_idx(env_ids)
```

### Training Loop

```python
# train_humanoid.py
import torch
from rl_games.torch_runner import Runner

# Configuration
cfg = {
    "params": {
        "seed": 42,
        "algo": {
            "name": "a2c_continuous"
        },
        "model": {
            "name": "continuous_a2c_logstd"
        },
        "network": {
            "name": "actor_critic",
            "separate": False,
            "space": {
                "continuous": {
                    "mu_activation": "None",
                    "sigma_activation": "None",
                    "mu_init": {"name": "default"},
                    "sigma_init": {"name": "const_initializer", "val": 0},
                    "fixed_sigma": True
                }
            },
            "mlp": {
                "units": [256, 128, 64],
                "activation": "elu",
                "initializer": {"name": "default"},
                "regularizer": {"name": "None"}
            }
        },
        "config": {
            "name": "HumanoidWalk",
            "env_name": "rlgpu",
            "multi_gpu": False,
            "ppo": True,
            "mixed_precision": True,
            "normalize_input": True,
            "normalize_value": True,
            "reward_shaper": {
                "scale_value": 0.01
            },
            "normalize_advantage": True,
            "gamma": 0.99,
            "tau": 0.95,
            "learning_rate": 3e-4,
            "lr_schedule": "adaptive",
            "score_to_win": 20000,
            "max_epochs": 10000,
            "save_best_after": 100,
            "save_frequency": 500,
            "grad_norm": 1.0,
            "entropy_coef": 0.0,
            "truncate_grads": True,
            "e_clip": 0.2,
            "horizon_length": 32,
            "minibatch_size": 32768,
            "mini_epochs": 5,
            "critic_coef": 2,
            "clip_value": True,
            "seq_len": 4,
            "bounds_loss_coef": 0.0001
        }
    }
}

# Train
runner = Runner()
runner.load(cfg)
runner.reset()
runner.run({
    "train": True,
    "play": False,
    "checkpoint": "runs/HumanoidWalk/nn/HumanoidWalk.pth",
    "sigma": None
})
```

**Monitor Training:**
```bash
# TensorBoard
tensorboard --logdir=runs/HumanoidWalk

# Navigate to http://localhost:6006
```

## Synthetic Data Generation

### Generating Annotated Datasets

**Use Case:** Train object detection for warehouse robots

```python
# synthetic_data_generator.py
from omni.isaac.kit import SimulationApp

simulation_app = SimulationApp({"headless": True})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.synthetic_utils import SyntheticDataHelper
import omni.replicator.core as rep

# Create world
world = World()

# Add camera
camera = rep.create.camera(position=(3, 3, 3))

# Create randomized scene
def randomize_scene():
    with rep.trigger.on_frame():
        # Random objects
        with rep.create.group([
            rep.create.cube(scale=rep.distribution.uniform(0.1, 0.5)),
            rep.create.sphere(scale=rep.distribution.uniform(0.1, 0.5))
        ]):
            rep.modify.pose(
                position=rep.distribution.uniform((-2, -2, 0), (2, 2, 2)),
                rotation=rep.distribution.uniform((0, 0, 0), (360, 360, 360))
            )
            rep.randomizer.color(
                colors=rep.distribution.uniform((0, 0, 0), (1, 1, 1))
            )

        # Random lighting
        with rep.create.light():
            rep.modify.attribute("intensity", rep.distribution.uniform(1000, 10000))

# Register render products
rp = rep.create.render_product(camera, (640, 480))

# Annotators
writer = rep.WriterRegistry.get("BasicWriter")
writer.initialize(
    output_dir="synthetic_data/",
    rgb=True,
    bounding_box_2d_tight=True,
    semantic_segmentation=True,
    distance_to_camera=True
)

# Generate dataset
rep.orchestrator.run(num_frames=1000)

simulation_app.close()
```

**Output Structure:**
```
synthetic_data/
├── rgb/
│   ├── 0000.png
│   ├── 0001.png
│   └── ...
├── bounding_box_2d_tight/
│   ├── 0000.json
│   └── ...
├── semantic_segmentation/
│   ├── 0000.png
│   └── ...
└── distance_to_camera/
    ├── 0000.npy
    └── ...
```

### Training YOLOv8 on Synthetic Data

```python
# train_yolo_synthetic.py
from ultralytics import YOLO
import json
import os

# Convert annotations to YOLO format
def convert_annotations(data_dir):
    for img_file in os.listdir(f"{data_dir}/rgb"):
        img_id = img_file.split('.')[0]
        bbox_file = f"{data_dir}/bounding_box_2d_tight/{img_id}.json"

        with open(bbox_file, 'r') as f:
            bboxes = json.load(f)

        # Convert to YOLO format (class x_center y_center width height)
        yolo_labels = []
        for bbox in bboxes:
            class_id = bbox['class_id']
            x_min, y_min, x_max, y_max = bbox['bbox']

            x_center = (x_min + x_max) / 2 / 640  # Normalize
            y_center = (y_min + y_max) / 2 / 480
            width = (x_max - x_min) / 640
            height = (y_max - y_min) / 480

            yolo_labels.append(f"{class_id} {x_center} {y_center} {width} {height}")

        # Write YOLO label file
        with open(f"{data_dir}/labels/{img_id}.txt", 'w') as f:
            f.write('\n'.join(yolo_labels))

# Convert dataset
convert_annotations("synthetic_data")

# Train YOLOv8
model = YOLO('yolov8n.pt')
model.train(
    data='synthetic_dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device=0  # GPU 0
)
```

## Domain Randomization

### Comprehensive Randomization Strategy

```python
# domain_randomizer.py
import omni.replicator.core as rep
import numpy as np

class DomainRandomizer:
    def __init__(self):
        self.randomizers = []

    def add_physics_randomization(self):
        """Randomize physics parameters"""
        def randomize_physics():
            # Gravity (±5%)
            rep.modify.attribute("physics:gravityMagnitude",
                rep.distribution.uniform(9.31, 10.31))

            # Friction
            rep.modify.attribute("physics:friction:coefficient",
                rep.distribution.uniform(0.5, 1.5))

            # Mass (±20%)
            rep.modify.attribute("physics:mass",
                rep.distribution.uniform(0.8, 1.2))

        self.randomizers.append(randomize_physics)

    def add_visual_randomization(self):
        """Randomize visual appearance"""
        def randomize_visuals():
            # Material colors
            rep.randomizer.color(
                colors=rep.distribution.uniform((0, 0, 0), (1, 1, 1))
            )

            # Textures
            rep.randomizer.texture(
                textures=["/path/to/textures/*.png"]
            )

            # Lighting
            with rep.get.prims(path_pattern="/World/Lights/*"):
                rep.modify.attribute("intensity",
                    rep.distribution.uniform(500, 5000))

                rep.modify.attribute("color",
                    rep.distribution.uniform((0.8, 0.8, 0.8), (1, 1, 1)))

        self.randomizers.append(randomize_visuals)

    def add_camera_randomization(self):
        """Randomize camera parameters"""
        def randomize_camera():
            with rep.get.prims(semantics=[("class", "camera")]):
                # Camera pose
                rep.modify.pose(
                    position=rep.distribution.uniform((-0.5, -0.5, -0.2), (0.5, 0.5, 0.2)),
                    rotation=rep.distribution.uniform((-10, -10, -10), (10, 10, 10))
                )

                # Focal length
                rep.modify.attribute("focalLength",
                    rep.distribution.uniform(18, 35))

                # Exposure
                rep.modify.attribute("exposureCompensation",
                    rep.distribution.uniform(-1, 1))

        self.randomizers.append(randomize_camera)

    def apply_randomization(self):
        """Apply all randomizers"""
        with rep.trigger.on_frame():
            for randomizer in self.randomizers:
                randomizer()

# Usage
randomizer = DomainRandomizer()
randomizer.add_physics_randomization()
randomizer.add_visual_randomization()
randomizer.add_camera_randomization()
randomizer.apply_randomization()
```

## Transfer Learning to Real Robots

### Sim-to-Real Pipeline

```
┌──────────────────┐
│  Train in Sim    │  (10k episodes, domain randomization)
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Validate in Sim  │  (Test on diverse scenarios)
└────────┬─────────┘
         │
┌────────▼─────────┐
│   Fine-tune      │  (Optional: with real robot data)
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Deploy to Robot  │  (Convert policy to ONNX/TensorRT)
└──────────────────┘
```

### Policy Deployment

```python
# deploy_policy.py
import torch
import onnxruntime as ort
import numpy as np

class PolicyDeployment:
    def __init__(self, model_path):
        # Load ONNX model (converted from PyTorch)
        self.session = ort.InferenceSession(model_path,
            providers=['TensorrtExecutionProvider', 'CUDAExecutionProvider'])

        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def predict(self, observation):
        """Run inference"""
        obs = np.array(observation, dtype=np.float32).reshape(1, -1)

        action = self.session.run([self.output_name], {self.input_name: obs})[0]

        return action.flatten()

# Convert PyTorch model to ONNX
def convert_to_onnx(pytorch_model, dummy_input, output_path):
    torch.onnx.export(
        pytorch_model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=11,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )

# Example
policy = torch.load('trained_policy.pth')
dummy_input = torch.randn(1, 48)  # Observation size
convert_to_onnx(policy.actor, dummy_input, 'policy.onnx')

# Deploy
deployment = PolicyDeployment('policy.onnx')
action = deployment.predict(current_observation)
```

### Real Robot Interface

```python
# real_robot_controller.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from std_msgs.msg import Float64MultiArray

class RealRobotController(Node):
    def __init__(self, policy_path):
        super().__init__('real_robot_controller')

        self.policy = PolicyDeployment(policy_path)

        # Subscribe to joint states
        self.joint_sub = self.create_subscription(
            JointState, '/joint_states', self.joint_callback, 10
        )

        # Publish joint commands
        self.cmd_pub = self.create_publisher(
            Float64MultiArray, '/joint_group_position_controller/command', 10
        )

        self.current_obs = None

    def joint_callback(self, msg):
        # Construct observation from sensor data
        self.current_obs = self.construct_observation(msg)

        # Run policy
        action = self.policy.predict(self.current_obs)

        # Send command to robot
        cmd = Float64MultiArray()
        cmd.data = action.tolist()
        self.cmd_pub.publish(cmd)

    def construct_observation(self, joint_state):
        # Match simulation observation structure
        obs = np.zeros(48)
        obs[:12] = joint_state.position[:12]
        obs[12:24] = joint_state.velocity[:12]
        # Add IMU, base velocity, etc.
        return obs

def main():
    rclpy.init()
    controller = RealRobotController('policy.onnx')
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()
```

## Best Practices for Sim-to-Real

### 1. **Progressive Difficulty**

```python
# Curriculum learning
curriculum = [
    {"difficulty": "easy", "episodes": 1000, "terrain": "flat"},
    {"difficulty": "medium", "episodes": 2000, "terrain": "uneven"},
    {"difficulty": "hard", "episodes": 3000, "terrain": "stairs"}
]

for stage in curriculum:
    train(stage)
```

### 2. **System Identification**

```python
# Match simulation parameters to real robot
def system_id(real_data, sim_func):
    def objective(params):
        sim_data = sim_func(params)
        error = np.mean((real_data - sim_data) ** 2)
        return error

    optimized_params = scipy.optimize.minimize(objective, initial_params)
    return optimized_params
```

### 3. **Residual Learning**

```python
# Train residual policy to correct sim policy on real robot
class ResidualPolicy(nn.Module):
    def __init__(self, base_policy):
        super().__init__()
        self.base_policy = base_policy  # Frozen sim policy
        self.residual_net = nn.Sequential(...)  # Trainable

    def forward(self, obs):
        base_action = self.base_policy(obs)
        residual = self.residual_net(obs)
        return base_action + residual
```

## Key Takeaways

✅ **Isaac Gym** enables massively parallel RL training (1000+ environments)
✅ **Synthetic data generation** with Replicator for computer vision
✅ **Domain randomization** improves sim-to-real transfer
✅ **ONNX/TensorRT** deployment for efficient real-time inference
✅ **Curriculum learning** and **system identification** enhance transfer
✅ **Residual learning** fine-tunes policies on real robots

## Next Module

In **Module 4**, we'll explore **Vision-Language-Action (VLA) Models**, combining vision, language understanding, and robotic control. Topics include voice interfaces with Whisper, LLM-based task planning, and building an autonomous humanoid robot with multimodal AI.

## Further Reading

- [Isaac Gym Paper](https://arxiv.org/abs/2108.10470)
- [Domain Randomization for Sim-to-Real](https://arxiv.org/abs/1703.06907)
- [RL Games Library](https://github.com/Denys88/rl_games)
- [ONNX Runtime](https://onnxruntime.ai/)
