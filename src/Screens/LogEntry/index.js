import React, { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import './LogEntry.css';
import taskOptions from '../../data/taskOptions';
import theme from '../../theme';
import '../../assets/fonts/font.css'

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
  const [task, setTask] = useState([]);
  const [comments, setComments] = useState('');
  const [allLogs, setAllLogs] = useState([]);
  const [locationLogs, setLocationLogs] = useState([]);
  
 const canSubmit = selectedLocation !== '' && task.length > 0;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        const userAttributes = await fetchUserAttributes(user);
        const displayName = userAttributes.displayName || userAttributes.email;
        setCurrentUserDisplayName(displayName);
      } catch (err) {
        console.error('User not authenticated:', err);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await fetch('https://z2h4sw2lg0.execute-api.us-east-1.amazonaws.com/prod/getLocations');
        const rawData = await response.json();
        console.log("📥 Raw API Response:", rawData);

        const parsedBody = typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body;
        console.log("📦 Parsed Body:", parsedBody);

        if (!Array.isArray(parsedBody.data)) {
          console.error('❌ Unexpected response format:', parsedBody);
          return;
        }

        let allLocations = parsedBody.data;
        console.log("✅ Locations Array:", allLocations);

        setLocations(allLocations);

        const uniqueStates = [...new Set(allLocations.map(loc => loc.state).filter(Boolean))];
        console.log("📍 Unique States Extracted:", uniqueStates);

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

  useEffect(() => {
    const fetchLogsForLocation = async () => {
      if (!selectedLocation) {
        setLocationLogs([]);
        return;
      }

      try {
        const response = await fetch('https://z2h4sw2lg0.execute-api.us-east-1.amazonaws.com/prod/getTechDataLogs', {
          method: 'GET',
        });

        const rawData = await response.json();
        console.log("📥 Logs API Response:", rawData);

        const parsedBody = typeof rawData.body === 'string'
          ? JSON.parse(rawData.body)
          : rawData.body;
        console.log("📦 Parsed Logs Body:", parsedBody);

        const allLogs = parsedBody.data || [];

        const logsForLocation = allLogs.filter(log => log.location === selectedLocation);
        console.log(`📍 Logs for Selected Location (${selectedLocation}):`, logsForLocation);

        setLocationLogs(logsForLocation);
      } catch (error) {
        console.error('Error fetching logs for location:', error);
      }
    };

    fetchLogsForLocation();
  }, [selectedLocation]);

  const callLambda = async () => {
    if (!selectedLocation || task.length === 0) {
      alert('🚫 Please select a Location and at least one Task before submitting.');
      return;
    }

    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes(user);
      const displayName = userAttributes.displayName || userAttributes.email;

      // Loop over each selected task and submit separately
      for (const singleTask of task) {
        const logData = {
          technician_name: displayName,
          date,
          location: selectedLocation,
          task: singleTask, // only one task here
          additional_comments: comments,
          enterprise: selectedEnterprise,
          state: selectedState,
        };

        const response = await fetch(
          'https://z2h4sw2lg0.execute-api.us-east-1.amazonaws.com/prod/submit-log',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
          }
        );

        if (!response.ok) {
          alert(`❌ Failed to submit log for task "${singleTask}". Status: ${response.status}`);
          return;
        }

        const data = await response.json();
        const parsedBody = JSON.parse(data.body);
        console.log(`✅ Submitted log for "${singleTask}": ${parsedBody.message}`);
      }

      alert(`✅ Successfully submitted ${task.length} log entries.`);
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

  // Log whenever selectedState changes
  useEffect(() => {
    console.log("selectedState updated:", selectedState);
  }, [selectedState]);

  return (
    <div className="page-wrapper-entry">
      <div className="form-card">
        <h2 className="form-title_tec">Technician Log Entry</h2>

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
          <select
            className="form-input"
            value={selectedState}
            onChange={(e) => {
              console.log('State Selected:', e.target.value);
              setSelectedState(e.target.value);
            }}
            onClick={() => console.log('State select clicked')}
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
          <>
            <h3 className="section-header">Enterprise</h3>
            <div className="form-group">
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
          </>
        )}

        {/* Location Section */}
        {filteredLocations.length > 0 && (
          <>
            <h3 className="section-header">Location</h3>
            <div className="form-group">
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
          <div className="task-box">
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
        </div>

        {/* Comments Section */}
        <h3 className="section-header">Additional Comments</h3>
        <div className="form-group">
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
          <button className="clear-form" onClick={clearForm}>Clear Form</button>
          <button className="submit-button" onClick={callLambda} disabled={!canSubmit}> Submit Log </button>
        </div>

        {/* Display Fetched Logs for Selected Location */}
        {selectedLocation && (
          <>
            <hr />
            <div className="logs-container-entry">
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
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((log, idx) => (
                      <li key={idx}>
                        <strong>{new Date(log.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</strong> — {
                          log.technician_name
                            .split('@')[0]
                            .split('.')
                            .map(name => name.charAt(0).toUpperCase() + name.slice(1))
                            .join(' ')
                        } — {log.task} — {log.additional_comments}
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
