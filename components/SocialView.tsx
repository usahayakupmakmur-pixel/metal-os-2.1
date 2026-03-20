
import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, MessageSquare, MapPin, ThumbsUp, MessageCircle, Plus, CheckCircle, Clock, AlertTriangle, Filter, User, Share2, Video, PhoneCall, Facebook, Instagram, Youtube, Send, Globe, X, Camera, Image as ImageIcon, MoreHorizontal, Heart, RefreshCw, PlayCircle, Mic, Paperclip, Smile, ArrowLeft, MoreVertical, Play, Map, List, ExternalLink, Navigation, Users, Map as MapIcon, Hand, PenTool, Hexagon, Eraser, Undo, MousePointer2, Radio, LayoutGrid, Cone, Stethoscope, Trash2, ShieldAlert, QrCode, Bell, LogIn } from 'lucide-react';
import { WARGA_CONTACTS, AVAILABLE_USERS } from '../constants';
import { WargaContact, SocialReport, SocialPost, Comment, CitizenProfile } from '../types';
import GeospatialEngine from './GeospatialEngine';
import { 
    db, auth, googleProvider, signInWithPopup, onAuthStateChanged, 
    collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, limit, 
    Timestamp, handleFirestoreError, OperationType, User as FirebaseUser, setDoc 
} from '../firebase';

// Error Boundary Component
interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    constructor(props: ErrorBoundaryProps) {
        super(props);
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-red-800 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-red-600 mb-4">Maaf, aplikasi mengalami kendala teknis.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition"
                    >
                        Muat Ulang Halaman
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-4 p-4 bg-black text-green-400 text-left text-xs overflow-auto rounded-lg">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }
        return (this as any).props.children;
    }
}

interface ChatConversation {
    id: string;
    contactId: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatarSeed: string;
    status: 'online' | 'offline';
    type: 'private' | 'group';
}

interface ChatMessage {
    id: string;
    sender: 'me' | 'other';
    text: string;
    time: string;
    status: 'sent' | 'delivered' | 'read';
    isLocation?: boolean;
}

const INITIAL_CHATS: ChatConversation[] = [
    { id: 'g1', contactId: 'g1', name: 'Warga RW 07 (Official)', lastMessage: 'Kerja bakti minggu ini dimulai jam 7.', time: '10:45', unread: 5, avatarSeed: 'RW07', status: 'online', type: 'group' },
    { id: 'c1', contactId: 'c1', name: 'Pak Lurah', lastMessage: 'Siap, berkas sudah saya terima.', time: '10:30', unread: 0, avatarSeed: 'Joko', status: 'online', type: 'private' },
    { id: 'c2', contactId: 'c2', name: 'Bu Siti (Kader)', lastMessage: 'Jangan lupa jadwal posyandu besok ya.', time: 'Kemarin', unread: 2, avatarSeed: 'Siti', status: 'offline', type: 'private' },
    { id: 'c3', contactId: 'c4', name: 'Poskamling RW 02', lastMessage: 'Aman terkendali, Pak.', time: 'Kemarin', unread: 0, avatarSeed: 'Agus', status: 'online', type: 'private' }
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
    'c1': [
        { id: 'm1', sender: 'me', text: 'Pak Lurah, surat pengantar saya bagaimana?', time: '10:00', status: 'read' },
        { id: 'm2', sender: 'other', text: 'Sudah diproses mas, tinggal tanda tangan.', time: '10:15', status: 'read' },
        { id: 'm3', sender: 'other', text: 'Siap, berkas sudah saya terima.', time: '10:30', status: 'read' }
    ],
    'g1': [
        { id: 'gm1', sender: 'other', text: 'Bapak-bapak, jangan lupa siskamling nanti malam giliran RT 02.', time: '08:00', status: 'read' },
        { id: 'gm2', sender: 'me', text: 'Siap pak RT.', time: '08:15', status: 'read' },
        { id: 'gm3', sender: 'other', text: 'Kerja bakti minggu ini dimulai jam 7.', time: '10:45', status: 'read' }
    ]
};

const INITIAL_POSTS: SocialPost[] = [
    {
        id: 'yt_1',
        platform: 'YOUTUBE',
        author: 'Payungi TV',
        time: '2 hari lalu',
        content: 'Profil Pasar Yosomulyo Pelangi (Payungi) - Menggerakkan Ekonomi Warga Melalui Pasar Kreatif #Payungi #MetroLampung',
        videoDuration: '03:45',
        likes: 245,
        comments: 42,
        isLiked: false,
        videoId: 'jZJfrSU83FY'
    },
    {
        id: 'ig_1',
        platform: 'INSTAGRAM',
        author: 'pasarpayungi',
        time: '5 jam lalu',
        content: 'Suasana pagi ini di Pasar Payungi! 🌿 Terima kasih untuk semua pengunjung yang sudah meramaikan. Jangan lupa mampir ke stand kuliner jadul ya! #Payungi #MetroLampung #WisataDesa',
        image: true,
        likes: 320,
        comments: 18,
        isLiked: false
    },
    {
        id: 'fb_1',
        platform: 'FACEBOOK',
        author: 'Kelurahan Yosomulyo Official',
        time: 'Kemarin',
        content: 'Gotong royong persiapan Festival Payungi minggu depan. Terima kasih kepada Karang Taruna dan warga RW 07 yang sudah berpartisipasi membersihkan area parkir dan stand.',
        image: true,
        likes: 88,
        comments: 15,
        isLiked: false
    }
];

interface SocialViewProps {
  onOpenAiAssistant?: () => void;
  onOpenScanner?: () => void;
  pendingUserId?: string | null;
  addNotification?: (title: string, type: string) => void;
}

