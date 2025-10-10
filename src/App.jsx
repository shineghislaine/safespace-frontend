import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./components/LoginRegister";
import VerifyCode from "./components/VerifyCode";
import Chatroom from "./pages/Chatroom";
import AdminDashboard from "./pages/AdminDashboard";

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user")); // get user info from storage

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/chatroom" replace />; // redirect non-admins to chatroom
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Chatroom */}
        <Route path="/chatroom" element={<Chatroom />} />

        {/* Admin (protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login + Register */}
        <Route path="/login" element={<LoginRegister isLogin={true} />} />
        <Route path="/register" element={<LoginRegister isLogin={false} />} />

        {/* Verification */}
        <Route path="/verify" element={<VerifyCode />} />

        {/* Catch-all route (404) */}
        <Route path="*" element={<h2>404 - Page not found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
