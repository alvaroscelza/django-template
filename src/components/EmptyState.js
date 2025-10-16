import React from 'react';
export default function EmptyState({ iconClass, title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={iconClass}></i>
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-description">{description}</div>
    </div>
  );
} 