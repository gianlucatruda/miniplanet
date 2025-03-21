import { WebSocketServer } from 'ws';

// --- WebSocket Server Setup ---
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome client!' }));

  ws.on('message', (data) => {
    console.log('Received message:', data);
    // Echo received message back to the sender
    ws.send(JSON.stringify({ type: 'echo', message: `Server received: ${data}` }));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
