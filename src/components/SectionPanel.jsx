import React from 'react';
import Badge from './Badge';
import styles from './SectionPanel.module.css';

const colorMap = {
  indigo:  '#6366f1',
  sky:     '#0ea5e9',
  amber:   '#f59e0b',
  emerald: '#10b981',
  rose:    '#f43f5e',
};

export default function SectionPanel({ title, count, color = 'indigo', onAdd, addLabel, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accent} style={{ background: colorMap[color] }} />
        <h2 className={styles.title}>{title}</h2>
        <Badge color={color}>{count} record{count !== 1 ? 's' : ''}</Badge>
        {onAdd && (
          <button className={styles.addBtn} onClick={onAdd}>
            ＋ {addLabel ?? 'Add'}
          </button>
        )}
      </div>
      <div className={styles.list}>
        {children}
      </div>
    </div>
  );
}
