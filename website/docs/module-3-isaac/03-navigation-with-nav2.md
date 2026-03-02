---
id: 03-navigation-with-nav2
title: "Navigation with Nav2"
module: "isaac"
chapter: 3
estimated_reading_time: 25
difficulty: "advanced"
keywords: ["nav2", "humanoid", "path-planning", "bipedal", "locomotion"]
---

# Navigation with Nav2

Navigating humanoid robots requires specialized techniques beyond traditional wheeled robots. This chapter covers path planning for bipedal locomotion, obstacle avoidance for humanoids, and integrating Nav2 with Isaac ROS perception.

## Nav2 for Humanoid Robots

### Challenges of Humanoid Navigation

**Compared to Wheeled Robots:**
1. **Higher Center of Mass**: Risk of tipping over
2. **Complex Kinematics**: 12+ DOF legs vs 2 DOF wheels
3. **Discrete Footsteps**: Can't rotate in place smoothly
4. **Terrain Constraints**: Requires flat, stable footing
5. **Dynamic Stability**: Must maintain balance while moving

### Nav2 Architecture

```
┌──────────────────────────────────────────────────────┐
│                Navigation Goal                        │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│              Behavior Tree (BT)                       │
│   (Navigate, Recovery behaviors, Goal checking)      │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌▼────────────┐
│    Planner   │ │Controller │ │  Costmap    │
│   (Global)   │ │  (Local)  │ │  (Sensors)  │
└──────────────┘ └───────────┘ └─────────────┘
        │            │            │
        └────────────┼────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│           Robot Base Controller                       │
│         (Convert velocity → footsteps)                │
└──────────────────────────────────────────────────────┘
```

## Path Planning for Humanoids

### Footstep Planning

Unlike wheeled robots, humanoids plan sequences of footsteps.

**Traditional Planner (Dijkstra/A*):**
```
Generate smooth path from A to B
→ Unsuitable for humanoids (assumes continuous motion)
```

**Footstep Planner:**
```
1. Discretize space into potential footstep locations
2. Search for sequence of feasible footsteps
3. Validate each footstep for stability and reachability
4. Output: [(left_foot, x1, y1, θ1), (right_foot, x2, y2, θ2), ...]
```

### Implementing Footstep Planner

```python
# footstep_planner.py
import numpy as np
from geometry_msgs.msg import PoseStamped
from nav_msgs.msg import Path

class FootstepPlanner:
    def __init__(self):
        self.step_length = 0.3  # meters
        self.step_width = 0.2   # lateral separation of feet
        self.max_step_angle = np.deg2rad(15)  # max rotation per step

    def plan_footsteps(self, start_pose, goal_pose):
        """Generate footstep plan from start to goal"""
        footsteps = []

        # Current robot pose
        current_x = start_pose.pose.position.x
        current_y = start_pose.pose.position.y
        current_theta = self.get_yaw(start_pose.pose.orientation)

        # Goal
        goal_x = goal_pose.pose.position.x
        goal_y = goal_pose.pose.position.y

        # Alternate feet
        is_left_foot = True

        while self.distance((current_x, current_y), (goal_x, goal_y)) > 0.1:
            # Calculate direction to goal
            dx = goal_x - current_x
            dy = goal_y - current_y
            target_theta = np.arctan2(dy, dx)

            # Limit rotation per step
            theta_diff = self.wrap_angle(target_theta - current_theta)
            step_theta = current_theta + np.clip(theta_diff, -self.max_step_angle, self.max_step_angle)

            # Calculate next footstep position
            if is_left_foot:
                offset_x = np.cos(step_theta + np.pi/2) * self.step_width/2
                offset_y = np.sin(step_theta + np.pi/2) * self.step_width/2
            else:
                offset_x = -np.cos(step_theta + np.pi/2) * self.step_width/2
                offset_y = -np.sin(step_theta + np.pi/2) * self.step_width/2

            next_x = current_x + np.cos(step_theta) * self.step_length + offset_x
            next_y = current_y + np.sin(step_theta) * self.step_length + offset_y

            # Add footstep
            footstep = {
                'foot': 'left' if is_left_foot else 'right',
                'x': next_x,
                'y': next_y,
                'theta': step_theta
            }
            footsteps.append(footstep)

            # Update current pose
            current_x, current_y, current_theta = next_x, next_y, step_theta
            is_left_foot = not is_left_foot

        return footsteps

    def distance(self, p1, p2):
        return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    def wrap_angle(self, angle):
        return (angle + np.pi) % (2 * np.pi) - np.pi

    def get_yaw(self, orientation):
        # Convert quaternion to yaw
        import tf_transformations
        euler = tf_transformations.euler_from_quaternion([
            orientation.x, orientation.y, orientation.z, orientation.w
        ])
        return euler[2]
```

