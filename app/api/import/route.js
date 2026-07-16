import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const type = formData.get('type') || 'questions'

    if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    const userId = user.id
    const created = []

    if (type === 'questions') {
      for (const row of rows) {
        const data = {
          userId,
          subjectId: row.subjectId || null,
          topic: row.tema || row.topic || row.assunto || null,
          total: Number(row.total || row.questoes || 0),
          correct: Number(row.correct || row.acertos || 0),
          wrong: Number(row.wrong || row.erros || 0),
          date: row.date ? new Date(row.date) : new Date(),
        }
        created.push(await prisma.question.create({ data }))
      }
    } else if (type === 'sessions') {
      for (const row of rows) {
        const data = {
          userId,
          subjectId: row.subjectId || null,
          minutes: Number(row.minutes || row.minutos || 0),
          sessionType: row.sessionType || row.tipo || 'timer',
          notes: row.notes || row.anotacoes || null,
          date: row.date ? new Date(row.date) : new Date(),
        }
        created.push(await prisma.studySession.create({ data }))
      }
    }

    return NextResponse.json({ imported: created.length, items: created })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Erro ao importar arquivo' }, { status: 500 })
  }
}
