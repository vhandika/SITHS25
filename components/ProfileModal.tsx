require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');
const hpp = require('hpp');
const { z } = require('zod');
const xss = require('xss');
const compression = require('compression');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 });

app.set('trust proxy', 1);

app.use(compression());

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hidePoweredBy: true
}));

app.use(cors({
    origin: [
        'https://sith-s25.my.id',
        'http://localhost:3000',
        'https://siths25.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is missing");
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

app.use(morgan('short'));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20000,
    message: { message: "Terlalu banyak request." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { message: "Terlalu banyak percobaan login." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '10kb' })); 
app.use(hpp());

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("ERROR: Supabase config missing");
    process.exit(1);
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: { persistSession: false }
});

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (e) {
        return res.status(400).json({ message: `Input tidak valid: ${e.errors[0].message}` });
    }
};

const loginSchema = z.object({
    nim: z.string().min(5).max(20).regex(/^[0-9]+$/, "NIM harus angka"),
    password: z.string().min(1, "Password wajib diisi")
});

const changePassSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6, "Password minimal 6 karakter")
        .regex(/[0-9]/, "Password baru harus ada angka")
});

const newsSchema = z.object({
    title: z.string().min(5, "Judul minimal 5 karakter").max(150),
    content: z.string().min(10, "Konten minimal 10 karakter"),
    category: z.string().min(3),
    is_public: z.string().optional()
});

const sessionSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    is_photo_required: z.boolean().optional().or(z.string())
});

const gallerySchema = z.object({
    title: z.string().min(3).max(100),
    drive_link: z.string().url().includes("drive.google.com")
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const checkFileHeader = (buffer) => {
    if (!buffer || buffer.length < 4) return false;
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    if (hex.startsWith('FFD8FF')) return true;
    if (hex === '89504E47') return true;
    if (hex.startsWith('52494646')) return true; 
    return false;
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format file harus JPG, PNG, atau WEBP.'), false);
        }
    }
});

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File terlalu besar (Max 5MB).' });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

const verifyFileContent = (req, res, next) => {
    if (!req.file && (!req.files || Object.keys(req.files).length === 0)) return next();

    if (req.file && !checkFileHeader(req.file.buffer)) {
        return res.status(400).json({ message: "File corrupt." });
    }

    if (req.files) {
        for (const key in req.files) {
            req.files[key].forEach(file => {
                if (!checkFileHeader(file.buffer)) {
                    throw new Error("File corrupt found");
                }
            });
        }
    }
    next();
};

const authenticateToken = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'Akses ditolak.' });

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token tidak valid.' });
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Izin ditolak.' });
            }
            req.user = user;
            next();
        });
    };
};

app.get('/', (req, res) => res.send("Hayoloh mau ngapin :V"));

// --- AUTH ---

