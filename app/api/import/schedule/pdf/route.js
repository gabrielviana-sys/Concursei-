import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { parseScheduleText } from '@/lib/scheduleTextParser'
import { NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import path from 'path'
import { pathToFileURL } from 'url'

const workerPath = pathToFileURL(path.resolve('node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs')).href
PDFParse.setWorker(workerPath)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    const textResult = await parser.getText()
    const text = textResult.text

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível extrair texto do PDF. PDFs escaneados ou em imagem não são suportados.' },
        { status: 400 }
      )
    }

    const { items } = parseScheduleText(text)

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item de cronograma encontrado no texto do PDF.' },
        { status: 400 }
      )
    }

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
            source: 'gran-cursos',
          },
        })
        createdTopics++
      }

      return {
        totalPages: textResult.total,
        totalItems: items.length,
        createdSubjects: createdSubjectNames.size,
        createdTopics,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import schedule pdf error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao importar PDF' },
      { status: 500 }
    )
  }
}
