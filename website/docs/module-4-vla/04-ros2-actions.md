---
id: 04-ros2-actions
title: "Capstone Project: Autonomous Humanoid Robot"
module: "vla"
chapter: 4
estimated_reading_time: 40
difficulty: "advanced"
keywords: ["capstone", "humanoid", "voice-control", "autonomous", "integration"]
---

# Capstone Project: Autonomous Humanoid Robot

This capstone project integrates everything learned across all four modules: ROS 2 fundamentals, simulation (Gazebo/Unity/Isaac), and Vision-Language-Action models. We'll build an autonomous humanoid robot that understands voice commands, plans tasks using LLMs, navigates environments, and manipulates objects.

## Project Overview

**Goal:** Build a voice-controlled humanoid robot that can:
1. Listen to natural language commands via Whisper
2. Plan tasks using GPT-4
3. Navigate using Nav2 and Isaac ROS perception
4. Manipulate objects using vision and grasping
5. Provide verbal feedback using text-to-speech

**Target Robot:** Simulated humanoid (UnitreeG1/H1 or custom URDF)

**Deployment:** Isaac Sim for training → Real hardware (optional)

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  User Interface Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ Whisper  │→ │   GPT-4  │→ │   TTS    │                    │
│  │ (Voice)  │  │ (Planner)│  │ (Speech) │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
└────────────────────┬──────────────────────────────────────────┘
                     │ (High-level commands)
