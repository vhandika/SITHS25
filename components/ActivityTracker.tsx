import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const isUserLoggedIn = () => {
    return document.cookie.includes('token=');
};

const ActivityTracker: React.FC = () => {
    const location = useLocation();
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const trackActivity = async () => {
            try {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                
                abortControllerRef.current = new AbortController();
                
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
                        }),
                        signal: abortControllerRef.current.signal
                    });
                    return;
                }

                let guestId = localStorage.getItem('music_guest_id');

                if (!guestId) {
                    const res = await fetch(`${API_BASE_URL}/guest-token`, {
                        signal: abortControllerRef.current.signal
                    });
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
                        }),
                        signal: abortControllerRef.current.signal
                    });
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.debug('Activity tracking error:', e);
                }
            }
        };

        trackActivity();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [location]);

    return null;
};

export default ActivityTracker;