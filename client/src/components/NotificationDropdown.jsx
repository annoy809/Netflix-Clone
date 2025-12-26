// /components/NotificationDropdown.jsx
import React from "react";
import "./NotificationDropdown.css";

/* ================= TIME FORMATTER ================= */
const timeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function NotificationDropdown({ notifications }) {
  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">Notifications</div>

      {notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`notification-item ${note.read ? "" : "unread"}`}
            >
              <div className="notif-message">{note.message}</div>
              <div className="notif-time">
                {note.createdAt?.toDate
                  ? timeAgo(note.createdAt.toDate())
                  : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="notification-empty">No new notifications</div>
      )}
    </div>
  );
}
