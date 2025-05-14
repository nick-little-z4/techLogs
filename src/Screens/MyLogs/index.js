import React, { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import './MyLogs.css';

const LOGS_PER_PAGE = 5;

const MyLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const startIdx = (currentPage - 1) * LOGS_PER_PAGE;
  const currentLogs = filteredLogs.slice(startIdx, startIdx + LOGS_PER_PAGE);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const goToPrev = () => {
    setOpenIndex(null);
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setOpenIndex(null);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();

    const filtered = logs.filter((log) =>
      log.task?.toLowerCase().includes(lowerQuery) ||
      log.location?.toLowerCase().includes(lowerQuery) ||
      log.additional_comments?.toLowerCase().includes(lowerQuery)
    );

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const user = await getCurrentUser();
        const userAttributes = await fetchUserAttributes(user);
        const displayName = userAttributes.displayName || userAttributes.email;
        const email = userAttributes.email;
        const firstNameFromEmail = email.split('@')[0].split('.')[0];
        setCurrentUserName(displayName);

        const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
        const rawData = await response.json();
        const parsed = typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body;

        const allLogs = parsed.data || [];
        const userLogs = allLogs.filter(log =>
          log.technician_name?.toLowerCase().includes(firstNameFromEmail.toLowerCase())
        );

        setLogs(userLogs);
        setFilteredLogs(userLogs);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load logs.');
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="page-wrapper">
        
      {/* <h2 className="form-title">Submitted Logs: <strong>{filteredLogs.length}</strong></h2> */}
  {/* Header with count and search bar */}
  <div className="logs-header">
    <p className="total-count">
      Submitted Logs: <strong>{filteredLogs.length}</strong>
    </p>

    <input
      type="text"
      placeholder="Search Logs..."
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      className="search-input"
    />
  </div>

  {error && <p className="error-message">{error}</p>}

      {filteredLogs.length === 0 ? (
        <p className="no-logs-message">No logs found for {currentUserName}</p>
      ) : (
        <>
          <div className="logs-container scrollable-logs">
            {currentLogs.map((log, idx) => {
              const globalIndex = startIdx + idx;
              return (
                <div className="log-entry" key={globalIndex}>
                  <div
                    className="log-summary"
                    onClick={() => toggleOpen(globalIndex)}
                  >
                    <strong>{new Date(log.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</strong> — {log.location}
                  </div>

                  {openIndex === globalIndex && (
                    <div className="log-details">
                      <p><strong>Task:</strong> {log.task}</p>
                      <p><strong>Comments:</strong> {log.additional_comments || 'None'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button onClick={goToPrev} disabled={currentPage === 1}>
              ⬅ Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={goToNext} disabled={currentPage === totalPages}>
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyLogs;