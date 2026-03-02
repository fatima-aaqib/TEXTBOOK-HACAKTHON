---
id: 06-advanced-ros2
sidebar_label: 'Advanced ROS 2: Launch Files, Parameters, and Logging'
slug: '/module-1-ros2/advanced-ros2'
---

# Advanced ROS 2: Launch Files, Parameters, and Logging

## Introduction

As ROS 2 applications become more complex, managing multiple nodes, configurations, and debugging becomes increasingly important. This chapter covers advanced topics including launch systems, parameter management, and comprehensive logging strategies.

## ROS 2 Launch System

### Launch Files Overview

The ROS 2 launch system provides a declarative way to start multiple nodes with specific configurations. Launch files can be written in Python, XML, or YAML.

### Python Launch Files

Python launch files offer the most flexibility and programmatic control:

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Declare launch arguments
    namespace_arg = DeclareLaunchArgument(
        'namespace',
        default_value='robot1',
        description='Namespace for the robot'
    )
    
    # Get launch configuration
    namespace = LaunchConfiguration('namespace')
    
    # Define nodes
    talker_node = Node(
        package='demo_nodes_cpp',
        executable='talker',
        name='talker',
        namespace=namespace,
        parameters=[
            {'param1': 'value1'},
            {'param2': 42}
        ],
        remappings=[
            ('chatter', 'custom_chatter')
        ]
    )
    
    listener_node = Node(
        package='demo_nodes_cpp',
        executable='listener',
        name='listener',
        namespace=namespace
    )
    
    return LaunchDescription([
        namespace_arg,
        talker_node,
        listener_node
    ])
```

### Advanced Launch Features

#### Conditional Launch
```python
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration

# Conditional node launch
use_sim_time = LaunchConfiguration('use_sim_time')
sim_node = Node(
    package='my_package',
    executable='sim_node',
    condition=IfCondition(use_sim_time)
)
```

#### Launch Substitutions
```python
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

# Path substitutions
config_path = PathJoinSubstitution([
    FindPackageShare('my_package'),
    'config',
    'params.yaml'
])

