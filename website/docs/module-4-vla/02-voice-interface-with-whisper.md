---
id: 02-voice-interface-with-whisper
title: "Voice Interface with Whisper"
module: "vla"
chapter: 2
estimated_reading_time: 25
difficulty: "intermediate"
keywords: ["whisper", "speech-recognition", "voice-interface", "multilingual", "audio-processing"]
---

# Voice Interface with Whisper

OpenAI Whisper provides state-of-the-art speech recognition for robotics applications. This chapter covers integrating Whisper for voice commands, multilingual support, real-time audio processing, and building complete voice-controlled robot systems.

## OpenAI Whisper Overview

### What is Whisper?

**Whisper** is an automatic speech recognition (ASR) system trained on 680,000 hours of multilingual data from the web.

**Key Features:**
- **Multilingual**: Supports 99 languages
- **Robust**: Works with accents, background noise, technical terms
- **Fast**: Real-time capable on GPU
- **Open-source**: Apache 2.0 license

### Model Sizes

| Model | Parameters | VRAM | Speed (RTX 3090) | Accuracy |
|-------|------------|------|------------------|----------|
| **tiny** | 39M | 1 GB | 32x real-time | ~85% WER |
| **base** | 74M | 1 GB | 16x real-time | ~80% WER |
| **small** | 244M | 2 GB | 6x real-time | ~75% WER |
| **medium** | 769M | 5 GB | 2x real-time | ~70% WER |
| **large** | 1550M | 10 GB | 1x real-time | ~65% WER |

**WER = Word Error Rate (lower is better)**

**For robotics:** `small` or `medium` balances accuracy and speed.

## Installation and Setup

### Install Whisper

```bash
# Install OpenAI Whisper
pip install -U openai-whisper

# Install audio processing libraries
pip install sounddevice soundfile numpy

# Optional: Install ffmpeg for audio format support
# Ubuntu:
sudo apt install ffmpeg
# macOS:
brew install ffmpeg
```

### Quick Test

```python
# test_whisper.py
import whisper

# Load model
model = whisper.load_model("base")

# Transcribe audio file
result = model.transcribe("audio.mp3")

print(result["text"])
# Output: "Hello, robot. Please pick up the red block."
```

## Speech-to-Text for Robot Commands

### Real-Time Audio Capture

```python
# audio_capture.py
import sounddevice as sd
import numpy as np
import whisper
import queue
import threading

class AudioCapture:
    def __init__(self, model_size="base"):
        self.model = whisper.load_model(model_size)
        self.sample_rate = 16000  # Whisper requires 16kHz
        self.audio_queue = queue.Queue()
        self.is_recording = False

    def audio_callback(self, indata, frames, time, status):
        """Called for each audio block"""
        if status:
            print(f"Audio status: {status}")
        self.audio_queue.put(indata.copy())

    def start_recording(self, duration=5):
        """Record audio for specified duration"""
        self.is_recording = True
        self.audio_queue = queue.Queue()  # Clear queue

        # Start recording in background
        with sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            callback=self.audio_callback
        ):
            sd.sleep(int(duration * 1000))

        # Collect audio from queue
        audio_data = []
        while not self.audio_queue.empty():
            audio_data.append(self.audio_queue.get())

        audio = np.concatenate(audio_data, axis=0).flatten()
        return audio

    def transcribe(self, audio):
        """Transcribe audio to text"""
        result = self.model.transcribe(audio, fp16=False)
        return result["text"]

# Usage
capture = AudioCapture(model_size="small")

print("Recording... (speak now)")
audio = capture.start_recording(duration=5)

print("Transcribing...")
text = capture.transcribe(audio)

print(f"You said: {text}")
```

### Voice-Activated Recording

