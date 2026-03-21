
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Layers, Info, Navigation, AlertTriangle, Car, Shield, Activity, X, Clock, CheckCircle2, Package, Wrench, Truck, Search, Filter, User as UserIcon, TrendingUp, Globe, Zap, BarChart3, Calendar, Download, Share2, Maximize2, Minimize2, Eye, EyeOff, Settings, Database, Cpu, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SOCIAL_REPORTS, PARKING_ZONES, IOT_SENSORS, TEAM_TASKS, ASSETS, MOCK_USER } from '../constants';
import { SocialReport, ParkingZone, IotSensor, TeamTask, Asset, CitizenProfile } from '../types';
import GeospatialEngine from './GeospatialEngine';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const CENTER = { lat: -5.1186, lng: 105.3072 };

interface GeospatialViewProps {
  user?: CitizenProfile;
}

const GeospatialView: React.FC<GeospatialViewProps> = ({ user = MOCK_USER }) => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'REPORT' | 'PARKING' | 'SENSOR' | 'TASK' | 'ASSET'; data: any } | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    reports: true,
    parking: true,
    sensors: true,
    tasks: true,
    assets: true,
    gee_ndvi: false,
    gee_nightlights: false,
    gee_landcover: false,
    gee_water: false,
    gee_terrain: false,
    gee_population: false
  });
  const [isGeeMode, setIsGeeMode] = useState(false);
  const [geeAnalysisData, setGeeAnalysisData] = useState([
    { year: '2018', ndvi: 0.45, lights: 12 },
    { year: '2019', ndvi: 0.48, lights: 15 },
    { year: '2020', ndvi: 0.52, lights: 18 },
    { year: '2021', ndvi: 0.50, lights: 22 },
    { year: '2022', ndvi: 0.55, lights: 28 },
    { year: '2023', ndvi: 0.58, lights: 35 },
    { year: '2024', ndvi: 0.62, lights: 42 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Real-time Data State
  const [reports, setReports] = useState<SocialReport[]>(SOCIAL_REPORTS);
  const [parking, setParking] = useState<ParkingZone[]>(PARKING_ZONES);
  const [sensors, setSensors] = useState<IotSensor[]>(IOT_SENSORS);
  const [tasks, setTasks] = useState<TeamTask[]>(TEAM_TASKS);
  const [assets, setAssets] = useState<Asset[]>(ASSETS);

  useEffect(() => {
    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialReport));
      if (data.length > 0) setReports(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'reports'));

    const unsubParking = onSnapshot(collection(db, 'parking'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingZone));
      if (data.length > 0) setParking(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'parking'));

    const unsubSensors = onSnapshot(collection(db, 'sensors'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IotSensor));
      if (data.length > 0) setSensors(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'sensors'));

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamTask));
      if (data.length > 0) setTasks(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'tasks'));

    const unsubAssets = onSnapshot(collection(db, 'assets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      if (data.length > 0) setAssets(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'assets'));

    return () => {
      unsubReports();
      unsubParking();
      unsubSensors();
      unsubTasks();
      unsubAssets();
    };
  }, []);

  const mapPoints = useMemo(() => {
    const points: any[] = [];

    if (activeLayers.reports) {
      reports.forEach(report => {
        if (report.coordinates && (report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.author.toLowerCase().includes(searchQuery.toLowerCase()))) {
          points.push({
            id: `report-${report.id}`,
            position: report.coordinates,
            title: report.title,
            type: 'REPORT',
            data: report,
            color: report.authorId === user.id ? '#f43f5e' : '#ef4444', // Highlight user's own reports
            iconHtml: report.authorId === user.id ? '<div style="width: 12px; height: 12px; background-color: white; border-radius: 50%; border: 2px solid #f43f5e"></div>' : undefined
          });
        }
      });
    }

    if (activeLayers.parking) {
      parking.forEach(zone => {
        if (zone.realCoordinates && zone.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          points.push({
            id: `parking-${zone.id}`,
            position: zone.realCoordinates,
            title: zone.name,
            type: 'PARKING',
            data: zone
          });
        }
      });
    }

    if (activeLayers.sensors) {
      sensors.forEach((sensor, idx) => {
        const sensorCoord = { 
          lat: CENTER.lat + (idx * 0.001) - 0.001, 
          lng: CENTER.lng + (idx * 0.001) - 0.001 
        };
        if (sensor.location.toLowerCase().includes(searchQuery.toLowerCase())) {
          points.push({
            id: `sensor-${sensor.id}`,
            position: sensorCoord,
            title: sensor.location,
            type: 'SENSOR',
            data: sensor
          });
        }
      });
    }

    if (activeLayers.tasks) {
      tasks.forEach(task => {
        if (task.location && (task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.assignedTo.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())))) {
          points.push({
            id: `task-${task.id}`,
            position: { lat: task.location.lat, lng: task.location.lng },
            title: task.title,
            type: 'TASK',
            data: task,
            color: task.assignedTo.includes(user.name) ? '#10b981' : '#64748b'
          });
        }
      });
    }

    if (activeLayers.assets) {
      assets.forEach(asset => {
        if (asset.location && asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          points.push({
            id: `asset-${asset.id}`,
            position: { lat: asset.location.lat, lng: asset.location.lng },
            title: asset.name,
            type: 'ASSET',
            data: asset
          });
        }
      });
    }

    return points;
  }, [activeLayers, reports, parking, sensors, tasks, assets, searchQuery, user]);

  return (
    <div className="relative w-full h-[calc(100vh-120px)] md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900 font-sans">
      {/* GEE Mode Toggle Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1001] flex items-center bg-black/40 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-2xl">
        <button 
          onClick={() => setIsGeeMode(false)}
          className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!isGeeMode ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
        >
          Village Map
        </button>
        <button 
          onClick={() => setIsGeeMode(true)}
          className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isGeeMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-white/60 hover:text-white'}`}
        >
          <Globe size={14} /> Google Earth Engine
        </button>
      </div>

      <GeospatialEngine 
        center={CENTER}
        zoom={15}
        points={mapPoints}
        onPointSelect={(point) => setSelectedItem({ type: point.type as 'REPORT' | 'PARKING' | 'SENSOR' | 'TASK' | 'ASSET', data: point.data })}
        className="h-full w-full"
        isGeeMode={isGeeMode}
        geeLayers={{
          ndvi: activeLayers.gee_ndvi,
          nightlights: activeLayers.gee_nightlights,
          landcover: activeLayers.gee_landcover,
          water: activeLayers.gee_water,
          terrain: activeLayers.gee_terrain,
          population: activeLayers.gee_population
        }}
      />

      {/* GEE Analysis Sidebar */}
      <AnimatePresence>
        {isGeeMode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute top-24 right-6 bottom-6 w-96 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-[1000]"
          >
            <div className="p-8 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white tracking-tight">GEE Analysis</h3>
                <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                  Live Engine
                </div>
              </div>
              <p className="text-white/40 text-xs font-medium">Historical satellite data analysis from Google Earth Engine.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {/* NDVI Trend */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vegetation Index (NDVI)</h4>
                  <TrendingUp size={14} className="text-emerald-400" />
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={geeAnalysisData}>
                      <defs>
                        <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="year" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNdvi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Night Lights Trend */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Urbanization (Night Lights)</h4>
                  <Zap size={14} className="text-amber-400" />
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={geeAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="year" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="lights" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GEE Controls */}
              <div className="space-y-4 pt-4">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">GEE Layers</h4>
                <div className="space-y-2">
                  {[
                    { id: 'gee_ndvi', label: 'NDVI (Vegetation)', icon: Activity, color: 'text-emerald-400' },
                    { id: 'gee_nightlights', label: 'Night Lights', icon: Zap, color: 'text-amber-400' },
                    { id: 'gee_landcover', label: 'Land Cover', icon: Globe, color: 'text-blue-400' },
                    { id: 'gee_water', label: 'Water Index', icon: Activity, color: 'text-cyan-400' },
                    { id: 'gee_terrain', label: 'Terrain Analysis', icon: Layers, color: 'text-stone-400' },
                    { id: 'gee_population', label: 'Population Density', icon: Users, color: 'text-purple-400' },
                  ].map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => setActiveLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id as keyof typeof prev] }))}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        activeLayers[layer.id as keyof typeof activeLayers] 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <layer.icon size={18} className={layer.color} />
                        <span className="text-sm font-bold">{layer.label}</span>
                      </div>
                      {activeLayers[layer.id as keyof typeof activeLayers] ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5">
              <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                <Download size={16} /> Export GEE Dataset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Search Bar */}
      <div className="absolute top-6 left-6 right-6 md:left-auto md:w-96 z-[1000]">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 px-3">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari lokasi, aset, atau tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
            />
          </div>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`p-2 rounded-xl transition ${isFiltersOpen ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Mobile Filters Dropdown */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl space-y-2"
            >
              <LayerToggle 
                label="Laporan Warga" 
                active={activeLayers.reports} 
                color="bg-red-500"
                onClick={() => setActiveLayers(prev => ({ ...prev, reports: !prev.reports }))} 
              />
              <LayerToggle 
                label="Zona Parkir" 
                active={activeLayers.parking} 
                color="bg-blue-500"
                onClick={() => setActiveLayers(prev => ({ ...prev, parking: !prev.parking }))} 
              />
              <LayerToggle 
                label="Sensor IoT" 
                active={activeLayers.sensors} 
                color="bg-emerald-500"
                onClick={() => setActiveLayers(prev => ({ ...prev, sensors: !prev.sensors }))} 
              />
              <LayerToggle 
                label="Tugas Tim" 
                active={activeLayers.tasks} 
                color="bg-slate-400"
                onClick={() => setActiveLayers(prev => ({ ...prev, tasks: !prev.tasks }))} 
              />
              <LayerToggle 
                label="Aset Desa" 
                active={activeLayers.assets} 
                color="bg-indigo-500"
                onClick={() => setActiveLayers(prev => ({ ...prev, assets: !prev.assets }))} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Overlay UI: Layer Controls */}
      <div className="hidden md:flex absolute top-24 left-6 flex-col gap-3 z-[1000]">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl w-64">
          <div className="flex items-center gap-3 mb-4 px-1">
            <Layers className="text-cyan-400 w-5 h-5" />
            <h3 className="text-sm font-bold text-white tracking-wide">Map Layers</h3>
          </div>
          <div className="space-y-2">
            <LayerToggle 
              label="Laporan Warga" 
              active={activeLayers.reports} 
              color="bg-red-500"
              onClick={() => setActiveLayers(prev => ({ ...prev, reports: !prev.reports }))} 
            />
            <LayerToggle 
              label="Zona Parkir" 
              active={activeLayers.parking} 
              color="bg-blue-500"
              onClick={() => setActiveLayers(prev => ({ ...prev, parking: !prev.parking }))} 
            />
            <LayerToggle 
              label="Sensor IoT" 
              active={activeLayers.sensors} 
              color="bg-emerald-500"
              onClick={() => setActiveLayers(prev => ({ ...prev, sensors: !prev.sensors }))} 
            />
            <LayerToggle 
              label="Tugas Tim" 
              active={activeLayers.tasks} 
              color="bg-slate-400"
              onClick={() => setActiveLayers(prev => ({ ...prev, tasks: !prev.tasks }))} 
            />
            <LayerToggle 
              label="Aset Desa" 
              active={activeLayers.assets} 
              color="bg-indigo-500"
              onClick={() => setActiveLayers(prev => ({ ...prev, assets: !prev.assets }))} 
            />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl w-64">
          <div className="flex items-center gap-3 mb-2 px-1">
            <Activity className="text-cyan-400 w-5 h-5" />
            <h3 className="text-sm font-bold text-white tracking-wide">Live Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Reports</p>
              <p className="text-lg font-black text-white">{reports.length}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Active Tasks</p>
              <p className="text-lg font-black text-white">{tasks.filter(t => t.status !== 'DONE').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet / Side Panel for Details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ y: 600, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 600, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 md:top-6 md:right-6 md:bottom-6 md:left-auto md:w-96 bg-slate-900/95 backdrop-blur-2xl border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl z-[1001] flex flex-col overflow-hidden max-h-[80vh] md:max-h-none"
          >
            <div className="md:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2"></div>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  selectedItem.type === 'REPORT' ? 'bg-red-500/20 text-red-400' :
                  selectedItem.type === 'PARKING' ? 'bg-blue-500/20 text-blue-400' :
                  selectedItem.type === 'SENSOR' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedItem.type === 'TASK' ? 'bg-slate-500/20 text-slate-400' :
                  'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {selectedItem.type === 'REPORT' && <AlertTriangle size={18} />}
                  {selectedItem.type === 'PARKING' && <Car size={18} />}
                  {selectedItem.type === 'SENSOR' && <Activity size={18} />}
                  {selectedItem.type === 'TASK' && <CheckCircle2 size={18} />}
                  {selectedItem.type === 'ASSET' && <Package size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-white">Detail Lokasi</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedItem.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white transition p-2 bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {selectedItem.type === 'REPORT' && (
                <ReportDetail report={selectedItem.data} user={user} />
              )}
              {selectedItem.type === 'PARKING' && (
                <ParkingDetail zone={selectedItem.data} />
              )}
              {selectedItem.type === 'SENSOR' && (
                <SensorDetail sensor={selectedItem.data} />
              )}
              {selectedItem.type === 'TASK' && (
                <TaskDetail task={selectedItem.data} user={user} />
              )}
              {selectedItem.type === 'ASSET' && (
                <AssetDetail asset={selectedItem.data} />
              )}
            </div>

            <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
              <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                <Navigation size={18} />
                Navigasi
              </button>
              <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition">
                <Activity size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LayerToggle = ({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
      active ? 'bg-white/10 border-white/10' : 'bg-transparent border-transparent opacity-50'
    } border`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-cyan-500' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
    </div>
  </button>
);

