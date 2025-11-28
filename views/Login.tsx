import React, { useState, useEffect } from 'react';
import SkewedButton from '../components/SkewedButton';
import { KeyRound, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [nim, setNim] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const API_URL = 'https://idk-eight.vercel.app/api/login'; 

    useEffect(() => {
        const savedNim = localStorage.getItem('rememberedNIM');
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nim, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (rememberMe) {
                    localStorage.setItem('rememberedNIM', nim);
                } else {
                    localStorage.removeItem('rememberedNIM');
                }
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userNIM', data.user.nim);
                localStorage.setItem('userRole', data.user.role || 'mahasiswa'); 
                
                navigate('/'); 
            } else {
                setError(data.message || 'Login gagal, cek NIM/Password');
            }
        } catch (err) {
            console.error(err);
            setError('Gagal menghubungi server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        alert("Untuk reset password, silahkan kontak Vhandika");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-black py-16 px-4 mt-16 lg:mt-0">
            <div className="relative z-10 w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-black/80 p-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-sm">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                         <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                             <span className="transform skew-x-12"><LogIn size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white">Login</h1>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-900/40 border border-red-500 text-red-200 p-3 rounded text-sm">
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
                                className="relative block w-full border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
                                placeholder="NIM (Contoh: 16125001)"
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
                                className="relative block w-full border-0 bg-white/5 py-3 px-4 pr-10 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-gray-500 hover:text-yellow-400 focus:outline-none"
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
                            <label htmlFor="remember-me" className="ml-2 block text-gray-400 cursor-pointer">
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
                            className="w-full" 
                            icon={!isLoading ? <KeyRound size={16}/> : undefined}
                            onClick={handleLogin}
                        >
                           {isLoading ? 'Wait...' : 'Login'}
                        </SkewedButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;