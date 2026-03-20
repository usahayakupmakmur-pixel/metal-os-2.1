import { BudgetLineItem, CitizenProfile, IotSensor, LibraryContent, Transaction, TransactionType, CastZone, SharedFile, MarketplaceItem, WargaContact, SocialReport, RondaSchedule, SecurityCamera, PatrolLog, MarketStall, MarketLayoutItem, ParkingZone, HealthQueue, Doctor, PosyanduSchedule, ServiceProvider, Course, SchoolEvent, CityMetric, CreativeFinancingProject, OpdRole, TeamTask, Asset } from './types';

export const MOCK_USER: CitizenProfile = {
  id: 'u1',
  name: "Budi Santoso",
  wargaScore: 785,
  role: "Warga Berdaya",
  balance: 1500000,
  points: 120,
  avatarSeed: 'Budi',
  mandiriVA: '880012345678'
};

export const AVAILABLE_USERS: CitizenProfile[] = [
  {
    id: 'u1',
    name: "Budi Santoso",
    wargaScore: 785,
    role: "Warga Berdaya", // Middle class / General Citizen
    balance: 1500000,
    points: 120,
    avatarSeed: 'Budi',
    mandiriVA: '880012345678'
  },
  {
    id: 'u2',
    name: "H. Joko Purnomo",
    wargaScore: 950,
    role: "Lurah / Admin", // Administrator
    balance: 15000000,
    points: 500,
    avatarSeed: 'Joko',
    mandiriVA: '880087654321'
  },
  {
    id: 'u3',
    name: "Siti Aminah",
    wargaScore: 820,
    role: "Warga Berkarya", // MSME / Business Owner
    balance: 3200000,
    points: 210,
    avatarSeed: 'Siti',
    mandiriVA: '880011223344'
  }
];

export const BUDGET_DATA: BudgetLineItem[] = [
  { id: '1', category: 'Infrastruktur Jalan (RW 07)', allocated: 500000000, realized: 450000000, status: 'On Track' },
  { id: '2', category: 'Pemberdayaan Mocaf Hub', allocated: 200000000, realized: 180000000, status: 'On Track' },
  { id: '3', category: 'Insentif Kader Posyandu', allocated: 50000000, realized: 50000000, status: 'On Track' },
  { id: '4', category: 'Internet Warga-Net', allocated: 100000000, realized: 95000000, status: 'Warning' },
  { id: '5', category: 'Pengelolaan Sampah', allocated: 75000000, realized: 30000000, status: 'On Track' },
];

export const EOFFICE_SUMMARY = {
  totalIncoming: 142,
  thisMonth: 28,
  pendingDisposition: 5,
  waitingSignature: 3,
  processed: 134,
  urgent: 2
};

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: TransactionType.PAYMENT, amount: 25000, description: 'Jajan di Pasar Payungi', date: '2023-10-25 09:30', recipient: 'Warung Bu Siti', category: 'Commercial' },
  { id: 't2', type: TransactionType.SPLITTER_AUTO, amount: 1000, description: 'Auto-Infaq (Smart Splitter)', date: '2023-10-25 09:30', recipient: 'Dana Sosial', category: 'Social' },
  { id: 't3', type: TransactionType.TRASH_DEPOSIT, amount: 15000, description: 'Setor Sampah Plastik', date: '2023-10-24 16:00', recipient: 'Bank Sampah', category: 'Income' },
  { id: 't4', type: TransactionType.PAYMENT, amount: 50000, description: 'Bayar Iuran Keamanan (QR)', date: '2023-10-24 19:00', recipient: 'KSU Warga Berdaya', category: 'Service' },
];

export const IOT_SENSORS: IotSensor[] = [
  { id: 's1', location: 'Drainase Utama RW 02', type: 'FLOOD', value: 45, unit: 'cm', status: 'SAFE', lastUpdate: '10 min ago' },
  { id: 's2', location: 'Sentra Mocaf', type: 'AIR_QUALITY', value: 85, unit: 'AQI', status: 'SAFE', lastUpdate: '2 min ago' },
  { id: 's3', location: 'Bank Sampah Induk', type: 'WASTE_LEVEL', value: 80, unit: '%', status: 'WARNING', lastUpdate: '1 hour ago' },
];

export const STUNTING_DATA = [
  { name: 'RW 01', rate: 12 },
  { name: 'RW 02', rate: 8 },
  { name: 'RW 03', rate: 15 },
  { name: 'RW 04', rate: 5 },
  { name: 'RW 05', rate: 9 },
  { name: 'RW 06', rate: 7 },
  { name: 'RW 07', rate: 2 },
];

