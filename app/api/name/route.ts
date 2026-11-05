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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  return NextResponse.json({ name: user.name})
}
