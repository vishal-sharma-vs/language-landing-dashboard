import React, { useState } from 'react';
import styles from './Modal.module.css';

/**
 * Generic "Add Record" modal.
 * Props:
 *   title       – modal heading
 *   fields      – array of { key, label, type, placeholder, required }
 *   onClose     – close handler
 *   onSave      – async (formValues) => void — must throw on error
 */
export default function AddModal({ title, fields, onClose, onSave }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map(f => [f.key, f.default ?? '']))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const handleSave = async () => {
    // Basic required-field check
    for (const f of fields) {
      if (f.required && String(values[f.key]).trim() === '') {
        setError(`"${f.label}" is required`);
        return;
      }
    }
    setError('');
    setSaving(true);
    try {
      // Cast number fields
      const payload = {};
      for (const f of fields) {
        payload[f.key] = f.type === 'number' ? Number(values[f.key]) : values[f.key];
      }
      await onSave(payload);
      // Parent closes modal on success
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {fields.map(f => (
            <div key={f.key} className={styles.field}>
              <label className={styles.fieldLabel}>
                {f.label}{f.required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  className={styles.fieldInput}
                  style={{ minHeight: 80, resize: 'vertical' }}
                  value={values[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder ?? ''}
                />
              ) : (
                <input
                  className={styles.fieldInput}
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={values[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder ?? ''}
                />
              )}
            </div>
          ))}

          {error && (
            <div className={styles.inlineError}>⚠ {error}</div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Adding…' : '＋ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
