---
id: 01-introduction-to-robot-simulation
title: "Introduction to Robot Simulation"
module: "gazebo-unity"
chapter: 1
estimated_reading_time: 20
difficulty: "beginner"
keywords: ["simulation", "gazebo", "unity", "ros2-bridge"]
---

# Introduction to Robot Simulation

Robot simulation is a critical component of modern robotics development, allowing developers to test algorithms, validate designs, and train AI models in safe, reproducible environments before deploying to physical hardware.

## Why Simulation is Essential for Robotics

### 1. **Safety and Risk Mitigation**

Physical robots can be dangerous during development:
- **Crash Protection**: Test failure scenarios without damaging expensive hardware
- **Human Safety**: Validate behavior around people in virtual environments
- **Environmental Safety**: Simulate hazardous environments (space, underwater, disaster zones)

**Example**: Testing a humanoid robot's falling recovery algorithm in simulation prevents physical damage during thousands of iterations needed for reinforcement learning.

### 2. **Cost Efficiency**

```python
# Real robot testing costs
physical_robot_cost = 50000  # USD
test_iterations = 10000
damage_rate = 0.01  # 1% chance of damage per test

expected_cost = physical_robot_cost + (test_iterations * damage_rate * physical_robot_cost)
print(f"Expected cost with physical testing: ${expected_cost:,.0f}")
# Output: Expected cost with physical testing: $5,050,000

# Simulation testing costs
simulation_cost = 0  # One-time setup, minimal compute
print(f"Simulation cost for same tests: ${simulation_cost}")
# Output: Simulation cost for same tests: $0
```

### 3. **Accelerated Development**

- **Parallel Testing**: Run 100+ simulation instances simultaneously
- **Time Compression**: Simulate hours of robot operation in minutes
- **Rapid Iteration**: Modify code and retest in seconds, not hours

### 4. **Reproducibility**

Simulations provide:
- **Deterministic Environments**: Same initial conditions → same results
- **Version Control**: Track environment configurations with code
- **Benchmarking**: Compare algorithms under identical conditions

## Gazebo vs Unity: A Comprehensive Comparison

### Gazebo (Now Gazebo Sim / Ignition Gazebo)

**Strengths:**
- **Native ROS 2 Integration**: Built-in ROS 2 message support
- **Physics-First Design**: Accurate sensor simulation (LiDAR, IMU, cameras)
- **Open Source**: Free, community-driven development
- **Robotics-Specific**: Designed specifically for robot simulation

**Limitations:**
- **Graphics Quality**: Less photorealistic than game engines
- **Learning Curve**: Steeper for non-roboticists
- **Performance**: Can be slower with complex scenes

**Best For:**
- Algorithm development (path planning, SLAM, control)
- Research and academic projects
- ROS 2-centric workflows
- Sensor-heavy applications

### Unity (with Unity Robotics Hub)

**Strengths:**
- **Photorealistic Rendering**: High-quality graphics for computer vision
- **Performance**: Optimized game engine, handles complex scenes
- **Asset Ecosystem**: Massive library of 3D models and environments
- **Human-Robot Interaction**: Realistic character models and animations
- **Cross-Platform**: Deploy simulations to web, mobile, VR

**Limitations:**
- **ROS 2 Integration**: Requires ROS-TCP-Connector (extra setup)
- **Licensing**: Free for personal/small business, paid for large enterprises
- **Physics Tuning**: Requires more manual calibration for accuracy

**Best For:**
- Computer vision tasks (object detection, segmentation)
- Human-robot interaction studies
- Synthetic data generation for deep learning
- Photorealistic rendering requirements

### Quick Comparison Table

| Feature | Gazebo | Unity |
|---------|--------|-------|
| **ROS 2 Integration** | Native | Via ROS-TCP-Connector |
| **Graphics Quality** | Moderate | Excellent |
| **Physics Accuracy** | Excellent | Good (requires tuning) |
| **Sensor Simulation** | Excellent | Good |
| **Learning Curve** | Steep | Moderate |
| **Cost** | Free | Free (with limits) |
| **Best Use Case** | Algorithm Testing | Vision + HRI |

## ROS 2 - Gazebo Bridge

The ROS 2 - Gazebo bridge enables seamless communication between your ROS 2 nodes and Gazebo simulation.

### How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  ROS 2 Node │ ←──────→ │  ros_gz_bridge │ ←──────→ │   Gazebo    │
│  (Python/C++)│  Topics   │  (Translator)  │  Gazebo  │  Simulation │
└─────────────┘  Services └──────────────┘  Messages └─────────────┘
```

### Key Components

1. **ros_gz_bridge**: Translates between ROS 2 and Gazebo message types
2. **ros_gz_sim**: ROS 2 launch files for Gazebo
3. **ros_gz_image**: Converts Gazebo images to ROS 2 sensor_msgs

### Example: Bridging a Laser Scanner

```xml
<!-- bridge_config.yaml -->
- topic_name: "/scan"
  ros_type_name: "sensor_msgs/msg/LaserScan"
  gz_type_name: "gz.msgs.LaserScan"

- topic_name: "/cmd_vel"
  ros_type_name: "geometry_msgs/msg/Twist"
  gz_type_name: "gz.msgs.Twist"
```

```python
# Launch file to start bridge
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            arguments=[
                '/scan@sensor_msgs/msg/LaserScan@gz.msgs.LaserScan',
                '/cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist'
            ],
            output='screen'
        )
    ])
