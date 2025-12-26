import React, { useState, useRef, useEffect } from 'react';
import {
  Library as LibraryIcon, ArrowUpRight, MessageCircle, X, Send,
  Users, Copy, Link as LinkIcon, LogIn, LogOut, Bot
} from 'lucide-react';
import SkewedButton from '../components/SkewedButton';

// --- GANTI DENGAN URL SUPABASE KAMU ---
import { createClient } from '@supabase/supabase-js';

// Pastikan URL dan KEY ini sesuai dengan project Supabase kamu
const supabaseUrl = 'https://pbdieahobkvovxrokkag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZGllYWhvYmt2b3Z4cm9ra2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5Nzg5OTgsImV4cCI6MjA4MTU1NDk5OH0.p91H2et2Tf3K0ZJUjdfT8NwJuhTsl-FvEoLiOsuMtp0';
const supabase = createClient(supabaseUrl, supabaseKey);

// URL API Backend (Node.js)
const API_URL = 'http://localhost:3001/api';

export interface LibraryItem {
  id: number;
  title: string;
  description: string;
  image: string;
  driveLink: string;
  semester: 1 | 2;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
  isMe?: boolean;
  isAi?: boolean;
}

const libraryData: LibraryItem[] = [
  {
    id: 1,
    title: 'Matematika I',
    description: '',
    image: 'https://rencanamu.id/assets/file_uploaded/blog/1572532392-shuttersto.jpg',
    driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
    semester: 1,
  },
  {
    id: 2,
    title: 'Fisika Dasar I',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
  },
  {
    id: 3,
    title: 'Kimia Dasar I',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy',
    semester: 1,
  },
  {
    id: 4,
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
  },
  {
    id: 9,
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
  },
  {
    id: 5,
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
  },
  {
    id: 6,
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
  },
  {
    id: 7,
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
  },
];