┌────────────────────▼──────────────────────────────────────────┐
│               Task Execution Layer                             │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐                │
│  │   Nav2    │  │ MoveIt 2  │  │ Grasp      │                │
│  │(Navigation│  │(Arm Control│  │ Planning   │                │
│  └───────────┘  └───────────┘  └────────────┘                │
└────────────────────┬──────────────────────────────────────────┘
                     │ (Low-level actions)
┌────────────────────▼──────────────────────────────────────────┐
│             Perception Layer (Isaac ROS)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  VSLAM   │  │  Depth   │  │  Object  │  │ Semantic │      │
│  │          │  │Perception│  │ Detection│  │ Segment. │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└────────────────────┬──────────────────────────────────────────┘
                     │ (Sensor data)
┌────────────────────▼──────────────────────────────────────────┐
│              Simulation / Hardware                             │
│        Isaac Sim / Gazebo / Real Robot                         │
└──────────────────────────────────────────────────────────────┘
```

## Phase 1: Robot Setup in Isaac Sim

### 1.1 Import Humanoid Model

```python
# setup_humanoid.py
from omni.isaac.kit import SimulationApp

simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.urdf import _urdf

# Create world
world = World()

# Option 1: Load from URDF
urdf_path = "/path/to/humanoid.urdf"
robot_prim_path = "/World/Humanoid"

urdf_interface = _urdf.acquire_urdf_interface()
urdf_interface.parse_urdf(urdf_path, robot_prim_path)

# Option 2: Load pre-made USD (e.g., Unitree H1)
add_reference_to_stage(
    usd_path="omniverse://localhost/NVIDIA/Assets/Isaac/Robots/Unitree/H1/h1.usd",
    prim_path="/World/Humanoid"
)

# Add sensors
from omni.isaac.sensor import Camera, Lidar2DSensor, IMUSensor

# Add head camera
camera = Camera(
    prim_path="/World/Humanoid/head/camera",
    frequency=30,
    resolution=(640, 480)
)

# Add chest LiDAR
lidar = Lidar2DSensor(
    prim_path="/World/Humanoid/torso/lidar",
    min_range=0.1,
    max_range=10.0,
    horizontal_fov=360,
    num_rays=360
)

# Add IMU in torso
imu = IMUSensor(
    prim_path="/World/Humanoid/torso/imu",
    frequency=100
)

# Add environment
add_reference_to_stage(
    usd_path="omniverse://localhost/NVIDIA/Assets/Isaac/Environments/Simple_Warehouse/warehouse.usd",
    prim_path="/World/Warehouse"
)

# Run simulation
world.reset()
for i in range(10000):
    world.step(render=True)

simulation_app.close()
```

### 1.2 ROS 2 Bridge Setup

```python
# ros2_bridge_setup.py
from omni.isaac.ros2_bridge import ROS2Bridge

# Create bridge
ros2_bridge = ROS2Bridge()

# Publish camera images
ros2_bridge.create_camera_publisher(
    camera_prim_path="/World/Humanoid/head/camera",
    topic_name="/camera/image_raw",
    frame_id="camera_link"
)

# Publish LiDAR scans
ros2_bridge.create_lidar_publisher(
    lidar_prim_path="/World/Humanoid/torso/lidar",
    topic_name="/scan",
    frame_id="lidar_link"
)

# Publish IMU data
ros2_bridge.create_imu_publisher(
    imu_prim_path="/World/Humanoid/torso/imu",
    topic_name="/imu",
    frame_id="imu_link"
)

# Publish joint states
ros2_bridge.create_joint_state_publisher(
    robot_prim_path="/World/Humanoid",
    topic_name="/joint_states"
)

# Subscribe to joint commands
ros2_bridge.create_joint_command_subscriber(
    robot_prim_path="/World/Humanoid",
    topic_name="/joint_commands"
)
```

## Phase 2: Perception Pipeline

### 2.1 Object Detection with Isaac ROS

```python
# object_detector_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray
from cv_bridge import CvBridge
import torch

class ObjectDetectorNode(Node):
    def __init__(self):
        super().__init__('object_detector')

        # Load YOLOv8 model
        self.model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
        self.model.eval()

        self.bridge = CvBridge()

        # Subscribe to camera
        self.image_sub = self.create_subscription(
            Image, '/camera/image_raw', self.image_callback, 10
        )

        # Publish detections
        self.det_pub = self.create_publisher(
            Detection2DArray, '/detections', 10
        )

        self.get_logger().info('Object detector ready')

    def image_callback(self, msg):
        # Convert to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

        # Run detection
        results = self.model(cv_image)

        # Convert to ROS message
        detections_msg = Detection2DArray()
        detections_msg.header = msg.header

        for det in results.xyxy[0]:  # x1, y1, x2, y2, conf, class
            detection = Detection2D()
            # Fill detection fields...
            detections_msg.detections.append(detection)

        self.det_pub.publish(detections_msg)
```

### 2.2 3D Object Localization

```python
# object_localizer_node.py
import numpy as np
from geometry_msgs.msg import PoseStamped
from sensor_msgs.msg import PointCloud2
import sensor_msgs_py.point_cloud2 as pc2

class ObjectLocalizer(Node):
    def __init__(self):
        super().__init__('object_localizer')

        # Subscribe to detections and depth
        self.det_sub = self.create_subscription(
            Detection2DArray, '/detections', self.detection_callback, 10
        )

        self.depth_sub = self.create_subscription(
            Image, '/camera/depth/image_raw', self.depth_callback, 10
        )

        # Publish object poses
        self.pose_pub = self.create_publisher(
            PoseStamped, '/object_pose', 10
        )

        self.latest_depth = None

    def depth_callback(self, msg):
        self.latest_depth = self.bridge.imgmsg_to_cv2(msg, desired_encoding='32FC1')

    def detection_callback(self, msg):
        if self.latest_depth is None:
            return

        for detection in msg.detections:
            # Get bounding box center
            bbox = detection.bbox
            u = int(bbox.center.x)
            v = int(bbox.center.y)

            # Get depth at center
            depth = self.latest_depth[v, u]

            if np.isnan(depth) or depth <= 0:
                continue

            # Convert to 3D position (using camera intrinsics)
            x, y, z = self.pixel_to_3d(u, v, depth)

            # Publish pose
            pose_msg = PoseStamped()
            pose_msg.header = msg.header
            pose_msg.pose.position.x = x
            pose_msg.pose.position.y = y
            pose_msg.pose.position.z = z
            pose_msg.pose.orientation.w = 1.0

            self.pose_pub.publish(pose_msg)

    def pixel_to_3d(self, u, v, depth):
        # Camera intrinsics (example)
        fx, fy = 554.254691, 554.254691
        cx, cy = 320.5, 240.5

        x = (u - cx) * depth / fx
        y = (v - cy) * depth / fy
        z = depth

        return x, y, z
```

## Phase 3: Voice Command Integration

### 3.1 Complete Voice Pipeline

```python
# voice_commander.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import whisper
import openai
import sounddevice as sd
import numpy as np
import queue
import threading

class VoiceCommander(Node):
    def __init__(self, openai_api_key):
        super().__init__('voice_commander')

        # Load Whisper
        self.whisper_model = whisper.load_model("base")

        # Setup OpenAI
        openai.api_key = openai_api_key

        # Audio setup
        self.sample_rate = 16000
        self.audio_queue = queue.Queue()

        # Publishers
        self.command_pub = self.create_publisher(String, '/robot_command', 10)

        # Start listening thread
        self.listen_thread = threading.Thread(target=self.listen_loop, daemon=True)
        self.listen_thread.start()

        self.get_logger().info('Voice commander ready')

    def listen_loop(self):
        """Continuous listening loop"""
        while True:
            audio = self.record_audio(duration=5)

            if len(audio) > self.sample_rate:  # At least 1 second
                # Transcribe
                result = self.whisper_model.transcribe(audio, fp16=False)
                text = result["text"].strip()

                if text:
                    self.get_logger().info(f'Voice input: {text}')

                    # Convert to robot command
                    command = self.process_voice_input(text)

                    # Publish
                    msg = String()
                    msg.data = command
                    self.command_pub.publish(msg)

    def record_audio(self, duration):
        """Record audio for specified duration"""
        audio_data = []

        def callback(indata, frames, time, status):
            audio_data.append(indata.copy())

        with sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            callback=callback
        ):
            sd.sleep(int(duration * 1000))

        return np.concatenate(audio_data, axis=0).flatten()

    def process_voice_input(self, text):
        """Convert voice text to robot command using GPT"""
        prompt = f"""Convert this voice command to a robot action:

Voice: "{text}"

Available actions:
- navigate(location): Move to location
- pick(object): Pick up object
- place(object, location): Place object
- search(object): Search for object
- report(message): Speak message

Output JSON: {{"action": "...", "parameters": {{...}}}}
"""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        command = response.choices[0].message.content
        return command
```

### 3.2 Text-to-Speech Feedback

```python
# tts_node.py
from gtts import gTTS
import os
import pygame

class TTSNode(Node):
    def __init__(self):
        super().__init__('tts_node')

        # Subscribe to speech commands
        self.tts_sub = self.create_subscription(
            String, '/robot_speech', self.tts_callback, 10
        )

        # Initialize pygame for audio playback
        pygame.mixer.init()

        self.get_logger().info('TTS node ready')

    def tts_callback(self, msg):
        """Convert text to speech and play"""
        text = msg.data

        # Generate speech
        tts = gTTS(text=text, lang='en')
        tts.save('temp_speech.mp3')

        # Play audio
        pygame.mixer.music.load('temp_speech.mp3')
        pygame.mixer.music.play()

        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)

        # Cleanup
        os.remove('temp_speech.mp3')

        self.get_logger().info(f'Spoke: {text}')
```

## Phase 4: Task Execution System

### 4.1 High-Level Task Controller

```python
# task_controller.py
from llm_planner import LLMTaskPlanner
from plan_executor import PlanExecutor

class TaskController(Node):
    def __init__(self, openai_api_key):
        super().__init__('task_controller')

        self.planner = LLMTaskPlanner(api_key=openai_api_key)
        self.executor = PlanExecutor()

        # Subscribe to commands
        self.cmd_sub = self.create_subscription(
            String, '/robot_command', self.command_callback, 10
        )

        # Publish status
        self.status_pub = self.create_publisher(String, '/robot_status', 10)
        self.speech_pub = self.create_publisher(String, '/robot_speech', 10)

        self.get_logger().info('Task controller ready')

    def command_callback(self, msg):
        """Process high-level command"""
        command_json = json.loads(msg.data)

        action = command_json['action']
        params = command_json['parameters']

        self.get_logger().info(f'Executing: {action}({params})')

        # Speak acknowledgment
        speech = String()
        speech.data = f"Starting task: {action}"
        self.speech_pub.publish(speech)

        # Generate detailed plan
        instruction = self.reconstruct_instruction(action, params)
        context = self.get_context()

        plan = self.planner.plan(instruction, context)

        # Execute plan
        success = self.executor.execute_plan(plan)

        # Report result
        if success:
            speech.data = "Task completed successfully"
        else:
            speech.data = "Task failed"

        self.speech_pub.publish(speech)

    def reconstruct_instruction(self, action, params):
        """Convert structured command back to natural language"""
        if action == 'navigate':
            return f"Go to {params['location']}"
        elif action == 'pick':
            return f"Pick up {params['object']}"
        elif action == 'place':
            return f"Place {params['object']} on {params['location']}"
        else:
            return f"{action} with {params}"

    def get_context(self):
        """Get current robot state"""
        # Query tf for position, object detection for nearby objects, etc.
        return {
            'robot_location': 'living_room',
            'detected_objects': ['cup', 'book', 'phone'],
            'battery': 85
        }
