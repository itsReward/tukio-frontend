import api from './api';

const AUTH_ENDPOINTS = {
    LOGIN: 'tukio-user-service/api/auth/login',
    REGISTER: 'tukio-user-service/api/auth/register',
    VALIDATE_TOKEN: 'tukio-user-service/api/auth/validate',
    USER: 'tukio-user-service/api/users',
    CURRENT_USER: 'tukio-user-service/api/users/me',
};

class AuthService {
    async login(credentials) {
        return await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
    }

    async register(userData) {
        return await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    }

    async validateToken(token) {
        return await api.get(`${AUTH_ENDPOINTS.VALIDATE_TOKEN}?token=${token}`);
    }

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        return await api.get(AUTH_ENDPOINTS.CURRENT_USER, {
            params: { username: this.getUsername(token) }
        });
    }

    async getUserById(userId) {
        return await api.get(`${AUTH_ENDPOINTS.USER}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    async updateUserProfile(userData) {
        return await api.put(`${AUTH_ENDPOINTS.USER}/${userData.id}`, userData);
    }

    async changePassword(userId, passwordData) {
        return await api.put(`${AUTH_ENDPOINTS.USER}/${userId}/password`, passwordData);
    }

    async updateUserInterests(userId, interests) {
        return await api.put(`${AUTH_ENDPOINTS.USER}/${userId}/interests`, interests);
    }

    getUsername(token) {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);
            return payload.sub; // assuming 'sub' is the username
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }
}

export default new AuthService();