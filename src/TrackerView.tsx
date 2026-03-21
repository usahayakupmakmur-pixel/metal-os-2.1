import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Package, 
  Search, 
  Filter, 
  ChevronRight, 
  X, 
  Navigation, 
  Clock, 
  AlertTriangle,
  Truck,
  Wrench,
  User,
  Calendar,
  MapPin,
  Share2,
  Scan,
  Phone,
  MessageSquare,
  Globe
} from 'lucide-react';
import { TEAM_TASKS, ASSETS, MOCK_USER } from '../constants';
import { TeamTask, Asset, CitizenProfile } from '../types';
import GeospatialEngine from '../components/GeospatialEngine';

const CENTER = { lat: -5.1186, lng: 105.3072 };

interface TrackerViewProps {
  user?: CitizenProfile;
  onOpenScanner?: () => void;
}

const TrackerView: React.FC<TrackerViewProps> = ({ user = MOCK_USER, onOpenScanner }) => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'TASK' | 'ASSET' | 'DRIVER'; title: string; data: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayers, setActiveLayers] = useState({
    tasks: true,
    assets: true,
    drivers: true,
    gee: false
  });
  const [driverPos, setDriverPos] = useState({ lat: -5.1186, lng: 105.3072 });

  // Simulate live driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const mapPoints = useMemo(() => {
    const points: any[] = [];

    if (activeLayers.tasks) {
      TEAM_TASKS.forEach(task => {
        if (task.location && (task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
          points.push({
            id: `task-${task.id}`,
            position: { lat: task.location.lat, lng: task.location.lng },
            title: task.title,
            type: 'TASK',
            color: '#10b981', // Emerald-500
            data: task
          });
        }
      });
    }

    if (activeLayers.assets) {
      ASSETS.forEach(asset => {
        if (asset.location && (asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.type.toLowerCase().includes(searchQuery.toLowerCase()))) {
          points.push({
            id: `asset-${asset.id}`,
            position: { lat: asset.location.lat, lng: asset.location.lng },
            title: asset.name,
            type: 'ASSET',
            color: '#3b82f6', // Blue-500
            data: asset
          });
        }
      });
    }

    if (activeLayers.drivers) {
      points.push({
        id: 'driver-1',
        position: driverPos,
        title: 'Anjelo Driver - Ahmad',
        type: 'DRIVER',
        color: '#f59e0b', // Amber-500
        data: {
          status: 'ON_DUTY',
          description: 'Membawa pesanan Kuliner Payungi',
          phone: '08123456789'
        }
      });
    }

    return points;
  }, [activeLayers, searchQuery, driverPos]);

  const handleShareLocation = () => {
    // Simulate location sharing
    const shareUrl = `${window.location.origin}/tracker?lat=${driverPos.lat}&lng=${driverPos.lng}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Live Location - Warga Payungi',
        text: 'Pantau lokasi saya secara real-time di Peta Payungi.',
        url: shareUrl
      }).catch(err => console.error('Share failed:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link lokasi telah disalin ke clipboard!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-cyan-400" /> Operational Tracker
          </h1>
          <p className="text-sm text-slate-400">Real-time tracking of team tasks and community assets</p>
        </div>
        <div className="flex gap-3">
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">System Live</span>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="text-[10px] font-bold text-white uppercase">
              {mapPoints.length} Active Points
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map Engine */}
        <div className="flex-1 h-full relative">
          <GeospatialEngine 
            center={selectedItem?.data?.location ? { lat: selectedItem.data.location.lat, lng: selectedItem.data.location.lng } : CENTER}
            zoom={15}
            isGeeMode={activeLayers.gee}
            geeLayers={{ ndvi: false, nightlights: true, landcover: false, water: false, terrain: false, population: false }}
            markers={mapPoints}
            onMarkerClick={(marker) => setSelectedItem({ type: marker.type as any, title: marker.title, data: marker.data })}
            onShareLocation={handleShareLocation}
            className="h-full w-full"
          />

          {/* Search Overlay */}
          <div className="absolute top-6 left-6 w-80 z-[1000] space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search tracker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm text-white shadow-2xl"
              />
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Layers className="text-cyan-400 w-4 h-4" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tracker Layers</h3>
                </div>
                <button 
                  onClick={onOpenScanner}
                  className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition flex items-center gap-2"
                >
                  <Scan size={14} />
                  <span className="text-[10px] font-bold uppercase">Scan</span>
                </button>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveLayers(prev => ({ ...prev, tasks: !prev.tasks }))}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${activeLayers.tasks ? 'bg-white/5 border-white/10' : 'opacity-40'} border`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-slate-300">Team Tasks</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${activeLayers.tasks ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeLayers.tasks ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveLayers(prev => ({ ...prev, assets: !prev.assets }))}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${activeLayers.assets ? 'bg-white/5 border-white/10' : 'opacity-40'} border`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-300">Community Assets</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${activeLayers.assets ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeLayers.assets ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveLayers(prev => ({ ...prev, drivers: !prev.drivers }))}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${activeLayers.drivers ? 'bg-white/5 border-white/10' : 'opacity-40'} border`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-slate-300">Live Drivers</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${activeLayers.drivers ? 'bg-amber-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeLayers.drivers ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveLayers(prev => ({ ...prev, gee: !prev.gee }))}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${activeLayers.gee ? 'bg-cyan-500/20 border-cyan-500/30' : 'opacity-40'} border`}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-300">Google Earth Engine</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${activeLayers.gee ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeLayers.gee ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute top-6 right-6 bottom-6 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl z-[1001] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    selectedItem.type === 'TASK' ? 'bg-emerald-500/20 text-emerald-400' : 
                    selectedItem.type === 'ASSET' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedItem.type === 'TASK' ? <CheckCircle2 size={18} /> : 
                     selectedItem.type === 'ASSET' ? <Package size={18} /> :
                     <Truck size={18} />}
                  </div>
                  <h3 className="font-bold text-white">Tracker Detail</h3>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {selectedItem.type === 'TASK' ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {selectedItem.data.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white leading-tight">{selectedItem.data.title}</h4>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{selectedItem.data.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Assignee</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedItem.data.assignedTo.join(', ')}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Deadline</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedItem.data.dueDate}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Location</p>
                      </div>
                      <p className="text-xs font-bold text-white">{selectedItem.data.location.address}</p>
                    </div>
                  </div>
                ) : selectedItem.type === 'DRIVER' ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {selectedItem.data.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white leading-tight">{selectedItem.title}</h4>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{selectedItem.data.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <a 
                        href={`tel:${selectedItem.data.phone}`}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-900/20"
                      >
                        <Phone size={18} />
                        Hubungi Driver
                      </a>
                      <a 
                        href={`https://wa.me/${selectedItem.data.phone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-xl shadow-emerald-900/20"
                      >
                        <MessageSquare size={18} />
                        WhatsApp Driver
                      </a>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Live Tracking</p>
                      </div>
                      <p className="text-xs text-slate-400 italic">Lokasi diperbarui secara real-time setiap 3 detik.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {selectedItem.data.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${selectedItem.data.imageColor} bg-opacity-20 text-white`}>
                        {selectedItem.data.type === 'VEHICLE' ? <Truck size={24} /> : <Wrench size={24} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white leading-tight">{selectedItem.data.name}</h4>
                        <p className="text-sm text-slate-400 mt-1">{selectedItem.data.type}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Condition</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedItem.data.condition}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Maintenance</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedItem.data.lastMaintained}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Current Location</p>
                      </div>
                      <p className="text-xs font-bold text-white">{selectedItem.data.location.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 space-y-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.data.location.lat},${selectedItem.data.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <Navigation size={18} />
                  Navigate to Point
                </a>
                <button 
                  onClick={() => {
                    const text = `Halo, saya sedang memantau ${selectedItem.type === 'TASK' ? selectedItem.data.title : selectedItem.data.name} di ${selectedItem.data.location.address}. Pantau lokasi di sini: https://ais-dev.run.app/tracker`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share Live Location
                </button>
                <div className="mt-4 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Auto-Sync Active</span>
                    </div>
                    <span className="text-[8px] font-black text-cyan-400/60 tracking-tighter">DEVICE MAPS</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Terintegrasi langsung dengan platform peta perangkat Anda untuk navigasi real-time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackerView;
