import React from 'react';
import styles from './Toast.module.css';

export default function Toast({ visible, msg, type }) {
  if (!visible) return null;
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{type === 'error' ? '✕' : '✓'}</span>
      {msg}
    </div>
  );
}
