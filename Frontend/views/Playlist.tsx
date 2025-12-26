import React, { useState, useEffect } from 'react';
import { Music, Disc, ChevronLeft, ChevronRight, Loader, Play } from 'lucide-react';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_PLAYLIST_ID = '37i9dQZF1DXcBWIGoYBM5M';

interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    image_url: string;
    spotify_url: string;
    duration_ms: number; // Tambahan: Durasi lagu untuk timer
}

const MOCK_SONGS: Song[] = [
    {
        id: '6U4VqEHy4n5VeiH4pQPL24',
        title: 'Sparkle',
        artist: 'RADWIMPS',
        album: 'Your Name.',
        image_url: 'https://i.scdn.co/image/ab67616d0000b27308e2f69e6b3602f37c229977',
        spotify_url: 'https://open.spotify.com/track/6U4VqEHy4n5VeiH4pQPL24',
        duration_ms: 410000
    },
    {
        id: '7ovUcF5uHTBRzUpB6ZOmvt',
        title: 'Idol',
        artist: 'YOASOBI',
        album: 'Oshi no Ko',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Idol_%28Yoasobi_song%29.png',
        spotify_url: 'https://open.spotify.com/track/7ovUcF5uHTBRzUpB6ZOmvt',
        duration_ms: 213000
    },
    {
        id: '2bHGq969A5X0t329074c6W',
        title: 'Blue Bird',
        artist: 'Ikimono Gakari',
        album: 'Naruto Shippuden',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273a3dfd67793d5b06670838343',
        spotify_url: 'https://open.spotify.com/track/2bHGq969A5X0t329074c6W',
        duration_ms: 216000
    },
    {
        id: '34gCuhDGsG4bRPIf9bb02f',
        title: 'KICK BACK',
        artist: 'Kenshi Yonezu',
        album: 'Chainsaw Man',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273d8b4e760df76ce044439c362',
        spotify_url: 'https://open.spotify.com/track/34gCuhDGsG4bRPIf9bb02f',
        duration_ms: 193000
    },
    {
        id: '02d9J237i6049B905j5cZ7',
        title: 'Himawari no Yakusoku',
        artist: 'Motohiro Hata',
        album: 'Stand By Me Doraemon',
        image_url: 'https://i.scdn.co/image/ab67616d0000b2736113b28b76df669527df4276',
        spotify_url: 'https://open.spotify.com/track/02d9J237i6049B905j5cZ7',
        duration_ms: 314000
    },
    {
        id: '1OMkdm5qzJYHCaOWfIplVo',
        title: 'Dahlah Saja',
        artist: 'Kaela',
        album: 'Naruto Shippuden',
        image_url: 'https://pbs.twimg.com/media/Gzm-4BGaAAALw63.jpg',
        spotify_url: 'https://open.spotify.com/track/1OMkdm5qzJYHCaOWfIplVo',
        duration_ms: 176000
    }
];

