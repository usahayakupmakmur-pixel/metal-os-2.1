
import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  hoverScale?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  delay = 0,
  hoverScale = 1.02
}) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick} 
      className={`glass-panel rounded-[2.5rem] p-6 relative overflow-hidden group transition-all duration-500 hover:scale-[${hoverScale}] hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-white/30 border border-white/10 ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
        {children}
    </motion.div>
);

export default GlassCard;
