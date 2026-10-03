import { useEffect, useState } from 'react';
import { runInWorker } from './workerClient';
import type { TaskInput, TaskName, TaskOutput } from './tasks';

export interface TaskState<K extends TaskName> {
  /** idle : rien à calculer ; running : worker en cours ; done / error : issue du dernier calcul. */
  status: 'idle' | 'running' | 'done' | 'error';
  /** Dernier résultat obtenu (conservé pendant le calcul suivant pour éviter le clignotement). */
  result: TaskOutput<K> | null;
  error: string;
}

/**
 * Lance `task` dans un worker à chaque changement de `input` (anti-rebond `debounceMs`).
 * `input` doit être mémoïsé par l'appelant ; null = rien à calculer. Le calcul en cours
 * est annulé (worker terminé) dès que l'entrée change ou que le composant est démonté.
 */
export function useWorkerTask<K extends TaskName>(
  task: K,
  input: TaskInput<K> | null,
  debounceMs = 0,
): TaskState<K> {
  const [state, setState] = useState<TaskState<K>>({ status: 'idle', result: null, error: '' });

  useEffect(() => {
    if (input === null) {
      setState({ status: 'idle', result: null, error: '' });
      return;
    }
    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: 'running', error: '' }));
    const t = setTimeout(() => {
      runInWorker(task, input, { signal: ctrl.signal }).then(
        (result) => setState({ status: 'done', result, error: '' }),
        (e: Error) => {
          if (e.name !== 'AbortError') setState({ status: 'error', result: null, error: e.message });
        },
      );
    }, debounceMs);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [task, input, debounceMs]);

  return state;
}
