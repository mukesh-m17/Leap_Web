import React, { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 3200;
    const intervalTime = 40;
    const increment = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);

        if (next >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            setFadeOut(true);

            setTimeout(() => {
              onComplete();
            }, 650);
          }, 400);
        }

        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
      {/* Background Effects */}
      <div className="loading-grid"></div>
      <div className="loading-glow loading-glow-one"></div>
      <div className="loading-glow loading-glow-two"></div>

      {/* Floating Particles */}
      <div className="loading-particles">
        {[...Array(28)].map((_, index) => (
          <span
            key={index}
            className="loading-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 5}s`,
            }}
          ></span>
        ))}
      </div>

      {/* Main Loader */}
      <div className="loader-card">
        <div className="loader-orbit">
          <div className="loader-ring ring-one"></div>
          <div className="loader-ring ring-two"></div>
          <div className="loader-ring ring-three"></div>

          <div className="loader-core">
            <span className="loader-logo">⚡</span>
          </div>
        </div>

        <div className="loader-brand">
          <h1>GasGuard Pro</h1>
          <p>Smart Gas Safety Dashboard</p>
        </div>

        <div className="loader-status">
          <span className="loader-status-dot"></span>
          Initializing safety modules...
        </div>

        <div className="loader-progress-wrapper">
          <div className="loader-progress-bar">
            <div
              className="loader-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="loader-progress-meta">
            <span>System boot</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="loader-steps">
          <span className={progress > 20 ? "active" : ""}>Sensor Link</span>
          <span className={progress > 45 ? "active" : ""}>3D Engine</span>
          <span className={progress > 70 ? "active" : ""}>Analytics</span>
          <span className={progress > 92 ? "active" : ""}>Ready</span>
        </div>
      </div>

      <div className="loading-scan-line"></div>
    </div>
  );
}