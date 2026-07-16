import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const subjects = await prisma.subject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { topics: true, questions: true, sessions: true } } },
  })

  return NextResponse.json(subjects)
}

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const body = await req.json()
  const subject = await prisma.subject.create({
    data: { ...body, userId: user.id },
  })

  return NextResponse.json(subject)
}
