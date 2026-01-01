import React, { useState, useEffect, useRef } from 'react';
import { Users, ChevronRight, Instagram, ChevronLeft } from 'lucide-react';

const bannerImages = [
    "rem.png"
];

interface Activity {
    id: number;
    title: string;
    date: string;
    description: string;
    imageUrl: string;
}

const activitiesData: Activity[] = [
    {
        id: 1,
        title: "Gak tahu",
        date: "10 Desember 2025",
        description: "Pada zaman dahulu kala, ada dua ekor kucing, anjing, ayam, bebek yang ingin menyebrang ke ujung sungai yang lega. Awalnya mereka kesulitan, namun dengan bantuan si kancil dan buaya, mereka bisa menyebrangi sungai dengan aman dan selamat. Yaaaa aku juga gak tahu mau yapping apalagi, gabut, bosan, ngantuk, aaaakgh, pengen pulang, tapi belom nyuci.",
        imageUrl: "/images/kegiatan-1.jpg"
    },
    {
        id: 2,
        title: "Tak tahu",
        date: "10 Desember 2025",
        description: "Pada zaman dahulu kala, ada dua ekor kucing, anjing, ayam, bebek yang ingin menyebrang ke ujung sungai yang lega. Awalnya mereka kesulitan, namun dengan bantuan si kancil dan buaya, mereka bisa menyebrangi sungai dengan aman dan selamat. Yaaaa aku juga gak tahu mau yapping apalagi, gabut, bosan, ngantuk, aaaakgh, pengen pulang, tapi belom nyuci.",
        imageUrl: "/images/kegiatan-1.jpg"
    }
];

