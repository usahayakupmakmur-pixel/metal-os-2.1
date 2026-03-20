
import React, { useState, useEffect } from 'react';
import { kernel, KernelModule } from '../services/kernelService';
import { 
  Cpu, 
  Activity, 
  Terminal, 
  Shield, 
  Zap, 
  HardDrive, 
  Wifi, 
  Camera, 
  Map as MapIcon, 
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';

const SystemView: React.FC = () => {
  const [modules, setModules] = useState<KernelModule[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    setModules(kernel.getModules());
    setLogs(kernel.getLogs());

    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      setLogs(kernel.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-slate-950 text-slate-300 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cpu className="text-cyan-400" />
            MetalOS Kernel <span className="text-xs font-normal bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">v3.1.0-stable</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm italic">"Pancadaya Cognitive Governance Operating System"</p>
        </div>
        <div className="flex gap-6 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500 uppercase tracking-widest">System Uptime</span>
            <span className="text-cyan-400 font-bold text-lg">{formatUptime(uptime)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 uppercase tracking-widest">Kernel Status</span>
            <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
              <CheckCircle2 size={16} /> RUNNING
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kernel Modules */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} /> Registered Kernel Modules
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5 pb-2">
                    <th className="font-normal py-2 italic serif">Module ID</th>
                    <th className="font-normal py-2 italic serif">Name</th>
                    <th className="font-normal py-2 italic serif">Type</th>
                    <th className="font-normal py-2 italic serif">Version</th>
                    <th className="font-normal py-2 italic serif">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {modules.map(mod => (
                    <tr key={mod.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3 text-cyan-400 font-bold">{mod.id}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-200">{mod.name}</div>
                        <div className="text-xs text-slate-500">{mod.description}</div>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          mod.type === 'DRIVER' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                          mod.type === 'SYSTEM' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                          'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }`}>
                          {mod.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{mod.version}</td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1.5 ${
                          mod.status === 'LOADED' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            mod.status === 'LOADED' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`} />
                          {mod.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Hardware & API Integration Strategy */}
          <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="text-cyan-400" size={20} /> Integration & Interoperability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hardware Drivers */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <HardDrive size={14} /> Hardware Drivers
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm"><Camera size={14} /> Camera Subsystem</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 rounded">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm"><Wifi size={14} /> Mesh Network (WargaNet)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 rounded">CONNECTED</span>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                    <span className="flex items-center gap-2 text-sm"><Activity size={14} /> IoT Sensor Array</span>
                    <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 rounded">POLLING</span>
                  </div>
                </div>
              </div>

              {/* Software Protocols */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Database size={14} /> Software Protocols
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm"><Zap size={14} /> Gemini Cognitive API</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 rounded">READY</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm"><MapIcon size={14} /> Google Maps Grounding</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 rounded">SYNCED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm"><Shield size={14} /> RBAC Security Layer</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 rounded">ENFORCED</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* System Logs / Terminal */}
        <div className="space-y-6">
          <section className="bg-black border border-white/10 rounded-2xl p-4 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="text-cyan-400" size={16} /> Kernel Log Stream
              </h2>
              <button className="text-slate-500 hover:text-white transition">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-[11px]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600 shrink-0">[{i.toString().padStart(2, '0')}]</span>
                  <span className={log.includes('Error') ? 'text-red-400' : log.includes('IPC') ? 'text-purple-400' : 'text-slate-400'}>
                    {log}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 animate-pulse">
                <span className="text-slate-600 shrink-0">[{logs.length.toString().padStart(2, '0')}]</span>
                <span className="text-cyan-400">_</span>
              </div>
            </div>
          </section>

          {/* System Resources */}
          <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-emerald-400" size={16} /> Resource Allocation
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 uppercase">Cognitive Load</span>
                  <span className="text-cyan-400">24%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[24%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 uppercase">Memory Usage</span>
                  <span className="text-purple-400">1.2 GB / 4.0 GB</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[30%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 uppercase">Network I/O</span>
                  <span className="text-emerald-400">842 KB/s</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[15%]" />
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default SystemView;
