import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { PDFDocument } from 'pdf-lib';
import {
    Upload, Trash2, Files, ArrowLeft, Settings2, Pencil
} from 'lucide-react';

const MergePdfTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { showToast } = useToast();
    const [files, setFiles] = useState<{ id: string, file: File }[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [fileName, setFileName] = useState<string>(() => localStorage.getItem('pdf_merge_filename') || `MERGED_${new Date().toISOString().slice(0, 10)}`);
    const [pageSize, setPageSize] = useState<string>(() => localStorage.getItem('pdf_merge_pagesize') || 'original');

    useEffect(() => {
        localStorage.setItem('pdf_merge_filename', fileName);
        localStorage.setItem('pdf_merge_pagesize', pageSize);
    }, [fileName, pageSize]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = e.target.files;
        if (uploaded) {
            const newFiles = Array.from(uploaded).filter((f: File) => f.type === 'application/pdf').map(f => ({
                id: Math.random().toString(36).substring(7),
                file: f
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const newFiles = [...files];
        const [moved] = newFiles.splice(fromIndex, 1);
        newFiles.splice(toIndex, 0, moved);
        setFiles(newFiles);
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
            moveFile(draggedItemIndex, targetIndex);
            setDraggedItemIndex(null);
        }
    };

    const handleDropContainer = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedItemIndex !== null) {
            moveFile(draggedItemIndex, files.length - 1);
            setDraggedItemIndex(null);
        } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.type === 'application/pdf');
            if (droppedFiles.length > 0) {
                const newFiles = droppedFiles.map((f: File) => ({
                    id: Math.random().toString(36).substring(7),
                    file: f
                }));
                setFiles(prev => [...prev, ...newFiles]);
            }
        }
    };

    const mergePDFs = async () => {
        if (files.length < 2) return;
        setIsMerging(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const item of files) {
                const arrayBuffer = await item.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);

                if (pageSize === 'original') {
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                } else {
                    let targetWidth = 595.28;
                    let targetHeight = 841.89;
                    if (pageSize === 'letter') { targetWidth = 612; targetHeight = 792; }
                    if (pageSize === 'legal') { targetWidth = 612; targetHeight = 1008; }

                    const embeddedPages = await mergedPdf.embedPdf(pdf, pdf.getPageIndices());
                    embeddedPages.forEach((embeddedPage) => {
                        const page = mergedPdf.addPage([targetWidth, targetHeight]);
                        const { width, height } = embeddedPage;
                        const scale = Math.min(targetWidth / width, targetHeight / height);
                        const scaledWidth = width * scale;
                        const scaledHeight = height * scale;

                        page.drawPage(embeddedPage, {
                            x: (targetWidth - scaledWidth) / 2,
                            y: (targetHeight - scaledHeight) / 2,
                            width: scaledWidth,
                            height: scaledHeight,
                        });
                    });
                }
            }

            const pdfBytes = await mergedPdf.save();

            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.trim() || 'MERGED'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            showToast('Gagal menggabungkan PDF. Pastikan file tidak corrupt.', 'error');
        }
        setIsMerging(false);
    };

    const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);

    return (
        <div className="animate-in fade-in zoom-in duration-300 flex flex-col h-full">
            <div className="mx-auto max-w-7xl w-full mb-4 px-4 sm:px-0">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors font-bold group"><div className="p-2 rounded-full bg-gray-900 group-hover:bg-gray-800 border border-gray-800"><ArrowLeft size={20} /></div><span>Kembali</span></button>
            </div>
            <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row gap-6 px-4 sm:px-0 pb-12">
                <div className="w-full lg:flex-1 flex flex-col gap-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl relative min-h-[500px]" onDragOver={handleDragOver} onDrop={handleDropContainer}>
                        {files.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl m-4 pointer-events-none">
                                <Files size={48} className="mb-4 opacity-50" />
                                <p className="text-sm font-bold">Drop PDF disini</p>
                                <p className="text-xs mt-2">atau gunakan tombol di bawah</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 pb-20">
                                {files.map((file, i) => (
                                    <div key={file.id} draggable onDragStart={(e) => handleDragStart(e, i)} onDragOver={handleDragOver} onDrop={(e) => handleDropItem(e, i)} className={`bg-black border border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:border-yellow-400 transition-all cursor-move ${draggedItemIndex === i ? 'opacity-50' : 'opacity-100'}`}>
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-yellow-900/30 text-yellow-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-200 truncate">{file.file.name}</span>
                                                <span className="text-[10px] text-gray-500">{(file.file.size / 1024).toFixed(1)} KB</span>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFile(i)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <label className="absolute bottom-6 right-6 left-6 cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-black p-4 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 z-10"><Upload size={20} /><span>Tambah PDF</span><input type="file" accept="application/pdf" multiple onChange={handleFileUpload} className="hidden" /></label>
                    </div>
                </div>
                <div className="w-full lg:w-72 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-xl sticky top-24">
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2 pb-3 border-b border-gray-800"><Settings2 size={18} className="text-yellow-400" /> Settings</h3>
                        <div className="space-y-4">
                            <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-2">
                                <div className="flex justify-between items-center"><span className="text-gray-400 text-xs">Total File</span><span className="text-white font-bold">{files.length}</span></div>
                                <div className="w-full h-px bg-gray-800 my-1"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400 text-xs">Est. Total Ukuran</span><span className="text-white font-bold">~{(totalSize / 1024 / 1024).toFixed(2)} MB</span></div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Nama File Output</label>
                                <div className="relative"><input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-xs outline-none focus:border-yellow-400" placeholder="Nama file..." /><Pencil size={12} className="absolute right-2 top-2.5 text-gray-500" /></div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Ukuran Kertas</label>
                                <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-white text-xs outline-none focus:border-yellow-400">
                                    <option value="original">Asli (Original Size)</option>
                                    <option value="a4">A4</option>
                                    <option value="letter">Letter</option>
                                    <option value="legal">Legal</option>
                                </select>
                            </div>

                            <button onClick={mergePDFs} disabled={files.length < 2 || isMerging} className="w-full py-3 rounded-lg font-bold text-xs bg-yellow-400 text-black hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:border disabled:border-gray-800 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                                {isMerging ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Files size={16} />}
                                {isMerging ? "Merging..." : "Merge PDF"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MergePdfTool;
