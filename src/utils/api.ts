const API_BASE_URL = 'https://idk-eight.vercel.app';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = isFormData
        ? { ...options.headers }
        : { 'Content-Type': 'application/json', ...options.headers };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('userRole');
            document.cookie = 'userNIM=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/login';
            return null;
        }

        return response;
    } catch (error) {
        throw error;
    }
};

export const authFetch = (url: string, options: RequestInit = {}) => {
    return fetchWithAuth(url, options);
};