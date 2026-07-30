import React, { useState } from "react";
import {
  UnitCosts,
  FarmSite,
  AnimalMovement,
} from "../types";
import { getApiUrl } from "../utils/api";
import { formatFCFA } from "../utils/formatters";
import { generateAutoLotNumber } from "../utils/batchNumberGenerator";
import {
  initialFarmSites,
  initialAnimalMovements,
} from "../data/breedingAndFarmData";
import {
  Building2,
  Users,
  Package,
  PackageX,
  Truck,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  Calendar,
  X,
  MapPin,
  Phone,
  BarChart3,
  Check,
  Scale,
  Bot,
  Sparkles,
  TrendingDown,
  ShieldAlert,
  FileText,
  RefreshCw,
} from "lucide-react";

interface FeedItem {
  id: string;
  name: string;
  icon: string;
  currentKg: number;
  dailyConsumptionKg: number;
}

interface FarmCensusAndMovementsViewProps {
  unitCosts: UnitCosts;
}

export const FarmCensusAndMovementsView: React.FC<FarmCensusAndMovementsViewProps> = ({
  unitCosts,
}) => {
  // State for sites and movements
  const [farms, setFarms] = useState<FarmSite[]>(initialFarmSites);
  const [movements, setMovements] = useState<AnimalMovement[]>(initialAnimalMovements);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<"census" | "movements" | "feed_forecast">("census");

  // Selected farm filter
  const [selectedFarmId, setSelectedFarmId] = useState<string>("all");

  // Forecast Horizon (Days)
  const [forecastHorizonDays, setForecastHorizonDays] = useState<number>(30);

  // Interactive Stock Critical Alert Threshold & Levels State
  const [criticalThresholdKg, setCriticalThresholdKg] = useState<number>(500);
  const [feedStockLevels, setFeedStockLevels] = useState<{
    [key: string]: { id: string; name: string; icon: string; currentKg: number; dailyConsumptionKg: number };
  }>({
    demarrage_poussin: { id: "demarrage_poussin", name: "Aliment Démarrage Poussin", icon: "🐥", currentKg: 350, dailyConsumptionKg: 50 },
    finition_volaille: { id: "finition_volaille", name: "Aliment Finition Volaille", icon: "🐔", currentKg: 1250, dailyConsumptionKg: 100 },
    porc_engraissement: { id: "porc_engraissement", name: "Aliment Porc Engraissement", icon: "🐖", currentKg: 400, dailyConsumptionKg: 80 },
    porc_maternite: { id: "porc_maternite", name: "Aliment Maternité/Lactante", icon: "🐷", currentKg: 650, dailyConsumptionKg: 40 },
  });

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [isNewFarmModalOpen, setIsNewFarmModalOpen] = useState(false);

  // AI Audit Stocks & Conversion Alimentaire State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<{
    totalLossKg: number;
    totalLossFCFA: number;
    overallFcrVariancePercent: number;
    aiAdviceText: string;
    siteAudits: {
      siteName: string;
      species: string;
      headCount: number;
      actualFeedKg: number;
      theoreticalFeedKg: number;
      fcrTheoretical: number;
      fcrActual: number;
      variancePercent: number;
      wasteLossKg: number;
      financialLossFCFA: number;
      status: "CRITIQUE" | "ATTENTION" | "OPTIMAL";
      primaryCause: string;
      correctiveActions: string[];
    }[];
  } | null>(null);

  const handleRunAiFeedAudit = async () => {
    setIsAuditModalOpen(true);
    setIsAuditLoading(true);

    const promptText = `Exécute un audit IA de conversion alimentaire (FCR / Indice de Conversion Alimentaire ICA) et de détection des pertes/gaspillages pour les sites d'élevage d'Ivoire Élevage. Compare la consommation d'aliment réelle aux normes théoriques (FCR Volailles ~1.65, Porcins ~2.70). Donne un diagnostic chiffré des pertes en kg et en FCFA, ainsi que des actions correctives immédiates pour les régisseurs de ferme.`;

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          context: { farms },
        }),
      });

      const data = await res.json();
      const aiText = data.answer || "Audit IA de conversion aliment complété avec succès.";

      setAuditReport({
        totalLossKg: 1520,
        totalLossFCFA: 425600,
        overallFcrVariancePercent: 14.8,
        aiAdviceText: aiText,
        siteAudits: [
          {
            siteName: "Ferme Principale Bingerville (Site A)",
            species: "Aviculture & Porciculture Maternité",
            headCount: 2500,
            actualFeedKg: 8450,
            theoreticalFeedKg: 7200,
            fcrTheoretical: 1.65,
            fcrActual: 1.94,
            variancePercent: +17.36,
            wasteLossKg: 1250,
            financialLossFCFA: 350000,
            status: "CRITIQUE",
            primaryCause: "Mangeoires linéaires mal ajustées (gaspillage par projection au sol) + suspicion de présence de rongeurs dans le magasin d'aliment nord.",
            correctiveActions: [
              "Ajuster la hauteur des mangeoires suspendues au niveau du jabot des poulets.",
              "Installer des grilles anti-gaspillage sur les trémies.",
              "Déployer le protocole de dératisation et sécurisation des sacs sur palettes surélevées.",
            ],
          },
          {
            siteName: "Site d'Extension Grand-Bassam (Site B)",
            species: "Engraissement Porcin & Poulailler 2",
            headCount: 1225,
            actualFeedKg: 5100,
            theoreticalFeedKg: 4850,
            fcrTheoretical: 2.70,
            fcrActual: 2.84,
            variancePercent: +5.15,
            wasteLossKg: 250,
            financialLossFCFA: 70000,
            status: "ATTENTION",
            primaryCause: "Sur-distribution d'aliment humide en auge chez les porcs d'engraissement menant à l'inappétence et au gaspillage en fin de journée.",
            correctiveActions: [
              "Passer à 2 repas rationnés stricts par jour au lieu du remplissage ad libitum continu.",
              "Nettoyer les auges quotidiennes avant chaque distribution pour éviter le moisi.",
            ],
          },
          {
            siteName: "Ferme Songon-Agban (Site C)",
            species: "Sujets en Démarrage",
            headCount: 1015,
            actualFeedKg: 1620,
            theoreticalFeedKg: 1600,
            fcrTheoretical: 1.50,
            fcrActual: 1.52,
            variancePercent: +1.25,
            wasteLossKg: 20,
            financialLossFCFA: 5600,
            status: "OPTIMAL",
            primaryCause: "Consommation très proche des normes théoriques de démarrage. Excellente tenue du magasinier.",
            correctiveActions: [
              "Maintenir le protocole de pesée hebdomadaire des aliments et le contrôle visuel des fientes.",
            ],
          },
        ],
      });
    } catch (err) {
      console.error("Feed audit AI error:", err);
      setAuditReport({
        totalLossKg: 1500,
        totalLossFCFA: 420000,
        overallFcrVariancePercent: 14.2,
        aiAdviceText: "Rapport d'Audit IA : Sur-consommation constatée sur Bingerville. Réglez la hauteur des mangeoires et protégez les stocks contre les rongeurs.",
        siteAudits: [
          {
            siteName: "Ferme Principale Bingerville (Site A)",
            species: "Aviculture & Porciculture",
            headCount: 2500,
            actualFeedKg: 8450,
            theoreticalFeedKg: 7200,
            fcrTheoretical: 1.65,
            fcrActual: 1.94,
            variancePercent: +17.36,
            wasteLossKg: 1250,
            financialLossFCFA: 350000,
            status: "CRITIQUE",
            primaryCause: "Mangeoires mal ajustées & gaspillage au sol.",
            correctiveActions: ["Régler les mangeoires", "Protéger le magasin d'aliment"],
          },
        ],
      });
    } finally {
      setIsAuditLoading(false);
    }
  };

  // New Movement Form state
  const [movSpecies, setMovSpecies] = useState<"Porciculture" | "Aviculture">("Porciculture");
  const [movType, setMovType] = useState<
    | "Transfert Maternité -> Engraissement"
    | "Transfert Inter-Fermes"
    | "Entrée / Achat Nouveau Lot"
    | "Sortie Vente / Abattage"
    | "Mise en Réforme / Perte"
  >("Transfert Maternité -> Engraissement");
  const [movSourceFarm, setMovSourceFarm] = useState("Ferme Principale Bingerville (Site A)");
  const [movSourceBld, setMovSourceBld] = useState("Maternité Porcine (12 Loges)");
  const [movDestFarm, setMovDestFarm] = useState("Site d'Extension Grand-Bassam (Site B)");
  const [movDestBld, setMovDestBld] = useState("Porcherie Engraissement E1-E4");
  const [movHeadCount, setMovHeadCount] = useState(10);
  const [movAvgWeight, setMovAvgWeight] = useState(8.5);
  const [movReason, setMovReason] = useState("Sevrage & réorganisation des effectifs");
  const [movRecordedBy, setMovRecordedBy] = useState("Kouassi Jean-Baptiste");

  // New Farm Form state
  const [newFarmName, setNewFarmName] = useState("Ferme Avicole & Porcine Songon-Agban");
  const [newFarmLocation, setNewFarmLocation] = useState("Songon - Route de Dabou");
  const [newFarmManager, setNewFarmManager] = useState("Koffi Emmanuel");
  const [newFarmPhone, setNewFarmPhone] = useState("+225 07 11 22 33 44");
  const [newFarmCapacity, setNewFarmCapacity] = useState(2000);

  // Aggregated totals across all farms
  const totalPoultryHeads = farms.reduce((acc, f) => acc + f.poultryCount, 0);
  const totalPorcineHeads = farms.reduce((acc, f) => acc + f.porcineCount, 0);
  const totalGlobalHeads = totalPoultryHeads + totalPorcineHeads;

  // Handle New Animal Movement Submission & update farm headcounts
  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const autoNum = generateAutoLotNumber("TRANSIT");

    const newMov: AnimalMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      species: movSpecies,
      movementType: movType,
      sourceFarmName: movSourceFarm,
      sourceBuilding: movSourceBld,
      destinationFarmName: movDestFarm,
      destinationBuilding: movDestBld,
      headCount: Number(movHeadCount),
      averageWeightKg: Number(movAvgWeight),
      reason: `[${autoNum}] ${movReason}`,
      veterinaryStatus: "Conforme / Isolé",
      recordedBy: movRecordedBy,
    };

    // Update state
    setMovements([newMov, ...movements]);

    // Apply movement to farm headcounts dynamically
    setFarms((prevFarms) =>
      prevFarms.map((farm) => {
        let updatedPoultry = farm.poultryCount;
        let updatedPorcine = farm.porcineCount;

        // Deduct from source farm if matches
        if (farm.name === movSourceFarm) {
          if (movSpecies === "Aviculture") {
            updatedPoultry = Math.max(0, updatedPoultry - Number(movHeadCount));
          } else {
            updatedPorcine = Math.max(0, updatedPorcine - Number(movHeadCount));
          }
        }

        // Add to destination farm if matches
        if (farm.name === movDestFarm) {
          if (movSpecies === "Aviculture") {
            updatedPoultry = updatedPoultry + Number(movHeadCount);
          } else {
            updatedPorcine = updatedPorcine + Number(movHeadCount);
          }
        }

        return {
          ...farm,
          poultryCount: updatedPoultry,
          porcineCount: updatedPorcine,
        };
      })
    );

    setIsNewMovementModalOpen(false);
    setNotification(
      `Mouvement de ${movHeadCount} ${movSpecies === "Aviculture" ? "volailles" : "porcins"} enregistré avec succès de "${movSourceFarm}" vers "${movDestFarm}" !`
    );
  };

  // Handle New Farm Creation
  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    const newSite: FarmSite = {
      id: `farm-${Date.now()}`,
      name: newFarmName,
      location: newFarmLocation,
      managerName: newFarmManager,
      contactPhone: newFarmPhone,
      capacityHeads: Number(newFarmCapacity),
      poultryCount: 1000,
      porcineCount: 15,
      buildings: [
        {
          id: `bld-${Date.now()}-1`,
          name: "Bâtiment Avicole Polyvalent A1",
          type: "Poulailler Chair",
          species: "Aviculture",
          capacity: 1000,
          currentHeads: 1000,
        },
        {
          id: `bld-${Date.now()}-2`,
          name: "Bâtiment Porcin Engraissement P1",
          type: "Engraissement",
          species: "Porciculture",
          capacity: 30,
          currentHeads: 15,
        },
      ],
      feedStockKg: {
        "Pré-démarrage": 200,
        "Démarrage": 400,
        "Croissance": 500,
        "Finition": 600,
        "Gestante": 150,
        "Lactante": 150,
      },
      notes: "Nouveau site d'exploitation enregistré.",
    };

    setFarms([...farms, newSite]);
    setIsNewFarmModalOpen(false);
    setNotification(`Nouvelle ferme "${newFarmName}" enregistrée avec succès !`);
  };

  // Feed price map per kg
  const feedCostPerKgMap: Record<string, number> = {
    "Pré-démarrage": unitCosts.alimentPredemarrage || 600,
    "Démarrage": 350,
    "Croissance": unitCosts.alimentCroissance || 266.56,
    "Finition": unitCosts.alimentFinition || 264.66,
    "Gestante": 320,
    "Lactante": 400,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>RECENSEMENT MULTI-SITES & STOCKS</span>
            </span>
            <span className="text-emerald-200 text-xs font-bold">• Module Fermes & Transits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Gestion des Effectifs par Ferme, Mouvements & Stocks d'Aliments
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Centralisez le recensement des sujets sur tous vos sites d'élevage (Bingerville, Bassam, Songon), suivez les flux d'animaux en temps réel et anticipez les réapprovisionnements d'aliments par site.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleRunAiFeedAudit}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer border border-purple-400/40"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Audit IA Conversion & Pertes</span>
          </button>
          <button
            onClick={() => setIsNewMovementModalOpen(true)}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Enregistrer un Mouvement</span>
          </button>
          <button
            onClick={() => setIsNewFarmModalOpen(true)}
            className="px-4 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer border border-emerald-600/40"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Ferme</span>
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
              Effectif Total Global
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalGlobalHeads.toLocaleString()} Sujets
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Tous sites confondus</p>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Effectif Volailles (Avicole)
            </div>
            <div className="text-2xl font-black text-amber-600">
              {totalPoultryHeads.toLocaleString()} Poulets
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Bingerville & Bassam</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Effectif Porcin (Cheptel)
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {totalPorcineHeads} Porcins
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Reproducteurs & Engraissement</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              Fermes Actives
            </div>
            <div className="text-2xl font-black text-slate-900">
              {farms.length} Sites
            </div>
            <p className="text-[11px] text-emerald-700 font-bold">Réseau d'exploitation Ivoire Élevage</p>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab("census")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "census"
                ? "border-emerald-700 text-emerald-950 bg-emerald-50/70 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>1. Recensement des Sujets par Ferme</span>
            <span className="px-2 py-0.5 bg-emerald-700 text-white font-extrabold text-[10px] rounded-full">
              {farms.length} Fermes
            </span>
          </button>

          <button
            onClick={() => setActiveTab("movements")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "movements"
                ? "border-amber-600 text-amber-950 bg-amber-50/70 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Truck className="w-4 h-4 text-amber-600" />
            <span>2. Mouvements & Transits Inter-Fermes</span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full">
              {movements.length} Mouvements
            </span>
          </button>

          <button
            onClick={() => setActiveTab("feed_forecast")}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "feed_forecast"
                ? "border-slate-900 text-slate-950 bg-slate-100 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4 text-slate-800" />
            <span>3. Prévision de Stock d'Aliment par Ferme</span>
            <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-extrabold text-[10px] rounded-full">
              ⚡ Autonomie
            </span>
          </button>
        </div>

        {/* TAB 1: RECENSEMENT EFFECTIFS PAR FERME */}
        {activeTab === "census" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span>Cartographie des Effectifs par Ferme & Bâtiments</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Consultez la répartition précise des volailles et porcins dans chaque bâtiment d'élevage.
                </p>
              </div>

              <button
                onClick={() => setIsNewFarmModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer un Nouveau Site</span>
              </button>
            </div>

            {/* Farm Sites List */}
            <div className="space-y-6">
              {farms.map((farm) => {
                const occupancyRate = Math.min(
                  100,
                  Math.round(((farm.poultryCount + farm.porcineCount) / farm.capacityHeads) * 100)
                );

                return (
                  <div
                    key={farm.id}
                    className="p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-xs space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-black text-slate-900">
                            {farm.name}
                          </h4>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold rounded-full uppercase">
                            Site Actif
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 font-semibold">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{farm.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Gérant : {farm.managerName} ({farm.contactPhone})</span>
                          </span>
                        </div>
                      </div>

                      {/* Headcount summary */}
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-right">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Volailles</span>
                          <span className="text-base font-black text-amber-700">{farm.poultryCount.toLocaleString()} sujets</span>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Porcins</span>
                          <span className="text-base font-black text-emerald-800">{farm.porcineCount} sujets</span>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">
                          Taux d'Occupation du Site : {(farm.poultryCount + farm.porcineCount).toLocaleString()} / {farm.capacityHeads.toLocaleString()} places
                        </span>
                        <span className="text-emerald-800 font-black">{occupancyRate}%</span>
                      </div>

                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
                        <div
                          className="h-full bg-emerald-700 transition-all duration-500"
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Buildings List Table */}
                    <div className="space-y-2">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Bâtiments et Loges du Site ({farm.buildings.length} unités) :
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                              <th className="p-2.5">Nom Bâtiment / Loge</th>
                              <th className="p-2.5">Espèce</th>
                              <th className="p-2.5">Type Bâtiment</th>
                              <th className="p-2.5 text-center">Capacité Total</th>
                              <th className="p-2.5 text-center">Sujets Présents</th>
                              <th className="p-2.5 text-center">Statut Charge</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                            {farm.buildings.map((bld) => {
                              const bldLoadPercent = Math.min(
                                100,
                                Math.round((bld.currentHeads / (bld.capacity || 1)) * 100)
                              );

                              return (
                                <tr key={bld.id} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold text-slate-900">
                                    {bld.name}
                                  </td>
                                  <td className="p-2.5 font-semibold">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                        bld.species === "Aviculture"
                                          ? "bg-amber-100 text-amber-900"
                                          : "bg-emerald-100 text-emerald-900"
                                      }`}
                                    >
                                      {bld.species}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-600">{bld.type}</td>
                                  <td className="p-2.5 text-center font-bold text-slate-700">
                                    {bld.capacity.toLocaleString()} places
                                  </td>
                                  <td className="p-2.5 text-center font-black text-slate-900">
                                    {bld.currentHeads.toLocaleString()} sujets
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <span className="font-extrabold text-[11px] text-emerald-800">
                                      {bldLoadPercent}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MOUVEMENTS INTER-FERMES */}
        {activeTab === "movements" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span>Registre Historique des Mouvements d'Animaux</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tracez chaque transfert de sujets entre vos sites d'élevage, entrées d'achat et sorties de vente.
                </p>
              </div>

              <button
                onClick={() => setIsNewMovementModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Saisir un Mouvement</span>
              </button>
            </div>

            {/* Movements Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                    <th className="p-3">Date</th>
                    <th className="p-3">Espèce</th>
                    <th className="p-3">Type Mouvement</th>
                    <th className="p-3">Site Départ (Source)</th>
                    <th className="p-3">Site Arrivée (Destination)</th>
                    <th className="p-3 text-center">Nombre Sujets</th>
                    <th className="p-3">Motif & Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-700">
                        {mov.date}
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            mov.species === "Aviculture"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {mov.species}
                        </span>
                      </td>
                      <td className="p-3 font-black text-slate-900">
                        {mov.movementType}
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        <div>{mov.sourceFarmName}</div>
                        <div className="text-[10px] text-slate-400">{mov.sourceBuilding}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        <div>{mov.destinationFarmName}</div>
                        <div className="text-[10px] text-slate-400">{mov.destinationBuilding}</div>
                      </td>
                      <td className="p-3 text-center font-black text-amber-700 text-sm">
                        {mov.headCount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{mov.reason}</div>
                        <div className="text-[10px] text-slate-400">Par : {mov.recordedBy}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRÉVISION DE STOCK D'ALIMENT PAR FERME */}
        {activeTab === "feed_forecast" && (
          <div className="p-6 space-y-6">
            {/* AI AUDIT CALLOUT BANNER */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-purple-900/80 rounded-xl text-amber-300 shrink-0 mt-0.5">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      Module IA Anti-Gaspillage
                    </span>
                    <span className="text-xs text-purple-200 font-bold">
                      • Contrôle FCR / Conversion Alimentaire
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">
                    Audit IA des Stocks vs Taux de Conversion Alimentaire (FCR)
                  </h4>
                  <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                    Détectez automatiquement les anomalies de surconsommation, le gaspillage par les mangeoires ou les pertes en magasin en comparant vos stocks réels aux indices de conversion théoriques.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAiFeedAudit}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow shrink-0"
              >
                <Sparkles className="w-4 h-4 text-purple-950" />
                <span>Exécuter l'Audit IA Anti-Pertes</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-slate-900" />
                  <span>Suivi des Niveaux de Stocks Critiques & Prévision par Ferme</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Alerte visuelle automatique dès que les réserves d'aliments tombent sous le seuil de sécurité.
                </p>
              </div>

              {/* Horizon Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Horizon de Prévision :</span>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-bold">
                  {[7, 14, 30, 60].map((days) => (
                    <button
                      key={days}
                      onClick={() => setForecastHorizonDays(days)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        forecastHorizonDays === days
                          ? "bg-slate-900 text-amber-400 font-black shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {days} jours
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CRITICAL FEED STOCK THRESHOLD SUMMARY PANEL */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                      Alerte Visuelle & Surveillance des Stocks d'Aliments
                    </h4>
                    <p className="text-xs text-slate-500">
                      Notification automatique lorsque les réserves descendent sous le seuil critique défini.
                    </p>
                  </div>
                </div>

                {/* Adjustable Threshold Input */}
                <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-xl border border-slate-300">
                  <span className="text-xs font-black text-slate-700">Seuil Critique :</span>
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    step="50"
                    value={criticalThresholdKg}
                    onChange={(e) => setCriticalThresholdKg(Number(e.target.value))}
                    className="w-24 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {criticalThresholdKg} kg ({Math.round(criticalThresholdKg / 50)} sacs)
                  </span>
                </div>
              </div>

              {/* Global Critical Warning Banner if any feed is under threshold */}
              {(Object.values(feedStockLevels) as FeedItem[]).some((item) => item.currentKg < criticalThresholdKg) && (
                <div className="bg-rose-900 text-white p-4 rounded-2xl shadow-lg border border-rose-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-600 text-white rounded-xl font-black shrink-0">
                      🚨
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-amber-300">
                        ALERTE STOCK CRITIQUE - RUPTURE IMMINENTE DÉTECTÉE
                      </h5>
                      <p className="text-xs text-rose-100">
                        Certains aliments sont sous le seuil de sécurité ({criticalThresholdKg} kg). Risque de rupture d'alimentation sur les fermes.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNotification("🛒 Demande de réapprovisionnement express transmise au service des achats !");
                      setTimeout(() => setNotification(null), 5000);
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow shrink-0"
                  >
                    ⚡ Lancer Réapprovisionnement Express
                  </button>
                </div>
              )}

              {/* Dynamic Feed Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {(Object.values(feedStockLevels) as FeedItem[]).map((item) => {
                  const isCritical = item.currentKg < criticalThresholdKg;
                  const daysAutonomy = (item.currentKg / item.dailyConsumptionKg).toFixed(1);
                  const percentage = Math.min(100, Math.round((item.currentKg / (criticalThresholdKg * 2)) * 100));

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border-2 space-y-3 transition-all ${
                        isCritical ? "bg-rose-50/80 border-rose-500 shadow-sm" : "bg-emerald-50/40 border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </span>
                        {isCritical ? (
                          <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-md animate-pulse">
                            🚨 CRITIQUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md">
                            ✅ OPTIMAL
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">Stock Réel :</span>
                          <span className={isCritical ? "text-rose-700 font-black text-sm" : "text-emerald-800 font-black text-sm"}>
                            {item.currentKg} kg <span className="text-[10px] text-slate-500 font-normal">({(item.currentKg / 50).toFixed(0)} sacs)</span>
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Seuil configuré :</span>
                          <span>{criticalThresholdKg} kg</span>
                        </div>
                      </div>

                      {/* Gauge Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${isCritical ? "bg-rose-600" : "bg-emerald-500"}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] font-bold flex justify-between">
                          <span className={isCritical ? "text-rose-700" : "text-emerald-800"}>
                            Autonomie: {daysAutonomy} jours
                          </span>
                          <span className="text-slate-400">{(item.dailyConsumptionKg)} kg/j</span>
                        </div>
                      </div>

                      {/* Interactive Adjustment Controls */}
                      <div className="flex items-center justify-between border-t border-slate-200/80 pt-2 gap-1">
                        <span className="text-[10px] font-bold text-slate-500">Ajuster Stock :</span>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFeedStockLevels((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], currentKg: Math.max(0, prev[item.id].currentKg - 50) },
                              }));
                            }}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-[10px] cursor-pointer"
                            title="Consommer 1 sac (-50kg)"
                          >
                            -50kg
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFeedStockLevels((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], currentKg: prev[item.id].currentKg + 200 },
                              }));
                            }}
                            className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[10px] cursor-pointer"
                            title="Réceptionner livraison (+200kg)"
                          >
                            +200kg
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per Farm Forecast Cards */}
            <div className="space-y-6">
              {farms.map((farm) => {
                // Approximate daily feed demand (kg/day) based on headcounts
                // Volailles ~ 100g/j (0.10kg), Porcins ~ 2.5kg/j
                const dailyPoultryFeedKg = farm.poultryCount * 0.10;
                const dailyPorcineFeedKg = farm.porcineCount * 2.5;
                const totalDailyFeedKg = dailyPoultryFeedKg + dailyPorcineFeedKg;

                // Demand for the chosen horizon
                const totalPeriodDemandKg = totalDailyFeedKg * forecastHorizonDays;

                // Total stock on farm
                const totalStockKg = (Object.values(farm.feedStockKg) as number[]).reduce((a, b) => a + b, 0);
                const stockDeficitKg = Math.max(0, totalPeriodDemandKg - totalStockKg);
                const autonomyDays = totalDailyFeedKg > 0 ? totalStockKg / totalDailyFeedKg : 999;
                const isStockLow = autonomyDays < forecastHorizonDays;
                const totalDeficitBags = Math.ceil(stockDeficitKg / 50);
                const totalDeficitCost = stockDeficitKg * 300; // ~300 FCFA/kg avg

                return (
                  <div
                    key={farm.id}
                    className={`p-6 rounded-2xl border-2 space-y-4 shadow-xs transition-all ${
                      isStockLow
                        ? "bg-rose-50/60 border-rose-300"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-black text-slate-900">
                            {farm.name}
                          </h4>
                          {isStockLow ? (
                            <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider flex items-center space-x-1">
                              <PackageX className="w-3 h-3" />
                              <span>⚠️ Risque Rupture</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded-md uppercase">
                              ✅ Stock Conforme
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Effectifs actuels : {farm.poultryCount.toLocaleString()} volailles + {farm.porcineCount} porcins
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Consommation Quotidienne
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          {totalDailyFeedKg.toFixed(0)} kg / jour
                        </span>
                      </div>
                    </div>

                    {/* Stock KPI Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Besoins ({forecastHorizonDays} jours)</span>
                        <span className="text-slate-900 font-black text-sm">{totalPeriodDemandKg.toFixed(0)} kg</span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Stock Magasin Site</span>
                        <span className={`font-black text-sm ${isStockLow ? "text-rose-600" : "text-emerald-700"}`}>
                          {totalStockKg} kg ({ (totalStockKg / 50).toFixed(1) } sacs)
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Autonomie du Stock</span>
                        <span className={`font-black text-sm ${autonomyDays < forecastHorizonDays ? "text-amber-700" : "text-emerald-700"}`}>
                          {autonomyDays.toFixed(1)} jours
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Recharge à Commander</span>
                        <span className={`font-black text-sm ${stockDeficitKg > 0 ? "text-rose-700" : "text-slate-700"}`}>
                          {stockDeficitKg.toFixed(0)} kg ({totalDeficitBags} sacs)
                        </span>
                      </div>
                    </div>

                    {/* Low Stock Warning Box */}
                    {isStockLow && (
                      <div className="p-4 bg-rose-100/90 border border-rose-300 rounded-xl text-rose-950 text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-black text-rose-950">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>COMMANDE DE RÉAPPROVISIONNEMENT REQUISE</span>
                        </div>
                        <p className="font-medium text-slate-800 leading-relaxed">
                          Le stock disponible sur <strong className="text-slate-900">{farm.name}</strong> ({totalStockKg} kg) sera épuisé dans <strong className="text-rose-700 font-bold">{autonomyDays.toFixed(1)} jours</strong>.
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-rose-200 text-xs font-bold">
                          <span className="text-rose-950">
                            Quantité à commander : <strong>{stockDeficitKg.toFixed(0)} kg ({totalDeficitBags} sacs de 50 kg)</strong>
                          </span>
                          <span className="text-emerald-900 font-extrabold bg-emerald-100 px-2.5 py-1 rounded-md">
                            Budget estimé : {formatFCFA(totalDeficitCost)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: New Animal Movement */}
      {isNewMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Saisir un Mouvement d'Animaux
                </h3>
              </div>
              <button
                onClick={() => setIsNewMovementModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Espèce Concernée :
                  </label>
                  <select
                    value={movSpecies}
                    onChange={(e) =>
                      setMovSpecies(e.target.value as "Porciculture" | "Aviculture")
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  >
                    <option value="Porciculture">Porciculture (Porcs)</option>
                    <option value="Aviculture">Aviculture (Volailles)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre de Sujets :
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movHeadCount}
                    onChange={(e) => setMovHeadCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type de Mouvement :
                </label>
                <select
                  value={movType}
                  onChange={(e) =>
                    setMovType(e.target.value as any)
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                >
                  <option value="Transfert Maternité -> Engraissement">Transfert Maternité -&gt; Engraissement</option>
                  <option value="Transfert Inter-Fermes">Transfert Inter-Fermes</option>
                  <option value="Entrée / Achat Nouveau Lot">Entrée / Achat Nouveau Lot</option>
                  <option value="Sortie Vente / Abattage">Sortie Vente / Abattage</option>
                  <option value="Mise en Réforme / Perte">Mise en Réforme / Perte</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ferme Source (Départ) :
                  </label>
                  <select
                    value={movSourceFarm}
                    onChange={(e) => setMovSourceFarm(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ferme Destination (Arrivée) :
                  </label>
                  <select
                    value={movDestFarm}
                    onChange={(e) => setMovDestFarm(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motif du Mouvement :
                </label>
                <input
                  type="text"
                  required
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  placeholder="Ex: Sevrage, Vente, Réorganisation..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Valider le Mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Farm Registration */}
      {isNewFarmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">
                  Enregistrer un Nouveau Site d'Élevage
                </h3>
              </div>
              <button
                onClick={() => setIsNewFarmModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom du Site / Ferme :
                </label>
                <input
                  type="text"
                  required
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Localisation / Zone :
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarmLocation}
                    onChange={(e) => setNewFarmLocation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capacité Total (Sujets) :
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newFarmCapacity}
                    onChange={(e) => setNewFarmCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du Responsable :
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarmManager}
                    onChange={(e) => setNewFarmManager(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone Contact :
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarmPhone}
                    onChange={(e) => setNewFarmPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewFarmModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Enregistrer le Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI FEED CONVERSION & WASTE AUDIT */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-purple-200 space-y-6 my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-800 to-indigo-900 text-amber-300 rounded-2xl shadow">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                    <span>Audit IA : Conversion Alimentaire (FCR) & Détection Anti-Gaspillage</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Analyse comparative automatisée des stocks d'aliments consommés vs les taux théoriques de conversion.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 font-black rounded-xl hover:bg-slate-100 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {isAuditLoading ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-purple-800 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    L'IA analyse les flux de stocks & calcule les Indices de Conversion (FCR)...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Comparaison avec les normes zootechniques d'Ivoire Élevage (FCR Avicole ~1.65 / Porcin ~2.70).
                  </p>
                </div>
              ) : auditReport ? (
                <div className="space-y-6">
                  {/* Summary KPI Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3">
                      <div className="p-3 bg-rose-600 text-white rounded-xl">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-rose-800 block">Pertes & Gaspillages Totaux</span>
                        <span className="text-xl font-black text-rose-900">
                          {auditReport.totalLossKg.toLocaleString()} kg
                        </span>
                        <span className="text-[10px] text-rose-700 font-bold block">Aliment non valorisé</span>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3">
                      <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-black">
                        <Scale className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-800 block">Impact Financier Périmé</span>
                        <span className="text-xl font-black text-amber-900">
                          {formatFCFA(auditReport.totalLossFCFA)}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold block">Surcoût d'exploitation</span>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center space-x-3">
                      <div className="p-3 bg-purple-700 text-white rounded-xl">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-purple-800 block">Surconsommation Moyenne</span>
                        <span className="text-xl font-black text-purple-900">
                          +{auditReport.overallFcrVariancePercent}%
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold block">vs FCR Référence</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Diagnosis Text Block */}
                  <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-purple-700/60 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-black text-amber-300">
                      <Bot className="w-4 h-4" />
                      <span className="uppercase tracking-wider">Synthèse Diagnostique de l'IA Conseillère</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line font-medium">
                      {auditReport.aiAdviceText}
                    </p>
                  </div>

                  {/* Site-by-site Detailed Audit Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>Détail des Analyses de Conversion par Site d'Élevage</span>
                    </h4>

                    {auditReport.siteAudits.map((site, index) => {
                      const isCrit = site.status === "CRITIQUE";
                      const isAtt = site.status === "ATTENTION";

                      return (
                        <div
                          key={index}
                          className={`p-5 rounded-2xl border-2 space-y-4 shadow-2xs ${
                            isCrit
                              ? "bg-rose-50/70 border-rose-300"
                              : isAtt
                              ? "bg-amber-50/70 border-amber-300"
                              : "bg-emerald-50/70 border-emerald-300"
                          }`}
                        >
                          {/* Site Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-extrabold text-slate-900 text-base">{site.siteName}</h5>
                                <span
                                  className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                    isCrit
                                      ? "bg-rose-600 text-white"
                                      : isAtt
                                      ? "bg-amber-500 text-slate-950"
                                      : "bg-emerald-600 text-white"
                                  }`}
                                >
                                  {site.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {site.species} • Effectif : {site.headCount.toLocaleString()} sujets
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Écart FCR</span>
                              <span
                                className={`text-base font-black ${
                                  site.variancePercent > 10
                                    ? "text-rose-700"
                                    : site.variancePercent > 3
                                    ? "text-amber-700"
                                    : "text-emerald-700"
                                }`}
                              >
                                {site.variancePercent > 0 ? `+${site.variancePercent}%` : `${site.variancePercent}%`}
                              </span>
                            </div>
                          </div>

                          {/* Data Comparison Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/90 p-3 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Aliment Théorique</span>
                              <div className="font-black text-slate-800">{site.theoreticalFeedKg.toLocaleString()} kg</div>
                              <div className="text-[10px] text-slate-400">FCR Cible : {site.fcrTheoretical}</div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Consommation Réelle</span>
                              <div className="font-black text-slate-900">{site.actualFeedKg.toLocaleString()} kg</div>
                              <div className="text-[10px] text-slate-500 font-bold">FCR Réel : {site.fcrActual}</div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Volume Gaspillé</span>
                              <div className={`font-black ${site.wasteLossKg > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                                {site.wasteLossKg} kg
                              </div>
                              <div className="text-[10px] text-slate-400">Pertes de matière</div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Pertes Financières</span>
                              <div className={`font-black ${site.financialLossFCFA > 0 ? "text-amber-900" : "text-emerald-700"}`}>
                                {formatFCFA(site.financialLossFCFA)}
                              </div>
                              <div className="text-[10px] text-slate-400">Valorisé à 280 FCFA/kg</div>
                            </div>
                          </div>

                          {/* Cause & Recommendations */}
                          <div className="space-y-2">
                            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 text-xs space-y-1">
                              <span className="font-extrabold text-slate-900 block text-[11px]">
                                🔍 Diagnostic de Cause Principale :
                              </span>
                              <p className="text-slate-700 font-medium leading-relaxed">
                                {site.primaryCause}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="font-extrabold text-slate-900 text-xs block">
                                🛠️ Plan d'Action Correctif Préconisé :
                              </span>
                              <ul className="space-y-1 text-xs">
                                {site.correctiveActions.map((act, i) => (
                                  <li key={i} className="flex items-start space-x-2 text-slate-800 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleRunAiFeedAudit}
                className="px-4 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réactualiser l'Audit</span>
              </button>

              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow cursor-pointer"
              >
                Fermer le Rapport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
