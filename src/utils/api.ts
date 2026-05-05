import { clearAuthSession, getGuestToken } from './auth';

const API_BASE_URL = 'https://api.sith-s25.my.id';

const refreshAuthSession = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    return response.ok;
};

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

        const requestUrl = new URL(url, `${API_BASE_URL}/`);
        const isRefreshRequest = requestUrl.pathname.endsWith('/api/auth/refresh');

        if ((response.status === 401 || response.status === 403) && !guestToken) {
            if (!isRefreshRequest && response.status === 401) {
                const refreshed = await refreshAuthSession();

                if (refreshed) {
                    return fetch(url, {
                        ...options,
                        headers,
                        credentials: 'include',
                    });
                }
            }

            clearAuthSession();
            window.location.href = '/login';
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