import { describe, expect, it } from 'vitest';
import { runTask } from './tasks';

describe('runTask', () => {
  it('runTask_regex_deleguePourLaRegex', () => {
    const r = runTask('regex', { pattern: 'b', flags: 'g', text: 'abc' });
    expect(r.matches[0].index).toBe(1);
  });
  it('runTask_jsonFormat_formateLeJson', () => {
    expect(runTask('jsonFormat', { input: '[1]' })).toEqual({ ok: true, output: '[\n  1\n]' });
  });
  it('runTask_diff_retourneLesLignes', () => {
    const r = runTask('diff', { before: 'a', after: 'b' });
    expect(r.lines.map((l) => l.kind)).toEqual(['added', 'removed']);
    expect(r.error).toBe('');
  });
  it('runTask_diffTropGros_renvoieUneErreurAuLieuDeLever', () => {
    const big = Array.from({ length: 5000 }, (_, i) => `a${i}`).join('\n');
    const other = Array.from({ length: 5000 }, (_, i) => `b${i}`).join('\n');
    const r = runTask('diff', { before: big, after: other });
    expect(r.lines).toEqual([]);
    expect(r.error).toMatch(/trop/i);
  });
  it('runTask_csvToJson_convertit', () => {
    const r = runTask('csvToJson', { input: 'a;b\n1;2', delimiter: 'auto' });
    expect(JSON.parse(r.result)).toEqual([{ a: '1', b: '2' }]);
  });
});
