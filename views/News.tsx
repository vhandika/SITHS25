import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, X, Lock, Pencil, Trash2, ChevronLeft, ChevronRight, Loader, Instagram } from 'lucide-react';
import SkewedButton from '../components/SkewedButton';
import { fetchWithAuth } from '../src/utils/api';

const API_BASE_URL = 'https://idk-eight.vercel.app/api';

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const LinkifiedContent: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return (
        <div className="space-y-4 text-gray-300 leading-relaxed text-base text-left">
            {text.split('\n').map((paragraph, index) => (
                <p key={index} className="min-h-[1rem] whitespace-pre-wrap">
                    {paragraph.split(urlRegex).map((part, i) => {
                        if (part.match(urlRegex)) {
                            return (
                                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 hover:underline break-all" onClick={(e) => e.stopPropagation()}>
                                    {part}
                                </a>
                            );
                        }
                        return part;
                    })}
                </p>
            ))}
        </div>
    );
};

interface NewsArticle {
    id: number;
    title: string;
    created_at: string;
    image_url: string;
    category: string;
    content: string;
    is_public: boolean;
}

const NewsCard: React.FC<{
    article: NewsArticle;
    isFeatured: boolean;
    onClick: () => void;
    canEdit: boolean;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}> = ({ article, isFeatured, onClick, canEdit, onEdit, onDelete }) => (
    <div
        onClick={onClick}
        className={`group relative w-full shrink-0 transform cursor-pointer overflow-hidden transition-all duration-500 ease-in-out ${isFeatured ? 'lg:w-[60%]' : 'lg:w-[18%]'}`}
    >
        <img
            src={article.image_url || 'https://via.placeholder.com/800x600?text=No+Image'}
            alt={article.title}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${isFeatured ? '' : 'grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {!article.is_public && (
            <div className="absolute top-4 right-4 z-10 bg-red-600/90 backdrop-blur-sm p-1.5 rounded-lg text-white shadow-lg border border-red-500">
                <Lock size={14} />
            </div>
        )}

        {canEdit && (
            <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={onEdit} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-lg" title="Edit">
                    <Pencil size={16} />
                </button>
                <button onClick={onDelete} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 shadow-lg" title="Hapus">
                    <Trash2 size={16} />
                </button>
            </div>
        )}

        <div className={`absolute bottom-0 left-0 w-full p-4 transition-all duration-500 ${isFeatured ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
            <div className="mb-2 bg-yellow-400 px-3 py-1 text-sm font-bold text-black transform -skew-x-12 inline-block">
                <span className="inline-block transform skew-x-12">{article.category}</span>
            </div>
            <h3 className="text-xl font-bold text-white truncate text-left">{article.title}</h3>
        </div>
    </div>
);

const News: React.FC = () => {
    const [newsData, setNewsData] = useState<NewsArticle[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Website',
        is_public: true
    });

    useEffect(() => {
        setUserRole(getCookie('userRole') || null);
        setUserToken(getCookie('userNIM') || null);
    }, []);

    const isLoggedIn = !!userToken;
    const canManageNews = isLoggedIn && (userRole === 'admin' || userRole === 'humas' || userRole === 'dev');

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/news`, { headers: {}, credentials: 'include' });
            const result = await response.json();

            if (result.data) {
                setNewsData(result.data);
                if (currentIndex >= result.data.length) setCurrentIndex(0);
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNews(); }, [userToken]);

    const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? newsData.length - 1 : prev - 1));
    const handleNext = () => setCurrentIndex((prev) => (prev === newsData.length - 1 ? 0 : prev + 1));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("Maksimal ukuran file 5MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Yakin ingin menghapus berita ini?")) return;

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/delete-news/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Berita dihapus.");
                fetchNews();
            } else {
                alert("Gagal menghapus berita.");
            }
        } catch (error) {
            alert("Terjadi kesalahan.");
        }
    };

    const handleEditClick = (article: NewsArticle, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditId(article.id);
        setFormData({
            title: article.title,
            content: article.content,
            category: article.category,
            is_public: article.is_public
        });
        setPreviewUrl(article.image_url);
        setSelectedFile(null);
        setIsAddModalOpen(true);
        setIsClosing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToken) return alert("Sesi habis, login ulang.");
        setIsUploading(true);

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('content', formData.content);
            payload.append('category', formData.category);
            payload.append('is_public', String(formData.is_public));
            if (selectedFile) payload.append('image', selectedFile);

            let url = `${API_BASE_URL}/add-news`;
            let method = 'POST';

            if (isEditing && editId) {
                url = `${API_BASE_URL}/edit-news/${editId}`;
                method = 'PUT';
            }

            const response = await fetchWithAuth(url, {
                method: method,
                body: payload
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal');

            alert(`Berita berhasil ${isEditing ? 'diupdate' : 'diposting'}!`);
            handleCloseModal();
            fetchNews();

        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ title: '', content: '', category: 'Website', is_public: true });
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsAddModalOpen(true);
        setIsClosing(false);
    };

    const handleOpenDetail = (article: NewsArticle) => {
        setSelectedArticle(article);
        setIsClosing(false);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedArticle(null);
            setIsAddModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    if (loading) return <div className="min-h-screen w-full bg-black flex items-center justify-center"><Loader className="animate-spin text-yellow-400" /></div>;
    const currentArticle = newsData.length > 0 ? newsData[currentIndex] : null;

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans relative selection:bg-yellow-400 selection:text-black">
            <style>{`
                @keyframes popUp {
                    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes popDown {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.8) translateY(20px); }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

                .animate-pop-in { animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-pop-out { animation: popDown 0.3s ease-in forwards; }
                
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                .animate-fade-out { animation: fadeOut 0.3s ease-in forwards; }
            `}</style>

            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div className="w-full md:w-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                                <span className="transform skew-x-12"><Newspaper size={32} /></span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">News</h1>
                        </div>

                        {currentArticle && (
                            <div className="border-l-4 border-yellow-400 pl-4 transition-all duration-300 text-left">
                                <p className="text-sm text-gray-400 font-mono">{new Date(currentArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <h3 className="text-2xl font-semibold text-white mt-1 line-clamp-2 md:line-clamp-1">{currentArticle.title}</h3>
                            </div>
                        )}
                    </div>

                    {canManageNews && (
                        <div className="hidden md:block">
                            <SkewedButton onClick={openAddModal} icon={<Plus size={18} />}>
                                Add News
                            </SkewedButton>
                        </div>
                    )}
                </div>

                {currentArticle ? (
                    <div className="mt-8">
                        <div className="relative h-[400px] w-full overflow-hidden">
                            <div className="lg:hidden flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                                {newsData.map((article) => (
                                    <div key={article.id} className="relative w-full h-full flex-shrink-0 cursor-pointer" onClick={() => handleOpenDetail(article)}>
                                        <img src={article.image_url || 'https://via.placeholder.com/800x600'} alt={article.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        {canManageNews && (
                                            <div className="absolute top-4 left-4 z-20 flex gap-2">
                                                <button onClick={(e) => handleEditClick(article, e)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-lg"><Pencil size={16} /></button>
                                                <button onClick={(e) => handleDelete(article.id, e)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 shadow-lg"><Trash2 size={16} /></button>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-4 right-4 text-left">
                                            <h3 className="text-2xl font-bold text-white line-clamp-2">{article.title}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden lg:flex absolute inset-0 gap-2">
                                {newsData.map((article, index) => (
                                    <NewsCard
                                        key={article.id} article={article} isFeatured={index === currentIndex}
                                        onClick={() => handleOpenDetail(article)}
                                        canEdit={canManageNews || false}
                                        onEdit={(e) => handleEditClick(article, e)}
                                        onDelete={(e) => handleDelete(article.id, e)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : <div className="text-center text-gray-500 mt-10">Belum ada berita.</div>}

                {newsData.length > 0 && (
                    <div className="mt-8 flex items-center gap-4">
                        <button onClick={handlePrev} className="p-2 border-2 border-gray-600 text-gray-400 hover:border-white hover:text-white"><ChevronLeft /></button>
                        <button onClick={handleNext} className="p-2 border-2 border-gray-600 text-gray-400 hover:border-white hover:text-white"><ChevronRight /></button>
                    </div>
                )}
            </div>

            <footer className="mt-12 border-t border-gray-800 pt-12 pb-8 text-center text-gray-500">
                <span className="text-4xl font-bold tracking-[.2em] text-gray-700 block mb-4">SITH-S 25</span>
                <p className="text-xs mb-6">Copyright © SITES Angkatan 25.</p>
                <div className="flex justify-center">
                    <a
                        href="https://www.instagram.com/sithsitb25?igsh=Mmg2Nm43aW4zYW91"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 transition-colors duration-300 hover:text-white"
                        title="Visit our Instagram"
                    >
                        <Instagram size={20} />
                    </a>
                </div>
            </footer>

            {canManageNews && (
                <button
                    onClick={openAddModal}
                    className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-yellow-400 text-black rounded-full shadow-lg hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center border-2 border-black"
                    aria-label="Add News"
                >
                    <Plus size={28} />
                </button>
            )}

            {selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 transition-all" onClick={handleCloseModal}>
                    <div className={`absolute inset-0 bg-black/95 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}></div>
                    <div
                        className={`relative w-full max-w-4xl h-full md:h-[90vh] bg-gray-900 md:rounded-xl overflow-hidden shadow-2xl flex flex-col ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative w-full h-[50vh] md:h-[60%] flex-shrink-0">
                            <img
                                src={selectedArticle.image_url || 'https://via.placeholder.com/800x600'}
                                className="w-full h-full object-cover"
                                alt={selectedArticle.title}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-all z-50"
                            >
                                <X size={24} />
                            </button>
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 text-left">
                                <div className="flex gap-3 mb-3">
                                    <span className="bg-yellow-400 px-3 py-1 text-xs font-bold text-black uppercase tracking-wider transform -skew-x-12 inline-block shadow-lg">
                                        <span className="inline-block transform skew-x-12">{selectedArticle.category}</span>
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg mb-2">
                                    {selectedArticle.title}
                                </h2>

                                <p className="text-gray-300 text-sm font-mono flex items-center gap-2">
                                    {new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900 p-6 md:p-10 text-left">
                            <div className="max-w-3xl mx-auto">
                                <LinkifiedContent text={selectedArticle.content} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className={`absolute inset-0 bg-black/90 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
                        onClick={() => !isUploading && handleCloseModal()}
                    ></div>

                    <div
                        className={`relative w-full max-w-2xl bg-gray-900 rounded-lg border border-gray-700 shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-left ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {isEditing ? <Pencil className="text-blue-400" /> : <Plus className="text-yellow-400" />}
                                {isEditing ? 'Edit' : 'Add News'}
                            </h2>
                            <button onClick={() => !isUploading && handleCloseModal()} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-gray-400 text-sm block mb-1">Judul</label>
                                <input required type="text" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-yellow-400 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm block mb-1">Kategori</label>
                                    <select className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-yellow-400 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Website</option><option>Acara</option><option>Pengumuman</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-1">Visibilitas</label>
                                    <div className="flex gap-2 bg-black/50 p-1 rounded border border-gray-700">
                                        <button type="button" onClick={() => setFormData({ ...formData, is_public: true })} className={`flex-1 py-2 rounded text-sm ${formData.is_public ? 'bg-yellow-400 text-black' : 'text-gray-400'}`}>Publik</button>
                                        <button type="button" onClick={() => setFormData({ ...formData, is_public: false })} className={`flex-1 py-2 rounded text-sm ${!formData.is_public ? 'bg-yellow-400 text-black' : 'text-gray-400'}`}>Internal</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm block mb-2">Foto {isEditing && "(Biarkan kosong jika tidak diganti)"}</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300" />
                                {previewUrl && <img src={previewUrl} className="mt-2 h-32 rounded object-cover" alt="Preview" />}
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm block mb-1">Isi</label>
                                <textarea required rows={5} className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-yellow-400 outline-none" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => !isUploading && handleCloseModal()} className="px-4 py-2 text-gray-400" disabled={isUploading}>Batal</button>
                                <button type="submit" disabled={isUploading} className={`px-6 py-2 font-bold uppercase text-white ${isEditing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}>
                                    {isUploading ? 'Proses...' : (isEditing ? 'Update' : 'Posting')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;