import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureGuestToken, isAuthenticated } from '../src/utils/auth';
import { fetchWithAuth } from '../src/utils/api';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

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
                
                if (isAuthenticated()) {
                    await fetchWithAuth(`${API_BASE_URL}/activity`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            path: location.pathname
                        }),
                        signal: abortControllerRef.current.signal
                    });
                    return;
                }

                const { token: guestToken } = await ensureGuestToken(API_BASE_URL);

                if (guestToken) {
                    await fetch(`${API_BASE_URL}/activity`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-Guest-Id': guestToken
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