app.post('/api/login', authLimiter, validate(loginSchema), async (req, res) => {
    const { nim, password } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, nim, password, name, role')
            .eq('nim', nim)
            .single();

        if (error || !user) return res.status(401).json({ message: 'NIM atau Password salah!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'NIM atau Password salah!' });

        const token = jwt.sign({ id: user.id, nim: user.nim, role: user.role }, JWT_SECRET, { expiresIn: '10d' });

        res.json({
            message: 'Login Berhasil',
            token,
            user: { nim: user.nim, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server Error.' });
    }
});

app.post('/api/change-password', authenticateToken(), validate(changePassSchema), async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const nim = req.user.nim;

    if (oldPassword === newPassword) return res.status(400).json({ message: 'Password baru tidak boleh sama.' });

    try {
        const { data: user } = await supabase.from('users').select('password').eq('nim', nim).single();
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password lama salah!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('nim', nim);
        if (error) throw error;

        res.json({ message: 'Password berhasil diubah!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal ganti password.' });
    }
});

app.get('/api/users', authenticateToken(), async (req, res) => {
   try {
        const { search } = req.query;
        let query = supabase.from('users').select('id, nim, name, role, tanggal_lahir, avatar_url').limit(150);
        
        if (search && typeof search === 'string') {
            const cleanSearch = search.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50);
            query = query.or(`name.ilike.%${cleanSearch}%,nim.ilike.%${cleanSearch}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ message: 'Data ditemukan', data });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// --- PROFILE ---

app.get('/api/user/:nim', authenticateToken(), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, nim, name, role, avatar_url, banner_url, bio, instagram, whatsapp, line, jurusan, other_links')
            .eq('nim', req.params.nim)
            .single();
            
        if (error || !data) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/user/profile', 
    authenticateToken(), 
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), 
    handleUploadError,
    verifyFileContent,
    async (req, res) => {
    try {
        const { bio, instagram, whatsapp, line, jurusan, other_links, delete_avatar, delete_banner } = req.body;
        const nim = req.user.nim;
        
        let updateData = { 
            bio: bio ? xss(bio) : null, 
            instagram: instagram ? xss(instagram) : null, 
            whatsapp: whatsapp ? xss(whatsapp) : null, 
            line: line ? xss(line) : null,
            jurusan: jurusan ? xss(jurusan) : null,
            other_links: other_links ? xss(other_links) : null
        };

        const { data: currentUser } = await supabase.from('users').select('avatar_url, banner_url').eq('nim', nim).single();

        if ((req.files && req.files['avatar']) || delete_avatar === 'true') {
            if (currentUser && currentUser.avatar_url) {
                const oldFileName = currentUser.avatar_url.split('/').pop();
                await supabase.storage.from('avatars').remove([oldFileName]);
            }
        }

        if (req.files && req.files['avatar']) {
            const file = req.files['avatar'][0];
            const fileExt = file.mimetype.split('/')[1];
            const fileName = `avatar-${nim}-${Date.now()}.${fileExt}`;
            
            const { error } = await supabase.storage.from('avatars').upload(fileName, file.buffer, { contentType: file.mimetype });
            if (!error) {
                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
                updateData.avatar_url = data.publicUrl;
            }
        } else if (delete_avatar === 'true') {
            updateData.avatar_url = null;
        }
        if ((req.files && req.files['banner']) || delete_banner === 'true') {
             if (currentUser && currentUser.banner_url) {
                const oldFileName = currentUser.banner_url.split('/').pop();
                await supabase.storage.from('banners').remove([oldFileName]);
            }
        }

        if (req.files && req.files['banner']) {
            const file = req.files['banner'][0];
            const fileExt = file.mimetype.split('/')[1];
            const fileName = `banner-${nim}-${Date.now()}.${fileExt}`;
            
            const { error } = await supabase.storage.from('banners').upload(fileName, file.buffer, { contentType: file.mimetype });
            if (!error) {
                const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
                updateData.banner_url = data.publicUrl;
            }
        } else if (delete_banner === 'true') {
            updateData.banner_url = null;
        }

        const { data, error } = await supabase.from('users').update(updateData).eq('nim', nim).select().single();
        if (error) throw error;

        res.json({ message: 'Profil berhasil diupdate', data });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ message: 'Gagal update profil' });
    }
});

// --- REPORT SYSTEM  ---

app.post('/api/report', async (req, res) => {
    try {
        const { sender_name, content } = req.body;

        const authHeader = req.headers['authorization'];
        let sender_nim = null;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                sender_nim = decoded.nim;
            } catch (e) {
            }
        }

        if (!content || content.length < 5) {
            return res.status(400).json({ message: "Isi laporan terlalu pendek (min 5 karakter)." });
        }

        const cleanContent = xss(content);
        const cleanName = sender_name ? xss(sender_name) : 'Anonymous';

        const { error } = await supabase.from('reports').insert([{
            sender_nim,
            sender_name: cleanName,
            content: cleanContent,
            status: 'Pending'
        }]);

        if (error) throw error;

        res.json({ message: "Laporan berhasil dikirim ke Developer." });
    } catch (err) {
        console.error("Report Error:", err);
        res.status(500).json({ message: "Gagal mengirim laporan." });
    }
});


app.get('/api/reports', authenticateToken(['dev']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: "Gagal memuat laporan." });
    }
});


app.put('/api/report/:id', authenticateToken(['dev']), async (req, res) => {
    try {
        const { status } = req.body;
        const { error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ message: "Status laporan diperbarui." });
    } catch (err) {
        res.status(500).json({ message: "Gagal update status." });
    }
});

// --- NEWS ---

app.post('/api/add-news', 
    authenticateToken(['admin', 'humas', 'dev']), 
    upload.single('image'), 
    handleUploadError, 
    verifyFileContent, 
    validate(newsSchema),
    async (req, res) => {
    try {
        const { title, content, category, is_public } = req.body;
        const cleanTitle = xss(title);
        const cleanContent = xss(content); 
        const file = req.file;
        
        let imageUrl = '';
        if (file) {
            const fileExt = file.mimetype.split('/')[1];
            const fileName = `news-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error } = await supabase.storage.from('news-images').upload(fileName, file.buffer, { contentType: file.mimetype });
            if (error) throw error;
            const { data } = supabase.storage.from('news-images').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }

        const { data, error } = await supabase.from('news').insert([{
            title: cleanTitle, 
            content: cleanContent, 
            category, 
            is_public: is_public === 'true', 
            image_url: imageUrl, 
            author: req.user.nim
        }]).select();

        if (error) throw error;

        cache.del("public_news"); 
        
        res.json({ message: 'Berita diposting!', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal posting berita' });
    }
});

app.put('/api/edit-news/:id', authenticateToken(['admin', 'humas', 'dev']), upload.single('image'), handleUploadError, verifyFileContent, validate(newsSchema), async (req, res) => {
    try {
        const { title, content, category, is_public } = req.body;
        const cleanTitle = xss(title);
        const cleanContent = xss(content); 
        const file = req.file;
        let updateData = { title: cleanTitle, content: cleanContent, category, is_public: is_public === 'true' };

        if (file) {
            const fileExt = file.mimetype.split('/')[1];
            const fileName = `news-up-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error } = await supabase.storage.from('news-images').upload(fileName, file.buffer, { contentType: file.mimetype });
            if (error) throw error;
            const { data } = supabase.storage.from('news-images').getPublicUrl(fileName);
            updateData.image_url = data.publicUrl;
        }

        const { data, error } = await supabase.from('news').update(updateData).eq('id', req.params.id).select();
        if (error) throw error;
        
        cache.del("public_news");
        
        res.json({ message: 'Berita diupdate', data });
    } catch (error) {
        res.status(500).json({ message: 'Gagal update berita' });
    }
});

app.delete('/api/delete-news/:id', authenticateToken(['admin', 'humas', 'dev']), async (req, res) => {
    try {
        const { error } = await supabase.from('news').delete().eq('id', req.params.id);
        if (error) throw error;
        
        cache.del("public_news");
        
        res.json({ message: 'Berita dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal hapus berita' });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        let isUser = false;
        if (token) {
            try { jwt.verify(token, JWT_SECRET); isUser = true; } catch (e) {}
        }

        if (!isUser) {
            const cachedData = cache.get("public_news");
            if (cachedData) {
                return res.json({ message: 'Berita dimuat (Cache)', data: cachedData });
            }
        }

        let query = supabase.from('news').select('*').order('created_at', { ascending: false });
        if (!isUser) query = query.eq('is_public', true);

        query = query.limit(20); 

        const { data, error } = await query;
        if (error) throw error;

        if (!isUser) {
            cache.set("public_news", data);
        }

        res.json({ message: 'Berita dimuat', data });
    } catch (error) {
        res.status(500).json({ message: 'Error server' });
    }
});

// --- ATTENDANCE ---

app.post('/api/attendance/sessions', authenticateToken(['admin', 'sekretaris', 'dev']), validate(sessionSchema), async (req, res) => {
    try {
        const { title, description, is_photo_required } = req.body;
        const cleanTitle = xss(title);
        const cleanDesc = description ? xss(description) : "";

        const photoReq = is_photo_required === true || is_photo_required === 'true';

        const { data, error } = await supabase.from('attendance_sessions')
            .insert([{ 
                title: cleanTitle, 
                description: cleanDesc, 
                is_photo_required: photoReq, 
                created_by: req.user.nim, 
                is_open: true 
            }]).select();
        
        if (error) throw error;
        res.json({ message: 'Sesi dibuat', data });
    } catch (err) {
        res.status(500).json({ message: 'Gagal buat sesi' });
    }
});

app.get('/api/attendance/sessions', authenticateToken(), async (req, res) => {
    try {
        const { data, error } = await supabase.from('attendance_sessions').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: 'Error server' });
    }
});

app.put('/api/attendance/close/:id', authenticateToken(['admin', 'sekretaris', 'dev']), async (req, res) => {
    try {
        const { error } = await supabase.from('attendance_sessions').update({ is_open: false }).eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Sesi ditutup' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menutup sesi' });
    }
});

app.post('/api/attendance/submit', authenticateToken(), upload.single('image'), handleUploadError, verifyFileContent, async (req, res) => {
    try {
        const { session_id, user_name_input, status, reason } = req.body;
        const user_nim = req.user.nim;
        const file = req.file;

        if(!session_id || !status) return res.status(400).json({message: "Data tidak lengkap"});

        const { data: session, error: sErr } = await supabase.from('attendance_sessions').select('*').eq('id', session_id).single();
        if (sErr || !session) return res.status(404).json({ message: 'Sesi tak ditemukan' });
        if (!session.is_open) return res.status(400).json({ message: 'Sesi sudah ditutup' });

        const { data: existing } = await supabase.from('attendance_records').select('id').eq('session_id', session_id).eq('user_nim', user_nim).single();
        if (existing) return res.status(400).json({ message: 'Sudah mengisi kehadiran/izin!' });

        if (status !== 'Izin' && session.is_photo_required && !file) {
            return res.status(400).json({ message: 'Wajib upload foto bukti kehadiran!' });
        }

        let photoUrl = null;
        if (file) {
            const fileExt = file.mimetype.split('/')[1];
            const fileName = `att-${session_id}-${user_nim}-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('attendance-images').upload(fileName, file.buffer, { contentType: file.mimetype });
            if (error) throw error;
            const { data } = supabase.storage.from('attendance-images').getPublicUrl(fileName);
            photoUrl = data.publicUrl;
        }

        let realName = user_nim;
        const { data: uData } = await supabase.from('users').select('name').eq('nim', user_nim).single();
        if (uData && uData.name) {
            realName = uData.name;
        } else if (user_name_input) {
            realName = xss(user_name_input);
        }

        let finalStatus = 'Hadir';
        let finalReason = null;

        if (status === 'Izin') {
            finalStatus = 'Izin';
            finalReason = reason ? xss(reason) : 'Izin tanpa keterangan';
        } else if (session.is_photo_required) {
            finalStatus = 'Pending';
        }

        const { error } = await supabase.from('attendance_records').insert([{
            session_id, 
            user_nim, 
            user_name: realName, 
            photo_url: photoUrl, 
            status: finalStatus,
            reason: finalReason 
        }]);

        if (error) {
            if (error.code === '23505') return res.status(400).json({ message: 'Sudah mengisi data!' });
            throw error;
        }

        let msg = 'Absen Berhasil';
        if (finalStatus === 'Pending') msg = 'Terkirim (Menunggu Verifikasi)';
        if (finalStatus === 'Izin') msg = 'Permohonan Izin Tercatat';

        res.json({ message: msg });
    } catch (err) {
        console.error("Submit Error:", err);
        res.status(500).json({ message: 'Gagal mengirim data.' });
    }
});

app.put('/api/attendance/approve/:record_id', authenticateToken(['admin', 'sekretaris', 'dev']), async (req, res) => {
    try {
        const { error } = await supabase.from('attendance_records').update({ status: 'Hadir' }).eq('id', req.params.record_id);
        if (error) throw error;
        res.json({ message: 'Diverifikasi' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal verifikasi' });
    }
});

app.post('/api/attendance/manual', authenticateToken(['admin', 'sekretaris', 'dev']), async (req, res) => {
    try {
        const { session_id, target_nim, target_name, status } = req.body;
        const cleanName = xss(target_name);
        
        const { error } = await supabase.from('attendance_records').insert([{
            session_id, user_nim: target_nim, user_name: cleanName, status: status || 'Hadir'
        }]);
        if (error && error.code === '23505') return res.status(400).json({ message: 'Sudah absen' });
        if (error) throw error;
        res.json({ message: 'Done' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal input' });
    }
});

app.get('/api/attendance/stats/:session_id', authenticateToken(['admin', 'sekretaris', 'dev']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('attendance_records').select('*').eq('session_id', req.params.session_id);
        if (error) throw error;
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: 'Gagal ambil data' });
    }
});

// --- GALLERY ---

app.get('/api/gallery', authenticateToken(), async (req, res) => {
    try {
        const cachedGallery = cache.get("gallery_list");
        if (cachedGallery) {
            return res.json({ data: cachedGallery });
        }

        const { data, error } = await supabase
            .from('gallery_links')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        cache.set("gallery_list", data);
        
        res.json({ data });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memuat gallery' });
    }
});

app.post('/api/gallery', authenticateToken(), validate(gallerySchema), async (req, res) => {
    const { title, drive_link } = req.body;
    const { nim } = req.user;

    const cleanTitle = xss(title);

    try {
        let userName = nim;
        const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('nim', nim)
            .single();
        
        if (userData && userData.name) {
            userName = userData.name;
        }

        const { data, error } = await supabase
            .from('gallery_links')
            .insert([{ 
                title: cleanTitle, 
                drive_link, 
                user_nim: nim,
                user_name: userName 
            }])
            .select();

        if (error) throw error;
        
        cache.del("gallery_list");
        
        res.json({ message: 'Link berhasil ditambahkan!', data });
    } catch (err) {
        console.error("Gallery Error:", err);
        res.status(500).json({ message: 'Gagal menyimpan link.' });
    }
});

app.delete('/api/gallery/:id', authenticateToken(), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const { data: item, error: fetchError } = await supabase
            .from('gallery_links')
            .select('user_nim')
            .eq('id', id)
            .single();

        if (fetchError || !item) {
            return res.status(404).json({ message: 'Folder tidak ditemukan.' });
        }

        if (item.user_nim !== user.nim && user.role !== 'admin' && user.role !== 'dev') {
            return res.status(403).json({ message: 'Anda tidak berhak menghapus folder ini.' });
        }

        const { error: deleteError } = await supabase
            .from('gallery_links')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        
        cache.del("gallery_list");

        res.json({ message: 'Folder berhasil dihapus.' });

    } catch (err) {
        console.error("Gallery Delete Error:", err);
        res.status(500).json({ message: 'Gagal menghapus folder.' });
    }
});

module.exports = app;
