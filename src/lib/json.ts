import { formatCount, LIMITS } from './limits';

export type JsonOutcome = { ok: true; output: string } | { ok: false; error: string };

function tooBig(input: string): JsonOutcome | null {
  if (input.length <= LIMITS.jsonChars) return null;
  return {
    ok: false,
    error: `JSON trop volumineux (${formatCount(input.length)} caractères, maximum ${formatCount(LIMITS.jsonChars)}).`,
  };
}

export function formatJson(input: string): JsonOutcome {
  const big = tooBig(input);
  if (big) return big;
  try {
    return { ok: true, output: JSON.stringify(JSON.parse(input), null, 2) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function minifyJson(input: string): JsonOutcome {
  const big = tooBig(input);
  if (big) return big;
  try {
    return { ok: true, output: JSON.stringify(JSON.parse(input)) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
