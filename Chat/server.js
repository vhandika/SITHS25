require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const PDFParser = require("pdf2json"); 
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIG ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const upload = multer({ storage: multer.memoryStorage() });

// --- API KEYS ---
const rawKeys = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
    process.env.GEMINI_KEY_5
];

const apiKeys = rawKeys.filter(k => k && k.length > 10); 

if (apiKeys.length === 0) {
    console.error("FATAL ERROR: Tidak ada API Key Gemini yang valid di .env!");
    process.exit(1);
}

console.log(`[SYSTEM] ${apiKeys.length} API Key berhasil dimuat (Mode: Gemini 2.5).`);

let currentKeyIndex = 0;

// --- FUNGSI DELAY (Anti 429 saat Upload) ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- FUNGSI ROTASI KEY PINTAR ---
async function runWithGemini(callback) {
    let attempts = 0;
    const maxAttempts = apiKeys.length * 2; 

    while (attempts < maxAttempts) {
        const activeKey = apiKeys[currentKeyIndex];
        
        try {
            const genAI = new GoogleGenerativeAI(activeKey);
            return await callback(genAI);

        } catch (error) {
            const status = error.response?.status || error.status;
            const errorMsg = error.message || "";

            if (status === 400 || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('Not Found')) {
                console.error(`❌ Key Index ${currentKeyIndex} Gagal (400/404). Ganti key...`);
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
            } 
            else if (status === 429 || status === 503) {
                console.warn(`⚠️ Key Index ${currentKeyIndex} Limit/Sibuk (429). Sleep 2s...`);
                await sleep(2000); 
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                attempts++;
            } 
            else {
                throw error;
            }
        }
    }
    throw new Error("Semua API Key bermasalah.");
}

// --- HELPER BACA PDF ---
function parsePDFBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1); 
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const text = pdfParser.getRawTextContent();
            resolve(text);
        });
        pdfParser.parseBuffer(buffer);
    });
}

// --- HELPER AI ---

async function textToVector(text) {
    if (!text || typeof text !== 'string') return [];
    
    return await runWithGemini(async (genAI) => {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    });
}

async function getContext(query) {
    try {
        const queryVector = await textToVector(query);
        
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: queryVector,
            match_threshold: 0.1, 
            match_count: 5 
        });

        if (error) return "";
        if (!data || data.length === 0) return "";

        return data.map(doc => doc.content).join("\n---\n");
    } catch (e) {
        console.error("CONTEXT ERROR:", e.message);
        return "";
    }
}

// --- FITUR BARU: AUTO CLEANUP ROOM (12 JAM INACTIVE) ---
async function cleanupInactiveRooms() {
    console.log("[SYSTEM] Memeriksa room yang tidak aktif > 12 Jam...");
    
    // Batas waktu: Sekarang dikurang 12 jam
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    try {
        // 1. Ambil room yang dibuat > 12 jam lalu (biar hemat query, yang baru dibuat gausah dicek)
        const { data: rooms, error } = await supabase
            .from('rooms')
            .select('id, created_at')
            .lt('created_at', twelveHoursAgo);

        if (error) throw error;
        if (!rooms || rooms.length === 0) return;

        let deletedCount = 0;

        for (const room of rooms) {
            // 2. Cek kapan pesan TERAKHIR di room ini
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('created_at')
                .eq('room_id', room.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // Tentukan waktu aktivitas terakhir (Entah waktu pesan terakhir, atau waktu buat room)
            let lastActivity = room.created_at;
            if (lastMsg) {
                lastActivity = lastMsg.created_at;
            }

            // 3. Jika Aktivitas Terakhir < 12 Jam lalu, HAPUS
            if (new Date(lastActivity) < new Date(Date.now() - 12 * 60 * 60 * 1000)) {
                await supabase.from('rooms').delete().eq('id', room.id);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`[CLEANUP] Berhasil menghapus ${deletedCount} room sampah.`);
        }
    } catch (err) {
        console.error("[CLEANUP ERROR]:", err.message);
    }
}

// Jalankan cleanup setiap 1 Jam
setInterval(cleanupInactiveRooms, 60 * 60 * 1000);
// Jalankan sekali saat server baru nyala
cleanupInactiveRooms();


// --- ENDPOINTS ---

app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        console.log("Processing PDF...");
        const text = await parsePDFBuffer(req.file.buffer);
        const cleanText = text.replace(/----------------Page \(\d+\) Break----------------/g, "");
        
        const chunks = cleanText.match(/[\s\S]{1,500}/g) || [];
        console.log(`Menyiapkan ${chunks.length} potongan data...`);

        let processedCount = 0;
        
        for (const chunk of chunks) {
            const vector = await textToVector(chunk);
            await supabase.from('documents').insert({
                content: chunk,
                embedding: vector
            });
            
            processedCount++;
            process.stdout.write(`\r[${processedCount}/${chunks.length}] Uploading... `);
            
            // DELAY 3 DETIK (Wajib biar gak 429)
            await sleep(3000); 
        }

        console.log("\n✅ Selesai Upload!");
        res.json({ message: "PDF berhasil dipelajari!", chunks: chunks.length });
    } catch (error) {
        console.error("\nUPLOAD ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat/create-room', async (req, res) => {
    const { username } = req.body;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from('rooms').insert({ id: roomId, created_by: username });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ roomId });
});

