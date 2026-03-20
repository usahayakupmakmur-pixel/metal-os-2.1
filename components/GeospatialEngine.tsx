import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Info, 
  X, 
  Layers, 
  Target, 
  Hand, 
  PenTool, 
  Hexagon, 
  Eraser,
  Activity,
  Phone,
  MessageSquare,
  Share2
} from 'lucide-react';

// Fix Leaflet default icon issue
import 'leaflet/dist/leaflet.css';

// Custom icons for different types
const createIcon = (color: string, iconHtml?: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; position: relative;">
            ${iconHtml || '<div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>'}
            <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
          </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Anchor at the bottom tip
    popupAnchor: [0, -32],
  });
};

const ICONS = {
  TASK: createIcon('#10b981'), // emerald-500
  ASSET: createIcon('#3b82f6'), // blue-500
  USER: createIcon('#ef4444'), // red-500
  DRIVER: createIcon('#f59e0b'), // amber-500
  REPORT: createIcon('#ef4444'), // red-500
  PARKING: createIcon('#3b82f6'), // blue-500
  SENSOR: createIcon('#10b981'), // emerald-500
  DEFAULT: createIcon('#6366f1'), // indigo-500
};

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  type: string;
  data?: any;
  color?: string;
  iconHtml?: string;
}

interface GeospatialEngineProps {
  markers?: MapMarker[];
  points?: MapMarker[]; // For compatibility with GeospatialView/TasksView
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onPointSelect?: (point: MapMarker) => void; // For compatibility
  showUserLocation?: boolean;
  className?: string;
  drawingMode?: 'NAVIGATE' | 'MARKER' | 'LINE' | 'POLY' | 'ERASER';
  onDrawingModeChange?: (mode: any) => void;
  onShareLocation?: () => void;
  interactive?: boolean;
}

// Component to handle map view updates
const MapController = ({ center, zoom }: { center: { lat: number; lng: number }, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
};

const UserLocationMarker = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!position) return null;

  return (
    <Marker position={position} icon={ICONS.USER}>
      <Popup>
        <div className="text-xs font-bold">Lokasi Anda</div>
      </Popup>
    </Marker>
  );
};

const GeospatialEngine: React.FC<GeospatialEngineProps> = ({
  markers = [],
  points = [],
  center = { lat: -5.1186, lng: 105.3072 },
  zoom = 15,
  onMarkerClick,
  onPointSelect,
  showUserLocation = true,
  className = "w-full h-full rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200",
  drawingMode = 'NAVIGATE',
  onDrawingModeChange,
  onShareLocation,
  interactive = true
}) => {
  // Combine markers and points for rendering
  const allMarkers = [...markers, ...points];

  return (
    <div className={`relative ${className}`} style={{ minHeight: '300px' }}>
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} zoom={zoom} />
        
        {showUserLocation && <UserLocationMarker />}
        
        {allMarkers.map((marker) => {
          const markerIcon = marker.iconHtml 
            ? createIcon(marker.color || '#6366f1', marker.iconHtml)
            : (ICONS as any)[marker.type] || ICONS.DEFAULT;

          return (
            <Marker 
              key={marker.id} 
              position={[marker.position.lat, marker.position.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  onMarkerClick?.(marker);
                  onPointSelect?.(marker);
                },
              }}
            >
            <Popup>
              <div className="p-1 min-w-[150px] text-slate-800">
                <h4 className="font-bold text-sm">{marker.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{marker.data?.description || 'Lokasi Terdaftar'}</p>
                {marker.data?.status && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {marker.data.status}
                    </span>
                  </div>
                )}
                {marker.type === 'DRIVER' && marker.data?.phone && (
                  <div className="mt-3 flex gap-2">
                    <a 
                      href={`tel:${marker.data.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      <Phone size={10} />
                      Hubungi
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        {onDrawingModeChange && (
          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-slate-200 flex flex-col gap-1">
            <button 
              onClick={() => onDrawingModeChange('NAVIGATE')}
              className={`p-2 rounded-lg transition ${drawingMode === 'NAVIGATE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Geser Peta"
            >
              <Hand size={18} />
            </button>
            <div className="w-full h-px bg-slate-200 my-0.5"></div>
            <button 
              onClick={() => onDrawingModeChange('MARKER')}
              className={`p-2 rounded-lg transition ${drawingMode === 'MARKER' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Tambah Titik"
            >
              <MapPin size={18} />
            </button>
          </div>
        )}

        {onShareLocation && (
          <button 
            onClick={onShareLocation}
            className="p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition flex items-center justify-center"
            title="Bagikan Lokasi"
          >
            <Share2 size={20} />
          </button>
        )}
      </div>

      {/* Attribution / Status Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Activity size={10} className="text-emerald-400" />
            Leaflet Engine Active (No API Key Required)
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeospatialEngine;
