import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Activity, Zap, Server, 
  Search, AlertTriangle, CheckCircle2, 
  TrendingUp, Users, Database, Globe,
  Cpu, HardDrive, BarChart3, Clock,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { getAllServicesStatus } from '../src/services/systemHealthService';

const SystemEvaluationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'performance' | 'security' | 'governance'>('performance');
  const [serviceStatus, setServiceStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getAllServicesStatus();
      setServiceStatus(status);
    };
    fetchStatus();
  }, []);

  const performanceData = [
    { time: '00:00', latency: 45, load: 12 },
    { time: '04:00', latency: 38, load: 8 },
    { time: '08:00', latency: 120, load: 45 },
    { time: '12:00', latency: 150, load: 68 },
    { time: '16:00', latency: 110, load: 52 },
    { time: '20:00', latency: 85, load: 35 },
    { time: '23:59', latency: 55, load: 18 },
  ];

  const securityFindings = [
    { id: 1, severity: 'LOW', title: 'Missing String Size Limits', desc: 'Several user profile fields lack explicit size constraints in Firestore rules.', status: 'RESOLVED' },
    { id: 2, severity: 'LOW', title: 'Type Validation Gaps', desc: 'Some optional fields in the user document do not have strict type checking.', status: 'RESOLVED' },
    { id: 3, severity: 'INFO', title: 'PII Exposure Check', desc: 'Verified that sensitive user data is correctly scoped to document owners.', status: 'PASSED' },
    { id: 4, severity: 'INFO', title: 'RBAC Integrity', desc: 'Role-based access control verified for all administrative endpoints.', status: 'PASSED' },
    { id: 5, severity: 'INFO', title: 'Google OAuth Audit', desc: 'OAuth callback security and token storage encryption verified.', status: 'PASSED' },
    { id: 6, severity: 'INFO', title: 'Gemini API Safety', desc: 'Content filtering and rate limiting for AI assistant verified.', status: 'PASSED' },
  ];

  const governanceMetrics = [
    { name: 'Warga Berkarya', value: 450, color: '#06b6d4' },
    { name: 'Warga Berdaya', value: 320, color: '#10b981' },
    { name: 'Warga Bergerak', value: 280, color: '#f59e0b' },
    { name: 'Lurah / Admin', value: 15, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <Shield className="text-cyan-400" size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">System Evaluation & Audit</h1>
            </div>
            <p className="text-slate-400 max-w-xl">Evaluasi tingkat lanjut terhadap performa, keamanan, dan dampak tata kelola MetalOS v2.1.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">System Health</p>
              <p className="text-2xl font-black text-emerald-400">99.9%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Security Score</p>
              <p className="text-2xl font-black text-cyan-400">A+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'performance', label: 'Performa & Resource', icon: Activity },
          { id: 'security', label: 'Audit Keamanan', icon: Shield },
          { id: 'governance', label: 'Evaluasi Tata Kelola', icon: Globe },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'performance' && (
          <>
            <div className="lg:col-span-2 space-y-8">
              {/* API Integration Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                        <Globe size={20} />
                      </div>
                      <h4 className="font-bold text-slate-800">Google Workspace API</h4>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase">Connected</span>
                  </div>
                  <div className="space-y-3">
                    <ApiStatusItem label="Gmail API" serviceKey="gmail" latency="120ms" serviceStatus={serviceStatus} />
                    <ApiStatusItem label="Calendar API" serviceKey="calendar" latency="85ms" serviceStatus={serviceStatus} />
                    <ApiStatusItem label="Drive API" serviceKey="drive" latency="150ms" serviceStatus={serviceStatus} />
                    <ApiStatusItem label="People API" serviceKey="people" latency="95ms" serviceStatus={serviceStatus} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                        <Sparkles size={20} />
                      </div>
                      <h4 className="font-bold text-slate-800">Gemini AI Engine</h4>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase">Active</span>
                  </div>
                  <div className="space-y-3">
                    <ApiStatusItem label="Flash 2.0" serviceKey="gemini_flash" latency="450ms" serviceStatus={serviceStatus} />
                    <ApiStatusItem label="Pro 1.5" serviceKey="gemini_pro" latency="1.2s" serviceStatus={serviceStatus} />
                    <ApiStatusItem label="Embedding v3" serviceKey="gemini_embedding" latency="110ms" serviceStatus={serviceStatus} />
                    <ApiStatusItem label="Image Gen" serviceKey="gemini_image" latency="2.4s" serviceStatus={serviceStatus} />
                  </div>
                </div>
              </div>

              {/* Latency Chart */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">API Latency (ms)</h3>
                    <p className="text-sm text-slate-500">Waktu respon rata-rata sistem dalam 24 jam terakhir.</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                    <Zap size={14} /> -12% vs Kemarin
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResourceCard icon={Cpu} label="CPU Usage" value="24%" color="text-blue-500" bg="bg-blue-50" />
                <ResourceCard icon={Database} label="Memory" value="1.2 GB" valueMax="4 GB" color="text-purple-500" bg="bg-purple-50" />
                <ResourceCard icon={HardDrive} label="Storage" value="45 GB" valueMax="100 GB" color="text-amber-500" bg="bg-amber-50" />
              </div>
            </div>

            <div className="space-y-8">
              {/* System Logs */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" />
                  Real-time Kernel Logs
                </h3>
                <div className="space-y-4">
                  <LogItem time="09:01:39" msg="Auth service initialized successfully" type="SUCCESS" />
                  <LogItem time="09:01:35" msg="Database connection established (Region: asia-east1)" type="INFO" />
                  <LogItem time="09:01:30" msg="Vite HMR disabled by platform" type="INFO" />
                  <LogItem time="09:01:25" msg="Kernel v2.1.0-stable loaded" type="SUCCESS" />
                  <LogItem time="09:00:55" msg="Background sync completed for 12 nodes" type="SUCCESS" />
                  <LogItem time="08:55:20" msg="High load detected on Geospatial module" type="WARNING" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'security' && (
          <div className="col-span-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <SecurityMetric label="Threats Blocked" value="1,240" icon={Shield} color="text-emerald-500" />
              <SecurityMetric label="Active Sessions" value="85" icon={Users} color="text-blue-500" />
              <SecurityMetric label="Encryption" value="AES-256" icon={Lock} color="text-cyan-500" />
              <SecurityMetric label="Uptime" value="99.99%" icon={Zap} color="text-amber-500" />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Security Audit Findings (Red Team Edition)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finding</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {securityFindings.map(finding => (
                      <tr key={finding.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-sm font-mono text-slate-400">#{finding.id}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            finding.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                            finding.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                            finding.severity === 'LOW' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {finding.severity}
                          </span>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-800">{finding.title}</td>
                        <td className="py-4 text-sm text-slate-500 max-w-md">{finding.desc}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                            <CheckCircle2 size={14} /> {finding.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <>
            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Distribusi Peran Warga</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={governanceMetrics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#475569'}} width={120} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                      {governanceMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32"></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-cyan-400" />
                Social Impact Score
              </h3>
              <div className="space-y-8">
                <ImpactItem label="Pemberdayaan Ekonomi" value="8.4" desc="Peningkatan pendapatan UMKM lokal" />
                <ImpactItem label="Partisipasi Digital" value="9.2" desc="Adopsi sistem Office Suite oleh warga" />
                <ImpactItem label="Resiliensi Lingkungan" value="7.8" desc="Efisiensi pengelolaan sampah digital" />
                <ImpactItem label="Kualitas Layanan" value="8.9" desc="Kecepatan respon tata kelola" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ResourceCard: React.FC<{ icon: any; label: string; value: string; valueMax?: string; color: string; bg: string }> = ({ icon: Icon, label, value, valueMax, color, bg }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-end gap-2">
      <p className="text-2xl font-black text-slate-800">{value}</p>
      {valueMax && <p className="text-xs text-slate-400 mb-1">/ {valueMax}</p>}
    </div>
    <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color.replace('text', 'bg')} w-1/4`}></div>
    </div>
  </div>
);

const LogItem: React.FC<{ time: string; msg: string; type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' }> = ({ time, msg, type }) => (
  <div className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors">
    <span className="text-[10px] font-mono text-slate-400 mt-1">{time}</span>
    <div className="flex-1">
      <p className={`text-xs font-bold ${
        type === 'SUCCESS' ? 'text-emerald-600' :
        type === 'WARNING' ? 'text-amber-600' :
        type === 'ERROR' ? 'text-red-600' :
        'text-slate-600'
      }`}>
        [{type}] {msg}
      </p>
    </div>
  </div>
);

const SecurityMetric: React.FC<{ label: string; value: string; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
    <div className={`w-12 h-12 mx-auto bg-slate-50 ${color} rounded-2xl flex items-center justify-center mb-4`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-800">{value}</p>
  </div>
);

const ImpactItem: React.FC<{ label: string; value: string; desc: string }> = ({ label, value, desc }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-slate-400">{desc}</p>
      </div>
      <p className="text-2xl font-black text-cyan-400">{value}</p>
    </div>
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-cyan-400" style={{ width: `${parseFloat(value) * 10}%` }}></div>
    </div>
  </div>
);

const ApiStatusItem: React.FC<{ label: string; serviceKey: string; latency: string; serviceStatus: Record<string, boolean> }> = ({ label, serviceKey, latency, serviceStatus }) => {
  const status = serviceStatus[serviceKey];
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-400">{latency}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className={`text-[10px] font-bold uppercase ${status ? 'text-emerald-600' : 'text-red-600'}`}>{status ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
};

export default SystemEvaluationView;
