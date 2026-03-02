---
id: 04-practical-project
title: "Practical Project: Simulating Unitree Go2"
module: "gazebo-unity"
chapter: 4
estimated_reading_time: 35
difficulty: "advanced"
keywords: ["unitree-go2", "quadruped", "sensors", "sim-to-real", "project"]
---

# Practical Project: Simulating Unitree Go2 Robot

This chapter brings together everything learned in Module 2 to simulate the Unitree Go2 quadruped robot - a state-of-the-art robotic dog used in research and industry. We'll build a complete simulation with sensors, controllers, test algorithms, and demonstrate sim-to-real transfer techniques.

## Project Overview

**Goals:**
1. Set up Unitree Go2 robot in Gazebo and Unity
2. Add sensors (cameras, LiDAR, IMU)
3. Implement locomotion control
4. Test navigation algorithms
5. Apply sim-to-real transfer techniques

**What You'll Learn:**
- URDF modeling for quadruped robots
- Joint control and gait generation
- Sensor integration and data processing
- Sim-to-real gap mitigation strategies

## Part 1: Obtaining the Unitree Go2 Model

### Option A: Official URDF (Recommended)

```bash
# Clone Unitree ROS 2 repository
cd ~/ros2_ws/src
git clone https://github.com/unitreerobotics/unitree_ros2.git

# Navigate to Go2 description
cd unitree_ros2/unitree_go2_description

# Verify URDF exists
ls urdf/go2.urdf
```

### Option B: Create Simplified Model

If official URDF unavailable, create a simplified version:

```xml
<!-- simplified_go2.urdf -->
<?xml version="1.0"?>
<robot name="unitree_go2">

  <!-- Base link (body) -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.1"/>
      </geometry>
      <material name="black">
        <color rgba="0.2 0.2 0.2 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="12.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.15" iyz="0" izz="0.2"/>
    </inertial>
  </link>

  <!-- Front Left Leg -->
  <link name="FL_hip">
    <visual>
      <geometry>
        <cylinder radius="0.02" length="0.05"/>
      </geometry>
      <material name="silver">
        <color rgba="0.8 0.8 0.8 1"/>
      </material>
    </visual>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="FL_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="FL_hip"/>
    <origin xyz="0.15 0.1 0" rpy="0 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-0.8" upper="0.8" effort="20" velocity="10"/>
  </joint>

  <link name="FL_thigh">
    <visual>
      <geometry>
        <box size="0.05 0.03 0.2"/>
      </geometry>
      <material name="silver"/>
    </visual>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.003" ixy="0" ixz="0" iyy="0.003" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="FL_thigh_joint" type="revolute">
    <parent link="FL_hip"/>
    <child link="FL_thigh"/>
    <origin xyz="0 0 -0.05" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-2.5" upper="0.5" effort="20" velocity="10"/>
  </joint>

  <link name="FL_calf">
    <visual>
      <geometry>
        <box size="0.03 0.02 0.2"/>
      </geometry>
      <material name="silver"/>
    </visual>
    <inertial>
      <mass value="0.3"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="FL_calf_joint" type="revolute">
    <parent link="FL_thigh"/>
    <child link="FL_calf"/>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-2.7" upper="-0.9" effort="20" velocity="10"/>
  </joint>

  <!-- Repeat for FR, RL, RR legs... -->

</robot>
```

## Part 2: Spawning Go2 in Gazebo

### Create SDF World

```xml
<!-- go2_world.sdf -->
<sdf version='1.9'>
  <world name='go2_playground'>

    <!-- Physics -->
    <physics type="bullet">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <!-- Ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Lighting -->
    <light name='sun' type='directional'>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Obstacles for testing -->
    <model name='obstacle_1'>
      <static>true</static>
      <pose>2 0 0.25 0 0 0</pose>
      <link name='link'>
        <visual name='visual'>
          <geometry>
            <box><size>0.5 0.5 0.5</size></box>
          </geometry>
        </visual>
        <collision name='collision'>
          <geometry>
            <box><size>0.5 0.5 0.5</size></box>
          </geometry>
        </collision>
      </link>
    </model>

    <!-- Ramp for testing climbing -->
    <model name='ramp'>
      <static>true</static>
      <pose>3 2 0 0 0.3 0</pose>
      <link name='link'>
        <visual name='visual'>
          <geometry>
            <box><size>2 1 0.1</size></box>
          </geometry>
        </visual>
        <collision name='collision'>
          <geometry>
            <box><size>2 1 0.1</size></box>
          </geometry>
          <surface>
            <friction>
              <ode>
                <mu>1.0</mu>
                <mu2>1.0</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
      </link>
    </model>

  </world>
</sdf>
```

