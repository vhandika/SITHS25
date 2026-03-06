import React, { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, RotateCcw, Award, AlertCircle } from 'lucide-react';

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
                ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        const opacity = 0.2 - (dist / 140) * 0.2;
                        ctx.strokeStyle = `rgba(250, 204, 21, ${opacity})`;
                        ctx.lineWidth = 1;
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

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

type CourseType = 'fisika' | 'matematika' | 'kimia';

interface InputFieldProps {
    label: string;
    field: string;
    value: string;
    onChange: (field: string, value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, field, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-400">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder="0 - 100"
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all placeholder-gray-600"
        />
    </div>
);

const IndexCalculator: React.FC = () => {
    const [course, setCourse] = useState<CourseType>('fisika');
    const [isUP, setIsUP] = useState(false);

    const [scores, setScores] = useState<Record<string, string>>({
        uts: '', uas: '', tugas: '', kuis: '', lce: '',
        up: '', kbf: '', kehadiran: '', proyek: '', kuis1: '', kuis2: ''
    });

    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [finalIndex, setFinalIndex] = useState<string>('-');

    useEffect(() => {
        setScores({
            uts: '', uas: '', tugas: '', kuis: '', lce: '',
            up: '', kbf: '', kehadiran: '', proyek: '', kuis1: '', kuis2: ''
        });
        setFinalScore(null);
        setFinalIndex('-');
    }, [course, isUP]);

    const handleInputChange = (field: string, value: string) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setScores(prev => ({ ...prev, [field]: value }));
        }
    };

    const calculateGrade = () => {
        const val = (field: string) => parseFloat(scores[field]) || 0;

        let total = 0;
        let index = 'E';

        if (course === 'fisika') {
            if (isUP) {
                total = 0.3 * Math.max(val('uts'), val('uas')) + 0.3 * val('up') + 0.15 * val('tugas') + 0.15 * val('kuis') + 0.1 * val('lce');
            } else {
                total = 0.3 * val('uts') + 0.3 * val('uas') + 0.15 * val('tugas') + 0.15 * val('kuis') + 0.1 * val('lce');
            }
        } else if (course === 'matematika') {
            if (isUP) {
                total = 0.3 * ((val('kuis1') + val('kuis2')) / 2) + 0.5 * val('up') + 0.1 * val('uts') + 0.1 * val('uas');
            } else {
                total = 0.35 * val('uts') + 0.35 * val('uas') + 0.1 * val('kbf') + 0.1 * val('kehadiran') + 0.1 * val('proyek');
            }
        } else if (course === 'kimia') {
            if (isUP) {
                total = 0.3 * ((val('kuis1') + val('kuis2')) / 2) + 0.5 * val('up') + 0.1 * val('uts') + 0.1 * val('uas');
            } else {
                total = 0.3 * ((val('kuis1') + val('kuis2')) / 2) + 0.35 * val('uas') + 0.5 * val('uts');
            }
        }

        if (course === 'fisika') {
            if (total >= 75) index = 'A';
            else if (total >= 68) index = 'AB';
            else if (total >= 60) index = 'B';
            else if (total >= 55) index = 'BC';
            else if (total >= 50) index = 'C';
            else if (total >= 45) index = 'D';
            else index = 'E';
        } else if (course === 'matematika') {
            if (total >= 80) index = 'A';
            else if (total >= 73) index = 'AB';
            else if (total >= 65) index = 'B';
            else if (total >= 57) index = 'BC';
            else if (total >= 50) index = 'C';
            else if (total >= 35) index = 'D';
            else index = 'E';
        } else if (course === 'kimia') {
            if (total >= 75) index = 'A';
            else if (total >= 68) index = 'AB';
            else if (total >= 60) index = 'B';
            else if (total >= 53) index = 'BC';
            else if (total >= 45) index = 'C';
            else if (total >= 38) index = 'D';
            else index = 'E';
        }

        if (isUP && ['A', 'AB', 'B', 'BC'].includes(index)) {
            index = 'C';
        }

        setFinalScore(total);
        setFinalIndex(index);
    };

    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans selection:bg-yellow-400 selection:text-black">
            <ParticleBackground />

            <div className="relative z-10 mx-auto max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><Calculator size={28} /></span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl drop-shadow-md">Kalkulator Indeks</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6">
                            <h3 className="text-white font-bold flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
                                Mata Kuliah Mafiki
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-gray-400">Pilih Mata Kuliah</label>
                                    <select
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value as CourseType)}
                                        className="bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 focus:outline-none"
                                    >
                                        <option value="fisika">Fisika Dasar I</option>
                                        <option value="matematika">Matematika I</option>
                                        <option value="kimia">Kimia Dasar I</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-gray-400">Status UP (Ujian Perbaikan)</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsUP(false)}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${!isUP ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                        >
                                            Tidak Ikut UP
                                        </button>
                                        <button
                                            onClick={() => setIsUP(true)}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${isUP ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                        >
                                            Ikut UP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 animate-fade-in-down">
                            <h3 className="text-white font-bold flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
                                Masukkan Nilai
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {course === 'fisika' && (
                                    <>
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas} onChange={handleInputChange} />
                                        <InputField label="Tugas" field="tugas" value={scores.tugas} onChange={handleInputChange} />
                                        <InputField label="Kuis" field="kuis" value={scores.kuis} onChange={handleInputChange} />
                                        <InputField label="LCE" field="lce" value={scores.lce} onChange={handleInputChange} />
                                        {isUP && <InputField label="Nilai UP" field="up" value={scores.up} onChange={handleInputChange} />}
                                    </>
                                )}

                                {course === 'matematika' && !isUP && (
                                    <>
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas} onChange={handleInputChange} />
                                        <InputField label="KBF" field="kbf" value={scores.kbf} onChange={handleInputChange} />
                                        <InputField label="Kehadiran/PR" field="kehadiran" value={scores.kehadiran} onChange={handleInputChange} />
                                        <InputField label="Proyek Mini" field="proyek" value={scores.proyek} onChange={handleInputChange} />
                                    </>
                                )}
                                {course === 'matematika' && isUP && (
                                    <>
                                        <InputField label="Kuis 1" field="kuis1" value={scores.kuis1} onChange={handleInputChange} />
                                        <InputField label="Kuis 2" field="kuis2" value={scores.kuis2} onChange={handleInputChange} />
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas} onChange={handleInputChange} />
                                        <InputField label="Nilai UP" field="up" value={scores.up} onChange={handleInputChange} />
                                    </>
                                )}

                                {course === 'kimia' && !isUP && (
                                    <>
                                        <InputField label="Kuis 1" field="kuis1" value={scores.kuis1} onChange={handleInputChange} />
                                        <InputField label="Kuis 2" field="kuis2" value={scores.kuis2} onChange={handleInputChange} />
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas} onChange={handleInputChange} />
                                    </>
                                )}
                                {course === 'kimia' && isUP && (
                                    <>
                                        <InputField label="Kuis 1" field="kuis1" value={scores.kuis1} onChange={handleInputChange} />
                                        <InputField label="Kuis 2" field="kuis2" value={scores.kuis2} onChange={handleInputChange} />
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas} onChange={handleInputChange} />
                                        <InputField label="Nilai UP" field="up" value={scores.up} onChange={handleInputChange} />
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={calculateGrade}
                                    className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                                >
                                    Hitung Indeks <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setScores({ uts: '', uas: '', tugas: '', kuis: '', lce: '', up: '', kbf: '', kehadiran: '', proyek: '', kuis1: '', kuis2: '' });
                                        setFinalScore(null);
                                        setFinalIndex('-');
                                    }}
                                    className="px-4 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
                                    title="Reset"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden group hover:border-yellow-400/50 transition-colors">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>

                            <div className="text-center z-10">
                                <h2 className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-sm">Hasil</h2>
                                
                                <div className="mt-4 mb-8">
                                    <p className="text-6xl font-black text-white drop-shadow-lg mb-2">
                                        {finalIndex}
                                    </p>
                                    <p className="text-xl text-gray-400 font-mono">
                                        Total: {finalScore !== null ? finalScore.toFixed(2) : '0.00'}
                                    </p>
                                </div>

                                {isUP && (
                                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 flex items-start gap-2 text-left">
                                        <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                                            Maksimal indeks yang bisa didapatkan jika ikut UP adalah <strong className="text-yellow-400">C</strong> terlepas dari seberapa tinggi angkanya.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndexCalculator;