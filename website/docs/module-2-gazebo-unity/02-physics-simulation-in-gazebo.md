---
id: 02-physics-simulation-in-gazebo
title: "Physics Simulation in Gazebo"
module: "gazebo-unity"
chapter: 2
estimated_reading_time: 25
difficulty: "intermediate"
keywords: ["gazebo", "physics", "ode", "bullet", "sensors", "plugins"]
---

# Physics Simulation in Gazebo

Gazebo's physics engine is the foundation of realistic robot simulation. Understanding how to configure physics, model contacts, and simulate sensors is crucial for developing algorithms that transfer to real hardware.

## Physics Engines: ODE, Bullet, and Simbody

Gazebo supports multiple physics engines, each with different strengths:

### 1. **ODE (Open Dynamics Engine)**

**Default engine** in Gazebo, optimized for real-time simulation.

**Characteristics:**
- Fast computation for rigid body dynamics
- Good for wheeled robots and simple manipulators
- Less accurate for complex contact scenarios
- Best for real-time applications (robotics control)

**When to use:**
- General-purpose robotics simulation
- Real-time control algorithm testing
- Wheeled mobile robots, simple grippers

**Configuration:**
```xml
<world name="default">
  <physics type="ode">
    <max_step_size>0.001</max_step_size>
    <real_time_factor>1.0</real_time_factor>
    <real_time_update_rate>1000</real_time_update_rate>

    <ode>
      <solver>
        <type>quick</type>
        <iters>50</iters>
        <sor>1.3</sor> <!-- Successive Over-Relaxation -->
      </solver>
      <constraints>
        <cfm>0.0</cfm> <!-- Constraint Force Mixing -->
        <erp>0.2</erp> <!-- Error Reduction Parameter -->
        <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
        <contact_surface_layer>0.001</contact_surface_layer>
      </constraints>
    </ode>
  </physics>
</world>
```

### 2. **Bullet Physics Engine**

**Game-industry proven** engine, excellent for complex contact.

**Characteristics:**
- More accurate contact resolution than ODE
- Better for multi-body systems (humanoid robots, soft bodies)
- Slightly slower than ODE
- Used in video games (Grand Theft Auto, etc.)

**When to use:**
- Humanoid robots with many contacts (feet, hands)
- Soft body simulation (deformable objects)
- Complex manipulation tasks (stacking, grasping)

**Configuration:**
```xml
<physics type="bullet">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>

  <bullet>
    <solver>
      <type>sequential_impulse</type>
      <iters>50</iters>
      <sor>1.3</sor>
    </solver>
    <constraints>
      <cfm>0.0</cfm>
      <erp>0.2</erp>
      <split_impulse>true</split_impulse>
      <split_impulse_penetration_threshold>-0.01</split_impulse_penetration_threshold>
    </constraints>
  </bullet>
</physics>
```

### 3. **Simbody**

**High-fidelity** engine from Stanford, used in biomechanics research.

**Characteristics:**
- Most accurate for complex kinematics
- Excellent for legged robots and humanoids
- Slowest (not always real-time)
- Superior handling of constraints (closed kinematic loops)

**When to use:**
- High-fidelity humanoid simulation
- Biomechanical research (human motion)
- Parallel mechanisms (Stewart platform, delta robots)

**Configuration:**
```xml
<physics type="simbody">
  <max_step_size>0.001</max_step_size>

  <simbody>
    <accuracy>0.001</accuracy>
    <max_transient_velocity>0.01</max_transient_velocity>
    <contact>
      <stiffness>100000000</stiffness>
      <dissipation>100</dissipation>
      <static_friction>0.9</static_friction>
      <dynamic_friction>0.9</dynamic_friction>
      <viscous_friction>0.0</viscous_friction>
    </contact>
  </simbody>
</physics>
```

### Comparison Table

| Engine | Speed | Accuracy | Best For | Real-Time |
|--------|-------|----------|----------|-----------|
| **ODE** | Fast | Good | Wheeled robots, drones | Yes |
| **Bullet** | Moderate | Better | Humanoids, manipulation | Yes |
| **Simbody** | Slow | Best | Research, biomechanics | Sometimes |

## Gravity, Collisions, and Friction Modeling

### Configuring Gravity

Different planetary bodies for testing space robots:

```xml
<world name="mars_simulation">
  <physics type="ode">
    <!-- Earth gravity (default) -->
    <gravity>0 0 -9.81</gravity>

    <!-- Mars gravity (38% of Earth) -->
    <!-- <gravity>0 0 -3.71</gravity> -->

    <!-- Moon gravity (16.5% of Earth) -->
    <!-- <gravity>0 0 -1.62</gravity> -->

    <!-- Zero gravity (space station) -->
    <!-- <gravity>0 0 0</gravity> -->
  </physics>
</world>
```

### Collision Detection

**Collision geometry** is separate from visual geometry for performance:

```xml
<link name="robot_body">
  <!-- Visual (detailed mesh for rendering) -->
  <visual name="visual">
    <geometry>
      <mesh>
        <uri>model://my_robot/meshes/body.dae</uri>
      </mesh>
    </geometry>
  </visual>

  <!-- Collision (simplified shape for physics) -->
  <collision name="collision">
    <geometry>
      <box>
        <size>0.5 0.3 0.2</size>
      </box>
    </geometry>
    <surface>
      <friction>
        <ode>
          <mu>0.8</mu>  <!-- Coefficient of friction -->
          <mu2>0.8</mu2>
        </ode>
      </friction>
      <contact>
        <ode>
          <kp>1000000</kp>  <!-- Contact stiffness -->
          <kd>1.0</kd>      <!-- Contact damping -->
        </ode>
      </contact>
    </surface>
  </collision>
</link>
```

**Best Practices:**
- Use simple shapes (box, cylinder, sphere) for collisions when possible
- Complex collision meshes slow down simulation significantly
- Trade-off: accuracy vs. performance

### Friction Modeling

Friction is critical for locomotion (wheels, legs) and manipulation (grippers).

**Isotropic Friction (same in all directions):**
```xml
<surface>
  <friction>
    <ode>
      <mu>1.0</mu>   <!-- Static and dynamic friction -->
      <mu2>1.0</mu2>
    </ode>
  </friction>
</surface>
```

**Anisotropic Friction (directional, e.g., tank treads):**
```xml
<surface>
  <friction>
    <ode>
      <mu>1.5</mu>   <!-- Friction along tread direction -->
      <mu2>0.5</mu2> <!-- Friction perpendicular to tread -->
      <fdir1>1 0 0</fdir1> <!-- Primary friction direction -->
    </ode>
  </friction>
</surface>
```

**Friction Coefficient Values:**
- **Rubber on concrete**: 0.7 - 1.0
- **Metal on metal**: 0.15 - 0.25
- **Teflon on steel**: 0.04 - 0.1
- **Ice on ice**: 0.02 - 0.05

## Creating Custom Environments

### Building a Warehouse Environment

**Step 1: Create World File**
```xml
<!-- warehouse.sdf -->
<sdf version='1.9'>
  <world name='warehouse'>
    <!-- Physics -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <!-- Lighting -->
    <light name='sun' type='directional'>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Warehouse building -->
    <model name='warehouse_structure'>
      <static>true</static>

      <!-- Floor -->
      <link name='floor'>
        <visual name='floor_visual'>
          <geometry>
            <plane><size>50 50</size></plane>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
        <collision name='floor_collision'>
          <geometry>
            <plane><size>50 50</size></plane>
          </geometry>
        </collision>
      </link>

      <!-- Shelving racks (repeated) -->
      <link name='rack_1'>
        <pose>5 0 0 0 0 0</pose>
        <visual name='visual'>
          <geometry>
            <box><size>2 0.5 3</size></box>
          </geometry>
        </visual>
        <collision name='collision'>
          <geometry>
            <box><size>2 0.5 3</size></box>
          </geometry>
        </collision>
      </link>

      <!-- Add more racks... -->
    </model>

    <!-- Obstacles (boxes, pallets) -->
    <include>
      <uri>model://cardboard_box</uri>
      <pose>3 2 0 0 0 0</pose>
    </include>

  </world>
</sdf>
```

**Step 2: Launch World**
```bash
gz sim warehouse.sdf
```

### Procedural Environment Generation

For reinforcement learning, generate random environments:

```python
# generate_warehouse.py
import random
import xml.etree.ElementTree as ET

def generate_random_warehouse(num_obstacles=20):
    root = ET.Element('sdf', version='1.9')
    world = ET.SubElement(root, 'world', name='random_warehouse')

    # Add ground
    ground = ET.SubElement(world, 'include')
    ET.SubElement(ground, 'uri').text = 'model://ground_plane'

    # Add random obstacles
    for i in range(num_obstacles):
        obstacle = ET.SubElement(world, 'include')
        ET.SubElement(obstacle, 'uri').text = 'model://cardboard_box'

        x = random.uniform(-10, 10)
        y = random.uniform(-10, 10)
        yaw = random.uniform(0, 3.14159)
        ET.SubElement(obstacle, 'pose').text = f'{x} {y} 0 0 0 {yaw}'

    # Write to file
    tree = ET.ElementTree(root)
    tree.write('random_warehouse.sdf', encoding='utf-8', xml_declaration=True)

generate_random_warehouse()
```

## Sensor Plugins (LiDAR, Camera, IMU)

Gazebo's sensor plugins provide realistic sensor data for your robot.

### 1. **LiDAR (Laser Scanner)**

```xml
<sensor name='laser' type='gpu_lidar'>
  <pose>0 0 0.2 0 0 0</pose>
  <update_rate>10</update_rate>
  <topic>/scan</topic>

  <lidar>
    <scan>
      <horizontal>
        <samples>720</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>30.0</max>
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

**ROS 2 Integration:**
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan

class LidarListener(Node):
    def __init__(self):
        super().__init__('lidar_listener')
        self.subscription = self.create_subscription(
            LaserScan,
            '/scan',
            self.lidar_callback,
            10
        )

    def lidar_callback(self, msg):
        # Extract distance to closest obstacle
        min_distance = min(msg.ranges)
        self.get_logger().info(f'Closest obstacle: {min_distance:.2f}m')

rclpy.init()
node = LidarListener()
rclpy.spin(node)
```

