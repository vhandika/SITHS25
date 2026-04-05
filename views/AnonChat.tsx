import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import ParticleBackground from '../components/ParticleBackground';

const API_BASE_URL = (import.meta.env.VITE_ANON_CHAT_API_BASE_URL || '').replace(/\/$/, '');
const STORAGE_KEY = 'anon_chat_session_v1';

interface SessionState {
    guestId: string;
    sessionToken: string;
    expiresAt: string;
}

interface Room {
    id: string;
    status: string;
    firstGuestId: string;
    firstNickname: string;
    secondGuestId?: string;
    secondNickname?: string;
}

interface Message {
    id: string;
    roomId: string;
    senderGuestId: string;
    senderNickname: string;
    senderRole: string;
    kind: string;
    text: string;
    createdAt: string;
}

const safeReadSession = (): SessionState | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as SessionState;
        if (!parsed.guestId || !parsed.sessionToken || !parsed.expiresAt) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

const AnonChat: React.FC = () => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const [session, setSession] = useState<SessionState | null>(safeReadSession);
    const [room, setRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [creatingSession, setCreatingSession] = useState(false);
    const [matching, setMatching] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const hasApiBase = API_BASE_URL.length > 0;

    useEffect(() => {
        if (!session) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }, [session]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const roomCodeLabel = useMemo(() => room?.id || '-', [room?.id]);

    const sessionExpired = (expiresAt: string): boolean => {
        const expiry = new Date(expiresAt).getTime();
        if (Number.isNaN(expiry)) return true;
        return Date.now() >= expiry;
    };

    const clearLocalSession = () => {
        setSession(null);
        setRoom(null);
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const createSession = async (): Promise<SessionState | null> => {
        if (!hasApiBase) {
            showToast('Set VITE_ANON_CHAT_API_BASE_URL dulu di Vercel.', 'error');
            return null;
        }

        try {
            setCreatingSession(true);
            const response = await fetch(`${API_BASE_URL}/v1/sessions/anonymous`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Gagal membuat sesi anonim.');
            }

            const nextSession: SessionState = {
                guestId: data.guestId,
                sessionToken: data.sessionToken,
                expiresAt: data.expiresAt
            };
            setSession(nextSession);
            showToast('Sesi anonim aktif.', 'success');
            return nextSession;
        } catch (error: any) {
            showToast(error.message || 'Gagal membuat sesi anonim.', 'error');
            return null;
        } finally {
            setCreatingSession(false);
        }
    };

    const authHeaders = (sessionToken?: string): HeadersInit => ({
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken || session?.sessionToken || ''
    });

    const ensureValidSession = async (activeSession?: SessionState | null) => {
        const candidate = activeSession || session;
        if (!candidate) return false;
        if (sessionExpired(candidate.expiresAt)) {
            showToast('Sesi anonim sudah expired. Buat sesi baru ya.', 'info');
            clearLocalSession();
            return false;
        }
        return true;
    };

    const matchRoom = async () => {
        let activeSession = session;
        if (!activeSession) {
            activeSession = await createSession();
        }
        if (!activeSession) {
            showToast('Gagal membuat sesi anonim.', 'error');
            return;
        }
        if (!(await ensureValidSession(activeSession))) return;

        try {
            setMatching(true);
            const response = await fetch(`${API_BASE_URL}/v1/rooms/match`, {
                method: 'POST',
                headers: authHeaders(activeSession.sessionToken),
                body: JSON.stringify({ sessionToken: activeSession.sessionToken })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Gagal mencari partner chat.');
            }

            setRoom(data.room);
            await refreshRoomAndMessages(data.room.id);
            showToast(data.room.status === 'active' ? 'Partner ditemukan.' : 'Menunggu partner masuk...', 'success');
        } catch (error: any) {
            showToast(error.message || 'Gagal match room.', 'error');
        } finally {
            setMatching(false);
        }
    };

    const refreshRoomAndMessages = async (roomId?: string) => {
        const activeRoomId = roomId || room?.id;
        if (!session || !activeRoomId) return;

        try {
            const [roomRes, messagesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/v1/rooms/${activeRoomId}`, {
                    headers: { 'X-Session-Token': session.sessionToken }
                }),
                fetch(`${API_BASE_URL}/v1/rooms/${activeRoomId}/messages?limit=50`, {
                    headers: { 'X-Session-Token': session.sessionToken }
                })
            ]);

            const roomData = await roomRes.json();
            const messagesData = await messagesRes.json();

            if (roomRes.ok && roomData?.room) {
                setRoom(roomData.room);
            }
            if (messagesRes.ok && Array.isArray(messagesData?.messages)) {
                setMessages(messagesData.messages);
            }
        } catch {
            // keep UI stable during polling
        }
    };

    useEffect(() => {
        if (!room?.id || !session) return;

        const timer = setInterval(() => {
            refreshRoomAndMessages(room.id);
        }, 2500);

        return () => clearInterval(timer);
    }, [room?.id, session?.sessionToken]);

    const sendMessage = async () => {
        if (!room || !session) return;
        if (!(await ensureValidSession())) return;

        const content = text.trim();
        if (!content) return;

        try {
            setSending(true);
            const response = await fetch(`${API_BASE_URL}/v1/rooms/${room.id}/messages`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    text: content
                })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Gagal kirim pesan.');
            }

            setText('');
            setMessages(prev => [...prev, data.message]);
        } catch (error: any) {
            showToast(error.message || 'Gagal kirim pesan.', 'error');
        } finally {
            setSending(false);
        }
    };

    const leaveRoom = async () => {
        if (!room || !session) return;

        try {
            const response = await fetch(`${API_BASE_URL}/v1/rooms/${room.id}/leave`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'Gagal keluar room.');
            }

            setRoom(null);
            setMessages([]);
            setText('');
            showToast('Kamu sudah keluar dari room.', 'info');
        } catch (error: any) {
            showToast(error.message || 'Gagal keluar room.', 'error');
        }
    };

    const handleCommand = async (raw: string): Promise<boolean> => {
        const cmd = raw.trim().toLowerCase();
        if (cmd === '/fd') {
            await matchRoom();
            return true;
        }
        if (cmd === '/lv') {
            if (!room) {
                showToast('Kamu belum ada di room.', 'info');
                return true;
            }
            await leaveRoom();
            return true;
        }
        if (cmd === '/sp') {
            if (room) {
                await leaveRoom();
            }
            await matchRoom();
            return true;
        }
        return false;
    };

    return (
        <div className={`relative min-h-screen overflow-hidden px-4 py-6 md:px-8 ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-black text-white'}`}>
            <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-br from-white via-rose-50/70 to-emerald-50/70' : 'bg-gradient-to-br from-gray-900 via-black to-gray-800'}`} />
            <ParticleBackground />
            {theme === 'dark' && <div className="absolute inset-0 bg-black/60" />}

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className={`rounded-2xl border p-5 backdrop-blur-sm md:p-6 ${theme === 'light' ? 'border-gray-200 bg-white/85' : 'border-yellow-500/20 bg-gray-900/70 shadow-[0_0_40px_rgba(250,204,21,0.08)]'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className={`text-xs uppercase tracking-[0.22em] ${theme === 'light' ? 'text-gray-500' : 'text-yellow-300/80'}`}>
                                Random Room
                            </p>
                            <h1 className="mt-1 text-3xl font-bold uppercase tracking-wide">Anon Chat</h1>
                            <p className={`mt-2 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                Chat tanpa login. Gunakan perintah: <strong>/fd</strong> (find), <strong>/sp</strong> (skip), <strong>/lv</strong> (leave).
                            </p>
                        </div>
                    </div>

                    {!hasApiBase && (
                        <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${theme === 'light' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-amber-500/40 bg-amber-900/20 text-amber-200'}`}>
                            Set env <strong>VITE_ANON_CHAT_API_BASE_URL</strong> di Vercel agar halaman ini bisa dipakai.
                        </div>
                    )}

                    <div className="mb-3 mt-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold uppercase tracking-wide">Ruang Chat</h2>
                    </div>

                    <p className={`mb-4 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        Room Code: {roomCodeLabel}
                    </p>

                    <div className={`h-[380px] overflow-y-auto rounded-lg border p-3 ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-700 bg-black/55'}`}>
                        {messages.length === 0 ? (
                            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                Belum ada pesan.
                            </p>
                        ) : (
                            messages.map((msg) => {
                                const mine = msg.senderGuestId === session?.guestId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${mine
                                                ? 'bg-yellow-400 text-black'
                                                : theme === 'light'
                                                    ? 'border border-gray-200 bg-white text-gray-900'
                                                    : 'bg-gray-800 text-gray-100'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const raw = text;
                                    handleCommand(raw).then((handled) => {
                                        if (handled) {
                                            setText('');
                                            return;
                                        }
                                        sendMessage();
                                    });
                                }
                            }}
                            maxLength={1000}
                            placeholder={room ? 'Ketik pesan atau /sp, /lv ...' : 'Ketik /fd untuk cari partner'}
                            disabled={sending || creatingSession || matching}
                            className={`w-full rounded-lg border px-3 py-2 outline-none transition ${theme === 'light' ? 'border-gray-300 bg-white focus:border-yellow-500' : 'border-gray-700 bg-black/40 focus:border-yellow-400'} disabled:cursor-not-allowed disabled:opacity-60`}
                        />
                        <button
                            onClick={() => {
                                const raw = text;
                                handleCommand(raw).then((handled) => {
                                    if (handled) {
                                        setText('');
                                        return;
                                    }
                                    sendMessage();
                                });
                            }}
                            disabled={sending || creatingSession || matching || !text.trim()}
                            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send size={15} />
                            {sending ? 'Kirim...' : 'Kirim'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnonChat;
