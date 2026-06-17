import React from 'react';
import styles from './EmptyState.module.css';

export default function EmptyState({ id, label = 'id' }) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>🔍</span>
      <p className={styles.msg}>No data found for {label}: <strong>{id}</strong></p>
      <p className={styles.hint}>Check the ID and try again.</p>
    </div>
  );
}
