
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import GovernanceView from './components/GovernanceView';
import EconomyView from './components/EconomyView';
import EnvironmentView from './components/EnvironmentView';
import GapuraView from './components/GapuraView';
import SettingsView from './components/SettingsView';
import Bootloader from './components/Bootloader';
import AiAssistant from './components/AiAssistant';
import EOfficeView from './components/EOfficeView';
import SocialView from './components/SocialView';
import PosKamlingView from './components/PosKamlingView';
import MarketView from './components/MarketView';
import ParkingView from './components/ParkingView';
import HealthView from './components/HealthView';
import BerdayaView from './components/BerdayaView';
import AnjeloSystem from './components/AnjeloSystem';
import EducationView from './components/EducationView';
import SystemView from './components/SystemView';
import CreativeFinanceView from './components/CreativeFinanceView';
import GeospatialView from './components/GeospatialView';
import CommandCenter from './components/CommandCenter';
import ScannerOverlay from './components/ScannerOverlay';
import BottomNav from './components/BottomNav';
import TasksView from './src/TasksView';
import AssetsView from './src/AssetsView';
import TrackerView from './src/TrackerView';
import { ViewMode, CitizenProfile } from './types';
import { Bell, Search, Menu, ChevronDown, Check, Loader2, RefreshCw, Home, ShoppingBag, QrCode, Users, User, Sparkles, Wifi, Trash2, Phone, Activity, Camera, Upload, X, Cpu, Shield, Zap, Command, BellRing, Clock, Battery, Signal, Plus, Truck, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { MOCK_USER, AVAILABLE_USERS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
    const [isBooting, setIsBooting] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState<any>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD); // Changed default to Dashboard for better first impression
    const [viewHistory, setViewHistory] = useState<ViewMode[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

    // Context Aware User State
    const [currentUser, setCurrentUser] = useState<CitizenProfile>(AVAILABLE_USERS[0]); 
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isContextSwitching, setIsContextSwitching] = useState(false);

    // Camera & Profile Photo State
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Assistant State 
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    const [aiContext, setAiContext] = useState<{ title?: string; content?: string; type?: string } | null>(null);

    // Command Center State
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);

    // Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Auth Logic
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            setIsAuthLoading(false);

            if (user) {
                // Sync user profile to Firestore
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    // Create initial profile if it doesn't exist
                    const isDefaultAdmin = user.email === 'usahayakupmakmur@gmail.com';
                    await setDoc(userRef, {
                        uid: user.uid,
                        displayName: user.displayName || 'Warga Baru',
                        email: user.email,
                        photoURL: user.photoURL || '',
                        role: isDefaultAdmin ? 'Lurah / Admin' : 'Warga Berdaya',
                        balance: 100000,
                        points: 50,
                        wargaScore: 85,
                        lastSeen: serverTimestamp()
                    });
                } else {
                    // Update last seen
                    await setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true });
                    
                    // Sync local currentUser state with Firestore role
                    const data = userDoc.data();
                    const matchedMockUser = AVAILABLE_USERS.find(u => u.role === data.role) || AVAILABLE_USERS[0];
                    setCurrentUser({
                        ...matchedMockUser,
                        id: user.uid,
                        name: data.displayName || user.displayName || matchedMockUser.name,
                        photoUrl: data.photoURL || user.photoURL || matchedMockUser.photoUrl,
                        role: data.role || matchedMockUser.role
                    });
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        if (isLoggingIn) return;
        setIsLoggingIn(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            // Suppress benign errors from user cancellation or duplicate requests
            if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
                console.error("Login failed", error);
                addNotification("Gagal masuk dengan Google", "error");
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            addNotification("Berhasil keluar", "success");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Scroll tracking for mobile Home button auto-hide
    const [isHomeButtonVisible, setIsHomeButtonVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Auto hide on scroll down, show on scroll up
            if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setIsHomeButtonVisible(false);
            } else {
                setIsHomeButtonVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // TV Mode State 
    const [isTvMode, setIsTvMode] = useState(false);

    // System Notifications State
    const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);

    const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    // Global Anjelo State
    const [anjeloState, setAnjeloState] = useState<{
        isOpen: boolean;
        service: 'PACKAGE' | 'RIDE' | 'CASH' | 'TRASH' | 'DOCS' | null;
        note: string;
    }>({ isOpen: false, service: null, note: '' });

    // Pending Actions from Scanner
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
    const [pendingAssetId, setPendingAssetId] = useState<string | null>(null);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);
    const [pendingCheckInLocation, setPendingCheckInLocation] = useState<string | null>(null);

    // Camera Functions (Existing logic maintained)
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setShowCamera(true);
            setIsUserMenuOpen(false);
        } catch (err) {
            console.error("Camera access denied", err);
            alert("Akses kamera ditolak atau tidak tersedia.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    useEffect(() => {
        if (showCamera && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [showCamera, stream]);

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCurrentUser(prev => ({ ...prev, photoUrl: dataUrl }));
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentUser(prev => ({ ...prev, photoUrl: reader.result as string }));
                setIsUserMenuOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSwitchUser = (user: CitizenProfile) => {
        setIsUserMenuOpen(false);
        if (user.id === currentUser.id) return;

        setIsContextSwitching(true);
        setTimeout(() => {
            setCurrentUser(user);
            setIsContextSwitching(false);
        }, 1000);
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandCenterOpen(true);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const triggerAnjelo = (service: 'PACKAGE' | 'RIDE' | 'CASH' | 'TRASH' | 'DOCS' | null = null, note: string = '') => {
        setAnjeloState({ isOpen: true, service, note });
    };

    const closeAnjelo = () => {
        setAnjeloState(prev => ({ ...prev, isOpen: false }));
    };

    const handleScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        
        // Advanced Logic: Contextual Scan Handling
        if (decodedText.startsWith('PAY:')) {
            const amount = decodedText.split(':')[1];
            addNotification(`Memproses Pembayaran QRIS Rp ${amount}...`, 'info');
            setTimeout(() => {
                addNotification(`Pembayaran Rp ${amount} Berhasil!`, 'success');
                handleNavigate(ViewMode.ECONOMY);
            }, 1500);
        } else if (decodedText.startsWith('TASK:')) {
            const taskId = decodedText.split(':')[1];
            addNotification(`Tugas #${taskId} ditemukan. Membuka detail tugas...`, 'info');
            handleNavigate(ViewMode.TASKS);
            setPendingTaskId(taskId);
        } else if (decodedText.startsWith('ASSET:')) {
            const assetId = decodedText.split(':')[1];
            addNotification(`Aset #${assetId} teridentifikasi. Membuka manajemen aset...`, 'info');
            handleNavigate(ViewMode.ASSETS);
            setPendingAssetId(assetId);
        } else if (decodedText.startsWith('USER:')) {
            const userId = decodedText.split(':')[1];
            addNotification(`Profil Warga #${userId} ditemukan. Membuka kontak...`, 'info');
            setPendingUserId(userId);
            handleNavigate(ViewMode.SOCIAL);
        } else if (decodedText.startsWith('LOCATION:')) {
            const locationId = decodedText.split(':')[1];
            addNotification(`Lokasi #${locationId} terverifikasi. Membuka check-in...`, 'info');
            handleNavigate(ViewMode.POSKAMLING);
            setPendingCheckInLocation(locationId);
        } else {
            // Default: Show result in AI Assistant
            setAiContext({
                title: 'Hasil Pindaian QR',
                content: `Data yang terpindai: ${decodedText}. Apakah Anda ingin saya memproses data ini?`,
                type: 'SCAN_RESULT'
            });
            setIsAiChatOpen(true);
        }
    };

    if (isBooting) {
        return <Bootloader onComplete={() => setIsBooting(false)} />;
    }

    if (!firebaseUser && !isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-transparent rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-gradient-to-tl from-cyan-900/30 via-teal-900/20 to-transparent rounded-full blur-[120px] animate-pulse delay-700"></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-cyan-500/20">
                        <Shield className="text-white w-10 h-10" />
                    </div>
                    
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Warga.Yosomulyo</h1>
                    <p className="text-slate-400 text-sm mb-10 leading-relaxed">Sistem Operasi Kognitif untuk Tata Kelola Desa Masa Depan. Silakan masuk untuk melanjutkan.</p>

                    <button 
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className={`w-full py-4 bg-white text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-xl ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoggingIn ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <LogIn size={20} />
                        )}
                        {isLoggingIn ? 'Menghubungkan...' : 'Masuk dengan Google'}
                    </button>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Powered by Gemini Neural Engine</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            </div>
        );
    }

    const handleNavigate = (view: ViewMode) => {
        if (view === currentView) return;
        setViewHistory(prev => [...prev, currentView]);
        setCurrentView(view);
    };

    const handleBack = () => {
        if (viewHistory.length === 0) return;
        const prevView = viewHistory[viewHistory.length - 1];
        setViewHistory(prev => prev.slice(0, -1));
        setCurrentView(prevView);
    };

    const renderContent = () => {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                >
                    {(() => {
                        switch (currentView) {
                            case ViewMode.DASHBOARD: return <DashboardView user={currentUser} onViewChange={handleNavigate} onOpenAiAssistant={() => setIsAiChatOpen(true)} />;
                            case ViewMode.GOVERNANCE: return <GovernanceView />;
                            case ViewMode.EOFFICE: return <EOfficeView onOpenAnjelo={triggerAnjelo} onContextUpdate={setAiContext} />;
                            case ViewMode.TASKS: return <TasksView onOpenScanner={() => setIsScannerOpen(true)} pendingTaskId={pendingTaskId} />;
                            case ViewMode.ASSETS: return <AssetsView onOpenScanner={() => setIsScannerOpen(true)} pendingAssetId={pendingAssetId} />;
                            case ViewMode.TRACKER: return <TrackerView onOpenScanner={() => setIsScannerOpen(true)} />;
                            case ViewMode.ECONOMY: return <EconomyView user={currentUser} onOpenAnjelo={triggerAnjelo} onOpenAiAssistant={() => setIsAiChatOpen(true)} onOpenScanner={() => setIsScannerOpen(true)} />;
                            case ViewMode.BERDAYA: return <BerdayaView user={currentUser} onOpenAnjelo={triggerAnjelo} />;
                            case ViewMode.MARKET: return <MarketView user={currentUser} onOpenScanner={() => setIsScannerOpen(true)} />;
                            case ViewMode.PARKING: return <ParkingView user={currentUser} />;
                            case ViewMode.HEALTH: return <HealthView user={currentUser} />;
                            case ViewMode.ENVIRONMENT: return <EnvironmentView user={currentUser} onOpenAnjelo={triggerAnjelo} onOpenAiAssistant={() => setIsAiChatOpen(true)} />;
                            case ViewMode.SOCIAL: return <SocialView 
                                onOpenAiAssistant={() => setIsAiChatOpen(true)} 
                                onOpenScanner={() => setIsScannerOpen(true)} 
                                pendingUserId={pendingUserId} 
                                addNotification={(message, type) => addNotification(message, type as any)}
                            />;
                            case ViewMode.GAPURA: return <GapuraView user={currentUser} isTvMode={isTvMode} onToggleTvMode={setIsTvMode} />;
                            case ViewMode.POSKAMLING: return <PosKamlingView user={currentUser} onOpenScanner={() => setIsScannerOpen(true)} pendingCheckInLocation={pendingCheckInLocation} />;
                            case ViewMode.EDUCATION: return <EducationView user={currentUser} />;
                            case ViewMode.SYSTEM: return <SystemView />;
                            case ViewMode.CREATIVE_FINANCE: return <CreativeFinanceView />;
                            case ViewMode.GEOSPATIAL: return <GeospatialView />;
                            case ViewMode.SETTINGS: return <SettingsView />;
                            default: return <div className="flex items-center justify-center h-96 text-white/50">Modul dalam pengembangan</div>;
                        }
                    })()}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="min-h-screen font-sans text-slate-900 relative selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden bg-slate-950">

            {/* Enhanced Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-transparent rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-gradient-to-tl from-cyan-900/30 via-teal-900/20 to-transparent rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-10">
                            <button onClick={stopCamera} className="bg-white/10 backdrop-blur text-white p-4 rounded-full hover:bg-white/20 transition"><X size={24} /></button>
                            <button onClick={capturePhoto} className="bg-white p-1.5 rounded-full border-4 border-white/30 hover:scale-105 transition"><div className="w-14 h-14 bg-white rounded-full"></div></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Switch Overlay */}
            {isContextSwitching && (
                <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl flex flex-col items-center animate-in zoom-in duration-300 text-white">
                        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
                        <h3 className="text-lg font-bold tracking-wide">Switching Identity...</h3>
                    </div>
                </div>
            )}

            <Sidebar
                currentView={currentView}
                onViewChange={handleNavigate}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isTvMode={isTvMode}
                onToggleTvMode={setIsTvMode}
                user={currentUser}
            />

            {/* Main Content Area */}
            <main
                className={`relative z-10 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col 
                ${isSidebarCollapsed || isTvMode ? 'md:ml-[114px]' : 'md:ml-[304px]'} 
                pb-28 md:pb-6 md:pr-6 pt-4`}
            >
                {/* Floating Header */}
                <header className={`sticky top-0 z-30 mx-2 md:mx-0 mb-6 transition-all duration-500 ${isTvMode ? '-translate-y-40 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg rounded-[2rem] px-6 py-3 flex justify-between items-center">
                        
                        {/* Mobile Menu Toggle & Title */}
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsCommandCenterOpen(true)} className="hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group relative">
                                <Search className="w-5 h-5" />
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                                    Search (Ctrl+K)
                                </div>
                            </button>
                            <button onClick={handleBack} className={`md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all ${viewHistory.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <span className="md:hidden text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-black">Warga.Yosomulyo</span>
                                    <span className="hidden md:inline text-slate-200">
                                        {currentView === ViewMode.DASHBOARD && 'Cognitive Dashboard'}
                                        {currentView === ViewMode.GOVERNANCE && 'Tata Kelola'}
                                        {currentView === ViewMode.EOFFICE && 'Workspace'}
                                        {currentView === ViewMode.TASKS && 'Team Tasks'}
                                        {currentView === ViewMode.ASSETS && 'Asset Management'}
                                        {currentView === ViewMode.TRACKER && 'Operational Tracker'}
                                        {currentView === ViewMode.BERDAYA && 'Warga Berdaya'}
                                        {currentView === ViewMode.ECONOMY && 'Ekonomi'}
                                        {currentView === ViewMode.MARKET && 'Pasar Payungi'}
                                        {currentView === ViewMode.PARKING && 'Parkir'}
                                        {currentView === ViewMode.HEALTH && 'Kesehatan'}
                                        {currentView === ViewMode.ENVIRONMENT && 'Lingkungan'}
                                        {currentView === ViewMode.SOCIAL && 'Sosial'}
                                        {currentView === ViewMode.GAPURA && 'Smart Gateway'}
                                        {currentView === ViewMode.POSKAMLING && 'Keamanan'}
                                        {currentView === ViewMode.EDUCATION && 'Pendidikan'}
                                        {currentView === ViewMode.SYSTEM && 'Kernel System'}
                                        {currentView === ViewMode.SETTINGS && 'Pengaturan'}
                                    </span>
                                </h2>
                            </div>
                        </div>

                        {/* System Status Bar (Center) */}
                        <div className="hidden xl:flex items-center gap-8 px-6 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono tracking-widest text-slate-400">
                            <div className="flex items-center gap-2 group cursor-help">
                                <Cpu size={12} className="text-cyan-400 group-hover:animate-spin transition-all duration-1000" />
                                <span>CPU: 24%</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-help">
                                <Shield size={12} className="text-emerald-400 group-hover:scale-125 transition-transform" />
                                <span>SEC: ENFORCED</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-help">
                                <div className="relative">
                                    <Zap size={12} className="text-yellow-400" />
                                    <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-50 animate-pulse"></div>
                                </div>
                                <span className="text-yellow-400 font-bold">COG: READY</span>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-green-400 tracking-wide uppercase">Online</span>
                            </div>

                            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                            </button>

                            {/* User Profile Dropdown */}
                            <div className="relative group">
                                <button 
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition border border-transparent hover:border-white/5"
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 to-blue-600">
                                            <img 
                                                src={currentUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatarSeed}`} 
                                                alt="User" 
                                                className="w-full h-full rounded-full bg-slate-800 object-cover"
                                            />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-xs font-bold text-white leading-none">{currentUser.name.split(' ')[0]}</p>
                                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{currentUser.role.split(' / ')[0]}</p>
                                    </div>
                                    <ChevronDown size={12} className="text-slate-500 hidden md:block" />
                                </button>

                                {/* User Menu Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in">
                                        <div className="p-5 border-b border-white/10 flex flex-col items-center">
                                            <div className="relative w-20 h-20 mb-3 group/photo cursor-pointer">
                                                <img src={currentUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatarSeed}`} className="w-full h-full rounded-full object-cover border-2 border-white/20" />
                                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition gap-2">
                                                    <button onClick={startCamera} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Camera size={16} className="text-white"/></button>
                                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Upload size={16} className="text-white"/></button>
                                                </div>
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                                            <h3 className="font-bold text-white">{currentUser.name}</h3>
                                            <p className="text-xs text-slate-400">{currentUser.role}</p>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                            {AVAILABLE_USERS.map(u => (
                                                <button key={u.id} onClick={() => handleSwitchUser(u)} className="w-full text-left px-5 py-3 hover:bg-white/5 flex items-center justify-between group/item transition">
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed}`} className="w-8 h-8 rounded-full" />
                                                        <span className={`text-sm font-medium ${currentUser.id === u.id ? 'text-cyan-400' : 'text-slate-300'}`}>{u.name}</span>
                                                    </div>
                                                    {currentUser.id === u.id && <Check size={14} className="text-cyan-400" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-white/10">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full text-left px-5 py-3 hover:bg-red-500/10 flex items-center gap-3 text-red-400 transition rounded-xl"
                                            >
                                                <LogOut size={16} />
                                                <span className="text-sm font-bold">Keluar Sistem</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Trigger */}
                            <button 
                                onClick={() => setIsAiChatOpen(!isAiChatOpen)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-900/20 hover:scale-105 transition active:scale-95"
                            >
                                <Sparkles className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* View Render */}
                <div className="max-w-[1800px] mx-auto w-full pb-32 md:pb-0">
                    {renderContent()}
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}
            {!isTvMode && (
                <BottomNav currentView={currentView} onViewChange={handleNavigate} />
            )}

            {/* Global Anjelo Trigger FAB */}
            <div className="fixed bottom-32 right-6 z-[100] flex flex-col items-end gap-3">
                {/* Scanner Trigger */}
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className="relative group"
                >
                    <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-500"></div>
                    <button 
                        onClick={() => setIsScannerOpen(true)}
                        className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(6,182,212,0.6)] text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 group"
                    >
                        <QrCode size={24} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Pindai QR / Barcode
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="relative group"
                >
                    <div className="absolute -inset-4 bg-orange-500/20 blur-2xl rounded-full group-hover:bg-orange-500/40 transition-all duration-500"></div>
                    <button 
                        onClick={() => triggerAnjelo()}
                        className="relative w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(249,115,22,0.6)] text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 group"
                    >
                        <Truck size={24} className="group-hover:rotate-12 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Plus size={10} className="text-orange-600 font-bold" />
                        </div>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Panggil Anjelo
                    </div>
                </motion.div>
            </div>

            <AnjeloSystem isOpen={anjeloState.isOpen} onClose={closeAnjelo} user={currentUser} initialService={anjeloState.service} initialNote={anjeloState.note} />
            <ScannerOverlay 
                isOpen={isScannerOpen} 
                onClose={() => setIsScannerOpen(false)} 
                onScanSuccess={handleScanSuccess} 
            />
            <AiAssistant 
                isOpen={isAiChatOpen} 
                onClose={() => setIsAiChatOpen(false)} 
                currentView={currentView}
                onNavigate={handleNavigate}
                onAnjelo={triggerAnjelo}
                context={aiContext || undefined}
            />
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} onNavigate={handleNavigate} />

            {/* Notification Overlay */}
            <div className="fixed top-24 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 fade-in duration-300 min-w-[300px]">
                        <div className={`w-2 h-10 rounded-full ${
                            n.type === 'success' ? 'bg-emerald-500' : 
                            n.type === 'error' ? 'bg-red-500' : 
                            n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{n.type}</p>
                            <p className="text-sm text-white font-medium">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
