import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthState } from '../src/utils/auth';

interface ProtectedRouteProps {
    redirectTo?: string;
}

interface RoleRouteProps extends ProtectedRouteProps {
    allowedRoles: string[];
    unauthorizedRedirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = '/login' }) => {
    const { isLoggedIn } = getAuthState();

    if (!isLoggedIn) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export const RoleRoute: React.FC<RoleRouteProps> = ({
    allowedRoles,
    redirectTo = '/login',
    unauthorizedRedirectTo = '/'
}) => {
    const { isLoggedIn, role } = getAuthState();

    if (!isLoggedIn) {
        return <Navigate to={redirectTo} replace />;
    }

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to={unauthorizedRedirectTo} replace />;
    }

    return <Outlet />;
};
