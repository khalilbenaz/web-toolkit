export type BaseKey = 'bin' | 'oct' | 'dec' | 'hex';

export interface BaseField {
  key: BaseKey;
  label: string;
  radix: number;
  placeholder: string;
  pattern: RegExp;
}

export const FIELDS: BaseField[] = [
  { key: 'bin', label: 'Binaire (base 2)',      radix: 2,  placeholder: '1010 0011…', pattern: /^[01]*$/ },
  { key: 'oct', label: 'Octal (base 8)',         radix: 8,  placeholder: '0-7 seulement', pattern: /^[0-7]*$/ },
  { key: 'dec', label: 'Décimal (base 10)',      radix: 10, placeholder: '0-9',        pattern: /^[0-9]*$/ },
  { key: 'hex', label: 'Hexadécimal (base 16)',  radix: 16, placeholder: '0-9 A-F',   pattern: /^[0-9a-fA-F]*$/ },
];

export type Values = Record<BaseKey, string>;

/** Convertit `raw` (écrit en base `radix`) vers les quatre bases, ou null si invalide. */
export function convertBases(raw: string, radix: number): Values | null {
  const num = parseInt(raw, radix);
  if (!Number.isFinite(num) || num < 0) return null;
  return {
    bin: num.toString(2),
    oct: num.toString(8),
    dec: num.toString(10),
    hex: num.toString(16).toUpperCase(),
  };
}
