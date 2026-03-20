
import React, { useState, useEffect } from 'react';
import { Car, MapPin, CreditCard, QrCode, Ticket, CheckCircle, TrendingUp, Wallet, Wifi, User, Bike, Smartphone, Building, Printer, X, History, Activity, Zap, Radio, ScanLine, ArrowRight, ArrowUpCircle, ArrowDownCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { PARKING_ZONES, MOCK_USER } from '../constants';
import { ParkingZone, CitizenProfile } from '../types';

interface ParkingViewProps {
  user?: CitizenProfile;
}

interface ParkingLog {
    id: string;
    plate: string;
    type: 'IN' | 'OUT';
    time: string;
    gate: string;
}

const ParkingView: React.FC<ParkingViewProps> = ({ user = MOCK_USER }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MAP' | 'POS'>('MAP');
  const [zones, setZones] = useState<ParkingZone[]>(PARKING_ZONES);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [isVisitorMode, setIsVisitorMode] = useState(false);

  // Dashboard Live State
  const [gateStatus, setGateStatus] = useState<'OPEN' | 'CLOSED'>('CLOSED');
  const [recentLogs, setRecentLogs] = useState<ParkingLog[]>([
      { id: '1', plate: 'BE 2819 YD', type: 'IN', time: '10:42', gate: 'Gate 1 (Utara)' },
      { id: '2', plate: 'B 1234 CD', type: 'OUT', time: '10:40', gate: 'Gate 2 (Selatan)' },
      { id: '3', plate: 'BE 4567 AA', type: 'IN', time: '10:35', gate: 'Gate 1 (Utara)' },
  ]);

  // POS State
  const [vehicleType, setVehicleType] = useState<'MOTOR' | 'MOBIL'>('MOTOR');
  const [plateNumber, setPlateNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'EMONEY' | 'CASH' | null>(null);
  const [simulationState, setSimulationState] = useState<'IDLE' | 'WAITING_TAP' | 'SCANNING' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [ticketPrinted, setTicketPrinted] = useState(false);

  // Effect: Handle Mode Switch
  useEffect(() => {
      if (isVisitorMode && activeTab === 'POS') {
          setActiveTab('DASHBOARD');
      }
  }, [isVisitorMode, activeTab]);

  // Simulation: Live Data Updates
  useEffect(() => {
    const interval = setInterval(() => {
        // 1. Update Zone Data
        setZones(prev => prev.map(z => {
            if (Math.random() > 0.7) {
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
                const newOccupancy = Math.max(0, Math.min(z.capacity, z.occupied + change));
                return {
                    ...z,
                    occupied: newOccupancy,
                    status: newOccupancy >= z.capacity ? 'FULL' : 'OPEN',
                    revenueToday: z.revenueToday + (change > 0 ? (z.id === 'pz4' ? 5000 : 2000) : 0)
                };
            }
            return z;
        }));

        // 2. Simulate Random Gate Activity
        if (Math.random() > 0.6) {
            const types: ('IN' | 'OUT')[] = ['IN', 'OUT'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const randomPlate = `BE ${Math.floor(Math.random() * 9000 + 1000)} ${['AB', 'XY', 'YZ'][Math.floor(Math.random() * 3)]}`;
            
            const newLog: ParkingLog = {
                id: Date.now().toString(),
                plate: randomPlate,
                type: randomType,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                gate: randomType === 'IN' ? 'Gate 1 (Utara)' : 'Gate 2 (Selatan)'
            };
            setRecentLogs(prev => [newLog, ...prev.slice(0, 4)]);
            setGateStatus('OPEN');
            setTimeout(() => setGateStatus('CLOSED'), 2000);
        }

    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalRevenue = zones.reduce((acc, z) => acc + z.revenueToday, 0);
  const totalOccupancy = zones.reduce((acc, z) => acc + z.occupied, 0);
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
  const occupancyRate = Math.round((totalOccupancy / totalCapacity) * 100);

  const handleZoneClick = (zone: ParkingZone) => {
      if (isVisitorMode) return;
      setSelectedZone(zone);
      setActiveTab('POS');
  };

  const handleProcessPayment = (method: 'QRIS' | 'EMONEY' | 'CASH') => {
      setPaymentMethod(method);
      
      if (method === 'EMONEY') {
          setSimulationState('WAITING_TAP');
          // Simulate Tap after 3 seconds
          setTimeout(() => {
              setSimulationState('PROCESSING');
              finalizePayment();
          }, 3000);
      } else if (method === 'QRIS') {
          setSimulationState('SCANNING');
          // Simulate Scan after 3 seconds
          setTimeout(() => {
              setSimulationState('PROCESSING');
              finalizePayment();
          }, 3000);
      } else {
          setSimulationState('PROCESSING');
          finalizePayment();
      }
  };

  const finalizePayment = () => {
      setTimeout(() => {
          setSimulationState('SUCCESS');
          setTicketPrinted(true);
          
          if (selectedZone) {
              setZones(prev => prev.map(z => 
                  z.id === selectedZone.id 
                  ? { ...z, occupied: Math.min(z.capacity, z.occupied + 1), revenueToday: z.revenueToday + (vehicleType === 'MOTOR' ? 2000 : 5000) } 
                  : z
              ));
          }
      }, 1500);
  }

  const resetPos = () => {
      setPlateNumber('');
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setSimulationState('IDLE');
      setTicketPrinted(false);
  };

  const calculateFee = () => vehicleType === 'MOTOR' ? 2000 : 5000;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
       
       {/* SIDEBAR NAVIGATION */}
       <div className="w-full md:w-64 flex flex-col gap-4">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                       <Car size={24} />
                   </div>
                   <div>
                       <h2 className="font-bold text-slate-800">WargaParkir</h2>
                       <p className="text-xs text-slate-500">Mobilitas Terpusat</p>
                   </div>
               </div>
               
               {/* Mode Switcher */}
               <div className="bg-slate-100 p-1 rounded-lg flex mb-4">
                   <button 
                    onClick={() => setIsVisitorMode(false)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${!isVisitorMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                   >
                       Petugas
                   </button>
                   <button 
                    onClick={() => setIsVisitorMode(true)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${isVisitorMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                   >
                       Pengunjung
                   </button>
               </div>

               <nav className="space-y-2">
                   <button 
                      onClick={() => setActiveTab('DASHBOARD')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                   >
                       <Activity size={18} /> <span className="font-bold text-sm">Dashboard</span>
                   </button>
                   <button 
                      onClick={() => setActiveTab('MAP')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'MAP' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                   >
                       <MapPin size={18} /> <span className="font-bold text-sm">Peta Lokasi</span>
                   </button>
                   {!isVisitorMode && (
                        <button 
                            onClick={() => { setActiveTab('POS'); setSelectedZone(zones[0]); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'POS' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Ticket size={18} /> <span className="font-bold text-sm">Terminal Juru Parkir</span>
                        </button>
                   )}
               </nav>
           </div>

           {/* Live Stats (Hide Revenue for Visitors) */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex-1 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Car size={120} />
               </div>
               
               {isVisitorMode ? (
                   <>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Status Parkir</h3>
                    <div className="text-3xl font-bold mb-1">{100 - occupancyRate}%</div>
                    <div className="flex items-center text-green-400 text-xs font-medium gap-1 mb-6">
                        <CheckCircle size={14} /> Slot Tersedia
                    </div>
                   </>
               ) : (
                   <>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pendapatan Parkir Hari Ini</h3>
                    <div className="text-3xl font-bold mb-1">Rp {totalRevenue.toLocaleString()}</div>
                    <div className="flex items-center text-green-400 text-xs font-medium gap-1 mb-6">
                        <TrendingUp size={14} /> Powered by Livin' Merchant
                    </div>
                   </>
               )}

               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/10 p-3 rounded-xl">
                       <p className="text-[10px] text-slate-300 uppercase">Okupansi</p>
                       <p className="text-xl font-bold">{occupancyRate}%</p>
                   </div>
                   <div className="bg-white/10 p-3 rounded-xl">
                       <p className="text-[10px] text-slate-300 uppercase">Kendaraan</p>
                       <p className="text-xl font-bold">{totalOccupancy}</p>
                   </div>
               </div>
           </div>
       </div>

       {/* MAIN CONTENT */}
       <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
           
           {/* DASHBOARD TAB */}
           {activeTab === 'DASHBOARD' && (
               <div className="p-6 overflow-y-auto h-full flex flex-col">
                   
                   {/* Gate & Activity Feed Section - Conditional for Visitor */}
                   {!isVisitorMode && (
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                           {/* Gate Status Widget */}
                           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                               <div className="absolute top-2 left-3 flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">Live Gate Cam</span>
                               </div>
                               
                               <div className={`mt-4 mb-4 transform transition-transform duration-500 ${gateStatus === 'OPEN' ? '-rotate-12 translate-y-[-10px]' : ''}`}>
                                   <div className="w-64 h-4 bg-red-600 rounded-full border-2 border-white shadow-md relative">
                                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%,white_100%)] opacity-30 bg-[length:20px_100%]"></div>
                                   </div>
                               </div>
                               
                               <div className="text-center">
                                   <h3 className="font-bold text-slate-800 text-lg">Main Barrier</h3>
                                   <span className={`text-xs font-bold px-2 py-1 rounded ${gateStatus === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                       STATUS: {gateStatus}
                                   </span>
                               </div>
                           </div>

                           {/* Recent Activity Feed */}
                           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden flex flex-col">
                               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                   <h3 className="font-bold text-slate-800 text-sm">Aktivitas Keluar/Masuk</h3>
                                   <button className="text-xs text-blue-600 font-bold hover:underline">Lihat Semua</button>
                               </div>
                               <div className="flex-1 overflow-y-auto p-0 max-h-64">
                                   {recentLogs.map((log) => (
                                       <div key={log.id} className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition animate-in slide-in-from-right duration-300">
                                           <div className="flex items-center gap-4">
                                               <div className={`p-2 rounded-lg ${log.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                   {log.type === 'IN' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                                               </div>
                                               <div>
                                                   <h4 className="font-bold text-slate-800 text-sm">{log.plate}</h4>
                                                   <p className="text-xs text-slate-500">{log.gate}</p>
                                               </div>
                                           </div>
                                           <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                               {log.time}
                                           </span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   )}

                   <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Building /> {isVisitorMode ? 'Informasi Area Parkir' : 'Zona Parkir Aktif'}
                        </h2>
                        {isVisitorMode && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
                                <Eye size={14} /> Mode Pengunjung
                            </span>
                        )}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {zones.map((zone) => (
                           <div key={zone.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-3 rounded-xl ${zone.status === 'FULL' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                           <Car size={20} />
                                       </div>
                                       <div>
                                           <h3 className="font-bold text-slate-800">{zone.name}</h3>
                                           {!isVisitorMode && <p className="text-xs text-slate-500">Juru Parkir: {zone.attendant}</p>}
                                       </div>
                                   </div>
                                   <span className={`text-[10px] px-2 py-1 rounded font-bold ${zone.status === 'FULL' ? 'bg-red-600 text-white' : 'bg-green-100 text-green-700'}`}>
                                       {zone.status === 'FULL' ? 'PENUH' : 'TERSEDIA'}
                                   </span>
                               </div>
                               
                               <div className="space-y-3">
                                   <div>
                                       <div className="flex justify-between text-xs text-slate-500 mb-1">
                                           <span>Kapasitas</span>
                                           <span className="font-bold text-slate-800">{isVisitorMode ? `${zone.capacity - zone.occupied} Slot Kosong` : `${zone.occupied} / ${zone.capacity}`}</span>
                                       </div>
                                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                           <div 
                                                className={`h-full rounded-full transition-all duration-500 ${zone.status === 'FULL' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${(zone.occupied / zone.capacity) * 100}%` }}
                                           ></div>
                                       </div>
                                   </div>
                                   
                                   {!isVisitorMode && (
                                       <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                           <div className="flex items-center gap-1 text-xs text-slate-500">
                                               <Wallet size={12} /> ID: {zone.merchantId}
                                           </div>
                                           <div className="font-bold text-slate-800">Rp {zone.revenueToday.toLocaleString()}</div>
                                       </div>
                                   )}

                                   <button 
                                        onClick={() => handleZoneClick(zone)}
                                        disabled={isVisitorMode}
                                        className={`w-full py-2 text-xs font-bold rounded-lg transition ${
                                            isVisitorMode 
                                            ? 'bg-slate-50 text-slate-400 cursor-default border border-slate-100' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                   >
                                       {isVisitorMode ? 'Motor: 2k | Mobil: 5k' : 'Kelola Terminal'}
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {/* MAP TAB */}
           {activeTab === 'MAP' && (
               <div className="relative h-full bg-slate-100">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
                   
                   {/* Mock Map Layout */}
                   <div className="absolute inset-4 bg-white/50 backdrop-blur rounded-2xl border border-white shadow-inner overflow-hidden">
                       {/* Roads */}
                       <div className="absolute top-[40%] left-0 w-full h-12 bg-slate-300 border-y-2 border-slate-400">
                           <div className="w-full h-full border-b-2 border-dashed border-white/50 translate-y-[-2px]"></div>
                       </div>
                       <div className="absolute top-0 left-[60%] w-12 h-full bg-slate-300 border-x-2 border-slate-400">
                            <div className="w-full h-full border-r-2 border-dashed border-white/50 translate-x-[-2px]"></div>
                       </div>

                       {zones.map((zone) => (
                           <div 
                                key={zone.id}
                                onClick={() => handleZoneClick(zone)}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${!isVisitorMode ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all group`}
                                style={{ top: `${zone.coordinates.y}%`, left: `${zone.coordinates.x}%` }}
                           >
                               <div className={`relative flex flex-col items-center`}>
                                   <div className={`w-16 h-16 rounded-xl shadow-xl flex items-center justify-center border-4 border-white ${zone.status === 'FULL' ? 'bg-red-500' : 'bg-blue-600'} text-white`}>
                                       <div className="text-center">
                                           <span className="text-xs font-bold block">P</span>
                                           <span className="text-[10px] font-mono">{zone.occupied}/{zone.capacity}</span>
                                       </div>
                                   </div>
                                   {/* Tooltip */}
                                   <div className="absolute bottom-full mb-2 bg-white px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20">
                                       <p className="font-bold text-xs text-slate-800">{zone.name}</p>
                                       <p className="text-[10px] text-slate-500">{isVisitorMode ? (zone.status === 'FULL' ? 'Penuh' : 'Tersedia') : `Juru Parkir: ${zone.attendant}`}</p>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {/* POS (TERMINAL) TAB - Hidden in Visitor Mode */}
           {activeTab === 'POS' && selectedZone && !isVisitorMode && (
               <div className="h-full flex flex-col">
                   <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                       <div>
                           <h2 className="font-bold flex items-center gap-2">
                               <MapPin size={18} className="text-orange-500" /> {selectedZone.name}
                           </h2>
                           <p className="text-xs text-slate-400 flex items-center gap-2">
                               <User size={12} /> Juru Parkir: {selectedZone.attendant} • {selectedZone.merchantId}
                           </p>
                       </div>
                       <div className="text-right">
                           <p className="text-xs text-slate-400">Tarif</p>
                           <p className="font-bold text-lg">Rp {calculateFee().toLocaleString()}</p>
                       </div>
                   </div>

                   <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center">
                       <div className="w-full max-w-md space-y-6">
                           
                           {/* Vehicle Selector */}
                           <div className="grid grid-cols-2 gap-4">
                               <button 
                                    onClick={() => setVehicleType('MOTOR')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition ${vehicleType === 'MOTOR' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-white/80'}`}
                               >
                                   <Bike size={40} />
                                   <span className="font-bold">MOTOR</span>
                               </button>
                               <button 
                                    onClick={() => setVehicleType('MOBIL')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition ${vehicleType === 'MOBIL' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-white/80'}`}
                               >
                                   <Car size={40} />
                                   <span className="font-bold">MOBIL</span>
                               </button>
                           </div>

                           {/* Plate Input */}
                           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                               <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nomor Polisi</label>
                               <input 
                                    type="text" 
                                    value={plateNumber}
                                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                                    placeholder="BE 1234 XX"
                                    className="w-full text-center text-2xl font-black text-slate-800 outline-none placeholder-slate-200 tracking-widest uppercase"
                               />
                           </div>

                           <button 
                                onClick={() => setShowPaymentModal(true)}
                                disabled={!plateNumber}
                                className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                               Proses Pembayaran
                           </button>
                       </div>
                   </div>
               </div>
           )}

           {/* PAYMENT & SIMULATION MODAL */}
           {showPaymentModal && (
               <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                   {!ticketPrinted ? (
                       <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
                           <button onClick={resetPos} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-50"><X size={24} /></button>
                           
                           {/* STATE 1: SELECT METHOD */}
                           {simulationState === 'IDLE' && (
                               <div className="p-6">
                                   <div className="text-center mb-6">
                                       <h3 className="text-2xl font-black text-slate-800">Rp {calculateFee().toLocaleString()}</h3>
                                       <p className="text-sm text-slate-500">{vehicleType} • {plateNumber}</p>
                                   </div>

                                   <div className="space-y-3">
                                       {/* QRIS OPTION */}
                                       <button 
                                            onClick={() => handleProcessPayment('QRIS')}
                                            className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4 group"
                                       >
                                           <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-blue-900">
                                               <QrCode size={24} />
                                           </div>
                                           <div className="text-left">
                                               <span className="block font-bold text-slate-800 group-hover:text-blue-700">Scan QRIS / Tiket</span>
                                               <span className="text-xs text-slate-500">Camera / Barcode Scanner</span>
                                           </div>
                                       </button>

                                       {/* NFC OPTION */}
                                       <button 
                                            onClick={() => handleProcessPayment('EMONEY')}
                                            className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4 group"
                                       >
                                           <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                               <Radio size={24} />
                                           </div>
                                           <div className="text-left">
                                               <span className="block font-bold text-slate-800 group-hover:text-blue-700">Tap Kartu / NFC</span>
                                               <span className="text-xs text-slate-500">WargaPay / E-Money / Himbara</span>
                                           </div>
                                       </button>

                                       {/* CASH OPTION */}
                                       <button 
                                            onClick={() => handleProcessPayment('CASH')}
                                            className="w-full p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition flex items-center gap-4 group"
                                       >
                                           <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white">
                                               <Wallet size={24} />
                                           </div>
                                           <div className="text-left">
                                               <span className="block font-bold text-slate-800 group-hover:text-green-700">Tunai / Cash</span>
                                               <span className="text-xs text-slate-500">Pembayaran Manual</span>
                                           </div>
                                       </button>
                                   </div>
                               </div>
                           )}

                           {/* STATE 2: NFC SIMULATION */}
                           {simulationState === 'WAITING_TAP' && (
                               <div className="p-12 flex flex-col items-center justify-center text-center bg-blue-600 text-white h-[450px]">
                                    <div className="relative mb-8">
                                        <div className="w-32 h-48 bg-white/20 rounded-xl border-2 border-white/50 animate-[pulse_2s_infinite]"></div>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <Radio size={48} className="animate-ping" />
                                        </div>
                                        <div className="absolute -bottom-10 left-0 right-0 text-center">
                                            <Smartphone className="w-12 h-12 mx-auto animate-bounce" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Tempelkan Kartu / HP</h3>
                                    <p className="text-blue-200 text-sm">NFC Reader Active</p>
                               </div>
                           )}

                           {/* STATE 3: QR SCAN SIMULATION */}
                           {simulationState === 'SCANNING' && (
                               <div className="flex flex-col items-center bg-black h-[450px] relative overflow-hidden">
                                   {/* Camera Scan Effect */}
                                   <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent animate-[scan_2s_infinite]"></div>
                                   <div className="absolute top-1/4 left-8 right-8 bottom-1/4 border-2 border-white/50 rounded-lg flex items-center justify-center">
                                       <div className="w-full h-0.5 bg-red-500 shadow-[0_0_15px_red] animate-[scan_2s_linear_infinite]"></div>
                                   </div>
                                   
                                   <div className="absolute bottom-10 text-center w-full">
                                       <p className="text-white font-mono text-sm bg-black/50 py-2">Scanning QR / Barcode...</p>
                                   </div>
                                   
                                   <style>{`
                                        @keyframes scan {
                                            0% { top: 25%; }
                                            50% { top: 75%; }
                                            100% { top: 25%; }
                                        }
                                   `}</style>
                               </div>
                           )}

                           {/* STATE 4: PROCESSING SPINNER */}
                           {simulationState === 'PROCESSING' && (
                               <div className="p-12 flex flex-col items-center justify-center text-center h-[450px]">
                                   <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                                   <h3 className="font-bold text-slate-800 text-lg">Memproses Transaksi...</h3>
                                   <p className="text-xs text-slate-500 mt-2">Menghubungkan ke Gateway Mandiri</p>
                               </div>
                           )}

                       </div>
                   ) : (
                       // STATE 5: SUCCESS TICKET
                       <div className="bg-white w-full max-w-xs rounded-none shadow-2xl relative p-6 animate-in zoom-in duration-300 ticket-edge">
                           <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
                               <h3 className="font-black text-xl text-slate-800 uppercase tracking-widest">WargaParkir</h3>
                               <p className="text-xs text-slate-500 uppercase">{selectedZone?.name}</p>
                           </div>
                           
                           <div className="space-y-2 mb-6 text-sm">
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Tanggal</span>
                                   <span className="font-mono font-bold">{new Date().toLocaleDateString()}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Jam Masuk</span>
                                   <span className="font-mono font-bold">{new Date().toLocaleTimeString()}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Nopol</span>
                                   <span className="font-mono font-bold text-lg">{plateNumber}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Metode</span>
                                   <span className="font-bold">{paymentMethod}</span>
                               </div>
                           </div>

                           <div className="bg-slate-100 p-3 rounded-lg text-center mb-6">
                               <p className="text-xs text-slate-500 uppercase">Total Bayar</p>
                               <p className="text-2xl font-black text-slate-800">Rp {calculateFee().toLocaleString()}</p>
                           </div>

                           <div className="text-center">
                               <QrCode size={64} className="mx-auto mb-2 opacity-50" />
                               <p className="text-[10px] text-slate-400">Simpan struk ini sebagai bukti parkir yang sah.</p>
                           </div>

                           <button 
                                onClick={resetPos}
                                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
                           >
                               <Printer size={16} /> Cetak & Selesai
                           </button>
                       </div>
                   )}
               </div>
           )}

           {/* Zigzag Ticket Edge CSS */}
           <style>{`
               .ticket-edge {
                   background-image: radial-gradient(circle, transparent 50%, white 50%);
                   background-size: 10px 10px;
                   background-position: bottom left;
                   background-repeat: repeat-x;
                   padding-bottom: 20px;
               }
           `}</style>

       </div>
    </div>
  );
};

export default ParkingView;
