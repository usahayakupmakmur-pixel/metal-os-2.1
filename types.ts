

export interface BerdayaOrder {
  id: string;
  type: 'PRODUCT' | 'SERVICE';
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  date: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  paymentMethod: 'WARGAPAY' | 'QRIS' | 'CASH';
  deliveryId?: string; // Link to Anjelo
  trackingNumber?: string;
}

export interface BerdayaImpact {
  totalRevenue: number;
  jobsCreated: number;
  msmesSupported: number;
  socialContribution: number;
  carbonReduced: number; // in kg
}

export interface BarcodeData {
  id: string;
  label: string;
  value: string;
  type: 'BARCODE' | 'QR';
  format?: 'CODE128' | 'EAN13' | 'UPC';
  createdAt: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  GOVERNANCE = 'GOVERNANCE', // Glass House Governance
  ECONOMY = 'ECONOMY', // WargaPay, Anjelo, Mocaf Hub
  BERDAYA = 'BERDAYA', // New Commerce, Services, Anjelo Hub
  ENVIRONMENT = 'ENVIRONMENT', // Warga-Enviro, IoT
  SOCIAL = 'SOCIAL', // Reports, Musrenbang
  GAPURA = 'GAPURA', // Smart Gateway & MetalGate
  OFFICE_SUITE = 'OFFICE_SUITE', // Office Suite (Unified)
  POSKAMLING = 'POSKAMLING', // New Smart Security Module
  PARKING = 'PARKING', // New Centralized Parking Management
  HEALTH = 'HEALTH', // New Integrated Health Module
  EDUCATION = 'EDUCATION', // New Education Module
  SYSTEM = 'SYSTEM', // New System Monitoring & Kernel Module
  CREATIVE_FINANCE = 'CREATIVE_FINANCE', // Master Plan Creative Financing
  GEOSPATIAL = 'GEOSPATIAL', // Advanced Geospatial Dashboard
  TASKS = 'TASKS', // Team Task Assignment
  ASSETS = 'ASSETS', // Asset Management
  TRACKER = 'TRACKER', // Integrated Operational Tracker
  IOT = 'IOT', // IoT & Smart Village
  SMART_HUB = 'SMART_HUB', // Unified Smart Hub (Gateway, IoT, Security, Mobility)
  PROFILE = 'PROFILE',
  EVALUATION = 'EVALUATION',
  OSS = 'OSS', // Online Single Submission Integration
  SETTINGS = 'SETTINGS'
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  INCOME = 'INCOME',
  SPLITTER_AUTO = 'SPLITTER_AUTO', // Smart Splitter logic
  TRASH_DEPOSIT = 'TRASH_DEPOSIT', // Trash-for-Data
  PARKING_FEE = 'PARKING_FEE',
  WIFI_VOUCHER = 'WIFI_VOUCHER',
  MARKET_SALE = 'MARKET_SALE',
  TOPUP = 'TOPUP'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  recipient?: string;
  category: 'Commercial' | 'Social' | 'Savings' | 'Service' | 'Income';
}

export interface BudgetLineItem {
  id: string;
  category: string;
  allocated: number;
  realized: number;
  status: 'On Track' | 'Warning' | 'Critical';
}

export interface IotSensor {
  id: string;
  location: string;
  type: 'FLOOD' | 'AIR_QUALITY' | 'WASTE_LEVEL';
  value: number;
  unit: string;
  status: 'SAFE' | 'WARNING' | 'DANGER';
  lastUpdate: string;
}

export interface VisitorLog {
    id: string;
    name: string;
    type: 'RESIDENT' | 'GUEST' | 'DELIVERY' | 'UNKNOWN';
    time: string;
    method: 'WIFI' | 'CAMERA' | 'MANUAL';
    status: 'AUTHORIZED' | 'PENDING' | 'FLAGGED';
    vehiclePlate?: string;
}

export interface SecurityAlert {
    id: string;
    type: 'MOTION' | 'LOITERING' | 'UNAUTHORIZED_ACCESS' | 'EMERGENCY';
    location: string;
    time: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
}

export interface CourierStatus {
  uid: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  location?: { lat: number; lng: number };
  vehicleType?: string;
  plateNumber?: string;
  rating?: number;
  totalDeliveries?: number;
  earningsToday?: number;
}

