import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, removeAccessToken } from '../utils/token';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.get('/token', {
                    withCredentials: true,
                    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
                });
                setAccessToken((data as any).data); // SuccessResponse의 data에 accessToken
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${(data as any).data}`;
                return api.request(originalRequest);
            } catch (e) {
                removeAccessToken();
                // 필요시 로그아웃 처리 등 추가
            }
        }
        return Promise.reject(error);
    }
);

export default api;
