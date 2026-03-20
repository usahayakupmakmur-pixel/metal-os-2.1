import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Table, Presentation, MessageSquare, Video, Search, Plus, MoreVertical, Mic, Camera, PhoneOff, Users, Send, ArrowLeft, ChevronLeft, Share, MessageCircle, Video as VideoIcon, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Sparkles, X, Paperclip, Check, Link, Grid, List, Truck, Phone, Wifi, Loader2, Mail, PenTool, QrCode, ScanBarcode, Calendar as CalendarIcon, ChevronRight, Clock, MapPin, HardDrive, Cloud, Folder, Image as ImageIcon, Music, Film, File, MoreHorizontal, Download, Upload, Trash2, Star, Server, LayoutGrid, Maximize2, Monitor, Inbox, Archive, AlertCircle, Filter, Tag, Paperclip as AttachmentIcon, RefreshCw, Reply, Forward, Minimize2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

type AppType = 'DASHBOARD' | 'WORKSPACE' | 'CHAT' | 'MEET' | 'CALENDAR' | 'MAIL';

interface EOfficeFile {
    id: string;
    title: string;
    type: 'DOC' | 'SHEET' | 'SLIDE' | 'PDF' | 'IMAGE' | 'VIDEO' | 'AUDIO';
    content: string;
    lastModified: string;
    status: string;
    category?: string;
    description?: string;
    size?: string;
}

interface EOfficeViewProps {
    onOpenAnjelo: (service?: any, note?: string) => void;
    onContextUpdate?: (context: { title?: string; content?: string; type?: string } | null) => void;
}

interface SubAppProps {
    onOpenFile: (file: EOfficeFile) => void;
    searchQuery: string;
}

