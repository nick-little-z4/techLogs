import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './TechLogs.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const TechLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchAgent, setSearchAgent] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [expandedTech, setExpandedTech] = useState(null);

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
        } else {
          console.warn('No body found in API response:', rawData);
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
      let techGroup = grouped.find(group => group.technician_name === log.technician_name);
      if (!techGroup) {
        techGroup = { technician_name: log.technician_name, locations: [] };
        grouped.push(techGroup);
      }

      let locationGroup = techGroup.locations.find(loc => loc.location === log.location);
      if (!locationGroup) {
        locationGroup = { location: log.location, dates: [] };
        techGroup.locations.push(locationGroup);
      }

      let dateGroup = locationGroup.dates.find(date => date.date === log.date);
      if (!dateGroup) {
        dateGroup = { date: log.date, logs: [] };
        locationGroup.dates.push(dateGroup);
      }

      dateGroup.logs.push(log);
    });

    setFilteredLogs(grouped);
  };

  useEffect(() => {
    let filtered = logs;

    if (searchAgent) {
      filtered = filtered.filter(log =>
        log.technician_name.toLowerCase().includes(searchAgent.value.toLowerCase())
      );
    }

    if (searchLocation) {
      filtered = filtered.filter(log =>
        (log.location || "").toLowerCase().includes(searchLocation.value.toLowerCase())
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
  }, [startDate, endDate, searchAgent, searchLocation, logs]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchAgent(null);
    setSearchLocation(null);
  };

  const handleExportXLSX = () => {
    if (flatFilteredLogs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const exportData = flatFilteredLogs.map(log => ({
      Technician: log.technician_name,
      Location: log.location,
      Date: log.date, // Fixed: keep original string
      Task: log.task,
      Comments: log.additional_comments,
      'Arrival Time': log.arrival_time || '',
      'Departure Time': log.departure_time || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tech Logs");

    const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });
    saveAs(blob, "filtered_logs.xlsx");
  };

  const applyQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const formatTechnicianName = (email) => {
    const noDomain = email.split('@')[0];
    const parts = noDomain.split('.');
    const capitalized = parts.map(
      part => part.charAt(0).toUpperCase() + part.slice(1)
    );
    return capitalized.join(' ');
  };

  const technicianOptions = [...new Set(logs.map(log => log.technician_name))]
    .map(name => ({
      label: formatTechnicianName(name),
      value: name
    }));

  const locationOptions = [...new Set(logs.map(log => log.location))]
    .map(loc => ({ label: loc, value: loc }));

  const flatFilteredLogs = logs.filter(log => {
    const matchTech = searchAgent
      ? log.technician_name.toLowerCase().includes(searchAgent.value.toLowerCase())
      : true;

    const matchLocation = searchLocation
      ? (log.location || "").toLowerCase().includes(searchLocation.value.toLowerCase())
      : true;

    const matchDate =
      startDate && endDate
        ? new Date(log.date) >= new Date(startDate) && new Date(log.date) <= new Date(endDate)
        : true;

    return matchTech && matchLocation && matchDate;
  });

  return (
<div className="container">
  <h2 className="header">Tech Logs</h2>

  <div className="date-range-containers">
    <label htmlFor="startDate" className="date-label">Start Date</label>
    <div className="date-input">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="input"
      />
    </div>

    <label htmlFor="endDate" className="date-label">End Date</label>
    <div className="date-input">
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="input"
      />
    </div>
  </div>

  <div className="quick-range-buttons">
    <button onClick={() => applyQuickRange(15)}>Last 15 Days</button>
    <button onClick={() => applyQuickRange(30)}>Last 30 Days</button>
    <button onClick={() => applyQuickRange(90)}>Last 90 Days</button>
  </div>

  <div className="select-container-techs">
    <Select
      options={technicianOptions}
      onChange={setSearchAgent}
      value={searchAgent}
      placeholder="Select Technician"
      className="select"
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: '#0A0A5A',
          color: '#FFFFFF',
          borderColor: '#FFFFFF',
        }),
        singleValue: (base) => ({
          ...base,
          color: '#FFFFFF',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#FFFFFF',
        }),
        input: (base) => ({
          ...base,
          color: '#FFFFFF',
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: '#0A0A5A',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? '#1F1F6B' : '#0A0A5A',
          color: '#FFFFFF',
        }),
      }}
    />
    {searchAgent && (
      <button className="clear-select-button" onClick={() => setSearchAgent(null)}>×</button>
    )}
  </div>


  <div className="select-container-techs">
    <Select
      options={locationOptions}
      onChange={setSearchLocation}
      value={searchLocation}
      placeholder="Select Location"
      className="select"
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: '#0A0A5A',
          color: '#FFFFFF',
          borderColor: '#FFFFFF',
        }),
        singleValue: (base) => ({
          ...base,
          color: '#FFFFFF',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#FFFFFF',
        }),
        input: (base) => ({
          ...base,
          color: '#FFFFFF',
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: '#0A0A5A',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? '#1F1F6B' : '#0A0A5A',
          color: '#FFFFFF',
        }),
      }}
    />
    {searchLocation && (
      <button className="clear-select-button" onClick={() => setSearchLocation(null)}>×</button>
    )}
  </div>

  {(startDate && endDate) || searchAgent || searchLocation ? (
    <div className="filtered-results">
      <h2>Filtered Results</h2>
      <p className="filtered-count">Total Filtered Logs: {flatFilteredLogs.length}</p>

      {flatFilteredLogs.length > 0 && (
        <button onClick={handleExportXLSX} className="export-button-tech">
          Export to Excel
        </button>
      )}

      {flatFilteredLogs.length === 0 ? (
        <p>No logs match your filter.</p>
      ) : (
        flatFilteredLogs.map((log, index) => (
          <div key={index} className="filtered-log-item">
            <h4 className="location-header">{log.location}</h4>
            <h4 className="agent-header">{log.technician_name}</h4>
            <div className="log-details">
              <div className="log-detail"><strong>Date:</strong> {log.date}</div>
              <div className="log-detail"><strong>Task:</strong> {log.task}</div>
              <div className="log-detail"><strong>Comments:</strong> {log.additional_comments}</div>
            </div>
            <hr className="divider" />
          </div>
        ))
      )}
    </div>
  ) : null}

  <button onClick={handleClearFilters} className="clear-button-tech">
    Clear Filters
  </button>

  {filteredLogs.map((techGroup, idx) => (
    <div key={idx} className="tech-group">
      {expandedTech === techGroup.technician_name && techGroup.locations.map((loc, i) => (
        <div key={i} className="location-container">
          <h4>{loc.location}</h4>
          {loc.dates.map((dateGroup, j) => (
            <div key={j} className="date-group">
              <strong>Date: {dateGroup.date}</strong>
              {dateGroup.logs.map((log, k) => (
                <div key={k} className="log-card">
                  <p><strong>Technician:</strong> {log.technician_name}</p>
                  <p><strong>Location:</strong> {log.location}</p>
                  <p><strong>Task:</strong> {log.task}</p>
                  <p><strong>Comments:</strong> {log.additional_comments}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ))}
</div>
  );
};

export default TechLogs;