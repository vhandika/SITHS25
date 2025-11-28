import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader, User, AlertCircle } from 'lucide-react';

interface Student {
    id: number;
    nim: string;
    name: string | null;
}

const API_BASE_URL = 'https://idk-eight.vercel.app/api'; 

const FindNim: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim().length > 2) {
                fetchStudents();
            } else {
                setResults([]);
            }
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('userToken');

        try {
            const response = await fetch(`https://idk-eight.vercel.app/api/users?search=${query}`, { 
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Gagal mengambil data');

            const result = await response.json();
            
            const studentData = result.data || [];
            setResults(studentData);

        } catch (err) {
            console.error(err);
            setError('Gagal memuat data. Pastikan koneksi internet aman.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans text-white">
            <div className="mx-auto max-w-4xl">

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                         <span className="transform skew-x-12"><Search size={28} /></span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Find NIM / Name</h1>
                </div>

                <div className="relative mb-10 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-400 transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-700 bg-gray-900/50 py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all duration-300"
                        placeholder="Ketik Nama atau NIM (min. 3 karakter)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="absolute -bottom-1 left-0 h-[1px] w-0 bg-yellow-400 transition-all duration-500 group-focus-within:w-full"></div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-yellow-400">
                        <Loader className="animate-spin mb-2" size={32} />
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3 mb-6">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {!loading && query.length > 2 && results.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">Tidak ditemukan hasil untuk "{query}"</p>
                        <p className="text-xs mt-2 text-gray-600">Coba cari dengan kata kunci lain atau NIM.</p>
                    </div>
                )}
                {!loading && results.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        {results.map((student) => (
                            <div 
                                key={student.id || student.nim} 
                                className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900/40 p-5 hover:border-gray-600 hover:bg-gray-800/60 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors duration-300">
                                            <User size={24} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-400 mb-1">
                                            NIM: {student.nim}
                                        </p>
                                        <h3 className="text-lg font-bold text-white break-words leading-tight group-hover:text-yellow-400 transition-colors uppercase">
                                            {student.name ? student.name : <span className="text-gray-600 italic">Nama belum diisi</span>}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && query.length < 3 && (
                    <div className="text-center py-20 opacity-30">
                        <Search size={64} className="mx-auto mb-4" />
                        <p>Ketik minimal 3 karakter untuk mulai mencari.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FindNim;