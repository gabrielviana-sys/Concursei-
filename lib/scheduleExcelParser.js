import * as XLSX from 'xlsx'

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

function normalizeRoman(str) {
  return str
    .replace(/\bIl\b/g, 'II')
    .replace(/\bIlI\b/g, 'III')
    .replace(/\bIV\b/g, 'IV')
    .replace(/\bVI\b/g, 'VI')
}

function formatDate(dateValue) {
  if (!dateValue) return null
  if (typeof dateValue === 'number') {
    const parsed = XLSX.SSF.parse_date_code(dateValue)
    if (parsed) {
      const y = parsed.y
      const m = String(parsed.m).padStart(2, '0')
      const d = String(parsed.d).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    return null
  }
  let date = dateValue
  if (!(date instanceof Date)) {
    date = new Date(dateValue)
  }
  if (isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildDate(day, month, year) {
  if (!day || !month || !year) return null
  const d = String(day).padStart(2, '0')
  const m = String(month).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function parseDayCell(dayCell) {
  if (!dayCell) return null
  if (dayCell instanceof Date) {
    return { day: String(dayCell.getDate()), weekday: '' }
  }
  const str = String(dayCell).trim()
  const match = str.match(/^(\d{1,2})\s*-\s*(.+)$/)
  if (match) {
    return { day: match[1], weekday: match[2].trim() }
  }
  if (/^\d{1,2}$/.test(str)) {
    return { day: str, weekday: '' }
  }
  return null
}

function parseLesson(lessonCell) {
  if (!lessonCell) return { subjectName: '', content: '' }
  const str = normalizeRoman(String(lessonCell).trim())
  const parts = str.split('|').map((p) => p.trim())
  const subjectName = parts[0].replace(/\s+/g, ' ').trim()
  let content = parts.slice(1).join(' - ').trim()
  content = content.replace(/^(?:\d+|[IVX]+(?:\s+\d+)?)\s*-\s*/, '').trim()
  return { subjectName, content }
}

export function parseExcelSchedule(buffer, { month, year }) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

  let headerRowIndex = -1
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const row = rows[i].map((c) => String(c).toLowerCase().trim())
    const hasDay = row.includes('dia de estudo') || row.includes('dia')
    const hasSubject = row.includes('matéria') || row.includes('materia')
    if (hasDay && hasSubject) {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Não foi possível encontrar o cabeçalho do cronograma no Excel.')
  }

  const headers = rows[headerRowIndex].map((c) => String(c).trim().toLowerCase())
  const colIndex = {
    date: headers.findIndex((h) => h.includes('data')),
    day: headers.findIndex((h) => h.includes('dia')),
    subject: headers.findIndex((h) => h.includes('matéria') || h.includes('materia')),
    lesson: headers.findIndex((h) => h.includes('aula')),
    type: headers.findIndex((h) => h.includes('tipo')),
    completed: headers.findIndex((h) => h.includes('concluído') || h.includes('concluido')),
  }

  if (colIndex.day === -1 || colIndex.lesson === -1) {
    throw new Error('Colunas obrigatórias não encontradas: Dia e Aula.')
  }

  const items = []
  let lastDayInfo = null

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const dateCell = colIndex.date !== -1 ? row[colIndex.date] : null
    const dayCell = row[colIndex.day]
    const lessonCell = row[colIndex.lesson]
    const subjectCell = colIndex.subject !== -1 ? row[colIndex.subject] : null
    if (!lessonCell) continue

    let dayInfo = null
    if (dateCell) {
      dayInfo = parseDayCell(dateCell)
    }
    if (!dayInfo && dayCell && String(dayCell).trim()) {
      dayInfo = parseDayCell(dayCell)
      if (dayInfo) lastDayInfo = dayInfo
    }
    if (!dayInfo) dayInfo = lastDayInfo
    if (!dayInfo) continue

    let subjectName = ''
    let content = ''
    if (subjectCell && String(subjectCell).trim()) {
      subjectName = String(subjectCell).trim().replace(/\s+/g, ' ')
      const lessonText = normalizeRoman(String(lessonCell).trim())
      const escapedSubject = subjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      content = lessonText.replace(new RegExp('^' + escapedSubject + '\\s*', 'i'), '').trim()
      // Remove separador "|" inicial, se sobrar
      content = content.replace(/^\|\s*/, '').trim()
      content = content.replace(/^(?:\d+|[IVX]+(?:\s+\d+)?)\s*-\s*/, '').trim()
    } else {
      const parsed = parseLesson(lessonCell)
      subjectName = parsed.subjectName
      content = parsed.content
    }
    if (!subjectName || !content) continue

    const typeCell = colIndex.type !== -1 ? row[colIndex.type] : 'Videoaula'
    const completedCell = colIndex.completed !== -1 ? row[colIndex.completed] : 'Não'

    let studyDate = null
    if (dateCell) {
      studyDate = formatDate(dateCell)
    } else {
      studyDate = buildDate(dayInfo.day, month, year)
    }

    items.push({
      day: dayInfo.day,
      weekday: dayInfo.weekday,
      subjectName,
      content,
      type: String(typeCell || 'Videoaula').trim(),
      completed: String(completedCell || 'Não').trim().toLowerCase() === 'sim',
      studyDate,
      raw: String(lessonCell).trim(),
    })
  }

  return {
    totalItems: items.length,
    items,
  }
}
