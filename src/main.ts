import * as THREE from 'three';
const clock = new THREE.Clock();
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Pane } from 'tweakpane';

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
camera.updateProjectionMatrix();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Add PointerLockControls for first-person view ---
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// Variables for drag rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSensitivity = 0.005;

// Pointer lock is now only controlled by the minimap interactions
// and not automatically engaged on primary view clicks

// Handle mouse down for drag rotation
renderer.domElement.addEventListener('mousedown', (event) => {
  // Only enable dragging in the primary view area
  if (event.clientY <= window.innerHeight * 0.75 && !controls.isLocked) {
    isDragging = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
});

// Handle mouse move for drag rotation
renderer.domElement.addEventListener('mousemove', (event) => {
  if (isDragging && !controls.isLocked) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };

    // Rotate the camera based on mouse movement
    const rotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        -deltaMove.y * rotationSensitivity,
        -deltaMove.x * rotationSensitivity,
        0,
        'XYZ'
      ));
    
    controls.getObject().quaternion.premultiply(rotationQuaternion);

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
});

// Handle mouse up to stop dragging
renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
});

// Handle mouse leave to stop dragging
renderer.domElement.addEventListener('mouseleave', () => {
  isDragging = false;
});

// --- Mini-map camera: overhead view ---
const miniMapCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / (window.innerHeight / 4),
  0.1,
  2000
);
miniMapCamera.updateProjectionMatrix();
miniMapCamera.position.set(0, 100, 0);
miniMapCamera.lookAt(0, 0, 0);
// Ensure the mini-map sees both regular objects (layer 0) and the marker (layer 1)
miniMapCamera.layers.enable(0);
miniMapCamera.layers.enable(1);
// Ensure the mini-map sees layer 2 (our active player's craft)
miniMapCamera.layers.enable(2);

// --- Add mini-map controls centered on the main planet ---
const miniMapControls = new OrbitControls(miniMapCamera, renderer.domElement);
miniMapControls.target.set(0, 0, 0);
miniMapControls.update();

// Initially, disable mini-map controls
miniMapControls.enabled = false;

// Add a pointermove event listener on the renderer's canvas 
renderer.domElement.addEventListener('pointermove', (event) => {
  // Determine the vertical position of the pointer.
  // mini-map view occupies the bottom quarter of the screen.
  if (event.clientY > window.innerHeight * 0.75) {
    // Pointer is over the minimap
    miniMapControls.enabled = true;
    controls.unlock(); // Unlock pointer controls when over minimap
  } else {
    // Pointer is over the primary view
    miniMapControls.enabled = false;
  }
});

// Also update on pointerdown so that dragging begins with the right control:
renderer.domElement.addEventListener('pointerdown', (event) => {
  if (event.clientY > window.innerHeight * 0.75) {
    miniMapControls.enabled = true;
    controls.unlock(); // Unlock pointer controls when clicking on minimap
  } else {
    miniMapControls.enabled = false;
    // Don't automatically lock controls here, let the mousedown handler handle it
    // This allows for drag rotation when not locked
  }
});

// --- Create a giant planet with a more realistic, lit material ---
const planetGeometry = new THREE.SphereGeometry(20, 64, 64);  // increased radius and segments
const planetMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22, shininess: 10 });  // a natural green with some specular shine
const microPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
// microPlanet.position.y = 30;  // Planet remains centered at (0, 0, 0)
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
  orbitRadius: number; // use this as the semi-major axis (a)
  orbitSpeed: number;
  angle: number;       // will hold the current true anomaly (θ)
  color: number;
  orbitLine?: THREE.Line;
  e: number;           // eccentricity
  omega: number;       // argument of periapsis
  thrusterFuel?: number; // fuel for directional burns
  mainFuel?: number;     // fuel for primary engine
}

const craftRegistry = new Map<string, Craft>();

// Global variable to track previous position of our craft
let prevCraftPosition = new THREE.Vector3();

// Generate a random color
function getRandomColor(): number {
  return Math.random() * 0xffffff;
}

// Generate a random orbit radius between 25 and 35
function getRandomOrbitRadius(): number {
  // Ensure orbits are at least 1.5x the planet's radius (20 x 1.5 = 30)
  return 30 + Math.random() * 10; // Orbit radii between 30 and 40 units
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
  sprite.scale.set(6, 6, 1);  // bigger red X for mini-map
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
  sprite.layers.set(1); // label visible only in mini-map (primary camera disables layer 1)
  // Scale sprite based on canvas dimensions
  sprite.scale.set(canvas.width / 5, canvas.height / 5, 1);
  return sprite;
}

