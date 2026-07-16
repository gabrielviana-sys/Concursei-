import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  const questions = await prisma.question.findMany({
    where: { userId: user.id, ...(subjectId ? { subjectId } : {}) },
    orderBy: { date: 'desc' },
    include: { subject: { select: { name: true, color: true } } },
  })

  return NextResponse.json(questions)
}

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const body = await req.json()
  const question = await prisma.question.create({
    data: { ...body, userId: user.id },
  })

  return NextResponse.json(question)
}
