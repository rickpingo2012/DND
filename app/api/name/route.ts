import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { auth } from '../../../src/lib/auth';

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const userName = await prisma.user.findUnique({
    where: { name: session.user.name }
  })

  return NextResponse.json({ name: userName})
}