const Library: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const filteredItems = libraryData.filter(item => item.semester === selectedSemester);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatView, setChatView] = useState<'menu' | 'join' | 'room'>('menu');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- AUTO RESTORE SESSION (FITUR BARU) ---
  useEffect(() => {
    // Cek LocalStorage saat halaman dimuat
    const savedRoomId = localStorage.getItem('chat_roomId');
    const savedUsername = localStorage.getItem('chat_username');
    const savedAiMode = localStorage.getItem('chat_isAiMode');

    if (savedRoomId && savedUsername) {
      setRoomId(savedRoomId);
      setUsername(savedUsername);
      setIsAiMode(savedAiMode === 'true');
      setChatView('room'); // Langsung masuk room
      // Opsional: setIsChatOpen(true) jika ingin chat otomatis terbuka
    }
  }, []);

  // --- HELPER SAVE TO STORAGE ---
  const saveSession = (id: string, user: string, aiMode: boolean) => {
    localStorage.setItem('chat_roomId', id);
    localStorage.setItem('chat_username', user);
    localStorage.setItem('chat_isAiMode', String(aiMode));
  };

  // --- HELPER CLEAR STORAGE ---
  const clearSession = () => {
    localStorage.removeItem('chat_roomId');
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_isAiMode');
  };

  // --- Real-time Listener (Supabase) ---
  useEffect(() => {
    if (chatView === 'room' && roomId) {

      const fetchInitialMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (data) {
          const msgs = data.map((d: any) => ({
            id: d.id, text: d.text, sender: d.sender, createdAt: d.created_at, isAi: d.is_ai,
            isMe: d.sender === username
          }));
          setMessages(msgs);
        }
      };

      fetchInitialMessages();

      const channel = supabase
        .channel(`room-chat:${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        }, (payload) => {
          const newMsg = payload.new as any;
          const formattedMsg: ChatMessage = {
            id: newMsg.id,
            text: newMsg.text,
            sender: newMsg.sender,
            createdAt: newMsg.created_at,
            isAi: newMsg.is_ai,
            isMe: newMsg.sender === username
          };
          setMessages((prev) => [...prev, formattedMsg]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatView, roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);


  const handleCreateGroup = async () => {
    if (!username.trim()) return alert("Masukkan nama dulu!");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.roomId) {
        setRoomId(data.roomId);
        setIsAiMode(false);
        saveSession(data.roomId, username, false); // SIMPAN SESI
        setChatView('room');
      }
    } catch (error) {
      alert("Gagal koneksi server backend.");
    }
    setLoading(false);
  };

  const handleJoinGroup = async () => {
    if (!username.trim() || !roomId.trim()) return alert("Wajib diisi!");
    setLoading(true);

    // Validasi Room di DB
    const { data } = await supabase.from('rooms').select('id').eq('id', roomId.toUpperCase()).single();

    if (data) {
      const validRoomId = roomId.toUpperCase();
      setRoomId(validRoomId);
      setIsAiMode(false);
      saveSession(validRoomId, username, false); // SIMPAN SESI
      setChatView('room');
    } else {
      alert("Kode grup tidak ditemukan!");
    }
    setLoading(false);
  };

  const handleStartAiChat = async () => {
    const user = username.trim() || 'User';
    setUsername(user);
    const aiRoomId = `AI-${Date.now()}`;

    setRoomId(aiRoomId);
    setIsAiMode(true);
    saveSession(aiRoomId, user, true); // SIMPAN SESI
    setChatView('room');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const tempMsg = inputMessage;
    setInputMessage('');

    let textToSend = tempMsg;
    if (isAiMode) textToSend += " @ai";

    try {
      await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomId,
          text: textToSend,
          sender: username
        })
      });
    } catch (error) {
      setInputMessage(tempMsg);
      alert("Gagal mengirim pesan.");
    }
  };

  const handleLeaveGroup = () => {
    clearSession(); // HAPUS SESI
    setChatView('menu');
    setRoomId('');
    setMessages([]);
    setIsAiMode(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    alert('Kode grup disalin!');
  };

  return (
    <div className="relative min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">

      {/* --- Main Content (TIDAK BERUBAH) --- */}
      <div className={`mx-auto max-w-7xl text-center transition-all duration-300 ${isChatOpen ? 'pr-0 lg:pr-96' : ''}`}>
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
              <span className="transform skew-x-12"><LibraryIcon size={32} /></span>
            </div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Library</h1>
          </div>
        </div>

        <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>

        <div className="flex justify-center items-center gap-6 my-12">
          <SkewedButton onClick={() => setSelectedSemester(1)} variant={selectedSemester === 1 ? 'primary' : 'secondary'}>Semester 1</SkewedButton>
          <SkewedButton onClick={() => setSelectedSemester(2)} variant={selectedSemester === 2 ? 'primary' : 'secondary'}>Semester 2</SkewedButton>
        </div>

        <div className="min-h-[50vh] w-full">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <a key={item.id} href={item.driveLink} target="_blank" rel="noopener noreferrer" className="group relative block bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-yellow-500/40 transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400">
                  <img src={item.image} alt={item.title} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-gray-300 text-sm">{item.description}</p>
                  </div>
                  <ArrowUpRight className="absolute top-4 right-4 w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100" />
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500"><p>Tidak ada data semester ini.</p></div>
          )}
        </div>
      </div>

      {/* --- Chat Button --- */}
      <button onClick={() => setIsChatOpen(true)} className={`fixed bottom-6 right-6 z-40 p-4 bg-yellow-400 text-black rounded-full shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 hover:scale-110 transition-all duration-300 ${isChatOpen ? 'hidden' : 'flex'}`}>
        <Users size={28} />
      </button>

      {/* --- Sidebar Overlay --- */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
      )}

      {/* --- Sidebar Content --- */}
      <div className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-zinc-900 border-l border-yellow-400/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {isAiMode ? <Bot className="text-yellow-400" size={20} /> : <Users className="text-yellow-400" size={20} />}
            <h2 className="text-xl font-bold text-white tracking-wider">
              {chatView === 'room' ? (isAiMode ? 'AI ASSISTANT' : 'GROUP CHAT') : 'DISKUSI'}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {chatView === 'room' && (
              <button onClick={handleLeaveGroup} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Keluar Chat">
                <LogOut size={20} />
              </button>
            )}
            <button onClick={() => setIsChatOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* --- MENU VIEW --- */}
        {chatView === 'menu' && (
          <div className="flex flex-col h-[calc(100%-80px)] p-6 justify-center items-center space-y-6 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-2">
              <MessageCircle size={40} className="text-yellow-400" />
            </div>
            <h3 className="text-xl text-white font-bold">Mulai Chatting</h3>
            <p className="text-gray-400 text-sm">Pilih metode diskusi yang kamu inginkan.</p>

            <button onClick={() => { setIsCreating(true); setChatView('join'); }} className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
              <LinkIcon size={18} /> Buat Grup Baru
            </button>

            <button onClick={() => { setIsCreating(false); setChatView('join'); }} className="w-full py-3 bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-2">
              <LogIn size={18} /> Gabung Grup
            </button>

            <div className="w-full border-t border-gray-800 my-2"></div>

            <button onClick={handleStartAiChat} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
              <Bot size={18} /> Chat dengan AI (Solo)
            </button>
            <p className="text-xs text-gray-500">*AI sudah membaca semua materi PDF (RAG).</p>
          </div>
        )}

        {/* --- JOIN VIEW --- */}
        {chatView === 'join' && (
          <div className="flex flex-col p-6 space-y-6 mt-10">
            <div>
              <h3 className="text-xl text-white font-bold mb-1">{isCreating ? 'Buat Grup' : 'Gabung Grup'}</h3>
              <p className="text-gray-400 text-sm">Masukkan identitasmu.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-2">Nama Panggilan</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none" placeholder="Misal: Budi" />
              </div>

              {!isCreating && (
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Kode Grup</label>
                  <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none font-mono uppercase" placeholder="Contoh: X7Z99A" />
                </div>
              )}

              <button onClick={isCreating ? handleCreateGroup : handleJoinGroup} disabled={loading} className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors mt-4 disabled:opacity-50">
                {loading ? 'Memproses...' : (isCreating ? 'Buat & Masuk' : 'Masuk Sekarang')}
              </button>

              <button onClick={() => setChatView('menu')} className="w-full py-2 text-gray-500 hover:text-white text-sm">Kembali</button>
            </div>
          </div>
        )}

        {/* --- ROOM VIEW --- */}
        {chatView === 'room' && (
          <>
            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center text-xs">
              {isAiMode ? (
                <span className="text-blue-400 font-bold flex items-center gap-1"><Bot size={12} /> AI Private Session</span>
              ) : (
                <>
                  <span className="text-gray-400">Kode Grup: <span className="text-white font-mono font-bold ml-1">{roomId}</span></span>
                  <button onClick={copyToClipboard} className="text-yellow-400 hover:text-white flex items-center gap-1"><Copy size={12} /> Salin</button>
                </>
              )}
            </div>

            <div className="flex flex-col h-[calc(100%-180px)] overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 text-sm">
                  {isAiMode ? "Mulai bertanya materi kuliah..." : "Belum ada pesan."}
                  {!isAiMode && <p className="mt-2 text-xs text-yellow-500">Tips: Ketik <span className="font-mono bg-gray-800 px-1">@ai</span> untuk tanya bot.</p>}
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isMe && <span className="text-[10px] text-gray-500 ml-1">{msg.sender}</span>}
                      {msg.isAi && <span className="bg-blue-600 text-white text-[9px] px-1 rounded font-bold">AI</span>}
                    </div>

                    <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${msg.isAi
                        ? 'bg-zinc-800 text-blue-100 border border-blue-500/30'
                        : msg.isMe
                          ? 'bg-yellow-400 text-black rounded-tr-none font-medium'
                          : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                      }`}>
                      {msg.text.replace(' @ai', '')}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black border-t border-gray-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isAiMode ? "Tanya materi PDF..." : "Ketik pesan..."}
                  className="flex-1 bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 placeholder-gray-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Library;