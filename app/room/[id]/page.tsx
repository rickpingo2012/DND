'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../src/contexts/NotificationContext'
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

function getSocketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (configuredUrl) return configuredUrl;

  const hostname = window.location.hostname;
  const forwardedHostname = hostname.replace(/-\d+(?=\.app\.github\.dev$)/, '-3001');
  if (forwardedHostname !== hostname) {
    return `${window.location.protocol}//${forwardedHostname}`;
  }

  if (hostname.endsWith('.app.github.dev')) {
    return `${window.location.protocol}//${hostname.replace(/\.app\.github\.dev$/, '-3001.app.github.dev')}`;
  }

  if (hostname.endsWith('.github.dev')) {
    return `${window.location.protocol}//${hostname.replace(/\.github\.dev$/, '-3001.app.github.dev')}`;
  }

  return 'http://localhost:3001';
}

enum ConnStatus {
  Connecting = 'connecting',
  Disconnect = 'disconnect',
  Error = 'error',
  Idle = 'idle',
  Ready = 'ready'
};

interface Token {
  id: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  type: 'hero' | 'monster' | 'animal' | 'npc';
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.id as string;
  const { showNotification } = useNotification()
  const socketRef = useRef<Socket | null>(null);
  const [roomStatus, setRoomStatus] = useState<{ roomCode: string; status?: string, errorMsg?: string } | null>(null);
  const isRoomReady = roomStatus?.roomCode === roomCode && !(roomStatus.status === ConnStatus.Error);
  const roomError = roomStatus?.roomCode === roomCode ? roomStatus?.errorMsg : undefined;
  
