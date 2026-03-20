
import React, { useState, useEffect, useRef } from 'react';
import { IOT_SENSORS, MOCK_USER, FLOOD_AREAS } from '../constants';
import { CloudRain, Trash2, Wind, RefreshCw, Wifi, QrCode, X, CheckCircle, Smartphone, ScanBarcode, Camera, Zap, Scale, ArrowRight, Database, Coins, Milk, FileText, Disc, Droplet, Truck, History, Map as MapIcon, ChevronRight, Leaf, MapPin, Navigation, ExternalLink, Clock } from 'lucide-react';
import { CitizenProfile } from '../types';
import GeospatialEngine from './GeospatialEngine';

interface EnvironmentViewProps {
  user?: CitizenProfile;
  onOpenAnjelo: (service?: any, note?: string) => void;
  onOpenAiAssistant?: () => void;
}

const TRASH_TYPES = [
  { 
    id: 'Plastik', 
    label: 'Plastik', 
    desc: 'Botol, Gelas', 
    rateData: 0.4, 
    ratePoints: 50, 
    activeClass: 'bg-blue-50 border-blue-500 ring-1 ring-blue-500', 
    iconClass: 'bg-blue-100 text-blue-600',
    icon: Milk,
    unit: 'KG'
  }, 
  { 
    id: 'Kertas', 
    label: 'Kertas', 
    desc: 'Kardus, Koran', 
    rateData: 0.2, 
    ratePoints: 20, 
    activeClass: 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500', 
    iconClass: 'bg-yellow-100 text-yellow-600',
    icon: FileText,
    unit: 'KG'
  },
  { 
    id: 'Logam', 
    label: 'Logam', 
    desc: 'Kaleng, Besi', 
    rateData: 0.8, 
    ratePoints: 100, 
    activeClass: 'bg-slate-100 border-slate-500 ring-1 ring-slate-500', 
    iconClass: 'bg-slate-200 text-slate-700',
    icon: Disc,
    unit: 'KG'
  },
  { 
    id: 'Minyak', 
    label: 'Minyak', 
    desc: 'Jelantah', 
    rateData: 0.5, 
    ratePoints: 60, 
    activeClass: 'bg-orange-50 border-orange-500 ring-1 ring-orange-500', 
    iconClass: 'bg-orange-100 text-orange-600',
    icon: Droplet,
    unit: 'LITER'
  },
];

