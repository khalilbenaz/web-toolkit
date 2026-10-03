import { LIMITS } from './limits';
import { runTask, type TaskInput, type TaskName, type TaskOutput } from './tasks';

export class TaskTimeoutError extends Error {
  constructor(ms: number) {
    super(`Calcul interrompu : plus de ${ms / 1000} s (motif ou données trop coûteux).`);
    this.name = 'TaskTimeoutError';
  }
}

function abortError(): Error {
  const e = new Error('Calcul annulé');
  e.name = 'AbortError';
  return e;
}

let nextId = 1;

/**
 * Exécute un calcul dans un Web Worker jetable. Passé `timeoutMs`, le worker est
 * terminé (un regex catastrophique ne fige plus l'onglet) ; `signal` l'annule.
 * Sans Worker (environnement de test), le calcul s'exécute en ligne.
 */
export function runInWorker<K extends TaskName>(
  task: K,
  input: TaskInput<K>,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<TaskOutput<K>> {
  const timeoutMs = opts.timeoutMs ?? LIMITS.timeoutMs;
  const { signal } = opts;

  if (signal?.aborted) return Promise.reject(abortError());
  if (typeof Worker === 'undefined') {
    return new Promise((resolve, reject) => {
      try {
        resolve(runTask(task, input));
      } catch (e) {
        reject(e);
      }
    });
  }

  return new Promise<TaskOutput<K>>((resolve, reject) => {
    const worker = new Worker(new URL('../workers/tasks.worker.ts', import.meta.url), { type: 'module' });
    const id = nextId++;

    const finish = (fn: () => void) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      fn();
    };
    const onAbort = () => finish(() => reject(abortError()));
    const timer = setTimeout(() => finish(() => reject(new TaskTimeoutError(timeoutMs))), timeoutMs);

    signal?.addEventListener('abort', onAbort);
    worker.onmessage = (e: MessageEvent<{ id: number; result?: TaskOutput<K>; error?: string }>) => {
      if (e.data.id !== id) return;
      finish(() => (e.data.error !== undefined ? reject(new Error(e.data.error)) : resolve(e.data.result as TaskOutput<K>)));
    };
    worker.onerror = (e: ErrorEvent) => finish(() => reject(new Error(e.message || 'Erreur du worker')));
    worker.postMessage({ id, task, input });
  });
}
