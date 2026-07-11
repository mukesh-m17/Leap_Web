import React, { useState } from "react";


export default function ReportsPage({ history = [], gas = 0, status = "safe" }) {
  const [reportType, setReportType] = useState("daily");
  const [exportFormat, setExportFormat] = useState("pdf");

  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toLocaleString(),
      gasLevel: gas,
      status: status.toUpperCase(),
      avgLevel: history.length ? (history.reduce((a,b)=>a+b,0)/history.length).toFixed(2) : 0,
      maxLevel: history.length ? Math.max(...history) : 0,
      minLevel: history.length ? Math.min(...history) : 0,
      totalReadings: history.length
    };

    alert(`📊 ${reportType.toUpperCase()} REPORT\n\n` +
          `Current: ${reportData.gasLevel} ADC\n` +
          `Status: ${reportData.status}\n` +
          `Average: ${reportData.avgLevel} ADC\n` +
          `Max: ${reportData.maxLevel} ADC\n` +
          `Min: ${reportData.minLevel} ADC\n` +
          `Total Readings: ${reportData.totalReadings}`);
  };

  return (
    <div className="page-content reports-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">Generate comprehensive system reports</p>
        </div>
        <div className="page-actions">
          <select className="export-select" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
            <option value="pdf">PDF Report</option>
            <option value="csv">CSV Data</option>
            <option value="excel">Excel Sheet</option>
          </select>
          <button className="page-action-btn primary" onClick={generateReport}>
            📄 Generate Report
          </button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="panel">
          <h3>Report Type</h3>
          <div className="report-type-selector">
            {['daily', 'weekly', 'monthly'].map(type => (
              <button
                key={type}
                className={`report-type-btn ${reportType === type ? 'active' : ''}`}
                onClick={() => setReportType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel span-2">
          <h3>Current Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Gas Level:</span>
              <span className="summary-value">{gas} ADC</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status:</span>
              <span className={`summary-value status-${status}`}>{status.toUpperCase()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Readings:</span>
              <span className="summary-value">{history.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}