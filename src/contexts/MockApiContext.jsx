import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const MockApiContext = createContext();

export const MockApiProvider = ({ children }) => {
    // Initialize with the value from localStorage, default to false (live mode)
    const [useMockApi, setUseMockApi] = useState(() => {
        // Use a function to initialize state from localStorage to avoid issues
        const savedValue = localStorage.getItem('useMockApi');
        return savedValue === 'true';
    });

    // Update localStorage when the value changes
    useEffect(() => {
        localStorage.setItem('useMockApi', useMockApi);
    }, [useMockApi]);

    // Toggle between mock and live API
    const toggleMockApi = () => {
        setUseMockApi((prev) => !prev);
    };

    // Create the context value object
    const contextValue = {
        useMockApi,
        toggleMockApi
    };

    return (
        <MockApiContext.Provider value={contextValue}>
            {children}
        </MockApiContext.Provider>
    );
};

// Custom hook to use the context
export const useMockApi = () => {
    const context = React.useContext(MockApiContext);
    if (context === undefined) {
        throw new Error('useMockApi must be used within a MockApiProvider');
    }
    return context;
};