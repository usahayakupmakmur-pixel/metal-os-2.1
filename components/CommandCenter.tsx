
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X, ArrowRight, Zap, Shield, Cpu, LayoutDashboard, Building2, Wallet, ShoppingBag, Users, Router, Siren, Settings } from 'lucide-react';
import { ViewMode } from '../types';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'dash', label: 'Go to Dashboard', icon: LayoutDashboard, view: ViewMode.DASHBOARD, shortcut: 'D' },
    { id: 'gov', label: 'Governance Panel', icon: Building2, view: ViewMode.GOVERNANCE, shortcut: 'G' },
    { id: 'econ', label: 'Financial Overview', icon: Wallet, view: ViewMode.ECONOMY, shortcut: 'E' },
    { id: 'market', label: 'Pasar Payungi', icon: ShoppingBag, view: ViewMode.SMART_HUB, shortcut: 'M' },
    { id: 'social', label: 'Social Reports', icon: Users, view: ViewMode.SOCIAL, shortcut: 'S' },
    { id: 'sys', label: 'Kernel System', icon: Cpu, view: ViewMode.SYSTEM, shortcut: 'K' },
    { id: 'settings', label: 'System Settings', icon: Settings, view: ViewMode.SETTINGS, shortcut: ',' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-panel rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/20 animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        {/* Search Input */}
        <div className="flex items-center gap-4 px-8 py-6 border-b border-white/10">
          <Search className="text-cyan-400" size={24} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none text-xl text-white placeholder-slate-500 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-bold text-slate-500">
            <Command size={10} />
            <span>ESC</span>
          </div>
        </div>

        {/* Results */}
        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation</p>
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onNavigate(cmd.view);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-xl text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                      <cmd.icon size={20} />
                    </div>
                    <span className="text-slate-300 group-hover:text-white font-medium transition-all">{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-[10px] font-bold text-slate-500">GOTO</span>
                    <ArrowRight size={14} className="text-cyan-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <Zap size={40} className="mb-4 opacity-20" />
              <p>No commands found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
          <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-400" /> AI Powered</span>
            <span className="flex items-center gap-1"><Shield size={10} className="text-emerald-400" /> Secure Shell</span>
          </div>
          <p className="text-[10px] text-slate-600 italic">MetalOS Kernel v3.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
