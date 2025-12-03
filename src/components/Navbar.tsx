import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { LogOut, User, LayoutDashboard, Users, Trophy, FileText, Upload } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!userProfile) return null;

    const isAdmin = userProfile.role === UserRole.ADMIN;

    return (
        <nav className="glass-strong shadow-lg border-b border-white/30 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center space-x-4">
                        {/* SMK Logo */}
                        <img
                            src="/logo-smk.jpg"
                            alt="SMK Kesehatan Surya Global Cimahi"
                            className="h-12 w-auto object-contain rounded-lg shadow-sm"
                        />

                        {/* Divider */}
                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                        {/* PMI Branding */}
                        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-xl">PMI</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">PMI Competition</h1>
                                <p className="text-xs text-gray-600">PMR Madya Level</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        {isAdmin ? (
                            <>
                                <Link
                                    to="/admin"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <LayoutDashboard size={20} />
                                    <span className="hidden md:inline">Dashboard</span>
                                </Link>
                                <Link
                                    to="/admin/teams"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Users size={20} />
                                    <span className="hidden md:inline">All Teams</span>
                                </Link>
                                <Link
                                    to="/admin/score-input"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <FileText size={20} />
                                    <span className="hidden md:inline">Input Nilai</span>
                                </Link>
                                <Link
                                    to="/admin/score-upload"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Upload size={20} />
                                    <span className="hidden md:inline">Upload Nilai</span>
                                </Link>
                                <Link
                                    to="/leaderboard"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Trophy size={20} />
                                    <span className="hidden md:inline">Leaderboard</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <LayoutDashboard size={20} />
                                    <span className="hidden md:inline">Dashboard</span>
                                </Link>
                                <Link
                                    to="/teams"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Users size={20} />
                                    <span className="hidden md:inline">My Teams</span>
                                </Link>
                                <Link
                                    to="/leaderboard"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    <Trophy size={20} />
                                    <span className="hidden md:inline">Leaderboard</span>
                                </Link>
                            </>
                        )}

                        {/* User Profile & Logout */}
                        <div className="flex items-center space-x-3 pl-6 border-l border-gray-300">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User size={18} className="text-primary-600" />
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-semibold text-gray-900">{userProfile.picName || userProfile.email}</p>
                                    <p className="text-xs text-gray-600">{userProfile.schoolName || 'Admin'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
