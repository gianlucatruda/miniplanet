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

// Position the camera and micro-planet
camera.position.z = 20;

// --- Craft Registry ---
interface Craft {
  id: string;
  mesh: THREE.Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  color: number;
}

const craftRegistry = new Map<string, Craft>();

// Generate a random color
function getRandomColor(): number {
  return Math.random() * 0xffffff;
}

// Generate a random orbit radius between 7 and 15
function getRandomOrbitRadius(): number {
  return 7 + Math.random() * 8;
}

// Generate a random orbit speed
function getRandomOrbitSpeed(): number {
  return 0.005 + Math.random() * 0.015;
}

// Create a new craft with the given ID and parameters
function createCraft(id: string, color: number, orbitRadius: number, orbitSpeed: number): Craft {
  const craftGeometry = new THREE.SphereGeometry(1, 32, 32);
  const craftMaterial = new THREE.MeshBasicMaterial({ color });
  const craftMesh = new THREE.Mesh(craftGeometry, craftMaterial);
  
  scene.add(craftMesh);
  
  return {
    id,
    mesh: craftMesh,
    orbitRadius,
    orbitSpeed,
    angle: Math.random() * Math.PI * 2, // Random starting angle
    color
  };
}

// Generate a unique client ID
const clientId = 'client_' + Math.random().toString(36).substr(2, 9);

// Create our own craft
const myCraft = {
  id: clientId,
  color: getRandomColor(),
  orbitRadius: getRandomOrbitRadius(),
  orbitSpeed: getRandomOrbitSpeed()
};

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update all crafts in the registry
  craftRegistry.forEach(craft => {
    craft.angle += craft.orbitSpeed;
    craft.mesh.position.x = craft.orbitRadius * Math.cos(craft.angle);
    craft.mesh.position.z = craft.orbitRadius * Math.sin(craft.angle);
  });
  
  controls.update(); // Update controls for smooth damping effect
  renderer.render(scene, camera);
}
animate();

// --- WebSocket Connection ---
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('WebSocket connection established');
  
  // Register our craft
  const registrationMessage = {
    type: 'craftRegistration',
    craftData: myCraft
  };
  
  // Add our own craft to the registry
  const ourCraft = createCraft(
    myCraft.id,
    myCraft.color,
    myCraft.orbitRadius,
    myCraft.orbitSpeed
  );
  craftRegistry.set(myCraft.id, ourCraft);
  
  // Send our craft data to the server
  ws.send(JSON.stringify(registrationMessage));
};

ws.onmessage = (event) => {
  console.log('Message from server:', event.data);
  
  try {
    const data = JSON.parse(event.data);
    
    // Handle welcome message
    if (data.type === 'welcome') {
      console.log('Server welcome:', data.message);
    }
    // Handle craft registration from other clients
    else if (data.type === 'craftRegistration') {
      const craftData = data.craftData;
      
      // Don't add our own craft twice
      if (craftData.id !== clientId && !craftRegistry.has(craftData.id)) {
        console.log('New craft registered:', craftData.id);
        
        // Create and add the new craft to our registry
        const newCraft = createCraft(
          craftData.id,
          craftData.color,
          craftData.orbitRadius,
          craftData.orbitSpeed
        );
        
        craftRegistry.set(craftData.id, newCraft);
      }
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
};

// Handle connection errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
