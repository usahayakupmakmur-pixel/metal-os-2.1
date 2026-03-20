import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, ShoppingBag, CreditCard, User, QrCode, Search, Filter, History, CheckCircle, TrendingUp, DollarSign, Wallet, ArrowRight, Printer, RefreshCw, X, Map as MapIcon, Armchair, AlertCircle, Utensils, Brush, Users, Move, Lock, Unlock, Save, Eraser, Plus, Home, MoreHorizontal, Trees, Footprints, Zap, Briefcase, Box, LayoutTemplate, MousePointer, Leaf, Coins, Check, Calendar, ChevronRight, Activity, Music, CircleDollarSign, Settings } from 'lucide-react';
import { MARKET_STALLS, MOCK_USER, MARKET_LAYOUT_DATA } from '../constants';
import { CitizenProfile, MarketStall, MarketLayoutItem, TableStatus, LayoutItemType, MarketTransaction, MarketReservation } from '../types';
import { db, auth, collection, onSnapshot, query, orderBy, limit, addDoc, updateDoc, doc, Timestamp, handleFirestoreError, OperationType, setDoc, getDoc, deleteDoc, increment } from '../firebase';

interface MarketViewProps {
  user?: CitizenProfile;
  onOpenScanner?: () => void;
}

const POINT_CONVERSION_RATE = 100; // 1 Point = Rp 100

