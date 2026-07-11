import React, { useEffect, useState, useCallback, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase/config";
import NavigationMenu from "./NavigationMenu";
import Cylinder3D from "./Cylinder3D";
import GasChart from "./GasChart";
import AlertPopup from "./AlertPopup";
import StatusCard from "./StatusCard";
import NotificationToast from "./NotificationToast";
import AnalyticsPage from "./AnalyticsPage";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";
import AlertsPage from "./AlertsPage";
import ReportsPage from "./ReportsPage";

const DEVICE_PATH = "devices/device1";

function getGasStatus(value) {
  if (value > 1500) return "danger";
  if (value > 1000) return "warning";
  return "safe";
}

function getWeightStatus(weight) {
  if (weight <= 0.05) return "empty";
  if (weight <= 0.6) return "exhausted";
  if (weight <= 2.0) return "low";
  if (weight > 12.0) return "full";
  return "normal";
}

function getStatusLabel(status) {
  switch (status) {
    case "danger": return "CRITICAL";
    case "warning": return "ELEVATED";
    default: return "SAFE";
  }
}

export default function GasDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Real-time Firebase Data
  const [gasValue, setGasValue] = useState(0);
  const [cylinderWeight, setCylinderWeight] = useState(0);
  const [gasLeak, setGasLeak] = useState(false);
  const [cylinderStatus, setCylinderStatus] = useState("");
  const [relayStatus, setRelayStatus] = useState("OFF");
  const [buzzerStatus, setBuzzerStatus] = useState("OFF");
  // ✅ REMOVED: systemStatus state (was unused)

  // History Arrays
  const [gasHistory, setGasHistory] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);

  // UI States
  const [popup, setPopup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [gasTrend, setGasTrend] = useState(0);
  const [weightTrend, setWeightTrend] = useState(0);
  const [currentTab, setCurrentTab] = useState("gas");

  // Refs
  const previousGasRef = useRef(0);
  const previousWeightRef = useRef(0);

  // Add notification helper
  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Firebase Real-time Listener
  useEffect(() => {
    const deviceRef = ref(database, DEVICE_PATH);

    const unsubscribe = onValue(
      deviceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          const newGasValue = data.gasValue || 0;
          const newWeight = data.weight || 0;
          const leak = data.gasLeak || false;

          // Update states
          setGasValue(newGasValue);
          setCylinderWeight(newWeight);
          setGasLeak(leak);
          setCylinderStatus(data.cylinderStatus || "UNKNOWN");
          setRelayStatus(data.relayStatus || "OFF");
          setBuzzerStatus(data.buzzerStatus || "OFF");
          // ✅ REMOVED: setSystemStatus (was unused)
          setLastUpdate(new Date());
          setIsConnected(true);

          // Update history (keep last 50 readings)
          setGasHistory((prev) => {
            const updated = [...prev, newGasValue];
            return updated.slice(-50);
          });

          setWeightHistory((prev) => {
            const updated = [...prev, newWeight];
            return updated.slice(-50);
          });

          // Calculate trends
          if (previousGasRef.current > 0) {
            const change =
              ((newGasValue - previousGasRef.current) /
                Math.max(previousGasRef.current, 1)) *
              100;
            setGasTrend(change);
          }

          if (previousWeightRef.current > 0) {
            const wChange =
              ((newWeight - previousWeightRef.current) /
                Math.max(previousWeightRef.current, 1)) *
              100;
            setWeightTrend(wChange);
          }

          // GAS ALERTS
          if (leak && previousGasRef.current < 1500) {
            setPopup("leak");
            addNotification("🚨 CRITICAL: Gas leakage detected!", "danger");
          } else if (!leak && previousGasRef.current >= 1500) {
            addNotification("✓ Gas leak stopped", "success");
            setPopup(null);
          } else if (newGasValue > 1000 && previousGasRef.current <= 1000) {
            setPopup("high");
            addNotification("⚠️ WARNING: High gas concentration", "warning");
          }

          // WEIGHT ALERTS
          const weightStatus = getWeightStatus(newWeight);
          const prevWeightStatus = getWeightStatus(previousWeightRef.current);

          if (weightStatus === "empty" && prevWeightStatus !== "empty") {
            addNotification("❌ No cylinder detected", "warning");
          } else if (
            weightStatus === "exhausted" &&
            prevWeightStatus !== "exhausted"
          ) {
            addNotification("🛑 LPG Exhausted - Refill immediately!", "danger");
          } else if (weightStatus === "low" && prevWeightStatus !== "low") {
            addNotification("⚠️ Low LPG - Please refill soon", "warning");
          } else if (weightStatus === "full" && prevWeightStatus === "low") {
            addNotification("✅ Cylinder refilled successfully", "success");
          }

          previousGasRef.current = newGasValue;
          previousWeightRef.current = newWeight;
        } else {
          setIsConnected(false);
          setPopup("offline");
          addNotification("❌ Device offline - check connection", "error");
        }
      },
      (error) => {
        console.error("Firebase error:", error);
        setIsConnected(false);
        addNotification("❌ Connection error", "error");
      }
    );

    return () => unsubscribe();
  }, [addNotification]);

  // Calculated Values
  const gasStatus = getGasStatus(gasValue);
  const weightStatus = getWeightStatus(cylinderWeight);

  const maxGas = gasHistory.length ? Math.max(...gasHistory) : 0;
  const avgGas = gasHistory.length
    ? (gasHistory.reduce((a, b) => a + b, 0) / gasHistory.length).toFixed(1)
    : 0;

  const MAX_WEIGHT = 14.2;
  const fillPercentage = Math.min(
    (cylinderWeight / MAX_WEIGHT) * 100,
    100
  ).toFixed(1);
  const remainingWeight = Math.max(MAX_WEIGHT - cylinderWeight, 0).toFixed(1);

  const timeStr =
    lastUpdate?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) || "--:--:--";
  const dateStr =
    lastUpdate?.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) || "--/--/----";

  // Page Router
  const renderPage = () => {
    switch (currentPage) {
      case "analytics":
        return (
          <AnalyticsPage
            history={gasHistory}
            gas={gasValue}
            status={gasStatus}
          />
        );
      case "history":
        return (
          <HistoryPage history={gasHistory} weightHistory={weightHistory} />
        );
      case "settings":
        return <SettingsPage />;
      case "alerts":
        return <AlertsPage />;
      case "reports":
        return (
          <ReportsPage
            history={gasHistory}
            gas={gasValue}
            status={gasStatus}
          />
        );
      default:
        return (
          <>
            {/* Background Effects */}
            <div className="dashboard-bg-grid"></div>
            <div className="dashboard-particles">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${10 + Math.random() * 10}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* Header */}
            <div className="dashboard-header">
              <div className="header-left">
                <div className="header-badge">
                  <span className="header-badge-dot"></span>
                  IoT MONITORING SYSTEM v2.0
                </div>
                <h1>
                  Smart LPG
                  <br />
                  <span className="gradient-text">Cylinder Monitor</span>
                </h1>
                <p className="header-subtitle">
                  Real-time Gas Detection & Weight Analysis
                </p>
              </div>

              <div className="header-right">
                <div
                  className={`connection-status ${
                    isConnected ? "online" : "offline"
                  }`}
                >
                  <div className="status-indicator">
                    <span className="status-dot"></span>
                    <span className="status-pulse"></span>
                  </div>
                  <div className="status-info">
                    <span className="status-label">
                      {isConnected ? "LIVE" : "OFFLINE"}
                    </span>
                    <span className="status-time">{timeStr}</span>
                    <span className="status-date">{dateStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN GRID - DUAL MONITOR LAYOUT */}
            <div className="dual-monitor-grid">
              {/* LEFT COLUMN: GAS MONITORING */}
              <div className="monitor-section gas-monitor">
                <div className="section-header gas-header">
                  <h3>
                    <span className="section-icon">🔬</span> Gas Concentration
                    Monitor (MQ6)
                  </h3>
                  <span className={`live-badge ${gasStatus}`}>
                    {gasStatus.toUpperCase()}
                  </span>
                </div>

                <div className="monitor-content">
                  {/* Big Number Display */}
                  <div className="primary-display gas-primary">
                    <div className="display-value-container">
                      <span className="display-number">{gasValue}</span>
                      <span className="display-unit">ADC</span>
                    </div>

                    <div className="display-meta">
                      {gasTrend !== 0 && (
                        <span
                          className={`trend-indicator ${
                            gasTrend > 0 ? "up" : "down"
                          }`}
                        >
                          {gasTrend > 0 ? "▲" : "▼"}{" "}
                          {Math.abs(gasTrend).toFixed(1)}%
                        </span>
                      )}
                      <span className="update-time">Live</span>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mini-chart-container">
                    <h4>Real-time Trend</h4>
                    <GasChart data={gasHistory.slice(-20)} status={gasStatus} />
                  </div>

                  {/* Stats Row */}
                  <div className="quick-stats-row gas-stats">
                    <StatusCard
                      label="Max"
                      value={maxGas}
                      unit="ADC"
                      icon="📈"
                    />
                    <StatusCard
                      label="Average"
                      value={avgGas}
                      unit="ADC"
                      icon="📊"
                    />
                    <StatusCard
                      label="Status"
                      value={getStatusLabel(gasStatus)}
                      unit=""
                      icon={
                        gasLeak ? "🚨" : gasStatus === "warning" ? "⚠️" : "✅"
                      }
                    />
                  </div>

                  {/* Threshold Bar */}
                  <div className="threshold-wrapper">
                    <label>Gas Level</label>
                    <div className="custom-threshold-bar">
                      <div
                        className="threshold-fill bg-gas"
                        style={{
                          width: `${Math.min((gasValue / 4095) * 100, 100)}%`,
                        }}
                      ></div>
                      <div className="threshold-markers">
                        <span style={{ left: "24%" }}>Warning (1000)</span>
                        <span style={{ left: "37%", background: "#f43f5e" }}>
                          Critical (1500)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device Status Indicators */}
                  <div className="device-status-row">
                    <div
                      className={`status-pill ${
                        relayStatus === "ON" ? "active" : ""
                      }`}
                    >
                      <span>🔌 Relay:</span>
                      <strong>{relayStatus}</strong>
                    </div>
                    <div
                      className={`status-pill ${
                        buzzerStatus === "ON" ? "active" : ""
                      }`}
                    >
                      <span>🔔 Buzzer:</span>
                      <strong>{buzzerStatus}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: CYLINDER WEIGHT MONITOR */}
              <div className="monitor-section weight-monitor">
                <div className="section-header weight-header">
                  <h3>
                    <span className="section-icon">⚖️</span> Cylinder Weight
                    (HX711)
                  </h3>
                  <span className={`fill-badge ${weightStatus}`}>
                    {weightStatus === "empty"
                      ? "🔴 NO CYLINDER"
                      : weightStatus === "exhausted"
                      ? "🛑 EXHAUSTED"
                      : weightStatus === "low"
                      ? "🟠 LOW LPG"
                      : weightStatus === "full"
                      ? "🟢 FULL"
                      : "🟡 NORMAL"}
                  </span>
                </div>

                <div className="monitor-content">
                  {/* 3D Cylinder Visualization */}
                  <div className="cylinder-viz-container">
                    <Cylinder3D
                      level={parseFloat(fillPercentage)}
                      status={weightStatus === "empty" ? "danger" : "safe"}
                    />
                    <div className="fill-percentage-overlay">
                      {fillPercentage}%
                    </div>
                  </div>

                  {/* Weight Details */}
                  <div className="weight-details-panel">
                    <div className="weight-main-display">
                      <span className="weight-label">Current Weight</span>
                      <span className="weight-value">
                        {cylinderWeight.toFixed(2)}
                      </span>
                      <span className="weight-unit">kg</span>
                    </div>

                    {weightTrend !== 0 && (
                      <div
                        className={`weight-trend-badge ${
                          Math.abs(weightTrend) > 5 ? "significant" : ""
                        }`}
                      >
                        {weightTrend > 0 ? "↑ Refilling" : "↓ Consuming"} (
                        {Math.abs(weightTrend).toFixed(1)}%)
                      </div>
                    )}

                    <div className="capacity-bars">
                      <div className="cap-item">
                        <span>Current</span>
                        <div className="bar-bg">
                          <div
                            className="bar-fill blue"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <span>{cylinderWeight.toFixed(1)} kg</span>
                      </div>
                      <div className="cap-item">
                        <span>Used Space</span>
                        <div className="bar-bg">
                          <div
                            className="bar-fill green"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <span>
                          {(MAX_WEIGHT - parseFloat(remainingWeight)).toFixed(
                            1
                          )}{" "}
                          kg
                        </span>
                      </div>
                      <div className="cap-item">
                        <span>Remaining</span>
                        <div className="bar-bg">
                          <div
                            className="bar-fill orange"
                            style={{
                              width: `${
                                (remainingWeight / MAX_WEIGHT) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>{remainingWeight} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Weight Alert Info */}
                  <div className="weight-alerts-info">
                    <div className={`alert-box ${weightStatus}`}>
                      {cylinderStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMBINED CHART SECTION */}
            <div className="panel chart-panel-combined">
              <div className="panel-header">
                <h3>Real-time Data Timeline</h3>
                <div className="chart-toggle-group">
                  <button
                    className={`toggle-btn ${
                      currentTab === "gas" ? "active" : ""
                    }`}
                    onClick={() => setCurrentTab("gas")}
                  >
                    Gas Levels
                  </button>
                  <button
                    className={`toggle-btn ${
                      currentTab === "weight" ? "active" : ""
                    }`}
                    onClick={() => setCurrentTab("weight")}
                  >
                    Weight
                  </button>
                </div>
              </div>
              <div className="chart-area-full">
                {currentTab === "gas" ? (
                  <GasChart data={gasHistory} status={gasStatus} />
                ) : (
                  <GasChart data={weightHistory} status="safe" />
                )}
              </div>
            </div>

            {/* INFO CARDS */}
            <div className="info-grid-dual">
              <div className="panel info-card dual-card gas-info">
                <div className="card-icon gas-icon">☣️</div>
                <h4>Gas Detection (MQ6)</h4>
                <div className="limits-list">
                  <p>🟢 Safe: 0-1000 ADC</p>
                  <p>🟡 Warning: 1000-1500 ADC</p>
                  <p>🔴 Critical: &gt;1500 ADC</p>
                </div>
              </div>

              <div className="panel info-card dual-card weight-info">
                <div className="card-icon weight-icon">⛽</div>
                <h4>Cylinder Capacity</h4>
                <div className="limits-list">
                  <p>Total: {MAX_WEIGHT} kg</p>
                  <p>Filled: {fillPercentage}%</p>
                  <p>Remaining: {remainingWeight} kg</p>
                </div>
              </div>

              <div className="panel info-card dual-card">
                <div className="card-icon">📡</div>
                <h4>Device Info</h4>
                <p>ESP32 Device</p>
                <small>Firebase Realtime DB</small>
              </div>

              <div className="panel info-card dual-card system-info">
                <div className="card-icon">⚙️</div>
                <h4>System Status</h4>
                <p>
                  Status:{" "}
                  {isConnected ? (
                    <span style={{ color: "#10b981" }}>ONLINE</span>
                  ) : (
                    <span style={{ color: "#f43f5e" }}>OFFLINE</span>
                  )}
                </p>
                <p>Last Sync: {timeStr}</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <NavigationMenu
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <div className="dashboard">{renderPage()}</div>
      <AlertPopup type={popup} close={() => setPopup(null)} />
      <div className="notifications-container">
        {notifications.map((notif) => (
          <NotificationToast
            key={notif.id}
            message={notif.message}
            type={notif.type}
          />
        ))}
      </div>
    </>
  );
}