export const LIBRARY_CONTENT: LibraryContent[] = [
  { id: '1', title: 'Panduan Budidaya Singkong Mocaf', type: 'VIDEO', category: 'Agriculture', size: '125 MB', author: 'Tim Ahli Pertanian' },
  { id: '2', title: 'Modul Stunting & Gizi Balita', type: 'EBOOK', category: 'Health', size: '2.5 MB', author: 'Puskesmas Yosomulyo' },
  { id: '3', title: 'Matematika SD Kelas 5 - Semester 1', type: 'VIDEO', category: 'Education', size: '350 MB', author: 'RuangGuru Lokal' },
  { id: '4', title: 'Tutorial Digital Marketing UMKM', type: 'VIDEO', category: 'Education', size: '210 MB', author: 'KSU Warga Berdaya' },
  { id: '5', title: 'Sejarah Kelurahan Yosomulyo', type: 'EBOOK', category: 'Education', size: '5.0 MB', author: 'Arsip Desa' },
];

export const CAST_ZONES: CastZone[] = [
    { id: 'z1', name: 'Gapura Utama LED', status: 'PLAYING', currentContent: 'Selamat Datang di Kampung Digital', nextSchedule: 'Iklan Layanan Masyarakat: Stunting' },
    { id: 'z2', name: 'Pasar Payungi Screen', status: 'IDLE', currentContent: '-', nextSchedule: 'Promo Mocaf Hub' },
    { id: 'z3', name: 'Balai Desa Display', status: 'OFFLINE', currentContent: '-', nextSchedule: '-' },
];

export const SHARED_FILES: SharedFile[] = [
    { id: 'f1', name: 'Formulir_KK_Baru.pdf', type: 'PDF', size: '1.2 MB', owner: 'Admin Kelurahan', date: '2023-10-20' },
    { id: 'f2', name: 'Dokumentasi_Musrenbang.jpg', type: 'IMG', size: '4.5 MB', owner: 'Budi Santoso', date: '2023-10-21' },
    { id: 'f3', name: 'Draft_Proposal_BUMDes.doc', type: 'DOC', size: '500 KB', owner: 'Sekdes', date: '2023-10-22' },
];

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
    { 
        id: 'm1', 
        name: 'Tepung Mocaf Premium', 
        price: 15000, 
        seller: 'KSU Warga Berdaya', 
        imageColor: 'bg-yellow-200', 
        category: 'Pangan',
        imageUrl: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm2', 
        name: 'Keripik Pisang Coklat', 
        price: 12000, 
        seller: 'UMKM Bu Siti', 
        imageColor: 'bg-orange-200', 
        category: 'Snack',
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e512819a636?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm3', 
        name: 'Tas Anyaman Daur Ulang', 
        price: 45000, 
        seller: 'Bank Sampah Induk', 
        imageColor: 'bg-green-200', 
        category: 'Kerajinan',
        imageUrl: 'https://images.unsplash.com/photo-1590874102752-971ac55c063b?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm4', 
        name: 'Kopi Robusta Lampung', 
        price: 25000, 
        seller: 'Warung Kopi Payungi', 
        imageColor: 'bg-amber-800', 
        category: 'Minuman',
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm5', 
        name: 'Madu Hutan Murni', 
        price: 85000, 
        seller: 'Kelompok Tani Hutan', 
        imageColor: 'bg-yellow-500', 
        category: 'Kesehatan',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm6', 
        name: 'Sambal Bawang Rumahan', 
        price: 18000, 
        seller: 'Dapur Bu Lastri', 
        imageColor: 'bg-red-500', 
        category: 'Bumbu',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm7', 
        name: 'Beras Organik Mentik', 
        price: 65000, 
        seller: 'Gapoktan Makmur', 
        imageColor: 'bg-slate-200', 
        category: 'Pangan',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80'
    },
    { 
        id: 'm8', 
        name: 'Telur Asin Masir', 
        price: 5000, 
        seller: 'Peternak Bebek Jaya', 
        imageColor: 'bg-cyan-200', 
        category: 'Lauk',
        imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=300&q=80'
    },
];

