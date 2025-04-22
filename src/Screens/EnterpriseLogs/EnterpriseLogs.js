import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './EnterpriseLogs.css';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const EnterpriseLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchEnterprise, setSearchEnterprise] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
        const rawData = await response.json();

        let data = [];

        if (rawData?.body) {
          const parsedBody = typeof rawData.body === 'string'
            ? JSON.parse(rawData.body)
            : rawData.body;

          data = parsedBody?.data || [];
        }

        setLogs(data);
        groupLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const groupLogs = (logs) => {
    const grouped = [];

    logs.forEach(log => {
      let enterpriseGroup = grouped.find(group => group.enterprise === log.enterprise);
      if (!enterpriseGroup) {
        enterpriseGroup = { enterprise: log.enterprise, dates: [] };
        grouped.push(enterpriseGroup);
      }

      let dateGroup = enterpriseGroup.dates.find(date => date.date === log.date);
      if (!dateGroup) {
        dateGroup = { date: log.date, logs: [] };
        enterpriseGroup.dates.push(dateGroup);
      }

      dateGroup.logs.push(log);
    });

    setFilteredLogs(grouped);
  };

  useEffect(() => {
    let filtered = logs;

    if (searchEnterprise) {
      filtered = filtered.filter(log =>
        (log.enterprise || "").toLowerCase().includes(searchEnterprise.value.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return logDate >= start && logDate <= end;
      });
    }

    groupLogs(filtered);
  }, [startDate, endDate, searchEnterprise, logs]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchEnterprise(null);
  };

  const handleExportCSV = () => {
    if (flatFilteredLogs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const csvData = flatFilteredLogs.map(log => ({
      Enterprise: log.enterprise,
      Technician: log.technician_name,
      Location: log.location,
      Date: log.date,
      Task: log.task,
      Comments: log.additional_comments
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'enterprise_logs.csv');
  };

  const enterpriseOptions = [...new Set(logs.map(log => log.enterprise))]
    .map(ent => ({ label: ent, value: ent }));

  const flatFilteredLogs = logs.filter(log => {
    const matchEnterprise = searchEnterprise
      ? (log.enterprise || "").toLowerCase().includes(searchEnterprise.value.toLowerCase())
      : true;

    const matchDate =
      startDate && endDate
        ? new Date(log.date) >= new Date(startDate) && new Date(log.date) <= new Date(endDate)
        : true;

    return matchEnterprise && matchDate;
  });

  return (
    <div className="container">
      <h2 className="header">Enterprise Logs</h2>
  
      <div className="controls">
        <div className="date-range-container">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </div>
  
        <div className="select-container">
          <Select
            options={enterpriseOptions}
            onChange={setSearchEnterprise}
            value={searchEnterprise}
            placeholder="Select Enterprise"
            className="select"
          />
          {searchEnterprise && (
            <button className="clear-select-button" onClick={() => setSearchEnterprise(null)}>×</button>
          )}
        </div>
  
        {(startDate || endDate || searchEnterprise) && (
          <button onClick={handleClearFilters} className="clear-button">
            Clear Filters
          </button>
        )}
      </div>
  
      <div className="log-section">
        {(startDate && endDate) || searchEnterprise ? (
          <div className="filtered-results">
            <h3>Filtered Results</h3>
  
            {flatFilteredLogs.length > 0 && (
              <button onClick={handleExportCSV} className="export-button">
                Export to CSV
              </button>
            )}
  
            {flatFilteredLogs.length === 0 ? (
              <p>No logs match your filter.</p>
            ) : (
              flatFilteredLogs.map((log, index) => (
                <div key={index} className="filtered-log-item">
                  <h4 className="enterprise-header">{log.enterprise}</h4>
                  <div className="log-details">
                    <div className="log-detail"><strong>Date:</strong> {log.date}</div>
                    <div className="log-detail"><strong>Technician:</strong> {log.technician_name}</div>
                    <div className="log-detail"><strong>Location:</strong> {log.location}</div>
                    <div className="log-detail"><strong>Task:</strong> {log.task}</div>
                    <div className="log-detail"><strong>Comments:</strong> {log.additional_comments}</div>
                  </div>
                  <hr className="divider" />
                </div>
              ))
            )}
          </div>
        ) : (
<div className="filtered-results">
  <h3>All Results</h3>

  {flatFilteredLogs.length > 0 && (
    <button onClick={handleExportCSV} className="export-button">
      Export to CSV
    </button>
  )}

  {flatFilteredLogs.length === 0 ? (
    <p>No logs available.</p>
  ) : (
    flatFilteredLogs.map((log, index) => (
      <div key={index} className="filtered-log-item">
        <h4 className="enterprise-header">{log.enterprise}</h4>
        <div className="log-details">
          <div className="log-detail"><strong>Date:</strong> {log.date}</div>
          <div className="log-detail"><strong>Technician:</strong> {log.technician_name}</div>
          <div className="log-detail"><strong>Location:</strong> {log.location}</div>
          <div className="log-detail"><strong>Task:</strong> {log.task}</div>
          <div className="log-detail"><strong>Comments:</strong> {log.additional_comments}</div>
        </div>
        <hr className="divider" />
      </div>
          ))
        )}
      </div>
        )}
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />
    </div>
  );
};

export default EnterpriseLogs;