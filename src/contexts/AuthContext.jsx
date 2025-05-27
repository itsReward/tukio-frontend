import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    console.log('🔍 AuthContext: Current location:', location.pathname);

    useEffect(() => {
        const initAuth = async () => {
            console.log('🔍 AuthContext: Starting initAuth');

            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                console.log('🔍 AuthContext: Token found:', !!token);

                if (token) {
                    console.log('🔍 AuthContext: Token exists, checking validity');

                    // Check if token is expired
                    try {
                        const decodedToken = jwtDecode(token);
                        const currentTime = Date.now() / 1000;
                        console.log('🔍 AuthContext: Token expires at:', new Date(decodedToken.exp * 1000));
                        console.log('🔍 AuthContext: Current time:', new Date());

                        if (decodedToken.exp < currentTime) {
                            console.log('🔍 AuthContext: Token is EXPIRED, calling logout');
                            logout();
                            return;
                        }

                        console.log('🔍 AuthContext: Token is valid, getting user data');
                        // Token is valid
                        const userResponse = await authService.getCurrentUser();
                        console.log('🔍 AuthContext: User data received:', userResponse.data);
                        setCurrentUser(userResponse.data);
                        setIsAuthenticated(true);
                    } catch (tokenError) {
                        console.log('🔍 AuthContext: Error decoding token:', tokenError);
                        console.log('🔍 AuthContext: Calling logout due to token error');
                        logout();
                        return;
                    }
                } else {
                    console.log('🔍 AuthContext: No token found, staying on current page');
                }
            } catch (err) {
                console.error('🔍 AuthContext: Authentication error:', err);
                setError(err.message);

                // Only logout if there was a token that failed
                if (localStorage.getItem('token')) {
                    console.log('🔍 AuthContext: Calling logout due to auth error');
                    logout();
                }
            } finally {
                console.log('🔍 AuthContext: Setting loading to false');
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setIsLoading(true);
            const response = await authService.login(credentials);
            const { token, userId } = response.data;

            localStorage.setItem('token', token);

            // Get user details
            const userResponse = await authService.getUserById(userId);
            setCurrentUser(userResponse.data);
            setIsAuthenticated(true);

            toast.success('Login successful!');
            navigate('/dashboard');
            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            toast.error(err.response?.data?.message || 'Login failed');
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true);
            const response = await authService.register(userData);

            toast.success('Registration successful! Please log in.');
            navigate('/login');
            return { success: true };
        } catch (err) {
            console.error('Registration error:', err);
            toast.error(err.response?.data?.message || 'Registration failed');
            setError(err.response?.data?.message || 'Registration failed');
            return { success: false, error: err.response?.data?.message || 'Registration failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        console.log('🔍 AuthContext: LOGOUT CALLED from:', location.pathname);
        console.log('🔍 AuthContext: Stack trace:', new Error().stack);

        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);

        // Check if we should redirect
        const currentPath = location.pathname;
        const publicPaths = ['/', '/events', '/venues', '/leaderboard', '/login', '/register', '/forgot-password'];
        const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/events/') || currentPath.startsWith('/venues/');

        console.log('🔍 AuthContext: Current path:', currentPath);
        console.log('🔍 AuthContext: Is public path:', isPublicPath);

        if (!isPublicPath) {
            console.log('🔍 AuthContext: Redirecting to /login because path is protected');
            navigate('/login');
        } else {
            console.log('🔍 AuthContext: NOT redirecting because path is public');
        }
    };

    const updateUserProfile = async (userData) => {
        try {
            setIsLoading(true);
            const response = await authService.updateUserProfile(userData);
            setCurrentUser(response.data);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (err) {
            console.error('Profile update error:', err);
            toast.error(err.response?.data?.message || 'Profile update failed');
            setError(err.response?.data?.message || 'Profile update failed');
            return { success: false, error: err.response?.data?.message || 'Profile update failed' };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated,
                isLoading,
                error,
                login,
                register,
                logout,
                updateUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};