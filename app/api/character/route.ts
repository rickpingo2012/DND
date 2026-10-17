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
    const session = await auth.api.getSession({
      headers: await headers();
    });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Cannot create character. Log in to create.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    const newCharacter = await prisma.character.create({
      data: {
        name: body.name,
        race: body.race,
        class: body.className,
        level: body.level,
        xp: body.xp,
        background: body.background,
        playerName: body.playerName,
        userId: userId,
        stats: {
          create: {
            strength: body.strength,
            dexterity: body.dexterity,
            constitution: body.constitution,
            intelligence: body.intelligence,
            wisdom: body.wisdom,
            charisma: body.charisma,
          }
        },
        combat: {
          create: {
            maxHp: body.maxHp,
            hp: body.maxHp,
            armorClass: body.armorClass,
            initiative: Math.floor((body.dexterity - 10) / 2),
            speed: body.speed,
            proficiencyBonus: body.proficiencyBonus,
          }
        }
      },
      include: {
        stats: true,
        combat: true,
      }
    });

    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error on create new character' }, { status: 400 });
  }
}
