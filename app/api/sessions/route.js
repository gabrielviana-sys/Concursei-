import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')
  const limit = parseInt(searchParams.get('limit') || '100', 10)

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id, ...(subjectId ? { subjectId } : {}) },
    orderBy: { date: 'desc' },
    take: limit,
    include: { subject: { select: { name: true, color: true } } },
  })

  return NextResponse.json(sessions)
}

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const body = await req.json()
  const session = await prisma.studySession.create({
    data: { ...body, userId: user.id },
  })

  return NextResponse.json(session)
}