const EnvironmentView: React.FC<EnvironmentViewProps> = ({ user = MOCK_USER, onOpenAnjelo, onOpenAiAssistant }) => {
  // QR Code Modal State (For User to show)
  const [showQrModal, setShowQrModal] = useState(false);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'INPUT' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  
  // Transaction Data
  const [trashInput, setTrashInput] = useState({ type: TRASH_TYPES[0].id, weight: '' });
  const [calculatedReward, setCalculatedReward] = useState({ data: 0, points: 0 });

  // Scanner State (For User to scan others/tags)
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerData, setScannerData] = useState<string | null>(null);

  // Bank Sampah Map State
  const [showBankMap, setShowBankMap] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);

  const BANK_SAMPAH_MARKERS = [
    { id: 'bs1', position: { lat: -5.1186, lng: 105.3072 }, title: 'Bank Sampah Payungi', type: 'REPORT' as const, color: '#10b981', data: { address: 'Jl. Utama No. 12', hours: '08:00 - 16:00' } },
    { id: 'bs2', position: { lat: -5.1150, lng: 105.3040 }, title: 'Bank Sampah RW 02', type: 'REPORT' as const, color: '#10b981', data: { address: 'Jembatan RW 02', hours: '09:00 - 15:00' } },
    { id: 'bs3', position: { lat: -5.1200, lng: 105.3090 }, title: 'Bank Sampah Melati', type: 'REPORT' as const, color: '#10b981', data: { address: 'Posyandu Melati', hours: '08:00 - 12:00' } },
  ];

  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScannerOpen && !scannerData) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          // Fallback simulation if camera fails or denied
          const scanTimer = setTimeout(() => {
            setScannerData("TAG-8821: Verified Source (Simulated)");
          }, 5000);
          return () => clearTimeout(scanTimer);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerOpen, scannerData]);

  // Simulate scanning a code presented by someone else or a tag
  useEffect(() => {
    let scanTimer: ReturnType<typeof setTimeout>;
    if (isScannerOpen && !scannerData) {
      // Auto-detect after 4 seconds of camera view
      scanTimer = setTimeout(() => {
        setScannerData("TAG-8821: Verified Source");
      }, 4000);
    }
    return () => clearTimeout(scanTimer);
  }, [isScannerOpen, scannerData]);

  // Transition from scanning (QR or Camera) to Input
  const handleSimulateScan = () => {
    setScanStatus('SCANNING');
    // Simulate API delay
    setTimeout(() => {
      setScanStatus('INPUT');
    }, 1500);
  };

  const handleTagScanSuccess = () => {
    setIsScannerOpen(false);
    setScannerData(null);
    setShowQrModal(true);
    setScanStatus('INPUT');
  };

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
    setScannerData(null);
  };

  const handleConfirmTransaction = () => {
    setScanStatus('PROCESSING');
    setTimeout(() => {
      setScanStatus('SUCCESS');
    }, 2000);
  };

  const activeTrashType = TRASH_TYPES.find(t => t.id === trashInput.type) || TRASH_TYPES[0];

  const menuItems = [
      { id: 'DROP', label: 'Tukar Sampah', icon: QrCode, color: 'text-white', bg: 'bg-green-600', action: () => { setShowQrModal(true); setScanStatus('IDLE'); } },
      { id: 'PICKUP', label: 'Jemput', icon: Truck, color: 'text-green-600', bg: 'bg-green-100', action: () => onOpenAnjelo('TRASH') },
      { id: 'MAP', label: 'Bank Sampah', icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-100', action: () => setShowBankMap(true) },
      { id: 'HISTORY', label: 'Riwayat', icon: History, color: 'text-orange-600', bg: 'bg-orange-100', action: () => {} },
  ];

  return (
    <div className="space-y-6 relative pb-24 md:pb-0">
      
      {/* 1. HERO SECTION: TRASH BALANCE */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-800 text-white shadow-xl p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <Wifi size={14} className="text-green-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">WargaNeT</span>
                  </div>
                  <Wifi size={20} className="opacity-80" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div>
                      <p className="text-green-200 text-xs font-medium mb-1">Kuota Internet</p>
                      <div className="flex items-baseline gap-1">
                          <h2 className="text-4xl font-black tracking-tighter">12.5</h2>
                          <span className="text-lg font-bold opacity-80">GB</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-green-200 text-xs font-medium mb-1">Poin Lingkungan</p>
                      <div className="flex items-baseline justify-end gap-1">
                          <h2 className="text-4xl font-black tracking-tighter">450</h2>
                          <span className="text-lg font-bold opacity-80">XP</span>
                      </div>
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-green-100">
                  <span>Total Sampah: 45kg</span>
                  <div className="flex items-center gap-1">
                      <span>Status: </span>
                      <span className="bg-green-400/20 text-green-200 px-2 py-0.5 rounded font-bold border border-green-400/30">Active</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. ICON MENU GRID (MOBILE FIRST) */}
      <div>
          <h3 className="text-sm font-bold text-white mb-3 ml-1">Layanan Lingkungan</h3>
          <div className="grid grid-cols-4 gap-3">
              {menuItems.map((item) => (
                  <button 
                      key={item.id}
                      onClick={item.action}
                      className="flex flex-col items-center gap-2 group transition-all duration-300"
                  >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 border border-transparent ${item.bg} ${item.color === 'text-white' ? 'shadow-lg shadow-green-600/30' : 'border-slate-100'}`}>
                          <item.icon size={24} strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-bold text-white text-center leading-tight">
                          {item.label}
                      </span>
                  </button>
              ))}
          </div>
      </div>

      {/* 3. TRASH TYPES (HORIZONTAL SCROLL) */}
      <div>
          <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-sm font-bold text-white">Kurs Tukar Sampah</h3>
              <button className="text-xs font-bold text-green-600 flex items-center hover:underline bg-white/10 px-2 py-1 rounded text-white">
                  Lihat Semua <ChevronRight size={12} />
              </button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {TRASH_TYPES.map((type) => (
                  <div key={type.id} className="min-w-[140px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-green-300 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${type.iconClass}`}>
                          <type.icon size={20} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5">{type.label}</h4>
                      <p className="text-[10px] text-slate-400 mb-2">{type.desc}</p>
                      <div className="bg-slate-50 px-2 py-1 rounded-lg w-full">
                          <p className="text-xs font-bold text-green-600">{type.rateData} GB <span className="text-slate-400 font-normal">/ {type.unit.toLowerCase()}</span></p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 4. IOT MONITORING (COMPACT) */}
      <div>
          <div className="flex justify-between items-center mb-3 ml-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wifi size={16} className="text-blue-500" /> IoT Sensor
            </h3>
            <button 
              onClick={onOpenAiAssistant}
              className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold shadow-lg hover:bg-blue-500 transition"
            >
              Analisis AI
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {IOT_SENSORS.map((sensor) => (
                  <div key={sensor.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden">
                      <div className={`p-3 rounded-xl shrink-0 ${
                          sensor.type === 'FLOOD' ? 'bg-blue-100 text-blue-600' :
                          sensor.type === 'AIR_QUALITY' ? 'bg-teal-100 text-teal-600' :
                          'bg-orange-100 text-orange-600'
                      }`}>
                          {sensor.type === 'FLOOD' && <CloudRain size={20} />}
                          {sensor.type === 'AIR_QUALITY' && <Wind size={20} />}
                          {sensor.type === 'WASTE_LEVEL' && <Trash2 size={20} />}
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sensor.location}</p>
                          <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-slate-800">{sensor.value}</span>
                              <span className="text-xs font-medium text-slate-500">{sensor.unit}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              sensor.status === 'SAFE' ? 'bg-green-100 text-green-700' :
                              sensor.status === 'WARNING' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                              {sensor.status}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 5. FLOOD MAP (COMPACT) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center">
                    <CloudRain className="w-4 h-4 mr-2 text-blue-600" />
                    Peta Rawan Genangan
                </h3>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">AMAN</span>
            </div>
            <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 relative overflow-hidden group mb-3">
                <GeospatialEngine 
                    markers={FLOOD_AREAS.map(f => ({
                        ...f,
                        type: 'REPORT',
                        color: f.status === 'DANGER' ? '#ef4444' : f.status === 'WARNING' ? '#f59e0b' : '#10b981'
                    }))}
                    className="w-full h-full"
                    zoom={14}
                    center={{ lat: -5.1186, lng: 105.3072 }}
                />
            </div>
            <div className="flex space-x-2">
                <button className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition border border-red-100">
                    Sirine Darurat
                </button>
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                    Broadcast WA
                </button>
            </div>
      </div>

      {/* Main Transaction Modal (Existing Logic) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 text-center relative">
              <button 
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg">Trash-for-Data</h3>
              <p className="text-xs text-slate-300 mt-1">
                {scanStatus === 'SUCCESS' ? 'Transaksi Berhasil' : 
                 scanStatus === 'INPUT' ? 'Input Detail Sampah' :
                 scanStatus === 'CONFIRM' ? 'Konfirmasi Penukaran' : 'Identifikasi Warga'}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6">
              
              {/* Step 1: IDLE - Show QR */}
              {scanStatus === 'IDLE' && (
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={handleSimulateScan}>
                    <div className="p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-xl">
                       <QrCode size={160} className="text-slate-900" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
                       ID: {user.name.replace(/\s+/g, '').toUpperCase()}-ENV-001
                    </div>
                  </div>

                  <div className="mt-10 text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-slate-600 bg-slate-50 py-2 px-4 rounded-full text-xs font-medium border border-slate-200">
                      <Smartphone size={14} />
                      <span>Tunjukkan ke Petugas Bank Sampah</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 w-full flex justify-center">
                     <button 
                        onClick={handleSimulateScan}
                        className="text-xs text-slate-400 hover:text-blue-600 underline"
                     >
                        [Simulasi Petugas Scan QR]
                     </button>
                  </div>
                </div>
              )}

              {/* Step 1.5: SCANNING Animation */}
              {scanStatus === 'SCANNING' && (
                 <div className="py-12 flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 mb-4">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-medium">Verifikasi Identitas...</p>
                 </div>
              )}

              {/* Step 2: INPUT Details */}
              {scanStatus === 'INPUT' && (
                <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Jenis Sampah</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TRASH_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setTrashInput({...trashInput, type: type.id})}
                                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 group ${
                                        trashInput.type === type.id
                                        ? type.activeClass
                                        : 'border-slate-100 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${type.iconClass}`}>
                                        <type.icon size={16} />
                                    </div>
                                    <div className={`font-bold text-sm ${trashInput.type === type.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {type.label}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{type.desc}</div>
                                    
                                    {trashInput.type === type.id && (
                                        <div className="absolute top-2 right-2 text-green-500">
                                            <CheckCircle size={14} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Berat / Volume</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={trashInput.weight}
                                onChange={(e) => setTrashInput({...trashInput, weight: e.target.value})}
                                placeholder="0.0"
                                className="w-full text-4xl font-bold p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-300 text-center"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100 text-xs font-bold text-slate-500 pointer-events-none uppercase">
                                {activeTrashType.unit}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
                         <div className="flex items-center space-x-2">
                             <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                <Scale className="w-4 h-4" />
                             </div>
                             <div>
                                <span className="block text-[10px] text-blue-400 font-bold uppercase">Estimasi</span>
                                <span className="text-xs text-blue-700 font-medium">Reward Anda</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="font-bold text-blue-800 text-lg leading-tight">{calculatedReward.data} GB</div>
                             <div className="text-[10px] text-blue-500 font-medium bg-white px-1.5 py-0.5 rounded-full inline-block shadow-sm">
                                +{calculatedReward.points} Poin
                             </div>
                         </div>
                    </div>

                    <button 
                        onClick={() => setScanStatus('CONFIRM')}
                        disabled={!trashInput.weight || parseFloat(trashInput.weight) <= 0}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
                    >
                        Lanjut ke Konfirmasi
                    </button>
                </div>
              )}

              {/* Step 3: CONFIRMATION */}
              {scanStatus === 'CONFIRM' && (
                <div className="animate-in slide-in-from-right-10 duration-300">
                    <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-center border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Konfirmasi Penukaran</p>
                        <h3 className="text-3xl font-bold text-slate-800 mb-6">
                            {trashInput.weight} {activeTrashType.unit} <span className="text-lg font-normal text-slate-500 block mt-1">{activeTrashType.label}</span>
                        </h3>
                        
                        <div className="flex items-center justify-center space-x-2">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 min-w-[100px] flex flex-col items-center">
                                <div className="p-2 bg-blue-50 rounded-full mb-2">
                                    <Database className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="font-bold text-slate-800">{calculatedReward.data} GB</div>
                                <div className="text-[10px] text-slate-400 font-medium">Data Internet</div>
                            </div>
                            <div className="text-slate-300">
                                <ArrowRight size={16} />
                            </div>
                             <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 min-w-[100px] flex flex-col items-center">
                                <div className="p-2 bg-yellow-50 rounded-full mb-2">
                                    <Coins className="w-4 h-4 text-yellow-600" />
                                </div>
                                <div className="font-bold text-slate-800">{calculatedReward.points}</div>
                                <div className="text-[10px] text-slate-400 font-medium">Poin Sosial</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleConfirmTransaction}
                            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-600/30 hover:bg-green-700 transition"
                        >
                            Konfirmasi & Tukar
                        </button>
                        <button 
                            onClick={() => setScanStatus('INPUT')}
                            className="w-full bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-medium hover:bg-slate-50 transition"
                        >
                            Kembali / Edit
                        </button>
                    </div>
                </div>
              )}

              {/* Step 3.5: PROCESSING */}
              {scanStatus === 'PROCESSING' && (
                <div className="py-12 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Database className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">Memproses Transaksi</h4>
                    <p className="text-slate-500 text-sm mt-1">Mengirim data ke server...</p>
                </div>
              )}

              {/* Step 4: SUCCESS */}
              {scanStatus === 'SUCCESS' && (
                <div className="text-center py-4 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Penukaran Berhasil!</h4>
                  <p className="text-slate-500 text-sm mt-2 mb-6">
                    Saldo internet dan poin sosial telah ditambahkan ke akun Anda.
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                      <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 mb-2">
                          <span className="text-slate-500">ID Transaksi</span>
                          <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">TRX-{Math.floor(Math.random()*10000)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Waktu</span>
                          <span className="text-slate-700 font-medium">{new Date().toLocaleTimeString()}</span>
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowQrModal(false)}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
                  >
                    Selesai
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Interface (Camera Overlay) */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col animate-in fade-in duration-300">
          {/* Scanner Header */}
          <div className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-green-400" />
              <span className="font-bold tracking-wider">ENV-SCANNER</span>
            </div>
            <button onClick={handleCloseScanner} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <X size={20} />
            </button>
          </div>

          {/* Camera Viewport */}
          <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
            
            {!scannerData ? (
                <>
                {/* Real Camera Feed */}
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                
                {/* Overlay UI */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_rgba(0,0,0,0.5)_70%)]"></div>
                
                {/* Viewfinder */}
                <div className="relative w-64 h-64 border-2 border-white/30 rounded-3xl overflow-hidden z-20">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl"></div>
                    
                    {/* Laser Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.8)] animate-[scan_2s_infinite_linear]"></div>
                </div>
                <div className="absolute mt-80 text-center z-20">
                    <p className="text-sm font-medium animate-pulse text-white drop-shadow-md">Searching for Trash Tag...</p>
                    <p className="text-xs text-gray-400 mt-1">Align barcode within frame</p>
                </div>
                </>
            ) : (
                /* Success Result for Scanner - Auto transition */
                <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-sm w-full mx-6 text-center shadow-2xl animate-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Tag Detected</h3>
                    <div className="bg-slate-100 p-3 rounded-lg font-mono text-sm mb-4 border border-slate-200">
                        {scannerData}
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Processing...</p>
                    {/* Auto-click helper for simulation flow */}
                    {setTimeout(() => handleTagScanSuccess(), 1000) && null}
                </div>
            )}
          </div>

          {/* Scanner Footer */}
          {!scannerData && (
             <div className="p-6 bg-black/80 backdrop-blur-sm flex justify-center space-x-8">
                <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition">
                    <div className="p-3 bg-white/10 rounded-full">
                        <Zap size={20} />
                    </div>
                    <span className="text-[10px]">Flash</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition">
                     <div className="p-3 bg-white/10 rounded-full">
                        <RefreshCw size={20} />
                    </div>
                    <span className="text-[10px]">Flip</span>
                </button>
             </div>
          )}
        </div>
      )}
      
      {/* CSS for Scan Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 16px; }
          50% { top: 90%; }
          100% { top: 16px; }
        }
      `}</style>
      {/* 5. BANK SAMPAH MAP MODAL */}
      {showBankMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">Lokasi Bank Sampah</h3>
                          <p className="text-sm text-slate-500">Temukan titik penukaran sampah terdekat</p>
                      </div>
                      <button 
                        onClick={() => setShowBankMap(false)}
                        className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 relative">
                      <GeospatialEngine 
                        markers={BANK_SAMPAH_MARKERS}
                        onMarkerClick={(marker) => setSelectedBank(marker)}
                        className="w-full h-full"
                        showUserLocation={true}
                      />

                      {selectedBank && (
                          <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 bg-white rounded-2xl shadow-2xl p-4 border border-slate-200 animate-in slide-in-from-bottom-4 duration-300 z-20">
                              <button 
                                onClick={() => setSelectedBank(null)}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                              >
                                  <X size={16} />
                              </button>
                              <div className="flex items-start space-x-3 mb-3">
                                  <div className="mt-1 p-2 bg-green-100 text-green-600 rounded-lg">
                                      <Trash2 size={20} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800 text-sm">{selectedBank.title}</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">{selectedBank.data.address}</p>
                                      <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          <Clock size={10} />
                                          <span>Jam Operasional: {selectedBank.data.hours}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Buka Sekarang</span>
                                  </div>
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedBank.position.lat},${selectedBank.position.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                      Navigasi <ExternalLink size={10} />
                                  </a>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default EnvironmentView;
