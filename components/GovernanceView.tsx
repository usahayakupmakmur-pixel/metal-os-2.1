
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Mail, MessageSquare, CheckCircle, Clock, AlertCircle, TrendingUp, Users, Building, Shield, ArrowRight, Plus, Search, Filter, Download, MoreHorizontal, Sparkles, FileSignature, ThumbsUp } from 'lucide-react';
import { subscribeToBudget } from '../src/services/budgetService';
import { EOFFICE_SUMMARY, MOCK_USER } from '../constants';
import GeospatialEngine from './GeospatialEngine';
import { SocialReport, CitizenProfile, TeamTask, Asset } from '../types';
import GlassCard from '../src/components/GlassCard';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, setDoc, getDocs } from 'firebase/firestore';
import { TEAM_TASKS, ASSETS } from '../constants';

interface GovernanceViewProps {
  user?: CitizenProfile;
}

const BUDGET_MOCK = [
  { id: 'b-1', category: 'Infrastruktur', allocated: 450000000, realized: 320000000 },
  { id: 'b-2', category: 'Kesehatan', allocated: 200000000, realized: 185000000 },
  { id: 'b-3', category: 'Pendidikan', allocated: 150000000, realized: 120000000 },
  { id: 'b-4', category: 'UMKM', allocated: 100000000, realized: 85000000 },
];

const MUSRENBANG_MOCK = [
  { id: 'mus-1', title: 'Perbaikan Lampu Jalan RW 05', votes: 145, category: 'Infrastruktur' },
  { id: 'mus-2', title: 'Pelatihan Digital Marketing UMKM', votes: 82, category: 'Ekonomi' },
  { id: 'mus-3', title: 'Pembangunan Taman Baca Desa', votes: 64, category: 'Sosial' },
];

