
import React, { useState, useEffect } from 'react';
import { Truck, Bike, DollarSign, FileText, Trash2, X, MapPin, User, Star, CheckCircle, MessageCircle, Phone, Navigation, Compass, Clock } from 'lucide-react';
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
  const [state, setState] = useState<'SELECT' | 'INPUT' | 'SEARCHING' | 'FOUND'>('SELECT');
  const [service, setService] = useState<'PACKAGE' | 'RIDE' | 'CASH' | 'TRASH' | 'DOCS'>('PACKAGE');
  const [note, setNote] = useState('');
  const [assignedDriver, setAssignedDriver] = useState<{name: string, plate: string, rating: number} | null>(null);
  const [driverPos, setDriverPos] = useState<[number, number]>([-5.115, 105.305]);
  const userPos: [number, number] = [-5.118, 105.308]; // Yosomulyo area

  // Simulate driver movement
  useEffect(() => {
    if (state === 'FOUND') {
      const interval = setInterval(() => {
        setDriverPos(prev => [
          prev[0] + (userPos[0] - prev[0]) * 0.1,
          prev[1] + (userPos[1] - prev[1]) * 0.1
        ]);
      }, 3000);
      return () => clearInterval(interval);
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
    { id: 'PACKAGE', label: 'Antar Paket', icon: Truck, color: 'bg-orange-100 text-orange-600', accent: 'bg-orange-500' },
    { id: 'RIDE', label: 'Ojek Desa', icon: Bike, color: 'bg-green-100 text-green-600', accent: 'bg-green-500' },
    { id: 'CASH', label: 'Tarik Tunai', icon: DollarSign, color: 'bg-blue-100 text-blue-600', accent: 'bg-blue-500' },
    { id: 'TRASH', label: 'Jemput Sampah', icon: Trash2, color: 'bg-yellow-100 text-yellow-600', accent: 'bg-yellow-500' },
    { id: 'DOCS', label: 'Kirim Dokumen', icon: FileText, color: 'bg-purple-100 text-purple-600', accent: 'bg-purple-500' },
  ];

  const activeService = services.find(s => s.id === service);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border border-white/20 ring-1 ring-black/5"
          >
            
            {/* Header */}
            <div className={`p-8 text-white relative transition-all duration-500 overflow-hidden ${activeService?.accent || 'bg-slate-800'}`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <motion.div 
                key={service}
                initial={{ opacity: 0, x: 20, rotate: 12 }}
                animate={{ opacity: 0.2, x: 0, rotate: 12 }}
                className="absolute -right-10 -top-10 transform scale-150"
              >
                  {activeService && <activeService.icon size={120} />}
              </motion.div>
              
              <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition backdrop-blur-sm">
                <X size={20} />
              </button>
              
              <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Anjelo System</h2>
                  </div>
                  <p className="text-white/90 text-sm font-medium ml-1">Layanan Logistik & Mobilitas Desa</p>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* STATE: SELECT SERVICE */}
                {state === 'SELECT' && (
                  <motion.div 
                    key="select"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-bold text-slate-800 mb-5 text-lg">Pilih Layanan</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setService(s.id as any); setState('INPUT'); }}
                          className="p-5 rounded-2xl border border-white/50 bg-white/50 shadow-sm hover:shadow-md hover:bg-white transition text-left group active:scale-95"
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${s.color}`}>
                            <s.icon size={24} />
                          </div>
                          <span className="font-bold text-slate-700 group-hover:text-slate-900 text-sm">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STATE: INPUT DETAILS */}
                {state === 'INPUT' && (
                  <motion.div 
                    key="input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/50">
                      <div className={`p-3 rounded-xl ${activeService?.color}`}>
                        {activeService && <activeService.icon size={24} />}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Layanan Aktif</p>
                        <p className="font-bold text-slate-800 text-lg">{activeService?.label}</p>
                      </div>
                      <button onClick={() => setState('SELECT')} className="ml-auto text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-full transition">Ubah</button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider ml-1">Lokasi Penjemputan</label>
                        <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                          <div className="p-2 bg-red-50 rounded-full">
                              <MapPin className="text-red-500 w-5 h-5 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">Rumah {user.name}</p>
                            <p className="text-xs text-slate-500">RW 05, Kelurahan Yosomulyo</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider ml-1">
                          {service === 'CASH' ? 'Nominal Penarikan' : service === 'RIDE' ? 'Tujuan' : 'Catatan / Detail Barang'}
                        </label>
                        <div className="relative">
                          <div className="absolute top-3.5 left-4 text-slate-400">
                              <FileText className="w-5 h-5" />
                          </div>
                          <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={service === 'CASH' ? 'Contoh: Rp 500.000' : 'Tulis detail disini...'}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-28 resize-none transition shadow-sm"
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleOrder}
                      className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-orange-500/20 transition transform active:scale-[0.98] hover:translate-y-[-2px] text-lg flex items-center justify-center gap-2 ${activeService?.accent}`}
                    >
                      <Truck size={20} />
                      Panggil Anjelo
                    </button>
                  </motion.div>
                )}

                {/* STATE: SEARCHING */}
                {state === 'SEARCHING' && (
                  <motion.div 
                    key="searching"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute inset-0 border-4 border-slate-200 rounded-full animate-ping animation-delay-500"></div>
                      <div className={`absolute inset-2 border-4 rounded-full animate-pulse ${activeService?.color.replace('bg-', 'border-').replace('100', '200')}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {activeService && <activeService.icon className={`w-12 h-12 ${activeService.color.split(' ')[1]}`} />}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Mencari Mitra...</h3>
                    <p className="text-slate-500 font-medium">Menghubungkan dengan kurir terdekat</p>
                  </motion.div>
                )}

                {/* STATE: FOUND */}
                {state === 'FOUND' && assignedDriver && (
                  <motion.div 
                    key="found"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <CheckCircle size={18} />
                        </div>
                        <h3 className="font-black text-slate-800">Kurir Ditemukan!</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        <Clock size={12} />
                        <span>3 mnt</span>
                      </div>
                    </div>
                    
                    {/* Advanced Geospatial Integration */}
                    <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 mb-4 relative shadow-inner">
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
                      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-lg flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-blue-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Live Tracking</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl flex items-center space-x-4 text-left border border-slate-200 shadow-sm mb-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 shadow-sm">
                        <User size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{assignedDriver.name}</h4>
                        <div className="flex items-center text-[10px] text-slate-500 mt-0.5">
                          <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono mr-2 font-bold">{assignedDriver.plate}</span>
                          <Star className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" />
                          <span className="font-bold">{assignedDriver.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button onClick={onClose} className="flex-1 border border-slate-200 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition text-sm">
                        Tutup
                      </button>
                      <a 
                        href={`https://wa.me/628123456789?text=Halo%20${encodeURIComponent(assignedDriver.name)},%20saya%20${encodeURIComponent(user.name)}%20dari%20Anjelo.%20Posisi%20saya%20di%20${encodeURIComponent('RW 05 Yosomulyo')}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-[#128C7E] flex items-center justify-center gap-2 transition transform active:scale-95 text-sm"
                      >
                        <MessageCircle size={18} /> WhatsApp
                      </a>
                      <a 
                        href="tel:+628123456789"
                        className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-slate-200 transition flex items-center justify-center"
                      >
                          <Phone size={18} />
                      </a>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 blur-md opacity-40 animate-pulse rounded-full"></div>
                                <Navigation className="w-5 h-5 text-blue-600 relative" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Auto-Share Live</p>
                                <p className="text-xs text-blue-800 font-bold">Berbagi Lokasi Aktif</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black text-blue-600 tracking-tighter">LIVE</span>
                        </div>
                    </div>
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
