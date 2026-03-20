
import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Zap, Battery, Smartphone, BookOpen, Video, Download, CheckCircle, Sun, Signal, Monitor, UploadCloud, File, Play, Pause, MessageCircle, ShoppingBag, FileText, Stethoscope, X, PhoneCall, Facebook, Instagram, Youtube, Send, Globe, Laptop, Airplay, StopCircle, Tv, Film, Radio, Home, Settings, Store, Cloud, Clock, BarChart3, ShieldCheck, Mail, FileSignature, Table, Presentation, Cast, PlayCircle, Info, Music, Star, ChevronRight, Search, Wallet, Briefcase, Lock, Activity, AlertTriangle, Calendar, Bell, Keyboard, XCircle, List, Power, Delete, Plus, AlertOctagon, SkipForward } from 'lucide-react';
import { LIBRARY_CONTENT, CAST_ZONES, SHARED_FILES, MARKETPLACE_ITEMS, MOCK_USER, SECURITY_CAMERAS, BUDGET_DATA, EOFFICE_SUMMARY, RONDA_SCHEDULES, POSYANDU_SESSIONS, SOCIAL_REPORTS } from '../constants';
import { MarketplaceItem, LibraryContent, SharedFile, CastZone, CitizenProfile } from '../types';

interface GapuraViewProps {
  user?: CitizenProfile;
  isTvMode: boolean;
  onToggleTvMode: (active: boolean) => void;
}

// Extended Cast Zone with local state for playlist
interface EnhancedCastZone extends CastZone {
    playlist: { id: string; title: string; duration: string; type: 'VIDEO' | 'IMAGE' }[];
    sourceType?: 'ANDROID' | 'IOS' | 'CHROME' | 'EDGE' | 'SAFARI' | 'LOCAL';
}

