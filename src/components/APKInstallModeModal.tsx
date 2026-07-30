import React, { useState } from "react";
import { ApkInstallMode, UserSession } from "../types";
import {
  getApkInstallMode,
  saveApkInstallMode,
  verifyApkManagerPassword,
  getApkModeDetails,
} from "../utils/apkInstallStore";
import { loadAllUserSessions, saveCurrentUserSession } from "../data/authStore";
import {
  Smartphone,
  ShieldCheck,
  Building2,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  UserCheck,
} from "lucide-react";

interface APKInstallModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ApkInstallMode;
  onModeChanged: (newMode: ApkInstallMode, updatedUser?: UserSession) => void;
}

export const APKInstallModeModal: React.FC<APKInstallModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChanged,
}) => {
  const [selectedMode, setSelectedMode] = useState<ApkInstallMode>(currentMode);
  const [passwordInput, setPasswordInput] = useState<string>("1234");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmModeSelection = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify manager password
    const isValid = verifyApkManagerPassword(selectedMode, passwordInput);
    if (!isValid) {
      setErrorMsg(
        `Mot de passe incorrect pour le mode ${selectedMode}. Pour AVIVOIRE et PORCIVOIRE, le mot de passe par défaut est '1234'.`
      );
      return;
    }

    // Save selected mode
    saveApkInstallMode(selectedMode);

    // Switch corresponding User Session for seamless management
    const allSessions = loadAllUserSessions();
    let targetUser: UserSession | undefined;

    if (selectedMode === "AVIVOIRE") {
      targetUser = allSessions.find((u) => u.username === "avivoire" || u.username === "resp.avic");
    } else if (selectedMode === "PORCIVOIRE") {
      targetUser = allSessions.find((u) => u.username === "porcivoire" || u.username === "resp.porc");
    } else {
      targetUser = allSessions.find((u) => u.username === "admin");
    }

    if (targetUser) {
      saveCurrentUserSession(targetUser);
    }

    const details = getApkModeDetails(selectedMode);
    setSuccessMsg(
      `Mode d'installation APK configuré sur : ${details.title}. Session Responsable Gérant activée !`
    );

    setTimeout(() => {
      onModeChanged(selectedMode, targetUser);
      onClose();
    }, 1200);
  };

  const adminDetails = getApkModeDetails("ADMINISTRATION_GENERALE");
  const aviDetails = getApkModeDetails("AVIVOIRE");
  const porcDetails = getApkModeDetails("PORCIVOIRE");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">
                  Installation APK & Choix de Direction
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Mode Android APK
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Sélectionnez le mode d'installation pour restreindre l'application uniquement au périmètre d'activité de votre direction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 p-4 rounded-2xl flex items-start space-x-3 text-xs animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="font-bold">{successMsg}</p>
            </div>
          )}

          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Choisissez le profil d'installation APK souhaité :
          </div>

          {/* 3 Modes Cards Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. ADMINISTRATION GENERALE */}
            <div
              onClick={() => {
                setSelectedMode("ADMINISTRATION_GENERALE");
                setErrorMsg(null);
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                selectedMode === "ADMINISTRATION_GENERALE"
                  ? "bg-slate-800/90 border-blue-500 shadow-xl ring-2 ring-blue-500/50"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{adminDetails.iconEmoji}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Tous Modules
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white">{adminDetails.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {adminDetails.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">Mot de passe :</span>{" "}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-amber-300">
                  1234
                </code>
              </div>
            </div>

            {/* 2. AVIVOIRE */}
            <div
              onClick={() => {
                setSelectedMode("AVIVOIRE");
                setErrorMsg(null);
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                selectedMode === "AVIVOIRE"
                  ? "bg-slate-800/90 border-amber-500 shadow-xl ring-2 ring-amber-500/50"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{aviDetails.iconEmoji}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Pôle Avicole
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-amber-300">{aviDetails.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {aviDetails.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">Mot de passe par défaut :</span>{" "}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300 font-black">
                  1234
                </code>
              </div>
            </div>

            {/* 3. PORCIVOIRE */}
            <div
              onClick={() => {
                setSelectedMode("PORCIVOIRE");
                setErrorMsg(null);
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                selectedMode === "PORCIVOIRE"
                  ? "bg-slate-800/90 border-emerald-500 shadow-xl ring-2 ring-emerald-500/50"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{porcDetails.iconEmoji}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Pôle Porcin
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-emerald-300">{porcDetails.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {porcDetails.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">Mot de passe par défaut :</span>{" "}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-300 font-black">
                  1234
                </code>
              </div>
            </div>
          </div>

          {/* Form Password Activation */}
          <form onSubmit={handleConfirmModeSelection} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <Key className="w-4 h-4 text-amber-400" />
                <span>2. Mot de Passe Responsable Gérant ({selectedMode}) :</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Saisissez le mot de passe pour déverrouiller la gérance de ce module (Par défaut : <strong>1234</strong>)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Mot de passe (ex: 1234)"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 pl-9 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Activer l'Installation ({selectedMode})</span>
              </button>
            </div>
          </form>

          {/* Informational Footer box */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start space-x-3 text-xs text-emerald-200">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">
                Avantages de la séparation par Mode d'Installation APK :
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                <li>
                  <strong>AVIVOIRE</strong> : Masque les volets porcins et se concentre uniquement sur la gérance des poulets, pondeuses, alim. volaille & ventes volaille.
                </li>
                <li>
                  <strong>PORCIVOIRE</strong> : Masque les volets avicoles et se concentre uniquement sur la gérance des porcheries, maternités, alim. porcin & ventes porcs.
                </li>
                <li>
                  <strong>ADMINISTRATION GÉNÉRALE</strong> : Conserve l'accès global pour la direction financière et le propriétaire.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
