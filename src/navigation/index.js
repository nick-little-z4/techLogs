import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import './Navigation.css';

import LogEntry from "../Screens/LogEntry";
import TechLogs from "../Screens/TechLogs";
import SiteTotals from "../Screens/SiteTotals";
import EnterpriseLogs from "../Screens/EnterpriseLogs/EnterpriseLogs";
import TaskLogs from "../Screens/TaskLogs";

const Navigation = ({ userGroups, userAttributes }) => {
  const isManager = userGroups.includes("Managers");

  return (
    <Router>
      <nav className="navbar">
        <Link className="navlink" to="/">Log Entry</Link>

        {isManager && (
          <>
            <Link className="navlink" to="/TechLogs">Tech Logs</Link>
            <Link className="navlink" to="/SiteTotals">Site Totals</Link>
            <Link className="navlink" to="/EnterpriseLogs">Enterprise Logs</Link>
            <Link className="navlink" to="/TaskLogs">Task Logs</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route 
          path="/" 
          element={<LogEntry userGroups={userGroups} userAttributes={userAttributes} />} 
        />

        {isManager ? (
          <>
            <Route path="/TechLogs" element={<TechLogs userAttributes={userAttributes} />} />
            <Route path="/SiteTotals" element={<SiteTotals userAttributes={userAttributes} />} />
            <Route path="/EnterpriseLogs" element={<EnterpriseLogs userAttributes={userAttributes} />} />
            <Route path="/TaskLogs" element={<TaskLogs userAttributes={userAttributes} />} />
          </>
        ) : (
          <>
            <Route path="/TechLogs" element={<Navigate to="/" />} />
            <Route path="/SiteTotals" element={<Navigate to="/" />} />
            <Route path="/EnterpriseLogs" element={<Navigate to="/" />} />
            <Route path="/TaskLogs" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default Navigation;