
import React, { useState, useEffect } from 'react';
import { Truck, Bike, DollarSign, FileText, Trash2, X, MapPin, User, Star, CheckCircle, MessageCircle, Phone, Navigation, Compass, Clock, RefreshCw, Search, ChevronRight, MessageSquare, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { CitizenProfile } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';

// Fix Leaflet icon issue
import 'leaflet/dist/leaflet.css';

const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Helper to center map
const RecenterMap = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(coords);
    }, [coords, map]);
    return null;
};

interface AnjeloSystemProps {
  isOpen: boolean;
  onClose: () => void;
  user: CitizenProfile;
  initialService?: 'PACKAGE' | 'RIDE' | 'CASH' | 'TRASH' | 'DOCS' | null;
  initialNote?: string;
}

const AnjeloSystem: React.FC<AnjeloSystemProps> = ({ isOpen, onClose, user, initialService, initialNote }) => {
  const [state, setState] = useState<'SELECT' | 'INPUT' | 'SEARCHING' | 'FOUND' | 'COMPLETED'>('SELECT');
  const [service, setService] = useState<'PACKAGE' | 'RIDE' | 'CASH' | 'TRASH' | 'DOCS'>('PACKAGE');
  const [note, setNote] = useState('');
  const [assignedDriver, setAssignedDriver] = useState<{name: string, plate: string, rating: number} | null>(null);
  const [driverPos, setDriverPos] = useState<[number, number]>([-5.115, 105.305]);
  const userPos: [number, number] = [-5.118, 105.308]; // Yosomulyo area
  const [isArrived, setIsArrived] = useState(false);

  const steps = [
    { id: 'SELECT', label: 'Layanan' },
    { id: 'INPUT', label: 'Detail' },
    { id: 'SEARCHING', label: 'Mencari' },
    { id: 'FOUND', label: 'Tracking' },
    { id: 'COMPLETED', label: 'Selesai' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === state);

  // Simulate driver movement
  useEffect(() => {
    if (state === 'FOUND') {
      const interval = setInterval(() => {
        setDriverPos(prev => {
          const newLat = prev[0] + (userPos[0] - prev[0]) * 0.15;
          const newLng = prev[1] + (userPos[1] - prev[1]) * 0.15;
          
          // Check if arrived (very close)
          const dist = Math.sqrt(Math.pow(newLat - userPos[0], 2) + Math.pow(newLng - userPos[1], 2));
          if (dist < 0.0001) {
            setIsArrived(true);
            clearInterval(interval);
          }
          
          return [newLat, newLng];
        });
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setIsArrived(false);
    }
  }, [state]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      if (initialService) {
        setService(initialService);
        setNote(initialNote || '');
        setState('INPUT');
      } else {
        setState('SELECT');
        setNote('');
      }
      setAssignedDriver(null);
    }
  }, [isOpen, initialService, initialNote]);

  const handleOrder = () => {
    setState('SEARCHING');
    // Simulate finding driver
    setTimeout(() => {
      const drivers = [
        { name: "Ahmad Dani", plate: "BE 4521 YD", rating: 4.9 },
        { name: "Budi Santoso", plate: "BE 2210 AA", rating: 4.8 },
        { name: "Mas Tono", plate: "BE 5599 XY", rating: 5.0 }
      ];
      setAssignedDriver(drivers[Math.floor(Math.random() * drivers.length)]);
      setState('FOUND');
    }, 2500);
  };

  const services = [
    { id: 'PACKAGE', label: 'Antar Paket', icon: Truck, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', text: 'text-orange-500' },
    { id: 'RIDE', label: 'Ojek Desa', icon: Bike, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-500' },
    { id: 'CASH', label: 'Tarik Tunai', icon: DollarSign, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-500' },
    { id: 'TRASH', label: 'Jemput Sampah', icon: Trash2, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    { id: 'DOCS', label: 'Kirim Dokumen', icon: FileText, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', text: 'text-purple-500' },
  ];

  const activeService = services.find(s => s.id === service);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] w-full max-w-md overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh] border border-white/10"
          >
            
            {/* Header - Ultra Advanced */}
            <div className="relative p-8 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${activeService?.color || 'from-slate-800 to-slate-900'} opacity-20`}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]"></div>
              
              <motion.div 
                key={service}
                initial={{ opacity: 0, x: 40, rotate: 12 }}
                animate={{ opacity: 0.1, x: 0, rotate: 12 }}
                className="absolute -right-10 -top-10 transform scale-150"
              >
                  {activeService && <activeService.icon size={140} />}
              </motion.div>
              
              <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl transition backdrop-blur-xl border border-white/10">
                <X size={20} />
              </button>
              
              <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-2xl border border-white/10 shadow-xl">
                      <Truck className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter leading-none">Anjelo System</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">Logistics & Mobility</p>
                    </div>
                  </div>

                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 mt-6">
                      {steps.map((s, i) => (
                          <React.Fragment key={s.id}>
                              <div className="flex flex-col items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= currentStepIndex ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`}></div>
                                  <span className={`text-[7px] font-black uppercase tracking-widest ${i <= currentStepIndex ? 'text-cyan-400' : 'text-slate-600'}`}>{s.label}</span>
                              </div>
                              {i < steps.length - 1 && (
                                  <div className={`flex-1 h-[1px] mb-3 transition-all duration-500 ${i < currentStepIndex ? 'bg-cyan-400/50' : 'bg-slate-800'}`}></div>
                              )}
                          </React.Fragment>
                      ))}
                  </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {/* STATE: SELECT SERVICE */}
                {state === 'SELECT' && (
                  <motion.div 
                    key="select"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="font-black text-white text-xl tracking-tight">Pilih Layanan</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {services.map((s, idx) => (
                        <motion.button
                          key={s.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => { setService(s.id as any); setState('INPUT'); }}
                          className="p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group haptic-press relative overflow-hidden"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 ${s.bg} ${s.text}`}>
                            <s.icon size={28} strokeWidth={2.5} />
                          </div>
                          <span className="font-black text-slate-300 group-hover:text-white text-xs uppercase tracking-widest">{s.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STATE: INPUT DETAILS */}
                {state === 'INPUT' && (
                  <motion.div 
                    key="input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/10">
                      <div className={`p-4 rounded-2xl ${activeService?.bg} ${activeService?.text}`}>
                        {activeService && <activeService.icon size={28} strokeWidth={2.5} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Layanan Aktif</p>
                        <p className="font-black text-white text-lg tracking-tight">{activeService?.label}</p>
                      </div>
                      <button onClick={() => setState('SELECT')} className="p-2 bg-white/5 rounded-xl text-cyan-400 hover:bg-white/10 transition">
                        <RefreshCw size={18} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[9px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] ml-1">Lokasi Penjemputan</label>
                        <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 group hover:border-cyan-500/30 transition-colors">
                          <div className="p-3 bg-rose-500/20 rounded-2xl">
                              <MapPin className="text-rose-500 w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">Rumah {user.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">RW 05, Kelurahan Yosomulyo</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em] ml-1">
                          {service === 'CASH' ? 'Nominal Penarikan' : service === 'RIDE' ? 'Tujuan' : 'Catatan / Detail Barang'}
                        </label>
                        <div className="relative group">
                          <div className="absolute top-5 left-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                              <FileText className="w-6 h-6" />
                          </div>
                          <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={service === 'CASH' ? 'Contoh: Rp 500.000' : 'Tulis detail disini...'}
                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-sm text-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 outline-none h-32 resize-none transition-all shadow-xl placeholder:text-slate-600"
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOrder}
                      className={`w-full py-5 rounded-[2rem] font-black text-white shadow-2xl transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-[0.3em] bg-gradient-to-tr ${activeService?.color} shadow-cyan-500/20 animate-shimmer`}
                    >
                      <Truck size={20} />
                      Panggil Anjelo
                    </motion.button>
                  </motion.div>
                )}

                {/* STATE: SEARCHING */}
                {state === 'SEARCHING' && (
                  <motion.div 
                    key="searching"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-16 text-center"
                  >
                    <div className="relative w-40 h-40 mx-auto mb-10">
                      <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute inset-4 border-2 border-blue-500/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                      <div className={`absolute inset-8 border-4 rounded-full animate-spin-slow ${activeService?.text.replace('text-', 'border-')}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {activeService && <activeService.icon className={`w-16 h-16 ${activeService.text} drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]`} />}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Mencari Mitra...</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Menghubungkan dengan kurir terdekat</p>
                  </motion.div>
                )}

                {/* STATE: FOUND */}
                {state === 'FOUND' && assignedDriver && (
                  <motion.div 
                    key="found"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col h-full space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${isArrived ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} rounded-2xl flex items-center justify-center border`}>
                          {isArrived ? <MapPin size={22} className="animate-bounce" /> : <CheckCircle size={22} />}
                        </div>
                        <div>
                            <h3 className="font-black text-white tracking-tight">{isArrived ? 'Driver Sudah Sampai!' : 'Kurir Ditemukan!'}</h3>
                            <p className={`text-[9px] font-black ${isArrived ? 'text-blue-500' : 'text-emerald-500'} uppercase tracking-widest`}>{isArrived ? 'Silakan Menuju Titik Temu' : 'Siap Meluncur'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                        <Clock size={14} className="text-cyan-400" />
                        <span className="uppercase tracking-widest">{isArrived ? 'SEKARANG' : '3 Mnt'}</span>
                      </div>
                    </div>
                    
                    {/* Advanced Tracking Map */}
                    <div className="w-full h-56 rounded-[2.5rem] overflow-hidden border border-white/10 relative shadow-2xl group">
                      <MapContainer center={driverPos} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={userPos} icon={userIcon}>
                          <Popup>Lokasi Anda</Popup>
                        </Marker>
                        <Marker position={driverPos} icon={driverIcon}>
                          <Popup>Kurir: {assignedDriver.name}</Popup>
                        </Marker>
                        <RecenterMap coords={driverPos} />
                      </MapContainer>
                      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/80 backdrop-blur-2xl p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40 animate-pulse rounded-full"></div>
                            <Navigation className="w-5 h-5 text-cyan-400 relative" />
                          </div>
                          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Live Tracking</span>
                      </div>
                      {isArrived && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-4 left-4 right-4 z-[1000] bg-blue-600 text-white p-3 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center gap-2"
                        >
                          <AlertCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Driver berada di lokasi penjemputan</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl p-5 rounded-[2rem] flex items-center gap-5 border border-white/10 shadow-xl relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${isArrived ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                        <User size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white text-lg tracking-tight truncate">{assignedDriver.name}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-cyan-400 font-mono text-[10px] font-black uppercase tracking-widest">{assignedDriver.plate}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                            <span className="text-xs font-black text-white">{assignedDriver.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setState('COMPLETED')}
                        className={`col-span-2 ${isArrived ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30 animate-pulse' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-600/20'} text-white py-4 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all haptic-press text-[10px] uppercase tracking-widest mb-2`}
                      >
                        <CheckCircle size={20} /> {isArrived ? 'Konfirmasi Selesai' : 'Selesaikan Pesanan'}
                      </button>
                      <a 
                        href={`https://wa.me/628123456789?text=Halo%20${encodeURIComponent(assignedDriver.name)},%20saya%20${encodeURIComponent(user.name)}%20dari%20Anjelo.%20Posisi%20saya%20di%20${encodeURIComponent('RW 05 Yosomulyo')}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366] text-white py-4 rounded-2xl font-black shadow-2xl shadow-green-600/20 hover:bg-[#128C7E] flex items-center justify-center gap-3 transition-all haptic-press text-[10px] uppercase tracking-widest"
                      >
                        <MessageCircle size={20} /> WhatsApp
                      </a>
                      <div className="flex gap-2">
                          <a 
                            href="tel:+628123456789"
                            className="flex-1 bg-white/5 text-white p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center border border-white/10 haptic-press"
                          >
                              <Phone size={20} />
                          </a>
                          <button onClick={onClose} className="flex-1 bg-white/5 text-slate-400 p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center border border-white/10 haptic-press">
                            <X size={20} />
                          </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STATE: COMPLETED */}
                {state === 'COMPLETED' && (
                  <motion.div 
                    key="completed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center space-y-8"
                  >
                    <div className="relative w-48 h-48 mx-auto">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl"
                      ></motion.div>
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                        className="relative z-10 w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] border-4 border-white/20"
                      >
                        <CheckCircle size={80} className="text-white" strokeWidth={3} />
                      </motion.div>
                      
                      {/* Particle effects */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0, 1.5, 0],
                            x: Math.cos(i * 60 * Math.PI / 180) * 100,
                            y: Math.sin(i * 60 * Math.PI / 180) * 100
                          }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.1, repeat: Infinity }}
                          className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-400 rounded-full"
                        />
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-4xl font-black text-white tracking-tighter">Layanan Selesai!</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Terima kasih telah menggunakan Anjelo</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rating Layanan</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={20} className="text-amber-400" fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <div className="h-[1px] bg-white/5 w-full"></div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Total Biaya</span>
                        <span className="text-white">Rp 15.000</span>
                      </div>
                    </div>

                    <button 
                      onClick={onClose}
                      className="w-full py-5 rounded-[2rem] bg-white text-slate-950 font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-200 transition-all"
                    >
                      Kembali ke Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnjeloSystem;
