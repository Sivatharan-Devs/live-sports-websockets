import { WebSocket, WebSocketServer } from "ws";

// let's create a function that will send a JSON object to a specific client
// it's going to be a helper function that'll prevent repetitive JSON.stringify calls and ensure the socket is actually open before sending.
function sendJson(socket, payload) {
  // Guard function
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

// function for send data to every connected user
function broadcast(wss, payload) {
  for (const client of wss.clients) {
    // Guard function
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

// Attach the websocket logic to our node server.
export function attachWebSocketServer(server) {
  // ws function will recieve the HTTP server instance created by Express and we're passing it in to the websocket
  // so that it can attach itself to the same underlying server.
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024, //max size allowed for a single incoming websocket message
  });

  wss.on("connection", (socket) => {
    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }

  return { broadcastMatchCreated };
}