### Nav2 Integration

```python
# humanoid_navigator.py
import rclpy
from rclpy.node import Node
from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped
import tf_transformations

class HumanoidNavigator(Node):
    def __init__(self):
        super().__init__('humanoid_navigator')

        self.navigator = BasicNavigator()
        self.footstep_planner = FootstepPlanner()

        # Wait for Nav2 to be ready
        self.navigator.waitUntilNav2Active()

        self.get_logger().info('Humanoid Navigator ready')

    def navigate_to_pose(self, goal_pose):
        """High-level navigation interface"""

        # Send goal to Nav2
        self.navigator.goToPose(goal_pose)

        # Monitor progress
        while not self.navigator.isTaskComplete():
            feedback = self.navigator.getFeedback()

            # Check if close enough to start footstep planning
            if feedback and feedback.distance_remaining < 1.0:
                self.get_logger().info('Switching to precise footstep control')
                self.execute_footstep_plan(goal_pose)
                break

            rclpy.spin_once(self, timeout_sec=0.1)

    def execute_footstep_plan(self, goal_pose):
        """Execute precise footstep sequence near goal"""

        # Get current pose
        current_pose = self.navigator.getCurrentPose()

        # Plan footsteps
        footsteps = self.footstep_planner.plan_footsteps(current_pose, goal_pose)

        # Execute each footstep
        for step in footsteps:
            self.execute_single_footstep(step)

        self.get_logger().info('Footstep plan completed')

    def execute_single_footstep(self, footstep):
        """Send footstep command to low-level controller"""
        # This would interface with your humanoid's walking controller
        self.get_logger().info(
            f"Executing {footstep['foot']} foot step to "
            f"({footstep['x']:.2f}, {footstep['y']:.2f})"
        )
        # Send to robot controller...
        import time
        time.sleep(0.5)  # Simulate step execution

def main():
    rclpy.init()
    navigator = HumanoidNavigator()

    # Create goal pose
    goal = PoseStamped()
    goal.header.frame_id = 'map'
    goal.header.stamp = navigator.get_clock().now().to_msg()
    goal.pose.position.x = 3.0
    goal.pose.position.y = 2.0
    goal.pose.orientation.w = 1.0

    # Navigate
    navigator.navigate_to_pose(goal)

    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Bipedal Locomotion Control

### Zero Moment Point (ZMP)

**ZMP** is critical for humanoid balance:

```python
class ZMPController:
    def __init__(self):
        self.com_height = 0.8  # Center of mass height (meters)
        self.g = 9.81

    def calculate_zmp(self, com_pos, com_acc):
        """Calculate Zero Moment Point for stability"""
        zmp_x = com_pos[0] - (self.com_height / self.g) * com_acc[0]
        zmp_y = com_pos[1] - (self.com_height / self.g) * com_acc[1]

        return np.array([zmp_x, zmp_y])

    def is_stable(self, zmp, support_polygon):
        """Check if ZMP is inside support polygon (foot/feet)"""
        from matplotlib.path import Path

        polygon = Path(support_polygon)
        return polygon.contains_point(zmp)
