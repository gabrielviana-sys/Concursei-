import { DEFAULT_USER_ID, getDefaultUser } from '@/lib/user'
import { prisma } from '@/lib/db'
import { parseExcelSchedule } from '@/lib/scheduleExcelParser'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const month = Number(formData.get('month'))
    const year = Number(formData.get('year'))

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }
    if (!month || !year) {
      return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 })
    }

    await getDefaultUser(prisma)

    const buffer = Buffer.from(await file.arrayBuffer())
    const { items } = parseExcelSchedule(buffer, { month, year })

    const result = await prisma.$transaction(async (tx) => {
      const existingSubjects = await tx.subject.findMany({
        where: { userId: DEFAULT_USER_ID },
      })
      const subjectMap = new Map(existingSubjects.map((s) => [s.name.toLowerCase(), s.id]))
      const createdSubjectNames = new Set()
      let createdTopics = 0

      for (const item of items) {
        const key = item.subjectName.toLowerCase()
        let subjectId = subjectMap.get(key)

        if (!subjectId) {
          const newSubject = await tx.subject.create({
            data: {
              userId: DEFAULT_USER_ID,
              name: item.subjectName,
              color: '#6366f1',
              goalMinutes: 60,
            },
          })
          subjectId = newSubject.id
          subjectMap.set(key, subjectId)
          createdSubjectNames.add(item.subjectName)
        }

        await tx.topic.create({
          data: {
            userId: DEFAULT_USER_ID,
            subjectId,
            name: item.content,
            studyDate: item.studyDate ? new Date(`${item.studyDate}T12:00:00`) : null,
            completed: item.completed,
            source: 'gran-excel',
          },
        })
        createdTopics++
      }

      return {
        totalItems: items.length,
        createdSubjects: createdSubjectNames.size,
        createdTopics,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import schedule excel error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao importar cronograma' },
      { status: 500 }
    )
  }
}
