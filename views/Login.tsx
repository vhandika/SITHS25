import React, { useState, useEffect, useRef } from 'react';
import { LogIn, AlertCircle, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { clearAuthSession, setAuthSession } from '../src/utils/auth';
import ParticleBackground from '../components/ParticleBackground';
import SkewedButton from '../components/SkewedButton';

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').toString().trim();
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise: Promise<void> | null = null;

declare global {
    interface Window {
        turnstile?: {
            render: (container: string | HTMLElement, options: {
                sitekey: string;
                callback?: (token: string) => void;
                'expired-callback'?: () => void;
                'error-callback'?: () => void;
                theme?: 'light' | 'dark';
                appearance?: 'always' | 'execute' | 'interaction-only';
            }) => string;
            reset?: (widgetId?: string) => void;
            remove?: (widgetId: string) => void;
        };
    }
}

const loadTurnstileScript = () => {
    if (window.turnstile) {
        return Promise.resolve();
    }

    if (!turnstileScriptPromise) {
        turnstileScriptPromise = new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);

            if (existingScript) {
                if (window.turnstile) {
                    resolve();
                    return;
                }

                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Turnstile.')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = TURNSTILE_SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Gagal memuat Turnstile.'));
            document.head.appendChild(script);
        });
    }

    return turnstileScriptPromise;
};

