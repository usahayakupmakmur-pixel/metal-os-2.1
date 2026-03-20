
import React, { useState } from 'react';
import { CreditCard, ShoppingBag, Truck, QrCode, ArrowUpRight, ArrowDownLeft, MapPin, Bike, Package, DollarSign, User, Star, X, CheckCircle, Building, Smartphone, PieChart, TrendingUp, Briefcase, Globe, Printer, Calendar, Clock, AlignLeft } from 'lucide-react';
import { MOCK_USER, RECENT_TRANSACTIONS } from '../constants';
import { CitizenProfile, Transaction } from '../types';

interface EconomyViewProps {
  user?: CitizenProfile;
  onOpenAnjelo: (service?: any, note?: string) => void;
  onOpenAiAssistant?: () => void;
  onOpenScanner?: () => void;
}

const EconomyView: React.FC<EconomyViewProps> = ({ user = MOCK_USER, onOpenAnjelo, onOpenAiAssistant, onOpenScanner }) => {
  // Transaction Detail State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const services = [
    { id: 'PACKAGE', label: 'Antar Paket', icon: Package, desc: 'Logistik Warga-Commerce' },
    { id: 'RIDE', label: 'Ojek Desa', icon: Bike, desc: 'Transportasi warga' },
    { id: 'CASH', label: 'Tarik Tunai', icon: DollarSign, desc: 'Agen Laku Pandai' },
    { id: 'TRASH', label: 'Jemput Sampah', icon: Truck, desc: 'Integrasi Warga-Enviro' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {/* Left Column: WargaPay Wallet & Mandiri Integration */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* WargaPay Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <QrCode className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold tracking-wider">WargaPay</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                Score: {user.wargaScore}
              </span>
            </div>
            <div className="mb-8">
              <p className="text-blue-200 text-sm">Saldo Aktif</p>
              <h2 className="text-3xl font-bold">Rp {user.balance.toLocaleString()}</h2>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Pemilik</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-blue-300">{user.role}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <button 
                  onClick={onOpenAiAssistant}
                  className="bg-cyan-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg hover:bg-cyan-300 transition"
                 >
                    <PieChart size={12} /> Tanya AI Ekonomi
                 </button>
                 <div className="flex space-x-2">
                    <button 
                        onClick={onOpenScanner}
                        className="bg-white text-blue-700 p-2 rounded-lg shadow hover:bg-blue-50 transition flex items-center gap-2 px-3"
                    >
                        <QrCode className="w-5 h-5" />
                        <span className="text-xs font-bold">Scan Bayar</span>
                    </button>
                    <button className="bg-white text-blue-700 p-2 rounded-lg shadow hover:bg-blue-50 transition">
                        <ArrowUpRight className="w-5 h-5" />
                    </button>
                    <button className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition">
                        <ArrowDownLeft className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* MANDIRI ECOSYSTEM INTEGRATION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#003D79] px-4 py-3 flex justify-between items-center">
                <span className="text-white font-bold text-sm tracking-wide">MANDIRI ECOSYSTEM</span>
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#FFB700] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#009CA6] rounded-full"></div>
                </div>
            </div>
            
            <div className="p-4 space-y-4">
                
                {/* 1. KOPRA (For Admin/Lurah) */}
                {(user.role === 'Lurah / Admin') && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Building className="text-[#003D79]" size={18} />
                                <span className="font-bold text-slate-800 text-sm">Kopra by Mandiri</span>
                            </div>
                            <span className="text-[10px] bg-[#003D79] text-white px-1.5 py-0.5 rounded">Wholesale</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-white p-2 rounded border border-slate-100">
                                <p className="text-[10px] text-slate-500">Cash Pooling</p>
                                <p className="text-xs font-bold text-slate-800">Rp 1.5M</p>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-100">
                                <p className="text-[10px] text-slate-500">Forex Rate</p>
                                <p className="text-xs font-bold text-green-600">Low</p>
                            </div>
                        </div>
                        <button className="w-full text-xs bg-[#003D79] text-white py-1.5 rounded hover:bg-[#002d5a] transition">
                            Manage Treasury
                        </button>
                    </div>
                )}

                {/* 2. LIVIN MERCHANT (For MSME/Warga Berkarya) */}
                {(user.role === 'Warga Berkarya' || user.role === 'Lurah / Admin') && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Briefcase className="text-[#009CA6]" size={18} />
                                <span className="font-bold text-slate-800 text-sm">Livin' Merchant</span>
                            </div>
                            <span className="text-[10px] bg-[#009CA6] text-white px-1.5 py-0.5 rounded">Bisnis</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-100 mb-2">
                            <div>
                                <p className="text-[10px] text-slate-500">QRIS Sales Today</p>
                                <p className="text-sm font-bold text-slate-800">Rp 450.000</p>
                            </div>
                            <QrCode size={20} className="text-slate-400" />
                        </div>
                        <button className="w-full text-xs bg-[#009CA6] text-white py-1.5 rounded hover:bg-[#00858e] transition">
                            Cek Settlement
                        </button>
                    </div>
                )}

                {/* 3. LIVIN (For Everyone) */}
                <div className="border border-slate-200 rounded-lg p-3 bg-gradient-to-r from-[#FFB700]/10 to-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <Smartphone className="text-[#FFB700]" size={18} />
                            <span className="font-bold text-slate-800 text-sm">Livin' by Mandiri</span>
                        </div>
                        <span className="text-[10px] bg-[#FFB700] text-white px-1.5 py-0.5 rounded">Personal</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">Hubungkan rekening Mandiri Anda untuk Top Up WargaPay instan tanpa biaya admin.</p>
                    <button className="w-full text-xs border border-[#FFB700] text-[#e6a600] py-1.5 rounded hover:bg-[#FFB700] hover:text-white transition font-bold">
                        Link Account / Top Up
                    </button>
                </div>

            </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-800 mb-4">Riwayat Transaksi</h3>
           <div className="space-y-2">
             {RECENT_TRANSACTIONS.map((tx) => (
               <div 
                key={tx.id} 
                onClick={() => setSelectedTransaction(tx)}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition group border border-transparent hover:border-slate-100"
               >
                 <div className="flex items-center space-x-3">
                   <div className={`p-2.5 rounded-full transition group-hover:scale-110 ${
                     tx.category === 'Social' ? 'bg-purple-100 text-purple-600' : 
                     tx.category === 'Income' ? 'bg-green-100 text-green-600' : 
                     'bg-blue-100 text-blue-600'
                   }`}>
                     {tx.category === 'Social' ? <CreditCard size={18}/> : 
                      tx.category === 'Income' ? <ArrowDownLeft size={18}/> : <ShoppingBag size={18}/>}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">{tx.description}</p>
                     <p className="text-xs text-slate-400">{tx.date}</p>
                   </div>
                 </div>
                 <span className={`text-sm font-bold ${
                   tx.type === 'INCOME' || tx.type === 'TRASH_DEPOSIT' ? 'text-green-600' : 'text-slate-800'
                 }`}>
                   {tx.type === 'INCOME' || tx.type === 'TRASH_DEPOSIT' ? '+' : '-'} Rp {tx.amount.toLocaleString()}
                 </span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Right Column: Services & Stats */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anjelo Card */}
          <div 
            onClick={() => onOpenAnjelo()}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Aktif</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Anjelo (Logistik)</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Antar Jemput Lokal & Distribusi Mocaf.</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Kurir Siaga: 12</span>
              <span className="text-blue-600 font-medium">Pesan Kurir &rarr;</span>
            </div>
          </div>

          {/* Mocaf Hub Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition">
                <ShoppingBag className="w-8 h-8 text-yellow-700" />
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Supply Chain</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Mocaf Hub</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Integrasi Petani & Pasar Payungi.</p>
             <div className="flex justify-between text-sm">
              <span className="text-slate-600">Stok: 2.5 Ton</span>
              <span className="text-blue-600 font-medium">Kelola Stok &rarr;</span>
            </div>
          </div>
        </div>
        
        {/* Smart Splitter Info */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-800 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Smart Splitter Aktif</h3>
                <p className="text-slate-300 text-sm max-w-lg mb-4">
                    Setiap transaksi QRIS di Pasar Payungi otomatis menyisihkan dana untuk Tabungan Wajib, Jimpitan (Dana Sosial), dan Biaya Operasional.
                </p>
                <div className="flex space-x-6 text-sm">
                    <div>
                        <span className="block text-slate-400 text-xs">Dana Sosial Terkumpul</span>
                        <span className="font-semibold text-lg">Rp 12.500.000</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 text-xs">Total Subsidi Silang</span>
                        <span className="font-semibold text-lg">Rp 4.200.000</span>
                    </div>
                </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                <QrCode className="w-64 h-64" />
            </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-dashed border-slate-200 bg-slate-50">
                      <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg ${
                                selectedTransaction.category === 'Social' ? 'bg-purple-100 text-purple-600' : 
                                selectedTransaction.category === 'Income' ? 'bg-green-100 text-green-600' : 
                                'bg-blue-100 text-blue-600'
                              }`}>
                                  {selectedTransaction.category === 'Social' ? <CreditCard size={20}/> : 
                                   selectedTransaction.category === 'Income' ? <ArrowDownLeft size={20}/> : <ShoppingBag size={20}/>}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 text-sm uppercase">Detail Transaksi</h3>
                                  <p className="text-[10px] text-slate-500">ID: {selectedTransaction.id.toUpperCase()}</p>
                              </div>
                          </div>
                          <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-600">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <div className="text-center py-4">
                          <p className={`text-3xl font-black ${
                              selectedTransaction.type === 'INCOME' || selectedTransaction.type === 'TRASH_DEPOSIT' 
                              ? 'text-green-600' 
                              : 'text-slate-800'
                          }`}>
                              {selectedTransaction.type === 'INCOME' || selectedTransaction.type === 'TRASH_DEPOSIT' ? '+' : '-'} Rp {selectedTransaction.amount.toLocaleString()}
                          </p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold border ${
                              selectedTransaction.type === 'INCOME' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                              Berhasil
                          </span>
                      </div>
                  </div>

                  <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <div className="flex items-center text-slate-500 gap-2 text-xs font-medium">
                              <Calendar size={14} /> Tanggal
                          </div>
                          <span className="text-sm font-bold text-slate-800">{selectedTransaction.date.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <div className="flex items-center text-slate-500 gap-2 text-xs font-medium">
                              <Clock size={14} /> Waktu
                          </div>
                          <span className="text-sm font-bold text-slate-800">{selectedTransaction.date.split(' ')[1]}</span>
                      </div>
                      {selectedTransaction.recipient && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <div className="flex items-center text-slate-500 gap-2 text-xs font-medium">
                                  <User size={14} /> Kepada / Dari
                              </div>
                              <span className="text-sm font-bold text-slate-800">{selectedTransaction.recipient}</span>
                          </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <div className="flex items-center text-slate-500 gap-2 text-xs font-medium">
                              <AlignLeft size={14} /> Kategori
                          </div>
                          <span className="text-sm font-bold text-slate-800">{selectedTransaction.category}</span>
                      </div>
                      
                      <div className="pt-2">
                          <p className="text-xs text-slate-500 mb-1">Keterangan</p>
                          <p className="text-sm font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              {selectedTransaction.description}
                          </p>
                      </div>

                      <button 
                        onClick={() => setSelectedTransaction(null)}
                        className="w-full mt-4 border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition"
                      >
                          <Printer size={16} /> Cetak Struk
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default EconomyView;
