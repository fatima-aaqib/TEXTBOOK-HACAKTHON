---
id: 03-llm-planning-reasoning
title: "LLM Planning & Reasoning"
module: "vla"
chapter: 3
estimated_reading_time: 30
difficulty: "advanced"
keywords: ["llm", "gpt", "task-planning", "chain-of-thought", "reasoning"]
---

# LLM Planning & Reasoning

Large Language Models (LLMs) like GPT-4 can decompose complex natural language instructions into executable robot actions. This chapter covers using LLMs for task planning, converting language to ROS 2 actions, chain-of-thought prompting, and ensuring safety through validation.

## Using GPT for Task Planning

### Why LLMs for Robotics?

**Traditional Approach:**
```
User: "Make me coffee"
→ Requires hardcoded state machine for every task
→ Cannot handle variations ("Make me coffee with milk")
```

**LLM Approach:**
```
User: "Make me coffee with milk"
→ LLM decomposes into steps:
   1. Navigate to kitchen
   2. Locate coffee machine
   3. Place cup
   4. Press brew button
   5. Locate milk
   6. Pour milk into cup
   7. Return cup to user
```

### GPT-4 for Robotics

**Example API Call:**
```python
import openai

openai.api_key = "your-api-key"

def plan_task(instruction, available_actions):
    """Use GPT-4 to plan task"""

    prompt = f"""
You are a robot task planner. Given a high-level instruction and available actions,
generate a step-by-step plan using only the available actions.

Available actions:
{', '.join(available_actions)}

Instruction: {instruction}

Plan (list each action with parameters):
"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2  # Low temperature for consistency
    )

    plan = response.choices[0].message.content
    return plan

# Example
available_actions = [
    "navigate(location)",
    "pick(object)",
    "place(object, location)",
    "open(object)",
    "close(object)"
]

plan = plan_task("Set the table for dinner", available_actions)
print(plan)
```

**Output:**
```
1. navigate('kitchen')
2. open('cabinet')
3. pick('plate')
4. navigate('dining_room')
5. place('plate', 'table')
6. navigate('kitchen')
7. pick('fork')
8. navigate('dining_room')
9. place('fork', 'table')
...
```

## Natural Language to ROS 2 Actions

### Architecture

```
User Instruction → LLM Planner → Action Parser → ROS 2 Action Server → Robot
```

### Action Definitions

```python
# action_library.py
class ActionLibrary:
    """Define available robot actions"""

    def __init__(self):
        self.actions = {
            'navigate': {
                'description': 'Move robot to specified location',
                'parameters': ['location: str'],
                'ros_action': '/navigate_to_pose'
            },
            'pick': {
                'description': 'Grasp specified object',
                'parameters': ['object: str'],
                'ros_action': '/pick_object'
            },
            'place': {
                'description': 'Place held object at location',
                'parameters': ['object: str', 'location: str'],
                'ros_action': '/place_object'
            },
            'open': {
                'description': 'Open container or door',
                'parameters': ['object: str'],
                'ros_action': '/open_object'
            },
            'close': {
                'description': 'Close container or door',
                'parameters': ['object: str'],
                'ros_action': '/close_object'
            },
            'say': {
                'description': 'Speak text using TTS',
                'parameters': ['text: str'],
                'ros_action': '/speak'
            }
        }

    def get_descriptions(self):
        """Get action descriptions for LLM prompt"""
        descriptions = []
        for name, info in self.actions.items():
            params = ', '.join(info['parameters'])
            descriptions.append(f"{name}({params}): {info['description']}")
        return descriptions
```

### LLM Task Planner

