
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, Sparkles, Globe, MapPin, ArrowRight, MessageCircle, Instagram, Facebook, Share2, Truck, AlertCircle, Lightbulb } from 'lucide-react';
import { sendMessageStreamToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: any) => void;
  onAnjelo: () => void;
  context?: {
    title?: string;
    content?: string;
    type?: string;
    user?: any;
    systemStatus?: string;
    location?: string;
  };
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, currentView, onNavigate, onAnjelo, context }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Halo ${context?.user?.name || 'Warga'}! Saya asisten AI MetalOS. Saya melihat Anda sedang berada di modul **${currentView}**${context?.title ? ` dan sedang membuka "${context.title}"` : ''}. 

Sistem saat ini berstatus **${context?.systemStatus || 'ONLINE'}** di lokasi **${context?.location || 'Kota Metro'}**. Ada yang bisa saya bantu mengenai data Kelurahan Yosomulyo atau informasi terkini?`,
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsLoading(true);

    // Create a placeholder for the bot message
    const botMsgId = (Date.now() + 1).toString();
    const botMsgPlaceholder: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsgPlaceholder]);

    // Format history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Add context to the prompt if available
    let contextualInput = textToSend;
    if (context?.content) {
      contextualInput = `[CONTEXT: Document Title: ${context.title}, Type: ${context.type}, Content: ${context.content.substring(0, 1000)}]\n\nUser Request: ${textToSend}`;
    }

    await sendMessageStreamToGemini(
      contextualInput,
      history,
      (chunkText) => {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: chunkText } : m));
      },
      (fullText, groundingMetadata) => {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText, groundingMetadata } : m));
        setIsLoading(false);
      }
    );
  };

  const getSuggestions = () => {
    const common = ["Apa itu MetalOS?", "Bagaimana cara lapor masalah?"];
    switch(currentView) {
      case 'DASHBOARD': return ["Ringkasan APBDes", "Status Stunting", "Aktivitas Terbaru", ...common];
      case 'MARKET': return ["Stall paling laris", "Cara reservasi meja", "Jadwal Payungi", ...common];
      case 'REPORTS': return ["Laporan infrastruktur", "Status perbaikan jalan", ...common];
      case 'EOFFICE': return ["Surat masuk hari ini", "Draft dokumen terbaru", ...common];
      default: return common;
    }
  };

  const renderGroundingSources = (metadata: any) => {
      if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) return null;

      return (
          <div className="mt-3 pt-3 border-t border-slate-200/50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Sources</p>
              <div className="flex flex-wrap gap-2">
                  {metadata.groundingChunks.map((chunk: any, idx: number) => {
                      if (chunk.web) {
                          return (
                              <a 
                                key={idx} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center bg-white/50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/50 hover:border-blue-200 px-2 py-1 rounded-lg text-[10px] transition duration-200"
                              >
                                  <Globe size={10} className="mr-1.5" />
                                  <span className="truncate max-w-[150px]">{chunk.web.title || 'Web Source'}</span>
                              </a>
                          );
                      }
                      return null;
                  })}
                  
                  {metadata.searchEntryPoint && (
                       <div 
                         className="flex items-center bg-blue-50/50 text-blue-600 px-2 py-1 rounded-lg text-[10px] border border-blue-100/50"
                         dangerouslySetInnerHTML={{ __html: metadata.searchEntryPoint.renderedContent }}
                       />
                  )}
              </div>
          </div>
      );
  }

  const handleSocialShare = (platform: 'wa' | 'ig' | 'fb') => {
    const text = encodeURIComponent(`Halo! Saya sedang menggunakan MetalOS Payungi Dashboard${context?.title ? ` untuk mengelola "${context.title}"` : ''}. Sistem cerdas untuk kemajuan desa!`);
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    switch(platform) {
      case 'wa': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
      case 'fb': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'ig': 
        window.open('https://www.instagram.com/yosomulyo_berdaya/', '_blank');
        return;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const handleContactSupport = (platform: 'wa' | 'fb' | 'ig') => {
    switch(platform) {
      case 'wa': window.open('https://wa.me/6281234567890?text=Halo%20Admin%20MetalOS%2C%20saya%20butuh%20bantuan.', '_blank'); break;
      case 'fb': window.open('https://m.me/yosomulyo.berdaya', '_blank'); break;
      case 'ig': window.open('https://www.instagram.com/yosomulyo_berdaya/', '_blank'); break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:z-50 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[700px] flex flex-col pointer-events-none">
        {/* Glass Container */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="bg-white/80 backdrop-blur-2xl w-full h-full md:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/40 flex flex-col pointer-events-auto ring-1 ring-white/50 overflow-hidden"
        >
          
          {/* Header */}
          <div className="p-5 pb-4 border-b border-white/20 flex justify-between items-center bg-white/30 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 ring-2 ring-white/50">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base tracking-tight">MetalOS Assistant</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span> 
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Cognitive Engine Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                    <button onClick={() => handleSocialShare('wa')} className="p-1.5 hover:bg-green-500 hover:text-white text-green-600 rounded-full transition-all" title="Share to WhatsApp"><MessageCircle size={14} /></button>
                    <button onClick={() => handleSocialShare('ig')} className="p-1.5 hover:bg-pink-500 hover:text-white text-pink-600 rounded-full transition-all" title="Share to Instagram"><Instagram size={14} /></button>
                    <button onClick={() => handleSocialShare('fb')} className="p-1.5 hover:bg-blue-600 hover:text-white text-blue-600 rounded-full transition-all" title="Share to Facebook"><Facebook size={14} /></button>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 hover:bg-white/50 text-slate-400 hover:text-slate-600 rounded-full transition duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Context Awareness Bar */}
          {context?.title && (
            <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Analyzing: {context.title}</span>
              </div>
              <span className="text-[9px] font-mono text-blue-400">{context.type}</span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white/10 scroll-smooth no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[88%] p-4 text-sm shadow-sm backdrop-blur-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-blue-600/20'
                      : 'bg-white/80 border border-white/50 text-slate-700 rounded-2xl rounded-bl-sm'
                  }`}
                >
                  <div className="markdown-body leading-relaxed prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.role === 'model' && renderGroundingSources(msg.groundingMetadata)}
                </div>
              </div>
            ))}
            
            {isLoading && !messages[messages.length - 1].text && (
              <div className="flex justify-start">
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl rounded-bl-sm border border-white/50 shadow-sm flex items-center gap-3">
                  <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Synthesizing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white/40 border-t border-white/20">
              <div className="flex items-center gap-1.5 mr-2 text-blue-500">
                  <Lightbulb size={14} />
              </div>
              {getSuggestions().map((suggestion, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="px-3 py-1.5 bg-white/60 text-slate-600 border border-white/80 rounded-full text-[10px] font-medium whitespace-nowrap hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                  >
                      {suggestion}
                  </button>
              ))}
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50/50 border-t border-white/20">
              <button 
                onClick={onAnjelo}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 border border-orange-200 rounded-full text-[10px] font-bold whitespace-nowrap hover:bg-orange-600 hover:text-white transition-all shadow-sm"
              >
                  <Truck size={12} /> Panggil Anjelo
              </button>
              <button 
                onClick={() => handleContactSupport('wa')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-600 border border-green-200 rounded-full text-[10px] font-bold whitespace-nowrap hover:bg-green-600 hover:text-white transition-all shadow-sm"
              >
                  <MessageCircle size={12} /> Chat WhatsApp
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 border border-red-200 rounded-full text-[10px] font-bold whitespace-nowrap hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                  <AlertCircle size={12} /> Lapor Masalah
              </button>
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white/60 border-t border-white/30 backdrop-blur-md">
            <div className="flex items-center gap-2 bg-white/70 border border-white/50 rounded-[1.5rem] px-2 py-2 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all duration-300">
              <div className="pl-3 pr-2">
                  <Sparkles size={16} className="text-blue-400" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya tentang data desa..."
                className="bg-transparent flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 py-2 min-w-0"
                autoFocus
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    input.trim() 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:scale-105' 
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                MetalOS AI dapat membuat kesalahan. Verifikasi data penting.
            </p>
          </div>
        </motion.div>
    </div>
  );
};

export default AiAssistant;
