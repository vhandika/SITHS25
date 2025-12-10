import React, { useState, useEffect } from 'react';
import { X, Camera, Instagram, Phone, MessageCircle, Globe, Loader, AlertCircle, Save, Edit2 } from 'lucide-react';

const API_BASE_URL = 'https://idk-eight.vercel.app/api'; 

interface ProfileModalProps {
    targetNim: string;
    currentUserNim: string | null;
    onClose: () => void;
}

const SOLID_COLORS = [
    '#1f2937', '#000000', '#1e3a8a', '#be123c', '#065f46', '#b45309', '#7c2d12', '#4c1d95',
];

const ProfileModal: React.FC<ProfileModalProps> = ({ targetNim, currentUserNim, onClose }) => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        bio: '', instagram: '', whatsapp: '', line: '', jurusan: '', other_links: ''
    });
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isOwnProfile = targetNim === currentUserNim;

    useEffect(() => {
        if (targetNim) fetchProfile();
    }, [targetNim]);

    const fetchProfile = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/user/${targetNim}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (res.ok && json.data) {
                setUserData(json.data);
                setFormData({
                    bio: json.data.bio || '',
                    instagram: json.data.instagram || '',
                    whatsapp: json.data.whatsapp || '',
                    line: json.data.line || '',
                    jurusan: json.data.jurusan || '',
                    other_links: json.data.other_links || ''
                });
            } else {
                setErrorMsg(json.message || "Gagal memuat data user.");
            }
        } catch (e) { 
            console.error(e);
            setErrorMsg("Terjadi kesalahan koneksi."); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('userToken');
        const data = new FormData();
        
        Object.keys(formData).forEach(key => data.append(key, (formData as any)[key]));
        if (avatarFile) data.append('avatar', avatarFile);
        if (bannerFile) data.append('banner', bannerFile);

        try {
            const res = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            if (res.ok) {
                setIsEditing(false);
                fetchProfile(); 
            } else {
                alert("Gagal update profil");
            }
        } catch (e) { alert("Error koneksi"); }
        finally { setIsSaving(false); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            if (type === 'avatar') { setAvatarFile(file); setPreviewAvatar(url); }
            else { setBannerFile(file); setPreviewBanner(url); }
        }
    };

    const handleColorSelect = (color: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if(blob) {
                    const file = new File([blob], "solid_color.png", { type: "image/png" });
                    setBannerFile(file);
                    setPreviewBanner(URL.createObjectURL(file));
                }
            });
        }
    };

    if (!targetNim) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-gray-900 text-white rounded-xl overflow-hidden relative shadow-2xl flex flex-col h-[90vh] border border-gray-800">
                
                {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Loader className="animate-spin text-yellow-400" size={32} />
                        <p className="text-sm text-gray-400">Memuat profil...</p>
                    </div>
                )}

                {!loading && errorMsg && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8">
                        <AlertCircle size={48} className="text-red-500" />
                        <p className="text-gray-400">{errorMsg}</p>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">Tutup</button>
                    </div>
                )}

                {!loading && !errorMsg && userData && (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">

                            <div className="h-32 bg-gray-800 relative group w-full shrink-0">
                                <img 
                                    src={previewBanner || userData.banner_url || "https://placehold.co/600x200/1f2937/FFF?text=Background Ceritanya :v"} 
                                    className="w-full h-full object-cover" 
                                    alt="Banner" 
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="cursor-pointer flex flex-col items-center text-white mb-3 hover:text-yellow-400 transition-colors">
                                            <div className="bg-white/10 p-2 rounded-full mb-1"><Camera size={20} /></div>
                                            <span className="text-[10px] font-bold">Upload Foto</span>
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                                        </label>
                                        <div className="flex gap-2 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                            {SOLID_COLORS.map((color) => (
                                                <button key={color} type="button" onClick={() => handleColorSelect(color)} className="w-5 h-5 rounded-full border border-white/30 hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button onClick={onClose} className="absolute top-2 right-2 bg-black/40 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors z-20 backdrop-blur-sm">
                                    <X size={20}/>
                                </button>
                            </div>

                            <div className="px-6 pb-6 bg-gray-900 min-h-[300px]">
                                <div className="relative -mt-12 mb-3 w-24 h-24 mx-auto sm:mx-0 z-10">
                                    <div className="w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800 shadow-xl relative group">
                                        <img 
                                            src={previewAvatar || userData.avatar_url || `https://ui-avatars.com/api/?name=${userData.name}&background=random`} 
                                            className="w-full h-full object-cover" 
                                            alt="Profile" 
                                        />
                                        {isEditing && (
                                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={20} />
                                                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center sm:text-left mb-6">
                                    <h2 className="text-2xl font-bold text-white leading-tight">{userData.name}</h2>
                                    <p className="text-gray-500 text-sm font-mono mb-2">{userData.nim}</p>
                                    {isEditing ? (
                                        <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-400 outline-none" placeholder="Jurusan" value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value})} />
                                    ) : (
                                        <p className="text-yellow-400 font-semibold text-sm">{userData.jurusan || 'NULL'}</p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kontak & Sosmed</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-green-500"><Phone size={20} /></div>
                                                <div className="flex-1"><input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none transition-colors" placeholder="WhatsApp (Tanpa angka 0 di depan)" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} /></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-white"><MessageCircle size={20} /></div>
                                                <div className="flex-1"><input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-white outline-none transition-colors" placeholder="Paste url line kalian" value={formData.line} onChange={e => setFormData({...formData, line: e.target.value})} /></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-pink-500"><Instagram size={20} /></div>
                                                <div className="flex-1"><input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 outline-none transition-colors" placeholder="Instagram Username (tanpa @)" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} /></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center sm:justify-start gap-4">
                                            <div className={`flex flex-col items-center gap-1 ${userData.whatsapp ? 'flex' : 'hidden'}`}>
                                                <a href={`https://wa.me/+62${userData.whatsapp}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors group"><Phone size={20} /></a>
                                                <span className="text-[10px] text-gray-500">WhatsApp</span>
                                            </div>
                                            <div className={`flex flex-col items-center gap-1 ${userData.line ? 'flex' : 'hidden'}`}>
                                                <a href={`${userData.line}`} target='_blank' rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center text-white hover:border-white transition-colors group"><MessageCircle size={20} /></a>
                                                <span className="text-[10px] text-gray-500">Line</span>
                                            </div>
                                            <div className={`flex flex-col items-center gap-1 ${userData.instagram ? 'flex' : 'hidden'}`}>
                                                <a href={`https://instagram.com/${userData.instagram}`} target='_blank' rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center text-pink-500 hover:border-pink-500 transition-colors group"><Instagram size={20} /></a>
                                                <span className="text-[10px] text-gray-500">Instagram</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About Me</h3>
                                    {isEditing ? (
                                        <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-400 outline-none text-white resize-none" rows={3} placeholder="Tulis sesuatu..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                                    ) : (
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{userData.bio || ""}</p>
                                    )}
                                    <div className="h-px bg-gray-800 w-full my-4"></div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Link Lainnya</h3>
                                    {isEditing ? (
                                        <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:border-yellow-400 outline-none text-white resize-none" placeholder="Judul: URL (di ujung tambakan koma)" value={formData.other_links} onChange={e => setFormData({...formData, other_links: e.target.value})} />
                                    ) : (
                                        <ul className="space-y-2">
                                            {userData.other_links ? userData.other_links.split(',').map((link: string, i: number) => {
                                                const parts = link.split(':');
                                                if (parts.length < 2) return null;
                                                const label = parts[0];
                                                const url = parts.slice(1).join(':'); 
                                                return url ? (
                                                    <li key={i} className="flex items-center gap-2 text-sm">
                                                        <Globe size={14} className="text-gray-500 shrink-0"/>
                                                        <span className="text-gray-400 font-medium truncate max-w-[100px]">{label}</span>
                                                        <span className="mx-1 text-gray-600">:</span>
                                                        <a href={url.trim()} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate flex-1 block">{url.trim()}</a>
                                                    </li>
                                                ) : null;
                                            }) : <span className="text-xs text-gray-600 italic">-</span>}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isOwnProfile && (
                            <div className="p-4 border-t border-gray-800 bg-gray-900 z-20 shrink-0">
                                {isEditing ? (
                                    <div className="flex gap-3">
                                        <button onClick={() => { setIsEditing(false); setFormData({ bio: userData.bio || '', instagram: userData.instagram || '', whatsapp: userData.whatsapp || '', line: userData.line || '', jurusan: userData.jurusan || '', other_links: userData.other_links || '' }); }} disabled={isSaving} className="flex-1 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors">Batal</button>
                                        <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-300 flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 disabled:opacity-50 transition-colors">{isSaving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Simpan</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;