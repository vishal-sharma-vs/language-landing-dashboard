import { useCallback, useMemo, useState } from 'react';
import * as api from '../api/index.js';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import pageStyles from './Page.module.css';
import styles from './OverQuotaUsersPage.module.css';

const GENDER_LABELS = {
  1: 'Male',
  2: 'Female',
};

function formatGender(value) {
  return GENDER_LABELS[value] ?? String(value);
}

function SortableHeader({ label, sortKey, activeKey, direction, onSort }) {
  const isActive = activeKey === sortKey;
  const icon = isActive ? (direction === 'asc' ? '↑' : '↓') : '↕';

  return (
    <th>
      <button
        type="button"
        className={`${styles.sortableTh} ${isActive ? styles.sortableThActive : ''}`}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <span className={styles.sortIcon} aria-hidden="true">
          {icon}
        </span>
      </button>
    </th>
  );
}

export default function OverQuotaUsersPage() {
  const [studyId, setStudyId] = useState('');
  const [cntFilter, setCntFilter] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviving, setReviving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [toast, showToast] = useToast();

  const fetchDataByStudyId = useCallback(
    async (id) => {
      if (!id || !String(id).trim()) {
        showToast('Enter a valid study_id', 'error');
        return;
      }
      setLoading(true);
      setUsers(null);
      setCntFilter('');
      setSortKey(null);
      setSortDir('asc');
      setSelectedIds(new Set());
      try {
        const res = await api.getOverQuotaUsers(id);
        setUsers(res);
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const fetchData = () => fetchDataByStudyId(studyId);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const query = cntFilter.trim();
    if (!query) return users;
    return users.filter((user) => String(user.cnt_id).includes(query));
  }, [users, cntFilter]);

  const displayUsers = useMemo(() => {
    if (!sortKey) return filteredUsers;

    const list = [...filteredUsers];
    const multiplier = sortDir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      return (Number(aVal) - Number(bVal)) * multiplier;
    });

    return list;
  }, [filteredUsers, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
  };

  const filteredIds = useMemo(
    () => filteredUsers.map((user) => user.wh_mo_id),
    [filteredUsers],
  );

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));

  const toggleSelect = (whMoId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(whMoId)) next.delete(whMoId);
      else next.add(whMoId);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleRevive = async () => {
    const wh_mo_ids = Array.from(selectedIds);
    if (!wh_mo_ids.length) return;

    setReviving(true);
    try {
      await api.reviveOverQuotaUsers(wh_mo_ids);
      showToast(`Revived ${wh_mo_ids.length} user${wh_mo_ids.length !== 1 ? 's' : ''} successfully.`);
      setSelectedIds(new Set());
      await fetchDataByStudyId(studyId);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setReviving(false);
    }
  };

  const selectedCount = selectedIds.size;
  const isEmpty = users && users.length === 0;
  const noFilterMatches = users?.length > 0 && filteredUsers.length === 0;

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <Toast {...toast} />

      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Over Quota Users</h1>
        <p className={pageStyles.pageSubtitle}>
          Fetch over-quota respondents for a study and filter results by contact ID (cnt_id).
        </p>
      </div>

      <SearchBar
        label="Study ID (study_id)"
        placeholder="e.g. 1234"
        value={studyId}
        onChange={setStudyId}
        onFetch={fetchData}
        loading={loading}
      />

      {loading && <Spinner />}

      {users && !loading && (
        <div className={pageStyles.results}>
          {isEmpty && <EmptyState id={studyId} label="study_id" />}

          {!isEmpty && (
            <>
              <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="cnt-filter">
                    Filter by cnt_id
                  </label>
                  <input
                    id="cnt-filter"
                    className={styles.filterInput}
                    type="text"
                    inputMode="numeric"
                    value={cntFilter}
                    onChange={(e) => setCntFilter(e.target.value)}
                    placeholder="e.g. 19302"
                  />
                </div>
                <div className={styles.stats}>
                  <span>
                    Showing <strong>{displayUsers.length}</strong> of{' '}
                    <strong>{users.length}</strong> users
                  </span>
                  {selectedCount > 0 && (
                    <span>
                      <strong>{selectedCount}</strong> selected
                    </span>
                  )}
                  {cntFilter.trim() && (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={() => setCntFilter('')}
                    >
                      Clear filter
                    </button>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.selectAllBtn}
                    onClick={handleSelectAllFiltered}
                    disabled={filteredIds.length === 0}
                  >
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    className={styles.reviveBtn}
                    onClick={handleRevive}
                    disabled={selectedCount < 1 || reviving}
                  >
                    {reviving ? 'Reviving…' : 'Revive'}
                  </button>
                </div>
              </div>

              {noFilterMatches ? (
                <div className={styles.noMatches}>
                  No users match cnt_id filter &ldquo;{cntFilter.trim()}&rdquo;.
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.checkboxCol}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={allFilteredSelected}
                            onChange={handleSelectAllFiltered}
                            disabled={filteredIds.length === 0}
                            aria-label="Select all filtered users"
                          />
                        </th>
                        <th>wh_mo_id</th>
                        <th>cnt_id</th>
                        <SortableHeader
                          label="age"
                          sortKey="age"
                          activeKey={sortKey}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="gender"
                          sortKey="gender"
                          activeKey={sortKey}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                        <th>quota_data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayUsers.map((user) => {
                        const isSelected = selectedIds.has(user.wh_mo_id);
                        return (
                        <tr
                          key={`${user.wh_mo_id}-${user.cnt_id}`}
                          className={isSelected ? styles.selectedRow : undefined}
                        >
                          <td className={styles.checkboxCol}>
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                              checked={isSelected}
                              onChange={() => toggleSelect(user.wh_mo_id)}
                              aria-label={`Select wh_mo_id ${user.wh_mo_id}`}
                            />
                          </td>
                          <td className={styles.mono}>{user.wh_mo_id}</td>
                          <td className={styles.mono}>{user.cnt_id}</td>
                          <td>{user.age}</td>
                          <td>
                            <span className={styles.genderBadge}>
                              {formatGender(user.gender)}
                            </span>
                          </td>
                          <td>
                            <ul className={styles.quotaList}>
                              {(user.quota_data ?? []).map((quota) => (
                                <li key={quota.cnq_id} className={styles.quotaItem}>
                                  <span className={styles.quotaId}>{quota.cnq_id}</span>
                                  <span className={styles.quotaName}>{quota.quota_name}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