const GlassCard: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className={`glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:border-white/40 border border-white/10 ${className || ''}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute -inset-px bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2.5rem]"></div>
        {children}
    </motion.div>
);

const MarketView: React.FC<MarketViewProps> = ({ user = MOCK_USER, onOpenScanner }) => {
  // Determine if User is a regular customer (not admin/merchant)
  const isCustomer = user.role === 'Warga Berdaya' || user.role === 'Warga Bergerak';

  const [activeTab, setActiveTab] = useState<'POS' | 'TOPUP' | 'MANAGE' | 'LAYOUT'>(isCustomer ? 'LAYOUT' : 'POS');
  const [stalls, setStalls] = useState<MarketStall[]>([]);
  const [layoutItems, setLayoutItems] = useState<MarketLayoutItem[]>([]);
  const [transactions, setTransactions] = useState<MarketTransaction[]>([]);
  const [reservations, setReservations] = useState<MarketReservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Listeners
  useEffect(() => {
    // Only start listeners if user is authenticated
    if (!auth.currentUser) return;

    const unsubStalls = onSnapshot(collection(db, 'market_stalls'), (snapshot) => {
      const stallData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketStall));
      setStalls(stallData.length > 0 ? stallData : MARKET_STALLS);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'market_stalls'));

    const unsubLayout = onSnapshot(collection(db, 'market_layout'), (snapshot) => {
      const layoutData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketLayoutItem));
      setLayoutItems(layoutData.length > 0 ? layoutData : MARKET_LAYOUT_DATA);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'market_layout'));

    const unsubTransactions = onSnapshot(
      query(collection(db, 'market_transactions'), orderBy('date', 'desc'), limit(50)),
      (snapshot) => {
        const transData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketTransaction));
        setTransactions(transData);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'market_transactions')
    );

    const unsubReservations = onSnapshot(collection(db, 'market_reservations'), (snapshot) => {
      const resData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketReservation));
      setReservations(resData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'market_reservations'));

    return () => {
      unsubStalls();
      unsubLayout();
      unsubTransactions();
      unsubReservations();
    };
  }, []);

  // POS STATE
  const [selectedStall, setSelectedStall] = useState<MarketStall | null>(null);
  const [amount, setAmount] = useState<string>('');
  
  // PAYMENT FLOW STATE
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [selectedMethod, setSelectedMethod] = useState<'QRIS' | 'WARGAPAY' | 'POINTS' | null>(null);

  // TOPUP STATE
  const [topupUser, setTopupUser] = useState('');
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [isTopupSuccess, setIsTopupSuccess] = useState(false);

  const [selectedTable, setSelectedTable] = useState<MarketLayoutItem | null>(null);
  
  // LAYOUT EDITING STATE
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // RESERVATION STATE
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationTable, setReservationTable] = useState<MarketLayoutItem | null>(null);

  // SEARCH & FILTER
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStalls = stalls.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNumberClick = (num: string) => {
      if (amount.length < 10) setAmount(prev => prev + num);
  };

  const handleBackspace = () => {
      setAmount(prev => prev.slice(0, -1));
  };

  const openPaymentSelection = () => {
      if (!selectedStall || !amount) return;
      setPaymentStep('SELECT');
      setSelectedMethod(null);
      setShowPaymentModal(true);
  };

  const handleProcessPayment = async (method: 'QRIS' | 'WARGAPAY' | 'POINTS') => {
      if (!selectedStall || !amount) return;
      setSelectedMethod(method);
      setPaymentStep('PROCESSING');
      
      try {
          const billAmount = parseInt(amount);
          
          // 1. Record Transaction
          const transactionData: Omit<MarketTransaction, 'id'> = {
              type: 'MARKET_SALE',
              amount: billAmount,
              date: Timestamp.now(),
              userId: user.id,
              stallId: selectedStall.id,
              paymentMethod: method,
              description: `Pembayaran ke ${selectedStall.name}`
          };
          await addDoc(collection(db, 'market_transactions'), transactionData);

          // 2. Update Stall Revenue
          const stallRef = doc(db, 'market_stalls', selectedStall.id);
          await updateDoc(stallRef, {
              revenueToday: increment(billAmount)
          });

          // 3. Update User Balance/Points if applicable
          if (method === 'WARGAPAY') {
              const userRef = doc(db, 'users', user.id);
              await updateDoc(userRef, {
                  balance: increment(-billAmount)
              });
          } else if (method === 'POINTS') {
              const userRef = doc(db, 'users', user.id);
              const pointsToDeduct = billAmount / POINT_CONVERSION_RATE;
              await updateDoc(userRef, {
                  points: increment(-pointsToDeduct)
              });
          }

          setPaymentStep('SUCCESS');
      } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'market_transactions');
          setPaymentStep('SELECT');
          alert('Gagal memproses pembayaran. Silakan coba lagi.');
      }
  };

  const handleClosePayment = () => {
      setShowPaymentModal(false);
      setAmount('');
      setSelectedStall(null);
      setPaymentStep('SELECT');
      setSelectedMethod(null);
  };

  const handleTopup = async () => {
      if (!topupUser || !topupAmount) return;
      
      try {
          const amountVal = parseInt(topupAmount);
          
          // 1. Record Transaction
          const transactionData: Omit<MarketTransaction, 'id'> = {
              type: 'TOPUP',
              amount: amountVal,
              date: Timestamp.now(),
              userId: topupUser, // The user being topped up
              paymentMethod: 'CASH', // Usually cash at agent
              description: `Top up WargaPay via Agen ${user.name}`
          };
          await addDoc(collection(db, 'market_transactions'), transactionData);

          // 2. Update Target User Balance
          const userRef = doc(db, 'users', topupUser);
          await updateDoc(userRef, {
              balance: increment(amountVal)
          });

          setIsTopupSuccess(true);
          setTimeout(() => {
              setIsTopupSuccess(false);
              setTopupUser('');
              setTopupAmount('');
          }, 3000);
      } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'users');
          alert('Gagal melakukan top up.');
      }
  };

  const toggleStallStatus = async (stallId: string, currentStatus: 'OPEN' | 'CLOSED') => {
      try {
          await updateDoc(doc(db, 'market_stalls', stallId), {
              status: currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN'
          });
      } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, 'market_stalls');
      }
  };

  // Layout Handlers
  const handleAddItem = async (type: LayoutItemType) => {
      const newItem: Omit<MarketLayoutItem, 'id'> = {
          type: type,
          label: type.charAt(0) + type.slice(1).toLowerCase(),
          x: 50,
          y: 50,
          width: type === 'STREET' ? 20 : undefined,
          height: type === 'STREET' ? 5 : undefined,
          status: type === 'TABLE' ? 'AVAILABLE' : undefined,
          capacity: type === 'TABLE' ? 4 : undefined
      };
      
      try {
          await addDoc(collection(db, 'market_layout'), newItem);
      } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'market_layout');
      }
  };

  const handleRemoveItem = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'market_layout', id));
      } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'market_layout');
      }
  };

  const handleLayoutItemClick = (item: MarketLayoutItem) => {
      // If eraser is active in edit mode, delete the item
      if (isEditMode && isEraserActive) {
          handleRemoveItem(item.id);
          return;
      }

      // Disable detail interaction in edit mode (unless it's deletion)
      if (isEditMode) return;

      // Customer Logic: Reservation
      if (isCustomer) {
          if (item.type === 'TABLE' && item.status === 'AVAILABLE') {
              setReservationTable(item);
              setShowReservationModal(true);
          }
          return;
      }

      // Admin Logic
      if (item.type === 'STALL' && item.linkedStallId) {
          // Find the stall and switch to POS
          const stall = stalls.find(s => s.id === item.linkedStallId);
          if (stall) {
              setSelectedStall(stall);
              setActiveTab('POS');
          }
      } else if (item.type === 'TABLE') {
          setSelectedTable(item);
      }
  };

  const updateTableStatus = async (status: TableStatus) => {
      if (!selectedTable) return;
      try {
          await updateDoc(doc(db, 'market_layout', selectedTable.id), { status });
          setSelectedTable(null);
      } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, 'market_layout');
      }
  };

  const handleReserveTable = async () => {
      if (!reservationTable) return;
      
      try {
          // 1. Create Reservation
          const reservationData: Omit<MarketReservation, 'id'> = {
              tableId: reservationTable.id,
              userId: user.id,
              userName: user.name,
              startTime: Timestamp.now(),
              guests: reservationTable.capacity || 2,
              status: 'CONFIRMED'
          };
          await addDoc(collection(db, 'market_reservations'), reservationData);

          // 2. Update table status
          await updateDoc(doc(db, 'market_layout', reservationTable.id), { status: 'OCCUPIED' });
          
          setShowReservationModal(false);
          setReservationTable(null);
          alert(`Meja ${reservationTable.label} berhasil dipesan atas nama ${user.name}!`);
      } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'market_reservations');
          alert('Gagal melakukan reservasi.');
      }
  };

  // Drag and Drop Logic
  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
      if (!isEditMode || isEraserActive) return;
      e.preventDefault();
      e.stopPropagation();
      setDraggingItemId(itemId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isEditMode || !draggingItemId || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate new position as percentage relative to container
      let newX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      let newY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

      // Clamp values
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));

      setLayoutItems(prev => prev.map(item => 
          item.id === draggingItemId ? { ...item, x: newX, y: newY } : item
      ));
  };

  const handleMouseUp = async () => {
      if (isEditMode && draggingItemId) {
          const item = layoutItems.find(i => i.id === draggingItemId);
          if (item) {
              try {
                  await updateDoc(doc(db, 'market_layout', item.id), {
                      x: item.x,
                      y: item.y
                  });
              } catch (error) {
                  handleFirestoreError(error, OperationType.UPDATE, 'market_layout');
              }
          }
      }
      setDraggingItemId(null);
  };

  const getTableColor = (status?: TableStatus) => {
      switch(status) {
          case 'AVAILABLE': return 'bg-green-100 border-green-300 text-green-700';
          case 'OCCUPIED': return 'bg-red-100 border-red-300 text-red-700';
          case 'ORDERING': return 'bg-orange-100 border-orange-300 text-orange-700';
          case 'DIRTY': return 'bg-slate-200 border-slate-400 text-slate-600';
          default: return 'bg-white border-slate-200';
      }
  };

  const renderItemVisual = (item: MarketLayoutItem) => {
      const isSelected = isEditMode && draggingItemId === item.id;
      
      const baseClasses = `absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-sm border select-none transition-all duration-300
        ${isEditMode 
            ? (isEraserActive ? 'cursor-not-allowed hover:bg-red-500/20 hover:border-red-500/50' : 'cursor-move hover:scale-105 hover:shadow-xl hover:border-white/40') 
            : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${isSelected ? 'scale-110 shadow-2xl z-50 opacity-90 ring-2 ring-white/50' : ''}
      `;

      // Style logic based on type
      let styleClasses = '';
      let content = null;
      let width = item.width ? `${item.width}%` : undefined;
      let height = item.height ? `${item.height}%` : undefined;

      switch (item.type) {
          case 'STALL':
              styleClasses = 'w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border-white/20 z-20 shadow-xl hover:shadow-blue-500/30';
              content = (
                  <div className="text-center pointer-events-none">
                      <div className="bg-blue-500/30 p-1.5 rounded-lg mb-1 inline-block shadow-inner">
                        <Store size={18} className="text-blue-300" />
                      </div>
                      <span className="text-[9px] font-black text-white/90 block leading-none truncate w-14 px-1 tracking-tight">{item.label}</span>
                  </div>
              );
              break;
          case 'TABLE':
              const tableColor = getTableColor(item.status);
              styleClasses = `w-12 h-12 rounded-full z-30 backdrop-blur-xl border-white/30 shadow-xl ${tableColor}`;
              content = (
                  <div className="text-center pointer-events-none">
                      <span className="text-xs font-black text-white drop-shadow-md">{item.label}</span>
                      {item.status === 'OCCUPIED' && (
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white/50 animate-pulse shadow-[0_0_12px_#ef4444]"></div>
                      )}
                      {item.status === 'AVAILABLE' && (
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white/50 shadow-[0_0_12px_#10b981]"></div>
                      )}
                  </div>
              );
              break;
          case 'STAGE':
              styleClasses = 'bg-purple-500/20 backdrop-blur-md border-purple-400/30 rounded-2xl z-10 shadow-inner';
              content = (
                <div className="flex flex-col items-center gap-1 pointer-events-none">
                  <Music size={16} className="text-purple-300" />
                  <span className="text-[10px] font-black text-purple-200 tracking-widest uppercase">Panggung</span>
                </div>
              );
              break;
          case 'ENTRANCE':
              styleClasses = 'bg-slate-900/80 backdrop-blur-md text-white rounded-xl px-4 py-2 border-white/10 z-20 shadow-xl';
              content = (
                <div className="flex items-center gap-2 pointer-events-none">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black tracking-tighter">GATE {item.label || 'MAIN'}</span>
                </div>
              );
              break;
          case 'TOILET':
              styleClasses = 'w-10 h-10 bg-slate-500/20 backdrop-blur-md border-white/10 rounded-xl z-20';
              content = <span className="text-[10px] font-black text-white/60 pointer-events-none tracking-tighter">WC</span>;
              break;
          case 'TREE':
              styleClasses = 'w-16 h-16 bg-emerald-500/10 backdrop-blur-sm border-emerald-500/20 rounded-full z-10 border-dashed';
              content = <Trees size={24} className="text-emerald-400/40" />;
              break;
          case 'STREET':
              styleClasses = 'bg-slate-800/30 backdrop-blur-[2px] border-white/5 z-0 rounded-lg shadow-inner';
              content = <span className="text-[8px] text-white/20 tracking-[0.2em] pointer-events-none uppercase font-black">Jalur Warga</span>;
              break;
          case 'HOUSE':
              styleClasses = 'w-16 h-16 bg-amber-500/10 backdrop-blur-md border-amber-500/20 rounded-2xl z-10 shadow-lg';
              content = (
                <div className="flex flex-col items-center pointer-events-none">
                  <Home size={20} className="text-amber-400/60" />
                  <span className="text-[9px] font-bold mt-1 text-amber-200/40">Rumah</span>
                </div>
              );
              break;
          case 'POLE':
              styleClasses = 'w-5 h-5 bg-slate-900/90 backdrop-blur-md rounded-full border-white/20 z-20 shadow-2xl';
              content = (
                <div className="absolute -top-5 flex flex-col items-center pointer-events-none">
                  <Zap size={14} className="text-yellow-400 animate-pulse" />
                  <div className="w-0.5 h-4 bg-gradient-to-b from-yellow-400/50 to-transparent"></div>
                </div>
              );
              break;
          case 'OFFICE':
              styleClasses = 'w-20 h-16 bg-blue-500/10 backdrop-blur-md border-blue-500/20 rounded-2xl z-10 shadow-lg';
              content = (
                <div className="flex flex-col items-center pointer-events-none">
                  <Briefcase size={20} className="text-blue-400/60" />
                  <span className="text-[9px] font-bold mt-1 text-blue-200/40">Kantor</span>
                </div>
              );
              break;
          case 'OTHER':
              styleClasses = 'w-12 h-12 bg-white/5 backdrop-blur-sm border-white/10 rounded-xl border-dashed z-10';
              content = <Box size={18} className="text-white/20" />;
              break;
          default:
              styleClasses = 'bg-white/10 backdrop-blur-md border-white/20';
      }

      return (
          <motion.div
              layoutId={item.id}
              key={item.id}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              onClick={() => handleLayoutItemClick(item)}
              className={`${baseClasses} ${styleClasses}`}
              style={{ 
                  left: `${item.x}%`, 
                  top: `${item.y}%`,
                  width: width,
                  height: height,
              }}
          >
              {content}
          </motion.div>
      );
  };

  const tools: {type: LayoutItemType, icon: any, label: string}[] = [
      { type: 'STALL', icon: Store, label: 'Lapak' },
      { type: 'TABLE', icon: Armchair, label: 'Meja' },
      { type: 'STAGE', icon: LayoutTemplate, label: 'Panggung' },
      { type: 'STREET', icon: Footprints, label: 'Jalan' },
      { type: 'HOUSE', icon: Home, label: 'Rumah' },
      { type: 'POLE', icon: Zap, label: 'Tiang' },
      { type: 'OFFICE', icon: Briefcase, label: 'Kantor' },
      { type: 'TREE', icon: Trees, label: 'Pohon' },
      { type: 'ENTRANCE', icon: ArrowRight, label: 'Masuk' },
      { type: 'TOILET', icon: Box, label: 'WC' },
      { type: 'OTHER', icon: MoreHorizontal, label: 'Lain' },
  ];

  // Adjust Nav Items based on Role
  const marketNavItems = isCustomer 
    ? [
        { id: 'LAYOUT', label: 'Denah', icon: MapIcon, color: 'text-purple-600', bg: 'bg-purple-50', activeBg: 'bg-purple-600' },
        { id: 'POS', label: 'Kasir', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', activeBg: 'bg-orange-600' },
      ]
    : [
        { id: 'POS', label: 'Kasir', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', activeBg: 'bg-orange-600' },
        { id: 'TOPUP', label: 'Top Up', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', activeBg: 'bg-blue-600' },
        { id: 'LAYOUT', label: 'Denah', icon: MapIcon, color: 'text-purple-600', bg: 'bg-purple-50', activeBg: 'bg-purple-600' },
        { id: 'MANAGE', label: 'Monitor', icon: TrendingUp, color: 'text-slate-600', bg: 'bg-slate-50', activeBg: 'bg-slate-800' },
    ];

  const pointsValue = user.points * POINT_CONVERSION_RATE;
  const currentBillAmount = parseInt(amount || '0');
  const canPayWithPoints = pointsValue >= currentBillAmount;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative pb-20 md:pb-0 overflow-hidden">
      {/* Background Flair */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[140px] rounded-full animate-pulse-glow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/15 blur-[140px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-600/5 blur-[160px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      </div>
      
      {/* MOBILE NAVIGATION: ICON GRID */}
      <div className={`md:hidden grid ${isCustomer ? 'grid-cols-2' : 'grid-cols-4'} gap-3 px-1 mb-4`}>
          {marketNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                  <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className="flex flex-col items-center gap-2 group transition-all duration-300"
                  >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${isActive ? `${item.activeBg} text-white shadow-lg scale-105` : `bg-white/5 border border-white/10 ${item.color}`}`}>
                          <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-cyan-400 font-extrabold' : 'text-slate-400'}`}>
                          {item.label}
                      </span>
                  </button>
              );
          })}
      </div>

      {/* LEFT SIDEBAR (Desktop) */}
      <div className="hidden md:flex w-full md:w-64 flex-col gap-4">
         <GlassCard className="p-4 border-white/5">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                     <Store size={24} />
                 </div>
                 <div>
                     <h2 className="font-bold text-white">Pasar Payungi</h2>
                     <p className="text-xs text-slate-500">{isCustomer ? 'Pesan Meja' : 'Hub Manajemen'}</p>
                 </div>
             </div>
             
             <nav className="space-y-2">
                 {marketNavItems.map((item) => (
                     <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? `${item.activeBg.replace('text-','bg-')} text-white shadow-lg shadow-cyan-500/10` : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                     >
                         <item.icon size={18} /> <span className="font-bold text-sm">{item.label}</span>
                     </button>
                 ))}
             </nav>
         </GlassCard>

         {/* Summary Widget */}
         {!isCustomer && (
             <GlassCard className="bg-slate-900/50 border-white/5 flex-1 flex flex-col justify-center">
                 <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Transaksi Hari Ini</h3>
                 <div className="text-3xl font-bold mb-1 text-white">
                     Rp {transactions
                         .filter(t => {
                             const d = t.date?.toDate ? t.date.toDate() : new Date(t.date);
                             return d.toDateString() === new Date().toDateString();
                         })
                         .reduce((acc, t) => acc + t.amount, 0)
                         .toLocaleString()}
                 </div>
                 <div className="flex items-center text-emerald-400 text-[10px] font-bold gap-1.5 mb-6 uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                     Live Updates
                 </div>
                  <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-500">Metode WargaPay</span>
                          <span className="text-orange-400">
                              {Math.round((transactions.filter(t => t.paymentMethod === 'WARGAPAY').length / (transactions.length || 1)) * 100)}%
                          </span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${(transactions.filter(t => t.paymentMethod === 'WARGAPAY').length / (transactions.length || 1)) * 100}%` }}
                          ></div>
                      </div>
                  </div>
             </GlassCard>
         )}
      </div>

      {/* RIGHT CONTENT: MAIN WORKSPACE */}
      <div className="flex-1 glass-panel rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
          
          {/* TOP BAR */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
              <h2 className="font-bold text-lg text-white tracking-tight">
                  {activeTab === 'POS' && 'Kasir & Pembayaran'}
                  {activeTab === 'TOPUP' && 'Layanan Top Up WargaPay'}
                  {activeTab === 'LAYOUT' && (isCustomer ? 'Reservasi Meja Payungi' : 'Denah Lapak & Manajemen Meja')}
                  {activeTab === 'MANAGE' && 'Monitoring Lapak Pasar'}
              </h2>
              <div className="flex items-center gap-3">
                  <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-400">
                      <User size={14} className="text-cyan-400" /> {isCustomer ? 'Warga' : 'Operator'}: <span className="text-white">{user.name}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
              </div>
          </div>

          {/* MAIN CANVAS */}
          <div className="flex-1 overflow-hidden p-0 relative bg-slate-950/20">
              
              {/* === MODE: KASIR TERPUSAT (POS) === */}
              {activeTab === 'POS' && (
                  <div className="h-full flex flex-col md:flex-row overflow-hidden">
                      {/* Left: Stall Selector - Scrollable area */}
                      <div className="flex-1 md:w-1/2 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-white/5 bg-transparent custom-scrollbar">
                          <div className="relative mb-6 sticky top-0 z-10">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                              <input 
                                type="text" 
                                placeholder="Cari lapak atau pedagang..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-slate-600 transition-all shadow-inner"
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4 pb-20 md:pb-0">
                              {filteredStalls.map((stall) => (
                                  <motion.button 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    key={stall.id}
                                    onClick={() => setSelectedStall(stall)}
                                    className={`p-5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group shadow-lg backdrop-blur-md ${
                                        selectedStall?.id === stall.id 
                                        ? 'border-orange-500/50 bg-orange-500/20 ring-1 ring-orange-500/30 shadow-orange-500/10' 
                                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                    }`}
                                  >
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                      <div className="flex justify-between items-start mb-3 relative z-10">
                                          <div className={`p-3 rounded-2xl transition-all duration-500 shadow-inner ${stall.category === 'KULINER' ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30'}`}>
                                              <Store size={22} />
                                          </div>
                                          {stall.status === 'CLOSED' ? (
                                              <span className="text-[8px] font-black bg-slate-900/80 text-slate-500 px-2 py-1 rounded-lg tracking-widest uppercase border border-white/5">TUTUP</span>
                                          ) : (
                                              <div className="flex items-center gap-1.5">
                                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                                  <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">BUKA</span>
                                              </div>
                                          )}
                                      </div>
                                      <div className="relative z-10">
                                          <h4 className="font-black text-white text-base mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors tracking-tight">{stall.name}</h4>
                                          <div className="flex items-center gap-2">
                                              <User size={10} className="text-slate-500" />
                                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stall.owner}</p>
                                          </div>
                                      </div>
                                      {selectedStall?.id === stall.id && (
                                          <motion.div 
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="absolute top-3 right-3 text-orange-400"
                                          >
                                              <CheckCircle size={22} fill="currentColor" className="text-orange-500/20" />
                                              <CheckCircle size={22} className="absolute inset-0" />
                                          </motion.div>
                                      )}
                                  </motion.button>
                              ))}
                          </div>
                      </div>

                      {/* Right: Calculator & Checkout - Fixed at bottom on mobile, full right side on desktop */}
                      <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-xl border-t md:border-t-0 border-white/5 flex flex-col shadow-2xl z-20">
                          {/* Display Area */}
                          <div className="p-10 pb-6 flex flex-col justify-end min-h-[180px] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 blur-[100px] rounded-full -mr-24 -mt-24 animate-pulse"></div>
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full -ml-16 -mb-16"></div>
                              
                              <div className="text-right mb-4">
                                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Total Pembayaran</span>
                              </div>
                              <div className="text-right text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                                  <span className="text-2xl text-white/20 mr-3 font-medium">Rp</span>
                                  {amount ? parseInt(amount).toLocaleString() : '0'}
                              </div>
                              <div className="text-right mt-6 h-10 flex justify-end items-center">
                                  {selectedStall ? (
                                      <motion.span 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                                      >
                                        Lapak: {selectedStall.name}
                                      </motion.span>
                                  ) : (
                                      <span className="text-white/10 italic text-[10px] font-black uppercase tracking-[0.2em]">Pilih lapak terlebih dahulu</span>
                                  )}
                              </div>
                          </div>

                          <div className="p-10 pt-0 flex-1 flex flex-col justify-between">
                              <div className="grid grid-cols-3 gap-4">
                                  {[1,2,3,4,5,6,7,8,9].map(num => (
                                      <button 
                                        key={num}
                                        onClick={() => handleNumberClick(num.toString())}
                                        className="h-20 bg-white/5 rounded-[2rem] border border-white/10 text-3xl font-black text-white hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all duration-200 shadow-xl relative overflow-hidden group"
                                      >
                                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                          {num}
                                      </button>
                                  ))}
                                  <button onClick={() => setAmount('')} className="h-20 bg-red-500/10 rounded-[2rem] border border-red-500/20 text-red-400 font-black hover:bg-red-500/20 transition-all text-xl uppercase tracking-widest active:scale-90">C</button>
                                  <button onClick={() => handleNumberClick('0')} className="h-20 bg-white/5 rounded-[2rem] border border-white/10 text-3xl font-black text-white hover:bg-white/10 active:scale-90 transition-all group relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      0
                                  </button>
                                  <button onClick={handleBackspace} className="h-20 bg-white/5 rounded-[2rem] border border-white/10 text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-2xl group relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      ⌫
                                  </button>
                                  <button onClick={() => handleNumberClick('000')} className="col-span-3 h-16 bg-white/5 rounded-2xl border border-white/10 text-white/20 font-black hover:bg-white/10 hover:text-white/40 transition-all text-xl tracking-[0.5em] active:scale-95">000</button>
                              </div>

                              <div className="grid grid-cols-2 gap-5 mt-10">
                                  <button 
                                      onClick={onOpenScanner}
                                      className="py-6 bg-slate-900 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4 group"
                                  >
                                      <QrCode size={22} className="text-cyan-400 group-hover:scale-110 transition-transform" /> Scan QRIS
                                  </button>
                                  <button 
                                      onClick={openPaymentSelection}
                                      disabled={!selectedStall || !amount}
                                      className="py-6 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_50px_-12px_rgba(255,255,255,0.2)] hover:bg-white/90 active:scale-95 transition-all disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-4"
                                  >
                                      <CreditCard size={22} /> Bayar Sekarang
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* === MODE: DENAH PASAR (LAYOUT) === */}
              {activeTab === 'LAYOUT' && (
                  <div 
                    className={`h-full relative bg-slate-950 overflow-hidden ${isEditMode ? (isEraserActive ? 'cursor-not-allowed' : 'cursor-crosshair') : 'cursor-default'}`}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    ref={containerRef}
                  >
                      {/* Interactive Map Area */}
                      <div className={`absolute inset-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 ${isEditMode ? 'ring-8 ring-purple-500/10 border-purple-500/50' : ''}`}>
                          <div className="absolute inset-0 bg-slate-900 opacity-50 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>
                          
                          {isEditMode && !isCustomer && (
                              <div className="absolute top-6 left-6 z-50 bg-purple-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                  {isEraserActive ? <Eraser size={18} className="animate-pulse" /> : <Move size={18} className="animate-pulse" />}
                                  <span className="text-xs font-black uppercase tracking-widest">{isEraserActive ? 'Mode Hapus (Klik Item)' : 'Mode Edit Layout'}</span>
                              </div>
                          )}

                          {isCustomer && (
                              <div className="absolute top-6 left-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                  <Armchair size={18} />
                                  <span className="text-xs font-black uppercase tracking-widest">Klik Meja Hijau untuk Reservasi</span>
                              </div>
                          )}

                          {layoutItems.map(renderItemVisual)}
                      </div>
                      
                      {/* Editor Toolbar (Visible only in Edit Mode AND NOT Customer) */}
                      {isEditMode && !isCustomer && (
                          <div className="absolute top-6 right-8 bottom-24 w-20 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center py-6 gap-4 z-40 overflow-y-auto no-scrollbar animate-in slide-in-from-right-10 fade-in duration-500">
                              <div className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-[0.2em]">Tools</div>
                              <button 
                                onClick={() => setIsEraserActive(!isEraserActive)}
                                className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${isEraserActive ? 'bg-red-500 text-white scale-110' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                title="Hapus Item"
                              >
                                  <Eraser size={24} />
                              </button>
                              <button 
                                onClick={() => setIsEraserActive(false)}
                                className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${!isEraserActive ? 'bg-cyan-500 text-white scale-110' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                title="Pindah Item (Select)"
                              >
                                  <MousePointer size={24} />
                              </button>
                              
                              <div className="w-10 h-px bg-white/10 my-2"></div>
                              <div className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-[0.2em]">Add</div>
                              
                              {tools.map((tool) => (
                                  <button 
                                    key={tool.type}
                                    onClick={() => { setIsEraserActive(false); handleAddItem(tool.type); }}
                                    className="p-3 rounded-2xl hover:bg-purple-500/20 hover:text-purple-400 text-slate-500 transition-all duration-300 flex flex-col items-center gap-1 group relative"
                                    title={`Tambah ${tool.label}`}
                                  >
                                      <tool.icon size={24} />
                                      <span className="text-[9px] font-black hidden group-hover:block absolute right-20 bg-slate-900 text-white px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap uppercase tracking-widest border border-white/10">{tool.label}</span>
                                  </button>
                              ))}
                          </div>
                      )}

                      {/* Legend / Controls */}
                      <div className="absolute bottom-10 left-10 right-10 md:right-auto flex flex-col md:flex-row items-center md:items-end gap-6 z-40">
                          {!isEditMode && (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-8"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
                                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Kosong</span>
                                  </div>
                                  <div className="w-px h-4 bg-white/10"></div>
                                  <div className="flex items-center gap-3">
                                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Order</span>
                                  </div>
                                  <div className="w-px h-4 bg-white/10"></div>
                                  <div className="flex items-center gap-3">
                                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div>
                                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Terisi</span>
                                  </div>
                                  <div className="w-px h-4 bg-white/10"></div>
                                  <div className="flex items-center gap-3">
                                      <div className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.6)]"></div>
                                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Kotor</span>
                                  </div>
                              </motion.div>
                          )}

                          {/* Edit Mode Toggle - Only for Admin */}
                          {!isCustomer && (
                              <button 
                                onClick={() => {
                                    setIsEditMode(!isEditMode);
                                    setIsEraserActive(false);
                                }}
                                className={`p-5 rounded-[2rem] shadow-2xl transition-all duration-500 active:scale-90 flex items-center gap-4 group border ${isEditMode ? 'bg-purple-600 text-white border-purple-400/50 shadow-purple-500/20' : 'bg-white/5 text-white hover:bg-white/10 border-white/10'}`}
                              >
                                  <div className={`p-2 rounded-xl transition-all duration-500 ${isEditMode ? 'bg-white/20' : 'bg-white/5'}`}>
                                    {isEditMode ? <Check size={20} /> : <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] pr-2">{isEditMode ? 'Simpan Layout' : 'Konfigurasi Layout'}</span>
                              </button>
                          )}
                      </div>

                      {/* Table Management Modal (Admin) */}
                      <AnimatePresence>
                        {selectedTable && !isEditMode && !isCustomer && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md"
                            >
                                <motion.div 
                                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                  animate={{ scale: 1, opacity: 1, y: 0 }}
                                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                  className="glass-panel p-8 rounded-[2.5rem] shadow-2xl w-85 border-white/20 relative overflow-hidden"
                                >
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <h3 className="font-black text-xl flex items-center gap-3 text-white tracking-tight">
                                            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                                              <Armchair size={20} />
                                            </div>
                                            Meja {selectedTable.label}
                                        </h3>
                                        <button onClick={() => setSelectedTable(null)} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                        <button 
                                          onClick={() => updateTableStatus('AVAILABLE')}
                                          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${selectedTable.status === 'AVAILABLE' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <CheckCircle size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Kosong</span>
                                        </button>
                                        <button 
                                          onClick={() => updateTableStatus('ORDERING')}
                                          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${selectedTable.status === 'ORDERING' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/10' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <Utensils size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Order</span>
                                        </button>
                                        <button 
                                          onClick={() => updateTableStatus('OCCUPIED')}
                                          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${selectedTable.status === 'OCCUPIED' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <Users size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Makan</span>
                                        </button>
                                        <button 
                                          onClick={() => updateTableStatus('DIRTY')}
                                          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${selectedTable.status === 'DIRTY' ? 'bg-slate-500/20 border-slate-500/50 text-slate-400 shadow-lg shadow-slate-500/10' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <Brush size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Bersihkan</span>
                                        </button>
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 text-center border border-white/5">
                                        Kapasitas: {selectedTable.capacity} Orang
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Reservation Modal (User) */}
                      <AnimatePresence>
                        {showReservationModal && reservationTable && isCustomer && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                            >
                                <motion.div 
                                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                  animate={{ scale: 1, opacity: 1, y: 0 }}
                                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                  className="glass-panel p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm relative border-white/20 overflow-hidden"
                                >
                                    <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full"></div>
                                    
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div>
                                            <h3 className="font-black text-2xl text-white tracking-tight">
                                                Reservasi Meja
                                            </h3>
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Konfirmasi Pesanan</p>
                                        </div>
                                        <button onClick={() => setShowReservationModal(false)} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 mb-8 flex flex-col items-center text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="bg-emerald-500/20 p-5 rounded-2xl text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
                                            <Armchair size={40} />
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                        </div>
                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">Meja Pilihan</p>
                                        <p className="text-4xl font-black text-white tracking-tighter">Nomor {reservationTable.label}</p>
                                        <p className="text-xs text-white/40 mt-2 font-bold uppercase tracking-widest">Kapasitas {reservationTable.capacity} Orang</p>
                                    </div>

                                    <div className="space-y-4 mb-8 relative z-10">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="bg-white/10 p-2.5 rounded-xl text-white/40"><User size={20} /></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Pemesan</p>
                                                <p className="text-sm font-black text-white">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="bg-white/10 p-2.5 rounded-xl text-white/40"><Calendar size={20} /></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Waktu</p>
                                                <p className="text-sm font-black text-white">Walk-in (Sekarang)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                      onClick={handleReserveTable}
                                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
                                    >
                                        <CheckCircle size={24} /> Konfirmasi
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
              )}

              {activeTab === 'TOPUP' && (
                  <div className="h-full p-4 md:p-8 flex flex-col items-center justify-center max-w-2xl mx-auto">
                      <GlassCard className="w-full overflow-hidden border-white/20">
                          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                                <Wallet size={120} />
                              </div>
                              <div className="relative z-10">
                                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                                  <Wallet size={32} className="text-white" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight">Top Up WargaPay</h3>
                                <p className="text-blue-100/80 text-sm font-medium mt-1">Layanan Agen Laku Pandai Pasar Payungi</p>
                              </div>
                          </div>
                          
                          <div className="p-10 space-y-10">
                              {!isTopupSuccess ? (
                                  <>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 text-[11px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                                          <User size={14} className="text-blue-400" /> Identitas Warga
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="flex-1 relative group">
                                              <input 
                                                  type="text" 
                                                  value={topupUser}
                                                  onChange={(e) => setTopupUser(e.target.value)}
                                                  placeholder="Scan QR atau Input ID"
                                                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-white/10 transition-all group-hover:bg-white/10 group-hover:border-white/20 font-black tracking-tight"
                                              />
                                              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-400 transition-colors">
                                                <Search size={24} />
                                              </div>
                                            </div>
                                            <button 
                                                onClick={onOpenScanner}
                                                className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all active:scale-90 shadow-xl"
                                            >
                                                <QrCode size={28} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <label className="flex items-center gap-3 text-[11px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                                          <CircleDollarSign size={14} className="text-emerald-400" /> Nominal Top Up
                                        </label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {[20000, 50000, 100000, 200000].map(val => (
                                                <button 
                                                    key={val}
                                                    onClick={() => setTopupAmount(val.toString())}
                                                    className={`py-4 rounded-2xl border text-xs font-black transition-all active:scale-95 tracking-widest uppercase ${topupAmount === val.toString() ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:bg-white/10'}`}
                                                >
                                                    {val/1000}k
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-white/10 group-focus-within:text-emerald-400 transition-colors text-xl">Rp</span>
                                            <input 
                                                type="number" 
                                                value={topupAmount}
                                                onChange={(e) => setTopupAmount(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-7 outline-none focus:ring-2 focus:ring-emerald-500/50 font-black text-4xl text-white transition-all group-hover:bg-white/10 group-hover:border-white/20 tracking-tighter"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleTopup}
                                        disabled={!topupUser || !topupAmount}
                                        className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black shadow-[0_20px_50px_-12px_rgba(255,255,255,0.2)] hover:bg-white/90 active:scale-95 transition-all disabled:opacity-10 disabled:grayscale disabled:pointer-events-none text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4"
                                    >
                                        <CheckCircle size={20} /> Konfirmasi Top Up
                                    </button>
                                  </>
                              ) : (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="text-center py-8 relative"
                                  >
                                      <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>
                                      <motion.div 
                                        initial={{ rotate: -180, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: 'spring', damping: 12 }}
                                        className="w-28 h-28 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-400 border border-emerald-500/40 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] relative z-10"
                                      >
                                          <CheckCircle size={56} />
                                      </motion.div>
                                      <h3 className="text-3xl font-black text-white tracking-tight mb-2 relative z-10">Top Up Berhasil!</h3>
                                      <p className="text-white/40 mb-10 font-medium relative z-10">Saldo telah berhasil dikreditkan ke akun warga.</p>
                                      
                                      <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-left space-y-5 mb-10 backdrop-blur-xl relative z-10 shadow-inner">
                                          <div className="flex justify-between items-center">
                                              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">ID Warga</span>
                                              <span className="font-black text-white tracking-tight">{topupUser}</span>
                                          </div>
                                          <div className="h-px bg-white/10 w-full"></div>
                                          <div className="flex justify-between items-center">
                                              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Nominal</span>
                                              <span className="font-black text-emerald-400 text-2xl tracking-tighter">Rp {parseInt(topupAmount).toLocaleString()}</span>
                                          </div>
                                      </div>
                                      
                                      <button 
                                        onClick={() => setIsTopupSuccess(false)}
                                        className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black transition-all hover:bg-white/90 active:scale-95 shadow-xl uppercase tracking-widest text-xs relative z-10"
                                      >
                                          Transaksi Baru
                                      </button>
                                  </motion.div>
                              )}
                          </div>
                      </GlassCard>
                  </div>
              )}

              {/* === MODE: MANAGE STALLS === */}
              {activeTab === 'MANAGE' && (
                  <div className="h-full p-6 overflow-y-auto custom-scrollbar space-y-8">
                       {/* Summary Stats */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <GlassCard className="p-5 border-white/10 hover:border-blue-500/30 transition-all group">
                               <div className="flex items-center justify-between mb-3">
                                 <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                   <TrendingUp size={18} />
                                 </div>
                                 <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live
                                 </span>
                               </div>
                               <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Total Pendapatan</p>
                               <p className="text-2xl font-black text-white tracking-tight">Rp {stalls.reduce((acc, s) => acc + s.revenueToday, 0).toLocaleString()}</p>
                           </GlassCard>

                           <GlassCard className="p-5 border-white/10 hover:border-emerald-500/30 transition-all group">
                               <div className="flex items-center justify-between mb-3">
                                 <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                                   <Store size={18} />
                                 </div>
                                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Status</span>
                               </div>
                               <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Lapak Aktif</p>
                               <p className="text-2xl font-black text-white tracking-tight">{stalls.filter(s => s.status === 'OPEN').length} <span className="text-sm text-white/20 font-medium">/ {stalls.length}</span></p>
                           </GlassCard>

                           <GlassCard className="p-5 border-white/10 hover:border-amber-500/30 transition-all group">
                               <div className="flex items-center justify-between mb-3">
                                 <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
                                   <Zap size={18} />
                                 </div>
                                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Volume</span>
                               </div>
                               <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Transaksi</p>
                               <p className="text-2xl font-black text-white tracking-tight">{transactions.length}</p>
                           </GlassCard>

                           <GlassCard className="p-5 border-white/10 hover:border-purple-500/30 transition-all group">
                               <div className="flex items-center justify-between mb-3">
                                 <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                                   <Users size={18} />
                                 </div>
                                 <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Booking</span>
                               </div>
                               <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Reservasi Aktif</p>
                               <p className="text-2xl font-black text-emerald-400 tracking-tight">{reservations.filter(r => r.status === 'CONFIRMED').length}</p>
                           </GlassCard>
                       </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                          {/* Stall List */}
                          <div className="xl:col-span-2 space-y-6">
                              <div className="flex items-center justify-between px-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                    <h3 className="font-black text-white tracking-tight text-lg uppercase">Manajemen Lapak</h3>
                                  </div>
                                  <button className="text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Lihat Semua</button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {stalls.map((stall) => (
                                      <GlassCard key={stall.id} className="p-6 border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
                                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Store size={80} />
                                          </div>
                                          
                                          <div className="flex justify-between items-start mb-6 relative z-10">
                                              <div className={`p-4 rounded-2xl transition-all shadow-lg ${stall.category === 'KULINER' ? 'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30' : 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30'}`}>
                                                  <Store size={24} />
                                              </div>
                                              <button 
                                                onClick={() => toggleStallStatus(stall.id, stall.status)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all active:scale-95 ${stall.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
                                              >
                                                  {stall.status === 'OPEN' ? 'BUKA' : 'TUTUP'}
                                              </button>
                                          </div>
                                          
                                          <div className="relative z-10">
                                            <h3 className="font-black text-white text-xl mb-1 tracking-tight">{stall.name}</h3>
                                            <p className="text-xs text-white/40 font-medium mb-6 flex items-center gap-2">
                                              <User size={12} /> {stall.owner} <span className="w-1 h-1 bg-white/20 rounded-full"></span> {stall.category}
                                            </p>
                                            
                                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white/10 mb-6">
                                                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Revenue Today</div>
                                                <div className="font-black text-white text-lg tracking-tight">Rp {stall.revenueToday.toLocaleString()}</div>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <button className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-black text-white/60 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">Detail</button>
                                                <button 
                                                  onClick={() => console.log(`Mencetak laporan untuk ${stall.name}...`)}
                                                  className="flex-1 bg-white text-slate-900 py-3 rounded-xl text-xs font-black hover:bg-white/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-white/5"
                                                >
                                                    <Printer size={16} /> Laporan
                                                </button>
                                            </div>
                                          </div>
                                      </GlassCard>
                                  ))}
                              </div>
                          </div>

                          {/* Quick Actions & Insights */}
                          <div className="space-y-6">
                              <GlassCard className="bg-slate-900/40 border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                                  <div className="absolute -top-10 -right-10 p-6 opacity-5 rotate-12 scale-150 text-white"><TrendingUp size={200} /></div>
                                  
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                        <TrendingUp size={20} />
                                      </div>
                                      <h3 className="text-xl font-black text-white tracking-tight">Performa Pasar</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-end">
                                              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Total Penjualan</span>
                                              <span className="font-black text-white text-xl">Rp {(stalls.reduce((acc, s) => acc + s.revenueToday, 0) / 1000000).toFixed(1)}M</span>
                                          </div>
                                          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                                              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[75%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                          </div>
                                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                              <span className="text-white/20">Target Bulanan</span>
                                              <span className="text-blue-400">75% Tercapai</span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-white/20 font-black uppercase mb-1">Avg Basket</p>
                                            <p className="text-lg font-black text-white">Rp 45k</p>
                                          </div>
                                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-white/20 font-black uppercase mb-1">Growth</p>
                                            <p className="text-lg font-black text-emerald-400">+12%</p>
                                          </div>
                                        </div>
                                    </div>

                                    <button className="w-full mt-10 bg-white/10 hover:bg-white/20 py-4 rounded-2xl text-xs font-black text-white transition-all border border-white/10 uppercase tracking-widest active:scale-95">
                                      Unduh Laporan Lengkap
                                    </button>
                                  </div>
                              </GlassCard>

                              <GlassCard className="p-6 border-white/10">
                                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Aktivitas Terbaru</h4>
                                <div className="space-y-4">
                                  {transactions.slice(0, 5).map((act) => (
                                    <div key={act.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${act.type === 'TOPUP' ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30' : 'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30'}`}>
                                        {act.type === 'TOPUP' ? <Wallet size={16} /> : <ShoppingBag size={16} />}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{act.type === 'TOPUP' ? 'Top Up Berhasil' : 'Pembayaran POS'}</p>
                                        <p className="text-[10px] text-white/30">{act.description} • Rp {act.amount.toLocaleString()}</p>
                                      </div>
                                      <span className="text-[10px] text-white/20 font-medium">
                                        {act.date?.toDate ? act.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                      </span>
                                    </div>
                                  ))}
                                  {transactions.length === 0 && (
                                    <p className="text-xs text-white/20 italic text-center py-4">Belum ada aktivitas hari ini</p>
                                  )}
                                </div>
                              </GlassCard>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </div>

      {/* PAYMENT METHOD & QR MODAL */}
      <AnimatePresence>
        {showPaymentModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="glass-panel w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative border-white/20"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <button onClick={handleClosePayment} className="absolute top-8 right-8 text-white/40 hover:text-white z-20 p-2.5 hover:bg-white/10 rounded-full transition-all active:scale-90">
                        <X size={24} />
                    </button>
                    
                    {/* STEP 1: SELECT PAYMENT METHOD */}
                    {paymentStep === 'SELECT' && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-8 relative z-10"
                        >
                            <h3 className="text-2xl font-black text-white mb-8 text-center tracking-tight">Metode Pembayaran</h3>
                            
                            <div className="mb-8 bg-white/5 backdrop-blur-md p-6 rounded-3xl text-center border border-white/10 shadow-inner">
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mb-2">Total Tagihan</p>
                                <div className="text-4xl font-black text-white tracking-tighter">Rp {parseInt(amount).toLocaleString()}</div>
                            </div>

                            <div className="space-y-4">
                                {/* 1. WargaPay */}
                                <button 
                                  onClick={() => handleProcessPayment('WARGAPAY')}
                                  className="w-full p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 flex items-center gap-5 group text-left"
                                >
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                                        <Wallet size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">WargaPay</span>
                                        <span className="text-xs text-white/40 font-bold">Saldo: Rp {user.balance.toLocaleString()}</span>
                                    </div>
                                </button>

                                {/* 2. Trash Points */}
                                <button 
                                  onClick={() => canPayWithPoints && handleProcessPayment('POINTS')}
                                  disabled={!canPayWithPoints}
                                  className={`w-full p-5 rounded-2xl border flex items-center gap-5 group text-left transition-all duration-300 ${
                                      canPayWithPoints 
                                      ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 cursor-pointer' 
                                      : 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'
                                  }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${canPayWithPoints ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10' : 'bg-white/5 text-white/20'}`}>
                                        <Leaf size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <span className={`block font-black text-lg tracking-tight transition-colors ${canPayWithPoints ? 'text-white group-hover:text-emerald-400' : 'text-white/20'}`}>Poin Sampah</span>
                                        <span className="text-xs text-white/40 font-bold flex items-center gap-1">
                                            <Coins size={12} /> {user.points} Poin = Rp {pointsValue.toLocaleString()}
                                        </span>
                                        {!canPayWithPoints && <span className="text-[10px] text-red-400 font-black uppercase tracking-widest block mt-1">Saldo Tidak Cukup</span>}
                                    </div>
                                </button>

                                {/* 3. QRIS / Cash */}
                                <button 
                                  onClick={() => handleProcessPayment('QRIS')}
                                  className="w-full p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 flex items-center gap-5 group text-left"
                                >
                                    <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
                                        <QrCode size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-black text-white text-lg tracking-tight group-hover:text-orange-400 transition-colors">QRIS / Tunai</span>
                                        <span className="text-xs text-white/40 font-bold">Scan atau bayar manual</span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PROCESSING */}
                    {paymentStep === 'PROCESSING' && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-16 text-center flex flex-col items-center justify-center h-[500px] relative z-10"
                        >
                            <div className="relative">
                              <div className="w-24 h-24 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin mb-8 shadow-2xl shadow-cyan-500/20"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <RefreshCw size={32} className="text-cyan-400 animate-pulse" />
                              </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Memproses...</h3>
                            <p className="text-sm text-white/40 font-medium">
                                {selectedMethod === 'POINTS' ? 'Menukarkan Poin Sampah...' : 'Menghubungkan Gateway...'}
                            </p>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {paymentStep === 'SUCCESS' && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-10 flex flex-col items-center text-center relative z-10"
                        >
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-8 shadow-2xl shadow-emerald-500/20 border border-emerald-500/30">
                                <CheckCircle size={48} />
                            </div>
                            
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Berhasil!</h3>
                            <p className="text-white/40 text-sm mb-8 font-medium">
                                {selectedMethod === 'POINTS' 
                                    ? 'Terima kasih telah berkontribusi pada lingkungan!' 
                                    : `Pembayaran ke ${selectedStall?.name} sukses`}
                            </p>

                            <div className="bg-white/5 backdrop-blur-md w-full p-6 rounded-3xl border border-white/10 mb-8 shadow-inner">
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">Total</span>
                                    <span className="font-black text-white text-xl tracking-tight">Rp {parseInt(amount).toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-white/10 w-full mb-4"></div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">Metode</span>
                                    <span className="font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                                        {selectedMethod === 'POINTS' && <Leaf size={14} />}
                                        {selectedMethod === 'POINTS' ? 'Poin Sampah' : selectedMethod === 'WARGAPAY' ? 'WargaPay' : 'QRIS'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
                                <button onClick={handleClosePayment} className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black hover:bg-white/90 transition-all active:scale-95 shadow-xl uppercase tracking-widest text-xs">
                                    Selesai
                                </button>
                                <button className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                                    <Printer size={24} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MarketView;