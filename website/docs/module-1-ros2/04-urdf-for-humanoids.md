---
id: 04-urdf-for-humanoids
sidebar_label: 'URDF for Humanoids: Robot Modeling with URDF'
slug: '/module-1-ros2/urdf-for-humanoids'
---

# URDF for Humanoids: Robot Modeling with URDF

## Introduction

Unified Robot Description Format (URDF) is the standard way to describe robots in ROS. For humanoid robots, URDF becomes particularly important due to the complexity of their kinematic structures and the need for accurate physical modeling.

## URDF Fundamentals

URDF is an XML-based format that describes robot properties including:
- Kinematic structure (links and joints)
- Visual and collision geometry
- Physical properties (mass, inertia, friction)
- Sensors and actuators

### Basic URDF Structure
```xml
<?xml version="1.0"?>
<robot name="humanoid_robot">
  <!-- Links define rigid bodies -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.5 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0"/>
    </inertial>
  </link>
  
  <!-- Joints connect links -->
  <joint name="base_to_torso" type="fixed">
    <parent link="base_link"/>
    <child link="torso_link"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
  </joint>
</robot>
```

## Humanoid-Specific Considerations

### Anthropomorphic Structure
Humanoid robots require modeling of:
- Head with sensors (cameras, IMU)
- Torso with center of mass considerations
- Arms with multiple degrees of freedom
- Legs with hip, knee, and ankle joints
- Feet for balance and ground contact

### Joint Limitations
Humanoid joints have specific ranges of motion:
- Hip joints: Flexion/extension, abduction/adduction, rotation
- Knee joints: Primarily flexion/extension
- Ankle joints: Dorsiflexion/plantarflexion, inversion/eversion
- Shoulder joints: Multiple degrees of freedom

## Advanced URDF Features for Humanoids

### Transmission Elements
Define how actuators connect to joints:
```xml
<transmission name="trans_right_hip_pitch">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="right_hip_pitch">
    <hardwareInterface>hardware_interface/EffortJointInterface</hardwareInterface>
  </joint>
  <actuator name="right_hip_pitch_motor">
    <mechanicalReduction>1</mechanicalReduction>
  </actuator>
</transmission>
```

### Gazebo Integration
Include physics and sensor specifications:
```xml
<gazebo reference="head_link">
  <sensor type="camera" name="head_camera">
    <update_rate>30</update_rate>
    <camera name="head_camera">
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
    </camera>
  </sensor>
</gazebo>
```

### Materials and Colors
Define appearance for visualization:
```xml
<material name="light_grey">
  <color rgba="0.7 0.7 0.7 1.0"/>
</material>
```

## Xacro for Complex Humanoid Models

Xacro (XML Macros) simplifies complex humanoid models by allowing:
- Parameterization
- Reusable components
- Mathematical expressions

### Example Xacro for Humanoid Arm
```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid_arm">

<xacro:macro name="arm_segment" params="prefix parent_link length radius mass">
  <link name="${prefix}_link">
    <visual>
      <geometry>
        <cylinder length="${length}" radius="${radius}"/>
      </geometry>
      <origin xyz="0 0 ${length/2}" rpy="0 0 0"/>
    </visual>
    <collision>
      <geometry>
        <cylinder length="${length}" radius="${radius}"/>
      </geometry>
      <origin xyz="0 0 ${length/2}" rpy="0 0 0"/>
    </collision>
    <inertial>
      <mass value="${mass}"/>
      <inertia ixx="${mass*(3*radius*radius + length*length)/12}" iyy="${mass*(3*radius*radius + length*length)/12}" izz="${mass*radius*radius/2}" ixy="0" ixz="0" iyz="0"/>
    </inertial>
  </link>
</xacro:macro>

<!-- Use the macro to create arm segments -->
<xacro:arm_segment prefix="upper_arm" parent_link="shoulder" length="0.3" radius="0.05" mass="0.5"/>
<xacro:arm_segment prefix="lower_arm" parent_link="elbow" length="0.25" radius="0.04" mass="0.3"/>

</robot>
```

## Best Practices for Humanoid URDF

### Kinematic Chain Design
- Ensure proper parent-child relationships
- Maintain consistent coordinate frames
- Consider center of mass placement

### Collision Geometry
- Use simplified geometries for collision detection
- Balance accuracy with computational efficiency
- Include safety margins for dynamic motion

### Mass Properties
- Accurate mass distribution is critical for dynamics
- Consider payload capabilities
- Account for battery and electronics weight

## Validation and Visualization

### Using RViz for Visualization
```bash
ros2 run rviz2 rviz2
```
Load the robot model and visualize joint states.

### Checking URDF Validity
```bash
check_urdf /path/to/robot.urdf
```

### Forward Kinematics Verification
Use TF2 to verify transformations between links.

## Common Challenges and Solutions

### Self-Collision Detection
Configure collision filters to prevent unrealistic self-collisions during motion planning.

### Dynamic Stability
Ensure the URDF accurately represents the physical robot's center of mass and inertial properties.

### Joint Limits Enforcement
Properly configure joint limits to prevent damage during operation.

## Summary

URDF is essential for humanoid robot development, providing the foundation for simulation, control, and perception. Proper modeling ensures accurate simulation and safe real-world operation.