  // Set the clicked cell id
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  
  // Configs os battle map (8x8)
  const gridSize = 8;
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: '1',
      name: 'Goblin',
      imageUrl: 'https://via.placeholder.com/40/ef4444/ffffff?text=G',
      x: 5,
      y: 5,
      type: 'monster',
    },
  ]);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);

  // Chat Mockup
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'System', text: 'Welcome to the encounter! Roll for initiative.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const [newToken, setNewToken] = useState<{
    name: string;
    image: string;
    type: Token['type'];
  }>({
    name: '',
    image: '',
    type: 'hero',
  });

  const handleReceiveMessage = (data: ChatMessage) => {
    setMessages((prev) => [...prev, data]);
  };

  const handleSyncMap = (updatedToken: Token) => {
    setTokens((prev) => {
      const exists = prev.some((t) => t.id === updatedToken.id);
      if (exists) {
        return prev.map((t) => (t.id === updatedToken.id ? updatedToken : t));
      }
      
      return [...prev, updatedToken];
    });
  };

  useEffect(() => {
    let active = true;
    let playerName = 'Player';
    let connStatus: ConnStatus = ConnStatus.Idle;
    let joinedSocketId: string | null = null;
    const socket = io(getSocketUrl(), { autoConnect: false, withCredentials: true });
    socketRef.current = socket;

    const handleRoomAck = (result: { ok?: boolean; error?: string }) => {
      if (!active) return;

      if (!result?.ok) {
        setRoomStatus({ roomCode, status: result?.error ?? 'Não foi possível entrar na sala.' });
        return;
      }

      setRoomStatus({ roomCode, connStatus });
    };

    const enterRoom = () => {
      if (!active || !socket.connected || !socket.id || !playerName || joinedSocketId === socket.id) return;
      connStatus = ConnStatus.Connecting;
      joinedSocketId = socket.id;
      setRoomStatus({ roomCode, connStatus });
      
      const isHost = sessionStorage.getItem('isHost') === 'true';
      const action = isHost ? 'create_room' : 'join_room';
      
      connStatus = ConnStatus.Idle;
      socket.emit(action, { playerName, roomCode }, handleRoomAck);
    };

    const handleConnectError = (error: Error) => {
      connStatus = ConnStatus.Error;
      if (active) setRoomStatus({ roomCode, status: connStatus, errorMsg: `Error on Socket IO: ${error.message}` });
      connStatus = ConnStatus.Idle;
    };

    const handleDisconnect = () => {
      joinedSocketId = null;
      connStatus = ConnStatus.Disconnect;
      if (active) setRoomStatus({ roomCode, connStatus });
      connStatus = ConnStatus.Idle;
    };

    socket.on('connect', enterRoom);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('sync_map', handleSyncMap);

    async function initRoom() {
      try {
        const res = await fetch('/api/name');
        const data = await res.json();
        if (res.ok && data?.name) playerName = data.name;
      } catch {
        if (!active) return;
      }

      if (!active) return;
      enterRoom();
    };

    initRoom();
    socket.connect();

    return () => {
      active = false;
      socket.off('connect', enterRoom);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('sync_map', handleSyncMap);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [roomCode]);

  
  // Dice rolling function
  const rollDice = (sides: number) => {
    if (!isRoomReady) return;
    socketRef.current?.emit("roll_dice", { roomCode, sides })
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRoomReady || !inputMsg.trim()) return;

    socketRef.current?.emit("send_message", {
      roomCode,
      text: inputMsg,
    });
    
    setInputMsg('');
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken.name.trim()) {
      showNotification('Digit a name to character.');
      return;
    }

    const tokenToCreate: Token = {
      id: Date.now().toString(),
      name: newToken.name.trim(),
      imageUrl:
        newToken.image ||
        'https://via.placeholder.com/40/ef4444/ffffff?text=T',
      x: selectedCell?.x ?? 0,
      y: selectedCell?.y ?? 0,
      type: newToken.type,
    };

    setTokens((prev) => [...prev, tokenToCreate]);
    
    socketRef.current?.emit('update_map', {
      roomCode,
      mapState: tokenToCreate,
    });

    setNewToken({ name: '', image: '', type: 'hero' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Select a valid image file.');
      return;
    }

    const maxBytes = 500 * 1024;
    if (file.size > maxBytes) {
      showNotification('Select a file up to 500 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewToken((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-200 font-sans p-4 md:p-6 flex flex-col gap-6">
      {/* HEADER OF SESSION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#11131c] border border-slate-800 rounded-2xl p-4 md:px-6 shadow-lg">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-500/80">
            Tabletop RPG System
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-amber-500 tracking-wide">
            Campaign Master
          </h1>
        </div>

        {/* Action Button: Edit Character Sheet */}
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <a
            href="/character"
            className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium text-sm transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Character Sheet
          </a>
        </div>
      </header>

      {/* Main panel*/}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Battle map and dice roller */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Battle map */}
          <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg min-h-[420px]">
            <div className="w-full flex justify-between items-center mb-4 px-2">
              <h2 className="text-xs uppercase tracking-widest font-bold text-amber-500">
                Tactical Map Grid
              </h2>
              <span className="text-xs text-slate-400">Click a cell to target or place</span>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-8 gap-1.5 bg-[#090a0f] p-3 rounded-xl border border-slate-800/80 shadow-inner overflow-auto max-w-full">
              {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                const x = idx % gridSize;
                const y = Math.floor(idx / gridSize);
                const token = tokens.find((t) => t.x === x && t.y === y);
                const isSelected = selectedCell?.x === x && selectedCell?.y === y;

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => {
                      const clickedToken = tokens.find((t) => t.x === x && t.y === y);

                      if (selectedTokenId) {
                        setTokens((prev) =>
                          prev.map((t) => (t.id === selectedTokenId ? { ...t, x, y } : t))
                        );
                        setSelectedTokenId(null);
                        setSelectedCell(null);
                      } else if (clickedToken) {          
                        setSelectedTokenId(clickedToken.id);
                        setSelectedCell({ x, y });
                      } else {
                        setSelectedCell({ x, y });
                        setSelectedTokenId(null);
                      }

                      if (selectedTokenId) {
                        setTokens((prev) => {
                          const next = prev.map((t) => (t.id === selectedTokenId ? { ...t, x, y } : t));
                          const moved = next.find((t) => t.id === selectedTokenId);
                          if (moved && isRoomReady) {
                            socketRef.current?.emit('update_map', { roomCode, mapState: moved });
                          }
                          return next;
                        });
                        
                        setSelectedTokenId(null);
                        setSelectedCell(null);
                      };
                    }}
                    className={`w-11 h-11 md:w-14 md:h-14 rounded-lg border transition-all flex items-center justify-center relative ${
                      selectedTokenId && tokens.some((t) => t.id === selectedTokenId && t.x === x && t.y === y)
                        ? 'border-emerald-500 bg-emerald-500/20 animate-pulse'
                        : isSelected
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800/70 bg-[#131520] hover:border-slate-700'
                    }`}
                  >
                    {token && (
                      <div
                        className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-md ${
                          token.type === 'hero' ? 'border-amber-400 bg-amber-950' : 'border-red-500 bg-red-950'
                        }`}
                        title={token.name}
                      >
                        <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dice roller UI */}
          <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <h2 className="text-xs uppercase tracking-widest font-bold text-amber-500 mb-3">
              Dice Roller
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Dice buttons */}
              <div className="flex flex-wrap gap-2">
                {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                  <button
                    key={sides}
                    onClick={() => rollDice(sides)}
                    disabled={!isRoomReady}
                    className="px-3.5 py-2 rounded-xl bg-[#171926] hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-200 font-bold text-sm transition-all"
                  >
                    d{sides}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xs uppercase tracking-widest font-bold text-amber-500">
                Create a character for map
              </h2>
            </div>
            <form onSubmit={handleCreateToken} className="mt-4 pt-3 border-t border-slate-800 flex-col sm:flex-row flex gap-2">
              <input 
                type="text"
                placeholder="Write the character name"
                value={newToken?.name}
                onChange={e => setNewToken(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, image: '', type: 'hero' })}
                className="flex-1 bg-[#090a0f] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <div className="w-full sm:flex-1 flex items-center gap-2 bg-[#090a0f] border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-400">
                <label htmlFor="file-upload" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                  Select image
                </label>
                <span className="truncate text-xs">
                  {newToken?.image ? 'Imagem selecionada ✅' : 'Nenhum arquivo'}
                </span>
                <input 
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <select 

                value={newToken.type}
                onChange={(e) =>
                  setNewToken((prev) => ({
                    ...prev,
                  type: e.target.value as Token['type'],
                  }))
                }
                className="w-full bg-[#12141c] text-amber-100 border border-amber-500/30 rounded-lg px-4 py-2.5 text-sm shadow-sm transition-all duration-200 hover:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20stroke%3D%22none%22%20d%3D%220%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                
                >
                <option value="" disabled className="bg-[#12141c] text-amber-100/60">Selecione uma opção...</option>
                <option value="hero" className="bg-[#12141c] text-amber-100">Hero</option>
                <option value="npc" className="bg-[#12141c] text-amber-100">NPC</option>
                <option value="monster" className="bg-[#12141c] text-amber-100">Monster</option>
                <option value="animal" className="bg-[#12141c] text-amber-100">Animal</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
              >
                Create
              </button>
            </form>
          </div>
        </div>

        {/* Room chat */}
        <div className="lg:col-span-4 bg-[#11131c] border border-slate-800 rounded-2xl p-4 flex flex-col shadow-lg h-[600px] lg:h-auto">
          <div className="border-b border-slate-800 pb-3 mb-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-amber-500">
              Session Chat Log
            </h2>
            {roomError && <p role="alert" className="mt-2 text-xs text-red-400">{roomError}</p>}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border text-sm ${
                  msg.isSystem
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-200/90'
                    : 'bg-[#171926] border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold text-xs ${msg.isSystem ? 'text-amber-400' : 'text-slate-400'}`}>
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-slate-500" suppressHydrationWarning>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input of chat */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Send message to room..."
              className="flex-1 bg-[#090a0f] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!isRoomReady}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
