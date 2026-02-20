import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createComplaint, getComplaints } from '../utils/complaintsStorage';

const StudentComplain = () => {
  const { user } = useAuth();
  const studentId = useMemo(() => user?.email || user?.id || user?.name || '', [user]);
  const studentName = user?.name || 'Student';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complaints, setComplaints] = useState([]);

  const refresh = () => setComplaints(getComplaints());

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (e.key) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const myComplaints = useMemo(
    () => complaints.filter((c) => (c.studentId || '') === studentId),
    [complaints, studentId]
  );

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      setError('Please write both title and complaint details.');
      return;
    }

    createComplaint({
      studentId,
      studentName,
      title: t,
      description: d,
    });

    setTitle('');
    setDescription('');
    setSuccess('Complaint submitted successfully.');
    refresh();
  };

  return (
    <div className="dashboard-section">
      <h2>Any Complaints</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <label style={{ fontWeight: 600, color: '#333' }}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short complaint title"
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label style={{ fontWeight: 600, color: '#333' }}>Complaint</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your complaint details..."
            rows={4}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#b42318', background: '#fffbfa', padding: 12, borderRadius: 10 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#067647', background: '#ecfdf3', padding: 12, borderRadius: 10 }}>
            {success}
          </div>
        )}

        <div>
          <button type="submit" className="action-btn primary">
            Submit Complaint
          </button>
        </div>
      </form>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>My Complaints</h3>

        {myComplaints.length === 0 ? (
          <div style={{ color: '#666' }}>No complaints yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {myComplaints.map((c) => (
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

                {c.status === 'action_taken' && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: 6 }}>
                      Admin action
                    </div>
                    <div style={{ color: '#444', whiteSpace: 'pre-wrap' }}>
                      {c.adminAction || 'Action marked as taken.'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentComplain;

