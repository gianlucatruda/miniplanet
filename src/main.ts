import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function generateRandomName(): string {
  const adjectives = ['Menacing', 'Happy', 'Swift', 'Wise', 'Mighty'];
  const nouns = ['Donkey', 'Eagle', 'Lion', 'Shark', 'Tiger'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${num}`;
}

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.layers.disable(1); // already exists for red X
camera.layers.disable(2); // Hides our active player's craft from main view
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Add OrbitControls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Mini-map camera: overhead view ---
const miniMapCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / (window.innerHeight / 4),
  0.1,
  2000
);
miniMapCamera.position.set(0, 100, 0);
miniMapCamera.lookAt(0, 0, 0);
// Ensure the mini-map sees both regular objects (layer 0) and the marker (layer 1)
miniMapCamera.layers.enable(0);
miniMapCamera.layers.enable(1);
// Ensure the mini-map sees layer 2 (our active player's craft)
miniMapCamera.layers.enable(2);

// --- Create a giant planet with a more realistic, lit material ---
const planetGeometry = new THREE.SphereGeometry(20, 64, 64);  // increased radius and segments
const planetMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22, shininess: 10 });  // a natural green with some specular shine
const microPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(microPlanet);

// Position the camera and micro-planet
camera.position.z = 20;

// --- Add a moving sun as a light source ---
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Add a sun mesh to visually represent the sun
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

const playerCountDiv = document.createElement('div');
playerCountDiv.id = "playerCount";
playerCountDiv.style.position = "fixed";
playerCountDiv.style.top = "10px";
playerCountDiv.style.left = "10px";
playerCountDiv.style.padding = "5px 12px";
playerCountDiv.style.background = "rgba(0, 0, 0, 0.6)";
playerCountDiv.style.color = "#FFD700"; // gold-ish text
playerCountDiv.style.fontFamily = "Arial, sans-serif";
playerCountDiv.style.fontSize = "24px";
playerCountDiv.style.borderRadius = "8px";
playerCountDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.4)";
document.body.appendChild(playerCountDiv);

const miniMapOverlay = document.createElement('div');
miniMapOverlay.id = 'miniMapOverlay';
miniMapOverlay.style.position = 'fixed';
miniMapOverlay.style.bottom = '0';
miniMapOverlay.style.left = '0';
miniMapOverlay.style.width = '100%';
miniMapOverlay.style.height = '25%';
miniMapOverlay.style.border = '3px solid #FFD700'; // gold border for visibility
miniMapOverlay.style.pointerEvents = 'none'; // ensure it doesn't block clicks
document.body.appendChild(miniMapOverlay);

function updatePlayerCount() {
  playerCountDiv.textContent = `Players: ${craftRegistry.size}`;
}

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

// Generate a random orbit radius between 25 and 35
function getRandomOrbitRadius(): number {
  // Ensure orbits are clearly outside the giant planet (radius = 20)
  return 25 + Math.random() * 10; // Orbit radii between 25 and 35 units
}

// Generate a random orbit speed
function getRandomOrbitSpeed(): number {
  // Slower speeds: between 0.001 and 0.006
  return 0.001 + Math.random() * 0.005;
}

function createRedXMarker(): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;
  context.strokeStyle = 'red';
  context.lineWidth = 10;
  context.beginPath();
  context.moveTo(10, 10);
  context.lineTo(118, 118);
  context.moveTo(118, 10);
  context.lineTo(10, 118);
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3, 3, 1);
  // Put this marker on layer 1 so it only appears in mini-map view.
  sprite.layers.set(1);
  return sprite;
}

function createLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const fontSize = 24;
  context.font = `${fontSize}px Arial`;
  const textWidth = context.measureText(text).width;
  canvas.width = textWidth;
  canvas.height = fontSize * 1.2;
  // Redraw with proper canvas size
  context.font = `${fontSize}px Arial`;
  context.textBaseline = 'top';
  context.fillStyle = 'rgba(255, 255, 255, 1)';
  context.fillText(text, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  // Scale sprite based on canvas dimensions
  sprite.scale.set(canvas.width / 10, canvas.height / 10, 1);
  return sprite;
}

// Create a new craft with the given ID and parameters
function createCraft(id: string, name: string, color: number, orbitRadius: number, orbitSpeed: number): Craft {
  // Make the craft smaller
  const craftGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const craftMaterial = new THREE.MeshBasicMaterial({ color });
  const craftMesh = new THREE.Mesh(craftGeometry, craftMaterial);
  scene.add(craftMesh);

  // Create and add a label above the craft; adjust the offset accordingly
  const label = createLabelSprite(name);
  label.position.set(0, 0.8, 0);
  craftMesh.add(label);
  
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
  name: generateRandomName(),
  color: getRandomColor(),
  orbitRadius: getRandomOrbitRadius(),
  orbitSpeed: getRandomOrbitSpeed()
};

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update sun position in a circular orbit above the scene
  const sunAngle = Date.now() * 0.00005; // adjust speed as desired
  const sunDistance = 50;               // distance from scene center
  sunMesh.position.set(
    sunDistance * Math.cos(sunAngle),
    30,  // height of the sun
    sunDistance * Math.sin(sunAngle)
  );
  sunLight.position.copy(sunMesh.position);
  
  // Update all crafts in the registry
  craftRegistry.forEach(craft => {
    craft.angle += craft.orbitSpeed;
    craft.mesh.position.x = craft.orbitRadius * Math.cos(craft.angle);
    craft.mesh.position.z = craft.orbitRadius * Math.sin(craft.angle);
  });
  
  // Update camera target to follow our craft
  const ourCraft = craftRegistry.get(clientId);
  if (ourCraft) {
    controls.target.copy(ourCraft.mesh.position);
  }
  
  controls.update(); // Update controls for smooth damping effect
  
  // --- Render main view ---
  // Reset viewport and render full-screen main view
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, camera);
  
  // --- Render mini-map view ---
  // Define mini-map viewport dimensions: bottom quarter of the screen.
  const insetWidth = window.innerWidth;
  const insetHeight = window.innerHeight / 4;
  renderer.clearDepth(); // clear depth buffer so the mini-map is rendered on top
  renderer.setViewport(0, 0, insetWidth, insetHeight);
  renderer.setScissor(0, 0, insetWidth, insetHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, miniMapCamera);
  renderer.setScissorTest(false);
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
    myCraft.name,
    myCraft.color,
    myCraft.orbitRadius,
    myCraft.orbitSpeed
  );
  craftRegistry.set(myCraft.id, ourCraft);
  updatePlayerCount();
  
  // Hide our craft in the primary view:
  ourCraft.mesh.layers.set(2);
  
  // Add the red X marker so the active player's craft is clearly identified in the mini-map.
  const redXMarker = createRedXMarker();
  redXMarker.position.set(0, 1, 0);
  ourCraft.mesh.add(redXMarker);
  
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
          craftData.name,
          craftData.color,
          craftData.orbitRadius,
          craftData.orbitSpeed
        );
        
        craftRegistry.set(craftData.id, newCraft);
        updatePlayerCount();
      }
    }
    // Handle craft removal
    else if (data.type === 'craftRemoval') {
      const craftId = data.craftId;
      if (craftRegistry.has(craftId)) {
        const craft = craftRegistry.get(craftId)!;
        scene.remove(craft.mesh);
        craftRegistry.delete(craftId);
        updatePlayerCount();
        console.log('Removed craft:', craftId);
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
  miniMapCamera.aspect = window.innerWidth / (window.innerHeight / 4);
  miniMapCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
