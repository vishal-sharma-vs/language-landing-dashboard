import React, { useState } from 'react';
import styles from './Modal.module.css';

export default function CloneLanguageModal({ lId, onClose, onDone, showToast }) {
  const [lName, setLName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    if (!lName.trim()) {
      showToast('Language name (l_name) is required', 'error');
      return;
    }
    setLoading(true);
    try {
      const { cloneLanguage } = await import('../api/index.js');
      // cloneResponse shape (after data-envelope unwrap):
      // { newLanguage: { l_id: <new_id>, ... }, ... }
      const cloneResponse = await cloneLanguage(lId, lName.trim());
      // Pass full response to parent — it will extract the new l_id
      onDone(cloneResponse);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Clone Language</h3>
          <div className={styles.idPill}>
            <span className={styles.idLabel}>l_id</span>
            <span className={styles.idValue}>{lId}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <p className={styles.cloneNote}>
            A new language will be created as a copy of <strong>l_id: {lId}</strong>.
            A new ID will be assigned automatically and loaded on the dashboard.
          </p>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>New Language Name (l_name) *</label>
            <input
              className={styles.fieldInput}
              value={lName}
              onChange={e => setLName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleClone()}
              placeholder="Must be unique, e.g. Spanish_v2"
              autoFocus
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.cloneBtn} onClick={handleClone} disabled={loading}>
            {loading ? 'Cloning…' : '📋 Clone'}
          </button>
        </div>
      </div>
    </div>
  );
}
