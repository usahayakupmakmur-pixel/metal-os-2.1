
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Router, Cpu, Siren, Car, 
  Shield, Activity, Settings, 
  LayoutGrid, Tv, Zap, Radio,
  ChevronRight, ArrowRight, Info,
  Home, Briefcase, Building2, Globe
} from 'lucide-react';
import { CitizenProfile } from '../types';
import GapuraView from './GapuraView';
import IoTView from './IoTView';
import PosKamlingView from './PosKamlingView';
import ParkingView from './ParkingView';
import MarketView from './MarketView';

interface SmartHubViewProps {
  user?: CitizenProfile;
  isTvMode: boolean;
  onToggleTvMode: (active: boolean) => void;
  onOpenScanner?: () => void;
  pendingCheckInLocation?: string | null;
}

type HubTab = 'GATEWAY' | 'IOT' | 'SECURITY' | 'MOBILITY' | 'MARKET';

const SmartHubView: React.FC<SmartHubViewProps> = ({ 
  user, 
  isTvMode, 
  onToggleTvMode, 
  onOpenScanner,
  pendingCheckInLocation
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('GATEWAY');
  const [scalabilityLevel, setScalabilityLevel] = useState<'HOME' | 'BUSINESS' | 'VILLAGE' | 'CITY'>('VILLAGE');

  const tabs = [
    { id: 'GATEWAY', label: 'Gateway & TV', icon: Router, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'IOT', label: 'IoT & Sensors', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'SECURITY', label: 'Security & Patrol', icon: Siren, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'MOBILITY', label: 'Mobility & Parking', icon: Car, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'MARKET', label: 'Pasar Payungi', icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const levels = [
    { id: 'HOME', label: 'Smart Home', icon: Home },
    { id: 'BUSINESS', label: 'Smart Business', icon: Briefcase },
    { id: 'VILLAGE', label: 'Smart Village', icon: Building2 },
    { id: 'CITY', label: 'Smart City', icon: Globe },
  ];

  if (isTvMode) {
    return <GapuraView user={user} isTvMode={isTvMode} onToggleTvMode={onToggleTvMode} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Smart Hub Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between py-6 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200">
                <LayoutGrid className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smart Hub</h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MetalOS Unified Infrastructure</span>
                  <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    <Zap size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase">99.9% Efficiency</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Scalability Selector */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {levels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setScalabilityLevel(level.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      scalabilityLevel === level.id 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <level.icon size={12} />
                    <span className="hidden sm:inline">{level.label}</span>
                  </button>
                ))}
              </div>

              <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

              {/* Module Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as HubTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon size={14} className={activeTab === tab.id ? tab.color : ''} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'GATEWAY' && (
            <motion.div
              key="gateway"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GapuraView user={user} isTvMode={isTvMode} onToggleTvMode={onToggleTvMode} />
            </motion.div>
          )}

          {activeTab === 'IOT' && (
            <motion.div
              key="iot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <IoTView />
            </motion.div>
          )}

          {activeTab === 'SECURITY' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PosKamlingView user={user} onOpenScanner={onOpenScanner} pendingCheckInLocation={pendingCheckInLocation} />
            </motion.div>
          )}

          {activeTab === 'MOBILITY' && (
            <motion.div
              key="mobility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ParkingView user={user} />
            </motion.div>
          )}

          {activeTab === 'MARKET' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MarketView user={user} onOpenScanner={onOpenScanner} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartHubView;
