
import React, { useState, useEffect } from 'react';
import { Siren, Shield, Eye, Video, MapPin, Phone, Users, Calendar, AlertTriangle, CheckCircle, Clock, Volume2, Radio, QrCode, Battery, Plus, X, FileText, Send, BellRing, Search, ChevronRight } from 'lucide-react';
import { SECURITY_CAMERAS, RONDA_SCHEDULES, PATROL_LOGS, MOCK_USER } from '../constants';
import { CitizenProfile, RondaSchedule, PatrolLog, SecurityCamera } from '../types';
import { db, auth, collection, onSnapshot, query, addDoc, handleFirestoreError, OperationType, orderBy, Timestamp } from '../firebase';

const PATROL_LOCATIONS = ['Pos Induk', 'Portal Utara', 'Pasar Payungi', 'Perbatasan RW 06', 'Gudang Mocaf', 'Jalan Utama', 'Gang Kancil'];

interface PosKamlingViewProps {
  user?: CitizenProfile;
  onOpenScanner?: () => void;
  pendingCheckInLocation?: string | null;
}

const PosKamlingView: React.FC<PosKamlingViewProps> = ({ 
    user = MOCK_USER, 
    onOpenScanner,
    pendingCheckInLocation 
}) => {
  const [panicMode, setPanicMode] = useState(false);
  const [panicCountdown, setPanicCountdown] = useState(5);
  const [broadcastStatus, setBroadcastStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time data from Firestore
  const [logs, setLogs] = useState<PatrolLog[]>([]);
  const [schedules, setSchedules] = useState<RondaSchedule[]>([]);
  const [cameras, setCameras] = useState<SecurityCamera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Listen to Ronda Schedules
    const schedulesQuery = query(collection(db, 'ronda_schedules'));
    const unsubscribeSchedules = onSnapshot(schedulesQuery, (snapshot) => {
      const schedulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RondaSchedule));
      setSchedules(schedulesData.length > 0 ? schedulesData : RONDA_SCHEDULES);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'ronda_schedules'));

    // Listen to Security Cameras
    const camerasQuery = query(collection(db, 'security_cameras'));
    const unsubscribeCameras = onSnapshot(camerasQuery, (snapshot) => {
      const camerasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SecurityCamera));
      setCameras(camerasData.length > 0 ? camerasData : SECURITY_CAMERAS);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'security_cameras'));

    // Listen to Patrol Logs
    const logsQuery = query(collection(db, 'patrol_logs'), orderBy('date', 'desc'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PatrolLog));
      setLogs(logsData.length > 0 ? logsData : PATROL_LOGS);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'patrol_logs'));

    return () => {
      unsubscribeSchedules();
      unsubscribeCameras();
      unsubscribeLogs();
    };
  }, []);

  // Schedule Management State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
      date: '',
      shift: '21:00 - 04:00',
      commander: '',
      members: ''
  });

  // Check-In Simulation State
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInData, setCheckInData] = useState({
      location: PATROL_LOCATIONS[0],
      status: 'AMAN',
      note: ''
  });

  // Handle external check-in trigger
  useEffect(() => {
    if (pendingCheckInLocation) {
        setCheckInData(prev => ({ ...prev, location: pendingCheckInLocation }));
        setIsCheckInModalOpen(true);
    }
  }, [pendingCheckInLocation]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Panic Countdown & Broadcast Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    // Phase 1: Countdown
    if (panicMode && panicCountdown > 0) {
      timer = setTimeout(() => setPanicCountdown(prev => prev - 1), 1000);
    } 
    // Phase 2: Trigger Broadcast when Countdown hits 0
    else if (panicMode && panicCountdown === 0 && broadcastStatus === 'IDLE') {
        setBroadcastStatus('SENDING');
        // Simulate network delay for broadcasting
        setTimeout(async () => {
            try {
              await addDoc(collection(db, 'security_alerts'), {
                type: 'PANIC_BUTTON',
                location: 'User Location',
                time: new Date().toISOString(),
                severity: 'HIGH',
                status: 'ACTIVE',
                userId: user.id,
                userName: user.name
              });
              setBroadcastStatus('SENT');
            } catch (error) {
              console.error('Failed to trigger panic alert:', error);
              setBroadcastStatus('IDLE');
            }
        }, 3000);
    }
    
    return () => clearTimeout(timer);
  }, [panicMode, panicCountdown, broadcastStatus]);

  const handlePanicClick = () => {
      setPanicMode(true);
      setPanicCountdown(5);
      setBroadcastStatus('IDLE');
  };

  const cancelPanic = () => {
      setPanicMode(false);
      setPanicCountdown(5);
      setBroadcastStatus('IDLE');
  };

  const handleCheckIn = () => {
      if (onOpenScanner) {
          onOpenScanner();
      }
  };

  const submitCheckIn = async () => {
      // 3. Create Log Entry
      const logEntry: Omit<PatrolLog, 'id'> = {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          officer: user.name,
          location: checkInData.location,
          status: checkInData.status as 'AMAN' | 'ENCURIGAKAN' | 'INSIDEN',
          note: checkInData.note || 'Check-in rutin via aplikasi.'
      };

      try {
        await addDoc(collection(db, 'patrol_logs'), logEntry);
        setIsCheckInModalOpen(false);
        // Reset form
        setCheckInData({
            location: PATROL_LOCATIONS[0],
            status: 'AMAN',
            note: ''
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'patrol_logs');
      }
  };

  const handleAddSchedule = async () => {
      if (!newSchedule.date || !newSchedule.commander) return;
      
      const scheduleEntry: Omit<RondaSchedule, 'id'> = {
          date: newSchedule.date,
          shift: newSchedule.shift,
          members: newSchedule.members.split(',').map(m => m.trim()).filter(m => m !== ''),
          commander: newSchedule.commander,
          status: 'UPCOMING'
      };

      try {
        await addDoc(collection(db, 'ronda_schedules'), scheduleEntry);
        setIsScheduleModalOpen(false);
        setNewSchedule({ date: '', shift: '21:00 - 04:00', commander: '', members: '' });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'ronda_schedules');
      }
  };

  const getStatusColor = (status: string) => {
      if (status === 'AMAN') return 'text-green-400 bg-green-500/10 border-green-500/30';
      if (status === 'INSIDEN') return 'text-red-400 bg-red-500/10 border-red-500/30';
      return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  };

  const formatDateHeader = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Hari Ini';
      if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';
      return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  // Logic: Filter for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= sevenDaysAgo;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
      const date = log.date;
      if (!groups[date]) {
          groups[date] = [];
      }
      groups[date].push(log);
      return groups;
  }, {} as Record<string, PatrolLog[]>);

   return (
    <div className="space-y-6 relative pb-20">
       
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between h-48 group transition-all hover:bg-white/15">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 text-green-400">
                    <Shield size={180} />
                </div>
                <div className="flex justify-between items-start z-10">
                    <div>
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Status Keamanan</h3>
                        <div className="text-4xl font-black mt-2 text-green-400 flex items-center gap-3 drop-shadow-lg">
                             <CheckCircle size={32} /> KONDUSIF
                        </div>
                    </div>
                    <div className="animate-pulse">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]"></div>
                    </div>
                </div>
                <div className="z-10 text-xs text-slate-300 border-t border-white/10 pt-4 mt-2 flex justify-between items-center">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Pos Induk: Online</span>
                    <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
                </div>
            </div>

            <div 
                onClick={handleCheckIn}
                className="bg-gradient-to-br from-blue-600/80 to-indigo-700/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/20 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden text-white" 
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 transition group-hover:scale-110 blur-2xl"></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className="text-xs font-bold text-blue-200 uppercase tracking-[0.2em]">Patroli Digital</h3>
                        <p className="text-sm text-white/80 mt-1">Scan QR di titik pantau</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg group-hover:rotate-12 transition">
                        <QrCode size={28} />
                    </div>
                </div>
                <button className="w-full bg-white text-blue-700 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-blue-50 transition shadow-xl relative z-10">
                    <MapPin size={18} /> Check-In Lokasi
                </button>
            </div>
            
            {/* PANIC BUTTON */}
            <div className="relative h-48">
                <button 
                    onClick={handlePanicClick}
                    className="w-full h-full rounded-[2rem] bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_20px_50px_-12px_rgba(220,38,38,0.5)] border border-red-400/50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden ring-4 ring-red-500/20"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-red-400/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                    <div className="p-4 bg-red-500 rounded-full shadow-lg group-hover:scale-110 transition">
                        <Siren size={40} className="animate-[wiggle_1s_ease-in-out_infinite]" />
                    </div>
                    <div className="text-center z-10">
                        <h3 className="text-xl font-black uppercase tracking-widest">Kentongan Digital</h3>
                        <p className="text-[10px] text-red-200 font-bold uppercase bg-red-900/50 px-3 py-1 rounded-full border border-red-500/30 mt-1">Darurat Siskamling</p>
                    </div>
                </button>
            </div>
       </div>

       {/* Panic Modal Overlay */}
       {panicMode && (
           <div className="fixed inset-0 z-[100] bg-red-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
               {panicCountdown > 0 ? (
                    // COUNTDOWN PHASE
                    <div className="text-center max-w-md w-full p-8 animate-in zoom-in duration-300">
                        <div className="w-48 h-48 bg-white rounded-full mx-auto mb-10 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.5)] border-8 border-red-200 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
                            <span className="text-8xl font-black text-red-600 font-mono">{panicCountdown}</span>
                        </div>
                        <h2 className="text-5xl font-black uppercase mb-4 tracking-tight">Peringatan Bahaya!</h2>
                        <p className="text-xl text-red-200 mb-10 font-medium">Sinyal darurat akan dikirim ke seluruh warga.</p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={cancelPanic}
                                className="w-full bg-white text-red-600 py-5 rounded-2xl font-black text-2xl shadow-2xl hover:bg-red-50 transition transform hover:scale-105"
                            >
                                BATALKAN
                            </button>
                            <p className="text-sm opacity-60">Tekan batal jika tidak sengaja.</p>
                        </div>
                    </div>
               ) : (
                    // ACTIVE / BROADCAST PHASE
                    <div className="absolute inset-0 bg-gradient-to-b from-red-800 to-red-950 flex items-center justify-center">
                        <div className="text-center w-full max-w-lg p-6 relative">
                            {/* Pulse Rings */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-red-500/30 rounded-full animate-ping"></div>
                            
                            {/* Visual Status */}
                            {broadcastStatus === 'SENDING' && (
                                <div className="mb-10 relative z-10">
                                    <div className="w-40 h-40 bg-red-700 rounded-full mx-auto flex items-center justify-center relative shadow-[0_0_50px_#ef4444]">
                                        <Radio size={64} className="text-white animate-pulse" />
                                    </div>
                                    <h3 className="text-3xl font-black mt-8 animate-pulse tracking-widest">BROADCASTING...</h3>
                                    <p className="text-red-200 mt-2 font-mono">Connecting to MetalGate Mesh...</p>
                                </div>
                            )}

                            {broadcastStatus === 'SENT' && (
                                <div className="mb-10 animate-in zoom-in duration-300 relative z-10">
                                     <div className="w-40 h-40 bg-white rounded-full mx-auto flex items-center justify-center shadow-[0_0_60px_white] mb-8">
                                        <BellRing size={64} className="text-red-600 animate-[wiggle_1s_ease-in-out_infinite]" />
                                    </div>
                                    <h3 className="text-4xl font-black uppercase tracking-tight">ALERT SENT!</h3>
                                    <p className="text-white/90 mt-4 text-xl font-medium">Semua warga telah menerima peringatan darurat.</p>
                                </div>
                            )}

                            <button 
                                onClick={cancelPanic} 
                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-red-600 transition shadow-2xl relative z-20"
                            >
                                Matikan Alarm & Reset
                            </button>
                        </div>
                    </div>
               )}
           </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* LEFT COL: CCTV & Schedule */}
           <div className="lg:col-span-2 space-y-6">
               
               {/* CCTV Grid */}
               <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/10 shadow-xl">
                   <div className="flex justify-between items-center mb-6 px-2">
                       <h3 className="text-white font-bold flex items-center gap-3 text-lg">
                           <Video size={20} className="text-blue-400" /> Live Monitoring
                       </h3>
                       <span className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-black animate-pulse tracking-wider shadow-[0_0_15px_red]">LIVE REC</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       {SECURITY_CAMERAS.map((cam) => (
                           <div key={cam.id} className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 group shadow-lg hover:shadow-blue-900/20 transition">
                               {/* Mock Video Feed Effect */}
                               <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                   <div className="text-slate-500 text-xs flex flex-col items-center">
                                       <Eye size={32} className="mb-3 opacity-30" />
                                       <span className="font-mono">Connecting to {cam.name}...</span>
                                   </div>
                               </div>
                               {/* Mock Overlay UI */}
                               <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/90 via-transparent to-black/50 opacity-90">
                                   <div className="flex justify-between items-start">
                                       <span className="text-[10px] text-white font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10">{cam.location}</span>
                                       <div className={`w-2.5 h-2.5 rounded-full ${cam.status === 'ONLINE' || cam.status === 'RECORDING' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                                   </div>
                                   <div className="flex justify-between items-end">
                                       <span className="text-[10px] text-slate-300 font-mono">{currentTime.toLocaleTimeString()}</span>
                                       <span className="text-[10px] text-slate-300 font-mono">CAM-{cam.id.slice(-2)}</span>
                                   </div>
                               </div>
                               {/* Scanning Line Animation */}
                               {cam.status !== 'OFFLINE' && (
                                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent h-[20%] w-full animate-[scan_3s_linear_infinite] pointer-events-none border-t border-blue-400/30"></div>
                               )}
                           </div>
                       ))}
                   </div>
                   <style>{`
                        @keyframes scan {
                            0% { top: -20%; }
                            100% { top: 120%; }
                        }
                   `}</style>
               </div>

               {/* Shift Schedule */}
               <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                           <Calendar size={20} className="text-blue-600" /> Jadwal Ronda
                       </h3>
                       <button 
                           onClick={() => setIsScheduleModalOpen(true)} 
                           className="text-xs bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 flex items-center gap-1 border border-blue-200 transition"
                       >
                           <Plus size={14} /> Buat Jadwal
                       </button>
                   </div>
                   
                   <div className="space-y-4">
                       {schedules.map((schedule) => (
                           <div key={schedule.id} className={`p-5 rounded-2xl border transition-all ${schedule.status === 'ACTIVE' ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white/50 border-slate-200 hover:border-blue-200'}`}>
                               <div className="flex justify-between mb-3">
                                   <div>
                                       <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${schedule.status === 'ACTIVE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-600'}`}>
                                           {schedule.date}
                                       </span>
                                   </div>
                                   <div className="flex items-center text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100">
                                       <Clock size={14} className="mr-1.5 text-blue-500" /> {schedule.shift}
                                   </div>
                               </div>
                               <div className="mb-4">
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Komandan Regu</p>
                                   <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                       <Shield size={14} className="text-orange-500" /> {schedule.commander}
                                   </p>
                               </div>
                               <div>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Anggota ({schedule.members.length})</p>
                                   <div className="flex flex-wrap gap-2">
                                       {schedule.members.map((member, i) => (
                                           <span key={i} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium shadow-sm">
                                               {member}
                                           </span>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* RIGHT COL: Logs & Emergency */}
           <div className="space-y-6">
               
               {/* Quick Emergency Contacts */}
               <div className="bg-red-50/90 backdrop-blur-md p-6 rounded-[2rem] border border-red-200 shadow-inner">
                   <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
                       <Phone size={20} /> Kontak Darurat
                   </h3>
                   <div className="space-y-3">
                       <button className="w-full bg-white p-4 rounded-2xl border border-red-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition group">
                           <div className="flex items-center gap-4">
                               <div className="p-2.5 bg-red-100 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition shadow-sm">
                                   <Siren size={20} />
                               </div>
                               <div className="text-left">
                                   <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition">Polsek Metro Timur</p>
                                   <p className="text-xs text-slate-500">110 / (0725) 41110</p>
                               </div>
                           </div>
                           <ChevronRight size={16} className="text-slate-300 group-hover:text-red-600" />
                       </button>
                       <button className="w-full bg-white/50 border border-red-200/50 p-3 rounded-xl text-red-600 font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-2">
                           Lihat Semua Kontak
                       </button>
                   </div>
               </div>
               
               {/* Patrol Logs Widget */}
               <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-sm flex flex-col h-[650px] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><FileText size={120}/></div>
                   
                   <div className="flex justify-between items-center mb-6 relative z-10">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                           <Radio size={20} className="text-orange-600" /> Log Monitor
                       </h3>
                       <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" title="Live Update"></div>
                           <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">7 Hari Terakhir</span>
                       </div>
                   </div>
                   
                   {/* TIMELINE LOGS */}
                   <div className="flex-1 overflow-y-auto pr-2 relative z-10">
                       {Object.keys(groupedLogs).length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center opacity-60">
                               <FileText size={48} className="mb-2"/>
                               <p className="text-sm">Belum ada log dalam 7 hari terakhir.</p>
                           </div>
                       ) : (
                           Object.entries(groupedLogs).map(([date, dayLogs]) => (
                               <div key={date} className="mb-6">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 sticky top-0 bg-white/95 backdrop-blur-md py-2 z-10 border-b border-slate-100 flex items-center gap-2">
                                       <Calendar size={12} /> {formatDateHeader(date)}
                                   </h4>
                                   <div className="space-y-0 relative ml-3 border-l-2 border-slate-200 pl-6 py-2">
                                       {(dayLogs as PatrolLog[]).map((log, idx) => (
                                           <div key={log.id} className="relative mb-6 last:mb-0 group">
                                               {/* Timeline Node */}
                                               <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 transition-all group-hover:scale-110 ${
                                                   log.status === 'AMAN' ? 'bg-green-500' : log.status === 'INSIDEN' ? 'bg-red-500' : 'bg-orange-500'
                                               }`}></div>
                                               
                                               <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition group-hover:-translate-y-0.5">
                                                   <div className="flex justify-between items-start mb-2">
                                                       <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 rounded">{log.time}</span>
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(log.status)}`}>
                                                                {log.status}
                                                            </span>
                                                       </div>
                                                   </div>
                                                   <p className="text-sm font-bold text-slate-800 mb-1">{log.location}</p>
                                                   <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/50 italic">
                                                       "{log.note}"
                                                   </p>
                                                   <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-50">
                                                       <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                                           {log.officer.charAt(0)}
                                                       </div>
                                                       <p className="text-[10px] text-slate-400 font-medium">
                                                           Officer: <span className="text-slate-600">{log.officer}</span>
                                                       </p>
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           ))
                       )}
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-200/50 relative z-10">
                       <div className="flex gap-2">
                           <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 transition shadow-inner">
                                <Volume2 size={16} className="text-slate-400" />
                                <input 
                                        type="text" 
                                        placeholder="Lapor situasi cepat..." 
                                        className="bg-transparent text-sm outline-none w-full placeholder-slate-400"
                                />
                           </div>
                           <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95">
                               <Send size={20} />
                           </button>
                       </div>
                   </div>
               </div>

           </div>
       </div>

       {/* Create Schedule Modal */}
       {isScheduleModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
                   <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                       <h3 className="font-bold flex items-center gap-2 text-lg">
                           <Calendar size={20} /> Buat Jadwal Ronda
                       </h3>
                       <button onClick={() => setIsScheduleModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                           <X size={20} />
                       </button>
                   </div>
                   <div className="p-8 space-y-5">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal</label>
                           <input 
                               type="text" 
                               value={newSchedule.date}
                               onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                               placeholder="Contoh: Rabu Malam, 25 Okt"
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Shift Waktu</label>
                           <input 
                               type="text" 
                               value={newSchedule.shift}
                               onChange={(e) => setNewSchedule({...newSchedule, shift: e.target.value})}
                               placeholder="21:00 - 04:00"
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Komandan Regu</label>
                           <input 
                               type="text" 
                               value={newSchedule.commander}
                               onChange={(e) => setNewSchedule({...newSchedule, commander: e.target.value})}
                               placeholder="Nama Penanggung Jawab"
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Anggota (pisahkan koma)</label>
                           <textarea 
                               value={newSchedule.members}
                               onChange={(e) => setNewSchedule({...newSchedule, members: e.target.value})}
                               placeholder="Budi, Anto, Asep..."
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none h-24 resize-none focus:ring-2 focus:ring-blue-500 transition"
                           ></textarea>
                       </div>
                       <div className="pt-4">
                           <button 
                               onClick={handleAddSchedule}
                               disabled={!newSchedule.date || !newSchedule.commander}
                               className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                           >
                               Simpan Jadwal
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Check-In Form Modal */}
       {isCheckInModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden ring-1 ring-white/50">
                   <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                       <button 
                           onClick={() => setIsCheckInModalOpen(false)}
                           className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                       >
                           <X size={24} />
                       </button>
                       <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/40 rotate-3 border border-white/20">
                           <MapPin size={40} className="text-white" />
                       </div>
                       <h3 className="text-2xl font-black tracking-tight">Input Laporan</h3>
                       <p className="text-blue-200 text-sm font-medium mt-1">Konfirmasi hasil patroli</p>
                   </div>
                   
                   <div className="p-8 space-y-6">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Lokasi Terdeteksi</label>
                           <div className="relative">
                               <select 
                                   value={checkInData.location}
                                   onChange={(e) => setCheckInData({...checkInData, location: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                               >
                                   {PATROL_LOCATIONS.map(loc => (
                                       <option key={loc} value={loc}>{loc}</option>
                                   ))}
                               </select>
                               <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={16} />
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Status Keamanan</label>
                           <div className="grid grid-cols-3 gap-3">
                               {['AMAN', 'ENCURIGAKAN', 'INSIDEN'].map(status => (
                                   <button
                                       key={status}
                                       onClick={() => setCheckInData({...checkInData, status})}
                                       className={`py-3 rounded-xl text-[10px] font-bold border-2 transition active:scale-95 ${
                                           checkInData.status === status
                                           ? (status === 'AMAN' ? 'bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200' : status === 'INSIDEN' ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200' : 'bg-orange-50 border-orange-500 text-orange-700 ring-2 ring-orange-200')
                                           : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                       }`}
                                   >
                                       {status}
                                   </button>
                               ))}
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Catatan (Opsional)</label>
                           <div className="relative">
                               <FileText className="absolute top-4 left-4 text-slate-400" size={16} />
                               <textarea
                                   value={checkInData.note}
                                   onChange={(e) => setCheckInData({...checkInData, note: e.target.value})}
                                   placeholder="Contoh: Pintu gerbang terkunci..."
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm outline-none h-24 resize-none focus:ring-2 focus:ring-blue-500 transition"
                               ></textarea>
                           </div>
                       </div>

                       <button 
                           onClick={submitCheckIn}
                           className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/30 hover:bg-slate-800 active:scale-95 transition text-lg"
                       >
                           Kirim Laporan
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default PosKamlingView;
