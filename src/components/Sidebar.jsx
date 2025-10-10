import React, { useState } from "react";
import "../styles/Sidebar.css";

function Sidebar({ channels, onSelectChannel, onAddChannel, isOpen, toggleSidebar, activeChannel, onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      onAddChannel(newChannelName.trim());
      setNewChannelName("");
      setShowModal(false);
    }
  };

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button className="sidebar-toggle" onClick={() => toggleSidebar(!isOpen)}>☰</button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">🌐 Channels</h2>
        </div>

        <button className="add-channel-btn" onClick={() => setShowModal(true)}>+ Add</button>

        <ul className="channel-list">
          {channels.map((channel, idx) => (
            <li
              key={idx}
              className={`sidebar-link ${activeChannel === channel ? "active" : ""}`}
              onClick={() => {
                onSelectChannel(channel);
                toggleSidebar(false);
              }}
            >
              #{channel}
            </li>
          ))}
        </ul>

        {/* ✅ Sidebar footer with logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Channel</h3>
            <input
              type="text"
              placeholder="Channel name..."
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-add" onClick={handleAddChannel}>Add Channel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
