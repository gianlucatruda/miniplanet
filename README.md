# Micro-Planet App

This project is a simple WebSocket server and Three.js client demonstration. The application showcases a miniature "planet" with an orbiting object rendered in the browser, leveraging Three.js, and communicates with a server via WebSockets.

## Overview

- **WebSocket Server:**  
  A simple server (located at `server/index.ts`) that listens on port 8080 and echoes messages back to the client.
- Improved server logs now leverage multiple log levels and parse new Keplerian orbital parameters.

- **Three.js Client:**  
  The client (located in `src/main.ts`) renders a 3D scene with a large green sphere (the micro-planet) and a smaller red sphere orbiting it.  
  OrbitControls have been added to allow interactive camera movement.

- **Vite & TypeScript:**  
  Vite is used for development and build processes of the client-side code. TypeScript is used throughout the project for improved code safety and clarity.

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

  - [x] Setup WebSocket server using `ws`
  - [x] Integrate basic Three.js scene with micro-planet and orbiting object
  - [x] Configure TypeScript and Vite for client development
  - [x] Add OrbitControls and PointerLockControls adjustments for refined camera behavior

- [x] **WebSocket Enhancements:**

  - [x] Broadcast messages from clients to all clients
  - [x] **Multiple Crafts:**
    - [x] Each client generates a unique craft with randomly-generated color and Keplerian orbital parameters (including eccentricity and omega)
    - [x] Animate all client crafts on each client
  - [x] Improve server logging with different logging levels and enhanced parsing of orbital parameters
  - [ ] Add error handling and reconnection logic

- [x] **Scene Enhancements:**

  - [x] Implement dynamic lighting with a moving sun and ambient light
  - [ ] Implement user-controlled camera animations (refinement pending)

- [ ] **Deployment:**

  - [ ] Setup continuous integration and deployment workflow.
  - [ ] Package as a container for cloud hosting

- [ ] **Testing & Documentation:**
  - [ ] Add unit and integration tests
  - [ ] Expand documentation and user guides

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
