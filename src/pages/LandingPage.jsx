import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SectionPanel from '../components/SectionPanel';
import DataCard from '../components/DataCard';
import UpdateModal from '../components/UpdateModal';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import * as api from '../api/index.js';
import styles from './Page.module.css';
import AddModal from '../components/AddModal.jsx';

const LANDING_SURVEY_QUESTION_FIELDS = [
  { key: 'lp_id', label: 'Landing Survey Question ID (lp_id)', type: 'number', required: true, placeholder: 'e.g. 2273' },
  { key: 'name', label: 'name', type: 'text', required: true, placeholder: 'e.g. abc' },
  { key: 'text', label: 'text', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'country', label: 'country', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'currency', label: 'currency', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'required', label: 'required', type: 'text', required: false, placeholder: 'e.g. true or false' },
  { key: 'options', label: 'options', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'placeholder', label: 'Placeholder', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'error_msg', label: 'Error_msg', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'regex', label: 'Regex', type: 'text', required: false, placeholder: 'e.g. abc' },
  { key: 'type', label: 'type', type: 'text', required: false, placeholder: 'e.g. abc' },
];

export default function LandingPageSection() {
  const [lpId, setLpId]           = useState('');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [toast, showToast]        = useToast();
  const [addModal, setAddModal] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [updateSurvey, setUpdateSurvey] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    if (!lpId.trim()) { showToast('Enter a valid lp_id', 'error'); return; }
    setLoading(true);
    setData(null);
    try {
      const res = await api.getLandingPage(lpId);
      setData(res);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    if (!lpId.trim()) { showToast('Enter lp_id first', 'error'); return; }
    setCloneLoading(true);
    try {
      await api.cloneLandingPage(lpId);
      showToast('Landing page cloned successfully!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setCloneLoading(false);
    }
  };

  const handleUpdate = async (fields) => {
    const { item, idKey } = updateTarget;
    try {
      await api.updateLandingPage(idKey, item[idKey], fields);
      showToast('Record updated successfully!');
      setUpdateTarget(null);   // close modal only on success
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
      throw e; // FIX #4: re-throw so UpdateModal stays open on error
    }
  };
  const handleUpdateSurvey = async (fields) => {
    const { item, idKey } = updateSurvey;
    try {
      await api.updateLandingSurveyQuestion(idKey, item[idKey], fields);
      showToast('Record updated successfully!');
      setUpdateSurvey(null);
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
      throw e;
    }
  }

  const handleDelete = async () => {
    const { id, idKey } = deleteTarget;
    try {
      await api.deleteLandingPage(idKey, id);
      showToast('Record deleted.');
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleAddModule = async (payload) => {
    // Pre-fill l_id if not provided by user
    try {

      const body = { ...payload, lp_id: payload.lp_id || Number(lpId) };
      await api.addLandingSurveyQuestion(body); // throws on error — AddModal handles it
      showToast('Landing Survey Question added!');
      setAddModal(null);
       fetchData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const isEmpty =
    data &&
    !data.landing_pages?.length &&
    !data.landing_survey_questions?.length;

  return (
    <div className={styles.page}>
      <Toast {...toast} />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Landing Page Management</h1>
        <p className={styles.pageSubtitle}>Browse and manage Landing Pages and their Survey Questions.</p>
      </div>

      <SearchBar
        label="Landing Page ID (lp_id)"
        placeholder="e.g. 10"
        value={lpId}
        onChange={setLpId}
        onFetch={fetchData}
        onClone={handleClone}
        loading={loading}
        cloneLoading={cloneLoading}
      />

      {loading && <Spinner />}

      {data && !loading && (
        <div className={styles.results}>
          {isEmpty && <EmptyState id={lpId} label="lp_id" />}

          {data.landing_pages?.length > 0 && (
            <SectionPanel title="Landing Pages" count={data.landing_pages.length} color="emerald">
              {data.landing_pages.map((item) => (
                <DataCard
                  key={item.lp_id}
                  item={item}
                  idKey="lp_id"
                  onUpdate={(i) => setUpdateTarget({ item: i, idKey: 'lp_id' })}
                  onDelete={(id) => setDeleteTarget({ id, idKey: 'lp_id' })}
                />
              ))}
            </SectionPanel>
          )}

          {data.landing_survey_questions?.length > 0 && (
            <SectionPanel
              title="Landing Survey Questions"
              count={data.landing_survey_questions.length}
              color="rose"
              onAdd={() => setAddModal('module')}
              addLabel="Add Module">
              {data.landing_survey_questions.map((item, i) => (
                <DataCard
                  key={item.id ?? i}
                  item={item}
                  idKey="id"
                  onUpdate={(it) => setUpdateSurvey({ item: it, idKey: 'id' })}
                  onDelete={(id) => setDeleteTarget({ id, idKey: 'id' })}
                />
              ))}
            </SectionPanel>
          )}
        </div>
      )}

      {/* Modals */}
      {updateTarget && (
        <UpdateModal
          item={updateTarget.item}
          idKey={updateTarget.idKey}
          onClose={() => setUpdateTarget(null)}
          onSave={handleUpdate}
        />
      )}
      {updateSurvey && (
        <UpdateModal
          item={updateSurvey.item}
          idKey={updateSurvey.idKey}
          onClose={() => setUpdateSurvey(null)}
          onSave={handleUpdateSurvey}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete record #${deleteTarget.id}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {addModal === 'module' && (
        <AddModal
          title="Add Language Module"
          fields={LANDING_SURVEY_QUESTION_FIELDS.map((f) => (f.key === 'lp_id' ? { ...f, default: lpId } : f))}
          onClose={() => setAddModal(null)}
          onSave={handleAddModule}
        />
      )}
    </div>
  );
}
