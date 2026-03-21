
import React from 'react';
import { motion } from 'motion/react';
import { Home, Briefcase, Users, ShoppingBag, Settings, Map, Activity, User, Fingerprint, Building2, LayoutGrid } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isVisible?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, isVisible = true }) => {
  const navItems = [
    { mode: ViewMode.DASHBOARD, icon: Home, label: 'Home' },
    { mode: ViewMode.OFFICE_SUITE, icon: Briefcase, label: 'Suite' },
    { mode: ViewMode.SMART_HUB, icon: LayoutGrid, label: 'Hub' },
    { mode: ViewMode.PROFILE, icon: User, label: 'Profil' },
  ];

  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 120 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-[150] px-6 pb-8 pt-2 pointer-events-none"
    >
      <div className="glass-dock-ultra rounded-[2.5rem] flex items-center justify-around p-3 pointer-events-auto border border-white/10">
        {navItems.map((item) => {
          const isActive = currentView === item.mode;
          const Icon = item.icon;

          return (
            <button
              key={item.mode}
              onClick={() => onViewChange(item.mode)}
              className="relative flex flex-col items-center justify-center py-4 px-6 group haptic-press flex-1"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-1 bg-white/10 rounded-2xl border border-white/5"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon 
                  size={26} 
                  className={`relative z-10 transition-all duration-300 ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              
              <span className={`text-[10px] font-black mt-2 uppercase tracking-[0.1em] relative z-10 transition-all duration-300 ${
                isActive ? 'text-cyan-400 opacity-100' : 'text-slate-500 opacity-70'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNav;
