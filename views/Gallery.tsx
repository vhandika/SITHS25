import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Link as LinkIcon, User, Camera, Folder, Trash2, Loader } from 'lucide-react';
import SkewedButton from '../components/SkewedButton';
import { fetchWithAuth } from '../src/utils/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

interface GalleryItem {
    id: number;
    title: string;
    drive_link: string;
    user_name: string;
    user_nim: string;
    created_at: string;
}

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
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

const Gallery: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserNIM = getCookie('userNIM');
    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const API_URL = `${API_BASE_URL}/gallery`;

    const fetchGallery = async () => {
        try {
            const res = await fetch(API_URL, {
                headers: {}, credentials: 'include'
            });
            const json = await res.json();
            if (res.ok) {
                setItems(json.data);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUserNIM) {
            navigate('/login');
            return;
        }
        fetchGallery();
    }, [currentUserNIM, navigate]);

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        const token = getCookie('userToken');

        try {
            const res = await fetchWithAuth(API_URL, {
                method: 'POST',
                body: JSON.stringify({ title, drive_link: link })
            });
            const data = await res.json();
            if (res.ok) {
                setTitle('');
                setLink('');
                setIsModalOpen(false);
                fetchGallery();
                showToast('Berhasil upload link!', 'success');
            } else {
                showToast(data.message || 'Gagal upload', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi ke server', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Apakah Anda yakin ingin menghapus folder ini?")) return;

        const token = getCookie('userToken');
        try {
            const res = await fetchWithAuth(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Folder berhasil dihapus', 'success');
                fetchGallery();
            } else {
                showToast(data.message || 'Gagal menghapus folder', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error');
        }
    };

    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
            
            <ParticleBackground />

            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><Camera size={32} /></span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl drop-shadow-md">Gallery</h1>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <SkewedButton onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
                            Upload Link
                        </SkewedButton>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.length === 0 ? (
                            <div className="col-span-full text-center text-gray-400 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl py-10 shadow-lg">
                                Belum ada folder yang diupload.
                            </div>
                        ) : (
                            items.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.drive_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex flex-col items-center justify-start text-center p-6 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-lg hover:border-yellow-400/50 hover:bg-gray-800/80 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] transition-all duration-300"
                                >
                                    {currentUserNIM === item.user_nim && (
                                        <button
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className="absolute top-2 right-2 z-20 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            title="Hapus Folder"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                    <div className="w-24 h-24 mb-4 flex items-center justify-center">
                                        <Folder
                                            strokeWidth={1}
                                            className="w-full h-full text-gray-400 transition-colors duration-300 group-hover:text-yellow-400 drop-shadow-md"
                                        />
                                    </div>

                                    <div className="w-full space-y-2 overflow-hidden">
                                        <h3
                                            className="text-white text-lg font-bold leading-snug group-hover:text-yellow-400 transition-colors w-full overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        >
                                            {item.title}
                                        </h3>

                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest border-t border-gray-800/80 pt-2 mt-2 w-full">
                                            <User size={10} className="shrink-0 text-yellow-500" />
                                            <span
                                                className="overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
                                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            >
                                                {item.user_name || item.user_nim}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-yellow-400 text-black rounded-full shadow-lg hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center border-2 border-black"
                aria-label="Upload Link"
            >
                <Plus size={28} />
            </button>

            <div className="relative z-50">
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6 relative shadow-2xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Plus className="text-yellow-400" /> Tambah Folder
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nama Folder</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Link Google Drive</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded p-2 pl-9 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 disabled:opacity-50 transition-colors">
                                        {isSubmitting ? 'Uploading...' : 'Simpan'}
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

export default Gallery;