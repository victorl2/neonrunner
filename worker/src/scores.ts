// worker/src/scores.ts — Phase 1 seeded fake top-10.
//
// Real KV-backed list lands in Phase 5 (LB-01..LB-07).
// This shape MUST match scripts/serve.mjs's SEEDED_SCORES so the Playwright smoke
// test is interchangeable between local serve and the deployed Worker.

export type ScoreEntry = {
  readonly name: string;
  readonly score: number;
};

export const scores: readonly ScoreEntry[] = [
  { name: 'NEO', score: 9999 },
  { name: 'RIN', score: 8888 },
  { name: 'ZED', score: 7777 },
  { name: 'ECHO', score: 6666 },
  { name: 'KAI', score: 5555 },
  { name: 'NOVA', score: 4444 },
  { name: 'LUX', score: 3333 },
  { name: 'IRIS', score: 2222 },
  { name: 'AXEL', score: 1111 },
  { name: 'JUNO', score: 555 },
];
