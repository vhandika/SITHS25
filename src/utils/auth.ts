const COOKIE_PATH = 'path=/';
const GUEST_TOKEN_KEY = 'music_guest_id';
const GUEST_TOKEN_PATTERN = /^v1\.[A-Za-z0-9_-]+\.[a-f0-9]{64}$/;

export interface AuthState {
    nim: string | null;
    role: string | null;
    isLoggedIn: boolean;
    isDev: boolean;
}

export const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((result, part) => {
        const pieces = part.split('=');
        return pieces[0]?.trim() === name ? decodeURIComponent(pieces[1] || '') : result;
    }, '');
};

export const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; ${COOKIE_PATH}; SameSite=Lax`;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${COOKIE_PATH};`;
};

export const getAuthState = (): AuthState => {
    const nim = getCookie('userNIM') || null;
    const role = getCookie('userRole') || null;

    return {
        nim,
        role,
        isLoggedIn: !!nim,
        isDev: role === 'dev'
    };
};

export const isAuthenticated = () => getAuthState().isLoggedIn;

export const isDevUser = () => getAuthState().isDev;

export const setAuthSession = (nim: string, role: string) => {
    setCookie('userNIM', nim, 30);
    setCookie('userRole', role || 'mahasiswa', 30);
};

export const clearAuthSession = () => {
    deleteCookie('userToken');
    deleteCookie('userNIM');
    deleteCookie('userRole');
};

const decodeBase64UrlJson = (payloadB64: string) => {
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
};

export const getGuestToken = () => {
    const token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) return null;

    if (!GUEST_TOKEN_PATTERN.test(token)) {
        localStorage.removeItem(GUEST_TOKEN_KEY);
        return null;
    }

    return token;
};

export const getGuestNimFromToken = (token: string | null) => {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3 || parts[0] !== 'v1') return null;
        const payload = decodeBase64UrlJson(parts[1]);
        if (typeof payload?.nim === 'string' && payload.nim.startsWith('GUEST-')) {
            return payload.nim;
        }
        return null;
    } catch {
        return null;
    }
};

export const setGuestToken = (token: string) => {
    if (!GUEST_TOKEN_PATTERN.test(token)) {
        localStorage.removeItem(GUEST_TOKEN_KEY);
        return;
    }
    localStorage.setItem(GUEST_TOKEN_KEY, token);
};

export const ensureGuestToken = async (apiBaseUrl: string) => {
    const existing = getGuestToken();
    if (existing) {
        return { token: existing, nim: getGuestNimFromToken(existing) };
    }

    try {
        const res = await fetch(`${apiBaseUrl}/guest-token`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'include'
        });

        if (!res.ok) return { token: null, nim: null };

        const data = await res.json();
        const token = typeof data?.guestToken === 'string'
            ? data.guestToken
            : (typeof data?.guestId === 'string' ? data.guestId : null);

        if (!token || !GUEST_TOKEN_PATTERN.test(token)) {
            return { token: null, nim: null };
        }

        setGuestToken(token);
        const nim = typeof data?.guestNim === 'string' ? data.guestNim : getGuestNimFromToken(token);
        return { token, nim };
    } catch {
        return { token: null, nim: null };
    }
};