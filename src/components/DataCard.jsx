import React, { useState } from 'react';
import styles from './DataCard.module.css';
import SectionPanel from './SectionPanel';

const EXCLUDED = ['__v', '_id', 'created_at', 'updated_at','deleted_at'];

export default function DataCard({ item, idKey, onUpdate, onDelete, queCards = [], onAddQueCard, onUpdateQueCard, onDeleteQueCard }) {
  console.log(item);
  const [expanded, setExpanded] = useState(false);
  const id = item[idKey];
  const allKeys = Object.keys(item).filter((k) => !EXCLUDED.includes(k));
  const previewKeys = allKeys.slice(0, 3);
  const extraKeys = allKeys.slice(3);

  return (
    <div className={styles.card}>
      <div className={styles.row} onClick={() => setExpanded((x) => !x)}>
        <span className={styles.idTag}>#{id}</span>

        <div className={styles.preview}>
          {previewKeys.map((k) => (
            <div key={k} className={styles.previewItem}>
              <span className={styles.previewKey}>{k}</span>
              <span className={styles.previewVal}>
                {String(item[k]).length > 30 ? String(item[k]).slice(0, 30) + '…' : String(item[k])}
              </span>
            </div>
          ))}
        </div>

        {/* <div className={styles.actions} onClick={(e) => e.stopPropagation()}> */}
        {/* <button className={styles.editBtn} onClick={() => onUpdate(item)}>
            ✏️ Edit
          </button> */}
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.editBtn}
            onClick={() => {
              onUpdate(item);
            }}>
            ✏️ Edit
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(id)}>
            🗑️
          </button>
          <span className={`${styles.chevron} ${expanded ? styles.up : ''}`}>▾</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.detail}>
          <div className={styles.grid}>
            {allKeys.map((k) => (
              <div key={k} className={styles.cell}>
                <span className={styles.cellKey}>{k}</span>
                <span className={styles.cellVal}>{String(item[k])}</span>
              </div>
            ))}
          </div>
          {idKey === 'lm_id' && (
            <div className={styles.queCardsSection} style={{ marginTop: '20px' }}>
              {/* <h5>Que Cards ({queCards.length})</h5> */}
              <SectionPanel
                title="Que Cards"
                count={queCards?.length ?? 0}
                color="amber"
                onAdd={() => onAddQueCard?.(item)}
                addLabel="Add Que Card">
                {queCards.map((card) => (
                  <div style={{ marginLeft: '30px' }} key={card.q_id}>
                    <DataCard
                      key={card.q_id}
                      item={card}
                      idKey="q_id"
                      onUpdate={onUpdateQueCard ?? onUpdate}
                      onDelete={onDeleteQueCard ?? onDelete}
                      onAddQueCard={onAddQueCard}
                    />
                  </div>
                ))}
              </SectionPanel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
