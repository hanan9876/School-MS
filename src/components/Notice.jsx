import { useEffect, useState } from "react";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../utils/noticeStorage";
import './Dashboard.css';

export default function NoticesSection() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setNotices(getNotices());
  }, []);

  function handleAddOrUpdate() {
    if (!title.trim()) return;

    if (editingId) {
      updateNotice(editingId, { title, description });
    } else {
      createNotice({
        title,
        description,
        icon: "📢",
      });
    }

    setTitle("");
    setDescription("");
    setEditingId(null);
    setNotices(getNotices());
  }

  function handleEdit(notice) {
    setEditingId(notice.id);
    setTitle(notice.title);
    setDescription(notice.description);
  }

  function handleDelete(id) {
    deleteNotice(id);
    setNotices(getNotices());
  }

  return (
    <div className="dashboard-section">
      <h2>New Notices</h2>

      {/* Add / Edit Notice */}
      <div className="notice-form">
        <input
          type="text"
          placeholder="Notice title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Notice description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={handleAddOrUpdate}>
          {editingId ? "Update Notice" : "Add Notice"}
        </button>
      </div>

      {/* Notices List */}
      <div className="activity-list">
        {notices.length === 0 && <p>No notices available</p>}

        {notices.map((notice) => (
          <div className="activity-item" key={notice.id}>
            <div className="activity-icon">{notice.icon}</div>

            <div className="activity-content">
              <p>
                <strong>{notice.title}</strong>
                <br />
                {notice.description}
              </p>
              <span className="activity-time">
                {new Date(notice.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="activity-actions">
              <button onClick={() => handleEdit(notice)}>✏️</button>
              <button onClick={() => handleDelete(notice.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}