
import React, { useState } from 'react';
import { Activity, Heart, Calendar, Clock, User, Video, MessageSquare, Phone, MapPin, FileText, Plus, Star, AlertCircle, Stethoscope, Thermometer, Pill, ChevronRight, X, QrCode, Download, CheckCircle } from 'lucide-react';
import { HEALTH_QUEUES, DOCTORS, POSYANDU_SESSIONS, MOCK_USER } from '../constants';
import { CitizenProfile, HealthQueue, Doctor, PosyanduSchedule } from '../types';

interface HealthViewProps {
  user?: CitizenProfile;
}

const HealthView: React.FC<HealthViewProps> = ({ user = MOCK_USER }) => {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'TELEMED' | 'POSYANDU'>('QUEUE');
  
  // Queue State
  const [activeTicket, setActiveTicket] = useState<HealthQueue | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleTakeTicket = (queue: HealthQueue) => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
        const newTicket = {
            ...queue,
            yourNumber: queue.currentNumber + Math.floor(Math.random() * 5) + 1, // Simulate queue position
            estimatedWaitTime: queue.estimatedWaitTime + 10 // Adjust wait time based on position
        };
        setActiveTicket(newTicket);
        setShowTicketModal(true);
        setIsBooking(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="fill-current text-red-400" /> Layanan Kesehatan
        </h2>
        <p className="text-teal-100">Akses layanan Puskesmas, Posyandu, dan konsultasi dokter secara digital.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'QUEUE' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Antrean Puskesmas
        </button>
        <button
          onClick={() => setActiveTab('TELEMED')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'TELEMED' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Telemedisin
        </button>
        <button
          onClick={() => setActiveTab('POSYANDU')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'POSYANDU' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Jadwal Posyandu
        </button>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
        {/* Tab: Queue */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Clock size={20} className="text-teal-600" /> Antrean Saat Ini
                </h3>
                {activeTicket && (
                    <button 
                        onClick={() => setShowTicketModal(true)}
                        className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200 animate-pulse"
                    >
                        Tiket Aktif: {activeTicket.serviceName}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HEALTH_QUEUES.map((queue) => (
                <div key={queue.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition group bg-slate-50 relative overflow-hidden">
                  {activeTicket?.id === queue.id && (
                      <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                          TERDAFTAR
                      </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">{queue.serviceName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${queue.status === 'OPEN' ? 'bg-green-100 text-green-700' : queue.status === 'BREAK' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {queue.status === 'BREAK' ? 'ISTIRAHAT' : queue.status === 'OPEN' ? 'BUKA' : 'TUTUP'}
                    </span>
                  </div>
                  <div className="text-center py-4 bg-white rounded-xl border border-slate-100 mb-4 shadow-inner">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nomor Dipanggil</p>
                    <p className="text-4xl font-black text-teal-600">{queue.currentNumber}</p>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 mb-4">
                    <span>Est. Waktu</span>
                    <span className="font-bold text-slate-800">{queue.estimatedWaitTime} mnt</span>
                  </div>
                  
                  {activeTicket?.id === queue.id ? (
                      <button 
                        onClick={() => setShowTicketModal(true)}
                        className="w-full bg-white border-2 border-teal-600 text-teal-600 py-2 rounded-lg font-bold text-sm hover:bg-teal-50 transition"
                      >
                        Lihat Tiket Saya
                      </button>
                  ) : (
                      <button 
                        onClick={() => handleTakeTicket(queue)}
                        disabled={queue.status !== 'OPEN' || isBooking}
                        className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBooking ? 'Memproses...' : 'Ambil Antrean'}
                      </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Telemed */}
        {activeTab === 'TELEMED' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Video size={20} className="text-teal-600" /> Konsultasi Online
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {DOCTORS.map((doc) => (
                <div key={doc.id} className="flex items-center p-4 border border-slate-200 rounded-xl hover:border-teal-200 transition bg-white">
                  <div className="relative">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.avatarSeed}`} alt={doc.name} className="w-16 h-16 rounded-full bg-slate-100" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${doc.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="flex-1 ml-4">
                    <h4 className="font-bold text-slate-800">{doc.name}</h4>
                    <p className="text-sm text-slate-500">{doc.specialty}</p>
                    <div className="flex items-center text-yellow-500 text-xs mt-1">
                      <Star size={12} fill="currentColor" />
                      <span className="ml-1 font-bold text-slate-600">{doc.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition">
                      <MessageSquare size={20} />
                    </button>
                    <button className="p-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-md">
                      <Video size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Posyandu */}
        {activeTab === 'POSYANDU' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Calendar size={20} className="text-teal-600" /> Jadwal Kegiatan
            </h3>
            <div className="space-y-4">
              {POSYANDU_SESSIONS.map((session) => (
                <div key={session.id} className="flex items-start p-4 bg-slate-50 rounded-xl border-l-4 border-teal-500">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center min-w-[80px]">
                    <span className="block text-xs text-slate-500 font-bold uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="block text-2xl font-black text-slate-800">{new Date(session.date).getDate()}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-bold text-slate-800 text-lg">{session.activity}</h4>
                    <div className="flex items-center text-sm text-slate-500 mt-1 gap-4">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {session.location}</span>
                      <span className="flex items-center gap-1"><User size={14} /> Target: {session.target}</span>
                    </div>
                  </div>
                  <button className="text-teal-600 hover:text-teal-800">
                    <ChevronRight size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TICKET MODAL */}
      {showTicketModal && activeTicket && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl relative">
                  {/* Ticket Header */}
                  <div className="bg-teal-600 p-6 text-white text-center relative">
                      <button 
                          onClick={() => setShowTicketModal(false)}
                          className="absolute top-4 right-4 text-teal-100 hover:text-white transition"
                      >
                          <X size={20} />
                      </button>
                      <h3 className="font-bold text-lg">Tiket Antrean</h3>
                      <p className="text-teal-100 text-xs mt-1">Puskesmas Yosomulyo</p>
                  </div>
                  
                  {/* Ticket Body */}
                  <div className="p-6 text-center bg-slate-50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Anda</p>
                      <div className="text-6xl font-black text-slate-800 mb-2 tracking-tighter">
                          {activeTicket.yourNumber}
                      </div>
                      <p className="text-sm text-teal-600 font-bold mb-6">{activeTicket.serviceName}</p>
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                          <div className="flex justify-between items-center mb-2 text-sm">
                              <span className="text-slate-500">Sisa Antrean</span>
                              <span className="font-bold text-slate-800">{(activeTicket.yourNumber || 0) - activeTicket.currentNumber} Orang</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Est. Waktu</span>
                              <span className="font-bold text-slate-800">{activeTicket.estimatedWaitTime} Menit</span>
                          </div>
                      </div>

                      <div className="flex justify-center mb-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                              <QrCode size={96} className="text-slate-800" />
                          </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-6">Tunjukkan QR ini kepada petugas pendaftaran.</p>

                      <button 
                          onClick={() => setShowTicketModal(false)}
                          className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg"
                      >
                          <CheckCircle size={16} /> OK, Saya Mengerti
                      </button>
                  </div>

                  {/* Decorative perforations */}
                  <div className="absolute top-[110px] -left-3 w-6 h-6 bg-black/60 rounded-full"></div>
                  <div className="absolute top-[110px] -right-3 w-6 h-6 bg-black/60 rounded-full"></div>
                  <div className="absolute top-[122px] left-4 right-4 border-b-2 border-dashed border-slate-300/50"></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HealthView;
