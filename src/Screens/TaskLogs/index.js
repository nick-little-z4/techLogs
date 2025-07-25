import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './TaskLogs.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const TaskLogs = () => {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTask, setSearchTask] = useState(null);

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
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTask(null);
  };

  const taskOptions = [...new Set(logs.map(log => log.task))]
    .map(task => ({ label: task, value: task }));

  const flatFilteredLogs = logs.filter(log => {
    const matchTask = searchTask
      ? (log.task || "").toLowerCase().includes(searchTask.value.toLowerCase())
      : true;

    const matchDate =
      startDate && endDate
        ? new Date(log.date) >= new Date(startDate) && new Date(log.date) <= new Date(endDate)
        : true;

    return matchTask && matchDate;
  });

  const setLastNDays = (numDays) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - numDays);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
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
          Comments: log.additional_comments || '',
          Technicians: log.technician_name ? [log.technician_name] : [],
          Dates: log.date ? [new Date(log.date).toLocaleDateString()] : [],
        };
      } else {
        groupedData[key].Count += 1;
        if (log.technician_name) {
          groupedData[key].Technicians.push(log.technician_name);
        }
        if (log.additional_comments) {
          groupedData[key].Comments += ` | ${log.additional_comments}`;
        }
        if (log.date) {
          groupedData[key].Dates.push(new Date(log.date).toLocaleDateString());
        }
      }
    });
    
    const exportData = Object.values(groupedData).map(item => ({
      Enterprise: item.Enterprise,
      Location: item.Location,
      Task: item.Task,
      Task_Count: item.Count,
      Date: [...new Set(item.Dates)].join(', '), // Already formatted, no need for new Date()
      Technicians: [...new Set(item.Technicians)].join(', '),
      Comments: item.Comments
    }));
  
    // Add total row
    const totalTasks = exportData.reduce((sum, item) => sum + item.Task_Count, 0);
    exportData.push({
      Enterprise: 'TOTAL TASK COUNT',
      Location: '',
      Task: '',
      Task_Count: totalTasks,
      Dates: '',
      Technicians: '',
      Comments: ''
    });
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks Logs');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'task_logs.xlsx');
  };

  return (
    <div className="container">
      <h2 className="header">Task Logs</h2>

      <div className="controls">
        <div className="date-range-container">
          {/* Start Date Label and Input */}
          <label htmlFor="startDate" className="date-label">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />

          {/* End Date Label and Input */}
          <label htmlFor="endDate" className="date-label">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </div>

        <div className="quick-buttons">
          <button onClick={() => setLastNDays(15)} className="quick-button">Past 15 Days</button>
          <button onClick={() => setLastNDays(30)} className="quick-button">Past 30 Days</button>
          <button onClick={() => setLastNDays(90)} className="quick-button">Past 90 Days</button>
        </div>

        <div className="select-container-task">
          <Select
            options={taskOptions}
            onChange={setSearchTask}
            value={searchTask}
            placeholder="Select Task"
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

        {(startDate || endDate || searchTask) && (
          <button onClick={handleClearFilters} className="clear-button">
            Clear Filters
          </button>
        )}
      </div>

      <div className="log-section">
        <div className="filtered-results">
          <h3>Results</h3>

          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Total Results: {flatFilteredLogs.length}
          </div>

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
                <h4 className="task-header">{log.task}</h4>
                <div className="log-details">
                  <div className="log-detail"><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</div>
                  <div className="log-detail"><strong>Technician:</strong> {log.technician_name}</div>
                  <div className="log-detail"><strong>Location:</strong> {log.location}</div>
                  <div className="log-detail"><strong>Enterprise:</strong> {log.enterprise}</div>
                  <div className="log-detail"><strong>Comments:</strong> {log.additional_comments}</div>
                </div>
                <hr className="divider" />
              </div>
            ))
          )}
        </div>
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />
    </div>
  );
};

export default TaskLogs;