// src/App.jsx - Updated with complete admin functionality
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MockApiProvider } from './contexts/MockApiContext';
import NotificationListener from './components/notifications/NotificationListener';

// Layouts
import MainLayout from './components/layouts/MainLayout.jsx';
import AuthLayout from './components/layouts/AuthLayout.jsx';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import VenuesPage from './pages/VenuesPage';
import VenueDetailPage from './pages/VenueDetailPage.jsx';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import MyEventsPage from './pages/MyEventsPage.jsx';
import SettingsPage from './pages/SettingsPage';

// Admin Pages
import AdminDashboardPageWrapper from './pages/AdminDashboardPageWrapper.jsx';
import AdminVenuesPageWrapper from './pages/AdminVenuesPageWrapper.jsx';
import VenueFormPage from './pages/VenueFormPage';
import AdminEventsPageWrapper from './pages/AdminEventsPageWrapper.jsx';
import AdminUsersPageWrapper from './pages/AdminUsersPageWrapper.jsx';
import EventEditFormPage from './pages/EventEditFormPage.jsx';

// Auth guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import CreateEventWrapper from "./pages/CreateEventWrapper.jsx";

function App() {
    return (
        <Router>
            <MockApiProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <Toaster position="top-right" />
                            <NotificationListener />
                            <Routes>
                                {/* Public routes */}
                                <Route element={<MainLayout />}>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/events" element={<EventsPage />} />
                                    <Route path="/events/:id" element={<EventDetailPage />} />
                                    <Route path="/venues" element={<VenuesPage />} />
                                    <Route path="/venues/:id" element={<VenueDetailPage />} />
                                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                                </Route>

                                {/* Auth routes */}
                                <Route element={<AuthLayout />}>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                </Route>

                                {/* Protected routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route element={<MainLayout />}>
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="/settings" element={<SettingsPage />} />
                                        <Route path="/events/create" element={<CreateEventWrapper />} />
                                        <Route path="/events/my-events" element={<MyEventsPage />} />
                                        <Route path="/notifications" element={<NotificationsPage />} />
                                    </Route>
                                </Route>

                                {/* Admin-only protected routes */}
                                <Route element={<AdminProtectedRoute />}>
                                    <Route element={<MainLayout />}>
                                        {/* Admin Dashboard */}
                                        <Route path="/admin" element={<AdminDashboardPageWrapper />} />
                                        <Route path="/admin/dashboard" element={<AdminDashboardPageWrapper />} />

                                        {/* User Management */}
                                        <Route path="/admin/users" element={<AdminUsersPageWrapper />} />

                                        {/* Venue Management */}
                                        <Route path="/admin/venues" element={<AdminVenuesPageWrapper />} />
                                        <Route path="/admin/venues/create" element={<VenueFormPage />} />
                                        <Route path="/admin/venues/:id/edit" element={<VenueFormPage />} />

                                        {/* Event Management */}
                                        <Route path="/admin/events" element={<AdminEventsPageWrapper />} />
                                        <Route path="/admin/events/:id/edit" element={<EventEditFormPage />} />

                                        {/* Analytics & Reports */}
                                        <Route path="/admin/analytics" element={<AdminDashboardPageWrapper />} />
                                        <Route path="/admin/reports" element={<AdminDashboardPageWrapper />} />

                                        {/* System Settings */}
                                        <Route path="/admin/settings" element={<AdminDashboardPageWrapper />} />
                                    </Route>
                                </Route>

                                {/* 404 Route */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </NotificationProvider>
                    </AuthProvider>
                </ThemeProvider>
            </MockApiProvider>
        </Router>
    );
}

export default App;