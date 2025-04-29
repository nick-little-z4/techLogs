import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import './Navigation.css';

import LogEntry from "../Screens/LogEntry";
import TechLogs from "../Screens/TechLogs";
import SiteTotals from "../Screens/SiteTotals";
import EnterpriseLogs from "../Screens/EnterpriseLogs/EnterpriseLogs";
import TaskLogs from "../Screens/TaskLogs";

const Navigation = ({ userGroups, userAttributes }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const isManager = userGroups.includes("Managers");

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleLogs = () => setLogsOpen(!logsOpen);

  return (
    <Router>
      <nav className="navbar">
        <div className="menu-toggle" onClick={toggleMenu}>☰</div>
        <div className={`navlinks ${menuOpen ? "open" : ""}`}>
          <Link className="navlink" to="/" onClick={() => setMenuOpen(false)}>Log Entry</Link>
          {isManager && (
            <Link className="navlink" to="/SiteTotals" onClick={() => { setMenuOpen(false); setLogsOpen(false); }}>Site Totals</Link>
          )}
          {isManager && (
            <div className="dropdown">
              <div className="dropdown-title" onClick={toggleLogs} style={{ cursor: "pointer" }}>
                Logs {logsOpen ? "▲" : "▼"}
              </div>
              {logsOpen && (
                <div className="dropdown-content">
                  <Link className="navlink" to="/TechLogs" onClick={() => { setMenuOpen(false); setLogsOpen(false); }}>Tech Logs</Link>
                  <Link className="navlink" to="/EnterpriseLogs" onClick={() => { setMenuOpen(false); setLogsOpen(false); }}>Enterprise Logs</Link>
                  <Link className="navlink" to="/TaskLogs" onClick={() => { setMenuOpen(false); setLogsOpen(false); }}>Task Logs</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LogEntry userGroups={userGroups} userAttributes={userAttributes} />} />
        <Route path="/SiteTotals" element={isManager ? <SiteTotals userAttributes={userAttributes} /> : <Navigate to="/" />} />
        <Route path="/TechLogs" element={isManager ? <TechLogs userAttributes={userAttributes} /> : <Navigate to="/" />} />
        <Route path="/EnterpriseLogs" element={isManager ? <EnterpriseLogs userAttributes={userAttributes} /> : <Navigate to="/" />} />
        <Route path="/TaskLogs" element={isManager ? <TaskLogs userAttributes={userAttributes} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default Navigation;