
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Wrench, Truck, CreditCard, Search, Star, CheckCircle, X, User, MapPin, Package, Bike, DollarSign, Zap, Droplet, Smartphone, Phone, AlertCircle, Info, Wallet, Loader2, Building2, Calendar, History, TrendingUp, QrCode, Plus, Minus, ArrowRight, ExternalLink, ShieldCheck, Map as MapIcon, Navigation, Clock, Check } from 'lucide-react';
import { MARKETPLACE_ITEMS, SERVICE_PROVIDERS, MOCK_USER, BERDAYA_ORDERS, BERDAYA_IMPACT } from '../constants';
import { CitizenProfile, MarketplaceItem, ServiceProvider, BerdayaOrder, BerdayaImpact, CourierStatus } from '../types';
import BarcodeGenerator from './BarcodeGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, collection, onSnapshot, query, addDoc, handleFirestoreError, OperationType, orderBy, where, setDoc, doc, updateDoc } from '../firebase';
import { subscribeToMarketplaceItems } from '../src/services/marketplaceService';
import { subscribeToServiceProviders } from '../src/services/serviceProviderService';
import { subscribeToOrders } from '../src/services/orderService';

interface BerdayaViewProps {
  user?: CitizenProfile;
  onOpenAnjelo: (service?: any, note?: string) => void;
}

interface OrderModalState {
    isOpen: boolean;
    step: 'REVIEW' | 'PAYMENT_METHOD' | 'LIVIN_CONNECT' | 'SUCCESS';
    item: MarketplaceItem | ServiceProvider | null;
    type: 'PRODUCT' | 'SERVICE';
    quantity: number;
}

