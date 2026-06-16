import React, { useState } from "react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      title: "Critical Gas Leak",
      message: "Gas level exceeded 400 ppm. Immediate action required!",
      timestamp: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "warning",
      title: "Elevated Gas Level",
      message: "Gas concentration reached 320 ppm.",
      timestamp: "15 minutes ago",
      unread: true,
    },
    {
      id: 3,
      type: "info",
      title: "System Update",
      message: "Sensor firmware updated successfully.",
      timestamp: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      type: "warning",
      title: "Warning Threshold",
      message: "Gas level approaching warning threshold.",
      timestamp: "3 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "info",
      title: "Scheduled Maintenance",
      message: "System maintenance scheduled for tomorrow at 2 AM.",
      timestamp: "5 hours ago",
      unread: false,
    },
  ]);

  const [filter, setFilter] = useState("all");

  const handleMarkAsRead = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, unread: false } : alert
      )
    );
  };

  const handleDismiss = (id) => {
    if (window.confirm("Are you sure you want to dismiss this alert?")) {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }
  };

  const handleMarkAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, unread: false })));
    alert("All alerts marked as read!");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all alerts?")) {
      setAlerts([]);
      alert("All alerts cleared!");
    }
  };

  const handleViewDetails = (alert) => {
    alert(`Alert Details:\n\nType: ${alert.type.toUpperCase()}\nTitle: ${alert.title}\nMessage: ${alert.message}\nTime: ${alert.timestamp}\nStatus: ${alert.unread ? "Unread" : "Read"}`);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    if (filter === "unread") return alert.unread;
    return alert.type === filter;
  });

  const unreadCount = alerts.filter((a) => a.unread).length;

  return (
    <div className="page-content alerts-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Alert Center</h2>
          <p className="page-subtitle">
            Manage and review system notifications ({unreadCount} unread)
          </p>
        </div>
        <div className="page-actions">
          <button className="page-action-btn" onClick={handleMarkAllAsRead}>
            ✓ Mark All as Read
          </button>
          <button className="page-action-btn" onClick={handleClearAll}>
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="alert-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({alerts.length})
        </button>
        <button
          className={`filter-btn ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === "critical" ? "active" : ""}`}
          onClick={() => setFilter("critical")}
        >
          🚨 Critical ({alerts.filter((a) => a.type === "critical").length})
        </button>
        <button
          className={`filter-btn ${filter === "warning" ? "active" : ""}`}
          onClick={() => setFilter("warning")}
        >
          ⚠️ Warning ({alerts.filter((a) => a.type === "warning").length})
        </button>
        <button
          className={`filter-btn ${filter === "info" ? "active" : ""}`}
          onClick={() => setFilter("info")}
        >
          ℹ️ Info ({alerts.filter((a) => a.type === "info").length})
        </button>
      </div>

      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔕</div>
            <p>No alerts to display</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${alert.type} ${alert.unread ? "unread" : ""}`}
            >
              <div className="alert-indicator">
                {alert.type === "critical" && "🚨"}
                {alert.type === "warning" && "⚠️"}
                {alert.type === "info" && "ℹ️"}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h4 className="alert-title">{alert.title}</h4>
                  {alert.unread && <span className="unread-badge">New</span>}
                </div>
                <p className="alert-message">{alert.message}</p>
                <span className="alert-timestamp">{alert.timestamp}</span>
              </div>
              <div className="alert-actions">
                <button
                  className="alert-action-btn"
                  title="View Details"
                  onClick={() => handleViewDetails(alert)}
                >
                  👁️
                </button>
                {alert.unread && (
                  <button
                    className="alert-action-btn"
                    title="Mark as Read"
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    ✓
                  </button>
                )}
                <button
                  className="alert-action-btn"
                  title="Dismiss"
                  onClick={() => handleDismiss(alert.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}