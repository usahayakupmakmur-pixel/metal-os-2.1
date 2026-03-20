
import React, { useState } from 'react';
import { GraduationCap, BookOpen, Briefcase, Calendar, Play, Star, Users, Download, Search, Clock, MapPin, Award, X, User, CheckCircle, ChevronRight } from 'lucide-react';
import { COURSES, SCHOOL_EVENTS, LIBRARY_CONTENT, MOCK_USER } from '../constants';
import { CitizenProfile, SchoolEvent } from '../types';

interface EducationViewProps {
  user?: CitizenProfile;
}

const EducationView: React.FC<EducationViewProps> = ({ user = MOCK_USER }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'LIBRARY' | 'COURSES' | 'EVENTS'>('DASHBOARD');
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);

  const handleAddToCalendar = () => {
      setIsAddedToCalendar(true);
      // Simulate API call or external action
      setTimeout(() => setIsAddedToCalendar(false), 3000);
  };

  const closeEventModal = () => {
      setSelectedEvent(null);
      setIsAddedToCalendar(false);
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap size={32} /> Pendidikan & Literasi
        </h2>
        <p className="text-violet-100 max-w-2xl">
          Pusat pembelajaran digital warga. Akses pustaka tanpa kuota, pelatihan vokasi pasar keahlian, dan informasi sekolah.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto overflow-x-auto no-scrollbar">
        {['DASHBOARD', 'LIBRARY', 'COURSES', 'EVENTS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition whitespace-nowrap flex-1 md:flex-none ${
              activeTab === tab 
              ? 'bg-violet-600 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {tab === 'DASHBOARD' ? 'Ringkasan' : tab === 'LIBRARY' ? 'Pustaka Digital' : tab === 'COURSES' ? 'Pasar Keahlian' : 'Agenda Sekolah'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] p-6 relative">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-center gap-4">
                     <div className="p-3 bg-blue-500 text-white rounded-full">
                         <BookOpen size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-bold uppercase">Total Koleksi</p>
                         <p className="text-2xl font-black text-slate-800">1,240</p>
                     </div>
                 </div>
                 <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 flex items-center gap-4">
                     <div className="p-3 bg-orange-500 text-white rounded-full">
                         <Briefcase size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-bold uppercase">Kursus Aktif</p>
                         <p className="text-2xl font-black text-slate-800">12</p>
                     </div>
                 </div>
                 <div className="bg-green-50 p-5 rounded-xl border border-green-100 flex items-center gap-4">
                     <div className="p-3 bg-green-500 text-white rounded-full">
                         <Users size={24} />
                     </div>
                     <div>
                         <p className="text-sm text-slate-500 font-bold uppercase">Pelajar Terdaftar</p>
                         <p className="text-2xl font-black text-slate-800">345</p>
                     </div>
                 </div>
             </div>

             <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                 <div className="relative z-10">
                     <h3 className="text-xl font-bold mb-2">Program Zero-Quota</h3>
                     <p className="text-slate-300 text-sm max-w-lg mb-4">
                         Akses ribuan materi pendidikan dan buku sekolah elektronik (BSE) melalui jaringan lokal Gapura tanpa mengurangi kuota internet pribadi.
                     </p>
                     <button onClick={() => setActiveTab('LIBRARY')} className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition">
                         Jelajahi Pustaka
                     </button>
                 </div>
                 <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                     <BookOpen size={200} />
                 </div>
             </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'LIBRARY' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Koleksi Digital</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Cari buku atau video..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none w-64"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LIBRARY_CONTENT.map((item) => (
                        <div key={item.id} className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'VIDEO' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {item.type === 'VIDEO' ? <Play size={24} /> : <BookOpen size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 group-hover:text-violet-600 transition">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mb-2">{item.author}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{item.category}</span>
                                        <span>{item.size}</span>
                                    </div>
                                </div>
                                <button className="text-slate-300 hover:text-violet-600 transition">
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* COURSES TAB (SKILL MARKET) */}
        {activeTab === 'COURSES' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Pasar Keahlian Warga</h3>
                    <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-700 shadow-lg shadow-violet-600/20">
                        Daftar Jadi Pengajar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COURSES.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition group">
                            <div className={`h-32 ${course.imageColor} relative`}>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700">
                                    {course.level}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-violet-600 mb-2 uppercase tracking-wider">
                                    <Award size={12} /> {course.category}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">Oleh: {course.instructor}</p>
                                
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-slate-100 pt-4">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {course.students} Siswa</span>
                                    <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor" /> {course.rating}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-lg text-slate-800">
                                        {course.price === 0 ? 'GRATIS' : `Rp ${course.price.toLocaleString()}`}
                                    </span>
                                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition">
                                        Ikuti Kelas
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'EVENTS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800">Agenda Sekolah & Kegiatan</h3>
                <div className="space-y-4">
                    {SCHOOL_EVENTS.map((event) => (
                        <div key={event.id} className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-200 transition group">
                            <div className="bg-slate-50 p-6 flex flex-col items-center justify-center min-w-[120px] border-b md:border-b-0 md:border-r border-slate-200 group-hover:bg-violet-50 transition">
                                <span className="text-sm font-bold text-slate-500 uppercase group-hover:text-violet-600">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-3xl font-black text-slate-800 group-hover:text-violet-700">{new Date(event.date).getDate()}</span>
                                <span className="text-xs text-slate-400">{new Date(event.date).getFullYear()}</span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        event.type === 'ACADEMIC' ? 'bg-blue-100 text-blue-700' :
                                        event.type === 'SPORTS' ? 'bg-green-100 text-green-700' :
                                        'bg-purple-100 text-purple-700'
                                    }`}>
                                        {event.type}
                                    </span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h4>
                                <div className="flex items-center text-sm text-slate-500 gap-4">
                                    <span className="flex items-center gap-1"><Clock size={14} /> 08:00 WIB</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                                </div>
                            </div>
                            <div className="p-6 flex items-center justify-center bg-slate-50 md:bg-transparent">
                                <button 
                                    onClick={() => setSelectedEvent(event)}
                                    className="w-full md:w-auto border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition hover:text-slate-900"
                                >
                                    Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* EVENT DETAIL MODAL */}
        {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Modal Header */}
                    <div className="bg-slate-900 text-white p-6 relative">
                        <button 
                            onClick={closeEventModal}
                            className="absolute top-4 right-4 p-1 bg-white/10 hover:bg-white/20 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                        <div className="mb-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                selectedEvent.type === 'ACADEMIC' ? 'bg-blue-500' :
                                selectedEvent.type === 'SPORTS' ? 'bg-green-500' :
                                'bg-purple-500'
                            }`}>
                                {selectedEvent.type}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight">{selectedEvent.title}</h3>
                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-300">
                            <div className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(selectedEvent.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1.5"><MapPin size={14} /> {selectedEvent.location}</div>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                        {selectedEvent.description && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</h4>
                                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    {selectedEvent.description}
                                </p>
                            </div>
                        )}

                        {selectedEvent.speaker && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pembicara / Tamu</h4>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="bg-violet-100 p-2 rounded-full text-violet-600">
                                        <User size={20} />
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm">{selectedEvent.speaker}</span>
                                </div>
                            </div>
                        )}

                        {selectedEvent.schedule && selectedEvent.schedule.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Susunan Acara</h4>
                                <div className="space-y-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    {selectedEvent.schedule.map((item, idx) => (
                                        <div key={idx} className="flex p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                                            <div className="w-16 text-xs font-mono font-bold text-slate-500 pt-0.5">{item.time}</div>
                                            <div className="flex-1 text-sm text-slate-800 font-medium">{item.activity}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <button 
                            onClick={handleAddToCalendar}
                            disabled={isAddedToCalendar}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                                isAddedToCalendar 
                                ? 'bg-green-600 text-white' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                            }`}
                        >
                            {isAddedToCalendar ? (
                                <>
                                    <CheckCircle size={18} /> Tersimpan di Kalender
                                </>
                            ) : (
                                <>
                                    <Calendar size={18} /> Tambahkan ke Kalender
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default EducationView;
