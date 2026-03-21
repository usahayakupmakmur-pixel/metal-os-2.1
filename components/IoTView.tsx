import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Zap, Thermometer, Droplets, 
  Lightbulb, Shield, Settings, Power,
  Activity, Radio, Wifi, Cast,
  Play, Square, Camera, Mic,
  Maximize2, Minimize2, Volume2, VolumeX,
  Smartphone, Monitor, Tablet, Watch,
  Plus, Trash2, Edit3, Save, X
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const IOT_DEVICES_MOCK = [
  { id: 'iot-1', name: 'Smart Street Light #01', type: 'light', status: 'ON', value: 80, battery: 92, signal: 'Strong' },
  { id: 'iot-2', name: 'Water Level Sensor', type: 'sensor', status: 'ACTIVE', value: 45, battery: 78, signal: 'Medium' },
  { id: 'iot-3', name: 'CCTV Main Gate', type: 'camera', status: 'RECORDING', value: null, battery: 100, signal: 'Strong' },
  { id: 'iot-4', name: 'Air Quality Monitor', type: 'sensor', status: 'ACTIVE', value: 12, battery: 65, signal: 'Weak' },
  { id: 'iot-5', name: 'Smart Pump RW 05', type: 'pump', status: 'OFF', value: 0, battery: 88, signal: 'Strong' },
];

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const IoTView: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'iot_devices'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length === 0) {
        // Initialize with mock data if empty
        IOT_DEVICES_MOCK.forEach(async (device) => {
          await setDoc(doc(db, 'iot_devices', device.id), {
            ...device,
            lastUpdate: serverTimestamp()
          });
        });
      } else {
        setDevices(data);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'iot_devices'));

    return () => unsubscribe();
  }, []);

  const [isCasting, setIsCasting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCasting = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCasting(true);

      mediaStream.getVideoTracks()[0].onended = () => {
        stopCasting();
      };
    } catch (err) {
      console.error("Error starting screen cast:", err);
    }
  };

  const stopCasting = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCasting(false);
  };

  const toggleDevice = async (id: string) => {
    const device = devices.find(d => d.id === id);
    if (!device) return;

    const newStatus = device.status === 'ON' ? 'OFF' : device.status === 'OFF' ? 'ON' : device.status;
    
    try {
      await updateDoc(doc(db, 'iot_devices', id), {
        status: newStatus,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `iot_devices/${id}`);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">IoT & Smart Village</h2>
          <p className="text-slate-500">Monitor and control village infrastructure in real-time.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={isCasting ? stopCasting : startCasting}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg ${
              isCasting 
                ? 'bg-red-500 text-white shadow-red-100 hover:bg-red-600' 
                : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
            }`}
          >
            <Cast className="w-5 h-5" />
            <span>{isCasting ? 'Stop Casting' : 'Screen Cast'}</span>
          </button>
          <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition">
            <Plus className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: IoT Devices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map((device) => (
              <GlassCard key={device.id} className="p-6 group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${
                    device.status === 'ON' || device.status === 'ACTIVE' || device.status === 'RECORDING'
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {device.type === 'light' && <Lightbulb className="w-6 h-6" />}
                    {device.type === 'sensor' && <Activity className="w-6 h-6" />}
                    {device.type === 'camera' && <Camera className="w-6 h-6" />}
                    {device.type === 'pump' && <Zap className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      device.status === 'ON' || device.status === 'ACTIVE' || device.status === 'RECORDING'
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {device.status}
                    </span>
                    <div className="flex items-center mt-2 space-x-2">
                      <Wifi className={`w-3 h-3 ${
                        device.signal === 'Strong' ? 'text-green-500' : device.signal === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      <span className="text-[10px] text-slate-400 font-bold">{device.battery}%</span>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-slate-800 mb-1">{device.name}</h4>
                <p className="text-xs text-slate-400 mb-6">Device ID: {device.id}</p>

                <div className="flex items-center justify-between">
                  {device.value !== null && (
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-slate-800">{device.value}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {device.type === 'light' ? '%' : device.type === 'sensor' ? 'AQI' : ''}
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => toggleDevice(device.id)}
                    className={`ml-auto p-3 rounded-xl transition-all ${
                      device.status === 'ON' || device.status === 'ACTIVE'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Column: Screen Cast & Stats */}
        <div className="space-y-6">
          <GlassCard className="p-6 bg-slate-900 text-white border-none">
            <h3 className="font-bold mb-4 flex items-center">
              <Cast className="w-5 h-5 mr-2 text-blue-400" />
              Live Screen Cast
            </h3>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group">
              {isCasting ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <Monitor className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs font-medium">No active stream</p>
                </div>
              )}
              {isCasting && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                  </div>
                  <button onClick={stopCasting} className="p-2 bg-red-500 rounded-xl hover:bg-red-600 transition">
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Resolution</p>
                <p className="text-sm font-bold">1080p HD</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Latency</p>
                <p className="text-sm font-bold">24ms</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Network Health
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 uppercase">Bandwidth Usage</span>
                  <span className="text-slate-800">64%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '64%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 uppercase">Device Connectivity</span>
                  <span className="text-slate-800">92%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Security Shield Active</p>
                  <p className="text-[10px] text-blue-600">All IoT traffic is encrypted</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default IoTView;
