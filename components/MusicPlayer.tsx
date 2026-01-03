import React, { useState, useEffect, useRef } from 'react';
import { useMusicPlayer } from '../contexts/MusicContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader, X, FastForward, Rewind } from 'lucide-react';
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
    const handlePrevRef = useRef<() => void>(() => { });
    const handleToggleRef = useRef<() => void>(() => { });
    const handleSeekForwardRef = useRef<() => void>(() => { });
    const handleSeekBackwardRef = useRef<() => void>(() => { });
    const scrubRef = useRef<HTMLDivElement>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [scrubTime, setScrubTime] = useState(0);

    useEffect(() => {
        handleNextRef.current = () => {
            if (queue.length === 0) return;
            const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
            setCurrentIndex(nextIndex);
        };
        handlePrevRef.current = () => {
            if (queue.length === 0) return;
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
            setCurrentIndex(prevIndex);
        };
        handleToggleRef.current = () => {
            if (!playerRef.current || !isReady) return;
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        };
        handleSeekForwardRef.current = () => {
            if (playerRef.current && isReady) {
                const newTime = Math.min(playerRef.current.getCurrentTime() + 10, playerRef.current.getDuration());
                playerRef.current.seekTo(newTime, true);
                setCurrentTime(newTime);
            }
        };
        handleSeekBackwardRef.current = () => {
            if (playerRef.current && isReady) {
                const newTime = Math.max(playerRef.current.getCurrentTime() - 10, 0);
                playerRef.current.seekTo(newTime, true);
                setCurrentTime(newTime);
            }
        };
    }, [currentIndex, queue, setCurrentIndex, isPlaying, isReady]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable) return;

            if (e.code === 'Space') {
                e.preventDefault();
                handleToggleRef.current();
            } else if (e.key.toLowerCase() === 'r') {
                handleNextRef.current();
            } else if (e.key.toLowerCase() === 'l') {
                handlePrevRef.current();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                handleSeekForwardRef.current();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                handleSeekBackwardRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isMusicPage) {
            setIsMinimized(false);
        }
    }, [isMusicPage]);

    useEffect(() => {
        setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 150 });

        const handleResize = () => {
            setPosition(prev => {
                let newX = prev.x;
                let newY = prev.y;
                if (newX > window.innerWidth - 70) newX = window.innerWidth - 70;
                if (newY > window.innerHeight - 70) newY = window.innerHeight - 70;
                return { x: newX, y: newY };
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
        handleToggleRef.current();
    };

    const playPrevious = () => {
        handlePrevRef.current();
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

    const seekForward = () => handleSeekForwardRef.current();
    const seekBackward = () => handleSeekBackwardRef.current();

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
        snapToEdge();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        hasMoved.current = false;
        dragStartParams.current = { x: e.clientX, y: e.clientY, startX: position.x, startY: position.y };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - dragStartParams.current.x;
        const dy = e.clientY - dragStartParams.current.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;
        setPosition({ x: dragStartParams.current.startX + dx, y: dragStartParams.current.startY + dy });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        snapToEdge();
    };

    const snapToEdge = () => {
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

    const handleScrubStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!scrubRef.current) return;
        setIsScrubbing(true);
        const rect = scrubRef.current.getBoundingClientRect();

        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = x / rect.width;
        const newTime = percent * duration;
        setScrubTime(newTime);

        if ('touches' in e) {
            document.addEventListener('touchmove', handleTouchScrubMove, { passive: false });
            document.addEventListener('touchend', handleTouchScrubEnd);
        } else {
            document.addEventListener('mousemove', handleScrubMove);
            document.addEventListener('mouseup', handleScrubEnd);
        }
    };

    const handleScrubMove = (e: MouseEvent) => {
        if (!scrubRef.current) return;
        const rect = scrubRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = x / rect.width;
        setScrubTime(percent * duration);
    };

    const handleTouchScrubMove = (e: TouchEvent) => {
        if (!scrubRef.current) return;
        e.preventDefault(); // Prevent scrolling while scrubbing
        const rect = scrubRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
        const percent = x / rect.width;
        setScrubTime(percent * duration);
    };

    const handleScrubEnd = (e: MouseEvent) => {
        finishScrub(e.clientX);
        document.removeEventListener('mousemove', handleScrubMove);
        document.removeEventListener('mouseup', handleScrubEnd);
    };

    const handleTouchScrubEnd = (e: TouchEvent) => {
        finishScrub(e.changedTouches[0].clientX);
        document.removeEventListener('touchmove', handleTouchScrubMove);
        document.removeEventListener('touchend', handleTouchScrubEnd);
    };

    const finishScrub = (clientX: number) => {
        if (!scrubRef.current) return;
        const rect = scrubRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = x / rect.width;
        const finalTime = percent * duration;
        seekTo(finalTime);
        setIsScrubbing(false);
    };

    const currentDisplayTime = isScrubbing ? scrubTime : currentTime;
    const progressPercent = duration > 0 ? (currentDisplayTime / duration) * 100 : 0;

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

                    <div
                        ref={scrubRef}
                        className="w-full h-1 bg-gray-700 rounded-full cursor-pointer relative group flex items-center touch-none"
                        onMouseDown={handleScrubStart}
                        onTouchStart={handleScrubStart}
                    >
                        <div className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full pointer-events-none" style={{ width: `${progressPercent}%` }} />
                        <div
                            className={`absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg transform transition-transform duration-100 ${isScrubbing ? 'scale-125' : 'scale-0 group-hover:scale-100'}`}
                            style={{ left: `${progressPercent}%`, transform: `translateX(-50%) ${isScrubbing ? 'scale(1.25)' : ''}` }}
                        >
                            {isScrubbing && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-700">
                                    {formatTime(scrubTime)}
                                </div>
                            )}
                        </div>
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
                            <button onClick={seekBackward} className="p-2 text-gray-300 hover:text-white" title="-10s">
                                <Rewind size={20} />
                            </button>
                            <button
                                onClick={togglePlay}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {!isReady ? <Loader size={24} className="animate-spin" /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>
                            <button onClick={seekForward} className="p-2 text-gray-300 hover:text-white" title="+10s">
                                <FastForward size={20} />
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
                    className="lg:hidden fixed z-[100] cursor-move"
                    style={{ left: `${position.x}px`, top: `${position.y}px`, touchAction: 'none' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                >
                    <div
                        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden"
                        onClick={() => !hasMoved.current && togglePlay()}
                    >
                        <svg className="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#4B5563" strokeWidth="4" />
                            <circle
                                cx="50"
                                cy="50"
                                r="48"
                                fill="none"
                                stroke="#D1D5DB"
                                strokeWidth="4"
                                strokeDasharray="301.59"
                                strokeDashoffset={duration ? 301.59 - ((currentTime / duration) * 301.59) : 301.59}
                                strokeLinecap="round"
                            />
                        </svg>
                        {currentTrack.thumbnail ? (
                            <img src={currentTrack.thumbnail} alt="" className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                {!isReady ? <Loader size={24} className="text-yellow-400 animate-spin" /> : isPlaying ? <Pause size={24} className="text-yellow-400" /> : <Play size={24} className="text-yellow-400 ml-0.5" />}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                            {!isReady ? <Loader size={24} className="text-white animate-spin" /> : isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-0.5" />}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MusicPlayer;