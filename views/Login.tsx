import React, { useState, useEffect, useRef } from 'react';
import SkewedButton from '../components/SkewedButton';
import { KeyRound, LogIn, AlertCircle, Eye, EyeOff, X, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth / 12), 100);
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    radius: Math.random() * 2 + 1
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        ctx.beginPath();
                        const opacity = 0.35 - (dist / 140) * 0.35;
                        ctx.strokeStyle = `rgba(250, 204, 21, ${opacity})`;
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
    );
};

const Login: React.FC = () => {
    const [nim, setNim] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forgot password modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotNim, setForgotNim] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const [forgotError, setForgotError] = useState('');

    const navigate = useNavigate();
    const { showToast } = useToast();

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const API_URL = `${API_BASE_URL}/login`;

    useEffect(() => {
        deleteCookie('userToken');
        deleteCookie('userRole');
        deleteCookie('userNIM');

        const savedNim = getCookie('rememberedNIM');
        if (savedNim) {
            setNim(savedNim);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ nim, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                if (rememberMe) {
                    setCookie('rememberedNIM', nim, 30);
                } else {
                    deleteCookie('rememberedNIM');
                }

                setCookie('userNIM', data.user.nim);
                setCookie('userRole', data.user.role || 'mahasiswa');

                navigate('/');
            } else {
                setError(data.message || 'Login gagal, cek NIM/Password');
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
        <div className="relative flex min-h-screen w-full items-center justify-center py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black">

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