import { describe, expect, it } from 'vitest';
import { convertBases } from './numBase';

describe('convertBases', () => {
  it('convertBases_255Decimal_donneFFHexadecimal', () => {
    expect(convertBases('255', 10)).toEqual({ bin: '11111111', oct: '377', dec: '255', hex: 'FF' });
  });
  it('convertBases_hexa64Bits_neperdPasDePrecision', () => {
    const r = convertBases('ffffffffffffffff', 16)!;
    expect(r.dec).toBe('18446744073709551615');
    expect(r.bin).toBe('1'.repeat(64));
    expect(r.hex).toBe('FFFFFFFFFFFFFFFF');
  });
  it('convertBases_decimalTresGrand_roundTripExact', () => {
    const r = convertBases('123456789012345678901234567890', 10)!;
    expect(convertBases(r.hex, 16)!.dec).toBe('123456789012345678901234567890');
  });
  it('convertBases_zero_donneZero', () => {
    expect(convertBases('0', 2)).toEqual({ bin: '0', oct: '0', dec: '0', hex: '0' });
  });
  it('convertBases_caracteresInvalides_renvoieNull', () => {
    expect(convertBases('12', 2)).toBeNull();
    expect(convertBases('', 10)).toBeNull();
  });
});
