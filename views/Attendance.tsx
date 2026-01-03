import React, { useState, useEffect, useMemo } from 'react';
import {
    CalendarCheck, Plus, Upload, Camera, Users,
    BarChart3, CheckCircle, XCircle, Search, UserCheck, UserX, Lock, Clock, Loader, FileText,
    FileSpreadsheet, ArrowRightCircle, ImageIcon, X
} from 'lucide-react';
import ExcelJS from 'exceljs';
import SkewedButton from '../components/SkewedButton';
import imageCompression from 'browser-image-compression';
import { fetchWithAuth } from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';
const API_INTERNAL_GANJIL = 'https://ganjil.sith-s25.my.id/api';
const API_INTERNAL_GENAP = 'https://genap.sith-s25.my.id/api';

const getAttendanceApiUrl = (nim: string): string => {
    const lastDigit = parseInt(nim.slice(-1));
    return lastDigit % 2 === 0 ? API_INTERNAL_GENAP : API_INTERNAL_GANJIL;
};

const isNimGanjil = (nim: string): boolean => {
    const lastDigit = parseInt(nim.slice(-1));
    return lastDigit % 2 !== 0;
};

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const Attendance: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userNIM, setUserNIM] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [selectedSessionPermission, setSelectedSessionPermission] = useState<any | null>(null);
    const [permissionReason, setPermissionReason] = useState('');
    const [isMenyusul, setIsMenyusul] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSessionData, setNewSessionData] = useState({ title: '', description: '', is_photo_required: false });
    const [viewStatsId, setViewStatsId] = useState<number | null>(null);
    const [viewStatsTitle, setViewStatsTitle] = useState<string>('');
    const [statsRecords, setStatsRecords] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'hadir' | 'izin' | 'pending' | 'belum'>('hadir');
    const [searchFilter, setSearchFilter] = useState('');
    const [userStatusMap, setUserStatusMap] = useState<{ [key: number]: { status: string, reason: string | null } }>({});

    useEffect(() => {
        const role = getCookie('userRole');
        const nim = getCookie('userNIM');

        if (!nim) {
            navigate('/login');
            return;
        }

        setUserRole(role || null);
        setUserNIM(nim || null);
        fetchSessions(nim || null);

        if (role === 'admin' || role === 'sekretaris' || role === 'dev') {
            fetchAllUsers();
        }
    }, [navigate]);

    const isAdminOrSekretaris = userRole === 'admin' || userRole === 'sekretaris' || userRole === 'dev';

    const fetchSessions = async (currentNIM: string | null = userNIM) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_INTERNAL_GANJIL}/attendance/sessions`, {
                credentials: 'include'
            });
            const json = await res.json();
            if (res.ok) {
                setSessions(json.data);
                if (currentNIM) {
                    checkUserAttendanceStatus(json.data, currentNIM);
                }
            }
        } catch (error) { }
        finally { setLoading(false); }
    };

    const checkUserAttendanceStatus = async (currentSessions: any[], nim: string) => {
        const openSessions = currentSessions.filter(s => s.is_open);
        const statusMap: { [key: number]: { status: string, reason: string | null } } = {};
        const attendanceApi = getAttendanceApiUrl(nim);

        for (const session of openSessions) {
            try {
                const res = await fetch(`${attendanceApi}/attendance/stats/${session.id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const json = await res.json();
                    const records = json.data || [];
                    const myRecord = records.find((r: any) => r.user_nim === nim);

                    if (myRecord) {
                        statusMap[session.id] = {
                            status: myRecord.status,
                            reason: myRecord.reason
                        };
                    }
                }
            } catch (err) {
            }
        }
        setUserStatusMap(prev => ({ ...prev, ...statusMap }));
    };

    const fetchAllUsers = async () => {
        try {
            const token = getCookie('userToken');
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: {}, credentials: 'include'
            });
            if (res.ok) {
                const json = await res.json();
                setAllUsers(json.data || []);
            }
        } catch (error) { }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const [resGanjil, resGenap] = await Promise.all([
                fetchWithAuth(`${API_INTERNAL_GANJIL}/attendance/sessions`, {
                    method: 'POST',
                    body: JSON.stringify(newSessionData)
                }),
                fetchWithAuth(`${API_INTERNAL_GENAP}/attendance/sessions`, {
                    method: 'POST',
                    body: JSON.stringify(newSessionData)
                })
            ]);

            if (resGanjil.ok && resGenap.ok) {
                alert('Sesi berhasil dibuat!');
                setIsCreateModalOpen(false);
                setNewSessionData({ title: '', description: '', is_photo_required: false });
                fetchSessions();
            } else {
                const errGanjil = !resGanjil.ok ? await resGanjil.json() : null;
                const errGenap = !resGenap.ok ? await resGenap.json() : null;
                alert(errGanjil?.message || errGenap?.message || 'Gagal membuat sesi');
            }
        } catch (error: any) {
            alert(`Gagal membuat sesi: ${error.message || 'Error Koneksi'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSession = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm('Yakin ingin menutup sesi ini?')) return;

        try {
            const [resGanjil, resGenap] = await Promise.all([
                fetchWithAuth(`${API_INTERNAL_GANJIL}/attendance/close/${id}`, { method: 'PUT' }),
                fetchWithAuth(`${API_INTERNAL_GENAP}/attendance/close/${id}`, { method: 'PUT' })
            ]);
            if (resGanjil.ok || resGenap.ok) {
                alert("Sesi berhasil ditutup.");
                fetchSessions();
            }
        } catch (err: any) { alert(`Terjadi kesalahan: ${err.message}`); }
    };

    const handleViewStats = async (e: React.MouseEvent, session: any) => {
        e.stopPropagation();
        setViewStatsId(session.id);
        setViewStatsTitle(session.title);
        setActiveTab('hadir');

        try {
            const [resGanjil, resGenap] = await Promise.all([
                fetch(`${API_INTERNAL_GANJIL}/attendance/stats/${session.id}`, { credentials: 'include' }),
                fetch(`${API_INTERNAL_GENAP}/attendance/stats/${session.id}`, { credentials: 'include' })
            ]);

            const jsonGanjil = resGanjil.ok ? await resGanjil.json() : { data: [] };
            const jsonGenap = resGenap.ok ? await resGenap.json() : { data: [] };

            const mergedData = [...(jsonGanjil.data || []), ...(jsonGenap.data || [])];
            setStatsRecords(mergedData);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setStatsRecords([]);
        }
    };

    const handleApproveUser = async (recordId: number, userNim: string) => {
        try {
            const attendanceApi = getAttendanceApiUrl(userNim);
            const res = await fetchWithAuth(`${attendanceApi}/attendance/approve/${recordId}`, {
                method: 'PUT'
            });

            if (res.ok) {
                setStatsRecords(prev => prev.map(r =>
                    r.id === recordId ? { ...r, status: 'Hadir' } : r
                ));
            } else {
                alert("Gagal verifikasi user.");
            }
        } catch (error: any) { alert(`Error koneksi: ${error.message}`); }
    };

    const handleChecklistUser = async (targetUser: any) => {
        if (!window.confirm(`Hadirkan ${targetUser.name}`)) return;

        try {
            const attendanceApi = getAttendanceApiUrl(targetUser.nim);
            const res = await fetchWithAuth(`${attendanceApi}/attendance/manual`, {
                method: 'POST',
                body: JSON.stringify({
                    session_id: viewStatsId,
                    target_nim: targetUser.nim,
                    target_name: targetUser.name,
                    status: 'Dihadirkan'
                })
            });

            if (res.ok) {
                const newRecord = {
                    id: Date.now(),
                    user_nim: targetUser.nim,
                    user_name: targetUser.name,
                    status: 'Dihadirkan',
                    photo_url: null,
                    created_at: new Date().toISOString()
                };
                setStatsRecords([...statsRecords, newRecord]);
            } else {
                alert("Gagal menghadirkan user.");
            }
        } catch (error: any) { alert(`Gagal menghadirkan user: ${error.message}`); }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const originalFile = e.target.files[0];

            const options = {
                maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true, fileType: 'image/jpeg'
            };

            const aggressiveOptions = {
                maxSizeMB: 0.15, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/jpeg'
            };

            try {
                setIsCompressing(true);

                let compressedFile = await imageCompression(originalFile, options);

                if (compressedFile.size > 2 * 1024 * 1024) {
                    compressedFile = await imageCompression(originalFile, aggressiveOptions);
                }

                if (compressedFile.size > 5 * 1024 * 1024) {
                    alert("Gambarnya kegedean buset (> 5MB). Server nolak bang.");
                    setPhotoFile(null);
                    setPreviewUrl(null);
                    e.target.value = '';
                } else {
                    setPhotoFile(compressedFile);
                    setPreviewUrl(URL.createObjectURL(compressedFile));
                }

            } catch (error) {
                if (originalFile.size > 5 * 1024 * 1024) {
                    alert("Gagal kompres & File Asli > 5MB. Ganti foto lain.");
                    setPhotoFile(null);
                    setPreviewUrl(null);
                    e.target.value = '';
                } else {
                    setPhotoFile(originalFile);
                    setPreviewUrl(URL.createObjectURL(originalFile));
                }
            } finally { setIsCompressing(false); }
        }
    };

    const handleSubmitAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isCompressing) return;

        setIsSubmitting(true);
        const token = getCookie('userToken');
        const formData = new FormData();
        formData.append('session_id', selectedSession.id);
        formData.append('user_name_input', 'Mahasiswa ' + userNIM);
        formData.append('status', 'Hadir');
        if (photoFile) formData.append('image', photoFile);

        try {
            const attendanceApi = getAttendanceApiUrl(userNIM!);
            const res = await fetchWithAuth(`${attendanceApi}/attendance/submit`, {
                method: 'POST',
                body: formData
            });
            const json = await res.json();

            if (res.ok) {
                alert(json.message);
                setUserStatusMap(prev => ({
                    ...prev,
                    [selectedSession.id]: { status: 'Pending', reason: null }
                }));
                closeModals();
            } else {
                alert(json.message || "Gagal absen");
            }
        } catch (error: any) { alert(`Terjadi kesalahan: ${error.message}`); }
        finally { setIsSubmitting(false); }
    };

    const handleSubmitPermission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isCompressing) return;

        setIsSubmitting(true);
        const token = getCookie('userToken');
        const formData = new FormData();
        formData.append('session_id', selectedSessionPermission.id);
        formData.append('user_name_input', 'Mahasiswa ' + userNIM);

        formData.append('status', 'Izin');

        let finalReason = permissionReason;
        if (isMenyusul) {
            finalReason = `[MENYUSUL] ${finalReason}`;
        }
        formData.append('reason', finalReason);

        if (photoFile) formData.append('image', photoFile);

        try {
            const attendanceApi = getAttendanceApiUrl(userNIM!);
            const res = await fetchWithAuth(`${attendanceApi}/attendance/submit`, {
                method: 'POST',
                body: formData
            });
            const json = await res.json();

            if (res.ok) {
                alert("Permohonan izin berhasil dikirim!");
                setUserStatusMap(prev => ({
                    ...prev,
                    [selectedSessionPermission.id]: { status: 'Izin', reason: finalReason }
                }));
                closeModals();
            } else {
                alert(json.message || "Gagal mengirim izin");
            }
        } catch (error: any) { alert(`Terjadi kesalahan: ${error.message}`); }
        finally { setIsSubmitting(false); }
    };

    const closeModals = () => {
        setSelectedSession(null);
        setSelectedSessionPermission(null);
        setPhotoFile(null);
        setPreviewUrl(null);
        setPermissionReason('');
        setIsMenyusul(false);
        setIsSubmitting(false);
        setIsCompressing(false);
    };

    const { presentUsers, permissionUsers, pendingUsers, absentUsers, presentPercentage } = useMemo(() => {
        if (!viewStatsId) return { presentUsers: [], permissionUsers: [], pendingUsers: [], absentUsers: [], presentPercentage: 0 };

        const currentSession = sessions.find(s => s.id === viewStatsId);
        const isSessionClosed = currentSession ? !currentSession.is_open : false;

        const confirmed = statsRecords.filter(r => r.status === 'Hadir' || r.status === 'Dihadirkan');
        const pending = statsRecords.filter(r => r.status === 'Pending');

        const realPermissions: any[] = [];
        const failedMenyusulNims: string[] = [];

        statsRecords.forEach(r => {
            if (r.status === 'Izin') {
                const isMenyusulRecord = r.reason && r.reason.includes('[MENYUSUL]');

                if (isMenyusulRecord) {
                    if (isSessionClosed) {
                        failedMenyusulNims.push(r.user_nim);
                    } else {
                        realPermissions.push(r);
                    }
                } else {
                    realPermissions.push(r);
                }
            }
        });

        const allRecordedNims = statsRecords.map(r => r.user_nim);

        const filterFn = (r: any) => (r.user_name || '').toLowerCase().includes(searchFilter.toLowerCase()) || r.user_nim.includes(searchFilter);
        const sortByNIM = (a: any, b: any) => {
            const nimA = a.user_nim || a.nim || "0";
            const nimB = b.user_nim || b.nim || "0";
            return nimA.toString().localeCompare(nimB.toString(), undefined, { numeric: true });
        };

        const absentees = allUsers.filter(u =>
            (!allRecordedNims.includes(u.nim) || failedMenyusulNims.includes(u.nim)) &&
            (u.name.toLowerCase().includes(searchFilter.toLowerCase()) || u.nim.includes(searchFilter))
        );

        const totalPopulation = allUsers.length || 1;
        const pct = Math.round(((confirmed.length + realPermissions.length) / totalPopulation) * 100);

        return {
            presentUsers: confirmed.filter(filterFn).sort(sortByNIM),
            permissionUsers: realPermissions.filter(filterFn).sort(sortByNIM),
            pendingUsers: pending.filter(filterFn).sort(sortByNIM),
            absentUsers: absentees.sort(sortByNIM),
            presentPercentage: pct
        };
    }, [allUsers, statsRecords, viewStatsId, searchFilter, sessions]);

    const handleExportExcel = async () => {
        const combinedData = [
            ...presentUsers.map(u => ({ ...u, finalStatus: 'Hadir' })),
            ...permissionUsers.map(u => ({ ...u, finalStatus: 'Izin' })),
            ...pendingUsers.map(u => ({ ...u, finalStatus: 'Pending' })),
            ...absentUsers.map(u => ({ ...u, finalStatus: 'Belum Absen' }))
        ];

        if (combinedData.length === 0) {
            alert("Ngga ada data bang");
            return;
        }

        combinedData.sort((a, b) => {
            const nimA = a.user_nim || a.nim || "0";
            const nimB = b.user_nim || b.nim || "0";
            return nimA.toString().localeCompare(nimB.toString(), undefined, { numeric: true });
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Absensi');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'NIM', key: 'nim', width: 15 },
            { header: 'Nama', key: 'nama', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Alasan', key: 'alasan', width: 30 },
            { header: 'Waktu Input', key: 'waktu', width: 20 },
            { header: 'Link Foto', key: 'foto', width: 30 }
        ];

        combinedData.forEach((item, index) => {
            worksheet.addRow({
                no: index + 1,
                nim: item.user_nim || item.nim,
                nama: item.user_name || item.name,
                status: item.finalStatus,
                alasan: item.reason || "-",
                waktu: item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : "-",
                foto: item.photo_url || "-"
            });
        });

        worksheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const cleanTitle = viewStatsTitle.replace(/[^a-zA-Z0-9]/g, "_");
        link.download = `${cleanTitle}_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans text-white relative selection:bg-yellow-400 selection:text-black">
            <div className="mx-auto max-w-7xl">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                            <span className="transform skew-x-12"><CalendarCheck size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Absensi</h1>
                    </div>

                    {isAdminOrSekretaris && (
                        <div className="hidden md:block">
                            <SkewedButton onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={18} />}>
                                Buat Baru
                            </SkewedButton>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-10"><Loader className="animate-spin text-yellow-400" /></div>
                    ) : (
                        sessions.map((session) => {
                            const userRecord = userStatusMap[session.id];
                            const isIzinMenyusul = userRecord?.status === 'Izin' && userRecord?.reason?.includes('[MENYUSUL]');
                            const isDone = userRecord && !isIzinMenyusul;

                            return (
                                <div key={session.id} className={`relative p-6 rounded-lg border text-left ${session.is_open ? 'border-yellow-400/50 bg-gray-900/60' : 'border-gray-800 bg-black'} transition-all hover:border-yellow-400/80 flex flex-col`}>

                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <div className="flex-1 w-0">
                                            <h3
                                                className="text-xl font-bold text-white overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
                                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            >
                                                {session.title}
                                            </h3>
                                        </div>

                                        {session.is_open ? (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/50 flex items-center gap-1 shrink-0"><CheckCircle size={12} /> Buka</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/50 flex items-center gap-1 shrink-0"><XCircle size={12} /> Tutup</span>
                                        )}
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4 min-h-[40px] line-clamp-2">{session.description || 'Tidak ada deskripsi.'}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-800/50">
                                        {session.is_open && (
                                            <>
                                                {!isDone ? (
                                                    <div className="flex gap-2">
                                                        {isIzinMenyusul ? (
                                                            <button
                                                                onClick={() => setSelectedSession(session)}
                                                                className="w-full py-2 bg-yellow-600 text-white font-bold uppercase text-xs sm:text-sm hover:bg-yellow-500 transition-colors rounded flex items-center justify-center gap-1 animate-pulse"
                                                            >
                                                                <ArrowRightCircle size={16} /> Menyusul Sekarang
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => setSelectedSession(session)}
                                                                    className="flex-1 py-2 bg-yellow-400 text-black font-bold uppercase text-xs sm:text-sm hover:bg-yellow-300 transition-colors rounded flex items-center justify-center gap-1"
                                                                >
                                                                    <CheckCircle size={16} /> Hadir
                                                                </button>

                                                                <button
                                                                    onClick={() => setSelectedSessionPermission(session)}
                                                                    className="flex-1 py-2 bg-blue-600 text-white font-bold uppercase text-xs sm:text-sm hover:bg-blue-500 transition-colors rounded flex items-center justify-center gap-1"
                                                                >
                                                                    <FileText size={16} /> Izin
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button disabled className="w-full py-2 bg-gray-800 text-gray-500 font-bold uppercase text-sm rounded cursor-not-allowed border border-gray-700 flex items-center justify-center gap-2">
                                                        <CheckCircle size={16} /> {userRecord?.status === 'Izin' ? 'Sudah Izin' : 'Sudah Hadir'}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {isAdminOrSekretaris && (
                                            <div className="flex gap-2 mt-3 pt-2 border-t border-gray-800">
                                                <button onClick={(e) => handleViewStats(e, session)} className="flex-1 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-white flex items-center justify-center gap-2">
                                                    <BarChart3 size={14} /> Laporan
                                                </button>
                                                {session.is_open && (
                                                    <button onClick={(e) => handleCloseSession(e, session.id)} className="flex-1 py-1.5 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded flex items-center justify-center gap-2">
                                                        <Lock size={14} /> Tutup
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {sessions.length === 0 && !loading && <div className="col-span-full text-center py-10 text-gray-500">Belum ada sesi absensi.</div>}
                </div>
            </div>

            {isAdminOrSekretaris && (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-yellow-400 text-black rounded-full shadow-lg hover:bg-yellow-300 transition-transform active:scale-95 flex items-center justify-center border-2 border-black"
                    aria-label="Buat Sesi"
                >
                    <Plus size={28} />
                </button>
            )}

            {viewStatsId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-5xl bg-gray-900 border border-gray-700 rounded-lg flex flex-col h-[90vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 /> Laporan</h2>
                            </div>
                            <button onClick={() => setViewStatsId(null)} className="text-gray-400 hover:text-white"><XCircle /></button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col p-6">
                            <div className="bg-gray-800 p-4 rounded-lg mb-6 shrink-0">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-white text-sm">Hadir + Izin</span>
                                    <span className="text-yellow-400 font-bold text-xl">{presentPercentage > 100 ? 100 : presentPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${presentPercentage > 100 ? 100 : presentPercentage}%` }} />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 shrink-0">
                                <div className="flex bg-gray-800 p-1 rounded-lg overflow-x-auto w-full sm:w-auto custom-scrollbar">
                                    <button onClick={() => setActiveTab('hadir')} className={`flex-shrink-0 px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'hadir' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                        <div className="flex items-center gap-2"><UserCheck size={16} /> Hadir ({presentUsers.length})</div>
                                    </button>
                                    <button onClick={() => setActiveTab('izin')} className={`flex-shrink-0 px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'izin' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                        <div className="flex items-center gap-2"><FileText size={16} /> Izin ({permissionUsers.length})</div>
                                    </button>
                                    <button onClick={() => setActiveTab('pending')} className={`flex-shrink-0 px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-yellow-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}>
                                        <div className="flex items-center gap-2"><Clock size={16} /> Pending ({pendingUsers.length})</div>
                                    </button>
                                    <button onClick={() => setActiveTab('belum')} className={`flex-shrink-0 px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'belum' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                        <div className="flex items-center gap-2"><UserX size={16} /> Belum ({absentUsers.length})</div>
                                    </button>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <input placeholder="Cari Nama / NIM..." className="w-full bg-black border border-gray-700 rounded pl-9 pr-3 py-2 text-sm text-white focus:border-yellow-400 outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
                                        <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                                    </div>

                                    <button
                                        onClick={handleExportExcel}
                                        title="Download Excel"
                                        className="bg-green-700 hover:bg-green-600 text-white p-2 rounded flex items-center justify-center shrink-0 border border-green-500 transition-colors"
                                    >
                                        <FileSpreadsheet size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/30 rounded-lg border border-gray-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-800 text-gray-200 uppercase text-xs sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 w-32">NIM</th>
                                            <th className="px-4 py-3">Nama</th>
                                            <th className="px-4 py-3 text-right">status </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {activeTab === 'hadir' && (
                                            presentUsers.length > 0 ? presentUsers.map((rec, i) => (
                                                <tr key={i} className="hover:bg-gray-800/40">
                                                    <td className="px-4 py-3 font-mono text-yellow-400">{rec.user_nim}</td>
                                                    <td className="px-4 py-3 text-gray-300">{rec.user_name}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded border border-green-900">Hadir</span>
                                                        {rec.photo_url && <a href={rec.photo_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-400 hover:underline text-xs">Bukti</a>}
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan={3} className="text-center py-8 text-gray-500">Kosong.</td></tr>
                                        )}

                                        {activeTab === 'izin' && (
                                            permissionUsers.length > 0 ? permissionUsers.map((rec, i) => (
                                                <tr key={i} className="hover:bg-gray-800/40">
                                                    <td className="px-4 py-3 font-mono text-yellow-400">{rec.user_nim}</td>
                                                    <td className="px-4 py-3 text-gray-300">
                                                        <div>{rec.user_name}</div>
                                                        {rec.reason && (
                                                            <div className="text-xs text-gray-400 italic mt-0.5">
                                                                {rec.reason.replace('[MENYUSUL]', '')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {rec.reason && rec.reason.includes('[MENYUSUL]') ? (
                                                            <span className="text-xs bg-yellow-900/20 text-yellow-400 px-2 py-1 rounded border border-yellow-900">Menyusul</span>
                                                        ) : (
                                                            <span className="text-xs bg-blue-900/20 text-blue-400 px-2 py-1 rounded border border-blue-900">Izin</span>
                                                        )}

                                                        {rec.photo_url && <a href={rec.photo_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-400 hover:underline text-xs">Bukti</a>}
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan={3} className="text-center py-8 text-gray-500">Kosong.</td></tr>
                                        )}

                                        {activeTab === 'pending' && (
                                            pendingUsers.length > 0 ? pendingUsers.map((rec, i) => (
                                                <tr key={i} className="hover:bg-yellow-900/10 bg-yellow-900/5">
                                                    <td className="px-4 py-3 font-mono text-yellow-400">{rec.user_nim}</td>
                                                    <td className="px-4 py-3 text-white font-bold">{rec.user_name}</td>
                                                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                        {rec.photo_url ? (
                                                            <a href={rec.photo_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline flex items-center gap-1 mr-2">
                                                                <Camera size={14} /> Bukti
                                                            </a>
                                                        ) : <span className="text-xs text-red-400 italic mr-2">No Foto</span>}

                                                        <button onClick={() => handleApproveUser(rec.id, rec.user_nim)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                                                            <CheckCircle size={14} /> ACC
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan={3} className="text-center py-8 text-gray-500">Kosong.</td></tr>
                                        )}

                                        {activeTab === 'belum' && (
                                            absentUsers.length > 0 ? absentUsers.map((user, i) => (
                                                <tr key={i} className="hover:bg-red-900/10 group">
                                                    <td className="px-4 py-3 font-mono text-gray-500">{user.nim}</td>
                                                    <td className="px-4 py-3 text-gray-300">{user.name}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleChecklistUser(user)} className="opacity-60 group-hover:opacity-100 bg-gray-800 hover:bg-green-600 hover:text-white text-gray-400 border border-gray-600 px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ml-auto">
                                                            <CheckCircle size={14} /> Hadir
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan={3} className="text-center py-8 text-gray-500">Kosong.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4 text-yellow-400">
                            <CheckCircle className="shrink-0" />
                            <h2 className="text-xl font-bold text-white truncate">{selectedSession.title}</h2>
                        </div>

                        <form onSubmit={handleSubmitAttendance} className="space-y-4 text-left">
                            <div><label className="block text-gray-400 text-sm mb-1">NIM</label><input disabled value={userNIM || ''} className="w-full bg-black border border-gray-700 rounded p-2 text-gray-500 cursor-not-allowed" /></div>

                            {selectedSession.is_photo_required ? (
                                <div>
                                    <label className="block text-yellow-400 text-sm mb-2 font-bold flex items-center gap-1"><Camera size={16} /> Foto Bukti (Wajib)</label>

                                    {!previewUrl && (
                                        <div className="flex gap-2 mb-3">
                                            <label className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 border border-gray-600 cursor-pointer transition-all">
                                                <Camera size={20} /> Buka Kamera
                                                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                                            </label>
                                            <label className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 border border-gray-600 cursor-pointer transition-all">
                                                <ImageIcon size={20} /> Pilih File
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        </div>
                                    )}

                                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                                        {isCompressing ? (
                                            <div className="text-yellow-400 text-sm flex flex-col items-center">
                                                <Loader className="animate-spin mb-2" />
                                                Memproses gambar...
                                            </div>
                                        ) : previewUrl ? (
                                            <div className="relative inline-block">
                                                <img src={previewUrl} className="max-h-40 mx-auto rounded" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setPhotoFile(null); setPreviewUrl(null); }}
                                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-sm flex flex-col items-center py-2">
                                                <Upload size={24} className="mb-2" />
                                                Pilih metode di atas
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        required
                                        value={photoFile ? 'has-photo' : ''}
                                        onChange={() => { }}
                                        className="opacity-0 h-0 w-0 absolute"
                                        tabIndex={-1}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1"><Camera size={16} /> Foto Bukti (Opsional)</label>

                                    {!previewUrl && (
                                        <div className="flex gap-2 mb-3">
                                            <label className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 border border-gray-600 cursor-pointer text-sm transition-all">
                                                <Camera size={16} /> Kamera
                                                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                                            </label>
                                            <label className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 border border-gray-600 cursor-pointer text-sm transition-all">
                                                <ImageIcon size={16} /> File
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        </div>
                                    )}

                                    {previewUrl && (
                                        <div className="relative inline-block">
                                            <img src={previewUrl} className="max-h-32 rounded border border-gray-700" alt="Preview" />
                                            <button type="button" onClick={() => { setPhotoFile(null); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {isCompressing && <div className="text-sm text-yellow-400 mt-2">Mengkompres gambar...</div>}
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={closeModals} className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Batal</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isCompressing}
                                    className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Mengirim...' : isCompressing ? 'Memproses...' : 'Kirim Hadir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedSessionPermission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <FileText className="shrink-0" />
                            <h2 className="text-xl font-bold text-white truncate">{selectedSessionPermission.title}</h2>
                        </div>

                        <form onSubmit={handleSubmitPermission} className="space-y-4 text-left">
                            <div><label className="block text-gray-400 text-sm mb-1">NIM</label><input disabled value={userNIM || ''} className="w-full bg-black border border-gray-700 rounded p-2 text-gray-500 cursor-not-allowed" /></div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Alasan Izin (Wajib)</label>
                                <textarea required value={permissionReason} onChange={e => setPermissionReason(e.target.value)} placeholder="Jelaskan sejelas-jelasnya" className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none" rows={3} />
                            </div>

                            <div className="flex items-center gap-3 bg-gray-800 p-3 rounded border border-gray-700 hover:border-blue-500/50 transition-colors">
                                <input
                                    type="checkbox"
                                    id="menyusul-check"
                                    checked={isMenyusul}
                                    onChange={(e) => setIsMenyusul(e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 bg-gray-900 border-gray-600 cursor-pointer"
                                />
                                <label htmlFor="menyusul-check" className="text-sm text-gray-200 cursor-pointer select-none">
                                    Saya akan <strong>menyusul</strong> nanti.
                                    <p className="text-xs text-gray-400 mt-0.5">Centang jika anda berencana hadir terlambat.</p>
                                </label>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1 flex items-center gap-1"><Upload size={16} /> Bukti (Opsional)</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500" />
                                {isCompressing ? (
                                    <div className="text-sm text-blue-400 mt-2">Mengkompres gambar...</div>
                                ) : previewUrl && (
                                    <img src={previewUrl} className="mt-2 max-h-32 rounded border border-gray-700" alt="Preview" />
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={closeModals} className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Batal</button>
                                <button type="submit" disabled={isSubmitting || isCompressing} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 disabled:opacity-50">{isSubmitting ? 'Mengirim...' : 'Kirim Izin'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Buat Sesi Absensi</h2>
                        <form onSubmit={handleCreateSession} className="space-y-4 text-left">
                            <div><label className="block text-gray-400 text-sm mb-1">Judul</label><input required value={newSessionData.title} onChange={e => setNewSessionData({ ...newSessionData, title: e.target.value })} className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-yellow-400 outline-none" /></div>
                            <div><label className="block text-gray-400 text-sm mb-1">Deskripsi</label><textarea value={newSessionData.description} onChange={e => setNewSessionData({ ...newSessionData, description: e.target.value })} className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-yellow-400 outline-none" rows={3} /></div>
                            <div className="flex items-center gap-2"><input type="checkbox" id="reqPhoto" checked={newSessionData.is_photo_required} onChange={e => setNewSessionData({ ...newSessionData, is_photo_required: e.target.checked })} className="w-4 h-4 rounded text-yellow-400 bg-gray-800" /><label htmlFor="reqPhoto" className="text-white text-sm cursor-pointer">Wajib Upload Foto?</label></div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Batal</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Memproses...' : 'Buat Sesi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
