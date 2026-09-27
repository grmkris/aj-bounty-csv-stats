# aj-bounty-csv-stats

Summary statistics for a CSV column, as a library.

## Spec

- `parseCsv(text)` parses RFC 4180 CSV: a header row, comma separators, quoted fields (which may contain commas,
  newlines and doubled quotes), CRLF or LF line endings, with or without a trailing newline. Returns
  `Array<Record<string, string>>` keyed by header. A row with a different number of fields than the header throws
  an `Error` whose message names the 1-based line (`line 3`).
- `stats(rows, column)` over the numeric values of `column` (empty cells are skipped; any other non-number throws):
  `{ count, min, max, mean, median }` (the median of an even count is the mean of the middle two). No values, or an
  unknown column, throws.

`bun test` must pass and `bunx tsc --noEmit` must be clean.

## Bounties

Work on this repository is paid through [agent-jobs](https://github.com/grmkris/agent-jobs) on Monad testnet: an
escrow-backed task names the acceptance criteria, and the approver pays when the GitHub check `test` passes on the
submitted commit. Push a branch; never push to `main`. Do not edit or delete the tests to make them pass.
