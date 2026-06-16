import React, { useState } from "react";

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data - in real app, this would come from props or API
  const [historyData, setHistoryData] = useState([
    {
      id: 1,
      timestamp: "2024-01-15 14:32:15",
      level: 450,
      status: "danger",
      event: "Critical gas leak detected",
    },
    {
      id: 2,
      timestamp: "2024-01-15 12:15:42",
      level: 320,
      status: "warning",
      event: "Elevated gas concentration",
    },
    {
      id: 3,
      timestamp: "2024-01-15 09:22:08",
      level: 180,
      status: "safe",
      event: "Normal operation resumed",
    },
    {
      id: 4,
      timestamp: "2024-01-14 18:45:33",
      level: 350,
      status: "warning",
      event: "Warning threshold exceeded",
    },
    {
      id: 5,
      timestamp: "2024-01-14 15:12:56",
      level: 420,
      status: "danger",
      event: "Emergency protocol activated",
    },
    {
      id: 6,
      timestamp: "2024-01-14 12:08:21",
      level: 250,
      status: "safe",
      event: "Gas levels normal",
    },
    {
      id: 7,
      timestamp: "2024-01-14 09:45:10",
      level: 310,
      status: "warning",
      event: "Slight increase detected",
    },
    {
      id: 8,
      timestamp: "2024-01-13 16:30:45",
      level: 480,
      status: "danger",
      event: "Critical alert - immediate action required",
    },
    {
      id: 9,
      timestamp: "2024-01-13 14:20:33",
      level: 200,
      status: "safe",
      event: "System functioning normally",
    },
    {
      id: 10,
      timestamp: "2024-01-13 11:15:22",
      level: 340,
      status: "warning",
      event: "Gas concentration rising",
    },
  ]);

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
    alert(`Event Details:\n\nTimestamp: ${item.timestamp}\nGas Level: ${item.level} ppm\nStatus: ${item.status.toUpperCase()}\nEvent: ${item.event}`);
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
        item.level,
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
                        {item.level} ppm
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