export const SERVICE_PROVIDERS: ServiceProvider[] = [
    { 
        id: 'sv1', 
        name: 'Bengkel Motor Pak Bejo', 
        category: 'REPARASI', 
        description: 'Servis ringan, ganti oli, tambal ban.', 
        contact: '0812-3456-7890', 
        rating: 4.8, 
        isOpen: true,
        price: 50000,
        unit: 'Jasa',
        minOrder: 1,
        exceptions: 'Belum termasuk harga sparepart jika ada penggantian.'
    },
    { 
        id: 'sv2', 
        name: 'Laundry Wangi Bu Siti', 
        category: 'LAUNDRY', 
        description: 'Cuci kiloan & satuan. Bisa antar jemput.', 
        contact: '0813-4567-8901', 
        rating: 4.9, 
        isOpen: true,
        price: 6000,
        unit: 'Kg',
        minOrder: 3,
        exceptions: 'Bedcover, Karpet, dan Jas dihitung satuan terpisah.'
    },
    { 
        id: 'sv3', 
        name: 'Bimbel Privat Mbak Rini', 
        category: 'PENDIDIKAN', 
        description: 'Matematika & Bahasa Inggris SD-SMP.', 
        contact: '0814-5678-9012', 
        rating: 5.0, 
        isOpen: false,
        price: 75000,
        unit: 'Sesi (90 mnt)',
        minOrder: 1,
        exceptions: 'Modul materi dikenakan biaya cetak tambahan.'
    },
    { 
        id: 'sv4', 
        name: 'Pijat Refleksi Sehat', 
        category: 'KESEHATAN', 
        description: 'Pijat capek, kerokan, bekam.', 
        contact: '0815-6789-0123', 
        rating: 4.7, 
        isOpen: true,
        price: 60000,
        unit: 'Jam',
        minOrder: 1,
        exceptions: 'Biaya transport tambahan Rp 10.000 jika lokasi > 3km.'
    },
];

export const WARGA_CONTACTS: WargaContact[] = [
  { id: 'c1', name: 'Pak Budi', role: 'Ketua RW', rw: '07', avatarSeed: 'Budi', status: 'Active' },
  { id: 'c2', name: 'Bu Siti', role: 'Kader Posyandu', rw: '07', avatarSeed: 'Siti', status: 'Active' },
  { id: 'c3', name: 'Mas Anton', role: 'Karang Taruna', rw: '05', avatarSeed: 'Anton', status: 'Inactive' },
  { id: 'c4', name: 'Pak RT 01', role: 'Ketua RT', rw: '07', avatarSeed: 'RT01', status: 'Active' },
  { id: 'c5', name: 'Bidan Desa', role: 'Tenaga Medis', rw: 'All', avatarSeed: 'Bidan', status: 'Active' },
];

export const SOCIAL_REPORTS: SocialReport[] = [
  {
    id: 'r1',
    type: 'INFRASTRUCTURE',
    title: 'Jalan Berlubang di Depan Balai Desa',
    description: 'Lubang cukup dalam, membahayakan pengendara motor terutama saat hujan.',
    author: 'Ahmad Dani',
    authorId: 'u1',
    date: '2 jam lalu',
    location: 'Jl. Utama No. 12',
    status: 'PENDING',
    votes: 15,
    comments: 3,
    coordinates: { lat: -5.1186, lng: 105.3072 },
    commentList: [
      { id: 'c1', author: 'Budi Santoso', authorId: 'u1', text: 'Sangat berbahaya, kemarin saya hampir jatuh.', date: '1 jam lalu', avatarSeed: 'Budi' },
      { id: 'c2', author: 'H. Joko Purnomo', authorId: 'u2', text: 'Sudah diteruskan ke dinas terkait, mohon bersabar.', date: '45 menit lalu', avatarSeed: 'Joko' },
      { id: 'c3', author: 'Siti Aminah', authorId: 'u3', text: 'Terima kasih infonya pak.', date: '10 menit lalu', avatarSeed: 'Siti' }
    ]
  },
  {
    id: 'r2',
    type: 'TRASH',
    title: 'Tumpukan Sampah di Sungai',
    description: 'Mohon dibersihkan karena menyumbat aliran air dan bau.',
    author: 'Siti Aminah',
    authorId: 'u3',
    date: 'Kemarin',
    location: 'Jembatan RW 02',
    status: 'IN_PROGRESS',
    votes: 42,
    comments: 8,
    coordinates: { lat: -5.1150, lng: 105.3040 },
    commentList: [
      { id: 'c4', author: 'Budi Santoso', authorId: 'u1', text: 'Ayo kita kerja bakti hari minggu besok.', date: 'Kemarin', avatarSeed: 'Budi' }
    ]
  },
  {
    id: 'r3',
    type: 'HEALTH',
    title: 'Jadwal Posyandu Balita',
    description: 'Apakah bulan ini ada pemberian vitamin A?',
    author: 'Ibu Ratna',
    date: '3 hari lalu',
    location: 'Posyandu Melati',
    status: 'RESOLVED',
    votes: 8,
    comments: 2,
    coordinates: { lat: -5.1200, lng: 105.3090 },
    commentList: [
      { id: 'c5', author: 'Bidan Desa', authorId: 'u5', text: 'Iya bu, ada pemberian vitamin A di posyandu melati.', date: '2 hari lalu', avatarSeed: 'Bidan' }
    ]
  },
  {
    id: 'r4',
    type: 'SECURITY',
    title: 'Lampu Jalan Mati',
    description: 'Lampu PJU di gang masuk RW 05 mati total sejak 2 hari lalu. Gelap dan rawan.',
    author: 'Pak RT 05',
    date: '1 hari lalu',
    location: 'Gang Kancil RW 05',
    status: 'PENDING',
    votes: 22,
    comments: 5,
    coordinates: { lat: -5.1160, lng: 105.3085 }
  }
];

