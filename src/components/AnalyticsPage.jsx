import React, { useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

export default function AnalyticsPage({ history = [], gas = 0, status = "safe" }) {
  const [exportFormat, setExportFormat] = useState("csv");

  // Sample data - replace with actual data from props
  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Average Gas Level",
        data: history.length > 0 
          ? history.slice(0, 7).reverse() 
          : [120, 150, 180, 140, 200, 160, 190],
        backgroundColor: "rgba(0, 212, 255, 0.2)",
        borderColor: "#00d4ff",
        borderWidth: 3,
      },
    ],
  };

  const statusDistribution = {
    labels: ["Safe", "Warning", "Critical"],
    datasets: [
      {
        data: [75, 20, 5],
        backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
        borderWidth: 0,
      },
    ],
  };

  const hourlyTrend = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Hourly Average",
        data: history.length > 0 
          ? history.slice(0, 24).reverse() 
          : Array.from({ length: 24 }, () => Math.random() * 300 + 50),
        fill: true,
        backgroundColor: (ctx) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(0, 212, 255, 0.3)");
          gradient.addColorStop(1, "rgba(0, 212, 255, 0)");
          return gradient;
        },
        borderColor: "#00d4ff",
        tension: 0.4,
      },
    ],
  };

  // Export Data Function
  const handleExportData = () => {
    try {
      if (exportFormat === "csv") {
        exportToCSV();
      } else if (exportFormat === "json") {
        exportToJSON();
      } else if (exportFormat === "excel") {
        exportToExcel();
      }
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting data. Please try again.");
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Timestamp", "Gas Level (ppm)", "Status"],
      ...history.map((value, index) => {
        const timestamp = new Date(Date.now() - (history.length - index) * 5000);
        const status = value > 400 ? "Critical" : value > 300 ? "Warning" : "Safe";
        return [timestamp.toISOString(), value.toFixed(2), status];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gas-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      currentGasLevel: gas,
      currentStatus: status,
      readings: history.map((value, index) => ({
        timestamp: new Date(Date.now() - (history.length - index) * 5000).toISOString(),
        gasLevel: value,
        status: value > 400 ? "Critical" : value > 300 ? "Warning" : "Safe",
      })),
      statistics: {
        total: history.length,
        average: (history.reduce((a, b) => a + b, 0) / history.length).toFixed(2),
        maximum: Math.max(...history),
        minimum: Math.min(...history),
      },
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gas-analytics-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // Using CSV format for Excel compatibility
    const csvContent = [
      ["GasGuard Pro - Analytics Export"],
      [`Export Date: ${new Date().toLocaleString()}`],
      [],
      ["Summary Statistics"],
      ["Metric", "Value"],
      ["Current Gas Level", `${gas.toFixed(2)} ppm`],
      ["Current Status", status.toUpperCase()],
      ["Total Readings", history.length],
      [
        "Average",
        `${(history.reduce((a, b) => a + b, 0) / history.length).toFixed(2)} ppm`,
      ],
      ["Maximum", `${Math.max(...history).toFixed(2)} ppm`],
      ["Minimum", `${Math.min(...history).toFixed(2)} ppm`],
      [],
      ["Detailed Readings"],
      ["Timestamp", "Gas Level (ppm)", "Status"],
      ...history.map((value, index) => {
        const timestamp = new Date(Date.now() - (history.length - index) * 5000);
        const status = value > 400 ? "Critical" : value > 300 ? "Warning" : "Safe";
        return [timestamp.toLocaleString(), value.toFixed(2), status];
      }),
    ]
      .map((row) => (Array.isArray(row) ? row.join(",") : row))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gas-analytics-${new Date().toISOString().split("T")[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate Report from Analytics
  const handleGenerateReport = () => {
    const reportData = {
      title: "Analytics Report",
      date: new Date().toLocaleDateString(),
      currentGas: gas,
      status: status,
      weeklyAverage: (weeklyData.datasets[0].data.reduce((a, b) => a + b, 0) / 7).toFixed(2),
      totalReadings: history.length,
    };

    alert(`Report generated!\n\nCurrent Gas: ${reportData.currentGas} ppm\nStatus: ${reportData.status}\nWeekly Avg: ${reportData.weeklyAverage} ppm`);
  };

  return (
    <div className="page-content analytics-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics Dashboard</h2>
          <p className="page-subtitle">
            Comprehensive gas monitoring insights and trends
          </p>
        </div>
        <div className="page-actions">
          <select
            className="export-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="csv">CSV Format</option>
            <option value="json">JSON Format</option>
            <option value="excel">Excel Format</option>
          </select>
          <button className="page-action-btn" onClick={handleExportData}>
            📥 Export Data
          </button>
          <button className="page-action-btn primary" onClick={handleGenerateReport}>
            📊 Generate Report
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Weekly Overview */}
        <div className="panel analytics-card span-2">
          <h3 className="card-title">Weekly Overview</h3>
          <div style={{ height: "300px" }}>
            <Bar
              data={weeklyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { color: "rgba(0,212,255,0.1)" },
                    ticks: { color: "#7a9bb5" }
                  },
                  x: { 
                    grid: { display: false },
                    ticks: { color: "#7a9bb5" }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="panel analytics-card">
          <h3 className="card-title">Status Distribution</h3>
          <div style={{ height: "300px", padding: "20px" }}>
            <Doughnut
              data={statusDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: "bottom", 
                    labels: { color: "#7a9bb5", padding: 15 } 
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 24h Trend */}
        <div className="panel analytics-card span-3">
          <h3 className="card-title">24-Hour Trend Analysis</h3>
          <div style={{ height: "250px" }}>
            <Line
              data={hourlyTrend}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { color: "rgba(0,212,255,0.1)" },
                    ticks: { color: "#7a9bb5" }
                  },
                  x: { 
                    grid: { display: false },
                    ticks: { 
                      color: "#7a9bb5",
                      maxRotation: 45,
                      minRotation: 45
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="analytics-stats">
          <div className="stat-box">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <span className="stat-label">Avg. Daily</span>
              <span className="stat-value">
                {history.length > 0 
                  ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(0)
                  : "156"} ppm
              </span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <span className="stat-label">Warnings</span>
              <span className="stat-value">
                {history.filter(v => v > 300 && v <= 400).length}
              </span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <span className="stat-label">Critical Events</span>
              <span className="stat-value">
                {history.filter(v => v > 400).length}
              </span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <span className="stat-label">Uptime</span>
              <span className="stat-value">99.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}