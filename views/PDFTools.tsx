import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, ImagePlus,
    FileCode, Files, FilePenLine
} from 'lucide-react';
const PhotoToPdfTool = React.lazy(() => import('../components/PDFTools/PhotoToPdfTool'));
const CodeToPdfTool = React.lazy(() => import('../components/PDFTools/CodeToPdfTool'));
const MergePdfTool = React.lazy(() => import('../components/PDFTools/MergePdfTool'));
const PlaceholderTool = React.lazy(() => import('../components/PDFTools/PlaceholderTool'));

type ToolType = 'menu' | 'photo' | 'code' | 'merge' | 'edit';

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth / 12), 100);
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    radius: Math.random() * 2 + 1
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        ctx.beginPath();
                        const opacity = 0.35 - (dist / 140) * 0.35; 
                        ctx.strokeStyle = `rgba(250, 204, 21, ${opacity})`;
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
    );
};

const PdfTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<ToolType>(() => (localStorage.getItem('pdf_active_tool') as ToolType) || 'menu');

    useEffect(() => {
        localStorage.setItem('pdf_active_tool', activeTool);
    }, [activeTool]);

    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
            
            <ParticleBackground />

            <div className="relative z-10">
                {activeTool === 'menu' ? (
                    <div className="mx-auto max-w-7xl text-center">
                        <div className="text-center">
                            <div className="flex justify-center items-center gap-4 mb-4">
                                <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                                    <span className="transform skew-x-12"><FileText size={32} /></span>
                                </div>
                                <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl drop-shadow-lg">PDF Tools</h1>
                            </div>
                        </div>
                        
                        <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                        
                        <div className="mx-auto mt-16 max-w-5xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button onClick={() => setActiveTool('photo')} className="group relative bg-gray-900/60 backdrop-blur-md border border-gray-800 hover:border-yellow-400 hover:bg-gray-800/80 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] hover:-translate-y-2 flex items-center gap-6">
                                    <div className="p-4 bg-gray-800 rounded-xl text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors shadow-md">
                                        <ImagePlus size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">Photo to PDF</h3>
                                        <p className="text-gray-400 text-sm">Convert foto menjadi file PDF.</p>
                                    </div>
                                </button>
                                
                                <button onClick={() => setActiveTool('code')} className="group relative bg-gray-900/60 backdrop-blur-md border border-gray-800 hover:border-blue-500 hover:bg-gray-800/80 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-2 flex items-center gap-6">
                                    <div className="p-4 bg-gray-800 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-md">
                                        <FileCode size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-500 transition-colors">Code to PDF</h3>
                                        <p className="text-gray-400 text-sm">Convert source code menjadi PDF.</p>
                                    </div>
                                </button>
                                
                                <button onClick={() => setActiveTool('merge')} className="group relative bg-gray-900/60 backdrop-blur-md border border-gray-800 hover:border-green-500 hover:bg-gray-800/80 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:-translate-y-2 flex items-center gap-6">
                                    <div className="p-4 bg-gray-800 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors shadow-md">
                                        <Files size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-500 transition-colors">Merge PDF</h3>
                                        <p className="text-gray-400 text-sm">Merge file PDF.</p>
                                    </div>
                                </button>
                                
                                <button onClick={() => setActiveTool('edit')} className="group relative bg-gray-900/60 backdrop-blur-md border border-gray-800 hover:border-purple-500 hover:bg-gray-800/80 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:-translate-y-2 flex items-center gap-6">
                                    <div className="p-4 bg-gray-800 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors shadow-md">
                                        <FilePenLine size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-500 transition-colors">Edit PDF</h3>
                                        <p className="text-gray-400 text-sm">Edit PDF.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <React.Suspense fallback={
                        <div className="flex items-center justify-center min-h-[50vh]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                        </div>
                    }>
                        {activeTool === 'photo' && <PhotoToPdfTool onBack={() => setActiveTool('menu')} />}
                        {activeTool === 'code' && <CodeToPdfTool onBack={() => setActiveTool('menu')} />}
                        {activeTool === 'merge' && <MergePdfTool onBack={() => setActiveTool('menu')} />}
                        {activeTool === 'edit' && <PlaceholderTool title="Edit PDF" onBack={() => setActiveTool('menu')} />}
                    </React.Suspense>
                )}
            </div>
        </div>
    );
};

export default PdfTools;