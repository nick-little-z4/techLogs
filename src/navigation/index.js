import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import './Navigation.css';

import LogEntry from "../Screens/LogEntry";
import TechLogs from "../Screens/TechLogs";
import SiteTotals from "../Screens/SiteTotals";
import EnterpriseLogs from "../Screens/EnterpriseLogs/EnterpriseLogs";
import TaskLogs from "../Screens/TaskLogs";
import MyLogs from "../Screens/MyLogs";
import theme from "../theme";

const Navigation = ({ userGroups, userAttributes }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const isManager = userGroups.includes("Managers");

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleLogs = () => setLogsOpen(!logsOpen);

  const linkStyle = {
    color: 'white',
    textDecoration: "none",
    padding: "0px 0px",
    display: "block",
    whiteSpace: "nowrap", // Prevent text from wrapping
  };

  const dropdownTitleStyle = {
    cursor: "pointer",
    color: theme.colors.fontColor,
    fontWeight: "bold",
    padding: "0px 0px",
    display: "block",
  };

  const dropdownContentStyle = {
    display: logsOpen ? "block" : "none",
    maxHeight: logsOpen ? "200px" : "0",
    overflowY: "auto",
    transition: "max-height 0.3s ease-in-out",
    padding: "0",
    marginTop: "4px", // 👈 add this line for spacing after Logs
  };

  return (
    <Router>
      <nav className="navbar">
        <div className="menu-toggle" onClick={toggleMenu} style={{ color: "#FFFFFF" }}>☰</div>
        <div className={`navlinks ${menuOpen ? "open" : ""}`}>
          <Link className="navlink" to="/" onClick={() => setMenuOpen(false)} style={linkStyle}>Log Entry</Link>
          <Link className="navlink" to="/MyLogs" onClick={() => setMenuOpen(false)} style={linkStyle}>My Logs</Link>
          {isManager && (
            <Link className="navlink" to="/SiteTotals" onClick={() => { setMenuOpen(false); setLogsOpen(false); }} style={linkStyle}>Site Totals</Link>
          )}
          {isManager && (
            <div className="dropdown">
              <div className="dropdown-title" onClick={toggleLogs} style={dropdownTitleStyle}>
              Logs <span style={{ fontSize: '0.7em' }}>{logsOpen ? "▲" : "▼"}</span>
              </div>
              <div className="dropdown-content" style={dropdownContentStyle}>
                <Link className="navlink" to="/TechLogs" onClick={() => { setMenuOpen(false); setLogsOpen(false); }} style={linkStyle}>Tech Logs</Link>
                <Link className="navlink" to="/EnterpriseLogs" onClick={() => { setMenuOpen(false); setLogsOpen(false); }} style={linkStyle}>Enterprise Logs</Link>
                <Link className="navlink" to="/TaskLogs" onClick={() => { setMenuOpen(false); setLogsOpen(false); }} style={linkStyle}>Task Logs</Link>
              </div>
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
        <Route path="/MyLogs" element={<MyLogs />} />
      </Routes>
    </Router>
  );
};

export default Navigation;