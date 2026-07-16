import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const body = await req.json()
  const attachment = await prisma.topicAttachment.create({
    data: { ...body, userId: DEFAULT_USER_ID },
  })

  return NextResponse.json(attachment)
}
