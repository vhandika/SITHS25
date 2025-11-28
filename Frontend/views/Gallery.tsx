import React, { useState, useEffect } from 'react';
import { Plus, X, Link as LinkIcon, User, Camera, Folder, Trash2, Loader } from 'lucide-react';
import SkewedButton from '../components/SkewedButton';

interface GalleryItem {
    id: number;
    title: string;
    drive_link: string;
    user_name: string;
    user_nim: string;
    created_at: string;
}

const Gallery: React.FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserNIM = localStorage.getItem('userNIM'); 
    const API_URL = 'https://idk-eight.vercel.app/api/gallery'; 

    const fetchGallery = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok) {
                setItems(json.data);
            }
        } catch (error) {
            console.error("Error fetching gallery:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault(); 
        setIsSubmitting(true);
        const token = localStorage.getItem('userToken');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, drive_link: link })
            });
            const data = await res.json();
            if (res.ok) {
                setTitle('');
                setLink('');
                setIsModalOpen(false);
                fetchGallery(); 
                alert("Berhasil upload link!");
            } else {
                alert(data.message || 'Gagal upload');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan koneksi ke server');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Apakah Anda yakin ingin menghapus folder ini?")) return;

        const token = localStorage.getItem('userToken');
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert("Folder berhasil dihapus");
                fetchGallery(); 
            } else {
                alert(data.message || "Gagal menghapus folder");
            }
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Terjadi kesalahan koneksi");
        }
    };

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans relative">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                             <span className="transform skew-x-12"><Camera size={32} /></span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Gallery</h1>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <SkewedButton onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
                            Upload Link
                        </SkewedButton>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-yellow-400">
                        <Loader className="animate-spin mb-2" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                Belum ada folder yang diupload.
                            </div>
                        ) : (
                            items.map((item) => (
                                <a 
                                    key={item.id}
                                    href={item.drive_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex flex-col items-center justify-start text-center p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-yellow-400/50 transition-all duration-300"
                                >
                                    {currentUserNIM === item.user_nim && (
                                        <button
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className="absolute top-2 right-2 z-20 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            title="Hapus Folder"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                    <div className="w-24 h-24 mb-4 flex items-center justify-center">
                                        <Folder 
                                            strokeWidth={1}
                                            className="w-full h-full text-gray-400 transition-colors duration-300 group-hover:text-yellow-400"
                                        />
                                    </div>

                                    <div className="w-full space-y-2">
                                        <h3 className="text-white text-lg font-bold leading-snug group-hover:text-yellow-400 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-2 mt-2">
                                            <User size={10} />
                                            <span className="truncate max-w-[120px]">{item.user_name || item.user_nim}</span>
                                        </div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-yellow-400 text-black rounded-full shadow-lg hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center border-2 border-black"
                aria-label="Upload Link"
            >
                <Plus size={28} />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6 relative">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plus className="text-yellow-400" /> Tambah Folder
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nama Folder</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-yellow-400 focus:outline-none"
                                    placeholder=""
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Link Google Drive</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 text-gray-600 w-4 h-4" />
                                    <input 
                                        type="url" 
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded p-2 pl-9 text-white focus:border-yellow-400 focus:outline-none"
                                        placeholder=""
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300">
                                    {isSubmitting ? 'Uploading...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;