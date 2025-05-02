import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        const initAuth = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');

                if (token) {
                    // Check if token is expired
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp < currentTime) {
                        // Token is expired
                        logout();
                        return;
                    }

                    // Token is valid
                    const userResponse = await authService.getCurrentUser();
                    setCurrentUser(userResponse.data);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Authentication error:', err);
                setError(err.message);
                logout();
            } finally {
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
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);
        navigate('/login');
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