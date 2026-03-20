
import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Briefcase, Users, ShoppingBag, Settings, Map, Activity } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { mode: ViewMode.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
    { mode: ViewMode.EOFFICE, icon: Briefcase, label: 'Work' },
    { mode: ViewMode.GEOSPATIAL, icon: Map, label: 'Map' },
    { mode: ViewMode.SOCIAL, icon: Users, label: 'Social' },
    { mode: ViewMode.TRACKER, icon: Activity, label: 'Ops' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[150] px-4 pb-6 pt-2">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = currentView === item.mode;
          const Icon = item.icon;

          return (
            <button
              key={item.mode}
              onClick={() => onViewChange(item.mode)}
              className="relative flex flex-col items-center justify-center py-2 px-4 group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/5 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon 
                size={20} 
                className={`relative z-10 transition-all duration-300 ${
                  isActive ? 'text-cyan-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'
                }`} 
              />
              <span className={`text-[8px] font-bold mt-1 uppercase tracking-widest relative z-10 transition-all duration-300 ${
                isActive ? 'text-cyan-400 opacity-100' : 'text-slate-500 opacity-0'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
