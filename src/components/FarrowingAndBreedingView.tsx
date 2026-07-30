import React, { useState } from "react";
import { UnitCosts, FarrowingRecord, SucklingLitter, FatteningBatch } from "../types";
import { formatFCFA } from "../utils/formatters";
import { generateAutoLotNumber } from "../utils/batchNumberGenerator";
import {
  initialFarrowingRecords,
  initialSucklingLitters,
  initialFatteningBatches,
} from "../data/breedingAndFarmData";
import {
  PiggyBank,
  Baby,
  Milk,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Scale,
  Wheat,
  Clock,
  Trash2,
  X,
  Check,
} from "lucide-react";

interface FarrowingAndBreedingViewProps {
  unitCosts: UnitCosts;
}

export const FarrowingAndBreedingView: React.FC<FarrowingAndBreedingViewProps> = ({
  unitCosts,
}) => {
  // State for data collections
  const [farrowings, setFarrowings] = useState<FarrowingRecord[]>(initialFarrowingRecords);
  const [sucklingLitters, setSucklingLitters] = useState<SucklingLitter[]>(initialSucklingLitters);
  const [fatteningBatches, setFatteningBatches] = useState<FatteningBatch[]>(initialFatteningBatches);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<"farrowing" | "suckling" | "fattening" | "gestation_calendar">("farrowing");

  // Gestation & Breeding Cycles State
  const [breedingSows, setBreedingSows] = useState<Array<{
    id: string;
    sowCode: string;
    sowBreed: string;
    inseminationDate: string;
    boarCodeOrBreed: string;
    litterNumber: number;
    penLocation: string;
    status: "Gestation Début" | "Gestation Milieu" | "Proche Mise Bas" | "Terme Atteint / En Mise Bas" | "Reproduction / Repos";
    notes?: string;
  }>>([
    {
      id: "sow-cycle-1",
      sowCode: "Truie T-01 Large White",
      sowBreed: "Large White Pure",
      inseminationDate: "2026-04-10",
      boarCodeOrBreed: "IA Verrat Duroc D-04",
      litterNumber: 3,
      penLocation: "Loge Gestation G-01",
      status: "Proche Mise Bas",
      notes: "Excellente prise sous IA. Mamelles bien développées.",
    },
    {
      id: "sow-cycle-2",
      sowCode: "Truie T-02 Landrace",
      sowBreed: "Landrace F1",
      inseminationDate: "2026-05-15",
      boarCodeOrBreed: "Verrat Piétrain P-01",
      litterNumber: 2,
      penLocation: "Loge Gestation G-02",
      status: "Gestation Milieu",
      notes: "Contrôle échographique J-21 positif.",
    },
    {
      id: "sow-cycle-3",
      sowCode: "Truie T-03 Duroc x LW",
      sowBreed: "Duroc x Large White",
      inseminationDate: "2026-06-20",
      boarCodeOrBreed: "IA Verrat Large White W-02",
      litterNumber: 4,
      penLocation: "Loge Gestation G-03",
      status: "Gestation Début",
      notes: "Alimentation enrichie en minéraux.",
    },
    {
      id: "sow-cycle-4",
      sowCode: "Truie T-05 Landrace",
      sowBreed: "Landrace",
      inseminationDate: "2026-04-05",
      boarCodeOrBreed: "IA Verrat Duroc D-02",
      litterNumber: 1,
      penLocation: "Maternité Loge M-02",
      status: "Terme Atteint / En Mise Bas",
      notes: "Déplacée en maternité le 21 Juillet. Surveillance constante.",
    },
  ]);

  // Modal State for New Insemination / Mating
  const [isNewMatingModalOpen, setIsNewMatingModalOpen] = useState(false);
  const [newMatingSowCode, setNewMatingSowCode] = useState("Truie T-06 Large White");
  const [newMatingBreed, setNewMatingBreed] = useState("Large White");
  const [newMatingInsemDate, setNewMatingInsemDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newMatingBoar, setNewMatingBoar] = useState("IA Verrat Duroc D-01");
  const [newMatingLitterNum, setNewMatingLitterNum] = useState(2);
  const [newMatingPen, setNewMatingPen] = useState("Loge Gestation G-04");
  const [newMatingNotes, setNewMatingNotes] = useState("");

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [isNewFarrowingModalOpen, setIsNewFarrowingModalOpen] = useState(false);
  const [isNewFatteningModalOpen, setIsNewFatteningModalOpen] = useState(false);

  // New Farrowing Form state
  const [sowCode, setSowCode] = useState("Truie T-04 Large White");
  const [farrowingDate, setFarrowingDate] = useState("2026-07-26");
  const [litterNumber, setLitterNumber] = useState(1);
  const [bornAlive, setBornAlive] = useState(12);
  const [stillborn, setStillborn] = useState(0);
  const [mummified, setMummified] = useState(0);
  const [avgBirthWeight, setAvgBirthWeight] = useState(1.4);
  const [farrowingPen, setFarrowingPen] = useState("Loge Maternité M-04");
  const [farrowingNotes, setFarrowingNotes] = useState("");

  // New Fattening Form state
  const [fatteningBatchName, setFatteningBatchName] = useState("Lot Engraissement Eng-2026-B3");
  const [fatteningHeadCount, setFatteningHeadCount] = useState(15);
  const [fatteningAvgWeight, setFatteningAvgWeight] = useState(9.5);
  const [fatteningTargetWeight, setFatteningTargetWeight] = useState(85.0);
  const [fatteningFeedType, setFatteningFeedType] = useState<"Démarrage" | "Croissance" | "Finition">("Démarrage");
  const [fatteningPen, setFatteningPen] = useState("Porcherie Bâtiment E-03");

  // Calculations
  const totalSucklingPiglets = sucklingLitters.reduce((acc, l) => acc + l.currentPigletCount, 0);
  const totalFatteningPigs = fatteningBatches.reduce((acc, b) => acc + b.currentHeadCount, 0);
  const totalFarrowedAlive = farrowings.reduce((acc, f) => acc + f.bornAlive, 0);
  const avgLitterSizeAlive = farrowings.length > 0 ? (totalFarrowedAlive / farrowings.length).toFixed(1) : "0";

  // Handle New Farrowing Submission
  const handleCreateFarrowing = (e: React.FormEvent) => {
    e.preventDefault();
    const totalBorn = Number(bornAlive) + Number(stillborn) + Number(mummified);
    const newFarId = `far-${Date.now()}`;
    
    const newFarRecord: FarrowingRecord = {
      id: newFarId,
      sowCode,
      farrowingDate,
      litterNumber: Number(litterNumber),
      bornAlive: Number(bornAlive),
      stillborn: Number(stillborn),
      mummified: Number(mummified),
      totalBorn,
      averageBirthWeightKg: Number(avgBirthWeight),
      farrowingPen,
      status: "En allaitement",
      notes: farrowingNotes || "Mise bas enregistrée avec succès.",
    };

    // Auto-create suckling litter record
    const newSuckLitter: SucklingLitter = {
      id: `suck-${Date.now()}`,
      farrowingRecordId: newFarId,
      sowCode,
      penLocation: farrowingPen,
      farrowingDate,
      currentPigletCount: Number(bornAlive),
      sucklingDays: 0,
      targetWeaningDays: 28,
      expectedWeaningDate: new Date(new Date(farrowingDate).getTime() + 28 * 86400000).toISOString().split("T")[0],
      sowDailyFeedKg: 6.0,
      creepFeedType: "Pré-démarrage (Sous-mère)",
      creepFeedDailyKgTotal: 0.5,
      sucklingMortalityCount: 0,
      status: "En cours",
      notes: "Allaitement initié.",
    };

    setFarrowings([newFarRecord, ...farrowings]);
    setSucklingLitters([newSuckLitter, ...sucklingLitters]);
    setIsNewFarrowingModalOpen(false);
    setNotification(`Mise bas de ${sowCode} enregistrée avec succès (${bornAlive} porcelets nés vivants) !`);
  };

  // Handle Weaning Action (Sevrage)
  const handlePerformWeaning = (litterId: string) => {
    const litter = sucklingLitters.find((l) => l.id === litterId);
    if (!litter) return;

    // Update suckling status
    setSucklingLitters(
      sucklingLitters.map((l) =>
        l.id === litterId ? { ...l, status: "Sevré" } : l
      )
    );

    // Update farrowing status
    setFarrowings(
      farrowings.map((f) =>
        f.id === litter.farrowingRecordId ? { ...f, status: "Sevré" } : f
      )
    );

    // Create Fattening Batch automatically with auto-generated lot number
    const autoNum = generateAutoLotNumber("ENGRAISSEMENT");
    const newBatch: FatteningBatch = {
      id: `fat-${Date.now()}`,
      batchName: `[${autoNum}] Lot Sevrage ${litter.sowCode} (${litter.currentPigletCount} suj.)`,
      sourceSowCode: litter.sowCode,
      weaningDate: new Date().toISOString().split("T")[0],
      initialHeadCount: litter.currentPigletCount,
      currentHeadCount: litter.currentPigletCount,
      initialAvgWeightKg: 8.0,
      currentAvgWeightKg: 8.0,
      targetSlaughterWeightKg: 85.0,
      currentFeedType: "Démarrage",
      averageDailyGainGrams: 650,
      locationPen: "Porcherie Bâtiment Engraissement - Post-Sevrage",
      estimatedSlaughterDate: new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0],
      status: "En croissance",
      notes: `Lot ${autoNum} issu du sevrage contrôlé de maternité.`,
    };

    setFatteningBatches([newBatch, ...fatteningBatches]);
    setNotification(
      `Sevrage réussi pour ${litter.sowCode} ! N° de Lot [${autoNum}] créé avec ${litter.currentPigletCount} porcelets transférés.`
    );
  };

  // Handle New Fattening Batch Creation
  const handleCreateFatteningBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const autoNum = generateAutoLotNumber("ENGRAISSEMENT");
    const finalBatchName = fatteningBatchName.startsWith("[LOT-")
      ? fatteningBatchName
      : `[${autoNum}] ${fatteningBatchName}`;

    const newBatch: FatteningBatch = {
      id: `fat-${Date.now()}`,
      batchName: finalBatchName,
      weaningDate: new Date().toISOString().split("T")[0],
      initialHeadCount: Number(fatteningHeadCount),
      currentHeadCount: Number(fatteningHeadCount),
      initialAvgWeightKg: Number(fatteningAvgWeight),
      currentAvgWeightKg: Number(fatteningAvgWeight),
      targetSlaughterWeightKg: Number(fatteningTargetWeight),
      currentFeedType: fatteningFeedType,
      averageDailyGainGrams: 650,
      locationPen: fatteningPen,
      estimatedSlaughterDate: new Date(Date.now() + 110 * 86400000).toISOString().split("T")[0],
      status: "En croissance",
      notes: `Lot ${autoNum} attribué automatiquement à l'entrée.`,
    };

    setFatteningBatches([newBatch, ...fatteningBatches]);
    setIsNewFatteningModalOpen(false);
    setNotification(`Nouveau lot d'engraissement "${fatteningBatchName}" ajouté (${fatteningHeadCount} sujets).`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-rose-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-rose-500/30 text-rose-300 border border-rose-400/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
              <Baby className="w-4 h-4 text-rose-400" />
              <span>MODULE REPRODUCTION & ÉLEVAGE</span>
            </span>
            <span className="text-rose-200 text-xs font-bold">• Suivi Maternité Ivoire Élevage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Gestion des Mises Bas, Allaitements et Mises en Engraissement
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Pilotez le cycle de reproduction complet de la porcherie : enregistrement des portées à la naissance, calcul quotidien de l'allaitement sous mère, sevrages automatisés et suivi des bandes en engraissement jusqu'à l'abattage.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => setIsNewFarrowingModalOpen(true)}
            className="px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer border border-rose-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une Mise Bas</span>
          </button>
          <button
            onClick={() => setIsNewFatteningModalOpen(true)}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <PiggyBank className="w-4 h-4" />
            <span>Nouveau Lot Engraissement</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs sm:text-sm font-bold">{notification}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-black underline text-emerald-800 hover:text-emerald-950 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Portées en Allaitement
            </div>
            <div className="text-2xl font-black text-rose-600">
              {sucklingLitters.filter((s) => s.status === "En cours").length} Portées
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Sous truies lactantes</p>
          </div>
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <Milk className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Porcelets sous Mère
            </div>
            <div className="text-2xl font-black text-amber-600">
              {totalSucklingPiglets} Porcelets
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Moyenne {avgLitterSizeAlive} nés vivants/portée</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Baby className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Porcs en Engraissement
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {totalFatteningPigs} Sujets
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Répartis en {fatteningBatches.length} lots</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Projection CA Vente Porcs (Déc. 2026)
            </div>
            <div className="text-xl font-black text-slate-900">
              {formatFCFA(
                fatteningBatches.reduce((acc, b) => {
                  const weightKg = b.id === "fat-001" ? 70 : b.id === "fat-002" ? 60 : (b.targetSlaughterWeightKg || 75);
                  return acc + b.currentHeadCount * weightKg * unitCosts.porcCharcutierPrixKg;
                }, 0)
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-bold">10 porcs (70 kg) + 20 porcs (60 kg) à 2 100 F/kg</p>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab("farrowing")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "farrowing"
                ? "border-rose-600 text-rose-950 bg-rose-50/70 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Baby className="w-4 h-4 text-rose-600" />
            <span>1. Suivi Mises Bas (Maternité)</span>
            <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-full">
              {farrowings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("suckling")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "suckling"
                ? "border-amber-600 text-amber-950 bg-amber-50/70 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Milk className="w-4 h-4 text-amber-600" />
            <span>2. Allaitements & Sevrages</span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full">
              {sucklingLitters.filter((s) => s.status === "En cours").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("fattening")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "fattening"
                ? "border-emerald-600 text-slate-950 bg-emerald-50/70 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>3. Mises en Engraissement (Bandes)</span>
            <span className="px-2 py-0.5 bg-emerald-700 text-white font-extrabold text-[10px] rounded-full">
              {fatteningBatches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("gestation_calendar")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "gestation_calendar"
                ? "border-purple-600 text-purple-950 bg-purple-50/80 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>4. Calendrier & Cycles de Gestation (114 Jours)</span>
            <span className="px-2 py-0.5 bg-purple-700 text-white font-extrabold text-[10px] rounded-full">
              {breedingSows.length}
            </span>
          </button>
        </div>

        {/* TAB 1: MISES BAS */}
        {activeTab === "farrowing" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Baby className="w-5 h-5 text-rose-600" />
                  <span>Registre Historique des Mises Bas</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enregistrez chaque événement de mise bas pour calculer le taux de survie des porcelets à la naissance.
                </p>
              </div>

              <button
                onClick={() => setIsNewFarrowingModalOpen(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer une Mise Bas</span>
              </button>
            </div>

            {/* Farrowing Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                    <th className="p-3">Truie ID / Code</th>
                    <th className="p-3">Date Mise Bas</th>
                    <th className="p-3 text-center">N° Portée</th>
                    <th className="p-3 text-center text-emerald-800">Nés Vivants</th>
                    <th className="p-3 text-center text-rose-700">Mort-Nés</th>
                    <th className="p-3 text-center">Total Nés</th>
                    <th className="p-3">Poids Moyen Naissance</th>
                    <th className="p-3">Loge / Bâtiment</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {farrowings.map((far) => (
                    <tr key={far.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">
                        {far.sowCode}
                      </td>
                      <td className="p-3 font-bold text-slate-700">
                        {far.farrowingDate}
                      </td>
                      <td className="p-3 text-center font-black text-slate-800">
                        Portée #{far.litterNumber}
                      </td>
                      <td className="p-3 text-center font-black text-emerald-700 text-sm">
                        {far.bornAlive} porcelets
                      </td>
                      <td className="p-3 text-center font-bold text-rose-600">
                        {far.stillborn}
                      </td>
                      <td className="p-3 text-center font-extrabold text-slate-900">
                        {far.totalBorn}
                      </td>
                      <td className="p-3 font-bold text-amber-800">
                        {far.averageBirthWeightKg} kg / sujet
                      </td>
                      <td className="p-3 font-semibold text-slate-600">
                        {far.farrowingPen}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            far.status === "En allaitement"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          }`}
                        >
                          {far.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ALLAITEMENTS & SEVRAGES */}
        {activeTab === "suckling" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Milk className="w-5 h-5 text-amber-600" />
                  <span>Portées en Phase d'Allaitement Maternelle</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Supervisez les portées actuellement allaitées sous la truie et déclenchez le sevrage automatique à 28 jours.
                </p>
              </div>
            </div>

            {/* Litters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sucklingLitters.map((litter) => {
                const progressPercent = Math.min(100, Math.round((litter.sucklingDays / litter.targetWeaningDays) * 100));
                const isReadyForWeaning = litter.sucklingDays >= 25 && litter.status === "En cours";

                return (
                  <div
                    key={litter.id}
                    className={`p-5 rounded-2xl border-2 space-y-4 transition-all shadow-xs ${
                      litter.status === "Sevré"
                        ? "bg-slate-50 border-slate-200 opacity-75"
                        : isReadyForWeaning
                        ? "bg-amber-50/90 border-amber-400"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-200/80 pb-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                          {litter.penLocation}
                        </div>
                        <h4 className="text-base font-black text-slate-900">
                          {litter.sowCode}
                        </h4>
                        <div className="text-xs text-slate-500 font-medium">
                          Mise bas le {litter.farrowingDate}
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          litter.status === "Sevré"
                            ? "bg-slate-200 text-slate-700"
                            : isReadyForWeaning
                            ? "bg-amber-400 text-slate-950 animate-pulse"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {litter.status === "En cours" && isReadyForWeaning
                          ? "⚡ PRÊT SEVRAGE"
                          : litter.status}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Porcelets sous Mère</span>
                        <span className="text-base font-black text-emerald-700">{litter.currentPigletCount} porcelets</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Ration Truie Lactante</span>
                        <span className="text-sm font-black text-slate-900">{litter.sowDailyFeedKg} kg / jour</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Complément Porcelets</span>
                        <span className="text-sm font-black text-amber-800">{litter.creepFeedDailyKgTotal} kg / jour</span>
                      </div>
                    </div>

                    {/* Allaitement Timeline Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">
                          Durée Allaitement : {litter.sucklingDays} / {litter.targetWeaningDays} jours
                        </span>
                        <span className="text-amber-700 font-black">{progressPercent}%</span>
                      </div>

                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isReadyForWeaning ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">
                        Date de sevrage cible : <strong>{litter.expectedWeaningDate}</strong>
                      </p>
                    </div>

                    {/* Action Button: Wean Litter */}
                    {litter.status === "En cours" && (
                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => handlePerformWeaning(litter.id)}
                          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-amber-300" />
                          <span>Effectuer le Sevrage & Basculer en Engraissement</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MISES EN ENGRAISSEMENT */}
        {activeTab === "fattening" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <PiggyBank className="w-5 h-5 text-emerald-600" />
                  <span>Suivi des Bandes en Engraissement</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Gérez les lots issus du sevrage, leurs gains moyens quotidiens (GMQ) et leurs projections de vente à la fin du cycle.
                </p>
              </div>

              <button
                onClick={() => setIsNewFatteningModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Lot Engraissement</span>
              </button>
            </div>

            {/* Fattening Batches Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {fatteningBatches.map((batch) => {
                const growthPercent = Math.min(
                  100,
                  Math.round(
                    ((batch.currentAvgWeightKg - batch.initialAvgWeightKg) /
                      (batch.targetSlaughterWeightKg - batch.initialAvgWeightKg)) *
                      100
                  )
                );

                const batchCarcassKg = batch.id === "fat-001" ? 70 : batch.id === "fat-002" ? 60 : (batch.targetSlaughterWeightKg || 75);
                const projectedRevenue = batch.currentHeadCount * batchCarcassKg * unitCosts.porcCharcutierPrixKg;

                return (
                  <div
                    key={batch.id}
                    className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded-md text-[10px] uppercase">
                          {batch.locationPen}
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          {batch.batchName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Origine : {batch.sourceSowCode || "Portée Maternité"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">CA Prévu</span>
                        <span className="text-sm font-black text-emerald-700">
                          {formatFCFA(projectedRevenue)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Sujets</span>
                        <span className="text-base font-black text-slate-900">{batch.currentHeadCount} porcs</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Poids Actuel</span>
                        <span className="text-base font-black text-amber-700">{batch.currentAvgWeightKg} kg</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">GMQ Cible</span>
                        <span className="text-base font-black text-emerald-800">{batch.averageDailyGainGrams} g / j</span>
                      </div>
                    </div>

                    {/* Weight Target Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">
                          Progression Poids : {batch.currentAvgWeightKg} kg / {batch.targetSlaughterWeightKg} kg
                        </span>
                        <span className="text-emerald-800 font-black">{growthPercent}%</span>
                      </div>

                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${growthPercent}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Phase aliment : <strong className="text-slate-800">{batch.currentFeedType}</strong></span>
                        <span>Date abattage estimée : <strong className="text-slate-800">{batch.estimatedSlaughterDate}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CALENDRIER & CYCLES DE GESTATION (114 JOURS) */}
        {activeTab === "gestation_calendar" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-bold mb-1">
                  <Clock className="w-3.5 h-3.5 text-purple-700" />
                  <span>Règle d'or Porcine : 3 Mois, 3 Semaines, 3 Jours (114 Jours)</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>Calendrier Prévisionnel des Gestations & Cycles de Saillie</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Calculateur automatique des jalons de reproduction : Diagnostic J-21, Transfert Maternité J-107, Mise Bas J-114, Sevrage J-142 et Retour Chaleurs.
                </p>
              </div>

              <button
                onClick={() => setIsNewMatingModalOpen(true)}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer une Saillie / IA</span>
              </button>
            </div>

            {/* Quick Summary KPIs for Gestation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-700">Truies Actives en Gestation</span>
                <div className="text-2xl font-black text-purple-950">{breedingSows.length} Truies</div>
                <span className="text-[10px] text-purple-700">Suivi des cycles de saillie</span>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-700">Mises Bas Imminentes (&lt;10j)</span>
                <div className="text-2xl font-black text-rose-900">
                  {breedingSows.filter((s) => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const insem = new Date(s.inseminationDate);
                    const due = new Date(insem.getTime() + 114 * 86400000);
                    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                    return daysLeft >= 0 && daysLeft <= 10;
                  }).length} Truie(s)
                </div>
                <span className="text-[10px] text-rose-700">Préparer loges maternité</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-800">Contrôle Diagnostic J-21</span>
                <div className="text-2xl font-black text-amber-900">
                  {breedingSows.filter((s) => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const insem = new Date(s.inseminationDate);
                    const daysElapsed = Math.floor((today.getTime() - insem.getTime()) / 86400000);
                    return daysElapsed >= 18 && daysElapsed <= 24;
                  }).length} Écho(s)
                </div>
                <span className="text-[10px] text-amber-800">Vérifier non-retour en chaleurs</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Durée Moyenne Gestation</span>
                <div className="text-2xl font-black text-emerald-900">114.2 Jours</div>
                <span className="text-[10px] text-emerald-700">Norme biologique respectée</span>
              </div>
            </div>

            {/* Sow Cycle Cards / Timeline List */}
            <div className="space-y-4">
              {breedingSows.map((sow) => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const insemDate = new Date(sow.inseminationDate);
                const echoDate = new Date(insemDate.getTime() + 21 * 86400000);
                const matEntryDate = new Date(insemDate.getTime() + 107 * 86400000);
                const dueFarrowDate = new Date(insemDate.getTime() + 114 * 86400000);
                const weaningDate = new Date(insemDate.getTime() + (114 + 28) * 86400000);
                const nextHeatDate = new Date(insemDate.getTime() + (114 + 28 + 5) * 86400000);

                const daysElapsed = Math.max(0, Math.floor((today.getTime() - insemDate.getTime()) / 86400000));
                const daysRemaining = Math.max(0, Math.ceil((dueFarrowDate.getTime() - today.getTime()) / 86400000));
                const progressPct = Math.min(100, Math.round((daysElapsed / 114) * 100));

                const isImminent = daysRemaining <= 7 && daysRemaining >= 0;
                const isOverdue = today.getTime() > dueFarrowDate.getTime();

                return (
                  <div
                    key={sow.id}
                    className={`p-5 bg-white rounded-2xl border-2 shadow-sm space-y-4 transition-all ${
                      isImminent || isOverdue
                        ? "border-rose-300 bg-rose-50/20"
                        : "border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl font-black">
                          <Baby className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-black text-slate-900">{sow.sowCode}</h4>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
                              {sow.sowBreed}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded text-[10px] font-extrabold">
                              Portée #{sow.litterNumber}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                            Taureau / Verrat / IA : <strong className="text-slate-800">{sow.boarCodeOrBreed}</strong> • Emplacement : <strong className="text-purple-900">{sow.penLocation}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isOverdue ? (
                          <span className="px-3 py-1 bg-rose-600 text-white rounded-full font-black text-xs animate-pulse">
                            🚨 Terme Atteint (Prête pour Mise Bas)
                          </span>
                        ) : isImminent ? (
                          <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full font-black text-xs animate-bounce">
                            ⚠️ J-{daysRemaining} Avant Mise Bas
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-full font-extrabold text-xs">
                            Jour {daysElapsed} / 114 ({progressPct}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Gestation Days Progress Bar */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-extrabold text-slate-700">
                        <span>Avancement Gestation : {daysElapsed} jours écoulés</span>
                        <span className="text-purple-800 font-black">{daysRemaining} jours restants</span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isImminent || isOverdue
                              ? "bg-rose-600"
                              : daysElapsed > 90
                              ? "bg-amber-500"
                              : "bg-purple-600"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Timeline Milestones Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[11px] font-medium pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">1. Saillie / IA (J-0)</span>
                        <span className="font-extrabold text-slate-900 block">{sow.inseminationDate}</span>
                        <span className="text-[9px] text-emerald-600 font-bold">✓ Confirmée</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                        daysElapsed >= 21 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                      }`}>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">2. Écho / Écho J-21</span>
                        <span className="font-extrabold text-slate-900 block">{echoDate.toISOString().split("T")[0]}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">
                          {daysElapsed >= 21 ? "✓ Gestation Confirmée" : "En attente test"}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                        daysElapsed >= 107 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
                      }`}>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">3. Entrée Maternité J-107</span>
                        <span className="font-extrabold text-amber-900 block">{matEntryDate.toISOString().split("T")[0]}</span>
                        <span className="text-[9px] text-amber-700 font-bold">
                          {daysElapsed >= 107 ? "Transfert fait" : "Désinfection loge"}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                        isImminent || isOverdue ? "bg-rose-100 border-rose-300" : "bg-slate-50 border-slate-200"
                      }`}>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">4. Terme Mise Bas J-114</span>
                        <span className="font-black text-rose-700 block text-xs">{dueFarrowDate.toISOString().split("T")[0]}</span>
                        <span className="text-[9px] text-rose-800 font-bold">
                          {isOverdue ? "Aujourd'hui !" : `Dans ${daysRemaining}j`}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">5. Sevrage Prévu J-142</span>
                        <span className="font-extrabold text-slate-900 block">{weaningDate.toISOString().split("T")[0]}</span>
                        <span className="text-[9px] text-slate-500 font-medium">Allaitement 28 jours</span>
                      </div>

                      <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase block">6. Prochaine Saillie J-147</span>
                        <span className="font-extrabold text-purple-950 block">{nextHeatDate.toISOString().split("T")[0]}</span>
                        <span className="text-[9px] text-purple-700 font-bold">+5j post-sevrage</span>
                      </div>
                    </div>

                    {sow.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Note : {sow.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: New Farrowing Registration */}
      {isNewFarrowingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Baby className="w-6 h-6 text-rose-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Saisie d'une Nouvelle Mise Bas
                </h3>
              </div>
              <button
                onClick={() => setIsNewFarrowingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarrowing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Code / Nom de la Truie :
                </label>
                <input
                  type="text"
                  required
                  value={sowCode}
                  onChange={(e) => setSowCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  placeholder="Ex: Truie T-05 Large White"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de Mise Bas :
                  </label>
                  <input
                    type="date"
                    required
                    value={farrowingDate}
                    onChange={(e) => setFarrowingDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loge Maternité :
                  </label>
                  <input
                    type="text"
                    required
                    value={farrowingPen}
                    onChange={(e) => setFarrowingPen(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Nés Vivants :
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bornAlive}
                    onChange={(e) => setBornAlive(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl font-black text-sm text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Mort-Nés :
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stillborn}
                    onChange={(e) => setStillborn(Number(e.target.value))}
                    className="w-full p-2.5 bg-rose-50 border border-rose-300 rounded-xl font-bold text-sm text-rose-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mummifiés :
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mummified}
                    onChange={(e) => setMummified(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Poids Moyen de Portée à la Naissance (kg) :
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={avgBirthWeight}
                  onChange={(e) => setAvgBirthWeight(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewFarrowingModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Valider la Mise Bas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Fattening Batch Registration */}
      {isNewFatteningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <PiggyBank className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Créer un Nouveau Lot d'Engraissement
                </h3>
              </div>
              <button
                onClick={() => setIsNewFatteningModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFatteningBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom du Lot / Bande :
                </label>
                <input
                  type="text"
                  required
                  value={fatteningBatchName}
                  onChange={(e) => setFatteningBatchName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Effectif (Sujets) :
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={fatteningHeadCount}
                    onChange={(e) => setFatteningHeadCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Poids Initial (kg) :
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={fatteningAvgWeight}
                    onChange={(e) => setFatteningAvgWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phase Alimentaire :
                  </label>
                  <select
                    value={fatteningFeedType}
                    onChange={(e) =>
                      setFatteningFeedType(e.target.value as "Démarrage" | "Croissance" | "Finition")
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  >
                    <option value="Démarrage">Démarrage</option>
                    <option value="Croissance">Croissance</option>
                    <option value="Finition">Finition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loge / Bâtiment :
                  </label>
                  <input
                    type="text"
                    required
                    value={fatteningPen}
                    onChange={(e) => setFatteningPen(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewFatteningModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Créer le Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Insemination / Mating Registration */}
      {isNewMatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Enregistrer une Saillie / Insémination
                </h3>
              </div>
              <button
                onClick={() => setIsNewMatingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newSow = {
                  id: `sow-cycle-${Date.now()}`,
                  sowCode: newMatingSowCode,
                  sowBreed: newMatingBreed,
                  inseminationDate: newMatingInsemDate,
                  boarCodeOrBreed: newMatingBoar,
                  litterNumber: Number(newMatingLitterNum),
                  penLocation: newMatingPen,
                  status: "Gestation Début" as const,
                  notes: newMatingNotes || "Saillie/IA enregistrée.",
                };
                setBreedingSows([newSow, ...breedingSows]);
                setIsNewMatingModalOpen(false);
                setNotification(`Cycle de saillie enregistré pour ${newMatingSowCode} ! Terme prévu dans 114 jours.`);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code / Nom de la Truie :
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatingSowCode}
                    onChange={(e) => setNewMatingSowCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                    placeholder="ex: Truie T-06"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Race / Souche Truie :
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatingBreed}
                    onChange={(e) => setNewMatingBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de Saillie / IA (J-0) :
                  </label>
                  <input
                    type="date"
                    required
                    value={newMatingInsemDate}
                    onChange={(e) => setNewMatingInsemDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numéro de Portée (Rang) :
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMatingLitterNum}
                    onChange={(e) => setNewMatingLitterNum(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Verrat / Semence IA :
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatingBoar}
                    onChange={(e) => setNewMatingBoar(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loge Gestation :
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatingPen}
                    onChange={(e) => setNewMatingPen(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes & Observations :
                </label>
                <textarea
                  rows={2}
                  value={newMatingNotes}
                  onChange={(e) => setNewMatingNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  placeholder="Observations sur le comportement en chaleur, quantité de semence, etc."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewMatingModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Calculer & Enregistrer Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
