import React, { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import './MyLogs.css';

const MyLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const user = await getCurrentUser();
        const userAttributes = await fetchUserAttributes(user);
        const displayName = userAttributes.displayName || userAttributes.email;
        const email = userAttributes.email;
        const firstNameFromEmail = email.split('@')[0].split('.')[0]; // gets 'jesse' from 'jesse.smith@...'
        setCurrentUserName(displayName);

        const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
        const rawData = await response.json();
        const parsed = typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body;

        const allLogs = parsed.data || [];

        // Filter logs submitted by this user
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
      <h2 className="form-title"> Submitted Logs</h2>
  
      {error && <p className="error-message">{error}</p>}
  
      {filteredLogs.length === 0 ? (
        <p className="no-logs-message">No logs found for {currentUserName}.</p>
      ) : (
        <>
          <p className="total-count">Logs found: <strong>{filteredLogs.length}</strong></p>
          <div className="logs-container scrollable-logs">
            {filteredLogs.map((log, idx) => (
              <div className="log-entry" key={idx}>
                <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {log.location}</p>
                <p><strong>Task:</strong> {log.task}</p>
                <p><strong>Comments:</strong> {log.additional_comments || 'None'}</p>
                <hr />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyLogs;