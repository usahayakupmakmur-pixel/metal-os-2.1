import React, { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';

interface BootloaderProps {
  onComplete: () => void;
}

const Bootloader: React.FC<BootloaderProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const bootSequence = [
      { text: "MetalOS Boot Manager v1.0.4-alpha", delay: 200 },
      { text: "Initializing Kernel...", delay: 600 },
      { text: "CPU Check: Cognitive Gov Processor [OK]", delay: 1000 },
      { text: "Memory Check: 4096MB Social Capital Allocated [OK]", delay: 1400 },
      { text: "Mounting File System: /dev/warga_data (BigQuery Lakehouse)...", delay: 1800 },
      { text: "Loading Driver: Warga-Net Mesh Protocol...", delay: 2200 },
      { text: "Loading Driver: EnviroSense IoT Bridge...", delay: 2600 },
      { text: "Starting System Service: GlassHouse Governance...", delay: 3000 },
      { text: "Starting System Service: WargaPay Secure Enclave...", delay: 3400 },
      { text: "Initializing AI Subsystem: Gemini Neural Engine...", delay: 3800 },
      { text: "System Integrity Verified. Launching Userland...", delay: 4500 },
    ];

    let timeoutId: ReturnType<typeof setTimeout>;
    let stepIndex = 0;

    const runStep = () => {
      // If we've processed all steps, finish
      if (stepIndex >= bootSequence.length) {
        timeoutId = setTimeout(onComplete, 800);
        return;
      }

      const step = bootSequence[stepIndex];
      
      // Safety check to ensure step exists
      if (step) {
        setLogs(prev => [...prev, `> ${step.text}`]);
        setProgress(((stepIndex + 1) / bootSequence.length) * 100);
      }

      // Schedule next step
      stepIndex++;
      
      if (stepIndex < bootSequence.length) {
        const nextStep = bootSequence[stepIndex];
        // Calculate delay diff or default to 400ms if logic fails
        const currentDelay = step ? step.delay : 0;
        const nextDelay = nextStep ? nextStep.delay : currentDelay + 400;
        const waitTime = Math.max(0, nextDelay - currentDelay);
        
        timeoutId = setTimeout(runStep, waitTime);
      } else {
        // Just finished last step, wait a bit then complete
        timeoutId = setTimeout(onComplete, 800);
      }
    };

    // Start the sequence
    const firstDelay = bootSequence[0]?.delay || 0;
    timeoutId = setTimeout(runStep, firstDelay);

    return () => clearTimeout(timeoutId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono z-[100] flex flex-col items-center justify-center p-8 select-none">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8 border-b border-green-900/50 pb-4">
          <Cpu className="w-10 h-10 animate-pulse text-green-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-green-400">MetalOS <span className="text-xs align-top opacity-70">KERNEL</span></h1>
            <p className="text-xs text-green-600">Yosomulyo Cognitive Infrastructure</p>
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-lg border border-green-900/30 h-80 overflow-hidden flex flex-col justify-end shadow-[0_0_30px_rgba(0,255,0,0.05)] relative">
            <div className="absolute top-2 right-4 text-xs opacity-30">tty1</div>
          {logs.map((log, i) => (
            <div key={i} className="mb-1.5 flex items-start gap-2 text-sm">
              <span className="opacity-40 min-w-[80px]">{new Date().toLocaleTimeString([], {hour12: false})}</span>
              <span className="break-all">{log}</span>
            </div>
          ))}
          <div className="animate-pulse text-green-400 mt-2">_</div>
        </div>

        <div className="mt-8 space-y-2">
            <div className="flex justify-between text-xs text-green-700 uppercase font-semibold">
                <span>Boot Sequence</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-900 rounded-sm h-1.5 border border-green-900/30 overflow-hidden">
            <div 
                className="bg-green-600 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(0,255,0,0.5)]" 
                style={{ width: `${progress}%` }}
            ></div>
            </div>
        </div>
        
        <div className="mt-4 text-center">
            <p className="text-[10px] text-green-800 uppercase tracking-widest">
                Protected by Pancadaya Security Protocol
            </p>
        </div>
      </div>
    </div>
  );
};

export default Bootloader;