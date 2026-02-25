import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { jsPDF } from 'jspdf';
import {
    Upload, FileDown, Trash2, FileText, Crop as CropIcon, Check, X,
    Pencil, Camera, Settings2,
    Smartphone, Monitor, Scaling, Scan, ArrowLeft
} from 'lucide-react';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

const PhotoToPdfTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { showToast } = useToast();
    const [images, setImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fileName, setFileName] = useState<string>(() => localStorage.getItem('pdf_photo_filename') || `PDF_${new Date().toISOString().slice(0, 10)}`);
    const [pageSize, setPageSize] = useState<string>(() => localStorage.getItem('pdf_photo_pagesize') || 'a4');
    const [orientation, setOrientation] = useState<'p' | 'l'>(() => (localStorage.getItem('pdf_photo_orientation') as 'p' | 'l') || 'p');
    const [useMargin, setUseMargin] = useState<boolean>(() => localStorage.getItem('pdf_photo_usemargin') !== 'false');
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
    const [startTouch, setStartTouch] = useState({ x: 0, y: 0 });

    useEffect(() => {
        localStorage.setItem('pdf_photo_filename', fileName);
        localStorage.setItem('pdf_photo_pagesize', pageSize);
        localStorage.setItem('pdf_photo_orientation', orientation);
        localStorage.setItem('pdf_photo_usemargin', String(useMargin));
    }, [fileName, pageSize, orientation, useMargin]);

    useEffect(() => {
        return () => {
            images.forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    const imagesRef = useRef(images);
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => {
        return () => {
            if (imagesRef.current) {
                imagesRef.current.forEach(url => {
                    if (url && url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                    }
                });
            }
        };
    }, []);

    const cropperRef = useRef<ReactCropperElement>(null);

    const getPaperStyle = () => {
        if (pageSize === 'fit') return {};
        let w = 210, h = 297;
        if (pageSize === 'letter') { w = 216; h = 279; }
        if (pageSize === 'legal') { w = 216; h = 356; }
        if (orientation === 'l') return { aspectRatio: `${h}/${w}` };
        return { aspectRatio: `${w}/${h}` };
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: string[] = [];
            Array.from(files).forEach((file: File) => {
                if (file.type.startsWith('image/')) {
                    newImages.push(URL.createObjectURL(file));
                }
            });
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        const urlToCheck = images[index];
        if (urlToCheck && urlToCheck.startsWith('blob:')) {
            URL.revokeObjectURL(urlToCheck);
        }
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const moveImage = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const newImages = [...images];
        const temp = newImages[fromIndex];
        newImages[fromIndex] = newImages[toIndex];
        newImages[toIndex] = temp;
        setImages(newImages);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDropItem = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedItemIndex !== null) {
            moveImage(draggedItemIndex, targetIndex);
            setDraggedItemIndex(null);
        }
    };

    const handleDropContainer = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedItemIndex !== null) {
            moveImage(draggedItemIndex, images.length - 1);
            setDraggedItemIndex(null);
        }
    };

    const handleTouchStart = (e: React.TouchEvent, index: number) => {
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.no-drag')) return;
        const touch = e.touches[0];
        setStartTouch({ x: touch.clientX, y: touch.clientY });
        setDraggedItemIndex(index);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (draggedItemIndex === null) return;
        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];
        setTouchOffset({
            x: touch.clientX - startTouch.x,
            y: touch.clientY - startTouch.y
        });
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (draggedItemIndex === null) return;

        const touch = e.changedTouches[0];
        const draggedElem = e.currentTarget;

        const originalVisibility = draggedElem.style.visibility;
        draggedElem.style.visibility = 'hidden';

        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        draggedElem.style.visibility = originalVisibility;

        const closestItem = targetElement?.closest('[data-index]');

        if (closestItem) {
            const targetIndexStr = closestItem.getAttribute('data-index');
            if (targetIndexStr) {
                const targetIndex = parseInt(targetIndexStr, 10);
                moveImage(draggedItemIndex, targetIndex);
            }
        }

        setDraggedItemIndex(null);
        setTouchOffset({ x: 0, y: 0 });
    };

    const handleCropSave = () => {
        const cropper = cropperRef.current?.cropper;
        if (typeof cropper !== "undefined" && editIndex !== null) {
            const canvas = cropper.getCroppedCanvas({
                maxWidth: 4096, maxHeight: 4096,
                imageSmoothingEnabled: true, imageSmoothingQuality: 'high',
            });
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 1.0);
            const updatedImages = [...images];
            updatedImages[editIndex] = croppedDataUrl;
            setImages(updatedImages);
            setEditIndex(null);
        }
    };

    const generatePDF = async () => {
        if (images.length === 0) return;
        setIsGenerating(true);
        try {
            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                });
            };
            let pdf: jsPDF;
            if (pageSize === 'fit') {
                const firstImg = await loadImage(images[0]);
                const widthMm = firstImg.width * 0.264583;
                const heightMm = firstImg.height * 0.264583;
                const orient = widthMm > heightMm ? 'l' : 'p';
                pdf = new jsPDF(orient, 'mm', [widthMm, heightMm]);
                pdf.addImage(firstImg, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
                for (let i = 1; i < images.length; i++) {
                    const img = await loadImage(images[i]);
                    const wMm = img.width * 0.264583;
                    const hMm = img.height * 0.264583;
                    const orient = wMm > hMm ? 'l' : 'p';
                    pdf.addPage([wMm, hMm], orient);
                    pdf.addImage(img, 'JPEG', 0, 0, wMm, hMm, undefined, 'FAST');
                }
            } else {
                pdf = new jsPDF(orientation, 'mm', pageSize);
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = useMargin ? 15 : 0;
                const workWidth = pageWidth - (margin * 2);
                const workHeight = pageHeight - (margin * 2);
                for (let i = 0; i < images.length; i++) {
                    const img = await loadImage(images[i]);
                    const imgRatio = img.width / img.height;
                    const workRatio = workWidth / workHeight;
                    let finalWidth = workWidth, finalHeight = workHeight;
                    if (imgRatio > workRatio) finalHeight = workWidth / imgRatio;
                    else finalWidth = workHeight * imgRatio;
                    const x = margin + (workWidth - finalWidth) / 2;
                    const y = margin + (workHeight - finalHeight) / 2;
                    if (i > 0) pdf.addPage();
                    pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
                }
            }
            const finalName = fileName.trim() ? `${fileName}.pdf` : 'Dokumen.pdf';
            pdf.save(finalName);
        } catch (error: any) {
            console.error(error);
            showToast(`Gagal convert PDF: ${error instanceof Error ? error.message : String(error)}`, 'error');
        }
        finally { setIsGenerating(false); }
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <div className="mx-auto max-w-7xl mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors font-bold group"
                >
                    <div className="p-2 rounded-full bg-gray-900 group-hover:bg-gray-800 border border-gray-800">
                        <ArrowLeft size={20} />
                    </div>
                    <span>Kembali</span>
                </button>
            </div>

            <div className="mx-auto max-w-6xl text-left">
                <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">

                    <div className="w-full lg:flex-1 space-y-8">
                        <div className="bg-gray-900/50 border-2 border-dashed border-gray-700 hover:border-yellow-400 rounded-2xl p-6 transition-all duration-300 group relative cursor-pointer active:scale-[0.98]">
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex flex-col items-center text-gray-500 group-hover:text-yellow-400 transition-colors">
                                <div className="bg-gray-800 p-3 rounded-full mb-3 group-hover:bg-yellow-400/10 transition-colors">
                                    <div className="hidden md:block"><Upload size={32} /></div>
                                    <div className="md:hidden"><Camera size={24} /></div>
                                </div>
                                <h3 className="font-bold text-lg text-white mb-1 text-center">Upload Foto</h3>
                                <p className="text-xs text-center">Klik atau tarik gambar</p>
                            </div>
                        </div>

                        {images.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <FileText className="text-yellow-400" size={20} /> Preview
                                    </h3>
                                    <button onClick={() => setImages([])} className="text-red-400 text-xs font-medium hover:underline">Hapus Semua</button>
                                </div>
                                <div
                                    id="grid-container"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDropContainer}
                                    className="grid grid-cols-2 sm:grid-cols-3 gap-6 pb-12"
                                >
                                    {images.map((img, idx) => {
                                        const isFitMode = pageSize === 'fit';
                                        const isDragged = draggedItemIndex === idx;
                                        return (
                                            <div
                                                key={idx}
                                                data-index={idx}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, idx)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDropItem(e, idx)}
                                                onDragEnd={() => setDraggedItemIndex(null)}
                                                onTouchStart={(e) => handleTouchStart(e, idx)}
                                                onTouchMove={handleTouchMove}
                                                onTouchEnd={handleTouchEnd}
                                                className={`relative flex flex-col gap-2 group cursor-grab active:cursor-grabbing touch-none
                                                    ${isDragged ? 'z-[100]' : 'z-0 transition-all duration-200'}`}
                                                style={{
                                                    transform: isDragged ? `translate(${touchOffset.x}px, ${touchOffset.y}px)` : undefined,
                                                }}
                                            >
                                                <div className={`rounded-lg border transition-all duration-300 pointer-events-none 
                                                    ${isFitMode ? 'bg-transparent border-gray-700 p-0' : 'bg-gray-800/50 border-gray-700/50 p-2 md:p-4'}
                                                    ${isDragged ? 'shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-white/40 ring-2 ring-white/20' : 'shadow-none border-gray-700/50'}`}
                                                >
                                                    <div className={`relative overflow-hidden transition-all duration-500 ease-in-out mx-auto ${isFitMode ? 'w-full h-auto bg-transparent shadow-none' : 'w-full bg-white shadow-xl rounded-sm'}`} style={getPaperStyle()}>
                                                        <div className={`transition-all duration-500 ease-in-out ${isFitMode ? 'relative w-full h-auto p-0' : `absolute inset-0 flex items-center justify-center ${useMargin ? 'p-3 md:p-4' : 'p-0'}`}`}>
                                                            <img src={img} alt={`Page ${idx + 1}`} className={`transition-all duration-500 ease-in-out ${isFitMode ? 'w-full h-auto object-contain rounded border border-gray-600' : 'max-w-full max-h-full object-contain shadow-sm'}`} />
                                                        </div>
                                                        {!isFitMode && (<div className="absolute top-1 left-1 bg-black/50 px-1.5 rounded text-[8px] font-mono text-white">{idx + 1}</div>)}
                                                    </div>
                                                    {isFitMode && (<div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white border border-gray-500">Hal {idx + 1}</div>)}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditIndex(idx)} className="flex-1 bg-gray-800 hover:bg-blue-900 text-gray-300 hover:text-white py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-gray-700"><CropIcon size={12} /> Edit</button>
                                                    <button onClick={() => removeImage(idx)} className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-400 px-3 py-1.5 rounded text-xs transition-colors border border-gray-700"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-80 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 pb-4 border-b border-gray-800">
                                <Settings2 size={20} className="text-yellow-400" /> Settings
                            </h3>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama File</label>
                                <div className="relative">
                                    <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-9 text-white text-sm focus:border-yellow-400 outline-none transition-all" placeholder="Nama file..." />
                                    <Pencil size={14} className="absolute left-3 top-3.5 text-gray-500" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ukuran Kertas</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['a4', 'legal', 'letter', 'fit'].map((size) => (
                                        <button key={size} onClick={() => setPageSize(size)} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${pageSize === size ? 'bg-yellow-400 text-black border-yellow-400 scale-[1.02]' : 'bg-black text-gray-400 border-gray-700 hover:border-gray-500'}`}>{size === 'legal' ? 'Legal' : size}</button>
                                    ))}
                                </div>
                            </div>
                            <div className={`space-y-6 transition-all duration-500 ease-in-out overflow-hidden ${pageSize === 'fit' ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tata letak</label>
                                    <div className="flex bg-black rounded-lg p-1 border border-gray-700">
                                        <button onClick={() => setOrientation('p')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${orientation === 'p' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Smartphone size={14} /> Portrait</button>
                                        <button onClick={() => setOrientation('l')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${orientation === 'l' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Monitor size={14} /> Landscape</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Margin</label>
                                    <div className="flex bg-black rounded-lg p-1 border border-gray-700">
                                        <button onClick={() => setUseMargin(true)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${useMargin ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Scaling size={14} /> Ada</button>
                                        <button onClick={() => setUseMargin(false)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${!useMargin ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Scan size={14} /> Gak ada</button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={generatePDF} disabled={images.length === 0 || isGenerating} className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-6 ${images.length === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg border border-yellow-400 hover:shadow-yellow-400/20 active:scale-95'}`}>
                                {isGenerating ? <span>Memproses...</span> : <><FileDown size={18} /> <span>Download PDF</span></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {editIndex !== null && images[editIndex] && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <CropIcon className="text-yellow-400" size={20} /> Edit Foto
                            </h3>
                            <button
                                onClick={() => setEditIndex(null)}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 bg-black/50 relative overflow-hidden flex items-center justify-center p-4">
                            <Cropper
                                ref={cropperRef}
                                src={images[editIndex]}
                                style={{ height: '100%', width: '100%' }}
                                aspectRatio={undefined}
                                guides={true}
                                viewMode={1}
                                dragMode="move"
                                background={false}
                                className="h-full w-full"
                            />
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditIndex(null)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCropSave}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Check size={18} /> Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoToPdfTool;
