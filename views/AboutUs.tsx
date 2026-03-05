import React, { useState, useEffect, useRef } from 'react';
import { Users, ChevronRight, Instagram, ChevronLeft } from 'lucide-react';

const bannerImages = [
    "BG1.webp"
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
        title: "Ecosites",
        date: "03 Oktober 2025",
        description: "Ecology Social Initiative and Technology (ECOSITES) merupakan proyek aksi angkatan SITH-S/C’25 yang berfokus pada pengembangan pola pikir kritis terhadap isu lingkungan, khususnya dalam pengelolaan sampah organik di kawasan Jatinangor. Melalui inisiatif ini, kami menekankan pentingnya validasi data lapangan dan penelusuran sumber primer guna menghindari misinformasi dari artikel daring yang kerap tidak akurat. ECOSITES menjadi wadah bagi mahasiswa untuk mengintegrasikan pendekatan teknologi dengan tanggung jawab sosial, guna menciptakan solusi lingkungan yang kontekstual, tepat sasaran, dan berbasis pada fakta ilmiah yang kredibel.",
        imageUrl: "Aca1.jpeg"
    },
    {
        id: 2,
        title: "Kutukan",
        date: "23 November 2025",
        description: "KUTUKAN (Kunci Teror Pembuktian) – UNITI VINCIAMO merupakan simpul persaudaraan dan manifestasi gelora semangat dari massa SITH-R dan SITH-S yang bersatu dalam satu komando tribun. Mengusung semboyan 'Uniti Vinciamo' yang berarti 'Bersatu Kita Menang', aliansi ini bukan sekadar kelompok supporter, melainkan representasi resiliensi dan loyalitas tanpa batas bagi identitas hijau di setiap kompetisi. Dengan atmosfer yang mengintimidasi namun tetap suportif, KUTUKAN hadir sebagai energi tambahan bagi para atlet di lapangan sekaligus bukti nyata bahwa di bawah naungan Sekolah Ilmu dan Teknologi Hayati, perbedaan program studi melebur menjadi satu kekuatan yang solid, vokal, dan tak tergoyahkan.",
        imageUrl: "Aca2.jpeg"
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
    const logoSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px" };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const targetId = entry.target.id;
                const isIntersecting = entry.isIntersecting;

                setVisibleSections(prev => {
                    if (prev[targetId] !== isIntersecting) {
                        return { ...prev, [targetId]: isIntersecting };
                    }
                    return prev;
                });
            });
        }, observerOptions);

        if (aboutRef.current) observer.observe(aboutRef.current);
        if (visionRef.current) observer.observe(visionRef.current);
        if (missionRef.current) observer.observe(missionRef.current);
        if (timelineRef.current) observer.observe(timelineRef.current);
        if (logoSectionRef.current) observer.observe(logoSectionRef.current);

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

            <div className="relative w-full max-w-6xl mx-auto h-[220px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl border border-gray-800 shadow-2xl group mb-16 px-4 md:px-0 animate-banner-entrance">
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
                <h2 className="mb-8 text-2xl md:text-4xl font-bold uppercase tracking-widest text-white border-b border-gray-800 pb-4">
                    Tentang <span className="text-yellow-400">SITH-S</span>
                </h2>
                <p className="text-sm md:text-xl leading-relaxed text-gray-300 text-justify md:text-center">
                    Sekolah Ilmu dan Teknologi Hayati - Sains (SITH-S) ITB memegang peranan penting dalam memajukan bidang life sciences melalui pengembangan biosains dan bioteknologi yang krusial bagi pengelolaan sumber daya alam di masa depan. Berpusat di Kampus Ganesha, SITH-S menjadi wadah akademik utama bagi mahasiswa yang ingin mendalami rumpun keilmuan sains hayati secara mendalam melalui program studi Biologi dan Mikrobiologi. Sementara itu, fokus pendidikan SITH juga diperluas melalui SITH-C di Kampus Cirebon yang secara spesifik menyelenggarakan program studi Biologi untuk menjangkau potensi daerah yang lebih luas.
                </p>
            </div>

            <div
                id="logo-section"
                ref={logoSectionRef}
                className={`mx-auto max-w-4xl px-6 py-16 text-center transition-all duration-1000 ease-out transform ${visibleSections['logo-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <h2 className="mb-12 text-2xl md:text-4xl font-bold uppercase tracking-widest text-white">
                    SITH-S Angkatan <span className="text-yellow-400">2025</span>
                </h2>

                <div className="flex flex-col items-center mb-16">
                    <img
                        src="/logo.png"
                        alt="Logo SITH-S 2025"
                        className="w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] object-contain mb-8 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform duration-500"
                    />
                </div>

                <div className="text-center max-w-4xl mx-auto">
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-yellow-400 mb-8 border-b border-gray-800 pb-4">Makna Logo</h3>
                    <p className="text-sm md:text-xl leading-relaxed text-gray-300 italic px-4">
                        "
                        Secara keseluruhan, logo angkatan Akshaya Rediviva menunjukkan harapan
                        agar Akshaya Rediviva menjadi angkatan yang mampu bertahan
                        menghadapi setiap tantangan, berkembang seiring berjalannya waktu dan
                        perubahan fase, serta terus bangkit kembali ketika dihadapkan pada
                        kesulitan."
                    </p>
                </div>
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
                            "Menjadi wadah pengembangan diri yang berkarakter, solid, dan berdaya guna dalam menguasai ilmu hayati serta berkontribusi nyata bagi lingkungan, masyarakat, dan masa depan yang berkelanjutan"
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
                                <span>Menumbuhkan rasa solidaritas dan kekeluargaan di antara seluruh anggota SITH Sains</span>
                                <ChevronRight className="hidden md:block text-yellow-400 h-5 w-5" />
                            </li>
                            <li className="flex items-center md:justify-end gap-3">
                                <ChevronRight className="text-yellow-400 h-4 w-4 md:hidden" />
                                <span>Menyiadakan wadah eksplorasi untuk menggali potensi agar angkatan sites aktif secara akademik dan nonakademik</span>
                                <ChevronRight className="hidden md:block text-yellow-400 h-5 w-5" />
                            </li>
                            <li className="flex items-center md:justify-end gap-3">
                                <ChevronRight className="text-yellow-400 h-4 w-4 md:hidden" />
                                <span>Menanamkan nilai kebersamaan, empati, dan semangat saling mendukung dalam setiap langkah perjuangan</span>
                                <ChevronRight className="hidden md:block text-yellow-400 h-5 w-5" />
                            </li>
                            <li className="flex items-center md:justify-end gap-3">
                                <ChevronRight className="text-yellow-400 h-4 w-4 md:hidden" />
                                <span>Menguatkan sinergi antara mahasiswa, dosen, dan alumni untuk menciptakan SITH Sains yang bersatu, berdaya, dan berdampak positif</span>
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
                @keyframes bannerEntrance {
                    0% { opacity: 0; transform: scale(1.01); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-banner-entrance {
                    animation: bannerEntrance 1.5s ease-out forwards;
                    backface-visibility: hidden;
                    will-change: opacity, transform;
                }
            `}</style>
        </div>
    );
};

export default About;
