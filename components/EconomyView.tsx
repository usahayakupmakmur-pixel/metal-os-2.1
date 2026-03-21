
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShoppingBag, Truck, QrCode, ArrowUpRight, ArrowDownLeft, MapPin, Bike, Package, DollarSign, User, Star, X, CheckCircle, Building, Smartphone, PieChart, TrendingUp, Briefcase, Globe, Printer, Calendar, Clock, AlignLeft, Plus, Send, Sparkles, Wallet, Zap, ArrowRight } from 'lucide-react';
import { MOCK_USER, RECENT_TRANSACTIONS } from '../constants';
import { CitizenProfile, Transaction } from '../types';
import GlassCard from '../src/components/GlassCard';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

interface EconomyViewProps {
  user?: CitizenProfile;
  onOpenAnjelo: (service?: any, note?: string) => void;
  onOpenAiAssistant?: () => void;
  onOpenScanner?: () => void;
}

const EconomyView: React.FC<EconomyViewProps> = ({ user = MOCK_USER, onOpenAnjelo, onOpenAiAssistant, onOpenScanner }) => {
  // Transaction Detail State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync Transactions from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp?.toDate().toLocaleString() || new Date().toLocaleString()
      })) as Transaction[];
      setTransactions(txs.length > 0 ? txs : RECENT_TRANSACTIONS);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    });

    return () => unsubscribe();
  }, []);

  const handleTopUp = async () => {
    if (!auth.currentUser || !topUpAmount) return;
    setIsProcessing(true);
    try {
      const amount = parseInt(topUpAmount);
      
      // 1. Add Transaction Record
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser.uid,
        amount,
        type: 'INCOME',
        category: 'Top Up',
        description: 'Top Up WargaPay via Mandiri',
        timestamp: serverTimestamp(),
        recipient: 'Mandiri Virtual Account'
      });

      // 2. Update User Balance
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        balance: increment(amount)
      });

      setIsTopUpModalOpen(false);
      setTopUpAmount('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions/users');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!auth.currentUser || !transferAmount || !transferRecipient) return;
    setIsProcessing(true);
    try {
      const amount = parseInt(transferAmount);
      
      // 1. Add Transaction Record
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser.uid,
        amount,
        type: 'EXPENSE',
        category: 'Transfer',
        description: `Transfer ke ${transferRecipient}`,
        timestamp: serverTimestamp(),
        recipient: transferRecipient
      });

      // 2. Update User Balance
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        balance: increment(-amount)
      });

      setIsTransferModalOpen(false);
      setTransferAmount('');
      setTransferRecipient('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions/users');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Left Column: WargaPay Wallet & Mandiri Integration */}
      <div className="lg:col-span-1 space-y-8">
        
        {/* WargaPay Card - Ultra Tech Style */}
        <GlassCard className="bg-gradient-to-br from-blue-600/40 to-indigo-800/40 border-blue-500/30 p-0 overflow-hidden">
          <div className="p-8 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <QrCode className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <Wallet className="text-blue-600" size={18} />
                    </div>
                    <span className="font-black tracking-[0.2em] text-white uppercase text-sm">WargaPay</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Score: {user.wargaScore}</span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Saldo Aktif</p>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                  <span className="text-2xl mr-1 opacity-50">Rp</span>
                  {user.balance.toLocaleString()}
                </h2>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-blue-300 text-[10px] font-black uppercase tracking-wider mb-1">Pemilik Akun</p>
                  <p className="font-bold text-white text-lg">{user.name}</p>
                  <p className="text-xs text-blue-400/80 font-medium">{user.role}</p>
                </div>
                
                <div className="flex gap-3">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsTopUpModalOpen(true)}
                        className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 hover:bg-blue-50 transition-colors"
                    >
                        <Plus size={24} />
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsTransferModalOpen(true)}
                        className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                    >
                        <Send size={20} />
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={onOpenScanner}
                        className="w-12 h-12 bg-cyan-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
                    >
                        <QrCode size={20} />
                    </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Assistant Trigger */}
          <div 
            onClick={onOpenAiAssistant}
            className="bg-white/5 border-t border-white/10 p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <PieChart size={16} className="text-cyan-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Analisis AI Ekonomi</span>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all transform group-hover:translate-x-1" />
          </div>
        </GlassCard>

        {/* MANDIRI ECOSYSTEM INTEGRATION - Glass Style */}
        <GlassCard className="p-0 border-blue-500/20">
            <div className="bg-blue-900/40 px-6 py-4 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Building className="text-blue-400" size={18} />
                    <span className="text-white font-black text-[10px] tracking-[0.3em] uppercase">Mandiri Ecosystem</span>
                </div>
                <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-[#FFB700] rounded-full shadow-[0_0_8px_#FFB700]"></div>
                    <div className="w-2 h-2 bg-[#009CA6] rounded-full shadow-[0_0_8px_#009CA6]"></div>
                </div>
            </div>
            
            <div className="p-6 space-y-6">
                {/* 1. KOPRA (For Admin/Lurah) */}
                {(user.role === 'Lurah / Admin') && (
                    <div className="group relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Building className="text-blue-400" size={18} />
                                </div>
                                <span className="font-black text-white text-xs uppercase tracking-wider">Kopra Wholesale</span>
                            </div>
                            <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Cash Pooling</p>
                                <p className="text-sm font-black text-white">Rp 1.5M</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Forex Rate</p>
                                <p className="text-sm font-black text-emerald-400">Competitive</p>
                            </div>
                        </div>
                        <button className="w-full text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                            Manage Treasury
                        </button>
                    </div>
                )}

                {/* 2. LIVIN MERCHANT (For MSME/Warga Berkarya) */}
                {(user.role === 'Warga Berkarya' || user.role === 'Lurah / Admin') && (
                    <div className="group relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                    <Briefcase className="text-cyan-400" size={18} />
                                </div>
                                <span className="font-black text-white text-xs uppercase tracking-wider">Livin' Merchant</span>
                            </div>
                            <span className="text-[8px] font-black bg-cyan-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Business</span>
                        </div>
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
                            <div>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">QRIS Sales Today</p>
                                <p className="text-lg font-black text-white">Rp 450.000</p>
                            </div>
                            <QrCode size={24} className="text-cyan-400/50" />
                        </div>
                        <button className="w-full text-[10px] font-black uppercase tracking-widest bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-cyan-600/20">
                            Cek Settlement
                        </button>
                    </div>
                )}

                {/* 3. LIVIN (For Everyone) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <Smartphone className="text-amber-400" size={18} />
                            </div>
                            <span className="font-black text-white text-xs uppercase tracking-wider">Livin' Personal</span>
                        </div>
                        <Zap size={14} className="text-amber-400 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4">Hubungkan rekening Mandiri Anda untuk Top Up WargaPay instan tanpa biaya admin.</p>
                    <button className="w-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30 text-amber-400 py-3 rounded-xl hover:bg-amber-500 hover:text-white transition-all">
                        Link Account / Top Up
                    </button>
                </div>
            </div>
        </GlassCard>
      </div>

      {/* Right Column: Services & Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Anjelo Card */}
          <GlassCard 
            onClick={() => onOpenAnjelo()}
            className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-orange-500/20 rounded-2xl border border-orange-500/30 group-hover:bg-orange-500/30 transition-colors">
                <Truck className="w-10 h-10 text-orange-400" />
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Anjelo Logistik</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">Antar Jemput Lokal & Distribusi Mocaf Terintegrasi.</p>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kurir Siaga: 12</span>
              <span className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                Pesan Kurir <ArrowRight size={14} />
              </span>
            </div>
          </GlassCard>

          {/* Mocaf Hub Card */}
          <GlassCard className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-yellow-500/20 rounded-2xl border border-yellow-500/30 group-hover:bg-yellow-500/30 transition-colors">
                <ShoppingBag className="w-10 h-10 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                <Globe size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Supply Chain</span>
              </div>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Mocaf Hub</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">Integrasi Petani & Pasar Payungi Ecosystem.</p>
             <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stok: 2.5 Ton</span>
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                Kelola Stok <ArrowRight size={14} />
              </span>
            </div>
          </GlassCard>
        </div>
        
        {/* Smart Splitter Info */}
        <GlassCard className="bg-slate-950 border-white/5 p-0 overflow-hidden">
            <div className="p-8 relative">
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                            <TrendingUp className="text-indigo-400" size={20} />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Smart Splitter Engine</h3>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
                        Setiap transaksi QRIS di Pasar Payungi otomatis menyisihkan dana untuk Tabungan Wajib, Jimpitan (Dana Sosial), dan Biaya Operasional melalui algoritma cerdas MetalOS.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Dana Sosial Terkumpul</span>
                            <span className="font-black text-3xl text-white tracking-tighter">Rp 12.500.000</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Subsidi Silang</span>
                            <span className="font-black text-3xl text-indigo-400 tracking-tighter">Rp 4.200.000</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-5 transform translate-y-1/4 translate-x-1/4 pointer-events-none">
                    <QrCode className="w-96 h-96" />
                </div>
            </div>
        </GlassCard>

        {/* Transaction History - Glass Style */}
        <GlassCard className="border-white/5">
           <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white tracking-tight">Riwayat Transaksi</h3>
                <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Lihat Semua</button>
           </div>
           <div className="space-y-3">
             {transactions.map((tx, i) => (
               <motion.div 
                key={tx.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedTransaction(tx)}
                className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 cursor-pointer transition-all group"
               >
                 <div className="flex items-center space-x-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                     tx.category === 'Social' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                     tx.category === 'Income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                     'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                   }`}>
                     {tx.category === 'Social' ? <CreditCard size={20}/> : 
                      tx.category === 'Income' ? <ArrowDownLeft size={20}/> : <ShoppingBag size={20}/>}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{tx.description}</p>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{tx.date}</p>
                   </div>
                 </div>
                 <div className="text-right">
                    <span className={`text-sm font-black tracking-tight ${
                    tx.type === 'INCOME' || tx.type === 'TRASH_DEPOSIT' ? 'text-emerald-400' : 'text-white'
                    }`}>
                    {tx.type === 'INCOME' || tx.type === 'TRASH_DEPOSIT' ? '+' : '-'} Rp {tx.amount.toLocaleString()}
                    </span>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Success</p>
                 </div>
               </motion.div>
             ))}
           </div>
        </GlassCard>
      </div>

      {/* Modals remain mostly the same but with glass styling */}
      {/* Top Up Modal */}
      <AnimatePresence>
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel rounded-[2.5rem] w-full max-w-sm p-8 border border-white/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white tracking-tight">Top Up WargaPay</h3>
              <button onClick={() => setIsTopUpModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[50000, 100000, 200000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="py-3 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    {amt/1000}k
                  </button>
                ))}
              </div>
              <button 
                onClick={handleTopUp}
                disabled={isProcessing || !topUpAmount}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Konfirmasi Top Up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel rounded-[2.5rem] w-full max-w-sm p-8 border border-white/20 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white tracking-tight">Transfer WargaPay</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Penerima (Nama/ID)</label>
                <input 
                  type="text" 
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="ID Warga"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleTransfer}
                disabled={isProcessing || !transferAmount || !transferRecipient}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Kirim Sekarang'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
      {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-panel rounded-[2.5rem] w-full max-w-sm overflow-hidden border border-white/20 shadow-2xl"
              >
                  <div className="p-8 border-b border-dashed border-white/10 bg-white/5">
                      <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-2xl ${
                                selectedTransaction.category === 'Social' ? 'bg-purple-500/20 text-purple-400' : 
                                selectedTransaction.category === 'Income' ? 'bg-emerald-500/20 text-emerald-400' : 
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                  {selectedTransaction.category === 'Social' ? <CreditCard size={20}/> : 
                                   selectedTransaction.category === 'Income' ? <ArrowDownLeft size={20}/> : <ShoppingBag size={20}/>}
                              </div>
                              <div>
                                  <h3 className="font-black text-white text-xs uppercase tracking-widest">Detail Transaksi</h3>
                                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">ID: {selectedTransaction.id.toUpperCase()}</p>
                              </div>
                          </div>
                          <button onClick={() => setSelectedTransaction(null)} className="text-slate-500 hover:text-white transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <div className="text-center py-6">
                          <p className={`text-4xl font-black tracking-tighter ${
                              selectedTransaction.type === 'INCOME' || selectedTransaction.type === 'TRASH_DEPOSIT' 
                              ? 'text-emerald-400' 
                              : 'text-white'
                          }`}>
                              {selectedTransaction.type === 'INCOME' || selectedTransaction.type === 'TRASH_DEPOSIT' ? '+' : '-'} Rp {selectedTransaction.amount.toLocaleString()}
                          </p>
                          <div className="flex justify-center mt-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                selectedTransaction.type === 'INCOME' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-white/10 text-white border-white/10'
                            }`}>
                                Berhasil
                            </span>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 space-y-5">
                      <div className="flex justify-between items-center py-2">
                          <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                              <Calendar size={14} /> Tanggal
                          </div>
                          <span className="text-sm font-bold text-white">{selectedTransaction.date.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                          <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                              <Clock size={14} /> Waktu
                          </div>
                          <span className="text-sm font-bold text-white">{selectedTransaction.date.split(' ')[1]}</span>
                      </div>
                      {selectedTransaction.recipient && (
                          <div className="flex justify-between items-center py-2">
                              <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                                  <User size={14} /> Kepada / Dari
                              </div>
                              <span className="text-sm font-bold text-white">{selectedTransaction.recipient}</span>
                          </div>
                      )}
                      <div className="flex justify-between items-center py-2">
                          <div className="flex items-center text-slate-500 gap-2 text-[10px] font-black uppercase tracking-widest">
                              <AlignLeft size={14} /> Kategori
                          </div>
                          <span className="text-sm font-bold text-white">{selectedTransaction.category}</span>
                      </div>
                      
                      <div className="pt-4">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Keterangan</p>
                          <p className="text-sm font-medium text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                              {selectedTransaction.description}
                          </p>
                      </div>

                      <button 
                        onClick={() => setSelectedTransaction(null)}
                        className="w-full mt-6 bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-3"
                      >
                          <Printer size={16} /> Cetak Struk
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default EconomyView;
