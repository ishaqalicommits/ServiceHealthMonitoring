import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'UP':
      return (
        <span className="badge-status badge-status-up">
          <span className="status-dot status-dot-up"></span> UP
        </span>
      );
    case 'DOWN':
      return (
        <span className="badge-status badge-status-down">
          <span className="status-dot status-dot-down"></span> DOWN
        </span>
      );
    case 'PAUSED':
      return (
        <span className="badge-status badge-status-paused">
          <span className="bi bi-pause-circle me-1"></span> PAUSED
        </span>
      );
    default:
      return (
        <span className="badge-status badge-status-unknown">
          UNKNOWN
        </span>
      );
  }
};