```

## Phase 5: Integration & Launch

### 5.1 Master Launch File

```python
# humanoid_system_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription

def generate_launch_description():
    return LaunchDescription([
        # Simulation (Isaac Sim - launched separately)

        # Perception
        Node(
            package='isaac_ros_visual_slam',
            executable='visual_slam_node',
            parameters=[{'camera_topics': ['/camera/image_raw']}]
        ),

        Node(
            package='humanoid_capstone',
            executable='object_detector_node'
        ),

        Node(
            package='humanoid_capstone',
            executable='object_localizer_node'
        ),

        # Navigation
        IncludeLaunchDescription(
            'nav2_bringup',
            launch_arguments={'params_file': 'nav2_params.yaml'}.items()
        ),

        # Manipulation (MoveIt 2)
        IncludeLaunchDescription(
            'moveit_planning',
            launch_arguments={'robot_description': 'humanoid.urdf'}.items()
        ),

        # Voice & LLM
        Node(
            package='humanoid_capstone',
            executable='voice_commander',
            parameters=[{'openai_api_key': 'YOUR_KEY'}]
        ),

        Node(
            package='humanoid_capstone',
            executable='tts_node'
        ),

        Node(
            package='humanoid_capstone',
            executable='task_controller',
            parameters=[{'openai_api_key': 'YOUR_KEY'}]
        ),

        # Monitoring
        Node(
            package='rqt_robot_monitor',
            executable='rqt_robot_monitor'
        )
    ])
```

### 5.2 Running the System

```bash
# Terminal 1: Start Isaac Sim with ROS 2 bridge
python setup_humanoid.py

# Terminal 2: Launch ROS 2 nodes
ros2 launch humanoid_capstone humanoid_system_launch.py

# Terminal 3: Monitor topics
ros2 topic list
ros2 topic echo /robot_status