```

### Walking Pattern Generator

```python
class WalkingPatternGenerator:
    def __init__(self):
        self.step_time = 0.8  # seconds per step
        self.step_height = 0.05  # swing foot height
        self.com_height = 0.8

    def generate_trajectory(self, footsteps):
        """Generate CoM and foot trajectories from footstep plan"""
        trajectories = {
            'com': [],
            'left_foot': [],
            'right_foot': []
        }

        dt = 0.01  # 100 Hz control
        t = 0

        for i, step in enumerate(footsteps):
            is_left = step['foot'] == 'left'

            # Support phase (CoM shifts to new foot)
            for _ in np.arange(0, self.step_time/2, dt):
                # CoM trajectory (smooth shift)
                com_x = self.interpolate(
                    footsteps[i-1]['x'] if i > 0 else 0,
                    step['x'],
                    t / (self.step_time/2)
                )
                com_y = self.interpolate(
                    footsteps[i-1]['y'] if i > 0 else 0,
                    step['y'],
                    t / (self.step_time/2)
                )

                trajectories['com'].append([com_x, com_y, self.com_height])

                # Swing foot trajectory (raised)
                if is_left:
                    swing_z = self.swing_height(t / (self.step_time/2))
                    trajectories['left_foot'].append([step['x'], step['y'], swing_z])
                    trajectories['right_foot'].append(trajectories['right_foot'][-1] if trajectories['right_foot'] else [0, -0.1, 0])
                else:
                    swing_z = self.swing_height(t / (self.step_time/2))
                    trajectories['right_foot'].append([step['x'], step['y'], swing_z])
                    trajectories['left_foot'].append(trajectories['left_foot'][-1] if trajectories['left_foot'] else [0, 0.1, 0])

                t += dt

        return trajectories

    def interpolate(self, start, end, t):
        """Smooth interpolation (cubic)"""
        return start + (end - start) * (3*t**2 - 2*t**3)

    def swing_height(self, t):
        """Foot height during swing phase (parabola)"""
        return self.step_height * (4*t - 4*t**2)
```

## Obstacle Avoidance

### Dynamic Window Approach (DWA) Adaptation

```python
class HumanoidDWA:
    def __init__(self):
        self.max_linear_vel = 0.5  # m/s
        self.max_angular_vel = 0.3  # rad/s
        self.linear_acc = 0.2
        self.angular_acc = 0.5

    def compute_velocity_command(self, current_vel, laser_scan, goal):
        """DWA adapted for humanoid constraints"""

        # Sample velocity space
        linear_samples = np.linspace(0, self.max_linear_vel, 10)
        angular_samples = np.linspace(-self.max_angular_vel, self.max_angular_vel, 10)

        best_score = -np.inf
        best_vel = (0, 0)

        for v_lin in linear_samples:
            for v_ang in angular_samples:
                # Check if velocity is reachable
                if not self.is_reachable(current_vel, (v_lin, v_ang)):
                    continue

                # Simulate trajectory
                traj = self.simulate_trajectory(v_lin, v_ang)

                # Check collision
                if self.has_collision(traj, laser_scan):
                    continue

                # Score trajectory
                score = self.score_trajectory(traj, goal)

                if score > best_score:
                    best_score = score
                    best_vel = (v_lin, v_ang)

        return best_vel

    def score_trajectory(self, trajectory, goal):
        """Score based on: distance to goal, clearance, velocity"""
        end_pose = trajectory[-1]

        # Distance to goal (lower is better)
        dist = np.linalg.norm(end_pose[:2] - goal[:2])

        # Velocity (higher is better, encourages progress)
        vel_score = end_pose[2]  # Linear velocity

        # Heading (alignment with goal)
        heading_score = 1.0 / (1.0 + abs(end_pose[3] - np.arctan2(goal[1] - end_pose[1], goal[0] - end_pose[0])))

        return -dist + 0.5 * vel_score + 0.3 * heading_score

    def is_reachable(self, current_vel, target_vel):
        """Check if velocity is dynamically feasible"""
        dv_lin = abs(target_vel[0] - current_vel[0])
        dv_ang = abs(target_vel[1] - current_vel[1])

        return dv_lin <= self.linear_acc * 0.1 and dv_ang <= self.angular_acc * 0.1

    def simulate_trajectory(self, v_lin, v_ang, dt=0.1, steps=20):
        """Forward simulate trajectory"""
        trajectory = []
        x, y, theta = 0, 0, 0

        for _ in range(steps):
            x += v_lin * np.cos(theta) * dt
            y += v_lin * np.sin(theta) * dt
            theta += v_ang * dt

            trajectory.append([x, y, v_lin, theta])

        return np.array(trajectory)

    def has_collision(self, trajectory, laser_scan):
        """Check if trajectory collides with obstacles"""
        # Simplified collision check
        for pose in trajectory:
            # Check if any laser point is too close to trajectory point
            # (In practice, use proper collision checking)
            pass
        return False
