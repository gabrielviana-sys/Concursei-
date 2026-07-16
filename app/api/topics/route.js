import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  const topics = await prisma.topic.findMany({
    where: { userId: user.id, ...(subjectId ? { subjectId } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { subject: { select: { name: true, color: true } }, attachments: true },
  })

  return NextResponse.json(topics)
}

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const body = await req.json()
  const topic = await prisma.topic.create({
    data: { ...body, userId: user.id },
  })

  return NextResponse.json(topic)
}
