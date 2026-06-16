import React, { useState } from "react";

export default function NavigationMenu({ currentPage, onPageChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "history", label: "History", icon: "📜" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "alerts", label: "Alerts", icon: "🔔" },
    { id: "reports", label: "Reports", icon: "📄" },
  ];

  const handleNavigation = (pageId) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => handleNavigation("dashboard")}>
            <div className="brand-icon">⚡</div>
            <div className="brand-text">
              <span className="brand-name">GasGuard</span>
              <span className="brand-subtitle">Pro</span>
            </div>
          </div>

          <div className="nav-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {currentPage === item.id && <div className="nav-indicator" />}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button className="nav-action-btn" title="Notifications">
              <span className="action-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="nav-action-btn" title="User Profile">
              <span className="action-icon">👤</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`hamburger ${isOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-brand">
              <div className="brand-icon">⚡</div>
              <span>GasGuard Pro</span>
            </div>
            <button
              className="mobile-menu-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="mobile-menu-items">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-menu-item ${
                  currentPage === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="mobile-item-icon">{item.icon}</span>
                <span className="mobile-item-label">{item.label}</span>
                {currentPage === item.id && (
                  <span className="mobile-item-check">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mobile-menu-footer">
            <button className="mobile-footer-btn" onClick={() => alert("Profile clicked")}>
              <span>👤</span> Profile
            </button>
            <button className="mobile-footer-btn" onClick={() => alert("Logout clicked")}>
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}