### Convert URDF to SDF and Spawn

```bash
# Convert URDF to SDF
gz sdf -p ~/ros2_ws/src/unitree_ros2/unitree_go2_description/urdf/go2.urdf > go2.sdf

# Launch Gazebo with world
gz sim go2_world.sdf

# In another terminal, spawn robot
gz model --spawn-file go2.sdf --model-name unitree_go2 --pose "0 0 0.5 0 0 0"
```

## Part 3: Adding Sensors and Actuators

### 1. Front Camera (RGB)

```xml
<!-- Add to go2.sdf inside base_link -->
<sensor name='front_camera' type='camera'>
  <pose>0.2 0 0.05 0 0 0</pose>
  <update_rate>30</update_rate>
  <topic>/go2/camera/front</topic>

  <camera>
    <horizontal_fov>1.047</horizontal_fov> <!-- 60 degrees -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>R8G8B8</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>100</far>
    </clip>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.007</stddev>
    </noise>
  </camera>
</sensor>
```

### 2. LiDAR (360° Laser Scanner)

```xml
<sensor name='lidar' type='gpu_lidar'>
  <pose>0 0 0.1 0 0 0</pose>
  <update_rate>10</update_rate>
  <topic>/go2/scan</topic>

  <lidar>
    <scan>
      <horizontal>
        <samples>360</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>10.0</max>
      <resolution>0.01</resolution>
    </range>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.01</stddev>
    </noise>
  </lidar>
</sensor>
```

### 3. IMU (in Base Link)

```xml
<sensor name='imu' type='imu'>
  <pose>0 0 0 0 0 0</pose>
  <update_rate>100</update_rate>
  <topic>/go2/imu</topic>

  <imu>
    <angular_velocity>
      <x><noise type="gaussian"><mean>0</mean><stddev>0.01</stddev></noise></x>
      <y><noise type="gaussian"><mean>0</mean><stddev>0.01</stddev></noise></y>
      <z><noise type="gaussian"><mean>0</mean><stddev>0.01</stddev></noise></z>
    </angular_velocity>
    <linear_acceleration>
      <x><noise type="gaussian"><mean>0</mean><stddev>0.2</stddev></noise></x>
      <y><noise type="gaussian"><mean>0</mean><stddev>0.2</stddev></noise></y>
      <z><noise type="gaussian"><mean>0</mean><stddev>0.2</stddev></noise></z>
    </linear_acceleration>
  </imu>
</sensor>
```

### 4. Joint Controllers

```xml
<!-- Add joint state publisher plugin -->
<plugin name='joint_state_publisher' filename='libgz-sim-joint-state-publisher-system.so'>
  <topic>/go2/joint_states</topic>
  <update_rate>50</update_rate>
</plugin>

<!-- Add joint position controller for each leg joint -->
<plugin name='joint_controller' filename='libgz-sim-joint-position-controller-system.so'>
  <joint_name>FL_hip_joint</joint_name>
  <topic>/go2/FL_hip_cmd</topic>
  <p_gain>100</p_gain>
  <i_gain>0.1</i_gain>
  <d_gain>10</d_gain>
</plugin>
<!-- Repeat for all 12 joints... -->
```

## Part 4: Implementing Locomotion Control

### Gait Controller (ROS 2 Node)

