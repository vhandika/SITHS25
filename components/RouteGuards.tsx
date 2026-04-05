import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((result, part) => {
        const pieces = part.split('=');
        return pieces[0]?.trim() === name ? decodeURIComponent(pieces[1] || '') : result;
    }, '');
};

interface ProtectedRouteProps {
    redirectTo?: string;
}

interface RoleRouteProps extends ProtectedRouteProps {
    allowedRoles: string[];
    unauthorizedRedirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = '/login' }) => {
    const userNIM = getCookie('userNIM');

    if (!userNIM) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export const RoleRoute: React.FC<RoleRouteProps> = ({
    allowedRoles,
    redirectTo = '/login',
    unauthorizedRedirectTo = '/'
}) => {
    const userNIM = getCookie('userNIM');
    const userRole = getCookie('userRole');

    if (!userNIM) {
        return <Navigate to={redirectTo} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={unauthorizedRedirectTo} replace />;
    }

    return <Outlet />;
};
