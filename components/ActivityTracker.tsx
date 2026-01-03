import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const isUserLoggedIn = () => {
    return document.cookie.includes('token=');
};

const ActivityTracker: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const trackActivity = async () => {
            try {
                if (isUserLoggedIn()) {
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
                    return;
                }

                let guestId = localStorage.getItem('music_guest_id');

                if (!guestId) {
                    const res = await fetch(`${API_BASE_URL}/guest-token`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.guestId) {
                            guestId = data.guestId;
                            localStorage.setItem('music_guest_id', guestId);
                        }
                    }
                }

                if (guestId) {
                    await fetch(`${API_BASE_URL}/activity`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-Guest-Id': guestId
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            path: location.pathname
                        })
                    });
                }
            } catch (e) {
            }
        };

        trackActivity();
    }, [location]);

    return null;
};

export default ActivityTracker;