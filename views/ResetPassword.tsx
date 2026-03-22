import React, { useState, useEffect } from 'react';
import SkewedButton from '../components/SkewedButton';
import { KeyRound, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import { useTheme } from '../contexts/ThemeContext';

const ResetPassword: React.FC = () => {
    const { theme } = useTheme();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';

    useEffect(() => {
        if (!success) return;
        if (countdown <= 0) {
            navigate('/login');
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [success, countdown, navigate]);

    const handleSubmit = async () => {
        setError('');

        if (!newPassword || newPassword.length < 8) {
            setError('Password baru minimal 8 karakter');
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            setError('Password harus mengandung huruf kecil');
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setError('Password harus mengandung huruf besar');
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            setError('Password harus mengandung angka');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Gagal mereset password.');
            }
        } catch (err) {
            setError('Gagal menghubungi server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    if (!token) {
        return (
            <div className={`relative flex min-h-screen w-full items-center justify-center py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                <ParticleBackground />
                <div className="relative z-10 w-full max-w-md space-y-6 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-md text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle size={36} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Link Tidak Valid</h1>
                    <p className="text-gray-400 text-sm">
                        Token reset password tidak ditemukan. Pastikan kamu menggunakan link dari email yang benar.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className={`relative flex min-h-screen w-full items-center justify-center py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                <ParticleBackground />
                <div className="relative z-10 w-full max-w-md space-y-6 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-md text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 size={36} className="text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Password Berhasil Direset!</h1>
                    <p className="text-gray-400 text-sm">
                        Kamu sekarang bisa login dengan password baru.
                    </p>
                    <p className="text-gray-500 text-xs">
                        Redirect ke halaman login dalam <span className="text-yellow-400 font-bold">{countdown}</span> detik...
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                    >
                        Login Sekarang
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative flex min-h-screen w-full items-center justify-center py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            <ParticleBackground />

            <div className="relative z-10 w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-md">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><KeyRound size={24} /></span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-wider uppercase text-white drop-shadow-md">Reset Password</h1>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Masukkan password baru untuk akun kamu</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-900/40 border border-red-500 text-red-200 p-3 rounded text-sm backdrop-blur-sm shadow-lg">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <label htmlFor="new-password" className="sr-only">Password Baru</label>
                        <input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="relative block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6 transition-colors"
                            placeholder="Password Baru"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <label htmlFor="confirm-password" className="sr-only">Konfirmasi Password</label>
                        <input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="relative block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6 transition-colors"
                            placeholder="Konfirmasi Password Baru"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none transition-colors"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <SkewedButton
                        className="w-full shadow-lg"
                        icon={!isLoading ? <KeyRound size={16} /> : undefined}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Reset Password'}
                    </SkewedButton>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                    >
                        ← Kembali ke Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