```

## Setting Up Your Simulation Environment

### System Requirements

**Minimum:**
- CPU: Intel i5 or AMD Ryzen 5
- RAM: 8 GB
- GPU: Integrated graphics (Intel HD, AMD Radeon)
- OS: Ubuntu 22.04 LTS

**Recommended:**
- CPU: Intel i7/i9 or AMD Ryzen 7/9
- RAM: 16 GB or more
- GPU: NVIDIA GTX 1060 or better
- OS: Ubuntu 22.04 LTS with ROS 2 Humble

### Installation: Gazebo Sim (Ignition Gazebo)

```bash
# Add Gazebo repository
sudo sh -c 'echo "deb http://packages.osrfoundation.org/gazebo/ubuntu-stable `lsb_release -cs` main" > /etc/apt/sources.list.d/gazebo-stable.list'
wget https://packages.osrfoundation.org/gazebo.key -O - | sudo apt-key add -

# Install Gazebo Fortress (compatible with ROS 2 Humble)
sudo apt update
sudo apt install gz-fortress

# Install ROS 2 - Gazebo bridge
sudo apt install ros-humble-ros-gz-bridge ros-humble-ros-gz-sim ros-humble-ros-gz-image

# Verify installation
gz sim --version
```

### Installation: Unity with Robotics Hub

**Step 1: Install Unity Hub**
```bash
# Download Unity Hub from https://unity.com/download
wget -q -O unity-hub.AppImage https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage
chmod +x unity-hub.AppImage
./unity-hub.AppImage
```

**Step 2: Install Unity Editor (2021.3 LTS or newer)**
- Open Unity Hub → Installs → Add → Select version 2021.3 LTS
- Include modules: Linux Build Support, Documentation

**Step 3: Install Unity Robotics Hub**
```bash
# Clone Unity Robotics Hub repository
git clone https://github.com/Unity-Technologies/Unity-Robotics-Hub.git
cd Unity-Robotics-Hub

# Follow the Unity package installation instructions in README
```

### First Steps: "Hello, Simulated World!"

**Gazebo:**
```bash
# Launch empty world
gz sim empty.sdf

# Spawn a simple box
gz model --spawn-file box.sdf --model-name my_box
```

**Unity:**
1. Create new Unity project (3D template)
2. Import Unity Robotics Hub package via Package Manager
3. Add a cube GameObject (GameObject → 3D Object → Cube)
4. Add Rigidbody component (Component → Physics → Rigidbody)
5. Press Play → Watch cube fall due to gravity

## Choosing the Right Tool

**Use Gazebo if:**
- You're developing ROS 2-native algorithms
- Physics accuracy is critical (e.g., drone dynamics, contact forces)
- You need detailed sensor simulation (LiDAR point clouds, IMU noise models)
- Budget is tight (100% free and open source)

**Use Unity if:**
- You're training vision models (need photorealistic images)
- You're studying human-robot interaction (realistic avatars)
- You need cross-platform deployment (web demos, VR)
- Graphics quality matters (demos, marketing, user studies)

**Use Both if:**
- You want physics-accurate dynamics (Gazebo) with beautiful visualization (Unity)
- You're generating synthetic datasets (Unity) and testing control algorithms (Gazebo)

## Practical Example: Simulating a Mobile Robot

Let's compare the same task in both platforms:

**Gazebo:**
```xml
<!-- mobile_robot.sdf -->
<sdf version='1.9'>
  <model name='mobile_robot'>
    <link name='base_link'>
      <visual name='visual'>
        <geometry>
          <box><size>0.5 0.3 0.2</size></box>
        </geometry>
      </visual>
      <collision name='collision'>
        <geometry>
          <box><size>0.5 0.3 0.2</size></box>
        </geometry>
      </collision>
    </link>

    <plugin name='diff_drive' filename='libgz-sim-diff-drive-system.so'>
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      <wheel_separation>0.3</wheel_separation>
      <wheel_radius>0.1</wheel_radius>
    </plugin>
  </model>
</sdf>
```

**Unity (C# script):**
```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;

public class MobileRobotController : MonoBehaviour
{
    [SerializeField] float wheelSeparation = 0.3f;
    [SerializeField] float wheelRadius = 0.1f;

    private ROSConnection ros;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Subscribe<TwistMsg>("/cmd_vel", ExecuteVelocityCommand);
    }

    void ExecuteVelocityCommand(TwistMsg msg)
    {
        float linear = msg.linear.x;
        float angular = msg.angular.z;

        // Differential drive kinematics
        float leftVel = (linear - angular * wheelSeparation / 2.0f) / wheelRadius;
        float rightVel = (linear + angular * wheelSeparation / 2.0f) / wheelRadius;

        // Apply to wheels...
    }
}
```

## Next Steps

In the following chapters, we'll dive deeper into:
- **Chapter 2**: Physics simulation in Gazebo (engines, sensors, custom environments)
- **Chapter 3**: High-fidelity rendering in Unity (Robotics Hub, photorealism, HRI)
- **Chapter 4**: Practical project - Simulating the Unitree Go2 quadruped robot

## Key Takeaways

✅ **Simulation is essential** for safe, cost-effective robot development
✅ **Gazebo excels** at physics-accurate, ROS 2-native simulation
✅ **Unity excels** at photorealistic rendering and vision tasks
✅ **ROS 2 bridges** enable integration between simulation and real robots
✅ **Choose the tool** based on your specific use case (physics vs. graphics)

## Further Reading

- [Gazebo Documentation](https://gazebosim.org/docs)
- [Unity Robotics Hub GitHub](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [ROS 2 Gazebo Integration](https://github.com/gazebosim/ros_gz)
- [Sim-to-Real Transfer Survey](https://arxiv.org/abs/1812.06552)