# Node with external config
node_with_config = Node(
    package='my_package',
    executable='my_node',
    parameters=[config_path]
)
```

## Parameter Management

### Parameter Files (YAML)

Organize parameters in YAML files for better maintainability:

```yaml
/**:  # Global parameters
  ros__parameters:
    use_sim_time: false
    log_level: info

/my_namespace/talker:
  ros__parameters:
    frequency: 1.0
    message: "Hello World"
    queue_size: 10

/my_namespace/listener:
  ros__parameters:
    buffer_size: 100
    debug_mode: false
```

### Programmatic Parameter Management

```python
import rclpy
from rclpy.node import Node
from rclpy.parameter import Parameter

class ParameterManager(Node):
    def __init__(self):
        super().__init__('parameter_manager')
        
        # Declare parameters with descriptions
        self.declare_parameter(
            'robot_name',
            'default_robot',
            ParameterDescriptor(description='Name of the robot')
        )
        
        # Group parameters
        self.declare_parameter('navigation.planner_frequency', 5.0)
        self.declare_parameter('navigation.controller_frequency', 50.0)
        self.declare_parameter('navigation.max_velocity', 1.0)
        
        # Set parameter callback
        self.set_parameters_callback(self.parameters_callback)
    
    def parameters_callback(self, params):
        result = SetParametersResult()
        result.successful = True
        
        for param in params:
            if param.name == 'robot_name':
                if len(param.value) < 3:
                    result.successful = False
                    result.reason = 'Robot name must be at least 3 characters'
                    break
        
        return result
```

### Dynamic Parameter Reconfiguration

```python
# At runtime, parameters can be changed:
# ros2 param set /node_name param_name new_value

# Or programmatically:
from rclpy.parameter_client import AsyncParameterClient

class ParameterChanger(Node):
    def __init__(self):
        super().__init__('parameter_changer')
        self.param_client = AsyncParameterClient(self, 'target_node')
    
    async def change_parameter(self, name, value):
        await self.param_client.set_parameters([Parameter(name, Parameter.Type.PARAMETER_DOUBLE, value)])
```

## Comprehensive Logging

### Log Levels and Configuration

ROS 2 supports multiple log levels:
- DEBUG: Detailed diagnostic information
- INFO: General information
- WARN: Warning messages
- ERROR: Error conditions
- FATAL: Critical errors

### Advanced Logging Configuration

```python
import rclpy
from rclpy.node import Node
import logging

class AdvancedLogger(Node):
    def __init__(self):
        super().__init__('advanced_logger')
        
        # Set log level
        self.get_logger().set_level(logging.DEBUG)
        
        # Structured logging
        self.log_info_with_context('Starting node', {
            'node_name': self.get_name(),
            'timestamp': self.get_clock().now().nanoseconds
        })
    
    def log_info_with_context(self, message, context_dict):
        context_str = ', '.join([f'{k}={v}' for k, v in context_dict.items()])
        self.get_logger().info(f'{message} | {context_str}')
    
    def log_performance_metrics(self, operation, duration_ms):
        self.get_logger().info(
            f'PERFORMANCE: {operation} took {duration_ms:.2f}ms',
            throttle_duration_sec=1.0  # Log once per second
        )
```

### Custom Log Formatters

For more detailed logging, you can configure custom formatters:

```python
# In launch file or configuration
from launch.actions import SetEnvironmentVariable

# Set custom log format
log_format = SetEnvironmentVariable(
    'RCUTILS_LOGGING_FORMAT',
    '[{severity}] [{name}]: {message} ({time})'
)
```

## Lifecycle Nodes

### Managing Node States

Lifecycle nodes provide explicit state management for complex initialization and shutdown:

```python
from rclpy.lifecycle import LifecycleNode
from rclpy.lifecycle import TransitionCallbackReturn

class LifecycleManagedNode(LifecycleNode):
    def __init__(self):
        super().__init__('lifecycle_managed_node')
    
    def on_configure(self, state):
        self.get_logger().info('Configuring node...')
        # Initialize resources
        self.publisher = self.create_publisher(String, 'topic', 10)
        return TransitionCallbackReturn.SUCCESS
    
    def on_activate(self, state):
        self.get_logger().info('Activating node...')
        # Activate publishers/subscribers
        self.publisher.on_activate()
        return TransitionCallbackReturn.SUCCESS
    
    def on_deactivate(self, state):
        self.get_logger().info('Deactivating node...')
        # Deactivate publishers/subscribers
        self.publisher.on_deactivate()
        return TransitionCallbackReturn.SUCCESS
    
    def on_cleanup(self, state):
        self.get_logger().info('Cleaning up node...')
        # Release resources
        self.publisher.destroy()
        return TransitionCallbackReturn.SUCCESS
```

## Performance Optimization

### Memory Management

```python
# Use intraprocess communication for same-process nodes
from rclpy.context import Context

context = Context()
rclpy.init(context=context)

# Configure for intraprocess communication
node_options = rclpy.node.NodeOptions()
node_options.use_intra_process_comms = True
```

### Efficient Message Handling

```python
class EfficientNode(Node):
    def __init__(self):
        super().__init__('efficient_node')
        
        # Use callbacks that minimize copying
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.efficient_callback,
            10,
            callback_group=rclpy.callback_groups.ReentrantCallbackGroup()
        )
    
    def efficient_callback(self, msg):
        # Process message efficiently
        # Avoid unnecessary copies
        processed_data = self.process_message(msg.data)
        self.publish_result(processed_data)
    
    def process_message(self, data):
        # Efficient processing
        return data.upper()  # Example processing
```

## Debugging Strategies

### Remote Debugging

```python
# Enable remote debugging
import debugpy

class DebuggableNode(Node):
    def __init__(self):
        super().__init__('debuggable_node')
        
        # Listen for debugger on port 5678
        debugpy.listen(('localhost', 5678))
        self.get_logger().info('Waiting for debugger attach...')
        debugpy.wait_for_client()  # Blocks until debugger attaches
        debugpy.breakpoint()       # Sets breakpoint
```

### Profiling Tools

```python
import cProfile
import pstats
from io import StringIO

class ProfiledNode(Node):
    def __init__(self):
        super().__init__('profiled_node')
        self.profiler = cProfile.Profile()
    
    def profile_method(self):
        self.profiler.enable()
        # Method to profile
        self.expensive_operation()
        self.profiler.disable()
        
        # Print stats
        s = StringIO()
        ps = pstats.Stats(self.profiler, stream=s)
        ps.sort_stats('cumulative')
        ps.print_stats(10)  # Top 10 functions
        self.get_logger().info(s.getvalue())
```

## Testing and Continuous Integration

### Launch Testing

```python
import launch
from launch import LaunchDescription
from launch_testing.actions import ReadyToTest
from launch_ros.actions import Node
import launch_testing

def generate_test_description():
    test_node = Node(
        package='my_package',
        executable='test_target_node',
        name='test_target'
    )
    
    return LaunchDescription([
        test_node,
        ReadyToTest(),
    ])

class TestNode(unittest.TestCase):
    def test_node_startup(self, proc_output):
        proc_output.assertWaitFor('Node started successfully', timeout=10.0)
```

## Summary

Advanced ROS 2 development involves mastering launch systems, parameter management, and comprehensive logging. These tools enable the creation of complex, maintainable, and robust robotic applications. Understanding lifecycle management, performance optimization, and debugging techniques is essential for professional ROS 2 development.