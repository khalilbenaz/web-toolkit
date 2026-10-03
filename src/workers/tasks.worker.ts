import { runTask, type TaskInput, type TaskName } from '../lib/tasks';

interface Request {
  id: number;
  task: TaskName;
  input: TaskInput<TaskName>;
}

self.onmessage = (e: MessageEvent<Request>) => {
  const { id, task, input } = e.data;
  try {
    self.postMessage({ id, result: runTask(task, input) });
  } catch (err) {
    self.postMessage({ id, error: (err as Error).message });
  }
};
