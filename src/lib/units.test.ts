import { describe, expect, it } from 'vitest';
import { convert, formatResult } from './units';

describe('units', () => {
  it('convert_kmEnM_multiplieParMille', () => {
    expect(convert(1, 'km', 'm', 'Longueur')).toBe(1000);
  });
  it('convert_celsiusEnFahrenheit_appliqueLaFormule', () => {
    expect(convert(100, 'C', 'F', 'Température')).toBe(212);
  });
  it('formatResult_zero_renvoieZero', () => {
    expect(formatResult(0)).toBe('0');
  });
});
