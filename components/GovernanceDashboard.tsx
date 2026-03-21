
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  CheckCircle2, 
  Package, 
  Activity, 
  Target, 
  Map as MapIcon,
  ChevronRight,
  LayoutGrid,
  Globe,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { CitizenProfile, ViewMode } from '../types';
import { MOCK_USER } from '../constants';

// Import sub-views
import GovernanceView from './GovernanceView';
import TasksView from '../src/TasksView';
import AssetsView from '../src/AssetsView';
import TrackerView from '../src/TrackerView';
import CreativeFinanceView from './CreativeFinanceView';
import GeospatialView from './GeospatialView';

interface GovernanceDashboardProps {
  user?: CitizenProfile;
  onOpenScanner?: () => void;
  pendingTaskId?: string | null;
  pendingAssetId?: string | null;
  initialSubView?: GovernanceSubView;
}

type GovernanceSubView = 'OVERVIEW' | 'TASKS' | 'ASSETS' | 'TRACKER' | 'FINANCE' | 'GEOSPATIAL';

const GovernanceDashboard: React.FC<GovernanceDashboardProps> = ({ 
  user = MOCK_USER, 
  onOpenScanner,
  pendingTaskId,
  pendingAssetId,
  initialSubView
}) => {
  const [activeSubView, setActiveSubView] = useState<GovernanceSubView>(
    initialSubView || (pendingTaskId ? 'TASKS' : pendingAssetId ? 'ASSETS' : 'OVERVIEW')
  );

  // Effect to sync subview if pending props change
  React.useEffect(() => {
    if (pendingTaskId) setActiveSubView('TASKS');
    else if (pendingAssetId) setActiveSubView('ASSETS');
    else if (initialSubView) setActiveSubView(initialSubView);
  }, [pendingTaskId, pendingAssetId, initialSubView]);

  const menuItems = [
    { id: 'OVERVIEW', label: 'Tata Kelola', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'TASKS', label: 'Team Tasks', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'TRACKER', label: 'Operational Tracker', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'ASSETS', label: 'Asset Management', icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'FINANCE', label: 'Pembiayaan Kreatif', icon: Target, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 'GEOSPATIAL', label: 'Geospatial Platform', icon: MapIcon, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  const renderSubView = () => {
    switch (activeSubView) {
      case 'OVERVIEW': return <GovernanceView user={user} />;
      case 'TASKS': return <TasksView user={user} onOpenScanner={onOpenScanner} pendingTaskId={pendingTaskId} />;
      case 'TRACKER': return <TrackerView user={user} onOpenScanner={onOpenScanner} />;
      case 'ASSETS': return <AssetsView user={user} onOpenScanner={onOpenScanner} pendingAssetId={pendingAssetId} />;
      case 'FINANCE': return <CreativeFinanceView />;
      case 'GEOSPATIAL': return <GeospatialView user={user} />;
      default: return <GovernanceView user={user} />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)] bg-slate-950/50 rounded-[2.5rem] border border-white/10 overflow-hidden">
      {/* Sub-navigation Header */}
      <div className="p-4 md:p-6 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Governance Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unified Platform v2.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubView(item.id as GovernanceSubView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubView === item.id 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeSubView === item.id ? item.color : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto custom-scrollbar"
          >
            {renderSubView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-6 py-3 border-t border-white/5 bg-slate-900/60 backdrop-blur-md flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-widest">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database size={12} className="text-blue-400" />
            <span>SYNC: REALTIME</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-cyan-400" />
            <span>REGION: METRO_LAMPUNG</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-yellow-400" />
          <span>ENGINE: GEOSPATIAL_METAL_V1</span>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