```python
# gait_controller.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
import numpy as np
import math

class QuadrupedGaitController(Node):
    def __init__(self):
        super().__init__('gait_controller')

        # Joint publishers (12 total: 3 per leg x 4 legs)
        self.joint_pubs = {
            'FL': [
                self.create_publisher(Float64, '/go2/FL_hip_cmd', 10),
                self.create_publisher(Float64, '/go2/FL_thigh_cmd', 10),
                self.create_publisher(Float64, '/go2/FL_calf_cmd', 10)
            ],
            'FR': [
                self.create_publisher(Float64, '/go2/FR_hip_cmd', 10),
                self.create_publisher(Float64, '/go2/FR_thigh_cmd', 10),
                self.create_publisher(Float64, '/go2/FR_calf_cmd', 10)
            ],
            'RL': [
                self.create_publisher(Float64, '/go2/RL_hip_cmd', 10),
                self.create_publisher(Float64, '/go2/RL_thigh_cmd', 10),
                self.create_publisher(Float64, '/go2/RL_calf_cmd', 10)
            ],
            'RR': [
                self.create_publisher(Float64, '/go2/RR_hip_cmd', 10),
                self.create_publisher(Float64, '/go2/RR_thigh_cmd', 10),
                self.create_publisher(Float64, '/go2/RR_calf_cmd', 10)
            ]
        }

        # Gait parameters
        self.gait_frequency = 1.0  # Hz (steps per second)
        self.step_height = 0.05    # meters
        self.stride_length = 0.1   # meters

        # Timer for gait generation
        self.timer = self.create_timer(0.02, self.gait_callback)  # 50 Hz
        self.phase = 0.0

        self.get_logger().info('Quadruped Gait Controller started')

    def gait_callback(self):
        # Trot gait: diagonal legs move together
        # FL + RR swing together, FR + RL swing together

        dt = 0.02  # seconds
        self.phase += 2 * math.pi * self.gait_frequency * dt
        if self.phase > 2 * math.pi:
            self.phase -= 2 * math.pi

        # Calculate leg positions
        fl_pos = self.calculate_leg_position('FL', self.phase)
        fr_pos = self.calculate_leg_position('FR', self.phase + math.pi)
        rl_pos = self.calculate_leg_position('RL', self.phase + math.pi)
        rr_pos = self.calculate_leg_position('RR', self.phase)

        # Inverse kinematics to joint angles
        fl_angles = self.inverse_kinematics(fl_pos)
        fr_angles = self.inverse_kinematics(fr_pos)
        rl_angles = self.inverse_kinematics(rl_pos)
        rr_angles = self.inverse_kinematics(rr_pos)

        # Publish commands
        self.publish_leg_command('FL', fl_angles)
        self.publish_leg_command('FR', fr_angles)
        self.publish_leg_command('RL', rl_angles)
        self.publish_leg_command('RR', rr_angles)

    def calculate_leg_position(self, leg_name, phase):
        # Swing phase (leg in air)
        if 0 <= phase < math.pi:
            x = self.stride_length * (phase / math.pi - 0.5)
            z = -0.3 + self.step_height * math.sin(phase)
        # Stance phase (leg on ground)
        else:
            x = self.stride_length * (0.5 - (phase - math.pi) / math.pi)
            z = -0.3

        return np.array([x, 0, z])

    def inverse_kinematics(self, foot_pos):
        # Simplified IK for 3-DOF leg
        # (In practice, use proper 3D IK solver)

        x, y, z = foot_pos
        L1 = 0.05  # Hip length
        L2 = 0.2   # Thigh length
        L3 = 0.2   # Calf length

        # Hip angle
        hip = math.atan2(y, x)

        # Knee and ankle (2D IK in sagittal plane)
        r = math.sqrt(x**2 + z**2)
        cos_knee = (r**2 - L2**2 - L3**2) / (2 * L2 * L3)
        cos_knee = max(-1, min(1, cos_knee))  # Clamp
        knee = math.acos(cos_knee)

        ankle = math.atan2(z, x) - math.atan2(L3 * math.sin(knee), L2 + L3 * math.cos(knee))

        return [hip, -ankle, -knee]

    def publish_leg_command(self, leg_name, angles):
        for i, angle in enumerate(angles):
            msg = Float64()
            msg.data = angle
            self.joint_pubs[leg_name][i].publish(msg)

def main():
    rclpy.init()
    controller = QuadrupedGaitController()
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Run the controller:**
```bash
# Build workspace
cd ~/ros2_ws
colcon build --packages-select go2_controller

# Source and run
source install/setup.bash
ros2 run go2_controller gait_controller
```

## Part 5: Testing Navigation Algorithms

### Obstacle Avoidance with LiDAR

```python
# obstacle_avoidance.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist
import numpy as np

