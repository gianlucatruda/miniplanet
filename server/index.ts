import { WebSocketServer, WebSocket } from 'ws';

// --- WebSocket Server Setup ---
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Store all connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome client!' }));

  ws.on('message', (data) => {
    console.log('Received message:', data);
    
    // Broadcast the message to all connected clients
    const message = data.toString();
    broadcastMessage(message, ws);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
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
