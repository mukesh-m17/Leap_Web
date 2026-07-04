import React, { useState, useEffect } from "react";

export default function HistoryPage({ history = [] }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Convert history data to events
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (history.length > 0) {
      const events = history.map((level, index) => {
        const timestamp = new Date(Date.now() - (history.length - index - 1) * 5000);
        let status = "safe";
        let event = "Normal operation";
        
        if (level > 400) {
          status = "danger";
          event = `Critical gas leak detected - ${level.toFixed(0)} ppm`;
        } else if (level > 300) {
          status = "warning";
          event = `Elevated gas concentration - ${level.toFixed(0)} ppm`;
        } else {
          event = `Gas levels normal - ${level.toFixed(0)} ppm`;
        }

        return {
          id: index + 1,
          timestamp: timestamp.toLocaleString(),
          level: level,
          status: status,
          event: event,
          unread: index >= history.length - 3, // Last 3 are unread
        };
      }).reverse();

      setHistoryData(events);
    }
  }, [history]);

  // Filter data
  const filteredData = historyData.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.level.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "desc") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle view details
  const handleView = (item) => {
    alert(`Event Details:\n\nTimestamp: ${item.timestamp}\nGas Level: ${item.level.toFixed(2)} ppm\nStatus: ${item.status.toUpperCase()}\nEvent: ${item.event}`);
  };

  // Handle export
  const handleExport = (item) => {
    const csvContent = `Timestamp,Gas Level,Status,Event\n${item.timestamp},${item.level},${item.status},${item.event}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `event-${item.id}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setHistoryData((prev) => prev.filter((item) => item.id !== id));
      alert("Event deleted successfully!");
    }
  };

  // Export all filtered data
  const handleExportAll = () => {
    const csvContent = [
      ["Timestamp", "Gas Level (ppm)", "Status", "Event"],
      ...filteredData.map((item) => [
        item.timestamp,
        item.level.toFixed(2),
        item.status,
        item.event,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `history-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all history
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
      setHistoryData([]);
      setCurrentPage(1);
      alert("History cleared successfully!");
    }
  };

  return (
    <div className="page-content history-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Event History</h2>
          <p className="page-subtitle">
            Complete log of all gas monitoring events ({filteredData.length} events)
          </p>
        </div>
        <div className="page-actions">
          <button className="page-action-btn" onClick={handleExportAll}>
            📥 Export Filtered
          </button>
          <button className="page-action-btn" onClick={handleClearAll}>
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="history-controls">
        <div className="history-filters">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Events
          </button>
          <button
            className={`filter-btn ${filter === "danger" ? "active" : ""}`}
            onClick={() => setFilter("danger")}
          >
            🚨 Critical
          </button>
          <button
            className={`filter-btn ${filter === "warning" ? "active" : ""}`}
            onClick={() => setFilter("warning")}
          >
            ⚠️ Warnings
          </button>
          <button
            className={`filter-btn ${filter === "safe" ? "active" : ""}`}
            onClick={() => setFilter("safe")}
          >
            ✓ Safe
          </button>
        </div>

        <div className="history-search">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            title="Toggle sort order"
          >
            {sortOrder === "desc" ? "↓ Newest First" : "↑ Oldest First"}
          </button>
        </div>
      </div>

      <div className="panel history-table-container">
        {paginatedData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No events found</p>
            <span>Try adjusting your filters or search term</span>
          </div>
        ) : (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Gas Level</th>
                  <th>Event Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className={`history-row ${item.status}`}>
                    <td>
                      <span className={`status-pill ${item.status}`}>
                        {item.status === "danger" && "🚨"}
                        {item.status === "warning" && "⚠️"}
                        {item.status === "safe" && "✓"}
                      </span>
                    </td>
                    <td className="timestamp">{item.timestamp}</td>
                    <td className="gas-level">
                      <span className={`level-badge ${item.status}`}>
                        {item.level.toFixed(0)} ppm
                      </span>
                    </td>
                    <td className="event-description">{item.event}</td>
                    <td>
                      <button
                        className="action-btn-small"
                        onClick={() => handleView(item)}
                      >
                        View
                      </button>
                      <button
                        className="action-btn-small"
                        onClick={() => handleExport(item)}
                      >
                        Export
                      </button>
                      <button
                        className="action-btn-small danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}