"""
Chat Service with Fallback Responses
"""
import secrets
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.chat import ChatSession, ChatMessage
from app.utils.gemini_client import get_chat_model


class ChatService:
    """Service for managing chat sessions and messages"""

    def __init__(self, db: Session):
        self.db = db
        self.chat_model = get_chat_model()

    async def create_session(self) -> ChatSession:
        """Create a new chat session"""
        session_token = secrets.token_urlsafe(32)

        session = ChatSession(
            session_token=session_token,
            is_active=True
        )

        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)

        return session

    async def get_session(self, session_token: str) -> Optional[ChatSession]:
        """Get session by token"""
        result = await self.db.execute(
            select(ChatSession).filter(
                ChatSession.session_token == session_token,
                ChatSession.is_active == True
            )
        )
        return result.scalar_one_or_none()

    def get_fallback_response(self, user_message: str) -> str:
        """Generate fallback response when API is unavailable"""
        message_lower = user_message.lower()

        # ROS 2 questions
        if "ros 2" in message_lower or "ros2" in message_lower:
            if "install" in message_lower:
                return """To install ROS 2:

1. **Choose your ROS 2 distribution** (Humble, Iron, or Jazzy recommended)
2. **Add the ROS 2 apt repository**:
   ```bash
   sudo apt update && sudo apt install software-properties-common
   sudo add-apt-repository universe
   ```
3. **Install ROS 2**:
   ```bash
   sudo apt update
   sudo apt install ros-humble-desktop
   ```
4. **Source the setup file**:
   ```bash
   source /opt/ros/humble/setup.bash
   ```

For detailed instructions, visit: https://docs.ros.org/en/humble/Installation.html"""
            else:
                return """**ROS 2** (Robot Operating System 2) is a flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robotic platforms.

**Key features:**
- Real-time communication
- Distributed architecture
- Multiple programming language support (Python, C++)
- Built on DDS (Data Distribution Service)
- Improved security and modularity over ROS 1

Learn more at: https://docs.ros.org/en/humble/"""

        # Gazebo questions
        elif "gazebo" in message_lower:
            if "install" in message_lower:
                return """To install Gazebo:

**For Gazebo Classic:**
```bash
sudo apt update
sudo apt install gazebo11 libgazebo11-dev
```

**For Gazebo (new version):**
```bash
sudo apt-get update
sudo apt-get install lsb-release wget gnupg
sudo wget https://packages.osrfoundation.org/gazebo.gpg -O /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg
sudo apt-get install gz-harmonic
```

Visit: https://gazebosim.org/docs"""
            else:
                return """**Gazebo** is a powerful 3D robotics simulator that allows you to:
- Test robots in complex indoor/outdoor environments
- Simulate sensors (cameras, LIDAR, IMU)
- Run physics simulations
- Integrate with ROS 2

It's widely used for robot development and testing before deploying to real hardware."""

        # Unity questions
        elif "unity" in message_lower:
            return """**Unity** for robotics provides:
- High-fidelity visual simulations
- Real-time rendering
- Integration with ROS through Unity Robotics Hub
- Synthetic data generation for ML training
- Physics simulation with multiple engines

The Unity Robotics Hub connects Unity with ROS/ROS 2 for robot simulation and training."""

        # Isaac Sim questions
        elif "isaac" in message_lower:
            return """**NVIDIA Isaac Sim** is a robotics simulation platform built on Omniverse that provides:
- Photorealistic rendering
- Accurate physics simulation
- ROS/ROS 2 integration
- Synthetic data generation
- Multi-robot simulation support

It's particularly powerful for training AI models and testing perception systems."""

        # VLA / AI questions
        elif "vla" in message_lower or "vision language action" in message_lower:
            return """**Vision-Language-Action (VLA)** models are AI systems that:
- Process visual input (images/video)
- Understand natural language instructions
- Generate robot actions

Examples include:
- RT-2 (Google)
- PaLM-E
- OpenVLA

These models enable robots to follow natural language commands by understanding both what they see and what they're told to do."""

        # General greetings
        elif any(word in message_lower for word in ["hello", "hi", "hey"]):
            return "Hello! I'm your Physical AI assistant. I can help you with questions about ROS 2, Gazebo, Unity, Isaac Sim, and robotic AI systems. What would you like to know?"

        # Default response
        else:
            return f"""I'm your Physical AI & Robotics assistant. I can help with:

- **ROS 2**: Installation, concepts, and development
- **Gazebo**: Robot simulation and testing
- **Unity**: Robotics integration and visualization
- **Isaac Sim**: NVIDIA's robotics platform
- **VLA Models**: Vision-Language-Action AI systems

Ask me specific questions about any of these topics!

_(Note: Using fallback responses - get a new Gemini API key for AI-powered answers)_"""

    async def send_message(
        self,
        session_token: str,
        user_message: str,
        selected_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate response
        """
        # Get or create session
        session = await self.get_session(session_token)
        if not session:
            session = await self.create_session()

        # Save user message
        user_msg = ChatMessage(
            session_id=session.id,
            role="user",
            content=user_message
        )
        self.db.add(user_msg)
        await self.db.commit()

        # Try Gemini API first, fall back to hardcoded responses
        try:
            # Build prompt
            prompt = f"You are a helpful AI assistant for Physical AI and Robotics. Answer the following question:\n\nQuestion: {user_message}"
            if selected_text:
                prompt = f"You are a helpful AI assistant. Use the following context:\n\nContext: {selected_text}\n\nQuestion: {user_message}"

            # Try Gemini API
            response = self.chat_model.generate_content(prompt)
            assistant_content = response.text
        except Exception as e:
            # Use fallback response system
            print(f"Gemini API error (using fallback): {e}")
            assistant_content = self.get_fallback_response(user_message)

        # Save assistant message
        assistant_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=assistant_content,
            citations=[]
        )
        self.db.add(assistant_msg)
        await self.db.commit()
        await self.db.refresh(assistant_msg)

        return {
            "session_token": session.session_token,
            "message": {
                "role": "assistant",
                "content": assistant_content,
                "citations": [],
                "created_at": str(assistant_msg.created_at)
            }
        }
