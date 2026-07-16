import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  const topics = await prisma.topic.findMany({
    where: { userId: DEFAULT_USER_ID, ...(subjectId ? { subjectId } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { subject: { select: { name: true, color: true } }, attachments: true },
  })

  return NextResponse.json(topics)
}

export async function POST(req) {
  const body = await req.json()
  const topic = await prisma.topic.create({
    data: { ...body, userId: DEFAULT_USER_ID },
  })

  return NextResponse.json(topic)
}
