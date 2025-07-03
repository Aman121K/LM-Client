import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateUser from './pages/CreateUser';
import AllUsers from './pages/AllUsers';
import EditUser from './pages/EditUser';
import OperatorReport from './pages/OperatorReport';
import AddLead from './pages/AddLead';
import Report from './pages/Report';
import Upload from './pages/Upload';
import TLDashboard from './pages/TLDashboard';
import ResaleLeads from './pages/ResaleLeads';
import UserLeads from './pages/user-leads';

// Create a separate component for routes that uses useAuth
const AppRoutes = () => {
  const { userRole } = useAuth();
  console.log("user ROle is>>", userRole)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/TLdashboard"
        element={
          <ProtectedRoute>
            <TLDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-leads"
        element={
          <ProtectedRoute>
            <UserLeads />
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
      <Route
        path="/upload"
        element={
          <ProtectedRoute requiredRole="admin">
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route path="/resale-leads" element={<ResaleLeads />} />
      <Route path="/report" element={<Report />} />
      <Route path="/add-lead" element={<AddLead />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
