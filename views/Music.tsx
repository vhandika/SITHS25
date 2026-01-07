import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Music2, Lock, Globe, Play, Loader, X, Trash2, Edit2, Check, ChevronUp, ChevronDown, Shuffle, Share2, Copy, Link, Download } from 'lucide-react';
import { useMusicPlayer } from '../contexts/MusicContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../src/utils/api';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

interface Track {
    id: string;
    video_id: string;
    title: string;
    artist?: string;
    thumbnail?: string;
    duration?: number | string;
}

interface Playlist {
    id: string;
    title: string;
    description?: string;
    is_public: boolean;
    creator_nim: string;
    cover_image?: string;
    share_code?: string;
    subscribed?: boolean;
    used_share_code?: string;
    spotify_playlist_id?: string;
    source?: string;
}

const Music: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { playTrack, playQueue, setQueue, queue, currentIndex, setCurrentIndex } = useMusicPlayer();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
    const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [isRecommendation, setIsRecommendation] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentShareCode, setCurrentShareCode] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [sharedPlaylist, setSharedPlaylist] = useState<{ playlist: Playlist; tracks: Track[] } | null>(null);
    const [isLoadingShare, setIsLoadingShare] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importIsPublic, setImportIsPublic] = useState(false);
    const [importProgress, setImportProgress] = useState<{ current: number; total: number; added: number; failed: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isTyping = useRef(false);

    const [currentUserNim, setCurrentUserNim] = useState<string | null>(null);

    const showPlaylistDetail = selectedPlaylist !== null;
    const isSearchMode = searchResults.length > 0;
    const myPlaylists = playlists.filter(p => p.creator_nim === currentUserNim && p.source !== 'spotify' && !p.spotify_playlist_id);

    useEffect(() => {
        const initUserAndGuest = async () => {
            try {
                const res = await fetchWithAuth(`${API_BASE_URL}/validate-token`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user && data.user.nim) {
                        setCurrentUserNim(data.user.nim);
                    }
                }
            } catch (error) {
            }

            let guestId = localStorage.getItem('music_guest_id');
            if (!guestId) {
                try {
                    const res = await fetch(`${API_BASE_URL}/guest-token`);
                    const data = await res.json();
                    if (data.guestId) {
                        guestId = data.guestId;
                        localStorage.setItem('music_guest_id', guestId);
                    }
                } catch (error) {
                }
            }

            if (guestId) {
                const parts = guestId.split('.');
                if (parts.length > 0) {
                    setCurrentUserNim(current => current || parts[0]);
                }
            }

            fetchPlaylists();
        };
        initUserAndGuest();
    }, []);

    const joinPlaylist = async (code: string) => {
        setIsLoadingShare(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/subscribe/${code.toUpperCase()}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                alert('Berhasil join playlist!');
                setShowJoinModal(false);
                setJoinCode('');
                fetchPlaylists();
            } else {
                alert(data.message || 'Gagal join playlist');
            }
        } catch (error) {
            alert('Gagal join playlist');
        } finally {
            setIsLoadingShare(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const joinCodeParam = params.get('join');
        if (joinCodeParam) {
            navigate('/music', { replace: true });
            joinPlaylist(joinCodeParam);
        }
    }, [location]);

    const getHeaders = () => {
        const headers: any = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };

        const guestId = localStorage.getItem('music_guest_id');
        if (guestId) {
            headers['X-Guest-ID'] = guestId;
        }
        return headers;
    };

    const fetchPlaylists = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/music/playlists`, {
                headers: getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setPlaylists(data.data || []);
        } catch (error) {
        }
    };

    const fetchTracks = async (playlistId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/music/playlists/${playlistId}/tracks`, {
                headers: getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setTracks(data.data || []);
        } catch (error) {
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2 && isTyping.current) {
                try {
                    const res = await fetch(`${API_BASE_URL}/music/suggest?q=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setSuggestions(data || []);
                    setShowSuggestions(true);
                } catch (error) {
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        isTyping.current = true;
        setSearchQuery(e.target.value);
    };

    const handleSearch = async (queryOverride?: string) => {
        const query = queryOverride || searchQuery;
        if (!query.trim()) return;

        setIsSearching(true);
        setIsRecommendation(false);
        setShowSuggestions(false);
        setSelectedPlaylist(null);
        isTyping.current = false;
        if (inputRef.current) {
            inputRef.current.blur();
        }

        if (queryOverride) setSearchQuery(queryOverride);

        try {
            const res = await fetch(`${API_BASE_URL}/music/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) setSearchResults(data.data || []);
        } catch (error) {
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistTitle.trim()) return;

        // FE-side rate limit cache check
        const playlistBlockedUntil = localStorage.getItem('playlistBlockedUntil');
        if (playlistBlockedUntil && Date.now() < parseInt(playlistBlockedUntil)) {
            const remaining = Math.ceil((parseInt(playlistBlockedUntil) - Date.now()) / 1000);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            alert(`Rate limit: Tunggu ${minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`} lagi.`);
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists`, {
                method: 'POST',
                body: JSON.stringify({ title: newPlaylistTitle, is_public: newPlaylistIsPublic })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('playlistBlockedUntil');
                setShowCreateModal(false);
                setNewPlaylistTitle('');
                setNewPlaylistIsPublic(false);
                fetchPlaylists();
            } else {
                if (res.status === 429 && data.retryAfter) {
                    const blockedUntilTime = Date.now() + (data.retryAfter * 1000);
                    localStorage.setItem('playlistBlockedUntil', blockedUntilTime.toString());
                }
                alert(data.message || 'Gagal membuat playlist');
            }
        } catch (error) {
            alert('Gagal membuat playlist');
        }
    };

    const handlePlayNow = (video: any) => {
        const track: Track = {
            id: `temp-${Date.now()}`,
            video_id: video.id,
            title: video.title,
            artist: video.channel,
            thumbnail: video.thumbnail
        };
        playTrack(track);
    };

    const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
    const [trackToAdd, setTrackToAdd] = useState<{ id: string, title: string, artist: string, thumbnail: string } | null>(null);

    const openAddToPlaylistModal = (video: any) => {
        setTrackToAdd({
            id: video.id,
            title: video.title,
            artist: video.channel,
            thumbnail: video.thumbnail
        });
        setShowAddToPlaylistModal(true);
    };

    const confirmAddToPlaylist = async (playlistId: string) => {
        if (!trackToAdd) return;

        // FE-side rate limit cache check
        const trackBlockedUntil = localStorage.getItem('trackBlockedUntil');
        if (trackBlockedUntil && Date.now() < parseInt(trackBlockedUntil)) {
            const remaining = Math.ceil((parseInt(trackBlockedUntil) - Date.now()) / 1000);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            alert(`Rate limit: Tunggu ${minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`} lagi.`);
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${playlistId}/tracks`, {
                method: 'POST',
                body: JSON.stringify({
                    video_id: trackToAdd.id,
                    title: trackToAdd.title,
                    artist: trackToAdd.artist,
                    thumbnail: trackToAdd.thumbnail
                })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('trackBlockedUntil');
                alert('Dimasukkan ke dalam playlist');
                setShowAddToPlaylistModal(false);
                setTrackToAdd(null);
                if (selectedPlaylist && selectedPlaylist.id === playlistId) {
                    fetchTracks(playlistId);
                }
            } else {
                if (res.status === 429 && data.retryAfter) {
                    const blockedUntilTime = Date.now() + (data.retryAfter * 1000);
                    localStorage.setItem('trackBlockedUntil', blockedUntilTime.toString());
                }
                alert(data.message || 'Gagal menambahkan lagu');
            }
        } catch (error) {
            alert('Gagal menambahkan lagu');
        }
    };

    const handlePlayTrackFromPlaylist = (idx: number) => {
        playQueue(tracks, idx);
    };

    const handleDeletePlaylist = async (playlistId: string) => {
        if (!confirm('Yakin?')) return;

        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        try {
            let res;
            if (playlist.subscribed) {
                res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/subscribe/${playlistId}`, {
                    method: 'DELETE'
                });
            } else {
                res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${playlistId}`, {
                    method: 'DELETE'
                });
            }

            if (res.ok) {
                if (selectedPlaylist?.id === playlistId) {
                    setSelectedPlaylist(null);
                    setTracks([]);
                }
                fetchPlaylists();
            } else {
                alert('Gagal');
            }
        } catch (error) {
        }
    };

    const handleDeleteTrack = async (trackId: string) => {
        if (!selectedPlaylist) return;
        if (!confirm('Yakin?')) return;

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${selectedPlaylist.id}/tracks/${trackId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchTracks(selectedPlaylist.id);
            } else {
                alert('Gagal');
            }
        } catch (error) {
        }
    };

    const handleSelectPlaylist = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setEditTitle(playlist.title);
        setIsEditing(false);
        fetchTracks(playlist.id)
    };

    const moveTrack = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tracks.length) return;

        const newTracks = [...tracks];
        [newTracks[index], newTracks[newIndex]] = [newTracks[newIndex], newTracks[index]];
        setTracks(newTracks);

        if (queue.length > 0) {
            const currentTrack = queue[currentIndex];
            const newCurrentIndex = newTracks.findIndex(t => t.id === currentTrack?.id);
            setQueue(newTracks);
            if (newCurrentIndex !== -1) {
                setCurrentIndex(newCurrentIndex);
            }
        }

        if (selectedPlaylist) {
            try {
                const trackIds = newTracks.map(t => t.id);
                const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${selectedPlaylist.id}/reorder`, {
                    method: 'PUT',
                    body: JSON.stringify({ trackIds })
                });
                if (!res.ok) {
                    console.error('Reorder failed:', await res.json());
                }
            } catch (error) {
                console.error('Reorder error:', error);
            }
        }
    };

    const shuffleTracks = async () => {
        if (tracks.length < 2) return;

        const newTracks = [...tracks].sort(() => Math.random() - 0.5);
        setTracks(newTracks);

        if (queue.length > 0) {
            const currentTrack = queue[currentIndex];
            const newCurrentIndex = newTracks.findIndex(t => t.id === currentTrack?.id);
            setQueue(newTracks);
            if (newCurrentIndex !== -1) {
                setCurrentIndex(newCurrentIndex);
            }
        }

        if (selectedPlaylist) {
            try {
                const trackIds = newTracks.map(t => t.id);
                const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${selectedPlaylist.id}/reorder`, {
                    method: 'PUT',
                    body: JSON.stringify({ trackIds })
                });
                if (!res.ok) {
                    console.error('Shuffle reorder failed:', await res.json());
                }
            } catch (error) {
                console.error('Shuffle error:', error);
            }
        }
    };

    const handleUpdatePlaylist = async () => {
        if (!selectedPlaylist || !editTitle.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/music/playlists/${selectedPlaylist.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ title: editTitle })
            });

            if (res.ok) {
                const updatedPlaylist = { ...selectedPlaylist, title: editTitle };
                setSelectedPlaylist(updatedPlaylist);
                setPlaylists(playlists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
                setIsEditing(false);
                alert('Playlist updated!');
            } else {
                const data = await res.json();
                alert(data.message || 'Gagal');
            }
        } catch (error) {
        }
    };

    const handleGenerateShareCode = async () => {
        if (!selectedPlaylist) return;
        setIsLoadingShare(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${selectedPlaylist.id}/share-code`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentShareCode(data.share_code);
                setShowShareModal(true);
            } else {
                alert(data.message || 'Gagal generate kode');
            }
        } catch (error) {
        } finally {
            setIsLoadingShare(false);
        }
    };

    const handleCopyCode = () => {
        if (currentShareCode) {
            navigator.clipboard.writeText(currentShareCode);
        }
    };

    const handleCopyLink = () => {
        if (currentShareCode) {
            const url = `${window.location.origin}/music?join=${currentShareCode}`;
            navigator.clipboard.writeText(url);
        }
    };

    const handleRevokeShareCode = async () => {
        if (!selectedPlaylist) return;
        if (!confirm('Yakin?')) return;

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/music/playlists/${selectedPlaylist.id}/share-code`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setCurrentShareCode(null);
                setShowShareModal(false);
                alert('Oke');
            }
        } catch (error) {
        }
    };

    const handleJoinByCode = async () => {
        if (!joinCode.trim() || joinCode.length !== 6) {
            alert('Kode harus 6 karakter');
            return;
        }
        await joinPlaylist(joinCode);
    };

    const detectImportSource = (url: string): 'spotify' | 'youtube' | null => {
        if (url.includes('spotify.com/playlist/')) return 'spotify';
        if (url.includes('youtube.com') && url.includes('list=')) return 'youtube';
        if (url.includes('youtu.be') && url.includes('list=')) return 'youtube';
        if (url.includes('music.youtube.com') && url.includes('list=')) return 'youtube';
        return null;
    };

    const handleImport = async () => {
        if (!importUrl.trim()) {
            alert('Masukkan URL playlist Spotify atau YouTube');
            return;
        }

        const source = detectImportSource(importUrl);
        if (!source) {
            alert('URL tidak valid. Gunakan link playlist Spotify atau YouTube.');
            return;
        }

        setIsImporting(true);
        setImportProgress(null);

        try {
            if (source === 'spotify') {
                const res = await fetchWithAuth(`${API_BASE_URL}/music/import/spotify`, {
                    method: 'POST',
                    body: JSON.stringify({ spotifyUrl: importUrl, isPublic: importIsPublic })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to import');

                alert('Spotify playlist imported!');
            } else {
                setImportProgress({ current: 0, total: 0, added: 0, failed: 0 });

                const prefetchRes = await fetchWithAuth(`${API_BASE_URL}/music/import/youtube/prefetch`, {
                    method: 'POST',
                    body: JSON.stringify({ youtubeUrl: importUrl })
                });

                if (!prefetchRes.ok) {
                    const errData = await prefetchRes.json();
                    throw new Error(errData.message || 'Failed to fetch playlist');
                }

                const { playlistName, tracks, total } = await prefetchRes.json();
                setImportProgress({ current: 0, total, added: 0, failed: 0 });

                const createRes = await fetchWithAuth(`${API_BASE_URL}/music/playlists`, {
                    method: 'POST',
                    body: JSON.stringify({ title: playlistName, is_public: importIsPublic })
                });

                if (!createRes.ok) {
                    const errData = await createRes.json();
                    throw new Error(errData.message || 'Failed to create playlist');
                }

                const { data: newPlaylist } = await createRes.json();

                const BATCH_SIZE = 5;
                let totalAdded = 0;
                let totalFailed = 0;
                let lastError = null;

                for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
                    const batch = tracks.slice(i, i + BATCH_SIZE);

                    try {
                        const batchRes = await fetchWithAuth(`${API_BASE_URL}/music/import/batch`, {
                            method: 'POST',
                            body: JSON.stringify({
                                playlistId: newPlaylist.id,
                                tracks: batch,
                                source
                            })
                        });

                        if (batchRes.ok) {
                            const result = await batchRes.json();
                            totalAdded += result.added;
                            totalFailed += result.failed;
                            if (result.firstError && !lastError) {
                                lastError = result.firstError;
                            }
                        } else {
                            totalFailed += batch.length;
                        }
                    } catch (e) {
                        totalFailed += batch.length;
                    }

                    setImportProgress({
                        current: Math.min(i + BATCH_SIZE, total),
                        total,
                        added: totalAdded,
                        failed: totalFailed
                    });
                }

                alert(`Import selesai! ${totalAdded} lagu ditambahkan, ${totalFailed} gagal.${lastError ? `\nError: ${lastError}` : ''}`);
            }

            setShowImportModal(false);
            setImportUrl('');
            setImportIsPublic(false);
            setImportProgress(null);
            fetchPlaylists();
        } catch (error: any) {
            alert(error.message || 'Gagal import playlist');
            setImportProgress(null);
        } finally {
            setIsImporting(false);
        }
    };

    const [activeMobileTab, setActiveMobileTab] = useState<'playlists' | 'search'>('search');

    return (
        <div className="h-[calc(100vh-4rem)] lg:h-screen w-full bg-black text-white flex flex-col mt-16 lg:mt-0">

            <div className="flex lg:hidden bg-gray-900 border-b border-gray-800 flex-shrink-0">
                <button
                    onClick={() => setActiveMobileTab('playlists')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeMobileTab === 'playlists' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}
                >
                    Playlists
                </button>
                <button
                    onClick={() => setActiveMobileTab('search')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeMobileTab === 'search' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}
                >
                    Search
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
                <div className={`border-r border-gray-800 p-4 overflow-y-auto transition-all duration-300 flex-shrink-0 ${(activeMobileTab === 'playlists' ? 'block w-full h-full' : 'hidden') + ' ' +
                    'lg:block lg:w-64'
                    }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Your Playlists</h2>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400"
                                title="Import Playlist"
                            >
                                <Download size={18} />
                            </button>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400"
                                title="Join via Code"
                            >
                                <Link size={18} />
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="p-1 hover:bg-gray-800 rounded text-yellow-400"
                                title="New Playlist"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {playlists.map(playlist => (
                            <div
                                key={playlist.id}
                                onClick={() => handleSelectPlaylist(playlist)}
                                className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 group ${selectedPlaylist?.id === playlist.id
                                    ? 'bg-yellow-400/10 text-yellow-400'
                                    : 'hover:bg-gray-800 text-gray-300'
                                    }`}
                            >
                                {selectedPlaylist?.id === playlist.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-yellow-400 rounded-r-full" />
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${selectedPlaylist?.id === playlist.id ? 'bg-yellow-400/20 text-yellow-400' : playlist.subscribed ? 'bg-gray-800 text-gray-300' : 'bg-gray-800 group-hover:bg-gray-700 text-gray-400'}`}>
                                            {playlist.subscribed ? <Link size={18} /> : <Music2 size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold truncate max-w-[120px] text-sm">{playlist.title}</h3>
                                            <p className={`text-xs truncate ${selectedPlaylist?.id === playlist.id ? 'text-yellow-400/70' : playlist.subscribed ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {playlist.subscribed ? `${playlist.used_share_code}` : playlist.is_public ? 'Public' : 'Private'}
                                            </p>
                                        </div>
                                    </div>
                                    {playlist.subscribed ? <Link size={14} className="text-gray-500" /> : playlist.is_public ? <Globe size={14} className="opacity-50" /> : <Lock size={14} className="opacity-50" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 min-w-0 ${(activeMobileTab === 'search' ? 'block' : 'hidden') + ' ' +
                        'lg:flex '
                        }`}
                >
                    <div className="p-4 border-b border-gray-800 relative z-50">
                        <div className="flex gap-2 relative">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    ref={inputRef}
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    onFocus={() => {
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Search..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-4 pl-10 py-2 text-white focus:border-yellow-400 outline-none"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300 hover:text-white flex items-center gap-2"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSearch(s);
                                                }}
                                            >
                                                <Search size={14} className="text-gray-500" />
                                                <span>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleSearch()}
                                disabled={isSearching}
                                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded flex items-center gap-2"
                            >
                                {isSearching ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 sm:p-4 overflow-x-hidden no-scrollbar">
                        {searchResults.length > 0 ? (
                            <div>
                                <h3 className="text-xl font-bold mb-4 px-2 sm:px-0">Search Results</h3>
                                <div className="space-y-2">
                                    {searchResults.map((video, idx) => (
                                        <div key={idx}
                                            onClick={() => handlePlayNow(video)}
                                            className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-900 rounded hover:bg-gray-800 cursor-pointer group"
                                        >
                                            <img src={video.thumbnail} alt={video.title} loading="lazy" className="w-16 h-12 sm:w-24 sm:h-16 object-cover rounded flex-shrink-0" />
                                            <div className="flex-1 min-w-0 w-0">
                                                <h4 className="font-semibold truncate text-sm sm:text-base text-white transition-colors" title={video.title}>{video.title}</h4>
                                                <p className="text-xs text-gray-400 truncate">{video.channel}</p>
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlayNow(video);
                                                    }}
                                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
                                                    title="Play Now"
                                                >
                                                    <Play size={20} className="sm:w-6 sm:h-6" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openAddToPlaylistModal(video);
                                                    }}
                                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
                                                    title="Add to Playlist"
                                                >
                                                    <Plus size={20} className="sm:w-6 sm:h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Search for music or select a playlist</p>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className={`absolute lg:relative top-0 right-0 h-full bg-black border-l border-gray-800 overflow-y-auto z-30 transition-all duration-300 flex-shrink-0 ${showPlaylistDetail
                        ? (activeMobileTab === 'search' ? 'hidden lg:block lg:w-96 translate-x-0' : 'w-full lg:w-96 translate-x-0')
                        : 'w-96 translate-x-full lg:w-0 lg:translate-x-0 lg:border-l-0'
                        }`}
                >
                    {selectedPlaylist && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4 gap-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleUpdatePlaylist()}
                                        onBlur={() => {
                                            setIsEditing(false);
                                            setEditTitle(selectedPlaylist.title);
                                        }}
                                        className="flex-1 bg-transparent border-b border-yellow-400 text-xl font-bold text-white focus:outline-none min-w-0"
                                        autoFocus
                                    />
                                ) : (
                                    <h3 className="text-xl font-bold truncate">{selectedPlaylist.title}</h3>
                                )}
                                <div className="flex gap-2 flex-shrink-0">
                                    {selectedPlaylist.creator_nim === currentUserNim && (
                                        <button
                                            onClick={handleGenerateShareCode}
                                            disabled={isLoadingShare}
                                            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                            title="Share Playlist"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                    )}

                                    {(selectedPlaylist.creator_nim === currentUserNim || selectedPlaylist.subscribed) && (
                                        <button
                                            onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                                            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                            title={selectedPlaylist.subscribed ? "Unsubscribe" : "Delete Playlist"}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}

                                    {selectedPlaylist.creator_nim === currentUserNim && (
                                        <button
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                if (isEditing) {
                                                    handleUpdatePlaylist();
                                                } else {
                                                    setIsEditing(true);
                                                    setEditTitle(selectedPlaylist.title);
                                                }
                                            }}
                                            className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
                                            title={isEditing ? "Save Name" : "Edit Name"}
                                        >
                                            {isEditing ? <Check size={20} /> : <Edit2 size={20} />}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                setIsEditing(false);
                                                setEditTitle(selectedPlaylist.title);
                                            } else {
                                                setSelectedPlaylist(null);
                                            }
                                        }}
                                        className="p-1 hover:bg-gray-800 rounded text-gray-400 transition-colors"
                                        title={isEditing ? "Cancel" : "Close"}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {selectedPlaylist.spotify_playlist_id ? (
                                <div className="mt-2">
                                    <iframe
                                        src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.spotify_playlist_id}?utm_source=generator&theme=0`}
                                        width="100%"
                                        height="450"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                        className="rounded-xl"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={shuffleTracks}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                                            title="Shuffle tracks"
                                        >
                                            <Shuffle size={14} />
                                            <span className="hidden sm:inline">Shuffle</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {tracks.map((track, idx) => (
                                            <div
                                                key={track.id}
                                                className="flex items-center gap-2 p-2 bg-black rounded hover:bg-gray-800 group transition-colors"
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); moveTrack(idx, 'up'); }}
                                                        disabled={idx === 0}
                                                        className={`p-0.5 rounded transition-colors ${idx === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                                                        title="Move up"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); moveTrack(idx, 'down'); }}
                                                        disabled={idx === tracks.length - 1}
                                                        className={`p-0.5 rounded transition-colors ${idx === tracks.length - 1 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                                                        title="Move down"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>

                                                {track.thumbnail && <img src={track.thumbnail} alt={track.title} loading="lazy" className="w-10 h-10 object-cover rounded" />}
                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlayTrackFromPlaylist(idx)}>
                                                    <h4 className="font-semibold truncate text-sm">{track.title}</h4>
                                                    {track.artist && <p className="text-xs text-gray-400 truncate">{track.artist}</p>}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTrack(track.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Track"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePlayTrackFromPlaylist(idx)}
                                                    className="p-1 text-yellow-400 hover:text-yellow-300"
                                                    title="Play"
                                                >
                                                    <Play size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Playlist</h2>
                        <input
                            type="text"
                            value={newPlaylistTitle}
                            onChange={e => setNewPlaylistTitle(e.target.value)}
                            placeholder="Playlist name"
                            className="w-full bg-black border border-gray-700 rounded px-4 py-2 mb-4 text-white focus:border-yellow-400 outline-none"
                        />
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newPlaylistIsPublic}
                                onChange={e => setNewPlaylistIsPublic(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Make public</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePlaylist}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {
                showAddToPlaylistModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Plus size={20} className="text-yellow-400" />
                                    Add to Playlist
                                </h3>
                                <button onClick={() => setShowAddToPlaylistModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {trackToAdd && (
                                <div className="bg-gray-800/50 p-3 rounded mb-4 flex items-center gap-3">
                                    {trackToAdd.thumbnail && (
                                        <img src={trackToAdd.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium truncate text-sm">{trackToAdd.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{trackToAdd.artist}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Select Playlist</p>
                                {myPlaylists.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => confirmAddToPlaylist(p.id)}
                                        className="w-full text-left p-3 rounded hover:bg-gray-800 flex items-center gap-3 transition-colors border border-transparent hover:border-gray-700 group"
                                    >
                                        <div className="bg-gray-800 group-hover:bg-gray-700 p-2 rounded transition-colors">
                                            {p.is_public ? <Globe size={16} className="text-gray-400" /> : <Lock size={16} className="text-gray-500" />}
                                        </div>
                                        <span className="font-medium text-sm">{p.title}</span>
                                    </button>
                                ))}
                                {myPlaylists.length === 0 && (
                                    <p className="text-center text-gray-500 py-4 text-sm">No playlists found. Create one first!</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showShareModal && currentShareCode && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Share2 size={20} className="text-yellow-400" />
                                    Share Playlist
                                </h2>
                                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Share Code:</p>
                                    <div className="bg-black border border-gray-700 rounded-lg p-3 flex items-center justify-between gap-3">
                                        <span className="text-xl font-mono font-bold text-yellow-400 tracking-widest">{currentShareCode}</span>
                                        <button onClick={handleCopyCode} className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Copy Code">
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Share Link:</p>
                                    <div className="bg-black border border-gray-700 rounded-lg p-3 flex items-center justify-between gap-3">
                                        <span className="text-sm text-gray-400 truncate flex-1">{`${window.location.origin}/music?join=${currentShareCode}`}</span>
                                        <button onClick={handleCopyLink} className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Copy Link">
                                            <Link size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRevokeShareCode}
                                    className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 py-2 rounded font-bold"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showJoinModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Link size={20} className="text-yellow-400" />
                                    Join via Code
                                </h2>
                                <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">Masukkan kode 6 karakter:</p>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                                placeholder="______"
                                maxLength={6}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 mb-4 text-center text-2xl font-mono font-bold text-yellow-400 tracking-widest focus:border-yellow-400 outline-none uppercase"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleJoinByCode}
                                    disabled={joinCode.length !== 6 || isLoadingShare}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 rounded disabled:opacity-50"
                                >
                                    {isLoadingShare ? <Loader className="animate-spin mx-auto" size={20} /> : 'Join'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                sharedPlaylist && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">{sharedPlaylist.playlist.title}</h2>
                                    <p className="text-xs text-gray-400">Shared Playlist</p>
                                </div>
                                <button onClick={() => setSharedPlaylist(null)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {sharedPlaylist.tracks.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Playlist kosong</p>
                                ) : (
                                    <div className="space-y-2">
                                        {sharedPlaylist.tracks.map((track, idx) => (
                                            <div
                                                key={track.id}
                                                className="flex items-center gap-3 p-2 bg-black rounded hover:bg-gray-800 cursor-pointer group"
                                                onClick={() => playQueue(sharedPlaylist.tracks, idx)}
                                            >
                                                {track.thumbnail && <img src={track.thumbnail} alt={track.title} className="w-10 h-10 object-cover rounded" />}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold truncate text-sm">{track.title}</h4>
                                                    {track.artist && <p className="text-xs text-gray-400 truncate">{track.artist}</p>}
                                                </div>
                                                <Play size={16} className="text-yellow-400 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showImportModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Download size={20} className="text-yellow-400" />
                                    Import Playlist
                                </h2>
                                {!isImporting && (
                                    <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                )}
                            </div>

                            {importProgress && importProgress.total > 0 ? (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-yellow-400 font-bold text-lg">
                                            Importing {importProgress.current}/{importProgress.total}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {importProgress.added} added, {importProgress.failed} failed
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        Jangan tutup halaman ini...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={importUrl}
                                        onChange={e => setImportUrl(e.target.value)}
                                        placeholder="Paste URL playlist..."
                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 mb-4 text-white focus:border-yellow-400 outline-none"
                                        disabled={isImporting}
                                    />
                                    <label className="flex items-center gap-2 mb-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={importIsPublic}
                                            onChange={e => setImportIsPublic(e.target.checked)}
                                            className="w-4 h-4"
                                            disabled={isImporting}
                                        />
                                        <span className="text-sm">Make public</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-4">Supports Spotify & YouTube playlist URLs.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowImportModal(false)}
                                            className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded"
                                            disabled={isImporting}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleImport}
                                            disabled={!importUrl.trim() || isImporting}
                                            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 rounded disabled:opacity-50"
                                        >
                                            {isImporting ? <Loader className="animate-spin mx-auto" size={20} /> : 'Import'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Music;
