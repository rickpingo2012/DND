// Necessary imports to work
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// Set the server port, max players in room and the client origin
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://localhost:3000";
const MAX_PLAYERS = 10;

// Interface to standardize the map elements
interface MapElement {
  id: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  type: 'hero' | 'monster' | 'animal' | 'npc';
};

// Interface to standardize the room
interface RoomState {
  code: string;
  hostId: string;
  players: Map<string, { id: string; name: string }>;
  mapState: MapElement | null;
};

// Set the express
const app = express();
app.use(cors());
app.use(express.json());

// A GET rote to verify if the system are working
app.get('/health', (_req, res) => {
  res.status(200).json({ status: "ok", rooms: rooms.size });
});

// Create the server and set the CORS
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// A Map to svae the rooms
const rooms = new Map<string, RoomState>();

// Transform the rooms in a common Array
function serializeRoom(room: RoomState) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: Array.from(room.players.values()),
    mapState: room.mapState,
  };
};

// When player connect, active the Socket
io.on("connection", (socket) => {
  console.log(`[Socket] User connect: ${socket.id}`);

  // When the Host create a room, save the room in rooms
  socket.on("create_room", (payload: { playerName?: string, roomCode?: string }, ack?: (res: any) => void) => {
    const code = payload?.roomCode?.trim().toUpperCase();
    const playerName = payload?.playerName?.trim() || "Host";

    const room: RoomState = {
      code,
      hostId: socket.id,
      players: new Map([[socket.id, { id: socket.id, name: playerName }]]),
      mapState: null,
    };

    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;

    ack?.({ ok: true, roomCode: code, room: serializeRoom(room) });
  });

  // When some player enter in room, verify if that room exists and if the room is not full. If not, enter in room
  socket.on("join_room", (payload: { playerName?: string, roomCode?: string }, ack?: (res: any) => void) => {
    const code = payload?.roomCode?.trim().toUpperCase();
    const room = code ? rooms.get(code) : undefined;

    if (!room) return ack?.({ ok: false, error: "Room not found" });
    if (room.players.size >= MAX_PLAYERS) return ack?.({ ok: false, error: "This room is full" });

    const playerName = payload?.playerName?.trim() || `Player ${room.players.size + 1}`;
    room.players.set(socket.id, { id: socket.id, name: playerName });
    socket.join(code);
    
    console.log(`[Room] User ${socket.id} entered in room: ${code}`);
    socket.data.roomCode = code;

    socket.emit("room_state", serializeRoom(room));
      io.to(code).emit("player_joined", {
        player: { id: socket.id, name: playerName },
        players: Array.from(room.players.values()),
      });

    ack?.({ ok: true, room: serializeRoom(room) });
  });

  // Send message to all players when some playee send message
  socket.on("send_message", (data: { roomCode: string; text: string }) => {
    const code = data?.roomCode?.trim().toUpperCase();
    const text = data?.text?.trim();
    if (!code || !text || !socket.rooms.has(code)) return;

    const room = rooms.get(code);
    const sender = room?.players.get(socket.id)?.name || "Player";

    io.to(code).emit("receive_message", {
      id: `${Date.now()}-${socket.id}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false,
    });
  });

  // Update map to all players
  socket.on("update_map", (data: { roomCode: string; mapState: MapElement }) => {
    const code = data?.roomCode?.trim().toUpperCase();
    if (!code || !socket.rooms.has(code) || !data?.mapState) return;

    const room = rooms.get(code);
    if (!room) return;

    room.mapState = data.mapState;
    socket.to(code).emit("sync_map", data.mapState);
  });

  // Roll a dice
  socket.on("roll_dice", ({ roomCode, sides }) => {
    const validSides = [4, 6, 8, 10, 12, 20, 100];
    if (!validSides.includes(sides)) return;

    const result = Math.floor(Math.random() * sides) + 1;
    const systemMsg = {
      id: `Sys-${result}/${Date.now()}`,
      sender: "System",
      text: `${socket.data.playerName || "Player"} rolled D${sides}: ${result}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSystem: true,
    };

    io.to(roomCode).emit("receive_message", systemMsg);
  });

  // When player disconnect, if is the Host or if was the last player, delete the room.
  socket.on("disconnect", () => {
    const code = socket.data.roomCode as string | undefined;
    console.log(`[Socket] Disconnected: ${socket.id}`);

    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    room.players.delete(socket.id);

    if (room.players.size === 0 || room.hostId === socket.id) {
      rooms.delete(code);
      return;
    }

    io.to(code).emit("player_left", {
      playerId: socket.id,
      hostId: room.hostId,
      players: Array.from(room.players.values()),
    });
  });
});

// Run the server
server.listen(PORT, () => {
  console.log(`Server running in port: ${PORT}`)
});
