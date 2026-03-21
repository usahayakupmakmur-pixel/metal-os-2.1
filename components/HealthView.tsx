
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity, Calendar, Clock, MapPin, User, Phone, Search, Filter, Plus, ArrowRight, CheckCircle, AlertCircle, MessageSquare, Video, Thermometer, Pill, Stethoscope, QrCode, X, Printer, Sparkles, Shield, Zap, Building, Baby, TrendingUp, Scale, Ruler } from 'lucide-react';
import { MOCK_USER } from '../constants';
import { CitizenProfile } from '../types';
import GlassCard from '../src/components/GlassCard';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';

interface HealthViewProps {
  user?: CitizenProfile;
}

const HealthView: React.FC<HealthViewProps> = ({ user = MOCK_USER }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'telemed' | 'posyandu'>('queue');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [posyanduSchedules, setPosyanduSchedules] = useState<any[]>([]);
  const [childGrowth, setChildGrowth] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubSchedules = onSnapshot(
      query(collection(db, 'posyandu_schedules'), orderBy('date', 'asc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosyanduSchedules(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'posyandu_schedules')
    );

    const unsubGrowth = onSnapshot(
      query(collection(db, 'child_growth'), limit(10)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChildGrowth(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'child_growth')
    );

    return () => {
      unsubSchedules();
      unsubGrowth();
    };
  }, []);

  const QUEUE_DATA = [
    { id: 'q-1', poly: 'Poli Umum', doctor: 'dr. Siti Aminah', queueNumber: 'A-012', currentQueue: 'A-008', waitTime: '25 min', status: 'WAITING' },
    { id: 'q-2', poly: 'Poli Gigi', doctor: 'drg. Budi Santoso', queueNumber: 'B-005', currentQueue: 'B-004', waitTime: '10 min', status: 'URGENT' },
  ];

  const TELEMED_DOCTORS = [
    { id: 'd-1', name: 'dr. Ahmad Fauzi', specialty: 'Spesialis Anak', rating: 4.9, price: 50000, available: true, image: 'https://picsum.photos/seed/doc1/200/200' },
    { id: 'd-2', name: 'dr. Linda Wijaya', specialty: 'Spesialis Penyakit Dalam', rating: 4.8, price: 75000, available: false, image: 'https://picsum.photos/seed/doc2/200/200' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section: Health Dashboard */}
      <GlassCard className="bg-gradient-to-br from-rose-600/20 to-pink-600/20 border-rose-500/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <Shield size={20} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Health & Wellness</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              Layanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">Kesehatan</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
              Akses antrian Puskesmas, konsultasi dokter online, dan pantau jadwal Posyandu dalam satu genggaman.
            </p>
          </div>
          <div className="flex gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="text-center px-4 border-r border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Detak Jantung</p>
                <div className="flex items-center gap-2 justify-center">
                    <Activity size={16} className="text-rose-500 animate-pulse" />
                    <span className="text-xl font-black text-white">72</span>
                    <span className="text-[10px] text-slate-500 font-bold">BPM</span>
                </div>
            </div>
            <div className="text-center px-4">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Suhu Tubuh</p>
                <div className="flex items-center gap-2 justify-center">
                    <Thermometer size={16} className="text-orange-500" />
                    <span className="text-xl font-black text-white">36.5</span>
                    <span className="text-[10px] text-slate-500 font-bold">°C</span>
                </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Navigation Tabs - Ultra Tech Style */}
      <div className="flex p-1.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md w-fit mx-auto md:mx-0">
        {[
          { id: 'queue', label: 'Antrian Puskesmas', icon: Clock },
          { id: 'telemed', label: 'Telemedicine', icon: Video },
          { id: 'posyandu', label: 'Posyandu', icon: Heart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
              ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'queue' && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {QUEUE_DATA.map((q, i) => (
                    <GlassCard 
                      key={q.id} 
                      onClick={() => setSelectedTicket(q)}
                      className="cursor-pointer hover:border-rose-500/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                          <Stethoscope className="text-rose-400" size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          q.status === 'URGENT' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {q.status}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-rose-400 transition-colors">{q.poly}</h3>
                      <p className="text-xs text-slate-500 font-bold mt-1">{q.doctor}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Nomor Anda</p>
                          <p className="text-2xl font-black text-white">{q.queueNumber}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Antrian Sekarang</p>
                          <p className="text-2xl font-black text-rose-400">{q.currentQueue}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <Clock size={14} /> Estimasi: {q.waitTime}
                        </div>
                        <span className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                          Detail Tiket <ArrowRight size={14} />
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                
                {/* Emergency Card */}
                <GlassCard className="bg-gradient-to-r from-rose-600/20 to-transparent border-rose-500/30">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/40 animate-pulse">
                            <Zap size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Layanan Gawat Darurat</h3>
                            <p className="text-sm text-slate-400 mt-1">Butuh bantuan medis segera? Hubungi tim reaksi cepat desa.</p>
                            <button className="mt-4 bg-rose-500 hover:bg-rose-400 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                                <Phone size={16} /> Hubungi 119
                            </button>
                        </div>
                    </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'telemed' && (
              <motion.div
                key="telemed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-white tracking-tight">Dokter Online Tersedia</h3>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white"><Filter size={18} /></button>
                        <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white"><Search size={18} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TELEMED_DOCTORS.map((doc, i) => (
                    <GlassCard key={doc.id} className="group">
                      <div className="flex gap-4">
                        <div className="relative">
                            <img src={doc.image} alt={doc.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
                            {doc.available && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/50"></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-white text-lg group-hover:text-rose-400 transition-colors">{doc.name}</h4>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{doc.specialty}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Sparkles size={12} className="text-amber-400" />
                            <span className="text-xs font-black text-white">{doc.rating}</span>
                            <span className="text-[10px] text-slate-500 font-bold ml-1">(120+ Review)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Biaya Konsultasi</p>
                            <p className="text-lg font-black text-white">Rp {doc.price.toLocaleString()}</p>
                        </div>
                        <button className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            doc.available 
                            ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-xl shadow-rose-500/20' 
                            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                        }`}>
                            {doc.available ? 'Mulai Chat' : 'Offline'}
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'posyandu' && (
              <motion.div
                key="posyandu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Posyandu Hero */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                        <Baby size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight">Status Gizi Anak</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Update: 15 Mar 2024</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-slate-500">Tinggi Badan</span>
                          <span className="text-white">85 cm</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[75%]"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-slate-500">Berat Badan</span>
                          <span className="text-white">12.5 kg</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[80%]"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-emerald-400">
                      <CheckCircle size={16} />
                      <span className="text-xs font-bold">Pertumbuhan Normal</span>
                    </div>
                  </GlassCard>

                  <GlassCard className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight">Jadwal Terdekat</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Posyandu Melati</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-white">25 Maret 2024</p>
                      <p className="text-xs text-slate-400">08:00 - 11:00 WIB</p>
                    </div>
                    <button className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                      Ingatkan Saya
                    </button>
                  </GlassCard>
                </div>

                {/* Growth History */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-white tracking-tight">Riwayat Tumbuh Kembang</h3>
                    <button className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                      Lihat Grafik <TrendingUp size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {childGrowth.length > 0 ? childGrowth.map((record) => (
                      <GlassCard key={record.id} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</span>
                          <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full">
                            {record.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Scale size={14} className="text-slate-500" />
                            <span className="text-sm font-black text-white">{record.weight} kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ruler size={14} className="text-slate-500" />
                            <span className="text-sm font-black text-white">{record.height} cm</span>
                          </div>
                        </div>
                      </GlassCard>
                    )) : (
                      <div className="col-span-3 py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-slate-500 text-sm">Belum ada data riwayat.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Posyandu Schedules */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-white tracking-tight">Kegiatan Posyandu Mendatang</h3>
                  <div className="space-y-3">
                    {posyanduSchedules.map((s) => (
                      <div key={s.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex flex-col items-center justify-center text-rose-400">
                            <span className="text-[10px] font-black uppercase">{new Date(s.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-black">{new Date(s.date).getDate()}</span>
                          </div>
                          <div>
                            <h4 className="font-black text-white group-hover:text-rose-400 transition-colors">{s.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                <MapPin size={10} /> {s.location}
                              </span>
                              <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest">
                                {s.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-white group-hover:bg-rose-500 transition-all">
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Health Stats & Tips */}
        <div className="space-y-8">
          {/* Health Profile Summary */}
          <GlassCard>
            <h3 className="text-lg font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <User className="text-rose-400" size={20} />
              Profil Kesehatan
            </h3>
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Golongan Darah</span>
                        <span className="text-xl font-black text-rose-400">O+</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Alergi</span>
                        <span className="text-xs font-bold text-white">Tidak Ada</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Riwayat Terakhir</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <Pill size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Vaksinasi Booster</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">12 Jan 2024</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Medical Check-up</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">05 Des 2023</p>
                        </div>
                    </div>
                </div>
            </div>
            <button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10">
              Lihat Rekam Medis
            </button>
          </GlassCard>

          {/* AI Health Tips */}
          <GlassCard className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
            <h3 className="text-lg font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="text-cyan-400" size={20} />
              AI Health Insight
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">
              "Berdasarkan data cuaca hari ini, kelembapan udara cukup tinggi. Pastikan Anda tetap terhidrasi dan gunakan masker jika beraktivitas di luar ruangan."
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                    <Thermometer size={24} className="text-cyan-400" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Kualitas Udara</p>
                    <p className="text-lg font-black text-emerald-400">Baik (AQI 42)</p>
                </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel rounded-[2.5rem] w-full max-w-sm overflow-hidden border border-white/20 shadow-2xl"
            >
              <div className="p-8 bg-white/5 border-b border-dashed border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-xs uppercase tracking-widest">Tiket Antrian</h3>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">ID: {selectedTicket.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Nomor Antrian</p>
                  <p className="text-7xl font-black text-white tracking-tighter">{selectedTicket.queueNumber}</p>
                  <div className="flex justify-center mt-6">
                    <div className="bg-white p-4 rounded-3xl">
                      <QrCode size={120} className="text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-5">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                    <Building size={14} /> Poli
                  </div>
                  <span className="text-sm font-bold text-white">{selectedTicket.poly}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                    <User size={14} /> Dokter
                  </div>
                  <span className="text-sm font-bold text-white">{selectedTicket.doctor}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                    <Clock size={14} /> Estimasi
                  </div>
                  <span className="text-sm font-bold text-rose-400">{selectedTicket.waitTime}</span>
                </div>

                <div className="pt-6 flex gap-3">
                  <button className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20">
                    Konfirmasi Kedatangan
                  </button>
                  <button className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all">
                    <Printer size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthView;
