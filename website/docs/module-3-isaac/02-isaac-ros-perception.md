---
id: 02-isaac-ros-perception
title: "Isaac ROS & Perception"
module: "isaac"
chapter: 2
estimated_reading_time: 30
difficulty: "intermediate"
keywords: ["isaac-ros", "vslam", "perception", "depth", "object-detection"]
---

# Isaac ROS & Perception

Isaac ROS provides GPU-accelerated perception libraries (called GEMs) that dramatically improve performance of computer vision and robotics algorithms. This chapter covers visual SLAM, depth perception, segmentation, and object detection using Isaac ROS.

## Isaac ROS Overview

### What are Isaac ROS GEMs?

**GEMs (Graph-Enabled Modules)** are GPU-accelerated ROS 2 packages that replace CPU-based implementations:

| Task | CPU (Traditional) | GPU (Isaac ROS GEM) | Speedup |
|------|-------------------|---------------------|---------|
| **Stereo Depth** | 10 FPS | 60 FPS | 6x |
| **Object Detection** | 5 FPS | 30 FPS | 6x |
| **Visual SLAM** | 15 FPS | 60 FPS | 4x |
| **Image Segmentation** | 3 FPS | 45 FPS | 15x |

### Architecture

```
┌──────────────────────────────────────────────────────┐
│              ROS 2 Application Layer                  │
│        (Standard ROS 2 nodes: Nav2, MoveIt)          │
└────────────────────┬─────────────────────────────────┘
                     │ (ROS 2 Topics/Services)
┌────────────────────▼─────────────────────────────────┐
│              Isaac ROS GEMs                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  VSLAM   │  │  DNN     │  │  Stereo  │           │
│  │          │  │ Inference│  │  Depth   │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
└───────┼────────────┼──────────────┼──────────────────┘
        │            │              │
┌───────▼────────────▼──────────────▼──────────────────┐
│           NVIDIA CUDA / TensorRT                      │
│              (GPU Acceleration)                       │
└──────────────────────────────────────────────────────┘
```

### Installation

**Prerequisites:**
- Ubuntu 22.04
- ROS 2 Humble
- NVIDIA GPU (RTX 20 series or newer)
- CUDA 11.8+, cuDNN 8.6+

**Install Isaac ROS:**
```bash
# Create workspace
mkdir -p ~/isaac_ros_ws/src
cd ~/isaac_ros_ws/src

# Clone Isaac ROS common
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_common.git

# Clone perception packages
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam.git
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_dnn_inference.git
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_image_pipeline.git

# Install dependencies
cd ~/isaac_ros_ws
rosdep install --from-paths src --ignore-src -r -y

# Build
colcon build --symlink-install

# Source workspace
source install/setup.bash
```

## Visual SLAM (VSLAM)

Visual SLAM enables robots to build maps and localize using cameras.

### Isaac ROS Visual SLAM Features

- **GPU-accelerated** feature extraction and matching
- **Stereo or monocular** camera support
- **IMU fusion** for robust tracking
- **Loop closure** detection
- **Map export** to ROS occupancy grid

### Hardware Setup

**Stereo Camera (Recommended):**
```
Robot → RealSense D435i / ZED 2 Camera
     → USB 3.0 connection
     → Publish: /camera/infra1/image_rect_raw (left)
               /camera/infra2/image_rect_raw (right)
               /camera/imu (optional but improves accuracy)
```

### Launch Visual SLAM

```bash
# Terminal 1: Launch camera
ros2 launch realsense2_camera rs_launch.py \
    depth_module.profile:=640x480x30 \
    enable_infra1:=true \
    enable_infra2:=true \
    enable_imu:=true

# Terminal 2: Launch Isaac ROS VSLAM
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py
```

### Configuration File

