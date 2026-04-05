const COOKIE_PATH = 'path=/';

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
    setCookie('userNIM', nim);
    setCookie('userRole', role || 'mahasiswa');
};

export const clearAuthSession = () => {
    deleteCookie('userToken');
    deleteCookie('userNIM');
    deleteCookie('userRole');
};