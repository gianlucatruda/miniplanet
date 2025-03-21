import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Add OrbitControls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Create a micro-planet (a simple sphere) ---
const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
const planetMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const microPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(microPlanet);

// --- Create an orbiting object (to simulate orbital behavior) ---
const orbitGeometry = new THREE.SphereGeometry(1, 32, 32);
const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const orbitingObject = new THREE.Mesh(orbitGeometry, orbitMaterial);
scene.add(orbitingObject);

// Position the camera and micro-planet
camera.position.z = 20;

// --- Dummy orbital simulation ---
let angle = 0;
function animate() {
  requestAnimationFrame(animate);
  angle += 0.01;
  orbitingObject.position.x = 10 * Math.cos(angle);
  orbitingObject.position.z = 10 * Math.sin(angle);
  controls.update(); // Update controls for smooth damping effect
  renderer.render(scene, camera);
}
animate();

// --- WebSocket Connection ---
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
  console.log('WebSocket connection established');
  ws.send(JSON.stringify({ type: 'greeting', message: 'Hello from the client!' }));
};
ws.onmessage = (event) => {
  console.log('Message from server:', event.data);
};
