import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';

const PlaceholderTool: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mx-auto max-w-7xl w-full mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors font-bold group"><div className="p-2 rounded-full bg-gray-900 group-hover:bg-gray-800 border border-gray-800"><ArrowLeft size={20} /></div><span>Kembali</span></button>
        </div>
        <div className="bg-gray-900/50 p-12 rounded-3xl border border-gray-800 flex flex-col items-center max-w-lg mx-auto"><div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 text-yellow-400"><Construction size={48} /></div><h2 className="text-3xl font-bold text-white mb-2">{title}</h2><p className="text-gray-400">Belom jadi, balik lagi nanti.</p></div>
    </div>
);

export default PlaceholderTool;
