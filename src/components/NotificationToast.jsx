import React, { useEffect, useState } from "react";

export default function NotificationToast({ message, type = "info" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    danger: "🚨",
    error: "❌",
    success: "✅",
  };

  return (
    <div className={`notification-toast ${type} ${isVisible ? "visible" : ""}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <div className="toast-progress"></div>
    </div>
  );
}