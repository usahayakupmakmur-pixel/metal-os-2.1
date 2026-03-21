import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Calendar, Users, FileText, Table, Presentation,
  Video, MessageSquare, Globe, Map, 
  Cloud, ExternalLink, RefreshCw, LogIn,
  Search, Filter, MoreVertical, Star,
  Clock, CheckCircle2, AlertCircle,
  LayoutGrid, List, Grid
} from 'lucide-react';

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const GoogleWorkspaceView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      const authWindow = window.open(url, 'google_oauth_popup', 'width=600,height=700');
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuthStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    checkAuthStatus();
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/google/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setIsAuthenticated(true);
        fetchGmail();
        fetchCalendar();
        fetchDrive();
        fetchContacts();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const fetchGmail = async () => {
    try {
      const response = await fetch('/api/google/gmail');
      if (response.ok) {
        const data = await response.json();
        setGmailMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Gmail fetch error:', error);
    }
  };

  const fetchCalendar = async () => {
    try {
      const response = await fetch('/api/google/calendar');
      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data || []);
      }
    } catch (error) {
      console.error('Calendar fetch error:', error);
    }
  };

  const fetchDrive = async () => {
    try {
      const response = await fetch('/api/google/drive');
      if (response.ok) {
        const data = await response.json();
        setDriveFiles(data || []);
      }
    } catch (error) {
      console.error('Drive fetch error:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/google/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data || []);
      }
    } catch (error) {
      console.error('Contacts fetch error:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'gmail', label: 'Gmail', icon: Mail, color: 'text-red-500' },
    { id: 'chat', label: 'Chat & Meet', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-blue-500' },
    { id: 'drive', label: 'Drive', icon: Cloud, color: 'text-yellow-500' },
    { id: 'docs', label: 'Docs & Sheets', icon: FileText, color: 'text-blue-600' },
    { id: 'maps', label: 'Maps', icon: Map, color: 'text-green-600' },
    { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-indigo-600' },
  ];

  const freeTierApps = [
    { id: 'docs', label: 'Google Docs', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Create and edit documents for free.' },
    { id: 'sheets', label: 'Google Sheets', icon: Table, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Powerful spreadsheets at no cost.' },
    { id: 'slides', label: 'Google Slides', icon: Presentation, color: 'text-amber-600', bg: 'bg-amber-50', description: 'Stunning presentations for everyone.' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-4xl"
        >
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 animate-pulse">
              <Globe className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Google Workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Integrated</span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Akses ekosistem Google secara gratis dan terintegrasi langsung di MetalOS Ruang Kerja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freeTierApps.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-left space-y-4 group hover:scale-105 transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl ${app.bg} ${app.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                  <app.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800">{app.label}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{app.description}</p>
                <div className="pt-4 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                  Free Tier <CheckCircle2 size={14} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleConnect}
              className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 active:scale-95"
            >
              <LogIn size={24} />
              <span>Hubungkan Akun Google</span>
            </button>
            <button 
              className="px-12 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-[2rem] font-black flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all active:scale-95"
            >
              <span>Gunakan Mode Tamu</span>
            </button>
          </div>

          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
            Powered by Google Cloud Platform & MetalOS Kernel
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img 
            src={profile?.picture} 
            alt={profile?.name} 
            className="w-16 h-16 rounded-2xl border-2 border-white shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome, {profile?.name}</h2>
            <p className="text-slate-500 text-sm">{profile?.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition">
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition">
            Workspace Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-red-500" />
                    Recent Emails
                  </h3>
                  <button className="text-xs text-blue-600 font-bold">View All</button>
                </div>
                <div className="space-y-4">
                  {gmailMessages.length > 0 ? gmailMessages.map((msg: any) => (
                    <div key={msg.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">Message ID: {msg.id}</p>
                        <p className="text-xs text-slate-500 truncate">Thread ID: {msg.threadId}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400">
                      <Mail className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No recent messages found</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Upcoming Events
                  </h3>
                  <button className="text-xs text-blue-600 font-bold">Open Calendar</button>
                </div>
                <div className="space-y-4">
                  {calendarEvents.length > 0 ? calendarEvents.map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          {new Date(event.start?.dateTime || event.start?.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {new Date(event.start?.dateTime || event.start?.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{event.summary}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No upcoming events found</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-yellow-500" />
                    Recent Files
                  </h3>
                  <button className="text-xs text-blue-600 font-bold">Drive</button>
                </div>
                <div className="space-y-4">
                  {driveFiles.length > 0 ? driveFiles.slice(0, 5).map((file: any) => (
                    <div key={file.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {file.mimeType.includes('spreadsheet') ? <Table className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500 truncate">Modified {new Date(file.modifiedTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400">
                      <Cloud className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No recent files found</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              <GlassCard className="relative group">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20">
                  <h4 className="font-bold text-slate-800 flex items-center">
                    <Map className="w-4 h-4 mr-2 text-green-600" />
                    Google Maps Embedded
                  </h4>
                </div>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.81956135000001!3d-6.194741399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x35a7d63d1e545d88!2sGrand%20Indonesia!5e0!3m2!1sen!2sid!4v1647850000000!5m2!1sen!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </GlassCard>

              <GlassCard className="relative group">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20">
                  <h4 className="font-bold text-slate-800 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                    Google Earth View
                  </h4>
                </div>
                <iframe 
                  src="https://earth.google.com/web/@-6.1947414,106.8195614,15.5a,1000d,35y,0h,0t,0r" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </GlassCard>
            </div>
          )}

          {activeTab === 'drive' && (
            <GlassCard className="h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Google Drive Explorer</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search files..." 
                      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Filter className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {driveFiles.length > 0 ? driveFiles.map((file: any) => (
                    <motion.div 
                      key={file.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => window.open(file.webViewLink, '_blank')}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition">
                        {file.mimeType.includes('spreadsheet') ? <Table className="w-6 h-6 text-green-600" /> : 
                         file.mimeType.includes('document') ? <FileText className="w-6 h-6 text-blue-600" /> :
                         file.mimeType.includes('presentation') ? <Presentation className="w-6 h-6 text-amber-600" /> :
                         <FileText className="w-6 h-6 text-slate-400" />}
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate w-full">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(2)} MB` : 'Folder'}</p>
                    </motion.div>
                  )) : (
                    <div className="col-span-full text-center py-20 text-slate-400">
                      <Cloud className="w-16 h-16 mx-auto mb-4 opacity-10" />
                      <p>No files found in your Google Drive</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              <GlassCard className="lg:col-span-1 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Recent Chats</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">Team Alpha {i}</p>
                        <p className="text-xs text-slate-500 truncate">Hey, did you see the report?</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="lg:col-span-2 flex flex-col bg-slate-50">
                <div className="p-6 border-b border-white/20 bg-white/50 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">T</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Team Alpha</h4>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm"><Video className="w-4 h-4 text-slate-600" /></button>
                    <button className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm"><MessageSquare className="w-4 h-4 text-slate-600" /></button>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'contacts' && (
            <GlassCard className="h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Google Contacts</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Add Contact</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.length > 0 ? contacts.map((contact: any, i: number) => {
                    const name = contact.names?.[0]?.displayName || 'Unknown';
                    const email = contact.emailAddresses?.[0]?.value || 'No email';
                    const photo = contact.photos?.[0]?.url;
                    return (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                        {photo ? (
                          <img src={photo} alt={name} className="w-12 h-12 rounded-full border border-white shadow-sm" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                          <p className="text-xs text-slate-500 truncate">{email}</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-blue-600"><ExternalLink className="w-4 h-4" /></button>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full text-center py-20 text-slate-400">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
                      <p>No contacts found in your Google account</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GoogleWorkspaceView;