class ObstacleAvoidance(Node):
    def __init__(self):
        super().__init__('obstacle_avoidance')

        self.scan_sub = self.create_subscription(
            LaserScan, '/go2/scan', self.scan_callback, 10
        )
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        self.obstacle_threshold = 0.5  # meters

    def scan_callback(self, msg):
        # Convert ranges to numpy array
        ranges = np.array(msg.ranges)
        ranges[np.isinf(ranges)] = msg.range_max

        # Divide into sectors (left, front, right)
        n = len(ranges)
        left_sector = ranges[:n//3]
        front_sector = ranges[n//3:2*n//3]
        right_sector = ranges[2*n//3:]

        # Compute minimum distances
        left_min = np.min(left_sector)
        front_min = np.min(front_sector)
        right_min = np.min(right_sector)

        # Decision logic
        cmd = Twist()

        if front_min < self.obstacle_threshold:
            # Obstacle ahead, turn
            if left_min > right_min:
                # More space on left
                cmd.linear.x = 0.1
                cmd.angular.z = 0.5  # Turn left
                self.get_logger().info('Turning left to avoid obstacle')
            else:
                # More space on right
                cmd.linear.x = 0.1
                cmd.angular.z = -0.5  # Turn right
                self.get_logger().info('Turning right to avoid obstacle')
        else:
            # Clear ahead, move forward
            cmd.linear.x = 0.3
            cmd.angular.z = 0.0

        self.cmd_pub.publish(cmd)

def main():
    rclpy.init()
    node = ObstacleAvoidance()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Part 6: Sim-to-Real Transfer Techniques

### 1. **Domain Randomization**

Randomize simulation parameters to make policies robust:

```python
# domain_randomization.py
import random

class SimulationRandomizer:
    def __init__(self, gz_client):
        self.gz_client = gz_client

    def randomize_physics(self):
        # Randomize gravity (±5%)
        gravity = random.uniform(9.81 * 0.95, 9.81 * 1.05)
        self.gz_client.set_gravity([0, 0, -gravity])

        # Randomize ground friction
        friction = random.uniform(0.6, 1.2)
        self.gz_client.set_friction('ground_plane', friction)

    def randomize_mass(self, robot_name):
        # Randomize robot mass (±10%)
        base_mass = 12.0
        new_mass = random.uniform(base_mass * 0.9, base_mass * 1.1)
        self.gz_client.set_link_mass(robot_name, 'base_link', new_mass)

    def randomize_sensor_noise(self):
        # Increase sensor noise beyond nominal
        imu_noise = random.uniform(0.01, 0.03)
        lidar_noise = random.uniform(0.01, 0.05)
        # Apply via Gazebo API...

    def randomize_all(self):
        self.randomize_physics()
        self.randomize_mass('unitree_go2')
        self.randomize_sensor_noise()
```

### 2. **System Identification**

Match simulation to real robot:

```python
# system_identification.py
import numpy as np
from scipy.optimize import minimize

class SystemID:
    def __init__(self, real_data, sim_func):
        self.real_data = real_data  # Logged from real robot
        self.sim_func = sim_func    # Simulation function

    def objective(self, params):
        # params = [mass, friction, damping, ...]
        sim_data = self.sim_func(params)

        # Compute error between sim and real
        error = np.mean((self.real_data - sim_data) ** 2)
        return error

    def optimize(self):
        # Initial guess
        x0 = [12.0, 0.8, 0.1]  # mass, friction, damping

        # Bounds
        bounds = [(10, 15), (0.5, 1.2), (0.05, 0.5)]

        # Optimize
        result = minimize(self.objective, x0, bounds=bounds, method='L-BFGS-B')

        print(f"Optimized parameters: {result.x}")
        return result.x
```

### 3. **Sim2Real Testing Protocol**

**Step 1: Train in Simulation**
```bash
# Train RL policy in Gazebo (example with Isaac Gym or similar)
python train_policy.py --env go2_walk --iterations 10000
```

**Step 2: Test in Sim with Randomization**
```bash
# Test with domain randomization enabled
python test_policy.py --env go2_walk --randomize --episodes 100
```

**Step 3: Deploy to Real Robot**
```python
# deploy_policy.py
import torch
from unitree_legged_sdk import RobotInterface

class PolicyDeployment:
    def __init__(self, policy_path):
        self.policy = torch.load(policy_path)
        self.robot = RobotInterface()

    def run(self):
        while True:
            # Get robot state
            state = self.robot.get_state()

            # Run policy
            action = self.policy(state)

            # Send commands
            self.robot.send_command(action)

            # Sleep for control loop
            time.sleep(0.02)  # 50 Hz

deployer = PolicyDeployment('trained_policy.pth')
deployer.run()
```

**Step 4: Log and Compare**
```python
# compare_sim_real.py
import matplotlib.pyplot as plt

def compare_trajectories(sim_data, real_data):
    fig, axes = plt.subplots(3, 1, figsize=(10, 8))

    # Position
    axes[0].plot(sim_data['time'], sim_data['position'], label='Sim')
    axes[0].plot(real_data['time'], real_data['position'], label='Real')
    axes[0].set_ylabel('Position (m)')
    axes[0].legend()

    # Velocity
    axes[1].plot(sim_data['time'], sim_data['velocity'], label='Sim')
    axes[1].plot(real_data['time'], real_data['velocity'], label='Real')
    axes[1].set_ylabel('Velocity (m/s)')
    axes[1].legend()

    # Joint torques
    axes[2].plot(sim_data['time'], sim_data['torque'], label='Sim')
    axes[2].plot(real_data['time'], real_data['torque'], label='Real')
    axes[2].set_ylabel('Torque (Nm)')
    axes[2].set_xlabel('Time (s)')
    axes[2].legend()

    plt.tight_layout()
    plt.savefig('sim_vs_real.png')
    plt.show()
```

## Part 7: Unity Integration (Bonus)

Import Go2 into Unity for photorealistic rendering:

```csharp
// Go2UnityController.cs
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class Go2UnityController : MonoBehaviour
{
    private ROSConnection ros;
    private ArticulationBody[] joints;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Subscribe<JointStateMsg>("/go2/joint_states", UpdateJoints);

        // Get all articulation bodies
        joints = GetComponentsInChildren<ArticulationBody>();
    }

    void UpdateJoints(JointStateMsg msg)
    {
        for (int i = 0; i < msg.position.Length && i < joints.Length; i++)
        {
            ArticulationDrive drive = joints[i].xDrive;
            drive.target = (float)msg.position[i] * Mathf.Rad2Deg;
            joints[i].xDrive = drive;
        }
    }
}
```

## Project Deliverables

✅ **Gazebo simulation** with full sensor suite
✅ **Locomotion controller** implementing trot gait
✅ **Obstacle avoidance** using LiDAR
✅ **Domain randomization** for robustness
✅ **Sim-to-real comparison** tools
✅ **(Bonus) Unity integration** for visualization

## Evaluation Criteria

- [ ] Robot walks forward in simulation without falling
- [ ] Trot gait matches biological quadruped motion
- [ ] Obstacle avoidance prevents collisions
- [ ] Policy works with ±10% mass variation
- [ ] Sim trajectory matches real robot within 20% error

## Troubleshooting

**Problem: Robot falls over immediately**
- Check joint limits in URDF
- Increase PD gains in joint controllers
- Verify center of mass is correct

**Problem: Legs clip through ground**
- Increase ground plane friction
- Add collision geometry to feet
- Reduce time step size

**Problem: Simulation runs slower than real-time**
- Use simpler collision meshes
- Reduce sensor update rates
- Enable GPU acceleration

## Key Takeaways

✅ **Quadruped simulation** requires careful URDF modeling
✅ **Gait generation** can be analytical or learned (RL)
✅ **Sensor fusion** (IMU + LiDAR + vision) enables autonomy
✅ **Domain randomization** bridges sim-to-real gap
✅ **System identification** fine-tunes simulation parameters
✅ **Testing protocol** validates before real deployment

## Next Module

In **Module 3**, we'll explore **NVIDIA Isaac Sim and Isaac ROS**, a GPU-accelerated simulation platform designed for physically accurate robotics simulation and AI training at scale.

## Further Reading

- [Unitree Go2 Documentation](https://www.unitree.com/go2)
- [Quadruped Gait Analysis](https://ieeexplore.ieee.org/document/8794448)
- [Sim-to-Real Transfer](https://arxiv.org/abs/1812.06552)
- [System Identification for Robotics](https://www.springer.com/book/9783540239673)