export const SECURITY_CAMERAS: SecurityCamera[] = [
    { id: 'cam1', name: 'Gerbang Utama', location: 'Gapura RW 07', status: 'ONLINE' },
    { id: 'cam2', name: 'Pasar Payungi', location: 'Area Tengah', status: 'ONLINE' },
    { id: 'cam3', name: 'Simpang Tiga', location: 'Jl. Ahmad Yani', status: 'RECORDING' },
    { id: 'cam4', name: 'Gudang Mocaf', location: 'Area Belakang', status: 'OFFLINE' },
];

export const RONDA_SCHEDULES: RondaSchedule[] = [
    { id: 'sch1', date: 'Malam Ini (Senin)', shift: '21:00 - 04:00', members: ['Pak RT 01', 'Mas Anton', 'Budi Santoso', 'Pak Joko'], status: 'ACTIVE', commander: 'Pak RT 01' },
    { id: 'sch2', date: 'Besok (Selasa)', shift: '21:00 - 04:00', members: ['Pak Slamet', 'Kang Asep', 'Mas Dimas', 'Pak RT 02'], status: 'UPCOMING', commander: 'Pak Slamet' },
];

// Helper to generate dates for the last 7 days
const getMockDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

export const PATROL_LOGS: PatrolLog[] = [
    { id: 'log1', date: getMockDate(0), time: '22:15', officer: 'Budi Santoso', location: 'Portal Selatan', status: 'AMAN', note: 'Gembok portal aman, lampu menyala.' },
    { id: 'log2', date: getMockDate(0), time: '23:00', officer: 'Mas Anton', location: 'Pasar Payungi', status: 'AMAN', note: 'Tidak ada aktivitas mencurigakan.' },
    { id: 'log3', date: getMockDate(1), time: '01:30', officer: 'Pak RT 01', location: 'Perbatasan RW 06', status: 'ENCURIGAKAN', note: 'Ada 2 pemuda nongkrong, sudah ditegur.' },
    { id: 'log4', date: getMockDate(2), time: '23:45', officer: 'Hansip Udin', location: 'Gudang Mocaf', status: 'AMAN', note: 'Pintu gudang terkunci rapat.' },
    { id: 'log5', date: getMockDate(3), time: '02:15', officer: 'Budi Santoso', location: 'Jalan Utama', status: 'AMAN', note: 'Patroli berkuda (motor).' },
    { id: 'log6', date: getMockDate(5), time: '21:00', officer: 'Pak Joko', location: 'Pos Induk', status: 'INSIDEN', note: 'Laporan kehilangan helm warga.' },
    { id: 'log7', date: getMockDate(6), time: '00:30', officer: 'Mas Anton', location: 'Gang Kancil', status: 'AMAN', note: 'Kondisi sepi dan terkendali.' },
];

export const MARKET_STALLS: MarketStall[] = [
    { id: 's1', name: 'Gudeg Jogja Yu DjumKW', owner: 'Bu Rahmi', category: 'KULINER', revenueToday: 1250000, status: 'OPEN' },
    { id: 's2', name: 'Sate Padang Pariaman', owner: 'Pak Udin', category: 'KULINER', revenueToday: 2100000, status: 'OPEN' },
    { id: 's3', name: 'Kerajinan Batik Tulis', owner: 'Bu Astuti', category: 'KERAJINAN', revenueToday: 450000, status: 'OPEN' },
    { id: 's4', name: 'Fashion Thrift Warga', owner: 'Mas Dimas', category: 'FASHION', revenueToday: 850000, status: 'OPEN' },
    { id: 's5', name: 'Jasa Pijat Refleksi', owner: 'Pak Slamet', category: 'JASA', revenueToday: 300000, status: 'CLOSED' },
    { id: 's6', name: 'Es Cendol Dawet Ayu', owner: 'Kang Asep', category: 'KULINER', revenueToday: 600000, status: 'OPEN' },
];

