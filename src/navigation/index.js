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
  const isManager = userGroups.includes("Managers");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Router>
      <nav className="navbar">
        <div className="menu-toggle" onClick={toggleMenu}>
          ☰
        </div>
        <div className={`navlinks ${menuOpen ? "open" : ""}`}>
          <Link className="navlink" to="/" onClick={() => setMenuOpen(false)}>Log Entry</Link>

          {isManager && (
            <>
              <Link className="navlink" to="/TechLogs" onClick={() => setMenuOpen(false)}>Tech Logs</Link>
              <Link className="navlink" to="/SiteTotals" onClick={() => setMenuOpen(false)}>Site Totals</Link>
              <Link className="navlink" to="/EnterpriseLogs" onClick={() => setMenuOpen(false)}>Enterprise Logs</Link>
              <Link className="navlink" to="/TaskLogs" onClick={() => setMenuOpen(false)}>Task Logs</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LogEntry userGroups={userGroups} userAttributes={userAttributes} />} />

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