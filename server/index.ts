import { WebSocketServer, WebSocket } from 'ws';

// --- WebSocket Server Setup ---
const craftRegistrations: any[] = [];
const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });

// Store all connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.info('New client connected');
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome client!' }));

  // Send existing craft registrations to the new client
  craftRegistrations.forEach((reg) => {
    ws.send(JSON.stringify({ type: 'craftRegistration', craftData: reg }));
  });

  ws.on('message', (data) => {
    const message = data.toString();
    // Trim the message for logging if it's too long
    const trimmedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message;
    console.log(`[Client ${(ws as any).clientId || 'unknown'}] Received message: ${trimmedMessage}`);
    
    let parsed: any;
    try {
      parsed = JSON.parse(message);
    } catch (err) {
      console.error('Invalid JSON:', message);
      return;
    }

    // If it's a craft registration message, store it (if not already stored)
    if (parsed.type === 'craftRegistration' && parsed.craftData) {
      // Store client id in the WebSocket instance for later removal
      (ws as any).clientId = parsed.craftData.id;
      console.info(`[Client ${parsed.craftData.id}] Registration: Name=${parsed.craftData.name}, OrbitRadius=${parsed.craftData.orbitRadius}, OrbitSpeed=${parsed.craftData.orbitSpeed}, Eccentricity=${parsed.craftData.e}, Omega=${parsed.craftData.omega}`);

      // Check for duplicate registrations before adding.
      if (!craftRegistrations.find((reg) => reg.id === parsed.craftData.id)) {
        craftRegistrations.push(parsed.craftData);
      } else {
        console.debug(`[Client ${parsed.craftData.id}] Duplicate registration received.`);
      }
    }
    // Broadcast the message to all connected clients (including sender)
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    const clientId = (ws as any).clientId || 'unknown';
    console.info(`[Client ${clientId}] Disconnected.`);
    clients.delete(ws);

    if (clientId !== 'unknown') {
      // Remove from craftRegistrations list
      const index = craftRegistrations.findIndex(reg => reg.id === clientId);
      if (index !== -1) {
        console.info(`[Client ${clientId}] Removing registration.`);
        craftRegistrations.splice(index, 1);
      }
      // Broadcast craft removal message to all connected clients
      const removalMessage = JSON.stringify({
        type: 'craftRemoval',
        craftId: clientId
      });
      console.warn(`[Broadcast] Craft removal for client ${clientId}.`);
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(removalMessage);
        }
      });
    }
  });
});

// Function to broadcast messages to all clients
function broadcastMessage(message: string, sender: WebSocket) {
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

console.info(`WebSocket server is running on ws://localhost:${PORT}`);