export const MARKET_LAYOUT_DATA: MarketLayoutItem[] = [
    // ENTRANCE & FACILITIES
    { id: 'ent1', type: 'ENTRANCE', label: 'Gerbang Utara', x: 50, y: 5 },
    { id: 'stg1', type: 'STAGE', label: 'Panggung Utama', x: 50, y: 90, width: 30, height: 10 },
    { id: 'wc1', type: 'TOILET', label: 'Toilet', x: 92, y: 10 },
    { id: 'tree1', type: 'TREE', label: 'Beringin', x: 50, y: 50 },

    // STALLS (Linked to MARKET_STALLS)
    { id: 'ly_s1', type: 'STALL', label: 'S1', x: 15, y: 20, linkedStallId: 's1' }, // Gudeg
    { id: 'ly_s2', type: 'STALL', label: 'S2', x: 15, y: 40, linkedStallId: 's2' }, // Sate
    { id: 'ly_s3', type: 'STALL', label: 'S3', x: 15, y: 60, linkedStallId: 's3' }, // Batik
    { id: 'ly_s4', type: 'STALL', label: 'S4', x: 85, y: 20, linkedStallId: 's4' }, // Fashion
    { id: 'ly_s5', type: 'STALL', label: 'S5', x: 85, y: 40, linkedStallId: 's5' }, // Pijat
    { id: 'ly_s6', type: 'STALL', label: 'S6', x: 85, y: 60, linkedStallId: 's6' }, // Cendol

    // TABLES (Center Area)
    { id: 't1', type: 'TABLE', label: '1', x: 35, y: 30, status: 'AVAILABLE', capacity: 4 },
    { id: 't2', type: 'TABLE', label: '2', x: 35, y: 50, status: 'OCCUPIED', capacity: 4 },
    { id: 't3', type: 'TABLE', label: '3', x: 35, y: 70, status: 'DIRTY', capacity: 2 },
    { id: 't4', type: 'TABLE', label: '4', x: 65, y: 30, status: 'AVAILABLE', capacity: 4 },
    { id: 't5', type: 'TABLE', label: '5', x: 65, y: 50, status: 'ORDERING', capacity: 6 },
    { id: 't6', type: 'TABLE', label: '6', x: 65, y: 70, status: 'AVAILABLE', capacity: 2 },
];

export const PARKING_ZONES: ParkingZone[] = [
    { id: 'pz1', name: 'Parkir Utama Pasar', attendant: 'Jupri', capacity: 50, occupied: 42, revenueToday: 210000, status: 'OPEN', coordinates: { x: 25, y: 30 }, realCoordinates: { lat: -5.1175, lng: 105.3065 }, merchantId: 'LM-001' },
    { id: 'pz2', name: 'Halaman Balai Desa', attendant: 'Rohman', capacity: 30, occupied: 12, revenueToday: 65000, status: 'OPEN', coordinates: { x: 70, y: 30 }, realCoordinates: { lat: -5.1188, lng: 105.3075 }, merchantId: 'LM-002' },
    { id: 'pz3', name: 'Area Mocaf Hub', attendant: 'Slamet', capacity: 20, occupied: 5, revenueToday: 25000, status: 'OPEN', coordinates: { x: 50, y: 75 }, realCoordinates: { lat: -5.1195, lng: 105.3080 }, merchantId: 'LM-003' },
    { id: 'pz4', name: 'Parkir VIP Tamu', attendant: 'Auto-Gate', capacity: 10, occupied: 10, revenueToday: 150000, status: 'FULL', coordinates: { x: 40, y: 15 }, realCoordinates: { lat: -5.1165, lng: 105.3070 }, merchantId: 'LM-004' },
];

export const HEALTH_QUEUES: HealthQueue[] = [
    { id: 'poli_umum', serviceName: 'Poli Umum', currentNumber: 12, status: 'OPEN', estimatedWaitTime: 15 },
    { id: 'poli_gigi', serviceName: 'Poli Gigi', currentNumber: 5, status: 'OPEN', estimatedWaitTime: 30 },
    { id: 'kia', serviceName: 'KIA (Ibu & Anak)', currentNumber: 8, status: 'BREAK', estimatedWaitTime: 45 },
];

