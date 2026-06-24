import React from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({
  label, placeholder, value, onChange,
  onFetch, onClone, loading, cloneLoading,
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>{label}</label>
        <input
          className={styles.input}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onFetch()}
          placeholder={placeholder}
          type="number"
        />
      </div>
      <div className={styles.btnGroup}>
        <button
          className={`${styles.btn} ${styles.fetchBtn}`}
          onClick={onFetch}
          disabled={loading}
        >
          {loading ? (
            <><span className={styles.btnSpinner} /> Loading…</>
          ) : (
            <><span>🔍</span> Fetch</>
          )}
        </button>
        {onClone && (
          <button
            className={`${styles.btn} ${styles.cloneBtn}`}
            onClick={onClone}
            disabled={cloneLoading}
          >
            {cloneLoading ? (
              <><span className={styles.btnSpinner} /> Cloning…</>
            ) : (
              <><span>📋</span> Clone</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
