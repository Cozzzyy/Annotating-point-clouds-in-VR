# VR 3D Point Cloud Annotation

This project explores how Virtual Reality (VR) can make the annotation of 3D point clouds more user-friendly and efficient compared to traditional mouse and keyboard-based interfaces. The goal is to develop a proof of concept that allows users to place 3D bounding boxes around objects in a LiDAR-generated point cloud within a VR environment.

## 🚀 Features

- Annotate 3D point clouds in a VR environment.
- Interactive placement of 3D bounding boxes with hand controllers.
- Web-based implementation using open-source technologies.
- Evaluation of the usability, stability, and extensibility of the technologies.

## 🔍 Research Question

To what extent can Virtual Reality (VR) improve the user-friendliness and efficiency of annotating 3D point clouds compared to a traditional browser-based interface with mouse and keyboard?

## 🛠 Technologies Used

- React
- React Three Fiber
- Three.js (implicitly used by React Three Fiber)
- WebXR API
- Web Speech API

## 📦 Helper Libraries

- @react-three/drei (utilities for Three.js)
- @react-three/xr (wrapper for WebXR in React)
- @react-three/fiber (React bindings for Three.js)

## 📂 Project Structure

```
project-root/
│── src/
│   ├── assets/       # Static files such as models and images
│   ├── components/   # Reusable components
│   │   ├── hud/      # Heads-up display components
│   │   ├── xr/       # XR-specific components
│   ├── context/      # Context providers for global state
│   ├── hooks/        # Reusable React hooks
│   ├── scenes/       # Different scenes within the application
│   ├── types/        # TypeScript types and interfaces
│   ├── service       # API services
|   ├── utils/        # Utility functions
│   ├── index.js      # Main component
│── package.json      # Project dependencies
│── .gitignore        # Files to be ignored by Git
└── README.md         # Documentation
```
## 💻 Installation & Setup

Install the required dependencies:

```sh
  npm install
```

Start the json server:

```sh
  npm run simulateBackend
```

Start the development server:

```sh
  npm run dev
```

## 🎮 Requirements
A VR headset with WebXR support (e.g., Meta Quest 2, 3).
A powerful computer with a modern browser that supports WebXR.

## 📚 Tutorial

### VR Controller Instructions

### Movement
- **Left Joystick**: Move forward, backward, strafe left and right.
- **Right Joystick**: Move up or down, rotate left or right.

### Teleportation
- **Left Controller Trigger**: Hold to see a line on the ground indicating the teleport location. Release to teleport.

### Annotating an Object

#### Opening the HUD
- **Press X button (Left Controller)**: Opens the HUD.
- **Select "Start Labeling"**: Choose a label.
- **Default Selection**: Two-Point Annotation is selected by default.

#### Drawing a Box
1. **Position**: Stand in front of the object.
2. **Hold Right Controller Trigger**: Start from **top-left to bottom-right**.
3. **Move Diagonally**: While holding the trigger.
4. **Release Trigger**: The box enters **edit mode**.

#### Editing a Box
- **Red Corner Handles**: Resize the entire box.
- **Square Side Handles**: Adjust one side.
- **Blue Corner Handles**: Rotate the box.
- **Trigger on Box**: Move the box freely.
- **Exit Edit Mode**: Press **A button (Right Controller)**.

#### Brushing Mode
- **Sphere Representation**: The brush appears as a sphere.
- **Hover Over Points**: Points turn **yellow** when hovered.
- **Press Right Controller Trigger**: Brushes the highlighted points.
- **Press the joystick to create the box after brushing**.

### Managing Annotations
- **No Label Objects**:
    - Press **B button (Right Controller)** to exit drawing mode.
    - Click on a box to open HUD on the **Left Controller**.
    - Options: **Choose Label | Edit Box | Delete Box**

### Saving Annotations
- **Press X button (Left Controller)**: Opens the HUD.
- **Select "Exit and Save"**: Saves all annotations.

## 📜 License
This project is open-source and available under the MIT license.