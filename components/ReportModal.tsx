import React, { useState } from 'react';
import { X, Send, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

interface ReportModalProps {
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || content.length < 5) {
            showToast('Harap isi laporan dengan jelas (min. 5 karakter)', 'error');
            return;
        }

        setIsSubmitting(true);
        const token = getCookie('userToken');

        try {
            const res = await fetch(`${API_BASE_URL}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ sender_name: name || 'Anonymous', content })
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setName('');
                    setContent('');
                }, 2000);
            } else {
                showToast('Gagal mengirim laporan.', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi.', 'error');
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
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
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
