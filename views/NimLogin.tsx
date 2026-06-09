import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getAuthState, setAuthSession } from '../src/utils/auth';
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

const NimLogin: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [nim, setNim] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [shouldInitCaptcha, setShouldInitCaptcha] = useState(false);
    const [loginSessionId, setLoginSessionId] = useState('');

    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileScaleWrapRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetIdRef = useRef<string | null>(null);

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const LOGIN_URL = `${API_BASE_URL}/login`;
    const isCaptchaRequired = Boolean(TURNSTILE_SITE_KEY);
    const isLoginDisabled = isLoading || (isCaptchaRequired && !captchaToken);

    useEffect(() => {
        if (getAuthState().isLoggedIn) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        const trimmedNim = nim.trim();

        if (!trimmedNim) {
            setError('NIM wajib diisi.');
            return;
        }

        if (!password) {
            setError('Password wajib diisi.');
            return;
        }

        if (isCaptchaRequired && !shouldInitCaptcha) {
            setShouldInitCaptcha(true);
            setError('Menyiapkan CAPTCHA, coba login sekali lagi.');
            return;
        }

        if (isCaptchaRequired && !captchaToken) {
            setError('Selesaikan CAPTCHA terlebih dahulu.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    nim: trimmedNim,
                    password,
                    captcha_token: captchaToken,
                    login_session_id: loginSessionId || undefined
                }),
                credentials: 'include'
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (typeof data?.login_session_id === 'string') {
                    setLoginSessionId(data.login_session_id);
                }
                setError(data?.message || 'Gagal login dengan NIM dan password.');
                return;
            }

            const userNim = data?.user?.nim;
            const userRole = data?.user?.role || 'mahasiswa';

            if (!userNim) {
                setError('Respons login tidak valid.');
                return;
            }

            setAuthSession(userNim, userRole);
            navigate('/', { replace: true });
        } catch {
            setError('Gagal terhubung ke server login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`relative flex min-h-screen w-full items-center justify-center overflow-x-hidden px-4 py-16 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            <ParticleBackground />

            <div className="relative z-10 w-full max-w-md overflow-x-hidden rounded-2xl border border-gray-800 bg-black/80 p-6 shadow-2xl shadow-yellow-500/5 backdrop-blur-md sm:p-8">
                <div className="text-center">
                    <div className="mb-4 flex items-center justify-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center bg-yellow-400 text-black shadow-lg transform -skew-x-12">
                            <span className="transform skew-x-12"><KeyRound size={24} /></span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-wider uppercase text-white drop-shadow-md">Loging</h1>
                    </div>
                    <p className="text-sm text-gray-400">Untuk yang gak bisa pake akun mikocok.</p>
                </div>

                {error && (
                    <div className="mt-6 flex items-center gap-2 rounded border border-red-500 bg-red-900/40 p-3 text-sm text-red-200 backdrop-blur-sm shadow-lg">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label htmlFor="nim" className="text-sm font-medium text-gray-300">NIM</label>
                        <input
                            id="nim"
                            name="nim"
                            type="text"
                            autoComplete="username"
                            inputMode="numeric"
                            value={nim}
                            onChange={(event) => setNim(event.target.value)}
                            placeholder="Masukkan NIM"
                            className="relative block w-full rounded-lg border-0 bg-white/5 px-4 py-3 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 transition-colors focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Masukkan password"
                                className="relative block w-full rounded-lg border-0 bg-white/5 px-4 py-3 pr-11 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 transition-colors focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 transition-colors hover:text-yellow-400 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

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
                        icon={<KeyRound size={16} />}
                        type="submit"
                        disabled={isLoginDisabled}
                    >
                        {isLoading ? 'Memproses...' : 'Login'}
                    </SkewedButton>
                </form>

                <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <Link to="/login" className="inline-flex items-center justify-center gap-2 text-yellow-400 transition-colors hover:text-yellow-300">
                        Login Microsoft <ExternalLink size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NimLogin;
