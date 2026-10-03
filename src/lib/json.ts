export type JsonOutcome = { ok: true; output: string } | { ok: false; error: string };

export function formatJson(input: string): JsonOutcome {
  try {
    return { ok: true, output: JSON.stringify(JSON.parse(input), null, 2) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function minifyJson(input: string): JsonOutcome {
  try {
    return { ok: true, output: JSON.stringify(JSON.parse(input)) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