const Playlist: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const fetchSpotifyData = async () => {
            if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
                setSongs(MOCK_SONGS);
                setLoading(false);
                return;
            }

            try {
                const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
                    },
                    body: 'grant_type=client_credentials'
                });
                const tokenData = await tokenResponse.json();
                const token = tokenData.access_token;

                const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${SPOTIFY_PLAYLIST_ID}/tracks?limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const playlistData = await playlistResponse.json();

                const formattedSongs: Song[] = playlistData.items
                    .filter((item: any) => item.track)
                    .map((item: any) => ({
                        id: item.track.id,
                        title: item.track.name,
                        artist: item.track.artists.map((a: any) => a.name).join(', '),
                        album: item.track.album.name,
                        image_url: item.track.album.images[0]?.url || '',
                        spotify_url: item.track.external_urls.spotify,
                        duration_ms: item.track.duration_ms // Ambil durasi asli dari API
                    }));

                setSongs(formattedSongs);
            } catch (error) {
                setSongs(MOCK_SONGS);
            } finally {
                setLoading(false);
            }
        };

        fetchSpotifyData();
    }, []);

    const handleNext = () => {
        setDirection(1);
        setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % songs.length);
        }, 50);
    };

    const handlePrev = () => {
        setDirection(-1);
        setTimeout(() => {
            setActiveIndex((prev) => (prev - 1 + songs.length) % songs.length);
        }, 50);
    };

    const currentSong = songs.length > 0 ? songs[activeIndex] : MOCK_SONGS[0];

    useEffect(() => {
        if (!currentSong) return;

        const duration = currentSong.duration_ms || 30000;

        const autoPlayTimer = setTimeout(() => {
            handleNext();
        }, duration + 1000);

        return () => clearTimeout(autoPlayTimer);
    }, [activeIndex, currentSong]);

    if (loading) return <div className="min-h-screen w-full bg-black flex items-center justify-center"><Loader className="animate-spin text-yellow-400" /></div>;

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-hidden selection:bg-yellow-400 selection:text-black">
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-infinite {
                    animation: spin 8s linear infinite;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100px) rotate(90deg); opacity: 0; }
                    to { transform: translateX(0) rotate(0); opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100px) rotate(-90deg); opacity: 0; }
                    to { transform: translateX(0) rotate(0); opacity: 1; }
                }
                .anim-next {
                    animation: slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .anim-prev {
                    animation: slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .fade-anim {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="mx-auto max-w-7xl h-full relative">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12 relative z-10">
                    <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                        <span className="transform skew-x-12"><Music size={32} /></span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Playlist</h1>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between h-auto lg:h-[60vh] gap-10">

                    {/* --- LEFT SIDE: BIG VINYL DISC --- */}
                    <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center h-[400px] lg:h-[500px]">

                        {/* Wrapper Piringan Hitam */}
                        <div
                            key={activeIndex}
                            className={`relative aspect-square shrink-0 w-[300px] lg:w-[450px] transition-all duration-500 ${direction === 1 ? 'anim-next' : direction === -1 ? 'anim-prev' : ''
                                }`}
                        >
                            <div className="w-full h-full rounded-full animate-spin-infinite shadow-[0_0_50px_rgba(250,204,21,0.15)] border-4 border-gray-800 bg-black relative overflow-hidden">
                                <img
                                    src={currentSong.image_url || 'https://via.placeholder.com/400'}
                                    alt={currentSong.title}
                                    className="w-full h-full object-cover rounded-full opacity-90"
                                />

                                {/* Efek Kilau Vinyl */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                <div className="absolute inset-0 rounded-full border-[20px] border-black/80 pointer-events-none"></div>
                                <div className="absolute inset-0 rounded-full border border-gray-700/50 pointer-events-none scale-90"></div>
                                <div className="absolute inset-0 rounded-full border border-gray-700/50 pointer-events-none scale-75"></div>
                                <div className="absolute inset-0 rounded-full border border-gray-700/50 pointer-events-none scale-50"></div>

                                {/* Lubang Tengah (Dark Style) */}
                                <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-black/80 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border border-white/10 shadow-inner z-20">
                                    <div className="w-4 h-4 bg-black rounded-full border border-gray-700 shadow-lg"></div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-12 flex items-center gap-8 z-20">
                            <button
                                onClick={handlePrev}
                                className="group p-4 bg-gray-900 border border-gray-700 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-lg"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="group p-4 bg-gray-900 border border-gray-700 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-lg"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: Detail & PLAYER --- */}
                    <div className="flex-1 max-w-lg text-left z-20 w-full pl-0 lg:pl-10">
                        <div className="flex items-center gap-2 mb-2 text-yellow-400 font-mono text-sm">
                            <span>{activeIndex + 1 < 10 ? `0${activeIndex + 1}` : activeIndex + 1}</span>
                            <span className="h-[1px] w-12 bg-yellow-400"></span>
                            <span>{songs.length < 10 ? `0${songs.length}` : songs.length}</span>
                        </div>

                        <div className="overflow-hidden mb-6 min-h-[100px]">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 leading-tight fade-anim line-clamp-2" key={currentSong.id + 'title'}>
                                {currentSong.title}
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-400 font-medium fade-anim" key={currentSong.id + 'artist'}>
                                {currentSong.artist}
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6 fade-anim" key={currentSong.id + 'album'}>
                            <div className="flex items-center gap-4">
                                <Disc className="text-gray-500 animate-spin-infinite" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Album</p>
                                    <p className="text-white font-semibold line-clamp-1">{currentSong.album}</p>
                                </div>
                            </div>
                        </div>

                        {/* SPOTIFY EMBED PLAYER */}
                        <div className="w-full bg-black/40 rounded-xl overflow-hidden shadow-2xl border border-gray-800" key={currentSong.id + 'player'}>
                            <iframe
                                style={{ borderRadius: '12px' }}
                                // Tambahkan &autoplay=1 agar ketika timer mengganti lagu, iframe langsung bunyi
                                src={`https://open.spotify.com/embed/track/${currentSong.id}?utm_source=generator&theme=0&autoplay=1`}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                title="Spotify Player"
                            ></iframe>
                        </div>

                        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-800">
                            <Play size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>
                                <strong>Tip:</strong> Login ke akun Spotify di browser Anda untuk mendengarkan lagu secara penuh dan fitur auto-next berjalan lancar.
                                (Jika tidak login, timer mungkin tidak sinkron dengan preview 30 detik).
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Gradients */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        </div>
    );
};

export default Playlist;