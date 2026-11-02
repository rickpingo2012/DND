import { NextResponse } from 'next/server';

export async function GET() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let roomCode = '';
  
  const arrayBytes = new Uint8Array(8);
  crypto.getRandomValues(arrayBytes);

  for (let i = 0; i < 8; i++) {
    roomCode += characters[arrayBytes[i] % characters.length];
  }
  
  return NextResponse.json({ 
    success: true, 
    url: `/room/${roomCode}` 
  });
}
