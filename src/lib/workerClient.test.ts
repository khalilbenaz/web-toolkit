import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runInWorker, TaskTimeoutError } from './workerClient';

class SilentWorker {
  static instances: SilentWorker[] = [];
  terminated = false;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  constructor() {
    SilentWorker.instances.push(this);
  }
  postMessage(_msg?: unknown) {}
  terminate() {
    this.terminated = true;
  }
}

class EchoWorker extends SilentWorker {
  postMessage(msg: { id: number }) {
    queueMicrotask(() => this.onmessage?.({ data: { id: msg.id, result: 'ok' } } as MessageEvent));
  }
}

describe('runInWorker', () => {
  beforeEach(() => {
    SilentWorker.instances = [];
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('runInWorker_workerQuiNeRepondPas_terminateEtRejetteApresLeDelai', async () => {
    vi.stubGlobal('Worker', SilentWorker);
    const p = runInWorker('regex', { pattern: '(a+)+$', flags: 'g', text: 'a' }, { timeoutMs: 500 });
    const assertion = expect(p).rejects.toBeInstanceOf(TaskTimeoutError);
    await vi.advanceTimersByTimeAsync(501);
    await assertion;
    expect(SilentWorker.instances[0].terminated).toBe(true);
  });

  it('runInWorker_reponseRecue_resoutEtTerminateLeWorker', async () => {
    vi.stubGlobal('Worker', EchoWorker);
    await expect(runInWorker('regex', { pattern: 'a', flags: 'g', text: 'a' }, { timeoutMs: 500 })).resolves.toBe('ok');
    expect(SilentWorker.instances[0].terminated).toBe(true);
  });

  it('runInWorker_annulation_terminateEtRejetteAbortError', async () => {
    vi.stubGlobal('Worker', SilentWorker);
    const ctrl = new AbortController();
    const p = runInWorker('regex', { pattern: 'a', flags: 'g', text: 'a' }, { timeoutMs: 500, signal: ctrl.signal });
    const assertion = expect(p).rejects.toMatchObject({ name: 'AbortError' });
    ctrl.abort();
    await assertion;
    expect(SilentWorker.instances[0].terminated).toBe(true);
  });
});
