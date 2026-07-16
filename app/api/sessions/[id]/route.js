import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  const { id } = await params
  const body = await req.json()

  const updated = await prisma.studySession.updateMany({
    where: { id, userId: DEFAULT_USER_ID },
    data: body,
  })

  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await prisma.studySession.findFirst({ where: { id } }))
}

export async function DELETE(req, { params }) {
  const { id } = await params
  await prisma.studySession.deleteMany({ where: { id, userId: DEFAULT_USER_ID } })
  return NextResponse.json({ ok: true })
}
