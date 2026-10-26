import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma'; // ajuste para o seu caminho do Prisma Client
import { auth } from '../../.../src/lib/auth';     // ajuste para a importação do Better Auth

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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
        userId: session.user.id,
        
        stats: {
          create: {
            strength: body.strength,
            dexterity: body.dexterity,
            constitution: body.constitution,
            intelligence: body.intelligence,
            wisdom: body.wisdom,
            charisma: body.charisma,
          },
        },
        
        combat: {
          create: {
            maxHp: body.maxHp,
            armorClass: body.armorClass,
            initiative: Math.floor((body.dexterity - 10) / 2),
            speed: body.speed,
            proficiencyBonus: body.proficiencyBonus,
          },
        },
      },
      include: {
        stats: true,
        combat: true,
      },
    });

    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    console.error('Error on save character: ', error);
    return NextResponse.json({ error: 'Internal error on save' }, { status: 500 });
  }
}
