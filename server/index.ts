import { WebSocketServer, WebSocket } from 'ws';

// --- WebSocket Server Setup ---
const craftRegistrations: any[] = [];
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Store all connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome client!' }));

  // Send existing craft registrations to the new client
  craftRegistrations.forEach((reg) => {
    ws.send(JSON.stringify({ type: 'craftRegistration', craftData: reg }));
  });

  ws.on('message', (data) => {
    console.log('Received message:', data);
    
    const message = data.toString();
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
      
      // Optional: check for duplicate registrations before adding.
      if (!craftRegistrations.find((reg) => reg.id === parsed.craftData.id)) {
        craftRegistrations.push(parsed.craftData);
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
    console.log('Client disconnected');
    clients.delete(ws);
    const clientId = (ws as any).clientId;
    if (clientId) {
      // Remove from craftRegistrations list
      const index = craftRegistrations.findIndex(reg => reg.id === clientId);
      if (index !== -1) {
        craftRegistrations.splice(index, 1);
      }
      // Broadcast craft removal message to all connected clients
      const removalMessage = JSON.stringify({
        type: 'craftRemoval',
        craftId: clientId
      });
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

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
