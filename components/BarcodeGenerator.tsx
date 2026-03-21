
import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, RefreshCw, Type, QrCode, BarChart as BarIcon, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BarcodeGeneratorProps {
  initialValue?: string;
  onSave?: (data: { label: string; value: string; type: 'BARCODE' | 'QR' }) => void;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ initialValue = 'PAYUNGI-2026', onSave }) => {
  const [value, setValue] = useState(initialValue);
  const [label, setLabel] = useState('Label Produk');
  const [type, setType] = useState<'BARCODE' | 'QR'>('QR');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ label, value, type });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const downloadAsImage = () => {
    const svg = document.getElementById('generated-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(label, canvas.width / 2, canvas.height - 30);
        ctx.font = '12px Inter';
        ctx.fillText(value, canvas.width / 2, canvas.height - 10);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${label.replace(/\s+/g, '_')}_code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <QrCode className="text-indigo-400" /> Generator Kode Pintar
          </h3>
          <p className="text-slate-400 text-xs">Buat Barcode & QR untuk Produk Warga</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setType('QR')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${type === 'QR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            QR Code
          </button>
          <button 
            onClick={() => setType('BARCODE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${type === 'BARCODE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Barcode
          </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Type size={14} /> Label Produk
            </label>
            <input 
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Tepung Mocaf Premium"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <BarIcon size={14} /> Nilai / ID Kode
            </label>
            <div className="relative">
              <input 
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"
              />
              <button 
                onClick={() => setValue(`PYG-${Math.floor(100000 + Math.random() * 900000)}`)}
                className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-indigo-600 transition"
                title="Generate Random ID"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Tersimpan ke Sistem' : 'Simpan ke Katalog'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleCopy}
                className="py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Tersalin' : 'Salin ID'}
              </button>
              <button 
                onClick={downloadAsImage}
                className="py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition"
              >
                <Download size={16} /> Unduh PNG
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 relative min-h-[300px]">
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Preview
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div id="generated-code-svg-container">
              {type === 'QR' ? (
                <QRCodeSVG 
                  id="generated-code-svg"
                  value={value} 
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="overflow-hidden">
                  <Barcode 
                    id="generated-code-svg"
                    value={value} 
                    width={1.5}
                    height={80}
                    fontSize={14}
                    background="transparent"
                  />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm">{label}</p>
              <p className="text-slate-400 font-mono text-[10px]">{value}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Siap cetak & integrasi sistem
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
