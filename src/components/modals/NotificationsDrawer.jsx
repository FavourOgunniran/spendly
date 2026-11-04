import React from 'react';
import './Modals.css';

export const NotificationsDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Project Deadline Alert',
      message: 'Develop API Endpoints is due in 5 days.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Task Completed',
      message: 'Alexandra Deff marked Github Repo as Completed.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Meeting in 1 Hour',
      message: 'Meeting with Arc Company starts at 02:00 PM.',
      time: '2h ago',
      unread: false,
    },
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h4 className="drawer-title">Notifications</h4>
          <button type="button" className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-list">
          {notifications.map((n) => (
            <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
              <div className="notification-top">
                <span className="notif-title">{n.title}</span>
                <span className="notif-time">{n.time}</span>
              </div>
              <p className="notif-message">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