function createOrbitLine(a: number, e: number, omega: number): THREE.Line {
  const segments = 64;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;  // parameter in the orbital plane
    // Elliptical orbit equation: r = a(1-e²)/(1+e cos(theta))
    const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
    // Rotate the orbit by ω: add omega to the polar angle.
    const x = r * Math.cos(theta + omega);
    const z = r * Math.sin(theta + omega);
    positions[i * 3] = x;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = z;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true
  });
  return new THREE.LineLoop(geometry, material);
}

// Create a new craft with the given ID and parameters
function createCraft(id: string, name: string, color: number, a: number, orbitSpeed: number, e: number, omega: number): Craft {
  // Create a small craft mesh.
  const craftGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const craftMaterial = new THREE.MeshBasicMaterial({ color });
  const craftMesh = new THREE.Mesh(craftGeometry, craftMaterial);
  scene.add(craftMesh);

  // Create and add a label (will only appear in the mini‑map).
  const label = createLabelSprite(name);
  label.position.set(0, 0.8, 0);
  craftMesh.add(label);

  // Create the orbit line using the new parameters.
  const orbitLine = createOrbitLine(a, e, omega);
  scene.add(orbitLine);

  // Generate an initial true anomaly.
  const initialTrueAnomaly = Math.random() * Math.PI * 2;

  return {
    id,
    mesh: craftMesh,
    orbitRadius: a,
    orbitSpeed,
    angle: initialTrueAnomaly,
    color,
    e,
    omega,
    orbitLine
  };
}

// Generate a unique client ID
const clientId = 'client_' + Math.random().toString(36).substr(2, 9);

// Create our own craft with Keplerian parameters
const myCraft = {
  id: clientId,
  name: generateRandomName(),
  color: getRandomColor(),
  orbitRadius: getRandomOrbitRadius(),  // This is our semi-major axis, "a"
  orbitSpeed: getRandomOrbitSpeed(),      // Δ true anomaly per frame (simplified)
  e: Math.random() * 0.1,                 // Eccentricity: small (0 to 0.1)
  omega: Math.random() * Math.PI * 2,       // Argument of periapsis (ω)
  thrusterFuel: 100,  // Fuel for directional burns (WASD)
  mainFuel: 100       // Fuel for the primary engine burn (Space)
};

// Create a dedicated container for Tweakpane with a high z-index.
const tweakpaneContainer = document.createElement('div');
tweakpaneContainer.style.position = 'absolute';
tweakpaneContainer.style.top = '0';
tweakpaneContainer.style.right = '0';
tweakpaneContainer.style.zIndex = '10000';  // ensure this is above the WebGL canvas
document.body.appendChild(tweakpaneContainer);

const pane = new Pane({
  title: 'Player Info',
  container: tweakpaneContainer,
});

// Add control settings to the pane
const controlsFolder = pane.addFolder({
  title: 'Controls',
});
controlsFolder.addInput({ rotationSensitivity }, 'rotationSensitivity', {
  min: 0.001,
  max: 0.01,
  step: 0.001,
  label: 'Drag Sensitivity'
});
const craftParams = {
  name: myCraft.name,
  a: myCraft.orbitRadius,
  orbitSpeed: myCraft.orbitSpeed,
  angle: 0,
  e: myCraft.e,
  omega: myCraft.omega
};
const folder = pane.addFolder({
  title: 'Craft Parameters',
});
folder.addMonitor(craftParams, 'name');
folder.addMonitor(craftParams, 'a', { min: 30, max: 50 });
folder.addMonitor(craftParams, 'orbitSpeed', { min: 0.001, max: 0.01 });
folder.addMonitor(craftParams, 'angle', { min: 0, max: Math.PI * 2 });
folder.addMonitor(craftParams, 'e', { min: 0, max: 0.1 });
folder.addMonitor(craftParams, 'omega', { min: 0, max: Math.PI * 2 });
folder.addMonitor(myCraft, 'thrusterFuel', { label: 'Thruster Fuel' });
folder.addMonitor(myCraft, 'mainFuel', { label: 'Main Fuel' });

// Track key states for burn controls
const keysPressed: Record<string, boolean> = {};

window.addEventListener('keydown', (event: KeyboardEvent) => {
  keysPressed[event.code] = true;
});

window.addEventListener('keyup', (event: KeyboardEvent) => {
  keysPressed[event.code] = false;
});

function applyBurns(craft: Craft, deltaTime: number) {
  // Scale factors for burn strength (tweak as necessary)
  const burnIncrement = 0.0005 * deltaTime;      // For tangential (W/S) burns
  const rotationIncrement = 0.0005 * deltaTime;    // For lateral (A/D) burns
  const mainBurnIncrement = 0.01;                  // Direct addition for semi‑major axis

  // WASD thruster burns (only if sufficient thruster fuel remains)
  if (keysPressed['KeyW'] && craft.thrusterFuel > 0) {
    // A prograde burn to increase orbital speed (simplistically increasing orbitSpeed)
    craft.orbitSpeed += burnIncrement;
    craft.thrusterFuel = Math.max(0, craft.thrusterFuel - burnIncrement * 1000);
  }
  if (keysPressed['KeyS'] && craft.thrusterFuel > 0) {
    // A retrograde burn to decrease orbital speed (caution: don't go negative)
    craft.orbitSpeed = Math.max(0, craft.orbitSpeed - burnIncrement);
    craft.thrusterFuel = Math.max(0, craft.thrusterFuel - burnIncrement * 1000);
  }
  if (keysPressed['KeyA'] && craft.thrusterFuel > 0) {
    // Adjust orbit orientation counter-clockwise (decrease omega)
    craft.omega -= rotationIncrement;
    craft.thrusterFuel = Math.max(0, craft.thrusterFuel - rotationIncrement * 1000);
  }
  if (keysPressed['KeyD'] && craft.thrusterFuel > 0) {
    // Adjust orbit orientation clockwise (increase omega)
    craft.omega += rotationIncrement;
    craft.thrusterFuel = Math.max(0, craft.thrusterFuel - rotationIncrement * 1000);
  }
  
  // Spacebar primary engine burn: Increase orbital energy (and hence 'a')
  if (keysPressed['Space'] && craft.mainFuel > 0) {
    craft.orbitRadius += mainBurnIncrement;
    craft.mainFuel = Math.max(0, craft.mainFuel - 0.1);
  }

  // Redraw orbit: remove the old orbit line (if any) and generate a new one.
  if (craft.orbitLine) {
    scene.remove(craft.orbitLine);
  }
  craft.orbitLine = createOrbitLine(craft.orbitRadius, craft.e, craft.omega);
  scene.add(craft.orbitLine);
}

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
  
  // Compute time elapsed since last frame
  const delta = clock.getDelta();

  // Get our own craft from the registry and apply burns
  const ourCraft = craftRegistry.get(clientId);
  if (ourCraft) {
    applyBurns(ourCraft, delta);
    craftParams.a = ourCraft.orbitRadius; // Update the Tweakpane monitor for orbit radius.
  }
  
  // Update all crafts in the registry
  craftRegistry.forEach(craft => {
    // Update the true anomaly.
    craft.angle += craft.orbitSpeed;
    // Compute the instantaneous radius using the ellipse equation:
    const r = craft.orbitRadius * (1 - craft.e * craft.e) / (1 + craft.e * Math.cos(craft.angle));
    // Compute the position in the orbital plane (equatorial, so y = 0)
    const newX = r * Math.cos(craft.angle + craft.omega);
    const newZ = r * Math.sin(craft.angle + craft.omega);
    craft.mesh.position.set(newX, 0, newZ);

    // Approximate the tangent vector via finite differences.
    const deltaAngle = 0.001;
    const r2 = craft.orbitRadius * (1 - craft.e * craft.e) / (1 + craft.e * Math.cos(craft.angle + deltaAngle));
    const newX2 = r2 * Math.cos(craft.angle + deltaAngle + craft.omega);
    const newZ2 = r2 * Math.sin(craft.angle + deltaAngle + craft.omega);
    const pos1 = new THREE.Vector3(newX, 0, newZ);
    const pos2 = new THREE.Vector3(newX2, 0, newZ2);
    const tangent = pos2.sub(pos1).normalize();

    // Make the craft face the direction of motion.
    craft.mesh.lookAt(new THREE.Vector3().addVectors(craft.mesh.position, tangent));
  });
  
  // Update additional craft parameters and primary view position using the already-declared ourCraft
  if (ourCraft) {
    craftParams.angle = ourCraft.angle;
    
    // Primary view: update controls object position to our craft's position
    controls.getObject().position.copy(ourCraft.mesh.position);
  }
  
  miniMapControls.update(); // Only update minimap controls
  
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
  miniMapControls.update();
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
    myCraft.orbitSpeed,
    myCraft.e,
    myCraft.omega
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
          craftData.orbitSpeed,
          craftData.e || 0,  // Handle older clients that might not send e
          craftData.omega || 0  // Handle older clients that might not send omega
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
        if (craft.orbitLine) {
          scene.remove(craft.orbitLine);
        }
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
