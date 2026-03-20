
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Bike, Utensils, Trash2, Star, Phone, MessageSquare, Home, ShoppingBag, Wallet, ChevronDown, Building2, Clock, AlertCircle, X, Package, Plus, CheckCircle } from 'lucide-react';
import * as L from 'leaflet';
import { MOCK_USER } from '../constants';

interface AnjeloViewProps {
  onBack: () => void;
}

type ServiceType = 'bike' | 'food' | 'waste' | 'pickup' | null;
type OrderStatus = 'idle' | 'searching' | 'found' | 'arrived' | 'ready_pickup';

// Coordinates for Metro, Lampung (Approx. Pasar Payungi area)
const DEFAULT_START_POS: [number, number] = [-5.1136, 105.3067]; // Pasar Yosomulyo
const DRIVER_START_POS: [number, number] = [-5.1180, 105.3090]; // Nearby

const SAVED_LOCATIONS = [
    { name: 'Pasar Yosomulyo Pelangi', coords: [-5.1136, 105.3067] as [number, number], type: 'market' },
    { name: 'Rumah (Jl. Kedondong)', coords: [-5.1155, 105.3045] as [number, number], type: 'home' },
    { name: 'Kantor Kelurahan', coords: [-5.1120, 105.3080] as [number, number], type: 'office' },
    { name: 'Warung Bu Broto', coords: [-5.1140, 105.3060] as [number, number], type: 'food' }
];