const EOfficeView: React.FC<EOfficeViewProps> = ({ onOpenAnjelo, onContextUpdate }) => {
  const [activeApp, setActiveApp] = useState<AppType>('WORKSPACE');
  const [activeFile, setActiveFile] = useState<EOfficeFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const apps = [
    { id: 'DASHBOARD', label: 'Home', icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'MAIL', label: 'Gmail', icon: Mail, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'WORKSPACE', label: 'Workspace', icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'CALENDAR', label: 'Calendar', icon: CalendarIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'CHAT', label: 'Chat', icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'MEET', label: 'Meet', icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const handleOpenFile = (file: EOfficeFile) => {
      setActiveFile(file);
      onContextUpdate?.({
          title: file.title,
          content: file.content,
          type: file.type
      });
  };

  const handleCloseFile = () => {
      setActiveFile(null);
      onContextUpdate?.(null);
  };

  // Reset search when switching apps
  useEffect(() => {
      setSearchQuery('');
  }, [activeApp]);

  const renderContent = () => {
    // If a file is open, show the Workspace Editor
    if (activeFile) {
        return <WorkspaceEditor 
            file={activeFile} 
            onClose={handleCloseFile} 
            onOpenAnjelo={onOpenAnjelo}
            onContextUpdate={onContextUpdate}
        />;
    }

    // Otherwise show the app list view
    switch (activeApp) {
      case 'DASHBOARD':
        return <DashboardApp onOpenFile={handleOpenFile} onSwitchApp={setActiveApp} />;
      case 'MAIL':
        return <MailApp onOpenFile={handleOpenFile} searchQuery={searchQuery} />;
      case 'WORKSPACE':
        return <WorkspaceApp onOpenFile={handleOpenFile} searchQuery={searchQuery} />;
      case 'CALENDAR':
        return <CalendarApp onOpenFile={handleOpenFile} searchQuery={searchQuery} />;
      case 'CHAT':
        return <ChatApp onOpenFile={handleOpenFile} searchQuery={searchQuery} />;
      case 'MEET':
        return <MeetApp onOpenFile={handleOpenFile} searchQuery={searchQuery} />;
      default:
        return <DashboardApp onOpenFile={handleOpenFile} onSwitchApp={setActiveApp} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Desktop Sidebar - Hide when file is open to maximize space */}
      {!activeFile && (
        <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 flex-col">
            <div className="p-6 border-b border-slate-200">
            <h2 className="font-black text-slate-800 flex items-center gap-3 text-xl tracking-tighter">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">WS</div>
                Workspace
            </h2>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
            {apps.map((app, idx) => (
                <motion.button
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setActiveApp(app.id as AppType)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    activeApp === app.id
                    ? 'bg-white shadow-md border border-slate-200 scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-100 hover:scale-[1.01]'
                }`}
                >
                <div className={`p-2 rounded-xl ${app.bg} ${app.color} shadow-sm`}>
                    <app.icon size={20} />
                </div>
                <span className={`text-sm font-bold ${activeApp === app.id ? 'text-slate-900' : ''}`}>
                    {app.label}
                </span>
                </motion.button>
            ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-4 text-white shadow-xl shadow-blue-200 relative overflow-hidden group cursor-pointer">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Premium</p>
                    <p className="text-sm font-bold mb-3">Upgrade Storage</p>
                    <button className="w-full bg-white text-blue-700 py-2 rounded-xl text-xs font-black shadow-sm active:scale-95 transition">Get More Space</button>
                </div>
            </div>
        </div>
      )}

      {/* Mobile Bottom Nav - Enhanced Highlighting & Animation */}
      {!activeFile && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-slate-200 z-[60] flex justify-around items-end px-2 pb-5 pt-2 safe-area-bottom shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] h-[85px] overflow-x-auto no-scrollbar">
            {apps.map((app) => {
                const isActive = activeApp === app.id;
                return (
                    <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id as AppType)}
                    className={`relative flex flex-col items-center justify-center min-w-[60px] h-16 rounded-2xl transition-all duration-500 ease-out ${
                        isActive 
                        ? `${app.bg} ${app.color} transform -translate-y-3 shadow-lg shadow-slate-200/50 ring-1 ring-white` 
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                    >
                        {/* Active Indicator Dot */}
                        {isActive && (
                            <span className="absolute -top-1 right-1 w-2 h-2 bg-current rounded-full animate-ping opacity-75" />
                        )}
                        
                        <app.icon 
                            size={isActive ? 24 : 22} 
                            className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`} 
                            fill={isActive ? "currentColor" : "none"}
                            fillOpacity={0.15}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className={`text-[10px] mt-1 transition-all duration-300 ${isActive ? 'font-extrabold scale-105' : 'font-medium'}`}>
                            {app.label}
                        </span>
                    </button>
                );
            })}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white relative ${!activeFile ? 'mb-[90px] md:mb-0' : ''}`}>
        
        {/* Persistent Search Bar (Only for file apps) */}
        {!activeFile && ['WORKSPACE', 'MAIL'].includes(activeApp) && (
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center space-x-4 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder={`Search in ${activeApp === 'MAIL' ? 'Gmail' : 'Workspace'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-0 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 shadow-inner"
                    />
                </div>
                <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition active:scale-95">
                    <Filter size={20} />
                </button>
            </div>
        )}

        <div key={activeApp} className="flex-1 flex flex-col h-full animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out overflow-hidden">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

// === NEW: GMAIL MODULE ===
const MailApp: React.FC<SubAppProps> = ({ onOpenFile, searchQuery }) => {
    const [activeFolder, setActiveFolder] = useState('INBOX');
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const emails = [
        { id: '1', sender: 'Pak Lurah', subject: 'Undangan Rapat Koordinasi', preview: 'Diharapkan kehadirannya pada rapat koordinasi besok pagi pukul 09:00...', time: '10:45', unread: true, folder: 'INBOX' },
        { id: '2', sender: 'Sistem Gapura', subject: 'Notifikasi Keamanan', preview: 'Terdeteksi login baru pada akun Anda dari perangkat yang tidak dikenal...', time: '09:30', unread: false, folder: 'INBOX' },
        { id: '3', sender: 'Bu Sekdes', subject: 'Revisi Laporan APBDes', preview: 'Tolong cek kembali bagian anggaran pembangunan fisik, ada selisih...', time: 'Kemarin', unread: false, folder: 'INBOX' },
        { id: '4', sender: 'Warga RW 07', subject: 'Keluhan Lampu Jalan', preview: 'Lampu jalan di depan rumah Pak RT mati sudah 3 hari, mohon bantuannya...', time: 'Kemarin', unread: true, folder: 'INBOX' },
    ];

    const folders = [
        { id: 'INBOX', label: 'Inbox', icon: Inbox, count: 2 },
        { id: 'SENT', label: 'Sent', icon: Send, count: 0 },
        { id: 'DRAFTS', label: 'Drafts', icon: FileText, count: 1 },
        { id: 'ARCHIVE', label: 'Archive', icon: Archive, count: 0 },
        { id: 'SPAM', label: 'Spam', icon: AlertCircle, count: 0 },
        { id: 'TRASH', label: 'Trash', icon: Trash2, count: 0 },
    ];

    const selectedEmail = emails.find(e => e.id === selectedEmailId);
    const filteredEmails = emails.filter(e => 
        e.folder === activeFolder && 
        (e.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
         e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
         e.preview.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex h-full bg-slate-50">
            {/* Mail Sidebar */}
            <div className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col hidden md:flex">
                <button 
                    onClick={() => setIsComposeOpen(true)}
                    className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl shadow-sm hover:shadow-md flex items-center gap-2 mb-6 transition-all active:scale-95"
                >
                    <Plus className="text-red-600" size={20} />
                    <span>Tulis Email</span>
                </button>

                <nav className="space-y-1 flex-1">
                    {folders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => setActiveFolder(folder.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeFolder === folder.id 
                                ? 'bg-red-100 text-red-700' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <folder.icon size={18} className={activeFolder === folder.id ? 'text-red-600' : 'text-slate-400'} />
                                {folder.label}
                            </div>
                            {folder.count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFolder === folder.id ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {folder.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Email List */}
            <div className={`flex-1 flex flex-col overflow-hidden bg-white ${selectedEmailId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6">
                    <h3 className="font-bold text-slate-800">Inbox</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><RefreshCw size={18} /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><MoreHorizontal size={18} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                        {filteredEmails.map((email, idx) => (
                            <motion.div 
                                key={email.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: idx * 0.03 }}
                                onClick={() => setSelectedEmailId(email.id)}
                                className={`p-4 cursor-pointer hover:bg-slate-50 transition flex items-start gap-4 ${email.unread ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                                    {email.sender.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-sm truncate ${email.unread ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{email.sender}</h4>
                                        <span className="text-[10px] text-slate-400">{email.time}</span>
                                    </div>
                                    <p className={`text-xs truncate ${email.unread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{email.subject}</p>
                                    <p className="text-xs text-slate-400 truncate mt-1">{email.preview}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Email Detail */}
            {selectedEmailId && (
                <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in slide-in-from-right duration-300">
                    <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6">
                        <button onClick={() => setSelectedEmailId(null)} className="md:hidden p-1 -ml-1 text-slate-500">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Archive size={18} /></button>
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><AlertCircle size={18} /></button>
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Trash2 size={18} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><ChevronLeft size={18} /></button>
                            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        {selectedEmail && (
                            <>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">{selectedEmail.subject}</h2>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                                        {selectedEmail.sender.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-900">{selectedEmail.sender}</h4>
                                            <span className="text-xs text-slate-400">{selectedEmail.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">to me</p>
                                    </div>
                                </div>
                                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                                    <p>{selectedEmail.preview}</p>
                                    <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                    <p className="mt-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                                </div>
                                <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                                    <button className="px-6 py-2 border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                        <Reply size={16} /> Reply
                                    </button>
                                    <button className="px-6 py-2 border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                        <Forward size={16} /> Forward
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed bottom-0 right-0 md:right-8 w-full md:w-[500px] bg-white rounded-t-2xl shadow-2xl border border-slate-200 z-[100] animate-in slide-in-from-bottom duration-300">
                    <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
                        <span className="text-sm font-bold">Pesan Baru</span>
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-white/10 rounded"><Minimize2 size={16} /></button>
                            <button className="p-1 hover:bg-white/10 rounded"><Maximize2 size={16} /></button>
                            <button onClick={() => setIsComposeOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={16} /></button>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <input type="text" placeholder="Penerima" className="w-full border-b border-slate-100 py-2 text-sm outline-none focus:border-red-500" />
                        <input type="text" placeholder="Subjek" className="w-full border-b border-slate-100 py-2 text-sm outline-none focus:border-red-500" />
                        <textarea className="w-full h-64 py-2 text-sm outline-none resize-none" placeholder="Tulis pesan Anda di sini..."></textarea>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-600/20">Kirim</button>
                            <button className="p-2 text-slate-400 hover:text-slate-600"><AttachmentIcon size={20} /></button>
                            <button className="p-2 text-slate-400 hover:text-slate-600"><Link size={20} /></button>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

// === NEW: CONSOLIDATED WORKSPACE MODULE ===
const WorkspaceApp: React.FC<SubAppProps> = ({ onOpenFile, searchQuery }) => {
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [activeSection, setActiveSection] = useState<'MY_DRIVE' | 'SHARED_NAS' | 'RECENT' | 'STARRED' | 'TRASH' | 'DOCS' | 'SHEETS' | 'SLIDES'>('MY_DRIVE');
    
    const folders = [
        { id: 'f1', name: 'Dokumen Desa', type: 'folder', size: '12 items' },
        { id: 'f2', name: 'Media Center', type: 'folder', size: '45 items' },
        { id: 'f3', name: 'Arsip 2023', type: 'folder', size: '120 items' },
        { id: 'f4', name: 'Project WargaPay', type: 'folder', size: '8 items' },
    ];

    const sharedDrives = [
        { id: 'nas1', name: 'Public Share (NAS)', type: 'network', size: '1.2 TB' },
        { id: 'nas2', name: 'Perangkat Desa Only', type: 'network', size: '500 GB' },
    ];

    const allFiles: EOfficeFile[] = [
        // Drive Files
        { id: 'doc1', title: 'Proposal_Kegiatan_Agustus.pdf', type: 'PDF' as any, size: '2.4 MB', lastModified: 'Today', content: '', status: 'Final', category: 'Dokumen', description: 'Proposal kegiatan perayaan HUT RI ke-81.' },
        { id: 'img1', title: 'Dokumentasi_Rapat.jpg', type: 'IMAGE' as any, size: '4.1 MB', lastModified: 'Yesterday', content: '', status: 'Final', category: 'Media', description: 'Foto dokumentasi rapat koordinasi RW.' },
        { id: 'vid1', title: 'Profil_Desa_2024.mp4', type: 'VIDEO' as any, size: '125 MB', lastModified: 'Oct 20', content: '', status: 'Final', category: 'Media', description: 'Video profil desa tahun 2024.' },
        { id: 'aud1', title: 'Rekaman_Musrenbang.mp3', type: 'AUDIO' as any, size: '15 MB', lastModified: 'Oct 18', content: '', status: 'Final', category: 'Media', description: 'Rekaman suara musyawarah perencanaan pembangunan.' },
        { id: 'doc2', title: 'Data_Penduduk_RW07.xlsx', type: 'SHEET', size: '45 KB', lastModified: 'Oct 15', content: '', status: 'Final', category: 'Kependudukan', description: 'Data statistik penduduk RW 07.' },
        
        // Docs
        { id: 'd1', type: 'DOC', title: 'Surat Pengantar KTP - Budi Santoso', size: '12 KB', lastModified: 'Today', content: 'SURAT PENGANTAR\n\nYang bertanda tangan di bawah ini Ketua RT 04 RW 07 Kelurahan Yosomulyo menerangkan bahwa:\n\nNama: Budi Santoso\nNIK: 18710328821\nAlamat: Jl. Ahmad Yani No 45\n\nAdalah benar warga kami...', status: 'Final', category: 'Kependudukan', description: 'Surat pengantar untuk pengurusan KTP warga.' },
        { id: 'd2', type: 'DOC', title: 'Undangan Musrenbang RW 07', size: '8 KB', lastModified: 'Yesterday', content: 'UNDANGAN\n\nKepada Yth,\nBapak/Ibu Warga RW 07\n\nDengan hormat,\nMengharap kehadiran Bapak/Ibu pada acara Musyawarah Perencanaan Pembangunan (Musrenbang)...', status: 'Final', category: 'Undangan', description: 'Undangan resmi musyawarah warga RW 07.' },
        { id: 'd3', type: 'DOC', title: 'Laporan Kegiatan Posyandu Okt', size: '25 KB', lastModified: '20 Oct', content: 'LAPORAN KEGIATAN POSYANDU\n\nBulan: Oktober 2024\nJumlah Balita: 45\nImunisasi: Lengkap\nPemberian Makanan Tambahan: Bubur Kacang Hijau...', status: 'Final', category: 'Kesehatan', description: 'Laporan bulanan kegiatan posyandu balita.' },
        { id: 'd4', type: 'DOC', title: 'Proposal Pengajuan Dana Mocaf', size: '42 KB', lastModified: '18 Oct', content: 'PROPOSAL PENGEMBANGAN MOCAF HUB\n\nLatar Belakang:\nPotensi singkong di Yosomulyo sangat besar, namun harga jual rendah. Diperlukan hilirisasi...', status: 'Final', category: 'Ekonomi', description: 'Proposal pengembangan usaha mikro singkong.' },
        
        // Sheets
        { id: 's1', type: 'SHEET', title: 'Data Kependudukan RW 07', size: '156 KB', lastModified: 'Yesterday', content: 'No,NIK,Nama,Alamat\n1,18710...,Budi,Jl. A\n2,18710...,Siti,Jl. B', status: 'Final', category: 'Kependudukan', description: 'Data statistik penduduk RW 07.' },
        { id: 's2', type: 'SHEET', title: 'Anggaran Dana Desa 2024', size: '89 KB', lastModified: 'Oct 20', content: 'Pos,Anggaran,Realisasi\nFisik,500jt,450jt\nSosial,200jt,150jt', status: 'Final', category: 'Keuangan', description: 'Laporan anggaran dana desa tahun 2024.' },
        { id: 's3', type: 'SHEET', title: 'Inventaris Posyandu', size: '12 KB', lastModified: 'Oct 15', content: 'Barang,Jumlah,Kondisi\nTimbangan,2,Baik\nMeja,4,Baik', status: 'Final', category: 'Kesehatan', description: 'Daftar inventaris peralatan posyandu.' },
        
        // Slides
        { id: 'sl1', type: 'SLIDE', title: 'Laporan Realisasi APBDes Q3', size: '2.1 MB', lastModified: 'Yesterday', content: 'Realisasi APBDes Q3 2024\nKelurahan Yosomulyo', status: 'Final', category: 'Laporan', description: 'Presentasi realisasi APBDes kuartal ketiga.' },
        { id: 'sl2', type: 'SLIDE', title: 'Strategi Mocaf Hub 2025', size: '1.8 MB', lastModified: 'Oct 18', content: 'Ekspansi Pasar Mocaf\nTarget: Ekspor', status: 'Final', category: 'Ekonomi', description: 'Strategi pengembangan pasar Mocaf Hub.' },
        { id: 'sl3', type: 'SLIDE', title: 'Sosialisasi Bank Sampah', size: '3.4 MB', lastModified: 'Oct 10', content: 'Ubah Sampah Jadi Kuota\nProgram Warga-Enviro', status: 'Final', category: 'Lingkungan', description: 'Materi sosialisasi program bank sampah.' },
    ];

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'folder': return <Folder className="text-blue-500 fill-blue-500/20" size={40} />;
            case 'network': return <Server className="text-indigo-500" size={40} />;
            case 'PDF':
            case 'pdf': return <FileText className="text-red-500" size={32} />;
            case 'IMAGE':
            case 'image': return <ImageIcon className="text-purple-500" size={32} />;
            case 'VIDEO':
            case 'video': return <Film className="text-pink-500" size={32} />;
            case 'AUDIO':
            case 'audio': return <Music className="text-yellow-500" size={32} />;
            case 'SHEET':
            case 'sheet': return <Table className="text-green-500" size={32} />;
            case 'DOC': return <FileText className="text-blue-500" size={32} />;
            case 'SLIDE': return <Presentation className="text-yellow-500" size={32} />;
            default: return <File className="text-slate-400" size={32} />;
        }
    };

    const filteredFiles = allFiles.filter(f => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeSection === 'DOCS') return matchesSearch && f.type === 'DOC';
        if (activeSection === 'SHEETS') return matchesSearch && f.type === 'SHEET';
        if (activeSection === 'SLIDES') return matchesSearch && f.type === 'SLIDE';
        return matchesSearch;
    });

    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-full bg-slate-50">
            {/* Workspace Sidebar */}
            <div className="w-60 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col hidden md:flex">
                <button className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl shadow-sm hover:shadow-md flex items-center gap-2 mb-6 transition-all active:scale-95">
                    <Plus className="text-blue-600" size={20} />
                    <span>Buat Baru</span>
                </button>

                <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
                    <div className="mb-4">
                        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Penyimpanan</p>
                        {[
                            { id: 'MY_DRIVE', label: 'Drive Saya', icon: HardDrive },
                            { id: 'SHARED_NAS', label: 'NAS / Shared', icon: Server },
                            { id: 'RECENT', label: 'Terbaru', icon: Clock },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    activeSection === item.id 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <item.icon size={18} className={activeSection === item.id ? 'text-blue-600' : 'text-slate-400'} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-4">
                        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aplikasi</p>
                        {[
                            { id: 'DOCS', label: 'Dokumen', icon: FileText, color: 'text-blue-600' },
                            { id: 'SHEETS', label: 'Spreadsheets', icon: Table, color: 'text-green-600' },
                            { id: 'SLIDES', label: 'Presentasi', icon: Presentation, color: 'text-yellow-600' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    activeSection === item.id 
                                    ? 'bg-slate-200 text-slate-900' 
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <item.icon size={18} className={activeSection === item.id ? item.color : 'text-slate-400'} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lainnya</p>
                        {[
                            { id: 'STARRED', label: 'Berbintang', icon: Star },
                            { id: 'TRASH', label: 'Sampah', icon: Trash2 },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    activeSection === item.id 
                                    ? 'bg-slate-200 text-slate-900' 
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <item.icon size={18} className={activeSection === item.id ? 'text-slate-900' : 'text-slate-400'} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Cloud size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Penyimpanan</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="bg-blue-600 h-full w-[75%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400">7.5 GB dari 10 GB terpakai</p>
                </div>
            </div>

            {/* Main Workspace Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-700 hover:underline cursor-pointer">Workspace</span>
                        <ChevronRight size={14} />
                        <span className="hover:underline cursor-pointer">
                            {activeSection === 'MY_DRIVE' ? 'Drive Saya' : 
                             activeSection === 'DOCS' ? 'Dokumen' :
                             activeSection === 'SHEETS' ? 'Spreadsheets' :
                             activeSection === 'SLIDES' ? 'Presentasi' : activeSection}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setViewMode('LIST')}
                            className={`p-1.5 rounded hover:bg-slate-100 ${viewMode === 'LIST' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('GRID')}
                            className={`p-1.5 rounded hover:bg-slate-100 ${viewMode === 'GRID' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    
                    {/* Section: Network Drives */}
                    {activeSection === 'MY_DRIVE' && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Network Drives & NAS</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sharedDrives.map((drive) => (
                                    <div key={drive.id} className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:shadow-md transition group">
                                        <div className="bg-white p-3 rounded-lg shadow-sm group-hover:scale-110 transition">
                                            {getFileIcon(drive.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900">{drive.name}</h4>
                                            <p className="text-xs text-indigo-400">Capacity: {drive.size}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Folders (Only in My Drive) */}
                    {activeSection === 'MY_DRIVE' && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Folders</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {filteredFolders.map((folder) => (
                                    <div key={folder.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition hover:shadow-sm aspect-[4/3] justify-center">
                                        {getFileIcon(folder.type)}
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-700 truncate w-full px-2">{folder.name}</h4>
                                            <p className="text-[10px] text-slate-400">{folder.size}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Files */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Files</h3>
                        {viewMode === 'GRID' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredFiles.map((file, idx) => (
                                        <motion.div 
                                            key={file.id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: idx * 0.02 }}
                                            onClick={() => onOpenFile(file)}
                                            className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
                                        >
                                            <div className="aspect-square bg-slate-50 flex items-center justify-center relative">
                                                {getFileIcon(file.type)}
                                                {/* Overlay on hover */}
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                    <button className="p-2 bg-white rounded-full shadow text-slate-700 hover:text-blue-600"><Maximize2 size={14} /></button>
                                                    <button className="p-2 bg-white rounded-full shadow text-slate-700 hover:text-blue-600"><Download size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="p-3 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-xs text-slate-800 truncate" title={file.title}>{file.title}</h4>
                                                    {file.category && (
                                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase tracking-tighter">
                                                            {file.category}
                                                        </span>
                                                    )}
                                                </div>
                                                {file.description && (
                                                    <p className="text-[9px] text-slate-500 line-clamp-1 mb-2 leading-tight">
                                                        {file.description}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                    <span>{file.size}</span>
                                                    <span>{file.lastModified}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Owner</th>
                                            <th className="px-4 py-3">Last Modified</th>
                                            <th className="px-4 py-3">Size</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredFiles.map((file) => (
                                            <tr 
                                                key={file.id} 
                                                onClick={() => onOpenFile(file)}
                                                className="hover:bg-slate-50 transition cursor-pointer group"
                                            >
                                                <td className="px-4 py-3 flex items-center gap-3">
                                                    {getFileIcon(file.type)}
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-800 truncate">{file.title}</span>
                                                            {file.category && (
                                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase tracking-tighter">
                                                                    {file.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {file.description && (
                                                            <span className="text-[10px] text-slate-400 truncate">{file.description}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">me</td>
                                                <td className="px-4 py-3 text-slate-500">{file.lastModified}</td>
                                                <td className="px-4 py-3 text-slate-500">{file.size}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="p-1.5 rounded hover:bg-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 transition">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// === NEW: DASHBOARD MODULE ===
const DashboardApp: React.FC<{ onOpenFile: (file: EOfficeFile) => void; onSwitchApp: (app: AppType) => void }> = ({ onOpenFile, onSwitchApp }) => {
    const recentFiles: EOfficeFile[] = [
        { id: 'd1', type: 'DOC', title: 'Surat Pengantar KTP - Budi Santoso', size: '12 KB', lastModified: 'Today', content: '...', status: 'Final', category: 'Kependudukan', description: 'Surat pengantar untuk pengurusan KTP warga.' },
        { id: 's1', type: 'SHEET', title: 'Data Kependudukan RW 07', size: '156 KB', lastModified: 'Yesterday', content: '...', status: 'Final', category: 'Kependudukan', description: 'Data statistik penduduk RW 07.' },
    ];

    const upcomingEvents = [
        { id: 'ev1', title: 'Rapat Koordinasi RW 07', time: '09:00', date: 'Besok', color: 'bg-blue-500' },
        { id: 'ev2', title: 'Posyandu Balita', time: '08:00', date: '20 Mar', color: 'bg-red-500' },
    ];

    const recentEmails = [
        { id: '1', sender: 'Pak Lurah', subject: 'Undangan Rapat Koordinasi', time: '10:45', unread: true },
        { id: '2', sender: 'Sistem Gapura', subject: 'Notifikasi Keamanan', time: '09:30', unread: false },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 no-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Welcome Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2"
                        >
                            Selamat Pagi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Budi</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-500 text-sm md:text-lg font-medium"
                        >
                            Berikut ringkasan aktivitas kantor desa hari ini.
                        </motion.p>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSwitchApp('MAIL')} 
                            className="p-4 bg-white rounded-2xl shadow-lg shadow-red-100 border border-slate-100 text-slate-600 hover:text-red-600 transition-colors relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <Mail size={24} className="relative z-10" />
                            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white z-20"></span>
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSwitchApp('CHAT')} 
                            className="p-4 bg-white rounded-2xl shadow-lg shadow-teal-100 border border-slate-100 text-slate-600 hover:text-teal-600 transition-colors relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <MessageSquare size={24} className="relative z-10" />
                            <span className="absolute top-3 right-3 w-3 h-3 bg-teal-500 rounded-full border-2 border-white z-20"></span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Email Baru', value: '12', icon: Mail, color: 'text-red-600', bg: 'bg-red-50', shadow: 'shadow-red-100' },
                        { label: 'File Drive', value: '1.2k', icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'shadow-blue-100' },
                        { label: 'Jadwal', value: '4', icon: CalendarIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', shadow: 'shadow-indigo-100' },
                        { label: 'Warga Online', value: '45', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', shadow: 'shadow-teal-100' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i, duration: 0.5 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl ${stat.shadow} transition-all cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                                <stat.icon size={28} />
                            </div>
                            <h4 className="text-3xl font-black text-slate-800 mb-1 relative z-10">{stat.value}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Recent Files */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">File Terbaru</h3>
                            <button onClick={() => onSwitchApp('WORKSPACE')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 group">
                                Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-1 transition" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recentFiles.map((file, idx) => (
                                <motion.div 
                                    key={file.id} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                    whileHover={{ scale: 1.03, x: 4 }}
                                    onClick={() => onOpenFile(file)} 
                                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex items-center gap-5 group"
                                >
                                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                        {file.type === 'DOC' ? <FileText className="text-blue-600" size={24} /> : <Table className="text-green-600" size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base text-slate-800 truncate group-hover:text-blue-700 transition-colors">{file.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{file.lastModified} • {file.size}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Mail */}
                        <div className="pt-6 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">Email Masuk</h3>
                                <button onClick={() => onSwitchApp('MAIL')} className="text-xs font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1 group">
                                    Buka Gmail <ChevronRight size={14} className="group-hover:translate-x-1 transition" />
                                </button>
                            </div>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden divide-y divide-slate-50"
                            >
                                {recentEmails.map((email, idx) => (
                                    <motion.div 
                                        key={email.id} 
                                        whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
                                        className="p-5 flex items-center gap-5 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm group-hover:scale-110 transition duration-300">
                                            {email.sender.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`text-base truncate ${email.unread ? 'font-black text-slate-900' : 'text-slate-600 font-bold'}`}>{email.sender}</h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{email.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate font-medium">{email.subject}</p>
                                        </div>
                                        {email.unread && (
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-200"></div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Upcoming Events & Quick Actions */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em] px-2">Jadwal Terdekat</h3>
                            <div className="space-y-4">
                                {upcomingEvents.map((ev, idx) => (
                                    <motion.div 
                                        key={ev.id} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + (idx * 0.1) }}
                                        whileHover={{ x: 6, scale: 1.02 }}
                                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center gap-5 hover:shadow-xl transition-all cursor-pointer group"
                                    >
                                        <div className={`w-2 h-14 ${ev.color} rounded-full shadow-sm`}></div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-base text-slate-800 group-hover:text-indigo-600 transition-colors">{ev.title}</h4>
                                            <p className="text-xs text-slate-500 font-bold mt-1">{ev.date} • {ev.time}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <CalendarIcon size={18} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSwitchApp('CALENDAR')} 
                                className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                            >
                                Buka Kalender
                            </motion.button>
                        </div>

                        {/* Quick Actions */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-400/50 relative overflow-hidden group"
                        >
                            <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition duration-1000"></div>
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition duration-1000 delay-100"></div>
                            
                            <h3 className="font-black uppercase text-[11px] tracking-[0.4em] opacity-40 mb-6 relative z-10">Aksi Cepat</h3>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <motion.button 
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSwitchApp('MEET')} 
                                    className="p-5 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-3 border border-white/10"
                                >
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <Video size={24} className="text-blue-400" />
                                    </div>
                                    <span className="text-xs font-black tracking-tight">Mulai Rapat</span>
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSwitchApp('WORKSPACE')} 
                                    className="p-5 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-3 border border-white/10"
                                >
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <Plus size={24} className="text-green-400" />
                                    </div>
                                    <span className="text-xs font-black tracking-tight">File Baru</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// ... (MailApp remains unchanged) ...
const DocumentContentRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Split content by the signature delimiter
    const parts = content.split(/(\[\[DIGITAL_SIGNATURE\|.*?\|.*?\|.*?\]\])/g);
    return (
        <>
            {parts.map((part, index) => {
                const match = part.match(/\[\[DIGITAL_SIGNATURE\|(.*?)\|(.*?)\|(.*?)\]\]/);
                if (match) {
                    const [_, name, date, id] = match;
                    return (
                        <div key={index} className="block my-8 select-none">
                            <div className="border-2 border-slate-800 rounded-lg p-1.5 bg-white/50 backdrop-blur-sm inline-flex items-center gap-4 pr-6 shadow-sm relative overflow-hidden group">
                                <div className="bg-slate-900 p-2 rounded text-white flex flex-col items-center justify-center min-w-[70px]">
                                    <QrCode size={40} />
                                    <span className="text-[9px] font-mono mt-1 tracking-widest">SECURE</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Digitally Signed</p>
                                    </div>
                                    <p className="font-bold text-slate-900 text-lg leading-tight font-serif italic">{name}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{date}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">ID: {id}</p>
                                    </div>
                                </div>
                                <div className="opacity-5 absolute -right-2 -bottom-2 transform -rotate-12 pointer-events-none">
                                    <ScanBarcode size={80} />
                                </div>
                            </div>
                        </div>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};

const WorkspaceEditor: React.FC<{ 
    file: EOfficeFile; 
    onClose: () => void; 
    onOpenAnjelo: (s?:any, n?:string) => void;
    onContextUpdate?: (context: { title?: string; content?: string; type?: string } | null) => void;
}> = ({ file, onClose, onOpenAnjelo, onContextUpdate }) => {
    const [content, setContent] = useState(file.content);
    const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    // Email state
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState('');
    const [emailSubject, setEmailSubject] = useState(file.title);
    const [emailBody, setEmailBody] = useState('Terlampir dokumen yang Anda butuhkan.');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    // Signature state
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    // Sync content to AI context
    useEffect(() => {
        onContextUpdate?.({
            title: file.title,
            content: content,
            type: file.type
        });
    }, [content, file.title, file.type, onContextUpdate]);

    // Determine styles based on file type
    const config = {
        DOC: { color: 'blue', icon: FileText, placeholder: 'Ketik @ untuk menyisipkan...' },
        SHEET: { color: 'green', icon: Table, placeholder: '' },
        SLIDE: { color: 'yellow', icon: Presentation, placeholder: 'Klik untuk menambahkan catatan...' }
    }[file.type];

    const handleAIWrite = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        
        // Contextual prompt based on file type
        const systemPrompt = `You are a helpful assistant inside a document editor for a village office (Kelurahan). 
        The user is editing a ${file.type === 'DOC' ? 'document' : file.type === 'SHEET' ? 'spreadsheet' : 'presentation'}.
        Current content context: ${content.substring(0, 200)}...
        Generate content based on this request: ${aiPrompt}. 
        Return ONLY the content text/data, no conversational filler.`;

        const response = await sendMessageToGemini(systemPrompt, []);
        
        // Append generated content
        setContent(prev => prev + "\n" + response.text);
        setIsGenerating(false);
        setIsAIPromptOpen(false);
        setAiPrompt('');
    };

    const handleSendEmail = () => {
        setIsSendingEmail(true);
        // Simulate sending email
        setTimeout(() => {
            setIsSendingEmail(false);
            setIsEmailModalOpen(false);
            alert("Email berhasil dikirim!");
        }, 2000);
    }

    const handleSignDocument = () => {
        const signatureId = `DS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const signatureDate = new Date().toLocaleString();
        const signatureBlock = `\n\n[[DIGITAL_SIGNATURE|Budi Santoso|${signatureDate}|${signatureId}]]\n`;
        setContent(prev => prev + signatureBlock);
        setIsSignatureModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#F9FBFD]">
            {/* 1. Header Bar */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div className={`p-1.5 rounded bg-${config.color}-50 text-${config.color}-600`}>
                        <config.icon size={20} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm md:text-lg font-medium text-slate-800 truncate">{file.title}</h1>
                        <div className="flex items-center text-xs text-slate-500 space-x-2">
                            <span>File</span>
                            <span>Edit</span>
                            <span>View</span>
                            <span>Insert</span>
                            <span>Format</span>
                            <span>Tools</span>
                            <span className="text-slate-400">| Last edit was seconds ago</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
                     <button className="hidden md:flex items-center space-x-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-full transition">
                        <MessageCircle size={20} />
                     </button>
                     <button className="hidden md:flex items-center space-x-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-full transition">
                        <VideoIcon size={20} />
                     </button>
                     <button className={`flex items-center space-x-2 bg-${config.color}-100 text-${config.color}-800 px-4 py-2 rounded-full font-medium hover:bg-${config.color}-200 transition`}>
                        <Share size={18} />
                        <span className="hidden md:inline">Share</span>
                     </button>
                     <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="User" />
                     </div>
                </div>
            </div>

            {/* 2. Toolbar */}
            <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center space-x-1 md:space-x-2 overflow-x-auto no-scrollbar">
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><Search size={16} /></button>
                <div className="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><ArrowLeft size={16} /></button>
                <div className="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
                
                {/* AI Hero Button */}
                <button 
                    onClick={() => setIsAIPromptOpen(true)}
                    className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 hover:shadow-sm transition shrink-0"
                >
                    <Sparkles size={14} />
                    <span className="text-xs font-bold">Help me write</span>
                </button>
                
                <div className="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><Bold size={16} /></button>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><Italic size={16} /></button>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><Underline size={16} /></button>
                <div className="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><AlignLeft size={16} /></button>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><AlignCenter size={16} /></button>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0"><AlignRight size={16} /></button>
                <div className="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
                <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600 shrink-0 flex items-center gap-1" 
                    title="Kirim via Email"
                >
                    <Mail size={16} />
                </button>
                <button 
                    onClick={() => onOpenAnjelo('DOCS', `Kirim Dokumen: ${file.title}`)}
                    className="p-1.5 rounded hover:bg-orange-50 text-orange-600 shrink-0 flex items-center gap-1 border border-transparent hover:border-orange-200" 
                    title="Kirim Fisik via Anjelo"
                >
                    <Truck size={16} /> 
                    <span className="text-[10px] font-bold hidden lg:inline">Kirim Fisik</span>
                </button>
                <button 
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="p-1.5 rounded hover:bg-blue-50 text-blue-600 shrink-0 flex items-center gap-1 border border-transparent hover:border-blue-200" 
                    title="Add Digital Signature"
                >
                    <PenTool size={16} />
                </button>
            </div>

            {/* 3. Main Canvas */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-[#F9FBFD]">
                <div 
                    className="w-full max-w-4xl bg-white shadow-sm border border-slate-200 min-h-[800px] p-8 md:p-12 outline-none" 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => setContent(e.currentTarget.innerText)}
                >
                     {/* Render content differently based on type */}
                     {file.type === 'SHEET' ? (
                         <div className="overflow-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        {[...Array(6)].map((_, i) => <th key={i} className="border border-slate-300 bg-slate-50 p-1 w-24 text-center font-normal text-slate-500">{String.fromCharCode(65 + i)}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(20)].map((_, r) => (
                                        <tr key={r}>
                                            {[...Array(6)].map((_, c) => (
                                                <td key={c} className="border border-slate-200 p-1 min-w-[100px] h-8 text-slate-800">
                                                    {r === 0 && c === 0 && content ? content.split('\n')[0] : ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     ) : (
                         <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-base md:text-lg">
                            <DocumentContentRenderer content={content} />
                         </div>
                     )}
                </div>
            </div>

            {/* AI Prompt Modal */}
            {isAIPromptOpen && (
                <div className="absolute top-36 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-1 ring-4 ring-indigo-50">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 text-indigo-700 mb-2 font-medium">
                                <Sparkles size={16} />
                                <span>Help me write</span>
                            </div>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={`Ask Gemini to write ${file.type === 'SHEET' ? 'data' : 'content'}...`}
                                className="w-full bg-white border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 resize-none h-24 shadow-sm"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2 mt-3">
                                <button 
                                    onClick={() => setIsAIPromptOpen(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-white/50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAIWrite}
                                    disabled={!aiPrompt.trim() || isGenerating}
                                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center space-x-1"
                                >
                                    {isGenerating ? <span>Generating...</span> : (
                                        <>
                                            <span>Create</span>
                                            <ArrowLeft size={12} className="rotate-180" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Kirim via Email</h3>
                            <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Penerima</label>
                                <input 
                                    type="email" 
                                    value={emailRecipient} 
                                    onChange={(e) => setEmailRecipient(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="email@tujuan.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Subjek</label>
                                <input 
                                    type="text" 
                                    value={emailSubject} 
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Pesan</label>
                                <textarea 
                                    value={emailBody} 
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                ></textarea>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                    <FileText size={16} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-slate-700 truncate">{file.title}</p>
                                    <p className="text-2xs text-slate-500">Lampiran</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={handleSendEmail}
                                    disabled={isSendingEmail || !emailRecipient}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSendingEmail ? 'Mengirim...' : (
                                        <>
                                            <Send size={14} /> Kirim
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Signature Modal */}
            {isSignatureModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Digital Signature</h3>
                            <button onClick={() => setIsSignatureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex items-center justify-center bg-slate-50 relative group cursor-pointer hover:bg-slate-100 transition">
                                 <div className="text-center">
                                     <span className="text-slate-800 text-2xl italic font-serif block mb-1">Budi Santoso</span>
                                     <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Verified ID</span>
                                 </div>
                                 <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition rounded-lg">
                                     <PenTool size={24} className="text-slate-500" />
                                 </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500">
                                    By clicking sign, you certify that you have reviewed this document and agree to its contents using your MetalOS Digital Identity.
                                </p>
                            </div>
                            <button
                                onClick={handleSignDocument}
                                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Sign Document with Barcode Stamp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Components DocsApp, SheetsApp, and SlidesApp have been consolidated into WorkspaceApp

const CalendarApp: React.FC<SubAppProps> = ({ onOpenFile, searchQuery }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([
        { id: 'ev1', title: 'Rapat Koordinasi RW 07', date: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 9, 0), type: 'Work', color: 'bg-blue-500' },
        { id: 'ev2', title: 'Posyandu Balita', date: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 8, 0), type: 'Health', color: 'bg-red-500' },
        { id: 'ev3', title: 'Kerja Bakti', date: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 7, 0), type: 'Community', color: 'bg-green-500' },
        { id: 'ev4', title: 'Deadline Laporan APBDes', date: new Date(new Date().getFullYear(), new Date().getMonth(), 28), type: 'Work', color: 'bg-orange-500' },
        { id: 'ev5', title: 'Cuti Bersama', date: new Date(new Date().getFullYear(), new Date().getMonth(), 5), type: 'Holiday', color: 'bg-purple-500' },
    ]);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '09:00', type: 'Work' });

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.date) return;
        
        const eventDate = new Date(`${newEvent.date}T${newEvent.time}`);
        
        const colors = {
            'Work': 'bg-blue-500',
            'Personal': 'bg-slate-500',
            'Holiday': 'bg-purple-500',
            'Health': 'bg-red-500',
            'Community': 'bg-green-500'
        };

        setEvents([...events, {
            id: `ev_${Date.now()}`,
            title: newEvent.title,
            date: eventDate,
            type: newEvent.type as any,
            color: colors[newEvent.type as keyof typeof colors] || 'bg-blue-500'
        }]);
        
        setIsEventModalOpen(false);
        setNewEvent({ title: '', date: '', time: '09:00', type: 'Work' });
    };

    // Generate Grid
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const daysArray = [];
    
    // Empty cells for offset
    for (let i = 0; i < startDay; i++) {
        daysArray.push(null);
    }
    
    // Day cells
    for (let i = 1; i <= totalDays; i++) {
        daysArray.push(i);
    }

    return (
        <div className="flex h-full bg-white">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 p-4 hidden md:block bg-slate-50">
                <button 
                    onClick={() => setIsEventModalOpen(true)}
                    className="w-full bg-white border border-slate-200 shadow-sm text-slate-700 font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-slate-50 hover:shadow-md transition mb-6"
                >
                    <Plus size={20} className="text-indigo-600" /> Buat Jadwal
                </button>
                
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kalender Saya</h3>
                    <div className="space-y-2">
                        {['Pekerjaan (Desa)', 'Pribadi', 'Libur Nasional', 'Kesehatan', 'Komunitas'].map((cal, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700">{cal}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mini Cal (Static for visual) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-center font-bold text-sm mb-2 text-slate-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
                        {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
                        {Array.from({length: 30}, (_, i) => (
                            <div key={i} className={`p-1 rounded-full ${i+1 === new Date().getDate() ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}>{i+1}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Calendar */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-md shadow-sm transition"><ChevronLeft size={16} /></button>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-md shadow-sm transition"><ChevronRight size={16} /></button>
                        </div>
                        <button onClick={handleToday} className="text-sm font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition">
                            Hari Ini
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-slate-100 border-none rounded-lg text-sm font-bold text-slate-600 px-3 py-1.5 outline-none cursor-pointer">
                            <option>Bulan</option>
                            <option>Minggu</option>
                            <option>Hari</option>
                        </select>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
                    {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto bg-white">
                    {daysArray.map((day, idx) => {
                        // Filter events for this day
                        const dayEvents = day ? filteredEvents.filter(e => 
                            e.date.getDate() === day && 
                            e.date.getMonth() === currentDate.getMonth() && 
                            e.date.getFullYear() === currentDate.getFullYear()
                        ) : [];

                        return (
                            <div key={idx} className={`border-b border-r border-slate-100 p-2 min-h-[100px] relative group transition hover:bg-slate-50 ${!day ? 'bg-slate-50/30' : ''}`}>
                                {day && (
                                    <>
                                        <div className={`text-sm font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                                            day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'text-slate-500'
                                        }`}>
                                            {day}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.map(ev => (
                                                <div 
                                                    key={ev.id} 
                                                    className={`${ev.color} text-white text-[10px] px-2 py-1 rounded shadow-sm truncate cursor-pointer hover:opacity-90`}
                                                    title={ev.title}
                                                >
                                                    {ev.date.getHours() > 0 && <span className="opacity-75 mr-1">{ev.date.getHours()}:{ev.date.getMinutes().toString().padStart(2, '0')}</span>}
                                                    {ev.title}
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setNewEvent(prev => ({ ...prev, date: `${currentDate.getFullYear()}-${(currentDate.getMonth()+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` }));
                                                setIsEventModalOpen(true);
                                            }}
                                            className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <CalendarIcon size={18} /> Jadwal Baru
                            </h3>
                            <button onClick={() => setIsEventModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kegiatan</label>
                                <input 
                                    type="text" 
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Rapat, Kunjungan, dll..."
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Waktu</label>
                                    <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus:ring-indigo-500 bg-white">
                                        <Clock size={14} className="text-slate-400 mr-2" />
                                        <input 
                                            type="time" 
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                            className="w-full text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                                <div className="flex gap-2">
                                    {['Work', 'Personal', 'Holiday'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewEvent({...newEvent, type})}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${newEvent.type === type ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi (Opsional)</label>
                                <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus:ring-indigo-500 bg-white">
                                    <MapPin size={14} className="text-slate-400 mr-2" />
                                    <input 
                                        type="text" 
                                        placeholder="Balai Desa, Online..."
                                        className="w-full text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleAddEvent}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95 mt-2"
                            >
                                Simpan Jadwal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ChatApp: React.FC<SubAppProps> = ({ onOpenFile, searchQuery }) => {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [callStatus, setCallStatus] = useState<'IDLE' | 'DIALING' | 'CONNECTED'>('IDLE');
    const [callDuration, setCallDuration] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Expanded Contact Interface
    interface ChatContact {
        id: string;
        name: string;
        role: string;
        status: 'online' | 'offline' | 'busy';
        lastMessage: string;
        lastTime: string;
        unread: number;
        avatarSeed: string;
    }

    const [contacts, setContacts] = useState<ChatContact[]>([
        { id: '1', name: 'Pak Lurah', role: 'Kepala Desa', status: 'online', lastMessage: 'Siap pak, data sudah valid.', lastTime: '10:45', unread: 0, avatarSeed: 'Lurah' },
        { id: '2', name: 'Bu Sekdes', role: 'Sekretaris', status: 'busy', lastMessage: 'Tolong revisi surat pengantar.', lastTime: '09:30', unread: 2, avatarSeed: 'Sekdes' },
        { id: '3', name: 'Ketua RW 07', role: 'Tokoh Masyarakat', status: 'offline', lastMessage: 'Warga minta kerja bakti minggu ini.', lastTime: 'Kemarin', unread: 0, avatarSeed: 'RW07' },
        { id: '4', name: 'Admin Anjelo', role: 'Logistik', status: 'online', lastMessage: 'Armada motor listrik siap.', lastTime: '08:15', unread: 0, avatarSeed: 'Anjelo' },
        { id: '5', name: 'Operator Gapura', role: 'IT Support', status: 'online', lastMessage: 'Jaringan aman terkendali.', lastTime: '08:00', unread: 0, avatarSeed: 'Gapura' },
    ]);

    const [messages, setMessages] = useState<{id: string, sender: string, text: string, timestamp: Date, type?: 'file', file?: string}[]>([
        { id: 'm1', sender: 'Pak Lurah', text: 'Selamat siang Pak, laporan sensor banjir RW 07 sepertinya offline.', timestamp: new Date(Date.now() - 3600000) }
    ]);

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const selectedContact = contacts.find(c => c.id === selectedContactId);

    // Simulate Real-time Status Changes - Smarter Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setContacts(prev => prev.map(c => {
                // Keep active contact mostly online for better UX
                if (c.id === selectedContactId && Math.random() > 0.2) return { ...c, status: 'online' };
                
                if (Math.random() > 0.8) {
                    const statuses: ('online' | 'offline' | 'busy')[] = ['online', 'offline', 'busy'];
                    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    return { ...c, status: newStatus };
                }
                return c;
            }));
        }, 8000);
        return () => clearInterval(interval);
    }, [selectedContactId]);

    // Call Duration Timer
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (callStatus === 'CONNECTED') {
            timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(timer);
    }, [callStatus]);

    const handleStartCall = () => {
        setCallStatus('DIALING');
        setTimeout(() => {
            setCallStatus('CONNECTED');
        }, 2000);
    };

    const handleEndCall = () => {
        setCallStatus('IDLE');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleSend = () => {
        if (!chatInput.trim()) return;
        
        const newMsg = { 
            id: Date.now().toString(), 
            sender: 'Me', 
            text: chatInput, 
            timestamp: new Date() 
        };
        
        setMessages(prev => [...prev, newMsg]);
        setChatInput('');
        
        // Update last message in sidebar
        if (selectedContactId) {
            setContacts(prev => prev.map(c => 
                c.id === selectedContactId 
                ? { ...c, lastMessage: chatInput, lastTime: 'Now' } 
                : c
            ));
        }

        // Start typing simulation
        setTimeout(() => setIsTyping(true), 800);

        // Sim response
        setTimeout(() => {
            if (selectedContact) {
                setIsTyping(false);
                const replyMsg = { 
                    id: (Date.now()+1).toString(), 
                    sender: selectedContact.name, 
                    text: 'Siap, laksanakan. Segera saya proses.', 
                    timestamp: new Date() 
                };
                setMessages(prev => [...prev, replyMsg]);
                
                setContacts(prev => prev.map(c => 
                    c.id === selectedContactId 
                    ? { ...c, lastMessage: 'Siap, laksanakan. Segera saya proses.', lastTime: 'Now' } 
                    : c
                ));
            }
        }, 2500 + Math.random() * 1000);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const newMsg = { 
                id: Date.now().toString(), 
                sender: 'Me', 
                text: `Mengirim file: ${file.name}`, 
                type: 'file' as const, 
                file: file.name,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newMsg]);
            
            // Clear input
            e.target.value = '';
        }
    };

    // Render helpers for status
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'online': return 'bg-green-500';
            case 'busy': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'online': return 'Online';
            case 'busy': return 'Sibuk';
            default: return 'Offline';
        }
    }

    return (
        <div className="flex-1 flex bg-white relative overflow-hidden">
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
            />

            {/* Call Overlay */}
            {callStatus !== 'IDLE' && selectedContact && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mb-8 relative overflow-visible">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.avatarSeed}`} alt={selectedContact.name} className="w-28 h-28 rounded-full" />
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedContact.name}</h2>
                    <p className="text-blue-300 text-sm font-mono mb-8 flex items-center gap-2">
                        <Wifi size={14} />
                        {callStatus === 'DIALING' ? 'Dialing via WargaNet...' : `Connected • ${formatTime(callDuration)}`}
                    </p>
                    
                    <div className="flex gap-6">
                        <button className="p-4 bg-slate-800 rounded-full hover:bg-slate-700 transition"><Mic size={24} /></button>
                        <button onClick={handleEndCall} className="p-4 bg-red-600 rounded-full hover:bg-red-700 shadow-lg shadow-red-600/20 transition transform hover:scale-105">
                            <PhoneOff size={32} fill="currentColor" />
                        </button>
                        <button className="p-4 bg-slate-800 rounded-full hover:bg-slate-700 transition"><Video size={24} /></button>
                    </div>
                    <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest">End-to-End Encrypted</p>
                </div>
            )}

            {/* Contact List */}
            <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                        <div 
                            key={contact.id} 
                            onClick={() => setSelectedContactId(contact.id)}
                            className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-slate-50 transition ${selectedContactId === contact.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`} alt={contact.name} />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">{contact.name}</h4>
                                    <span className="text-[10px] text-slate-400">{contact.lastTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate ${contact.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                        {contact.lastMessage}
                                    </p>
                                    {contact.unread > 0 && (
                                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold ml-2">
                                            {contact.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col absolute inset-0 md:static bg-white z-10 transition-transform duration-300 ${
                selectedContactId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
            } md:transform-none`}>
                
                {!selectedContactId && (
                   <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-300">
                       <MessageSquare size={48} className="mb-4 opacity-50" />
                       <p>Pilih kontak untuk memulai chat</p>
                   </div>
                )}

                {selectedContact && (
                    <>
                        <div className="p-3 md:p-4 border-b border-slate-200 flex items-center space-x-3 bg-white z-20 shadow-sm">
                            <button onClick={() => setSelectedContactId(null)} className="md:hidden p-1 -ml-1 text-slate-500">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="relative">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.avatarSeed}`} alt={selectedContact.name} />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(selectedContact.status)}`}></div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 text-sm md:text-base">{selectedContact.name}</h3>
                                <div className="flex items-center space-x-1">
                                    {isTyping ? (
                                        <span className="text-xs text-green-600 font-medium animate-pulse">Sedang mengetik...</span>
                                    ) : (
                                        <>
                                            <span className="text-xs text-slate-500 capitalize">{getStatusLabel(selectedContact.status)}</span>
                                            <span className="text-xs text-slate-300">•</span>
                                            <span className="text-xs text-slate-400">{selectedContact.role}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={handleStartCall}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                    title="Call via WargaNet"
                                >
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition">
                                    <VideoIcon size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/30 flex flex-col">
                            {messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-md`}>
                                        <div className={`${msg.sender === 'Me' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'} p-3 rounded-2xl text-sm shadow-sm`}>
                                            {msg.type === 'file' ? (
                                                <div className="flex items-center space-x-2 bg-black/10 p-2 rounded">
                                                    <FileText size={16} />
                                                    <span className="underline cursor-pointer">{msg.file}</span>
                                                </div>
                                            ) : msg.text}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="bg-slate-200/50 p-3 rounded-2xl rounded-tl-none">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-3 border-t border-slate-200 flex space-x-2 bg-white items-center">
                            <button 
                                onClick={handleAttachClick} 
                                className="p-2 text-slate-400 hover:text-slate-600 transition hover:bg-slate-100 rounded-full"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ketik pesan..." 
                                className="flex-1 bg-slate-100 px-4 py-2 rounded-full text-sm outline-none focus:ring-1 focus:ring-teal-500" 
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!chatInput.trim()}
                                className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const MeetApp: React.FC<SubAppProps> = ({ onOpenFile, searchQuery }) => {
    const [isMeetingActive, setIsMeetingActive] = useState(false);
    const [meetingCode, setMeetingCode] = useState('');
    const [participants, setParticipants] = useState([
        { id: '1', name: 'Pak Lurah', role: 'Host', initial: 'L', color: 'bg-purple-600' },
        { id: '2', name: 'Bu Sekdes', role: 'Participant', initial: 'S', color: 'bg-green-600' },
        { id: '3', name: 'Tim Anjelo', role: 'Participant', initial: 'A', color: 'bg-blue-600' },
    ]);

    const filteredParticipants = participants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleStartMeeting = () => {
        setIsMeetingActive(true);
    };

    if (isMeetingActive) {
        return (
            <div className="flex-1 flex flex-col bg-slate-900 relative overflow-hidden animate-in fade-in duration-300">
                 {/* Top Status Bar */}
                 <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-mono flex items-center space-x-2">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                     <span>Rakor Mingguan • 00:14:22</span>
                 </div>
                 
                 {/* Video Grid */}
                 <div className="flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 overflow-y-auto">
                     {filteredParticipants.map(p => (
                         <div key={p.id} className="bg-slate-800 rounded-xl relative overflow-hidden border border-slate-700 aspect-video md:aspect-auto">
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className={`w-16 h-16 md:w-24 md:h-24 ${p.color} rounded-full flex items-center justify-center text-xl md:text-3xl font-bold text-white shadow-lg`}>
                                     {p.initial}
                                 </div>
                             </div>
                             <div className="absolute bottom-3 left-3 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">{p.name}</div>
                         </div>
                     ))}
                     {/* Self View */}
                     <div className="bg-slate-700 rounded-xl relative overflow-hidden border-2 border-blue-500 shadow-blue-900/50 shadow-lg aspect-video md:aspect-auto">
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                              <p className="text-sm">Anda (Presenting)</p>
                          </div>
                          <div className="absolute bottom-3 right-3 w-24 h-16 md:w-32 md:h-20 bg-black rounded border border-slate-600"></div>
                     </div>
                 </div>

                 {/* Controls */}
                 <div className="bg-slate-800/90 backdrop-blur border-t border-slate-700 p-4 pb-20 md:pb-4 flex items-center justify-center space-x-3 md:space-x-6 z-30 safe-area-bottom">
                     <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition"><Mic size={20} /></button>
                     <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition"><Camera size={20} /></button>
                     <button 
                        onClick={() => setIsMeetingActive(false)}
                        className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition flex items-center space-x-2 font-bold shadow-lg"
                     >
                         <PhoneOff size={20} />
                         <span className="hidden md:inline">Akhiri</span>
                     </button>
                     <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition"><Users size={20} /></button>
                     <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600 active:scale-95 transition"><MessageSquare size={20} /></button>
                 </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <Video size={64} className="text-red-600" />
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Rapat Digital Desa</h2>
                 <p className="text-slate-500 max-w-md mb-8 text-sm md:text-base">
                    Hubungkan warga dan perangkat desa di mana saja. Aman, mudah, dan terintegrasi dengan MetalOS.
                 </p>
                 
                 <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full max-w-md">
                     <button 
                        onClick={handleStartMeeting}
                        className="w-full md:w-auto px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition flex items-center justify-center space-x-2"
                     >
                        <Video size={20} />
                        <span>Rapat Baru</span>
                     </button>
                     <div className="flex items-center space-x-2 w-full md:w-auto relative group">
                        <div className="absolute left-3 text-slate-400 group-focus-within:text-red-500 transition">
                            <Link size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Masukkan kode rapat" 
                            className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-slate-50 focus:bg-white"
                        />
                     </div>
                 </div>
            </div>
            
            <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kontak Cepat</h3>
                    <button className="text-xs text-red-600 font-bold hover:underline">Lihat Semua</button>
                 </div>
                 <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                     {['Pak Lurah', 'Bu Sekdes', 'Ketua RW 01', 'Bhabin', 'Operator'].map((name, i) => (
                         <button key={i} onClick={handleStartMeeting} className="flex flex-col items-center space-y-2 min-w-[72px] group">
                             <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center group-hover:border-red-500 group-hover:shadow-md transition relative">
                                 <span className="font-bold text-slate-600 text-sm">{name.substring(0,2).toUpperCase()}</span>
                                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                             </div>
                             <span className="text-xs text-slate-600 font-medium truncate w-full text-center group-hover:text-red-600 transition">{name}</span>
                         </button>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default EOfficeView;