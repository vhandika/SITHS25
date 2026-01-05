import React, { useState, useEffect } from 'react';
import {
    FileText, ImagePlus,
    FileCode, Files, FilePenLine
} from 'lucide-react';
const PhotoToPdfTool = React.lazy(() => import('../components/PDFTools/PhotoToPdfTool'));
const CodeToPdfTool = React.lazy(() => import('../components/PDFTools/CodeToPdfTool'));
const MergePdfTool = React.lazy(() => import('../components/PDFTools/MergePdfTool'));
const PlaceholderTool = React.lazy(() => import('../components/PDFTools/PlaceholderTool'));

type ToolType = 'menu' | 'photo' | 'code' | 'merge' | 'edit';

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
        <React.Suspense fallback={
            <div className="min-h-screen w-full bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        }>
            <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans selection:bg-yellow-400 selection:text-black">
                {activeTool === 'photo' && <PhotoToPdfTool onBack={() => setActiveTool('menu')} />}
                {activeTool === 'code' && <CodeToPdfTool onBack={() => setActiveTool('menu')} />}
                {activeTool === 'merge' && <MergePdfTool onBack={() => setActiveTool('menu')} />}
                {activeTool === 'edit' && <PlaceholderTool title="Edit PDF" onBack={() => setActiveTool('menu')} />}
            </div>
        </React.Suspense>
    );
};

export default PdfTools;