
import React, { useState, useEffect } from 'react';
import { kernel, KernelModule } from '../services/kernelService';
import { Power, Cpu, Shield, RefreshCw, Terminal, Activity, Server } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [modules, setModules] = useState<KernelModule[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['> Kernel interface ready.', '> Waiting for command...']);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    setModules(kernel.getModules());
    const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleModule = (id: string, currentStatus: string) => {
    if (currentStatus === 'LOADED') {
      kernel.unloadModule(id);
      log(`SYSCALL: Unload module [${id}]`);
    } else {
      kernel.loadModule(id);
      log(`SYSCALL: Load module [${id}]`);
    }
    setModules([...kernel.getModules()]); // Force refresh
  };

  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setConsoleOutput(prev => [...prev.slice(-7), `[${timestamp}] ${msg}`]);
  };

  const testComms = (id: string) => {
      try {
          const res = kernel.sendMessage(id, "PING_TEST_PACKET");
          log(res);
      } catch (e: any) {
          log(`ERROR: ${e.message}`);
      }
  }

  const formatUptime = (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
                <Activity className="text-blue-400" size={20} />
                <h3 className="font-bold text-sm text-slate-300">SYSTEM UPTIME</h3>
            </div>
            <p className="text-2xl font-mono">{formatUptime(uptime)}</p>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
                <Server className="text-green-400" size={20} />
                <h3 className="font-bold text-sm text-slate-300">ACTIVE MODULES</h3>
            </div>
            <p className="text-2xl font-mono">{modules.filter(m => m.status === 'LOADED').length} / {modules.length}</p>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
                <Cpu className="text-purple-400" size={20} />
                <h3 className="font-bold text-sm text-slate-300">KERNEL VERSION</h3>
            </div>
            <p className="text-2xl font-mono">1.0.4-alpha</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="lg:col-span-2 space-y-4">
             <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Cpu size={20} /> Installed Kernel Modules
             </h2>
             {modules.map((mod) => (
            <div key={mod.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${mod.status === 'LOADED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {mod.type === 'DRIVER' ? <RefreshCw size={24} /> : mod.type === 'SYSTEM' ? <Shield size={24} /> : <Terminal size={24} />}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {mod.name}
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">v{mod.version}</span>
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">{mod.description}</p>
                    <div className="flex gap-2">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                            mod.status === 'LOADED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {mod.status}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                            {mod.type}
                        </span>
                    </div>
                </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => toggleModule(mod.id, mod.status)}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                            mod.status === 'LOADED' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                        }`}
                        title={mod.status === 'LOADED' ? 'Unload Module' : 'Load Module'}
                    >
                    <Power size={18} />
                    </button>
                    {mod.status === 'LOADED' && (
                        <button 
                            onClick={() => testComms(mod.id)} 
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 flex items-center justify-center"
                            title="Test Connectivity"
                        >
                            <Activity size={18} />
                        </button>
                    )}
                </div>
            </div>
            ))}
        </div>

        {/* Terminal Output */}
        <div className="lg:col-span-1">
             <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                <Terminal size={20} /> Kernel Log
             </h2>
            <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono shadow-lg border border-slate-700 h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                {consoleOutput.map((line, i) => (
                    <div key={i} className="break-words border-b border-slate-800/50 pb-1 last:border-0">{line}</div>
                ))}
                </div>
                <div className="mt-4 pt-2 border-t border-slate-700 flex items-center gap-2 text-xs">
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