```python
# llm_planner.py
import openai
import json
import re

class LLMTaskPlanner:
    def __init__(self, api_key, model="gpt-4"):
        openai.api_key = api_key
        self.model = model
        self.action_lib = ActionLibrary()

    def plan(self, instruction, context=None):
        """Generate task plan from instruction"""

        # Build prompt
        actions_desc = '\n'.join(self.action_lib.get_descriptions())

        context_str = ""
        if context:
            context_str = f"\nCurrent context:\n{json.dumps(context, indent=2)}\n"

        prompt = f"""You are a robot task planner. Generate a step-by-step plan using ONLY the available actions below.

Available actions:
{actions_desc}
{context_str}
User instruction: {instruction}

Output format (JSON):
{{
  "plan": [
    {{"action": "action_name", "parameters": {{"param": "value"}}}},
    ...
  ],
  "reasoning": "Brief explanation of plan"
}}
"""

        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful robot task planner."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        # Parse response
        content = response.choices[0].message.content

        # Extract JSON (handle markdown code blocks)
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)

        plan_data = json.loads(content)
        return plan_data

# Example usage
planner = LLMTaskPlanner(api_key="your-key")

plan = planner.plan(
    "Bring me the red mug from the kitchen",
    context={
        "robot_location": "living_room",
        "known_objects": ["red_mug", "blue_cup", "plate"],
        "known_locations": ["kitchen", "living_room", "bedroom"]
    }
)

print(json.dumps(plan, indent=2))
```

**Output:**
```json
{
  "plan": [
    {"action": "navigate", "parameters": {"location": "kitchen"}},
    {"action": "pick", "parameters": {"object": "red_mug"}},
    {"action": "navigate", "parameters": {"location": "living_room"}},
    {"action": "place", "parameters": {"object": "red_mug", "location": "table"}},
    {"action": "say", "parameters": {"text": "Here is your red mug"}}
  ],
  "reasoning": "Navigate to kitchen, pick up the red mug, return to user in living room, place on table, and confirm delivery"
}
```

### Executing Plans with ROS 2

```python
# plan_executor.py
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from nav2_msgs.action import NavigateToPose
from manipulation_msgs.action import PickPlace
import json

class PlanExecutor(Node):
    def __init__(self):
        super().__init__('plan_executor')

        # Action clients
        self.nav_client = ActionClient(self, NavigateToPose, '/navigate_to_pose')
        # Add more action clients...

        self.action_map = {
            'navigate': self.execute_navigate,
            'pick': self.execute_pick,
            'place': self.execute_place
        }

    def execute_plan(self, plan):
        """Execute plan step by step"""
        for i, step in enumerate(plan['plan']):
            action = step['action']
            params = step['parameters']

            self.get_logger().info(f"Step {i+1}: {action}({params})")

            # Execute action
            if action in self.action_map:
                success = self.action_map[action](params)

                if not success:
                    self.get_logger().error(f"Failed at step {i+1}")
                    return False
            else:
                self.get_logger().warn(f"Unknown action: {action}")

        self.get_logger().info("Plan completed successfully")
        return True

    def execute_navigate(self, params):
        """Execute navigation action"""
        location = params['location']

        # Convert location name to pose (use predefined locations)
        pose = self.get_location_pose(location)

        # Send navigation goal
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose = pose

        self.nav_client.wait_for_server()
        future = self.nav_client.send_goal_async(goal_msg)

        rclpy.spin_until_future_complete(self, future)
        goal_handle = future.result()

        if not goal_handle.accepted:
            return False

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future)

        return result_future.result().result.success

    def execute_pick(self, params):
        """Execute pick action"""
        object_name = params['object']
        # Implement pick logic...
        return True

    def execute_place(self, params):
        """Execute place action"""
        object_name = params['object']
        location = params['location']
        # Implement place logic...
        return True

    def get_location_pose(self, location_name):
        """Map location name to pose"""
        locations = {
            'kitchen': {'x': 5.0, 'y': 2.0, 'z': 0.0},
            'living_room': {'x': 0.0, 'y': 0.0, 'z': 0.0},
            'bedroom': {'x': -3.0, 'y': 4.0, 'z': 0.0}
        }

        loc = locations.get(location_name, {'x': 0.0, 'y': 0.0, 'z': 0.0})

        pose = PoseStamped()
        pose.header.frame_id = 'map'
        pose.pose.position.x = loc['x']
        pose.pose.position.y = loc['y']
        pose.pose.orientation.w = 1.0

        return pose
```

## Chain-of-Thought Prompting

### What is Chain-of-Thought (CoT)?

**CoT** encourages LLMs to show reasoning steps before answering.

**Without CoT:**
```
Q: Can the robot reach the top shelf?
A: No.
```