export const DOCTORS: Doctor[] = [
    { id: 'd1', name: 'dr. Aisyah', specialty: 'Umum', isOnline: true, rating: 4.8, avatarSeed: 'Aisyah' },
    { id: 'd2', name: 'dr. Budi', specialty: 'Gigi', isOnline: false, rating: 4.5, avatarSeed: 'DrBudi' },
    { id: 'd3', name: 'Bidan Siti', specialty: 'KIA', isOnline: true, rating: 4.9, avatarSeed: 'BidanSiti' },
];

export const POSYANDU_SESSIONS: PosyanduSchedule[] = [
    { id: 'psy1', date: '2023-10-28', location: 'Pos Melati (RW 02)', activity: 'Imunisasi & Timbang Balita', target: 'Balita' },
    { id: 'psy2', date: '2023-11-02', location: 'Balai Desa', activity: 'Senam Lansia & Cek Tensi', target: 'Lansia' },
];

export const COURSES: Course[] = [
    { id: 'cr1', title: 'Digital Marketing untuk UMKM', instructor: 'Warga-Net Team', category: 'DIGITAL', level: 'Beginner', duration: '4 Minggu', students: 45, rating: 4.8, price: 0, imageColor: 'bg-blue-200' },
    { id: 'cr2', title: 'Budidaya Mocaf Unggul', instructor: 'Dinas Pertanian', category: 'AGRICULTURE', level: 'Intermediate', duration: '2 Hari', students: 30, rating: 4.9, price: 50000, imageColor: 'bg-green-200' },
    { id: 'cr3', title: 'Menjahit Dasar', instructor: 'Ibu Rahmi', category: 'VOCATIONAL', level: 'Beginner', duration: '1 Bulan', students: 12, rating: 4.7, price: 100000, imageColor: 'bg-purple-200' },
    { id: 'cr4', title: 'Basic Digital Marketing', instructor: 'Pemerintah Desa', category: 'DIGITAL', level: 'Beginner', duration: '3 Weeks', students: 50, rating: 4.7, price: 75000, imageColor: 'bg-indigo-200' },
    { id: 'cr5', title: 'Basic Digital Marketing', instructor: 'Pemerintah Desa', category: 'DIGITAL', level: 'Beginner', duration: '3 Weeks', students: 50, rating: 4.7, price: 75000, imageColor: 'bg-indigo-200' },
];

export const SCHOOL_EVENTS: SchoolEvent[] = [
    {
        id: 'evt1',
        title: 'Lomba Cerdas Cermat SD',
        date: '2023-11-10',
        location: 'Balai Desa',
        type: 'ACADEMIC',
        description: 'Kompetisi pengetahuan umum untuk siswa SD se-Kelurahan Yosomulyo.',
        schedule: [
            { time: '08:00', activity: 'Registrasi Peserta' },
            { time: '09:00', activity: 'Babak Penyisihan' },
            { time: '11:00', activity: 'Babak Final' },
            { time: '12:30', activity: 'Pengumuman Pemenang' }
        ]
    },
    {
        id: 'evt2',
        title: 'Porseni Antar RW',
        date: '2023-11-15',
        location: 'Lapangan Utama',
        type: 'SPORTS',
        description: 'Pekan Olahraga dan Seni tahunan untuk mempererat tali persaudaraan antar RW.',
        schedule: [
            { time: '07:00', activity: 'Senam Bersama' },
            { time: '08:00', activity: 'Pertandingan Futsal' },
            { time: '10:00', activity: 'Lomba Balap Karung' },
            { time: '15:00', activity: 'Pentas Seni' }
        ]
    },
    {
        id: 'evt3',
        title: 'Workshop Literasi Digital Siswa',
        date: '2023-11-20',
        location: 'Balai Kelurahan',
        type: 'SOCIAL',
        description: 'Workshop pengenalan internet sehat dan aman untuk remaja.',
        speaker: 'Tim Relawan TIK',
        schedule: [
            { time: '09:00', activity: 'Pembukaan' },
            { time: '09:30', activity: 'Sesi 1: Internet Safety' },
            { time: '11:00', activity: 'Sesi 2: Content Creation' }
        ]
    },
    {
        id: 'evt4',
        title: 'Pelatihan Dasar Bahasa Inggris Siswa',
        date: '2023-12-05',
        location: 'Balai RW 03',
        type: 'SOCIAL',
        description: 'Kelas bahasa Inggris dasar gratis untuk anak-anak.',
        speaker: 'Ms. Rini (Kampung Inggris)',
        schedule: [
            { time: '15:00', activity: 'Introduction' },
            { time: '15:30', activity: 'Vocabulary Games' },
            { time: '16:30', activity: 'Speaking Practice' }
        ]
    },
];

