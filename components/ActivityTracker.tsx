import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://idk-eight.vercel.app/api';

const ActivityTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const trackActivity = async () => {
            try {
                await fetch(`${API_BASE_URL}/activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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