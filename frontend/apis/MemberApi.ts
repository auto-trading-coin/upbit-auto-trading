import api from './api';

export const getMyInfo = async () => {
    const { data } = await api.get('/member/me');
    return data.data;
};
