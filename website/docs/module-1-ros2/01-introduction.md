---
id: 01-introduction
title: "Introduction to ROS 2"
sidebar_label: "1. Introduction"
sidebar_position: 1
description: "Learn the fundamentals of Robot Operating System 2 (ROS 2) and its role in modern robotics"
keywords: ["ros2", "robotics", "middleware", "dds", "introduction"]
---

# Introduction to ROS 2

## What is ROS 2?

**Robot Operating System 2 (ROS 2)** is an open-source robotics middleware suite that provides services designed for heterogeneous compute clusters. It's the successor to ROS 1 (now called ROS Classic) and was designed from the ground up to address the shortcomings of its predecessor.

:::info Key Concept
ROS 2 is not an operating system in the traditional sense. It's a **middleware** framework that sits between your application code and the operating system, providing tools and libraries for robot software development.
:::

## Why ROS 2?

ROS 2 was created to address several critical limitations of ROS 1:

### 1. **Real-Time Performance**
- ROS 2 supports deterministic execution and real-time systems
- Uses DDS (Data Distribution Service) for reliable, low-latency communication
- Suitable for safety-critical applications

### 2. **Multi-Robot Systems**
- Native support for multi-robot and distributed systems
- No central master node (unlike ROS 1)
- Automatic discovery of nodes across the network

### 3. **Production-Ready**
- Designed for commercial products, not just research
- Enhanced security features
- Better support for embedded systems

### 4. **Cross-Platform Support**
- Linux, Windows, macOS support
- Works on embedded platforms (Raspberry Pi, NVIDIA Jetson)
- Microcontroller support via micro-ROS

## Core Concepts

### Nodes

A **node** is a process that performs computation. ROS 2 applications are composed of many nodes working together:

```python
import rclpy
from rclpy.node import Node

class MyFirstNode(Node):
    def __init__(self):
        super().__init__('my_first_node')
        self.get_logger().info('Hello from ROS 2!')

def main(args=None):
    rclpy.init(args=args)
    node = MyFirstNode()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Topics

**Topics** are named buses over which nodes exchange messages. They implement a publish-subscribe pattern:

- **Publishers** send data to topics
- **Subscribers** receive data from topics
- Many-to-many communication

```cpp
// C++ Publisher Example
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

class MinimalPublisher : public rclcpp::Node {
public:
    MinimalPublisher() : Node("minimal_publisher") {
        publisher_ = this->create_publisher<std_msgs::msg::String>("topic", 10);
        timer_ = this->create_wall_timer(
            std::chrono::milliseconds(500),
            std::bind(&MinimalPublisher::timer_callback, this));
    }

private:
    void timer_callback() {
        auto message = std_msgs::msg::String();
        message.data = "Hello, ROS 2! " + std::to_string(count_++);
        RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
        publisher_->publish(message);
    }

    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
    rclcpp::TimerBase::SharedPtr timer_;
    size_t count_ = 0;
};
```

### Services

**Services** implement a request-response pattern for synchronous communication:

- Client sends a request
- Server processes it and returns a response
- One-to-one communication

### Actions

**Actions** are for long-running tasks that provide feedback:

- Client sends a goal
- Server processes it and sends periodic feedback
- Server returns a final result
- Client can cancel the goal mid-execution

## ROS 2 Architecture

```
┌─────────────────────────────────────────────────┐
│           Your Application Code                 │
├─────────────────────────────────────────────────┤
│           ROS 2 Client Libraries                │
│         (rclpy for Python, rclcpp for C++)      │
├─────────────────────────────────────────────────┤
│              ROS 2 Middleware (rmw)             │
├─────────────────────────────────────────────────┤
│       DDS Implementation (Fast-DDS, etc.)       │
├─────────────────────────────────────────────────┤
│            Operating System (Linux)             │
└─────────────────────────────────────────────────┘
```

## ROS 2 Distributions

ROS 2 releases follow an alphabetical naming scheme with 6-month cycles:

| Distribution | Release Date | LTS | Ubuntu Version |
|--------------|-------------|-----|----------------|
| Humble Hawksbill | May 2022 | ✅ Yes (5 years) | 22.04 |
| Iron Irwini | May 2023 | ❌ No | 22.04 |
| Jazzy Jalisco | May 2024 | ❌ No | 24.04 |
| Rolling Ridley | Continuous | ❌ No | Latest |

:::tip Recommendation
For production systems and beginners, use **ROS 2 Humble** as it's an LTS (Long-Term Support) release supported until 2027.
:::

## Use Cases

ROS 2 is used in various robotics applications:

- 🚗 **Autonomous Vehicles**: Self-driving cars (e.g., Autoware)
- 🏭 **Industrial Robotics**: Manufacturing and warehouse automation
- 🚁 **Drones**: Aerial robotics with PX4 integration
- 🤖 **Humanoid Robots**: Research platforms like Boston Dynamics Spot
- 🏥 **Medical Robotics**: Surgical robots and assistive devices
- 🌾 **Agricultural Robotics**: Harvesting and monitoring robots

## What's Next?

In the next chapter, we'll guide you through installing ROS 2 on your system and setting up your development environment.

---

## Key Takeaways

- ✅ ROS 2 is a middleware framework, not an operating system
- ✅ It provides nodes, topics, services, and actions for robot communication
- ✅ ROS 2 uses DDS for real-time, distributed communication
- ✅ Humble Hawksbill is the recommended LTS release for most users
- ✅ ROS 2 supports Python, C++, and other languages

## Further Reading

- [Official ROS 2 Documentation](https://docs.ros.org/en/humble/)
- [ROS 2 Design Principles](https://design.ros2.org/)
- [DDS Specification](https://www.omg.org/spec/DDS/)
