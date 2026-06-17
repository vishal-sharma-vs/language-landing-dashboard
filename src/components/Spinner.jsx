import React from 'react';
import styles from './Spinner.module.css';

export default function Spinner() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.ring} />
      <span className={styles.label}>Loading…</span>
    </div>
  );
}
