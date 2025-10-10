// src/components/admin/ManageChannels.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManageChannels() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [channels, setChannels] = useState([]);

  const fetchChannels = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/channels`, { headers: { Authorization: `Bearer ${token}` } });
      setChannels(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch channels");
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const deleteChannel = async (id) => {
    if (!window.confirm("Delete this channel?")) return;
    await axios.delete(`${API_URL}/admin/channels/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchChannels();
  };

  return (
    <div>
      <h2>📢 Channels</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            {/* <th>Creator</th> */}
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {channels.map(c => (
            <tr key={c._id}>
              <td>#{c.name}</td>
              {/* <td>{c.createdBy?.username || "—"}</td> */}
              <td>{new Date(c.createdAt).toLocaleString()}</td>
              <td><button onClick={() => deleteChannel(c._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
