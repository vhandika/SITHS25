import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, RefreshCw, Smartphone, Monitor, ChevronRight } from 'lucide-react';
import SkewedButton from '../components/SkewedButton';
import { fetchWithAuth } from '../src/utils/api';

const API_BASE_URL = 'http://localhost:5000/api';

interface ActiveUser {
    nim: string;
    last_seen: string;
    current_path: string;
    ip: string;
    device: string;
    users: {
        name: string;
        role: string;
        avatar_url: string;
    };
}

const DevDashboard: React.FC = () => {
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetNim, setTargetNim] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetStatus, setResetStatus] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const getCookie = (name: string) => {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    };

    useEffect(() => {
        const role = getCookie('userRole');
        if (role !== 'dev') {
            navigate('/');
        }

        loadActiveUsers();
        const interval = setInterval(loadActiveUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadActiveUsers = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/dev/active-users`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Sesi habis atau tidak ada izin (Coba Login Ulang)");
                }
                throw new Error(`Server Error: ${response.status}`);
            }
            const data = await response.json();
            if (data.data) setActiveUsers(data.data);
        } catch (e: any) {
            setErrorMsg(e.message || "Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    const handleForceReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetStatus('Processing...');
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/dev/force-reset-password`, {
                method: 'POST',
                body: JSON.stringify({ target_nim: targetNim, new_password: newPassword })
            });
            const result = await response.json();
            setResetStatus(result.message);
            if (response.ok) {
                setTargetNim('');
                setNewPassword('');
            }
        } catch (e) {
            setResetStatus('Error resetting password');
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString();
    };

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans relative selection:bg-yellow-400 selection:text-black">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                            <span className="transform skew-x-12"><Monitor size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Dev Dashboard</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                        <div className="relative p-6 z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Users className="text-blue-400" /> Active Users <span className="text-gray-500 text-lg">({activeUsers.length})</span>
                                </h2>
                                <button onClick={loadActiveUsers} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
                                    <RefreshCw size={20} className={`text-yellow-400 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {errorMsg && (
                                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm">
                                    Error {errorMsg}
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-500 uppercase bg-black/40 border-b border-gray-700">
                                        <tr>
                                            <th className="px-4 py-4 rounded-tl-lg">User</th>
                                            <th className="px-4 py-4">Page</th>
                                            <th className="px-4 py-4 hidden sm:table-cell">Details</th>
                                            <th className="px-4 py-4 rounded-tr-lg text-right">Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {activeUsers.map((user) => (
                                            <tr key={user.nim} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-4 font-bold text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.users?.avatar_url ? 'overflow-hidden' : 'bg-blue-900 text-blue-300'}`}>
                                                            {user.users?.avatar_url ?
                                                                <img src={user.users.avatar_url} className="w-full h-full object-cover" alt="avatar" /> :
                                                                <span className="text-xs">{user.nim.slice(-2)}</span>
                                                            }
                                                        </div>
                                                        <div>
                                                            <div className="text-base">{user.users?.name || user.nim}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{user.nim}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded text-xs font-mono border border-yellow-400/20">
                                                        {user.current_path}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        {user.device?.toLowerCase().includes('mobile') || user.device?.toLowerCase().includes('android') ?
                                                            <Smartphone size={14} /> :
                                                            <Monitor size={14} />
                                                        }
                                                        <span className="truncate max-w-[150px]" title={user.ip}>{user.ip}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right font-mono text-gray-300">
                                                    {formatTime(user.last_seen)}
                                                </td>
                                            </tr>
                                        ))}
                                        {activeUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-12 text-center text-gray-600 italic">
                                                    Tidak ada user aktif saat ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="relative group lg:col-span-1">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 h-full p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent pointer-events-none"></div>

                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white border-b border-gray-800 pb-4 relative z-10">
                                <Lock className="text-gray-400" /> Reset Password
                            </h2>

                            <form onSubmit={handleForceReset} className="flex flex-col h-[calc(100%-5rem)] justify-between relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">NIM</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={targetNim}
                                                onChange={e => setTargetNim(e.target.value)}
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                                                placeholder="..."
                                                required
                                            />
                                            <Users size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">New Password</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                                                placeholder="..."
                                                required
                                            />
                                            <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-lg shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2 uppercase tracking-widest"
                                    >
                                        <RefreshCw size={18} /> Reset Password
                                    </button>

                                    {resetStatus && (
                                        <div className={`mt-4 p-3 rounded text-center text-sm font-bold ${resetStatus.toLowerCase().includes('berhasil') ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                                            {resetStatus}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevDashboard;