```yaml
# visual_slam_params.yaml
/**:
  ros__parameters:
    # Image topics
    left_camera_frame: camera_infra1_frame
    right_camera_frame: camera_infra2_frame
    camera_optical_frames: [camera_infra1_optical_frame, camera_infra2_optical_frame]

    # IMU topic
    imu_frame: camera_imu_frame
    enable_imu_fusion: true

    # SLAM parameters
    enable_slam_visualization: true
    enable_landmarks_view: true
    enable_observations_view: true

    # Map settings
    map_frame: map
    odom_frame: odom
    base_frame: base_link

    # Performance
    image_buffer_size: 30
    feature_detector_type: 'FAST'  # Options: FAST, ORB, AKAZE
```

### Python API Example

```python
import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry
from sensor_msgs.msg import PointCloud2

class VSLAMMonitor(Node):
    def __init__(self):
        super().__init__('vslam_monitor')

        # Subscribe to VSLAM outputs
        self.odom_sub = self.create_subscription(
            Odometry,
            '/visual_slam/tracking/odometry',
            self.odom_callback,
            10
        )

        self.map_sub = self.create_subscription(
            PointCloud2,
            '/visual_slam/tracking/slam_path',
            self.map_callback,
            10
        )

        self.get_logger().info('VSLAM Monitor started')

    def odom_callback(self, msg):
        pos = msg.pose.pose.position
        self.get_logger().info(
            f'Robot position: x={pos.x:.2f}, y={pos.y:.2f}, z={pos.z:.2f}',
            throttle_duration_sec=1.0
        )

    def map_callback(self, msg):
        num_points = len(msg.data) // msg.point_step
        self.get_logger().info(
            f'Map points: {num_points}',
            throttle_duration_sec=5.0
        )

def main():
    rclpy.init()
    node = VSLAMMonitor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

## Depth Perception and Segmentation

### Stereo Depth Estimation

Isaac ROS provides GPU-accelerated stereo depth computation.

**Launch Stereo Depth:**
```bash
ros2 launch isaac_ros_stereo_image_proc isaac_ros_stereo_image_pipeline.launch.py \
    left_image_topic:=/camera/infra1/image_rect_raw \
    right_image_topic:=/camera/infra2/image_rect_raw \
    camera_info_topic:=/camera/infra1/camera_info
```

**Output:**
- `/disparity` (disparity map)
- `/depth` (depth image in meters)
- `/points2` (3D point cloud)

### Depth Image Processing

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import numpy as np
import cv2

class DepthProcessor(Node):
    def __init__(self):
        super().__init__('depth_processor')
        self.bridge = CvBridge()

        self.sub = self.create_subscription(
            Image,
            '/depth',
            self.depth_callback,
            10
        )

    def depth_callback(self, msg):
        # Convert ROS image to OpenCV format
        depth_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='32FC1')

        # Find closest obstacle
        min_depth = np.nanmin(depth_image)
        self.get_logger().info(f'Closest obstacle: {min_depth:.2f} meters')

        # Visualize depth
        depth_colormap = cv2.applyColorMap(
            cv2.convertScaleAbs(depth_image, alpha=255/10.0),
            cv2.COLORMAP_JET
        )
        cv2.imshow('Depth', depth_colormap)
        cv2.waitKey(1)

def main():
    rclpy.init()
    node = DepthProcessor()
    rclpy.spin(node)
    node.destroy_node()
    cv2.destroyAllWindows()
    rclpy.shutdown()
```

### Semantic Segmentation

Segment images into classes (person, car, road, etc.) using deep learning.

**Using Isaac ROS DNN Inference:**
```bash
# Download pre-trained model (PeopleNet for person detection)
mkdir -p ~/models
cd ~/models
wget https://api.ngc.nvidia.com/v2/models/nvidia/tao/peoplenet/versions/pruned_quantized_decrypted_v2.3.3/files/resnet34_peoplenet_int8.onnx

# Convert ONNX to TensorRT
/usr/src/tensorrt/bin/trtexec \
    --onnx=resnet34_peoplenet_int8.onnx \
    --saveEngine=peoplenet.engine \
    --int8

# Launch segmentation
ros2 launch isaac_ros_dnn_inference isaac_ros_dnn_inference.launch.py \
    model_file_path:=~/models/peoplenet.engine \
    input_image_topic:=/camera/color/image_raw \
    output_tensor_topic:=/detections
```

