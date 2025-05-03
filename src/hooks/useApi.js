import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for making API requests with loading, data, and error states
 * @returns {Object} Object containing loading, error, data, and execute function
 */
const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    /**
     * Execute an API request
     * @param {Function} apiCall - The API call function to execute
     * @param {Object} config - Optional configuration for the API call
     * @returns {Promise} A promise that resolves to the API response
     */
    const execute = useCallback(async (apiCall, config = {}) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiCall(config);
            setData(response.data);

            return response;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reset the hook state
     */
    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        loading,
        error,
        data,
        execute,
        reset
    };
};

export default useApi;