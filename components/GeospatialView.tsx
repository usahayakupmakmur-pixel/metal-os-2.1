
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Layers, Info, Navigation, AlertTriangle, Car, Shield, Activity, X, Clock, CheckCircle2, Package, Wrench, Truck } from 'lucide-react';
import { SOCIAL_REPORTS, PARKING_ZONES, IOT_SENSORS, TEAM_TASKS, ASSETS } from '../constants';
import { SocialReport, ParkingZone, IotSensor, TeamTask, Asset } from '../types';
import GeospatialEngine from './GeospatialEngine';

const CENTER = { lat: -5.1186, lng: 105.3072 };

const GeospatialView: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'REPORT' | 'PARKING' | 'SENSOR' | 'TASK' | 'ASSET'; data: any } | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    reports: true,
    parking: true,
    sensors: true,
    tasks: true,
    assets: true
  });

  const mapPoints = useMemo(() => {
    const points: any[] = [];

    if (activeLayers.reports) {
      SOCIAL_REPORTS.forEach(report => {
        if (report.coordinates) {
          points.push({
            id: `report-${report.id}`,
            position: report.coordinates,
            title: report.title,
            type: 'REPORT',
            data: report
          });
        }
      });
    }

    if (activeLayers.parking) {
      PARKING_ZONES.forEach(zone => {
        if (zone.realCoordinates) {
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
      IOT_SENSORS.forEach((sensor, idx) => {
        const sensorCoord = { 
          lat: CENTER.lat + (idx * 0.001) - 0.001, 
          lng: CENTER.lng + (idx * 0.001) - 0.001 
        };
        points.push({
          id: `sensor-${sensor.id}`,
          position: sensorCoord,
          title: sensor.location,
          type: 'SENSOR',
          data: sensor
        });
      });
    }

    if (activeLayers.tasks) {
      TEAM_TASKS.forEach(task => {
        if (task.location) {
          points.push({
            id: `task-${task.id}`,
            position: { lat: task.location.lat, lng: task.location.lng },
            title: task.title,
            type: 'TASK',
            data: task
          });
        }
      });
    }

    if (activeLayers.assets) {
      ASSETS.forEach(asset => {
        if (asset.location) {
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
  }, [activeLayers]);

  return (
    <div className="relative w-full h-[calc(100vh-120px)] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
      <GeospatialEngine 
        center={CENTER}
        zoom={15}
        points={mapPoints}
        onPointSelect={(point) => setSelectedItem({ type: point.type as 'REPORT' | 'PARKING' | 'SENSOR' | 'TASK' | 'ASSET', data: point.data })}
        className="h-full w-full"
      />

      {/* Overlay UI: Layer Controls */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-[1000]">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
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

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-2 px-1">
            <Activity className="text-cyan-400 w-5 h-5" />
            <h3 className="text-sm font-bold text-white tracking-wide">Live Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Reports</p>
              <p className="text-lg font-black text-white">{SOCIAL_REPORTS.length}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Active Tasks</p>
              <p className="text-lg font-black text-white">{TEAM_TASKS.filter(t => t.status !== 'DONE').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel for Details */}
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
                <h3 className="font-bold text-white">Detail Lokasi</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {selectedItem.type === 'REPORT' && (
                <ReportDetail report={selectedItem.data} />
              )}
              {selectedItem.type === 'PARKING' && (
                <ParkingDetail zone={selectedItem.data} />
              )}
              {selectedItem.type === 'SENSOR' && (
                <SensorDetail sensor={selectedItem.data} />
              )}
              {selectedItem.type === 'TASK' && (
                <TaskDetail task={selectedItem.data} />
              )}
              {selectedItem.type === 'ASSET' && (
                <AssetDetail asset={selectedItem.data} />
              )}
            </div>

            <div className="p-6 bg-white/5 border-t border-white/10">
              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2">
                <Navigation size={18} />
                Navigasi Ke Lokasi
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
    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
      active ? 'bg-white/10 border-white/10' : 'bg-transparent border-transparent opacity-50'
    } border`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-xs font-medium text-slate-300">{label}</span>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-cyan-500' : 'bg-slate-700'}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-0.5' : 'left-0.5'}`}></div>
    </div>
  </button>
);

const ReportDetail = ({ report }: { report: SocialReport }) => (
  <div className="space-y-6">
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
    <div>
      <h4 className="text-lg font-bold text-white leading-tight">{report.title}</h4>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{report.description}</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Pelapor</p>
        <p className="text-xs font-bold text-white mt-1">{report.author}</p>
      </div>
      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Waktu</p>
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
      <h4 className="text-lg font-bold text-white leading-tight">{zone.name}</h4>
      <p className="text-sm text-slate-400 mt-1">Juru Parkir: {zone.attendant}</p>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">Kapasitas Terisi</span>
        <span className="text-white font-bold">{zone.occupied} / {zone.capacity}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            (zone.occupied / zone.capacity) > 0.9 ? 'bg-red-500' : 
            (zone.occupied / zone.capacity) > 0.7 ? 'bg-yellow-500' : 'bg-cyan-500'
          }`}
          style={{ width: `${(zone.occupied / zone.capacity) * 100}%` }}
        ></div>
      </div>
    </div>

    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pendapatan Hari Ini</p>
      <p className="text-xl font-black text-white">Rp {zone.revenueToday.toLocaleString()}</p>
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
      <h4 className="text-lg font-bold text-white leading-tight">{sensor.location}</h4>
      <p className="text-sm text-slate-400 mt-1">Tipe: {sensor.type}</p>
    </div>

    <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-[2rem] border border-white/5">
      <p className="text-4xl font-black text-white">{sensor.value}</p>
      <p className="text-sm text-slate-400 font-bold mt-1">{sensor.unit}</p>
    </div>

    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Clock size={14} />
      <span>Update terakhir: {sensor.lastUpdate}</span>
    </div>
  </div>
);

const TaskDetail = ({ task }: { task: TeamTask }) => (
  <div className="space-y-6">
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
    <div>
      <h4 className="text-lg font-bold text-white leading-tight">{task.title}</h4>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{task.description}</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Assignee</p>
        <p className="text-xs font-bold text-white mt-1">{task.assignedTo.join(', ')}</p>
      </div>
      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Deadline</p>
        <p className="text-xs font-bold text-white mt-1">{task.dueDate}</p>
      </div>
    </div>
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Prioritas</p>
      <p className={`text-sm font-black ${
        task.priority === 'URGENT' ? 'text-rose-500' :
        task.priority === 'HIGH' ? 'text-orange-500' :
        'text-blue-400'
      }`}>{task.priority}</p>
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
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${asset.imageColor} bg-opacity-20 text-white`}>
        {asset.type === 'VEHICLE' && <Truck size={24} />}
        {asset.type === 'EQUIPMENT' && <Wrench size={24} />}
        {asset.type === 'FACILITY' && <Package size={24} />}
      </div>
      <div>
        <h4 className="text-lg font-bold text-white leading-tight">{asset.name}</h4>
        <p className="text-sm text-slate-400 mt-1">{asset.type}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Kondisi</p>
        <p className="text-xs font-bold text-white mt-1">{asset.condition}</p>
      </div>
      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Maintenance</p>
        <p className="text-xs font-bold text-white mt-1">{asset.lastMaintained}</p>
      </div>
    </div>
    {asset.assignedTo && (
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Penanggung Jawab</p>
        <p className="text-sm font-black text-blue-400">{asset.assignedTo}</p>
      </div>
    )}
  </div>
);

export default GeospatialView;
