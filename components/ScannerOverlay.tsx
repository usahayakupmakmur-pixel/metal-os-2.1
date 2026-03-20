
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, CameraDevice } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Zap, RefreshCcw, Maximize2, Scan, CheckCircle2, AlertCircle, History, Trash2 } from 'lucide-react';

interface ScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  description?: string;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  title = "Pindai Kode QR / Barcode",
  description = "Arahkan kamera ke kode QR atau Barcode untuk memproses transaksi atau data."
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [scanHistory, setScanHistory] = useState<{ text: string, time: string, type: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'SCAN' | 'HISTORY'>('SCAN');

  const startScanner = async (cameraIndex: number = 0) => {
    try {
      setError(null);
      setScanResult(null);
      
      const devices = await Html5Qrcode.getCameras();
      setAvailableCameras(devices);
      
      if (devices && devices.length > 0) {
        const html5QrCode = new Html5Qrcode("scanner-region");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15, // Increased FPS for smoother scanning
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0
        };

        const cameraId = devices[cameraIndex % devices.length].id;

        await html5QrCode.start(
          cameraId,
          config,
          (decodedText) => {
            if (scanResult) return; // Prevent multiple scans
            setScanResult(decodedText);
            
            // Add to history
            const newEntry = {
              text: decodedText,
              time: new Date().toLocaleTimeString(),
              type: decodedText.includes(':') ? decodedText.split(':')[0] : 'RAW'
            };
            setScanHistory(prev => [newEntry, ...prev].slice(0, 10));
            
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            
            setTimeout(() => {
              onScanSuccess(decodedText);
              stopScanner();
            }, 800);
          },
          (errorMessage) => {
            // Ignore frequent errors during scanning
          }
        );
        
        setIsScanning(true);
        setCurrentCameraIndex(cameraIndex % devices.length);
      } else {
        setError("Tidak ada kamera yang ditemukan pada perangkat ini.");
      }
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError("Gagal mengakses kamera. Pastikan izin diberikan dan perangkat memiliki kamera.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
      try {
        await scannerRef.current.stop();
        // scannerRef.current.clear(); // clear() is not always needed and can cause issues if already stopped
        scannerRef.current = null;
        setIsScanning(false);
        setIsTorchOn(false);
      } catch (err) {
        console.error("Stop scanner error:", err);
      }
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length > 1) {
      await stopScanner();
      startScanner(currentCameraIndex + 1);
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && isScanning) {
      try {
        const newState = !isTorchOn;
        // html5-qrcode doesn't expose torch directly in a simple way for all devices
        // but we can try to apply constraints to the video track
        const track = (scannerRef.current as any)._videoElement?.srcObject?.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities();
          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: newState }]
            });
            setIsTorchOn(newState);
          } else {
            // Fallback notification or UI state
            console.log("Torch not supported on this camera");
            setIsTorchOn(newState); // Still toggle state for UI feedback
          }
        }
      } catch (err) {
        console.error("Torch error:", err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
        >
          <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-square bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-gradient-to-b from-slate-900 to-transparent z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Scan className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <button 
                      onClick={() => setActiveTab('SCAN')}
                      className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'SCAN' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      Scanner
                    </button>
                    <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                    <button 
                      onClick={() => setActiveTab('HISTORY')}
                      className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'HISTORY' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      History ({scanHistory.length})
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Region */}
            <div className="flex-1 relative overflow-hidden">
              {activeTab === 'SCAN' ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 relative flex items-center justify-center">
                    <div id="scanner-region" className="w-full h-full"></div>
                    
                    {/* Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      {/* Scanning Frame */}
                      <div className="w-64 h-64 border-2 border-cyan-500/30 rounded-3xl relative">
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl"></div>
                        
                        {/* Scanning Line */}
                        {isScanning && !scanResult && (
                          <motion.div 
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute left-4 right-4 h-0.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-10"
                          />
                        )}

                        {/* Success State */}
                        {scanResult && (
                          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 mb-3">
                              <CheckCircle2 className="text-white w-10 h-10" />
                            </div>
                            <p className="text-white font-bold text-sm">Berhasil Dipindai</p>
                          </div>
                        )}
                      </div>

                      {/* Status Text */}
                      <div className="mt-8 text-center px-8">
                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                          {scanResult ? "Memproses data..." : description}
                        </p>
                      </div>
                    </div>

                    {/* Error State */}
                    {error && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                        <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
                        <h4 className="text-white font-bold text-lg mb-2">Kamera Bermasalah</h4>
                        <p className="text-slate-400 text-sm mb-6">{error}</p>
                        <button 
                          onClick={() => startScanner(currentCameraIndex)}
                          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition flex items-center gap-2"
                        >
                          <RefreshCcw size={18} /> Coba Lagi
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="p-8 bg-slate-900 flex justify-center items-center gap-4 md:gap-8">
                    <button 
                      onClick={toggleTorch}
                      className={`p-4 rounded-2xl transition flex flex-col items-center gap-2 min-w-[80px] ${isTorchOn ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <Zap size={24} className={isTorchOn ? 'animate-pulse' : ''} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Senter</span>
                    </button>
                    
                    <button 
                      onClick={switchCamera}
                      disabled={availableCameras.length <= 1}
                      className={`p-4 rounded-2xl transition flex flex-col items-center gap-2 min-w-[80px] ${availableCameras.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <RefreshCcw size={24} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Kamera</span>
                    </button>

                    <button 
                      onClick={() => { stopScanner(); startScanner(currentCameraIndex); }}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition flex flex-col items-center gap-2 min-w-[80px]"
                    >
                      <RefreshCcw size={24} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Reset</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <History size={18} className="text-cyan-400" />
                      Riwayat Pindaian
                    </h4>
                    <button 
                      onClick={() => setScanHistory([])}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition"
                    >
                      <Trash2 size={14} />
                      Hapus Semua
                    </button>
                  </div>

                  {scanHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Scan size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm">Belum ada riwayat pindaian.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scanHistory.map((item, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition group cursor-pointer"
                          onClick={() => {
                            onScanSuccess(item.text);
                            onClose();
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{item.type}</span>
                            <span className="text-[10px] text-slate-500">{item.time}</span>
                          </div>
                          <p className="text-white text-sm font-medium truncate">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Branding */}
            <div className="pb-6 text-center">
              <div className="flex items-center justify-center gap-2 opacity-30">
                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                <span className="text-[8px] font-mono text-white tracking-[0.3em] uppercase">MetalOS Cognitive Security</span>
                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScannerOverlay;
