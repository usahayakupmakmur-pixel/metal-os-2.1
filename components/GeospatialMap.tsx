
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ParkingZone } from '../types';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GeospatialMapProps {
    zones: ParkingZone[];
    onZoneClick?: (zone: ParkingZone) => void;
    center?: [number, number];
    zoom?: number;
}

// Component to handle map center updates
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const GeospatialMap: React.FC<GeospatialMapProps> = ({ 
    zones, 
    onZoneClick, 
    center = [-5.1185, 105.3075], 
    zoom = 17 
}) => {
    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
            <MapContainer 
                center={center} 
                zoom={zoom} 
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {zones.map((zone) => (
                    <React.Fragment key={zone.id}>
                        {zone.realCoordinates && (
                            <>
                                <Marker 
                                    position={[zone.realCoordinates.lat, zone.realCoordinates.lng]}
                                    eventHandlers={{
                                        click: () => onZoneClick?.(zone),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <h3 className="font-bold text-slate-800 m-0">{zone.name}</h3>
                                            <p className="text-xs text-slate-500 m-0 mb-2">Juru Parkir: {zone.attendant}</p>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${zone.status === 'FULL' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {zone.status === 'FULL' ? 'PENUH' : 'TERSEDIA'}
                                                </span>
                                                <span className="text-xs font-bold">{zone.occupied}/{zone.capacity}</span>
                                            </div>
                                            <button 
                                                onClick={() => onZoneClick?.(zone)}
                                                className="w-full mt-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition"
                                            >
                                                PILIH ZONA
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle 
                                    center={[zone.realCoordinates.lat, zone.realCoordinates.lng]}
                                    radius={30}
                                    pathOptions={{ 
                                        fillColor: zone.status === 'FULL' ? '#ef4444' : '#3b82f6',
                                        color: zone.status === 'FULL' ? '#b91c1c' : '#1d4ed8',
                                        weight: 1,
                                        fillOpacity: 0.2
                                    }}
                                />
                            </>
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>

            {/* Map Overlay Legends */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-lg space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Legenda</h4>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-medium text-slate-700">Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-medium text-slate-700">Penuh</span>
                </div>
            </div>
        </div>
    );
};

export default GeospatialMap;
