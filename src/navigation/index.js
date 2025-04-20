import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import './Navigation.css';

import LogEntry from "../Screens/LogEntry";
import TechLogs from "../Screens/TechLogs";
import AnotherScreen from "../Screens/AnotherScreen/index";

const Navigation = ({ userGroups }) => {
  const isManager = userGroups.includes("Managers");

  return (
    <Router>
      <nav className="navbar">
        <Link className="navlink" to="/">Log Entry</Link>

        {isManager && (
          <>
            <Link className="navlink" to="/TechLogs">Tech Logs</Link>
            <Link className="navlink" to="/AnotherScreen">Another Screen</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<LogEntry />} />

        {isManager ? (
          <>
            <Route path="/TechLogs" element={<TechLogs />} />
            <Route path="/AnotherScreen" element={<AnotherScreen />} />
          </>
        ) : (
          // Optional: redirect techs trying to access manager-only routes
          <>
            <Route path="/TechLogs" element={<Navigate to="/" />} />
            <Route path="/AnotherScreen" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default Navigation;