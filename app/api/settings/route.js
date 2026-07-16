import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const settings = await prisma.setting.findMany({
    where: { userId: DEFAULT_USER_ID },
  })

  const map = {}
  settings.forEach((s) => (map[s.key] = s.value))
  return NextResponse.json(map)
}

export async function POST(req) {
  const { key, value } = await req.json()
  const setting = await prisma.setting.upsert({
    where: { userId_key: { userId: DEFAULT_USER_ID, key } },
    update: { value },
    create: { userId: DEFAULT_USER_ID, key, value },
  })

  return NextResponse.json(setting)
}
