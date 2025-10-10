import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import "../styles/Chatroom.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");
let socket;

function Chatroom() {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState("");
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [userStatuses, setUserStatuses] = useState({});
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username);
        localStorage.setItem("user", res.data.username);

        if (!socket) {
          socket = io(API_URL);
        }

        socket.emit("setUser", res.data.username);

        // 🔹 Clean old listeners before reattaching
        socket.off("channelList");
        socket.off("receiveMessage");
        socket.off("channelMessages");
        socket.off("userStatusList");
        socket.off("userStatusUpdate");

        // SOCKET LISTENERS
        socket.on("channelList", (updatedChannels) => {
          setChannels(updatedChannels);
          if (!currentChannel && updatedChannels.length > 0) {
            setCurrentChannel(updatedChannels[0]);
            socket.emit("joinChannel", updatedChannels[0]);
          }
        });

        socket.on("receiveMessage", (message) => {
          // 🔹 No more frontend censoring, trust backend
          setMessages((prev) => [...prev, message]);
        });

        socket.on("channelMessages", (channelMessages) => {
          setMessages(channelMessages);
        });

        socket.on("userStatusList", (users) => {
          const statusMap = {};
          users.forEach((u) => {
            statusMap[u.username] = {
              isOnline: u.isOnline,
              lastSeen: u.lastSeen,
            };
          });
          setUserStatuses(statusMap);
        });

        socket.on("userStatusUpdate", (data) => {
          setUserStatuses((prev) => ({
            ...prev,
            [data.username]: {
              isOnline: data.isOnline,
              lastSeen: data.lastSeen,
            },
          }));
        });

        socket.on("forceLogout", (data) => {
        const currentUser = localStorage.getItem("user");
        if (data.username === currentUser) {
          alert("🚫 You have been banned and will be logged out.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      });

        setIsReady(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    socket.emit("sendMessage", {
      channel: currentChannel,
      user: username,
      text: newMessage,
    });
    setNewMessage("");
  };

  const handleAddChannel = (name) => {
    if (!name.trim()) return;
    socket.emit("createChannel", name);
    setCurrentChannel(name);
    setMessages([]);
    socket.emit("joinChannel", name);
  };

  const handleSelectChannel = (channel) => {
    setCurrentChannel(channel);
    setMessages([]);
    socket.emit("joinChannel", channel);
    setSidebarOpen(false);
  };

  if (!isReady) {
    return <div className="loading">Loading chatroom...</div>;
  }

  return (
    <div className="chatroom-container">
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        channels={channels}
        onSelectChannel={handleSelectChannel}
        onAddChannel={handleAddChannel}
        isOpen={sidebarOpen}
        toggleSidebar={setSidebarOpen}
        activeChannel={currentChannel}
      />

      <div className="chatroom-content">
        <div className="chatroom-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h2>{currentChannel}</h2>
        </div>

        <div className="chatroom-body">
          <div className="messages">
            {messages.map((msg, idx) => {
              const isSelf = msg.user === username;
              const userStatus = userStatuses[msg.user];
              return (
                <div
                  key={msg._id || idx}
                  className={`message ${isSelf ? "self" : "other"}`}
                >
                  {!isSelf && (
                    <div className="avatar">{msg.user[0].toUpperCase()}</div>
                  )}
                  <div className="bubble">
                    {!isSelf && (
                      <div className="username">
                        {msg.user}
                        <span
                          className={`status-dot ${
                            userStatus?.isOnline ? "online" : "offline"
                          }`}
                        ></span>
                        {!userStatus?.isOnline && userStatus?.lastSeen && (
                          <span className="last-seen">
                            Last seen:{" "}
                            {new Date(userStatus.lastSeen).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text">{msg.text}</div>
                    <div className="timestamp">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {isSelf && (
                    <div className="avatar">{msg.user[0].toUpperCase()}</div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatroom;
