import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import VenuesPage from './pages/VenuesPage';
import VenueDetailPage from './pages/VenueDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CreateEventPage from './pages/CreateEventPage';
import MyEventsPage from './pages/MyEventsPage';
import SettingsPage from './pages/SettingsPage';

// Auth guard
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <Toaster position="top-right" />
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
                                    <Route path="/events/create" element={<CreateEventPage />} />
                                    <Route path="/events/my-events" element={<MyEventsPage />} />
                                </Route>
                            </Route>

                            {/* 404 Route */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;