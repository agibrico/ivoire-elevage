import React, { useState, useEffect, useRef } from "react";
import { AuditLogEntry, UnitCosts } from "../types";
import {
  History,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  User,
  Clock,
  ArrowRight,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  X,
  Check,
  Download,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Radio,
  Bot,
} from "lucide-react";

interface AuditLogViewProps {
  unitCosts: UnitCosts;
  onOpenAIAdvisor?: (prompt?: string, analysisType?: "general" | "sanitary_preventive_audit") => void;
}

export const defaultAuditLogEntries: AuditLogEntry[] = [
  {
    id: "audit-1",
    timestamp: "2026-07-28 08:30:15",
    user: "Gilles (Gestionnaire)",
    category: "Changement de Prix",
    targetItem: "Aliment Croissance Poulet (FCFA/kg)",
    previousValue: "260.00 FCFA/kg",
    newValue: "266.56 FCFA/kg",
    impactNote: "Ajustement suite au réapprovisionnement de tourteau de soja GMA Abidjan (+2.5% coût/kg).",
  },
  {
    id: "audit-2",
    timestamp: "2026-07-28 07:15:00",
    user: "Kouassi (Technicien)",
    category: "Mouvement de Stock",
    targetItem: "Stock Maïs Grain Jaune (Magasin Central)",
    previousValue: "12 500 kg",
    newValue: "11 200 kg",
    impactNote: "Déstockage de 1 300 kg pour la fabrication du lot d'aliments Démarrage Volaille.",
  },
  {
    id: "audit-3",
    timestamp: "2026-07-27 16:45:22",
    user: "Dr. Yao (Vétérinaire)",
    category: "Ajustement Sanitaire",
    targetItem: "Taux Mortalité Projeté Volaille",
    previousValue: "5.0 %",
    newValue: "3.0 %",
    impactNote: "Rétablissement sanitaire réussi suite au vaccin Gumboro + cure de polyvitamines.",
  },
  {
    id: "audit-4",
    timestamp: "2026-07-27 11:20:10",
    user: "Yao (Régisseur)",
    category: "Changement de Prix",
    targetItem: "Prix Vente Porc Charcutier (FCFA/kg)",
    previousValue: "2 000 FCFA/kg",
    newValue: "2 100 FCFA/kg",
    impactNote: "Revalorisation du prix de vente carcasse selon les cours du marché de gros Abidjan.",
  },
  {
    id: "audit-5",
    timestamp: "2026-07-26 14:10:05",
    user: "Gilles (Gestionnaire)",
    category: "Configuration Alertes",
    targetItem: "Seuil d'Alerte Stock Critique Maïs",
    previousValue: "2 000 kg",
    newValue: "1 500 kg",
    impactNote: "Activation du module de notification Email automatique vers direction@ivoire-elevage.ci.",
  },
  {
    id: "audit-6",
    timestamp: "2026-07-25 09:00:00",
    user: "Soro (Aide-Éleveur)",
    category: "Mouvement de Stock",
    targetItem: "Poussins d'un jour (Entrée couvoir)",
    previousValue: "0 sujet",
    newValue: "5 000 sujets",
    impactNote: "Réception de la bande V-2026-B05 en poussinière A (Qualité conforme 100%).",
  },
  {
    id: "audit-7",
    timestamp: "2026-07-29 10:15:40",
    user: "Kouassi (Technicien)",
    category: "Observation Terrain",
    targetItem: "Inspection Bâtiment Poussinière A",
    previousValue: "N/A",
    newValue: "Conforme 100%",
    impactNote: "🎙️ [Dictée Vocale] Contrôle de la ventilation et des abreuvoirs effectué. Température ambiante 31.5°C stable, aucune anomalie détectée.",
  },
];

