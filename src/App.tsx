import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// School Pages
import { Dashboard } from './pages/school/Dashboard';
import { RegisterTeam } from './pages/school/RegisterTeam';
import { MyTeams } from './pages/school/MyTeams';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AllTeams } from './pages/admin/AllTeams';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* School Routes - Protected */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/register-team"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <RegisterTeam />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teams"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <MyTeams />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes - Protected */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/teams"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <AllTeams />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* 404 fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
