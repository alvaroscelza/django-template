import axios from 'axios';

const API_BASE_URL = window.location.origin + '/api/v1/';

const forceLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.clear();
    window.location.href = window.location.origin;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post(`tenants/auth/google/refresh/`, {
                        refresh_token: refreshToken
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const newAccessToken = refreshResponse.data.access_token;
                    localStorage.setItem('auth_token', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    forceLogout();
                    return Promise.reject(refreshError);
                }
            } else {
                forceLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 