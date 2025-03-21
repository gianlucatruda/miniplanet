# Micro-Planet App

This project is a simple WebSocket server and Three.js client demonstration. The application showcases a miniature "planet" with an orbiting object rendered in the browser, leveraging Three.js, and communicates with a server via WebSockets.

![SCR-20250321-qatp](https://github.com/user-attachments/assets/cf4d462a-f325-4393-b70e-f576c3bc5938)

![SCR-20250321-qpfo](https://github.com/user-attachments/assets/7d2109a1-f3e9-4c1a-856b-47893eda7695)


## Overview

- **WebSocket Server:**  
  A robust WebSocket server that maintains real-time synchronization of spacecraft data—including orbital and fuel parameters—across all connected clients.

- **Three.js Client & Gameplay:**  
  Experience a dynamic simulation where you pilot a spacecraft in a miniature solar system. Use precise orbital burns via WASD (RCS) and spacebar (main thrust) to adjust your trajectory while tracking your fuel consumption in real time. Interact with other players as your craft orbits a vividly rendered micro-planet under dynamic lighting, enhanced by both OrbitControls and custom drag-based rotation.

- **Development Environment:**  
  Built with Vite and TypeScript, this project emphasizes rapid development, robust type checking, and a modular architecture.

## Installation and Running

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the project in development mode:**

   This concurrently starts the WebSocket server and Vite dev server.

   ```bash
   npm run start
   ```

   - The Vite dev server will serve the client at [http://localhost:5173](http://localhost:5173).
   - The WebSocket server will run on port 8080.

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview the production build:**

   ```bash
   npm run preview
   ```

## Roadmap

- [x] **Initial Setup:**  
  - [x] Establish a WebSocket server for real-time communication.
  - [x] Build a basic Three.js scene featuring a micro-planet and a simple orbiting craft.
  - [x] Configure development environment with Vite and TypeScript.

- [x] **Core Mechanics & Client Features:**  
  - [x] Integrate OrbitControls and custom drag-based rotation for intuitive camera handling.
  - [x] Implement craft registration and communication between multiple clients.
  - [x] Enhance server logging with multiple log levels and detailed Keplerian parameter parsing.

- [ ] **Gameplay Enhancements & Orbital Mechanics:**  
  - [ ] Implement full orbital burn mechanics using WASD (RCS) and Spacebar (main thrust), complete with fuel tracking.
  - [ ] Synchronize orbital updates and fuel consumption between clients via periodic server broadcasts.
  - [ ] Optimize orbital parameter recalculation and dynamic orbit redrawing.

- [ ] **Scene & UI Improvements:**  
  - [ ] Refine visual effects with dynamic lighting and particle effects.
  - [ ] Enhance in-game UI elements for tracking fuel, velocity, and other key parameters.

- [ ] **Deployment & Testing:**  
  - [ ] Setup continuous integration and deployment workflows.
  - [ ] Package the application for cloud hosting.
  - [ ] Expand unit and integration tests, and improve documentation.

## Goals and Choices

- **Choice of Technologies:**

  - **ws:** for a lightweight WebSocket server.
  - **Three.js:** for powerful and accessible WebGL-based 3D rendering.
  - **Vite:** for a fast, modern development and build pipeline.
  - **TypeScript:** for improved code reliability and development tooling.

- **Project Goals:**  
  This project serves as both a proof-of-concept for real-time WebSocket-based communication and a 3D rendering experiment using Three.js. The roadmap includes enhancements in communication, scene details, and overall build/deployment process.

## License

© 2023 Micro-Planet App  
See `LICENSE` for details.
