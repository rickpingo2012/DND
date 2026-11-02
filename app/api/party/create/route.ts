import { NextResponse } from 'next/server';

<<<<<<< HEAD
export async function generateRoomCode(length = 8): Promise<string> {
=======
export async function GET() {
>>>>>>> 5c73bbe293b1d4fe70ff50f0336d1ab7d7e49bcd
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
