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
Start the development server:

```sh
  npm run dev
```

## 🎮 Requirements
A VR headset with WebXR support (e.g., Meta Quest, HTC Vive, Valve Index).
A powerful computer with a modern browser that supports WebXR.

## 📜 License
This project is open-source and available under the MIT license.