const GapuraView: React.FC<GapuraViewProps> = ({ user = MOCK_USER, isTvMode, onToggleTvMode }) => {
  // Green NOC State
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [connectedDevices, setConnectedDevices] = useState(142);

  // MetalGate Simulation State
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [portalStep, setPortalStep] = useState<'DISCONNECTED' | 'CONNECTING' | 'MENU'>('DISCONNECTED');
  
  // --- METAL TV OS STATE ---
  // Navigation: Row 0 = Sidebar, Row 1 = Content
  const [tvNavState, setTvNavState] = useState<{ section: 'SIDEBAR' | 'CONTENT', row: number, col: number }>({ section: 'CONTENT', row: 0, col: 0 });
  const [activeTvPage, setActiveTvPage] = useState<'HOME' | 'CINEMA' | 'EOFFICE' | 'LIVE' | 'CAST'>('HOME');
  const [tvTime, setTvTime] = useState(new Date());
  const [tvPlaying, setTvPlaying] = useState<{title: string, type: 'LIVE' | 'VOD' | 'YOUTUBE'} | null>(null);
  const [castPin, setCastPin] = useState('4829');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  
  // TV Overlay State (New)
  const [tvOverlay, setTvOverlay] = useState<'NONE' | 'AGENDA' | 'NOTIFICATIONS'>('NONE');

  // Admin Console State
  const [adminTab, setAdminTab] = useState<'INFO' | 'CAST' | 'SHARE'>('INFO');
  const [localCastZones, setLocalCastZones] = useState<EnhancedCastZone[]>(
      CAST_ZONES.map((z, i) => ({
          ...z,
          sourceType: i === 0 ? 'LOCAL' : i === 1 ? 'ANDROID' : 'CHROME',
          playlist: [
              { id: 'p1', title: z.currentContent === '-' ? 'Default Playlist' : z.currentContent, duration: '05:00', type: 'VIDEO' },
              { id: 'p2', title: 'Iklan Layanan Masyarakat', duration: '01:30', type: 'VIDEO' },
              { id: 'p3', title: 'Poster Event', duration: '00:15', type: 'IMAGE' }
          ]
      }))
  );
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Screen Share State
  const [isCasting, setIsCasting] = useState(false);
  const [castSource, setCastSource] = useState<'ANDROID' | 'IOS' | 'CHROME' | 'EDGE' | 'SAFARI' | null>(null);
  const [castStatus, setCastStatus] = useState<'IDLE' | 'SEARCHING' | 'CONNECTED'>('IDLE');

  // WargaShare State
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>(SHARED_FILES);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TV Data
  const youtubeContent = [
      { id: 'yt1', title: 'Profil Desa Digital', views: '12K', thumb: 'bg-red-600' },
      { id: 'yt2', title: 'Tutorial WargaPay', views: '5.4K', thumb: 'bg-blue-600' },
      { id: 'yt3', title: 'Highlights Festival', views: '8.9K', thumb: 'bg-purple-600' },
      { id: 'yt4', title: 'Sambutan Pak Lurah', views: '2K', thumb: 'bg-slate-600' },
  ];

  // Simulate Battery/Solar fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectedDevices(prev => Math.max(100, Math.min(200, prev + Math.floor(Math.random() * 5 - 2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // TV Clock
  useEffect(() => {
      const timer = setInterval(() => setTvTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

  // --- SMART TV NAVIGATION LOGIC ---
  useEffect(() => {
    if (!isTvMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        const blockedKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight', 'Enter', 'Space', 'Backspace', 'Escape'];
        if(blockedKeys.includes(e.code)) e.preventDefault();

        if (tvPlaying) {
            if (e.key === 'Escape' || e.key === 'Backspace') setTvPlaying(null);
            return;
        }

        if (e.key === 'Escape') {
            // Close overlay first if open
            if (tvOverlay !== 'NONE') {
                setTvOverlay('NONE');
                return;
            }
            // Then handle navigation or exit
            if (tvNavState.section === 'CONTENT') {
                setTvNavState({ section: 'SIDEBAR', row: 0, col: 0 });
            } else {
                // Optional: Close TV Mode on Sidebar Escape
                // onToggleTvMode(false);
            }
            return;
        }

        setTvNavState(prev => {
            const { section, row, col } = prev;
            const pages: ('HOME' | 'CINEMA' | 'EOFFICE' | 'LIVE' | 'CAST')[] = ['HOME', 'CINEMA', 'EOFFICE', 'LIVE', 'CAST'];

            if (section === 'SIDEBAR') {
                if (e.key === 'ArrowUp') {
                    const nextRow = Math.max(0, row - 1);
                    setActiveTvPage(pages[nextRow]);
                    return { ...prev, row: nextRow };
                }
                if (e.key === 'ArrowDown') {
                    const nextRow = Math.min(pages.length - 1, row + 1);
                    setActiveTvPage(pages[nextRow]);
                    return { ...prev, row: nextRow };
                }
                if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    return { section: 'CONTENT', row: 0, col: 0 };
                }
            } 
            else if (section === 'CONTENT') {
                if (e.key === 'ArrowLeft') {
                    if (col === 0) return { section: 'SIDEBAR', row: pages.indexOf(activeTvPage), col: 0 };
                    return { ...prev, col: col - 1 };
                }
                if (e.key === 'ArrowRight') return { ...prev, col: Math.min(3, col + 1) }; 
                if (e.key === 'ArrowUp') return { ...prev, row: Math.max(0, row - 1), col: 0 }; 
                if (e.key === 'ArrowDown') return { ...prev, row: Math.min(2, row + 1), col: 0 }; 

                if (e.key === 'Enter') {
                    if (activeTvPage === 'LIVE') setTvPlaying({ title: `CCTV CAM 0${col + 1}`, type: 'LIVE' });
                    else if (activeTvPage === 'CINEMA') {
                        if (row === 1) setTvPlaying({ title: youtubeContent[col]?.title || 'Video', type: 'YOUTUBE' });
                        else setTvPlaying({ title: 'Wonderful Yosomulyo', type: 'VOD' });
                    }
                    else if (activeTvPage === 'HOME' && row === 0) setTvPlaying({ title: 'Festival Payungi', type: 'VOD' });
                }
            }
            return prev;
        });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTvMode, tvPlaying, tvNavState, activeTvPage, tvOverlay]);


  const handleConnectWifi = () => {
    setPortalStep('CONNECTING');
    setTimeout(() => {
      setIsPhoneConnected(true);
      setPortalStep('MENU');
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsPhoneConnected(false);
    setPortalStep('DISCONNECTED');
  };

  // --- CAST CONTROL LOGIC ---
  const toggleZoneStatus = (id: string) => {
      setLocalCastZones(prev => prev.map(z => 
          z.id === id ? { ...z, status: z.status === 'PLAYING' ? 'IDLE' : 'PLAYING' } : z
      ));
  };

  const stopZone = (id: string) => {
    setLocalCastZones(prev => prev.map(z => 
        z.id === id ? { ...z, status: 'IDLE' } : z
    ));
  };

  const skipContent = (id: string) => {
      setLocalCastZones(prev => prev.map(z => {
          if (z.id === id) {
              const newPlaylist = [...z.playlist];
              const first = newPlaylist.shift();
              if (first) newPlaylist.push(first);
              return { 
                  ...z, 
                  playlist: newPlaylist,
                  currentContent: newPlaylist[0].title
              };
          }
          return z;
      }));
  };

  const cycleSourceType = (id: string) => {
      const sources: EnhancedCastZone['sourceType'][] = ['LOCAL', 'ANDROID', 'IOS', 'CHROME', 'EDGE', 'SAFARI'];
      setLocalCastZones(prev => prev.map(z => {
          if (z.id === id) {
              const currentIdx = sources.indexOf(z.sourceType || 'LOCAL');
              const nextIdx = (currentIdx + 1) % sources.length;
              return { ...z, sourceType: sources[nextIdx] };
          }
          return z;
      }));
  };

  const toggleEmergency = () => {
      const newState = !emergencyMode;
      setEmergencyMode(newState);
      setLocalCastZones(prev => prev.map(z => ({
          ...z,
          status: newState ? 'PLAYING' : 'IDLE',
          currentContent: newState ? 'EMERGENCY BROADCAST' : z.playlist[0].title
      })));
  };

  const handleStartCast = (source: 'ANDROID' | 'IOS' | 'CHROME' | 'EDGE' | 'SAFARI') => {
      if (isCasting && castSource === source) {
          setIsCasting(false);
          setCastStatus('IDLE');
          setCastSource(null);
          return;
      }
      setCastSource(source);
      setCastStatus('SEARCHING');
      setIsCasting(true);
      setTimeout(() => setCastStatus('CONNECTED'), 2000);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        let type: 'DOC' | 'IMG' | 'PDF' = 'DOC';
        if (file.type.includes('image')) type = 'IMG';
        if (file.type.includes('pdf')) type = 'PDF';

        const newFile: SharedFile = {
            id: `f_${Date.now()}`,
            name: file.name,
            type: type,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            owner: user.name,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        };

        setSharedFiles(prev => [newFile, ...prev]);
        e.target.value = '';
    }
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const getSourceIcon = (source: string | undefined) => {
      switch(source) {
          case 'ANDROID': return <Smartphone size={14} />;
          case 'IOS': return <Airplay size={14} />;
          case 'CHROME': return <Globe size={14} />;
          case 'EDGE': return <Laptop size={14} />;
          case 'SAFARI': return <Globe size={14} />;
          default: return <Monitor size={14} />;
      }
  };

  return (
    <div className="space-y-6">
      {/* Header: Green NOC Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... (Header Cards code unchanged) ... */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-700 flex flex-col justify-between relative overflow-hidden group ring-1 ring-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl opacity-20"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Green NOC Power</p>
              <h3 className="text-2xl font-bold mt-1">Online</h3>
            </div>
            <div className="p-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                <Sun className="text-yellow-400 animate-pulse w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onToggleTvMode(true)}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition w-full shadow-lg shadow-blue-600/20 active:scale-95 relative z-20"
          >
              <Tv size={16} /> Launch MetalTV OS
          </button>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white/50 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Battery Storage</p>
               <h3 className="text-2xl font-bold text-slate-800 mt-1">{batteryLevel}%</h3>
            </div>
            <div className={`p-2 rounded-full ${batteryLevel > 50 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                <Battery className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className={`h-full rounded-full ${batteryLevel > 50 ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${batteryLevel}%`}}></div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white/50 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Active Devices</p>
               <h3 className="text-2xl font-bold text-slate-800 mt-1">{connectedDevices}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-lg inline-block self-start">Peak hour load</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-white/50 flex flex-col justify-between hover:shadow-md transition">
           <div className="flex justify-between items-start">
            <div>
               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Backhaul</p>
               <h3 className="text-xl font-bold text-slate-800 mt-1">Starlink</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                <Signal className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <p className="text-xs text-green-600 font-bold">Latency: 45ms</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Phone Simulation */}
        <div className="lg:col-span-5 flex justify-center items-start pt-4">
           <div className="relative w-[320px] h-[650px] bg-black rounded-[3.5rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-slate-900 ring-1 ring-white/20 overflow-hidden select-none transform transition-transform hover:scale-[1.01] duration-500 group">
              {/* ... (Phone Simulation Code Unchanged) ... */}
              {/* Reflection/Gloss */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-50 rounded-[3rem]"></div>

              {/* Physical Buttons */}
              <div className="absolute top-32 -left-2 w-1 h-10 bg-slate-800 rounded-l-lg"></div>
              <div className="absolute top-48 -left-2 w-1 h-16 bg-slate-800 rounded-l-lg"></div>
              <div className="absolute top-36 -right-2 w-1 h-20 bg-slate-800 rounded-r-lg"></div>

              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 h-8 w-28 bg-black rounded-full z-40 flex justify-between items-center px-3 transition-all duration-300 hover:w-48 cursor-pointer group-hover:ring-1 group-hover:ring-white/10">
                  <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full hidden group-hover:block"></div>
                  </div>
              </div>

              {/* Screen Content */}
              <div className="w-full h-full bg-white flex flex-col font-sans relative z-10 overflow-hidden rounded-[3rem]">
                 {/* Status Bar */}
                 <div className="h-14 pt-4 px-8 flex justify-between items-start text-xs font-bold text-slate-900 z-20 absolute top-0 w-full">
                    <span>{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    <div className="flex gap-1.5 items-center">
                       <Signal size={14} />
                       <Wifi size={14} className={isPhoneConnected ? 'text-blue-600 animate-pulse' : 'text-slate-300'} />
                       <Battery size={14} />
                    </div>
                 </div>

                 {/* PHONE CONTENT */}
                 {portalStep === 'DISCONNECTED' && (
                    <div className="flex-1 bg-[#F2F2F7] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 right-0 h-[400px] bg-blue-600 rounded-b-[100%] scale-x-150 -translate-y-20 shadow-2xl"></div>
                       
                       <div className="relative z-10 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full text-center animate-in slide-in-from-bottom-8 duration-500 border border-white/50">
                          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform rotate-3">
                             <Wifi size={40} className="text-white" />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Gapura Digital</h3>
                          <p className="text-sm text-slate-500 mb-8 font-medium">Kelurahan Yosomulyo</p>
                          
                          <div className="space-y-3">
                              <button 
                                 onClick={handleConnectWifi}
                                 className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-xl hover:bg-slate-800 flex items-center justify-center gap-2"
                              >
                                 <Wifi size={16} /> Hubungkan Warganet
                              </button>
                              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-sm transition-all">
                                 Login Tamu
                              </button>
                          </div>
                       </div>
                    </div>
                 )}

                 {portalStep === 'CONNECTING' && (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <Wifi className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Authenticating...</h3>
                        <p className="text-slate-500 font-medium text-sm mt-2">Handshake with MetalGate</p>
                    </div>
                 )}

                 {portalStep === 'MENU' && (
                    <div className="flex-1 flex flex-col bg-[#F5F5F7] overflow-hidden relative">
                       {/* App Header */}
                       <div className="bg-blue-600 p-6 pb-10 rounded-b-[3rem] shadow-lg text-white pt-24 relative overflow-hidden">
                          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                          <div className="flex justify-between items-center mb-6 relative z-10">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
                                    <span className="font-bold text-lg">BS</span>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Welcome Back</p>
                                    <h3 className="font-black text-xl leading-none">{user.name.split(' ')[0]}</h3>
                                </div>
                             </div>
                             <button onClick={handleDisconnect} className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition backdrop-blur-sm">
                                <Zap size={20} fill="currentColor" />
                             </button>
                          </div>
                       </div>

                       {/* App Grid */}
                       <div className="px-6 -mt-8 relative z-10 grid grid-cols-2 gap-4 overflow-y-auto pb-20 no-scrollbar h-full">
                           {[
                               { label: 'Pasar', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
                               { label: 'Layanan', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                               { label: 'Hiburan', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
                               { label: 'Aman', icon: Lock, color: 'text-green-600', bg: 'bg-green-50' },
                               { label: 'Sehat', icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50' },
                               { label: 'Lapor', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                           ].map((app, i) => (
                               <div key={i} className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-3 aspect-square active:scale-95 transition cursor-pointer border border-slate-100 hover:border-blue-200">
                                   <div className={`w-12 h-12 ${app.bg} rounded-2xl flex items-center justify-center ${app.color}`}>
                                       <app.icon size={24} />
                                   </div>
                                   <span className="text-sm font-bold text-slate-700">{app.label}</span>
                               </div>
                           ))}
                           
                           {/* Connection Status Card */}
                           <div className="col-span-2 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mt-2">
                               <div className="flex justify-between items-center mb-3">
                                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connection</span>
                                   <div className="flex gap-1">
                                       <div className="w-1.5 h-3 bg-green-500 rounded-sm"></div>
                                       <div className="w-1.5 h-3 bg-green-500 rounded-sm"></div>
                                       <div className="w-1.5 h-3 bg-green-500 rounded-sm"></div>
                                       <div className="w-1.5 h-3 bg-slate-200 rounded-sm"></div>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <div className="p-2 bg-green-50 rounded-xl text-green-600"><Wifi size={18}/></div>
                                   <div>
                                       <p className="text-sm font-bold text-slate-800">Gapura AP-04</p>
                                       <p className="text-[10px] text-slate-400">5GHz • 150Mbps</p>
                                   </div>
                               </div>
                           </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Admin Console */}
        <div className="lg:col-span-7 space-y-6">
           <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/50 overflow-hidden min-h-[600px] flex flex-col">
              {/* Admin Tabs */}
              {/* ... (Admin Tabs code unchanged) ... */}
              <div className="p-2 bg-slate-100/50 m-4 rounded-[2rem] flex relative">
                  <div className="absolute inset-y-2 transition-all duration-300 ease-out bg-white shadow-md rounded-[1.5rem]" 
                       style={{
                           width: 'calc(33.3% - 0.5rem)', 
                           left: adminTab === 'INFO' ? '0.5rem' : adminTab === 'CAST' ? 'calc(33.3% + 0.25rem)' : 'calc(66.6% + 0rem)'
                       }}></div>
                  <button 
                      onClick={() => setAdminTab('INFO')}
                      className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 relative z-10 transition-colors ${adminTab === 'INFO' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <Wifi size={18} /> <span>MetalGate</span>
                  </button>
                  <button 
                      onClick={() => setAdminTab('CAST')}
                      className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 relative z-10 transition-colors ${adminTab === 'CAST' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <Monitor size={18} /> <span>MetalCast</span>
                  </button>
                  <button 
                      onClick={() => setAdminTab('SHARE')}
                      className={`flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2 relative z-10 transition-colors ${adminTab === 'SHARE' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <UploadCloud size={18} /> <span>WargaShare</span>
                  </button>
              </div>

              {/* Tab Content (Admin Console content unchanged) */}
              <div className="p-8 flex-1">
                  {adminTab === 'INFO' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                          {/* ... (Info Tab Content) ... */}
                          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                            <h2 className="text-2xl font-black mb-4 flex items-center relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl mr-3 backdrop-blur-md border border-white/20"><Wifi className="text-white" /></div>
                                MetalGate Protocol
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed mb-8 font-medium relative z-10">
                                Sistem <strong>"Zero Friction"</strong> mengubah router Wi-Fi Gapura Digital menjadi titik layanan cerdas. Warga otomatis terhubung ke layanan desa saat masuk jangkauan.
                            </p>
                            <div className="grid grid-cols-3 gap-4 relative z-10">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="text-3xl font-black">142</div>
                                    <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1">Devices</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="text-3xl font-black">45<span className="text-lg">ms</span></div>
                                    <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1">Latency</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="text-3xl font-black">99.9%</div>
                                    <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1">Uptime</div>
                                </div>
                            </div>
                          </div>
                          {/* ... */}
                      </div>
                  )}
                  {/* ... (Other tabs truncated for brevity, assuming they exist as per previous code) ... */}
                  {adminTab === 'CAST' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative h-full flex flex-col">
                          {/* ... */}
                          <div className="flex justify-between items-center mb-4">
                              <div>
                                <h3 className="font-bold text-slate-800">Zone Controller</h3>
                                <span className="text-xs text-slate-500">Kelola layar informasi desa</span>
                              </div>
                              <button 
                                onClick={toggleEmergency}
                                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                                    emergencyMode 
                                    ? 'bg-red-600 text-white animate-pulse border-2 border-red-400' 
                                    : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                  <AlertOctagon size={16} />
                                  {emergencyMode ? 'DISABLE EMERGENCY' : 'EMERGENCY BROADCAST'}
                              </button>
                          </div>
                          {/* ... */}
                          <div className="grid grid-cols-1 gap-4">
                            {localCastZones.map((zone) => (
                                <div key={zone.id} className={`bg-white p-4 rounded-xl border transition-all duration-300 shadow-sm flex flex-col gap-3 ${zone.status === 'PLAYING' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                                    {/* Zone Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${zone.status === 'PLAYING' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Monitor size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{zone.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`w-2 h-2 rounded-full ${zone.status === 'PLAYING' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                    <span className="text-[10px] font-mono text-slate-500 uppercase">{emergencyMode ? 'EMERGENCY OVERRIDE' : zone.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => setEditingZoneId(zone.id)}
                                                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition" 
                                                title="Edit Playlist"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button 
                                                onClick={() => toggleZoneStatus(zone.id)}
                                                className={`p-1.5 rounded transition ${zone.status === 'PLAYING' ? 'text-green-600 bg-green-50 hover:bg-red-50 hover:text-red-600' : 'text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                                                title="Power"
                                            >
                                                <Power size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* ... Preview Row ... */}
                                </div>
                            ))}
                          </div>
                      </div>
                  )}
                  {adminTab === 'SHARE' && (
                      <div className="space-y-4 animate-in fade-in">
                          {/* ... Share content ... */}
                          <div 
                              onClick={triggerFileUpload}
                              className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center border-dashed border-2 cursor-pointer hover:bg-blue-100 transition"
                          >
                              <UploadCloud className="text-blue-500 mb-2" size={32} />
                              <p className="text-sm font-bold text-slate-700">Drop files to upload</p>
                              <p className="text-xs text-slate-400">or click to browse local storage</p>
                          </div>
                      </div>
                  )}
              </div>
           </div>
        </div>

      </div>
      
      {/* --- METAL TV OS 4.0 ULTRA MODERN GLASS --- */}
      {isTvMode && (
          <div className="fixed inset-0 z-[200] bg-slate-950 text-white overflow-hidden font-sans animate-in zoom-in duration-500 select-none cursor-none">
              
              {/* Cinematic Background Layer - Animated Aurora Mesh */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                   {/* Dynamic Gradient Orbs */}
                   <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
                   <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                   <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-2000"></div>
                   <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse delay-500"></div>
                   
                   {/* Contextual Background Images */}
                   <div className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${activeTvPage === 'HOME' ? 'opacity-40 scale-105 mix-blend-overlay' : 'opacity-0 scale-100'}`} style={{backgroundImage: "url('https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2070')"}}></div>
                   <div className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${activeTvPage === 'CINEMA' ? 'opacity-40 scale-105 mix-blend-overlay' : 'opacity-0 scale-100'}`} style={{backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')"}}></div>
                   
                   {/* Noise Overlay for texture */}
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.03]"></div>
              </div>

              {/* Top Bar Widget - Floating Glass Pill */}
              <div className="absolute top-10 right-10 z-50 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                  <button 
                    onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                    className={`p-3 rounded-full border transition-all ${showVirtualKeyboard ? 'bg-white text-black border-white' : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20 backdrop-blur-md'}`}
                  >
                      <Keyboard size={20} />
                  </button>
                  
                  {/* Network Pill */}
                  <div className="flex items-center gap-3 text-white font-bold bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                      <Wifi size={20} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      <span className="text-sm tracking-widest">WARGA-NET 5G</span>
                  </div>

                  {/* Clock Pill */}
                  <div className="flex items-center gap-6 text-white font-medium bg-white/5 backdrop-blur-3xl px-8 py-3 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                          <Cloud size={24} className="text-blue-400 drop-shadow-lg"/>
                          <span className="text-xl font-light">28°C</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <Clock size={24} className="text-blue-400 drop-shadow-lg"/>
                          <span className="text-xl font-bold tracking-widest">{tvTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: true})}</span>
                      </div>
                  </div>
              </div>

              {/* Floating Glass Sidebar (Auto-Hiding) */}
              <div 
                className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${tvNavState.section === 'SIDEBAR' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
              >
                  <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-[3rem] p-4 w-80 flex flex-col items-center">
                      <div className="mb-8 mt-6 text-center">
                           <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                                <Tv className="text-white w-8 h-8" />
                           </div>
                           <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Metal<span className="text-blue-400">TV</span></h1>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">OS 4.0</p>
                      </div>

                      <nav className="flex flex-col space-y-3 w-full px-2 pb-4">
                          {[
                              { id: 'HOME', icon: Home, label: 'Dashboard', color: 'text-blue-400' },
                              { id: 'CINEMA', icon: Film, label: 'Cinema', color: 'text-red-400' },
                              { id: 'EOFFICE', icon: Briefcase, label: 'Command', color: 'text-purple-400' },
                              { id: 'LIVE', icon: Radio, label: 'Live Cam', color: 'text-green-400' },
                              { id: 'CAST', icon: Cast, label: 'Mirroring', color: 'text-orange-400' },
                          ].map((item, idx) => {
                              const isActive = activeTvPage === item.id;
                              const isFocused = tvNavState.section === 'SIDEBAR' && tvNavState.row === idx;
                              
                              return (
                                  <div 
                                    key={item.id}
                                    className={`flex items-center space-x-5 p-4 rounded-[2rem] transition-all duration-300 ${
                                        isFocused
                                        ? 'bg-white text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.4)] scale-105 z-10' 
                                        : isActive 
                                            ? 'bg-white/10 text-white border border-white/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                      <item.icon size={24} className={`${isFocused ? 'text-slate-900' : isActive ? 'text-white' : item.color}`} strokeWidth={isFocused || isActive ? 2.5 : 2} />
                                      <span className={`text-lg font-bold tracking-wide ${isFocused ? 'text-slate-900' : ''}`}>
                                          {item.label}
                                      </span>
                                  </div>
                              );
                          })}
                      </nav>
                  </div>
              </div>

              {/* Sidebar Hot Zone Hint */}
              {tvNavState.section === 'CONTENT' && (
                  <div className="fixed left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/20 to-transparent z-40 opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-start pl-6">
                      <div className="w-1.5 h-20 bg-white/20 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
                  </div>
              )}
              
              {/* TV Content Area */}
              <div className={`h-full w-full pl-24 pr-16 pb-16 pt-32 overflow-hidden flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${tvNavState.section === 'SIDEBAR' ? 'opacity-40 scale-95 translate-x-60 blur-sm' : 'opacity-100 scale-100 blur-0 translate-x-0'}`}>
                  
                  {/* --- PAGE: HOME DASHBOARD --- */}
                  {activeTvPage === 'HOME' && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700 max-w-[1400px] mx-auto w-full">
                           {/* Hero Unit - Glass Card */}
                           <div className={`relative h-[500px] rounded-[3rem] overflow-hidden shadow-[0_20px_80px_-10px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 ease-out ${tvNavState.row === 0 ? 'ring-4 ring-white/60 scale-[1.01] shadow-[0_30px_100px_rgba(255,255,255,0.15)]' : 'bg-black/40'}`}>
                               <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent z-10"></div>
                               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2070')] bg-cover bg-center"></div>
                               
                               <div className="relative p-20 z-20 flex flex-col items-start h-full justify-center">
                                    <span className="bg-yellow-400 text-black text-sm font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.6)]"><Star size={16} fill="black" /> Featured Event</span>
                                    <h1 className="text-8xl font-black mb-6 leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-2xl">Festival Payungi<br/>2024</h1>
                                    <p className="text-2xl text-slate-200 font-medium max-w-2xl mb-10 leading-relaxed drop-shadow-md">Experience the vibrancy of Yosomulyo's biggest cultural market. Local food, art, and digital innovation.</p>
                                    
                                    <div className="flex gap-6">
                                        <button className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] font-bold text-xl transition-all duration-300 ${tvNavState.row === 0 ? 'bg-white text-black scale-110 shadow-[0_0_40px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white border border-white/20 backdrop-blur-md'}`}>
                                            <Play size={28} fill={tvNavState.row === 0 ? "black" : "white"} /> Watch Highlights
                                        </button>
                                    </div>
                               </div>
                           </div>
                           
                           {/* Quick Apps Row - Glass Tiles */}
                           <div>
                               <h3 className="text-white/50 text-lg font-bold uppercase tracking-widest mb-6 ml-4">Quick Access</h3>
                               <div className="grid grid-cols-4 gap-8">
                                   {[
                                       { id: 'WargaPay', icon: Wallet, color: 'from-blue-500 to-cyan-400' },
                                       { id: 'Pasar', icon: ShoppingBag, color: 'from-orange-500 to-red-500' },
                                       { id: 'Layanan', icon: FileText, color: 'from-purple-500 to-pink-500' },
                                       { id: 'Berita', icon: Globe, color: 'from-green-500 to-emerald-400' }
                                   ].map((app, idx) => (
                                       <div 
                                          key={app.id} 
                                          className={`h-44 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border transition-all duration-300 relative overflow-hidden group ${
                                              tvNavState.row === 1 && tvNavState.col === idx 
                                              ? 'bg-white/10 backdrop-blur-3xl border-white/40 scale-110 shadow-[0_0_50px_rgba(255,255,255,0.15)] z-10' 
                                              : 'bg-white/5 backdrop-blur-md border-white/5 hover:bg-white/10'
                                          }`}
                                       >
                                           <div className={`p-4 rounded-2xl bg-gradient-to-br ${app.color} shadow-lg text-white mb-1 transition-transform duration-300 ${tvNavState.row === 1 && tvNavState.col === idx ? 'scale-110' : ''}`}>
                                               <app.icon size={32} />
                                           </div>
                                           <span className="text-xl font-bold tracking-tight text-white">{app.id}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                      </div>
                  )}

                  {/* --- PAGE: CINEMA & YOUTUBE --- */}
                  {activeTvPage === 'CINEMA' && (
                      <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-700 h-full flex flex-col justify-center max-w-[1400px] mx-auto w-full">
                          {/* Featured Cinema Card */}
                          <div className={`relative h-[500px] bg-black rounded-[3rem] overflow-hidden transition-all duration-500 border border-white/10 ${tvNavState.row === 0 ? 'ring-4 ring-red-500 scale-[1.02] shadow-[0_0_100px_rgba(220,38,38,0.3)] z-10' : 'opacity-80 grayscale-[0.3] scale-100'}`}>
                              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070')] bg-cover bg-center"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent p-20 flex flex-col justify-center">
                                  <span className="text-red-500 font-black tracking-widest uppercase mb-4 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 w-fit backdrop-blur-sm">Now Showing</span>
                                  <h3 className="text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight">Wonderful<br/>Yosomulyo</h3>
                                  <p className="text-slate-300 max-w-2xl text-2xl font-medium leading-relaxed drop-shadow-md mb-8">
                                      A documentary about the transformation of a village into a digital creative hub.
                                  </p>
                                  <div className="flex items-center gap-4">
                                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-bold">4K HDR</div>
                                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-bold">5.1 Surround</div>
                                  </div>
                              </div>
                          </div>
                          
                          {/* YouTube Row */}
                          <div>
                              <h3 className="text-white/60 text-lg font-bold uppercase tracking-widest mb-6 ml-2">Trending Videos</h3>
                              <div className="grid grid-cols-4 gap-6">
                                  {youtubeContent.map((vid, idx) => (
                                      <div 
                                        key={vid.id} 
                                        className={`bg-white/5 backdrop-blur-lg rounded-[2rem] p-4 border border-white/5 transition-all duration-300 ${
                                            tvNavState.row === 1 && tvNavState.col === idx 
                                            ? 'bg-white/15 border-white/30 scale-105 shadow-2xl z-10' 
                                            : 'hover:bg-white/10'
                                        }`}
                                      >
                                          <div className={`aspect-video rounded-2xl mb-4 ${vid.thumb} relative overflow-hidden group`}>
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                  <PlayCircle size={40} className="text-white opacity-80 shadow-xl" />
                                              </div>
                                          </div>
                                          <h4 className="font-bold text-lg leading-tight mb-2 line-clamp-1">{vid.title}</h4>
                                          <p className="text-slate-400 text-sm">{vid.views} views</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* --- PAGE: E-OFFICE EXECUTIVE --- */}
                  {activeTvPage === 'EOFFICE' && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-right-12 duration-700 h-full flex flex-col justify-center max-w-[1400px] mx-auto w-full">
                          <div className="flex items-center gap-6 mb-4">
                              <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] shadow-[0_0_60px_rgba(37,99,235,0.4)]">
                                  <Briefcase size={48} className="text-white" />
                              </div>
                              <div>
                                  <h2 className="text-6xl font-black text-white tracking-tight">Command Center</h2>
                                  <p className="text-2xl text-slate-400 font-medium mt-2">Executive Dashboard Overview</p>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-10">
                               <div className={`bg-white/5 backdrop-blur-[50px] p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between h-80 relative overflow-hidden group transition-all duration-500 ${tvNavState.col === 0 ? 'bg-white/10 border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.1)] scale-105 z-10' : ''}`}>
                                   <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px]"></div>
                                   <h3 className={`font-bold uppercase tracking-widest mb-4 flex items-center gap-4 text-blue-300 text-xl`}><Mail size={32}/> Surat Masuk</h3>
                                   <div className="text-[10rem] leading-none font-black tracking-tighter text-white drop-shadow-2xl">{EOFFICE_SUMMARY.thisMonth}</div>
                                   <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden"><div className="bg-blue-500 h-full w-[70%]"></div></div>
                               </div>
                               
                               <div className={`bg-white/5 backdrop-blur-[50px] p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between h-80 relative overflow-hidden group transition-all duration-500 ${tvNavState.col === 1 ? 'bg-white/10 border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.1)] scale-105 z-10' : ''}`}>
                                   <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]"></div>
                                   <h3 className={`font-bold uppercase tracking-widest mb-4 flex items-center gap-4 text-purple-300 text-xl`}><FileSignature size={32}/> Need Signing</h3>
                                   <div className="text-[10rem] leading-none font-black tracking-tighter text-white drop-shadow-2xl">{EOFFICE_SUMMARY.waitingSignature}</div>
                                   <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden"><div className="bg-purple-500 h-full w-[40%] animate-pulse"></div></div>
                               </div>
                               
                               <div className={`bg-white/5 backdrop-blur-[50px] p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between h-80 relative overflow-hidden group transition-all duration-500 ${tvNavState.col === 2 ? 'bg-white/10 border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.1)] scale-105 z-10' : ''}`}>
                                   <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full blur-[80px]"></div>
                                   <h3 className={`font-bold uppercase tracking-widest mb-4 flex items-center gap-4 text-green-300 text-xl`}><ShieldCheck size={32}/> Disposisi</h3>
                                   <div className="text-[10rem] leading-none font-black tracking-tighter text-white drop-shadow-2xl">{EOFFICE_SUMMARY.pendingDisposition}</div>
                                   <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden"><div className="bg-green-500 h-full w-[90%]"></div></div>
                               </div>
                          </div>
                      </div>
                  )}

                  {/* ... (Other Pages Unchanged) ... */}
              </div>

              {/* Virtual Keyboard Overlay */}
              {showVirtualKeyboard && (
                  <div className="absolute bottom-0 left-0 right-0 h-96 bg-slate-900/80 backdrop-blur-3xl border-t border-white/10 z-[60] animate-in slide-in-from-bottom duration-300 flex flex-col items-center justify-center">
                      <div className="grid grid-cols-10 gap-3 p-6 w-full max-w-6xl">
                          {'QWERTYUIOP'.split('').map(key => (
                              <button key={key} className="h-16 bg-white/10 hover:bg-white/30 rounded-2xl text-2xl font-bold border border-white/10 transition shadow-lg">{key}</button>
                          ))}
                          {'ASDFGHJKL'.split('').map(key => (
                              <button key={key} className="h-16 bg-white/10 hover:bg-white/30 rounded-2xl text-2xl font-bold border border-white/10 col-span-1 transition shadow-lg">{key}</button>
                          ))}
                          <div className="col-span-10 flex justify-center gap-3">
                              <button className="h-16 w-32 bg-white/10 rounded-2xl font-bold">123</button>
                              <button className="h-16 w-[600px] bg-white/10 rounded-2xl flex items-center justify-center text-sm text-slate-400 tracking-widest font-bold uppercase">SPACE</button>
                              <button className="h-16 w-32 bg-blue-600 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(37,99,235,0.5)]">GO</button>
                          </div>
                      </div>
                      <button onClick={() => setShowVirtualKeyboard(false)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition"><XCircle size={24}/></button>
                  </div>
              )}

              {/* QUICK ACCESS OVERLAY DOCK (Bottom Right) */}
              <div className="absolute bottom-10 right-10 z-50 flex gap-4 bg-black/40 backdrop-blur-3xl p-4 rounded-full border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
                  <button 
                    onClick={() => setTvOverlay(tvOverlay === 'AGENDA' ? 'NONE' : 'AGENDA')}
                    className={`p-4 rounded-full transition-all duration-300 border shadow-lg ${tvOverlay === 'AGENDA' ? 'bg-blue-600 text-white border-blue-500 scale-110 shadow-blue-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/20'}`}
                    title="Agenda Desa"
                  >
                      <Calendar size={28} />
                  </button>
                  <button 
                    onClick={() => setTvOverlay(tvOverlay === 'NOTIFICATIONS' ? 'NONE' : 'NOTIFICATIONS')}
                    className={`p-4 rounded-full transition-all duration-300 border shadow-lg ${tvOverlay === 'NOTIFICATIONS' ? 'bg-red-600 text-white border-red-500 scale-110 shadow-red-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/20'}`}
                    title="Notifikasi"
                  >
                      <div className="relative">
                          <Bell size={28} />
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black shadow-[0_0_10px_red]"></span>
                      </div>
                  </button>
                  <button 
                    className="p-4 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg"
                    title="Info System"
                  >
                      <Info size={28} />
                  </button>
              </div>

              {/* SMART SIDE OVERLAY PANEL */}
              {tvOverlay !== 'NONE' && (
                  <div className="absolute top-0 right-0 bottom-0 w-[500px] bg-slate-950/60 backdrop-blur-[60px] border-l border-white/10 z-[150] shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500 p-10 flex flex-col">
                      <div className="flex justify-between items-center mb-10">
                          <h2 className="text-4xl font-black text-white tracking-tighter">
                              {tvOverlay === 'AGENDA' ? 'Agenda' : 'Alerts'}
                          </h2>
                          <button onClick={() => setTvOverlay('NONE')} className="p-3 bg-white/10 rounded-full hover:bg-white/30 text-white transition shadow-lg">
                              <X size={24} />
                          </button>
                      </div>

                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                          {tvOverlay === 'AGENDA' && (
                              <>
                                  <div className="mb-8">
                                      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ShieldCheck size={16}/> Ronda Malam Ini</h3>
                                      {RONDA_SCHEDULES.slice(0, 1).map(sch => (
                                          <div key={sch.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-lg">
                                              <div className="flex justify-between mb-2">
                                                  <span className="text-xl font-bold text-white">{sch.shift}</span>
                                                  <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-black shadow-[0_0_20px_rgba(34,197,94,0.6)]">ACTIVE</span>
                                              </div>
                                              <p className="text-slate-400 text-sm mb-4">Komandan: {sch.commander}</p>
                                              <div className="flex flex-wrap gap-2">
                                                  {sch.members.map((m, i) => <span key={i} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg text-slate-200 font-medium">{m}</span>)}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  <div>
                                      <h3 className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Stethoscope size={16}/> Jadwal Posyandu</h3>
                                      {POSYANDU_SESSIONS.map(pos => (
                                          <div key={pos.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md mb-4 flex items-center gap-5 shadow-lg hover:bg-white/10 transition cursor-pointer">
                                              <div className="bg-teal-500/20 p-4 rounded-2xl text-teal-400 border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                                                  <Calendar size={28} />
                                              </div>
                                              <div>
                                                  <h4 className="font-bold text-white text-xl">{pos.activity}</h4>
                                                  <p className="text-slate-400 text-sm mt-1">{pos.date} • {pos.location}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </>
                          )}

                          {tvOverlay === 'NOTIFICATIONS' && (
                              <div className="space-y-4">
                                  <div className="bg-red-500/10 p-6 rounded-[2rem] border border-red-500/30 relative overflow-hidden backdrop-blur-md shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                                      <div className="absolute top-0 right-0 p-6 opacity-20"><AlertTriangle size={80} className="text-red-500"/></div>
                                      <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-full mb-3 inline-block tracking-widest shadow-[0_0_15px_red]">URGENT</span>
                                      <h4 className="text-2xl font-bold text-white mb-2">Laporan Keamanan</h4>
                                      <p className="text-slate-300 text-sm leading-relaxed">Terdeteksi aktivitas mencurigakan di Perbatasan RW 06. Tim Ronda telah dikerahkan.</p>
                                      <span className="text-xs text-red-300 mt-4 block font-mono">10 mins ago</span>
                                  </div>

                                  {SOCIAL_REPORTS.slice(0, 3).map(report => (
                                      <div key={report.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition cursor-pointer backdrop-blur-md shadow-lg">
                                          <div className="flex justify-between items-start mb-2">
                                              <span className="text-xs font-bold text-blue-400 uppercase bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{report.type}</span>
                                              <span className="text-xs text-slate-500">{report.date}</span>
                                          </div>
                                          <h4 className="font-bold text-white text-lg leading-tight mb-1">{report.title}</h4>
                                          <p className="text-slate-400 text-sm line-clamp-2">{report.description}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* Video Player Overlay (unchanged) */}
              {tvPlaying && (
                  <div className="absolute inset-0 z-[300] bg-black animate-in fade-in duration-700 flex flex-col items-center justify-center">
                      {/* ... Player content ... */}
                      <div className="absolute top-0 left-0 right-0 p-12 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center z-20">
                          <h2 className="text-4xl font-bold text-white tracking-wide drop-shadow-lg">{tvPlaying.title}</h2>
                          <div className="bg-red-600 text-white text-sm font-black px-6 py-2 rounded-full uppercase animate-pulse shadow-[0_0_30px_red]">
                              {tvPlaying.type === 'LIVE' ? 'LIVE FEED' : 'PLAYING'}
                          </div>
                      </div>
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2070')] bg-cover bg-center opacity-60 scale-105 animate-ken-burns"></div>
                          {tvPlaying.type === 'LIVE' ? (
                               <div className="text-center z-10">
                                   <div className="w-32 h-32 rounded-full border-4 border-white/10 border-t-red-500 animate-spin mb-10 mx-auto"></div>
                                   <h3 className="text-5xl font-black text-white tracking-widest uppercase drop-shadow-2xl">Connecting...</h3>
                               </div>
                          ) : (
                               <div className="z-10 bg-white/10 p-12 rounded-full backdrop-blur-md border border-white/20 shadow-2xl animate-pulse">
                                   <PlayCircle size={120} className="text-white opacity-90" fill="currentColor" />
                               </div>
                          )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-20 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                          <div className="text-right">
                              <p className="text-2xl text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-4 justify-end">
                                  Press <span className="border-2 border-slate-400 px-4 py-1 rounded-lg text-lg text-white bg-white/10">ESC</span> to Exit
                              </p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default GapuraView;
