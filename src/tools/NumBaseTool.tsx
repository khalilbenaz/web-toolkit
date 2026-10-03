import { useState } from 'react';
import { FIELDS, convertBases, type BaseKey, type Values } from '../lib/numBase';

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

    const newValues = convertBases(raw, field.radix);
    if (!newValues) {
      setValues((prev) => ({ ...prev, [key]: raw }));
      setErrors((prev) => ({ ...prev, [key]: true }));
      return;
    }

    setValues(newValues);
    setErrors(NO_ERR);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="card space-y-2">
          <label className="lbl">{f.label}</label>
          <input
            aria-label={f.label}
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