const SocialView: React.FC<SocialViewProps> = ({ onOpenAiAssistant, onOpenScanner, pendingUserId, addNotification }) => {
  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'REPORTS' | 'SOCIAL_MEDIA' | 'CHAT'>('REPORTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // --- AUTH STATE ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      
      // Sync user profile to Firestore
      const userRef = doc(db, 'users', u.uid);
      await setDoc(userRef, {
        uid: u.uid,
        displayName: u.displayName || 'Warga Yosomulyo',
        photoURL: u.photoURL || '',
        email: u.email || '',
        role: 'user', // Default role
        lastSeen: Timestamp.now()
      }, { merge: true });

      addNotification?.("Berhasil masuk!", "success");
    } catch (error) {
      console.error("Login error:", error);
      addNotification?.("Gagal masuk. Silakan coba lagi.", "error");
    }
  };

  // --- REPORTS STATE ---
  const [reports, setReports] = useState<SocialReport[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Sync Reports from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Baru saja'
      })) as SocialReport[];
      setReports(reportsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reports'));
    return () => unsubscribe();
  }, [isAuthReady]);

  // Handle external user selection
  useEffect(() => {
    if (pendingUserId) {
        const contact = WARGA_CONTACTS.find(c => c.id === pendingUserId);
        if (contact) {
            setSelectedProfileId(contact.id);
            setActiveTab('CONTACTS');
        }
    }
  }, [pendingUserId]);
  const [newReport, setNewReport] = useState<{ title: string, description: string, type: string, location: string, coordinates?: {lat: number, lng: number} }>({ 
      title: '', description: '', type: 'INFRASTRUCTURE', location: '' 
  });
  const [reportViewMode, setReportViewMode] = useState<'LIST' | 'MAP'>('MAP');
  const [selectedMapReport, setSelectedMapReport] = useState<SocialReport | null>(null);
  const [drawingMode, setDrawingMode] = useState<'NAVIGATE' | 'MARKER' | 'LINE' | 'POLY' | 'ERASER'>('NAVIGATE');
  
  const filteredReports = reports.filter(report => 
    (selectedFilter === 'ALL' || report.type === selectedFilter) &&
    (report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     report.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const reportMarkers = React.useMemo(() => {
    const getMarkerIconHtml = (type: string) => {
      const iconSize = 16;
      const color = "white";
      switch(type) {
        case 'INFRASTRUCTURE': 
          return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 22h20L12 2z"/><path d="M12 18v-4"/><path d="M12 10V6"/></svg>`;
        case 'HEALTH':
          return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
        case 'TRASH':
          return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
        case 'SECURITY':
          return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`;
        default:
          return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      }
    };

    return filteredReports.map(report => ({
      id: report.id,
      position: report.coordinates || { lat: -5.1186, lng: 105.3072 },
      title: report.title,
      type: 'REPORT' as const,
      data: report,
      color: report.type === 'INFRASTRUCTURE' ? '#3b82f6' : 
             report.type === 'TRASH' ? '#10b981' : 
             report.type === 'HEALTH' ? '#f59e0b' : '#ef4444',
      iconHtml: getMarkerIconHtml(report.type)
    }));
  }, [filteredReports]);

  // --- LOCATION TRACKING STATE ---
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // --- BROADCAST STATE ---
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  // --- CONTACTS STATE ---
  const [callingContact, setCallingContact] = useState<string | null>(null);

  // --- FEED STATE ---
  const [feedPosts, setFeedPosts] = useState<SocialPost[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  // Sync Posts from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleDateString() || 'Baru saja'
      })) as SocialPost[];
      setFeedPosts(postsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));
    return () => unsubscribe();
  }, [isAuthReady]);

  // --- CHAT STATE ---
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  // Sync Messages from Firestore
  useEffect(() => {
    if (!user || !activeChatId) return;
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sender: doc.data().senderId === auth.currentUser?.uid ? 'me' : 'other',
        time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })) as ChatMessage[];
      
      setMessages(prev => ({
        ...prev,
        [activeChatId]: msgs
      }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));
    return () => unsubscribe();
  }, [isAuthReady, activeChatId]);

  // Logic: Filter Contacts
  const filteredContacts = WARGA_CONTACTS.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.rw.includes(searchQuery)
  );

  // Logic: Filter Chats
  const filteredChats = conversations.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedReport = reports.find(r => r.id === selectedReportId);
  const selectedProfile = AVAILABLE_USERS.find(u => u.id === selectedProfileId) || WARGA_CONTACTS.find(c => c.id === selectedProfileId);

  // Cleanup GPS Watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const toggleLocationTracking = () => {
    if (isTracking) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
      setUserLocation(null);
    } else {
      // Start tracking
      if ('geolocation' in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error tracking location:", error);
            alert("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
            setIsTracking(false);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        watchIdRef.current = id;
        setIsTracking(true);
      } else {
        alert("Geolocation tidak didukung di browser ini.");
      }
    }
  };

  const handleGetLocationForReport = () => {
      if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
              setNewReport(prev => ({
                  ...prev,
                  location: 'Koordinat GPS Terkunci',
                  coordinates: {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  }
              }));
          }, (error) => {
              alert("Gagal mengambil lokasi. Pastikan GPS aktif.");
          });
      }
  };

  // Handler: Submit Report
  const handleSubmitReport = async () => {
      if (!newReport.title || !newReport.description || !user) return;
      
      try {
        const reportData = {
            title: newReport.title,
            description: newReport.description,
            type: newReport.type,
            location: newReport.location || 'Lokasi Saya',
            authorId: user.uid,
            authorName: user.displayName || 'Anonim',
            status: 'PENDING',
            votes: 0,
            voters: [],
            coordinates: newReport.coordinates || { lat: -5.1186, lng: 105.3072 },
            createdAt: Timestamp.now()
        };

        await addDoc(collection(db, 'reports'), reportData);
        setIsReportModalOpen(false);
        setNewReport({ title: '', description: '', type: 'INFRASTRUCTURE', location: '' });
        addNotification?.("Laporan berhasil dikirim!", "success");
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'reports');
      }
  };

  // Handler: Submit Social Post
  const handleCreatePost = async () => {
      if (!newPostContent.trim() || !user) return;

      try {
        const postData = {
            authorId: user.uid,
            authorName: user.displayName || 'Anonim',
            authorAvatar: user.photoURL || '',
            content: newPostContent,
            likes: 0,
            comments: 0,
            shares: 0,
            likedBy: [],
            createdAt: Timestamp.now()
        };

        await addDoc(collection(db, 'posts'), postData);
        setIsPostModalOpen(false);
        setNewPostContent('');
        addNotification?.("Postingan berhasil dibagikan!", "success");
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'posts');
      }
  };

  // Handler: Vote Report
  const handleVote = async (id: string) => {
      if (!user) return;
      const report = reports.find(r => r.id === id);
      if (!report) return;

      try {
        const reportRef = doc(db, 'reports', id);
        await updateDoc(reportRef, {
            votes: (report.votes || 0) + 1,
            voters: [...(report.voters || []), user.uid]
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `reports/${id}`);
      }
  };

  // Handler: Broadcast
  const handleBroadcast = () => {
      if (!broadcastMsg) return;
      setBroadcastStatus('SENDING');
      setTimeout(() => {
          setBroadcastStatus('SENT');
          setBroadcastMsg('');
          setTimeout(() => setBroadcastStatus('IDLE'), 3000);
      }, 2000);
  };

  // Handler: Call Simulation
  const handleCall = (name: string) => {
      setCallingContact(name);
      setTimeout(() => setCallingContact(null), 3000);
  };

  // Handler: Send Chat Message
  const handleSendMessage = async (isLocationShare = false) => {
      if ((!chatInput.trim() && !isLocationShare) || !activeChatId || !user) return;
      
      try {
        const msgData = {
            senderId: user.uid,
            receiverId: activeChatId, // Simplified for demo
            text: isLocationShare ? '📍 Membagikan Lokasi Terkini' : chatInput,
            createdAt: Timestamp.now(),
            read: false,
            isLocation: isLocationShare
        };

        await addDoc(collection(db, 'messages'), msgData);
        setChatInput('');

        if (!isLocationShare) {
            addNotification?.("Pesan dikirim!", "success");
        } else {
            addNotification?.("Lokasi dibagikan!", "info");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'messages');
      }
  };

  // Handler: Toggle Like Post
  const toggleLikePost = async (id: string) => {
      if (!user) return;
      const post = feedPosts.find(p => p.id === id);
      if (!post) return;

      try {
        const postRef = doc(db, 'posts', id);
        const isLiked = post.likedBy?.includes(user.uid);
        await updateDoc(postRef, {
            likes: (post.likes || 0) + (isLiked ? -1 : 1),
            likedBy: isLiked 
                ? post.likedBy?.filter(uid => uid !== user.uid) 
                : [...(post.likedBy || []), user.uid]
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `posts/${id}`);
      }
  };

  // Helper: Generate Mock Posts
  const generateMorePosts = () => {
      setIsLoadingMore(true);
      setTimeout(() => {
          const newPosts: SocialPost[] = [
              {
                  id: `yt_2_${Date.now()}`,
                  platform: 'YOUTUBE',
                  author: 'Payungi TV',
                  time: '3 hari lalu',
                  content: 'Geliat Senam Pagi di Payungi University - Sehat Bersama Warga! #SenamSehat #Payungi',
                  videoDuration: '08:12',
                  likes: 156,
                  comments: 23,
                  isLiked: false,
                  videoId: 'O83bI3WoXUQ'
              },
              {
                  id: `fb_2_${Date.now()}`,
                  platform: 'FACEBOOK',
                  author: 'Bank Sampah Yosomulyo',
                  time: '4 hari lalu',
                  content: 'Total penukaran sampah minggu ini mencapai 500kg! Terima kasih warga Yosomulyo yang konsisten memilah sampah. Reward kuota internet sudah didistribusikan. ♻️📶',
                  image: false,
                  likes: 67,
                  comments: 10,
                  isLiked: false
              }
          ];
          setFeedPosts(prev => [...prev, ...newPosts]);
          setIsLoadingMore(false);
      }, 1500);
  };

  const CommentSection = ({ comments, onAddComment }: { comments?: Comment[], onAddComment: (text: string) => void }) => {
    const [newComment, setNewComment] = useState('');

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    B
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Tulis komentar..."
                        className="w-full bg-gray-100 border-none rounded-full py-2 px-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newComment.trim()) {
                                onAddComment(newComment);
                                setNewComment('');
                            }
                        }}
                    />
                    <button 
                        onClick={() => {
                            if (newComment.trim()) {
                                onAddComment(newComment);
                                setNewComment('');
                            }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {comments?.map((comment, i) => (
                    <motion.div 
                        key={comment.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden">
                            {comment.avatarSeed ? (
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.avatarSeed}`} alt={comment.author} />
                            ) : comment.author[0]}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-900">{comment.author}</span>
                                <span className="text-[10px] text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{comment.text}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
  };

  const getReportIcon = (type: string) => {
      switch(type) {
          case 'INFRASTRUCTURE': return <Cone className="text-orange-500" />;
          case 'HEALTH': return <Stethoscope className="text-red-500" />;
          case 'TRASH': return <Trash2 className="text-green-500" />;
          case 'SECURITY': return <ShieldAlert className="text-blue-500" />;
          default: return <AlertTriangle className="text-slate-500" />;
      }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200">Menunggu</span>;
          case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Diproses</span>;
          case 'RESOLVED': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">Selesai</span>;
          default: return null;
      }
  };

  // Helper to calculate mock map positions
  const getMapPosition = (coords?: { lat: number; lng: number }) => {
      if (!coords) return { top: '50%', left: '50%' };
      // Yosomulyo approximate center/bounds for demo normalization
      const latCenter = -5.1180;
      const lngCenter = 105.3070;
      const scale = 3000; // Multiplier to spread points
      
      const top = 50 + (coords.lat - latCenter) * scale;
      const left = 50 + (coords.lng - lngCenter) * scale;
      
      return { 
          top: `${Math.max(10, Math.min(90, top))}%`, 
          left: `${Math.max(10, Math.min(90, left))}%` 
      };
  };

  const socialNavItems = [
      { id: 'REPORTS', label: 'Lapor', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', activeBg: 'bg-red-600' },
      { id: 'CONTACTS', label: 'Kontak', icon: User, color: 'text-blue-600', bg: 'bg-blue-50', activeBg: 'bg-blue-600' },
      { id: 'CHAT', label: 'Pesan', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', activeBg: 'bg-green-600' },
      { id: 'SOCIAL_MEDIA', label: 'Medsos', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', activeBg: 'bg-purple-600' },
  ];

  const reportCategories = [
      { id: 'ALL', label: 'Semua', icon: LayoutGrid, color: 'bg-slate-100 text-slate-600' },
      { id: 'INFRASTRUCTURE', label: 'Infrastruktur', icon: Cone, color: 'bg-orange-100 text-orange-600' },
      { id: 'HEALTH', label: 'Kesehatan', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
      { id: 'TRASH', label: 'Kebersihan', icon: Trash2, color: 'bg-green-100 text-green-600' },
      { id: 'SECURITY', label: 'Keamanan', icon: ShieldAlert, color: 'bg-blue-100 text-blue-600' },
  ];

  return (
    <ErrorBoundary>
    <div className="space-y-6 relative pb-20 md:pb-0">
      
      {/* Auth Overlay */}
      {!user && isAuthReady && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full mx-4 border border-slate-200">
                  <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                      <Users size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
                  <p className="text-slate-500 mb-8 text-sm leading-relaxed">Masuk dengan akun Google Anda untuk mulai berinteraksi dengan warga Yosomulyo.</p>
                  <button 
                    onClick={handleLogin}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-slate-900/20"
                  >
                      <LogIn size={20} /> Masuk dengan Google
                  </button>
              </div>
          </div>
      )}
      
      {/* Call Overlay */}
      {callingContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="text-center text-white">
                  <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse ring-4 ring-slate-600">
                      <User size={48} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{callingContact}</h2>
                  <p className="text-green-400 text-sm tracking-widest uppercase">Memanggil via Warga-Net...</p>
                  <div className="mt-2 text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full inline-block">
                      VoIP Mesh Network • Encrypted
                  </div>
                  <button 
                    onClick={() => setCallingContact(null)}
                    className="mt-12 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition active:scale-95"
                  >
                      <PhoneCall size={32} className="rotate-135" />
                  </button>
              </div>
          </div>
      )}

      {/* Header Hero (Desktop & Mobile) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden"
      >
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <Users size={120} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Pusat Koneksi</h2>
              <p className="text-indigo-100 text-sm md:text-base">Lapor masalah, cari kontak, dan diskusi dengan warga.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAiAssistant}
              className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition flex items-center gap-2"
            >
              <MessageSquare size={16} /> Tanya AI
            </motion.button>
          </div>
      </motion.div>

      {/* MOBILE NAVIGATION: ICON GRID */}
      <div className="md:hidden grid grid-cols-4 gap-3 px-1">
          {socialNavItems.map((item, i) => {
              const isActive = activeTab === item.id;
              return (
                  <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveTab(item.id as any)}
                      className="flex flex-col items-center gap-2 group transition-all duration-300"
                  >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${isActive ? `${item.activeBg} text-white shadow-lg scale-105` : `bg-white border border-slate-100 ${item.color}`}`}>
                          <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-500'}`}>
                          {item.label}
                      </span>
                  </motion.button>
              );
          })}
      </div>

      {/* DESKTOP NAVIGATION: TABS */}
      <div className="hidden md:flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1 overflow-hidden sticky top-0 z-20">
          {socialNavItems.map((item) => (
              <motion.button 
                key={item.id}
                whileHover={{ backgroundColor: activeTab === item.id ? undefined : 'rgba(0,0,0,0.02)' }}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition flex items-center justify-center space-x-2 ${activeTab === item.id ? `${item.activeBg} text-white shadow-md` : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  <item.icon size={18} /> <span>{item.label}</span>
              </motion.button>
          ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col overflow-hidden">
          
          {/* Toolbar - Adjusted for Mobile Friendly Sub-menu */}
          {activeTab !== 'SOCIAL_MEDIA' && (!activeChatId || activeTab !== 'CHAT') && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-b border-slate-200 flex flex-col gap-4 justify-between bg-white z-10 rounded-t-2xl"
            >
                
                {/* Search Bar - Always Visible */}
                <div className="flex gap-2 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder={activeTab === 'CONTACTS' ? "Cari nama, peran, atau RW..." : activeTab === 'CHAT' ? "Cari percakapan..." : "Cari laporan..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                        />
                    </div>
                    <button 
                        onClick={onOpenScanner}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                        title="Scan QR Code"
                    >
                        <QrCode size={20} />
                    </button>
                </div>
                
                {/* Sub-Menu for Reports (Icon Grid Style) */}
                {activeTab === 'REPORTS' && (
                    <div className="flex flex-col gap-3">
                        {/* Map View Toggles */}
                        <div className="flex justify-between items-center">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setReportViewMode('LIST')}
                                    className={`p-1.5 rounded-md transition ${reportViewMode === 'LIST' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="List View"
                                >
                                    <List size={16} />
                                </button>
                                <button 
                                    onClick={() => setReportViewMode('MAP')}
                                    className={`p-1.5 rounded-md transition ${reportViewMode === 'MAP' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Map View"
                                >
                                    <Map size={16} />
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setIsReportModalOpen(true)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-transform active:scale-95"
                            >
                                <Plus size={14} /> <span>Buat Laporan</span>
                            </button>
                        </div>

                        {/* Category Icon Grid - Mobile Friendly Scrollable */}
                        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
                            {reportCategories.map((cat) => {
                                const isSelected = selectedFilter === cat.id;
                                return (
                                    <motion.button
                                        key={cat.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedFilter(cat.id)}
                                        className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${
                                            isSelected 
                                            ? `${cat.color} border-transparent ring-2 ring-black/5 shadow-md scale-105` 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                    >
                                        <cat.icon size={18} />
                                        <span className="text-xs font-bold whitespace-nowrap">{cat.label}</span>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                )}
                
                {activeTab === 'CHAT' && (
                    <div className="flex justify-end">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 hover:bg-green-700 shadow-lg shadow-green-600/20">
                            <MessageCircle size={16} /> <span>Pesan Baru</span>
                        </button>
                    </div>
                )}
            </motion.div>
          )}

          {/* Content Area */}
          <div className={`flex-1 rounded-b-2xl ${activeTab === 'CHAT' && activeChatId ? 'p-0' : 'p-4 md:p-6 bg-slate-50'}`}>
              <AnimatePresence mode="wait">
                  <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                  >
                      {/* Contacts Grid */}
                      {activeTab === 'CONTACTS' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredContacts.map((contact, i) => (
                                  <motion.div 
                                    key={contact.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-start space-x-4 group cursor-pointer"
                                    onClick={() => setSelectedProfileId(contact.id)}
                                  >
                              <div className="relative">
                                  <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`} alt={contact.name} />
                                  </div>
                                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${contact.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-slate-800 truncate">{contact.name}</h3>
                                  <p className="text-xs text-blue-600 font-medium mb-1">{contact.role}</p>
                                  <div className="flex items-center text-xs text-slate-500 mb-3">
                                      <MapPin size={12} className="mr-1" /> RW {contact.rw}
                                  </div>
                                  <div className="flex space-x-2">
                                      <a 
                                        href={`tel:${contact.phone || '+628123456789'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCall(contact.name);
                                        }}
                                        className="flex-1 bg-blue-500/10 text-blue-400 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1 hover:bg-blue-500/20 transition active:scale-95 border border-blue-500/20"
                                      >
                                          <PhoneCall size={12} /> <span>Call</span>
                                      </a>
                                      <a 
                                        href={`https://wa.me/${(contact.phone || '628123456789').replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(contact.name)},%20saya%20ingin%20bertanya%20mengenai%20${encodeURIComponent(contact.role)}.`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 bg-emerald-500/10 text-emerald-400 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1 hover:bg-emerald-500/20 transition active:scale-95 border border-emerald-500/20 shadow-sm"
                                      >
                                          <MessageCircle size={12} /> <span>WhatsApp</span>
                                      </a>
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                  </div>
              )}

              {/* Chat App */}
              {activeTab === 'CHAT' && (
                  !activeChatId ? (
                      <div className="space-y-2">
                          {filteredChats.map((chat, i) => (
                              <motion.div 
                                key={chat.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer flex items-center space-x-4 ${chat.type === 'group' ? 'bg-blue-50/50 border-blue-100' : ''}`}
                              >
                                  <div className="relative">
                                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                          {chat.type === 'group' ? (
                                              <Users size={20} className="text-slate-600" />
                                          ) : (
                                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.avatarSeed}`} alt={chat.name} />
                                          )}
                                      </div>
                                      {chat.status === 'online' && (
                                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-center mb-1">
                                          <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1">
                                              {chat.name} {chat.type === 'group' && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded">GROUP</span>}
                                          </h4>
                                          <span className={`text-xs ${chat.unread > 0 ? 'text-green-600 font-bold' : 'text-slate-400'}`}>{chat.time}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                          <p className={`text-xs truncate flex-1 ${chat.unread > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                              {chat.lastMessage}
                                          </p>
                                          {chat.unread > 0 && (
                                              <div className="ml-2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                  {chat.unread}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  ) : (
                      <div className="flex flex-col h-full bg-slate-100 rounded-b-2xl overflow-hidden">
                          {/* ... Chat Detail View ... (unchanged) */}
                          <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                              <div className="flex items-center space-x-3">
                                  <button onClick={() => setActiveChatId(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                                      <ArrowLeft size={20} />
                                  </button>
                                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                      {conversations.find(c => c.id === activeChatId)?.type === 'group' ? (
                                          <Users size={20} className="text-slate-600" />
                                      ) : (
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversations.find(c => c.id === activeChatId)?.avatarSeed}`} alt="User" />
                                      )}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-sm text-slate-800">{conversations.find(c => c.id === activeChatId)?.name}</h3>
                                      <p className="text-xs text-green-600 flex items-center">
                                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></span> Online
                                      </p>
                                  </div>
                              </div>
                              <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleCall(conversations.find(c => c.id === activeChatId)?.name || 'User')}
                                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 transition active:scale-95 border border-blue-500/20"
                                    title="Panggil via Warga-Net"
                                  >
                                      <PhoneCall size={20} />
                                  </button>
                                  <a 
                                    href={`https://wa.me/628123456789`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-400 transition active:scale-95 border border-emerald-500/20"
                                    title="Buka di WhatsApp"
                                  >
                                      <MessageCircle size={20} />
                                  </a>
                                  <button className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 border border-white/5">
                                      <MoreVertical size={20} />
                                  </button>
                              </div>
                          </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efe7dd] bg-opacity-30">
                                  <AnimatePresence>
                                  {messages[activeChatId]?.map((msg, i) => (
                                      <motion.div 
                                        key={msg.id} 
                                        initial={{ opacity: 0, x: msg.sender === 'me' ? 20 : -20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                      >
                                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm relative group ${
                                              msg.sender === 'me' 
                                              ? 'bg-green-100 text-slate-800 rounded-tr-none' 
                                              : 'bg-white text-slate-800 rounded-tl-none'
                                          }`}>
                                              {msg.isLocation ? (
                                                  <div className="flex items-center gap-2 font-bold text-blue-600">
                                                      <MapIcon size={16} /> {msg.text}
                                                  </div>
                                              ) : (
                                                  <p>{msg.text}</p>
                                              )}
                                              <div className="flex items-center justify-end space-x-1 mt-1 opacity-70">
                                                  <span className="text-[10px]">{msg.time}</span>
                                                  {msg.sender === 'me' && (
                                                      <span className={msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}>
                                                          <CheckCircle size={10} />
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                      </motion.div>
                                  ))}
                                  </AnimatePresence>
                              </div>

                          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                              <button 
                                className="p-2 text-slate-400 hover:text-blue-600 transition hover:bg-blue-50 rounded-full"
                                title="Bagikan Lokasi"
                                onClick={() => handleSendMessage(true)}
                              >
                                  <MapIcon size={20} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-slate-600 transition hover:bg-slate-100 rounded-full">
                                  <Plus size={20} />
                              </button>
                              <div className="flex-1 relative">
                                  <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(false)}
                                    placeholder="Ketik pesan..." 
                                    className="w-full bg-slate-100 rounded-full py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                      <Smile size={18} />
                                  </button>
                              </div>
                              {chatInput.trim() ? (
                                  <button 
                                    onClick={() => handleSendMessage(false)}
                                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition shadow-sm"
                                  >
                                      <Send size={18} />
                                  </button>
                              ) : (
                                  <button className="p-2 bg-slate-200 text-slate-500 rounded-full">
                                      <Mic size={18} />
                                  </button>
                              )}
                          </div>
                      </div>
                  )
              )}

              {/* Reports Feed & Map Integration */}
              {activeTab === 'REPORTS' && (
                  <div className="h-full">
                  {reportViewMode === 'LIST' ? (
                      <div className="space-y-4 max-w-3xl mx-auto">
                          {filteredReports.map((report, i) => (
                              <motion.div 
                                key={report.id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => setSelectedReportId(report.id)}
                              >
                                  <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                      <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${report.author}`} alt={report.author} />
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-sm text-slate-800">{report.author}</h4>
                                              <p className="text-xs text-slate-400 flex items-center">
                                                  <Clock size={10} className="mr-1" /> {report.date} • <MapPin size={10} className="ml-2 mr-1" /> {report.location}
                                              </p>
                                          </div>
                                      </div>
                                      {getStatusBadge(report.status)}
                                  </div>
                                  
                                  <div className="p-4">
                                      <div className="flex items-start space-x-3 mb-2">
                                          <div className="mt-1 p-2 bg-slate-100 rounded-lg">{getReportIcon(report.type)}</div>
                                          <div>
                                              <h3 className="font-bold text-slate-800 text-lg leading-tight">{report.title}</h3>
                                              <p className="text-slate-600 text-sm leading-relaxed mt-1">{report.description}</p>
                                          </div>
                                      </div>
                                      {/* Map Integration Button */}
                                      {report.coordinates && (
                                          <div className="mt-4 pl-12">
                                              <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${report.coordinates.lat},${report.coordinates.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                                              >
                                                  <Map size={14} />
                                                  <span>Lihat di Google Maps</span>
                                              </a>
                                          </div>
                                      )}
                                  </div>

                                  <div className="bg-white px-4 py-3 flex justify-between items-center border-t border-slate-100">
                                      <div className="flex space-x-4">
                                          <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(report.id);
                                            }}
                                            className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 text-sm font-medium transition group"
                                          >
                                              <ThumbsUp size={16} className="group-hover:scale-110 transition-transform" /> 
                                              <span>{report.votes}</span>
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedReportId(report.id);
                                            }}
                                            className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 text-sm font-medium transition"
                                          >
                                              <MessageCircle size={16} /> <span>{report.comments}</span>
                                          </button>
                                      </div>
                                      <button 
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
                                      >
                                          <Share2 size={18} />
                                      </button>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  ) : (
                      <div className="relative w-full h-[600px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                          <GeospatialEngine 
                            markers={reportMarkers}
                            onMarkerClick={(marker) => setSelectedMapReport(marker.data)}
                            drawingMode={drawingMode}
                            onDrawingModeChange={setDrawingMode}
                            showUserLocation={isTracking}
                            className="w-full h-full"
                          />
                          
                          {/* Map Overlay Controls */}
                          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                              <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-2 px-1">
                                      <Filter size={14} className="text-slate-500" />
                                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Filter Peta</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                      {['INFRASTRUCTURE', 'TRASH', 'HEALTH', 'SECURITY'].map(type => (
                                          <button 
                                            key={type}
                                            onClick={() => setSelectedFilter(selectedFilter === type ? 'ALL' : type)}
                                            className={`text-[10px] px-2 py-1 rounded-md text-left transition ${
                                                selectedFilter === type ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                          >
                                              {type}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* Map Popup Info Card */}
                          {selectedMapReport && (
                              <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white rounded-xl shadow-2xl p-4 border border-slate-200 animate-in slide-in-from-bottom-4 duration-300 z-50">
                                  <button 
                                    onClick={() => setSelectedMapReport(null)}
                                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                  >
                                      <X size={16} />
                                  </button>
                                  <div className="flex items-start space-x-3 mb-3">
                                      <div className="mt-1 text-slate-500">{getReportIcon(selectedMapReport.type)}</div>
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm">{selectedMapReport.title}</h4>
                                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{selectedMapReport.description}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-4">
                                      {getStatusBadge(selectedMapReport.status)}
                                      <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${selectedMapReport.coordinates?.lat},${selectedMapReport.coordinates?.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                          Open Google Maps <ExternalLink size={10} />
                                      </a>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}

              {/* Social Media Command Center */}
              {activeTab === 'SOCIAL_MEDIA' && (
                  <div className="flex flex-col gap-6 h-full">
                      {/* 1. Community Hub (New Section) */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
                      >
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Hexagon size={18} className="text-indigo-600" />
                              Community Hub
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                  { label: 'Musrenbang', icon: PenTool, color: 'bg-blue-50 text-blue-600', desc: 'Usulan Pembangunan' },
                                  { label: 'Relawan', icon: Hand, color: 'bg-green-50 text-green-600', desc: 'Aksi Sosial' },
                                  { label: 'Event', icon: Clock, color: 'bg-purple-50 text-purple-600', desc: 'Agenda Warga' },
                                  { label: 'Polling', icon: Radio, color: 'bg-orange-50 text-orange-600', desc: 'Suara Warga' }
                              ].map((hub, idx) => (
                                  <motion.button 
                                    key={idx} 
                                    whileHover={{ y: -5, backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
                                    className="flex flex-col items-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition group"
                                  >
                                      <div className={`w-10 h-10 rounded-lg ${hub.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                          <hub.icon size={20} />
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">{hub.label}</span>
                                      <span className="text-[9px] text-slate-500">{hub.desc}</span>
                                  </motion.button>
                              ))}
                          </div>
                      </motion.div>

                      {/* 2. Community Feed */}
                      <div className="flex-1 min-h-[500px] bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto no-scrollbar flex flex-col">
                          <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-50 z-10 pb-2 border-b border-slate-200">
                              <h3 className="font-bold text-slate-800">Community Feed</h3>
                              <div className="flex gap-2">
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsPostModalOpen(true)}
                                    className="text-xs bg-purple-600 text-white font-bold px-3 py-1.5 rounded-full hover:bg-purple-700 flex items-center gap-1"
                                  >
                                      <Plus size={12} /> Tulis Status
                                  </motion.button>
                                  <button onClick={generateMorePosts} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                      <RefreshCw size={12} /> Refresh
                                  </button>
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                            <AnimatePresence>
                                {feedPosts.map((post, i) => (
                                    <motion.div 
                                        key={post.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                                    >
                                        <div className="p-3 flex items-center justify-between border-b border-slate-50">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-1.5 rounded-full text-white ${
                                                    post.platform === 'FACEBOOK' ? 'bg-blue-600' : 
                                                    post.platform === 'INSTAGRAM' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 
                                                    post.platform === 'COMMUNITY' ? 'bg-purple-600' :
                                                    'bg-red-600'
                                                }`}>
                                                    {post.platform === 'FACEBOOK' ? <Facebook size={14} /> : 
                                                    post.platform === 'INSTAGRAM' ? <Instagram size={14} /> : 
                                                    post.platform === 'COMMUNITY' ? <Users size={14} /> :
                                                    <Youtube size={14} />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-700 block">{post.platform === 'INSTAGRAM' ? `@${post.author}` : post.author}</span>
                                                    <span className="text-[10px] text-slate-400 block">{post.time}</span>
                                                </div>
                                            </div>
                                            <MoreHorizontal size={16} className="text-slate-400 cursor-pointer" />
                                        </div>
                                        
                                        {post.platform === 'YOUTUBE' ? (
                                            activeVideoId === post.id ? (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="w-full aspect-video bg-black relative group"
                                                >
                                                    <iframe 
                                                            className="w-full h-full"
                                                            src={`https://www.youtube.com/embed/${post.videoId}?autoplay=1`}
                                                            title="YouTube video player" 
                                                            frameBorder="0" 
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                            allowFullScreen
                                                        ></iframe>
                                                        <button 
                                                            onClick={() => setActiveVideoId(null)}
                                                            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                </motion.div>
                                            ) : (
                                                <div className="p-4 flex space-x-4 cursor-pointer group" onClick={() => setActiveVideoId(post.id)}>
                                                    <div className="w-32 h-20 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 shrink-0 relative overflow-hidden group-hover:ring-2 ring-blue-500 transition">
                                                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition"></div>
                                                        <div className="bg-red-600/90 rounded-full p-1.5 shadow-lg z-10 group-hover:scale-110 transition-transform">
                                                            <PlayCircle size={20} className="text-white" fill="currentColor"/>
                                                        </div>
                                                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded">{post.videoDuration}</div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-2 group-hover:text-blue-600 transition">{post.content.split(' - ')[0]}</h4>
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.content}</p>
                                                        <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400">
                                                            <span>1.2k views</span>
                                                            <span onClick={(e) => { e.stopPropagation(); toggleLikePost(post.id); }} className={`flex items-center gap-1 cursor-pointer hover:text-slate-600 ${post.isLiked ? 'text-blue-600' : ''}`}>
                                                                <ThumbsUp size={10} /> {post.likes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <>
                                                {post.image ? (
                                                    <div className="relative aspect-square max-h-64 bg-slate-100 flex items-center justify-center">
                                                        <div className="text-center text-slate-400">
                                                            <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                                            <span className="text-xs">[Photo Placeholder]</span>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="p-4">
                                                    <p className="text-sm text-slate-700 leading-relaxed">
                                                        {post.platform === 'INSTAGRAM' && <span className="font-bold mr-1">{post.author}</span>}
                                                        {post.content}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <div className="px-4 py-3 bg-slate-50 flex justify-between items-center border-t border-slate-100">
                                            <div className="flex space-x-6 text-xs font-bold text-slate-500">
                                                <button 
                                                    onClick={() => toggleLikePost(post.id)}
                                                    className={`flex items-center space-x-1 transition-transform active:scale-110 ${
                                                        post.isLiked 
                                                        ? (post.platform === 'INSTAGRAM' || post.platform === 'YOUTUBE' ? 'text-red-500' : 'text-blue-600') 
                                                        : 'hover:text-slate-700'
                                                    }`}
                                                >
                                                    {post.platform === 'FACEBOOK' ? (
                                                        <ThumbsUp size={16} className={post.isLiked ? 'fill-current' : ''} /> 
                                                    ) : (
                                                        <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                                                    )}
                                                    <span>{post.likes}</span>
                                                </button>
                                                <button className="flex items-center space-x-1 hover:text-slate-700">
                                                    <MessageCircle size={16} /> <span>{post.comments}</span>
                                                </button>
                                            </div>
                                            <button className="text-slate-400 hover:text-slate-600"><Share2 size={16} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Load More Trigger */}
                            <div className="py-4 text-center">
                                <button 
                                    onClick={generateMorePosts}
                                    disabled={isLoadingMore}
                                    className="text-xs font-bold text-slate-500 hover:text-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-full hover:bg-slate-100 transition"
                                >
                                    {isLoadingMore ? (
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <RefreshCw size={14} />
                                    )}
                                    {isLoadingMore ? 'Loading...' : 'Load More Posts'}
                                </button>
                            </div>
                          </div>
                      </div>

                      {/* 2. Admin Tools (Moved to Bottom) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Broadcast Tool */}
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden h-fit"
                          >
                              <AnimatePresence>
                                {broadcastStatus === 'SENDING' && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center"
                                    >
                                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-2"></div>
                                        <p className="text-green-600 font-bold text-sm">Broadcasting...</p>
                                    </motion.div>
                                )}
                                {broadcastStatus === 'SENT' && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-green-50 z-10 flex flex-col items-center justify-center"
                                    >
                                        <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                                        <p className="text-green-700 font-bold">Terkirim ke 450 Kontak!</p>
                                    </motion.div>
                                )}
                              </AnimatePresence>

                              <h3 className="font-bold text-slate-800 flex items-center mb-4">
                                  <div className="p-1.5 bg-green-100 text-green-600 rounded-lg mr-2">
                                      <MessageCircle size={18} />
                                  </div>
                                  WhatsApp Broadcast
                              </h3>
                              <div className="space-y-3">
                                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                      Fitur ini menggunakan WhatsApp API Gateway untuk mengirim pesan massal ke warga terdaftar.
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan</label>
                                      <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm p-2 outline-none focus:ring-2 focus:ring-green-500 transition">
                                          <option>Semua Warga RW 07 (450)</option>
                                          <option>Ibu-ibu PKK (80)</option>
                                          <option>Karang Taruna (45)</option>
                                          <option>Pedagang Pasar Payungi (120)</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1">Pesan</label>
                                      <textarea 
                                        value={broadcastMsg}
                                        onChange={(e) => setBroadcastMsg(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm p-2 outline-none h-24 resize-none focus:ring-2 focus:ring-green-500 transition"
                                        placeholder="Ketik pesan pengumuman..."
                                      ></textarea>
                                  </div>
                                  <button 
                                    onClick={handleBroadcast}
                                    disabled={!broadcastMsg}
                                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 transition shadow-sm active:scale-95"
                                  >
                                      <Send size={14} />
                                      <span>Kirim Broadcast</span>
                                  </button>
                              </div>
                          </motion.div>
                          
                          {/* Engagement Summary (Translated) */}
                          <div className="bg-slate-800 text-white rounded-xl p-5 shadow-lg h-fit">
                              <h3 className="font-bold text-sm mb-4">Ringkasan Interaksi</h3>
                              <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                      <div className="flex items-center space-x-2 text-xs">
                                          <Facebook size={14} className="text-blue-400" />
                                          <span>Jangkauan Halaman</span>
                                      </div>
                                      <span className="font-bold text-green-400">+12%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 h-1.5 rounded-full"><div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div></div>
                                  
                                  <div className="flex justify-between items-center">
                                      <div className="flex items-center space-x-2 text-xs">
                                          <Instagram size={14} className="text-purple-400" />
                                          <span>Interaksi</span>
                                      </div>
                                      <span className="font-bold text-green-400">+28%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 h-1.5 rounded-full"><div className="bg-purple-500 h-1.5 rounded-full w-1/2"></div></div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
                  </motion.div>
              </AnimatePresence>
          </div>
      </div>

      {/* CREATE REPORT MODAL */}
      <AnimatePresence>
      {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              >
                  <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold flex items-center">
                          <AlertTriangle size={18} className="mr-2" /> Buat Laporan Baru
                      </h3>
                      <button onClick={() => setIsReportModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Judul Laporan</label>
                          <input 
                            type="text" 
                            value={newReport.title}
                            onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                            placeholder="Contoh: Jalan Berlubang"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                          <select 
                            value={newReport.type}
                            onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none"
                          >
                              <option value="INFRASTRUCTURE">Infrastruktur (Jalan/Jembatan)</option>
                              <option value="HEALTH">Kesehatan (Wabah/Posyandu)</option>
                              <option value="TRASH">Lingkungan (Sampah/Banjir)</option>
                              <option value="SECURITY">Keamanan (Siskamling)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi</label>
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                              <div className="p-2 text-slate-400"><MapPin size={16} /></div>
                              <input 
                                type="text" 
                                value={newReport.location}
                                onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                                placeholder="Detail lokasi..."
                                className="w-full bg-transparent p-2 text-sm outline-none"
                              />
                              <button 
                                onClick={handleGetLocationForReport}
                                className="p-2 bg-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-300 transition"
                                title="Ambil Lokasi GPS"
                              >
                                  GPS
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi & Foto</label>
                          <textarea 
                            value={newReport.description}
                            onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                            placeholder="Jelaskan masalahnya secara detail..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none h-24 resize-none mb-2"
                          ></textarea>
                          <button className="w-full border border-dashed border-slate-300 text-slate-500 py-2 rounded-lg text-xs flex items-center justify-center hover:bg-slate-50">
                              <Camera size={14} className="mr-2" /> Tambah Foto
                          </button>
                      </div>
                      <button 
                        onClick={handleSubmitReport}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition active:scale-95"
                      >
                          Kirim Laporan
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* CREATE POST MODAL */}
      <AnimatePresence>
      {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              >
                  <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold flex items-center">
                          <MessageSquare size={18} className="mr-2" /> Tulis Status Baru
                      </h3>
                      <button onClick={() => setIsPostModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Apa yang ingin Anda bagikan ke warga?"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none h-32 resize-none mb-2 focus:ring-2 focus:ring-purple-500"
                          ></textarea>
                          <div className="flex gap-2">
                              <button className="flex-1 border border-dashed border-slate-300 text-slate-500 py-2 rounded-lg text-xs flex items-center justify-center hover:bg-slate-50">
                                  <ImageIcon size={14} className="mr-2" /> Foto / Video
                              </button>
                              <button className="flex-1 border border-dashed border-slate-300 text-slate-500 py-2 rounded-lg text-xs flex items-center justify-center hover:bg-slate-50">
                                  <MapPin size={14} className="mr-2" /> Lokasi
                              </button>
                          </div>
                      </div>
                      <button 
                        onClick={handleCreatePost}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition active:scale-95"
                      >
                          Posting
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* REPORT DETAILS MODAL */}
      <AnimatePresence>
      {selectedReportId && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">{getReportIcon(selectedReport.type)}</div>
                          <div>
                              <h3 className="font-bold text-slate-800">{selectedReport.title}</h3>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{selectedReport.type}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedReportId(null)} className="hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                          <X size={20} className="text-slate-500" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                  {selectedReport.author[0]}
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-900">{selectedReport.author}</p>
                                  <p className="text-xs text-slate-500">{selectedReport.date} • {selectedReport.location}</p>
                              </div>
                          </div>
                          {getStatusBadge(selectedReport.status)}
                      </div>

                      <p className="text-slate-700 leading-relaxed mb-6">{selectedReport.description}</p>

                      {selectedReport.photoUrl && (
                          <div className="rounded-xl overflow-hidden mb-6 border border-slate-100">
                              <img src={selectedReport.photoUrl} alt="Report" className="w-full h-auto" />
                          </div>
                      )}

                      <div className="flex items-center gap-6 py-4 border-t border-b border-slate-100 mb-6">
                          <button 
                            onClick={() => handleVote(selectedReport.id)}
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                              <ThumbsUp size={18} />
                              <span className="text-sm font-bold">{selectedReport.votes} Dukungan</span>
                          </button>
                          <div className="flex items-center gap-2 text-slate-600">
                              <MessageCircle size={18} />
                              <span className="text-sm font-bold">{selectedReport.commentList?.length || 0} Komentar</span>
                          </div>
                          <button className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors ml-auto">
                              <Share2 size={18} />
                              <span className="text-sm font-bold">Bagikan</span>
                          </button>
                      </div>

                      <h4 className="font-bold text-slate-800 mb-4">Diskusi Warga</h4>
                      <CommentSection 
                        comments={selectedReport.commentList} 
                        onAddComment={(text) => {
                            const newComment: Comment = {
                                id: `c_${Date.now()}`,
                                author: 'Anda',
                                authorId: 'u1',
                                text,
                                date: 'Baru saja',
                                avatarSeed: 'Anda'
                            };
                            setReports(prev => prev.map(r => 
                                r.id === selectedReport.id 
                                ? { ...r, commentList: [newComment, ...(r.commentList || [])], comments: (r.comments || 0) + 1 } 
                                : r
                            ));
                        }} 
                      />
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* PROFILE DETAILS MODAL */}
      <AnimatePresence>
      {selectedProfileId && selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              >
                  <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-500">
                      <button 
                        onClick={() => setSelectedProfileId(null)}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors z-10"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  <div className="px-6 pb-6 relative">
                      <div className="absolute -top-12 left-6">
                          <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                              <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(selectedProfile as any).avatarSeed || selectedProfile.name}`} alt={selectedProfile.name} className="w-full h-full object-cover" />
                              </div>
                          </div>
                      </div>
                      
                      <div className="pt-14">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h3 className="text-xl font-bold text-slate-900">{selectedProfile.name}</h3>
                                  <p className="text-indigo-600 font-bold text-sm">{(selectedProfile as any).role}</p>
                              </div>
                              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                  <CheckCircle size={12} /> Terverifikasi
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-6">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Warga Score</p>
                                  <p className="text-lg font-bold text-slate-900">{(selectedProfile as any).wargaScore || 0}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Social Points</p>
                                  <p className="text-lg font-bold text-indigo-600">{(selectedProfile as any).points || 0}</p>
                              </div>
                          </div>

                          <div className="mt-6 space-y-3">
                              <button 
                                onClick={() => handleCall(selectedProfile.name)}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-600/20"
                              >
                                  <Phone size={18} /> Hubungi Sekarang
                              </button>
                              <button 
                                onClick={() => {
                                    const chat = INITIAL_CHATS.find(c => c.contactId === selectedProfile.id);
                                    if (chat) setActiveChatId(chat.id);
                                    setActiveTab('CHAT');
                                    setSelectedProfileId(null);
                                }}
                                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95"
                              >
                                  <MessageSquare size={18} /> Kirim Pesan
                              </button>
                          </div>
                      </div>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
};

export default SocialView;
