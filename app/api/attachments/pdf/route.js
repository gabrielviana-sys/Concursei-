import { DEFAULT_USER_ID, getDefaultUser } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import { put } from '@vercel/blob'
import path from 'path'
import { pathToFileURL } from 'url'

const workerPath = pathToFileURL(path.resolve('node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs')).href
PDFParse.setWorker(workerPath)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const topicId = formData.get('topicId')

    if (!file || !topicId) {
      return NextResponse.json({ error: 'Arquivo e tópico são obrigatórios' }, { status: 400 })
    }

    await getDefaultUser(prisma)

    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    const textResult = await parser.getText()
    const text = textResult.text || ''

    let fileUrl = null
    try {
      const blob = await put(`aulas/${Date.now()}-${file.name}`, buffer, {
        access: 'public',
        contentType: file.type || 'application/pdf',
      })
      fileUrl = blob.url
    } catch (blobErr) {
      console.warn('Vercel Blob upload failed:', blobErr.message)
    }

    const title = file.name.replace(/\.pdf$/i, '')

    const attachment = await prisma.topicAttachment.create({
      data: {
        userId: DEFAULT_USER_ID,
        topicId,
        type: 'pdf',
        title,
        fileUrl,
        content: text.trim().length > 0 ? text : null,
      },
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.error('Upload PDF attachment error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar PDF' },
      { status: 500 }
    )
  }
}
