import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Wallet, TrendingDown, Users, ArrowUpCircle, ArrowDownCircle, Calendar, User, Search, CheckSquare, History } from 'lucide-react';
import SkewedButton from '../components/SkewedButton';
import { fetchWithAuth } from '../src/utils/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

interface Transaction {
    id: number;
    type: 'pemasukan' | 'pengeluaran';
    amount: number;
    description: string;
    user_nim: string | null;
    user_name: string | null;
    recorded_by: string;
    recorded_by_name: string;
    created_at: string;
}

interface Summary {
    totalKas: number;
    pengeluaranHariIni: number;
    pengeluaranBulanIni: number;
    pengeluaran3Bulan: number;
    pengeluaran6Bulan: number;
    pengeluaran1Tahun: number;
}

interface UnpaidUser {
    nim: string;
    name: string;
    avatar_url: string | null;
    paid_amount: number;
    remaining: number;
}

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const getMonthsList = () => {
    const list = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        list.push({ value: `${y}-${m}`, label });
        d.setMonth(d.getMonth() - 1);
    }
    return list;
};

const availableMonths = getMonthsList();

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

const Finance: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeExpenseTab, setActiveExpenseTab] = useState<string>('bulan');

    const [dashboardUnpaidUsers, setDashboardUnpaidUsers] = useState<UnpaidUser[]>([]);
    const [dashboardMonth, setDashboardMonth] = useState(availableMonths[0].value);
    const [dashboardUnpaidStats, setDashboardUnpaidStats] = useState({ total: 0, paid: 0, unpaid: 0 });
    const [showUnpaid, setShowUnpaid] = useState(false);

    const [formType, setFormType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
    const [formAmount, setFormAmount] = useState('');
    const [formDescription, setFormDescription] = useState('');

    const [formTargetMonth, setFormTargetMonth] = useState(availableMonths[0].value);
    const [modalUnpaidUsers, setModalUnpaidUsers] = useState<UnpaidUser[]>([]);
    const [amountPreset, setAmountPreset] = useState('5000');
    const [selectedNims, setSelectedNims] = useState<string[]>([]);
    const [searchUser, setSearchUser] = useState('');

    const currentUserNIM = getCookie('userNIM');
    const currentUserRole = getCookie('userRole');
    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const canAdd = ['bendahara', 'admin', 'dev'].includes(currentUserRole);

    const fetchFinance = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/finance`);
            const json = await res.json();
            if (res.ok) {
                setTransactions(json.data || []);
                setSummary(json.summary || null);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDashboardUnpaid = async (monthVal: string) => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/finance/unpaid?month=${monthVal}`);
            const json = await res.json();
            if (res.ok) {
                setDashboardUnpaidUsers(json.data || []);
                setDashboardUnpaidStats({
                    total: json.totalUsers || 0,
                    paid: json.paidCount || 0,
                    unpaid: json.unpaidCount || 0
                });
            } else {
                showToast(`Server: ${json.message || 'Gagal memuat list kas'}`, 'error');
            }
        } catch (error) { 
            showToast('Koneksi terputus saat memuat list kas', 'error');
        }
    };

    const fetchModalUnpaid = async (monthVal: string) => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/finance/unpaid?month=${monthVal}`);
            const json = await res.json();
            if (res.ok) {
                setModalUnpaidUsers(json.data || []);
            } else {
                showToast(`Gagal load mahasiswa: ${json.message}`, 'error');
            }
        } catch (error) { }
    };

    useEffect(() => {
        if (!currentUserNIM) {
            navigate('/login');
            return;
        }
        fetchFinance();
        fetchDashboardUnpaid(dashboardMonth);
    }, [currentUserNIM, navigate]);

    useEffect(() => {
        fetchDashboardUnpaid(dashboardMonth);
    }, [dashboardMonth]);

    useEffect(() => {
        if (canAdd && isModalOpen && formType === 'pemasukan') {
            fetchModalUnpaid(formTargetMonth);
            setSelectedNims([]); 
        }
    }, [formTargetMonth, isModalOpen, formType, canAdd]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formType === 'pengeluaran') {
                if (formDescription.length < 3) {
                    showToast('Deskripsi minimal 3 karakter', 'error');
                    setIsSubmitting(false);
                    return;
                }
                const amount = parseInt(formAmount);
                if (!amount || amount <= 0) {
                    showToast('Jumlah harus lebih dari 0', 'error');
                    setIsSubmitting(false);
                    return;
                }

                const res = await fetchWithAuth(`${API_BASE_URL}/finance`, {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'pengeluaran',
                        amount,
                        description: formDescription,
                        user_nim: '', // Dikosongkan sesuai permintaan
                        user_name: '' // Dikosongkan sesuai permintaan
                    })
                });
                
                const data = await res.json();
                if (res.ok) {
                    handleSuccessSubmit();
                } else {
                    showToast(data.message || 'Gagal menambah transaksi', 'error');
                }
            } else {
                // Proses Pemasukan (Batch/Checklist)
                if (selectedNims.length === 0) {
                    showToast('Pilih minimal 1 orang mahasiswa!', 'error');
                    setIsSubmitting(false);
                    return;
                }

                const finalAmount = amountPreset === 'custom' ? parseInt(formAmount) : parseInt(amountPreset);
                if (!finalAmount || finalAmount <= 0) {
                    showToast('Jumlah kas tidak valid', 'error');
                    setIsSubmitting(false);
                    return;
                }

                const promises = selectedNims.map(nim => {
                    const user = modalUnpaidUsers.find(u => u.nim === nim);
                    const payAmount = Math.min(finalAmount, user?.remaining || 20000);
                    
                    return fetchWithAuth(`${API_BASE_URL}/finance`, {
                        method: 'POST',
                        body: JSON.stringify({
                            type: 'pemasukan',
                            amount: payAmount,
                            description: `Kas ${formTargetMonth}`,
                            user_nim: nim,
                            user_name: user?.name || ''
                        })
                    });
                });

                const responses = await Promise.all(promises);
                
                // Cek error secara strict
                const failedResponse = responses.find(res => !res.ok);
                if (failedResponse) {
                    const errorData = await failedResponse.json().catch(() => ({}));
                    showToast(errorData.message || 'Server menolak data (cek validasi)', 'error');
                    setIsSubmitting(false);
                    return;
                }

                handleSuccessSubmit();
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi ke server', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessSubmit = () => {
        setFormAmount('');
        setFormDescription('');
        setSelectedNims([]);
        setSearchUser('');
        setIsModalOpen(false);
        fetchFinance();
        fetchDashboardUnpaid(dashboardMonth);
        showToast('Transaksi berhasil ditambahkan!', 'success');
    };

    const toggleUserSelection = (nim: string) => {
        if (selectedNims.includes(nim)) {
            setSelectedNims(selectedNims.filter(n => n !== nim));
        } else {
            setSelectedNims([...selectedNims, nim]);
        }
    };

    const getExpenseByTab = () => {
        if (!summary) return 0;
        switch (activeExpenseTab) {
            case 'hari': return summary.pengeluaranHariIni;
            case 'bulan': return summary.pengeluaranBulanIni;
            case '3bulan': return summary.pengeluaran3Bulan;
            case '6bulan': return summary.pengeluaran6Bulan;
            case '1tahun': return summary.pengeluaran1Tahun;
            default: return summary.pengeluaranBulanIni;
        }
    };

    const expenseTabs = [
        { key: 'hari', label: 'Hari Ini' },
        { key: 'bulan', label: 'Bulan Ini' },
        { key: '3bulan', label: '3 Bulan' },
        { key: '6bulan', label: '6 Bulan' },
        { key: '1tahun', label: '1 Tahun' },
    ];

    const filteredModalUsers = modalUnpaidUsers.filter(user => 
        user.name.toLowerCase().includes(searchUser.toLowerCase()) || 
        user.nim.includes(searchUser)
    );

    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">

            <ParticleBackground />

            <div className="relative z-10 mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><Wallet size={32} /></span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl drop-shadow-md">Keuangan</h1>
                            <p className="text-gray-400 text-sm mt-1">Catatan Kas & Pengeluaran</p>
                        </div>
                    </div>

                    {canAdd && (
                        <div className="hidden md:block">
                            <SkewedButton onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
                                Tambah Transaksi
                            </SkewedButton>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {/* Total Kas */}
                            <div className="relative overflow-hidden bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 hover:border-yellow-400/50 transition-all duration-300 group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/5 rounded-bl-full"></div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-yellow-400/10 rounded-lg">
                                        <Wallet size={20} className="text-yellow-400" />
                                    </div>
                                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Kas</span>
                                </div>
                                <p className={`text-3xl font-bold ${(summary?.totalKas ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatRupiah(summary?.totalKas ?? 0)}
                                </p>
                            </div>

                            {/* Pengeluaran with Tabs */}
                            <div className="relative overflow-hidden bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 hover:border-red-400/30 transition-all duration-300 sm:col-span-1 lg:col-span-1">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/5 rounded-bl-full"></div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-400/10 rounded-lg">
                                        <TrendingDown size={20} className="text-red-400" />
                                    </div>
                                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pengeluaran</span>
                                </div>
                                <p className="text-3xl font-bold text-red-400 mb-3">
                                    {formatRupiah(getExpenseByTab())}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {expenseTabs.map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveExpenseTab(tab.key)}
                                            className={`px-2 py-1 text-[10px] rounded-md font-medium transition-all duration-200 ${activeExpenseTab === tab.key
                                                ? 'bg-red-400/20 text-red-300 border border-red-400/30'
                                                : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 hover:text-gray-300'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Belum Bayar */}
                            <div className="relative overflow-hidden bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 hover:border-orange-400/30 transition-all duration-300 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/5 rounded-bl-full"></div>
                                
                                <div className="flex items-center justify-between mb-3 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-400/10 rounded-lg">
                                            <Users size={20} className="text-orange-400" />
                                        </div>
                                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Status Kas</span>
                                    </div>
                                    <select 
                                        value={dashboardMonth}
                                        onChange={(e) => setDashboardMonth(e.target.value)}
                                        className="bg-black/40 text-xs text-yellow-400 border border-gray-700 rounded-md p-1 focus:outline-none focus:border-yellow-400 cursor-pointer"
                                    >
                                        {availableMonths.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end gap-2 mt-2">
                                    <p className="text-3xl font-bold text-orange-400">{dashboardUnpaidStats.unpaid}</p>
                                    <p className="text-gray-500 text-sm mb-1">/ {dashboardUnpaidStats.total} org blm lunas</p>
                                </div>
                                <button 
                                    onClick={() => setShowUnpaid(!showUnpaid)}
                                    className="text-gray-500 text-xs mt-3 text-left hover:text-yellow-400 transition-colors w-fit underline decoration-gray-700 underline-offset-2"
                                >
                                    {showUnpaid ? 'Tutup daftar' : 'Lihat daftar belum lunas'}
                                </button>
                            </div>
                        </div>

                        {/* Unpaid Users List */}
                        {showUnpaid && (
                            <div className="mb-8 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden animate-fade-in-down">
                                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <Users size={18} className="text-orange-400" />
                                        Belum Lunas Kas — {availableMonths.find(m => m.value === dashboardMonth)?.label}
                                    </h3>
                                    <div className="flex gap-3 text-xs">
                                        <span className="text-green-400">Lunas: {dashboardUnpaidStats.paid}</span>
                                        <span className="text-orange-400">Belum Lunas: {dashboardUnpaidStats.unpaid}</span>
                                    </div>
                                </div>
                                {dashboardUnpaidUsers.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                                        <span className="text-3xl">🎉</span>
                                        <span>Mantap, semua sudah bayar kas lunas 20k! (Atau API error)</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {dashboardUnpaidUsers.map((user) => (
                                            <div key={user.nim} className="flex items-center gap-3 p-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-700 flex-shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                        <User size={14} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="overflow-hidden flex-1">
                                                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                                    <div className="flex justify-between items-center pr-2">
                                                        <p className="text-gray-500 text-xs font-mono">{user.nim}</p>
                                                        <p className="text-orange-400 text-[10px] font-bold tracking-wider">
                                                            KURANG {formatRupiah(user.remaining)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Transaction History */}
                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <History size={18} className="text-yellow-400" />
                                    Riwayat Transaksi Terakhir
                                </h3>
                            </div>

                            {transactions.length === 0 ? (
                                <div className="p-10 text-center text-gray-400">
                                    Belum ada transaksi.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800/50">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-center gap-4">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${tx.type === 'pemasukan' ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                                                {tx.type === 'pemasukan'
                                                    ? <ArrowUpCircle size={20} className="text-green-400" />
                                                    : <ArrowDownCircle size={20} className="text-red-400" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-white font-medium text-sm truncate">{tx.description}</p>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                            {tx.user_name && (
                                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                                    <User size={10} /> {tx.user_name}
                                                                </span>
                                                            )}
                                                            <span className="text-gray-600 text-xs">
                                                                oleh {tx.recorded_by_name}
                                                            </span>
                                                            <span className="text-gray-600 text-xs flex items-center gap-1">
                                                                <Calendar size={10}/> {formatDate(tx.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className={`font-bold text-sm flex-shrink-0 ${tx.type === 'pemasukan' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.type === 'pemasukan' ? '+' : '-'}{formatRupiah(tx.amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Mobile FAB */}
            {canAdd && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-yellow-400 text-black rounded-full shadow-lg hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center border-2 border-black"
                    aria-label="Tambah Transaksi"
                >
                    <Plus size={28} />
                </button>
            )}

            {/* Add Transaction Modal */}
            <div className="relative z-50">
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 flex-shrink-0">
                                <Plus className="text-yellow-400" /> Tambah Transaksi
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                {/* Type Toggle */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Jenis Transaksi</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormType('pemasukan')}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${formType === 'pemasukan'
                                                ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                                                : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                                                }`}
                                        >
                                            <ArrowUpCircle size={16} className="inline mr-1.5 -mt-0.5" />
                                            Pemasukan Kas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormType('pengeluaran')}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${formType === 'pengeluaran'
                                                ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                                                : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                                                }`}
                                        >
                                            <ArrowDownCircle size={16} className="inline mr-1.5 -mt-0.5" />
                                            Pengeluaran
                                        </button>
                                    </div>
                                </div>

                                {/* KONDISI JIKA PEMASUKAN */}
                                {formType === 'pemasukan' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Kas Untuk Bulan</label>
                                                <select 
                                                    value={formTargetMonth}
                                                    onChange={(e) => setFormTargetMonth(e.target.value)}
                                                    className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm focus:border-yellow-400 focus:outline-none transition-colors"
                                                >
                                                    {availableMonths.map(m => (
                                                        <option key={m.value} value={m.value}>{m.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Nominal Bayar</label>
                                                <select 
                                                    value={amountPreset}
                                                    onChange={(e) => setAmountPreset(e.target.value)}
                                                    className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm focus:border-yellow-400 focus:outline-none transition-colors"
                                                >
                                                    <option value="5000">Rp 5.000 (1 Mg)</option>
                                                    <option value="10000">Rp 10.000 (2 Mg)</option>
                                                    <option value="15000">Rp 15.000 (3 Mg)</option>
                                                    <option value="20000">Rp 20.000 (Lunas)</option>
                                                    <option value="custom">Nominal Lain...</option>
                                                </select>
                                            </div>
                                        </div>

                                        {amountPreset === 'custom' && (
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Jumlah Custom (Rp)</label>
                                                <input
                                                    type="number"
                                                    value={formAmount}
                                                    onChange={(e) => setFormAmount(e.target.value)}
                                                    className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                                    placeholder="Contoh: 30000"
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm text-gray-400">
                                                    Pilih Mahasiswa ({selectedNims.length} dipilih)
                                                </label>
                                            </div>
                                            
                                            <div className="relative mb-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Cari Nama / NIM yg blm lunas..." 
                                                    value={searchUser}
                                                    onChange={(e) => setSearchUser(e.target.value)}
                                                    className="w-full bg-black/50 border border-gray-700 rounded p-2 pl-9 text-sm text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                                />
                                                <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                                            </div>

                                            <div className="border border-gray-700 rounded-lg bg-black/30 overflow-hidden">
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                                    {filteredModalUsers.length === 0 ? (
                                                        <div className="text-gray-500 text-xs text-center py-4 flex flex-col items-center">
                                                            <span>✨</span>
                                                            <span className="mt-1">Tidak ada / Semua sudah lunas!</span>
                                                        </div>
                                                    ) : (
                                                        filteredModalUsers.map(user => (
                                                            <label key={user.nim} className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors border border-transparent hover:border-gray-700">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedNims.includes(user.nim)}
                                                                    onChange={() => toggleUserSelection(user.nim)}
                                                                    className="w-4 h-4 rounded text-yellow-400 bg-gray-900 border-gray-600 focus:ring-yellow-500 cursor-pointer"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-sm truncate">{user.name}</p>
                                                                </div>
                                                                <p className="text-orange-400 text-[10px] font-bold">
                                                                    SISA: {formatRupiah(user.remaining)}
                                                                </p>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* KONDISI JIKA PENGELUARAN */
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Jumlah (Rp)</label>
                                            <input
                                                type="number"
                                                value={formAmount}
                                                onChange={(e) => setFormAmount(e.target.value)}
                                                className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                                placeholder="Contoh: 50000"
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                                            <input
                                                type="text"
                                                value={formDescription}
                                                onChange={(e) => setFormDescription(e.target.value)}
                                                className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                                placeholder="Contoh: Beli konsumsi rapat"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-2 pt-4 flex-shrink-0 mt-auto">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                                Menyimpan...
                                            </>
                                        ) : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Finance;