import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function AlertPopup({ type, close }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (type) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 350);
      return () => clearTimeout(timer);
    }
  }, [type]);

  if (!shouldRender) return null;

  let title = "";
  let message = "";
  let icon = "";
  let className = "";

  if (type === "leak") {
    title = "Critical Alert";
    message = "Dangerous gas leakage detected! Evacuate immediately and ventilate the area.";
    icon = "🚨";
    className = "leak";
  }

  if (type === "high") {
    title = "Warning";
    message = "Gas concentration is elevated. Monitor closely and ensure proper ventilation.";
    icon = "⚠️";
    className = "high";
  }

  if (type === "offline") {
    title = "System Alert";
    message = "Unable to receive data from sensor. Check connection and power supply.";
    icon = "📡";
    className = "offline";
  }

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(close, 350);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return createPortal(
    <div
      className={`popup-overlay ${isVisible ? "visible" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className={`popup-card ${className} ${isVisible ? "visible" : ""}`}>
        <div className="popup-icon-wrapper">
          <span className="popup-icon">{icon}</span>
          <div className="popup-ripple"></div>
          <div className="popup-ripple delay-1"></div>
          <div className="popup-ripple delay-2"></div>
        </div>

        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>

        <div className="popup-actions">
          <button className="popup-close-btn" onClick={handleClose}>
            Acknowledge
          </button>
        </div>

        {type === "leak" && (
          <div className="popup-emergency-strip">
            <span>EMERGENCY PROTOCOL ACTIVE</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}