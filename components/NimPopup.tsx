import React, { useState, useEffect } from 'react';
import SkewedButton from './SkewedButton';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface NimPopupProps {
    onSuccess: () => void;
}

const NimPopup: React.FC<NimPopupProps> = ({ onSuccess }) => {
    const [nimTpb, setNimTpb] = useState('');
    const [nimJurusan, setNimJurusan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const API_BASE_URL = 'https://api.sith-s25.my.id/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (nimTpb.length < 8 || nimJurusan.length < 8) {
            setError('NIM harus 8 angka');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/user/update-nim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    nim_tpb: nimTpb,
                    nim_jurusan: nimJurusan
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Data NIM berhasil disimpan!', 'success');
                onSuccess();
            } else {
                setError(data.message || 'Gagal menyimpan data.');
            }
        } catch (err) {
            setError('Gagal menghubungi server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-yellow-500/20 bg-black p-8 shadow-2xl shadow-yellow-500/10">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-black transform rotate-3">
                            <UserPlus size={28} className="-rotate-3" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Data Update</h2>
                            <p className="text-sm text-gray-400">Silakan lengkapi NIM kamu untuk melanjutkan.</p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-xl bg-yellow-400/5 border border-yellow-400/20 p-4">
                        <p className="text-sm leading-relaxed text-yellow-200/80">
                            Hai! Aku perlu data NIM TPB dan NIM Jurusan kamu untuk pembaruan sistem. Terima kasih. Aku gak maksa kok 🙂
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nim_tpb" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    NIM TPB
                                </label>
                                <input
                                    id="nim_tpb"
                                    type="text"
                                    required
                                    placeholder="Contoh: 16125023"
                                    value={nimTpb}
                                    onChange={(e) => setNimTpb(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 outline-none transition-all focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 font-mono tracking-widest"
                                />
                            </div>

                            <div>
                                <label htmlFor="nim_jurusan" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    NIM Jurusan
                                </label>
                                <input
                                    id="nim_jurusan"
                                    type="text"
                                    required
                                    placeholder="Contoh: 10425018"
                                    value={nimJurusan}
                                    onChange={(e) => setNimJurusan(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 outline-none transition-all focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 font-mono tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <SkewedButton
                                className="w-full"
                                type="submit"
                                icon={isLoading ? null : <CheckCircle2 size={18} />}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Menyimpan...' : 'OK'}
                            </SkewedButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NimPopup;
