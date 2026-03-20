
import React, { useState } from 'react';
import { ViewMode, CitizenProfile } from '../types';
import { SecurityService } from '../services/securityService';
import { LayoutDashboard, Building2, Wallet, Leaf, Users, Settings, Activity, Router, Briefcase, Siren, Store, ChevronLeft, ChevronRight, Car, HeartPulse, ShoppingBag, GraduationCap, Lock, Phone, Wifi, Trash2, Cpu, Target, Map, CheckCircle2, Package, Folder, FileText } from 'lucide-react';
import { MOCK_USER } from '../constants';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isTvMode?: boolean;
  onToggleTvMode?: (mode: boolean) => void;
  user: CitizenProfile;
}

// Custom Composite Icon for WargaNet
const WargaNetIcon = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
  <div className={`${className} relative flex items-center justify-center overflow-visible`}>
    <Leaf className="absolute text-green-400/40 scale-125 rotate-12" strokeWidth={1.5} />
    <Phone className="w-full h-full text-green-400 z-10 relative" strokeWidth={strokeWidth} />
    <div className="absolute -top-1.5 -right-1.5 bg-slate-900 rounded-full p-[1px] border border-slate-700 z-20">
        <Wifi className="w-2.5 h-2.5 text-green-300" strokeWidth={3} />
    </div>
    <div className="absolute -bottom-1.5 -right-1.5 bg-slate-900 rounded-full p-[1px] border border-slate-700 z-20">
        <Trash2 className="w-2.5 h-2.5 text-green-300" strokeWidth={3} />
    </div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isCollapsed, onToggle, isTvMode = false, onToggleTvMode, user = MOCK_USER }) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeUser = user || MOCK_USER;

  const allMenuItems = [
    { mode: ViewMode.DASHBOARD, label: 'Dasbor', icon: LayoutDashboard },
    { mode: ViewMode.GOVERNANCE, label: 'Tata Kelola', icon: Building2 },
    { mode: ViewMode.EOFFICE, label: 'Ruang Kerja', icon: Briefcase },
    { mode: ViewMode.TASKS, label: 'Team Tasks', icon: CheckCircle2 },
    { mode: ViewMode.ASSETS, label: 'Asset Management', icon: Package },
    { mode: ViewMode.TRACKER, label: 'Operational Tracker', icon: Activity },
    { mode: ViewMode.BERDAYA, label: 'Berdaya (Niaga)', icon: ShoppingBag },
    { mode: ViewMode.ECONOMY, label: 'Keuangan', icon: Wallet },
    { mode: ViewMode.CREATIVE_FINANCE, label: 'Pembiayaan Kreatif', icon: Target },
    { mode: ViewMode.GEOSPATIAL, label: 'Geospatial Dashboard', icon: Map },
    { mode: ViewMode.MARKET, label: 'Pasar Payungi', icon: Store },
    { mode: ViewMode.PARKING, label: 'Parkir & Mobilitas', icon: Car },
    { mode: ViewMode.HEALTH, label: 'Kesehatan', icon: HeartPulse },
    { mode: ViewMode.EDUCATION, label: 'Pendidikan', icon: GraduationCap },
    { mode: ViewMode.ENVIRONMENT, label: 'WargaNet', icon: WargaNetIcon },
    { mode: ViewMode.SOCIAL, label: 'Sosial & Laporan', icon: Users },
    { mode: ViewMode.GAPURA, label: 'Gerbang Pintar', icon: Router },
    { mode: ViewMode.POSKAMLING, label: 'Keamanan', icon: Siren },
    { mode: ViewMode.SYSTEM, label: 'Kernel System', icon: Cpu },
  ];

  const visibleMenuItems = allMenuItems.filter(item => {
      const decision = SecurityService.evaluateAccess(activeUser, item.mode);
      if (!decision.allowed && decision.reason?.startsWith('RBAC_DENIED')) return false;
      return true;
  });

  const effectiveWidth = isTvMode ? 'w-[80px]' : (isCollapsed && !isHovered) ? 'w-[90px]' : 'w-[280px]';

  return (
    <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col text-white fixed left-4 top-4 bottom-4 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] 
        ${isTvMode ? 'bg-transparent border-none shadow-none pointer-events-none z-[210]' : 'glass-panel z-[200]'}
        ${effectiveWidth} 
        rounded-[2rem] overflow-hidden`}
    >
      {/* Sidebar Header */}
      <div className={`flex items-center h-28 transition-all duration-500 ${isCollapsed || isTvMode ? 'justify-center' : 'pl-8'}`}>
        <div 
            className={`relative shrink-0 group cursor-pointer z-10 ${isTvMode ? 'pointer-events-auto' : ''}`}
            onClick={() => isTvMode && onToggleTvMode && onToggleTvMode(false)}
            title={isTvMode ? "Keluar Mode MetalTV" : "Dasbor MetalOS"}
        >
             <div className={`absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full group-hover:opacity-50 transition duration-500 animate-pulse ${isTvMode ? 'opacity-0' : ''}`}></div>
             <div className={`relative p-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${isTvMode ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                <Activity className="text-cyan-400 w-6 h-6 animate-pulse" />
             </div>
        </div>
        
        <div className={`ml-4 overflow-hidden whitespace-nowrap transition-all duration-500 ${(isCollapsed && !isHovered) || isTvMode ? 'w-0 opacity-0 translate-x-10 hidden' : 'w-40 opacity-100 translate-x-0 block'}`}>
            <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tight text-white font-sans drop-shadow-sm leading-none">
                    Warga<span className="text-cyan-400">.</span>
                </h1>
                <p className="text-[10px] font-bold text-cyan-400 tracking-[0.25em] uppercase mt-1 leading-none opacity-80">
                    YOSOMULYO
                </p>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2.5 opacity-50">
                <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                <p className="text-[8px] text-slate-300 tracking-wider font-mono">METALOS 1.0</p>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-1 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar transition-opacity duration-500 ${isTvMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {visibleMenuItems.map((item) => {
            const isActive = currentView === item.mode;
            const access = SecurityService.evaluateAccess(activeUser, item.mode);
            
            return (
              <button
                key={item.mode}
                onClick={() => onViewChange(item.mode)}
                className={`relative w-full flex items-center py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isCollapsed && !isHovered ? 'justify-center' : 'px-4'} ${!access.allowed ? 'opacity-50 grayscale' : ''}`}
                title={!access.allowed ? access.reason : item.label}
              >
                {/* Active Background Pill */}
                {isActive && (
                     <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]"></div>
                )}
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                {/* Icon */}
                <div className={`relative z-10 shrink-0 transition-all duration-300 ${isActive ? 'text-cyan-300 scale-110' : 'text-slate-400 group-hover:text-white'}`}>
                    <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                {/* Label */}
                <span className={`relative z-10 font-medium text-sm tracking-wide whitespace-nowrap ml-4 transition-all duration-300 ${
                    (isCollapsed && !isHovered) ? 'hidden' : 'block'
                } ${isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.label}
                </span>

                {/* Active Dot */}
                {isActive && !(isCollapsed && !isHovered) && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
                )}
              </button>
            );
        })}
      </nav>

      {/* Footer Actions */}
      <div className={`p-4 space-y-4 mx-auto w-full transition-opacity duration-500 ${isTvMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* System Health Mini-Widget */}
        {(!isCollapsed || isHovered) && (
            <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>System Load</span>
                    <span className="text-cyan-400">24%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[24%] shadow-[0_0_5px_rgba(6,182,212,0.5)]"></div>
                </div>
            </div>
        )}

        <div className="space-y-1">
            {SecurityService.hasPermission(activeUser, 'SYSTEM_SETTINGS') && (
                <button
                    onClick={() => onViewChange(ViewMode.SETTINGS)}
                    className={`w-full flex items-center justify-center py-3 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/5 ${isCollapsed && !isHovered ? '' : 'gap-3'}`}
                >
                    <Settings className={`w-5 h-5 ${currentView === ViewMode.SETTINGS ? 'text-cyan-400 animate-spin-slow' : ''}`} />
                    {(!isCollapsed || isHovered) && <span className="text-xs font-bold tracking-widest uppercase">Settings</span>}
                </button>
            )}
            
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-center py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-cyan-400 transition-all`}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
