import React from 'react';
import styles from './Badge.module.css';

export default function Badge({ children, color = 'indigo' }) {
  return (
    <span className={`${styles.badge} ${styles[color]}`}>
      {children}
    </span>
  );
}
