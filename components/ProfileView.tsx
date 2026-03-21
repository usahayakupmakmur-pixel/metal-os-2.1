
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Award, Shield, CreditCard, QrCode, Edit3, 
  Camera, Check, X, ChevronRight, Star, TrendingUp,
  Heart, Zap, Info, PenTool, Fingerprint
} from 'lucide-react';
import { CitizenProfile } from '../types';

interface ProfileViewProps {
  user: CitizenProfile;
  onUpdate: (updates: Partial<CitizenProfile>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<CitizenProfile>>(user);
  const [activeTab, setActiveTab] = useState<'identity' | 'stats' | 'achievements' | 'security'>('identity');

  React.useEffect(() => {
    if (isEditing) {
      setEditedUser(user);
    }
  }, [isEditing, user]);

  const handleSave = () => {
    onUpdate(editedUser);
    setIsEditing(false);
  };

  const handleChange = (field: keyof CitizenProfile, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const userTypeOptions = [
    { label: 'Citizen', value: 'citizen' },
    { label: 'Business Entity', value: 'business_entity' },
    { label: 'Government', value: 'government' }
  ];

  const stats = [
    { label: 'Warga Score', value: user.wargaScore, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Social Points', value: user.points, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'WargaPay', value: `Rp ${user.balance.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Reputation', value: 'Elite', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Profile Header & Identity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Digital KTP Card */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ rotateY: -10, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            className="relative w-full aspect-[1.58/1] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-3xl p-6 text-white shadow-2xl overflow-hidden border border-white/20 group"
          >
            {/* Card Background Patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Card Content */}
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-[0.2em] uppercase opacity-70">MetalOS Identity</h2>
                    <p className="text-sm font-bold tracking-wider">PROVINSI LAMPUNG</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono opacity-60">CHIP ID: {user.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="flex gap-6 items-center mt-4">
                <div className="relative">
                  <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-slate-800">
                    <img 
                      src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-slate-900 shadow-lg">
                    <Check size={16} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">NIK / Virtual ID</p>
                  <p className="text-xl font-bold tracking-tighter font-mono">{user.nik || '1871000000000001'}</p>
                  
                  <div className="pt-2">
                    <p className="text-lg font-bold leading-tight">{user.name}</p>
                    <p className="text-xs opacity-80">{user.occupation || 'Warga Kreatif'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[8px] opacity-60 uppercase">Role</p>
                      <p className="text-[10px] font-bold">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-60 uppercase">User Type</p>
                      <p className="text-[10px] font-bold capitalize">{(user.userType || 'citizen').replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-[8px] font-bold uppercase tracking-widest">
                    Smart Village
                  </div>
                  <div className="px-2 py-1 bg-emerald-500/20 backdrop-blur-md rounded border border-emerald-500/30 text-[8px] font-bold uppercase tracking-widest text-emerald-300">
                    Active
                  </div>
                </div>
                <div className="bg-white p-1 rounded-lg">
                  <QrCode size={40} className="text-slate-900" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'identity', label: 'Informasi Pribadi', icon: User },
          { id: 'stats', label: 'Statistik & Aktivitas', icon: TrendingUp },
          { id: 'achievements', label: 'Pencapaian', icon: Award },
          { id: 'security', label: 'Keamanan & Tanda Tangan', icon: Shield },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'identity' && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                Detail Profil
              </h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isEditing 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
                {isEditing ? 'Simpan Perubahan' : 'Edit Profil'}
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ProfileField 
                  label="Nama Lengkap" 
                  value={user.name} 
                  icon={User} 
                  isEditing={isEditing} 
                  onChange={(v) => handleChange('name', v)}
                />
                <ProfileField 
                  label="Nomor Telepon" 
                  value={user.phone || '+62 812-XXXX-XXXX'} 
                  icon={Phone} 
                  isEditing={isEditing} 
                  onChange={(v) => handleChange('phone', v)}
                />
                <ProfileField 
                  label="Alamat Email" 
                  value={user.email || 'user@yosomulyo.id'} 
                  icon={Mail} 
                  isEditing={isEditing} 
                  onChange={(v) => handleChange('email', v)}
                />
                <ProfileField 
                  label="Alamat Domisili" 
                  value={user.address || 'RT 01 RW 01, Yosomulyo'} 
                  icon={MapPin} 
                  isEditing={isEditing} 
                  onChange={(v) => handleChange('address', v)}
                />
              </div>

              <div className="space-y-6">
                <ProfileField 
                  label="User Type" 
                  value={user.userType || 'citizen'} 
                  icon={Shield} 
                  isEditing={isEditing} 
                  options={userTypeOptions}
                  onChange={(v) => handleChange('userType', v)}
                />
                <ProfileField 
                  label="Pekerjaan" 
                  value={user.occupation || 'Wirausaha'} 
                  icon={Briefcase} 
                  isEditing={isEditing} 
                  onChange={(v) => handleChange('occupation', v)}
                />
                <ProfileField 
                  label="Tanggal Lahir" 
                  value={user.birthDate || '1990-01-01'} 
                  icon={Calendar} 
                  isEditing={isEditing} 
                  type="date"
                  onChange={(v) => handleChange('birthDate', v)}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Edit3 size={12} /> Bio Singkat
                  </label>
                  {isEditing ? (
                    <textarea 
                      value={editedUser.bio || ''} 
                      onChange={(e) => handleChange('bio', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                    />
                  ) : (
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic">
                      {user.bio || 'Belum ada bio.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Warga Score Analysis */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Analisis Warga Score</h3>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-bold">EXCELLENT</span>
              </div>
              
              <div className="space-y-6">
                <ScoreBar label="Kontribusi Sosial" score={85} color="bg-blue-500" />
                <ScoreBar label="Ketaatan Aturan" score={92} color="bg-emerald-500" />
                <ScoreBar label="Partisipasi Ekonomi" score={78} color="bg-amber-500" />
                <ScoreBar label="Kebersihan Lingkungan" score={88} color="bg-cyan-500" />
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Insight Sistem</p>
                  <p className="text-xs text-slate-500 mt-1">Skor Anda meningkat 12% bulan ini karena partisipasi aktif dalam program Musrenbang Digital.</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Aktivitas Terakhir</h3>
              <div className="space-y-6">
                <ActivityItem 
                  title="Pembayaran Pajak" 
                  time="2 jam yang lalu" 
                  icon={CreditCard} 
                  color="text-emerald-500" 
                  bg="bg-emerald-50" 
                />
                <ActivityItem 
                  title="Laporan Sampah" 
                  time="Kemarin" 
                  icon={MapPin} 
                  color="text-blue-500" 
                  bg="bg-blue-50" 
                />
                <ActivityItem 
                  title="Update Profil" 
                  time="3 hari yang lalu" 
                  icon={User} 
                  color="text-purple-500" 
                  bg="bg-purple-50" 
                />
                <ActivityItem 
                  title="Login Sistem" 
                  time="4 hari yang lalu" 
                  icon={Shield} 
                  color="text-slate-500" 
                  bg="bg-slate-50" 
                />
              </div>
              <button className="w-full mt-6 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {user.achievements?.map(a => (
              <AchievementCard 
                key={a.id}
                title={a.title} 
                desc="Pencapaian terverifikasi sistem" 
                icon={a.icon} 
                date={a.date} 
              />
            ))}
            <div className="col-span-full bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <Award size={32} className="text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-500">Pencapaian Terkunci</h4>
              <p className="text-sm text-slate-400 mt-2 max-w-xs">Terus berkontribusi untuk membuka lebih banyak lencana dan reward eksklusif!</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Digital Signature */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <PenTool size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Tanda Tangan Digital</h3>
                  <p className="text-xs text-slate-500">Gunakan untuk verifikasi dokumen Office Suite</p>
                </div>
              </div>

              <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                <div className="text-center p-6 transition-transform group-hover:scale-105 duration-500">
                  <p className="font-serif text-3xl text-slate-400 opacity-50 select-none italic">{user.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-4 uppercase tracking-[0.3em]">Verified by MetalOS</p>
                </div>
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors"></div>
                <button className="absolute bottom-4 right-4 p-2 bg-white shadow-lg rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
                  <Edit3 size={16} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <Fingerprint size={18} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">Biometric Auth Active</span>
                  </div>
                  <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">Tanda tangan ini terenkripsi secara end-to-end dan diakui secara hukum di lingkungan Kelurahan Yosomulyo.</p>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 mb-2">Pengaturan Keamanan</h3>
              
              <SecurityOption 
                icon={Shield} 
                title="Two-Factor Authentication" 
                desc="Amankan akun dengan verifikasi tambahan" 
                active={true} 
              />
              <SecurityOption 
                icon={Zap} 
                title="Auto-Lock Session" 
                desc="Kunci otomatis setelah 15 menit tidak aktif" 
                active={false} 
              />
              <SecurityOption 
                icon={Mail} 
                title="Login Notifications" 
                desc="Dapatkan email saat ada login baru" 
                active={true} 
              />

              <div className="pt-4">
                <button className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors">
                  Reset Semua Kunci Keamanan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SecurityOption: React.FC<{ icon: any; title: string; desc: string; active: boolean }> = ({ icon: Icon, title, desc, active }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
    </div>
  </div>
);

const ProfileField: React.FC<{
  label: string;
  value: string;
  icon: any;
  isEditing: boolean;
  type?: string;
  options?: { label: string; value: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, icon: Icon, isEditing, type = 'text', options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <Icon size={12} /> {label}
    </label>
    {isEditing ? (
      options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input 
          type={type}
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      )
    ) : (
      <p className="text-sm font-bold text-slate-800 px-1">
        {options ? options.find(o => o.value === value)?.label || value : value}
      </p>
    )}
  </div>
);

const ScoreBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800">{score}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full ${color}`}
      ></motion.div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ title: string; time: string; icon: any; color: string; bg: string }> = ({ title, time, icon: Icon, color, bg }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
      <Icon className={color} size={18} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-[10px] text-slate-400">{time}</p>
    </div>
  </div>
);

const AchievementCard: React.FC<{ title: string; desc: string; icon: string; date: string }> = ({ title, desc, icon, date }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group">
    <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
    <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
    <p className="text-[10px] text-slate-500 mt-1 leading-tight">{desc}</p>
    <div className="mt-4 pt-4 border-t border-slate-50">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
    </div>
  </div>
);

export default ProfileView;
