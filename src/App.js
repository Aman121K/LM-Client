import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateUser from './pages/CreateUser';
import AllUsers from './pages/AllUsers';
import EditUser from './pages/EditUser';
import OperatorReport from './pages/OperatorReport';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-user"
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-user/:userId"
            element={
              <ProtectedRoute requiredRole="admin">
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator-report"
            element={
              <ProtectedRoute requiredRole="admin">
                <OperatorReport />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
