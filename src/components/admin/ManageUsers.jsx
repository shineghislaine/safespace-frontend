// src/components/admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Deactivate user
  const deactivateUser = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await api.put(`/admin/users/${id}/deactivate`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate user");
    }
  };

  // ✅ Activate user
  const activateUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/activate`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to activate user");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">👥 Manage Users</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="admin-table w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Username</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="text-center border-b">
                  <td className="border p-2">{u.username}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.role}</td>
                  <td className="border p-2">
                    {u.isActive ? "✅ Active" : "❌ Deactivated"}
                  </td>
                  <td className="border p-2">
                    {u.isActive ? (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => deactivateUser(u._id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => activateUser(u._id)}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
