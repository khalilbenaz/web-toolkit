import { describe, expect, it } from 'vitest';
import { convertBases } from './numBase';

describe('convertBases', () => {
  it('convertBases_255Decimal_donneFFHexadecimal', () => {
    expect(convertBases('255', 10)).toEqual({ bin: '11111111', oct: '377', dec: '255', hex: 'FF' });
  });
});
