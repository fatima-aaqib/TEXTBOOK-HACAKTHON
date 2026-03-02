---
id: 03-ros2-architecture
sidebar_label: 'ROS 2 Architecture: Nodes, Topics, Services, Actions'
slug: '/module-1-ros2/ros2-architecture'
---

# ROS 2 Architecture: Nodes, Topics, Services, Actions

## Introduction

Understanding the architecture of ROS 2 is fundamental to developing robust robotic systems. This chapter explores the core architectural concepts that enable distributed computing in robotics applications.

## Nodes: The Building Blocks of ROS 2

Nodes are the fundamental computational units in ROS 2. Each node typically performs a specific task and communicates with other nodes through topics, services, and actions.

### Characteristics of Nodes
- **Process Isolation**: Each node runs in its own process, providing fault tolerance
- **Single Responsibility**: Nodes should perform one primary function
- **Communication Interface**: Nodes expose interfaces for inter-node communication
- **Lifecycle Management**: Nodes can be started, stopped, and restarted independently

### Creating a Node in Python
```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        # Initialize node-specific resources
        
def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Topics: Publish-Subscribe Communication

Topics enable asynchronous, decoupled communication between nodes using a publish-subscribe pattern.

### Key Concepts
- **Publishers**: Nodes that send messages to topics
- **Subscribers**: Nodes that receive messages from topics
- **Message Types**: Strongly typed data structures defined in `.msg` files
- **Quality of Service (QoS)**: Configurable policies for reliability and performance

### Example: Publisher-Subscriber Pattern
```python
# Publisher
publisher = self.create_publisher(String, 'topic_name', 10)
msg = String()
msg.data = 'Hello World'
publisher.publish(msg)

# Subscriber
def topic_callback(self, msg):
    self.get_logger().info(f'Received: {msg.data}')

subscription = self.create_subscription(
    String, 'topic_name', self.topic_callback, 10)
```

## Services: Request-Response Communication

Services provide synchronous, bidirectional communication for request-response interactions.

### Key Concepts
- **Service Server**: Provides a specific service
- **Service Client**: Requests service execution
- **Service Types**: Defined in `.srv` files with request/response structures
- **Blocking Calls**: Service calls block until response is received

### Example: Service Implementation
```python
# Service Server
from example_interfaces.srv import AddTwoInts

def add_two_ints_callback(self, request, response):
    response.sum = request.a + request.b
    self.get_logger().info(f'Returning: {response.sum}')
    return response

service = self.create_service(AddTwoInts, 'add_two_ints', add_two_ints_callback)

# Service Client
client = self.create_client(AddTwoInts, 'add_two_ints')
request = AddTwoInts.Request()
request.a = 1
request.b = 2

future = client.call_async(request)
```

## Actions: Goal-Based Communication

Actions handle long-running tasks with feedback and status updates.

### Key Components
- **Goal**: Request to perform a long-running task
- **Feedback**: Periodic updates during task execution
- **Result**: Final outcome of the task
- **Cancel/Preemption**: Ability to interrupt ongoing tasks

### Example: Action Implementation
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
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]
        
        for i in range(1, goal_handle.request.order):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                return Fibonacci.Result()
                
            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1])
            goal_handle.publish_feedback(feedback_msg)
            
        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback_msg.sequence
        return result
```

## Advanced Architecture Patterns

### Composition
Composing multiple nodes into a single process for improved performance and reduced overhead.

### Launch Files
Using launch files to orchestrate complex multi-node systems with parameter configuration.

### Parameter Management
Dynamic parameter configuration for runtime system adjustments.

## Summary

ROS 2's architecture provides flexible communication patterns that accommodate various robotic application needs. Understanding nodes, topics, services, and actions is essential for building scalable and maintainable robotic systems.