**With CoT:**
```
Q: Can the robot reach the top shelf?
A: Let me think step by step:
   1. The robot's maximum reach height is 2.0 meters
   2. The top shelf is at 2.5 meters
   3. 2.5 meters > 2.0 meters
   Therefore, the robot cannot reach the top shelf.
```

### CoT for Robotics Planning

```python
def plan_with_cot(instruction, context):
    """Use chain-of-thought prompting"""

    prompt = f"""You are a robot task planner. Think step-by-step to create a safe and effective plan.

Available actions:
{actions_desc}

Context:
{json.dumps(context, indent=2)}

Instruction: {instruction}

Think through this step-by-step:
1. What is the goal?
2. What is the current state?
3. What preconditions must be satisfied?
4. What is the sequence of actions?
5. Are there any safety concerns?

Output your reasoning, then the plan in JSON format.
"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content
```

**Example Output:**
```
Reasoning:
1. Goal: Deliver water bottle to user in bedroom
2. Current state: Robot in kitchen, water bottle on counter
3. Preconditions:
   - Robot must be able to navigate to bedroom
   - Water bottle must be graspable
   - Path must be clear
4. Action sequence:
   - Pick water bottle
   - Navigate to bedroom
   - Approach user
   - Hand over water bottle
5. Safety concerns:
   - Ensure stable grasp to avoid dropping
   - Navigate slowly to avoid spilling
   - Verify user is ready to receive

Plan:
{
  "plan": [
    {"action": "pick", "parameters": {"object": "water_bottle"}},
    {"action": "navigate", "parameters": {"location": "bedroom"}},
    {"action": "say", "parameters": {"text": "Here is your water"}},
    {"action": "place", "parameters": {"object": "water_bottle", "location": "hand"}}
  ]
}
```

## Safety and Validation

### Pre-Execution Validation

```python
class SafetyValidator:
    def __init__(self):
        self.safety_rules = {
            'max_travel_distance': 10.0,  # meters
            'forbidden_locations': ['stairs', 'narrow_hallway'],
            'max_pick_weight': 2.0,  # kg
            'collision_check': True
        }

    def validate_plan(self, plan, context):
        """Validate plan before execution"""
        violations = []

        for step in plan['plan']:
            action = step['action']
            params = step['parameters']

            # Check location safety
            if action == 'navigate':
                location = params['location']
                if location in self.safety_rules['forbidden_locations']:
                    violations.append(f"Forbidden location: {location}")

            # Check object weight
            if action == 'pick':
                obj = params['object']
                weight = context.get('object_weights', {}).get(obj, 0)
                if weight > self.safety_rules['max_pick_weight']:
                    violations.append(f"Object too heavy: {obj} ({weight}kg)")

            # Check distance
            if action == 'navigate':
                distance = self.calculate_distance(
                    context['robot_location'],
                    params['location']
                )
                if distance > self.safety_rules['max_travel_distance']:
                    violations.append(f"Distance too far: {distance:.1f}m")

        return len(violations) == 0, violations

    def calculate_distance(self, loc1, loc2):
        """Calculate distance between locations"""
        # Simplified - use actual map in production
        locations = {
            'kitchen': (5, 2),
            'living_room': (0, 0),
            'bedroom': (-3, 4)
        }
        p1 = locations.get(loc1, (0, 0))
        p2 = locations.get(loc2, (0, 0))
        return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)**0.5

# Usage
validator = SafetyValidator()
is_safe, violations = validator.validate_plan(plan, context)

if not is_safe:
    print("⚠️ Safety violations detected:")
    for v in violations:
        print(f"  - {v}")
else:
    print("✅ Plan is safe to execute")
    executor.execute_plan(plan)
```

### LLM Self-Critique

```python
def self_critique_plan(plan, instruction):
    """Ask LLM to critique its own plan"""

    critique_prompt = f"""Review the following robot plan and identify any potential issues.

Instruction: {instruction}

Plan:
{json.dumps(plan, indent=2)}

Critique the plan considering:
1. Correctness: Does it achieve the goal?
2. Safety: Are there any dangerous actions?
3. Efficiency: Is there a better sequence?
4. Feasibility: Can the robot actually do this?

Output: JSON with {{\"issues\": [...], \"improved_plan\": {{...}}}}
"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": critique_prompt}],
        temperature=0.3
    )

    critique = json.loads(response.choices[0].message.content)
    return critique
```

