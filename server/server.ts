import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const port = 3001;
const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`[Socket] User connect: ${socket.id}`);

  socket.on("join_room", (roomCode: string) => {
    socket.join(roomCode);
    console.log(`[Room] User ${socket.id} entered in room: ${roomCode}`);
  });

  socket.on("send_message", (data: { roomCode: string; sender: string; text: string; time: string; isSystem: boolean }) => {
    io.to(data.roomCode).emit("receive_message", {
      text: data.text,
      sender: data.sender,
      timestamp: data.time,
      isSystem: data.isSystem,
    });
  });

  socket.on("update_map", (data : { roomCode: string; mapState: { id: string; name: string; imageUrl: string; x: number, y: number, type: any } }) => {
    socket.to(data.roomCode).emit("sync_map", data.mapState);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] User disconnect: ${socket.id}`);
  })
});

server.listen(port, () => {
  console.log(`Server running in port: ${port}`)
});
