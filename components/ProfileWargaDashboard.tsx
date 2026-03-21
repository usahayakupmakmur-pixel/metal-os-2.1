
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Fingerprint, Building2, 
  Globe, Lock, CheckCircle2, AlertCircle,
  ArrowRight, ExternalLink, Database,
  Key, Smartphone, History, Settings
} from 'lucide-react';
import { CitizenProfile } from '../types';
import ProfileView from './ProfileView';
import OssIntegrationView from './OssIntegrationView';

interface ProfileWargaDashboardProps {
  user: CitizenProfile;
  onUpdate: (updates: Partial<CitizenProfile>) => void;
}

const ProfileWargaDashboard: React.FC<ProfileWargaDashboardProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'IDENTITY_OS' | 'SSO'>('PROFILE');
  const [isSsoConnecting, setIsSsoConnecting] = useState(false);

  const handleSsoConnect = () => {
    setIsSsoConnecting(true);
    // Simulate Warga-ID SSO connection
    setTimeout(() => {
      onUpdate({ ssoProvider: 'METAL_ID', isOssLinked: true });
      setIsSsoConnecting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Unified Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profil Warga</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unified Identity & Governance</p>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {[
                { id: 'PROFILE', label: 'Profil Saya', icon: User },
                { id: 'IDENTITY_OS', label: 'Identity & OS', icon: Fingerprint },
                { id: 'SSO', label: 'Warga-ID SSO', icon: Lock },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'PROFILE' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfileView user={user} onUpdate={onUpdate} />
            </motion.div>
          )}

          {activeTab === 'IDENTITY_OS' && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OssIntegrationView user={user} onUpdateProfile={onUpdate} />
            </motion.div>
          )}

          {activeTab === 'SSO' && (
            <motion.div
              key="sso"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SSO Status Card */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Shield size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                          <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Warga-ID SSO</h3>
                      </div>
                      
                      <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status Koneksi</p>
                        <div className="flex items-center gap-2">
                          {user.ssoProvider === 'METAL_ID' ? (
                            <>
                              <CheckCircle2 size={16} className="text-emerald-300" />
                              <span className="text-sm font-bold">Terhubung ke Warga-ID</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={16} className="text-amber-300" />
                              <span className="text-sm font-bold">Belum Terhubung</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={handleSsoConnect}
                        disabled={isSsoConnecting || user.ssoProvider === 'METAL_ID'}
                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                          user.ssoProvider === 'METAL_ID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl'
                        }`}
                      >
                        {isSsoConnecting ? (
                          <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                        ) : user.ssoProvider === 'METAL_ID' ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Key size={14} />
                        )}
                        {isSsoConnecting ? 'Menghubungkan...' : user.ssoProvider === 'METAL_ID' ? 'SSO Aktif' : 'Hubungkan Warga-ID'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SSO Features */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Manfaat Warga-ID SSO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { title: 'Satu Akun untuk Semua', desc: 'Akses Office Suite, OSS, dan layanan publik hanya dengan satu kredensial.', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { title: 'Keamanan Militer', desc: 'Enkripsi end-to-end dan autentikasi biometrik untuk melindungi data Anda.', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        { title: 'Sinkronisasi Real-time', desc: 'Data profil Anda otomatis terupdate di seluruh modul MetalOS.', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { title: 'Akses Mobile Cepat', desc: 'Login instan menggunakan QR Code atau Face ID di aplikasi mobile.', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
                      ].map((feature, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                          <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} h-fit`}>
                            <feature.icon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{feature.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Riwayat Akses SSO</h3>
                      <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        Lihat Semua <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { app: 'Office Suite', time: '2 menit yang lalu', device: 'Chrome on macOS', status: 'Success' },
                        { app: 'OSS Portal', time: '1 jam yang lalu', device: 'MetalOS Mobile', status: 'Success' },
                        { app: 'Smart Gateway', time: 'Kemarin, 14:20', device: 'MetalGate Terminal', status: 'Success' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <History size={16} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{log.app}</p>
                              <p className="text-[10px] text-slate-500">{log.time} • {log.device}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[8px] font-black uppercase tracking-widest">
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileWargaDashboard;
