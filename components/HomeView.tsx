
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Activity, ShieldCheck, Wallet, Facebook, Instagram, Youtube, MessageCircle, ArrowRight, Truck, Mail, FileSignature, Inbox, ShoppingBag, Utensils, Stethoscope, Zap, Trash2, MoreHorizontal, QrCode, ScanLine, Send, PlusCircle, Calendar, CloudSun, X, Camera, CheckCircle, RefreshCw, Building2, ThumbsUp, AlertCircle, FileText, MessageSquare, Wrench, Armchair, Car, BookOpen, Briefcase, GraduationCap, Siren, Percent, Leaf, Wifi, Phone, BellRing, Map as MapIcon, Package, Sparkles, Database, Battery, Plus, LayoutGrid, HardDrive, Contact } from 'lucide-react';
import { STUNTING_DATA, BUDGET_DATA, MOCK_USER, EOFFICE_SUMMARY, SOCIAL_REPORTS, MARKETPLACE_ITEMS, PARKING_ZONES, TEAM_TASKS, ASSETS } from '../constants';
import { CitizenProfile, ViewMode, TeamTask, Asset, BudgetLineItem } from '../types';
import GeospatialEngine from './GeospatialEngine';
import GlassCard from '../src/components/GlassCard';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

interface DashboardViewProps {
  user?: CitizenProfile;
  onViewChange?: (view: ViewMode) => void;
  onOpenAiAssistant?: () => void;
  isGlassHouseMode?: boolean;
}


