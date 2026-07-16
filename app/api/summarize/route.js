import { getSessionUser, unauthorized } from '@/lib/session'
import { prisma } from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

export async function POST(req) {
  const user = await getSessionUser(req)
  if (!user?.id) return unauthorized()

  try {
    const { text, attachmentId } = await req.json()
    let content = text || ''

    if (attachmentId) {
      const attachment = await prisma.topicAttachment.findFirst({
        where: { id: attachmentId, userId: user.id },
      })
      if (!attachment) return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
      content = attachment.content || ''
    }

    if (!content.trim()) {
      return NextResponse.json({ error: 'Conteúdo vazio' }, { status: 400 })
    }

    const settings = await prisma.setting.findMany({
      where: { userId: user.id },
    })
    const apiKey = settings.find((s) => s.key === 'geminiApiKey')?.value || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave da API Gemini não configurada' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const prompt = `Resuma o texto a seguir de forma clara, objetiva e didática, em português. Destaque os principais conceitos e pontos importantes para estudo:\n\n${content.slice(0, 25000)}`

    let result = null
    let lastError = null

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent(prompt)
        if (result?.response?.text?.()) break
      } catch (err) {
        lastError = err
        console.warn(`Model ${modelName} failed:`, err.message)
      }
    }

    if (!result) {
      throw lastError || new Error('Nenhum modelo disponível')
    }

    const summary = result.response.text()
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: 'Erro ao gerar resumo' }, { status: 500 })
  }
}
