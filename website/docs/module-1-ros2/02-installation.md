---
id: 02-installation
title: "Installing ROS 2"
sidebar_label: "2. Installation"
sidebar_position: 2
description: "Step-by-step guide to installing ROS 2 Humble on Ubuntu, Windows, and macOS"
keywords: ["ros2", "installation", "ubuntu", "setup", "humble"]
---

# Installing ROS 2

This guide will walk you through installing ROS 2 Humble Hawksbill, the latest LTS release.

## Prerequisites

### System Requirements

- **Ubuntu 22.04 (Jammy)**   (Recommended)
- **Windows 10/11** (via binary packages)
- **macOS** (via binary packages or from source)
- **4 GB RAM minimum** (8 GB+ recommended)
- **10 GB free disk space**

:::tip For Beginners
We strongly recommend **Ubuntu 22.04** for the best ROS 2 experience. If you're on Windows, consider using WSL2 (Windows Subsystem for Linux) with Ubuntu 22.04.
:::

## Installation on Ubuntu 22.04

### 1. Set UTF-8 Locale

Ensure your system uses UTF-8 encoding:

```bash
locale  # check current settings

sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

locale  # verify settings
```

### 2. Add ROS 2 APT Repository

```bash
# Ensure Ubuntu Universe repository is enabled
sudo apt install software-properties-common
sudo add-apt-repository universe

# Add ROS 2 GPG key
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

# Add repository to sources list
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### 3. Install ROS 2 Packages

Update package index and install ROS 2:

```bash
sudo apt update
sudo apt upgrade

# Desktop Install (Recommended): ROS 2, RViz, demos, tutorials
sudo apt install ros-humble-desktop

# Alternatively, Base Install (no GUI tools): Communication libraries, message packages, command line tools
# sudo apt install ros-humble-ros-base

# Development Tools (Optional but recommended)
sudo apt install ros-dev-tools
```

This will take 5-10 minutes depending on your internet speed.

### 4. Environment Setup

Source the ROS 2 setup script:

```bash
# Source ROS 2 in your current shell
source /opt/ros/humble/setup.bash

# Add to .bashrc to automatically source on every new terminal
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

### 5. Verify Installation

Test your ROS 2 installation with the demo talker-listener:

```bash
# Terminal 1 - Run talker node
ros2 run demo_nodes_cpp talker

# Terminal 2 - Run listener node (open a new terminal)
ros2 run demo_nodes_py listener
```

You should see the talker publishing messages and the listener receiving them:

```
[INFO] [1234567890.123456789] [talker]: Publishing: 'Hello World: 1'
[INFO] [1234567890.234567890] [listener]: I heard: [Hello World: 1]
```

:::success Congratulations!
If you see the messages above, ROS 2 is successfully installed!
:::

## Installation on Windows

### Using Binary Packages

1. **Install Visual Studio 2019** (Community Edition is free):
   - Include "Desktop development with C++" workload
   - Download from [Visual Studio website](https://visualstudio.microsoft.com/)

2. **Install Python 3.10**:
   ```powershell
   # Using Chocolatey
   choco install python --version=3.10.8
   ```

3. **Download ROS 2 Humble**:
   - Visit [ROS 2 Humble Windows Releases](https://github.com/ros2/ros2/releases)
   - Download `ros2-humble-*-windows-release-amd64.zip`
   - Extract to `C:\dev\ros2_humble`

4. **Setup Environment**:
   ```powershell
   C:\dev\ros2_humble\local_setup.ps1
   ```

5. **Test Installation**:
   ```powershell
   ros2 run demo_nodes_cpp talker
   ```

## Installation on macOS

:::warning Limited Support
macOS support for ROS 2 is limited. Consider using Docker or a Linux virtual machine for better compatibility.
:::

### Using Binary Packages

1. **Install Dependencies**:
   ```bash
   brew install python@3.10 cmake opencv

assimp tinyxml2 eigen pcre
   ```

2. **Download ROS 2 Humble** from the [releases page](https://github.com/ros2/ros2/releases)

3. **Extract and Source**:
   ```bash
   cd ~/ros2_humble
   . setup.bash
   ```

## Alternative: Docker Installation

Docker provides a consistent environment across all platforms:

```bash
# Pull ROS 2 Humble image
docker pull osrf/ros:humble-desktop

# Run container with GUI support (Linux)
docker run -it --rm \
    --env="DISPLAY" \
    --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
    osrf/ros:humble-desktop \
    bash

# Inside container
ros2 run demo_nodes_cpp talker
```

## Setting Up Your Workspace

After installation, create a workspace for your ROS 2 projects:

```bash
# Create workspace directory
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Build the workspace (even if empty)
colcon build

# Source the workspace
source install/setup.bash

# Add to .bashrc for convenience
echo "source ~/ros2_ws/install/setup.bash" >> ~/.bashrc
```

## Installing Additional Packages

ROS 2 has thousands of community packages. Install them as needed:

```bash
# Example: Install navigation2 stack
sudo apt install ros-humble-navigation2

# Example: Install Gazebo simulation
sudo apt install ros-humble-gazebo-ros-pkgs

# Example: Install image processing tools
sudo apt install ros-humble-image-tools ros-humble-cv-bridge
```

## Common Installation Issues

### Issue: "Unable to locate package ros-humble-desktop"

**Solution**: Ensure you've added the ROS 2 repository correctly and run `sudo apt update`.

### Issue: "bash: ros2: command not found"

**Solution**: Source the setup script:
```bash
source /opt/ros/humble/setup.bash
```

### Issue: ImportError for Python modules

**Solution**: Install Python dependencies:
```bash
sudo apt install python3-colcon-common-extensions python3-rosdep
```

### Issue: Permissions error when running nodes

**Solution**: Add user to dialout group (for serial port access):
```bash
sudo usermod -a -G dialout $USER
# Log out and log back in
```

## Development Tools

Install recommended tools for ROS 2 development:

```bash
# VSCode with ROS extensions
sudo snap install code --classic

# Terminator (multi-terminal)
sudo apt install terminator

# rosdep for dependency management
sudo apt install python3-rosdep
sudo rosdep init
rosdep update
```

## What's Next?

Now that ROS 2 is installed, we'll create your first ROS 2 node and explore the core communication patterns.

---

## Key Takeaways

- ✅ Ubuntu 22.04 is the recommended platform for ROS 2 Humble
- ✅ Use `ros-humble-desktop` for full installation with GUI tools
- ✅ Always source `/opt/ros/humble/setup.bash` before using ROS 2
- ✅ Create a workspace directory (`~/ros2_ws`) for your projects
- ✅ Test installation with demo talker-listener nodes

## Troubleshooting Resources

- [ROS 2 Humble Installation Docs](https://docs.ros.org/en/humble/Installation.html)
- [ROS Answers Forum](https://answers.ros.org/)
- [ROS Discord Community](https://discord.gg/ros)
