import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { auth } from '../../../src/lib/auth';

type AbilityScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

const skillDefinitions: Record<string, { ability: keyof AbilityScores; stat: string }> = {
  Acrobatics: { ability: 'dexterity', stat: 'Dex' },
  AnimalHandling: { ability: 'wisdom', stat: 'Wis' },
  Arcana: { ability: 'intelligence', stat: 'Int' },
  Athletics: { ability: 'strength', stat: 'Str' },
  Deception: { ability: 'charisma', stat: 'Cha' },
  History: { ability: 'intelligence', stat: 'Int' },
  Insight: { ability: 'wisdom', stat: 'Wis' },
  Intimidation: { ability: 'charisma', stat: 'Cha' },
  Investigation: { ability: 'intelligence', stat: 'Int' },
  Medicine: { ability: 'wisdom', stat: 'Wis' },
  Nature: { ability: 'intelligence', stat: 'Int' },
  Perception: { ability: 'wisdom', stat: 'Wis' },
  Performance: { ability: 'charisma', stat: 'Cha' },
  Persuasion: { ability: 'charisma', stat: 'Cha' },
  Religion: { ability: 'intelligence', stat: 'Int' },
  SleightOfHand: { ability: 'dexterity', stat: 'Dex' },
  Stealth: { ability: 'dexterity', stat: 'Dex' },
  Survival: { ability: 'wisdom', stat: 'Wis' },
};

const savingThrowDefinitions: Record<string, keyof AbilityScores> = {
  Strength: 'strength',
  Dexterity: 'dexterity',
  Constitution: 'constitution',
  Intelligence: 'intelligence',
  Wisdom: 'wisdom',
  Charisma: 'charisma',
};

const getModifier = (score: number) => Math.floor((score - 10) / 2);

function buildSkillData(scores: AbilityScores, savedData: unknown) {
  const savedSkills = typeof savedData === 'object' && savedData !== null
    ? savedData as Record<string, unknown>
    : {};

  return Object.fromEntries(Object.entries(skillDefinitions).map(([name, definition]) => {
    const savedSkill = savedSkills[name];
    const skillData = typeof savedSkill === 'object' && savedSkill !== null
      ? savedSkill as Record<string, unknown>
      : {};

    return [name, {
      proficient: skillData.proficient === true,
      modifier: typeof skillData.modifier === 'number'
        ? skillData.modifier
        : getModifier(scores[definition.ability] ?? 10),
      stat: definition.stat,
    }];
  }));
}

function buildSavingThrowData(scores: AbilityScores, savedData: unknown) {
  const savedThrows = typeof savedData === 'object' && savedData !== null
    ? savedData as Record<string, unknown>
    : {};

  return Object.fromEntries(Object.entries(savingThrowDefinitions).map(([name, ability]) => {
    const savedThrow = savedThrows[name];
    const throwData = typeof savedThrow === 'object' && savedThrow !== null
      ? savedThrow as Record<string, unknown>
      : {};

    return [name, {
      proficient: throwData.proficient === true,
      modifier: typeof throwData.modifier === 'number'
        ? throwData.modifier
        : getModifier(scores[ability] ?? 10),
    }];
  }));
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const abilityScores: AbilityScores = {
      strength: body.strength,
      dexterity: body.dexterity,
      constitution: body.constitution,
      intelligence: body.intelligence,
      wisdom: body.wisdom,
      charisma: body.charisma,
    };
    
    const newCharacter = await prisma.character.create({
      data: {
        name: body.name,
        race: body.race,
        class: body.className,
        level: body.level,
        xp: body.xp,
        background: body.background,
        playerName: body.playerName,
        notes: body.notes,
        userId: session.user.id,
        
        stats: {
          create: {
            strength: body.strength,
            dexterity: body.dexterity,
            constitution: body.constitution,
            intelligence: body.intelligence,
            wisdom: body.wisdom,
            charisma: body.charisma,
            skills: buildSkillData(abilityScores, body.skills),
            savingThrows: buildSavingThrowData(abilityScores, body.savingThrows),
          },
        },
        
        combat: {
          create: {
            maxHp: body.maxHp,
            hp: body.maxHp,
            tempHp: 0,
            armorClass: body.armorClass,
            initiative: Math.floor((body.dexterity - 10) / 2),
            speed: body.speed,
            proficiencyBonus: body.proficiencyBonus,
            attacks: Array.isArray(body.attacks)
              ? body.attacks
              : body.attacksName
                ? [{ name: body.attacksName, bonus: body.attacksBonus, damage: body.attacksDamage }]
                : [],
            deathSaves: {
              successes: body.deathSaves?.successes ?? 0,
              failures: body.deathSaves?.failures ?? 0,
            },
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
};

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const characters = await prisma.character.findMany({
    where: { userId: session.user.id },
    orderBy: { level: 'asc' },
    include: {
      stats: true,
      combat: true,
    },
  });

  return NextResponse.json(characters.map((character) => {
    const abilityScores: AbilityScores = {
      strength: character.stats?.strength ?? 10,
      dexterity: character.stats?.dexterity ?? 10,
      constitution: character.stats?.constitution ?? 10,
      intelligence: character.stats?.intelligence ?? 10,
      wisdom: character.stats?.wisdom ?? 10,
      charisma: character.stats?.charisma ?? 10,
    };

    return {
      ...character,
      combat: character.combat
        ? {
            ...character.combat,
            currentHp: character.combat.hp ?? character.combat.maxHp,
            tempHp: character.combat.tempHp ?? 0,
          }
        : null,
      savingThrows: buildSavingThrowData(abilityScores, character.stats?.savingThrows),
      skills: buildSkillData(abilityScores, character.stats?.skills),
      attacks: character.combat?.attacks ?? [],
      deathSaves: character.combat?.deathSaves ?? { successes: 0, failures: 0 },
    };
  }));
};
