import { useCallback, useState } from 'react';
import * as api from '../api/index.js';
import AddModal from '../components/AddModal';
import CloneLanguageModal from '../components/CloneLanguageModal';
import ConfirmModal from '../components/ConfirmModal';
import DataCard from '../components/DataCard';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import SectionPanel from '../components/SectionPanel';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import UpdateModal from '../components/UpdateModal';
import { useToast } from '../hooks/useToast';
import styles from './Page.module.css';

// ── Field definitions for Add modals ─────────────────────────────────────────

const LANGUAGE_MODULE_FIELDS = [
  { key: 'l_id', label: 'Language ID (l_id)', type: 'number', required: true, placeholder: 'e.g. 260' },
  { key: 'lm_type', label: 'Module Type', type: 'text', required: true, placeholder: 'e.g. Take Survey' },
];

const QUE_CARD_FIELDS = [
  { key: 'q_lm_id', label: 'Language Module ID (lm_id)', type: 'number', required: true, placeholder: 'e.g. 2273' },
  { key: 'q_type', label: 'Question Type', type: 'text', required: true, placeholder: 'e.g. default' },
  { key: 'q_sequence', label: 'Sequence', type: 'number', required: false, placeholder: 'e.g. 1' },
  { key: 'q_title', label: 'Title', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'q_body', label: 'Body', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'q_footer', label: 'Footer', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'q_error', label: 'Error', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'q_placeholder', label: 'Placeholder', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'q_error_msg', label: 'Error_msg', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'q_required', label: 'Required', type: 'number', required: false, placeholder: 'e.g. 1 or 0' },
  { key: 'q_buttons', label: 'Buttons', type: 'text', required: false, placeholder: 'e.g. abc' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LanguagePage() {
  const [lId, setLId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, showToast] = useToast();

  const [updateTarget, setUpdateTarget] = useState(null); // { item, idKey }
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, idKey }
  const [cloneOpen, setCloneOpen] = useState(false);
  const [addModal, setAddModal] = useState(null); // 'module' | 'quecard' | null

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDataById = useCallback(
    async (id) => {
      if (!id || !String(id).trim()) {
        showToast('Enter a valid l_id', 'error');
        return;
      }
      setLoading(true);
      setData(null);
      try {
        const res = await api.getLanguage(id);
        setData(res);
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const fetchData = () => fetchDataById(lId);

  // ── Clone ──────────────────────────────────────────────────────────────────

  const openClone = () => {
    if (!lId.trim()) {
      showToast('Enter l_id first', 'error');
      return;
    }
    setCloneOpen(true);
  };

  const handleCloneDone = (cloneResponse) => {
    setCloneOpen(false);
    const newId = cloneResponse?.newLanguage?.l_id ?? cloneResponse?.language?.l_id ?? cloneResponse?.l_id ?? null;
    if (newId) {
      const s = String(newId);
      setLId(s);
      fetchDataById(s);
      showToast(`Cloned! Now showing new l_id: ${newId}`);
    } else {
      fetchData();
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  // FIX #4: throw on error so UpdateModal stays open and false-success toast never fires

  const handleUpdate = async (fields) => {
    const { item, idKey } = updateTarget;
    try {
      // FIX #2: updateLanguage already sends { [idKey]: value, update: fields }
      await api.updateLanguage(idKey, item[idKey], fields);
      showToast('Record updated successfully!');
      setUpdateTarget(null); // close modal only on success
      fetchDataById(lId);
    } catch (e) {
      showToast(e.message, 'error');
      throw e; // re-throw so UpdateModal's catch knows it failed (keeps modal open)
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    const { id, idKey } = deleteTarget;
    try {
      await api.deleteLanguage(idKey, id);
      showToast('Record deleted.');
      setDeleteTarget(null);
      fetchDataById(lId);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Add Language Module ────────────────────────────────────────────────────

  const handleAddModule = async (payload) => {
    // Pre-fill l_id if not provided by user
    try {

      const body = { ...payload, l_id: payload.l_id || Number(lId) };
      await api.addLanguageModule(body); // throws on error — AddModal handles it
      showToast('Language Module added!');
      setAddModal(null);
      fetchDataById(lId);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Add Que Card ───────────────────────────────────────────────────────────

  const openAddQueCardModal = (module) => {
    setAddModal({
      type: 'quecard',
      module,
    });
  };

  const handleAddQueCard = async (payload) => {
    try {

      await api.addQueCard(payload); // throws on error — AddModal handles it
      showToast('Que Card added!');
      setAddModal(null);
      fetchDataById(lId);
    } catch (e) {
      showToast(e.message,'error')
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const isEmpty = data && !data.languages?.length && !data.language_modules?.length && !data.que_cards?.length;

  return (
    <div className={styles.page}>
      <Toast {...toast} />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Language Management</h1>
        <p className={styles.pageSubtitle}>Browse and manage Language records, Modules, and Que Cards.</p>
      </div>

      <SearchBar
        label="Language ID (l_id)"
        placeholder="e.g. 260"
        value={lId}
        onChange={setLId}
        onFetch={fetchData}
        onClone={openClone}
        loading={loading}
      />

      {loading && <Spinner />}

      {data && !loading && (
        <div className={styles.results}>
          {isEmpty && <EmptyState id={lId} label="l_id" />}

          {/* Languages — no add button (cloned or existing) */}
          {data.languages?.length > 0 && (
            <SectionPanel title="Languages" count={data.languages.length} color="indigo">
              {data.languages.map((item) => (
                <DataCard
                  key={item.l_id}
                  item={item}
                  idKey="l_id"
                  onUpdate={(i) => setUpdateTarget({ item: i, idKey: 'l_id' })}
                  onDelete={(id) => setDeleteTarget({ id, idKey: 'l_id' })}
                />
              ))}
            </SectionPanel>
          )}

          {/* Language Modules — with Add button */}
          {(data.language_modules?.length > 0 || data.languages?.length > 0) && (
            <SectionPanel
              title="Language Modules"
              count={data.language_modules?.length ?? 0}
              color="sky"
              onAdd={() => setAddModal('module')}
              addLabel="Add Module">
              {data.language_modules?.map((module) => (
                <DataCard
                  key={module.lm_id}
                  item={module}
                  idKey="lm_id"
                  queCards={data.que_cards?.filter((card) => Number(card.q_lm_id) === Number(module.lm_id)) || []}
                  onUpdate={(i) => setUpdateTarget({ item: i, idKey: 'lm_id' })}
                  onDelete={(id) => setDeleteTarget({ id, idKey: 'lm_id' })}
                  onAddQueCard={openAddQueCardModal}
                  onUpdateQueCard={(i) => setUpdateTarget({ item: i, idKey: 'q_id' })}
                  onDeleteQueCard={(id) => setDeleteTarget({ id, idKey: 'q_id' })}
                />
              ))}
            </SectionPanel>
          )}

          {/* {(data.que_cards?.length > 0 || data.language_modules?.length > 0) && (
            <SectionPanel
              title="Que Cards"
              count={data.que_cards?.length ?? 0}
              color="amber"
              onAdd={() => setAddModal('quecard')}
              addLabel="Add Que Card">
              {data.que_cards?.map((item) => (
                <DataCard
                  key={item.q_id}
                  item={item}
                  idKey="q_id"
                  onUpdate={(i) => setUpdateTarget({ item: i, idKey: 'q_id' })}
                  onDelete={(id) => setDeleteTarget({ id, idKey: 'q_id' })}
                />
              ))}
            </SectionPanel>
          )} */}
        </div>
      )}

      {/* ── Modals ── */}

      {updateTarget && (
        <UpdateModal
          item={updateTarget.item}
          idKey={updateTarget.idKey}
          onClose={() => setUpdateTarget(null)}
          onSave={handleUpdate}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete record #${deleteTarget.id}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {cloneOpen && (
        <CloneLanguageModal
          lId={lId}
          onClose={() => setCloneOpen(false)}
          onDone={handleCloneDone}
          showToast={showToast}
        />
      )}

      {addModal === 'module' && (
        <AddModal
          title="Add Language Module"
          fields={LANGUAGE_MODULE_FIELDS.map((f) => (f.key === 'l_id' ? { ...f, default: lId } : f))}
          onClose={() => setAddModal(null)}
          onSave={handleAddModule}
        />
      )}

      {/* {addModal === 'quecard' && (
        <AddModal
          title="Add Que Card"
          fields={QUE_CARD_FIELDS.map((f) =>
            // Pre-fill lm_id from the first module if only one exists
            f.key === 'q_lm_id' && data?.language_modules?.length === 1
              ? { ...f, default: String(data.language_modules[0].lm_id) }
              : f,
          )}
          onClose={() => setAddModal(null)}
          onSave={handleAddQueCard}
        />
      )} */}
      {addModal?.type === 'quecard' && (
        <AddModal
          title="Add Que Card"
          fields={QUE_CARD_FIELDS.map((f) =>
            f.key === 'q_lm_id'
              ? {
                  ...f,
                  default: String(addModal.module.lm_id),
                }
              : f,
          )}
          onClose={() => setAddModal(null)}
          onSave={handleAddQueCard}
        />
      )}
    </div>
  );
}