const ReportDetail = ({ report, user }: { report: SocialReport; user: CitizenProfile }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
          report.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
          report.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {report.status}
        </div>
      </div>
      {report.authorId === user.id && (
        <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
          <UserIcon size={12} className="text-cyan-400" />
          <span className="text-[8px] font-black text-cyan-400 uppercase">Laporan Anda</span>
        </div>
      )}
    </div>
    <div>
      <h4 className="text-xl font-black text-white leading-tight tracking-tight">{report.title}</h4>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{report.description}</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Pelapor</p>
        <p className="text-xs font-bold text-white mt-1">{report.author}</p>
      </div>
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Waktu</p>
        <p className="text-xs font-bold text-white mt-1">{report.date}</p>
      </div>
    </div>
  </div>
);

const ParkingDetail = ({ zone }: { zone: ParkingZone }) => (
  <div className="space-y-6">
    <div>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status Okupansi</p>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
        zone.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {zone.status}
      </div>
    </div>
    <div>
      <h4 className="text-xl font-black text-white leading-tight tracking-tight">{zone.name}</h4>
      <p className="text-sm text-slate-400 mt-1">Juru Parkir: <span className="text-white font-bold">{zone.attendant}</span></p>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
        <span className="text-slate-500">Kapasitas Terisi</span>
        <span className="text-white">{zone.occupied} / {zone.capacity}</span>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div 
          className={`h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
            (zone.occupied / zone.capacity) > 0.9 ? 'bg-red-500' : 
            (zone.occupied / zone.capacity) > 0.7 ? 'bg-yellow-500' : 'bg-cyan-500'
          }`}
          style={{ width: `${(zone.occupied / zone.capacity) * 100}%` }}
        ></div>
      </div>
    </div>

    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex justify-between items-center">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Pendapatan Hari Ini</p>
        <p className="text-2xl font-black text-white">Rp {zone.revenueToday.toLocaleString()}</p>
      </div>
      <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
        <TrendingUp size={24} />
      </div>
    </div>
  </div>
);

