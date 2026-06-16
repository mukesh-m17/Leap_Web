import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage({ history = [], gas = 0, status = "safe" }) {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Daily Gas Monitoring Report",
      date: "2024-01-15",
      type: "Daily",
      size: "2.4 MB",
      data: { readings: 1440, avgGas: 156, maxGas: 380, alerts: 3 },
    },
    {
      id: 2,
      name: "Weekly Analysis Report",
      date: "2024-01-14",
      type: "Weekly",
      size: "5.8 MB",
      data: { readings: 10080, avgGas: 142, maxGas: 420, alerts: 12 },
    },
    {
      id: 3,
      name: "Monthly Summary",
      date: "2024-01-01",
      type: "Monthly",
      size: "12.3 MB",
      data: { readings: 43200, avgGas: 138, maxGas: 450, alerts: 28 },
    },
  ]);

  const [formData, setFormData] = useState({
    reportType: "daily",
    dateFrom: "",
    dateTo: "",
    format: "pdf",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Generate PDF Report
  const generatePDFReport = (reportData) => {
    const doc = new jsPDF();
    
    // Header with logo area
    doc.setFillColor(0, 212, 255);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text("GasGuard Pro", 105, 15, { align: "center" });
    doc.setFontSize(14);
    doc.text("Gas Monitoring Report", 105, 23, { align: "center" });
    
    // Report Info Section
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Report Type: ${reportData.type}`, 20, 45);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 52);
    doc.text(`Date: ${reportData.date}`, 20, 59);
    doc.text(`Status: ${status.toUpperCase()}`, 20, 66);
    
    // Summary Statistics Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary Statistics", 20, 80);
    
    const summaryData = [
      ["Total Readings", reportData.data.readings.toString()],
      ["Average Gas Level", `${reportData.data.avgGas} ppm`],
      ["Maximum Gas Level", `${reportData.data.maxGas} ppm`],
      ["Total Alerts", reportData.data.alerts.toString()],
      ["Current Gas Level", `${gas.toFixed(2)} ppm`],
    ];
    
    autoTable(doc, {
      startY: 85,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { 
        fillColor: [0, 212, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 100 },
        1: { cellWidth: 70 }
      }
    });
    
    // Gas Readings Table
    if (history && history.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Recent Gas Readings", 20, 20);
      
      const readingsData = history.slice(0, 30).map((reading, index) => {
        const status = reading > 400 ? "Critical" : reading > 300 ? "Warning" : "Safe";
        const time = new Date(Date.now() - (history.length - index) * 5000);
        return [
          (index + 1).toString(),
          time.toLocaleTimeString(),
          `${reading.toFixed(2)} ppm`,
          status,
        ];
      });
      
      autoTable(doc, {
        startY: 25,
        head: [["#", "Time", "Gas Level", "Status"]],
        body: readingsData,
        theme: "striped",
        headStyles: { 
          fillColor: [0, 212, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold"
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { cellWidth: 60 },
          3: { cellWidth: 50, fontStyle: "bold" }
        },
        didParseCell: function(data) {
          if (data.column.index === 3 && data.cell.section === 'body') {
            const status = data.cell.text[0];
            if (status === 'Critical') {
              data.cell.styles.textColor = [244, 63, 94];
            } else if (status === 'Warning') {
              data.cell.styles.textColor = [245, 158, 11];
            } else {
              data.cell.styles.textColor = [16, 185, 129];
            }
          }
        }
      });
    }
    
    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128);
      doc.text(
        `GasGuard Pro Report - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
      doc.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        20,
        doc.internal.pageSize.height - 10
      );
    }
    
    return doc;
  };

  // Generate CSV Report
  const generateCSVReport = (reportData) => {
    let csv = "GasGuard Pro - Gas Monitoring Report\n\n";
    csv += `Report Type,${reportData.type}\n`;
    csv += `Date,${reportData.date}\n`;
    csv += `Generated,${new Date().toLocaleString()}\n`;
    csv += `Status,${status.toUpperCase()}\n\n`;
    
    csv += "Summary Statistics\n";
    csv += "Metric,Value\n";
    csv += `Total Readings,${reportData.data.readings}\n`;
    csv += `Average Gas Level,${reportData.data.avgGas} ppm\n`;
    csv += `Maximum Gas Level,${reportData.data.maxGas} ppm\n`;
    csv += `Total Alerts,${reportData.data.alerts}\n`;
    csv += `Current Gas Level,${gas.toFixed(2)} ppm\n\n`;
    
    if (history && history.length > 0) {
      csv += "Recent Gas Readings\n";
      csv += "Reading #,Timestamp,Gas Level (ppm),Status\n";
      history.slice(0, 30).forEach((reading, index) => {
        const statusText = reading > 400 ? "Critical" : reading > 300 ? "Warning" : "Safe";
        const time = new Date(Date.now() - (history.length - index) * 5000);
        csv += `${index + 1},${time.toLocaleString()},${reading.toFixed(2)},${statusText}\n`;
      });
    }
    
    return csv;
  };

  // Handle Download
  const handleDownload = (report) => {
    try {
      if (formData.format === "pdf") {
        const doc = generatePDFReport(report);
        doc.save(`${report.name.replace(/\s+/g, '-')}.pdf`);
      } else if (formData.format === "csv" || formData.format === "excel") {
        const csv = generateCSVReport(report);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${report.name.replace(/\s+/g, '-')}.${formData.format === "excel" ? "xlsx" : "csv"}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
      
      alert(`✓ Report "${report.name}" downloaded successfully!`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("❌ Error generating report. Please try again.");
    }
  };

  // Handle Delete
  const handleDelete = (reportId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this report? This action cannot be undone.")) {
      setReports((prev) => prev.filter((report) => report.id !== reportId));
      alert("✓ Report deleted successfully!");
    }
  };

  // Handle Share
  const handleShare = (report) => {
    const shareText = `📊 GasGuard Pro Report\n\n${report.name}\nDate: ${report.date}\nType: ${report.type}\n\nGenerated by GasGuard Pro Monitoring System`;
    
    if (navigator.share) {
      navigator
        .share({
          title: report.name,
          text: shareText,
        })
        .then(() => alert("✓ Report shared successfully!"))
        .catch((err) => {
          if (err.name !== 'AbortError') {
            copyToClipboard(shareText);
          }
        });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("✓ Report details copied to clipboard!");
    }).catch(() => {
      alert("❌ Unable to copy to clipboard");
    });
  };

  // Generate New Report
  const handleGenerateReport = async () => {
    if (!formData.dateFrom || !formData.dateTo) {
      alert("⚠️ Please select both start and end dates.");
      return;
    }

    const startDate = new Date(formData.dateFrom);
    const endDate = new Date(formData.dateTo);

    if (startDate > endDate) {
      alert("⚠️ Start date must be before end date.");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const newReport = {
        id: reports.length + 1,
        name: `${formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split("T")[0],
        type: formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1),
        size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
        data: {
          readings: Math.floor(Math.random() * 10000 + 1000),
          avgGas: Math.floor(Math.random() * 200 + 100),
          maxGas: Math.floor(Math.random() * 200 + 300),
          alerts: Math.floor(Math.random() * 50),
        },
      };

      setReports((prev) => [newReport, ...prev]);
      setIsGenerating(false);
      
      handleDownload(newReport);
      
      alert("✓ Report generated and downloaded successfully!");
    }, 2000);
  };

  return (
    <div className="page-content reports-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">Generate and download monitoring reports</p>
        </div>
        <div className="page-actions">
          <button 
            className="page-action-btn" 
            onClick={() => {
              if (window.confirm("⚠️ Are you sure you want to clear all reports?")) {
                setReports([]);
                alert("✓ All reports cleared!");
              }
            }}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="reports-grid">
        {/* Report Generator */}
        <div className="panel report-generator">
          <h3 className="section-title">
            <span className="section-icon">📊</span>
            Generate Custom Report
          </h3>
          <div className="generator-form">
            <div className="form-group">
              <label>Report Type</label>
              <select
                className="form-select"
                value={formData.reportType}
                onChange={(e) =>
                  setFormData({ ...formData, reportType: e.target.value })
                }
              >
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Analysis</option>
                <option value="monthly">Monthly Report</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, dateFrom: e.target.value })
                  }
                  max={new Date().toISOString().split('T')[0]}
                />
                <span>to</span>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateTo}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTo: e.target.value })
                  }
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Format</label>
              <div className="format-options">
                <label className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={formData.format === "pdf"}
                    onChange={(e) =>
                      setFormData({ ...formData, format: e.target.value })
                    }
                  />
                  <span>📄 PDF</span>
                </label>
                <label className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={formData.format === "excel"}
                    onChange={(e) =>
                      setFormData({ ...formData, format: e.target.value })
                    }
                  />
                  <span>📊 Excel</span>
                </label>
                <label className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={formData.format === "csv"}
                    onChange={(e) =>
                      setFormData({ ...formData, format: e.target.value })
                    }
                  />
                  <span>📋 CSV</span>
                </label>
              </div>
            </div>

            <button
              className="generate-btn"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="btn-spinner"></span>
                  Generating...
                </>
              ) : (
                <>📊 Generate Report</>
              )}
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="panel reports-list">
          <h3 className="section-title">
            <span className="section-icon">📁</span>
            Generated Reports ({reports.length})
          </h3>
          <div className="reports-items">
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No reports generated yet</p>
                <span>Generate your first report to get started</span>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-icon">📄</div>
                  <div className="report-info">
                    <h4 className="report-name">{report.name}</h4>
                    <div className="report-meta">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <div className="report-actions">
                    <button
                      className="report-btn"
                      title="Download"
                      onClick={() => handleDownload(report)}
                    >
                      📥
                    </button>
                    <button
                      className="report-btn"
                      title="Share"
                      onClick={() => handleShare(report)}
                    >
                      🔗
                    </button>
                    <button
                      className="report-btn danger"
                      title="Delete"
                      onClick={() => handleDelete(report.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}