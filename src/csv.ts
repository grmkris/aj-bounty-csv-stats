export type Row = Record<string, string>

export function parseCsv(text: string): Row[] {
  const [header, ...lines] = text.split('\n')
  const keys = (header ?? '').split(',')
  return lines.filter((l) => l !== '').map((l) => Object.fromEntries(l.split(',').map((v, i) => [keys[i], v])))
}

export interface Stats {
  count: number
  min: number
  max: number
  mean: number
  median: number
}

export function stats(rows: Row[], column: string): Stats {
  void rows
  throw new Error(`not implemented: ${column}`)
}
