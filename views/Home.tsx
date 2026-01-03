import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SkewedButton from '../components/SkewedButton';
import { BookOpen, Pen, ImagePlus, Trash2, Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    const [bgLoaded, setBgLoaded] = useState(false);
    const HD_BG = "https://itb.ac.id/files/cover/170125-Kolam-Intel.jpg";
    const API_BASE_URL = 'https://api.sith-s25.my.id/api';
    const savedBg = localStorage.getItem('homeBackgroundImage');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState(savedBg || HD_BG);

    const [birthdayUsers, setBirthdayUsers] = useState<User[]>([]);
    const [showBirthdayModal, setShowBirthdayModal] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isCustomBackground = !!savedBg;

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
        const img = new Image();
        img.src = backgroundImageUrl;
        img.onload = () => {
            setBgLoaded(true);
        };
    }, [backgroundImageUrl]);

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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem('homeBackgroundImage', base64String);
                setBackgroundImageUrl(base64String);
                setBgLoaded(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundAction = () => {
        if (isCustomBackground) {
            localStorage.removeItem('homeBackgroundImage');
            setBackgroundImageUrl(HD_BG);
            setBgLoaded(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden selection:bg-yellow-400 selection:text-black bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />

            <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-yellow-400/10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-yellow-400/5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center p-4 text-center">
                <div className="absolute -top-8 left-0 right-0 mx-auto w-40 border-t-2 border-yellow-400"></div>

                <h1 className="text-5xl font-bold uppercase tracking-widest text-white drop-shadow-lg md:text-7xl lg:text-8xl">
                    <span className="text-yellow-400">SITH-S</span> 25
                </h1>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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

            {birthdayUsers.length > 0 && (
                <div className="absolute bottom-5 left-5 z-30 animate-bounce">
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-105 transition-transform border-2 border-white/20 text-sm"
                    >
                        <Gift size={18} className="animate-pulse shrink-0" />
                        <span>Ada yang Ulang Tahun!</span>
                    </button>
                </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" id="bg-upload" />

            <button
                onClick={handleBackgroundAction}
                className="group absolute bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-yellow-400/90 hover:pr-4 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
                title={isCustomBackground ? "Reset background ke default" : "Ganti gambar background"}
            >
                {isCustomBackground ? <Trash2 className="h-6 w-6" /> : <ImagePlus className="h-6 w-6" />}
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out group-hover:max-w-xs">
                    {isCustomBackground ? "Hapus Background" : "Ganti Background"}
                </span>
            </button>

            {showBirthdayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-sm bg-gray-900 border border-yellow-400 rounded-xl p-8 text-center shadow-[0_0_50px_rgba(250,204,21,0.2)] animate-pop-in">

                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 mt-2">Happy Birthday!</h2>
                        <p className="text-gray-400 mb-8 text-sm">Selamat ulang tahun yaa buat:</p>

                        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scrollbar px-2">
                            {birthdayUsers.map((user, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg">
                                    <h3 className="text-xl font-bold text-white tracking-wide">{user.name}</h3>
                                    <p className="text-sm text-yellow-400 mt-1 italic">Wish you all the best!</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes popUp {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-pop-in { animation: popUp 0.3s ease-out forwards; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Home;