const QuickActions: React.FC<{ onViewChange?: (view: ViewMode) => void }> = ({ onViewChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const actions = [
        { label: 'Bayar QRIS', icon: QrCode, color: 'from-cyan-500 to-blue-600', view: ViewMode.ECONOMY },
        { label: 'Lapor Warga', icon: MessageSquare, color: 'from-rose-500 to-pink-600', view: ViewMode.SOCIAL },
        { label: 'Kirim Pesan', icon: Send, color: 'from-indigo-500 to-purple-600', view: ViewMode.OFFICE_SUITE },
        { label: 'Panggil Anjelo', icon: Truck, color: 'from-emerald-500 to-teal-600', view: ViewMode.BERDAYA },
    ];

    return (
        <div className="fixed bottom-24 right-6 z-50 md:hidden">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[-1]"
                        />
                        <div className="absolute bottom-20 right-0 flex flex-col gap-4 items-end">
                            {actions.map((action, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
                                    onClick={() => {
                                        onViewChange?.(action.view);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-3 group"
                                >
                                    <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-2xl">
                                        {action.label}
                                    </span>
                                    <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-black/50 border border-white/20 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity" />
                                        <action.icon size={24} className="text-white relative z-10" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </>
                )}
            </AnimatePresence>
            
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 border border-white/20 relative overflow-hidden ${isOpen ? 'bg-rose-500 rotate-45' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'}`}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity" />
                {isOpen ? <X size={32} className="text-white relative z-10" /> : <Plus size={32} className="text-white relative z-10" />}
            </motion.button>
        </div>
    );
};

const HomeView: React.FC<DashboardViewProps> = ({ user = MOCK_USER, onViewChange, onOpenAiAssistant, isGlassHouseMode = false }) => {
  const isAdmin = user.role === 'Lurah / Admin';

  // Dashboard Data State
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetLineItem[]>([]);
  const [stuntingData, setStuntingData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [villageStats, setVillageStats] = useState({
    totalPenduduk: 4285,
    indeksDesa: 0.895,
    logistik: 12,
    peringatan: 1
  });
  const [eofficeSummary, setEofficeSummary] = useState(EOFFICE_SUMMARY);
  const [isSeeding, setIsSeeding] = useState(false);
  const [workspaceStatus, setWorkspaceStatus] = useState({
    gmail: 'Checking...',
    calendar: 'Checking...',
    drive: 'Checking...',
    contacts: 'Checking...'
  });

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Real-time Listeners
  useEffect(() => {
    // Only start listeners if user is authenticated
    if (!auth.currentUser) return;

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamTask));
      setTasks(data.length > 0 ? data : TEAM_TASKS);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'tasks'));

    const unsubAssets = onSnapshot(collection(db, 'assets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      setAssets(data.length > 0 ? data : ASSETS);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'assets'));

    const unsubBudget = onSnapshot(collection(db, 'budget_data'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetLineItem));
      setBudgetData(data.length > 0 ? data : BUDGET_DATA);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'budget_data'));

    const unsubStunting = onSnapshot(collection(db, 'stunting'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setStuntingData(data.length > 0 ? data : STUNTING_DATA);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'stunting'));

    const unsubActivities = onSnapshot(query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(10)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(data.length > 0 ? data : [
        { time: '10:45 AM', event: 'WargaPay Transaction', detail: 'Pembayaran Parkir RW 04', icon: 'Wallet', color: 'text-blue-400' },
        { time: '09:30 AM', event: 'System Alert', detail: 'Sensor Banjir Level 1 Aktif', icon: 'AlertCircle', color: 'text-red-400' },
        { time: '08:15 AM', event: 'Pasar Payungi', icon: 'ShoppingBag', detail: 'Stall #12 Dibuka', color: 'text-orange-400' },
        { time: '07:00 AM', event: 'Security Update', detail: 'Patroli Regu A Selesai', icon: 'ShieldCheck', color: 'text-emerald-400' },
        { time: 'Yesterday', event: 'New Report', detail: 'Lampu Jalan RW 02 Padam', icon: 'MessageSquare', color: 'text-purple-400' },
      ]);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'activities'));

    const unsubStats = onSnapshot(doc(db, 'stats', 'village_stats'), (doc) => {
      if (doc.exists()) setVillageStats(doc.data() as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'stats/village_stats'));

    const unsubEoffice = onSnapshot(doc(db, 'stats', 'eoffice'), (doc) => {
      if (doc.exists()) setEofficeSummary(doc.data() as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'stats/eoffice'));

    // Check Google Workspace Status
    const checkWorkspace = async () => {
        try {
            const endpoints = [
                { key: 'gmail', url: '/api/google/gmail' },
                { key: 'calendar', url: '/api/google/calendar' },
                { key: 'drive', url: '/api/google/drive' },
                { key: 'contacts', url: '/api/google/contacts' }
            ];

            const results = await Promise.all(endpoints.map(async (ep) => {
                try {
                    const res = await fetch(ep.url);
                    return { key: ep.key, status: res.ok ? 'Connected' : 'Error' };
                } catch {
                    return { key: ep.key, status: 'Offline' };
                }
            }));

            const newStatus = { ...workspaceStatus };
            results.forEach(r => {
                (newStatus as any)[r.key] = r.status;
            });
            setWorkspaceStatus(newStatus);
        } catch (error) {
            console.error('Workspace check error:', error);
        }
    };

    checkWorkspace();

    return () => {
      unsubTasks();
      unsubAssets();
      unsubBudget();
      unsubStunting();
      unsubActivities();
      unsubStats();
      unsubEoffice();
    };
  }, []);

  // Seed Initial Data
  const seedData = async () => {
    if (!isAdmin || isSeeding) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);

      // Seed Tasks
      TEAM_TASKS.forEach(task => {
        const ref = doc(collection(db, 'tasks'), task.id);
        batch.set(ref, task);
      });

      // Seed Assets
      ASSETS.forEach(asset => {
        const ref = doc(collection(db, 'assets'), asset.id);
        batch.set(ref, asset);
      });

      // Seed Budget
      BUDGET_DATA.forEach(item => {
        const ref = doc(collection(db, 'budget_data'), item.id);
        batch.set(ref, item);
      });

      // Seed Stunting
      STUNTING_DATA.forEach((item, idx) => {
        const ref = doc(collection(db, 'stunting'), `s${idx}`);
        batch.set(ref, item);
      });

      // Seed Activities
      const mockActivities = [
        { time: '10:45 AM', event: 'WargaPay Transaction', detail: 'Pembayaran Parkir RW 04', icon: 'Wallet', color: 'text-blue-400', createdAt: serverTimestamp() },
        { time: '09:30 AM', event: 'System Alert', detail: 'Sensor Banjir Level 1 Aktif', icon: 'AlertCircle', color: 'text-red-400', createdAt: serverTimestamp() },
        { time: '08:15 AM', event: 'Pasar Payungi', icon: 'ShoppingBag', detail: 'Stall #12 Dibuka', color: 'text-orange-400', createdAt: serverTimestamp() },
        { time: '07:00 AM', event: 'Security Update', detail: 'Patroli Regu A Selesai', icon: 'ShieldCheck', color: 'text-emerald-400', createdAt: serverTimestamp() },
        { time: 'Yesterday', event: 'New Report', detail: 'Lampu Jalan RW 02 Padam', icon: 'MessageSquare', color: 'text-purple-400', createdAt: serverTimestamp() },
      ];
      mockActivities.forEach((act, idx) => {
        const ref = doc(collection(db, 'activities'), `a${idx}`);
        batch.set(ref, act);
      });

      // Seed Stats
      batch.set(doc(db, 'stats', 'village_stats'), {
        totalPenduduk: 4285,
        indeksDesa: 0.895,
        logistik: 12,
        peringatan: 1
      });

      batch.set(doc(db, 'stats', 'eoffice'), EOFFICE_SUMMARY);

      await batch.commit();
      alert('Data seeded successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Failed to seed data. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isScannerOpen && !scanResult) {
        timer = setTimeout(() => {
            setScanResult("QRIS: Warung Bu Siti - Rp 25.000");
        }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isScannerOpen, scanResult]);

  const handleScanClick = () => {
      setIsScannerOpen(true);
      setScanResult(null);
  };

  const closeScanner = () => {
      setIsScannerOpen(false);
      setScanResult(null);
  };

  const berdayaMenu = [
      { label: 'Pesan Meja', icon: Armchair, color: 'from-blue-600 to-blue-400', view: ViewMode.SMART_HUB },
      { label: 'Tracker', icon: Activity, color: 'from-cyan-600 to-blue-500', view: ViewMode.TRACKER },
      { label: 'Tugas Tim', icon: CheckCircle, color: 'from-emerald-600 to-teal-500', view: ViewMode.TASKS },
      { label: 'Aset Desa', icon: Package, color: 'from-blue-600 to-indigo-500', view: ViewMode.ASSETS },
      { label: 'Belanja', icon: ShoppingBag, color: 'from-orange-500 to-amber-500', view: ViewMode.BERDAYA }, 
      { label: 'Anjelo', icon: Truck, color: 'from-green-600 to-emerald-500', view: ViewMode.BERDAYA }, 
      { label: 'Smart Hub', icon: LayoutGrid, color: 'from-indigo-500 to-violet-500', view: ViewMode.SMART_HUB },
      { label: 'Office Suite', icon: Briefcase, color: 'from-slate-700 to-slate-500', view: ViewMode.OFFICE_SUITE }, 
      { label: 'Pustaka', icon: BookOpen, color: 'from-violet-600 to-fuchsia-600', view: ViewMode.EDUCATION, noQuota: true },
      { label: 'Kursus', icon: GraduationCap, color: 'from-pink-600 to-rose-500', view: ViewMode.EDUCATION, noQuota: true }, 
      { label: 'Sehat', icon: Stethoscope, color: 'from-teal-500 to-cyan-500', view: ViewMode.HEALTH },
      { label: 'WargaNet', icon: Activity, color: 'from-cyan-600 to-blue-500', view: ViewMode.ENVIRONMENT },
      { label: 'Evaluasi', icon: ShieldCheck, color: 'from-cyan-600 to-blue-600', view: ViewMode.EVALUATION },
      { label: 'Lapor', icon: AlertTriangle, color: 'from-red-500 to-pink-600', view: ViewMode.SOCIAL },
  ];

  if (isGlassHouseMode) {
      // (Glass House Mode remains largely the same layout-wise, just applying class updates if needed)
      return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <GlassCard className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-blue-500/30">
                  <div className="relative z-10 text-white">
                      <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                          <Building2 className="text-cyan-400" size={32} /> Tata Kelola Rumah Kaca
                      </h2>
                      <p className="text-blue-200 max-w-2xl text-lg">
                          Transparansi total APBDes dan tata kelola pemerintahan.
                      </p>
                  </div>
              </GlassCard>
              {/* ... Content ... */}
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-32 md:pb-8 relative">
      <QuickActions onViewChange={onViewChange} />
      
      {/* MOBILE DASHBOARD */}
      <div className="md:hidden flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Top Status Bar - Ultra Tech Feel */}
          <div className="flex justify-between items-center px-6 pt-6">
              <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                  </div>
                  <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em]">System Online</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                    <Wifi size={10} className="text-cyan-400" />
                    <span className="text-[8px] font-black text-slate-400">5G</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                    <Battery size={10} className="text-emerald-400" />
                    <span className="text-[8px] font-black text-slate-400">98%</span>
                  </div>
              </div>
          </div>

          <div className="flex justify-between items-center px-6">
              <div className="flex items-center gap-4">
                  <div className="relative group">
                      <div className="absolute -inset-1.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-[1.5rem] blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
                      <img 
                          src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                          alt={user.name}
                          className="relative w-14 h-14 rounded-[1.25rem] border-2 border-white/20 object-cover shadow-2xl"
                          referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-950 rounded-full"></div>
                  </div>
                  <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5">Selamat Pagi,</p>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black text-white tracking-tight leading-none drop-shadow-lg">{user.name.split(' ')[0]}!</h1>
                        <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded-md text-[8px] font-black text-cyan-400 uppercase tracking-widest backdrop-blur-md">
                          {(user.userType || 'citizen').replace('_', ' ')}
                        </span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onViewChange && onViewChange(ViewMode.PROFILE)}
                    className="w-12 h-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-colors relative"
                >
                    <BellRing size={22} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                </motion.button>
              </div>
          </div>

          {/* Quick Stats Row - Ultra Refined */}
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
              {[
                  { label: 'Saldo', value: `Rp ${(user.balance/1000).toLocaleString()}k`, icon: Wallet, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { label: 'Poin', value: '1.240', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Sistem', value: 'A+ Secure', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', view: ViewMode.EVALUATION },
                  { label: 'Laporan', value: '2 Aktif', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              ].map((stat, i) => (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, type: 'spring' }}
                      onClick={() => stat.view && onViewChange && onViewChange(stat.view)}
                      className={`flex-shrink-0 bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-4 rounded-[1.5rem] flex items-center gap-4 min-w-[160px] shadow-xl relative overflow-hidden group ${stat.view ? 'cursor-pointer' : ''}`}
                  >
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color.replace('text-', 'from-')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} relative z-10`}>
                          <stat.icon size={18} />
                      </div>
                      <div className="relative z-10">
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                          <p className="text-sm font-black text-white tracking-tight">{stat.value}</p>
                      </div>
                  </motion.div>
              ))}
          </div>

          {/* Hero Card - Ultra Advanced Visuals */}
          <div className="px-6">
              <GlassCard delay={0.1} className="bg-slate-950 border-white/5 p-0 overflow-hidden h-80 shadow-2xl shadow-blue-900/40 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20"></div>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-glow"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
                  
                  {/* Animated Grid Background */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
                  
                  <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start">
                          <div className="space-y-2">
                              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl px-3 py-1.5 rounded-full border border-white/10 w-fit">
                                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                                  <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Warga-ID v2.5.4</span>
                              </div>
                              <h2 className="text-4xl font-black text-white tracking-tighter mt-4 leading-[0.9]">
                                  Digitalisasi <br />
                                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 animate-bg-pan">Desa Mandiri</span>
                              </h2>
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.div 
                              whileHover={{ rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleScanClick}
                              className="p-4 bg-white/5 rounded-[1.5rem] backdrop-blur-2xl border border-white/10 shadow-xl cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                <QrCode size={28} className="text-white" />
                            </motion.div>
                            <motion.div 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onViewChange && onViewChange(ViewMode.SMART_HUB)}
                              className="p-4 bg-white/5 rounded-[1.5rem] backdrop-blur-2xl border border-white/10 shadow-xl cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                <LayoutGrid size={28} className="text-cyan-400" />
                            </motion.div>
                          </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                          <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onViewChange && onViewChange(ViewMode.GEOSPATIAL)}
                              className="flex items-center gap-3 bg-white text-slate-950 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-white/20 transition-all group"
                          >
                              <MapIcon size={18} className="group-hover:rotate-12 transition-transform" />
                              <span>Buka Peta Desa</span>
                          </motion.button>
                          <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status Ekonomi</p>
                              <div className="flex items-center gap-2 justify-end">
                                  <TrendingUp size={14} className="text-emerald-400" />
                                  <p className="text-xl font-black text-emerald-400 tracking-tighter">SURPLUS</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </GlassCard>
          </div>

          {/* Service Grid - Ultra Bento Style */}
          <div className="px-6 space-y-6">
              <div className="flex justify-between items-end">
                  <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Layanan Digital</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Akses Cepat Fasilitas Desa</p>
                  </div>
                  <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20">Semua</button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                  {berdayaMenu.slice(0, 8).map((item, i) => (
                      <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * i }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onViewChange && onViewChange(item.view)}
                          className="flex flex-col items-center gap-3 group"
                      >
                          <div className={`w-16 h-16 rounded-[1.75rem] bg-gradient-to-br ${item.color} p-[1px] shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                              <div className="w-full h-full bg-slate-900 rounded-[1.75rem] flex items-center justify-center relative overflow-hidden">
                                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                  <item.icon className="w-7 h-7 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                              </div>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest text-center leading-tight transition-colors">{item.label}</span>
                      </motion.button>
                  ))}
              </div>
          </div>

          {/* Live Activity Feed - Ultra Mobile First */}
          <div className="px-6 space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white tracking-tight">Aktivitas Terkini</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      Live
                  </div>
              </div>
              <div className="space-y-3">
                  {activities.slice(0, 4).map((act, i) => (
                      <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-all"
                      >
                          <div className={`p-2.5 rounded-xl bg-white/5 ${act.color} border border-white/10 group-hover:scale-110 transition-transform`}>
                              {act.icon === 'Wallet' && <Wallet size={18} />}
                              {act.icon === 'AlertCircle' && <AlertCircle size={18} />}
                              {act.icon === 'ShoppingBag' && <ShoppingBag size={18} />}
                              {act.icon === 'ShieldCheck' && <ShieldCheck size={18} />}
                              {act.icon === 'MessageSquare' && <MessageSquare size={18} />}
                              {act.icon === 'Truck' && <Truck size={18} />}
                              {act.icon === 'Zap' && <Zap size={18} />}
                              {act.icon === 'Trash2' && <Trash2 size={18} />}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between items-start">
                                  <p className="text-sm font-black text-white tracking-tight">{act.event}</p>
                                  <p className="text-[10px] font-bold text-slate-500">{act.time}</p>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{act.detail}</p>
                          </div>
                          <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </motion.div>
                  ))}
              </div>
          </div>

          {/* AI Integration - Floating Style */}
          <div className="px-4">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAiAssistant}
                className="relative p-6 rounded-[2rem] bg-slate-900 border border-cyan-500/30 overflow-hidden cursor-pointer group"
              >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
                  <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                              <Sparkles className="text-white" size={24} />
                          </div>
                          <div>
                              <h3 className="text-white font-black text-lg leading-none">Tanya Semesta</h3>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">AI Assistant Terintegrasi</p>
                          </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 group-hover:translate-x-1 transition-transform">
                          <ArrowRight size={16} />
                      </div>
                  </div>
              </motion.div>
          </div>
      </div>

      {/* DESKTOP DASHBOARD */}
      <div className="hidden md:flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-end"
        >
          <div>
            <p className="text-cyan-400 font-bold text-sm tracking-[0.3em] uppercase mb-2">Sistem Operasi Desa Digital</p>
            <h1 className="text-6xl font-black text-white tracking-tighter">
              Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user.name.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem]">
            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                <CloudSun size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cuaca Desa</p>
                <p className="text-white font-bold text-lg">28°C Cerah</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Status Sistem</p>
                <p className="text-emerald-400 font-bold text-lg">Online</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Cards */}
          {[
              { title: 'Total Penduduk', value: villageStats.totalPenduduk.toLocaleString(), sub: '+2.4%', icon: Users, color: 'cyan', delay: 0.1 },
              { title: 'Indeks Desa', value: villageStats.indeksDesa.toFixed(3), sub: 'Mandiri', icon: Activity, color: 'emerald', delay: 0.2 },
              { title: 'Logistik', value: villageStats.logistik.toString(), sub: '85 Aktif', icon: Truck, color: 'amber', delay: 0.3 },
              { title: 'Evaluasi Sistem', value: 'A+', sub: 'Secure', icon: ShieldCheck, color: 'rose', delay: 0.4, view: ViewMode.EVALUATION },
          ].map((card, i) => (
              <GlassCard 
                key={i} 
                delay={card.delay} 
                className="group/card cursor-pointer flex items-center gap-4 p-4 rounded-[1.5rem]"
                onClick={() => card.view && onViewChange && onViewChange(card.view)}
              >
                  <div className={`p-2.5 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 border border-${card.color}-500/20 group-hover/card:scale-110 transition-transform duration-500`}>
                      <card.icon size={18} />
                  </div>
                  <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{card.title}</p>
                      <p className="text-sm font-black text-white tracking-tight">{card.value}</p>
                  </div>
              </GlassCard>
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Bento Column */}
          <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-cyan-500/20 md:col-span-2 h-[400px] flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-cyan-500/20 rounded-lg"><MapIcon className="w-4 h-4 text-cyan-400" /></div>
                              <span className="tracking-tight">Operational Tracker</span>
                          </div>
                               <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={12} className="text-emerald-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tasks.length} Tasks</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package size={12} className="text-blue-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assets.length} Assets</span>
                                    </div>
                                    <button 
                                        onClick={() => onViewChange && onViewChange(ViewMode.TRACKER)}
                                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition uppercase tracking-widest flex items-center gap-1 ml-2"
                                    >
                                        Full Tracker <ArrowRight size={10} />
                                    </button>
                                    {isAdmin && (
                                      <button 
                                          onClick={seedData}
                                          disabled={isSeeding}
                                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition uppercase tracking-widest flex items-center gap-1 ml-2 disabled:opacity-50"
                                      >
                                          <Database size={10} /> {isSeeding ? 'Seeding...' : 'Seed Data'}
                                      </button>
                                    )}
                                  </div>
                              </h3>
                              <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 relative group/map">
                                <GeospatialEngine 
                                  center={{ lat: -5.1186, lng: 105.3072 }}
                                  zoom={14}
                                  interactive={false}
                                  points={[
                                    ...tasks.filter(t => t.location).map(t => ({
                                      id: `t-${t.id}`,
                                      position: t.location!,
                                      title: t.title,
                                      type: 'TASK' as const,
                                      data: t
                                    })),
                                    ...assets.filter(a => a.location).map(a => ({
                                      id: `a-${a.id}`,
                                      position: a.location!,
                                      title: a.name,
                                      type: 'ASSET' as const,
                                      data: a
                                    }))
                                  ]}
                                />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover/map:bg-transparent transition-colors pointer-events-none"></div>
                      </div>
                  </GlassCard>

                  <GlassCard className="flex flex-col h-full border-blue-500/20">
                       <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg"><Mail className="w-4 h-4 text-blue-400" /></div>
                                <span className="tracking-tight">Office Suite</span>
                            </div>
                            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition uppercase tracking-widest">View All</button>
                       </h3>
                       <div className="space-y-3 flex-1">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition cursor-pointer flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition"><FileSignature size={18}/></div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tanda Tangan</p>
                                        <p className="text-white font-bold text-sm">Persetujuan APBDes</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black text-red-400">{eofficeSummary.waitingSignature}</span>
                                    <span className="text-[8px] text-slate-500 uppercase font-bold">Urgent</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition cursor-pointer flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition"><Inbox size={18}/></div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Surat Masuk</p>
                                        <p className="text-white font-bold text-sm">Disposisi Lurah</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black text-blue-400">{eofficeSummary.thisMonth}</span>
                                    <span className="text-[8px] text-slate-500 uppercase font-bold">This Month</span>
                                </div>
                            </div>
                       </div>
                  </GlassCard>

                  <GlassCard className="border-emerald-500/20">
                     <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-500/20 rounded-lg"><Activity className="w-4 h-4 text-emerald-400" /></div>
                             <span className="tracking-tight">System Health</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Stable</span>
                         </div>
                     </h3>
                     <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <span>Kernel Load</span>
                                <span className="text-emerald-400">12.4%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[12.4%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                <span>Memory Sync</span>
                                <span className="text-blue-400">84%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[84%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                        <div className="pt-2 grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Uptime</p>
                                <p className="text-xs font-mono text-white">14d 02h 45m</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Latency</p>
                                <p className="text-xs font-mono text-white">14ms</p>
                            </div>
                        </div>
                     </div>
                  </GlassCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-emerald-500/20">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle className="w-4 h-4 text-emerald-400" /></div>
                              <span className="tracking-tight">Active Team Tasks</span>
                          </div>
                          <button onClick={() => onViewChange && onViewChange(ViewMode.TASKS)} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition uppercase tracking-widest">View All</button>
                      </h3>
                      <div className="space-y-3">
                          {tasks.slice(0, 3).map(task => (
                              <div key={task.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                                  <div>
                                      <p className="text-sm font-bold text-white">{task.title}</p>
                                      <p className="text-[10px] text-slate-500">{task.assignedTo.join(', ')}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{task.status}</span>
                              </div>
                          ))}
                      </div>
                  </GlassCard>

                  <GlassCard className="border-blue-500/20">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg"><Package className="w-4 h-4 text-blue-400" /></div>
                              <span className="tracking-tight">Asset Status</span>
                          </div>
                          <button onClick={() => onViewChange && onViewChange(ViewMode.ASSETS)} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition uppercase tracking-widest">Inventory</button>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                          {assets.slice(0, 4).map(asset => (
                              <div key={asset.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${asset.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                  <div>
                                      <p className="text-xs font-bold text-white truncate w-24">{asset.name}</p>
                                      <p className="text-[9px] text-slate-500 uppercase">{asset.condition}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </GlassCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-red-500/20">
                     <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                         <div className="p-2 bg-red-500/20 rounded-lg"><Percent className="w-4 h-4 text-red-400" /></div>
                         <span className="tracking-tight">Analisis Stunting</span>
                     </h3>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stuntingData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)', color: 'white', fontSize: '12px'}} 
                            />
                            <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444', strokeWidth: 0}} activeDot={{r: 6, strokeWidth: 0}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                  </GlassCard>

                  <GlassCard className="border-blue-500/20">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg"><Wallet className="w-4 h-4 text-blue-400" /></div>
                          <span className="tracking-tight">Realisasi APBDes</span>
                      </h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={budgetData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="category" type="category" width={80} tick={{fill: '#64748b', fontSize: 9, fontWeight: 600}} />
                            <Tooltip 
                               cursor={{fill: 'rgba(255,255,255,0.05)'}}
                               contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)', color: 'white', fontSize: '12px'}}
                            />
                            <Bar dataKey="realized" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                  </GlassCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-indigo-500/20">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-500/20 rounded-lg"><CloudSun className="w-4 h-4 text-indigo-400" /></div>
                              <span className="tracking-tight">Google Workspace Integration</span>
                          </div>
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                          {[
                              { label: 'Gmail', status: workspaceStatus.gmail, icon: Mail, color: 'text-red-400' },
                              { label: 'Calendar', status: workspaceStatus.calendar, icon: Calendar, color: 'text-blue-400' },
                              { label: 'Drive', status: workspaceStatus.drive, icon: HardDrive, color: 'text-yellow-400' },
                              { label: 'Contacts', status: workspaceStatus.contacts, icon: Contact, color: 'text-blue-500' },
                          ].map((item, i) => (
                              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition">
                                  <div className="flex items-center gap-3">
                                      <item.icon size={16} className={item.color} />
                                      <span className="text-xs font-bold text-slate-300">{item.label}</span>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {item.status}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </GlassCard>

                  <GlassCard className="border-amber-500/20 flex flex-col justify-center items-center text-center">
                      <div className="p-4 bg-amber-500/10 rounded-full mb-4">
                          <Sparkles className="text-amber-400 w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Gemini AI Engine</h3>
                      <p className="text-slate-400 text-xs max-w-xs mb-6">
                          Sistem kecerdasan buatan terintegrasi untuk analisis data dan asisten warga.
                      </p>
                      <button 
                        onClick={onOpenAiAssistant}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:scale-105 transition active:scale-95"
                      >
                          Buka Asisten AI
                      </button>
                  </GlassCard>
              </div>
          </div>

          {/* Side Column - Live Feed */}
          <div className="lg:col-span-4">
              <GlassCard className="h-full flex flex-col border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><BellRing className="w-4 h-4 text-cyan-400" /></div>
                        <span className="tracking-tight">Live Activity</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">System Healthy</span>
                      </div>
                  </h3>
                  <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                      {activities.map((item, i) => {
                          const IconComponent = {
                              Wallet, AlertCircle, ShoppingBag, ShieldCheck, MessageSquare, Truck, Zap, Trash2, Activity, Users, TrendingUp
                          }[item.icon] || Activity;

                          return (
                              <div key={i} className={`flex gap-4 group cursor-default transition-all duration-300 ${i === 0 ? 'animate-in slide-in-from-left-2' : ''}`}>
                                  <div className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300 relative`}>
                                          {i === 0 && <div className={`absolute inset-0 rounded-xl ${item.color} opacity-20 animate-ping`}></div>}
                                          <IconComponent size={16} />
                                      </div>
                                      {i !== activities.length - 1 && <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mt-2"></div>}
                                  </div>
                                  <div className="pb-6">
                                      <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.time}</p>
                                        {i === 0 && <span className="text-[8px] font-black bg-cyan-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">New</span>}
                                      </div>
                                      <p className="text-white font-bold text-sm mt-0.5 group-hover:text-cyan-400 transition-colors">{item.event}</p>
                                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.detail}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
                  <button className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest">
                      View Full Audit Log
                  </button>
              </GlassCard>
          </div>
      </div>

      {/* SCANNER OVERLAY */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span className="font-bold tracking-wider text-white uppercase">WARGA-SCANNER</span>
            </div>
            <button onClick={closeScanner} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white">
              <X size={24} />
            </button>
          </div>
          {/* Scanner Viewfinder (Simulation) */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-900">
             {!scanResult ? (
                 <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-slate-800 to-black opacity-50"></div>
                    <div className="relative w-72 h-72 border-2 border-white/30 rounded-[2rem] overflow-hidden">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-500 rounded-tl-2xl"></div>
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-500 rounded-tr-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-500 rounded-bl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-500 rounded-br-2xl"></div>
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-cyan-400 shadow-[0_0_20px_cyan] animate-pulse"></div>
                    </div>
                    <p className="absolute bottom-32 text-white/70 text-sm font-medium animate-pulse">Searching for QR Code...</p>
                 </>
             ) : (
                 <div className="bg-white text-slate-900 p-8 rounded-3xl max-w-sm w-full mx-6 text-center shadow-2xl animate-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Kode Terdeteksi</h3>
                    <p className="font-mono text-sm bg-slate-100 p-3 rounded-xl mb-6 border border-slate-200">{scanResult}</p>
                    <button onClick={closeScanner} className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 transition">Proses</button>
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