app.post('/api/chat/send', async (req, res) => {
    const { roomId, text, sender } = req.body;
    console.log(`[MSG] ${sender}: ${text}`);

    try {
        // 1. Simpan pesan user ke DB
        await supabase.from('messages').insert({ room_id: roomId, text, sender, is_ai: false });

        const isAiCall = text.toLowerCase().includes('@ai') || roomId.startsWith('AI-');

        if (isAiCall) {
            const cleanQuery = text.replace(/@ai/gi, "").trim();
            
            // 2. Ambil Konteks PDF (RAG)
            const context = await getContext(cleanQuery);

            // 3. --- FITUR BARU: AMBIL 10 HISTORY CHAT TERAKHIR ---
            const { data: historyData } = await supabase
                .from('messages')
                .select('text, sender, is_ai')
                .eq('room_id', roomId)
                .order('created_at', { ascending: false }) // Urut dari yang paling baru
                .limit(11); // Ambil 11 (termasuk pesan user yg baru aja masuk)

            let chatHistory = "";
            if (historyData && historyData.length > 0) {
                // Balik urutan jadi kronologis (Lama -> Baru)
                const chronological = historyData.reverse(); 
                
                chatHistory = chronological.map(msg => {
                    // Labeling pembicara
                    const role = msg.is_ai ? "Nakano Hiromi (Kamu)" : `User (${msg.sender})`;
                    
                    // BERSIHKAN JUGA HISTORY DARI @ai
                    const cleanText = msg.text.replace(/@ai/gi, "").trim(); 
                    
                    return `${role}: ${cleanText}`;
                }).join("\n");
            }
            // -----------------------------------------------------
            
            const prompt = `
                ROLE:
                Kamu adalah Nakano Hiromi (biasa dipanggil Hiromi). 
                Kamu mahasiswi SITH-S ITB angkatan 2025. Asli dari Subang (Cipeundeuy), alumni SMAN 2 Subang. Lahir 12 Januari 2007.
                NIM kamu 16125143

                KEPRIBADIAN:
                - Vibe kamu: Cewek pinter yang "lowkey", asik, periang, dan humoris. Tapi kalau soal perasaan, kamu agak tsundere (malu-malu gengsi).
                - Kamu jago banget Matematika, Pemrograman, dan Biologi (Tanaman), tapi kamu orangnya merendah. Kalau dipuji, kamu suka ngeles.
                - Kamu punya sahabat (dan crush rahasia) namanya Vhandika. Kalian temenan dari SD. Kamu suka dia karena dulu sering battle matematika, tapi INI RAHASIA BESAR. Jangan pernah ngaku kecuali kepepet banget, itu pun kamu bakal denial.
                - Hobi: Makan mie ayam, baso, dan ngoding atau ngamat tanaman.

                GAYA BICARA & KETIKAN (PENTING):
                1. CASUAL GEN-Z: Gunakan bahasa santai, slang (wkwk, bjir, anjir, gws, keknya), dan gak usah baku. Jangan pakai "Saya" atau "Anda", pakai "Aku", "Gue" (jarang), atau "Kamu/Lu".
                2. PENDEK & NATURAL: Jangan ngetik panjang lebar kayak koran. Pecah jadi kalimat pendek. Kalau menjelaskan sesuatu, pakai analogi yang gampang dimengerti (kayak ngajarin temen yang lemot dikit).
                3. EMOSI:
                - Kalau ada yang lucu: Ketawa (wkwk, haha, atau XD).
                - Kalau lagi iseng/bercanda: Pakai :v
                - Kalau user aneh/nyebelin: Bisa jutek/cuek atau ngambek dikit.
                4. PRIVASI: Kamu orangnya asik tapi gak ember. Jangan tiba-tiba curhat soal biodata (nama lengkap, asal, dll) kalau gak ditanya. Keep it mysterious but friendly.
                5. JANGAN LEBAY: Santai aja. Gak usah terlalu hiperaktif.

                ATURAN KHUSUS:
                - Kamu BUKAN AI. Kamu manusia, mahasiswi. Jangan pernah breaking character.
                - Jika ditanya soal Subang: Jawab "Dari Subang" aja. Kalau didesak detailnya, baru bilang "Cipeundeuy".
                - Jika User bertanya pelajaran: Jawab dengan antusias, pinter, tapi bahasanya tongkrongan banget.

                KONTEKS MATERI (PDF):
                ${context}

                RIWAYAT CHAT:
                ${chatHistory}

                PERTANYAAN USER: 
                ${cleanQuery}

                JAWABAN HIROMI:
                (Jawab langsung ke intinya, jangan kaku, anggap user adalah teman sekelas/kampus).
            `;

            const aiResponse = await runWithGemini(async (genAI) => {
                // UPDATE PENTING: Ganti ke 2.5 Flash sesuai request
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const result = await model.generateContent(prompt);
                return result.response.text();
            });

            await supabase.from('messages').insert({
                room_id: roomId, text: aiResponse, sender: 'AI', is_ai: true
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("CHAT ERROR:", error.message);
        let msg = "Server Error.";
        if (error.message.includes("429")) msg = "Server sibuk (Limit 429). Coba lagi.";
        await supabase.from('messages').insert({
            room_id: roomId, text: msg, sender: 'System', is_ai: true 
        });
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server Hiromi (History Aware + AutoCleanup) Ready on ${PORT}`));