import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManageReports() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch reports");
    }
  };

  const handleAction = async (id, action, hours = null) => {
    try {
      await axios.put(
        `${API_URL}/admin/reports/${id}/action`,
        { action, hours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to apply report action");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h2>🚨 User Reports</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Bad Word</th>
            <th>Message</th>
            <th>Channel</th>
            <th>Action</th>
            <th>Reported</th>
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td>{r.user}</td>
              <td>{r.badWord}</td>
              <td>{r.message}</td>
              <td>{r.channel}</td>
              <td>{r.actionTaken}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleAction(r._id, "permanent-ban")}>
                  ⛔ Permanent Ban
                </button>
                <button
                  onClick={() => {
                    const hours = prompt("Ban for how many hours?");
                    if (hours) handleAction(r._id, "temp-ban", hours);
                  }}
                >
                  🕐 Temporary Ban
                </button>
                <button onClick={() => handleAction(r._id, "unban")}>
                  ✅ Unban
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