export const AuditLogView: React.FC<AuditLogViewProps> = ({ unitCosts, onOpenAIAdvisor }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(defaultAuditLogEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Toutes");
  const [userFilter, setUserFilter] = useState<string>("Tous");

  // Modal manual entry state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<AuditLogEntry["category"]>("Changement de Prix");
  const [newTarget, setNewTarget] = useState("");
  const [newPrevVal, setNewPrevVal] = useState("");
  const [newNewVal, setNewNewVal] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newUser, setNewUser] = useState("Gilles (Gestionnaire)");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // --- WEB SPEECH API (VOICE-TO-TEXT DICTATION) ---
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeVoiceField, setActiveVoiceField] = useState<"note" | "target" | "newValue" | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startVoiceDictation = (field: "note" | "target" | "newValue") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setNotificationMsg("⚠️ La reconnaissance vocale (Web Speech API) n'est pas supportée par votre navigateur actuel.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setActiveVoiceField(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setActiveVoiceField(field);
        setInterimTranscript("");
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interimStr);

        if (finalStr.trim()) {
          const cleanText = finalStr.trim();
          if (field === "note") {
            setNewNote((prev) => (prev ? `${prev} ${cleanText}` : cleanText));
          } else if (field === "target") {
            setNewTarget((prev) => (prev ? `${prev} ${cleanText}` : cleanText));
          } else if (field === "newValue") {
            setNewNewVal((prev) => (prev ? `${prev} ${cleanText}` : cleanText));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Erreur de reconnaissance vocale Web Speech API:", event.error);
        if (event.error === "not-allowed") {
          setNotificationMsg("⚠️ Accès au microphone refusé par le navigateur.");
        }
        setIsListening(false);
        setActiveVoiceField(null);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveVoiceField(null);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Erreur lors du démarrage du service vocal Web Speech API:", err);
      setIsListening(false);
      setActiveVoiceField(null);
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setActiveVoiceField(null);
    setInterimTranscript("");
  };

  const handleOpenVoiceObservation = () => {
    setNewCategory("Observation Terrain");
    setNewTarget("Inspection Bâtiment / Visite Terrain");
    setNewNewVal("Conforme");
    setIsModalOpen(true);
    setTimeout(() => {
      startVoiceDictation("note");
    }, 300);
  };

  const handleAddManualAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget || !newNewVal) return;

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: nowStr,
      user: newUser,
      category: newCategory,
      targetItem: newTarget,
      previousValue: newPrevVal || "N/A",
      newValue: newNewVal,
      impactNote: newNote || "Ajustement consigné manuellement par le gestionnaire.",
    };

    setLogs([newEntry, ...logs]);
    setIsModalOpen(false);
    setNewTarget("");
    setNewPrevVal("");
    setNewNewVal("");
    setNewNote("");
    setNotificationMsg("✅ Entrée de traçabilité consignée avec succès dans le journal d'audit !");
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = "Horodatage,Utilisateur,Categorie,Element Modifie,Ancienne Valeur,Nouvelle Valeur,Impact / Justification\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.user}","${l.category}","${l.targetItem}","${l.previousValue}","${l.newValue}","${l.impactNote || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Audit_Tracabilite_Ivoire_Elevage_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Logs
  const filteredLogs = logs.filter((l) => {
    const matchCat = categoryFilter === "Toutes" || l.category === categoryFilter;
    const matchUser = userFilter === "Tous" || l.user.includes(userFilter);
    const matchSearch =
      l.targetItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.impactNote && l.impactNote.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchUser && matchSearch;
  });

  const uniqueUsers = Array.from(new Set(logs.map((l) => l.user.split(" ")[0])));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wide flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>TRAÇABILITÉ ET AUDIT DE PERFORMANCE</span>
              </span>
              <span className="text-slate-300 text-xs font-medium">• Registre Inviolable</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-3">
              <History className="w-8 h-8 text-amber-400" />
              <span>Historique des Modifications & Décisions Financières</span>
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Enregistre automatiquement l'ensemble des variations de prix, mouvements de stocks d'aliments et réajustements sanitaires avec horodatage précis et identifiant utilisateur pour une gouvernance optimale.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (onOpenAIAdvisor) {
                  onOpenAIAdvisor(
                    "Analyser le Journal d'Audit Log et le Suivi Sanitaire pour suggérer des optimisations préventives sur les cycles sanitaires.",
                    "sanitary_preventive_audit"
                  );
                }
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-400/40"
            >
              <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>🤖 Analyse IA Traçabilité & Santé</span>
            </button>

            <button
              onClick={handleOpenVoiceObservation}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-rose-300/40 relative group"
              title="Activer la dictée vocale instantanée pour consigner une observation pendant la visite des bâtiments"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>🎙️ Dictée Vocale Terrain</span>
              <span className="px-1.5 py-0.5 bg-black/40 text-amber-200 text-[10px] rounded-full font-bold">Web Speech API</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-amber-300/40"
            >
              <Plus className="w-4 h-4" />
              <span>Consigner une Décision</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-emerald-600 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Exporter Journal (CSV)</span>
            </button>
          </div>
        </div>

        {/* Audit Stats Summary Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-900/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-emerald-800/50">
            <div className="text-[10px] text-emerald-300 uppercase font-black">Total Modifications Consignées</div>
            <div className="text-xl font-black text-amber-400">{logs.length} Événements</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-emerald-800/50">
            <div className="text-[10px] text-emerald-300 uppercase font-black">Changements de Prix</div>
            <div className="text-xl font-black text-white">
              {logs.filter((l) => l.category === "Changement de Prix").length} Ajustements
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-emerald-800/50">
            <div className="text-[10px] text-emerald-300 uppercase font-black">Mouvements de Stock</div>
            <div className="text-xl font-black text-white">
              {logs.filter((l) => l.category === "Mouvement de Stock").length} Entrées / Sorties
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-emerald-800/50">
            <div className="text-[10px] text-emerald-300 uppercase font-black">Niveau de Conformité</div>
            <div className="text-xl font-black text-emerald-400 flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>100% Traçable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 shadow-lg text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-300 hover:text-white font-black">
            ✕
          </button>
        </div>
      )}

      {/* Main Audit Log Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5">
        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par élément, utilisateur, impact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs pl-9 pr-8 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-600">Catégorie :</span>
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-bold">
              {["Toutes", "Changement de Prix", "Mouvement de Stock", "Ajustement Sanitaire", "Observation Terrain", "Configuration Alertes"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat === "Observation Terrain" ? "🎙️ Observation Terrain" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold text-[11px] uppercase">
                <th className="p-3">Horodatage Exact</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Élément Modifié</th>
                <th className="p-3">Valeur Précédente</th>
                <th className="p-3">Nouvelle Valeur</th>
                <th className="p-3">Impact & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  let badgeBg = "bg-slate-100 text-slate-800 border-slate-300";
                  if (log.category === "Changement de Prix") {
                    badgeBg = "bg-amber-100 text-amber-900 border-amber-300";
                  } else if (log.category === "Mouvement de Stock") {
                    badgeBg = "bg-blue-100 text-blue-900 border-blue-300";
                  } else if (log.category === "Ajustement Sanitaire") {
                    badgeBg = "bg-rose-100 text-rose-900 border-rose-300";
                  } else if (log.category === "Observation Terrain") {
                    badgeBg = "bg-purple-100 text-purple-900 border-purple-300";
                  } else if (log.category === "Configuration Alertes") {
                    badgeBg = "bg-emerald-100 text-emerald-900 border-emerald-300";
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.timestamp}</span>
                      </td>

                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{log.user}</span>
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                          {log.category}
                        </span>
                      </td>

                      <td className="p-3 font-black text-slate-950">{log.targetItem}</td>

                      <td className="p-3 text-slate-500 line-through font-mono">{log.previousValue}</td>

                      <td className="p-3 font-mono font-black text-emerald-700 bg-emerald-50/60 rounded">
                        {log.newValue}
                      </td>

                      <td className="p-3 text-slate-600 max-w-xs leading-relaxed">
                        {log.impactNote || "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    Aucun événement d'audit ne correspond à votre recherche "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Manual Audit Log Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2 text-slate-900">
                <History className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-black">Consigner une Décision / Modification</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualAudit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Utilisateur / Auteur :</label>
                <select
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Gilles (Gestionnaire)">Gilles (Gestionnaire)</option>
                  <option value="Dr. Yao (Vétérinaire)">Dr. Yao (Vétérinaire)</option>
                  <option value="Kouassi (Technicien)">Kouassi (Technicien)</option>
                  <option value="Yao (Régisseur)">Yao (Régisseur)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Catégorie de la Modification :</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Observation Terrain">🎙️ Observation Terrain (Visite de ferme)</option>
                  <option value="Changement de Prix">Changement de Prix</option>
                  <option value="Mouvement de Stock">Mouvement de Stock</option>
                  <option value="Paramètre Financier">Paramètre Financier</option>
                  <option value="Ajustement Sanitaire">Ajustement Sanitaire</option>
                  <option value="Configuration Alertes">Configuration Alertes</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold block">Élément Concerne :</label>
                  <button
                    type="button"
                    onClick={() => startVoiceDictation("target")}
                    className={`text-[11px] font-extrabold flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isListening && activeVoiceField === "target"
                        ? "bg-rose-500 text-white animate-pulse shadow-md"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Mic className="w-3 h-3 text-rose-500" />
                    <span>{isListening && activeVoiceField === "target" ? "Écoute..." : "Dicter"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="ex: Inspection Bâtiment Volailles A, Stock Tourteau Soja..."
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Valeur Précédente :</label>
                  <input
                    type="text"
                    placeholder="ex: 18 500 FCFA ou N/A"
                    value={newPrevVal}
                    onChange={(e) => setNewPrevVal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold block">Nouvelle Valeur :</label>
                    <button
                      type="button"
                      onClick={() => startVoiceDictation("newValue")}
                      className={`text-[11px] font-extrabold flex items-center space-x-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        isListening && activeVoiceField === "newValue"
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Mic className="w-3 h-3 text-rose-500" />
                      <span>{isListening && activeVoiceField === "newValue" ? "Écoute..." : "Dicter"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="ex: Conforme 100%, 19 200 FCFA..."
                    value={newNewVal}
                    onChange={(e) => setNewNewVal(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* WEB SPEECH API DICTATION SECTION FOR OBSERVATIONS */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold block">
                    Motif, Note & Observation Terrain (Dictée Vocale) :
                  </label>
                  {speechSupported && (
                    <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                      <span>Web Speech API (fr-FR)</span>
                    </span>
                  )}
                </div>

                {/* Voice Dictation Trigger Bar */}
                {isListening && activeVoiceField === "note" ? (
                  <div className="p-3 bg-slate-900 text-white rounded-xl border border-rose-500 shadow-md space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                        <span className="font-extrabold text-xs text-rose-300 uppercase tracking-wide">
                          Dictée en cours... Parlez dans le micro
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={stopVoiceDictation}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Terminer Dictée</span>
                      </button>
                    </div>

                    <div className="bg-black/50 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 min-h-[42px] flex items-center">
                      {interimTranscript ? (
                        <span className="italic">"{interimTranscript}"</span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Écoute en temps réel... (ex: "Bâtiment A contrôlé, mortalité nulle, abreuvoirs propres.")
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startVoiceDictation("note")}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer border border-amber-500/40 shadow-xs"
                  >
                    <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>🎙️ Démarrer la Dictée Vocale pour l'Observation</span>
                  </button>
                )}

                {/* Textarea for Observation */}
                <textarea
                  rows={4}
                  placeholder="Dictez ou saisissez vos observations de terrain (ex: état sanitaire, température, consommations, anomalies...)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                ></textarea>

                {/* Quick Phrases Chips for Quick Tap Dictation */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">Raccourcis d'observation rapides (Cliquer pour ajouter) :</span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      "✓ Contrôle visuel conforme 100%",
                      "✓ Abreuvoirs et mangeoires nettoyés",
                      "⚠️ Légère élévation de température constatée",
                      "✓ Réapprovisionnement d'aliment effectué",
                      "✓ Traitement sanitaire administré avec succès",
                    ].map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => setNewNote((prev) => (prev ? `${prev} ${phrase}` : phrase))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-black shadow-md cursor-pointer transition-all"
                >
                  Enregistrer dans l'Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
