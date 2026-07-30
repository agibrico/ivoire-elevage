import React, { useState, useEffect } from "react";
import { UnitCosts } from "../types";
import { defaultUnitCosts } from "../data/businessPlanData";
import { formatFCFA } from "../utils/formatters";
import {
  Calendar,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
  Database,
  History,
  Lock,
  PlusCircle,
  Trash2,
  Tag,
  Search,
  Save,
  Check,
} from "lucide-react";

export interface DataSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  timeFormatted: string; // HH:mm:ss
  label: string;
  category?: "Manuel" | "Auto" | "Fin de Mois" | "Recommandé";
  note?: string;
  unitCosts: UnitCosts;
  isAutomatic?: boolean;
}

interface DateRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnitCosts: UnitCosts;
  onRestoreUnitCosts: (restoredCosts: UnitCosts) => void;
}

// Initial historical snapshots for demonstration and reference
export const defaultSnapshots: DataSnapshot[] = [
  {
    id: "snap-1",
    date: "2026-07-28",
    timeFormatted: "08:30:00",
    label: "Ajustement Prix Soja Abidjan (+2.5%)",
    category: "Auto",
    note: "Sauvegarde automatique suite au réapprovisionnement de tourteau.",
    unitCosts: {
      chickPrice: 500,
      chickTransport: 30,
      starterFeedPricePerKg: 295.5,
      growerFeedPricePerKg: 266.56,
      finisherFeedPricePerKg: 255.0,
      veterinaryCostPerChick: 120,
      energyCostPerChick: 75,
      litterCostPerChick: 40,
      poultryMortalityRate: 4.5,
      chickenSalePricePerKg: 2000,
      pigletPurchasePrice: 35000,
      pigletTransport: 1500,
      pigStarterFeedPricePerKg: 310,
      pigGrowerFeedPricePerKg: 275,
      pigFinisherFeedPricePerKg: 245,
      pigGestationFeedPricePerKg: 230,
      pigLactationFeedPricePerKg: 285,
      veterinaryCostPerPig: 4500,
      porkMortalityRate: 3.0,
      porkSalePricePerKg: 2100,
      cornPricePerKg: 175,
      soybeanPricePerKg: 390,
      premixPricePerKg: 2100,
      branPricePerKg: 110,
    },
    isAutomatic: true,
  },
  {
    id: "snap-2",
    date: "2026-07-25",
    timeFormatted: "17:45:00",
    label: "Clôture de Semaine - Bande Volaille #V2026-B04",
    category: "Manuel",
    note: "Dernière version stable avant modification des prix d'aliments.",
    unitCosts: {
      chickPrice: 500,
      chickTransport: 30,
      starterFeedPricePerKg: 290.0,
      growerFeedPricePerKg: 260.0,
      finisherFeedPricePerKg: 250.0,
      veterinaryCostPerChick: 120,
      energyCostPerChick: 75,
      litterCostPerChick: 40,
      poultryMortalityRate: 5.0,
      chickenSalePricePerKg: 2000,
      pigletPurchasePrice: 35000,
      pigletTransport: 1500,
      pigStarterFeedPricePerKg: 300,
      pigGrowerFeedPricePerKg: 270,
      pigFinisherFeedPricePerKg: 240,
      pigGestationFeedPricePerKg: 225,
      pigLactationFeedPricePerKg: 280,
      veterinaryCostPerPig: 4500,
      porkMortalityRate: 3.5,
      porkSalePricePerKg: 2000,
      cornPricePerKg: 170,
      soybeanPricePerKg: 380,
      premixPricePerKg: 2000,
      branPricePerKg: 105,
    },
    isAutomatic: false,
  },
  {
    id: "snap-3",
    date: "2026-07-20",
    timeFormatted: "10:15:00",
    label: "Configuration Initiale de Juillet (Version Référence)",
    category: "Recommandé",
    note: "Sauvegarde globale certifiée par la direction technique.",
    unitCosts: defaultUnitCosts,
    isAutomatic: false,
  },
  {
    id: "snap-4",
    date: "2026-07-01",
    timeFormatted: "09:00:00",
    label: "Bilan d'Ouverture Trimestriel (01/07/2026)",
    category: "Fin de Mois",
    note: "Snapshot historique du début de trimestre.",
    unitCosts: defaultUnitCosts,
    isAutomatic: true,
  },
];