## Handling Ambiguity

### Clarification Questions

```python
def handle_ambiguous_instruction(instruction):
    """Ask clarifying questions if needed"""

    ambiguity_check_prompt = f"""Analyze if this instruction is ambiguous for a robot:

Instruction: "{instruction}"

Is this instruction:
1. Clear and unambiguous? (can be executed directly)
2. Ambiguous? (needs clarification)

If ambiguous, what clarifying questions should be asked?

Output JSON: {{\"is_ambiguous\": bool, \"questions\": [...]}}
"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": ambiguity_check_prompt}],
        temperature=0.3
    )

    analysis = json.loads(response.choices[0].message.content)

    if analysis['is_ambiguous']:
        print("❓ Need clarification:")
        for q in analysis['questions']:
            print(f"  - {q}")
            # Ask user for clarification...
        return None
    else:
        return plan_task(instruction)

# Example
instruction = "Bring me something to drink"
# Ambiguous - what drink? where from?

handle_ambiguous_instruction(instruction)
```

## Complete Integration Example

```python
# llm_robot_system.py
import rclpy
from rclpy.node import Node

class LLMRobotSystem(Node):
    def __init__(self, openai_api_key):
        super().__init__('llm_robot_system')

        self.planner = LLMTaskPlanner(api_key=openai_api_key)
        self.executor = PlanExecutor()
        self.validator = SafetyValidator()

    def process_instruction(self, instruction):
        """Main pipeline: instruction → plan → validate → execute"""

        self.get_logger().info(f"Received instruction: {instruction}")

        # 1. Get current context
        context = self.get_robot_context()

        # 2. Generate plan
        self.get_logger().info("Generating plan...")
        plan = self.planner.plan(instruction, context)

        self.get_logger().info(f"Generated plan:\n{json.dumps(plan, indent=2)}")

        # 3. Validate safety
        self.get_logger().info("Validating plan...")
        is_safe, violations = self.validator.validate_plan(plan, context)

        if not is_safe:
            self.get_logger().error("Safety violations:")
            for v in violations:
                self.get_logger().error(f"  - {v}")
            return False

        # 4. Execute plan
        self.get_logger().info("Executing plan...")
        success = self.executor.execute_plan(plan)

        if success:
            self.get_logger().info("✅ Task completed successfully")
        else:
            self.get_logger().error("❌ Task execution failed")

        return success

    def get_robot_context(self):
        """Gather current robot state"""
        return {
            'robot_location': 'living_room',
            'battery_level': 85,
            'known_objects': ['red_mug', 'blue_cup', 'book'],
            'known_locations': ['kitchen', 'living_room', 'bedroom'],
            'object_weights': {'red_mug': 0.3, 'book': 0.5}
        }

def main():
    rclpy.init()

    system = LLMRobotSystem(openai_api_key="your-key-here")

    # Example instructions
    instructions = [
        "Bring me the red mug from the kitchen",
        "Go to the bedroom and turn off the light",
        "Clean up the living room"
    ]

    for instr in instructions:
        system.process_instruction(instr)

    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Key Takeaways

✅ **LLMs** decompose complex instructions into robot action sequences
✅ **GPT-4** provides strong task planning and reasoning capabilities
✅ **Chain-of-thought prompting** improves plan quality and transparency
✅ **Safety validation** prevents dangerous actions before execution
✅ **Ambiguity handling** clarifies unclear instructions
✅ **ROS 2 integration** enables end-to-end language-to-action pipeline

## Next Chapter

In **Chapter 4**, we'll build a **Capstone Project**: an autonomous humanoid robot that combines voice control (Whisper), LLM planning (GPT), vision (cameras), and action execution to perform complex household tasks.

## Further Reading

- [LLMs for Robotics Survey](https://arxiv.org/abs/2311.04301)
- [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903)
- [SayCan: Grounding Language in Robotic Affordances](https://say-can.github.io/)
- [Code as Policies](https://code-as-policies.github.io/)
