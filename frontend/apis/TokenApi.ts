import api from './api';
import { setAccessToken } from '@/utils/token';

export const reissueAccessToken = async () => {
    const { data } = await api.get('/token');
    setAccessToken(data.data); // SuccessResponse의 data에 accessToken
    return data.data;
};

export const logoutApi = async () => {
    return api.get('/token/logout', { withCredentials: true });
};
