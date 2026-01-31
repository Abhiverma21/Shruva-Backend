const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket logic
require("./socket")(io);

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
