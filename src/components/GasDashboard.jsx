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
const READ_API_KEY = ""; // Add if private channel
const API_BASE = `https://api.thingspeak.com/channels/${CHANNEL_ID}`;
const POLL_INTERVAL = 5000;

function getStatus(value) {
  if (value > 400) return "danger";
  if (value > 300) return "warning";
  return "safe";
}

function getWeightStatus(weight, maxWeight = 14.2) {
  const percentage = (weight / maxWeight) * 100;
  if (percentage < 10) return "empty";
  if (percentage < 25) return "low";
  if (percentage > 90) return "full";
  return "normal";
}

export default function GasDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  // Sensor Data States - Separated
  const [gasLevel, setGasLevel] = useState(0);      // Field 2: Gas PPM
  const [cylinderWeight, setCylinderWeight] = useState(0); // Field 1: Weight kg
  
  // Data Tracking
  const [gasHistory, setGasHistory] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  
  // UI States
  const [popup, setPopup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [gasTrend, setGasTrend] = useState(0);
  const [weightTrend, setWeightTrend] = useState(0);

  // Refs
  const previousGasRef = useRef(0);
  const previousWeightRef = useRef(0);

  // Add notification helper
  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Main data fetch function - Fetches BOTH fields
  const fetchData = useCallback(async () => {
    try {
      const apiKey = READ_API_KEY ? `&api_key=${READ_API_KEY}` : '';
      const res = await axios.get(`${API_BASE}/feeds.json?results=20${apiKey}`);
      
      if (!res.data?.feeds?.length) throw new Error("No feeds");

      const feeds = res.data.feeds;

      // Extract FIELD 2: Gas Values (ppm)
      const gasValues = feeds
        .map(f => parseFloat(f.field2))
        .filter(v => !isNaN(v) && v !== null);

      // Extract FIELD 1: Weight Values (kg)
      const weightValues = feeds
        .map(f => parseFloat(f.field1))
        .filter(v => !isNaN(v) && v !== null);

      if (gasValues.length === 0 && weightValues.length === 0) {
        throw new Error("No valid readings");
      }

      // Get latest values
      const latestGas = gasValues.length > 0 ? gasValues[gasValues.length - 1] : 0;
      const latestWeight = weightValues.length > 0 ? weightValues[weightValues.length - 1] : 0;

      // Update states
      setGasLevel(latestGas);
      setCylinderWeight(latestWeight);
      setGasHistory(gasValues);
      setWeightHistory(weightValues);
      setLastUpdate(new Date());
      setIsConnected(true);

      // Calculate Trends
      if (previousGasRef.current > 0) {
        const change = ((latestGas - previousGasRef.current) / Math.max(previousGasRef.current, 1)) * 100;
        setGasTrend(change);
      }

      if (previousWeightRef.current > 0) {
        const wChange = ((latestWeight - previousWeightRef.current) / Math.max(previousWeightRef.current, 1)) * 100;
        setWeightTrend(wChange);
      }

      // GAS ALERT LOGIC
      const currentGasStatus = getStatus(latestGas);
      
      if (latestGas > 400 && previousGasRef.current <= 400) {
        setPopup("leak");
        addNotification("🚨 CRITICAL: Gas leakage detected!", "danger");
      } else if (latestGas > 300 && previousGasRef.current <= 300) {
        setPopup("high");
        addNotification("⚠️ WARNING: High gas concentration", "warning");
      } else if (latestGas <= 200 && previousGasRef.current > 250) {
        addNotification("✓ Gas levels normalizing", "success");
        setPopup(null);
      }

      // WEIGHT ALERT LOGIC (Low cylinder warning)
      if (latestWeight < 1.5 && previousWeightRef.current >= 1.5) {
        addNotification("⛽ Cylinder almost empty! Refill required.", "warning");
      } else if (latestWeight > 12 && previousWeightRef.current <= 12) {
        addNotification("✅ Cylinder refilled successfully.", "info");
      }

      previousGasRef.current = latestGas;
      previousWeightRef.current = latestWeight;

    } catch (error) {
      console.error("Fetch error:", error);
      setIsConnected(false);
      setPopup("offline");
      addNotification("❌ Sensor offline - check connection", "error");
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculated Values
  const gasStatus = getStatus(gasLevel);
  const weightStatus = getWeightStatus(cylinderWeight);
  
  // Gas Metrics
  const maxGas = gasHistory.length ? Math.max(...gasHistory) : 0;
  const avgGas = gasHistory.length ? (gasHistory.reduce((a,b)=>a+b,0)/gasHistory.length).toFixed(1) : 0;
  
  // Weight Metrics (Assuming standard 14.2kg LPG cylinder)
  const MAX_WEIGHT = 14.2; // Standard Indian LPG cylinder full weight in kg
  const fillPercentage = Math.min((cylinderWeight / MAX_WEIGHT) * 100, 100).toFixed(1);
  const remainingWeight = (MAX_WEIGHT - cylinderWeight).toFixed(1);
  
  const timeStr = lastUpdate?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}) || "--:--:--";
  const dateStr = lastUpdate?.toLocaleDateString([], {month:'short', day:'numeric', year:'numeric'}) || "--/--/----";

  // Page Router
  const renderPage = () => {
    switch(currentPage) {
      case "analytics": 
        return <AnalyticsPage history={gasHistory} gas={gasLevel} status={gasStatus} />;
      case "history":
        return <HistoryPage history={gasHistory} weightHistory={weightHistory} />;
      case "settings": 
        return <SettingsPage />;
      case "alerts": 
        return <AlertsPage />;
      case "reports": 
        return <ReportsPage history={gasHistory} gas={gasLevel} status={gasStatus} />;
      default:
        return (
          <>
            {/* Background Effects */}
            <div className="dashboard-bg-grid"></div>
            <div className="dashboard-particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="particle" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`
                }}></div>
              ))}
            </div>

            {/* Header */}
            <div className="dashboard-header">
              <div className="header-left">
                <div className="header-badge"><span className="header-badge-dot"></span>MONITORING SYSTEM v3.1</div>
                <h1>Smart Gas<br/><span className="gradient-text">Safety Dashboard</span></h1>
                <p className="header-subtitle">Real-time LPG Detection & Weight Analysis</p>
              </div>
              
              <div className="header-right">
                <div className={`connection-status ${isConnected ? 'online' : 'offline'}`}>
                  <div className="status-indicator">
                    <span className={`status-dot`}></span>
                    <span className="status-pulse"></span>
                  </div>
                  <div className="status-info">
                    <span className="status-label">{isConnected ? "LIVE" : "OFFLINE"}</span>
                    <span className="status-time">{timeStr}</span>
                    <span className="status-date">{dateStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN GRID - TWO COLUMN LAYOUT FOR DUAL DISPLAY */}
            <div className="dual-monitor-grid">
              
              {/* LEFT COLUMN: GAS MONITORING SYSTEM */}
              <div className="monitor-section gas-monitor">
                <div className="section-header gas-header">
                  <h3><span className="section-icon">🔬</span> Gas Concentration Monitor</h3>
                  <span className={`live-badge ${gasStatus}`}>{gasStatus.toUpperCase()}</span>
                </div>

                <div className="monitor-content">
                  {/* Big Number Display */}
                  <div className="primary-display gas-primary">
                    <div className="display-value-container">
                      <span className="display-number">{gasLevel.toFixed(0)}</span>
                      <span className="display-unit">ppm</span>
                    </div>
                    
                    <div className="display-meta">
                      {gasTrend !== 0 && (
                        <span className={`trend-indicator ${gasTrend > 0 ? 'up' : 'down'}`}>
                          {gasTrend > 0 ? '▲' : '▼'} {Math.abs(gasTrend).toFixed(1)}%
                        </span>
                      )}
                      <span className="update-time">Updated just now</span>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mini-chart-container">
                    <h4>24-Hour Trend</h4>
                    <GasChart data={gasHistory.slice(-10)} status={gasStatus} height={120} />
                  </div>

                  {/* Stats Row */}
                  <div className="quick-stats-row gas-stats">
                    <StatusCard label="Max" value={maxGas.toFixed(0)} unit="ppm" icon="📈" />
                    <StatusCard label="Average" value={avgGas} unit="ppm" icon="📊" />
                    <StatusCard label="Status" value={getStatusLabel(gasStatus)} unit="" icon={getStatusLabel(gasStatus) === "CRITICAL" ? "🚨" : getStatusLabel(gasStatus) === "ELEVATED" ? "⚠️" : "✅"} />
                  </div>

                  {/* Threshold Bar */}
                  <div className="threshold-wrapper">
                    <label>Danger Level</label>
                    <div className="custom-threshold-bar">
                      <div className="threshold-fill bg-gas" style={{width: `${Math.min((gasLevel/500)*100, 100)}%`}}></div>
                      <div className="threshold-markers">
                        <span style={{left: '60%'}}>Warning</span>
                        <span style={{left: '80%', background: '#f43f5e'}}>Critical</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: CYLINDER WEIGHT MONITOR */}
              <div className="monitor-section weight-monitor">
                <div className="section-header weight-header">
                  <h3><span className="section-icon">⚖️</span> Cylinder Weight Monitor</h3>
                  <span className={`fill-badge ${weightStatus}`}>
                    {weightStatus === 'full' ? '🟢 FULL' : 
                     weightStatus === 'normal' ? '🟡 NORMAL' :
                     weightStatus === 'low' ? '🟠 LOW' : '🔴 EMPTY'}
                  </span>
                </div>

                <div className="monitor-content">
                  {/* 3D Cylinder Visualization */}
                  <div className="cylinder-viz-container">
                    <Cylinder3D level={parseFloat(fillPercentage)} status="safe" height={180} />
                    <div className="fill-percentage-overlay">
                      {fillPercentage}%
                    </div>
                  </div>

                  {/* Weight Details */}
                  <div className="weight-details-panel">
                    <div className="weight-main-display">
                      <span className="weight-label">Current Weight</span>
                      <span className="weight-value">{cylinderWeight.toFixed(2)}</span>
                      <span className="weight-unit">kg</span>
                    </div>

                    {weightTrend !== 0 && (
                      <div className={`weight-trend-badge ${Math.abs(weightTrend) > 5 ? 'significant' : ''}`}>
                        {weightTrend > 0 ? '↑ Refilling' : '↓ Consuming'} ({Math.abs(weightTrend).toFixed(1)}%)
                      </div>
                    )}

                    <div className="capacity-bars">
                      <div className="cap-item">
                        <span>Current</span>
                        <div className="bar-bg"><div className="bar-fill blue" style={{width:`${fillPercentage}%`}}></div></div>
                        <span>{cylinderWeight.toFixed(1)} kg</span>
                      </div>
                      <div className="cap-item">
                        <span>Remaining</span>
                        <div className="bar-bg"><div className="bar-fill green" style={{width:`${remainingWeight/MAX_WEIGHT*100}%`}}></div></div>
                        <span>{remainingWeight} kg</span>
                      </div>
                      <div className="cap-item">
                        <span>Empty Space</span>
                        <div className="bar-bg"><div className="bar-fill red" style={{width:`${(1-cylinderWeight/MAX_WEIGHT)*100}%`}}></div></div>
                        <span>{(MAX_WEIGHT-cylinderWeight).toFixed(1)} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="weight-alerts-info">
                    <div className={`alert-box ${weightStatus}`}>
                      {weightStatus === 'empty' && "⛽ URGENT: Cylinder is empty! Replace immediately."}
                      {weightStatus === 'low' && "⚡ WARNING: Low fuel level (<25%). Plan refill."}
                      {weightStatus === 'normal' && "✅ Fuel level adequate for continued use."}
                      {weightStatus === 'full' && "🟢 Tank full! Freshly filled cylinder."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMBINED CHART SECTION */}
            <div className="panel chart-panel-combined">
              <div className="panel-header">
                <h3>Comprehensive Data Timeline</h3>
                <div className="chart-toggle-group">
                  <button className="toggle-btn active" onClick={() => setCurrentTab('gas')}>Gas Levels</button>
                  <button className="toggle-btn" onClick={() => setCurrentTab('weight')}>Weight</button>
                </div>
              </div>
              <div className="chart-area-full">
                <GasChart data={gasHistory} status={gasStatus} />
              </div>
            </div>

            {/* INFO CARDS */}
            <div className="info-grid-dual">
              <div className="panel info-card dual-card gas-info">
                <div className="card-icon gas-icon">☣️</div>
                <h4>Gas Safety Limits</h4>
                <div class="limits-list">
                  <p>🟢 Safe: 0-300 ppm</p>
                  <p>🟡 Warning: 300-400 ppm</p>
                  <p>🔴 Critical: &gt;400 ppm</p>
                </div>
              </div>
              
              <div className="panel info-card dual-card weight-info">
                <div className="card-icon weight-icon">⛽</div>
                <h4>Cylinder Capacity</h4>
                <div class="limits-list">
                  <p>Total: {MAX_WEIGHT} kg</p>
                  <p>Filled: {fillPercentage}%</p>
                  <p>Remaining: {remainingWeight} kg</p>
                </div>
              </div>

              <div className="panel info-card dual-card">
                <div className="card-icon">📡</div>
                <h4>Sensor ID</h4>
                <p>Channel #{CHANNEL_ID}</p>
                <small>Field 1: Weight | Field 2: Gas</small>
              </div>

              <div className="panel info-card dual-card system-info">
                <div className="card-icon">⚙️</div>
                <h4>System Health</h4>
                <p>Status: {isConnected ? '<span style="color:#10b981">ONLINE</span>' : '<span style="color:#f43f5e">OFFLINE</span>'}</p>
                <p>Last Sync: {timeStr}</p>
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
        {notifications.map(notif => (
          <NotificationToast key={notif.id} message={notif.message} type={notif.type} />
        ))}
      </div>
    </>
  );
}