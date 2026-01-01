const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- TEMPEL KEY KAMU LANGSUNG DI BAWAH INI (JANGAN PAKAI .ENV DULU) ---
const MY_KEY = "AIzaSyA_yIX_OxaOZ58CD16MpY-5uE_t82451vg"; // <-- Paste Key disini
// -----------------------------------------------------------------------

async function test() {
    console.log("Tes Key:", MY_KEY);
    console.log("Panjang Key:", MY_KEY.length);

    try {
        const genAI = new GoogleGenerativeAI(MY_KEY);
        // Kita tes pakai model yang paling basic dulu
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("Mencoba menghubungi Google...");
        const result = await model.generateContent("Tes 123, apakah kamu hidup?");
        
        console.log("✅ SUKSES! Key Valid.");
        console.log("Respon:", result.response.text());
    } catch (error) {
        console.error("❌ GAGAL! Error:", error.message);
        console.error("Detail:", JSON.stringify(error, null, 2));
    }
}

test();