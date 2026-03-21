import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Plus, 
  Activity,
  History,
  Scan,
  Globe
} from 'lucide-react';
import { ASSETS, MOCK_USER } from '../constants';
import { Asset, CitizenProfile } from '../types';
import GeospatialEngine from '../components/GeospatialEngine';

interface AssetsViewProps {
  user?: CitizenProfile;
  onOpenScanner?: () => void;
  pendingAssetId?: string | null;
}

const AssetsView: React.FC<AssetsViewProps> = ({ user = MOCK_USER, onOpenScanner, pendingAssetId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isGeeMode, setIsGeeMode] = useState(false);

  // Handle external asset selection
  React.useEffect(() => {
    if (pendingAssetId) {
      const asset = ASSETS.find(a => a.id === pendingAssetId);
      if (asset) {
        setSelectedAsset(asset);
        setFilterType('ALL');
        setSearchQuery('');
      }
    }
  }, [pendingAssetId]);

  const filteredAssets = ASSETS.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-emerald-400 bg-emerald-400/10';
      case 'IN_USE': return 'text-blue-400 bg-blue-400/10';
      case 'MAINTENANCE': return 'text-amber-400 bg-amber-400/10';
      case 'RETIRED': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT': return 'text-emerald-500';
      case 'GOOD': return 'text-blue-500';
      case 'FAIR': return 'text-amber-500';
      case 'POOR': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VEHICLE': return <Truck className="w-5 h-5" />;
      case 'EQUIPMENT': return <Wrench className="w-5 h-5" />;
      case 'FACILITY': return <Package className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Asset Management</h1>
          <p className="text-sm text-slate-400">Track and maintain community physical assets</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setShowMap(!showMap)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Toggle Map View"
            >
              <MapPin className={`w-5 h-5 ${showMap ? 'text-blue-400' : 'text-slate-400'}`} />
            </button>
            {showMap && (
              <button 
                onClick={() => setIsGeeMode(!isGeeMode)}
                className={`p-2 rounded-lg transition-colors border ${isGeeMode ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                title="Toggle Google Earth Engine"
              >
                <Globe className="w-5 h-5" />
              </button>
            )}
          <button 
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all border border-slate-700"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Asset</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20">
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'VEHICLE', 'EQUIPMENT', 'FACILITY'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterType === type 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Asset Grid */}
        <div className={`flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${showMap ? 'hidden md:grid md:w-1/2' : 'w-full'}`}>
          {filteredAssets.map((asset, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                selectedAsset?.id === asset.id 
                  ? 'bg-slate-800 border-blue-500/50 shadow-xl shadow-blue-900/10' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl ${asset.imageColor}`} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${asset.imageColor} bg-opacity-20 text-white shadow-inner`}>
                  {getIcon(asset.type)}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getStatusColor(asset.status)}`}>
                  {asset.status.replace('_', ' ')}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-1 relative z-10">
                {asset.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-4 relative z-10">
                <MapPin className="w-3 h-3" />
                <span>{asset.location.address}</span>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Condition</span>
                  <span className={`font-bold ${getConditionColor(asset.condition)}`}>{asset.condition}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Last Maintained</span>
                  <span className="text-slate-300 font-bold">{asset.lastMaintained}</span>
                </div>
                {asset.assignedTo && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Assigned To</span>
                    <span className="text-blue-400 font-bold">{asset.assignedTo}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2 relative z-10">
                <button className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-wider transition-colors">
                  Details
                </button>
                <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                  <Wrench className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map View */}
        {showMap && (
          <div className="flex-1 h-full border-l border-slate-800 relative">
            <GeospatialEngine 
              center={selectedAsset?.location ? { lat: selectedAsset.location.lat, lng: selectedAsset.location.lng } : { lat: -5.1188, lng: 105.3075 }}
              zoom={15}
              isGeeMode={isGeeMode}
              geeLayers={{ ndvi: false, nightlights: true, landcover: false, water: false, terrain: false, population: false }}
              points={filteredAssets.filter(a => a.location).map(a => ({
                id: a.id,
                position: { lat: a.location!.lat, lng: a.location!.lng },
                title: a.name,
                type: 'ASSET',
                data: a
              }))}
              onPointSelect={(point) => setSelectedAsset(point.data)}
            />
            {/* Asset Detail Overlay */}
            {selectedAsset && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 right-6 left-6 md:left-auto md:w-80 p-5 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-[1000]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${selectedAsset.imageColor} bg-opacity-20 text-white`}>
                    {getIcon(selectedAsset.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{selectedAsset.name}</h4>
                    <span className={`text-[10px] font-bold uppercase ${getStatusColor(selectedAsset.status).split(' ')[0]}`}>
                      {selectedAsset.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-1 mb-1">
                      <Activity className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] text-slate-500 uppercase">Health</span>
                    </div>
                    <span className={`text-xs font-bold ${getConditionColor(selectedAsset.condition)}`}>
                      {selectedAsset.condition}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-1 mb-1">
                      <History className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-slate-500 uppercase">Service</span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      {selectedAsset.lastMaintained}
                    </span>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
                  Schedule Maintenance
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsView;
