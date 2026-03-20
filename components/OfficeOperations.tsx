
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Package, 
  Search, 
  Filter, 
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
  List,
  LayoutGrid,
  Plus,
  AlertCircle
} from 'lucide-react';
import { TEAM_TASKS, ASSETS } from '../constants';
import { TeamTask, Asset } from '../types';
import GeospatialEngine from './GeospatialEngine';

const CENTER = { lat: -5.1186, lng: 105.3072 };

interface OfficeOperationsProps {
  onOpenScanner?: () => void;
  searchQuery: string;
}

const OfficeOperations: React.FC<OfficeOperationsProps> = ({ onOpenScanner, searchQuery: externalSearchQuery }) => {
  const [activeTab, setActiveTab] = useState<'MAP' | 'TASKS' | 'ASSETS'>('MAP');
  const [selectedItem, setSelectedItem] = useState<{ type: 'TASK' | 'ASSET' | 'DRIVER'; data: any } | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeLayers, setActiveLayers] = useState({
    tasks: true,
    assets: true,
    drivers: true
  });
  const [driverPos, setDriverPos] = useState({ lat: -5.1186, lng: 105.3072 });

  const searchQuery = externalSearchQuery || localSearchQuery;

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

  const filteredTasks = TEAM_TASKS.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredAssets = ASSETS.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'text-slate-400 bg-slate-400/10';
      case 'IN_PROGRESS': return 'text-blue-400 bg-blue-400/10';
      case 'REVIEW': return 'text-amber-400 bg-amber-400/10';
      case 'DONE': return 'text-emerald-400 bg-emerald-400/10';
      case 'AVAILABLE': return 'text-emerald-400 bg-emerald-400/10';
      case 'IN_USE': return 'text-blue-400 bg-blue-400/10';
      case 'MAINTENANCE': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const handleShareLocation = () => {
    const shareUrl = `${window.location.origin}/tracker?lat=${driverPos.lat}&lng=${driverPos.lng}`;
    if (navigator.share) {
      navigator.share({
        title: 'Live Location - Warga Payungi',
        text: 'Pantau lokasi saya secara real-time di Peta Payungi.',
        url: shareUrl
      }).catch(err => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link lokasi telah disalin ke clipboard!');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Sub Header / Tabs */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex space-x-1">
          <button 
            onClick={() => setActiveTab('MAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'MAP' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <MapIcon size={14} />
            <span>Peta Pelacak</span>
          </button>
          <button 
            onClick={() => setActiveTab('TASKS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'TASKS' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <CheckCircle2 size={14} />
            <span>Daftar Tugas</span>
          </button>
          <button 
            onClick={() => setActiveTab('ASSETS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'ASSETS' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <Package size={14} />
            <span>Manajemen Aset</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
           {!externalSearchQuery && (
             <div className="relative hidden md:block">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Cari..." 
                 value={localSearchQuery}
                 onChange={(e) => setLocalSearchQuery(e.target.value)}
                 className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-teal-500 w-40"
               />
             </div>
           )}
           <button onClick={onOpenScanner} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition" title="Scan QR">
             <Scan size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'MAP' && (
          <div className="absolute inset-0 flex flex-col md:flex-row">
            <div className="flex-1 relative">
              <GeospatialEngine 
                center={selectedItem?.data?.location ? { lat: selectedItem.data.location.lat, lng: selectedItem.data.location.lng } : CENTER}
                zoom={15}
                markers={mapPoints}
                onMarkerClick={(marker) => setSelectedItem({ type: marker.type as any, data: marker.data })}
                onShareLocation={handleShareLocation}
                className="h-full w-full"
              />
              
              {/* Layers Overlay */}
              <div className="absolute top-4 left-4 z-[10] bg-white/90 backdrop-blur border border-slate-200 p-3 rounded-xl shadow-lg w-48 hidden md:block">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Layer Peta</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition">Tugas Tim</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeLayers.tasks} 
                      onChange={() => setActiveLayers(p => ({...p, tasks: !p.tasks}))}
                      className="accent-teal-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition">Aset Desa</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeLayers.assets} 
                      onChange={() => setActiveLayers(p => ({...p, assets: !p.assets}))}
                      className="accent-teal-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition">Driver Anjelo</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeLayers.drivers} 
                      onChange={() => setActiveLayers(p => ({...p, drivers: !p.drivers}))}
                      className="accent-teal-600"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Side Detail Panel */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div 
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="w-full md:w-80 border-l border-slate-200 bg-white flex flex-col z-20"
                >
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Detail Operasional</h3>
                    <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-slate-100 rounded-full transition">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {selectedItem.type === 'TASK' ? (
                      <div className="space-y-4">
                        <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(selectedItem.data.status)}`}>
                          {selectedItem.data.status}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight">{selectedItem.data.title}</h4>
                        <p className="text-sm text-slate-500">{selectedItem.data.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Petugas</p>
                            <p className="text-xs font-bold text-slate-700">{selectedItem.data.assignedTo.join(', ')}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Tenggat</p>
                            <p className="text-xs font-bold text-slate-700">{selectedItem.data.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    ) : selectedItem.type === 'DRIVER' ? (
                      <div className="space-y-4">
                        <div className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                          {selectedItem.data.status}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight">Anjelo Driver - Ahmad</h4>
                        <p className="text-sm text-slate-500">{selectedItem.data.description}</p>
                        <div className="flex flex-col space-y-2">
                          <a href={`tel:${selectedItem.data.phone}`} className="flex items-center justify-center space-x-2 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md">
                            <Phone size={16} />
                            <span>Hubungi Driver</span>
                          </a>
                          <button className="flex items-center justify-center space-x-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200">
                            <MessageSquare size={16} />
                            <span>Kirim Pesan</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(selectedItem.data.status)}`}>
                          {selectedItem.data.status}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight">{selectedItem.data.name}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Kondisi</p>
                            <p className="text-xs font-bold text-slate-700">{selectedItem.data.condition}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Servis Terakhir</p>
                            <p className="text-xs font-bold text-slate-700">{selectedItem.data.lastMaintained}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedItem.data.location && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin size={14} className="text-teal-600" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Lokasi</span>
                        </div>
                        <p className="text-xs text-slate-600">{selectedItem.data.location.address}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-100">
                    <button className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition active:scale-95">
                      Buka di Navigasi
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'TASKS' && (
          <div className="absolute inset-0 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50/30">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-800">Daftar Tugas Tim</h2>
               <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-teal-700 transition">
                 <Plus size={18} />
                 <span>Tugas Baru</span>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => (
                <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <AlertCircle size={12} className={task.priority === 'URGENT' ? 'text-red-500' : 'text-amber-500'} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{task.priority}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-teal-600 transition mb-2">{task.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {task.assignedTo[0].substring(0,1)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{task.assignedTo[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-medium">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ASSETS' && (
          <div className="absolute inset-0 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-50/30">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-800">Manajemen Aset Desa</h2>
               <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition">
                 <Plus size={18} />
                 <span>Tambah Aset</span>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${asset.imageColor} bg-opacity-10 text-slate-700`}>
                      {asset.type === 'VEHICLE' ? <Truck size={20} /> : <Wrench size={20} />}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(asset.status)}`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{asset.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{asset.type}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Kondisi</span>
                      <span className="font-bold text-slate-700">{asset.condition}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Servis Terakhir</span>
                      <span className="font-bold text-slate-700">{asset.lastMaintained}</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition">
                    Kelola Aset
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeOperations;
