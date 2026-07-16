import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const subjects = await prisma.subject.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { topics: true, questions: true, sessions: true } } },
  })

  return NextResponse.json(subjects)
}

export async function POST(req) {
  const body = await req.json()
  const subject = await prisma.subject.create({
    data: { ...body, userId: DEFAULT_USER_ID },
  })

  return NextResponse.json(subject)
}
