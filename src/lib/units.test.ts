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

describe('unités de données', () => {
  it('convert_KBEnOctets_vaut1000_SI', () => {
    expect(convert(1, 'KB', 'B', 'Données')).toBe(1000);
  });
  it('convert_MBEnKB_vaut1000', () => {
    expect(convert(1, 'MB', 'KB', 'Données')).toBe(1000);
  });
  it('convert_KiBEnOctets_vaut1024', () => {
    expect(convert(1, 'KiB', 'B', 'Données')).toBe(1024);
  });
  it('convert_GiBEnMiB_vaut1024', () => {
    expect(convert(1, 'GiB', 'MiB', 'Données')).toBe(1024);
  });
  it('convert_TiBEtPiB_existent', () => {
    expect(convert(1, 'TiB', 'GiB', 'Données')).toBe(1024);
    expect(convert(1, 'PiB', 'TiB', 'Données')).toBe(1024);
  });
});
