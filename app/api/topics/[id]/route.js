import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { id } = await params
  const topic = await prisma.topic.findFirst({
    where: { id, userId: user.id },
    include: { subject: { select: { name: true, color: true } }, attachments: true },
  })

  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(topic)
}

export async function PUT(req, { params }) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { id } = await params
  const body = await req.json()

  const topic = await prisma.topic.updateMany({
    where: { id, userId: user.id },
    data: body,
  })

  if (topic.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await prisma.topic.findFirst({ where: { id }, include: { attachments: true } }))
}

export async function DELETE(req, { params }) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { id } = await params
  await prisma.topic.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
