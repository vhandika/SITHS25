import React, { useState, useEffect, useRef } from 'react';
import SkewedButton from '../components/SkewedButton';
import { KeyRound, LogIn, AlertCircle, Eye, EyeOff, X, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import ParticleBackground from '../components/ParticleBackground';
import { useTheme } from '../contexts/ThemeContext';
import { clearAuthSession, getCookie, setAuthSession, deleteCookie, setCookie } from '../src/utils/auth';

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
    const [nim, setNim] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotNim, setForgotNim] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const [forgotError, setForgotError] = useState('');

    const [captchaToken, setCaptchaToken] = useState('');
    const [loginSessionId, setLoginSessionId] = useState<string | null>(null);
    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetIdRef = useRef<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const API_URL = `${API_BASE_URL}/login`;
    const MICROSOFT_LOGIN_URL = `${API_BASE_URL}/auth/microsoft`;

    useEffect(() => {
        clearAuthSession();

        const params = new URLSearchParams(location.search);
        const msStatus = params.get('ms');
        const msError = params.get('ms_error');

        if (msStatus === 'success') {
            const msNim = params.get('nim');
            const msRole = params.get('role') || 'mahasiswa';

            if (msNim) {
                setAuthSession(msNim, msRole);
                navigate('/', { replace: true });
                return;
            }
        }

        if (msError) {
            const microsoftErrors: Record<string, string> = {
                config_missing: 'Konfigurasi login Microsoft belum lengkap di server.',
                state_invalid: 'Sesi login Microsoft tidak valid. Coba lagi.',
                oauth_failed: 'Login Microsoft gagal diproses.',
                email_invalid: 'Email akun Microsoft tidak dapat dibaca.',
                domain_not_allowed: 'Gunakan akun Microsoft kampus yang sesuai NIM.',
                nim_not_found: 'NIM tidak ditemukan dari akun Microsoft Anda.',
                nim_unregistered: 'NIM dari akun Microsoft belum terdaftar di sistem.'
            };

            setError(microsoftErrors[msError] || 'Login Microsoft gagal.');
        }

        const savedNim = getCookie('rememberedNIM');
        if (savedNim) {
            setNim(savedNim);
            setRememberMe(true);
        }
    }, [location.search, navigate]);

    useEffect(() => {
        let isMounted = true;

        if (!TURNSTILE_SITE_KEY) {
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
                    appearance: 'interaction-only', // Invisible mode
                    callback: (token: string) => {
                        setCaptchaToken(token);
                    },
                    'expired-callback': () => {
                        setCaptchaToken('');
                    },
                    'error-callback': () => {
                        setCaptchaToken('');
                    }
                });
            } catch (error) {
                console.error('Turnstile error:', error);
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
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem('login_session_id');
        if (stored) {
            setLoginSessionId(stored);
        }
    }, []);

    const handleLogin = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();

        setError('');
        setIsLoading(true);

        try {
            const payload: any = { nim, password };

            if (captchaToken || loginSessionId) {
                if (captchaToken) {
                    payload.captcha_token = captchaToken;
                }
                if (loginSessionId) {
                    payload.login_session_id = loginSessionId;
                }
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                if (rememberMe) {
                    setCookie('rememberedNIM', nim, 30);
                } else {
                    deleteCookie('rememberedNIM');
                }

                if (data.login_session_id) {
                    sessionStorage.setItem('login_session_id', data.login_session_id);
                    setLoginSessionId(data.login_session_id);
                }

                setAuthSession(data.user.nim, data.user.role || 'mahasiswa');

                navigate('/');
            } else {
                setError(data.message || 'Login gagal, cek NIM/Password');
                if (turnstileWidgetIdRef.current && window.turnstile?.reset) {
                    window.turnstile.reset(turnstileWidgetIdRef.current);
                    setCaptchaToken('');
                }
            }
        } catch (err) {
            setError('Gagal menghubungi server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowForgotModal(true);
        setForgotNim('');
        setForgotSent(false);
        setForgotError('');
    };

    const handleMicrosoftLogin = () => {
        window.location.href = MICROSOFT_LOGIN_URL;
    };

    const handleForgotSubmit = async () => {
        if (!forgotNim.trim() || !/^[0-9]{5,20}$/.test(forgotNim)) {
            setForgotError('Masukkan NIM yang valid (angka saja)');
            return;
        }

        setForgotLoading(true);
        setForgotError('');

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ nim: forgotNim })
            });

            const data = await response.json();

            if (response.ok) {
                setForgotSent(true);
            } else {
                setForgotError(data.message || 'Terjadi kesalahan. Coba lagi nanti.');
            }
        } catch (err) {
            setForgotError('Gagal menghubungi server.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className={`relative flex min-h-screen w-full items-center justify-center py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>

            <ParticleBackground />

            <div className="relative z-10 w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-md">
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
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="NIM" className="sr-only">NIM</label>
                            <input
                                id="NIM"
                                type="text"
                                required
                                value={nim}
                                onChange={(e) => setNim(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="relative block w-full border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6 transition-colors"
                                placeholder="NIM"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="relative block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6 transition-colors"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-yellow-400 focus:ring-yellow-500 cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                                Remember me
                            </label>
                        </div>

                        <div className="font-medium">
                            <button
                                onClick={handleForgotPassword}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>

                    {/* Hidden Turnstile container untuk invisible CAPTCHA */}
                    {TURNSTILE_SITE_KEY && (
                        <div ref={turnstileContainerRef} style={{ display: 'none' }} />
                    )}

                    <div>
                        <SkewedButton
                            className="w-full shadow-lg"
                            icon={!isLoading ? <KeyRound size={16} /> : undefined}
                            onClick={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Wait...' : 'Login'}
                        </SkewedButton>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleMicrosoftLogin}
                            className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                        >
                            Login dengan Microsoft
                        </button>
                    </div>
                </div>
            </div>

            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="relative w-full max-w-sm rounded-lg border border-gray-800 bg-gray-950/95 p-6 shadow-2xl shadow-yellow-500/10 backdrop-blur-md">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {!forgotSent ? (
                            <>
                                <p className="text-gray-400 text-sm mb-4">
                                    Masukkan NIM kamu. Link reset password akan dikirim ke email <span className="text-yellow-400 font-medium">NIM@mahasiswa.itb.ac.id</span>
                                </p>

                                {forgotError && (
                                    <div className="flex items-center gap-2 bg-red-900/40 border border-red-500 text-red-200 p-2.5 rounded text-xs mb-3">
                                        <AlertCircle size={14} />
                                        <span>{forgotError}</span>
                                    </div>
                                )}

                                <input
                                    type="text"
                                    value={forgotNim}
                                    onChange={(e) => setForgotNim(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleForgotSubmit(); }}
                                    className="block w-full border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm transition-colors rounded mb-4"
                                    placeholder="Masukkan NIM"
                                    autoFocus
                                />

                                <SkewedButton
                                    className="w-full shadow-lg"
                                    icon={!forgotLoading ? <Mail size={16} /> : undefined}
                                    onClick={handleForgotSubmit}
                                    disabled={forgotLoading}
                                >
                                    {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                                </SkewedButton>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-400/10 flex items-center justify-center">
                                    <Mail size={28} className="text-yellow-400" />
                                </div>
                                <p className="text-white font-semibold mb-2">Email Terkirim!</p>
                                <p className="text-gray-400 text-sm mb-1">
                                    Link reset password telah dikirim ke:
                                </p>
                                <p className="text-yellow-400 font-medium text-sm mb-4">
                                    {forgotNim}@mahasiswa.itb.ac.id
                                </p>
                                <p className="text-gray-500 text-xs">
                                    Link berlaku selama 15 menit. Cek juga folder Spam/Junk.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
