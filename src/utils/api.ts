import { clearAuthSession, getGuestToken } from './auth';

const API_BASE_URL = 'https://api.sith-s25.my.id';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = isFormData
        ? { 'X-Requested-With': 'XMLHttpRequest' }
        : { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

    const guestToken = getGuestToken();
    if (guestToken) {
        headers['X-Guest-ID'] = guestToken;
    }

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (response.status === 401 || response.status === 403) {
            if (!guestToken) {
                clearAuthSession();
                window.location.href = '/login';
            }
            return response;
        }

        return response;
    } catch (error) {
        throw error;
    }
};

export const authFetch = (url: string, options: RequestInit = {}) => {
    return fetchWithAuth(url, options);
};
