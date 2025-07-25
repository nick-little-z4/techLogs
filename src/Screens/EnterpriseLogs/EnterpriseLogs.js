import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './EnterpriseLogs.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx'; // NEW: XLSX for Excel file generation

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

  const handleExportXLSX = () => {
    if (flatFilteredLogs.length === 0) {
      alert("No logs to export.");
      return;
    }
  
    // Group by Enterprise + Location + Task
    const groupedData = {};
  
    flatFilteredLogs.forEach(log => {
      const key = `${log.enterprise}|${log.location}|${log.task}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          Enterprise: log.enterprise,
          Location: log.location,
          Task: log.task,
          Count: 1,
          Dates: log.date ? [log.date] : [],
          Comments: log.additional_comments || '',
          Technicians: log.technician_name ? [log.technician_name] : []
        };
      } else {
        groupedData[key].Count += 1;
        if (log.date) {
          groupedData[key].Dates.push(log.date);
        }
        if (log.technician_name) {
          groupedData[key].Technicians.push(log.technician_name);
        }
        if (log.additional_comments) {
          groupedData[key].Comments += ` | ${log.additional_comments}`;
        }
      }
    });
  
    const exportData = Object.values(groupedData).map(item => ({
      Date: [...new Set(item.Dates)].map(d => new Date(d).toLocaleDateString()).join(', '),
      Enterprise: item.Enterprise,
      Location: item.Location,
      Task: item.Task,
      Visit_Count: item.Count,
      Technicians: [...new Set(item.Technicians)].join(', '),
      Comments: item.Comments
    }));
  
    // 🆕 Add a total row
    const totalVisits = exportData.reduce((sum, item) => sum + item.Visit_Count, 0);
    exportData.push({
      Enterprise: 'TOTAL VISIT COUNT',
      Location: '',
      Task: '',
      Visit_Count: totalVisits,
      Technicians: '',
      Comments: ''
    });
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enterprise Logs');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'enterprise_logs.xlsx');
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

  const setPastDays = (days) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
  
    setStartDate(pastDate.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="container">
    <h2 className="header">Enterprise Logs</h2>

    <div className="controls">
  <div className="date-range-container">
    <label htmlFor="startDate" className="date-label">Start Date</label>
    <input
      type="date"
      id="startDate"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="input"
    />

    <label htmlFor="endDate" className="date-label">End Date</label>
    <input
      type="date"
      id="endDate"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="input"
    />
  </div>
  
  {/* NEW: Quick Range Buttons */}
  <div className="quick-range-buttons">
    <button onClick={() => setPastDays(15)} className="quick-button">Past 15 Days</button>
    <button onClick={() => setPastDays(30)} className="quick-button">Past 30 Days</button>
    <button onClick={() => setPastDays(90)} className="quick-button">Past 90 Days</button>
  </div>

  <div className="select-container-enterprise">
    <Select
      options={enterpriseOptions}
      onChange={setSearchEnterprise}
      value={searchEnterprise}
      placeholder="Select Enterprise"
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

      <p className="results-count">Results Found: {flatFilteredLogs.length}</p> {/* NEW: Results Count */}

      {flatFilteredLogs.length > 0 && (
        <button onClick={handleExportXLSX} className="export-button">
          Export to Excel
        </button>
      )}

      {flatFilteredLogs.length === 0 ? (
        <p>No logs match your filter.</p>
      ) : (
        flatFilteredLogs.map((log, index) => (
          <div key={index} className="filtered-log-item">
            <h4 className="enterprise-header">{log.enterprise}</h4>
            <div className="log-details">
              <div className="log-detail"><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</div>
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

      <p className="results-count">Results Found: {flatFilteredLogs.length}</p> {/* NEW: Results Count */}

      {flatFilteredLogs.length > 0 && (
        <button onClick={handleExportXLSX} className="export-button">
          Export to Excel
        </button>
      )}

      {flatFilteredLogs.length === 0 ? (
        <p>No logs available.</p>
      ) : (
        flatFilteredLogs.map((log, index) => (
          <div key={index} className="filtered-log-item">
            <h4 className="enterprise-header">{log.enterprise}</h4>
            <div className="log-details">
              <div className="log-detail"><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</div>
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