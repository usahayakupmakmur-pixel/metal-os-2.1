
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, BookOpen, Video, Calendar, Clock, MapPin, User, Search, Filter, Plus, ArrowRight, CheckCircle, Award, Star, Download, Play, MessageSquare, Briefcase, Globe, Sparkles, Shield, Zap, GraduationCap, Library, TrendingUp } from 'lucide-react';
import { MOCK_USER } from '../constants';
import { CitizenProfile, Course, SchoolEvent, LibraryContent } from '../types';
import GlassCard from '../src/components/GlassCard';
import { subscribeToCourses } from '../src/services/courseService';
import { subscribeToEvents } from '../src/services/eventService';
import { subscribeToLibraryContent } from '../src/services/libraryService';

interface EducationViewProps {
  user?: CitizenProfile;
}

const EducationView: React.FC<EducationViewProps> = ({ user = MOCK_USER }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'courses' | 'events'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [libraryContent, setLibraryContent] = useState<LibraryContent[]>([]);

  useEffect(() => {
    const unsubCourses = subscribeToCourses(setCourses, console.error);
    const unsubEvents = subscribeToEvents(setEvents, console.error);
    const unsubLibrary = subscribeToLibraryContent(setLibraryContent, console.error);
    return () => {
      unsubCourses();
      unsubEvents();
      unsubLibrary();
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section: Education Dashboard */}
      <GlassCard className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Shield size={20} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Education & Learning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Literasi</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
              Tingkatkan skill Anda dengan kursus online, akses ribuan buku digital, dan ikuti event edukasi menarik di desa kita.
            </p>
          </div>
          <div className="flex gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="text-center px-4 border-r border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Kursus Selesai</p>
                <div className="flex items-center gap-2 justify-center">
                    <Award size={16} className="text-amber-500" />
                    <span className="text-xl font-black text-white">12</span>
                </div>
            </div>
            <div className="text-center px-4">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Poin Literasi</p>
                <div className="flex items-center gap-2 justify-center">
                    <Sparkles size={16} className="text-cyan-500" />
                    <span className="text-xl font-black text-white">850</span>
                </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Navigation Tabs - Ultra Tech Style */}
      <div className="flex overflow-x-auto pb-2 md:pb-0 md:overflow-visible md:justify-start gap-2 w-full md:w-fit mx-auto md:mx-0 scrollbar-hide">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
          { id: 'library', label: 'Perpustakaan', icon: Library },
          { id: 'courses', label: 'Kursus Online', icon: Play },
          { id: 'events', label: 'Event Edukasi', icon: Calendar }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Continue Learning */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-white tracking-tight">Lanjutkan Belajar</h3>
                    <GlassCard className="bg-gradient-to-r from-blue-600/20 to-transparent border-blue-500/30">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative group">
                                <img src={courses[0]?.imageColor || 'https://picsum.photos/seed/py/400/225'} alt={courses[0]?.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={32} className="text-white fill-white" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Kursus Sedang Berjalan</p>
                                <h4 className="text-xl font-black text-white">{courses[0]?.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                                    <span className="flex items-center gap-1"><User size={14} /> {courses[0]?.instructor}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {courses[0]?.duration}</span>
                                </div>
                                <div className="pt-4">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
                                        <span>Progress: 65%</span>
                                        <span>12/18 Materi</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-white text-blue-600 p-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-colors">
                                <Play size={24} className="fill-blue-600" />
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* Recommended Courses */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-white tracking-tight">Kursus Populer</h3>
                        <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Lihat Semua</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.slice(1).map((course, i) => (
                            <GlassCard key={course.id} className="group cursor-pointer hover:border-blue-500/30 transition-all p-0 overflow-hidden">
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={course.imageColor || 'https://picsum.photos/seed/py/400/225'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{course.price === 0 ? 'Gratis' : `Rp ${course.price}`}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-black text-white text-lg group-hover:text-blue-400 transition-colors line-clamp-1">{course.title}</h4>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{course.instructor}</p>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                            <span className="text-xs font-black text-white">{course.rating}</span>
                                            <span className="text-[10px] text-slate-500 font-bold ml-1">({course.students})</span>
                                        </div>
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                            Daftar <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari judul buku, pengarang, atau kategori..." 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-400 hover:text-white flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all">
                        <Filter size={18} /> Filter
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {libraryContent.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative mb-3 shadow-xl group-hover:shadow-blue-500/20 transition-all">
                                <img src={`https://picsum.photos/seed/${item.id}/300/400`} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <button className="w-full bg-blue-500 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Baca Sekarang</button>
                                </div>
                            </div>
                            <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{item.author}</p>
                        </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Stats & Events */}
        <div className="space-y-8">
          {/* Learning Progress */}
          <GlassCard>
            <h3 className="text-lg font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={20} />
              Statistik Belajar
            </h3>
            <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Target Mingguan</span>
                        <span className="text-xs font-black text-white">85%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pencapaian Terbaru</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                            <Award size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Top 10% Literasi Desa</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Maret 2024</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <CheckCircle size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Sertifikat Python Dasar</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">15 Feb 2024</p>
                        </div>
                    </div>
                </div>
            </div>
            <button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10">
              Lihat Semua Sertifikat
            </button>
          </GlassCard>

          {/* Upcoming Events */}
          <GlassCard className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <h3 className="text-lg font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <Calendar className="text-purple-400" size={20} />
              Event Edukasi
            </h3>
            <div className="space-y-4">
                {events.map((event, i) => (
                    <div key={event.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                event.type === 'ACADEMIC' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                            }`}>
                                {event.type}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">{event.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{event.title}</h4>
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock size={12} /> {event.schedule && event.schedule.length > 0 ? event.schedule[0].time : 'N/A'}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20">
              Lihat Kalender Event
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default EducationView;
