import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const ActivityTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const trackActivity = async () => {
            try {
                await fetch(`${API_BASE_URL}/activity`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        path: location.pathname
                    })
                });
            } catch (e) {
            }
        };

        trackActivity();
    }, [location]);

    return null;
};

export default ActivityTracker;