const About: React.FC = () => {
    const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
    const [selectedActivity, setSelectedActivity] = useState<Activity>(activitiesData[0]);
    const [currentBanner, setCurrentBanner] = useState(0);
    const aboutRef = useRef<HTMLDivElement>(null);
    const visionRef = useRef<HTMLDivElement>(null);
    const missionRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const detailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px" };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                setVisibleSections(prev => ({ ...prev, [entry.target.id]: entry.isIntersecting }));
            });
        }, observerOptions);

        if (aboutRef.current) observer.observe(aboutRef.current);
        if (visionRef.current) observer.observe(visionRef.current);
        if (missionRef.current) observer.observe(missionRef.current);
        if (timelineRef.current) observer.observe(timelineRef.current);

        return () => observer.disconnect();
    }, []);

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setTimeout(() => {
            detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const nextBanner = () => setCurrentBanner((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    const prevBanner = () => setCurrentBanner((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));

    useEffect(() => {
        const interval = setInterval(nextBanner, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
            <div className="mx-auto max-w-7xl text-center mb-16">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                            <span className="transform skew-x-12"><Users size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">About Us</h1>
                    </div>
                </div>
                <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>
            </div>

            <div className="relative w-full max-w-6xl mx-auto h-[220px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl border border-gray-800 shadow-2xl group mb-16 px-4 md:px-0">
                <div
                    className="flex h-full transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                >
                    {bannerImages.map((src, index) => (
                        <div key={index} className="w-full flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
                            <img src={src} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <button onClick={prevBanner} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 p-1 md:p-2 rounded-full text-white hover:bg-yellow-400 hover:text-black">
                    <ChevronLeft size={24} className="md:w-8 md:h-8" />
                </button>
                <button onClick={nextBanner} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 p-1 md:p-2 rounded-full text-white hover:bg-yellow-400 hover:text-black">
                    <ChevronRight size={24} className="md:w-8 md:h-8" />
                </button>
            </div>

            <div
                id="about"
                ref={aboutRef}
                className={`mx-auto max-w-4xl px-6 pb-16 text-center transition-all duration-1000 ease-out transform ${visibleSections['about'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <h2 className="mb-6 text-2xl md:text-4xl font-bold uppercase tracking-widest text-white">
                    Tentang <span className="text-yellow-400">SITH-S</span>
                </h2>
                <p className="text-sm md:text-xl leading-relaxed text-gray-300 text-justify md:text-center">
                    Sekolah Ilmu dan Teknologi Hayati - Program Sains (SITH-S) adalah jurusan wibu.
                </p>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8 md:py-24 flex flex-col gap-12 md:gap-24">
                <div
                    id="vision"
                    ref={visionRef}
                    className={`flex flex-col md:flex-row md:w-2/3 self-start gap-4 md:gap-6 transition-all duration-1000 ease-out transform ${visibleSections['vision'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                >
                    <div className="flex items-center gap-4 md:block">
                        <h3 className="text-2xl font-bold uppercase tracking-wide text-yellow-400 md:hidden">Visi</h3>
                    </div>
                    <div>
                        <h3 className="hidden md:block text-3xl font-bold uppercase tracking-wide text-yellow-400 mb-4">Visi</h3>
                        <p className="text-base md:text-xl text-gray-300 leading-relaxed border-l-2 border-gray-700 pl-4">
                            "Wibu wibu wibu"
                        </p>
                    </div>
                </div>

                <div
                    id="mission"
                    ref={missionRef}
                    className={`flex flex-col md:flex-row-reverse md:w-2/3 self-end gap-4 md:gap-6 transition-all duration-1000 delay-300 ease-out transform ${visibleSections['mission'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                >
                    <div className="flex items-center gap-4 md:block">
                        <h3 className="text-2xl font-bold uppercase tracking-wide text-yellow-400 md:hidden">Misi</h3>
                    </div>
                    <div className="text-left md:text-right">
                        <h3 className="hidden md:block text-3xl font-bold uppercase tracking-wide text-yellow-400 mb-4">Misi</h3>
                        <ul className="space-y-3 md:space-y-4 text-base md:text-lg text-gray-300">
                            <li className="flex items-center md:justify-end gap-3">
                                <ChevronRight className="text-yellow-400 h-4 w-4 md:hidden" />
                                <span>ntah</span>
                                <ChevronRight className="hidden md:block text-yellow-400 h-5 w-5" />
                            </li>
                            <li className="flex items-center md:justify-end gap-3">
                                <ChevronRight className="text-yellow-400 h-4 w-4 md:hidden" />
                                <span>ntah</span>
                                <ChevronRight className="hidden md:block text-yellow-400 h-5 w-5" />
                            </li>
                            <li className="flex items-center md:justify-end gap-3">
                                <ChevronRight className="text-yellow-400 h-4 w-4 md:hidden" />
                                <span>ntah</span>
                                <ChevronRight className="hidden md:block text-yellow-400 h-5 w-5" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="timeline" ref={timelineRef} className="py-12 bg-black overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 mb-4 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase text-center mb-10">
                        <span className="text-yellow-400">Roadmap</span> Kegiatan
                    </h2>

                    <div className="block md:hidden relative px-4">
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-800 rounded-full"></div>

                        <div className="flex flex-col gap-8">
                            {activitiesData.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    className="relative pl-12 cursor-pointer group"
                                    onClick={() => handleActivityClick(activity)}
                                >
                                    <div className={`absolute left-[29px] top-4 w-4 h-4 rounded-full border-2 z-10 transition-colors ${selectedActivity.id === activity.id ? 'bg-yellow-400 border-yellow-400' : 'bg-black border-gray-600'
                                        }`}></div>

                                    <div className={`border-l-2 p-4 rounded-r-lg bg-white/5 transition-all ${selectedActivity.id === activity.id ? 'border-yellow-400 bg-white/10' : 'border-gray-700'
                                        }`}>
                                        <div className="flex gap-4 items-start">
                                            <img src={activity.imageUrl} alt={activity.title} className="w-16 h-16 object-cover rounded bg-gray-800" />
                                            <div>
                                                <span className="text-xs font-bold text-yellow-400 block mb-1">{activity.date}</span>
                                                <h4 className="text-sm font-bold text-white uppercase">{activity.title}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:block relative w-full overflow-x-auto pb-4 scrollbar-hide">
                        <div
                            className="relative h-[450px] px-12"
                            style={{ minWidth: `${Math.max(1000, activitiesData.length * 320)}px` }}
                        >
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full mx-12" style={{ width: 'calc(100% - 6rem)' }}></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-yellow-400 -translate-y-1/2 rounded-full transition-all duration-[2000ms] ease-in-out mx-12"
                                style={{ width: visibleSections['timeline'] ? 'calc(100% - 6rem)' : '0%' }}
                            ></div>

                            <div className="absolute inset-0 flex items-center px-12">
                                {activitiesData.map((activity, index) => {
                                    const isTop = index % 2 === 0;
                                    return (
                                        <div
                                            key={activity.id}
                                            className={`relative w-[320px] flex-shrink-0 h-full flex justify-center transition-all duration-1000 transform ${visibleSections['timeline'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                                }`}
                                            style={{ transitionDelay: visibleSections['timeline'] ? `${index * 300 + 300}ms` : '0ms' }}
                                        >
                                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-20 transition-all duration-300 ${selectedActivity.id === activity.id ? 'bg-yellow-400 border-yellow-400 scale-150' : 'bg-black border-gray-600'
                                                }`}></div>

                                            <div
                                                className={`absolute flex flex-col items-center cursor-pointer group w-full ${isTop ? 'bottom-[50%] pb-8' : 'top-[50%] pt-8'}`}
                                                onClick={() => handleActivityClick(activity)}
                                            >
                                                <svg className={`absolute left-0 w-full pointer-events-none ${isTop ? 'bottom-0 h-8' : 'top-0 h-8'}`}>
                                                    {isTop ? (
                                                        <path d="M 160,0 L 160,12 L 160,32" fill="none" stroke={selectedActivity.id === activity.id ? "#FACC15" : "#4B5563"} strokeWidth="1.5" />
                                                    ) : (
                                                        <path d="M 160,32 L 160,20 L 160,0" fill="none" stroke={selectedActivity.id === activity.id ? "#FACC15" : "#4B5563"} strokeWidth="1.5" />
                                                    )}
                                                </svg>

                                                <div className={`relative w-64 h-36 rounded-lg overflow-hidden border bg-black transition-all duration-300 z-30 ${selectedActivity.id === activity.id ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105' : 'border-gray-800 group-hover:border-yellow-400 group-hover:scale-105'
                                                    }`}>
                                                    <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-0 left-0 w-full bg-black/80 py-1 text-center">
                                                        <p className="text-xs font-bold text-yellow-400">{activity.date}</p>
                                                    </div>
                                                </div>

                                                <div className={`absolute left-1/2 -translate-x-1/2 w-[300px] text-center px-2 z-40 ${isTop ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
                                                    <p className={`text-sm font-bold uppercase tracking-wider transition-colors drop-shadow-md bg-black/50 backdrop-blur-sm rounded py-1 ${selectedActivity.id === activity.id ? 'text-yellow-400' : 'text-gray-300 group-hover:text-white'
                                                        }`}>
                                                        {activity.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={detailRef} className="relative min-h-[400px] md:min-h-[600px] w-full border-t border-yellow-400/20 py-12 md:py-24 bg-black">
                <div className="container relative z-10 mx-auto px-6">
                    <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:items-center">
                        <div className="w-full lg:w-3/5">
                            <div className="relative overflow-hidden rounded-xl border border-yellow-400/30 shadow-2xl">
                                <div className="absolute inset-0 bg-yellow-400/10 mix-blend-overlay"></div>
                                <img
                                    key={selectedActivity.imageUrl}
                                    src={selectedActivity.imageUrl}
                                    alt="Detail"
                                    className="h-[250px] md:h-[400px] lg:h-[500px] w-full object-cover animate-fade-in"
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-2/5">
                            <div className="border-l-2 border-yellow-400 pl-4 md:pl-6 animate-slide-up">
                                <span className="mb-2 block text-sm md:text-xl font-bold uppercase tracking-widest text-yellow-400">
                                    {selectedActivity.date}
                                </span>
                                <h2 className="mb-4 md:mb-6 text-2xl md:text-5xl font-bold text-white">
                                    {selectedActivity.title}
                                </h2>
                                <p className="text-sm md:text-lg leading-relaxed text-gray-300">
                                    {selectedActivity.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-12 border-t border-gray-800 pt-12 pb-8 text-center text-gray-500">
                <span className="text-2xl md:text-4xl font-bold tracking-[.2em] text-gray-700 block mb-4">SITH-S 25</span>
                <p className="text-xs mb-6">Copyright © SITES Angkatan 25.</p>
                <div className="flex justify-center">
                    <a href="https://www.instagram.com/sithsitb25?igsh=Mmg2Nm43aW4zYW91" target="_blank" rel="noopener noreferrer" className="text-gray-500 transition-colors duration-300 hover:text-white">
                        <Instagram size={20} />
                    </a>
                </div>
            </footer>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slide-up { animation: slideUp 0.5s ease-out 0.2s forwards; opacity: 0; }
            `}</style>
        </div>
    );
};

export default About;
