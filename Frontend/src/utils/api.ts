const API_BASE_URL = 'https://api.sith-s25.my.id';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = isFormData
        ? { 'X-Requested-With': 'XMLHttpRequest' }
        : { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

    const guestId = localStorage.getItem('music_guest_id');
    if (guestId) {
        headers['X-Guest-ID'] = guestId;
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
            if (!guestId) {
                localStorage.removeItem('userRole');
                document.cookie = 'userNIM=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
