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
import { Checkout } from './pages/school/Checkout';
import { PaymentSuccess } from './pages/school/PaymentSuccess';
import { PaymentPending } from './pages/school/PaymentPending';
import { PaymentError } from './pages/school/PaymentError';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AllTeams } from './pages/admin/AllTeams';
import { ScoreInput } from './pages/admin/ScoreInput';
import { ScoreUpload } from './pages/admin/ScoreUpload';

// Public Pages
import { Leaderboard } from './pages/public/Leaderboard';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />

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
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/success"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <PaymentSuccess />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/pending"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <PaymentPending />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/error"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.SCHOOL]}>
                                <PaymentError />
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
                    <Route
                        path="/admin/score-input"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <ScoreInput />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/score-upload"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <ScoreUpload />
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
