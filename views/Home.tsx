import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SkewedButton from '../components/SkewedButton';
import { BookOpen, Pen, Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticleBackground from '../components/ParticleBackground';
import { useTheme } from '../contexts/ThemeContext';

interface User {
    name: string;
    birthday: string | null;
    avatar_url?: string;
}

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const Home: React.FC = () => {
    const navigate = useNavigate();
    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const { theme } = useTheme();

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) * 0.12;
        const y = (e.clientY - top - height / 2) * 0.12;
        setMousePos({ x, y });
    };

    const [birthdayUsers, setBirthdayUsers] = useState<User[]>([]);
    const [showBirthdayModal, setShowBirthdayModal] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchBirthdays = async () => {
            const userNIM = getCookie('userNIM');
            if (!userNIM) {
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/birthdays`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.data && Array.isArray(data.data)) {
                    setBirthdayUsers(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch birthdays", error);
            }
        };
        fetchBirthdays();
    }, []);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/HBD.mp3');
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.loop = true;
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const colors = ['#FACC15', '#FFFFFF', '#000000', '#ff0000ff', '#00eeffff'];

        (function frame() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: Math.random(), y: 0 },
                colors: colors,
                zIndex: 60
            });

            requestAnimationFrame(frame);
        }());
    };

    const handleOpenModal = () => {
        setShowBirthdayModal(true);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }

        triggerConfetti();
    };

    const handleCloseModal = () => {
        setShowBirthdayModal(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={`relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
        >
            <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-br from-white via-rose-50/70 to-emerald-50/70' : 'bg-gradient-to-br from-gray-900 via-black to-gray-800'}`} />
            <ParticleBackground />
            {theme === 'dark' && <div className="absolute inset-0 bg-black/50"></div>}

            <div className="relative z-10 flex flex-col items-center p-4 text-center">
                <div className="mb-8 flex flex-col items-center relative group">
                    <img
                        src="/logo.webp"
                        alt="SITH-S 25 Logo"
                        className="h-64 w-64 object-contain md:h-80 md:w-80 lg:h-[480px] lg:w-[480px] transition-all duration-1000 hover:scale-[1.02] active:scale-95 cursor-default"
                    />
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:hidden">
                    <SkewedButton icon={<BookOpen />} onClick={() => navigate('/library')}>
                        Library
                    </SkewedButton>
                    <SkewedButton
                        variant="secondary"
                        icon={<Pen />}
                        href="https://forms.gle/cztnRJPFPX34NHEX6"
                        target="_blank"
                    >
                        Ada saran?
                    </SkewedButton>
                </div>
            </div>

            {
                birthdayUsers.length > 0 && (
                    <div className="absolute bottom-5 left-5 z-30 animate-bounce">
                        <button
                            onClick={handleOpenModal}
                            className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-105 transition-transform border-2 border-white/20 text-sm"
                        >
                            <Gift size={18} className="animate-pulse shrink-0" />
                            <span>Ada yang Ulang Tahun!</span>
                        </button>
                    </div>
                )
            }

            {
                showBirthdayModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                        <div className="relative w-full max-w-sm bg-gray-900 border border-yellow-400 rounded-xl p-8 text-center shadow-[0_0_50px_rgba(250,204,21,0.2)] animate-pop-in">

                            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 mt-2">Happy Birthday!</h2>
                            <p className="text-gray-400 mb-8 text-sm">Selamat ulang tahun yaa buat:</p>

                            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto px-2">
                                {birthdayUsers.map((user, index) => (
                                    <div key={index} className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="text-xl font-bold text-white tracking-wide">{user.name}</h3>
                                        <p className="text-sm text-yellow-400 mt-1 italic">Wish you all the best!</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                @keyframes popUp {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-pop-in { animation: popUp 0.3s ease-out forwards; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                /* ...existing code... */
            `}</style>
        </div >
    );
};

export default Home;