```python
# voice_activated.py
import numpy as np

class VoiceActivatedRecorder:
    def __init__(self, model_size="base", threshold=0.02):
        self.model = whisper.load_model(model_size)
        self.threshold = threshold  # Voice detection threshold
        self.sample_rate = 16000

    def is_speech(self, audio_chunk):
        """Detect if audio contains speech (simple energy-based)"""
        rms = np.sqrt(np.mean(audio_chunk**2))
        return rms > self.threshold

    def record_until_silence(self, silence_duration=2.0):
        """Record audio until silence detected"""
        audio_buffer = []
        silence_counter = 0
        silence_threshold = int(silence_duration * self.sample_rate / 1024)

        print("Listening... (speak when ready)")

        def callback(indata, frames, time, status):
            nonlocal silence_counter

            if self.is_speech(indata):
                audio_buffer.append(indata.copy())
                silence_counter = 0
                if not audio_buffer or len(audio_buffer) == 1:
                    print("Speech detected!")
            else:
                if audio_buffer:  # Only count silence after speech started
                    silence_counter += 1

        with sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            callback=callback
        ):
            # Wait for silence after speech
            while silence_counter < silence_threshold:
                sd.sleep(100)

        print("Recording complete.")
        return np.concatenate(audio_buffer, axis=0).flatten() if audio_buffer else np.array([])

    def listen_and_transcribe(self):
        """Voice-activated listening and transcription"""
        audio = self.record_until_silence()

        if len(audio) > self.sample_rate:  # At least 1 second
            result = self.model.transcribe(audio, fp16=False)
            return result["text"]
        else:
            return ""

# Usage
recorder = VoiceActivatedRecorder(model_size="small")

while True:
    command = recorder.listen_and_transcribe()
    if command:
        print(f"Command: {command}")

        if "stop" in command.lower():
            break
```

## Multi-Language Support

### Automatic Language Detection

```python
# multilingual_transcription.py
def transcribe_multilingual(audio, model):
    """Transcribe with automatic language detection"""
    result = model.transcribe(audio, task="transcribe")

    detected_language = result["language"]
    text = result["text"]

    print(f"Detected language: {detected_language}")
    print(f"Transcription: {text}")

    return text, detected_language

# Supports: en, es, fr, de, zh, ja, ar, hi, ur, and 90+ more
```

### Translation to English

```python
def transcribe_and_translate(audio, model):
    """Transcribe non-English audio and translate to English"""
    result = model.transcribe(audio, task="translate")  # Translates to English

    original_language = result["language"]
    english_text = result["text"]

    print(f"Original language: {original_language}")
    print(f"English translation: {english_text}")

    return english_text

# Example:
# Input (Spanish): "Recoge el bloque rojo"
# Output (English): "Pick up the red block"
```

### Language-Specific Commands

```python
# language_commands.py
class MultilingualCommandParser:
    def __init__(self, model_size="small"):
        self.model = whisper.load_model(model_size)

        # Define command keywords per language
        self.commands = {
            "en": {"pick": "pick", "place": "place", "move": "move", "stop": "stop"},
            "es": {"pick": "recoger", "place": "colocar", "move": "mover", "stop": "detener"},
            "fr": {"pick": "prendre", "place": "placer", "move": "déplacer", "stop": "arrêter"},
            "zh": {"pick": "拿起", "place": "放置", "move": "移动", "stop": "停止"}
        }

    def parse_command(self, audio):
        """Parse command from audio"""
        result = self.model.transcribe(audio)
        text = result["text"].lower()
        language = result["language"]

        # Extract command
        for cmd_type, keyword in self.commands.get(language, {}).items():
            if keyword in text:
                return cmd_type, text

        return None, text

# Usage
parser = MultilingualCommandParser()
command_type, full_text = parser.parse_command(audio)

if command_type == "pick":
    print("Executing pick command")
    robot.pick()
```

## Real-Time Audio Processing

### Streaming Transcription

