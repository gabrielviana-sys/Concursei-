import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (error) {
    console.error('Register error:', error)
    console.error('DATABASE_URL:', process.env.DATABASE_URL)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
