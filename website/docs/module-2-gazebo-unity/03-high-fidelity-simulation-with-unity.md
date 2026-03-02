---
id: 03-high-fidelity-simulation-with-unity
title: "High-Fidelity Simulation with Unity"
module: "gazebo-unity"
chapter: 3
estimated_reading_time: 30
difficulty: "intermediate"
keywords: ["unity", "robotics-hub", "ros-tcp-connector", "photorealistic", "hri"]
---

# High-Fidelity Simulation with Unity

Unity's game engine brings photorealistic rendering, advanced physics, and massive asset ecosystem to robotics simulation. This chapter covers setting up Unity Robotics Hub, integrating with ROS 2, and leveraging Unity's graphics for computer vision and human-robot interaction.

## Unity Robotics Hub Setup

### Prerequisites

**Required:**
- Unity Hub installed ([unity.com/download](https://unity.com/download))
- Unity Editor 2021.3 LTS or newer
- ROS 2 Humble installed on Ubuntu 22.04
- Basic C# programming knowledge

### Step 1: Create New Unity Project

```bash
# Open Unity Hub
unity-hub

# In Unity Hub:
# 1. Click "New Project"
# 2. Select "3D" template (or "3D URP" for better graphics)
# 3. Name: "PhysicalAI_Simulation"
# 4. Click "Create Project"
```

### Step 2: Install Unity Robotics Hub Packages

**Via Package Manager:**
```
1. Window → Package Manager
2. Click "+" → "Add package from git URL..."
3. Enter: https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector
4. Click "Add"

5. Repeat for Visualizations:
   https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.visualizations
```

**Verify Installation:**
```
Window → Package Manager → "In Project" tab
Should see:
- ROS TCP Connector
- ROS Visualizations (optional)
```

### Step 3: Configure ROS-TCP Endpoint

**In Unity:**
```
1. Robotics → ROS Settings
2. ROS IP Address: 192.168.1.100 (your Ubuntu machine IP)
3. ROS Port: 10000
4. Protocol: ROS 2
```

**On Ubuntu (Install ROS TCP Endpoint):**
```bash
# Clone ROS-TCP-Endpoint repository
cd ~/ros2_ws/src
git clone https://github.com/Unity-Technologies/ROS-TCP-Endpoint.git

# Build
cd ~/ros2_ws
colcon build --packages-select ros_tcp_endpoint

# Source workspace
source install/setup.bash

# Launch endpoint
ros2 run ros_tcp_endpoint default_server_endpoint --ros-args -p ROS_IP:=0.0.0.0
```

## ROS-TCP-Connector: Bridging Unity and ROS 2

The ROS-TCP-Connector enables bidirectional communication between Unity and ROS 2.

### Architecture

```
┌────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  Unity Scene   │ ←──────→ │ ROS-TCP-Endpoint │ ←──────→ │  ROS 2 Nodes   │
│  (C# Scripts)  │   TCP    │  (Python/C++)    │   DDS    │  (Navigation,  │
│                │          │                  │          │   Perception)  │
└────────────────┘          └──────────────────┘          └────────────────┘
```

### Publishing from Unity to ROS 2

**C# Script (Unity):**
```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Geometry;

public class OdometryPublisher : MonoBehaviour
{
    private ROSConnection ros;
    [SerializeField] string topicName = "/odom";
    [SerializeField] float publishRate = 10f; // Hz

    private float timer;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<TwistMsg>(topicName);
    }

    void Update()
    {
        timer += Time.deltaTime;
        if (timer > 1f / publishRate)
        {
            timer = 0;

            // Get robot velocity from Rigidbody
            Rigidbody rb = GetComponent<Rigidbody>();

            TwistMsg msg = new TwistMsg
            {
                linear = new Vector3Msg
                {
                    x = rb.velocity.x,
                    y = rb.velocity.y,
                    z = rb.velocity.z
                },
                angular = new Vector3Msg
                {
                    x = rb.angularVelocity.x,
                    y = rb.angularVelocity.y,
                    z = rb.angularVelocity.z
                }
            };

            ros.Publish(topicName, msg);
        }
    }
}
```

**Verify on ROS 2 Side:**
```bash
# Listen to topic
ros2 topic echo /odom
```

### Subscribing to ROS 2 Topics from Unity

**C# Script (Unity):**
```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Geometry;

public class VelocityController : MonoBehaviour
{
    private ROSConnection ros;

    [SerializeField] float wheelRadius = 0.1f;
    [SerializeField] float wheelSeparation = 0.5f;

    public GameObject leftWheel;
    public GameObject rightWheel;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Subscribe<TwistMsg>("/cmd_vel", ExecuteVelocityCommand);
    }

    void ExecuteVelocityCommand(TwistMsg msg)
    {
        float linearVel = (float)msg.linear.x;
        float angularVel = (float)msg.angular.z;

        // Differential drive kinematics
        float leftWheelVel = (linearVel - angularVel * wheelSeparation / 2f) / wheelRadius;
        float rightWheelVel = (linearVel + angularVel * wheelSeparation / 2f) / wheelRadius;

        // Apply to wheel joint motors (example)
        leftWheel.GetComponent<HingeJoint>().motor = new JointMotor
        {
            targetVelocity = leftWheelVel * Mathf.Rad2Deg,
            force = 100
        };

        rightWheel.GetComponent<HingeJoint>().motor = new JointMotor
        {
            targetVelocity = rightWheelVel * Mathf.Rad2Deg,
            force = 100
        };
    }
}
```

**Test from ROS 2:**
```bash
# Publish velocity command
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.5}, angular: {z: 0.2}}"
```

## Photorealistic Rendering for Computer Vision

Unity's rendering pipeline enables generation of high-quality synthetic datasets for training vision models.

### Setting Up Universal Render Pipeline (URP)

**Step 1: Convert to URP**
```
1. Window → Rendering → Render Pipeline Converter
2. Select "Built-in to URP"
3. Click "Convert Assets"
```

**Step 2: Configure Lighting**

```csharp
// LightingManager.cs - Dynamic lighting control
using UnityEngine;

public class LightingManager : MonoBehaviour
{
    [SerializeField] Light mainLight;
    [SerializeField] float minIntensity = 0.5f;
    [SerializeField] float maxIntensity = 2.0f;

    void Start()
    {
        RandomizeLighting();
    }

    public void RandomizeLighting()
    {
        // Random intensity (simulates different times of day)
        mainLight.intensity = Random.Range(minIntensity, maxIntensity);

        // Random color temperature
        mainLight.color = Color.Lerp(
            new Color(1f, 0.9f, 0.8f),  // Warm (sunset)
            new Color(0.8f, 0.9f, 1f),  // Cool (overcast)
            Random.value
        );

        // Random direction
        transform.rotation = Quaternion.Euler(
            Random.Range(30f, 70f),
            Random.Range(0f, 360f),
            0f
        );
    }
}
```

### Synthetic Data Generation Pipeline

**Capture RGB, Depth, and Segmentation:**

```csharp
using UnityEngine;
using UnityEngine.Perception.GroundTruth;

public class DataCaptureManager : MonoBehaviour
{
    private PerceptionCamera perceptionCamera;

    [SerializeField] string outputPath = "SyntheticData/";
    [SerializeField] int captureInterval = 10; // Frames between captures

    private int frameCount = 0;

    void Start()
    {
        perceptionCamera = GetComponent<PerceptionCamera>();

        // Configure labeling
        IdLabelConfig labelConfig = ScriptableObject.CreateInstance<IdLabelConfig>();
        // Add labels...

        perceptionCamera.EnableInstanceSegmentation();
        perceptionCamera.EnableDepth();
    }

    void Update()
    {
        frameCount++;
        if (frameCount % captureInterval == 0)
        {
            CaptureFrame();
        }
    }

    void CaptureFrame()
    {
        // Unity Perception package handles automatic capture
        // Data saved to: <Project>/PerceptionOutput/
        Debug.Log($"Captured frame {frameCount}");
    }
}
```

**Install Perception Package:**
```
Package Manager → Add package from git URL:
https://github.com/Unity-Technologies/com.unity.perception.git
```

### Domain Randomization for Sim-to-Real

```csharp
using UnityEngine;

public class DomainRandomizer : MonoBehaviour
{
    [SerializeField] GameObject[] objects;
    [SerializeField] Material[] randomMaterials;

    void OnEnable()
    {
        RandomizeScene();
    }

    void RandomizeScene()
    {
        // Randomize object materials
        foreach (GameObject obj in objects)
        {
            Renderer renderer = obj.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material = randomMaterials[Random.Range(0, randomMaterials.Length)];
            }
        }

        // Randomize object positions
        foreach (GameObject obj in objects)
        {
            obj.transform.position = new Vector3(
                Random.Range(-5f, 5f),
                0.5f,
                Random.Range(-5f, 5f)
            );
            obj.transform.rotation = Quaternion.Euler(0, Random.Range(0f, 360f), 0);
        }

        // Randomize camera position (within constraints)
        Camera.main.transform.position = new Vector3(
            Random.Range(-2f, 2f),
            Random.Range(1f, 3f),
            Random.Range(-2f, 2f)
        );
    }
}
```

## Human-Robot Interaction Simulation

Unity excels at realistic human avatars for HRI research.

### Adding Humanoid Characters

**Option 1: Unity Asset Store**
```
1. Window → Asset Store
2. Search "Humanoid Character"
3. Download free assets (e.g., "Free Characters" pack)
4. Import into project
```

**Option 2: Mixamo Characters**
```
1. Visit mixamo.com (free)
2. Select character
3. Download with "Unity" preset
4. Import FBX into Unity
```

### Animating Human Behavior

```csharp
using UnityEngine;
using UnityEngine.AI;

public class HumanBehavior : MonoBehaviour
{
    private NavMeshAgent agent;
    private Animator animator;

    [SerializeField] Transform[] waypoints;
    private int currentWaypoint = 0;

    void Start()
    {
        agent = GetComponent<NavMeshAgent>();
        animator = GetComponent<Animator>();

        MoveToNextWaypoint();
    }

    void Update()
    {
        // Update animation based on movement speed
        float speed = agent.velocity.magnitude;
        animator.SetFloat("Speed", speed);

        // Check if reached waypoint
        if (!agent.pathPending && agent.remainingDistance < 0.5f)
        {
            MoveToNextWaypoint();
        }
    }

    void MoveToNextWaypoint()
    {
        if (waypoints.Length == 0) return;

        agent.destination = waypoints[currentWaypoint].position;
        currentWaypoint = (currentWaypoint + 1) % waypoints.Length;
    }

    // Called when robot approaches
    public void OnRobotApproach()
    {
        animator.SetTrigger("Wave");
        Debug.Log("Human noticed robot!");
    }
}
```

### Proximity Detection for HRI

```csharp
using UnityEngine;

public class HRIProximityDetector : MonoBehaviour
{
    [SerializeField] float detectionRadius = 2.0f;
    [SerializeField] LayerMask robotLayer;

    private bool robotNearby = false;

    void Update()
    {
        Collider[] hits = Physics.OverlapSphere(transform.position, detectionRadius, robotLayer);

        if (hits.Length > 0 && !robotNearby)
        {
            robotNearby = true;
            GetComponent<HumanBehavior>().OnRobotApproach();
        }
        else if (hits.Length == 0)
        {
            robotNearby = false;
        }
    }

    void OnDrawGizmosSelected()
    {
        // Visualize detection radius in editor
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRadius);
    }
}
```

## Importing Robot Models (URDF)

Unity can import URDF files from ROS 2 packages.

### Using URDF Importer

**Step 1: Install URDF Importer**
```
Package Manager → Add package from git URL:
https://github.com/Unity-Technologies/URDF-Importer.git?path=/com.unity.robotics.urdf-importer
```

**Step 2: Import URDF**
```
1. Assets → Import Robot from URDF
2. Select your robot's URDF file (e.g., ~/ros2_ws/src/my_robot/urdf/robot.urdf)
3. Click "Import"
```

**Step 3: Configure Articulation Body**

Unity uses `ArticulationBody` for multi-joint robots:

```csharp
using UnityEngine;

public class ArticulationJointController : MonoBehaviour
{
    private ArticulationBody articulationBody;

    [SerializeField] float targetPosition = 0f; // Radians
    [SerializeField] float stiffness = 10000f;
    [SerializeField] float damping = 100f;

    void Start()
    {
        articulationBody = GetComponent<ArticulationBody>();

        // Configure joint drive
        ArticulationDrive drive = articulationBody.xDrive;
        drive.stiffness = stiffness;
        drive.damping = damping;
        drive.forceLimit = float.MaxValue;
        articulationBody.xDrive = drive;
    }

    void Update()
    {
        // Set target position
        ArticulationDrive drive = articulationBody.xDrive;
        drive.target = targetPosition * Mathf.Rad2Deg;
        articulationBody.xDrive = drive;
    }

    public void SetTargetPosition(float angle)
    {
        targetPosition = angle;
    }
}
```

## Performance Optimization for Photorealism

### 1. **Level of Detail (LOD)**

```csharp
using UnityEngine;

public class LODSetup : MonoBehaviour
{
    void Start()
    {
        LODGroup lodGroup = gameObject.AddComponent<LODGroup>();

        LOD[] lods = new LOD[3];

        // LOD 0 (high detail, close)
        lods[0] = new LOD(0.6f, GetRenderers("HighDetail"));

        // LOD 1 (medium detail, mid-range)
        lods[1] = new LOD(0.3f, GetRenderers("MediumDetail"));

        // LOD 2 (low detail, far)
        lods[2] = new LOD(0.1f, GetRenderers("LowDetail"));

        lodGroup.SetLODs(lods);
        lodGroup.RecalculateBounds();
    }

    Renderer[] GetRenderers(string childName)
    {
        Transform child = transform.Find(childName);
        return child != null ? child.GetComponentsInChildren<Renderer>() : new Renderer[0];
    }
}
```

### 2. **Occlusion Culling**

```
1. Window → Rendering → Occlusion Culling
2. Select static objects → Check "Occluder Static"
3. Click "Bake"
```

### 3. **GPU Instancing**

```csharp
// Enable GPU instancing on materials
Material material = GetComponent<Renderer>().material;
material.enableInstancing = true;
```

## Advanced: Custom Shaders for Simulation

```csharp
// DepthShader.shader - Custom depth visualization
Shader "Custom/DepthVisualization"
{
    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
            };

            struct v2f
            {
                float4 pos : SV_POSITION;
                float depth : TEXCOORD0;
            };

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.depth = o.pos.z;
                return o;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                // Normalize depth to 0-1 range
                float depth = i.depth / 100.0; // Adjust max distance
                return fixed4(depth, depth, depth, 1);
            }
            ENDCG
        }
    }
}
```

## Real-World Example: Service Robot in Apartment

**Scene Setup:**
```
1. Environment:
   - Apartment interior (free asset: "Apartment Kit")
   - Furniture, decorations

2. Human NPCs:
   - 2-3 humanoid characters with NavMesh
   - Animated behaviors (walking, sitting, waving)

3. Service Robot:
   - Imported from URDF
   - Camera sensor (RGB + depth)
   - LiDAR for navigation

4. Tasks:
   - Navigate to human
   - Detect when human waves
   - Deliver object
```

**Integration Script:**
```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;

public class ServiceRobotManager : MonoBehaviour
{
    private ROSConnection ros;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();

        // Subscribe to ROS 2 navigation goals
        ros.Subscribe<PoseStampedMsg>("/goal_pose", MoveToGoal);

        // Publish camera images
        StartCoroutine(PublishCameraImages());
    }

    void MoveToGoal(PoseStampedMsg msg)
    {
        Vector3 targetPos = new Vector3(
            (float)msg.pose.position.x,
            (float)msg.pose.position.y,
            (float)msg.pose.position.z
        );

        // Use Unity's NavMeshAgent or publish to ROS 2 Nav2
        GetComponent<UnityEngine.AI.NavMeshAgent>().destination = targetPos;
    }

    IEnumerator PublishCameraImages()
    {
        while (true)
        {
            // Capture and publish camera images...
            yield return new WaitForSeconds(0.1f); // 10 Hz
        }
    }
}
```

## Key Takeaways

✅ **Unity Robotics Hub** bridges Unity and ROS 2 seamlessly
✅ **ROS-TCP-Connector** enables bidirectional topic communication
✅ **Photorealistic rendering** ideal for computer vision datasets
✅ **Domain randomization** improves sim-to-real transfer
✅ **Humanoid characters** enable HRI research
✅ **URDF importer** brings ROS 2 robots into Unity

## Next Chapter

In **Chapter 4**, we'll apply everything learned to a **practical project**: simulating the **Unitree Go2 quadruped robot** with full sensor suite, testing navigation algorithms, and demonstrating sim-to-real transfer.

## Further Reading

- [Unity Robotics Hub Documentation](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [Unity Perception Package](https://github.com/Unity-Technologies/com.unity.perception)
- [ROS-TCP-Connector Guide](https://github.com/Unity-Technologies/ROS-TCP-Connector)
- [Domain Randomization Paper](https://arxiv.org/abs/1703.06907)