const GovernanceView: React.FC<GovernanceViewProps> = ({ user = MOCK_USER }) => {
  const [reports, setReports] = useState<SocialReport[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [musrenbangUsulan, setMusrenbangUsulan] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SocialReport[];
      setReports(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
    });

    const fetchTasks = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tasks'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamTask));
        setTasks(data.length > 0 ? data : TEAM_TASKS);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      }
    };
    fetchTasks();

    const fetchAssets = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'assets'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        setAssets(data.length > 0 ? data : ASSETS);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'assets');
      }
    };
    fetchAssets();

    const unsubMusrenbang = onSnapshot(collection(db, 'musrenbang'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length === 0) {
        MUSRENBANG_MOCK.forEach(async (u) => {
          await setDoc(doc(db, 'musrenbang', u.id), {
            ...u,
            createdAt: serverTimestamp()
          });
        });
      } else {
        setMusrenbangUsulan(data.sort((a: any, b: any) => b.votes - a.votes));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'musrenbang'));

    const unsubBudget = subscribeToBudget(
      (budgetData) => {
        setBudgetData(budgetData.length > 0 ? budgetData : BUDGET_MOCK);
      },
      (error) => {
        console.error('Error fetching budget data:', error);
      }
    );

    return () => {
      unsubscribe();
      unsubMusrenbang();
      unsubBudget();
    };
  }, []);

  const handleVote = async (id: string) => {
    try {
      await updateDoc(doc(db, 'musrenbang', id), {
        votes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `musrenbang/${id}`);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section: Governance Overview */}
      <GlassCard className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Shield size={20} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Governance & Transparency</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              Tata Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Digital</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
              Pantau realisasi anggaran desa, kelola administrasi surat-menyurat, dan partisipasi dalam Musrenbang secara digital dengan transparansi total.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2">
              <Download size={16} /> Laporan Tahunan
            </button>
            <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
              <Plus size={16} /> Buat Laporan
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Budget & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Budget Realization */}
          <GlassCard>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Realisasi Anggaran (Live)</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Update Real-time dari Siskeudes • Q4 2023</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">On Track</span>
              </div>
            </div>

            <div className="space-y-6">
              {(budgetData.length > 0 ? budgetData : BUDGET_MOCK).map((item, index) => {
                const percentage = Math.round((item.realized / item.allocated) * 100);
                return (
                  <div key={item.id} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{item.category}</span>
                      <span className={`font-black ${
                        percentage > 90 ? 'text-emerald-400' : 'text-indigo-400'
                      }`}>{percentage}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full ${
                          percentage > 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                        }`} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">
                       <span>Terpakai: Rp {(item.realized / 1000000).toFixed(0)} Jt</span>
                       <span>Pagu: Rp {(item.allocated / 1000000).toFixed(0)} Jt</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Geospatial Platform Preview */}
          <GlassCard className="border-cyan-500/20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Geospatial Platform</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Visualisasi Aset & Operasional Desa</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Live Map</span>
              </div>
            </div>

            <div className="h-[300px] rounded-2xl overflow-hidden border border-white/5 relative group">
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
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors pointer-events-none"></div>
              <div className="absolute bottom-4 right-4 z-10">
                <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                  Buka Peta Penuh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Aset</p>
                <p className="text-lg font-black text-white">{assets.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Tugas Aktif</p>
                <p className="text-lg font-black text-white">{tasks.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Cakupan Wilayah</p>
                <p className="text-lg font-black text-white">100%</p>
              </div>
            </div>
          </GlassCard>

          {/* Musrenbang Digital */}
          <GlassCard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Musrenbang Digital</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Suara Anda Menentukan Masa Depan Desa</p>
              </div>
              <Sparkles className="text-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-4">
              {musrenbangUsulan.map((usulan, i) => (
                <div 
                  key={usulan.id} 
                  onClick={() => handleVote(usulan.id)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{usulan.title}</span>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{usulan.category}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400">{usulan.votes} Votes</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (usulan.votes / 200) * 100)}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10">
              Lihat Semua Usulan
            </button>
          </GlassCard>
        </div>

        {/* Right Column: Office Suite & Mail */}
        <div className="space-y-8">
          {/* Office Suite Summary */}
          <GlassCard>
            <h3 className="text-lg font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <Mail className="text-indigo-400" size={20} />
              Administrasi Digital
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-wider mb-1">Surat Masuk</p>
                    <p className="text-2xl font-black text-white">{EOFFICE_SUMMARY.thisMonth}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Bulan Ini</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-wider mb-1">Tanda Tangan</p>
                    <p className="text-2xl font-black text-white">{EOFFICE_SUMMARY.waitingSignature}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Menunggu</p>
                </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileSignature size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Butuh Disposisi</span>
                </div>
                <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-black">{EOFFICE_SUMMARY.pendingDisposition}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-slate-400 group-hover:text-rose-400 transition-colors" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Surat Mendesak</span>
                </div>
                <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-lg text-[10px] font-black">{EOFFICE_SUMMARY.urgent}</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Reports Feed */}
          <GlassCard className="bg-slate-900/50">
            <h3 className="text-lg font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <AlertCircle className="text-rose-400" size={20} />
              Laporan Terkini
            </h3>
            <div className="space-y-6">
              {reports.length > 0 ? reports.map((report, i) => (
                <div key={report.id} className="relative pl-6 border-l-2 border-white/10 pb-6 last:pb-0">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-900 shadow-xl ${
                    report.status === 'RESOLVED' ? 'bg-emerald-500 shadow-emerald-500/50' :
                    report.status === 'IN_PROGRESS' ? 'bg-blue-500 shadow-blue-500/50' :
                    'bg-orange-500 shadow-orange-500/50'
                  }`} />
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">{report.type || 'Umum'}</p>
                  <p className="text-sm font-bold text-white mb-2 line-clamp-2">{report.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Clock size={12} /> {report.date ? 'Baru saja' : 'Hari ini'}</span>
                    <span className={`flex items-center gap-1 ${
                      report.status === 'RESOLVED' ? 'text-emerald-400' : 
                      report.status === 'IN_PROGRESS' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500 font-black uppercase tracking-widest italic">Belum ada laporan masuk</p>
                </div>
              )}
            </div>
            <button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5">
              Lihat Semua Laporan
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default GovernanceView;