const Login: React.FC = () => {
    const { theme } = useTheme();
    const [error, setError] = useState('');
    const [isLoginInfoOpen, setIsLoginInfoOpen] = useState(true);
    const [captchaToken, setCaptchaToken] = useState('');
    const [shouldInitCaptcha, setShouldInitCaptcha] = useState(false);
    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileScaleWrapRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetIdRef = useRef<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const MICROSOFT_LOGIN_URL = `${API_BASE_URL}/auth/microsoft`;
    const VALIDATE_TOKEN_URL = `${API_BASE_URL}/validate-token`;
    const isCaptchaRequired = Boolean(TURNSTILE_SITE_KEY);
    const isMicrosoftLoginDisabled = isCaptchaRequired && !captchaToken;
    const microsoftIcon = (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" fill="#F25022" />
            <rect x="9" y="1" width="6" height="6" fill="#7FBA00" />
            <rect x="1" y="9" width="6" height="6" fill="#00A4EF" />
            <rect x="9" y="9" width="6" height="6" fill="#FFB900" />
        </svg>
    );

    useEffect(() => {
        const validateSessionFromServer = async () => {
            try {
                const response = await fetch(VALIDATE_TOKEN_URL, {
                    method: 'GET',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Token validation failed');
                }

                const data = await response.json();
                const userNim = data?.user?.nim;
                const userRole = data?.user?.role || 'mahasiswa';

                if (!userNim) {
                    throw new Error('User data missing');
                }

                setAuthSession(userNim, userRole);
                navigate('/', { replace: true });
            } catch {
                setError('Login Microsoft gagal divalidasi. Silakan coba lagi.');
            }
        };

        clearAuthSession();

        const params = new URLSearchParams(location.search);
        const msStatus = params.get('ms');
        const msError = params.get('ms_error');

        if (msError) {
            const microsoftErrors: Record<string, string> = {
                config_missing: 'Konfigurasi login Microsoft belum lengkap di server.',
                state_invalid: 'Sesi login Microsoft tidak valid. Coba lagi.',
                oauth_failed: 'Login Microsoft gagal diproses.',
                email_invalid: 'Email akun Microsoft tidak dapat dibaca.',
                domain_not_allowed: 'Gunakan akun Microsoft Itebeh yang sesuai NIM.',
                nim_not_found: 'NIM not found.',
                nim_unregistered: 'Kamu mahasiswa mana njir, gak ada di databse.'
            };

            setError(microsoftErrors[msError] || 'Login Microsoft gagal.');
            return;
        }
        if (!msStatus || msStatus === 'success') {
            validateSessionFromServer();
        }

    }, [location.search, navigate, VALIDATE_TOKEN_URL]);

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY) {
            return;
        }

        const captchaTimer = window.setTimeout(() => setShouldInitCaptcha(true), 1200);
        return () => window.clearTimeout(captchaTimer);
    }, []);

    useEffect(() => {
        let isMounted = true;

        if (!TURNSTILE_SITE_KEY || !shouldInitCaptcha) {
            return () => {
                isMounted = false;
            };
        }

        const renderTurnstile = async () => {
            try {
                await loadTurnstileScript();

                if (!isMounted || !turnstileContainerRef.current || !window.turnstile) {
                    return;
                }

                if (turnstileWidgetIdRef.current && window.turnstile.remove) {
                    window.turnstile.remove(turnstileWidgetIdRef.current);
                    turnstileWidgetIdRef.current = null;
                }

                turnstileContainerRef.current.innerHTML = '';
                turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                    sitekey: TURNSTILE_SITE_KEY,
                    theme: 'dark',
                    appearance: 'always',
                    callback: (token: string) => {
                        setCaptchaToken(token);
                        setError('');
                    },
                    'expired-callback': () => {
                        setCaptchaToken('');
                    },
                    'error-callback': () => {
                        setCaptchaToken('');
                    }
                });

                requestAnimationFrame(() => {
                    const turnstileContainer = turnstileContainerRef.current;
                    const turnstileScaleWrap = turnstileScaleWrapRef.current;
                    if (!turnstileContainer) {
                        return;
                    }

                    const iframe = turnstileContainer.querySelector('iframe') as HTMLIFrameElement | null;
                    if (iframe) {
                        iframe.style.maxWidth = '100%';
                    }

                    // Turnstile default width 300px; scale down on narrow screens to avoid overflow.
                    if (turnstileScaleWrap) {
                        const widgetBaseWidth = 300;
                        const availableWidth = turnstileScaleWrap.clientWidth;
                        const scale = Math.min(1, availableWidth / widgetBaseWidth);

                        turnstileContainer.style.transformOrigin = 'top left';
                        turnstileContainer.style.transform = `scale(${scale})`;
                        turnstileScaleWrap.style.height = `${Math.ceil(65 * scale)}px`;
                    }
                });
            } catch (turnstileError) {
                console.error('Turnstile error:', turnstileError);
            }
        };

        renderTurnstile();

        return () => {
            isMounted = false;
            if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
                window.turnstile.remove(turnstileWidgetIdRef.current);
            }
            turnstileWidgetIdRef.current = null;
        };
    }, [shouldInitCaptcha]);

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY || !shouldInitCaptcha) {
            return;
        }

        const handleResize = () => {
            const turnstileContainer = turnstileContainerRef.current;
            const turnstileScaleWrap = turnstileScaleWrapRef.current;
            if (!turnstileContainer || !turnstileScaleWrap) {
                return;
            }

            const widgetBaseWidth = 300;
            const availableWidth = turnstileScaleWrap.clientWidth;
            const scale = Math.min(1, availableWidth / widgetBaseWidth);

            turnstileContainer.style.transformOrigin = 'top left';
            turnstileContainer.style.transform = `scale(${scale})`;
            turnstileScaleWrap.style.height = `${Math.ceil(65 * scale)}px`;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [shouldInitCaptcha]);

    const handleMicrosoftLogin = () => {
        setError('');

        if (isCaptchaRequired && !shouldInitCaptcha) {
            setShouldInitCaptcha(true);
            setError('Menyiapkan CAPTCHA, coba klik Login sekali lagi.');
            return;
        }

        if (isCaptchaRequired && !captchaToken) {
            setError('Selesaikan CAPTCHA terlebih dahulu.');
            return;
        }

        window.location.href = MICROSOFT_LOGIN_URL;
    };

    return (
        <div className={`relative flex min-h-screen w-full overflow-x-hidden items-center justify-center py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            <ParticleBackground />

            <div className="relative z-10 w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-black/80 p-5 sm:p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-md overflow-x-hidden">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><LogIn size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white drop-shadow-md">Login</h1>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-900/40 border border-red-500 text-red-200 p-3 rounded text-sm backdrop-blur-sm shadow-lg">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        type="button"
                        onClick={() => setIsLoginInfoOpen((prev) => !prev)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-3 text-left transition-colors hover:bg-gray-700/70"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-200">Yapping</span>
                        </div>

                        <div
                            className={`grid transition-all duration-300 ease-out ${isLoginInfoOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                        >
                            <p className="overflow-hidden text-sm text-gray-300">
                                Dikarenakan banyaknya orang yang login pakai nim tpb, lupa password, dan spam login. Akhirnya saya melakukan berbagai penyesuaian, diantaranya login HANYA menggunakan akun Microsoft itebeh, sekian. 🙂
                            </p>
                        </div>
                    </button>

                    <div>
                        {TURNSTILE_SITE_KEY ? (
                            <div className="w-full max-w-full overflow-x-hidden">
                                <div ref={turnstileScaleWrapRef} className="w-full max-w-full overflow-hidden" style={{ minHeight: '65px' }}>
                                    <div ref={turnstileContainerRef} className="w-[300px] max-w-none" />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-3 text-[11px] text-amber-200">
                                CAPTCHA belum aktif karena site key belum dikonfigurasi.
                            </div>
                        )}
                    </div>

                    <SkewedButton
                        className="w-full shadow-lg"
                        icon={microsoftIcon}
                        onClick={handleMicrosoftLogin}
                        disabled={isMicrosoftLoginDisabled}
                    >
                        Login dengan Microsoft
                    </SkewedButton>
                </div>
            </div>
        </div>
    );
};

export default Login;
