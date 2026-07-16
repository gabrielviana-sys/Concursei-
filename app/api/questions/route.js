import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  const questions = await prisma.question.findMany({
    where: { userId: DEFAULT_USER_ID, ...(subjectId ? { subjectId } : {}) },
    orderBy: { date: 'desc' },
    include: { subject: { select: { name: true, color: true } } },
  })

  return NextResponse.json(questions)
}

export async function POST(req) {
  const body = await req.json()
  const question = await prisma.question.create({
    data: { ...body, userId: DEFAULT_USER_ID },
  })

  return NextResponse.json(question)
}
