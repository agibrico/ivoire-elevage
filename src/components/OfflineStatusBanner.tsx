import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, HardDriveUpload, Database, ShieldCheck } from "lucide-react";
import {
  getOfflineEntries,
  clearSyncedOfflineEntries,
  forceSyncToIndexedDB,
  getIndexedDBEntries,
  OfflineEntry,
} from "../utils/offlineStorage";

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [entries, setEntries] = useState<OfflineEntry[]>([]);
  const [idbCount, setIdbCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const refreshCacheStatus = async () => {
    const local = getOfflineEntries();
    setEntries(local);

    try {
      const idbEntries = await getIndexedDBEntries();
      setIdbCount(idbEntries.length);
    } catch (e) {
      console.warn("IndexedDB non disponible:", e);
    }
  };

  useEffect(() => {
    refreshCacheStatus();

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      // Synchronisation automatique vers IndexedDB au rétablissement de la connexion
      try {
        const result = await forceSyncToIndexedDB();
        await refreshCacheStatus();
        if (result.syncedCount > 0) {
          setSyncSuccessMsg(`Connexion rétablie : ${result.syncedCount} saisie(s) synchronisée(s) vers IndexedDB !`);
          setTimeout(() => setSyncSuccessMsg(null), 5000);
        }
      } catch (err) {
        console.error("Erreur de sync auto:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshCacheStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check for local storage & IndexedDB entries every 5 seconds
    const interval = setInterval(refreshCacheStatus, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const unsyncedCount = entries.filter((e) => !e.synced).length;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await forceSyncToIndexedDB();
      await refreshCacheStatus();
      setSyncSuccessMsg(
        `${result.syncedCount || entries.length} saisie(s) synchronisée(s) vers IndexedDB (Total stocké : ${result.totalIndexedDB})`
      );
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err) {
      console.error("Erreur de sync manuelle:", err);
      setSyncSuccessMsg("Erreur lors de la synchronisation IndexedDB.");
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = () => {
    clearSyncedOfflineEntries();
    refreshCacheStatus();
  };

  return (
    <div
      className={`px-4 py-2 text-xs font-medium transition-all flex flex-wrap items-center justify-between gap-3 border-b ${
        !isOnline
          ? "bg-rose-950 text-rose-100 border-rose-800 shadow-inner"
          : unsyncedCount > 0
          ? "bg-amber-950 text-amber-100 border-amber-800"
          : "bg-slate-900 text-slate-300 border-slate-800"
      }`}
    >
      {/* Network Status & Info */}
      <div className="flex items-center space-x-2.5">
        {!isOnline ? (
          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-rose-600 text-white font-black rounded-full text-[10px] uppercase tracking-wider animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mode Hors-Ligne (Zone Élevage)</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-800 text-emerald-100 font-bold rounded-full text-[10px] uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connexion Réseau Active</span>
          </span>
        )}

        <span className="text-[11px] text-slate-300">
          {!isOnline
            ? "Vos saisies d'élevage sont conservées en sécurité dans la mémoire locale de votre appareil."
            : unsyncedCount > 0
            ? `${unsyncedCount} saisie(s) en attente de synchronisation IndexedDB.`
            : "Mémoire cache locale active. Synchronisation IndexedDB opérationnelle."}
        </span>
      </div>

      {/* Sync Actions & Counter */}
      <div className="flex items-center space-x-3 text-xs">
        {entries.length > 0 && (
          <span className="text-[11px] font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <HardDriveUpload className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            Cache local: <strong>{entries.length}</strong> fiche(s)
          </span>
        )}

        {idbCount > 0 && (
          <span className="text-[11px] font-bold text-emerald-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>IndexedDB: <strong>{idbCount}</strong> en stock</span>
          </span>
        )}

        {syncSuccessMsg && (
          <span className="text-emerald-400 font-bold text-[11px] flex items-center space-x-1 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncSuccessMsg}</span>
          </span>
        )}

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg text-[11px] flex items-center space-x-1.5 cursor-pointer shadow transition-all disabled:opacity-50"
          title="Forcer la synchronisation vers la base locale IndexedDB"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Sync IndexedDB..." : "Forcer Sync IndexedDB"}</span>
        </button>

        {entries.length > 0 && unsyncedCount === 0 && (
          <button
            onClick={handleClearCache}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Vider le cache
          </button>
        )}
      </div>
    </div>
  );
};

