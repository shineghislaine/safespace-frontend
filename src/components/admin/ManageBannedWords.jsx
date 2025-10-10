// src/components/admin/ManageBannedWords.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManageBannedWords() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");

  const fetchWords = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/banned-words`, { headers: { Authorization: `Bearer ${token}` } });
      setWords(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch banned words");
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const addWord = async () => {
    if (!newWord.trim()) return;
    await axios.post(`${API_URL}/admin/banned-words`, { word: newWord.trim() }, { headers: { Authorization: `Bearer ${token}` } });
    setNewWord("");
    fetchWords();
  };

  const removeWord = async (id) => {
    if (!window.confirm("Remove this banned word?")) return;
    await axios.delete(`${API_URL}/admin/banned-words/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchWords();
  };

  return (
    <div>
      <h2>🚫 Banned Words</h2>
      <div style={{ marginBottom: 12 }}>
        <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="Add banned word..." />
        <button onClick={addWord}>Add</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {words.map(w => (
            <tr key={w._id}>
              <td>{w.word}</td>
              <td>{new Date(w.createdAt).toLocaleString()}</td>
              <td><button onClick={() => removeWord(w._id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