export interface CitizenProfile {
  id: string; // Added ID for selection
  name: string;
  wargaScore: number; // Credit scoring based on behavior
  role: 'Warga Berkarya' | 'Warga Berdaya' | 'Warga Bergerak' | 'Lurah / Admin';
  balance: number;
  points: number; // Social points
  avatarSeed?: string; // For UI avatar
  photoUrl?: string; // For uploaded/captured profile picture
  mandiriVA?: string; // Mandiri Virtual Account number
  phone?: string;
  email?: string;
  address?: string;
  bio?: string;
  nik?: string; // National ID Number (Digital KTP)
  nib?: string; // Business Identification Number (NIB)
  nip?: string; // Civil Servant ID (NIP)
  nim?: string; // University Student ID (NIM)
  nis?: string; // School Student ID (NIS)
  kip?: string; // Kartu Indonesia Pintar (KIP)
  kis?: string; // Kartu Indonesia Sehat (KIS)
  kelurahan?: string; // Kelurahan/Entitas domisili
  ossId?: string; // OSS Integration ID
  isOssLinked?: boolean;
  ssoProvider?: 'GOOGLE' | 'OSS' | 'METAL_ID';
  userType?: 'citizen' | 'business_entity' | 'government';
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  occupation?: string;
  achievements?: { id: string; title: string; icon: string; date: string }[];
  lastSeen?: any;
  status?: 'Online' | 'Offline' | 'Busy';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingMetadata?: any;
}

export interface LibraryContent {
  id: string;
  title: string;
  type: 'VIDEO' | 'EBOOK';
  category: 'Education' | 'Agriculture' | 'Health';
  size: string;
  author: string;
}

export interface CastZone {
  id: string;
  name: string;
  status: 'PLAYING' | 'IDLE' | 'OFFLINE';
  currentContent: string;
  nextSchedule: string;
}

export interface SharedFile {
  id: string;
  name: string;
  type: 'DOC' | 'IMG' | 'PDF';
  size: string;
  owner: string;
  date: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  price: number;
  seller: string;
  sellerId?: string; // Added for ownership
  imageColor: string;
  category: string;
  imageUrl?: string;
  description?: string; // Added for more detail
  stock?: number; // Added for inventory
}

export interface ServiceProvider {
    id: string;
    name: string;
    sellerId?: string; // Added for ownership
    category: 'REPARASI' | 'KESEHATAN' | 'PENDIDIKAN' | 'LAUNDRY' | 'LAINNYA';
    description: string;
    contact: string;
    rating: number;
    isOpen: boolean;
    price: number;
    unit: string;
    minOrder: number;
    exceptions?: string;
    imageColor?: string; // Added for UI consistency
}

export interface WargaContact {
  id: string;
  name: string;
  role: string;
  rw: string;
  phone?: string; // Added for WhatsApp/Call integration
  avatarSeed: string;
  status: 'Active' | 'Inactive';
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  date: string;
  avatarSeed?: string;
}

export interface SocialPost {
  id: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'COMMUNITY';
  author: string;
  authorId?: string;
  time: string;
  content: string;
  image?: boolean;
  imageUrl?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  videoDuration?: string;
  videoId?: string;
  commentList?: Comment[];
  likedBy?: string[];
}

export interface SocialReport {
  id: string;
  type: 'INFRASTRUCTURE' | 'HEALTH' | 'TRASH' | 'SECURITY';
  title: string;
  description: string;
  author: string;
  authorId?: string;
  date: string;
  location: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  votes: number;
  comments: number;
  coordinates?: { lat: number; lng: number }; // Added for Map Integration
  commentList?: Comment[];
  photoUrl?: string;
  voters?: string[];
}

export interface ParkingSession {
  id: string;
  plate: string;
  type: 'MOTOR' | 'MOBIL';
  entryTime: string;
  zoneId: string;
  status: 'ACTIVE' | 'COMPLETED';
  cost: number;
  paymentMethod?: 'QRIS' | 'EMONEY' | 'CASH';
}

export interface ParkingZone {
    id: string;
    name: string;
    attendant: string; // Juru Parkir Name
    capacity: number;
    occupied: number;
    revenueToday: number;
    status: 'OPEN' | 'FULL' | 'CLOSED';
    coordinates: { x: number; y: number }; // Map percentage
    realCoordinates?: { lat: number; lng: number }; // Added for Geospatial Dashboard
    merchantId: string; // Livin Merchant ID
    price: number; // Added for POS pricing
}

export interface WifiPackage {
  id: string;
  name: string;
  speed: string;
  duration: string;
  price: number;
}

export interface PointTransaction {
  id: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  description: string;
  date: string;
}

