import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')
  const limit = parseInt(searchParams.get('limit') || '100', 10)

  const sessions = await prisma.studySession.findMany({
    where: { userId: DEFAULT_USER_ID, ...(subjectId ? { subjectId } : {}) },
    orderBy: { date: 'desc' },
    take: limit,
    include: { subject: { select: { name: true, color: true } } },
  })

  return NextResponse.json(sessions)
}

export async function POST(req) {
  const body = await req.json()
  const session = await prisma.studySession.create({
    data: { ...body, userId: DEFAULT_USER_ID },
  })

  return NextResponse.json(session)
}
