import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, HelpCircle, CornerDownRight, Loader, X, Trash2, Palette } from 'lucide-react';
import SkewedButton from '../components/SkewedButton';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || !hex.startsWith('#')) return `rgba(31, 41, 55, ${alpha})`; // fallback bg-gray-800
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

const QnABoard = () => {
    const { showToast } = useToast();
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUserNIM = getCookie('userNIM');
    const userRole = getCookie('userRole');

    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'ask' | 'answer'; activeId: string | null }>({
        isOpen: false,
        type: 'ask',
        activeId: null
    });
    
    const [formData, setFormData] = useState({ 
        text: '', 
        isAnonymous: false,
        bgColor: '#1e3a8a', 
        textColor: '#ffffff' 
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchQnA = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/qna`, { credentials: 'include' });
            const json = await res.json();
            if (res.ok) setNotes(json.data);
        } catch (error) {
            showToast('Gagal memuat papan Q&A', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQnA();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            let endpoint = `${API_BASE_URL}/qna`;
            let method = 'POST';
            
            let bodyData: any = { 
                question: formData.text, 
                is_anonymous: formData.isAnonymous,
                bg_color: formData.bgColor,
                text_color: formData.textColor
            };

            if (modalConfig.type === 'answer' && modalConfig.activeId) {
                endpoint = `${API_BASE_URL}/qna/${modalConfig.activeId}/answer`;
                method = 'POST';
                bodyData = { 
                    answer: formData.text,
                    bg_color: formData.bgColor,
                    text_color: formData.textColor
                };
            }

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('userToken')}` 
                },
                credentials: 'include',
                body: JSON.stringify(bodyData)
            });

            const json = await res.json();

            if (res.ok) {
                showToast(modalConfig.type === 'ask' ? 'Pertanyaan terkirim!' : 'Jawaban tersimpan!', 'success');
                setModalConfig({ isOpen: false, type: 'ask', activeId: null });
                setFormData({ text: '', isAnonymous: false, bgColor: '#1e3a8a', textColor: '#ffffff' });
                fetchQnA();
            } else {
                showToast(json.message || 'Gagal memproses', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Cabut catatan ini (beserta semua jawabannya) dari mading?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/qna/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getCookie('userToken')}` },
                credentials: 'include'
            });
            
            if (res.ok) {
                showToast('Catatan berhasil dicabut', 'success');
                fetchQnA();
            } else {
                const json = await res.json();
                showToast(json.message || 'Gagal menghapus catatan', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error');
        }
    };

    const openModal = (type: 'ask' | 'answer', id: string | null = null) => {
        setModalConfig({ isOpen: true, type, activeId: id });
        if (type === 'answer') {
            setFormData({ text: '', isAnonymous: false, bgColor: '#000000', textColor: '#fef08a' }); // Hitam & Kuning
        } else {
            setFormData({ text: '', isAnonymous: false, bgColor: '#1e3a8a', textColor: '#ffffff' }); // Biru Gelap & Putih
        }
    };

    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
            <ParticleBackground />

            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><MessageSquare size={24} /></span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl drop-shadow-md">Q&A Board</h1>
                            <p className="text-gray-400 mt-1 font-mono text-sm tracking-wide">DROP YOUR QUESTIONS HERE</p>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <SkewedButton onClick={() => openModal('ask')} icon={<Plus size={18} />}>
                            Tanya Sesuatu
                        </SkewedButton>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {notes.length === 0 ? (
                            <div className="col-span-full text-center text-gray-400 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl py-10 shadow-lg">
                                Belum ada pertanyaan. Jadilah yang pertama bertanya!
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div key={note.id} className="relative flex flex-col mb-4 group">
                                    
                                    <div 
                                        className={`p-6 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-xl transform ${note.q_rotate || '-rotate-1'} z-10 w-[85%] self-start relative transition-all duration-300 hover:scale-[1.02]`}
                                        style={{ 
                                            backgroundColor: hexToRgba(note.q_color, 0.75), 
                                            color: note.q_text_color || '#e5e7eb'
                                        }}
                                    >
                                        <div className="absolute top-4 left-4 opacity-50">
                                            <HelpCircle size={20} color={note.q_text_color || '#fbbf24'} />
                                        </div>
                                        
                                        {(currentUserNIM === note.q_nim || userRole === 'admin' || userRole === 'dev') && (
                                            <button 
                                                onClick={() => handleDelete(note.id)}
                                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                                style={{ color: note.q_text_color || '#9ca3af' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                        <p className="leading-relaxed font-medium mt-6 text-sm whitespace-pre-line">
                                            "{note.question}"
                                        </p>
                                        <p className="text-right text-xs font-mono mt-4 opacity-70">
                                            {note.q_author}
                                        </p>
                                    </div>

                                    {note.answers && note.answers.length > 0 ? (
                                        <div className="flex flex-col w-[85%] self-end -mt-8 sm:-mt-12 relative z-20">
                                            {note.answers.map((ans: any, index: number) => (
                                                <div 
                                                    key={ans.id}
                                                    className={`p-5 backdrop-blur-xl border border-yellow-500/20 rounded-lg shadow-2xl transform ${ans.rotate || 'rotate-2'} relative transition-all duration-300 hover:scale-[1.02] hover:z-50`}
                                                    style={{ 
                                                        backgroundColor: hexToRgba(ans.bg_color, 0.85), 
                                                        color: ans.text_color || '#ffffffff',
                                                        marginTop: index === 0 ? '0' : '-16px', 
                                                        marginLeft: `-${index * 8}px`, 
                                                        zIndex: 20 + index
                                                    }}
                                                >
                                                    <div className="absolute top-3 left-3 opacity-40">
                                                        <CornerDownRight size={16} color={ans.text_color || '#eab308'} />
                                                    </div>
                                                    <p className="leading-relaxed font-medium text-sm mt-4 whitespace-pre-line opacity-90">
                                                        {ans.answer}
                                                    </p>
                                                    <p className="text-right text-xs font-bold mt-4 tracking-wider opacity-80">
                                                        @ {ans.a_author}
                                                    </p>
                                                </div>
                                            ))}
                                            
                                            <div className="mt-4 flex justify-end relative z-[60]">
                                                <button 
                                                    onClick={() => openModal('answer', note.id)}
                                                    className="bg-gray-800/80 backdrop-blur-md border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg shadow-md text-[10px] uppercase tracking-wider font-bold hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all rotate-1 flex items-center gap-1.5"
                                                >
                                                    <Plus size={12} /> Ikut Nimbrung
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="self-end w-[85%] -mt-6 z-20 flex justify-end">
                                            <button 
                                                onClick={() => openModal('answer', note.id)}
                                                className="bg-gray-800/80 backdrop-blur-md border border-gray-600 text-gray-300 px-4 py-2 rounded-lg shadow-lg text-xs font-bold hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all rotate-2 flex items-center gap-2"
                                            >
                                                <Plus size={14} /> Bantu Jawab
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => openModal('ask')}
                className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-yellow-400 text-black rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center border-2 border-black"
            >
                <Plus size={28} />
            </button>

            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl p-6 relative shadow-2xl">
                        <button
                            onClick={() => setModalConfig({ isOpen: false, type: 'ask', activeId: null })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            {modalConfig.type === 'ask' ? <HelpCircle className="text-yellow-400" /> : <MessageSquare className="text-yellow-400" />}
                            {modalConfig.type === 'ask' ? 'Tanya Sesuatu' : 'Bantu Jawab'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full border rounded-lg p-4 focus:outline-none transition-colors resize-none min-h-[120px]"
                                    style={{ 
                                        backgroundColor: hexToRgba(formData.bgColor, 0.5), 
                                        color: formData.textColor,
                                        borderColor: formData.textColor + '40'
                                    }}
                                    placeholder={modalConfig.type === 'ask' ? "Ketik pertanyaanmu di sini..." : "Ketik jawaban atau tambahan info..."}
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Palette size={12}/> Warna Kertas</label>
                                    <div className="flex items-center gap-2 bg-black/50 border border-gray-700 rounded-lg p-1.5 px-3">
                                        <input
                                            type="color"
                                            value={formData.bgColor}
                                            onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <span className="text-gray-300 text-xs font-mono">{formData.bgColor}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Palette size={12}/> Warna Teks</label>
                                    <div className="flex items-center gap-2 bg-black/50 border border-gray-700 rounded-lg p-1.5 px-3">
                                        <input
                                            type="color"
                                            value={formData.textColor}
                                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <span className="text-gray-300 text-xs font-mono">{formData.textColor}</span>
                                    </div>
                                </div>
                            </div>

                            {modalConfig.type === 'ask' && (
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-gray-900"
                                    />
                                    Kirim sebagai Anonim
                                </label>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button 
                                    type="button" 
                                    onClick={() => setModalConfig({ isOpen: false, type: 'ask', activeId: null })} 
                                    className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="flex-1 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <Loader size={18} className="animate-spin" /> : null}
                                    {modalConfig.type === 'ask' ? 'Tanya Sekarang' : 'Kirim Jawaban'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QnABoard;