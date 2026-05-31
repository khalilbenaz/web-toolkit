import { useState } from 'react';

type BaseKey = 'bin' | 'oct' | 'dec' | 'hex';

interface BaseField {
  key: BaseKey;
  label: string;
  radix: number;
  placeholder: string;
  pattern: RegExp;
}

const FIELDS: BaseField[] = [
  { key: 'bin', label: 'Binaire (base 2)',      radix: 2,  placeholder: '1010 0011…', pattern: /^[01]*$/ },
  { key: 'oct', label: 'Octal (base 8)',         radix: 8,  placeholder: '0-7 seulement', pattern: /^[0-7]*$/ },
  { key: 'dec', label: 'Décimal (base 10)',      radix: 10, placeholder: '0-9',        pattern: /^[0-9]*$/ },
  { key: 'hex', label: 'Hexadécimal (base 16)',  radix: 16, placeholder: '0-9 A-F',   pattern: /^[0-9a-fA-F]*$/ },
];

type Values = Record<BaseKey, string>;
type Errors = Record<BaseKey, boolean>;

const EMPTY: Values = { bin: '', oct: '', dec: '', hex: '' };
const NO_ERR: Errors = { bin: false, oct: false, dec: false, hex: false };

export default function NumBaseTool() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>(NO_ERR);

  function handleChange(key: BaseKey, raw: string) {
    const field = FIELDS.find((f) => f.key === key)!;

    // Autoriser le champ vide (reset global)
    if (raw === '') {
      setValues(EMPTY);
      setErrors(NO_ERR);
      return;
    }

    // Valider les caractères autorisés pour cette base
    if (!field.pattern.test(raw)) {
      // Caractère invalide : on met le champ en rouge sans écraser les autres
      setValues((prev) => ({ ...prev, [key]: raw }));
      setErrors((prev) => ({ ...prev, [key]: true }));
      return;
    }

    // Conversion via parseInt en big-int natif (safe pour de grands nombres ?)
    // parseInt peut perdre de la précision sur de très grands entiers mais suffit pour l'usage courant.
    const num = parseInt(raw, field.radix);
    if (!Number.isFinite(num) || num < 0) {
      setValues((prev) => ({ ...prev, [key]: raw }));
      setErrors((prev) => ({ ...prev, [key]: true }));
      return;
    }

    const newValues: Values = {
      bin: num.toString(2),
      oct: num.toString(8),
      dec: num.toString(10),
      hex: num.toString(16).toUpperCase(),
    };

    setValues(newValues);
    setErrors(NO_ERR);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="card space-y-2">
          <label className="lbl">{f.label}</label>
          <input
            type="text"
            spellCheck={false}
            className={`fld ${errors[f.key] ? 'border-red-500 text-red-400 focus:border-red-400' : ''}`}
            placeholder={f.placeholder}
            value={values[f.key]}
            onChange={(e) => handleChange(f.key, e.target.value)}
          />
          {errors[f.key] && (
            <p className="text-xs text-red-400">
              Caractère non valide pour la base {f.radix}.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