// MASTER PLAN / CREATIVE FINANCING DATA (Based on Master Plan Pembiayaan Kreatif Kota Metro)
export const CITY_METRICS: CityMetric[] = [
    { id: 'm1', label: 'Tingkat Kemiskinan', value: 6.78, unit: '%', trend: 'DOWN', year: '2024', category: 'SOCIAL' },
    { id: 'm2', label: 'Penduduk Miskin', value: 12.07, unit: 'Ribu', trend: 'DOWN', year: '2024', category: 'SOCIAL' },
    { id: 'm3', label: 'Garis Kemiskinan', value: 503161, unit: 'Rp/Kapita/Bulan', trend: 'STABLE', year: '2024', category: 'ECONOMY' },
    { id: 'm4', label: 'Tingkat Pengangguran Terbuka', value: 3.71, unit: '%', trend: 'DOWN', year: '2024', category: 'ECONOMY' },
    { id: 'm5', label: 'Angka Harapan Hidup', value: 75.43, unit: 'Tahun', trend: 'UP', year: '2024', category: 'SOCIAL' },
    { id: 'm6', label: 'Harapan Lama Sekolah', value: 14.79, unit: 'Tahun', trend: 'UP', year: '2024', category: 'SOCIAL' },
    { id: 'm7', label: 'Rata-rata Lama Sekolah', value: 11.01, unit: 'Tahun', trend: 'UP', year: '2024', category: 'SOCIAL' },
    { id: 'm8', label: 'Inflasi Tahunan (Feb 2026)', value: 3.43, unit: '%', trend: 'STABLE', year: '2026', category: 'ECONOMY' },
];

export const CREATIVE_FINANCING_PROJECTS: CreativeFinancingProject[] = [
    { 
        id: 'p1', 
        title: 'Modernisasi Penerangan Jalan Umum (PJU)', 
        description: 'Retrofit lampu jalan ke LED dengan skema kontrak kinerja penghematan energi (Akola Model).', 
        estimatedCost: 15000000000, 
        fundingSource: ['KPBU', 'APBD'], 
        status: 'PREPARATION', 
        priority: 'HIGH', 
        category: 'INFRASTRUCTURE' 
    },
    { 
        id: 'p2', 
        title: 'Sistem Penyediaan Air Minum (SPAM)', 
        description: 'Pembangunan infrastruktur air bersih dengan skema Municipal PPP (Bandar Lampung Model).', 
        estimatedCost: 45000000000, 
        fundingSource: ['KPBU', 'VGF', 'APBD'], 
        status: 'PIPELINE', 
        priority: 'HIGH', 
        category: 'INFRASTRUCTURE' 
    },
    { 
        id: 'p3', 
        title: 'Pengelolaan Sampah Terintegrasi & Nilai Karbon', 
        description: 'Penangkapan gas TPA, kompos metana, dan perdagangan karbon.', 
        estimatedCost: 12000000000, 
        fundingSource: ['CSR', 'APBD', 'Carbon Credit'], 
        status: 'PIPELINE', 
        priority: 'MEDIUM', 
        category: 'INFRASTRUCTURE' 
    },
    { 
        id: 'p4', 
        title: 'Beasiswa & Pelatihan Digital UMKM', 
        description: 'Pendanaan layanan campuran (Mixed Finance) menggunakan Zakat, Wakaf (CWLS), dan CSR.', 
        estimatedCost: 5000000000, 
        fundingSource: ['Zakat', 'Wakaf', 'CSR'], 
        status: 'EXECUTION', 
        priority: 'HIGH', 
        category: 'HUMAN_DEV' 
    },
    { 
        id: 'p5', 
        title: 'Modernisasi Pasar Tradisional', 
        description: 'Revitalisasi pasar dengan sistem pembayaran digital dan manajemen aset produktif.', 
        estimatedCost: 8000000000, 
        fundingSource: ['APBD', 'BUMD', 'Private'], 
        status: 'PROCUREMENT', 
        priority: 'MEDIUM', 
        category: 'ECONOMY' 
    },
];

