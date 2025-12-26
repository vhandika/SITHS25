import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
    Upload, FileDown, Trash2, FileText, Crop as CropIcon, Check, X,
    Pencil, ImagePlus, Camera, Settings2, Printer,
    Smartphone, Monitor, Scaling, Scan,
    FileCode, Files, FilePenLine, ArrowLeft, Construction
} from 'lucide-react';
import Cropper, { ReactCropperElement } from "react-cropper";

type ToolType = 'menu' | 'photo' | 'code' | 'merge' | 'edit';

const PhotoToPdfTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
        } catch (error) { alert("Gagal convert PDF."); }
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
        </div>
    );
};

const THEME_COLORS = {
    keyword: [197, 134, 192],
    function: [220, 220, 170],
    string: [206, 145, 120],
    number: [181, 206, 168],
    comment: [106, 153, 85],
    text: [212, 212, 212],
    plain: [0, 0, 0]
};

const PDF_CONFIG = {
    MARGIN: 30,
    LINE_HEIGHT_FACTOR: 1.2,
    HEADER_HEIGHT: 25,
    BLOCK_GAP: 15
};

const DEFAULT_PYTHON_CODE = `# Contoh
def total_bayar():
    print("--- Total Bayar Restoran ---")
    makanan = float(input("Total makanan: "))
    minuman = float(input("Total minuman: "))
    ppn = float(input("PPN (tanpa persen): "))
    total = makanan + minuman
    total_bayar = total + (total * ppn / 100)
    print("----------------------------------------")
    print(f"Total yang harus dibayar: {total_bayar}")
total_bayar()`;

const DEFAULT_JS_CODE = `// Contoh
print("--- Menghitung gaji karyawan ---");
const nama = await input("Masukkan nama karyawan: ");
const jam_kerja = Number(await input("Jumlah jam kerja: "));
const upah = Number(await input("Upah per jam: "));
const gaji_pokok = jam_kerja * upah;
print("--------------------------------");
print(\`Karyawan \${nama},\`);
print(\`Mendapatkan Gaji Pokok: Rp \${gaji_pokok}\`);`;

const CodeToPdfTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [code, setCode] = useState<string>(() => localStorage.getItem('pdf_code_content') || DEFAULT_PYTHON_CODE.replace(/\t/g, '    '));
    const [fileName, setFileName] = useState<string>(() => localStorage.getItem('pdf_code_filename') || `CODE_${new Date().toISOString().slice(0, 10)}`);
    const [fontSize, setFontSize] = useState<number>(() => Number(localStorage.getItem('pdf_code_fontsize')) || 11);
    const [language, setLanguage] = useState<'javascript' | 'python'>(() => (localStorage.getItem('pdf_code_language') as 'javascript' | 'python') || 'python');
    const [pageSize, setPageSize] = useState<string>(() => localStorage.getItem('pdf_code_pagesize') || 'a4');
    const [bgTheme, setBgTheme] = useState<string>(() => localStorage.getItem('pdf_code_bgtheme') || '#000000');
    const [isColored, setIsColored] = useState<boolean>(() => localStorage.getItem('pdf_code_iscolored') !== 'false');
    const [pythonStdin, setPythonStdin] = useState(() => localStorage.getItem('pdf_code_stdin') || "100000\n25000\n10");

    useEffect(() => {
        localStorage.setItem('pdf_code_content', code);
        localStorage.setItem('pdf_code_filename', fileName);
        localStorage.setItem('pdf_code_fontsize', String(fontSize));
        localStorage.setItem('pdf_code_language', language);
        localStorage.setItem('pdf_code_pagesize', pageSize);
        localStorage.setItem('pdf_code_bgtheme', bgTheme);
        localStorage.setItem('pdf_code_iscolored', String(isColored));
        localStorage.setItem('pdf_code_stdin', pythonStdin);
    }, [code, fileName, fontSize, language, pageSize, bgTheme, isColored, pythonStdin]);

    const [terminalLogs, setTerminalLogs] = useState<{ type: 'output' | 'user-input' | 'system'; text: string }[]>([]);
    const [isWaitingInput, setIsWaitingInput] = useState(false);
    const [userInput, setUserInput] = useState("");
    const inputResolverRef = useRef<((value: string) => void) | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [isRunning, setIsRunning] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isLightBackground = (hex: string) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return ((r * 299 + g * 587 + b * 114) / 1000) > 155;
    };

    const handleEditorScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const newVal = code.substring(0, start) + "    " + code.substring(end);
            setCode(newVal);
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 4;
            }, 0);
        }
    };

    const tokenizeLine = (line: string) => {
        if (!isColored) return [{ text: line, type: 'text' as keyof typeof THEME_COLORS }];
        const regex = /('.*?'|".*?"|#.*|\/\/.*|\b\d+\b|\b(?:def|class|return|if|else|elif|import|from|print|input|const|let|var|function|async|await|for|while|in)\b|[(){}[\].,:;+\-*/=]|[^\s\w]|[a-zA-Z_]\w*|\s+)/g;
        const matches = line.match(regex);
        if (!matches) return [{ text: line, type: 'text' as keyof typeof THEME_COLORS }];
        return matches.map(part => {
            let type: keyof typeof THEME_COLORS = 'text';
            if (/^('.*'|".*")$/.test(part)) type = 'string';
            else if (/^(#.*|\/\/.*)$/.test(part)) type = 'comment';
            else if (/^\d+$/.test(part)) type = 'number';
            else if (/^(def|class|return|if|else|elif|import|from|const|let|var|function|async|await|for|while|in)$/.test(part)) type = 'keyword';
            else if (/^(print|input|console|log|map|filter|int|float|str)$/.test(part)) type = 'function';
            return { text: part, type };
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result;
                if (typeof text === 'string') {
                    setCode(text.replace(/\t/g, '    '));
                    setFileName(file.name.split('.').slice(0, -1).join('.'));
                    if (file.name.endsWith('.js')) setLanguage('javascript');
                    if (file.name.endsWith('.py')) setLanguage('python');
                }
            };
            reader.readAsText(file);
        }
    };

    const downloadSourceCode = () => {
        if (!code.trim()) return;
        const extension = language === 'python' ? '.py' : '.js';
        const finalName = (fileName.trim() || 'source_code') + extension;
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const printToTerminal = (text: string, type: 'output' | 'system' = 'output') => {
        setTerminalLogs(prev => [...prev, { type, text }]);
    };

    const waitForInput = async (promptText: string): Promise<string> => {
        if (promptText) printToTerminal(promptText, 'output');
        setIsWaitingInput(true);
        return new Promise((resolve) => {
            inputResolverRef.current = resolve;
        });
    };

    const handleUserEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = userInput;
            setTerminalLogs(prev => [...prev, { type: 'user-input', text: val }]);
            setUserInput("");
            setIsWaitingInput(false);
            if (inputResolverRef.current) {
                inputResolverRef.current(val);
                inputResolverRef.current = null;
            }
        }
    };

    const runCode = async () => {
        setTerminalLogs([{ type: 'system', text: `> Running ${language}...` }]);
        setIsRunning(true);
        if (language === 'javascript') {
            try {
                const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
                const wrappedFn = new AsyncFunction('print', 'input', code);
                await wrappedFn((t: any) => printToTerminal(String(t)), waitForInput);
                printToTerminal("> Finished.", 'system');
            } catch (e: any) {
                printToTerminal(`Error: ${e.message}`, 'output');
            }
        } else {
            try {
                const pythonWrapper = `import sys\nimport builtins\ndef input(prompt=''):\n    if prompt: sys.stdout.write(str(prompt)); sys.stdout.flush()\n    line = sys.stdin.readline()\n    if line: sys.stdout.write(line); sys.stdout.flush(); return line.rstrip('\\n')\n    return ''\nbuiltins.input = input\n`;
                const finalCode = pythonWrapper + "\n" + code;
                const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: 'python', version: '3.10.0', files: [{ content: finalCode }], stdin: pythonStdin })
                });
                const data = await response.json();
                if (data.run) {
                    if (data.run.stdout) data.run.stdout.split('\n').forEach((line: string) => printToTerminal(line, 'output'));
                    if (data.run.stderr) printToTerminal(data.run.stderr, 'output');
                } else {
                    printToTerminal("Error: Failed to execute.", 'output');
                }
            } catch (e) { printToTerminal("Offline / API Error.", 'output'); }
        }
        setIsRunning(false);
    };

    const clearTerminal = () => { setTerminalLogs([]); setIsWaitingInput(false); };

    const calculateLines = (rawLines: string[], contentWidth: number, getStringWidth: (s: string) => number) => {
        const processedLines: { tokens: any[], isCode: boolean }[] = [];
        rawLines.forEach(line => {
            const tokens = isColored ? tokenizeLine(line) : [{ text: line, type: 'text' }];
            let lineBuffer: any[] = [];
            let currentLineWidth = 0;
            tokens.forEach(token => {
                const tokenWidth = getStringWidth(token.text);
                if (currentLineWidth + tokenWidth <= contentWidth) {
                    lineBuffer.push({ ...token, width: tokenWidth });
                    currentLineWidth += tokenWidth;
                } else if (tokenWidth > contentWidth) {
                    if (lineBuffer.length > 0) { processedLines.push({ tokens: [...lineBuffer], isCode: true }); lineBuffer = []; currentLineWidth = 0; }
                    const chars = token.text.split('');
                    let tempStr = ""; let tempWidth = 0;
                    chars.forEach(char => {
                        const charW = getStringWidth(char);
                        if (tempWidth + charW > contentWidth) {
                            lineBuffer.push({ text: tempStr, type: token.type, width: tempWidth });
                            processedLines.push({ tokens: [...lineBuffer], isCode: true });
                            lineBuffer = []; tempStr = char; tempWidth = charW;
                        } else { tempStr += char; tempWidth += charW; }
                    });
                    if (tempStr) { lineBuffer.push({ text: tempStr, type: token.type, width: tempWidth }); currentLineWidth = tempWidth; }
                } else {
                    processedLines.push({ tokens: [...lineBuffer], isCode: true });
                    lineBuffer = [{ ...token, width: tokenWidth }];
                    currentLineWidth = tokenWidth;
                }
            });
            processedLines.push({ tokens: [...lineBuffer], isCode: true });
        });
        return processedLines;
    };

    const generatePDF = () => {
        if (!code.trim()) return;
        setIsGenerating(true);
        try {
            const safeCode = code.replace(/\t/g, '    ');
            const pdf = new jsPDF('p', 'pt', pageSize);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = PDF_CONFIG.MARGIN;
            const contentWidth = pageWidth - (margin * 2);
            pdf.setFont("Courier", "normal");
            pdf.setFontSize(fontSize);
            const getStringWidth = (s: string) => pdf.getStringUnitWidth(s) * fontSize;
            const hexToRgb = (hex: string) => {
                const bigint = parseInt(hex.replace('#', ''), 16);
                return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
            };
            const bgRgb = hexToRgb(bgTheme);
            const isLight = isLightBackground(bgTheme);
            const lineHeight = fontSize * PDF_CONFIG.LINE_HEIGHT_FACTOR;
            let cursorY = margin;
            const renderProcessedLines = (lines: any[], isHeader: boolean, title: string) => {
                if (lines.length === 0) return;
                if (cursorY + PDF_CONFIG.HEADER_HEIGHT > pageHeight - margin) { pdf.addPage(); cursorY = margin; }
                if (isHeader) {
                    pdf.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
                    pdf.rect(margin, cursorY, contentWidth, PDF_CONFIG.HEADER_HEIGHT, 'F');
                    pdf.setFontSize(8);
                    pdf.setTextColor(isLight ? 100 : 150);
                    pdf.text(title, margin + 5, cursorY + 15);
                    cursorY += PDF_CONFIG.HEADER_HEIGHT;
                    pdf.setFontSize(fontSize);
                }
                lines.forEach(lineObj => {
                    if (cursorY + lineHeight > pageHeight - margin) { pdf.addPage(); cursorY = margin; }
                    pdf.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
                    pdf.rect(margin, cursorY, contentWidth, lineHeight, 'F');
                    let currentX = margin + 5;
                    lineObj.tokens.forEach((t: any) => {
                        if (isColored) {
                            const rgb = THEME_COLORS[t.type as keyof typeof THEME_COLORS] || THEME_COLORS.text;
                            if (t.type === 'text' && isLight) pdf.setTextColor(0, 0, 0);
                            else pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
                        } else pdf.setTextColor(isLight ? 0 : 255);
                        pdf.text(t.text, currentX, cursorY + fontSize - 3);
                        currentX += t.width;
                    });
                    cursorY += lineHeight;
                });
            };
            const codeLines = calculateLines(safeCode.split('\n'), contentWidth - 10, getStringWidth);
            renderProcessedLines(codeLines, true, "SOURCE CODE");
            const termLines = terminalLogs.filter(l => l.type !== 'system').map(l => l.type === 'user-input' ? `> ${l.text}` : l.text);
            if (termLines.length > 0) {
                if (cursorY + PDF_CONFIG.BLOCK_GAP < pageHeight - margin) cursorY += PDF_CONFIG.BLOCK_GAP;
                const outLines = calculateLines(termLines, contentWidth - 10, getStringWidth);
                renderProcessedLines(outLines, true, "OUTPUT");
            }
            pdf.save(fileName.trim() ? `${fileName}.pdf` : 'Code.pdf');
        } catch (error) { alert("Gagal render PDF."); }
        finally { setIsGenerating(false); }
    };

    const PdfPreviewComponent = () => {
        const isLight = isLightBackground(bgTheme);
        const headerColor = isLight ? '#666' : '#888';
        const getPaperDimensions = () => {
            switch (pageSize) {
                case 'legal': return { w: 612, h: 1008 };
                case 'letter': return { w: 612, h: 792 };
                default: return { w: 595, h: 842 };
            }
        };
        const dim = getPaperDimensions();
        const MARGIN = PDF_CONFIG.MARGIN;
        const CONTENT_WIDTH = dim.w - (MARGIN * 2);
        const PAGE_HEIGHT = dim.h;
        const LINE_HEIGHT = fontSize * PDF_CONFIG.LINE_HEIGHT_FACTOR;
        const getStringWidth = (s: string) => s.length * (fontSize * 0.60004);
        const simulatePagination = () => {
            const pages: React.ReactNode[][] = [];
            let currentPageNodes: React.ReactNode[] = [];
            let currentY = MARGIN;
            const addToPage = (node: React.ReactNode, height: number) => {
                if (currentY + height > PAGE_HEIGHT - MARGIN) { pages.push(currentPageNodes); currentPageNodes = []; currentY = MARGIN; }
                currentPageNodes.push(node); currentY += height;
            };
            const renderSection = (lines: any[], title: string) => {
                const headerNode = <div key={`head-${title}-${Math.random()}`} style={{ height: `${PDF_CONFIG.HEADER_HEIGHT}pt`, backgroundColor: bgTheme, color: headerColor, fontSize: '8pt', fontWeight: 'bold', display: 'flex', alignItems: 'center', paddingLeft: '5pt', boxSizing: 'border-box' }}>{title}</div>;
                addToPage(headerNode, PDF_CONFIG.HEADER_HEIGHT);
                lines.forEach((lineObj, idx) => {
                    const lineNode = <div key={`ln-${title}-${idx}`} style={{ height: `${LINE_HEIGHT}pt`, backgroundColor: bgTheme, display: 'flex', alignItems: 'baseline', paddingLeft: '5pt', whiteSpace: 'pre', overflow: 'hidden', fontFamily: 'Courier', fontSize: `${fontSize}pt` }}>
                        {lineObj.tokens.map((t: any, j: number) => {
                            const rgb = THEME_COLORS[t.type as keyof typeof THEME_COLORS] || THEME_COLORS.text;
                            const color = (t.type === 'text' && isLight) ? 'black' : `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
                            return <span key={j} style={{ color }}>{t.text}</span>
                        })}
                    </div>;
                    addToPage(lineNode, LINE_HEIGHT);
                });
            };
            const safeCode = code.replace(/\t/g, '    ');
            const codeLines = calculateLines(safeCode.split('\n'), CONTENT_WIDTH - 10, getStringWidth);
            renderSection(codeLines, "SOURCE CODE");
            const termLines = terminalLogs.filter(l => l.type !== 'system').map(l => l.type === 'user-input' ? `> ${l.text}` : l.text);
            if (termLines.length > 0) {
                if (currentY + PDF_CONFIG.BLOCK_GAP < PAGE_HEIGHT - MARGIN) { currentPageNodes.push(<div key="gap" style={{ height: `${PDF_CONFIG.BLOCK_GAP}pt` }}></div>); currentY += PDF_CONFIG.BLOCK_GAP; }
                const outLines = calculateLines(termLines, CONTENT_WIDTH - 10, getStringWidth);
                renderSection(outLines, "OUTPUT");
            }
            if (currentPageNodes.length > 0) pages.push(currentPageNodes);
            return pages;
        };
        const pages = simulatePagination();
        return (
            <div className="w-full bg-gray-500/20 p-8 overflow-auto rounded-xl flex flex-col items-center gap-8 min-h-[60vh] max-h-[80vh] custom-scrollbar">
                {pages.map((pageNodes, i) => (
                    <div key={i} className="bg-white shadow-2xl relative shrink-0 transition-transform duration-300 origin-top" style={{ width: `${dim.w}pt`, height: `${dim.h}pt`, padding: `${MARGIN}pt`, boxSizing: 'border-box', transform: 'scale(0.85)', marginBottom: '-50px' }}><div style={{ width: '100%', height: '100%' }}>{pageNodes}</div><div className="absolute bottom-2 right-4 text-[10px] text-gray-400 font-sans">Page {i + 1}</div></div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300 flex flex-col h-full">
            <div className="mx-auto max-w-7xl w-full mb-4 px-4 sm:px-0">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors font-bold group"><div className="p-2 rounded-full bg-gray-900 group-hover:bg-gray-800 border border-gray-800"><ArrowLeft size={20} /></div><span>Kembali</span></button>
            </div>
            <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row gap-6 px-4 sm:px-0 pb-12">
                <div className="w-full lg:flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-gray-900 p-1.5 rounded-lg border border-gray-800 w-full sm:w-fit gap-2">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 text-xs font-bold rounded-md ${activeTab === 'editor' ? 'bg-yellow-400 text-black' : 'text-gray-400'}`}>Editor</button>
                            <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-xs font-bold rounded-md ${activeTab === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>Preview</button>
                        </div>
                        <button onClick={runCode} disabled={isRunning} className="lg:hidden px-4 py-2 text-xs font-bold rounded-md bg-green-600 text-white active:scale-95 transition-transform flex items-center gap-1">
                            {isRunning ? "Wait" : "Run"}
                        </button>
                    </div>
                    {activeTab === 'editor' ? (
                        <div className="flex flex-col gap-4">
                            <div className="border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[50vh] relative transition-colors duration-300" style={{ backgroundColor: bgTheme }}>
                                <div className="bg-black/20 border-b border-white/10 p-2 flex justify-between items-center backdrop-blur-sm z-10 relative"><span className={`text-xs font-mono ml-2 ${isLightBackground(bgTheme) ? 'text-black' : 'text-gray-300'}`}>main.{language === 'python' ? 'py' : 'js'}</span></div>
                                <div className="relative flex-1 w-full h-full overflow-hidden">
                                    <pre ref={highlightRef} aria-hidden="true" className={`absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none custom-scrollbar overflow-hidden ${isColored ? 'opacity-100' : 'opacity-0'}`}>
                                        {code.split('\n').map((line, i) => (
                                            <div key={i}>{tokenizeLine(line).map((t, j) => {
                                                if (t.type === 'text' && isLightBackground(bgTheme)) return <span key={j} style={{ color: 'black' }}>{t.text}</span>;
                                                const rgb = THEME_COLORS[t.type as keyof typeof THEME_COLORS] || THEME_COLORS.text;
                                                return <span key={j} style={{ color: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }}>{t.text}</span>
                                            })}{line.length === 0 && <br />}</div>
                                        ))}</pre>
                                    <textarea ref={textareaRef} onScroll={handleEditorScroll} value={code} onChange={handleCodeChange} onKeyDown={handleKeyDown} className={`absolute inset-0 w-full h-full p-4 font-mono text-sm leading-relaxed resize-none outline-none bg-transparent whitespace-pre-wrap break-words custom-scrollbar ${isColored ? `text-transparent caret-${isLightBackground(bgTheme) ? 'black' : 'white'}` : (isLightBackground(bgTheme) ? 'text-black' : 'text-[#d4d4d4]')}`} spellCheck={false} />
                                </div>
                                <button onClick={runCode} disabled={isRunning} className="hidden lg:flex absolute bottom-6 right-6 bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-full shadow-lg font-bold z-10 items-center gap-2">{isRunning ? "Running..." : "Run"}</button>
                            </div>
                            {language === 'python' && (
                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4"><label className="block text-xs font-bold text-gray-400 mb-2 flex justify-between"><span>Input</span><span className="text-[10px] text-gray-500">Ketik input per baris</span></label>
                                    <textarea value={pythonStdin} onChange={(e) => setPythonStdin(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-gray-300 font-mono text-xs h-20 outline-none focus:border-blue-500" placeholder="Contoh:&#10;1&#10;2" />
                                </div>)}
                            <div className="border border-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-[25vh] max-h-[40vh] transition-colors duration-300" style={{ backgroundColor: bgTheme }}><div className="bg-black/20 px-3 py-1.5 flex justify-between items-center border-b border-white/10"><span className={`text-[10px] font-bold ${isLightBackground(bgTheme) ? 'text-green-800' : 'text-green-500'}`}>Terminal</span><button onClick={clearTerminal} className="text-gray-500 hover:text-red-500"><Trash2 size={12} /></button></div><div className="flex-1 p-4 overflow-y-auto font-mono text-xs custom-scrollbar">
                                {terminalLogs.map((log, idx) => (
                                    <div key={idx} className={`mb-1 whitespace-pre-wrap break-words ${log.type === 'system' ? 'text-gray-500 italic' : log.type === 'user-input' ? (isLightBackground(bgTheme) ? 'text-blue-700 font-bold' : 'text-cyan-400 font-bold') : (isLightBackground(bgTheme) ? 'text-green-800' : 'text-green-400')}`}>{log.type === 'user-input' && <span className="mr-2 opacity-50">&gt;</span>}{log.text}</div>
                                ))}
                                {isWaitingInput && (
                                    <div className="flex items-center"><span className={`mr-2 font-bold ${isLightBackground(bgTheme) ? 'text-blue-700' : 'text-cyan-400'}`}>&gt;</span><input autoFocus type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={handleUserEnter} className={`flex-1 bg-transparent border-none outline-none font-mono ${isLightBackground(bgTheme) ? 'text-blue-700' : 'text-cyan-400'}`} /></div>
                                )}</div></div></div>
                    ) : <PdfPreviewComponent />}
                </div>
                <div className="w-full lg:w-72 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-xl sticky top-24">
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2 pb-3 border-b border-gray-800"><Settings2 size={18} className="text-yellow-400" /> Settings</h3>
                        <div className="space-y-5">
                            <label className="block w-full cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-center transition-all group"><div className="flex flex-col items-center gap-1"><Upload size={20} className="text-gray-400 group-hover:text-yellow-400" /><span className="text-xs font-bold text-gray-300">Upload Code</span></div><input type="file" className="hidden" onChange={handleFileUpload} /></label>
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Nama File</label><div className="relative"><input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-xs outline-none focus:border-yellow-400" placeholder="Nama file..." /><Pencil size={12} className="absolute right-2 top-2.5 text-gray-500" /></div></div>
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Ukuran kertas</label><select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-xs outline-none focus:border-yellow-400"><option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option></select></div>
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Background</label><div className="flex items-center gap-2 bg-black p-2 rounded border border-gray-700"><input type="color" value={bgTheme} onChange={(e) => setBgTheme(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" /><span className="text-xs text-gray-300 font-mono">{bgTheme}</span></div></div>
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Bahasa</label><div className="flex bg-black rounded p-1 border border-gray-700">
                                <button onClick={() => { setLanguage('javascript'); if (code === DEFAULT_PYTHON_CODE) setCode(DEFAULT_JS_CODE); }} className={`flex-1 py-1 rounded text-[10px] ${language === 'javascript' ? 'bg-yellow-400 text-black' : 'text-gray-500'}`}>JS</button>
                                <button onClick={() => { setLanguage('python'); if (code === DEFAULT_JS_CODE) setCode(DEFAULT_PYTHON_CODE); }} className={`flex-1 py-1 rounded text-[10px] ${language === 'python' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}>Py</button>
                            </div></div>
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Warna</label><div className="flex bg-black rounded p-1 border border-gray-700">
                                <button onClick={() => setIsColored(true)} className={`flex-1 py-1 rounded text-[10px] ${isColored ? 'bg-purple-500 text-white' : 'text-gray-500'}`}>Berwarna</button>
                                <button onClick={() => setIsColored(false)} className={`flex-1 py-1 rounded text-[10px] ${!isColored ? 'bg-white text-black' : 'text-gray-500'}`}>Polosan</button>
                            </div></div>
                            <button onClick={downloadSourceCode} disabled={!code.trim()} className="w-full py-2.5 rounded-lg font-bold text-xs bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-400 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"><FileCode size={16} /> Download .{language === 'python' ? 'py' : 'js'}</button>
                            <button onClick={generatePDF} className="w-full py-3 rounded-lg font-bold text-xs bg-yellow-400 text-black hover:bg-yellow-300 mt-3 flex items-center justify-center gap-2"><FileDown size={16} /> Download PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlaceholderTool: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mx-auto max-w-7xl w-full mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors font-bold group"><div className="p-2 rounded-full bg-gray-900 group-hover:bg-gray-800 border border-gray-800"><ArrowLeft size={20} /></div><span>Kembali</span></button>
        </div>
        <div className="bg-gray-900/50 p-12 rounded-3xl border border-gray-800 flex flex-col items-center max-w-lg mx-auto"><div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 text-yellow-400"><Construction size={48} /></div><h2 className="text-3xl font-bold text-white mb-2">{title}</h2><p className="text-gray-400">Belom jadi, balik lagi nanti.</p></div>
    </div>
);

const PdfTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<ToolType>(() => (localStorage.getItem('pdf_active_tool') as ToolType) || 'menu');

    useEffect(() => {
        localStorage.setItem('pdf_active_tool', activeTool);
    }, [activeTool]);

    if (activeTool === 'menu') {
        return (
            <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans selection:bg-yellow-400 selection:text-black">
                <div className="mx-auto max-w-7xl text-center">
                    <div className="text-center"><div className="flex justify-center items-center gap-4 mb-4"><div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12"><span className="transform skew-x-12"><FileText size={32} /></span></div><h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">PDF Tools</h1></div></div>
                    <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>
                    <div className="mx-auto mt-16 max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={() => setActiveTool('photo')} className="group relative bg-gray-900 border border-gray-800 hover:border-yellow-400 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-2 flex items-center gap-6"><div className="p-4 bg-gray-800 rounded-xl text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors"><ImagePlus size={32} /></div><div><h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">Photo to PDF</h3><p className="text-gray-400 text-sm">Convert foto menjadi file PDF.</p></div></button>
                            <button onClick={() => setActiveTool('code')} className="group relative bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-2 flex items-center gap-6"><div className="p-4 bg-gray-800 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><FileCode size={32} /></div><div><h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-500 transition-colors">Code to PDF</h3><p className="text-gray-400 text-sm">Convert source code menjadi PDF.</p></div></button>
                            <button onClick={() => setActiveTool('merge')} className="group relative bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-2 flex items-center gap-6"><div className="p-4 bg-gray-800 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors"><Files size={32} /></div><div><h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-500 transition-colors">Merge PDF</h3><p className="text-gray-400 text-sm">Merge file PDF.</p></div></button>
                            <button onClick={() => setActiveTool('edit')} className="group relative bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-2 flex items-center gap-6"><div className="p-4 bg-gray-800 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"><FilePenLine size={32} /></div><div><h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-500 transition-colors">Edit PDF</h3><p className="text-gray-400 text-sm">Edit PDF.</p></div></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans selection:bg-yellow-400 selection:text-black">
            {activeTool === 'photo' && <PhotoToPdfTool onBack={() => setActiveTool('menu')} />}
            {activeTool === 'code' && <CodeToPdfTool onBack={() => setActiveTool('menu')} />}
            {activeTool === 'merge' && <PlaceholderTool title="Merge PDF" onBack={() => setActiveTool('menu')} />}
            {activeTool === 'edit' && <PlaceholderTool title="Edit PDF" onBack={() => setActiveTool('menu')} />}
        </div>
    );
};

export default PdfTools;