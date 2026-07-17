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
      // Garante que todas as matérias existam
      const existingSubjects = await tx.subject.findMany({
        where: { userId: DEFAULT_USER_ID },
      })
      const subjectMap = new Map(existingSubjects.map((s) => [s.name.toLowerCase(), s.id]))
      const missingSubjectNames = []

      for (const item of items) {
        const key = item.subjectName.toLowerCase()
        if (!subjectMap.has(key) && !missingSubjectNames.includes(item.subjectName)) {
          missingSubjectNames.push(item.subjectName)
        }
      }

      if (missingSubjectNames.length > 0) {
        await tx.subject.createMany({
          data: missingSubjectNames.map((name) => ({
            userId: DEFAULT_USER_ID,
            name,
            color: '#6366f1',
            goalMinutes: 60,
          })),
          skipDuplicates: true,
        })
      }

      const allSubjects = await tx.subject.findMany({
        where: { userId: DEFAULT_USER_ID },
      })
      const allSubjectMap = new Map(allSubjects.map((s) => [s.name.toLowerCase(), s.id]))
      const createdSubjectNames = new Set(missingSubjectNames)

      const topicsToCreate = []
      for (const item of items) {
        const subjectId = allSubjectMap.get(item.subjectName.toLowerCase())
        if (!subjectId) continue
        topicsToCreate.push({
          userId: DEFAULT_USER_ID,
          subjectId,
          name: item.content,
          studyDate: item.studyDate ? new Date(`${item.studyDate}T12:00:00`) : null,
          completed: item.completed,
          source: 'gran-excel',
        })
      }

      if (topicsToCreate.length > 0) {
        await tx.topic.createMany({
          data: topicsToCreate,
          skipDuplicates: false,
        })
      }

      return {
        totalItems: items.length,
        createdSubjects: createdSubjectNames.size,
        createdTopics: topicsToCreate.length,
      }
    }, { maxWait: 10000, timeout: 60000 })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import schedule excel error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao importar cronograma' },
      { status: 500 }
    )
  }
}
