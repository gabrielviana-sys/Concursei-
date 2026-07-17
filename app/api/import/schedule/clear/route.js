import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const { count } = await prisma.topic.deleteMany({
      where: {
        userId: DEFAULT_USER_ID,
        source: { in: ['gran-excel', 'gran-cursos'] },
      },
    })

    return NextResponse.json({ deleted: count })
  } catch (error) {
    console.error('Clear schedule error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao limpar cronograma' },
      { status: 500 }
    )
  }
}
