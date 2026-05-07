import api from './axiosInstance';

export const login = (payload) => api.post('/users/login/', payload);
export const register = (payload) => api.post('/users/register/', payload);
export const logout = (payload) => api.post('/users/logout/', payload);
export const refreshToken = (payload) => api.post('/users/token/refresh/', payload);
export const getProfile = () => api.get('/users/profile/');
export const updateProfile = (payload) => api.patch('/users/profile/', payload, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
