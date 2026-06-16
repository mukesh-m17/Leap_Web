import React from "react";

export default function StatusCard({ label, value, unit, trend, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        {icon && <span className="stat-card-icon">{icon}</span>}
        <p className="stat-card-label">{label}</p>
      </div>
      <div className="stat-card-content">
        <p className="stat-card-value">
          {value}
          {unit && (
            <span className="stat-card-unit">{unit}</span>
          )}
        </p>
        {trend && (
          <span className={`stat-card-trend ${trend > 0 ? "up" : "down"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-card-shimmer"></div>
    </div>
  );
}