# Give voice commands:
# "Go to the kitchen"
# "Pick up the red cup"
# "Bring me the book from the table"
```

## Phase 6: Testing & Evaluation

### 6.1 Test Scenarios

**Test 1: Simple Navigation**
```
User: "Go to the bedroom"
Expected: Robot navigates to bedroom, reports "Arrived at bedroom"
```

**Test 2: Object Retrieval**
```
User: "Bring me the blue mug"
Expected:
1. Robot navigates to mug location
2. Picks up mug
3. Returns to user
4. Hands over mug
```

**Test 3: Multi-Step Task**
```
User: "Clear the table"
Expected:
1. Identify objects on table
2. Pick each object
3. Place in designated location (e.g., tray)
4. Report completion
```

### 6.2 Evaluation Metrics

```python
# evaluation.py
class SystemEvaluator:
    def __init__(self):
        self.metrics = {
            'voice_recognition_accuracy': 0,
            'task_completion_rate': 0,
            'navigation_success_rate': 0,
            'grasp_success_rate': 0,
            'avg_task_time': 0
        }

    def evaluate_task(self, task_name, success, duration):
        """Record task evaluation"""
        self.metrics[f'{task_name}_success'] = success
        self.metrics[f'{task_name}_time'] = duration

    def compute_statistics(self):
        """Compute aggregate metrics"""
        total_tasks = len([k for k in self.metrics if k.endswith('_success')])
        successful_tasks = sum([v for k, v in self.metrics.items() if k.endswith('_success')])

        self.metrics['overall_success_rate'] = successful_tasks / total_tasks if total_tasks > 0 else 0

        print("=" * 50)
        print("EVALUATION RESULTS")
        print("=" * 50)
        for metric, value in self.metrics.items():
            print(f"{metric}: {value}")
```

## Deployment to Real Hardware

### Sim-to-Real Transfer Checklist

- [ ] Train policies with domain randomization in Isaac Sim
- [ ] Calibrate camera intrinsics on real robot
- [ ] Test perception pipeline with real sensor data
- [ ] Validate joint limits and dynamics match simulation
- [ ] Implement safety limits (workspace, force, velocity)
- [ ] Test emergency stop mechanisms
- [ ] Validate on simple tasks before complex ones
- [ ] Log all actions for debugging

### Hardware Modifications

```python
# Real robot adapter
class RealRobotInterface:
    def __init__(self):
        # Connect to real robot SDK
        from unitree_sdk import RobotInterface
        self.robot = RobotInterface()

    def send_joint_command(self, joint_positions):
        """Send commands to real motors"""
        self.robot.set_joint_positions(joint_positions)

    def get_sensor_data(self):
        """Read from real sensors"""
        return {
            'joint_states': self.robot.get_joint_states(),
            'imu': self.robot.get_imu(),
            'camera': self.robot.get_camera_image()
        }
```

## Key Takeaways

✅ **Integrated system** combines ROS 2, Isaac ROS, Whisper, GPT-4, and Nav2
✅ **Voice interface** enables natural interaction with humanoid robot
✅ **LLM planning** decomposes complex tasks into executable actions
✅ **Isaac Sim** provides realistic training environment
✅ **Modular architecture** allows component-wise testing and debugging
✅ **Sim-to-real transfer** requires careful calibration and validation

## Extensions & Future Work

1. **Reinforcement Learning**: Train manipulation policies in Isaac Gym
2. **Vision-Language Models**: Integrate RT-2 for end-to-end control
3. **Social HRI**: Add emotion recognition and expressive behavior
4. **Multi-Robot Coordination**: Extend to team of humanoids
5. **Long-Horizon Tasks**: Implement hierarchical planning for complex goals

## Further Reading

- [Everyday Robots Project](https://everydayrobots.com/)
- [Mobile Manipulation Benchmark](https://ai.stanford.edu/mfai/)
- [Embodied AI Workshop Papers](https://embodied-ai.org/)
- [Open Problems in Robotics](https://arxiv.org/abs/2206.10011)

## Congratulations!

You've completed the Physical AI & Humanoid Robotics textbook and built an autonomous humanoid robot system. You now have the skills to:

- Design and simulate robots in Gazebo, Unity, and Isaac Sim
- Implement advanced perception with Isaac ROS
- Build voice interfaces with Whisper
- Use LLMs for task planning
- Deploy end-to-end embodied AI systems

**Next Steps:**
- Contribute to open-source robotics projects
- Participate in robotics competitions (DARPA Robotics Challenge, RoboCup)
- Research novel VLA architectures
- Build your own physical robot!

Keep building, keep learning, and shape the future of Physical AI! 🤖🚀
