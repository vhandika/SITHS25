import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Track {
    id: string;
    video_id: string;
    title: string;
    artist?: string;
    thumbnail?: string;
    duration?: number;
}

interface MusicContextType {
    queue: Track[];
    currentIndex: number;
    isPlaying: boolean;
    setQueue: (tracks: Track[]) => void;
    setCurrentIndex: (index: number) => void;
    setIsPlaying: (playing: boolean) => void;
    playTrack: (track: Track) => void;
    playQueue: (tracks: Track[], startIndex?: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const playTrack = (track: Track) => {
        setQueue([track]);
        setCurrentIndex(0);
        setIsPlaying(true);
    };

    const playQueue = (tracks: Track[], startIndex: number = 0) => {
        setQueue(tracks);
        setCurrentIndex(startIndex);
        setIsPlaying(true);
    };

    return (
        <MusicContext.Provider
            value={{
                queue,
                currentIndex,
                isPlaying,
                setQueue,
                setCurrentIndex,
                setIsPlaying,
                playTrack,
                playQueue,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
};

export const useMusicPlayer = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusicPlayer must be used within MusicProvider');
    }
    return context;
};
