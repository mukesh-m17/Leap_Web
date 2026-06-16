import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
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

const CHANNEL_ID = "3254332";
const API = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json?results=20`;
const POLL_INTERVAL = 5000;

function getStatus(value) {
  if (value > 400) return "danger";
  if (value > 300) return "warning";
  return "safe";
}

function getStatusLabel(status) {
  if (status === "danger") return "CRITICAL";
  if (status === "warning") return "ELEVATED";
  return "NORMAL";
}

export default function GasDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [gas, setGas] = useState(0);
  const [history, setHistory] = useState([]);
  const [popup, setPopup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [trend, setTrend] = useState(0);
  const previousGasRef = useRef(0);

  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(API);
      const feeds = res.data.feeds;
      const values = feeds.map((f) => parseFloat(f.field1) || 0);
      const latest = values[values.length - 1];

      setGas(latest);
      setHistory(values);
      setLastUpdate(new Date());
      setIsConnected(true);

      // Calculate trend
      if (previousGasRef.current > 0) {
        const change = ((latest - previousGasRef.current) / previousGasRef.current) * 100;
        setTrend(change);
      }
      previousGasRef.current = latest;

      // Alert logic
      if (latest > 400) {
        setPopup("leak");
        addNotification("⚠️ CRITICAL: Gas leakage detected!", "danger");
      } else if (latest > 300) {
        setPopup("high");
        addNotification("⚠️ WARNING: High gas concentration", "warning");
      } else if (latest > 200 && previousGasRef.current <= 200) {
        addNotification("Gas levels increasing", "info");
      }
    } catch (error) {
      setIsConnected(false);
      setPopup("offline");
      addNotification("❌ Sensor offline - connection lost", "error");
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  const level = Math.min((gas / 1000) * 100, 100).toFixed(1);
  const status = getStatus(gas);
  const max = Math.max(...history, 1);
  const min = Math.min(...history.filter((v) => v > 0), 0);
  const avg = history.length
    ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(0)
    : 0;

  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  const dateStr = lastUpdate
    ? lastUpdate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const renderPage = () => {
    switch (currentPage) {
      case "analytics":
        return <AnalyticsPage history={history} gas={gas} status={status} />;
      case "history":
        return <HistoryPage />;
      case "settings":
        return <SettingsPage />;
      case "alerts":
        return <AlertsPage />;
      case "reports":
        return <ReportsPage history={history} gas={gas} status={status} />;
      default:
        return (
          <>
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

            <div className="dashboard-header">
              <div className="header-left">
                <div className="header-badge">
                  <span className="header-badge-dot"></span>
                  MONITORING SYSTEM v3.0
                </div>
                <h1>
                  Smart Gas
                  <br />
                  <span className="gradient-text">Safety Dashboard</span>
                </h1>
                <p className="header-subtitle">Real-time LPG Detection & Analysis</p>
              </div>
              <div className="header-right">
                <div className={`connection-status ${isConnected ? "online" : "offline"}`}>
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

            <div className="main-grid">
              <div className="panel cylinder-panel">
                <div className="panel-header">
                  <h3 className="panel-title">Cylinder Monitor</h3>
                  <span className="panel-badge">{level}%</span>
                </div>
                <div className="cylinder-wrapper">
                  <Cylinder3D level={parseFloat(level)} status={status} />
                </div>
                <div className="cylinder-info">
                  <div className="cylinder-metric">
                    <span className="metric-label">Fill Level</span>
                    <span className="metric-value">{level}%</span>
                  </div>
                  <div className="cylinder-metric">
                    <span className="metric-label">Status</span>
                    <span className={`metric-status ${status}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel stats-panel">
                <div className="stats-hero">
                  <div className="current-reading-wrapper">
                    <span className="reading-label">Current Gas Level</span>
                    <div className="reading-display">
                      <span className="reading-value">{gas.toFixed(0)}</span>
                      <span className="reading-unit">ppm</span>
                    </div>
                    {trend !== 0 && (
                      <div className={`reading-trend ${trend > 0 ? "up" : "down"}`}>
                        <span className="trend-arrow">{trend > 0 ? "↑" : "↓"}</span>
                        <span className="trend-value">{Math.abs(trend).toFixed(1)}%</span>
                        <span className="trend-label">vs last reading</span>
                      </div>
                    )}
                  </div>
                  <div className={`status-badge-large ${status}`}>
                    <div className="badge-icon">
                      {status === "danger" && "🚨"}
                      {status === "warning" && "⚠️"}
                      {status === "safe" && "✓"}
                    </div>
                    <span className="badge-text">{getStatusLabel(status)}</span>
                    <div className="badge-glow"></div>
                  </div>
                </div>

                <div className="threshold-section">
                  <div className="threshold-header">
                    <span className="threshold-title">Danger Threshold</span>
                    <span className="threshold-percentage">
                      {((gas / 500) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="threshold-bar-container">
                    <div className="threshold-bar-bg">
                      <div
                        className={`threshold-bar-fill ${status}`}
                        style={{ width: `${Math.min((gas / 500) * 100, 100)}%` }}
                      >
                        <div className="threshold-bar-glow"></div>
                      </div>
                    </div>
                    <div className="threshold-markers">
                      <div className="marker" style={{ left: "60%" }}>
                        <span className="marker-line"></span>
                        <span className="marker-label">300 ppm</span>
                      </div>
                      <div className="marker danger" style={{ left: "80%" }}>
                        <span className="marker-line"></span>
                        <span className="marker-label">400 ppm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stat-cards">
                  <StatusCard
                    label="Peak Value"
                    value={max.toFixed(0)}
                    unit="ppm"
                    icon="📈"
                  />
                  <StatusCard label="Average" value={avg} unit="ppm" icon="📊" />
                  <StatusCard
                    label="Minimum"
                    value={min.toFixed(0)}
                    unit="ppm"
                    icon="📉"
                  />
                </div>
              </div>
            </div>

            <div className="panel chart-panel">
              <div className="panel-header">
                <div className="chart-title-section">
                  <h3 className="panel-title">Gas Concentration Timeline</h3>
                  <span className="chart-subtitle">
                    Last 20 readings · 5s interval
                  </span>
                </div>
                <div className="chart-controls">
                  <button className="chart-control-btn active">Live</button>
                  <button className="chart-control-btn">1H</button>
                  <button className="chart-control-btn">24H</button>
                </div>
              </div>
              <GasChart data={history} status={status} />
            </div>

            <div className="info-grid">
              <div className="panel info-card">
                <div className="info-icon safe">🛡️</div>
                <h4>Safe Range</h4>
                <p>0-300 ppm</p>
              </div>
              <div className="panel info-card">
                <div className="info-icon warning">⚠️</div>
                <h4>Warning</h4>
                <p>300-400 ppm</p>
              </div>
              <div className="panel info-card">
                <div className="info-icon danger">🚨</div>
                <h4>Critical</h4>
                <p>&gt;400 ppm</p>
              </div>
              <div className="panel info-card">
                <div className="info-icon">📡</div>
                <h4>Sensor ID</h4>
                <p>#{CHANNEL_ID}</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <NavigationMenu currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="dashboard">{renderPage()}</div>
      <AlertPopup type={popup} close={() => setPopup(null)} />
      <div className="notifications-container">
        {notifications.map((notif) => (
          <NotificationToast key={notif.id} message={notif.message} type={notif.type} />
        ))}
      </div>
    </>
  );
}