### 2. **Camera (RGB)**

```xml
<sensor name='camera' type='camera'>
  <pose>0.2 0 0.3 0 0 0</pose>
  <update_rate>30</update_rate>
  <topic>/camera/image_raw</topic>

  <camera>
    <horizontal_fov>1.047</horizontal_fov>
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

**Advanced: Depth Camera (RGB-D)**
```xml
<sensor name='depth_camera' type='depth_camera'>
  <pose>0.2 0 0.3 0 0 0</pose>
  <update_rate>30</update_rate>

  <camera>
    <horizontal_fov>1.047</horizontal_fov>
    <image>
      <width>640</width>
      <height>480</height>
      <format>R_FLOAT32</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>10.0</far>
    </clip>
  </camera>
</sensor>
```

### 3. **IMU (Inertial Measurement Unit)**

```xml
<sensor name='imu' type='imu'>
  <pose>0 0 0 0 0 0</pose>
  <update_rate>100</update_rate>
  <topic>/imu</topic>

  <imu>
    <angular_velocity>
      <x>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.009</stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.009</stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.009</stddev>
        </noise>
      </z>
    </angular_velocity>
    <linear_acceleration>
      <x>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.17</stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.17</stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.17</stddev>
        </noise>
      </z>
    </linear_acceleration>
  </imu>
</sensor>
```

**Using IMU Data:**
```python
from sensor_msgs.msg import Imu
import math

class ImuListener(Node):
    def __init__(self):
        super().__init__('imu_listener')
        self.subscription = self.create_subscription(
            Imu, '/imu', self.imu_callback, 10
        )

    def imu_callback(self, msg):
        # Extract roll, pitch from orientation quaternion
        q = msg.orientation
        roll = math.atan2(2*(q.w*q.x + q.y*q.z), 1 - 2*(q.x**2 + q.y**2))
        pitch = math.asin(2*(q.w*q.y - q.z*q.x))

        self.get_logger().info(f'Roll: {math.degrees(roll):.1f}°, Pitch: {math.degrees(pitch):.1f}°')
```

## Sensor Noise Modeling

Real sensors have noise. Simulating it improves sim-to-real transfer.

**Gaussian Noise (most common):**
```xml
<noise type="gaussian">
  <mean>0.0</mean>
  <stddev>0.01</stddev>
</noise>
```

**Custom Noise Plugin (Python):**
```python
import numpy as np

class SensorNoiseModel:
    def __init__(self, mean=0.0, stddev=0.01):
        self.mean = mean
        self.stddev = stddev

    def add_noise(self, clean_data):
        noise = np.random.normal(self.mean, self.stddev, clean_data.shape)
        return clean_data + noise

# Example: Adding noise to LiDAR ranges
lidar_noise = SensorNoiseModel(mean=0.0, stddev=0.02)
noisy_ranges = lidar_noise.add_noise(clean_ranges)
```

## Performance Optimization Tips

### 1. **Use Simple Collision Geometry**
```xml
<!-- Bad: Complex mesh -->
<collision name='complex'>
  <geometry>
    <mesh><uri>model://robot/meshes/detailed.stl</uri></mesh>
  </geometry>
</collision>

<!-- Good: Approximated with simple shapes -->
<collision name='simple'>
  <geometry>
    <cylinder><radius>0.2</radius><length>0.5</length></cylinder>
  </geometry>
</collision>
```

### 2. **Reduce Sensor Update Rates**
- Camera: 30 Hz (instead of 60 Hz)
- LiDAR: 10 Hz (instead of 40 Hz)
- IMU: 100 Hz (sufficient for most robots)

### 3. **Use GPU Sensors When Available**
```xml
<sensor type='gpu_lidar'>  <!-- GPU-accelerated -->
  <!-- ... -->
</sensor>
```

### 4. **Limit World Complexity**
- Remove unnecessary models
- Use static models where possible (`<static>true</static>`)
- Cull objects outside robot's sensor range

## Key Takeaways

✅ **ODE**: Fast, good for general robotics (default choice)
✅ **Bullet**: Better contact resolution, use for humanoids
✅ **Simbody**: High-fidelity, use for research (slower)
✅ **Collision geometry**: Keep simple for performance
✅ **Sensor noise**: Model it for better sim-to-real transfer
✅ **Custom environments**: Procedurally generate for RL training

## Next Chapter

In **Chapter 3**, we'll explore **Unity's high-fidelity rendering** for photorealistic robot simulation, human-robot interaction, and synthetic data generation for computer vision.

## Further Reading

- [Gazebo Physics Engines](https://gazebosim.org/api/sim/7/physicsplugin.html)
- [ODE User Guide](https://www.ode.org/ode-latest-userguide.html)
- [Bullet Physics Documentation](https://pybullet.org/wordpress/)
- [Sensor Noise Models](https://ieeexplore.ieee.org/document/8206455)
