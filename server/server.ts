// Necessary imports to work
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// Set the server port, max players in room and the client origin
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:3000,https://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());
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
  campaignName: 'Campaign Master';
  players: Map<string, { id: string; name: string }>;
  tokens: MapElement[];
};

interface SocketData {
  roomCode?: string;
  playerName?: string;
};

interface RoomAck {
  ok: boolean;
  error?: string;
  roomCode?: string;
  room?: unknown;
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
const io = new Server<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>(server, {
  cors: {
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        CLIENT_ORIGINS.includes(origin) ||
        (process.env.NODE_ENV !== "production" && origin.endsWith(".github.dev"));
      callback(null, allowed);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// A Map to svae the rooms
const rooms = new Map<string, RoomState>();

// Transform the rooms in a common Array
function serializeRoom(room: RoomState) {
  return {
    code: room.code,
    hostId: room.hostId,
    campaignName: room.campaignName,
    players: Array.from(room.players.values()),
    tokens: room.tokens,
  };
};

// When player connect, active the Socket
io.on("connection", (socket) => {
  console.log(`[Socket] User connect: ${socket.id}`);

  // When the Host create a room, save the room in rooms
  socket.on("create_room", (payload: { playerName?: string, roomCode?: string }, ack?: (res: RoomAck) => void) => {
    const code = payload?.roomCode?.trim().toUpperCase();
    if (!code) return ack?.({ ok: false, error: "Invalid room code" });

    const playerName = payload?.playerName?.trim() || "Host";

    const room: RoomState = {
      code,
      hostId: socket.id,
      campaignName: 'Campaign Master',
      players: new Map([[socket.id, { id: socket.id, name: playerName }]]),
      tokens: [],
    };

    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = playerName;

    ack?.({ ok: true, roomCode: code, room: serializeRoom(room) });
  });

  // When some player enter in room, verify if that room exists and if the room is not full. If not, enter in room
  socket.on("join_room", (payload: { playerName?: string, roomCode?: string }, ack?: (res: RoomAck) => void) => {
    const code = payload?.roomCode?.trim().toUpperCase();
    const room = code ? rooms.get(code) : undefined;

    if (!room) return ack?.({ ok: false, error: "Room not found" });
    if (room.players.size >= MAX_PLAYERS) return ack?.({ ok: false, error: "This room is full" });

    const playerName = payload?.playerName?.trim() || `Player ${room.players.size + 1}`;
    room.players.set(socket.id, { id: socket.id, name: playerName });
    socket.join(code);
    
    console.log(`[Room] User ${socket.id} entered in room: ${code}`);
    socket.data.roomCode = code;
    socket.data.playerName = playerName;

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

    const index = room.tokens.findIndex((t) => t.id === data.mapState.id);
    if (index >= 0) {
      room.tokens[index] = data.mapState;
    } else {
      room.tokens.push(data.mapState);
    }

    socket.to(code).emit("sync_map", data.mapState);
  });

  // Delete a token on map
  socket.on("delete_token", (data: { roomCode: string; tokenId: string }) => {
    const code = data?.roomCode?.trim().toUpperCase();
    const tokenId = data?.tokenId?.trim();
    if (!code || !tokenId || !socket.rooms.has(code)) return;

    const room = rooms.get(code);
    if (!room) return;

    room.tokens = room.tokens.filter((t) => t.id !== tokenId);
    socket.to(code).emit("token_deleted", { tokenId });
  });

  // Roll a dice
  socket.on("roll_dice", (data: { roomCode?: string; sides?: number }) => {
    const roomCode = data?.roomCode?.trim().toUpperCase();
    const sides = data?.sides;
    const validSides = [4, 6, 8, 10, 12, 20, 100];
    if (!roomCode || sides === undefined || !socket.rooms.has(roomCode) || !validSides.includes(sides)) return;

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

  socket.on("update_campaign_name", (data: { roomCode: string; name: string }) => {
    const code = data?.roomCode?.trim().toUpperCase();
    if (!code || !socket.rooms.has(code)) return;

    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;

    const cleanName = String(data?.name ?? "")
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 80);

    if (!cleanName) return;

    room.campaignName = cleanName;
    io.to(code).emit("campaign_name_updated", { campaignName: cleanName });
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
