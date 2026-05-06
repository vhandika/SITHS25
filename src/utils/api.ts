import { clearAuthSession, getGuestToken } from './auth';

const API_BASE_URL = 'https://api.sith-s25.my.id';

let refreshPromise: Promise<boolean> | null = null;

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

const refreshAuthSessionSingleFlight = async () => {
    if (!refreshPromise) {
        refreshPromise = refreshAuthSession()
            .catch(() => false)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const refreshAuthSessionCoordinated = async () => {
    const webLocks = (navigator as Navigator & {
        locks?: {
            request: (name: string, callback: () => Promise<boolean>) => Promise<boolean>;
        };
    }).locks;

    if (webLocks?.request) {
        try {
            return await webLocks.request('auth-refresh', async () => {
                return refreshAuthSessionSingleFlight();
            });
        } catch {
            return refreshAuthSessionSingleFlight();
        }
    }

    return refreshAuthSessionSingleFlight();
};

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const alreadyRetried = (options as RequestInit & { _retry?: boolean })._retry === true;
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
            if (!isRefreshRequest && response.status === 401 && !alreadyRetried) {
                const refreshed = await refreshAuthSessionCoordinated();

                if (refreshed) {
                    const retryOptions: RequestInit & { _retry?: boolean } = {
                        ...options,
                        _retry: true,
                    };

                    return fetchWithAuth(url, retryOptions);
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
}