"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, X, Zap } from "lucide-react";

export default function CameraScanner({ onCapture, onClose }: { onCapture: (base64: string) => void, onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function setupCamera() {
      try {
        // 1. Force a clean request for permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment", 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });

        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // 2. Neuro-check: We wait for the hardware to 'fire' before showing the UI
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              setIsActive(true);
            } catch (playError) {
              console.error("Playback failed:", playError);
            }
          };
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        // 3. User feedback for the permission hurdle
        alert("Savor needs camera permission! Click the 'Lock' icon in your browser bar to Allow.");
        onClose();
      }
    }

    setupCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
      onCapture(base64);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center">
      {/* Top Bar */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center text-white z-10">
        <h3 className="font-bold tracking-tight">SAVOR RECEIPT SCAN</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative w-[90%] max-w-md aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-black">
        {/* Added 'muted' and 'playsInline' to satisfy browser security */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 italic text-xs animate-pulse">
            Establishing neural link to camera...
          </div>
        )}

        {/* The "Neural" Overlay */}
        <div className="absolute inset-0 border-[2px] border-dashed border-green-400/50 m-12 rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-400/40 animate-scan shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Button */}
      <div className="mt-12 flex items-center gap-8">
        <button 
          onClick={takeSnapshot}
          disabled={!isActive}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="w-16 h-16 border-4 border-slate-900 rounded-full flex items-center justify-center">
            <Zap className="text-slate-900 w-6 h-6 fill-current" />
          </div>
        </button>
      </div>
    </div>
  );
}