// POS KAMLING TYPES
export interface RondaSchedule {
    id: string;
    date: string;
    shift: string;
    members: string[]; // Names of citizens
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
    commander: string; // Komandan Regu
}

export interface SecurityCamera {
    id: string;
    name: string;
    location: string;
    status: 'ONLINE' | 'OFFLINE' | 'RECORDING';
    lastActivity?: string;
}

export interface PatrolLog {
    id: string;
    date: string; // YYYY-MM-DD
    time: string;
    officer: string;
    location: string;
    status: 'AMAN' | 'ENCURIGAKAN' | 'INSIDEN';
    note: string;
}

// MARKET / PASAR TYPES
export interface MarketStall {
    id: string;
    name: string;
    owner: string;
    category: 'KULINER' | 'KERAJINAN' | 'JASA' | 'FASHION';
    revenueToday: number;
    status: 'OPEN' | 'CLOSED';
}

export type LayoutItemType = 'STALL' | 'TABLE' | 'STAGE' | 'ENTRANCE' | 'TOILET' | 'TREE' | 'STREET' | 'HOUSE' | 'POLE' | 'OFFICE' | 'OTHER';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'ORDERING' | 'DIRTY';

export interface MarketLayoutItem {
    id: string;
    type: LayoutItemType;
    label: string;
    x: number; // Percentage X (0-100)
    y: number; // Percentage Y (0-100)
    width?: number; // Visual width scale
    height?: number;
    rotation?: number; // Rotation degrees
    status?: TableStatus; // Only for tables
    linkedStallId?: string; // If type is STALL, link to MarketStall data
    capacity?: number;
}

export interface MarketTransaction {
    id: string;
    type: 'MARKET_SALE' | 'TOPUP';
    amount: number;
    description?: string;
    date: any; // Timestamp
    userId: string;
    stallId?: string;
    paymentMethod: 'QRIS' | 'WARGAPAY' | 'POINTS' | 'CASH';
}

export interface MarketReservation {
    id: string;
    tableId: string;
    userId: string;
    userName: string;
    startTime: any; // Timestamp
    endTime?: any; // Timestamp
    guests: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

// HEALTH TYPES
export interface HealthQueue {
    id: string;
    serviceName: string;
    currentNumber: number;
    yourNumber?: number;
    status: 'OPEN' | 'CLOSED' | 'BREAK';
    estimatedWaitTime: number; // in minutes
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    isOnline: boolean;
    rating: number;
    avatarSeed: string;
}

export interface PosyanduSchedule {
    id: string;
    date: string;
    location: string;
    activity: string;
    target: string; // Balita, Lansia, Ibu Hamil
}

// EDUCATION TYPES
export interface Course {
    id: string;
    title: string;
    instructor: string;
    category: 'VOCATIONAL' | 'ACADEMIC' | 'DIGITAL' | 'AGRICULTURE';
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    students: number;
    rating: number;
    price: number; // 0 for free
    imageColor: string;
}

export interface SchoolEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    type: 'ACADEMIC' | 'SPORTS' | 'ARTS' | 'SOCIAL';
    description?: string;
    speaker?: string;
    schedule?: { time: string; activity: string }[];
}

// MASTER PLAN / CREATIVE FINANCING TYPES
export interface CityMetric {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    year?: string;
    category: 'SOCIAL' | 'ECONOMY' | 'INFRASTRUCTURE' | 'GOVERNANCE';
}

export interface CreativeFinancingProject {
    id: string;
    title: string;
    description: string;
    estimatedCost: number;
    fundingSource: string[]; // e.g., ["APBD", "KPBU", "CSR"]
    status: 'PIPELINE' | 'PREPARATION' | 'PROCUREMENT' | 'EXECUTION';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'INFRASTRUCTURE' | 'HUMAN_DEV' | 'ECONOMY';
}

export interface OpdRole {
    id: string;
    name: string;
    acronym: string;
    role: string;
    responsibility: string[];
}

// TEAM TASK & ASSET MANAGEMENT TYPES
export interface TeamTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string[]; // User IDs or names
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  dueDate: string;
  location?: { lat: number; lng: number; address: string };
  category: 'MAINTENANCE' | 'SECURITY' | 'SOCIAL' | 'ADMIN' | 'HEALTH' | 'ENVIRONMENT';
}

export interface Asset {
  id: string;
  name: string;
  type: 'VEHICLE' | 'EQUIPMENT' | 'FACILITY' | 'ELECTRONIC';
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  location?: { lat: number; lng: number; address: string };
  lastMaintained?: string;
  assignedTo?: string; // User ID or name
  imageColor: string;
}
