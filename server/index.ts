import { WebSocketServer, WebSocket } from "ws";

// --- WebSocket Server Setup ---
const craftRegistrations: any[] = [];
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

wss.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please ensure any previous instances are shut down.`,
    );
    process.exit(1);
  } else {
    console.error("WebSocket server error:", error);
  }
});

// Store all connected clients
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  console.info("New client connected");
  clients.add(ws);
  ws.send(JSON.stringify({ type: "welcome", message: "Welcome client!" }));

  // Send existing craft registrations to the new client
  craftRegistrations.forEach((reg) => {
    ws.send(JSON.stringify({ type: "craftRegistration", craftData: reg }));
  });

  ws.on("message", (data) => {
    const message = data.toString();
    // Trim the message for logging if it's too long
    const trimmedMessage =
      message.length > 100 ? message.substring(0, 100) + "..." : message;
    console.log(
      `[Client ${(ws as any).clientId || "unknown"}] Received message: ${trimmedMessage}`,
    );

    let parsed: any;
    try {
      parsed = JSON.parse(message);
    } catch (err) {
      console.error("Invalid JSON:", message);
      return;
    }

    // If it's a craft registration message, store it (if not already stored)
    if (parsed.type === "craftRegistration" && parsed.craftData) {
      // Store client id in the WebSocket instance for later removal
      (ws as any).clientId = parsed.craftData.id;
      console.info(
        `[Client ${parsed.craftData.id}] Registration: Name=${parsed.craftData.name}, OrbitRadius=${parsed.craftData.orbitRadius}, OrbitSpeed=${parsed.craftData.orbitSpeed}, Eccentricity=${parsed.craftData.e}, Omega=${parsed.craftData.omega}`,
      );

      // Check for duplicate registrations before adding.
      if (!craftRegistrations.find((reg) => reg.id === parsed.craftData.id)) {
        craftRegistrations.push(parsed.craftData);
      } else {
        console.debug(
          `[Client ${parsed.craftData.id}] Duplicate registration received.`,
        );
      }
    } else if (parsed.type === "craftUpdate" && parsed.craftData) {
      // Update the stored craft registration in craftRegistrations (if it exists)
      const index = craftRegistrations.findIndex(
        (reg) => reg.id === parsed.craftData.id,
      );
      if (index !== -1) {
        craftRegistrations[index] = parsed.craftData;
      }
      // Broadcast the updated parameters to all connected clients.
      const updateMsg = JSON.stringify(parsed);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(updateMsg);
        }
      });
    }
    // Broadcast the message to all connected clients (including sender)
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    const clientId = (ws as any).clientId || "unknown";
    console.info(`[Client ${clientId}] Disconnected.`);
    clients.delete(ws);

    if (clientId !== "unknown") {
      // Remove from craftRegistrations list
      const index = craftRegistrations.findIndex((reg) => reg.id === clientId);
      if (index !== -1) {
        console.info(`[Client ${clientId}] Removing registration.`);
        craftRegistrations.splice(index, 1);
      }
      // Broadcast craft removal message to all connected clients
      const removalMessage = JSON.stringify({
        type: "craftRemoval",
        craftId: clientId,
      });
      console.warn(`[Broadcast] Craft removal for client ${clientId}.`);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(removalMessage);
        }
      });
    }
  });
});

// Function to broadcast messages to all clients
function broadcastMessage(message: string, sender: WebSocket) {
  clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

console.info(`WebSocket server is running on ws://localhost:${PORT}`);

// Periodically broadcast all craft registrations to all connected clients (e.g. every 1 second)
setInterval(() => {
  const message = JSON.stringify({
    type: "craftUpdateAll",
    craftData: craftRegistrations,
  });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}, 1000);

// Setup graceful shutdown
process.on("SIGINT", () => {
  console.info("SIGINT signal received. Closing WebSocket server...");
  wss.close(() => {
    console.info("WebSocket server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received. Closing WebSocket server...");
  wss.close(() => {
    console.info("WebSocket server closed.");
    process.exit(0);
  });
});

process.on("exit", () => {
  if (wss) {
    wss.close();
    console.info("WebSocket server closed on process exit.");
  }
});
