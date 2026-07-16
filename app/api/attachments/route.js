import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const body = await req.json()
  const attachment = await prisma.topicAttachment.create({
    data: { ...body, userId: user.id },
  })

  return NextResponse.json(attachment)
}
