import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { id } = await params
  const body = await req.json()

  const updated = await prisma.studySession.updateMany({
    where: { id, userId: user.id },
    data: body,
  })

  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await prisma.studySession.findFirst({ where: { id } }))
}

export async function DELETE(req, { params }) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { id } = await params
  await prisma.studySession.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