export const DateRestoreModal: React.FC<DateRestoreModalProps> = ({
  isOpen,
  onClose,
  currentUnitCosts,
  onRestoreUnitCosts,
}) => {
  const [snapshots, setSnapshots] = useState<DataSnapshot[]>(() => {
    const saved = localStorage.getItem("ivoire_date_snapshots");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultSnapshots;
      }
    }
    return defaultSnapshots;
  });

  const [selectedDate, setSelectedDate] = useState<string>("2026-07-28");
  const [selectedSnapshot, setSelectedSnapshot] = useState<DataSnapshot | null>(defaultSnapshots[0]);
  const [customTitle, setCustomTitle] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [customCategory, setCustomCategory] = useState<"Manuel" | "Fin de Mois" | "Recommandé">("Manuel");
  const [filterCategory, setFilterCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [lastSavedStorageTime, setLastSavedStorageTime] = useState<string | null>(null);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ivoire_date_snapshots", JSON.stringify(snapshots));
      setLastSavedStorageTime(new Date().toLocaleTimeString("fr-FR"));
    } catch (e) {
      console.warn("Storage quota or write error:", e);
    }
  }, [snapshots]);

  // Sync selectedSnapshot with selectedDate or search
  useEffect(() => {
    const match = snapshots.find((s) => s.date === selectedDate);
    if (match) {
      setSelectedSnapshot(match);
    } else if (snapshots.length > 0) {
      setSelectedSnapshot(null);
    }
  }, [selectedDate, snapshots]);

  if (!isOpen) return null;

  // Create a manual snapshot of current state into localStorage
  const handleCreateSnapshot = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newSnap: DataSnapshot = {
      id: `snap-${Date.now()}`,
      date: dateStr,
      timeFormatted: timeStr,
      label: customTitle.trim() || `Sauvegarde Manuelle du ${dateStr} à ${timeStr}`,
      category: customCategory,
      note: customNote.trim() || "Snapshot manuel de sécurité généré avant modifications.",
      unitCosts: JSON.parse(JSON.stringify(currentUnitCosts)),
      isAutomatic: false,
    };

    const updated = [newSnap, ...snapshots];
    setSnapshots(updated);
    setSelectedSnapshot(newSnap);
    setSelectedDate(dateStr);
    setCustomTitle("");
    setCustomNote("");

    setNotificationMsg(
      `💾 Snapshot "${newSnap.label}" enregistré dans la mémoire locale avec succès à ${timeStr} !`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Delete individual snapshot
  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (snapshots.length <= 1) {
      alert("Vous devez conserver au moins un point de restauration.");
      return;
    }
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    if (selectedSnapshot?.id === id) {
      setSelectedSnapshot(updated[0] || null);
      if (updated[0]) setSelectedDate(updated[0].date);
    }
    setNotificationMsg("🗑️ Snapshot supprimé de la mémoire locale.");
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Restore state from snapshot
  const handleApplyRestoration = () => {
    if (!selectedSnapshot) return;

    onRestoreUnitCosts(selectedSnapshot.unitCosts);
    setNotificationMsg(
      `🎉 Restauration accomplie avec succès ! Données rétablies au ${selectedSnapshot.date} (${selectedSnapshot.timeFormatted}).`
    );

    setTimeout(() => {
      setNotificationMsg(null);
      onClose();
    }, 1800);
  };

  // Export selected snapshot to .json
  const handleExportSnapshotJSON = (snap: DataSnapshot) => {
    const exportData = {
      title: "Ivoire Élevage - Snapshot de Sauvegarde",
      snapshot: snap,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `snapshot_${snap.date}_${snap.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload external backup JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const loadedCosts = parsed.snapshot?.unitCosts || parsed.unitCosts;

        if (loadedCosts) {
          onRestoreUnitCosts(loadedCosts);

          // Add to snapshots list if snapshot present
          if (parsed.snapshot) {
            setSnapshots((prev) => [parsed.snapshot, ...prev]);
          }

          setNotificationMsg("📂 Restauration réussie à partir du fichier externe (.json) !");
          setTimeout(() => {
            setNotificationMsg(null);
            onClose();
          }, 1800);
        } else {
          alert("Le fichier JSON ne contient pas de structure de coûts valide.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier. Format JSON non valide.");
      }
    };
    reader.readAsText(file);
  };

  // Filtered Snapshots list
  const filteredSnapshots = snapshots.filter((snap) => {
    const matchesCategory =
      filterCategory === "Tous" ||
      (filterCategory === "Manuel" && !snap.isAutomatic) ||
      (filterCategory === "Auto" && snap.isAutomatic) ||
      snap.category === filterCategory;

    const matchesSearch =
      snap.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snap.date.includes(searchQuery) ||
      (snap.note && snap.note.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3 text-slate-900">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl font-black shadow-md">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>Restauration & Sauvegarde Manuelle à une Date Spécifique</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-300">
                  Secours Local
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Créez des snapshots de sécurité dans votre mémoire locale (localStorage) et restaurez vos paramètres à tout moment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="p-3.5 bg-emerald-900 text-emerald-100 border border-emerald-500 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button onClick={() => setNotificationMsg(null)} className="text-emerald-300 hover:text-white font-black ml-2">
              ✕
            </button>
          </div>
        )}

        {/* SECTION 1: MANUALLY CREATE A SNAPSHOT RIGHT NOW */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-4.5 rounded-2xl border border-emerald-800/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>1. Créer une Sauvegarde Manuelle de l'État Actuel dans localStorage</span>
            </div>
            {lastSavedStorageTime && (
              <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                <Save className="w-3 h-3 text-emerald-400" />
                <span>Synchronisé à {lastSavedStorageTime}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Titre du Snapshot (ex: Avant augmentation prix aliments)..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-800/90 border border-emerald-500/40 text-white font-bold p-2.5 rounded-xl placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className="w-full bg-slate-800/90 border border-emerald-500/40 text-emerald-300 font-extrabold p-2.5 rounded-xl cursor-pointer"
              >
                <option value="Manuel">🏷️ Tag: Manuel</option>
                <option value="Fin de Mois">📅 Tag: Fin de Mois</option>
                <option value="Recommandé">⭐ Tag: Recommandé</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-1">
            <input
              type="text"
              placeholder="Note ou explication complémentaire (optionnel)..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full sm:flex-1 bg-slate-800/60 border border-slate-700 text-slate-200 text-xs p-2 rounded-xl placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={handleCreateSnapshot}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 shrink-0 border border-emerald-300/40"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Ancrer & Sauvegarder dans localStorage</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: CALENDAR DATE & SNAPSHOT HISTORY */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center space-x-1.5">
              <History className="w-4 h-4 text-amber-500" />
              <span>2. Sélectionner un Point de Restauration Historique :</span>
            </label>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 text-[11px] font-bold">
              {["Tous", "Manuel", "Auto", "Fin de Mois"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterCategory === cat
                      ? "bg-slate-900 text-amber-300 font-extrabold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Date Picker Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par mot-clé ou titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium pl-9 pr-3 py-2 rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 font-black p-2 rounded-xl text-slate-900"
              />
            </div>
          </div>

          {/* Snapshots Scrollable List */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredSnapshots.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Aucun point de restauration trouvé pour cette recherche.
              </div>
            ) : (
              filteredSnapshots.map((snap) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <div
                    key={snap.id}
                    onClick={() => {
                      setSelectedSnapshot(snap);
                      setSelectedDate(snap.date);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/30"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-amber-400 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {snap.date} à {snap.timeFormatted}
                          </span>
                        </span>

                        <span
                          className={`px-2 py-0.5 border rounded text-[9px] font-black uppercase ${
                            snap.isAutomatic
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {snap.category || (snap.isAutomatic ? "Auto" : "Manuel")}
                        </span>
                      </div>

                      <div className="font-bold text-sm truncate">{snap.label}</div>
                      {snap.note && <div className="text-[11px] opacity-75 truncate">{snap.note}</div>}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSnapshotJSON(snap);
                        }}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-all ${
                          isSelected ? "hover:bg-slate-800" : "hover:bg-slate-200 text-slate-600"
                        }`}
                        title="Télécharger ce snapshot individuel (.json)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                        className={`p-1.5 rounded-lg text-rose-400 hover:text-rose-300 transition-all ${
                          isSelected ? "hover:bg-rose-950/60" : "hover:bg-rose-50 text-rose-600"
                        }`}
                        title="Supprimer ce snapshot de la mémoire locale"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                          isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "Sélectionné ✓" : "Choisir"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 3: SELECTED SNAPSHOT DETAILED PREVIEW */}
        {selectedSnapshot ? (
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-amber-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Aperçu détaillé des données à restaurer ({selectedSnapshot.date}) :</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Sauvegardé à {selectedSnapshot.timeFormatted}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Poussin Unité</div>
                <div className="text-sm font-black text-amber-400">
                  {formatFCFA(selectedSnapshot.unitCosts.chickPrice)}
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Aliment Croissance Poulet</div>
                <div className="text-sm font-black text-white">
                  {formatFCFA(selectedSnapshot.unitCosts.growerFeedPricePerKg)}/kg
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Porc Charcutier Vente</div>
                <div className="text-sm font-black text-white">
                  {formatFCFA(selectedSnapshot.unitCosts.porkSalePricePerKg)}/kg
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Maïs Grain</div>
                <div className="text-sm font-black text-emerald-400">
                  {formatFCFA(selectedSnapshot.unitCosts.cornPricePerKg)}/kg
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl text-xs font-semibold flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span>
                Aucun snapshot exact sélectionné pour la date du <strong>{selectedDate}</strong>.
                Sélectionnez une sauvegarde dans la liste ou créez-en une nouvelle.
              </span>
            </div>
          </div>
        )}

        {/* SECTION 4: FILE IMPORT FROM DISK */}
        <div className="bg-slate-100 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-700 font-semibold border border-slate-200">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Restaurer à partir d'un fichier JSON externe :</span>
          </div>
          <label className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all">
            📁 Importer un Fichier JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={!selectedSnapshot}
            onClick={() => setIsRestoreConfirmOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>Confirmer la Restauration au {selectedSnapshot?.date || selectedDate}</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL BEFORE APPLYING RESTORATION */}
      {isRestoreConfirmOpen && selectedSnapshot && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-500 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="p-3 bg-amber-100 rounded-2xl shrink-0">
                <AlertTriangle className="w-7 h-7 text-amber-600 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Confirmer la Restauration
                </h3>
                <p className="text-xs text-amber-700 font-bold">Remplacement des Données Actuelles</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs font-medium text-amber-950 space-y-2">
              <p className="font-extrabold text-amber-900">
                Vous allez restaurer les paramètres archivés le :
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-amber-300 font-mono text-xs text-slate-900 font-bold space-y-1">
                <div>📅 Date : {selectedSnapshot.date} à {selectedSnapshot.timeFormatted}</div>
                <div>🏷️ Titre : {selectedSnapshot.label}</div>
              </div>
              <p className="text-slate-700 text-[11px] pt-1">
                💡 <strong>Remarque de sécurité :</strong> Un snapshot automatique de votre état actuel sera immédiatement créé dans votre mémoire locale avant le remplacement.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  // Automatically save safety snapshot of current state before restoration
                  const now = new Date();
                  const dateStr = now.toISOString().split("T")[0];
                  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const autoSafetySnap: DataSnapshot = {
                    id: `snap-auto-${Date.now()}`,
                    date: dateStr,
                    timeFormatted: timeStr,
                    label: `Auto-Sauvegarde de Sécurité (Avant Restauration du ${selectedSnapshot.date})`,
                    category: "Auto",
                    note: "Créé automatiquement par le système avant la restauration d'une date antérieure.",
                    unitCosts: JSON.parse(JSON.stringify(currentUnitCosts)),
                    isAutomatic: true,
                  };
                  setSnapshots((prev) => [autoSafetySnap, ...prev]);

                  setIsRestoreConfirmOpen(false);
                  handleApplyRestoration();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4 text-slate-950" />
                <span>OUI, APPLIQUER LA RESTAURATION MAINTENANT</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRestoreConfirmOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                ANNULER & CONSERVER LES DONNÉES ACTUELLES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
