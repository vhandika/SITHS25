import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ChevronRight, FileText, LayoutList, Folder, ChevronLeft } from 'lucide-react';
import { LibraryItem } from '../views/Library';

interface LibraryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    currentItem: LibraryItem | null;
    relatedItems: LibraryItem[];
    onSelectItem: (item: LibraryItem) => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ isOpen, onClose, currentItem, relatedItems, onSelectItem }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [navHistory, setNavHistory] = useState<LibraryItem[]>([]);
    const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);
    const [rootItem, setRootItem] = useState<LibraryItem | null>(null);
    const [mobileNavHeight, setMobileNavHeight] = useState(40); // Percentage for sidebar height on mobile
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
            setViewingItem(currentItem);
            setNavHistory([]);
            setRootItem(currentItem);
        } else {
            document.body.style.overflow = 'auto';
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [isOpen]);

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const container = document.getElementById('viewer-content-area');
        if (container) {
            const rect = container.getBoundingClientRect();
            const relativeY = touch.clientY - rect.top;
            const percentage = (relativeY / rect.height) * 100;
            if (percentage > 20 && percentage < 80) {
                setMobileNavHeight(percentage);
            }
        }
    };

    if (!isOpen && !isAnimating) return null;

    const getEmbedLink = (link: string) => {
        if (!link) return '';
        if (link.includes('/drive/folders/')) {
            const folderId = link.split('/folders/')[1].split('?')[0];
            return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
        }
        if (link.includes('/file/d/')) {
            const fileId = link.split('/file/d/')[1].split('/')[0];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return link.replace('/view', '/preview');
    };

    const handleItemClick = (item: LibraryItem) => {
        if (item.type === 'folder' || (item.children && item.children.length > 0)) {
            setNavHistory([...navHistory, viewingItem!]);
            setViewingItem(item);
        } else {
            onSelectItem(item);
        }
    };

    const handleBack = () => {
        if (navHistory.length > 0) {
            const newHistory = [...navHistory];
            const previous = newHistory.pop();
            setNavHistory(newHistory);
            setViewingItem(previous || currentItem);
        }
    };

    const currentFolderItems = viewingItem?.children || relatedItems;
    const isRoot = navHistory.length === 0;

    return (
        <div className={`fixed inset-0 z-[110] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div
                className={`relative w-full h-[92vh] max-w-7xl bg-gray-900/90 rounded-t-3xl border-x border-t border-white/10 shadow-2xl flex flex-col overflow-hidden transition-transform duration-500 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
                    animation: isOpen ? 'bounceUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : ''
                }}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-yellow-400/10 rounded-lg text-yellow-400 shrink-0">
                            {currentItem?.type === 'folder' ? <Folder size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-sm font-bold text-white truncate">
                                {rootItem?.title || currentItem?.title}
                            </h2>
                            {viewingItem && viewingItem.id !== rootItem?.id && (
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                    <ChevronRight size={10} /> {viewingItem.title}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <a
                            href={rootItem?.driveLink || currentItem?.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5"
                        >
                            Open Drive <ExternalLink size={12} />
                        </a>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div
                    id="viewer-content-area"
                    className="flex flex-1 overflow-hidden flex-col md:flex-row"
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => setIsDragging(false)}
                >
                    <div
                        className="bg-black/30 border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-out"
                        style={{
                            height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${mobileNavHeight}%` : 'auto',
                            width: typeof window !== 'undefined' && window.innerWidth >= 768 ? '20rem' : '100%'
                        }}
                    >
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <LayoutList size={12} />
                                {isRoot ? 'Daftar Materi' : viewingItem?.title}
                            </div>
                            {!isRoot && (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1 text-[10px] font-black text-yellow-400 hover:text-yellow-300 transition-colors uppercase"
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {currentFolderItems.map((item) => {
                                const isSelected = currentItem?.id === item.id;
                                const isFolder = item.type === 'folder' || (item.children && item.children.length > 0);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${isSelected ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-black/10' : 'bg-gray-800/50 group-hover:bg-gray-700'}`}>
                                            {isFolder ? <Folder size={18} /> : <FileText size={18} />}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-xs font-bold truncate text-left">
                                                {item.title}
                                            </span>
                                            {isFolder && (
                                                <span className={`text-[8px] font-black uppercase tracking-tighter text-left ${isSelected ? 'text-black/50' : 'text-gray-600'}`}>
                                                    Folder • {item.children?.length || 0} items
                                                </span>
                                            )}
                                        </div>
                                        {isFolder && <ChevronRight size={14} className={isSelected ? 'text-black/50' : 'text-gray-700'} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div
                        className="md:hidden h-2 w-full bg-white/5 flex items-center justify-center cursor-row-resize active:bg-yellow-400/20 transition-colors shrink-0"
                        onTouchStart={() => setIsDragging(true)}
                    >
                        <div className="w-12 h-1 bg-white/20 rounded-full" />
                    </div>

                    <div className="flex-1 bg-gray-950 relative overflow-hidden flex flex-col">
                        {currentItem?.type === 'file' ? (
                            <iframe
                                src={getEmbedLink(currentItem.driveLink)}
                                className="w-full h-full border-none"
                                allow="autoplay"
                                title="File Preview"
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                                <div className="w-24 h-24 bg-yellow-400/5 rounded-full flex items-center justify-center animate-pulse">
                                    <Folder size={48} className="text-yellow-400/20" />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-lg font-bold text-white mb-2">Pilih File</h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Klik salah satu file di sidebar untuk menampilkannya di sini.
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounceUp {
                    0% { transform: translateY(100%); }
                    60% { transform: translateY(-5px); }
                    80% { transform: translateY(2px); }
                    100% { transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
};

export default LibraryViewer;
