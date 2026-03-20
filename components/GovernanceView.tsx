

import React from 'react';
import { BUDGET_DATA, EOFFICE_SUMMARY } from '../constants';
import { FileText, ThumbsUp, MessageSquare, AlertCircle, Mail, FileSignature, CheckSquare, ArrowRight } from 'lucide-react';

const GovernanceView: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg">
         <h2 className="text-2xl font-bold mb-2">Glass House Governance</h2>
         <p className="text-blue-200">
           Transparansi total APBDes dan tata kelola pemerintahan. Data ini terhubung langsung ke MetalOS Core.
         </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Left Column: Budget */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-slate-800">Realisasi Anggaran (Live)</h3>
             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Q4 2023</span>
           </div>
           
           <div className="space-y-5">
             {BUDGET_DATA.map((item) => {
               const percentage = Math.round((item.realized / item.allocated) * 100);
               return (
                 <div key={item.id}>
                   <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium text-slate-700">{item.category}</span>
                     <span className={`font-bold ${
                       item.status === 'Warning' ? 'text-orange-500' : 'text-slate-600'
                     }`}>{percentage}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                     <div 
                        className={`h-2 rounded-full ${
                          item.status === 'Warning' ? 'bg-orange-500' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${percentage}%` }}
                     ></div>
                   </div>
                   <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Terpakai: Rp {(item.realized / 1000000).toFixed(0)} Jt</span>
                      <span>Pagu: Rp {(item.allocated / 1000000).toFixed(0)} Jt</span>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>

         {/* Right Column: Administration & Reports */}
         <div className="space-y-6">
            
            {/* NEW: E-Office Administration Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Administrasi Digital
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-blue-600 font-bold uppercase">Surat Masuk</span>
                            <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">Bulan Ini</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{EOFFICE_SUMMARY.thisMonth}</div>
                        <div className="text-xs text-slate-500">Total: {EOFFICE_SUMMARY.totalIncoming}</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-indigo-600 font-bold uppercase">Tanda Tangan</span>
                            {EOFFICE_SUMMARY.waitingSignature > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{EOFFICE_SUMMARY.waitingSignature}</div>
                        <div className="text-xs text-slate-500">Menunggu TTD</div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded-lg transition cursor-pointer group">
                        <div className="flex items-center text-slate-600">
                            <FileSignature size={16} className="mr-3 text-slate-400" />
                            <span>Butuh Disposisi</span>
                        </div>
                        <div className="flex items-center">
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold mr-2">{EOFFICE_SUMMARY.pendingDisposition}</span>
                            <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded-lg transition cursor-pointer group">
                        <div className="flex items-center text-slate-600">
                            <AlertCircle size={16} className="mr-3 text-slate-400" />
                            <span>Surat Mendesak (Urgent)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold mr-2">{EOFFICE_SUMMARY.urgent}</span>
                            <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Musrenbang Digital */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                 <ThumbsUp className="w-5 h-5 mr-2 text-purple-600" />
                 Musrenbang Digital
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Voting usulan pembangunan prioritas warga bulan ini.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                   <div className="flex justify-between">
                     <span className="font-medium text-slate-800">Perbaikan Lampu Jalan RW 05</span>
                     <span className="text-green-600 text-sm font-bold">145 Votes</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                     <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                   </div>
                </div>
                
                <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                   <div className="flex justify-between">
                     <span className="font-medium text-slate-800">Pelatihan Digital Marketing UMKM</span>
                     <span className="text-slate-500 text-sm font-bold">82 Votes</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                     <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Laporan Warga */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                 <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                 Laporan Terkini
              </h3>
              <div className="space-y-3">
                 <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="bg-white p-1 rounded shadow-sm">
                      <MessageSquare size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Jalan Berlubang di Jl. Ahmad Yani</p>
                      <p className="text-xs text-slate-500">Dilaporkan 2 jam lalu oleh @budi_s</p>
                      <span className="inline-block mt-1 text-[10px] bg-white px-2 py-0.5 rounded text-slate-500 border border-slate-200">
                        Menunggu Verifikasi
                      </span>
                    </div>
                 </div>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
};

export default GovernanceView;