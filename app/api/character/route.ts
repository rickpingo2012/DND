import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const characters = await prisma.character.findMany();
    return NextResponse.json(characters, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error on find characters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newCharacter = await prisma.character.create({
      data: body,
    });

    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error on create new character' }, { status: 400 });
  }
}
