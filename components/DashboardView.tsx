
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Activity, ShieldCheck, Wallet, Facebook, Instagram, Youtube, MessageCircle, ArrowRight, Truck, Mail, FileSignature, Inbox, ShoppingBag, Utensils, Stethoscope, Zap, Trash2, MoreHorizontal, QrCode, ScanLine, Send, PlusCircle, Calendar, CloudSun, X, Camera, CheckCircle, RefreshCw, Building2, ThumbsUp, AlertCircle, FileText, MessageSquare, Wrench, Armchair, Car, BookOpen, Briefcase, GraduationCap, Siren, Percent, Leaf, Wifi, Phone, BellRing, Map as MapIcon, Package, Sparkles, Database } from 'lucide-react';
import { STUNTING_DATA, BUDGET_DATA, MOCK_USER, EOFFICE_SUMMARY, SOCIAL_REPORTS, MARKETPLACE_ITEMS, PARKING_ZONES, TEAM_TASKS, ASSETS } from '../constants';
import { CitizenProfile, ViewMode, TeamTask, Asset, BudgetLineItem } from '../types';
import GeospatialEngine from './GeospatialEngine';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

interface DashboardViewProps {
  user?: CitizenProfile;
  onViewChange?: (view: ViewMode) => void;
  onOpenAiAssistant?: () => void;
  isGlassHouseMode?: boolean;
}


