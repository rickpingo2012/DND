'use server'

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

export async function generateRoomCode(length = 8): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  const arrayBytes = new Uint8Array(length);
  crypto.getRandomValues(arrayBytes);

  for (let i = 0; i < length; i++) {
    result += characters[arrayBytes[i] % characters.length];
  }
  
  return result;
}

export async function GET() {
  const roomCode = generateRoomCode();
  return NextResponse.json({ success: true, url: `/room/${roomCode}` });
}
