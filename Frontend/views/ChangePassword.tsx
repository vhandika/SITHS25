import React, { useState, useEffect, useRef } from 'react';
import SkewedButton from '../components/SkewedButton';
import { KeyRound, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const newPasswordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const API_URL = `${API_BASE_URL}/change-password`;

    useEffect(() => {
        const token = getCookie('userNIM');

        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleChangePassword = async () => {
        setError('');
        setSuccess('');

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

        if (!passwordRegex.test(newPassword) || newPassword.length < 8) {
            setError('Password minimal 8 karakter, harus ada Huruf Besar, Huruf Kecil, dan Angka.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        setIsLoading(true);

        try {
            const token = getCookie('userToken');

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password berhasil diubah!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Gagal mengubah password.');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            } else {
                handleChangePassword();
            }
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-black py-16 px-4 mt-16 lg:mt-0 selection:bg-yellow-400 selection:text-black">
            <div className="relative z-10 w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-sm">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                            <span className="transform skew-x-12"><KeyRound size={28} /></span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-wider uppercase text-white">Ganti Password</h1>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-900/40 border border-red-500 text-red-200 p-3 rounded text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 bg-green-900/40 border border-green-500 text-green-200 p-3 rounded text-sm">
                        <Save size={16} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password Lama</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, newPasswordRef)}
                                    className="block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-yellow-400 rounded"
                                    placeholder="Masukkan password lama"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none"
                                >
                                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password Baru</label>
                            <div className="relative">
                                <input
                                    ref={newPasswordRef}
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
                                    className="block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-yellow-400 rounded"
                                    placeholder="Min 8 karakter (Huruf Besar, Kecil, Angka)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Konfirmasi Password Baru</label>
                            <div className="relative">
                                <input
                                    ref={confirmPasswordRef}
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e)}
                                    className="block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-yellow-400 rounded"
                                    placeholder="Ulangi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SkewedButton
                            className="w-full"
                            icon={!isLoading ? <Save size={16} /> : undefined}
                            onClick={handleChangePassword}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Password'}
                        </SkewedButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
