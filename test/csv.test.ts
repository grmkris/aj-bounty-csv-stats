import { describe, expect, it } from 'bun:test'
import { parseCsv, stats } from '../src/csv.ts'

describe('parseCsv', () => {
  it('plain and trailing newline', () => {
    expect(parseCsv('a,b\n1,2\n3,4\n')).toEqual([{ a: '1', b: '2' }, { a: '3', b: '4' }])
  })
  it('quotes, commas, doubled quotes, CRLF', () => {
    expect(parseCsv('name,note\r\n"Doe, J","said ""hi"""\r\nX,\r\n')).toEqual([
      { name: 'Doe, J', note: 'said "hi"' },
      { name: 'X', note: '' },
    ])
  })
  it('newlines inside quotes', () => {
    expect(parseCsv('a,b\n"line1\nline2",2')).toEqual([{ a: 'line1\nline2', b: '2' }])
  })
  it('ragged row names its line', () => {
    expect(() => parseCsv('a,b\n1,2\n3')).toThrow(/line 3/)
  })
})

describe('stats', () => {
  const rows = parseCsv('city,temp\nA,10\nB,\nC,4\nD,7.5\nE,-1')
  it('summary', () => {
    expect(stats(rows, 'temp')).toEqual({ count: 4, min: -1, max: 10, mean: 5.125, median: 5.75 })
  })
  it('odd count median', () => {
    expect(stats(parseCsv('x\n3\n1\n2'), 'x').median).toBe(2)
  })
  it('refuses non-numbers, empty and unknown columns', () => {
    expect(() => stats(parseCsv('x\nabc'), 'x')).toThrow()
    expect(() => stats(parseCsv('x,y\n,1'), 'x')).toThrow()
    expect(() => stats(rows, 'nope')).toThrow()
  })
})
