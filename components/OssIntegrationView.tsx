
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  User, 
  Building2, 
  GraduationCap, 
  HeartPulse, 
  FileCheck, 
  ExternalLink, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Lock,
  Globe,
  Database
} from 'lucide-react';
import { CitizenProfile } from '../types';
import { MOCK_USER } from '../constants';

interface OssIntegrationViewProps {
  user?: CitizenProfile;
  onUpdateProfile?: (updates: Partial<CitizenProfile>) => void;
}

const OssIntegrationView: React.FC<OssIntegrationViewProps> = ({ user = MOCK_USER, onUpdateProfile }) => {
  const [isLinking, setIsLinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'OSS' | 'SSO'>('IDENTITY');

  const idFields = [
    { key: 'nik', label: 'NIK (Digital KTP)', icon: Fingerprint, color: 'text-blue-400', placeholder: '3201xxxxxxxxxxxx' },
    { key: 'nib', label: 'NIB (Business ID)', icon: Building2, color: 'text-emerald-400', placeholder: '0220xxxxxxxx' },
    { key: 'nip', label: 'NIP (Civil Servant ID)', icon: Shield, color: 'text-amber-400', placeholder: '1985xxxxxxxxxxxx' },
    { key: 'nim', label: 'NIM (University ID)', icon: GraduationCap, color: 'text-indigo-400', placeholder: '2101xxxxxx' },
    { key: 'nis', label: 'NIS (School ID)', icon: GraduationCap, color: 'text-purple-400', placeholder: '12345678' },
    { key: 'kip', label: 'KIP (Smart Indonesia)', icon: FileCheck, color: 'text-rose-400', placeholder: 'KIP-xxxxxx' },
    { key: 'kis', label: 'KIS (Healthy Indonesia)', icon: HeartPulse, color: 'text-cyan-400', placeholder: '0001xxxxxxxx' },
  ];

  const handleLinkOSS = () => {
    setIsLinking(true);
    setTimeout(() => {
      onUpdateProfile?.({ isOssLinked: true, ossId: 'OSS-' + Math.random().toString(36).substr(2, 9).toUpperCase() });
      setIsLinking(false);
    }, 2000);
  };

  return (
    <div className="min-h-full bg-slate-950 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <Shield className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Identity & OSS Kernel</h1>
            </div>
            <p className="text-slate-400 font-medium max-w-xl">
              Advanced User Access Management integrated with Online Single Submission (OSS) and National Identity Systems.
            </p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
            {(['IDENTITY', 'OSS', 'SSO'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Fingerprint size={80} className="text-white" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">{user.name}</h2>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Metal ID Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-sm font-bold text-white tracking-tight">Verified Citizen</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">OSS Connection</p>
                    <div className="flex items-center gap-2">
                      {user.isOssLinked ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span className="text-sm font-bold text-white tracking-tight">Linked: {user.ossId}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} className="text-amber-400" />
                          <span className="text-sm font-bold text-slate-400 tracking-tight">Not Linked</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20">
              <h3 className="text-lg font-black mb-2 tracking-tight">Single Sign-On (SSO)</h3>
              <p className="text-white/70 text-xs mb-6 leading-relaxed">
                Use your MetalOS ID to access all integrated government and business services seamlessly.
              </p>
              <button className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                <Lock size={14} /> Manage SSO Access
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'IDENTITY' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white tracking-tight">Identification Matrix</h3>
                  <button className="text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors">
                    Request Verification
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {idFields.map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <field.icon size={12} className={field.color} />
                        {field.label}
                      </label>
                      <div className="relative group">
                        <input 
                          type="text"
                          placeholder={field.placeholder}
                          value={(user as any)[field.key] || ''}
                          onChange={(e) => onUpdateProfile?.({ [field.key]: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'OSS' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Building2 size={120} className="text-white" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-500/20 rounded-3xl border border-emerald-500/20">
                        <Globe className="text-emerald-400" size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">OSS Integration</h3>
                        <p className="text-slate-400 text-sm font-medium">Online Single Submission - Risk Based Approach (OSS-RBA)</p>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                      Integrate your business permits and licensing data directly with the national OSS system. MetalOS provides a secure bridge for real-time data synchronization.
                    </p>

                    <div className="pt-4">
                      <button 
                        onClick={handleLinkOSS}
                        disabled={isLinking || user.isOssLinked}
                        className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
                          user.isOssLinked 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-default' 
                          : 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/10 active:scale-95'
                        }`}
                      >
                        {isLinking ? (
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : user.isOssLinked ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <ExternalLink size={18} />
                        )}
                        {isLinking ? 'Connecting to OSS...' : user.isOssLinked ? 'OSS Account Linked' : 'Link OSS Account'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl w-fit">
                      <Database className="text-blue-400" size={20} />
                    </div>
                    <h4 className="text-lg font-black text-white tracking-tight">Data Sync</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Automatically sync your NIB and business permits with the village geospatial dashboard for better planning.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                    <div className="p-3 bg-amber-500/20 rounded-2xl w-fit">
                      <FileCheck className="text-amber-400" size={20} />
                    </div>
                    <h4 className="text-lg font-black text-white tracking-tight">Permit Tracking</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Track your licensing status and receive notifications for renewals directly within MetalOS.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'SSO' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">SSO Providers</h3>
                  <p className="text-slate-400 text-sm font-medium">Manage third-party authentication links.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Google Workspace', icon: Globe, status: 'Connected', color: 'text-blue-400' },
                    { name: 'OSS National ID', icon: Building2, status: user.isOssLinked ? 'Connected' : 'Not Linked', color: 'text-emerald-400' },
                    { name: 'MetalOS Kernel Auth', icon: Shield, status: 'Active', color: 'text-cyan-400' },
                  ].map(provider => (
                    <div key={provider.name} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-white/5 rounded-2xl ${provider.color}`}>
                          <provider.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{provider.name}</h4>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{provider.status}</p>
                        </div>
                      </div>
                      <button className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OssIntegrationView;
