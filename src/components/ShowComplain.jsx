import React, { useEffect, useMemo, useState } from 'react';
import { getComplaints, updateComplaint } from '../utils/complaintsStorage';

const ShowComplain = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all'); // all | pending | action_taken
  const [draftActions, setDraftActions] = useState({});

  const refresh = () => setComplaints(getComplaints());

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (e.key) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  const setDraft = (id, value) => {
    setDraftActions((prev) => ({ ...prev, [id]: value }));
  };

  const markActionTaken = (id) => {
    const actionText = (draftActions[id] ?? '').trim();
    updateComplaint(id, {
      status: 'action_taken',
      adminAction: actionText,
    });
    refresh();
  };

  const markPending = (id) => {
    updateComplaint(id, {
      status: 'pending',
    });
    refresh();
  };

  return (
    <div className="dashboard-section">
      <h2>Show Complaints</h2>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          className={`action-btn ${filter === 'all' ? 'primary' : 'tertiary'}`}
          onClick={() => setFilter('all')}
          type="button"
        >
          All
        </button>
        <button
          className={`action-btn ${filter === 'pending' ? 'primary' : 'tertiary'}`}
          onClick={() => setFilter('pending')}
          type="button"
        >
          Pending
        </button>
        <button
          className={`action-btn ${filter === 'action_taken' ? 'primary' : 'tertiary'}`}
          onClick={() => setFilter('action_taken')}
          type="button"
        >
          Action taken
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#666' }}>No complaints found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#f8f9fa',
                borderRadius: 12,
                padding: 14,
                borderLeft: `4px solid ${c.status === 'action_taken' ? '#28a745' : '#667eea'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#333' }}>{c.title}</div>
                  <div style={{ color: '#666', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                    {c.description}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                    <span style={{ fontWeight: 700 }}>Student:</span> {c.studentName || '—'}{' '}
                    <span style={{ color: '#999' }}>({c.studentId || 'unknown'})</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: c.status === 'action_taken' ? '#ecfdf3' : '#eef2ff',
                      color: c.status === 'action_taken' ? '#067647' : '#3730a3',
                    }}
                  >
                    {c.status === 'action_taken' ? 'Action taken' : 'Pending'}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontWeight: 700, color: '#333' }}>Admin action / notes</label>
                  <textarea
                    rows={3}
                    value={draftActions[c.id] ?? c.adminAction ?? ''}
                    onChange={(e) => setDraft(c.id, e.target.value)}
                    placeholder="Write what action you took..."
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {c.status !== 'action_taken' ? (
                    <button
                      className="action-btn secondary"
                      type="button"
                      onClick={() => markActionTaken(c.id)}
                    >
                      Mark action taken
                    </button>
                  ) : (
                    <button className="action-btn tertiary" type="button" onClick={() => markPending(c.id)}>
                      Move back to pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowComplain;