**Processing Segmentation Output:**
```python
from vision_msgs.msg import Detection2DArray

class SegmentationProcessor(Node):
    def __init__(self):
        super().__init__('segmentation_processor')

        self.sub = self.create_subscription(
            Detection2DArray,
            '/detections',
            self.detection_callback,
            10
        )

    def detection_callback(self, msg):
        for detection in msg.detections:
            bbox = detection.bbox
            label = detection.results[0].hypothesis.class_id
            score = detection.results[0].hypothesis.score

            self.get_logger().info(
                f'Detected {label} at ({bbox.center.x:.0f}, {bbox.center.y:.0f}) '
                f'with confidence {score:.2f}'
            )
```

## Object Detection and Tracking

### Using YOLO with Isaac ROS

**Install Isaac ROS YOLOv8:**
```bash
cd ~/isaac_ros_ws/src
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_object_detection.git

cd ~/isaac_ros_ws
colcon build --packages-select isaac_ros_yolov8

source install/setup.bash
```

**Launch YOLOv8:**
```bash
ros2 launch isaac_ros_yolov8 isaac_ros_yolov8.launch.py \
    model_file_path:=/path/to/yolov8n.engine \
    input_image_topic:=/camera/color/image_raw
```

### Multi-Object Tracking

Track multiple objects across frames:

```python
from isaac_ros_visual_objects_msgs.msg import VisualObjectArray
from collections import defaultdict
import numpy as np

class ObjectTracker(Node):
    def __init__(self):
        super().__init__('object_tracker')

        self.tracked_objects = defaultdict(list)  # {object_id: [positions]}

        self.sub = self.create_subscription(
            VisualObjectArray,
            '/visual_objects',
            self.tracking_callback,
            10
        )

    def tracking_callback(self, msg):
        for obj in msg.objects:
            obj_id = obj.id
            position = (obj.center.x, obj.center.y)

            # Add to tracked path
            self.tracked_objects[obj_id].append(position)

            # Keep last 30 positions
            if len(self.tracked_objects[obj_id]) > 30:
                self.tracked_objects[obj_id].pop(0)

            # Estimate velocity
            if len(self.tracked_objects[obj_id]) >= 2:
                pos_curr = np.array(self.tracked_objects[obj_id][-1])
                pos_prev = np.array(self.tracked_objects[obj_id][-2])
                velocity = pos_curr - pos_prev

                self.get_logger().info(
                    f'Object {obj_id} velocity: ({velocity[0]:.1f}, {velocity[1]:.1f}) px/frame'
                )
```

## Point Cloud Processing

### Converting Depth to Point Cloud

```python
from sensor_msgs.msg import PointCloud2, CameraInfo
import numpy as np
import sensor_msgs_py.point_cloud2 as pc2

class DepthToPointCloud(Node):
    def __init__(self):
        super().__init__('depth_to_pointcloud')

        self.camera_info = None

        self.info_sub = self.create_subscription(
            CameraInfo,
            '/camera/color/camera_info',
            self.info_callback,
            10
        )

        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth/image_rect_raw',
            self.depth_callback,
            10
        )

        self.pc_pub = self.create_publisher(PointCloud2, '/pointcloud', 10)

        self.bridge = CvBridge()

    def info_callback(self, msg):
        self.camera_info = msg

    def depth_callback(self, msg):
        if self.camera_info is None:
            return

        # Convert depth image to numpy
        depth = self.bridge.imgmsg_to_cv2(msg, desired_encoding='32FC1')

        # Camera intrinsics
        fx = self.camera_info.k[0]
        fy = self.camera_info.k[4]
        cx = self.camera_info.k[2]
        cy = self.camera_info.k[5]

        # Generate point cloud
        height, width = depth.shape
        points = []

        for v in range(height):
            for u in range(width):
                z = depth[v, u]
                if np.isnan(z) or z <= 0:
                    continue

                x = (u - cx) * z / fx
                y = (v - cy) * z / fy

                points.append([x, y, z])

        # Create PointCloud2 message
        pc_msg = pc2.create_cloud_xyz32(msg.header, points)
        self.pc_pub.publish(pc_msg)
```

