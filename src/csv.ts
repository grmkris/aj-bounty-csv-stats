export type Row = Record<string, string>

export interface Stats {
  count: number
  min: number
  max: number
  mean: number
  median: number
}

const NUMERIC = /^[+-]?(?:\d+\.\d+|\d+|\.\d+)$/

interface ParsedRecord {
  fields: string[]
  line: number
}

export function parseCsv(text: string): Row[] {
  const records = parseRecords(text)
  if (records.length === 0) return []
  const keys = records[0].fields
  const rows: Row[] = []
  for (let i = 1; i < records.length; i++) {
    const record = records[i]
    if (record.fields.length !== keys.length) {
      throw new Error(`line ${record.line} has ${record.fields.length} fields, expected ${keys.length}`)
    }
    const row: Row = {}
    for (let c = 0; c < keys.length; c++) row[keys[c]] = record.fields[c]
    rows.push(row)
  }
  return rows
}

export function stats(rows: Row[], column: string): Stats {
  const values: number[] = []
  let known = false
  for (const row of rows) {
    if (!Object.hasOwn(row, column)) throw new Error(`unknown column: ${column}`)
    known = true
    const raw = row[column]
    if (raw === '') continue
    if (!NUMERIC.test(raw)) throw new Error(`non-number in column ${column}`)
    values.push(Number(raw))
  }
  if (!known) throw new Error(`unknown column: ${column}`)
  if (values.length === 0) throw new Error(`no numeric values in column ${column}`)

  const sorted = [...values].sort((a, b) => a - b)
  const count = values.length
  const min = sorted[0]
  const max = sorted[count - 1]
  const mean = values.reduce((sum, value) => sum + value, 0) / count
  const mid = count >> 1
  const median = count % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  return { count, min, max, mean, median }
}

function parseRecords(text: string): ParsedRecord[] {
  const records: ParsedRecord[] = []
  const n = text.length
  let i = 0
  let line = 1

  while (i < n) {
    const startLine = line
    const fields: string[] = []
    let field = ''
    let inQuotes = false
    let closedQuote = false
    let endedBySeparator = false

    while (i < n) {
      const c = text[i]

      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"'
            i += 2
            continue
          }
          inQuotes = false
          closedQuote = true
          i += 1
          continue
        }
        if (c === '\r') {
          field += '\n'
          i += 1
          if (text[i] === '\n') i += 1
          line += 1
          continue
        }
        if (c === '\n') {
          field += '\n'
          line += 1
          i += 1
          continue
        }
        field += c
        i += 1
        continue
      }

      if (c === '"') {
        if (field.length !== 0 || closedQuote) throw new Error(`line ${startLine}: unexpected quote`)
        inQuotes = true
        i += 1
        continue
      }

      if (c === ',') {
        fields.push(field)
        field = ''
        closedQuote = false
        i += 1
        continue
      }

      if (c === '\n' || c === '\r') {
        fields.push(field)
        if (c === '\r' && text[i + 1] === '\n') i += 2
        else i += 1
        line += 1
        endedBySeparator = true
        break
      }

      if (closedQuote) throw new Error(`line ${startLine}: unexpected character after quoted field`)
      field += c
      i += 1
    }

    if (inQuotes) throw new Error(`line ${startLine}: unterminated quoted field`)

    if (!endedBySeparator) fields.push(field)
    records.push({ fields, line: startLine })
  }

  return records
}