export const AnjeloView: React.FC<AnjeloViewProps> = ({ onBack }) => {
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [status, setStatus] = useState<OrderStatus>('idle');
  const [eta, setEta] = useState<string>('...');
  
  // Location State
  const [locationName, setLocationName] = useState('Pasar Yosomulyo Pelangi');
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_START_POS);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Driver position state for animation logic
  const [driverPos, setDriverPos] = useState<[number, number]>(DRIVER_START_POS);

  // --- Map Initialization ---
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // 1. Create Map
    const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView(DEFAULT_START_POS, 16);

    mapInstanceRef.current = map;

    // 2. Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // 3. Custom Icons
    const userIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="relative">
                 <div class="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-md relative z-10"></div>
                 <div class="absolute top-0 left-0 w-4 h-4 bg-indigo-600 rounded-full animate-ping opacity-75"></div>
               </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const destIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="flex flex-col items-center justify-center">
                <div class="text-indigo-600 drop-shadow-md"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg></div>
                <div class="w-2 h-1 bg-black opacity-30 rounded-full blur-[1px]"></div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    // 4. Add Markers
    userMarkerRef.current = L.marker(DEFAULT_START_POS, { icon: userIcon }).addTo(map);
    // L.marker([-5.1120, 105.3080], { icon: destIcon }).addTo(map); // Remove static dest marker

    // 5. Invalidate size to fix render issues
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
        map.remove();
        mapInstanceRef.current = null;
    };
  }, []);

  // --- Update User/Dest Marker when location changes ---
  useEffect(() => {
      if (userMarkerRef.current && mapInstanceRef.current) {
          userMarkerRef.current.setLatLng(userLocation);
          mapInstanceRef.current.flyTo(userLocation, 17);
      }
  }, [userLocation]);

  // --- Driver & Route Animation Logic ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (status === 'searching' || status === 'found') {
        // Create Driver Marker if not exists
        if (!driverMarkerRef.current) {
             const driverIcon = L.divIcon({
                className: 'custom-marker-icon',
                html: `<div class="w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                       </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon }).addTo(map);
        } else {
            // Update Position
            driverMarkerRef.current.setLatLng(driverPos);
        }

        // Create/Update Route Line to Selected User Location
        const routePoints = [driverPos, userLocation];
        if (!routeLineRef.current) {
             routeLineRef.current = L.polyline(routePoints, {
                color: '#6366f1',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10',
                lineCap: 'round'
            }).addTo(map);
        } else {
            routeLineRef.current.setLatLngs(routePoints);
        }

        // Calculate Distance & ETA to Selected Location
        const dist = map.distance(driverPos, userLocation); // meters
        const timeMin = Math.ceil(dist / 200); // rough estimate
        setEta(dist < 50 ? 'Sekarang' : `${timeMin} min`);

        // Animation Step (Move driver closer)
        if (status === 'found' && dist > 20) {
            const timer = setTimeout(() => {
                const latDiff = (userLocation[0] - driverPos[0]) * 0.05;
                const lngDiff = (userLocation[1] - driverPos[1]) * 0.05;
                setDriverPos([driverPos[0] + latDiff, driverPos[1] + lngDiff]);
            }, 1000); // Update every second
            return () => clearTimeout(timer);
        } else if (status === 'found' && dist <= 20) {
            setStatus('arrived');
        }
    } else {
        // Cleanup if idle
        if (driverMarkerRef.current) {
            driverMarkerRef.current.remove();
            driverMarkerRef.current = null;
        }
        if (routeLineRef.current) {
            routeLineRef.current.remove();
            routeLineRef.current = null;
        }
        setDriverPos(DRIVER_START_POS); // Reset position
    }
  }, [status, driverPos, userLocation]);


  // --- Actions ---
  const handleOrder = (service: ServiceType) => {
    setSelectedService(service);
    
    if (service === 'pickup') {
      setStatus('ready_pickup');
    } else {
      setStatus('searching');
      // Simulate finding driver
      setTimeout(() => {
          setStatus('found');
      }, 3000);
    }
  };

  const handleLocationSelect = (location: typeof SAVED_LOCATIONS[0]) => {
      setLocationName(location.name);
      setUserLocation(location.coords);
      setIsLocationMenuOpen(false);
  };

  const handlePresetOrder = (name: string, coords: [number, number], service: ServiceType) => {
      // 1. Set Location
      setLocationName(name);
      setUserLocation(coords);
      
      // 2. Trigger Order
      handleOrder(service);
  };

  const handleLogActivity = () => {
      console.log("--- ANJELO ACTIVITY LOG ---");
      console.log("Status:", status);
      console.log("Driver Position:", driverPos);
      console.log("User Target:", userLocation);
      console.log("ETA:", eta);
      console.log("Service:", selectedService);
      console.log("Location:", locationName);
      alert("Log aktivitas dicatat di console (F12)");
  };

  const handleTopUp = () => {
      alert(`Membuka Livin' by Mandiri...\nDeep Link: mandiri://topup?va=${MOCK_USER.mandiriVA}`);
  };

  const getLocationIcon = (type: string) => {
    switch(type) {
        case 'home': return <Home size={20} className="text-indigo-500" />;
        case 'office': return <Building2 size={20} className="text-blue-500" />;
        case 'food': return <Utensils size={20} className="text-red-500" />;
        default: return <MapPin size={20} className="text-green-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50">
      
      {/* TOP NAV (Overlay) */}
      <div className="absolute top-0 left-0 right-0 z-[400] p-4 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
            <button 
                onClick={onBack} 
                className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-transform active:scale-95"
            >
                <ArrowLeft size={24} />
            </button>
            <button 
                onClick={onBack}
                className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-transform active:scale-95"
                title="Home Screen"
            >
                <Home size={24} />
            </button>
        </div>

        <div className="flex flex-col items-end space-y-2 pointer-events-auto">
            {/* Location Selector Trigger */}
            <button 
                onClick={() => setIsLocationMenuOpen(true)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg max-w-[220px] hover:scale-105 transition-transform active:scale-95"
            >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-800 truncate">{locationName}</span>
                <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Wallet Widget */}
            <div className="flex items-center space-x-2">
                <div className="bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-2 border border-gray-100">
                    <Wallet size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-gray-800">Rp {MOCK_USER.balance.toLocaleString()}</span>
                </div>
                <button 
                    onClick={handleTopUp}
                    className="bg-[#FFB81C] text-[#003D79] px-2 py-1.5 rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-400 transition active:scale-90"
                >
                    <Plus size={14} strokeWidth={3} />
                </button>
            </div>
        </div>
      </div>

      {/* LOCATION MODAL (Replaces Dropdown) */}
      {isLocationMenuOpen && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 text-lg">Pilih Lokasi Jemput</h3>
                    <button 
                        onClick={() => setIsLocationMenuOpen(false)} 
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lokasi Tersimpan</p>
                    </div>
                    {SAVED_LOCATIONS.map((loc, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleLocationSelect(loc)}
                            className="w-full text-left px-4 py-4 hover:bg-indigo-50 flex items-center space-x-4 rounded-xl transition-colors group"
                        >
                            <div className="bg-gray-100 p-2.5 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                                {getLocationIcon(loc.type)}
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-800">{loc.name}</span>
                                <span className="block text-xs text-gray-500 mt-0.5">Metro, Lampung</span>
                            </div>
                        </button>
                    ))}
                    
                    <div className="px-4 py-2 mt-2 border-t border-gray-100 pt-4">
                         <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2">
                            <MapPin size={16} />
                            <span>Pilih Lewat Peta</span>
                         </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MAP CONTAINER */}
      <div className="flex-1 relative z-0 bg-gray-200" ref={mapRef}>
         {/* Map renders here */}
      </div>

      {/* BOTTOM SHEET */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[400] animate-slide-up max-h-[60vh] overflow-y-auto">
        
        {/* 1. IDLE STATE */}
        {status === 'idle' && (
            <div className="p-6">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <h3 className="font-bold text-lg text-gray-900 mb-4 animate-in fade-in duration-500">Mau kemana hari ini?</h3>
                
                {/* Service Grid with Staggered Animation */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <button 
                        onClick={() => handleOrder('bike')}
                        className="flex flex-col items-center p-3 rounded-2xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 group animate-in slide-in-from-bottom-8 fade-in fill-mode-backwards"
                        style={{ animationDelay: '0ms' }}
                    >
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white mb-2 shadow-orange-200 shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <Bike size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">Bike</span>
                        <span className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight px-1">Ojek Desa</span>
                    </button>
                    <button 
                        onClick={() => handleOrder('food')}
                        className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 group animate-in slide-in-from-bottom-8 fade-in fill-mode-backwards"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white mb-2 shadow-red-200 shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                            <Utensils size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">Food</span>
                        <span className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight px-1">Kuliner</span>
                    </button>
                    <button 
                        onClick={() => handleOrder('waste')}
                        className="flex flex-col items-center p-3 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 group animate-in slide-in-from-bottom-8 fade-in fill-mode-backwards"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white mb-2 shadow-green-200 shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <Trash2 size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">Sampah</span>
                        <span className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight px-1">Jemput</span>
                    </button>
                     <button 
                        onClick={() => handleOrder('pickup')}
                        className="flex flex-col items-center p-3 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 group animate-in slide-in-from-bottom-8 fade-in fill-mode-backwards"
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2 shadow-blue-200 shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                            <Package size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">Pick Up</span>
                        <span className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight px-1">Kurir</span>
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="animate-in fade-in duration-700 delay-300">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Aksi Cepat</h4>
                    <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                         {/* Quick Action 1: Home */}
                         <button 
                            onClick={() => handlePresetOrder('Rumah (Jl. Kedondong)', SAVED_LOCATIONS[1].coords, 'bike')}
                            className="flex-shrink-0 flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm min-w-[140px] hover:border-indigo-200 hover:shadow-md transition active:scale-95"
                         >
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Home size={18} /></div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Pulang</p>
                                <p className="text-[10px] text-gray-500">ke Rumah</p>
                            </div>
                         </button>

                         {/* Quick Action 2: Office */}
                         <button 
                             onClick={() => handlePresetOrder('Kantor Kelurahan', SAVED_LOCATIONS[2].coords, 'bike')}
                             className="flex-shrink-0 flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm min-w-[140px] hover:border-indigo-200 hover:shadow-md transition active:scale-95"
                         >
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Building2 size={18} /></div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Ke Kantor</p>
                                <p className="text-[10px] text-gray-500">Kelurahan</p>
                            </div>
                         </button>

                         {/* Quick Action 3: Food (New) */}
                         <button 
                             onClick={() => handlePresetOrder('Warung Bu Broto', SAVED_LOCATIONS[3].coords, 'food')}
                             className="flex-shrink-0 flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm min-w-[140px] hover:border-indigo-200 hover:shadow-md transition active:scale-95"
                         >
                            <div className="bg-red-100 p-2 rounded-lg text-red-600"><Utensils size={18} /></div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Pesan</p>
                                <p className="text-[10px] text-gray-500">Makanan</p>
                            </div>
                         </button>
                    </div>
                </div>
            </div>
        )}

        {/* 2. SEARCHING STATE */}
        {status === 'searching' && (
            <div className="p-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Bike size={24} className="text-indigo-600 animate-bounce" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mencari Driver...</h3>
                <p className="text-sm text-gray-500">Mohon tunggu sebentar, kami sedang menghubungkan Anda dengan kurir terdekat.</p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 text-red-500 font-medium text-sm hover:underline"
                >
                    Batalkan Pesanan
                </button>
            </div>
        )}

        {/* 3. FOUND STATE */}
        {status === 'found' && (
            <div className="p-6 animate-in slide-in-from-bottom-10 duration-500">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                         <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                            <Clock size={12} className="mr-1" />
                            {eta}
                         </div>
                         <span className="text-xs text-gray-400">Menuju lokasi Anda</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Tarif</p>
                        <p className="font-bold text-indigo-600">Rp 8.000</p>
                    </div>
                 </div>

                 {/* Driver Card */}
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center space-x-4 mb-6">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-[url('https://randomuser.me/api/portraits/men/32.jpg')] bg-cover bg-center"></div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                             <Star size={12} className="text-yellow-400 fill-current" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900">Mas Budi</h4>
                        <div className="flex items-center space-x-2 mt-1">
                             <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">BE 4522 AR</span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1.5">
                             <span className="text-xs text-gray-500 flex items-center">
                                <Bike size={12} className="mr-1"/>
                                Motor Matic
                             </span>
                             <span className="text-xs font-bold text-yellow-600 flex items-center">
                                <Star size={12} className="fill-current mr-1"/>
                                4.8
                             </span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button className="p-2 bg-white rounded-full text-indigo-600 border border-indigo-100 shadow-sm hover:bg-indigo-50 hover:scale-110 transition">
                            <MessageSquare size={18} />
                        </button>
                        <button className="p-2 bg-indigo-600 rounded-full text-white shadow-md hover:bg-indigo-700 hover:scale-110 transition">
                            <Phone size={18} />
                        </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                     <button 
                        onClick={() => setStatus('arrived')}
                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-2"
                     >
                        <CheckCircle size={20} /> Konfirmasi Driver Sampai
                     </button>

                     <div className="flex space-x-3">
                         <button 
                            onClick={handleLogActivity}
                            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 border border-gray-200 transition active:scale-95"
                         >
                            Log Aktivitas
                         </button>
                         <button 
                            onClick={() => setStatus('idle')}
                            className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 border border-red-100 transition active:scale-95"
                         >
                            Batalkan
                         </button>
                     </div>
                 </div>
            </div>
        )}

        {/* 4. READY PICKUP STATE (New) */}
        {status === 'ready_pickup' && (
            <div className="p-6 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Package size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pesanan Siap Diambil!</h3>
                <p className="text-gray-500 text-sm mb-6">Silakan menuju {locationName} untuk mengambil pesanan Anda.</p>
                <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-xs font-bold mb-6 border border-blue-100">
                    Tunjukkan kode: <span className="text-lg block mt-1">PICK-9921</span>
                </div>
                <button 
                    onClick={() => setStatus('idle')}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition active:scale-95"
                >
                    Selesai & Tutup
                </button>
            </div>
        )}

        {/* 5. ARRIVED STATE */}
        {status === 'arrived' && (
            <div className="p-6 text-center animate-in slide-in-from-bottom duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <MapPin size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Driver Sudah Sampai!</h3>
                <p className="text-gray-500 text-sm mb-6">Mas Budi sudah menunggu di titik penjemputan.</p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95"
                >
                    Oke, Saya Menuju Kesana
                </button>
            </div>
        )}

      </div>
    </div>
  );
};