```

## ROS 2 Navigation Stack Configuration

### Nav2 Parameters for Humanoids

```yaml
# nav2_humanoid_params.yaml
bt_navigator:
  ros__parameters:
    use_sim_time: True
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20

controller_server:
  ros__parameters:
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.0  # Humanoids can't strafe
    min_theta_velocity_threshold: 0.001

    # DWA plugin for humanoid
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      min_vel_x: 0.0
      max_vel_x: 0.5  # Conservative for stability
      min_vel_y: 0.0
      max_vel_y: 0.0  # No lateral movement
      max_vel_theta: 0.3
      min_speed_xy: 0.0
      max_speed_xy: 0.5
      acc_lim_x: 0.2  # Smooth acceleration
      acc_lim_theta: 0.5
      decel_lim_x: -0.3
      decel_lim_theta: -0.5
      vx_samples: 20
      vth_samples: 20
      sim_time: 2.0

planner_server:
  ros__parameters:
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.1
      use_astar: true  # A* for efficiency
      allow_unknown: true

costmap_2d:
  global_costmap:
    global_costmap:
      ros__parameters:
        update_frequency: 1.0
        publish_frequency: 1.0
        robot_radius: 0.3  # Humanoid footprint
        resolution: 0.05
        plugins: ["static_layer", "obstacle_layer", "inflation_layer"]

  local_costmap:
    local_costmap:
      ros__parameters:
        update_frequency: 5.0
        publish_frequency: 2.0
        width: 3.0
        height: 3.0
        resolution: 0.05
        robot_radius: 0.3
        plugins: ["obstacle_layer", "inflation_layer"]
```

### Launch Nav2 for Humanoid

```python
# humanoid_nav2_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    pkg_dir = get_package_share_directory('humanoid_navigation')
    params_file = os.path.join(pkg_dir, 'config', 'nav2_humanoid_params.yaml')

    return LaunchDescription([
        # Nav2 lifecycle manager
        Node(
            package='nav2_lifecycle_manager',
            executable='lifecycle_manager',
            name='lifecycle_manager_navigation',
            output='screen',
            parameters=[{'use_sim_time': True},
                       {'autostart': True},
                       {'node_names': ['controller_server',
                                       'planner_server',
                                       'recoveries_server',
                                       'bt_navigator']}]
        ),

        # Controller server
        Node(
            package='nav2_controller',
            executable='controller_server',
            output='screen',
            parameters=[params_file]
        ),

        # Planner server
        Node(
            package='nav2_planner',
            executable='planner_server',
            name='planner_server',
            output='screen',
            parameters=[params_file]
        ),

        # BT Navigator
        Node(
            package='nav2_bt_navigator',
            executable='bt_navigator',
            name='bt_navigator',
            output='screen',
            parameters=[params_file]
        ),

        # Custom footstep planner
        Node(
            package='humanoid_navigation',
            executable='footstep_planner_node',
            name='footstep_planner',
            output='screen'
        )
    ])
```

## Key Takeaways

✅ **Humanoid navigation** requires footstep planning, not just velocity commands
✅ **ZMP** ensures dynamic stability during walking
✅ **Footstep planners** discretize space into feasible foot placements
✅ **Nav2 adaptation** involves conservative velocity limits and custom controllers
✅ **Walking pattern generators** create smooth CoM and foot trajectories
✅ **Obstacle avoidance** must consider bipedal constraints (no strafing, limited rotation)

## Next Chapter

In **Chapter 4**, we'll explore **Training in Simulation** using Isaac Sim for reinforcement learning, synthetic data generation, domain randomization, and transfer learning to real humanoid robots.

## Further Reading

- [Humanoid Robotics: A Reference](https://www.springer.com/book/9789400776258)
- [ZMP-Based Walking Control](https://ieeexplore.ieee.org/document/1522737)
- [Nav2 Documentation](https://navigation.ros.org/)
- [Footstep Planning Survey](https://arxiv.org/abs/1809.06436)
