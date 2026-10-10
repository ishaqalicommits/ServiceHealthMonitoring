import React from 'react';

export const MetricCard = ({ title, value, unit, subtext, colorClass = 'text-primary' }) => {
  return (
    <div className="metric-card h-100">
      <div className="metric-title">{title}</div>
      <div className={`metric-value ${colorClass}`}>
        {value}
        {unit && <span className="fs-6 fw-normal text-muted ms-1">{unit}</span>}
      </div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
};
