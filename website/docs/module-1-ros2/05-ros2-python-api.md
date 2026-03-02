---
id: 05-ros2-python-api
sidebar_label: 'ROS 2 Python API: Programming with ROS 2 in Python'
slug: '/module-1-ros2/python-api'
---

# ROS 2 Python API: Programming with ROS 2 in Python

## Introduction

Python is one of the most popular languages for ROS 2 development due to its simplicity and extensive ecosystem. This chapter covers the Python API for ROS 2, focusing on practical examples and best practices for building robust robotic applications.

## Setting Up Python Environment

### Installing ROS 2 Python Packages
```bash
pip3 install ros2cli
# Or use system packages depending on your installation
```

### Virtual Environments
Always use virtual environments for ROS 2 Python development:
```bash
python3 -m venv ros2_env
source ros2_env/bin/activate  # On Windows: ros2_env\\Scripts\\activate
```

## Core ROS 2 Python Concepts

### Initializing and Shutting Down
```python
import rclpy
from rclpy.node import Node

def main(args=None):
    rclpy.init(args=args)  # Initialize ROS communications
    
    try:
        node = MyNode()
        rclpy.spin(node)  # Keep node alive
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()  # Clean up resources
        rclpy.shutdown()     # Shutdown ROS communications
```

### Creating a Node Class
```python
class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1
```

## Publishers and Subscribers

### Publisher Implementation
```python
from std_msgs.msg import String

class PublisherExample(Node):
    def __init__(self):
        super().__init__('publisher_example')
        self.publisher = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(0.5, self.publish_message)
        self.counter = 0

    def publish_message(self):
        msg = String()
        msg.data = f'Message #{self.counter}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')
        self.counter += 1
```

### Subscriber Implementation
```python
class SubscriberExample(Node):
    def __init__(self):
        super().__init__('subscriber_example')
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10)
        self.subscription  # Prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: {msg.data}')
```

### Quality of Service (QoS) Settings
```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# Define custom QoS profile
qos_profile = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST
)

# Use with publisher/subscriber
publisher = self.create_publisher(String, 'topic', qos_profile)
```

## Services in Python

### Service Server
```python
from example_interfaces.srv import AddTwoInts

class ServiceServer(Node):
    def __init__(self):
        super().__init__('service_server')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_callback)

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {response.sum}')
        return response
```

### Service Client
```python
class ServiceClient(Node):
    def __init__(self):
        super().__init__('service_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()
```

## Actions in Python

### Action Server
```python
from rclpy.action import ActionServer
from example_interfaces.action import Fibonacci

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback)

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')
        
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]
        
        for i in range(1, goal_handle.request.order):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                return Fibonacci.Result()

            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1])
            
            self.get_logger().info(f'Publishing feedback: {feedback_msg.sequence}')
            goal_handle.publish_feedback(feedback_msg)
            
        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback_msg.sequence
        self.get_logger().info(f'Result: {result.sequence}')
        
        return result
```

### Action Client
```python
from rclpy.action import ActionClient
from example_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')
        self._action_client = ActionClient(
            self,
            Fibonacci,
            'fibonacci')

    def send_goal(self, order):
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback)

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected :(')
            return

        self.get_logger().info('Goal accepted :)')
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        feedback = feedback_msg.feedback
        self.get_logger().info(f'Received feedback: {feedback.sequence}')

    def get_result_callback(self, future):
        result = future.result().result
        self.get_logger().info(f'Result: {result.sequence}')
```

## Working with Parameters

### Declaring and Using Parameters
```python
class ParameterExample(Node):
    def __init__(self):
        super().__init__('parameter_example')
        
        # Declare parameters with default values
        self.declare_parameter('param_string', 'default_value')
        self.declare_parameter('param_int', 42)
        self.declare_parameter('param_double', 3.14)
        self.declare_parameter('param_bool', True)
        
        # Access parameter values
        self.param_string = self.get_parameter('param_string').value
        self.param_int = self.get_parameter('param_int').value
        self.param_double = self.get_parameter('param_double').value
        self.param_bool = self.get_parameter('param_bool').value
        
        # Callback for parameter changes
        self.add_on_set_parameters_callback(self.parameter_callback)

    def parameter_callback(self, params):
        for param in params:
            if param.name == 'param_string' and param.type_ == Parameter.Type.PARAMETER_STRING:
                self.get_logger().info(f'Parameter {param.name} changed to {param.value}')
        return SetParametersResult(successful=True)
```

## TF2 Transformations

### Broadcasting Transforms
```python
import tf_transformations
from tf2_ros import TransformBroadcaster

class FramePublisher(Node):
    def __init__(self):
        super().__init__('frame_publisher')
        self.tf_broadcaster = TransformBroadcaster(self)
        self.timer = self.create_timer(0.1, self.broadcast_transform)

    def broadcast_transform(self):
        t = TransformStamped()

        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'world'
        t.child_frame_id = 'robot'

        t.transform.translation.x = 0.0
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.0
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = 0.0
        t.transform.rotation.w = 1.0

        self.tf_broadcaster.sendTransform(t)
```

### Listening to Transforms
```python
from tf2_ros import TransformListener, Buffer

class TransformListenerNode(Node):
    def __init__(self):
        super().__init__('transform_listener')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

    def lookup_transform(self, target_frame, source_frame):
        try:
            transform = self.tf_buffer.lookup_transform(
                target_frame,
                source_frame,
                rclpy.time.Time())
            return transform
        except Exception as e:
            self.get_logger().info(f'Could not transform {target_frame} to {source_frame}: {str(e)}')
            return None
```

## Advanced Python Techniques

### Async/Await Support
```python
import asyncio
from rclpy.executors import MultiThreadedExecutor

class AsyncNode(Node):
    def __init__(self):
        super().__init__('async_node')
        self.executor = MultiThreadedExecutor()
        
    async def async_operation(self):
        # Perform async operations
        await asyncio.sleep(1.0)
        self.get_logger().info('Async operation completed')
```

### Custom Message Types
```python
# Assuming you have a custom message in your_package/msg/CustomMessage.msg
from your_package.msg import CustomMessage

class CustomMessageNode(Node):
    def __init__(self):
        super().__init__('custom_message_node')
        self.publisher = self.create_publisher(CustomMessage, 'custom_topic', 10)
        
    def publish_custom_message(self, value1, value2):
        msg = CustomMessage()
        msg.field1 = value1
        msg.field2 = value2
        self.publisher.publish(msg)
```

## Error Handling and Debugging

### Exception Handling
```python
def safe_method_call(self):
    try:
        # ROS-specific operations
        result = self.some_ros_operation()
        return result
    except Exception as e:
        self.get_logger().error(f'Error in operation: {str(e)}')
        return None
```

### Logging Best Practices
```python
def detailed_logging_example(self):
    self.get_logger().debug('Debug information')
    self.get_logger().info('General information')
    self.get_logger().warn('Warning message')
    self.get_logger().error('Error message')
    self.get_logger().fatal('Fatal error')
```

## Testing ROS 2 Python Nodes

### Unit Testing with PyTest
```python
import pytest
import rclpy
from your_package.nodes import YourNode

def test_node_initialization():
    rclpy.init()
    try:
        node = YourNode()
        assert node is not None
    finally:
        rclpy.shutdown()
```

## Summary

The ROS 2 Python API provides powerful tools for developing robotic applications. Understanding publishers, subscribers, services, actions, parameters, and TF2 is essential for building sophisticated robotic systems. Following best practices for error handling, testing, and resource management ensures robust and maintainable code.