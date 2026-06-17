import React from 'react';
import styles from './Modal.module.css';

export default function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.confirmPanel} onClick={e => e.stopPropagation()}>
        <span className={styles.confirmIcon}>🗑️</span>
        <h3 className={styles.confirmTitle}>Confirm Delete</h3>
        <p className={styles.confirmMsg}>{message}</p>
        <div className={styles.confirmActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.deleteBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
