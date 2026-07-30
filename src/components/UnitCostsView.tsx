import React, { useState, useEffect } from "react";
import { UnitCosts } from "../types";
import { formatFCFA, formatFCFADecimal } from "../utils/formatters";
import { defaultUnitCosts, getBuildingRentSavings } from "../data/businessPlanData";
import {
  Sliders,
  RotateCcw,
  Check,
  Sparkles,
  Building,
  CheckCircle2,
  Save,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { FeedFormulationManager } from "./FeedFormulationManager";

interface UnitCostsViewProps {
  unitCosts: UnitCosts;
  setUnitCosts: React.Dispatch<React.SetStateAction<UnitCosts>>;
}

export const UnitCostsView: React.FC<UnitCostsViewProps> = ({
  unitCosts,
  setUnitCosts,
}) => {
  const savings = getBuildingRentSavings(unitCosts);

  // Auto-save & Local Backup State
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalBackup, setHasLocalBackup] = useState(false);
  const [autoSaveNotice, setAutoSaveNotice] = useState<string | null>(null);

  // Perform Auto-Save function
  const performAutoSave = (costsToSave: UnitCosts) => {
    try {
      setIsSaving(true);
      const nowStr = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const backupData = {
        unitCosts: costsToSave,
        timestamp: new Date().toISOString(),
        timeFormatted: nowStr,
        version: "2.5",
      };
      localStorage.setItem("ivoire_unit_costs_backup_draft", JSON.stringify(backupData));
      setLastAutoSaveTime(nowStr);
      setHasLocalBackup(true);
    } catch (e) {
      console.warn("Échec de la sauvegarde automatique dans localStorage:", e);
    } finally {
      setTimeout(() => setIsSaving(false), 400);
    }
  };

  // Check for existing backup draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("ivoire_unit_costs_backup_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.timeFormatted) {
          setHasLocalBackup(true);
          setLastAutoSaveTime(parsed.timeFormatted);
        }
      }
    } catch (e) {
      console.warn("Erreur lecture backup local:", e);
    }
  }, []);

  // Periodic Auto-Save every 12 seconds
  useEffect(() => {
    performAutoSave(unitCosts);

    const interval = setInterval(() => {
      performAutoSave(unitCosts);
    }, 12000);

    return () => clearInterval(interval);
  }, [unitCosts]);

  // Handle window beforeunload to prevent accidental loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save current state immediately before unload
      performAutoSave(unitCosts);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unitCosts]);

  // Download Local Backup File (.json)
  const downloadBackupFile = () => {
    const nowISO = new Date().toISOString().split("T")[0];
    const exportObject = {
      title: "Ivoire Élevage - Fichier de Secours des Coûts Unitaires",
      generatedAt: new Date().toISOString(),
      unitCosts,
      rentSavings: savings,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `secours_couts_ivoire_elevage_${nowISO}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setAutoSaveNotice("✅ Fichier de secours local (.json) généré et téléchargé avec succès !");
    setTimeout(() => setAutoSaveNotice(null), 5000);
  };

  // Export Backup CSV
  const downloadBackupCSV = () => {
    const nowISO = new Date().toISOString().split("T")[0];
    let csvContent = "data:text/csv;charset=utf-8,Parametre,Valeur,Unite\n";

    Object.entries(unitCosts).forEach(([key, val]) => {
      csvContent += `"${key}",${val},FCFA\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `secours_couts_ivoire_elevage_${nowISO}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAutoSaveNotice("📊 Export CSV de secours téléchargé avec succès !");
    setTimeout(() => setAutoSaveNotice(null), 5000);
  };

  // Restore from Local Backup Draft
  const handleRestoreFromLocalBackup = () => {
    try {
      const savedDraft = localStorage.getItem("ivoire_unit_costs_backup_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.unitCosts) {
          setUnitCosts(parsed.unitCosts);
          setAutoSaveNotice(
            `🔄 Restauration réussie du secours local sauvegardé à ${parsed.timeFormatted || "auparavant"} !`
          );
          setTimeout(() => setAutoSaveNotice(null), 5000);
        }
      }
    } catch (e) {
      alert("Impossible de restaurer le secours local.");
    }
  };

  const handleChange = (field: keyof UnitCosts, value: number) => {
    setUnitCosts((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggle = (field: "isAvicoleAcquired" | "isPorcinAcquired") => {
    setUnitCosts((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleReset = () => {
    setUnitCosts(defaultUnitCosts);
  };

  const costItems: {
    key: keyof UnitCosts;
    label: string;
    unit: string;
    category: "Aviculture" | "Porciculture";
    description: string;
  }[] = [
    {
      key: "poussinJour",
      label: "Poussin d'un jour",
      unit: "FCFA / sujet",
      category: "Aviculture",
      description: "Achat de démarrage pour rotation complète.",
    },
    {
      key: "poulet1_7kg",
      label: "Poulet de 1,7 kg (Achat initial)",
      unit: "FCFA / sujet",
      category: "Aviculture",
      description: "Pour démarrage immédiat de trésorerie Mois 1.",
    },
    {
      key: "alimentPredemarrage",
      label: "Aliment Prédémarrage",
      unit: "FCFA / kg",
      category: "Aviculture",
      description: "Premiers jours du poussin.",
    },
    {
      key: "alimentCroissance",
      label: "Aliment Croissance (maison - 35% soja)",
      unit: "FCFA / kg",
      category: "Aviculture",
      description: "Formule optimisée 266,56 FCFA/kg.",
    },
    {
      key: "alimentFinition",
      label: "Aliment Finition (maison - 35% soja)",
      unit: "FCFA / kg",
      category: "Aviculture",
      description: "Formule 2 à 264,66 FCFA/kg pour passage de 1,7 à 2,2 kg.",
    },
    {
      key: "porcelet",
      label: "Porcelet d'engraissement",
      unit: "FCFA / sujet",
      category: "Porciculture",
      description: "Acquisition initiale d'engraissement (25 000 FCFA).",
    },
    {
      key: "truieReproductrice",
      label: "Truie reproductrice sélectionnée",
      unit: "FCFA / sujet",
      category: "Porciculture",
      description: "Pour la phase de reproduction croisière.",
    },
    {
      key: "verrat",
      label: "Verrat reproducteur",
      unit: "FCFA / sujet",
      category: "Porciculture",
      description: "Géniteur pour cheptel porcine.",
    },
    {
      key: "porcCharcutierPrixKg",
      label: "Prix Porc Charcutier (Carcasse)",
      unit: "FCFA / kg carcasse",
      category: "Porciculture",
      description: "Vente à 2 100 FCFA / kg.",
    },
    {
      key: "porcCharcutierPoidsCarcasse",
      label: "Poids Carcasse Moyen",
      unit: "kg / tête",
      category: "Porciculture",
      description: "Cible de poids moyen ~75 kg carcasse.",
    },
  ];

  const estimatedPorcVal = unitCosts.porcCharcutierPrixKg * unitCosts.porcCharcutierPoidsCarcasse;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-800 text-emerald-200 border border-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Synthèse Officielle des Prix</span>
          </div>
          <h2 className="text-2xl font-extrabold">
            6. Synthèse des Coûts Unitaires de Référence
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            Matrice des paramètres économiques de base de la holding Ivoire Élevage. Vous pouvez modifier ces valeurs pour simuler l'impact sur vos marges.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser aux valeurs du document</span>
        </button>
      </div>

      {/* AUTO-SAVE & EMERGENCY BACKUP CARD */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-emerald-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded-full text-[10px] uppercase tracking-wider border border-emerald-500/40">
                  <span className={`w-2 h-2 rounded-full ${isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`}></span>
                  <span>{isSaving ? "Sauvegarde en cours..." : "Sauvegarde Automatique Active"}</span>
                </span>
                {lastAutoSaveTime && (
                  <span className="text-[11px] text-slate-300 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Dernier secours local : {lastAutoSaveTime}</span>
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-white">
                Protection Anti-Fermeture Accidentelle & Fichier de Secours Local
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Toutes les modifications de coûts unitaires sont sauvegardées en continu dans la mémoire sécurisée de votre navigateur. En cas de fermeture brusque, vos données sont immédiatement récupérables.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadBackupFile}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer border border-emerald-300/40"
              title="Télécharger le fichier de secours local .json sur votre ordinateur"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Télécharger Secours (.json)</span>
            </button>

            <button
              type="button"
              onClick={downloadBackupCSV}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold px-3 py-2.5 rounded-xl text-xs border border-emerald-500/30 transition-all cursor-pointer"
              title="Export CSV pour Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {hasLocalBackup && (
              <button
                type="button"
                onClick={handleRestoreFromLocalBackup}
                className="flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold px-3 py-2.5 rounded-xl text-xs border border-amber-500/40 transition-all cursor-pointer"
                title="Restaurer la dernière version sauvegardée en cas de fermeture accidentelle"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurer Secours</span>
              </button>
            )}
          </div>
        </div>

        {autoSaveNotice && (
          <div className="bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs p-2.5 rounded-xl font-bold flex items-center justify-between animate-fade-in">
            <span>{autoSaveNotice}</span>
            <button onClick={() => setAutoSaveNotice(null)} className="text-slate-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Mode Bâtiments & Locations Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-base">
              Statut d'Acquisition des Bâtiments & Frais de Location
            </h3>
          </div>
          {savings.totalYearlyRentSaved > 0 && (
            <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Déductions actives : -{formatFCFA(savings.totalYearlyRentSaved)}/an</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Avicole Toggle */}
          <div
            onClick={() => handleToggle("isAvicoleAcquired")}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              unitCosts.isAvicoleAcquired
                ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Bâtiment Avicole Principal</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    unitCosts.isAvicoleAcquired
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {unitCosts.isAvicoleAcquired ? "Acquis (0 FCFA/mois)" : "Loué (50 000 FCFA/mois)"}
                </span>
              </div>
              <p className="text-slate-500 mt-1">
                {unitCosts.isAvicoleAcquired
                  ? "Bâtiment acquis en propre. Loyers mensuels (50k) et avance M1 (200k) retirés des charges."
                  : "Bâtiment en location. Loyer de 50 000 FCFA/mois + 200 000 FCFA d'avance au Mois 1."}
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!unitCosts.isAvicoleAcquired}
              onChange={() => handleToggle("isAvicoleAcquired")}
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Porcin Toggle */}
          <div
            onClick={() => handleToggle("isPorcinAcquired")}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              unitCosts.isPorcinAcquired
                ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Porcherie d'Engraissement (80 têtes)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    unitCosts.isPorcinAcquired
                      ? "bg-amber-200 text-amber-900"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {unitCosts.isPorcinAcquired ? "Acquise (0 FCFA/mois)" : "Louée (20 000 FCFA/mois)"}
                </span>
              </div>
              <p className="text-slate-500 mt-1">
                {unitCosts.isPorcinAcquired
                  ? "Porcherie acquise en propre. Loyers mensuels (20k) retirés des charges."
                  : "Porcherie en location. Loyer de 20 000 FCFA/mois."}
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!unitCosts.isPorcinAcquired}
              onChange={() => handleToggle("isPorcinAcquired")}
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Feed Formulation & Ingredients Manager Section */}
      <FeedFormulationManager unitCosts={unitCosts} setUnitCosts={setUnitCosts} />

      {/* Grid of editable unit costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aviculture Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Coûts Unitaires Avicoles & Alimentation
            </h3>
          </div>

          <div className="space-y-3">
            {costItems
              .filter((i) => i.category === "Aviculture")
              .map((item) => (
                <div
                  key={item.key}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="number"
                      step="0.01"
                      value={unitCosts[item.key]}
                      onChange={(e) => handleChange(item.key, Number(e.target.value))}
                      className="w-28 text-right bg-white font-extrabold text-emerald-800 border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 font-medium w-16">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Porciculture Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Coûts Unitaires Porcins & Cheptel
            </h3>
          </div>

          <div className="space-y-3">
            {costItems
              .filter((i) => i.category === "Porciculture")
              .map((item) => (
                <div
                  key={item.key}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="number"
                      step="1"
                      value={unitCosts[item.key]}
                      onChange={(e) => handleChange(item.key, Number(e.target.value))}
                      className="w-28 text-right bg-white font-extrabold text-amber-800 border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 font-medium w-16">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}

            {/* Calculated Porc Charcutier Value */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-extrabold text-amber-900 text-xs">
                  Valeur de Vente Calculée (Porc Fini) :
                </div>
                <div className="text-[11px] text-amber-800">
                  {unitCosts.porcCharcutierPoidsCarcasse} kg x {formatFCFA(unitCosts.porcCharcutierPrixKg)}
                </div>
              </div>
              <div className="text-base font-black text-amber-700">
                ~{formatFCFA(estimatedPorcVal)} / tête
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
