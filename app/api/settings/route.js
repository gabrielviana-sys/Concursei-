import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const settings = await prisma.setting.findMany({
    where: { userId: user.id },
  })

  const map = {}
  settings.forEach((s) => (map[s.key] = s.value))
  return NextResponse.json(map)
}

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  const { key, value } = await req.json()
  const setting = await prisma.setting.upsert({
    where: { userId_key: { userId: user.id, key } },
    update: { value },
    create: { userId: user.id, key, value },
  })

  return NextResponse.json(setting)
}