const GlassCard: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void, delay?: number }> = ({ children, className, onClick, delay = 0 }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick} 
      className={`glass-panel rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-white/30 border border-white/10 ${className || ''}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        {children}
    </motion.div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ user = MOCK_USER, onViewChange, onOpenAiAssistant, isGlassHouseMode = false }) => {
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

    const unsubBudget = onSnapshot(collection(db, 'budget'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetLineItem));
      setBudgetData(data.length > 0 ? data : BUDGET_DATA);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'budget'));

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
        const ref = doc(collection(db, 'budget'), item.id);
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
      { label: 'Pesan Meja', icon: Armchair, color: 'from-blue-600 to-blue-400', view: ViewMode.MARKET },
      { label: 'Tracker', icon: Activity, color: 'from-cyan-600 to-blue-500', view: ViewMode.TRACKER },
      { label: 'Tugas Tim', icon: CheckCircle, color: 'from-emerald-600 to-teal-500', view: ViewMode.TASKS },
      { label: 'Aset Desa', icon: Package, color: 'from-blue-600 to-indigo-500', view: ViewMode.ASSETS },
      { label: 'Belanja', icon: ShoppingBag, color: 'from-orange-500 to-amber-500', view: ViewMode.BERDAYA }, 
      { label: 'Anjelo', icon: Truck, color: 'from-green-600 to-emerald-500', view: ViewMode.BERDAYA }, 
      { label: 'Parkir', icon: Car, color: 'from-indigo-500 to-violet-500', view: ViewMode.PARKING },
      { label: 'Workspace', icon: Briefcase, color: 'from-slate-700 to-slate-500', view: ViewMode.EOFFICE }, 
      { label: 'Pustaka', icon: BookOpen, color: 'from-violet-600 to-fuchsia-600', view: ViewMode.EDUCATION, noQuota: true },
      { label: 'Kursus', icon: GraduationCap, color: 'from-pink-600 to-rose-500', view: ViewMode.EDUCATION, noQuota: true }, 
      { label: 'Poskamling', icon: Siren, color: 'from-red-600 to-orange-600', view: ViewMode.POSKAMLING },
      { label: 'Sehat', icon: Stethoscope, color: 'from-teal-500 to-cyan-500', view: ViewMode.HEALTH },
      { label: 'WargaNet', icon: Activity, color: 'from-cyan-600 to-blue-500', view: ViewMode.ENVIRONMENT },
      { label: 'Lapor', icon: AlertTriangle, color: 'from-red-500 to-pink-600', view: ViewMode.SOCIAL },
      { label: 'Lainnya', icon: MoreHorizontal, color: 'from-slate-800 to-slate-600', view: ViewMode.GAPURA },
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
      
      {/* MOBILE DASHBOARD */}
      <div className="md:hidden flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end px-2">
              <div>
                  <p className="text-slate-400 text-xs font-medium mb-0.5">Selamat Pagi,</p>
                  <h1 className="text-3xl font-black text-white tracking-tight">{user.name.split(' ')[0]}!</h1>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                  <CloudSun size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white">28°C</span>
              </div>
          </div>

          {/* Hero Card */}
          <GlassCard delay={0.1} className="bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90 border-white/20 p-0 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
              
              <div className="relative z-10 p-6 flex flex-col justify-between h-52 text-white">
                  <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 w-fit">
                            <ShieldCheck size={14} className="text-yellow-400" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">Warga Berdaya</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                          <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">Sistem Aktif</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                        <QrCode size={24} className="text-white" />
                      </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-blue-100 text-[10px] font-bold tracking-widest uppercase opacity-70">Saldo Aktif</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-medium opacity-80">Rp</span>
                            <h2 className="text-5xl font-black tracking-tighter">{(user.balance/1000).toLocaleString()}<span className="text-3xl opacity-60">.000</span></h2>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">ID Warga</p>
                      <p className="text-xs font-mono font-bold text-white/90">#YSO-{user.id.substring(0, 6).toUpperCase()}</p>
                    </div>
                  </div>
              </div>
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 px-2">
              {[
                { label: 'Pindai', icon: ScanLine, color: 'text-cyan-400', onClick: handleScanClick, delay: 0.2 },
                { label: 'Tracker', icon: Activity, color: 'text-emerald-400', onClick: () => onViewChange && onViewChange(ViewMode.TRACKER), delay: 0.25 },
                { label: 'Kirim', icon: Send, color: 'text-orange-400', onClick: () => onViewChange && onViewChange(ViewMode.ECONOMY), delay: 0.3 },
                { label: 'Isi Saldo', icon: PlusCircle, color: 'text-purple-400', onClick: () => onViewChange && onViewChange(ViewMode.ECONOMY), delay: 0.35 },
              ].map((action, idx) => (
                  <motion.button 
                    key={idx} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: action.delay }}
                    onClick={action.onClick} 
                    className="flex flex-col items-center gap-2 group"
                  >
                      <div className="w-16 h-16 rounded-[1.2rem] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-90 transition duration-200">
                          <action.icon size={24} className={action.color} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-300">{action.label}</span>
                  </motion.button>
              ))}
          </div>

          {/* AI Integration Card */}
          <GlassCard 
            onClick={onOpenAiAssistant}
            className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/30 cursor-pointer group"
          >
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                          <Sparkles className="text-white" size={24} />
                      </div>
                      <div>
                          <h3 className="text-white font-bold text-lg">Tanya AI MetalOS</h3>
                          <p className="text-slate-400 text-xs">Butuh bantuan navigasi atau data desa?</p>
                      </div>
                  </div>
                  <ArrowRight className="text-cyan-400 group-hover:translate-x-2 transition-transform" />
              </div>
          </GlassCard>

          {/* Super Grid */}
          <div className="pt-2 px-2">
              <h3 className="font-bold text-slate-200 text-lg mb-4 ml-1">Layanan Desa</h3>
              <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                  {berdayaMenu.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => onViewChange && onViewChange(item.view)}
                        className="flex flex-col items-center gap-2 group"
                      >
                          <div className={`w-[72px] h-[72px] rounded-[1.8rem] flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 bg-gradient-to-br ${item.color}`}>
                              <item.icon size={28} className="text-white drop-shadow-md" strokeWidth={2} />
                          </div>
                          <span className="text-[11px] font-medium text-slate-300 text-center">{item.label}</span>
                      </button>
                  ))}
              </div>
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
              { title: 'Total Penduduk', value: villageStats.totalPenduduk.toLocaleString(), sub: '+2.4%', icon: Users, color: 'blue', delay: 0.1 },
              { title: 'Indeks Desa', value: villageStats.indeksDesa.toFixed(3), sub: 'Mandiri', icon: Activity, color: 'emerald', delay: 0.2 },
              { title: 'Logistik', value: villageStats.logistik.toString(), sub: '85 Aktif', icon: Truck, color: 'orange', delay: 0.3 },
              { title: 'Peringatan', value: villageStats.peringatan.toString(), sub: 'Waspada', icon: AlertTriangle, color: 'red', delay: 0.4 },
          ].map((card, i) => (
              <GlassCard key={i} delay={card.delay} className="group/card">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover/card:scale-150 duration-700"></div>
                  <div className="flex justify-between items-start relative z-10">
                      <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{card.title}</p>
                          <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{card.value}</h3>
                      </div>
                      <div className={`p-3 bg-${card.color}-500/10 rounded-2xl text-${card.color}-400 border border-${card.color}-500/20 group-hover/card:scale-110 transition-transform duration-500`}>
                          <card.icon size={24} />
                      </div>
                  </div>
                  <div className="mt-6 flex items-center text-xs text-slate-400 relative z-10">
                      <span className={`text-${card.color}-400 font-bold bg-${card.color}-500/10 px-2 py-0.5 rounded-lg mr-2 border border-${card.color}-500/20`}>{card.sub}</span>
                      Live Data Stream
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
                                <span className="tracking-tight">E-Office Suite</span>
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
              <span className="font-bold tracking-wider text-white">METAL-SCANNER</span>
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

export default DashboardView;