```python
# streaming_transcription.py
import time

class StreamingTranscriber:
    def __init__(self, model_size="base", chunk_duration=2.0):
        self.model = whisper.load_model(model_size)
        self.chunk_duration = chunk_duration
        self.sample_rate = 16000
        self.audio_buffer = []

    def process_audio_stream(self, callback):
        """Process audio in real-time chunks"""
        def audio_callback(indata, frames, time_info, status):
            self.audio_buffer.append(indata.copy())

            # Process when buffer reaches chunk_duration
            buffer_duration = len(self.audio_buffer) * frames / self.sample_rate

            if buffer_duration >= self.chunk_duration:
                audio_chunk = np.concatenate(self.audio_buffer, axis=0).flatten()
                self.audio_buffer = []  # Clear buffer

                # Transcribe in separate thread to avoid blocking
                threading.Thread(
                    target=self._transcribe_and_callback,
                    args=(audio_chunk, callback)
                ).start()

        with sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            callback=audio_callback
        ):
            print("Streaming... (press Ctrl+C to stop)")
            try:
                while True:
                    sd.sleep(100)
            except KeyboardInterrupt:
                print("Stopped.")

    def _transcribe_and_callback(self, audio, callback):
        """Transcribe and call user callback"""
        result = self.model.transcribe(audio, fp16=False)
        text = result["text"].strip()

        if text:
            callback(text)

# Usage
def on_transcription(text):
    print(f"[{time.strftime('%H:%M:%S')}] {text}")

    # Send to robot
    robot.process_command(text)

transcriber = StreamingTranscriber(model_size="small", chunk_duration=3.0)
transcriber.process_audio_stream(callback=on_transcription)
```

### Optimizing Latency

```python
# low_latency_whisper.py
import torch

class LowLatencyWhisper:
    def __init__(self, model_size="base"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = whisper.load_model(model_size).to(self.device)

        # Enable optimizations
        if self.device == "cuda":
            self.model = self.model.half()  # FP16 for speed

    def transcribe_fast(self, audio):
        """Fast transcription with optimizations"""
        # Use beam size 1 for speed (less accurate but faster)
        result = self.model.transcribe(
            audio,
            fp16=(self.device == "cuda"),
            beam_size=1,  # Default is 5
            best_of=1,    # Default is 5
            temperature=0  # Greedy decoding
        )

        return result["text"]

# Speedup: 2-3x faster with beam_size=1
```

## Integration with ROS 2

### Whisper ROS 2 Node

```python
# whisper_ros2_node.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from audio_common_msgs.msg import AudioData
import whisper
import numpy as np

class WhisperNode(Node):
    def __init__(self):
        super().__init__('whisper_node')

        # Load Whisper model
        model_size = self.declare_parameter('model_size', 'base').value
        self.model = whisper.load_model(model_size)

        # Subscribe to audio
        self.audio_sub = self.create_subscription(
            AudioData,
            '/audio',
            self.audio_callback,
            10
        )

        # Publish transcriptions
        self.text_pub = self.create_publisher(String, '/voice_command', 10)

        self.audio_buffer = []
        self.sample_rate = 16000

        self.get_logger().info(f'Whisper node started with {model_size} model')

    def audio_callback(self, msg):
        """Accumulate audio and transcribe"""
        audio_array = np.frombuffer(msg.data, dtype=np.int16).astype(np.float32) / 32768.0
        self.audio_buffer.append(audio_array)

        # Transcribe every 3 seconds
        if len(self.audio_buffer) * len(audio_array) / self.sample_rate >= 3.0:
            audio = np.concatenate(self.audio_buffer)
            self.audio_buffer = []

            # Transcribe
            result = self.model.transcribe(audio, fp16=False)
            text = result["text"].strip()

            if text:
                # Publish command
                msg = String()
                msg.data = text
                self.text_pub.publish(msg)

                self.get_logger().info(f'Voice command: {text}')

def main():
    rclpy.init()
    node = WhisperNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Launch File

```python
# whisper_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Audio capture node (from audio_common package)
        Node(
            package='audio_capture',
            executable='audio_capture_node',
            parameters=[{'format': 'wave', 'channels': 1, 'sample_rate': 16000}]
        ),

        # Whisper transcription node
        Node(
            package='robot_voice',
            executable='whisper_node',
            parameters=[{'model_size': 'small'}],
            output='screen'
        )
    ])
