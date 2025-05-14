import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import './SiteTotals.css';

const SiteTotals = () => {
  const [totals, setTotals] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [siteLogs, setSiteLogs] = useState([]);
  const [selectedSiteData, setSelectedSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSiteTotals();
  }, []);

  const fetchSiteTotals = async () => {
    try {
      const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
      const rawData = await response.json();

      let data = [];

      if (rawData?.body) {
        const parsedBody = typeof rawData.body === 'string'
          ? JSON.parse(rawData.body)
          : rawData.body;

        data = parsedBody?.data || [];
      } else {
        console.warn('No body found in API response:', rawData);
      }

      const totalsByLocation = {};
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      const sixMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      data.forEach((log) => {
        const location = log.location;
        if (!totalsByLocation[location]) {
          totalsByLocation[location] = {
            location,
            three_month_visits: 0,
            six_month_visits: 0,
            weekly_visits: 0,
            monthly_visits: 0,
            yearly_visits: 0,
          };
        }

        const logDate = new Date(log.date);

        const isSameWeek = (d1, d2) => {
          const oneJan = new Date(d2.getFullYear(), 0, 1);
          const week1 = Math.ceil((((d1 - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
          const week2 = Math.ceil((((d2 - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
          return d1.getFullYear() === d2.getFullYear() && week1 === week2;
        };

        if (logDate >= threeMonthsAgo) totalsByLocation[location].three_month_visits++;
        if (logDate >= sixMonthsAgo) totalsByLocation[location].six_month_visits++;
        if (isSameWeek(logDate, now)) totalsByLocation[location].weekly_visits++;
        if (logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()) {
          totalsByLocation[location].monthly_visits++;
        }
        if (logDate.getFullYear() === now.getFullYear()) {
          totalsByLocation[location].yearly_visits++;
        }
      });

      const totalsArray = Object.values(totalsByLocation);
      setTotals(totalsArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSite = async (site) => {
    setSelectedSite(site);
    try {
      const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
      const rawData = await response.json();

      let data = [];

      if (rawData?.body) {
        const parsedBody = typeof rawData.body === 'string'
          ? JSON.parse(rawData.body)
          : rawData.body;

        data = parsedBody?.data || [];
      } else {
        console.warn('No body found in API response:', rawData);
      }

      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const filteredLogs = data.filter((log) => {
        const logDate = new Date(log.date);
        return log.location === site && logDate >= sixMonthsAgo;
      });

      setSiteLogs(filteredLogs);

      const found = totals.find((t) => t.location === site);
      setSelectedSiteData(found || null);
    } catch (err) {
      console.error(err);
      setError("Error fetching logs from Lambda.");
    }
  };

  const exportToExcel = () => {
    if (!selectedSiteData || siteLogs.length === 0) {
      alert("Please select a site to export.");
      return;
    }
  
    // Get array of visit dates
    const visitDates = siteLogs.map(log => new Date(log.date).toLocaleDateString());
  
    // Add dates_of_visits field to selected site data
    const enrichedSiteData = {
      ...selectedSiteData,
      dates_of_visits: visitDates.join(', ')
    };
  
    // First sheet: Site Totals
    const ws1 = XLSX.utils.json_to_sheet([enrichedSiteData]);
  
    // Second sheet: Site Logs with cleaned date formatting
    const cleanedLogs = siteLogs.map(log => ({
      ...log,
      date: new Date(log.date).toLocaleDateString(), // Format date only
    }));
  
    const ws2 = XLSX.utils.json_to_sheet(cleanedLogs);
  
    // Create workbook and add sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Site Totals");
    XLSX.utils.book_append_sheet(wb, ws2, "Site Logs");
  
    // Export as file
    XLSX.writeFile(wb, `${selectedSite}_totals_and_logs.xlsx`);
  };

  const exportAllToExcel = async () => {
    if (totals.length === 0) {
      alert("No data to export.");
      return;
    }
  
    try {
      const response = await fetch('https://i4xtrjux1j.execute-api.us-east-1.amazonaws.com/dev/submit-log');
      const rawData = await response.json();
  
      let allLogs = [];
  
      if (rawData?.body) {
        const parsedBody = typeof rawData.body === 'string'
          ? JSON.parse(rawData.body)
          : rawData.body;
  
        allLogs = parsedBody?.data || [];
      }
  
      const enrichedTotals = totals.map((site) => {
        const logsForSite = allLogs.filter(log => log.location === site.location);
        const visitDates = logsForSite.map(log => new Date(log.date).toLocaleDateString());
        return {
          ...site,
          dates_of_visits: visitDates.join(', ')
        };
      });
  
      const ws = XLSX.utils.json_to_sheet(enrichedTotals);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "All Site Totals with Dates");
  
      XLSX.writeFile(wb, "All_Site_Totals_With_Dates.xlsx");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data.");
    }
  };

  if (loading) return <div className="center">Loading...</div>;
  if (error) return <div className="center error">{error}</div>;

  return (
    <div className="container">
    <h2 style={{ color: 'white' }}>📍 Site Visit Totals</h2>
    <p style={{ color: 'white' }}>Select a site to view more details:</p>

    <select
      className="select-gradient"
      value={selectedSite}
      onChange={(e) => handleSelectSite(e.target.value)}
    >
      <option value="">Select a site</option>
      {totals.map((site) => (
        <option key={site.location} value={site.location}>
          {site.location}
        </option>
      ))}
    </select>

      {selectedSite === "" ? (
        <>
          <div className="card-list">
            {totals.map((item) => (
              <div
                key={item.location}
                className="card"
                onClick={() => handleSelectSite(item.location)}
              >
                <h3>{item.location}</h3>
              </div>
            ))}
          </div>
          <button className="export" onClick={exportAllToExcel}>
            Export All Sites
          </button>
        </>
      ) : (
        selectedSiteData && (
          <div className="site-details-container">
            <div className="site-summary">
              <button className="export" onClick={exportToExcel}>Export This Site</button>
              <button className="close" onClick={() => setSelectedSite("")}>❌ Close</button>

              <h3>{selectedSite} Totals</h3>
              <p>🕒 Last 3 Months: <strong>{selectedSiteData.three_month_visits}</strong></p>
              <p>🕒 Last 6 Months: <strong>{selectedSiteData.six_month_visits}</strong></p>
              <p>📅 Weekly: <strong>{selectedSiteData.weekly_visits}</strong></p>
              <p>📆 Monthly: <strong>{selectedSiteData.monthly_visits}</strong></p>
              <p>📊 Yearly: <strong>{selectedSiteData.yearly_visits}</strong></p>
            </div>

            <div className="log-list-container">
              <h4>Logs ({siteLogs.length})</h4>
              <ul className="log-list">
                {siteLogs.map((log, index) => (
                  <li key={index} className="log-entry">
                    <p><strong>Technician:</strong> {log.technician_name}</p>
                    <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
                    <p><strong>Task:</strong> {log.task}</p>
                    <p><strong>Comments:</strong> {log.additional_comments}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      )}

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />
    </div>
  );
};

export default SiteTotals;