export const OPD_ROLES: OpdRole[] = [
    { id: 'o1', name: 'Badan Perencanaan Pembangunan Daerah', acronym: 'BAPPEDA', role: 'Pipeline Manager', responsibility: ['Pipeline proyek', 'Penetapan prioritas', 'Indikator hasil', 'Rencana Sinergi Pendanaan'] },
    { id: 'o2', name: 'Badan Pengelolaan Keuangan dan Aset Daerah', acronym: 'BPKAD', role: 'City CFO', responsibility: ['Ruang fiskal', 'Batas utang', 'Manajemen kas', 'Pembayaran kontrak', 'Kesiapan aset'] },
    { id: 'o3', name: 'Badan Pengelola Pajak dan Retribusi Daerah', acronym: 'BPPRD', role: 'Revenue Engine', responsibility: ['Digitalisasi pajak', 'Penegakan kepatuhan', 'Integrasi sistem pembayaran'] },
    { id: 'o4', name: 'Dinas Komunikasi dan Informatika', acronym: 'DISKOMINFO', role: 'Digital Backbone', responsibility: ['Pemantauan pendapatan', 'Dashboard kinerja terbuka', 'Ekosistem data terbuka'] },
    { id: 'o5', name: 'Inspektorat', acronym: 'INSPEKTORAT', role: 'Assurance', responsibility: ['Audit kontrak berisiko tinggi', 'Verifikasi kinerja', 'Pengendalian fraud'] },
];

export const INFRASTRUCTURE_STATS = {
    education: {
        universities: 14,
        highSchools: 17,
        middleSchools: 27,
        elementarySchools: 62,
        preschools: 63
    },
    health: {
        govtHospitals: 2,
        privateHospitals: 7,
        puskesmas: 11
    }
};

export const TEAM_TASKS: TeamTask[] = [
  {
    id: 'task1',
    title: 'Perbaikan Lampu PJU RW 05',
    description: 'Mengganti 3 bohlam LED yang mati di sepanjang Gang Kancil.',
    assignedTo: ['Mas Anton', 'Budi Santoso'],
    priority: 'HIGH',
    status: 'TODO',
    dueDate: '2023-10-27',
    location: { lat: -5.1160, lng: 105.3085, address: 'Gang Kancil RW 05' },
    category: 'MAINTENANCE'
  },
  {
    id: 'task2',
    title: 'Fogging Pencegahan DBD',
    description: 'Melakukan pengasapan di area pemukiman padat RW 02.',
    assignedTo: ['Tim Kesehatan Kelurahan'],
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueDate: '2023-10-26',
    location: { lat: -5.1150, lng: 105.3040, address: 'Area RW 02' },
    category: 'HEALTH'
  },
  {
    id: 'task3',
    title: 'Verifikasi Data Bansos',
    description: 'Melakukan kunjungan rumah untuk verifikasi penerima manfaat baru.',
    assignedTo: ['Bu Siti', 'Pak RT 01'],
    priority: 'MEDIUM',
    status: 'REVIEW',
    dueDate: '2023-10-30',
    location: { lat: -5.1200, lng: 105.3090, address: 'Posyandu Melati' },
    category: 'SOCIAL'
  }
];

export const ASSETS: Asset[] = [
  {
    id: 'asset1',
    name: 'Ambulans Desa',
    type: 'VEHICLE',
    status: 'AVAILABLE',
    condition: 'EXCELLENT',
    location: { lat: -5.1188, lng: 105.3075, address: 'Balai Desa' },
    lastMaintained: '2023-09-15',
    imageColor: 'bg-red-500'
  },
  {
    id: 'asset2',
    name: 'Truk Sampah Anjelo',
    type: 'VEHICLE',
    status: 'IN_USE',
    condition: 'GOOD',
    location: { lat: -5.1175, lng: 105.3065, address: 'Pasar Payungi' },
    lastMaintained: '2023-10-01',
    assignedTo: 'Hansip Udin',
    imageColor: 'bg-orange-500'
  },
  {
    id: 'asset3',
    name: 'Genset Darurat',
    type: 'EQUIPMENT',
    status: 'MAINTENANCE',
    condition: 'FAIR',
    location: { lat: -5.1188, lng: 105.3075, address: 'Balai Desa' },
    lastMaintained: '2023-10-20',
    imageColor: 'bg-blue-500'
  }
];

export const FLOOD_AREAS = [
  { id: 'f1', title: 'Titik Genangan RW 02', position: { lat: -5.1150, lng: 105.3040 }, severity: 'LOW', status: 'SAFE' },
  { id: 'f2', title: 'Titik Genangan RW 05', position: { lat: -5.1160, lng: 105.3085 }, severity: 'MEDIUM', status: 'WARNING' },
  { id: 'f3', title: 'Titik Genangan RW 08', position: { lat: -5.1210, lng: 105.3110 }, severity: 'HIGH', status: 'DANGER' },
];
