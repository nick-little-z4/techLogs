import React, { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth'; // Import these functions
import './LogEntry.css';
import taskOptions from '../../data/taskOptions';

const LogEntry = () => {
const [currentUserDisplayName, setCurrentUserDisplayName] = useState('');
const [date, setDate] = useState('');
const [locations, setLocations] = useState([]);
const [selectedLocation, setSelectedLocation] = useState('');
const [enterprise, setEnterprise] = useState('');
const [task, setTask] = useState('');
const [comments, setComments] = useState('');

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
    
        // Parse the inner `body` string if it's a string
        const parsedBody = typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body;
    
        if (Array.isArray(parsedBody.data)) {
          setLocations(parsedBody.data);
        } else {
          console.error('Unexpected response format:', parsedBody);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
  
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  
    fetchUser();
    fetchLocations();
  }, []);

  const callLambda = async () => {
    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes(user);
      const displayName = userAttributes.displayName || userAttributes.email;
  
      const logData = {
        technician_name: displayName,
        date,
        location: selectedLocation,
        task,
        additional_comments: comments,
        enterprise,
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
  
    } catch (error) {
      console.error('Network or fetch error:', error);
      alert('❌ Network error while submitting log.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <h2 className="form-title">Technician Log Entry</h2>
  
        <span className="user-email">
          {currentUserDisplayName.split('@')[0].replace(/\./g, ' ')}
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
          <p className="form-hint">Format: YYYY-MM-DD</p>
        </div>
  
        {/* Location Section */}
        <h3 className="section-header">Location</h3>
        <div className="form-group">
          <label className="form-label">Location</label>
          <select
            className="form-input"
            value={selectedLocation}
            onChange={(e) => {
              const selected = e.target.value;
              setSelectedLocation(selected);
              const match = locations.find(loc => loc.location === selected);
              setEnterprise(match ? match.enterprise : '');
            }}
          >
            <option value="">Select Location</option>
            {(locations || []).map((loc, idx) => (
              <option key={idx} value={loc.location}>
                {loc.location}
              </option>
            ))}
          </select>
        </div>
  
        {/* Enterprise Section */}
        <h3 className="section-header">Enterprise</h3>
        <div className="form-group">
          <label className="form-label">Enterprise</label>
          <input
            type="text"
            className="form-input"
            value={enterprise}
            disabled
          />
        </div>
  
        {/* Task Section */}
        <h3 className="section-header">Task</h3>
        <div className="form-group">
        <label className="form-label">Task</label>
        <select
          className="form-input"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        >
          <option value="">Select Task</option>
          {taskOptions.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
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
  
        <button onClick={callLambda} className="submit-btn">Submit Log</button>
  
        <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      </div>
    </div>
  );
};

export default LogEntry;