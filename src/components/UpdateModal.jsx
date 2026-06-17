import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';

const EXCLUDED = ['created_at', 'updated_at', '__v', '_id','deleted_at'];

// FIX #3: Parse a string back to its original type using the original value as reference.
// If the original was a number → parse as number, boolean → parse as boolean,
// null → null if empty, array/object → JSON.parse, otherwise keep as string.
// function castToOriginalType(originalValue, newStringValue) {
//   const str = newStringValue;

//   if (typeof originalValue === "String") return originalValue;

//   // If original was null and new value is empty, keep null
//   if (originalValue === null && str.trim() === '') return null;

//   // Boolean
//   if (typeof originalValue === 'boolean') {
//     if (str === 'true')  return true;
//     if (str === 'false') return false;
//     return originalValue; // invalid input, keep original
//   }

//   // Number
//   if (typeof originalValue === 'number') {
//     const n = Number(str);
//     return isNaN(n) ? originalValue : n;
//   }

//   // Array or Object — try JSON.parse
//   if (typeof originalValue === 'object' || Array.isArray(originalValue)) {
//     try { return JSON.parse(str); }
//     catch { return str; } // if invalid JSON, send as-is
//   }

//   // String (default)
//   return str;
// }

// Build the editable fields object, keeping original values for type reference
function buildFields(item, editableKeys) {
  return Object.fromEntries(editableKeys.map(k => [k, item[k] ?? '']));
}

// Serialize a value for display in the textarea
function serializeValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}

export default function UpdateModal({ item, idKey, onClose, onSave }) {
  const editableKeys = Object.keys(item).filter(
    k => k !== idKey && !EXCLUDED.includes(k)
  );

  // originalValues is the reference for type casting when saving
  const originalValues = buildFields(item, editableKeys);

  // jsonText is what is shown in the textarea (pretty-printed JSON of editableFields)
  // const formattedData = Object.fromEntries(
  //   editableKeys.map((k) => {
  //     let value = item[k];

  //     if (typeof value === 'string') {
  //       try {
  //         const parsed = JSON.parse(value);
  //         value = parsed;
  //       } catch {
  //         // not JSON, keep original
  //       }
  //     }

  //     return [k, value];
  //   }),
  // );
  const [jsonStringFields] = useState(() => {
    const fields = [];

    editableKeys.forEach((k) => {
      const value = item[k];

      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);

          if (Array.isArray(parsed) || (parsed !== null && typeof parsed === 'object')) {
            fields.push(k);
          }
        } catch {
          // not JSON string
        }
      }
    });

    return fields;
  });

  const formattedData = Object.fromEntries(
    editableKeys.map((k) => {
      let value = item[k];

      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);

          if (Array.isArray(parsed) || (parsed !== null && typeof parsed === 'object')) {
            jsonStringFields.push(k);
            value = parsed;
          }
        } catch {
          // leave as string
        }
      }

      return [k, value];
    }),
  );
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(formattedData,null, 2)
  );
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving]       = useState(false);

  // Validate JSON on every keystroke
  // useEffect(() => {
  //   try {
  //     JSON.parse(jsonText);
  //     setJsonError('');
  //   } catch (e) {
  //     setJsonError(e.message);
  //   }
  // }, [jsonText]);

  // FIX #3 + FIX #4: Parse JSON, cast each value to original type, then call onSave.
  // onSave must throw on API error — if it does, we stay open and show nothing extra.
  // const handleSave = async () => {
  //   if (jsonError) return; // don't submit if JSON is invalid
  //   setSaving(true);
  //   try {
  //     const parsed = JSON.parse(jsonText);
  //     // Cast each field to its original data type
  //     // const typedFields = {};
  //     // for (const k of Object.keys(parsed)) {
  //     //   typedFields[k] = castToOriginalType(originalValues[k],
  //     //     typeof parsed[k] === 'string' ? parsed[k] : JSON.stringify(parsed[k])
  //     //   );
  //     //   // But if the parsed value is already a non-string (number/bool/object/array),
  //     //   // use it directly — it came from JSON.parse so types are already preserved
  //     //   if (typeof parsed[k] !== 'string') {
  //     //     typedFields[k] = parsed[k];
  //     //   }
  //     // }
  //     // FIX #4: onSave is expected to throw on API error.
  //     // We only close if it resolves successfully.
  //     await onSave(parsed);
  //     // If onSave didn't throw, it succeeded — modal closes (parent handles it)
  //   } catch (e) {
  //     // API error already shown by parent via showToast — just stop saving state
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSave = async () => {
    if (jsonError) return;

    setSaving(true);

    try {
      const parsed = JSON.parse(jsonText);

      const payload = {};

      Object.keys(parsed).forEach((key) => {
        const originalValue = item[key];
        const newValue = parsed[key];

        // Backend originally stored as string
        if (typeof originalValue === 'string') {
          if (Array.isArray(newValue) || (typeof newValue === 'object' && newValue !== null)) {
            payload[key] = JSON.stringify(newValue);
          } else {
            payload[key] = String(newValue);
          }
        }
        // Backend originally stored as boolean
        else if (typeof originalValue === 'boolean') {
          payload[key] = Boolean(newValue);
        }
        // Backend originally stored as number
        else if (typeof originalValue === 'number') {
          payload[key] = Number(newValue);
        }
        // null or anything else
        else {
          payload[key] = newValue;
        }
      });

      await onSave(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panelWide} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Edit Record</h3>
          <div className={styles.idPill}>
            <span className={styles.idLabel}>{idKey}</span>
            <span className={styles.idValue}>{item[idKey]}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.jsonHint}>
            Edit the JSON below. Only the fields shown are sent as the <code>update</code> payload.
            Data types are preserved automatically.
          </div>

          <div className={styles.jsonWrap}>
            <textarea
              className={`${styles.jsonEditor} ${jsonError ? styles.jsonEditorError : ''}`}
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={Math.max(8, editableKeys.length * 2)}
              spellCheck={false}
            />
            {jsonError && (
              <div className={styles.jsonErrorMsg}>
                ⚠ Invalid JSON: {jsonError}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || !!jsonError}
            title={jsonError ? 'Fix JSON errors before saving' : ''}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