const SensorDetail = ({ sensor }: { sensor: IotSensor }) => (
  <div className="space-y-6">
    <div>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Sensor Health</p>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
        sensor.status === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' :
        sensor.status === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {sensor.status}
      </div>
    </div>
    <div>
      <h4 className="text-xl font-black text-white leading-tight tracking-tight">{sensor.location}</h4>
      <p className="text-sm text-slate-400 mt-1">Tipe: <span className="text-white font-bold">{sensor.type}</span></p>
    </div>

    <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <p className="text-6xl font-black text-white relative z-10">{sensor.value}</p>
      <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] mt-2 relative z-10">{sensor.unit}</p>
    </div>

    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
      <Clock size={14} className="text-cyan-400" />
      <span>Update terakhir: {sensor.lastUpdate}</span>
    </div>
  </div>
);

const TaskDetail = ({ task, user }: { task: TeamTask; user: CitizenProfile }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status Tugas</p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
          task.status === 'DONE' ? 'bg-emerald-500/20 text-emerald-400' :
          task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {task.status}
        </div>
      </div>
      {task.assignedTo.includes(user.name) && (
        <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span className="text-[8px] font-black text-emerald-400 uppercase">Tugas Anda</span>
        </div>
      )}
    </div>
    <div>
      <h4 className="text-xl font-black text-white leading-tight tracking-tight">{task.title}</h4>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{task.description}</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Assignee</p>
        <p className="text-xs font-bold text-white mt-1">{task.assignedTo.join(', ')}</p>
      </div>
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Deadline</p>
        <p className="text-xs font-bold text-white mt-1">{task.dueDate}</p>
      </div>
    </div>
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Prioritas</p>
        <p className={`text-sm font-black ${
          task.priority === 'URGENT' ? 'text-rose-500' :
          task.priority === 'HIGH' ? 'text-orange-500' :
          'text-blue-400'
        }`}>{task.priority}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          task.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-500' :
          task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
          'bg-blue-500/20 text-blue-500'
      }`}>
        <AlertTriangle size={20} />
      </div>
    </div>
  </div>
);

const AssetDetail = ({ asset }: { asset: Asset }) => (
  <div className="space-y-6">
    <div>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status Aset</p>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
        asset.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
        asset.status === 'IN_USE' ? 'bg-blue-500/20 text-blue-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {asset.status}
      </div>
    </div>
    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
      <div className={`p-4 rounded-2xl ${asset.imageColor} bg-opacity-20 text-white shadow-lg`}>
        {asset.type === 'VEHICLE' && <Truck size={28} />}
        {asset.type === 'EQUIPMENT' && <Wrench size={28} />}
        {asset.type === 'FACILITY' && <Package size={28} />}
      </div>
      <div>
        <h4 className="text-xl font-black text-white leading-tight tracking-tight">{asset.name}</h4>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{asset.type}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Kondisi</p>
        <p className="text-xs font-bold text-white mt-1">{asset.condition}</p>
      </div>
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Maintenance</p>
        <p className="text-xs font-bold text-white mt-1">{asset.lastMaintained}</p>
      </div>
    </div>
    {asset.assignedTo && (
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Penanggung Jawab</p>
          <p className="text-sm font-black text-blue-400">{asset.assignedTo}</p>
        </div>
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
          <UserIcon size={20} />
        </div>
      </div>
    )}
  </div>
);

export default GeospatialView;
