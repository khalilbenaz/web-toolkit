import { csvToJson, jsonToCsv, type Delimiter } from './csv';
import { computeDiff, DiffTooLargeError, type DiffLine } from './diff';
import { formatJson, minifyJson, type JsonOutcome } from './json';
import { runRegex, type RegexResult } from './regex';

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
  error: string;
}

export interface ConvertResult {
  result: string;
  error: string;
}

/** Calculs exécutés dans un Web Worker : nom → (entrée, sortie). */
export interface TaskDefs {
  regex: { input: { pattern: string; flags: string; text: string }; output: RegexResult };
  jsonFormat: { input: { input: string }; output: JsonOutcome };
  jsonMinify: { input: { input: string }; output: JsonOutcome };
  diff: { input: { before: string; after: string }; output: DiffResult };
  csvToJson: { input: { input: string; delimiter: Delimiter | 'auto' }; output: ConvertResult };
  jsonToCsv: { input: { input: string; delimiter: Delimiter }; output: ConvertResult };
}

export type TaskName = keyof TaskDefs;
export type TaskInput<K extends TaskName> = TaskDefs[K]['input'];
export type TaskOutput<K extends TaskName> = TaskDefs[K]['output'];

function runDiff({ before, after }: TaskDefs['diff']['input']): DiffResult {
  try {
    const lines = computeDiff(before.split('\n'), after.split('\n'));
    let added = 0;
    let removed = 0;
    for (const l of lines) {
      if (l.kind === 'added') added++;
      else if (l.kind === 'removed') removed++;
    }
    return { lines, added, removed, error: '' };
  } catch (e) {
    if (e instanceof DiffTooLargeError) return { lines: [], added: 0, removed: 0, error: e.message };
    throw e;
  }
}

/** Dispatch pur : utilisé par le worker, et testable sans worker. */
export function runTask<K extends TaskName>(task: K, input: TaskInput<K>): TaskOutput<K> {
  const run = (): unknown => {
    switch (task) {
      case 'regex': {
        const i = input as TaskInput<'regex'>;
        return runRegex(i.pattern, i.flags, i.text);
      }
      case 'jsonFormat':
        return formatJson((input as TaskInput<'jsonFormat'>).input);
      case 'jsonMinify':
        return minifyJson((input as TaskInput<'jsonMinify'>).input);
      case 'diff':
        return runDiff(input as TaskInput<'diff'>);
      case 'csvToJson': {
        const i = input as TaskInput<'csvToJson'>;
        return csvToJson(i.input, i.delimiter);
      }
      case 'jsonToCsv': {
        const i = input as TaskInput<'jsonToCsv'>;
        return jsonToCsv(i.input, i.delimiter);
      }
      default:
        throw new Error(`Tâche inconnue : ${String(task)}`);
    }
  };
  return run() as TaskOutput<K>;
}
