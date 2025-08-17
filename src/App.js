import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TLDashboard from './pages/TLDashboard';
import AddLead from './pages/AddLead';
import AllUsers from './pages/AllUsers';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';
import Report from './pages/Report';
import OperatorReport from './pages/OperatorReport';
import AdminDayWise from './pages/AdminDayWise';
import Upload from './pages/Upload';
import ResaleLeads from './pages/ResaleLeads';
import UserLeads from './pages/user-leads';

// Styles
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/tl-dashboard" element={
                <ProtectedRoute requiredRole="tl">
                  <TLDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/add-lead" element={
                <ProtectedRoute>
                  <AddLead />
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AllUsers />
                </ProtectedRoute>
              } />
              
              <Route path="/create-user" element={
                <ProtectedRoute requiredRole="admin">
                  <CreateUser />
                </ProtectedRoute>
              } />
              
              <Route path="/edit-user/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <EditUser />
                </ProtectedRoute>
              } />
              
              <Route path="/report" element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              } />
              
              <Route path="/operator-report" element={
                <ProtectedRoute requiredRole="admin">
                  <OperatorReport />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-daywise" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDayWise />
                </ProtectedRoute>
              } />
              
              <Route path="/upload" element={
                <ProtectedRoute requiredRole="admin">
                  <Upload />
                </ProtectedRoute>
              } />
              
              <Route path="/resale-leads" element={
                <ProtectedRoute>
                  <ResaleLeads />
                </ProtectedRoute>
              } />
              
              <Route path="/user-leads" element={
                <ProtectedRoute>
                  <UserLeads />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
