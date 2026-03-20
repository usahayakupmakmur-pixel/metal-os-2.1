
import React, { useState } from 'react';
import { ShoppingBag, Wrench, Truck, CreditCard, Search, Star, CheckCircle, X, User, MapPin, Package, Bike, DollarSign, Zap, Droplet, Smartphone, Phone, AlertCircle, Info, Wallet, Loader2, Building2, Calendar } from 'lucide-react';
import { MARKETPLACE_ITEMS, SERVICE_PROVIDERS, MOCK_USER } from '../constants';
import { CitizenProfile, MarketplaceItem, ServiceProvider } from '../types';

interface BerdayaViewProps {
  user?: CitizenProfile;
  onOpenAnjelo: (service?: any, note?: string) => void;
}

interface OrderModalState {
    isOpen: boolean;
    step: 'REVIEW' | 'PAYMENT_METHOD' | 'LIVIN_CONNECT' | 'SUCCESS';
    item: MarketplaceItem | ServiceProvider | null;
    type: 'PRODUCT' | 'SERVICE';
}

const BerdayaView: React.FC<BerdayaViewProps> = ({ user = MOCK_USER, onOpenAnjelo }) => {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'SERVICES' | 'ANJELO' | 'PPOB'>('MARKET');
  const [searchQuery, setSearchQuery] = useState('');

  // --- MARKETPLACE STATE ---
  const [orderModal, setOrderModal] = useState<OrderModalState>({ isOpen: false, step: 'REVIEW', item: null, type: 'PRODUCT' });

  const filteredProducts = MARKETPLACE_ITEMS.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = SERVICE_PROVIDERS.filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
      { id: 'MARKET', label: 'Marketplace', shortLabel: 'Belanja', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100', activeBg: 'bg-orange-600' },
      { id: 'SERVICES', label: 'Jasa & Tukang', shortLabel: 'Jasa', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100', activeBg: 'bg-blue-600' },
      { id: 'ANJELO', label: 'Anjelo Logistik', shortLabel: 'Anjelo', icon: Truck, color: 'text-green-600', bg: 'bg-green-100', activeBg: 'bg-green-600' },
      { id: 'PPOB', label: 'Bayar Tagihan', shortLabel: 'Tagihan', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100', activeBg: 'bg-purple-600' },
  ];

  const handleInitiateOrder = (item: MarketplaceItem | ServiceProvider, type: 'PRODUCT' | 'SERVICE') => {
      setOrderModal({ isOpen: true, step: 'REVIEW', item, type });
  };

  const handleConfirmPayment = () => {
      setOrderModal(prev => ({ ...prev, step: 'LIVIN_CONNECT' }));
      // Simulate API Handshake with Livin Merchant
      setTimeout(() => {
          setOrderModal(prev => ({ ...prev, step: 'SUCCESS' }));
      }, 2500);
  };

  const closeOrderModal = () => {
      setOrderModal({ isOpen: false, step: 'REVIEW', item: null, type: 'PRODUCT' });
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
          )}

      </div>

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
                                  <div className="flex justify-between text-sm items-center">
                                      <span className="text-slate-500">Biaya Layanan</span>
                                      <span className="font-bold text-slate-800">Rp 0</span>
                                  </div>
                                  <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
                                      <span className="font-bold text-slate-800 text-base">Total Bayar</span>
                                      <span className="font-black text-2xl text-slate-900">Rp {orderModal.item.price.toLocaleString()}</span>
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
  );
};

export default BerdayaView;
