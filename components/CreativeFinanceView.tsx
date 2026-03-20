
import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Briefcase, 
  Building2, 
  Zap, 
  Droplets, 
  Trash2, 
  GraduationCap, 
  Stethoscope, 
  ArrowRight,
  ShieldCheck,
  PieChart,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  CITY_METRICS, 
  CREATIVE_FINANCING_PROJECTS, 
  OPD_ROLES, 
  INFRASTRUCTURE_STATS 
} from '../constants';
import { CityMetric, CreativeFinancingProject, OpdRole } from '../types';
import { motion } from 'motion/react';

const CreativeFinanceView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'INFRASTRUCTURE' | 'HUMAN_DEV' | 'ECONOMY'>('ALL');

  const filteredProjects = selectedCategory === 'ALL' 
    ? CREATIVE_FINANCING_PROJECTS 
    : CREATIVE_FINANCING_PROJECTS.filter(p => p.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 space-y-8 pb-24"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Creative Financing</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Master Plan Pembiayaan Kreatif Kota Metro: Mengubah ide menjadi transaksi yang layak dibiayai 
            melalui sinergi pendanaan dan tata kelola cerdas.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">RKPD 2026 Verified</span>
        </div>
      </div>

      {/* City Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CITY_METRICS.map((metric) => (
          <div key={metric.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{metric.category}</span>
              {metric.trend === 'UP' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : metric.trend === 'DOWN' ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <Activity className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-400 text-xs font-medium">{metric.label}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </span>
                <span className="text-xs text-slate-500 font-medium">{metric.unit}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">DATA REF: {metric.year}</span>
              <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-slate-500/20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Projects Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Target className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Priority Financing Packages</h2>
            </div>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['ALL', 'INFRASTRUCTURE', 'HUMAN_DEV', 'ECONOMY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  {project.category === 'INFRASTRUCTURE' && <Building2 className="w-24 h-24" />}
                  {project.category === 'HUMAN_DEV' && <GraduationCap className="w-24 h-24" />}
                  {project.category === 'ECONOMY' && <Briefcase className="w-24 h-24" />}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        project.status === 'EXECUTION' ? 'bg-emerald-500' : 
                        project.status === 'PROCUREMENT' ? 'bg-blue-500' : 
                        'bg-amber-500'
                      }`} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{project.status}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Cost</div>
                    <div className="text-xl font-mono font-bold text-white">Rp {(project.estimatedCost / 1e9).toFixed(1)}B</div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-2xl">
                  {project.description}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Funding:</span>
                    <div className="flex gap-1">
                      {project.fundingSource.map(source => (
                        <span key={source} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-slate-300">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-4 w-px bg-white/10 hidden md:block" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority:</span>
                    <span className={`text-[10px] font-bold ${
                      project.priority === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                  <button className="ml-auto flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/btn">
                    View Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Section: OPD Roles & Stats */}
        <div className="space-y-8">
          {/* Infrastructure Stats */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <PieChart className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Service Footprint</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Education Units
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="text-lg font-bold text-white">{INFRASTRUCTURE_STATS.education.universities}</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase">Universities</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="text-lg font-bold text-white">{INFRASTRUCTURE_STATS.education.highSchools}</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase">High Schools</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="text-lg font-bold text-white">{INFRASTRUCTURE_STATS.education.elementarySchools}</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase">Elementary</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="text-lg font-bold text-white">{INFRASTRUCTURE_STATS.education.preschools}</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase">Preschools</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Stethoscope className="w-3 h-3" /> Health Units
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <div className="text-sm font-bold text-white">{INFRASTRUCTURE_STATS.health.govtHospitals}</div>
                    <div className="text-[8px] text-slate-500 font-medium uppercase">Govt Hosp</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <div className="text-sm font-bold text-white">{INFRASTRUCTURE_STATS.health.privateHospitals}</div>
                    <div className="text-[8px] text-slate-500 font-medium uppercase">Priv Hosp</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <div className="text-sm font-bold text-white">{INFRASTRUCTURE_STATS.health.puskesmas}</div>
                    <div className="text-[8px] text-slate-500 font-medium uppercase">Puskesmas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Architecture */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Governance Architecture</h2>
            </div>

            <div className="space-y-4">
              {OPD_ROLES.map((opd) => (
                <div key={opd.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-help group/opd">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-400">{opd.acronym}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{opd.role}</span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-300 mb-2">{opd.name}</h4>
                  <div className="flex flex-wrap gap-1 opacity-0 group-hover/opd:opacity-100 transition-opacity">
                    {opd.responsibility.slice(0, 2).map(res => (
                      <span key={res} className="text-[8px] text-slate-500 italic">#{res.replace(' ', '')}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Info className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold mb-2">Sinergi Pendanaan</h3>
            <p className="text-xs text-indigo-100 leading-relaxed mb-4">
              Mewajibkan daerah menyiapkan rencana sinergi pembiayaan yang menggabungkan APBD dan sumber non-APBD (Swasta, BUMN, Masyarakat).
            </p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
              Download Master Plan PDF
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreativeFinanceView;
