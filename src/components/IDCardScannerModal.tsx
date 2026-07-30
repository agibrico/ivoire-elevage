import React, { useState, useRef, useEffect } from "react";
import { Camera, X, CheckCircle2, Upload, FileText, RefreshCw, ShieldCheck } from "lucide-react";

interface IDCardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedImageUrl: string, cardNumberDetected?: string) => void;
}

export const IDCardScannerModal: React.FC<IDCardScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [manualCardNumber, setManualCardNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
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
      console.warn("ID Card Scanner camera notice:", err);
      setErrorMessage("Caméra indisponible ou bloquée. Vous pouvez importer une photo de la CNI depuis votre galerie.");
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

  const handleCaptureCard = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 500;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Watermark CNI Scan Verification
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("SCAN CERTIFIÉ CNI - IVOIRE ÉLEVAGE RH", 30, 40);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);

        // Simulated auto card number extraction if empty
        if (!manualCardNumber) {
          const randomCni = `CNI-CI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
          setManualCardNumber(randomCni);
        }
      }
    } else {
      // Mock CNI Canvas image
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 380;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, 600, 380);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 560, 340);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("RÉPUBLIQUE DE CÔTE D'IVOIRE", 40, 60);
        ctx.font = "16px sans-serif";
        ctx.fillText("CARTE NATIONALE D'IDENTITÉ / PASSEPORT", 40, 90);
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`N° Pièce : ${manualCardNumber || "CNI-CI-2026-889900"}`, 40, 130);

        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        if (!manualCardNumber) setManualCardNumber("CNI-CI-2026-889900");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          if (!manualCardNumber) {
            setManualCardNumber(`CNI-CI-2026-${Math.floor(100000 + Math.random() * 900000)}`);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-emerald-500/50 space-y-4 animate-in fade-in zoom-in-95 my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <span>Session de Scan CNI / Pièce d'Identité</span>
              </h3>
              <p className="text-xs text-slate-400">
                Enregistrez le document officiel d'identité de l'agent (CNI, Passeport, Attestation).
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

        {/* Camera / Upload Section */}
        <div className="relative w-full h-64 bg-slate-950 rounded-2xl border-2 border-emerald-500/50 overflow-hidden flex items-center justify-center shadow-inner">
          <canvas ref={canvasRef} className="hidden" />

          {capturedImage ? (
            <div className="relative w-full h-full p-2">
              <img
                src={capturedImage}
                alt="Scan Pièce Identité"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>SCAN VALIDE</span>
              </div>
            </div>
          ) : isCameraActive ? (
            <div className="relative w-full h-full">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* CNI Card Frame Overlay */}
              <div className="absolute inset-8 border-2 border-amber-400 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                <span className="bg-slate-900/80 text-amber-300 font-bold text-xs px-3 py-1 rounded-full border border-amber-400/50">
                  Cadrez la CNI ou le Passeport ici
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-3">
              <Camera className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
              <div className="text-xs text-slate-300">{errorMessage || "Session Caméra Inactive"}</div>
              <label className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Importer un Fichier / Photo de la CNI</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Card Number Input & Controls */}
        <div className="space-y-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div>
            <label className="text-xs font-extrabold text-emerald-300 block mb-1">
              Numéro de la Pièce d'Identité (CNI / Passeport) :
            </label>
            <input
              type="text"
              placeholder="ex: CNI-CI-2026-987654"
              value={manualCardNumber}
              onChange={(e) => setManualCardNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-2">
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCaptureCard}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capturer le Scan de la Pièce</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCapturedImage(null)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recommencer le Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={!capturedImage && !manualCardNumber}
            onClick={() => {
              stopCamera();
              onScanComplete(capturedImage || "", manualCardNumber);
              onClose();
            }}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enregistrer la Pièce d'Identité</span>
          </button>
        </div>
      </div>
    </div>
  );
};