### Filtering Point Clouds

```python
import open3d as o3d

def filter_pointcloud(points):
    # Convert to Open3D format
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)

    # Remove outliers
    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)

    # Downsample
    pcd = pcd.voxel_down_sample(voxel_size=0.05)

    return np.asarray(pcd.points)
```

## Performance Benchmarking

### Measuring GEM Performance

```python
import time

class PerformanceBenchmark(Node):
    def __init__(self):
        super().__init__('performance_benchmark')

        self.frame_times = []

        self.sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.image_callback,
            10
        )

        self.timer = self.create_timer(5.0, self.print_stats)

    def image_callback(self, msg):
        self.frame_times.append(time.time())

    def print_stats(self):
        if len(self.frame_times) < 2:
            return

        # Calculate FPS
        time_diffs = np.diff(self.frame_times)
        avg_fps = 1.0 / np.mean(time_diffs)

        # Calculate latency (assuming timestamps are accurate)
        current_time = time.time()
        latest_frame_time = self.frame_times[-1]
        latency = (current_time - latest_frame_time) * 1000  # ms

        self.get_logger().info(
            f'FPS: {avg_fps:.1f}, Latency: {latency:.1f} ms'
        )

        # Reset
        self.frame_times = []
```

## Integration with Isaac Sim

### Streaming Sensors from Isaac Sim to Isaac ROS

```python
# In Isaac Sim script
from omni.isaac.ros2_bridge import ROS2Bridge

# Create camera
camera = Camera(
    prim_path="/World/Camera",
    position=[2, 0, 1],
    resolution=(640, 480)
)

# Create ROS 2 bridge
ros2_bridge = ROS2Bridge()

# Publish camera image
ros2_bridge.create_camera_publisher(
    camera_prim_path="/World/Camera",
    topic_name="/camera/color/image_raw",
    frame_id="camera_frame"
)

# Run simulation with ROS 2 publishing
world.reset()
for i in range(10000):
    world.step(render=True)
```

**Receive in Isaac ROS:**
```bash
# Subscribe to Isaac Sim camera
ros2 run isaac_ros_visual_slam visual_slam_node \
    --ros-args -r camera/image_raw:=/camera/color/image_raw
```

## Key Takeaways

✅ **Isaac ROS GEMs** provide GPU-accelerated perception (6-15x faster)
✅ **Visual SLAM** enables real-time mapping and localization
✅ **Stereo depth** and segmentation are hardware-accelerated
✅ **Object detection** (YOLO) runs at 30+ FPS on RTX GPUs
✅ **Point cloud processing** benefits from CUDA acceleration
✅ **Isaac Sim integration** enables sim-to-real perception pipelines

## Next Chapter

In **Chapter 3**, we'll explore **Navigation with Nav2** for humanoid robots, covering path planning for bipedal locomotion, obstacle avoidance, and integrating Isaac ROS perception with the ROS 2 navigation stack.

## Further Reading

- [Isaac ROS Documentation](https://nvidia-isaac-ros.github.io/)
- [VSLAM Paper (ORB-SLAM3)](https://arxiv.org/abs/2007.11898)
- [TensorRT Optimization](https://docs.nvidia.com/deeplearning/tensorrt/)
- [Open3D Point Cloud Library](http://www.open3d.org/)
