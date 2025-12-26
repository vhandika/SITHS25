import React, { useState, useEffect, useRef } from 'react';
import { useMusicPlayer } from '../contexts/MusicContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MusicPlayer: React.FC = () => {
    const { queue, currentIndex, setCurrentIndex, isPlaying, setIsPlaying } = useMusicPlayer();

    const currentTrack = queue[currentIndex];
    const location = useLocation();
    const isMusicPage = location.pathname === '/music';

    const [isReady, setIsReady] = useState(false);
    const [volume, setVolume] = useState(70);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);

    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
    const isDragging = useRef(false);
    const dragStartParams = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
    const hasMoved = useRef(false);

    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<any>(null);
    const handleNextRef = useRef<() => void>(() => { });

    useEffect(() => {
        handleNextRef.current = () => {
            if (queue.length === 0) return;
            const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
            setCurrentIndex(nextIndex);
        };
    }, [currentIndex, queue, setCurrentIndex]);

    useEffect(() => {
        if (isMusicPage) {
            setIsMinimized(false);
        }
    }, [isMusicPage]);

    useEffect(() => {
        setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
    }, []);

    useEffect(() => {
        let initCheckInterval: any = null;

        const createPlayer = (): boolean => {
            let element = document.getElementById('global-youtube-player');
            if (!element) {
                if (containerRef.current) {
                    element = document.createElement('div');
                    element.id = 'global-youtube-player';
                    containerRef.current.appendChild(element);
                } else {
                    return false;
                }
            }

            if (playerRef.current) return true;

            if (!(window as any).YT || !(window as any).YT.Player) return false;

            try {
                playerRef.current = new (window as any).YT.Player('global-youtube-player', {
                    height: '1',
                    width: '1',
                    videoId: currentTrack ? currentTrack.video_id : '',
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        playsinline: 1,
                        enablejsapi: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: (event: any) => {
                            setIsReady(true);
                            event.target.setVolume(volume);
                            event.target.setPlaybackQuality('small');
                        },
                        onStateChange: (event: any) => {
                            const state = event.data;
                            if (state === (window as any).YT.PlayerState.ENDED) {
                                handleNextRef.current();
                            } else if (state === (window as any).YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                                setDuration(event.target.getDuration());
                                event.target.setPlaybackQuality('small');
                                startProgressTracking();
                            } else if (state === (window as any).YT.PlayerState.PAUSED) {
                                setIsPlaying(false);
                                stopProgressTracking();
                            }
                        },
                        onPlaybackQualityChange: (event: any) => {
                            if (event.data !== 'small' && event.data !== 'tiny') {
                                event.target.setPlaybackQuality('small');
                            }
                        },
                        onError: (event: any) => {
                            if (event.data === 150 || event.data === 101) {
                                handleNextRef.current();
                            }
                        }
                    }
                });
                return true;
            } catch (e) {
                return false;
            }
        };

        const loadAPI = () => {
            if ((window as any).YT && (window as any).YT.Player) {
                if (createPlayer()) return;
            }

            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
            }

            initCheckInterval = setInterval(() => {
                if (createPlayer()) clearInterval(initCheckInterval);
            }, 500);
        };

        loadAPI();

        return () => {
            if (initCheckInterval) clearInterval(initCheckInterval);
            stopProgressTracking();
        };
    }, []);

    useEffect(() => {
        if (!currentTrack || !playerRef.current || !isReady) return;

        if (playerRef.current.getVideoData && playerRef.current.getVideoData().video_id === currentTrack.video_id) {
            if (!isPlaying) playerRef.current.playVideo();
            return;
        }

        playerRef.current.loadVideoById({
            videoId: currentTrack.video_id,
        });
        setTimeout(() => {
            if (playerRef.current) {
                playerRef.current.setPlaybackQuality('small');
            }
        }, 1000);
    }, [currentTrack]);

    useEffect(() => {
        if (!playerRef.current || !isReady) return;

        const playerState = playerRef.current.getPlayerState();
        if (isPlaying && playerState !== (window as any).YT.PlayerState.PLAYING && playerState !== (window as any).YT.PlayerState.BUFFERING) {
            playerRef.current.playVideo();
        } else if (!isPlaying && playerState === (window as any).YT.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
        }

    }, [isPlaying]);

    const startProgressTracking = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 500);
    };

    const stopProgressTracking = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    const togglePlay = () => {
        if (!playerRef.current || !isReady) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const playPrevious = () => {
        if (queue.length === 0) return;
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
        setCurrentIndex(prevIndex);
    };

    const playNext = () => {
        handleNextRef.current();
    };

    const seekTo = (time: number) => {
        if (playerRef.current && isReady) {
            playerRef.current.seekTo(time, true);
            setCurrentTime(time);
        }
    };

    const toggleMute = () => {
        if (playerRef.current && isReady) {
            if (isMuted) playerRef.current.unMute();
            else playerRef.current.mute();
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (vol: number) => {
        setVolume(vol);
        if (playerRef.current && isReady) {
            playerRef.current.setVolume(vol);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true;
        hasMoved.current = false;
        const touch = e.touches[0];
        dragStartParams.current = { x: touch.clientX, y: touch.clientY, startX: position.x, startY: position.y };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartParams.current.x;
        const dy = touch.clientY - dragStartParams.current.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;
        setPosition({ x: dragStartParams.current.startX + dx, y: dragStartParams.current.startY + dy });
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        let newX = position.x;
        let newY = position.y;
        if (newX < 10) newX = 10;
        if (newX > window.innerWidth - 70) newX = window.innerWidth - 70;
        if (newY < 10) newY = 10;
        if (newY > window.innerHeight - 70) newY = window.innerHeight - 70;
        setPosition({ x: newX, y: newY });
    };

    if (!currentTrack) return <div ref={containerRef} className="hidden" />;

    const formatTime = (seconds: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <>
            <div ref={containerRef} className="hidden fixed" />
            <div
                className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50 transition-all duration-300 ease-in-out ${isMinimized
                    ? 'translate-y-[200%] opacity-0 pointer-events-none'
                    : 'translate-y-0 opacity-100'
                    } ${!isMusicPage ? 'hidden lg:block' : ''}`}
            >
                <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 relative">
                    {!isMusicPage && (
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors z-10"
                            title="Minimize player"
                        >
                            <X size={16} />
                        </button>
                    )}

                    <div className="w-full h-1 bg-gray-700 rounded-full cursor-pointer relative group"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            seekTo(percent * duration);
                        }}
                    >
                        <div className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full" style={{ width: `${progressPercent}%` }} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 shadow-lg" style={{ left: `${progressPercent}%` }} />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {currentTrack.thumbnail && (
                                <img
                                    src={currentTrack.thumbnail}
                                    alt={currentTrack.title}
                                    className="w-12 h-12 rounded-md object-cover shadow-md"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="text-white font-semibold truncate text-sm">{currentTrack.title}</h3>
                                {currentTrack.artist && <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={playPrevious} className="p-2 text-gray-300 hover:text-white">
                                <SkipBack size={20} />
                            </button>
                            <button
                                onClick={togglePlay}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {!isReady ? <Loader size={24} className="animate-spin" /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>
                            <button onClick={playNext} className="p-2 text-gray-300 hover:text-white">
                                <SkipForward size={20} />
                            </button>
                        </div>

                        <div className="hidden sm:flex items-center gap-3 text-gray-400 text-xs">
                            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                            <button onClick={toggleMute} className="hover:text-white">
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                                className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {!isMusicPage && (
                <div
                    className="lg:hidden fixed z-50"
                    style={{ left: position.x, top: position.y, touchAction: 'none' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden border-2 border-yellow-400"
                        onClick={() => !hasMoved.current && togglePlay()}
                    >
                        {currentTrack.thumbnail ? (
                            <img src={currentTrack.thumbnail} alt="" className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                {!isReady ? <Loader size={24} className="text-yellow-400 animate-spin" /> : isPlaying ? <Pause size={24} className="text-yellow-400" /> : <Play size={24} className="text-yellow-400 ml-0.5" />}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            {!isReady ? <Loader size={24} className="text-white animate-spin" /> : isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-0.5" />}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MusicPlayer;