const BerdayaView: React.FC<BerdayaViewProps> = ({ user = MOCK_USER, onOpenAnjelo }) => {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'SERVICES' | 'ANJELO' | 'PPOB' | 'ORDERS' | 'IMPACT' | 'GENERATOR' | 'SELLER' | 'COURIER'>('MARKET');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time data from Firestore
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [orders, setOrders] = useState<BerdayaOrder[]>([]);
  const [impact] = useState<BerdayaImpact>(BERDAYA_IMPACT);
  const [loading, setLoading] = useState(true);
  const [courierStatus, setCourierStatus] = useState<CourierStatus | null>(null);

  // Seller specific state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'PRODUCT' | 'SERVICE'>('PRODUCT');
  const [newItem, setNewItem] = useState<Partial<MarketplaceItem | ServiceProvider>>({
    name: '',
    price: 0,
    category: 'KULINER',
    description: '',
    imageColor: 'bg-indigo-500'
  });

  useEffect(() => {
    setLoading(true);
    
    // Listen to Marketplace Items
    const unsubscribeItems = subscribeToMarketplaceItems(
      (itemsData) => {
        setItems(itemsData.length > 0 ? itemsData : MARKETPLACE_ITEMS);
      },
      (error) => {
        console.error('Error fetching marketplace items:', error);
      }
    );

    // Listen to Service Providers
    const unsubscribeProviders = subscribeToServiceProviders(
      (providersData) => {
        setProviders(providersData.length > 0 ? providersData : SERVICE_PROVIDERS);
      },
      (error) => {
        console.error('Error fetching service providers:', error);
      }
    );


    // Listen to Orders
    const unsubscribeOrders = subscribeToOrders(
      (ordersData) => {
        setOrders(ordersData.length > 0 ? ordersData : BERDAYA_ORDERS);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    // Listen to Courier Status
    const courierDoc = doc(db, 'courier_status', user.id);
    const unsubscribeCourier = onSnapshot(courierDoc, (snapshot) => {
      if (snapshot.exists()) {
        setCourierStatus(snapshot.data() as CourierStatus);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'courier_status'));

    return () => {
      unsubscribeItems();
      unsubscribeProviders();
      unsubscribeOrders();
      unsubscribeCourier();
    };
  }, [user.id]);

  // --- MARKETPLACE STATE ---
  const [orderModal, setOrderModal] = useState<OrderModalState>({ 
    isOpen: false, 
    step: 'REVIEW', 
    item: null, 
    type: 'PRODUCT',
    quantity: 1
  });

  const filteredProducts = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = providers.filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Seller specific data
  const myProducts = items.filter(item => item.sellerId === user.id);
  const myServices = providers.filter(service => service.sellerId === user.id);
  const ordersReceived = orders.filter(order => order.sellerId === user.id);
  const ordersToDeliver = orders.filter(order => order.status === 'PAID' && order.type === 'PRODUCT'); // Available for couriers
  const myDeliveries = orders.filter(order => order.deliveryId === user.id);
  const totalSales = ordersReceived.reduce((sum, order) => sum + order.total, 0);

  // Dynamic Impact Stats
  const dynamicImpact = {
    ...impact,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0) + impact.totalRevenue, // Base + Real-time
    msmesSupported: new Set([...items.map(i => i.sellerId), ...providers.map(p => p.sellerId)]).size || impact.msmesSupported,
    jobsCreated: Math.floor(orders.length / 5) + impact.jobsCreated // 1 job per 5 orders
  };

  const navItems = [
      { id: 'MARKET', label: 'Marketplace', shortLabel: 'Belanja', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100', activeBg: 'bg-orange-600' },
      { id: 'SERVICES', label: 'Jasa & Tukang', shortLabel: 'Jasa', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100', activeBg: 'bg-blue-600' },
      { id: 'ORDERS', label: 'Pesanan Saya', shortLabel: 'Pesanan', icon: History, color: 'text-indigo-600', bg: 'bg-indigo-100', activeBg: 'bg-indigo-600' },
      { id: 'SELLER', label: 'Dashboard Seller', shortLabel: 'Seller', icon: Building2, color: 'text-rose-600', bg: 'bg-rose-100', activeBg: 'bg-rose-600' },
      { id: 'COURIER', label: 'Dashboard Kurir', shortLabel: 'Kurir', icon: Truck, color: 'text-green-600', bg: 'bg-green-100', activeBg: 'bg-green-600' },
      { id: 'IMPACT', label: 'Dampak Sosial', shortLabel: 'Dampak', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600' },
      { id: 'GENERATOR', label: 'Generator Kode', shortLabel: 'Kode', icon: QrCode, color: 'text-slate-600', bg: 'bg-slate-100', activeBg: 'bg-slate-800' },
      { id: 'ANJELO', label: 'Anjelo Logistik', shortLabel: 'Anjelo', icon: Truck, color: 'text-green-600', bg: 'bg-green-100', activeBg: 'bg-green-600' },
      { id: 'PPOB', label: 'Bayar Tagihan', shortLabel: 'Tagihan', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100', activeBg: 'bg-purple-600' },
  ];

  const handleInitiateOrder = (item: MarketplaceItem | ServiceProvider, type: 'PRODUCT' | 'SERVICE') => {
      setOrderModal({ isOpen: true, step: 'REVIEW', item, type, quantity: 1 });
  };

  const handleConfirmPayment = async () => {
      if (!orderModal.item) return;
      
      setOrderModal(prev => ({ ...prev, step: 'LIVIN_CONNECT' }));
      
      // Simulate API Handshake with Livin Merchant
      setTimeout(async () => {
          if (orderModal.item) {
            const newOrder: Omit<BerdayaOrder, 'id'> = {
                type: orderModal.type,
                itemId: orderModal.item.id,
                itemName: orderModal.item.name,
                price: orderModal.item.price,
                quantity: orderModal.quantity,
                total: orderModal.item.price * orderModal.quantity,
                status: 'PAID',
                date: new Date().toISOString(),
                sellerId: orderModal.item.sellerId || (orderModal.type === 'PRODUCT' ? (orderModal.item as MarketplaceItem).seller : (orderModal.item as ServiceProvider).id || 'system'),
                sellerName: orderModal.type === 'PRODUCT' ? (orderModal.item as MarketplaceItem).seller : (orderModal.item as ServiceProvider).name,
                buyerId: user.id,
                buyerName: user.name,
                paymentMethod: 'WARGAPAY'
            };
            
            try {
              await addDoc(collection(db, 'berdaya_orders'), newOrder);
              setOrderModal(prev => ({ ...prev, step: 'SUCCESS' }));
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, 'berdaya_orders');
            }
          }
      }, 2500);
  };

  const handleAddListing = async () => {
    try {
      const collectionName = newItemType === 'PRODUCT' ? 'marketplace_items' : 'service_providers';
      const data = {
        ...newItem,
        seller: user.name,
        sellerId: user.id,
        providerId: user.id, // For service providers
        isOpen: true,
        rating: 5.0,
        minOrder: 1,
        unit: newItemType === 'SERVICE' ? 'jam' : 'pcs'
      };
      
      await addDoc(collection(db, collectionName), data);
      setShowAddModal(false);
      setNewItem({
        name: '',
        price: 0,
        category: 'KULINER',
        description: '',
        imageColor: 'bg-indigo-500'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, newItemType === 'PRODUCT' ? 'marketplace_items' : 'service_providers');
    }
  };

  const handleToggleCourierStatus = async () => {
    const newStatus = courierStatus?.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await setDoc(doc(db, 'courier_status', user.id), {
        uid: user.id,
        name: user.name,
        status: newStatus,
        vehicleType: 'Motor',
        plateNumber: 'BE 1234 YO',
        rating: 4.9,
        totalDeliveries: courierStatus?.totalDeliveries || 0,
        earningsToday: courierStatus?.earningsToday || 0,
        location: { lat: -5.115, lng: 105.312 } // Mock location
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'courier_status');
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'berdaya_orders', orderId), {
        status: 'SHIPPING',
        deliveryId: user.id,
        trackingNumber: `ANJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'berdaya_orders');
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'berdaya_orders', orderId), {
        status: 'COMPLETED'
      });
      
      // Update courier earnings
      const order = orders.find(o => o.id === orderId);
      if (order && courierStatus) {
        await updateDoc(doc(db, 'courier_status', user.id), {
          earningsToday: (courierStatus.earningsToday || 0) + 5000, // Flat fee
          totalDeliveries: (courierStatus.totalDeliveries || 0) + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'berdaya_orders');
    }
  };

  const closeOrderModal = () => {
      setOrderModal({ isOpen: false, step: 'REVIEW', item: null, type: 'PRODUCT', quantity: 1 });
  };

  return (
    <div className="space-y-6 relative pb-20 md:pb-0">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <ShoppingBag size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Warga Berdaya</h2>
            <p className="text-orange-100 text-sm md:text-base">Pusat ekonomi, niaga, dan layanan warga Yosomulyo.</p>
          </div>
      </div>

      {/* MOBILE NAVIGATION: ICON GRID */}
      <div className="md:hidden grid grid-cols-4 gap-3 px-1">
          {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                  <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className="flex flex-col items-center gap-2 group transition-all duration-300"
                  >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${isActive ? `${item.activeBg} text-white shadow-lg scale-105` : `bg-white border border-slate-100 ${item.color}`}`}>
                          <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-white font-extrabold' : 'text-white'}`}>
                          {item.shortLabel}
                      </span>
                  </button>
              );
          })}
      </div>

      {/* DESKTOP NAVIGATION: TABS */}
      <div className="hidden md:flex flex-wrap gap-3 border-b border-slate-200 pb-4">
          {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition ${activeTab === item.id ? `${item.activeBg} text-white shadow-md` : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                  <item.icon size={20} /> {item.label}
              </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px] p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* === TAB: MARKETPLACE === */}
          {activeTab === 'MARKET' && (
              <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h3 className="text-xl font-bold text-slate-800">Produk Lokal Warga</h3>
                      <div className="relative w-full md:w-auto">
                          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                          <input 
                            type="text" 
                            placeholder="Cari produk..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {filteredProducts.map((item) => (
                          <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition group cursor-pointer flex flex-col relative">
                              {/* Livin Merchant Badge */}
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md border border-slate-100 shadow-sm z-10 flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                  <span className="text-[8px] font-bold text-blue-900 tracking-tight">Livin' Verified</span>
                              </div>

                              <div className={`aspect-square md:h-40 ${item.imageColor} flex items-center justify-center group-hover:scale-105 transition duration-500 relative`}>
                                  {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                      <>
                                          <ShoppingBag size={32} className="text-white opacity-50 md:hidden" />
                                          <ShoppingBag size={48} className="text-white opacity-50 hidden md:block" />
                                      </>
                                  )}
                              </div>
                              <div className="p-3 md:p-4 flex-1 flex flex-col">
                                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{item.category}</div>
                                  <h4 className="font-bold text-slate-800 text-sm md:text-lg mb-1 leading-tight">{item.name}</h4>
                                  <div className="mt-auto pt-3">
                                      <div className="flex justify-between items-end mb-3">
                                          <div>
                                              <p className="text-[10px] text-slate-400">Penjual</p>
                                              <p className="text-xs font-medium text-slate-700 truncate max-w-[80px]">{item.seller}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="font-bold text-orange-600 text-sm md:text-lg">Rp {item.price.toLocaleString()}</p>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => handleInitiateOrder(item, 'PRODUCT')}
                                        className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-slate-800 transition active:scale-95 shadow-sm"
                                      >
                                          Pesan Sekarang
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* === TAB: SERVICES === */}
          {activeTab === 'SERVICES' && (
              <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h3 className="text-xl font-bold text-slate-800">Direktori Jasa Warga</h3>
                      <div className="relative w-full md:w-auto">
                          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                          <input 
                            type="text" 
                            placeholder="Cari jasa (bengkel, tukang)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredServices.map((service) => (
                          <div key={service.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col group relative">
                              {/* Verified Badge */}
                              <div className="absolute top-0 right-0 bg-blue-50 px-2 py-1 rounded-bl-xl border-l border-b border-blue-100 text-[10px] font-bold text-blue-700 flex items-center gap-1">
                                  <CheckCircle size={10} /> Verified Pro
                              </div>

                              <div className="p-4 md:p-5 flex-1 flex flex-col">
                                  {/* Header */}
                                  <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-3 rounded-full ${service.isOpen ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                              <Wrench size={20} />
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 line-clamp-1">{service.name}</h4>
                                              <div className="flex items-center gap-2">
                                                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{service.category}</span>
                                                  <div className="flex items-center text-yellow-500 text-xs">
                                                      <Star size={10} fill="currentColor" />
                                                      <span className="ml-0.5 font-bold">{service.rating}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      {service.isOpen ? (
                                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">BUKA</span>
                                      ) : (
                                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full">TUTUP</span>
                                      )}
                                  </div>
                                  
                                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                                  
                                  {/* Pricing & Terms Section */}
                                  <div className="mt-auto bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                                      <div className="flex justify-between items-end">
                                          <div>
                                              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-0.5">Estimasi Biaya</p>
                                              <p className="font-black text-blue-600 text-lg">
                                                  Rp {service.price.toLocaleString()} 
                                                  <span className="text-xs text-slate-500 font-normal ml-1">/ {service.unit}</span>
                                              </p>
                                          </div>
                                          <div className="text-right">
                                              <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-medium">
                                                  Min. Order: {service.minOrder} {service.unit}
                                              </span>
                                          </div>
                                      </div>
                                      
                                      {service.exceptions && (
                                          <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                                              <AlertCircle size={12} className="text-orange-500 mt-0.5 shrink-0" />
                                              <p className="text-[10px] text-slate-500 italic leading-tight">{service.exceptions}</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              
                              {/* Footer Action */}
                              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                  <button 
                                    onClick={() => handleInitiateOrder(service, 'SERVICE')}
                                    className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
                                  >
                                      <Phone size={16} /> Pesan Jasa
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* === TAB: ORDERS === */}
          {activeTab === 'ORDERS' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800">Riwayat Pesanan</h3>
                      <div className="flex gap-2">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                              {orders.length} Transaksi
                          </span>
                      </div>
                  </div>

                  <div className="space-y-4">
                      {orders.map((order) => (
                          <div key={order.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition">
                              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.type === 'PRODUCT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                          {order.type === 'PRODUCT' ? <ShoppingBag size={20} /> : <Wrench size={20} />}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2 mb-0.5">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{order.id}</span>
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                  order.status === 'SHIPPING' ? 'bg-blue-100 text-blue-700' :
                                                  'bg-yellow-100 text-yellow-700'
                                              }`}>
                                                  {order.status}
                                              </span>
                                          </div>
                                          <h4 className="font-bold text-slate-800">{order.itemName}</h4>
                                          <p className="text-xs text-slate-500">{order.sellerName} • {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                      </div>
                                  </div>
                                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                      <div className="text-right">
                                          <p className="text-xs text-slate-400">Total Pembayaran</p>
                                          <p className="font-black text-slate-900">Rp {order.total.toLocaleString()}</p>
                                      </div>
                                      <button className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                                          Detail
                                      </button>
                                  </div>
                              </div>
                              {order.trackingNumber && (
                                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                          <Truck size={12} className="text-green-600" />
                                          Lacak Anjelo: <span className="text-slate-800">{order.trackingNumber}</span>
                                      </div>
                                      <button 
                                        onClick={() => onOpenAnjelo(null, `Lacak pesanan ${order.id}`)}
                                        className="text-[10px] font-bold text-green-600 hover:underline"
                                      >
                                          Cek Posisi Kurir
                                      </button>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* === TAB: IMPACT === */}
          {activeTab === 'IMPACT' && (
              <div className="space-y-8">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                      <h3 className="text-2xl font-black text-slate-800">Dampak Ekonomi Warga</h3>
                      <p className="text-slate-500 text-sm">Transparansi kontribusi ekonomi dari setiap transaksi di ekosistem Warga Berdaya.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                  <DollarSign size={24} />
                              </div>
                              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">Total Revenue</span>
                          </div>
                          <h4 className="text-3xl font-black mb-1">Rp {(dynamicImpact.totalRevenue / 1000000).toFixed(1)} JT</h4>
                          <p className="text-emerald-100 text-xs font-medium">Perputaran ekonomi lokal tahun ini</p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                  <User size={24} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lapangan Kerja</span>
                          </div>
                          <h4 className="text-3xl font-black text-slate-800 mb-1">{dynamicImpact.jobsCreated}</h4>
                          <p className="text-slate-500 text-xs font-medium mt-2">Warga yang berdaya sebagai kurir & mitra</p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                                  <Building2 size={24} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UMKM Terbantu</span>
                          </div>
                          <h4 className="text-3xl font-black text-slate-800 mb-1">{dynamicImpact.msmesSupported}</h4>
                          <p className="text-slate-500 text-xs font-medium mt-2">Unit usaha lokal yang terdigitalisasi</p>
                      </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                          <TrendingUp size={240} />
                      </div>
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4">
                              <h4 className="text-xl font-bold flex items-center gap-2">
                                  <ShieldCheck className="text-emerald-400" /> Kontribusi Sosial (Dana Desa)
                              </h4>
                              <p className="text-slate-400 text-sm leading-relaxed">
                                  Setiap transaksi menyisihkan 0.5% untuk dana sosial warga. Dana ini digunakan untuk perbaikan fasilitas umum dan bantuan warga prasejahtera.
                              </p>
                              <div className="text-4xl font-black text-emerald-400">
                                  Rp {dynamicImpact.socialContribution.toLocaleString()}
                              </div>
                              <button className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition group">
                                  Lihat Laporan Penggunaan Dana <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                              </button>
                          </div>
                          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                              <h5 className="text-sm font-bold mb-4 text-emerald-100 uppercase tracking-widest">Jejak Karbon Tereduksi</h5>
                              <div className="flex items-end gap-3 mb-2">
                                  <span className="text-5xl font-black text-white">{dynamicImpact.carbonReduced}</span>
                                  <span className="text-xl font-bold text-emerald-400 mb-1">KG CO2</span>
                              </div>
                              <p className="text-xs text-slate-400">Melalui logistik Anjelo yang efisien dan pengurangan kemasan plastik sekali pakai.</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* === TAB: GENERATOR === */}
          {activeTab === 'GENERATOR' && (
              <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto mb-8">
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Sistem Labeling Mandiri</h3>
                      <p className="text-slate-500 text-sm">Bantu UMKM warga memiliki standar profesional dengan label barcode & QR Code terintegrasi.</p>
                  </div>
                  <BarcodeGenerator onSave={(data) => console.log('Saved barcode:', data)} />
              </div>
          )}

          {/* === TAB: ANJELO === */}
          {activeTab === 'ANJELO' && (
              <div className="h-full flex flex-col items-center justify-center py-6">
                  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6 order-2 md:order-1">
                          <div>
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Warga-Logistik</span>
                              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Anjelo</h2>
                              <h3 className="text-lg md:text-xl text-slate-500">Antar Jemput Lokal & Ojek Desa</h3>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                              Layanan logistik dari warga untuk warga. Dukung pemuda lokal dengan menggunakan jasa kurir resmi desa. Tarif flat untuk area dalam desa.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center md:text-left">
                                  <div className="text-2xl font-bold text-slate-800 mb-1">12</div>
                                  <div className="text-xs text-slate-500">Kurir Siaga</div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center md:text-left">
                                  <div className="text-2xl font-bold text-slate-800 mb-1">3 min</div>
                                  <div className="text-xs text-slate-500">Avg. Pickup Time</div>
                              </div>
                          </div>

                          <button 
                            onClick={() => onOpenAnjelo()}
                            className="w-full md:w-auto px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 hover:bg-green-700 transition flex items-center justify-center gap-3 active:scale-95"
                          >
                              <Truck size={24} /> Pesan Sekarang
                          </button>
                      </div>
                      
                      {/* Visual / Map Placeholder */}
                      <div className="order-1 md:order-2 bg-slate-100 rounded-3xl aspect-square relative overflow-hidden border-4 border-white shadow-2xl mx-auto w-3/4 md:w-full">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-32 h-32 bg-green-100 rounded-full animate-ping absolute"></div>
                              <div className="w-24 h-24 bg-white rounded-full shadow-lg z-10 flex items-center justify-center text-green-600">
                                  <Bike size={48} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* === TAB: PPOB === */}
          {activeTab === 'PPOB' && (
              <div className="max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 text-center md:text-left">Layanan Pembayaran Digital</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <button className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col items-center gap-3 md:gap-4 group active:bg-slate-50">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                              <Zap size={24} className="md:w-8 md:h-8" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm md:text-base">Token Listrik</span>
                      </button>
                      <button className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col items-center gap-3 md:gap-4 group active:bg-slate-50">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                              <Droplet size={24} className="md:w-8 md:h-8" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm md:text-base">PDAM / Air</span>
                      </button>
                      <button className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col items-center gap-3 md:gap-4 group active:bg-slate-50">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                              <Smartphone size={24} className="md:w-8 md:h-8" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm md:text-base">Pulsa & Data</span>
                      </button>
                      <button className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col items-center gap-3 md:gap-4 group active:bg-slate-50">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                              <CreditCard size={24} className="md:w-8 md:h-8" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm md:text-base">BPJS</span>
                      </button>
                  </div>
                  
                  <div className="mt-8 md:mt-12 bg-slate-50 rounded-2xl p-6 md:p-8 text-center border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-4">Riwayat Pembayaran Terakhir</h4>
                      <div className="space-y-3 max-w-md mx-auto">
                          <div className="flex justify-between text-sm p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                              <div className="flex items-center gap-2"><Zap size={14} className="text-yellow-500"/> PLN Token 50k</div>
                              <span className="font-bold text-slate-800">Rp 51.500</span>
                          </div>
                          <div className="flex justify-between text-sm p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                              <div className="flex items-center gap-2"><Smartphone size={14} className="text-red-500"/> Telkomsel Data 10GB</div>
                              <span className="font-bold text-slate-800">Rp 45.000</span>
                          </div>
                      </div>
                  </div>
              </div>
          )}          {/* === TAB: SELLER DASHBOARD === */}
          {activeTab === 'SELLER' && (
              <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                          <h3 className="text-2xl font-black text-slate-800">Dashboard Niaga & Jasa</h3>
                          <p className="text-slate-500 text-sm">Kelola produk, layanan jasa, dan pantau pendapatan Anda.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setNewItemType('PRODUCT'); setShowAddModal(true); }}
                          className="bg-orange-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition active:scale-95"
                        >
                            <Plus size={18} /> Produk Baru
                        </button>
                        <button 
                          onClick={() => { setNewItemType('SERVICE'); setShowAddModal(true); }}
                          className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
                        >
                            <Plus size={18} /> Jasa Baru
                        </button>
                      </div>
                  </div>

                  {/* Seller Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendapatan</p>
                          <h4 className="text-2xl font-black text-slate-800">Rp {totalSales.toLocaleString()}</h4>
                          <div className="mt-1 flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                              <TrendingUp size={12} /> +12%
                          </div>
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pesanan Baru</p>
                          <h4 className="text-2xl font-black text-slate-800">{ordersReceived.filter(o => o.status === 'PAID').length}</h4>
                          <p className="text-slate-500 text-[10px] font-medium mt-1">Perlu diproses</p>
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Produk Aktif</p>
                          <h4 className="text-2xl font-black text-slate-800">{myProducts.length}</h4>
                          <p className="text-slate-500 text-[10px] font-medium mt-1">Stok tersedia</p>
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jasa Aktif</p>
                          <h4 className="text-2xl font-black text-slate-800">{myServices.length}</h4>
                          <p className="text-slate-500 text-[10px] font-medium mt-1">Siap melayani</p>
                      </div>
                  </div>

                  {/* Perspective Switcher */}
                  <div className="flex gap-4 border-b border-slate-100 pb-2">
                      <button className="text-sm font-bold text-slate-800 border-b-2 border-rose-600 pb-2">Semua Aktivitas</button>
                      <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-2 transition">Manajemen Produk</button>
                      <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-2 transition">Manajemen Jasa</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Orders Management */}
                      <div className="lg:col-span-2 space-y-6">
                          <div className="flex justify-between items-center">
                              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                  <Package size={20} className="text-rose-600" /> Pesanan Masuk
                              </h4>
                              <button className="text-xs font-bold text-rose-600 hover:underline">Lihat Semua</button>
                          </div>
                          
                          {ordersReceived.length === 0 ? (
                              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                      <History size={32} />
                                  </div>
                                  <p className="text-slate-500 font-medium">Belum ada pesanan masuk.</p>
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  {ordersReceived.map(order => (
                                      <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition">
                                          <div className="flex items-center gap-4">
                                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.type === 'PRODUCT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                  {order.type === 'PRODUCT' ? <ShoppingBag size={20} /> : <Wrench size={20} />}
                                              </div>
                                              <div>
                                                  <div className="flex items-center gap-2 mb-0.5">
                                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{order.id}</span>
                                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                          order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                          'bg-yellow-100 text-yellow-700'
                                                      }`}>
                                                          {order.status}
                                                      </span>
                                                  </div>
                                                  <h5 className="font-bold text-slate-800">{order.itemName}</h5>
                                                  <p className="text-xs text-slate-500">Pembeli: {order.buyerName} • {new Date(order.date).toLocaleDateString('id-ID')}</p>
                                              </div>
                                          </div>
                                          <div className="text-right flex flex-col items-end gap-2">
                                              <p className="font-black text-slate-900">Rp {order.total.toLocaleString()}</p>
                                              {order.status === 'PAID' && (
                                                <button 
                                                  onClick={() => updateDoc(doc(db, 'berdaya_orders', order.id), { status: 'PROCESSING' })}
                                                  className="bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-rose-700 transition"
                                                >
                                                  Proses Pesanan
                                                </button>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Right: Listings Summary */}
                      <div className="space-y-6">
                          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Star size={20} className="text-yellow-500" /> Performa Toko
                          </h4>
                          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
                              <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-400">Rating Toko</span>
                                  <div className="flex items-center text-yellow-400 font-bold">
                                      <Star size={14} fill="currentColor" /> 4.9
                                  </div>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-400">Penyelesaian Pesanan</span>
                                  <span className="text-xs font-bold">98%</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-400 h-full w-[98%]"></div>
                              </div>
                              <div className="pt-4 border-t border-white/10">
                                  <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Tips Berdaya</p>
                                  <p className="text-xs text-slate-300 italic">"Gunakan foto produk yang terang untuk meningkatkan minat pembeli hingga 40%."</p>
                              </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                              <h5 className="font-bold text-slate-800 text-sm">Status Legalitas</h5>
                              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                  <ShieldCheck className="text-emerald-600" size={24} />
                                  <div>
                                      <p className="text-xs font-bold text-emerald-900">NIB Terverifikasi</p>
                                      <p className="text-[10px] text-emerald-700">Usaha Anda diakui secara hukum.</p>
                                  </div>
                              </div>
                              <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition">Lihat Sertifikat</button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* === TAB: COURIER DASHBOARD === */}
          {activeTab === 'COURIER' && (
              <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                          <h3 className="text-2xl font-black text-slate-800">Dashboard Kurir Anjelo</h3>
                          <p className="text-slate-500 text-sm">Kelola pengiriman, pantau rute, dan cek pendapatan harian.</p>
                      </div>
                      <button 
                        onClick={handleToggleCourierStatus}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition active:scale-95 ${
                          courierStatus?.status === 'ONLINE' 
                            ? 'bg-red-100 text-red-600 shadow-red-100/20 hover:bg-red-200' 
                            : 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-700'
                        }`}
                      >
                          {courierStatus?.status === 'ONLINE' ? <X size={20} /> : <Zap size={20} />}
                          {courierStatus?.status === 'ONLINE' ? 'Matikan Status' : 'Mulai Narik'}
                      </button>
                  </div>

                  {/* Courier Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendapatan Hari Ini</p>
                          <h4 className="text-3xl font-black text-slate-800">Rp {(courierStatus?.earningsToday || 0).toLocaleString()}</h4>
                          <p className="text-slate-500 text-xs font-medium mt-2">Target harian: Rp 100.000</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pengantaran</p>
                          <h4 className="text-3xl font-black text-slate-800">{courierStatus?.totalDeliveries || 0}</h4>
                          <p className="text-slate-500 text-xs font-medium mt-2">Peringkat: Kurir Teladan</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rating Kurir</p>
                          <h4 className="text-3xl font-black text-slate-800">{courierStatus?.rating || 5.0}</h4>
                          <div className="flex items-center text-yellow-500 mt-1">
                              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= (courierStatus?.rating || 5) ? "currentColor" : "none"} />)}
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Active Deliveries */}
                      <div className="lg:col-span-2 space-y-6">
                          <div className="flex justify-between items-center">
                              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                  <Navigation size={20} className="text-green-600" /> Pengiriman Aktif
                              </h4>
                              <span className="text-xs font-bold text-slate-400">{myDeliveries.filter(d => d.status === 'SHIPPING').length} Aktif</span>
                          </div>

                          {myDeliveries.filter(d => d.status === 'SHIPPING').length === 0 ? (
                              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                      <Truck size={32} />
                                  </div>
                                  <p className="text-slate-500 font-medium">Belum ada pengiriman aktif.</p>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {myDeliveries.filter(d => d.status === 'SHIPPING').map(order => (
                                      <div key={order.id} className="bg-white border-2 border-green-500 rounded-3xl p-6 shadow-lg shadow-green-500/10">
                                          <div className="flex justify-between items-start mb-6">
                                              <div className="flex items-center gap-4">
                                                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                                      <Package size={28} />
                                                  </div>
                                                  <div>
                                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order #{order.id}</div>
                                                      <h5 className="text-xl font-bold text-slate-800">{order.itemName}</h5>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Sedang Diantar</span>
                                              </div>
                                          </div>

                                          <div className="space-y-4 mb-6">
                                              <div className="flex items-start gap-3">
                                                  <div className="mt-1 w-2 h-2 bg-slate-300 rounded-full"></div>
                                                  <div>
                                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Titik Jemput (Seller)</p>
                                                      <p className="text-sm font-bold text-slate-700">{order.sellerName}</p>
                                                  </div>
                                              </div>
                                              <div className="ml-1 w-0.5 h-4 bg-slate-200"></div>
                                              <div className="flex items-start gap-3">
                                                  <div className="mt-1 w-2 h-2 bg-green-500 rounded-full"></div>
                                                  <div>
                                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Titik Antar (Buyer)</p>
                                                      <p className="text-sm font-bold text-slate-700">{order.buyerName}</p>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex gap-3">
                                              <button 
                                                onClick={() => handleCompleteDelivery(order.id)}
                                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                              >
                                                  <CheckCircle size={18} /> Selesaikan Pengiriman
                                              </button>
                                              <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                                                  <MapIcon size={20} />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}

                          {/* Available Orders */}
                          <div className="pt-6 border-t border-slate-100">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                      <Search size={20} className="text-blue-600" /> Pesanan Tersedia
                                  </h4>
                                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{ordersToDeliver.length} Baru</span>
                              </div>

                              <div className="space-y-3">
                                  {ordersToDeliver.map(order => (
                                      <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-blue-300 transition group">
                                          <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                                                  <Package size={20} />
                                              </div>
                                              <div>
                                                  <h5 className="font-bold text-slate-800 text-sm">{order.itemName}</h5>
                                                  <p className="text-[10px] text-slate-500">{order.sellerName} → {order.buyerName}</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <div className="text-right">
                                                  <p className="text-xs font-bold text-blue-600">Rp 5.000</p>
                                                  <p className="text-[8px] text-slate-400">Ongkir Flat</p>
                                              </div>
                                              <button 
                                                onClick={() => handleAcceptDelivery(order.id)}
                                                disabled={courierStatus?.status !== 'ONLINE'}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                                                  courierStatus?.status === 'ONLINE' 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }`}
                                              >
                                                  Ambil
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                                  {ordersToDeliver.length === 0 && (
                                      <p className="text-center text-slate-400 text-sm py-4 italic">Belum ada pesanan yang perlu diantar.</p>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* Right: Courier Sidebar */}
                      <div className="space-y-6">
                          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                  <Bike size={120} />
                              </div>
                              <div className="relative z-10 space-y-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                          <User size={24} />
                                      </div>
                                      <div>
                                          <h5 className="font-bold">{user.name}</h5>
                                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Kurir Anjelo #042</p>
                                      </div>
                                  </div>
                                  
                                  <div className="pt-4 border-t border-white/10 space-y-3">
                                      <div className="flex justify-between items-center">
                                          <span className="text-xs text-slate-400">Status Kendaraan</span>
                                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                              <Check size={12} /> Prima
                                          </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                          <span className="text-xs text-slate-400">Bahan Bakar</span>
                                          <span className="text-xs font-bold">85%</span>
                                      </div>
                                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-orange-400 h-full w-[85%]"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                              <h5 className="font-bold text-slate-800 text-sm">Riwayat Hari Ini</h5>
                              <div className="space-y-3">
                                  {myDeliveries.filter(d => d.status === 'COMPLETED').slice(0, 3).map(order => (
                                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                          <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                  <Clock size={14} />
                                              </div>
                                              <div>
                                                  <p className="text-[10px] font-bold text-slate-800">{order.itemName}</p>
                                                  <p className="text-[8px] text-slate-400">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                              </div>
                                          </div>
                                          <span className="text-[10px] font-bold text-emerald-600">+Rp 5.000</span>
                                      </div>
                                  ))}
                                  {myDeliveries.filter(d => d.status === 'COMPLETED').length === 0 && (
                                      <p className="text-center text-slate-400 text-[10px] py-2 italic">Belum ada riwayat pengiriman hari ini.</p>
                                  )}
                              </div>
                              <button className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition">Lihat Semua Riwayat</button>
                          </div>
                      </div>
                  </div>
              </div>
          )}



      {/* --- ADD LISTING MODAL --- */}
      <AnimatePresence>
          {showAddModal && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
                  >
                      <div className="bg-rose-600 p-6 text-white relative">
                          <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition">
                              <X size={20} />
                          </button>
                          <h3 className="text-2xl font-black">Tambah Jualan Baru</h3>
                          <p className="text-rose-100 text-sm">Lengkapi detail produk atau jasa Anda.</p>
                      </div>

                      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                              <button 
                                onClick={() => setNewItemType('PRODUCT')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${newItemType === 'PRODUCT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                              >
                                  Produk Fisik
                              </button>
                              <button 
                                onClick={() => setNewItemType('SERVICE')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${newItemType === 'SERVICE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                              >
                                  Jasa / Layanan
                              </button>
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama {newItemType === 'PRODUCT' ? 'Produk' : 'Jasa'}</label>
                              <input 
                                type="text" 
                                value={newItem.name}
                                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Contoh: Keripik Pisang Yoso"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Harga (Rp)</label>
                                  <input 
                                    type="number" 
                                    value={newItem.price}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                                  />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kategori</label>
                                  <select 
                                    value={newItem.category}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                                  >
                                      <option value="KULINER">Kuliner</option>
                                      <option value="KERAJINAN">Kerajinan</option>
                                      <option value="FASHION">Fashion</option>
                                      <option value="REPARASI">Reparasi</option>
                                      <option value="KESEHATAN">Kesehatan</option>
                                      <option value="LAINNYA">Lainnya</option>
                                  </select>
                              </div>
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Deskripsi Singkat</label>
                              <textarea 
                                value={newItem.description}
                                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Jelaskan keunggulan jualan Anda..."
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition resize-none"
                              />
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Warna Aksen (Placeholder Gambar)</label>
                              <div className="flex gap-2 flex-wrap">
                                  {['bg-rose-500', 'bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-slate-800'].map(color => (
                                      <button 
                                        key={color}
                                        onClick={() => setNewItem(prev => ({ ...prev, imageColor: color }))}
                                        className={`w-8 h-8 rounded-full ${color} border-2 ${newItem.imageColor === color ? 'border-white ring-2 ring-rose-500' : 'border-transparent'}`}
                                      />
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="p-6 bg-slate-50 border-t border-slate-100">
                          <button 
                            onClick={handleAddListing}
                            disabled={!newItem.name || newItem.price <= 0}
                            className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                          >
                              Simpan & Publikasikan
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* --- SEAMLESS ORDER MODAL --- */}
      {orderModal.isOpen && orderModal.item && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl relative animate-in slide-in-from-bottom-20 duration-500 md:mb-4 md:rounded-[2.5rem] overflow-hidden border border-white/20">
                  <button onClick={closeOrderModal} className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full transition text-white">
                      <X size={20} />
                  </button>

                  {/* HEADER */}
                  <div className="bg-[#003D79] p-6 pt-8 text-white relative overflow-hidden">
                      {/* Background Icons */}
                      <ShoppingBag size={120} className="absolute -right-4 -top-4 opacity-10 text-white" />
                      
                      <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                              <Building2 size={24} className="text-[#FFB81C]" />
                              <h3 className="text-xl font-bold">
                                  {orderModal.step === 'SUCCESS' ? 'Transaksi Berhasil' : (orderModal.type === 'SERVICE' ? 'Booking Jasa' : 'Detail Pesanan')}
                              </h3>
                          </div>
                          <p className="text-blue-200 text-xs font-medium tracking-wide">WargaPay powered by Livin'</p>
                      </div>
                  </div>

                  {/* BODY CONTENT */}
                  <div className="p-6 bg-slate-50 min-h-[400px] flex flex-col">
                      
                      {/* STEP 1: REVIEW */}
                      {orderModal.step === 'REVIEW' && (
                          <div className="space-y-6 flex-1 flex flex-col">
                              {/* Product Card */}
                              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center shrink-0 ${orderModal.type === 'PRODUCT' ? (orderModal.item as MarketplaceItem).imageColor : 'bg-blue-100 text-blue-600'}`}>
                                      {orderModal.type === 'PRODUCT' && (orderModal.item as MarketplaceItem).imageUrl ? (
                                          <img src={(orderModal.item as MarketplaceItem).imageUrl} className="w-full h-full object-cover rounded-xl" alt="Product" />
                                      ) : (
                                          orderModal.type === 'PRODUCT' ? <ShoppingBag size={24} className="text-white opacity-50" /> : <Wrench size={24} />
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{orderModal.item.name}</h4>
                                      <p className="text-xs text-slate-500 mb-2">
                                          {orderModal.type === 'PRODUCT' 
                                            ? `Penjual: ${(orderModal.item as MarketplaceItem).seller}` 
                                            : `Penyedia: ${(orderModal.item as ServiceProvider).name}`
                                          }
                                      </p>
                                      <p className="font-black text-orange-600 text-lg">
                                          Rp {orderModal.item.price.toLocaleString()}
                                          {orderModal.type === 'SERVICE' && <span className="text-xs text-slate-400 font-normal"> / {(orderModal.item as ServiceProvider).unit}</span>}
                                      </p>
                                  </div>
                              </div>

                              {/* SERVICE SPECIFIC DETAILS */}
                              {orderModal.type === 'SERVICE' && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-500">Satuan Biaya</span>
                                        <span>Per {(orderModal.item as ServiceProvider).unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-500">Min. Order</span>
                                        <span>{(orderModal.item as ServiceProvider).minOrder} {(orderModal.item as ServiceProvider).unit}</span>
                                    </div>
                                    {(orderModal.item as ServiceProvider).exceptions && (
                                        <div className="pt-2 mt-2 border-t border-blue-200 flex gap-2 items-start text-xs text-orange-700">
                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                            <span><span className="font-bold">Catatan:</span> {(orderModal.item as ServiceProvider).exceptions}</span>
                                        </div>
                                    )}
                                </div>
                              )}

                              {/* PAYMENT SUMMARY */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 mt-auto shadow-sm">
                                  <div className="flex justify-between text-sm items-center">
                                      <span className="text-slate-500">Metode Pembayaran</span>
                                      <span className="font-bold text-[#003D79] bg-blue-50 px-2 py-1 rounded">WargaPay / Livin'</span>
                                  </div>
                                  
                                  {orderModal.type === 'PRODUCT' && (
                                    <div className="flex justify-between text-sm items-center pt-2">
                                        <span className="text-slate-500">Jumlah Pesanan</span>
                                        <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                                            <button 
                                                onClick={() => setOrderModal(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-indigo-600"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold text-slate-800 min-w-[20px] text-center">{orderModal.quantity}</span>
                                            <button 
                                                onClick={() => setOrderModal(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-indigo-600"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                  )}

                                  <div className="flex justify-between text-sm items-center">
                                      <span className="text-slate-500">Biaya Layanan</span>
                                      <span className="font-bold text-slate-800">Rp 0</span>
                                  </div>
                                  <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
                                      <span className="font-bold text-slate-800 text-base">Total Bayar</span>
                                      <span className="font-black text-2xl text-slate-900">Rp {(orderModal.item.price * orderModal.quantity).toLocaleString()}</span>
                                  </div>
                              </div>

                              <button 
                                onClick={handleConfirmPayment}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2 mt-2"
                              >
                                  {orderModal.type === 'SERVICE' ? (
                                      <><Calendar size={20} className="text-[#FFB81C]" /> Konfirmasi Booking</>
                                  ) : (
                                      <><Wallet size={20} className="text-[#FFB81C]" /> Bayar Sekarang</>
                                  )}
                              </button>
                          </div>
                      )}

                      {/* STEP 2: LIVIN CONNECT ANIMATION */}
                      {orderModal.step === 'LIVIN_CONNECT' && (
                          <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                              <div className="relative mb-8">
                                  <div className="w-24 h-24 rounded-full border-4 border-blue-100 flex items-center justify-center animate-pulse">
                                      <Building2 size={40} className="text-[#003D79]" />
                                  </div>
                                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                      <Loader2 size={28} className="text-[#FFB81C] animate-spin" />
                                  </div>
                              </div>
                              <h4 className="font-bold text-lg text-slate-800 mb-2">Menghubungkan Livin' Merchant...</h4>
                              <p className="text-slate-500 text-sm max-w-xs">Memproses pembayaran aman melalui gateway WargaPay.</p>
                          </div>
                      )}

                      {/* STEP 3: SUCCESS */}
                      {orderModal.step === 'SUCCESS' && (
                          <div className="text-center py-4 animate-in zoom-in duration-300 flex-1 flex flex-col items-center">
                              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                  <CheckCircle size={48} />
                              </div>
                              <h3 className="text-2xl font-black text-slate-800 mb-2">
                                  {orderModal.type === 'SERVICE' ? 'Booking Berhasil!' : 'Pembayaran Berhasil!'}
                              </h3>
                              <p className="text-slate-500 text-sm mb-8 max-w-xs">
                                  {orderModal.type === 'SERVICE' 
                                    ? 'Penyedia jasa telah menerima request Anda dan akan segera menghubungi.' 
                                    : 'Pesanan Anda telah diteruskan ke merchant.'}
                              </p>
                              
                              <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 text-left relative overflow-hidden w-full shadow-sm">
                                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#003D79]"></div>
                                  <div className="flex justify-between items-center mb-1">
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID Transaksi</p>
                                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">SUKSES</span>
                                  </div>
                                  <p className="font-mono font-bold text-slate-800 tracking-wide text-lg">LIVIN-{Math.floor(Math.random()*1000000)}</p>
                              </div>

                              <button 
                                onClick={closeOrderModal}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg mt-auto"
                              >
                                  Selesai
                              </button>
                          </div>
                      )}

                  </div>
              </div>
          </div>
      )}

      </div>
    </div>
  );
};

export default BerdayaView;
