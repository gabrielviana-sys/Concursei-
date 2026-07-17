const MONTHS = {
  janeiro: '01',
  fevereiro: '02',
  março: '03',
  marco: '03',
  abril: '04',
  maio: '05',
  junho: '06',
  julho: '07',
  agosto: '08',
  setembro: '09',
  outubro: '10',
  novembro: '11',
  dezembro: '12',
}

function extractMonthYear(text) {
  const match = text.match(
    /(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\/(\d{4})/i
  )
  if (match) {
    return {
      month: MONTHS[match[1].toLowerCase().replace('ç', 'c').replace('õ', 'o')],
      year: match[2],
    }
  }
  return null
}

function buildDate(day, monthYear) {
  if (!monthYear || !day) return null
  const d = String(day).padStart(2, '0')
  return `${monthYear.year}-${monthYear.month}-${d}`
}

function normalizeRoman(str) {
  return str
    .replace(/\bIl\b/g, 'II')
    .replace(/\bIlI\b/g, 'III')
    .replace(/\bIV\b/g, 'IV')
    .replace(/\bVI\b/g, 'VI')
}

export function parseScheduleText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const monthYear = extractMonthYear(text)
  const items = []
  let lastDay = null
  let lastWeekday = null

  // Padrão com dia: "14 - Terça-feira Língua Portuguesa | 1 - Compreensão e Interpretação Videoaula Sim"
  const rowWithDayRegex =
    /^(\d{1,2})\s*-\s*(Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo)(?:-feira)?\s+(.+?)\s+(Videoaula|Revis[ãa]o|Material|Exercício|Questões|Aula)\s+(Sim|N[ãa]o)$/i

  // Padrão sem dia: "Língua Portuguesa | 1 - Compreensão e Interpretação Videoaula Sim"
  const rowWithoutDayRegex = /^(.+?)\s+(Videoaula|Revis[ãa]o|Material|Exercício|Questões|Aula)\s+(Sim|N[ãa]o)$/i

  for (const rawLine of lines) {
    const line = normalizeRoman(rawLine)

    const matchWithDay = line.match(rowWithDayRegex)
    const matchWithoutDay = line.match(rowWithoutDayRegex)

    if (!matchWithDay && !matchWithoutDay) continue

    let day, weekday, lesson, type, completed

    if (matchWithDay) {
      day = matchWithDay[1]
      weekday = matchWithDay[2]
      lesson = matchWithDay[3].trim()
      type = matchWithDay[4]
      completed = matchWithDay[5].toLowerCase() === 'sim'
      lastDay = day
      lastWeekday = weekday
    } else if (matchWithoutDay && lastDay) {
      day = lastDay
      weekday = lastWeekday
      lesson = matchWithoutDay[1].trim()
      type = matchWithoutDay[2]
      completed = matchWithoutDay[3].toLowerCase() === 'sim'
    } else {
      continue
    }

    const parts = lesson.split('|').map((p) => p.trim())
    let subjectName = parts[0]
    let content = parts.slice(1).join(' - ').trim()

    content = content.replace(/^(?:\d+|I{1,3}V?|VI{0,3})\s*-\s*/, '').trim()
    subjectName = subjectName.replace(/\s+/g, ' ').trim()

    if (!subjectName || !content) continue

    items.push({
      day,
      weekday,
      subjectName,
      content,
      type,
      completed,
      studyDate: buildDate(day, monthYear),
      raw: lesson,
    })
  }

  return {
    totalItems: items.length,
    items,
  }
}
