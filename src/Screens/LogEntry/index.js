import React, { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import './LogEntry.css';
import taskOptions from '../../data/taskOptions';

const LogEntry = ({ userGroups }) => {
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState('');
  const [date, setDate] = useState('');
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [task, setTask] = useState('');
  const [comments, setComments] = useState('');
  const [allLogs, setAllLogs] = useState([]);
  const [locationLogs, setLocationLogs] = useState([]);
  

  const canSubmit = selectedLocation !== '' && task !== '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        const userAttributes = await fetchUserAttributes(user);
        const displayName = userAttributes.displayName || userAttributes.email;
        setCurrentUserDisplayName(displayName);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/getLocations');
        const rawData = await response.json();
        const parsedBody = typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body;

        if (!Array.isArray(parsedBody.data)) {
          console.error('❌ Unexpected response format:', parsedBody);
          return;
        }

        let allLocations = parsedBody.data;
        setLocations(allLocations);

        const uniqueStates = [...new Set(allLocations.map(loc => loc.state).filter(Boolean))];
        setStates(uniqueStates.sort());

      } catch (error) {
        console.error('❌ Error fetching locations:', error);
      }
    };

    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    fetchUser();
    if (userGroups && userGroups.length > 0) {
      fetchLocations();
    }
  }, [userGroups]);

  useEffect(() => {
    if (selectedState) {
      const enterpriseList = locations
        .filter(loc => loc.state === selectedState)
        .map(loc => loc.enterprise);

      const uniqueEnterprises = [...new Set(enterpriseList)];
      setEnterprises(uniqueEnterprises.sort());
      setSelectedEnterprise('');
      setSelectedLocation('');
    } else {
      setEnterprises([]);
      setSelectedEnterprise('');
      setFilteredLocations([]);
      setSelectedLocation('');
    }
  }, [selectedState, locations]);

  useEffect(() => {
    if (selectedEnterprise) {
      const locs = locations.filter(
        loc => loc.state === selectedState && loc.enterprise === selectedEnterprise
      );
      setFilteredLocations(locs);
      setSelectedLocation('');
    } else {
      setFilteredLocations([]);
      setSelectedLocation('');
    }
  }, [selectedEnterprise, selectedState, locations]);

  // Fetch logs for the selected location
  useEffect(() => {
    const fetchLogsForLocation = async () => {
      if (!selectedLocation) {
        setLocationLogs([]);
        return;
      }
  
      try {
        const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
        const rawData = await response.json();
  
        const parsedBody = typeof rawData.body === 'string'
          ? JSON.parse(rawData.body)
          : rawData.body;
  
        const allLogs = parsedBody.data || [];
  
        // Filter logs by selectedLocation
        const logsForLocation = allLogs.filter(log => log.location === selectedLocation);
        setLocationLogs(logsForLocation);
      } catch (error) {
        console.error('Error fetching logs for location:', error);
      }
    };
  
    fetchLogsForLocation();
  }, [selectedLocation]);
  const callLambda = async () => {
    if (!selectedLocation || !task) {
      alert('🚫 Please select a Location and a Task before submitting.');
      return;
    }

    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes(user);
      const displayName = userAttributes.displayName || userAttributes.email;

      const logData = {
        technician_name: displayName,
        date,
        location: selectedLocation,
        task: Array.isArray(task) ? task.join(', ') : task,
        additional_comments: comments,
        enterprise: selectedEnterprise,
        state: selectedState,
      };

      const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`❌ Failed to submit log. Status: ${response.status}`);
        return;
      }

      const parsedBody = JSON.parse(data.body);
      alert(`✅ ${parsedBody.message}`);
      clearForm();

    } catch (error) {
      console.error('Network or fetch error:', error);
      alert('❌ Network error while submitting log.');
    }
  };

  const clearForm = () => {
    setSelectedState('');
    setSelectedEnterprise('');
    setSelectedLocation('');
    setTask('');
    setComments('');
  };

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <h2 className="form-title">Technician Log Entry</h2>

        <span className="user-email">
        {currentUserDisplayName
          .split('@')[0]
          .split('.')
          .map(name => name.charAt(0).toUpperCase() + name.slice(1))
          .join(' ')}
      </span>

        {/* Date Section */}
        <h3 className="section-header">Date</h3>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* State Section */}
        <h3 className="section-header">State</h3>
        <div className="form-group">
          <label className="form-label">State</label>
          <select
            className="form-input"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select State</option>
            {states.map((state, idx) => (
              <option key={idx} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Enterprise Section */}
        {enterprises.length > 0 && (
          <h3 className="section-header">Enterprise</h3>
        )}
        {enterprises.length > 0 && (
          <div className="form-group">
            <label className="form-label">Enterprise</label>
            <select
              className="form-input"
              value={selectedEnterprise}
              onChange={(e) => setSelectedEnterprise(e.target.value)}
            >
              <option value="">Select Enterprise</option>
              {enterprises.map((ent, idx) => (
                <option key={idx} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location Section */}
        {filteredLocations.length > 0 && (
          <>
            <h3 className="section-header">Location</h3>
            <div className="form-group">
              <label className="form-label">Location</label>
              <select
                className="form-input"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                {filteredLocations.map((loc, idx) => (
                  <option key={idx} value={loc.location}>
                    {loc.location}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Task Section */}
        <h3 className="section-header">Task</h3>
<div className="form-group">
  <label className="form-label">Select Tasks</label>
  <div className="checkbox-scroll-container">
    {taskOptions.map((option, idx) => (
      <div key={idx} className="checkbox-item">
        <label>
          <input
            type="checkbox"
            value={option}
            checked={task.includes(option)}
            onChange={(e) => {
              const value = e.target.value;
              setTask(prev =>
                prev.includes(value)
                  ? prev.filter(t => t !== value)
                  : [...prev, value]
              );
            }}
          />
          {option}
        </label>
      </div>
    ))}
  </div>
</div>

        {/* Comments Section */}
        <h3 className="section-header">Additional Comments</h3>
        <div className="form-group">
          <label className="form-label">Additional Comments</label>
          <textarea
            className="form-textarea"
            placeholder="Add any notes or context..."
            rows="4"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          ></textarea>
        </div>

        {/* Clear & Submit Buttons */}
        <div className="button-group">
          <button onClick={clearForm}>Clear Form</button>
          <button onClick={callLambda} disabled={!canSubmit}>Submit Log</button>
        </div>

        {/* Display Fetched Logs for Selected Location */}
        {selectedLocation && (
        <>
          <hr />
          <div className="logs-container scrollable-logs">
          <h4>Logs for {selectedLocation}</h4>
          {locationLogs.filter(log => {
            const logDate = new Date(log.date);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            return logDate >= sixtyDaysAgo;
          }).length === 0 ? (
            <p>No logs recorded</p>
          ) : (
            <ul>
              {locationLogs
                .filter(log => {
                  const logDate = new Date(log.date);
                  const sixtyDaysAgo = new Date();
                  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                  return logDate >= sixtyDaysAgo;
                })
                .map((log, idx) => (
                  <li key={idx}>
                    {new Date(log.date).toLocaleDateString()} - {
                      log.technician_name
                        .split('@')[0]
                        .split('.')
                        .map(name => name.charAt(0).toUpperCase() + name.slice(1))
                        .join(' ')
                    } - {log.task} - {log.additional_comments}
                  </li>
                ))}
            </ul>
          )}
        </div>
        </>
      )}

        <hr style={{ margin: '30px 0', borderColor: '#eee' }} />
      </div>
    </div>
  );
};

export default LogEntry;