```

## Complete Voice-Controlled Robot Example

```python
# voice_robot_controller.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
import re

class VoiceRobotController(Node):
    def __init__(self):
        super().__init__('voice_robot_controller')

        # Subscribe to voice commands
        self.cmd_sub = self.create_subscription(
            String,
            '/voice_command',
            self.command_callback,
            10
        )

        # Publish velocity commands
        self.vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Command patterns
        self.patterns = {
            r'move forward': self.move_forward,
            r'move back': self.move_backward,
            r'turn left': self.turn_left,
            r'turn right': self.turn_right,
            r'stop': self.stop
        }

        self.get_logger().info('Voice robot controller ready')

    def command_callback(self, msg):
        """Process voice command"""
        command = msg.data.lower()
        self.get_logger().info(f'Processing: {command}')

        # Match command pattern
        for pattern, action in self.patterns.items():
            if re.search(pattern, command):
                action()
                return

        self.get_logger().warn(f'Unknown command: {command}')

    def move_forward(self):
        """Move robot forward"""
        twist = Twist()
        twist.linear.x = 0.5
        self.vel_pub.publish(twist)
        self.get_logger().info('Moving forward')

    def move_backward(self):
        """Move robot backward"""
        twist = Twist()
        twist.linear.x = -0.5
        self.vel_pub.publish(twist)
        self.get_logger().info('Moving backward')

    def turn_left(self):
        """Turn robot left"""
        twist = Twist()
        twist.angular.z = 0.5
        self.vel_pub.publish(twist)
        self.get_logger().info('Turning left')

    def turn_right(self):
        """Turn robot right"""
        twist = Twist()
        twist.angular.z = -0.5
        self.vel_pub.publish(twist)
        self.get_logger().info('Turning right')

    def stop(self):
        """Stop robot"""
        twist = Twist()
        self.vel_pub.publish(twist)
        self.get_logger().info('Stopping')

def main():
    rclpy.init()
    controller = VoiceRobotController()
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()
```

## Handling Noisy Environments

### Noise Reduction

```python
import noisereduce as nr

def denoise_audio(audio, sample_rate):
    """Apply noise reduction"""
    # Estimate noise from first 0.5 seconds
    noise_sample = audio[:int(0.5 * sample_rate)]

    # Reduce noise
    reduced_audio = nr.reduce_noise(
        y=audio,
        sr=sample_rate,
        y_noise=noise_sample,
        stationary=True
    )

    return reduced_audio
```

### Wake Word Detection

```python
# Use Porcupine for wake word ("Hey Robot")
import pvporcupine

class WakeWordDetector:
    def __init__(self, access_key):
        self.porcupine = pvporcupine.create(
            access_key=access_key,
            keywords=["computer"]  # Built-in wake word
        )

    def detect_wake_word(self, audio_chunk):
        """Returns True if wake word detected"""
        result = self.porcupine.process(audio_chunk)
        return result >= 0

# Only transcribe after wake word detected
```

## Key Takeaways

✅ **Whisper** provides robust multilingual speech recognition
✅ **Model sizes** balance accuracy vs. speed (use `small` or `medium`)
✅ **Real-time processing** via streaming and voice activation
✅ **99 languages** supported with automatic detection
✅ **ROS 2 integration** enables voice-controlled robots
✅ **Noise reduction** and **wake words** improve usability

## Next Chapter

In **Chapter 3**, we'll explore **LLM Planning & Reasoning**, using GPT and other large language models to convert natural language instructions into executable ROS 2 action sequences, with chain-of-thought prompting and safety validation.

## Further Reading

- [Whisper Paper](https://arxiv.org/abs/2212.04356)
- [Whisper GitHub](https://github.com/openai/whisper)
- [Audio Processing Guide](https://librosa.org/)
- [ROS 2 Audio Common](https://github.com/ros-perception/audio_common)
