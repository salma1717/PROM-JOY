import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { createChatSession, sendMessageStream } from './services/geminiService';
import { saveChatToFirebase, loadChatHistoryFromFirebase } from './services/firebaseService';
import ChatMessage from './components/ChatMessage';
import DisclaimerModal from './components/DisclaimerModal';
import EmergencyPanel from './components/EmergencyPanel';
import RespondenModal from './components/RespondenModal';
import { Message, Sender } from './types';
import { INITIAL_MESSAGE, APP_NAME } from './constants';
import { loadChatHistory, saveChatHistory } from './utils/storageUtils';

import Mascot from './components/Mascot';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRespondenModal, setShowRespondenModal] = useState(false);

  // Ref for the chat session to persist across renders
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for userId on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    if (savedUserId) {
      setUserId(savedUserId);
    } else {
      setShowRespondenModal(true);
    }
  }, []);

  // Load chat history whenever userId is set (either from localStorage or from RespondenModal)
  useEffect(() => {
    if (userId) {
      console.log('📝 Loading chat for userId:', userId);
      loadChatHistoryFromFirebase(userId).then((history) => {
        console.log('📥 Loaded history from Firebase:', history);
        if (history.length > 0) {
          console.log('✅ Found', history.length, 'messages in Firebase');
          setMessages(history);
        } else {
          console.log('⚠️ No chat history found in Firebase for this user');
          setMessages([
            {
              id: 'init-1',
              text: INITIAL_MESSAGE,
              sender: Sender.BOT,
              timestamp: new Date(),
            },
          ]);
        }
      });
    }
  }, [userId]);

  // Initialize chat session
  useEffect(() => {
    chatSessionRef.current = createChatSession();
  }, []);

  // Save chat history to localStorage as backup
  useEffect(() => {
    if (userId && messages.length > 0) {
      saveChatHistory(userId, messages);
    }
  }, [messages, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showChat]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading || !chatSessionRef.current) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: Sender.USER,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to Firebase
      if (userId) {
        await saveChatToFirebase(userId, 'user', userText);
      }

      // 2. Create placeholder for Bot Message
      const botMessageId = (Date.now() + 1).toString();
      const botMessagePlaceholder: Message = {
        id: botMessageId,
        text: '',
        sender: Sender.BOT,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessagePlaceholder]);

      // 3. Stream response
      let fullResponse = '';
      const stream = sendMessageStream(chatSessionRef.current, userText);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }

      // Save bot response to Firebase
      if (userId) {
        await saveChatToFirebase(userId, 'assistant', fullResponse);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Maaf, sepertinya ada sedikit gangguan teknis. Bisa coba lagi sebentar lagi?",
          sender: Sender.BOT,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus back on input after sending (desktop only mostly)
      if (window.matchMedia('(min-width: 768px)').matches) {
        inputRef.current?.focus();
      }
    }
  };

  const handleDismissDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const handleRespondenIdSet = (responderId: string) => {
    setUserId(responderId);
    setShowRespondenModal(false);
    // Set initial message for new user
    setMessages([
      {
        id: 'init-1',
        text: INITIAL_MESSAGE,
        sender: Sender.BOT,
        timestamp: new Date(),
      },
    ]);
  };

  const handleDownloadChat = () => {
    if (!userId) return;
    
    const chatData = {
      user_id: userId,
      total_messages: messages.length,
      exported_at: new Date().toISOString(),
      chats: messages.map(msg => ({
        role: msg.sender === Sender.USER ? 'user' : 'assistant',
        message: msg.text,
        timestamp: msg.timestamp.toISOString(),
      }))
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!userId) {
    return <RespondenModal onRespondenIdSet={handleRespondenIdSet} />;
  }

  if (!showChat) {
    return (
      <div className="min-h-screen bg-joy-50 font-sans selection:bg-joy-200">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-joy-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-joy-400 rounded-full"></div>
              <span className="font-extrabold text-xl tracking-tight text-joy-900">{APP_NAME}</span>
            </div>
            <button 
              onClick={() => setShowChat(true)}
              className="bg-joy-400 hover:bg-joy-500 text-joy-900 font-bold px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              Mulai Cerita
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-7xl font-extrabold text-joy-900 leading-[1.1] mb-6">
                Tempat Aman untuk <br />
                <span className="text-sky-400">Menenangkan</span> Pikiranmu.
              </h1>
              <p className="text-xl text-joy-800/70 mb-10 max-w-lg leading-relaxed">
                PROM-JOY hadir sebagai teman digital yang stabil dan hangat, membantu kamu mengelola kecemasan ringan secara perlahan.
              </p>
              <button 
                onClick={() => setShowChat(true)}
                className="bg-joy-400 hover:bg-joy-500 text-joy-900 text-lg font-bold px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Mulai Cerita Sekarang
              </button>
            </div>
            <div className="flex justify-center items-center">
              <Mascot size="w-64 h-64 md:w-80 md:h-80" />
            </div>
          </div>
        </section>

        {/* What is PROM-JOY Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-joy-900 mb-4">Apa Itu PROM-JOY?</h2>
              <p className="text-joy-800/60 max-w-2xl mx-auto">
                Kami percaya setiap mahasiswa berhak memiliki ruang aman untuk bercerita tanpa dihakimi.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Kenali Emosimu", desc: "Belajar memberi nama pada apa yang kamu rasakan hari ini.", icon: "🧠" },
                { title: "Tenangkan Pikiranmu", desc: "Teknik grounding sederhana untuk kembali ke saat ini.", icon: "🌊" },
                { title: "Kelola Secara Perlahan", desc: "Langkah kecil yang realistis untuk menghadapi kecemasan.", icon: "🌱" }
              ].map((item, i) => (
                <div key={i} className="bg-joy-50 p-10 rounded-4xl border border-joy-100 hover:shadow-xl transition-all group">
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-joy-900 mb-3">{item.title}</h3>
                  <p className="text-joy-800/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-sky-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-joy-900 mb-4">Cara Kerja</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Cerita", desc: "Tumpahkan apa yang ada di pikiranmu." },
                { step: "02", title: "Refleksi", desc: "Lihat masalah dari sudut pandang baru." },
                { step: "03", title: "Tenang", desc: "Temukan ketenangan di dalam dirimu." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-joy-400 font-black text-xl shadow-sm mb-6 border-2 border-joy-100">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-joy-900 mb-2">{item.title}</h3>
                  <p className="text-joy-800/50 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-joy-100 text-center">
          <button 
            onClick={async () => {
              const { generateMascotImage } = await import('./services/mascotService');
              const url = await generateMascotImage();
              if (url) window.open(url, '_blank');
            }}
            className="text-joy-800/40 text-sm hover:text-joy-600 transition-colors mb-4 block mx-auto"
          >
            Lihat Character Sheet PromJoy
          </button>
          <p className="text-joy-800/40 text-sm">© 2026 PROM-JOY — Teman Digital Mahasiswa</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-joy-50 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-joy-100 to-joy-50 opacity-50 z-0 pointer-events-none"></div>
      
      {/* Modals */}
      {showDisclaimer && <DisclaimerModal onAccept={handleDismissDisclaimer} />}
      <EmergencyPanel isOpen={showEmergency} onClose={() => setShowEmergency(false)} />

      {/* Header */}
      <header className="flex-none bg-white/80 backdrop-blur-md border-b border-joy-100 px-6 py-4 z-30 sticky top-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowChat(false)}
              className="p-2 hover:bg-joy-50 rounded-full transition-colors text-joy-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-joy-400 flex items-center justify-center text-joy-900 shadow-sm border-2 border-joy-300">
                <span className="font-bold text-xs">{userId}</span>
              </div>
              <div>
                <h1 className="font-extrabold text-joy-900 text-lg tracking-tight">{APP_NAME}</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-joy-800/60 font-bold uppercase tracking-wider">Online • Teman Cerita</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadChat}
              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full border border-blue-100 transition-all active:scale-95"
              title="Download semua riwayat chat Anda"
            >
              ↓ Download Riwayat
            </button>
            <button 
              onClick={() => setShowEmergency(true)}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full border border-red-100 transition-all active:scale-95"
            >
              Butuh Bantuan?
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('user_id');
                window.location.reload();
              }}
              className="text-xs font-bold text-joy-600 bg-joy-50 hover:bg-joy-100 px-4 py-2 rounded-full border border-joy-100 transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 z-10 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          {/* Welcome visual info for empty state context */}
          {messages.length === 1 && (
            <div className="text-center mt-4 mb-12 animate-fade-in-up">
              <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-joy-100 mb-4">
                <Mascot size="w-24 h-24" />
              </div>
              <p className="text-sm text-joy-800/50 max-w-xs mx-auto leading-relaxed">
                Tumpahkan semua yang kamu rasakan. Aku di sini untuk mendengarkanmu.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4 animate-pulse">
               <div className="bg-joy-100 px-6 py-4 rounded-3xl rounded-bl-none shadow-sm border border-joy-200 flex items-center gap-2">
                 <div className="w-2 h-2 bg-joy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-joy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-joy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-8" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-joy-100 p-6 z-20">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 bg-joy-50 border-2 border-joy-100 rounded-3xl px-3 py-2 focus-within:border-joy-400 transition-all shadow-sm"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ceritakan apa yang kamu rasakan..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-joy-900 placeholder-joy-800/30 px-3 py-3 text-base font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`p-4 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                !inputValue.trim() || isLoading
                  ? 'bg-joy-100 text-joy-300 cursor-not-allowed'
                  : 'bg-joy-400 text-joy-900 hover:bg-joy-500 shadow-sm active:scale-95'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-[10px] text-joy-800/30 font-bold uppercase tracking-widest">
              PROM-JOY bukan pengganti tenaga medis profesional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
