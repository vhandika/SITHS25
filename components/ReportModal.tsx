import React, { useEffect, useRef, useState } from 'react';
import { X, Send, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';
const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').toString().trim();
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise: Promise<void> | null = null;

declare global {
    interface Window {
        turnstile?: {
            render: (container: string | HTMLElement, options: {
                sitekey: string;
                callback?: (token: string) => void;
                'expired-callback'?: () => void;
                'error-callback'?: () => void;
                theme?: 'light' | 'dark';
                appearance?: 'always' | 'execute' | 'interaction-only';
            }) => string;
            reset?: (widgetId?: string) => void;
            remove?: (widgetId: string) => void;
        };
    }
}

const loadTurnstileScript = () => {
    if (window.turnstile) {
        return Promise.resolve();
    }

    if (!turnstileScriptPromise) {
        turnstileScriptPromise = new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);

            if (existingScript) {
                if (window.turnstile) {
                    resolve();
                    return;
                }

                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Turnstile.')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = TURNSTILE_SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Gagal memuat Turnstile.'));
            document.head.appendChild(script);
        });
    }

    return turnstileScriptPromise;
};

interface ReportModalProps {
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useToast();
    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!TURNSTILE_SITE_KEY) {
            setCaptchaStatus('idle');
            return () => {
                isMounted = false;
            };
        }

        const renderTurnstile = async () => {
            try {
                setCaptchaStatus('loading');
                await loadTurnstileScript();

                if (!isMounted || !turnstileContainerRef.current || !window.turnstile) {
                    return;
                }

                if (turnstileWidgetIdRef.current && window.turnstile.remove) {
                    window.turnstile.remove(turnstileWidgetIdRef.current);
                    turnstileWidgetIdRef.current = null;
                }

                turnstileContainerRef.current.innerHTML = '';
                turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                    sitekey: TURNSTILE_SITE_KEY,
                    theme: 'dark',
                    appearance: 'always',
                    callback: (token: string) => {
                        setCaptchaToken(token);
                        setCaptchaStatus('ready');
                    },
                    'expired-callback': () => {
                        setCaptchaToken('');
                        setCaptchaStatus('ready');
                    },
                    'error-callback': () => {
                        setCaptchaToken('');
                        setCaptchaStatus('error');
                    }
                });

                setCaptchaStatus('ready');
            } catch (error) {
                if (isMounted) {
                    setCaptchaStatus('error');
                }
            }
        };

        renderTurnstile();

        return () => {
            isMounted = false;
            if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
                window.turnstile.remove(turnstileWidgetIdRef.current);
            }
            turnstileWidgetIdRef.current = null;
        };
    }, []);

    const resetCaptcha = () => {
        setCaptchaToken('');
        if (turnstileWidgetIdRef.current && window.turnstile?.reset) {
            window.turnstile.reset(turnstileWidgetIdRef.current);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || content.length < 5) {
            showToast('Harap isi laporan dengan jelas (min. 5 karakter)', 'error');
            return;
        }

        if (TURNSTILE_SITE_KEY && !captchaToken) {
            showToast('Selesaikan verifikasi CAPTCHA terlebih dahulu.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('sender_name', name || 'Anonymous');
            payload.append('content', content);
            payload.append('device_info', navigator.userAgent || 'unknown');
            payload.append('website', '');

            if (captchaToken) {
                payload.append('captcha_token', captchaToken);
            }

            if (photo) {
                payload.append('photo', photo);
            }

            const res = await fetch(`${API_BASE_URL}/report`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: payload
            });

            const responseBody = await res.json().catch(() => ({}));

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setName('');
                    setContent('');
                    setPhoto(null);
                    resetCaptcha();
                }, 2000);
            } else {
                showToast(responseBody?.message || 'Gagal mengirim laporan.', 'error');
                resetCaptcha();
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi.', 'error');
            resetCaptcha();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl relative">

                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        Laporkan Masalah
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                            <h4 className="text-white text-lg font-bold">Terkirim!</h4>
                            <p className="text-gray-400 text-sm">Terima kasih atas laporan Anda.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama (Opsional)</label>
                                <input
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-red-500 outline-none transition-colors"
                                    placeholder="Boleh dikosongkan jika ingin anonim"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Isi Laporan <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-red-500 outline-none transition-colors resize-none"
                                    rows={5}
                                    placeholder="Jelaskan keluhan, bug, atau yang lain secara detail..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    maxLength={2000}
                                />
                                <p className="text-[11px] text-gray-500 mt-1">{content.length}/2000 karakter</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto Bukti (Opsional, max 5MB)</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    className="w-full bg-black border border-gray-700 rounded-lg p-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white hover:file:bg-red-700"
                                    onChange={(e) => {
                                        const selected = e.target.files?.[0] || null;
                                        if (!selected) {
                                            setPhoto(null);
                                            return;
                                        }

                                        if (selected.size > 5 * 1024 * 1024) {
                                            showToast('Ukuran foto maksimal 5MB.', 'error');
                                            e.target.value = '';
                                            setPhoto(null);
                                            return;
                                        }

                                        setPhoto(selected);
                                    }}
                                />
                            </div>

                            {TURNSTILE_SITE_KEY ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Verifikasi Keamanan</label>
                                    <div ref={turnstileContainerRef} className="min-h-[65px]" />
                                    {captchaStatus === 'error' ? (
                                        <p className="text-[11px] text-red-400 mt-2">CAPTCHA gagal dimuat. Coba muat ulang refresh.</p>
                                    ) : (
                                        <p className="text-[11px] text-gray-500 mt-2"></p>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-3 text-[11px] text-amber-200">
                                    CAPTCHA belum dikonfigurasi di frontend. Isi VITE_TURNSTILE_SITE_KEY agar report publik benar-benar terlindungi.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || (TURNSTILE_SITE_KEY ? !captchaToken : false)}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                                Kirim Laporan
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
