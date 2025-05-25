import { useState, useEffect, useCallback } from 'react';
import recommendationService from '../services/recommendationService';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing recommendations
 * @param {Object} options - Configuration options
 * @returns {Object} Recommendation state and functions
 */
export const useRecommendations = (options = {}) => {
    const { currentUser } = useAuth();
    const {
        autoFetch = true,
        maxItems = 5,
        includeUpcoming = true,
        includePast = false,
        includeSimilarEvents = true,
        includePopularEvents = true
    } = options;

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    // Fetch recommendations
    const fetchRecommendations = useCallback(async (userId = currentUser?.id) => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const data = await recommendationService.getDashboardRecommendations(userId, maxItems);
            setRecommendations(data || []);
            setLastFetch(new Date());
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError(err.message || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id, maxItems]);

    // Fetch personalized recommendations
    const fetchPersonalized = useCallback(async (count = maxItems) => {
        if (!currentUser?.id) return [];

        try {
            setLoading(true);
            setError(null);

            const response = await recommendationService.getPersonalizedRecommendations(currentUser.id, count);
            return response.data || [];
        } catch (err) {
            console.error('Error fetching personalized recommendations:', err);
            setError(err.message || 'Failed to fetch personalized recommendations');
            return [];
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id, maxItems]);

    // Fetch popular events
    const fetchPopular = useCallback(async (count = maxItems) => {
        try {
            setLoading(true);
            setError(null);

            const response = await recommendationService.getPopularEvents(count);
            return response.data || [];
        } catch (err) {
            console.error('Error fetching popular events:', err);
            setError(err.message || 'Failed to fetch popular events');
            return [];
        } finally {
            setLoading(false);
        }
    }, [maxItems]);

    // Fetch trending events
    const fetchTrending = useCallback(async (count = maxItems) => {
        try {
            setLoading(true);
            setError(null);

            const response = await recommendationService.getTrendingEvents(count);
            return response.data || [];
        } catch (err) {
            console.error('Error fetching trending events:', err);
            setError(err.message || 'Failed to fetch trending events');
            return [];
        } finally {
            setLoading(false);
        }
    }, [maxItems]);

    // Record event view
    const recordView = useCallback(async (eventId, viewDuration = null) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventView(currentUser.id, eventId, viewDuration);
        } catch (err) {
            console.error('Error recording event view:', err);
        }
    }, [currentUser?.id]);

    // Record event registration
    const recordRegistration = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventRegistration(currentUser.id, eventId);
        } catch (err) {
            console.error('Error recording event registration:', err);
        }
    }, [currentUser?.id]);

    // Record event attendance
    const recordAttendance = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventAttendance(currentUser.id, eventId);
        } catch (err) {
            console.error('Error recording event attendance:', err);
        }
    }, [currentUser?.id]);

    // Record event rating
    const recordRating = useCallback(async (eventId, rating) => {
        if (!currentUser?.id || !eventId || !rating) return;

        try {
            await recommendationService.recordEventRating(currentUser.id, eventId, rating);
        } catch (err) {
            console.error('Error recording event rating:', err);
        }
    }, [currentUser?.id]);

    // Record event sharing
    const recordShare = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventSharing(currentUser.id, eventId);
        } catch (err) {
            console.error('Error recording event sharing:', err);
        }
    }, [currentUser?.id]);

    // Record event favoriting
    const recordFavorite = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventFavorite(currentUser.id, eventId);
        } catch (err) {
            console.error('Error recording event favorite:', err);
        }
    }, [currentUser?.id]);

    // Update user preferences
    const updatePreferences = useCallback(async (categoryId, preferenceScore, tags = []) => {
        if (!currentUser?.id || !categoryId) return;

        try {
            const preferenceData = {
                userId: currentUser.id,
                categoryId,
                preferenceScore,
                tags
            };

            await recommendationService.updateUserPreference(preferenceData);

            // Refresh recommendations after updating preferences
            await fetchRecommendations();
        } catch (err) {
            console.error('Error updating user preferences:', err);
        }
    }, [currentUser?.id, fetchRecommendations]);

    // Get user's favorite categories
    const getFavoriteCategories = useCallback(async (limit = 5) => {
        if (!currentUser?.id) return [];

        try {
            const response = await recommendationService.getFavoriteCategories(currentUser.id, limit);
            return response.data || [];
        } catch (err) {
            console.error('Error fetching favorite categories:', err);
            return [];
        }
    }, [currentUser?.id]);

    // Analyze user activity to update preferences
    const analyzeActivity = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            await recommendationService.analyzeUserActivity(currentUser.id);

            // Refresh recommendations after analysis
            await fetchRecommendations();
        } catch (err) {
            console.error('Error analyzing user activity:', err);
        }
    }, [currentUser?.id, fetchRecommendations]);

    // Refresh recommendations
    const refresh = useCallback(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Auto-fetch on mount and user change
    useEffect(() => {
        if (autoFetch && currentUser?.id) {
            fetchRecommendations();
        }
    }, [autoFetch, currentUser?.id, fetchRecommendations]);

    // Check if recommendations are stale (older than 10 minutes)
    const isStale = lastFetch && (new Date() - lastFetch) > 10 * 60 * 1000;

    return {
        // State
        recommendations,
        loading,
        error,
        lastFetch,
        isStale,

        // Basic functions
        fetchRecommendations,
        refresh,

        // Specific recommendation types
        fetchPersonalized,
        fetchPopular,
        fetchTrending,

        // Activity tracking
        recordView,
        recordRegistration,
        recordAttendance,
        recordRating,
        recordShare,
        recordFavorite,

        // Preferences
        updatePreferences,
        getFavoriteCategories,
        analyzeActivity,

        // Utility
        clearError: () => setError(null),
        clearRecommendations: () => setRecommendations([])
    };
};

/**
 * Hook for tracking event interactions
 * @returns {Object} Event tracking functions
 */
export const useEventTracking = () => {
    const { currentUser } = useAuth();

    const trackView = useCallback(async (eventId, viewDuration = null) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventView(currentUser.id, eventId, viewDuration);
        } catch (err) {
            console.error('Error tracking event view:', err);
        }
    }, [currentUser?.id]);

    const trackRegistration = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventRegistration(currentUser.id, eventId);
        } catch (err) {
            console.error('Error tracking event registration:', err);
        }
    }, [currentUser?.id]);

    const trackAttendance = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventAttendance(currentUser.id, eventId);
        } catch (err) {
            console.error('Error tracking event attendance:', err);
        }
    }, [currentUser?.id]);

    const trackRating = useCallback(async (eventId, rating) => {
        if (!currentUser?.id || !eventId || !rating) return;

        try {
            await recommendationService.recordEventRating(currentUser.id, eventId, rating);
        } catch (err) {
            console.error('Error tracking event rating:', err);
        }
    }, [currentUser?.id]);

    const trackShare = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventSharing(currentUser.id, eventId);
        } catch (err) {
            console.error('Error tracking event share:', err);
        }
    }, [currentUser?.id]);

    const trackFavorite = useCallback(async (eventId) => {
        if (!currentUser?.id || !eventId) return;

        try {
            await recommendationService.recordEventFavorite(currentUser.id, eventId);
        } catch (err) {
            console.error('Error tracking event favorite:', err);
        }
    }, [currentUser?.id]);

    return {
        trackView,
        trackRegistration,
        trackAttendance,
        trackRating,
        trackShare,
        trackFavorite,
        isAuthenticated: !!currentUser?.id
    };
};

export default useRecommendations;