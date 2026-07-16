import { DEFAULT_USER_ID } from '@/lib/user'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const [subjects, sessions, questions, topics] = await Promise.all([
    prisma.subject.findMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.studySession.findMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.question.findMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.topic.findMany({ where: { userId: DEFAULT_USER_ID } }),
  ])

  const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0)
  const totalQuestions = questions.reduce((acc, q) => acc + q.total, 0)
  const correctQuestions = questions.reduce((acc, q) => acc + q.correct, 0)

  return NextResponse.json({
    subjectsCount: subjects.length,
    totalMinutes,
    totalQuestions,
    correctQuestions,
    accuracy: totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0,
    topicsCount: topics.length,
    completedTopics: topics.filter((t) => t.completed).length,
  })
}
