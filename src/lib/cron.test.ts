import { describe, expect, it } from 'vitest';
import { parseCron } from './cron';

describe('parseCron', () => {
  it('parseCron_semaineA9h_expliqueLaPlage', () => {
    const r = parseCron('0 9 * * 1-5');
    expect(r.error).toBe('');
    expect(r.summary).toBe('à 9h, du lun au ven.');
  });
  it('parseCron_quatreChamps_signaleLErreur', () => {
    expect(parseCron('* * * *').error).toMatch(/5 champs/);
  });
});
