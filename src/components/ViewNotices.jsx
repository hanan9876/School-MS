import React, { useEffect, useState } from "react";
import { getNotices } from "../utils/noticeStorage";
import "./Dashboard.css";

const ViewNotices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    setNotices(getNotices());
  }, []);

  return (
    <div className="view-notices-container">
      <h2 className="view-notices-title">📢 School Notices</h2>

      {notices.length === 0 ? (
        <p className="no-notices">No notices available at the moment.</p>
      ) : (
        <div className="notice-list">
          {notices.map((notice) => (
            <div className="notice-card" key={notice.id}>
              <div className="notice-icon">{notice.icon || "📢"}</div>

              <div className="notice-body">
                <h4 className="notice-title">{notice.title}</h4>
                <p className="notice-description">{notice.description}</p>
                <span className="notice-time">
                  {new Date(notice.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewNotices;