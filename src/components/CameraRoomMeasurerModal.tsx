import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  X,
  Maximize2,
  CheckCircle2,
  Ruler,
  Building,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Info,
} from "lucide-react";

interface CameraRoomMeasurerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDimensions: (lengthM: number, widthM: number, snapshotPhotoUrl?: string) => void;
  initialLength?: number;
  initialWidth?: number;
}

export const CameraRoomMeasurerModal: React.FC<CameraRoomMeasurerModalProps> = ({
  isOpen,
  onClose,
  onApplyDimensions,
  initialLength = 20,
  initialWidth = 10,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Measured dimensions state
  const [measuredLength, setMeasuredLength] = useState<number>(initialLength);
  const [measuredWidth, setMeasuredWidth] = useState<number>(initialWidth);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Calibration scale factor (simulated AR depth calibration)
  const [opticalCalibration, setOpticalCalibration] = useState<number>(1.0);
  const [measurementMode, setMeasurementMode] = useState<"AR_Laser" | "Manual_Scale">("AR_Laser");

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setCameraError(
        "Accès à la caméra restreint ou non disponible sur cet appareil. Le télémètre visuel en mode virtuel reste pleinement fonctionnel !"
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Draw measurement overlay on image
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(
          `Bâtiment : ${measuredLength}m x ${measuredWidth}m (${(measuredLength * measuredWidth).toFixed(1)} m²)`,
          60,
          85
        );

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedPhotoUrl(dataUrl);
      }
    } else {
      // Fallback simulated snapshot
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 600, 400);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.strokeRect(40, 40, 520, 320);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(`CAPTURE BÂTIMENT - ${measuredLength}m x ${measuredWidth}m`, 60, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Surface Mesurée : ${(measuredLength * measuredWidth).toFixed(1)} m²`, 60, 120);
        setCapturedPhotoUrl(canvas.toDataURL("image/jpeg"));
      }
    }
  };

  if (!isOpen) return null;

  const areaM2 = Number((measuredLength * measuredWidth).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border border-amber-500/40 space-y-4 animate-in fade-in zoom-in-95 my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-lg">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <span>Télémètre Bâtiment & Mesure par Caméra</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                  Scanner Visuel
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Pointez la caméra du téléphone sur les murs du bâtiment pour ajuster et enregistrer la surface ($m^2$).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View / Video Stream Container */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-950 rounded-2xl border-2 border-amber-500/50 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <Camera className="w-8 h-8 animate-pulse" />
              </div>
              <div className="text-xs text-slate-300 max-w-md mx-auto">
                {cameraError || "Activation de la caméra en cours..."}
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
              >
                Activer / Reconnecter la Caméra
              </button>
            </div>
          )}

          {/* AR Measurement Overlay Frame */}
          <div className="absolute inset-4 border-2 border-amber-400/80 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3">
            {/* Top Bar Overlay */}
            <div className="flex justify-between items-center text-[11px] font-mono font-bold bg-slate-900/80 px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-300 backdrop-blur">
              <span className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>RÈGLE LASER OPTIQUE ACTIF</span>
              </span>
              <span>CALIBRATION : {(opticalCalibration * 100).toFixed(0)}%</span>
            </div>

            {/* Crosshair / Center Target */}
            <div className="self-center my-auto relative">
              <div className="w-16 h-16 border-2 border-emerald-400 rounded-full flex items-center justify-center animate-ping opacity-75" />
              <div className="w-4 h-4 bg-emerald-500 rounded-full absolute inset-0 m-auto shadow-lg shadow-emerald-500/50" />
            </div>

            {/* Bottom Dimensions Banner */}
            <div className="bg-slate-900/90 border border-emerald-500/50 text-white p-2.5 rounded-xl flex items-center justify-between text-xs font-black backdrop-blur">
              <div className="flex items-center space-x-3">
                <div className="text-amber-400 font-mono">
                  Long : {measuredLength} m
                </div>
                <div className="text-emerald-400 font-mono">
                  Larg : {measuredWidth} m
                </div>
              </div>

              <div className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg text-sm font-black shadow">
                SURFACE : {areaM2} m²
              </div>
            </div>
          </div>
        </div>

        {/* Dimension Sliders & Fine Tuning */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center space-x-1.5">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>Ajuster les Côtés du Bâtiment (Mesure Télémètre) :</span>
            </span>
            <span className="text-slate-400 text-[11px]">Directement modifiable</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Length Control */}
            <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-700">
              <div className="flex justify-between font-extrabold text-white">
                <span>1. Longueur ($L$) :</span>
                <span className="text-amber-400 font-mono text-sm">{measuredLength} m</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="0.5"
                value={measuredLength}
                onChange={(e) => setMeasuredLength(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2 m</span>
                <span>50 m</span>
                <span>100 m</span>
              </div>
            </div>

            {/* Width Control */}
            <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-700">
              <div className="flex justify-between font-extrabold text-white">
                <span>2. Largeur ($W$) :</span>
                <span className="text-emerald-400 font-mono text-sm">{measuredWidth} m</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="0.5"
                value={measuredWidth}
                onChange={(e) => setMeasuredWidth(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2 m</span>
                <span>25 m</span>
                <span>50 m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Snapshot Photo Preview if Captured */}
        {capturedPhotoUrl && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center space-x-3">
              <img
                src={capturedPhotoUrl}
                alt="Capture Bâtiment"
                className="w-12 h-12 rounded-lg object-cover border border-emerald-400"
              />
              <div>
                <div className="font-bold text-white">Photo du Bâtiment Capturée ✓</div>
                <div className="text-[11px] text-emerald-300">
                  Instantané visuel prêt pour archivage dans le rapport.
                </div>
              </div>
            </div>
            <button
              onClick={() => setCapturedPhotoUrl(null)}
              className="text-rose-400 hover:text-rose-300 text-xs font-bold"
            >
              Supprimer
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border border-amber-500/30"
          >
            <Camera className="w-4 h-4" />
            <span>Prendre Photo & Capturer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onApplyDimensions(measuredLength, measuredWidth, capturedPhotoUrl || undefined);
              onClose();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Valider la Surface ({areaM2} m²)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
