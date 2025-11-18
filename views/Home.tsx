import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SkewedButton from '../components/SkewedButton';
import { BookOpen, Pen, ImagePlus } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [backgroundImageUrl, setBackgroundImageUrl] = useState("https://www.google.com/imgres?q=ITB&imgurl=https%3A%2F%2Fitb.ac.id%2Ffiles%2Fcover%2F170125-Kolam-Intel.jpg&imgrefurl=https%3A%2F%2Fitb.ac.id%2Fabout-itb&docid=HnicH_NtFv5m9M&tbnid=9d9CxSYVc2rjZM&vet=12ahUKEwiC8bKSwvuQAxUtTGwGHdYHHegQM3oECBgQAA..i&w=1000&h=668&hcb=2&ved=2ahUKEwiC8bKSwvuQAxUtTGwGHdYHHegQM3oECBgQAA");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Muat gambar latar belakang dari local storage saat komponen dimuat
    useEffect(() => {
        const storedImage = localStorage.getItem('homeBackgroundImage');
        if (storedImage) {
            setBackgroundImageUrl(storedImage);
        }
    }, []);

    // Menangani unggahan gambar baru
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem('homeBackgroundImage', base64String);
                setBackgroundImageUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
                style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60"></div>
                {/* Yellow accent shapes */}
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-yellow-400/10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-yellow-400/5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center p-4 text-center">
                <div className="absolute -top-12 left-0 right-0 mx-auto w-40 border-t-2 border-yellow-400"></div>
                
                <h1 className="text-5xl font-bold uppercase tracking-widest text-white drop-shadow-lg md:text-7xl lg:text-8xl">
                    <span className="text-yellow-400">SITH-S</span> 25
                </h1>
                <p className="mt-4 max-w-lg text-lg text-gray-200 drop-shadow-md">
                    Hai haii... ntah mau yapping apa XD
                </p>
                
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <SkewedButton icon={<BookOpen />} onClick={() => navigate('/library')}>
                        Library
                    </SkewedButton>
                    <SkewedButton 
                        variant="secondary" 
                        icon={<Pen />} 
                        href="https://youtu.be/K4xLi8IF1FM?si=gazvlgeBaVrsB7ys" // Placeholder Google Forms link
                        target="_blank"
                    >
                        Ada saran?
                    </SkewedButton>
                </div>
            </div>
            
            {/* Background Upload Elements */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="bg-upload"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="group absolute bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-yellow-400/90 hover:pr-4 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Change background image"
                title="Ganti gambar background"
            >
                <ImagePlus className="h-6 w-6" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out group-hover:max-w-xs">
                    Ganti Background
                </span>
            </button>
        </div>
    );
};

export default Home;