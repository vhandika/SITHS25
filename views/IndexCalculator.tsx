import React, { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, RotateCcw, AlertCircle, Plus, X, Trash2, Save, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext'; 

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

type CourseType = 'fisika' | 'matematika' | 'kimia' | string;

interface CustomAssessment {
    id: string;
    name: string;
    weight: number | string;
}

interface CustomGradeRange {
    id: string;
    grade: string;
    minScore: number | string;
}

interface CustomCourse {
    id: string;
    name: string;
    assessments: CustomAssessment[];
    upAssessments: CustomAssessment[];
    gradeRanges: CustomGradeRange[];
}

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
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder="0 - 100"
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all placeholder-gray-600"
        />
    </div>
);

const generateId = () => Math.random().toString(36).substring(2, 9);

interface AssessmentEditorProps {
    title: string;
    assessments: CustomAssessment[];
    setAssessments: React.Dispatch<React.SetStateAction<CustomAssessment[]>>;
}

const AssessmentEditor: React.FC<AssessmentEditorProps> = ({ title, assessments, setAssessments }) => (
    <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-gray-300">{title}</label>
            <button 
                onClick={() => setAssessments([...assessments, { id: generateId(), name: '', weight: 0 }])}
                className="text-xs flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
            ><Plus size={14}/> Tambah</button>
        </div>
        <div className="space-y-2">
            {assessments.map((ass, i) => (
                <div key={ass.id} className="flex gap-2 items-center">
                    <input 
                        type="text" 
                        value={ass.name} 
                        onChange={e => {
                            const newArr = [...assessments]; 
                            newArr[i].name = e.target.value; 
                            setAssessments(newArr);
                        }} 
                        placeholder="Misal: Tugas"
                        className="flex-1 min-w-0 bg-black/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-yellow-400 focus:outline-none"
                    />
                    
                    <input 
                        type="number" 
                        value={ass.weight === 0 && ass.weight !== "0" ? "" : ass.weight} 
                        onChange={e => {
                            const val = e.target.value;
                            const newArr = [...assessments]; 
                            newArr[i].weight = val === '' ? '' : parseFloat(val); 
                            setAssessments(newArr);
                        }} 
                        placeholder="Bobot %" 
                        className="w-16 sm:w-24 shrink-0 bg-black/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-yellow-400 focus:outline-none"
                    />
                    
                    <button onClick={() => setAssessments(assessments.filter(a => a.id !== ass.id))} className="shrink-0 text-gray-400 p-2 hover:bg-gray-800 hover:text-white rounded-lg transition-colors" title="Hapus"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
        <div className="mt-2 text-right text-xs text-gray-500">
            Total: {assessments.reduce((acc, curr) => acc + (typeof curr.weight === 'number' ? curr.weight : 0), 0)}%
        </div>
    </div>
);

const IndexCalculator: React.FC = () => {
    const toastContext = useToast() as any; 
    const triggerToast = (message: string, type: 'success' | 'error' | 'info') => {
        if (toastContext && typeof toastContext.addToast === 'function') {
            toastContext.addToast(message, type);
        } else if (toastContext && typeof toastContext.showToast === 'function') {
            toastContext.showToast(message, type);
        } else {
            alert(`[${type.toUpperCase()}]: ${message}`);
            console.warn("Error.");
        }
    };

    const [course, setCourse] = useState<CourseType>('fisika');
    const [isUP, setIsUP] = useState(false);
    
    const [customCourses, setCustomCourses] = useState<CustomCourse[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('customCourses');
            if (saved) {
                try { return JSON.parse(saved); } catch (e) { return []; }
            }
        }
        return [];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [newCourseName, setNewCourseName] = useState('');
    const [newAssessments, setNewAssessments] = useState<CustomAssessment[]>([]);
    
    const [enableUpSchema, setEnableUpSchema] = useState(false);
    const [newUpAssessments, setNewUpAssessments] = useState<CustomAssessment[]>([]);
    const [newGradeRanges, setNewGradeRanges] = useState<CustomGradeRange[]>([]);

    const [scores, setScores] = useState<Record<string, string>>({});
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [finalIndex, setFinalIndex] = useState<string>('-');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        localStorage.setItem('customCourses', JSON.stringify(customCourses));
    }, [customCourses]);

    useEffect(() => {
        setScores({});
        setFinalScore(null);
        setFinalIndex('-');
    }, [course, isUP]);

    const handleInputChange = (field: string, value: string) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setScores(prev => ({ ...prev, [field]: value }));
        }
    };

    const isCustomCourse = course.startsWith('custom_');
    const currentCustomCourse = isCustomCourse ? customCourses.find(c => c.id === course) : null;
    const hasUpConfig = isCustomCourse && currentCustomCourse && currentCustomCourse.upAssessments.length > 0;

    const calculateGrade = () => {
        const val = (field: string) => parseFloat(scores[field]) || 0;
        let total = 0;
        let index = 'E';

        if (isCustomCourse && currentCustomCourse) {
            const activeAssessments = (isUP && hasUpConfig) ? currentCustomCourse.upAssessments : currentCustomCourse.assessments;
            activeAssessments.forEach(ass => {
                const weight = typeof ass.weight === 'number' ? ass.weight : 0;
                total += val(ass.id) * (weight / 100);
            });

            const sortedRanges = [...currentCustomCourse.gradeRanges].sort((a, b) => {
                const minA = typeof a.minScore === 'number' ? a.minScore : 0;
                const minB = typeof b.minScore === 'number' ? b.minScore : 0;
                return minB - minA;
            });
            
            for (const range of sortedRanges) {
                const minScore = typeof range.minScore === 'number' ? range.minScore : 0;
                if (total >= minScore) {
                    index = range.grade;
                    break;
                }
            }
        } else {
            if (course === 'fisika') {
                if (isUP) {
                    total = 0.3 * Math.max(val('uts'), val('uas')) + 0.3 * val('up') + 0.15 * val('tugas') + 0.15 * val('kuis') + 0.1 * val('lce');
                } else {
                    total = 0.3 * val('uts') + 0.3 * val('uas') + 0.15 * val('tugas') + 0.15 * val('kuis') + 0.1 * val('lce');
                }
                if (total >= 75) index = 'A';
                else if (total >= 68) index = 'AB';
                else if (total >= 60) index = 'B';
                else if (total >= 55) index = 'BC';
                else if (total >= 50) index = 'C';
                else if (total >= 45) index = 'D';
                else index = 'E';
            } else if (course === 'matematika') {
                if (isUP) {
                    total = 0.3 * ((val('kuis1') + val('kuis2')) / 2) + 0.5 * val('up') + 0.1 * val('uts') + 0.1 * val('uas');
                } else {
                    total = 0.35 * val('uts') + 0.35 * val('uas') + 0.1 * val('kbf') + 0.1 * val('kehadiran') + 0.1 * val('proyek');
                }
                if (total >= 80) index = 'A';
                else if (total >= 73) index = 'AB';
                else if (total >= 65) index = 'B';
                else if (total >= 57) index = 'BC';
                else if (total >= 50) index = 'C';
                else if (total >= 35) index = 'D';
                else index = 'E';
            } else if (course === 'kimia') {
                if (isUP) {
                    total = 0.3 * ((val('kuis1') + val('kuis2')) / 2) + 0.5 * val('up') + 0.1 * val('uts') + 0.1 * val('uas');
                } else {
                    total = 0.3 * ((val('kuis1') + val('kuis2')) / 2) + 0.35 * val('uas') + 0.35 * val('uts');
                }
                if (total >= 75) index = 'A';
                else if (total >= 68) index = 'AB';
                else if (total >= 60) index = 'B';
                else if (total >= 53) index = 'BC';
                else if (total >= 45) index = 'C';
                else if (total >= 38) index = 'D';
                else index = 'E';
            }
        }

        if (isUP && ['A', 'AB', 'B', 'BC'].includes(index.toUpperCase())) {
            index = 'C';
        }

        setFinalScore(total);
        setFinalIndex(index);
    };

    const openModal = () => {
        setNewCourseName('');
        setNewAssessments([{ id: generateId(), name: 'UTS', weight: 50 }, { id: generateId(), name: 'UAS', weight: 50 }]);
        setEnableUpSchema(false);
        setNewUpAssessments([{ id: generateId(), name: 'Nilai UP', weight: 50 }, { id: generateId(), name: 'UTS', weight: 25 }, { id: generateId(), name: 'UAS', weight: 25 }]);
        
        setNewGradeRanges([
            { id: 'grade_A', grade: 'A', minScore: 75}, 
            { id: 'grade_AB', grade: 'AB', minScore:68}, 
            { id: 'grade_B', grade: 'B', minScore: 60 },
            { id: 'grade_BC', grade: 'BC', minScore: 55 },
            { id: 'grade_C', grade: 'C', minScore: 50 },
            { id: 'grade_D', grade: 'D', minScore: 45},
            { id: 'grade_E', grade: 'E', minScore: 0 }
        ]);
        setIsModalOpen(true);
        setIsClosing(false);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const saveCustomCourse = () => {
        try {
            if (!newCourseName.trim()) {
                triggerToast("Nama mata kuliah harus diisi!", "error");
                return;
            }
            
            const totalWeightNormal = newAssessments.reduce((acc, curr) => acc + (typeof curr.weight === 'number' ? curr.weight : 0), 0);
            if (totalWeightNormal !== 100) {
                if (!window.confirm(`Total bobot skema normal saat ini ${totalWeightNormal}%. Disarankan 100%. Lanjutkan?`)) return;
                triggerToast(`Skema normal disimpan dengan bobot ${totalWeightNormal}%`, "info");
            }

            if (enableUpSchema) {
                const totalWeightUP = newUpAssessments.reduce((acc, curr) => acc + (typeof curr.weight === 'number' ? curr.weight : 0), 0);
                if (totalWeightUP !== 100) {
                    if (!window.confirm(`Total bobot skema UP saat ini ${totalWeightUP}%. Disarankan 100%. Lanjutkan?`)) return;
                    triggerToast(`Skema UP disimpan dengan bobot ${totalWeightUP}%`, "info");
                }
            }

            const normalizeAssessments = (arr: CustomAssessment[]) => 
                arr.map(a => ({ ...a, weight: typeof a.weight === 'number' ? a.weight : 0 }));

            const normalizeGradeRanges = (arr: CustomGradeRange[]) => 
                arr.map(r => ({ ...r, minScore: typeof r.minScore === 'number' ? r.minScore : 0 }));

            const newCourse: CustomCourse = {
                id: `custom_${Date.now()}_${generateId()}`,
                name: newCourseName.trim(),
                assessments: normalizeAssessments(newAssessments),
                upAssessments: enableUpSchema ? normalizeAssessments(newUpAssessments) : [],
                gradeRanges: normalizeGradeRanges(newGradeRanges)
            };

            setCustomCourses(prev => [...prev, newCourse]);
            setCourse(newCourse.id);
            closeModal();
            triggerToast("Mata kuliah berhasil disimpan!", "success");
        } catch (error) {
            console.error("Gagal saat menyimpan custom course:", error);
            alert("Terjadi kesalahan sistem saat menyimpan. Coba lagi.");
        }
    };

    const deleteCustomCourse = (idToDelete: string) => {
        if (window.confirm("Hapus mata kuliah custom ini?")) {
            setCustomCourses(customCourses.filter(c => c.id !== idToDelete));
            setCourse('fisika');
            triggerToast("Mata kuliah berhasil dihapus.", "success");
        }
    };

    const getCourseName = (id: string) => {
        if (id === 'fisika') return 'Fisika Dasar I';
        if (id === 'matematika') return 'Matematika I';
        if (id === 'kimia') return 'Kimia Dasar I';
        const custom = customCourses.find(c => c.id === id);
        return custom ? custom.name : 'Pilih Mata Kuliah';
    };

    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans selection:bg-yellow-400 selection:text-black">
            <style>{`
                @keyframes bounceIn {
                    0% { opacity: 0; transform: scale(0.9); }
                    50% { opacity: 1; transform: scale(1.03); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes bounceOut {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.03); }
                    100% { opacity: 0; transform: scale(0.9); }
                }
                .animate-bounce-in {
                    animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .animate-bounce-out {
                    animation: bounceOut 0.3s ease-in forwards;
                }
            `}</style>
            
            <ParticleBackground />

            {isModalOpen && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl ${isClosing ? 'animate-bounce-out' : 'animate-bounce-in'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Buat Mata Kuliah Custom</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-400">Nama Mata Kuliah</label>
                                <input 
                                    type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 focus:outline-none mt-1"
                                    placeholder="Contoh: Kimia 2"
                                />
                            </div>

                            <AssessmentEditor title="Komponen Penilaian (Skema Normal)" assessments={newAssessments} setAssessments={setNewAssessments} />

                            <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                                <button 
                                    onClick={() => setEnableUpSchema(!enableUpSchema)}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white w-full"
                                >
                                    <span className="text-yellow-400 shrink-0">
                                        {enableUpSchema ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </span>
                                    <span className="text-left">Buat Skema Jika Ikut UP (Opsional)</span>
                                </button>
                                
                                {enableUpSchema && (
                                    <div className="mt-4 animate-fade-in-down">
                                        <AssessmentEditor title="Komponen Penilaian (Skema Jika UP)" assessments={newUpAssessments} setAssessments={setNewUpAssessments} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-gray-300">Batas Minimal Indeks</label>
                                </div>
                                <div className="space-y-2">
                                    {newGradeRanges.map((range, i) => (
                                        <div key={range.id} className="flex gap-2 items-center">
                                            <div className="w-16 sm:w-24 shrink-0 bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-gray-400 text-sm font-bold text-center uppercase cursor-not-allowed">
                                                {range.grade}
                                            </div>
                                            
                                            <input type="number" value={range.minScore === 0 && range.minScore !== "0" ? "" : range.minScore} onChange={e => {
                                                const val = e.target.value;
                                                const newArr = [...newGradeRanges]; 
                                                newArr[i].minScore = val === '' ? '' : parseFloat(val); 
                                                setNewGradeRanges(newArr);
                                            }} placeholder="Nilai Min" className="flex-1 min-w-0 bg-black/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-yellow-400 focus:outline-none"/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={saveCustomCourse} className="w-full bg-yellow-400 text-black font-bold py-4 rounded-lg hover:bg-yellow-300 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                                <Save size={18} /> Simpan Mata Kuliah
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg relative z-30">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    Mata Kuliah
                                </h3>
                                <button onClick={openModal} className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors" title="Buat Mata Kuliah Custom">
                                    <Plus size={20}/>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2 relative z-50">
                                    <label className="text-sm text-gray-400">Pilih Mata Kuliah</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 min-w-0" ref={dropdownRef}>
                                            <button 
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full h-full bg-black/50 border border-gray-700 rounded-lg p-3 text-left text-white focus:border-yellow-400 focus:outline-none flex justify-between items-center transition-colors"
                                            >
                                                <span className="truncate pr-2">{getCourseName(course)}</span>
                                                <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {isDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-y-auto max-h-60">
                                                    <div className="p-2 space-y-1">
                                                        <div className="text-xs font-bold text-gray-500 uppercase px-3 py-2">Mafiki</div>
                                                        <button onClick={() => { setCourse('fisika'); setIsDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition-colors ${course === 'fisika' ? 'text-yellow-400 bg-gray-800/50 font-medium' : 'text-gray-300'}`}>Fisika Dasar I</button>
                                                        <button onClick={() => { setCourse('matematika'); setIsDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition-colors ${course === 'matematika' ? 'text-yellow-400 bg-gray-800/50 font-medium' : 'text-gray-300'}`}>Matematika I</button>
                                                        <button onClick={() => { setCourse('kimia'); setIsDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition-colors ${course === 'kimia' ? 'text-yellow-400 bg-gray-800/50 font-medium' : 'text-gray-300'}`}>Kimia Dasar I</button>

                                                        {customCourses.length > 0 && (
                                                            <>
                                                                <div className="text-xs font-bold text-gray-500 uppercase px-3 py-2 mt-2 border-t border-gray-800 pt-3">Custom</div>
                                                                {customCourses.map(c => (
                                                                    <button key={c.id} onClick={() => { setCourse(c.id); setIsDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition-colors ${course === c.id ? 'text-yellow-400 bg-gray-800/50 font-medium' : 'text-gray-300'}`}>{c.name}</button>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {isCustomCourse && (
                                            <button onClick={() => deleteCustomCourse(course)} className="shrink-0 bg-gray-800/50 text-gray-400 border border-gray-700 p-3 rounded-lg hover:bg-gray-700 hover:text-white transition-colors" title="Hapus Mata Kuliah Ini">
                                                <Trash2 size={18}/>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-gray-400">Status UP (Ujian Perbaikan)</label>
                                    <div className="flex gap-2 h-full">
                                        <button
                                            onClick={() => setIsUP(false)}
                                            className={`flex-1 rounded-lg text-sm font-bold transition-all ${!isUP ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                        >
                                            Tidak Ikut UP
                                        </button>
                                        <button
                                            onClick={() => setIsUP(true)}
                                            className={`flex-1 rounded-lg text-sm font-bold transition-all ${isUP ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                            title={(isCustomCourse && !hasUpConfig) ? "Mata kuliah ini tidak memiliki konfigurasi UP khusus" : ""}
                                        >
                                            Ikut UP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg animate-fade-in-down relative z-20">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    Masukkan Nilai
                                </h3>
                                {isCustomCourse && (isUP && hasUpConfig) && (
                                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">Skema UP Aktif</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {isCustomCourse && currentCustomCourse && (
                                    ((isUP && hasUpConfig) ? currentCustomCourse.upAssessments : currentCustomCourse.assessments).map(ass => (
                                        <InputField key={ass.id} label={`${ass.name} (${ass.weight}%)`} field={ass.id} value={scores[ass.id] || ''} onChange={handleInputChange} />
                                    ))
                                )}

                                {course === 'fisika' && (
                                    <>
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas || ''} onChange={handleInputChange} />
                                        <InputField label="Tugas" field="tugas" value={scores.tugas || ''} onChange={handleInputChange} />
                                        <InputField label="Kuis" field="kuis" value={scores.kuis || ''} onChange={handleInputChange} />
                                        <InputField label="LCE" field="lce" value={scores.lce || ''} onChange={handleInputChange} />
                                        {isUP && <InputField label="Nilai UP" field="up" value={scores.up || ''} onChange={handleInputChange} />}
                                    </>
                                )}

                                {course === 'matematika' && !isUP && (
                                    <>
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas || ''} onChange={handleInputChange} />
                                        <InputField label="KBF" field="kbf" value={scores.kbf || ''} onChange={handleInputChange} />
                                        <InputField label="Kehadiran/PR" field="kehadiran" value={scores.kehadiran || ''} onChange={handleInputChange} />
                                        <InputField label="Proyek Mini" field="proyek" value={scores.proyek || ''} onChange={handleInputChange} />
                                    </>
                                )}
                                {course === 'matematika' && isUP && (
                                    <>
                                        <InputField label="Kuis 1" field="kuis1" value={scores.kuis1 || ''} onChange={handleInputChange} />
                                        <InputField label="Kuis 2" field="kuis2" value={scores.kuis2 || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UP" field="up" value={scores.up || ''} onChange={handleInputChange} />
                                    </>
                                )}

                                {course === 'kimia' && !isUP && (
                                    <>
                                        <InputField label="Kuis 1" field="kuis1" value={scores.kuis1 || ''} onChange={handleInputChange} />
                                        <InputField label="Kuis 2" field="kuis2" value={scores.kuis2 || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas || ''} onChange={handleInputChange} />
                                    </>
                                )}
                                {course === 'kimia' && isUP && (
                                    <>
                                        <InputField label="Kuis 1" field="kuis1" value={scores.kuis1 || ''} onChange={handleInputChange} />
                                        <InputField label="Kuis 2" field="kuis2" value={scores.kuis2 || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UTS" field="uts" value={scores.uts || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UAS" field="uas" value={scores.uas || ''} onChange={handleInputChange} />
                                        <InputField label="Nilai UP" field="up" value={scores.up || ''} onChange={handleInputChange} />
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
                                        setScores({});
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

                    <div className="lg:col-span-1 relative z-10">
                        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden group hover:border-yellow-400/50 transition-colors shadow-lg">
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
                                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 flex items-start gap-2 text-left animate-fade-in-down">
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