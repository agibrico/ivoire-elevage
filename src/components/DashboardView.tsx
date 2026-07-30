import React, { useState } from "react";
import { ActiveTab, UnitCosts } from "../types";
import { formatFCFA, formatPercent } from "../utils/formatters";
import {
  getMonthlyInitialPhaseData,
  getYearlyProjectionsData,
  getStartupInvestmentMois1,
  getBuildingRentSavings,
  weightedAveragePouletRevenue,
} from "../data/businessPlanData";
import { saveOfflineEntry } from "../utils/offlineStorage";
import {
  TrendingUp,
  DollarSign,
  Egg,
  PiggyBank,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
  Building,
  Bell,
  AlertTriangle,
  AlertCircle,
  Filter,
  Check,
  RefreshCw,
  Layers,
  History,
  Plus,
  Clock,
  FileText,
  ListTodo,
  User,
  Baby,
  Milk,
  Tag,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";

// Interfaces for Dashboard Livestock Tracking
export interface PoultryBatchDashboard {
  id: string;
  batchNumber: string; // Numéro de lot (ex: "Lot Volaille #B2026-B01")
  ageLabel: string; // Âge (ex: "5 semaines / 35 jours")
  ageDays: number;
  quantity: number; // Quantité (ex: 1500)
  breed: string; // Race / Souche (ex: "Cobb 500 (Chair)")
  location: string; // Emplacement (ex: "Bâtiment A1")
  status: "Démarrage" | "Croissance" | "Finition" | "Prêt à la Vente";
}

export interface PigBatchDashboard {
  id: string;
  batchNumber: string; // Numéro de lot (ex: "Lot Porcs #P-ENG-2026-01")
  ageLabel: string; // Âge (ex: "18 semaines / 126 jours")
  ageWeeks: number;
  quantity: number; // Quantité (ex: 30)
  averageWeightKg: number;
  location: string; // Emplacement (ex: "Porcherie Loge E-01")
  status: "Post-Sevrage" | "Croissance" | "Engraissement" | "Fin de Finition";
}

export interface SowBreedingDashboard {
  id: string;
  sowTag: string; // Numéro de boucle / nom (ex: "Truie T-01")
  lotNumber: string; // Numéro de lot (ex: "Lot Gestation #LOT-GEST-2026-A1")
  breed: string; // Race (ex: "Large White Pure")
  categoryStatus: "Gestante" | "Allaitante" | "Vide" | "Ayant Mis Bas";
  details: string; // Ex: "Terme prévu le 04/08/2026 (J-108 de gestation)"
  penLocation: string;
  lastFarrowingDate?: string;
  litterCount?: number;
}

export interface BoarDashboard {
  id: string;
  idNumber: string; // Numéro d'identification (ex: "N° ID: 2024-VR-DUROC-01")
  nameCode: string; // Nom / Code (ex: "Verrat 'Titan'")
  breed: string; // Race (ex: "Duroc Américain")
  ageLabel: string; // Âge (ex: "26 mois")
  quantity: number; // 1
  servicePen: string; // Emplacement loge (ex: "Loge Verraterie V-01")
  status: "Actif / Saillie" | "Repos" | "Quarantaine";
}

// Default Data Sets for Livestock Tracking
const defaultPoultryBatches: PoultryBatchDashboard[] = [
  {
    id: "poul-1",
    batchNumber: "Lot Volaille #B2026-B01",
    ageLabel: "5 semaines (35 jours)",
    ageDays: 35,
    quantity: 1500,
    breed: "Poulet de Chair Cobb 500",
    location: "Bâtiment Volailles A1",
    status: "Finition",
  },
  {
    id: "poul-2",
    batchNumber: "Lot Volaille #B2026-B02",
    ageLabel: "3 semaines (21 jours)",
    ageDays: 21,
    quantity: 1000,
    breed: "Poulet de Chair Ross 308",
    location: "Bâtiment Volailles A2",
    status: "Croissance",
  },
  {
    id: "poul-3",
    batchNumber: "Lot Volaille #B2026-B03",
    ageLabel: "1 semaine (7 jours)",
    ageDays: 7,
    quantity: 500,
    breed: "Poulet de Chair Cobb 500",
    location: "Poussinère P-01",
    status: "Démarrage",
  },
];

const defaultPigBatches: PigBatchDashboard[] = [
  {
    id: "pig-1",
    batchNumber: "Lot Porcs #P-ENG-2026-01",
    ageLabel: "18 semaines (126 jours)",
    ageWeeks: 18,
    quantity: 30,
    averageWeightKg: 75.0,
    location: "Porcherie Loge E-01",
    status: "Fin de Finition",
  },
  {
    id: "pig-2",
    batchNumber: "Lot Porcs #P-ENG-2026-02",
    ageLabel: "12 semaines (84 jours)",
    ageWeeks: 12,
    quantity: 20,
    averageWeightKg: 38.5,
    location: "Porcherie Loge E-02",
    status: "Croissance",
  },
  {
    id: "pig-3",
    batchNumber: "Lot Porcs #P-PS-2026-03",
    ageLabel: "6 semaines (42 jours)",
    ageWeeks: 6,
    quantity: 15,
    averageWeightKg: 14.2,
    location: "Porcherie Loge PS-01",
    status: "Post-Sevrage",
  },
];

const defaultSowsList: SowBreedingDashboard[] = [
  // Truies Gestantes
  {
    id: "sow-1",
    sowTag: "Truie T-01",
    lotNumber: "Lot Gestation #LOT-GEST-2026-A1",
    breed: "Large White Pure",
    categoryStatus: "Gestante",
    details: "Terme prévu le 04/08/2026 (J-108 de gestation). Échographie OK.",
    penLocation: "Loge Gestation G-01",
  },
  {
    id: "sow-3",
    sowTag: "Truie T-03",
    lotNumber: "Lot Gestation #LOT-GEST-2026-A2",
    breed: "Duroc x Large White",
    categoryStatus: "Gestante",
    details: "Terme prévu le 18/08/2026 (J-94 de gestation). Bon état corporel.",
    penLocation: "Loge Gestation G-03",
  },
  {
    id: "sow-7",
    sowTag: "Truie T-07",
    lotNumber: "Lot Gestation #LOT-GEST-2026-B1",
    breed: "Landrace F1",
    categoryStatus: "Gestante",
    details: "Terme prévu le 02/09/2026 (J-80 de gestation). Saillie contrôlée.",
    penLocation: "Loge Gestation G-04",
  },

  // Truies Allaitantes
  {
    id: "sow-2",
    sowTag: "Truie T-02",
    lotNumber: "Lot Maternité #LOT-MAT-2026-01",
    breed: "Landrace Pure",
    categoryStatus: "Allaitante",
    details: "11 porcelets sous-mère (J-20 d'allaitement). Sevrage proche.",
    penLocation: "Loge Maternité M-01",
    lastFarrowingDate: "2026-07-09",
    litterCount: 11,
  },
  {
    id: "sow-5",
    sowTag: "Truie T-05",
    lotNumber: "Lot Maternité #LOT-MAT-2026-02",
    breed: "Large White x Landrace",
    categoryStatus: "Allaitante",
    details: "12 porcelets sous-mère (J-12 d'allaitement). Très bonne lactation.",
    penLocation: "Loge Maternité M-02",
    lastFarrowingDate: "2026-07-17",
    litterCount: 12,
  },

  // Truies Vides (Non gestantes)
  {
    id: "sow-4",
    sowTag: "Truie T-04",
    lotNumber: "Lot Saillie/Repos #LOT-SAIL-2026-R1",
    breed: "Piétrain x Landrace",
    categoryStatus: "Vide",
    details: "Sevrée le 15/07. En attente de détection des chaleurs pour saillie IA.",
    penLocation: "Loge Verraterie / Attente V-02",
  },
  {
    id: "sow-6",
    sowTag: "Truie T-06",
    lotNumber: "Lot Saillie/Repos #LOT-SAIL-2026-R2",
    breed: "Large White Pure",
    categoryStatus: "Vide",
    details: "Contrôle retour en chaleur négatif J-21. Programmation saillie.",
    penLocation: "Loge Repos R-01",
  },

  // Truies Ayant Mis Bas (Cycle récent)
  {
    id: "sow-8",
    sowTag: "Truie T-08",
    lotNumber: "Lot Maternité #LOT-MAT-2026-03",
    breed: "Large White",
    categoryStatus: "Ayant Mis Bas",
    details: "Mis bas le 28/06/2026 - 13 porcelets nés vivants (sevrés avec succès).",
    penLocation: "Loge Repos R-02",
    lastFarrowingDate: "2026-06-28",
    litterCount: 13,
  },
  {
    id: "sow-9",
    sowTag: "Truie T-09",
    lotNumber: "Lot Maternité #LOT-MAT-2026-04",
    breed: "Duroc",
    categoryStatus: "Ayant Mis Bas",
    details: "Mis bas le 15/06/2026 - 10 porcelets nés vivants (transférés engraissement).",
    penLocation: "Loge Repos R-03",
    lastFarrowingDate: "2026-06-15",
    litterCount: 10,
  },
];

const defaultBoarsList: BoarDashboard[] = [
  {
    id: "boar-1",
    idNumber: "N° ID: 2024-VR-DUROC-01",
    nameCode: "Verrat 'Titan' (Duroc Pure)",
    breed: "Duroc Américain (Conformation Bouchère)",
    ageLabel: "26 mois (2 ans 2 mois)",
    quantity: 1,
    servicePen: "Loge Verraterie V-01",
    status: "Actif / Saillie",
  },
  {
    id: "boar-2",
    idNumber: "N° ID: 2024-VR-LANDRACE-02",
    nameCode: "Verrat 'César' (Landrace Danois)",
    breed: "Landrace Prolifique (Lignée Maternelle)",
    ageLabel: "20 mois (1 an 8 mois)",
    quantity: 1,
    servicePen: "Loge Verraterie V-02",
    status: "Actif / Saillie",
  },
  {
    id: "boar-3",
    idNumber: "N° ID: 2025-VR-PIETRAIN-03",
    nameCode: "Verrat 'Baccus' (Piétrain Belge)",
    breed: "Piétrain Hyper-Musclé (Découpe Noble)",
    ageLabel: "14 mois (1 an 2 mois)",
    quantity: 1,
    servicePen: "Loge Verraterie V-03",
    status: "Actif / Saillie",
  },
  {
    id: "boar-4",
    idNumber: "N° ID: 2025-VR-LW-04",
    nameCode: "Verrat 'Hercule' (Large White)",
    breed: "Large White Grand Reproducteur",
    ageLabel: "12 mois (1 an)",
    quantity: 1,
    servicePen: "Loge Quarantaine Q-01",
    status: "Repos",
  },
];

export interface FeedStockLevelItem {
  id: string;
  name: string; // Ex: "Finition Volaille"
  stockKg: number; // Stock réel en kg (ex: 1200)
  safetyThresholdKg: number; // Seuil de sécurité en kg (ex: 2000)
  criticalThresholdKg: number; // Seuil critique alerte rouge (ex: 1000)
  location: string; // Ex: "Silo Principal - Ferme Volaille"
  autonomyDays: number; // Ex: 3
  dailyConsumptionKg: number; // Ex: 400
  category: "Volaille" | "Porcin" | "Concentré";
}

const defaultFeedStockLevels: FeedStockLevelItem[] = [
  {
    id: "feed-1",
    name: "Finition Volaille",
    stockKg: 1200,
    safetyThresholdKg: 2000,
    criticalThresholdKg: 1000,
    location: "Silo Principal Bâtiment A",
    autonomyDays: 3,
    dailyConsumptionKg: 400,
    category: "Volaille",
  },
  {
    id: "feed-2",
    name: "Démarrage Poussins",
    stockKg: 350,
    safetyThresholdKg: 600,
    criticalThresholdKg: 300,
    location: "Magasin Central Aliments",
    autonomyDays: 4,
    dailyConsumptionKg: 85,
    category: "Volaille",
  },
  {
    id: "feed-3",
    name: "Croissance Volaille",
    stockKg: 3100,
    safetyThresholdKg: 2200,
    criticalThresholdKg: 1200,
    location: "Silo Bâtiment Volailles B",
    autonomyDays: 10,
    dailyConsumptionKg: 310,
    category: "Volaille",
  },
  {
    id: "feed-4",
    name: "Engraissement Porcs",
    stockKg: 2800,
    safetyThresholdKg: 2500,
    criticalThresholdKg: 1500,
    location: "Silo Porcherie Principal",
    autonomyDays: 9,
    dailyConsumptionKg: 310,
    category: "Porcin",
  },
  {
    id: "feed-5",
    name: "Maternité & Lactation",
    stockKg: 450,
    safetyThresholdKg: 800,
    criticalThresholdKg: 400,
    location: "Magasin Porcherie Maternité",
    autonomyDays: 5,
    dailyConsumptionKg: 90,
    category: "Porcin",
  },
  {
    id: "feed-6",
    name: "Concentré Repro Verrats",
    stockKg: 650,
    safetyThresholdKg: 500,
    criticalThresholdKg: 250,
    location: "Verraterie & Loge Repro",
    autonomyDays: 12,
    dailyConsumptionKg: 55,
    category: "Concentré",
  },
];

interface ProductionAlert {
  id: string;
  category: "Aliment" | "Effectif";
  severity: "CRITIQUE" | "ATTENTION" | "SURVEILLANCE";
  title: string;
  currentValue: string;
  thresholdValue: string;
  autonomyOrImpact: string;
  location: string;
  actionText: string;
  targetTab: ActiveTab;
  date: string;
  isResolved?: boolean;
}

const defaultProductionAlerts: ProductionAlert[] = [
  {
    id: "alt-1",
    category: "Aliment",
    severity: "CRITIQUE",
    title: "Stock Aliment Finition Volaille (Silo Bâtiment A)",
    currentValue: "1,2 Tonne (1 200 kg)",
    thresholdValue: "Seuil critique : 2,0 Tonnes",
    autonomyOrImpact: "Autonomie restante : 3 jours (Consommation de 400 kg/jour pour 1 500 sujets)",
    location: "Silo Principal - Ferme Volailles",
    actionText: "Rapprovisionner Maïs/Aliment",
    targetTab: "suppliers_management",
    date: "Aujourd'hui, 08:30",
  },
  {
    id: "alt-2",
    category: "Effectif",
    severity: "CRITIQUE",
    title: "Suroccupation Bâtiment Porcin Engraissement (Loge 3)",
    currentValue: "45 porcs charcutiers",
    thresholdValue: "Capacité max recommandée : 35 porcs",
    autonomyOrImpact: "Suroccupation (+28,5%). Risque de stress thermique et baisse du GMQ",
    location: "Bâtiment Porcin - Loge 3 Engraissement",
    actionText: "Vendre Porcs / Transférer Loge",
    targetTab: "sales",
    date: "Aujourd'hui, 07:15",
  },
  {
    id: "alt-3",
    category: "Aliment",
    severity: "ATTENTION",
    title: "Stock Aliment Démarrage Poussins (Magasin Central)",
    currentValue: "350 kg",
    thresholdValue: "Seuil de réapprovisionnement : 600 kg",
    autonomyOrImpact: "Incapacité de couvrir l'arrivée de la bande #5 de 200 poussins (prévue à J-4)",
    location: "Magasin d'Alimentation",
    actionText: "Ajuster Formule Alimentaire",
    targetTab: "feedmode",
    date: "Hier, 16:45",
  },
  {
    id: "alt-4",
    category: "Effectif",
    severity: "ATTENTION",
    title: "Capacité Maternité Porcine & Loges Allaitement",
    currentValue: "2 loges libres / 10",
    thresholdValue: "Seuil d'alerte : ≤ 2 loges disponibles",
    autonomyOrImpact: "2 truies gestantes (T-04, T-07) à J-112. Mises bas imminentes sous 48h-72h",
    location: "Maternité Porcine - Bloc Allaitement",
    actionText: "Préparer & Désinfecter Loges",
    targetTab: "reproduction_maternity",
    date: "Aujourd'hui, 09:10",
  },
  {
    id: "alt-5",
    category: "Effectif",
    severity: "SURVEILLANCE",
    title: "Taux de Mortalité Anormale - Bande Volaille #4",
    currentValue: "2,8% de pertes (14 sujets)",
    thresholdValue: "Seuil d'alerte sanitaire : 3,0%",
    autonomyOrImpact: "Légère hausse suite au pic de chaleur d'hier après-midi",
    location: "Bâtiment Volailles B",
    actionText: "Consulter Suivi Vétérinaire",
    targetTab: "tasks_health",
    date: "Hier, 11:00",
  },
];

interface ActionLogItem {
  id: string;
  time: string;
  category: "Alimentation" | "Vaccination" | "Pesée" | "Vente" | "Sanitaire" | "Stock";
  action: string;
  details: string;
  operator: string;
  badgeBg: string;
  badgeText: string;
}

const defaultActionLogs: ActionLogItem[] = [
  {
    id: "log-1",
    time: "Aujourd'hui, 08:30",
    category: "Vaccination",
    action: "Vaccination Faite",
    details: "Injection du vaccin Gumboro Intermédiaire (Dose 1) réalisée sur le Lot Volailles #B2026-B05 (1 000 poussins)",
    operator: "Dr. Kouassi (Vétérinaire)",
    badgeBg: "bg-rose-100 border-rose-300",
    badgeText: "text-rose-800",
  },
  {
    id: "log-2",
    time: "Aujourd'hui, 07:15",
    category: "Alimentation",
    action: "Aliment Ajouté",
    details: "Chargement de 15 sacs (750 kg) d'Aliment Finition Volaille dans la mangeoire Bâtiment A",
    operator: "Yao (Technicien Volaille)",
    badgeBg: "bg-emerald-100 border-emerald-300",
    badgeText: "text-emerald-800",
  },
  {
    id: "log-3",
    time: "Hier, 16:40",
    category: "Stock",
    action: "Stock Reçu",
    details: "Livraison de 50 sacs d'Aliment Porc Engraissement (2 500 kg) enregistrée en magasin central",
    operator: "Koffi (Gestionnaire Stock)",
    badgeBg: "bg-amber-100 border-amber-300",
    badgeText: "text-amber-800",
  },
  {
    id: "log-4",
    time: "Hier, 11:20",
    category: "Pesée",
    action: "Pesée Effectuée",
    details: "Pesée de contrôle sur 30 sujets du Lot Porcs #P02. Poids moyen calculé : 24,8 kg (Gain +450g/j)",
    operator: "Yao (Technicien Porcin)",
    badgeBg: "bg-blue-100 border-blue-300",
    badgeText: "text-blue-800",
  },
  {
    id: "log-5",
    time: "25/07, 14:00",
    category: "Vente",
    action: "Vente Réalisée",
    details: "Expédition de 120 poulets prêts à cuire à l'Acheteur Supermarché Abidjan (Facture #FAC-2026-089)",
    operator: "Amoin (Responsable Ventes)",
    badgeBg: "bg-purple-100 border-purple-300",
    badgeText: "text-purple-800",
  },
];

interface DashboardViewProps {
  unitCosts: UnitCosts;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  unitCosts,
  setActiveTab,
}) => {
  const [alerts, setAlerts] = useState<ProductionAlert[]>(defaultProductionAlerts);
  const [alertFilter, setAlertFilter] = useState<"all" | "Aliment" | "Effectif" | "CRITIQUE">("all");

  // --- FEED STOCKS REAL-TIME LEVEL STATE & FILTER ---
  const [feedStockLevels, setFeedStockLevels] = useState<FeedStockLevelItem[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_feed_stock_levels");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultFeedStockLevels;
  });
  const [feedStockFilter, setFeedStockFilter] = useState<"all" | "Volaille" | "Porcin" | "CRITIQUE">("all");

  // --- LIVESTOCK CENSUS TRACKING STATE ---
  const [poultryBatches, setPoultryBatches] = useState<PoultryBatchDashboard[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_poultry_batches");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultPoultryBatches;
  });

  const [pigBatches, setPigBatches] = useState<PigBatchDashboard[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_pig_batches");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultPigBatches;
  });

  const [sowsList, setSowsList] = useState<SowBreedingDashboard[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_sows_list");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultSowsList;
  });

  const [boarsList, setBoarsList] = useState<BoarDashboard[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_boars_list");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultBoarsList;
  });

  // Active Sub-Tab for Livestock Section
  const [livestockSubTab, setLivestockSubTab] = useState<"volaille" | "porc_lot" | "truies" | "verrats">("volaille");

  // Add Item Modal
  const [isAddLivestockModalOpen, setIsAddLivestockModalOpen] = useState(false);
  const [addLivestockType, setAddLivestockType] = useState<"volaille" | "porc_lot" | "truie" | "verrat">("volaille");

  // Form State
  const [formBatchNum, setFormBatchNum] = useState("");
  const [formAgeLabel, setFormAgeLabel] = useState("");
  const [formQty, setFormQty] = useState<number>(100);
  const [formBreed, setFormBreed] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSowStatus, setFormSowStatus] = useState<"Gestante" | "Allaitante" | "Vide" | "Ayant Mis Bas">("Gestante");
  const [formDetails, setFormDetails] = useState("");
  const [formBoarId, setFormBoarId] = useState("");
  const [formBoarName, setFormBoarName] = useState("");

  const handleAddLivestockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (addLivestockType === "volaille") {
      const newItem: PoultryBatchDashboard = {
        id: `poul-${Date.now()}`,
        batchNumber: formBatchNum.trim() || `Lot Volaille #B2026-B0${poultryBatches.length + 1}`,
        ageLabel: formAgeLabel.trim() || "3 semaines (21 jours)",
        ageDays: 21,
        quantity: formQty > 0 ? formQty : 500,
        breed: formBreed.trim() || "Cobb 500",
        location: formLocation.trim() || "Bâtiment A1",
        status: "Croissance",
      };
      const updated = [...poultryBatches, newItem];
      setPoultryBatches(updated);
      localStorage.setItem("dashboard_poultry_batches", JSON.stringify(updated));
    } else if (addLivestockType === "porc_lot") {
      const newItem: PigBatchDashboard = {
        id: `pig-${Date.now()}`,
        batchNumber: formBatchNum.trim() || `Lot Porcs #P-ENG-2026-0${pigBatches.length + 1}`,
        ageLabel: formAgeLabel.trim() || "12 semaines (84 jours)",
        ageWeeks: 12,
        quantity: formQty > 0 ? formQty : 20,
        averageWeightKg: 35.0,
        location: formLocation.trim() || "Porcherie Loge E-03",
        status: "Engraissement",
      };
      const updated = [...pigBatches, newItem];
      setPigBatches(updated);
      localStorage.setItem("dashboard_pig_batches", JSON.stringify(updated));
    } else if (addLivestockType === "truie") {
      const newItem: SowBreedingDashboard = {
        id: `sow-${Date.now()}`,
        sowTag: formBatchNum.trim() || `Truie T-0${sowsList.length + 1}`,
        lotNumber: `Lot #LOT-TR-2026-0${sowsList.length + 1}`,
        breed: formBreed.trim() || "Large White Pure",
        categoryStatus: formSowStatus,
        details: formDetails.trim() || "Ajoutée au registre de suivi.",
        penLocation: formLocation.trim() || "Loge Maternité / Gestation",
      };
      const updated = [...sowsList, newItem];
      setSowsList(updated);
      localStorage.setItem("dashboard_sows_list", JSON.stringify(updated));
    } else if (addLivestockType === "verrat") {
      const newItem: BoarDashboard = {
        id: `boar-${Date.now()}`,
        idNumber: formBoarId.trim() || `N° ID: 2026-VR-0${boarsList.length + 1}`,
        nameCode: formBoarName.trim() || `Verrat Reproducteur 0${boarsList.length + 1}`,
        breed: formBreed.trim() || "Duroc Pure",
        ageLabel: formAgeLabel.trim() || "18 mois",
        quantity: 1,
        servicePen: formLocation.trim() || "Loge Verraterie V-04",
        status: "Actif / Saillie",
      };
      const updated = [...boarsList, newItem];
      setBoarsList(updated);
      localStorage.setItem("dashboard_boars_list", JSON.stringify(updated));
    }

    setIsAddLivestockModalOpen(false);
    setFormBatchNum("");
    setFormAgeLabel("");
    setFormQty(100);
    setFormBreed("");
    setFormLocation("");
    setFormDetails("");
    setFormBoarId("");
    setFormBoarName("");
  };

  const handleDeletePoultryBatch = (id: string) => {
    const updated = poultryBatches.filter((item) => item.id !== id);
    setPoultryBatches(updated);
    localStorage.setItem("dashboard_poultry_batches", JSON.stringify(updated));
  };

  const handleDeletePigBatch = (id: string) => {
    const updated = pigBatches.filter((item) => item.id !== id);
    setPigBatches(updated);
    localStorage.setItem("dashboard_pig_batches", JSON.stringify(updated));
  };

  const handleDeleteSow = (id: string) => {
    const updated = sowsList.filter((item) => item.id !== id);
    setSowsList(updated);
    localStorage.setItem("dashboard_sows_list", JSON.stringify(updated));
  };

  const handleDeleteBoar = (id: string) => {
    const updated = boarsList.filter((item) => item.id !== id);
    setBoarsList(updated);
    localStorage.setItem("dashboard_boars_list", JSON.stringify(updated));
  };

  // Calculations for totals
  const totalPoultryHeadCount = poultryBatches.reduce((acc, b) => acc + b.quantity, 0);
  const totalPigBatchesHeadCount = pigBatches.reduce((acc, b) => acc + b.quantity, 0);
  const totalSowsHeadCount = sowsList.length;
  const totalBoarsHeadCount = boarsList.length;
  const totalSucklingPigletsCount = sowsList.reduce((acc, s) => acc + (s.litterCount || 0), 0);
  const totalPigsHeadCount = totalPigBatchesHeadCount + totalSowsHeadCount + totalBoarsHeadCount + totalSucklingPigletsCount;

  // Categorized Sow groups
  const pregnantSowsList = sowsList.filter((s) => s.categoryStatus === "Gestante");
  const lactatingSowsList = sowsList.filter((s) => s.categoryStatus === "Allaitante");
  const emptySowsList = sowsList.filter((s) => s.categoryStatus === "Vide");
  const farrowedSowsList = sowsList.filter((s) => s.categoryStatus === "Ayant Mis Bas" || s.lastFarrowingDate);

  // Action Audit Trail Log State
  const [actionLogs, setActionLogs] = useState<ActionLogItem[]>(defaultActionLogs);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [newLogCategory, setNewLogCategory] = useState<ActionLogItem["category"]>("Alimentation");
  const [newLogAction, setNewLogAction] = useState("Aliment Ajouté");
  const [newLogDetails, setNewLogDetails] = useState("");
  const [newLogOperator, setNewLogOperator] = useState("Technicien de Garde");

  const handleAddActionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogAction.trim() || !newLogDetails.trim()) return;

    const categoryStyles: Record<ActionLogItem["category"], { bg: string; text: string }> = {
      Alimentation: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800" },
      Vaccination: { bg: "bg-rose-100 border-rose-300", text: "text-rose-800" },
      Pesée: { bg: "bg-blue-100 border-blue-300", text: "text-blue-800" },
      Vente: { bg: "bg-purple-100 border-purple-300", text: "text-purple-800" },
      Sanitaire: { bg: "bg-amber-100 border-amber-300", text: "text-amber-800" },
      Stock: { bg: "bg-slate-100 border-slate-300", text: "text-slate-800" },
    };

    const nowStr = `Aujourd'hui, ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    const newLogItem: ActionLogItem = {
      id: `log-${Date.now()}`,
      time: nowStr,
      category: newLogCategory,
      action: newLogAction,
      details: newLogDetails,
      operator: newLogOperator,
      badgeBg: categoryStyles[newLogCategory]?.bg || "bg-amber-100 border-amber-300",
      badgeText: categoryStyles[newLogCategory]?.text || "text-amber-800",
    };

    // Save offline & IndexedDB
    saveOfflineEntry("health_task", newLogAction, {
      category: newLogCategory,
      details: newLogDetails,
      operator: newLogOperator,
      timestamp: new Date().toISOString(),
    });

    const updated = [newLogItem, ...actionLogs];
    setActionLogs(updated);
    try {
      localStorage.setItem("dashboard_action_logs", JSON.stringify(updated));
    } catch (err) {}

    setIsAddLogModalOpen(false);
    setNewLogDetails("");
  };

  // Top 3 KPIs Customization State
  const [selectedTopKpis, setSelectedTopKpis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_top_3_kpis");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved KPIs", e);
    }
    return ["ca_2027", "net_profit_2027", "startup_inv"];
  });
  const [isKpiSelectorOpen, setIsKpiSelectorOpen] = useState(false);

  const startupInvestment = getStartupInvestmentMois1(unitCosts);
  const monthlyData = getMonthlyInitialPhaseData(unitCosts);
  const yearlyData = getYearlyProjectionsData(unitCosts);
  const savings = getBuildingRentSavings(unitCosts);

  const currentYearData = yearlyData[0]; // 2027
  const finalYearData = yearlyData[4]; // 2031
  const margin2027 = (currentYearData.beneficeNet / currentYearData.caTotal) * 100;

  // Catalog of Available KPIs
  const kpiCatalog = [
    {
      id: "startup_inv",
      title: "Investissement Démarrage (M1)",
      value: formatFCFA(startupInvestment.totalFCFA),
      subtext: `150 poulets, ${startupInvestment.avanceBatimentAvicole > 0 ? "avance bâtiment" : "bâtiment acquis (0 FCFA avance)"}, aliment & litière`,
      icon: DollarSign,
      colorBg: "bg-amber-100",
      colorText: "text-amber-700",
      valueColor: "text-slate-900",
      category: "Investissement",
    },
    {
      id: "ca_2027",
      title: "Chiffre d'Affaires 2027",
      value: formatFCFA(currentYearData.caTotal),
      subtext: `Avicole: ${formatFCFA(currentYearData.caAvicole)} | Porcin: ${formatFCFA(currentYearData.caPorcin)}`,
      icon: TrendingUp,
      colorBg: "bg-emerald-100",
      colorText: "text-emerald-700",
      valueColor: "text-emerald-700",
      category: "Ventes",
    },
    {
      id: "net_profit_2027",
      title: "Bénéfice Net 2027",
      value: formatFCFA(currentYearData.beneficeNet),
      subtext: `Taux de Marge Nette : ${formatPercent(margin2027)}`,
      icon: CheckCircle2,
      colorBg: "bg-teal-100",
      colorText: "text-teal-700",
      valueColor: "text-teal-700",
      category: "Profit",
    },
    {
      id: "net_margin_2027",
      title: "Taux de Marge Nette 2027",
      value: formatPercent(margin2027),
      subtext: `Ratio Bénéfice Net / Chiffre d'Affaires Global`,
      icon: TrendingUp,
      colorBg: "bg-indigo-100",
      colorText: "text-indigo-700",
      valueColor: "text-indigo-800",
      category: "Profit",
    },
    {
      id: "projected_2031",
      title: "Capacité Projetée 2031",
      value: formatFCFA(finalYearData.beneficeNet),
      subtext: "Bénéfice annuel projeté en régime de croisière (An 5)",
      icon: PiggyBank,
      colorBg: "bg-purple-100",
      colorText: "text-purple-700",
      valueColor: "text-purple-900",
      category: "Projection",
    },
    {
      id: "rent_saved",
      title: "Économie Bâtiments / An",
      value: formatFCFA(savings.totalYearlyRentSaved),
      subtext: `${formatFCFA(savings.totalMonthlyRentSaved)} / mois de charges évitées`,
      icon: Building,
      colorBg: "bg-blue-100",
      colorText: "text-blue-700",
      valueColor: "text-blue-900",
      category: "Patrimoine",
    },
    {
      id: "poultry_ca_2027",
      title: "CA Aviculture (Chair) 2027",
      value: formatFCFA(currentYearData.caAvicole),
      subtext: "Trésorerie rapide (rotations tous les 10 jours)",
      icon: Egg,
      colorBg: "bg-amber-100",
      colorText: "text-amber-800",
      valueColor: "text-amber-900",
      category: "Aviculture",
    },
    {
      id: "pork_ca_2027",
      title: "CA Porciculture 2027",
      value: formatFCFA(currentYearData.caPorcin),
      subtext: "Engraissement & haute valeur ajoutée",
      icon: PiggyBank,
      colorBg: "bg-rose-100",
      colorText: "text-rose-700",
      valueColor: "text-rose-900",
      category: "Porciculture",
    },
    {
      id: "live_poultry_headcount",
      title: "Total Volailles (Temps Réel)",
      value: `${totalPoultryHeadCount.toLocaleString("fr-FR")} sujets`,
      subtext: `${poultryBatches.length} lots actifs en élevage`,
      icon: Egg,
      colorBg: "bg-amber-100",
      colorText: "text-amber-800",
      valueColor: "text-amber-900",
      category: "Inventaire Vivant",
    },
    {
      id: "live_pig_headcount",
      title: "Total Porcin (Temps Réel)",
      value: `${totalPigsHeadCount.toLocaleString("fr-FR")} têtes`,
      subtext: `${totalPigBatchesHeadCount} engraissement, ${totalSowsHeadCount} truies, ${totalBoarsHeadCount} verrats, ${totalSucklingPigletsCount} porcelets`,
      icon: PiggyBank,
      colorBg: "bg-pink-100",
      colorText: "text-pink-800",
      valueColor: "text-pink-900",
      category: "Inventaire Vivant",
    },
    {
      id: "live_sow_status",
      title: "Ventilation Truies",
      value: `${totalSowsHeadCount} truies`,
      subtext: `${pregnantSowsList.length} gest., ${lactatingSowsList.length} allai., ${emptySowsList.length} vides, ${farrowedSowsList.length} mis bas`,
      icon: Milk,
      colorBg: "bg-purple-100",
      colorText: "text-purple-800",
      valueColor: "text-purple-900",
      category: "Inventaire Vivant",
    },
    {
      id: "live_boars_inventory",
      title: "Inventaire Verrats ID",
      value: `${totalBoarsHeadCount} verrats`,
      subtext: `${boarsList.filter(b => b.status.includes("Actif")).length} actifs / saillie, identifiés par N° lot/ID`,
      icon: Award,
      colorBg: "bg-blue-100",
      colorText: "text-blue-800",
      valueColor: "text-blue-900",
      category: "Inventaire Vivant",
    },
  ];

  const handleToggleKpiSelection = (id: string) => {
    if (selectedTopKpis.includes(id)) {
      if (selectedTopKpis.length <= 1) return; // Keep at least 1
      const updated = selectedTopKpis.filter((k) => k !== id);
      setSelectedTopKpis(updated);
      localStorage.setItem("dashboard_top_3_kpis", JSON.stringify(updated));
    } else {
      if (selectedTopKpis.length >= 3) {
        // Replace last element to keep exactly 3
        const updated = [selectedTopKpis[0], selectedTopKpis[1], id];
        setSelectedTopKpis(updated);
        localStorage.setItem("dashboard_top_3_kpis", JSON.stringify(updated));
      } else {
        const updated = [...selectedTopKpis, id];
        setSelectedTopKpis(updated);
        localStorage.setItem("dashboard_top_3_kpis", JSON.stringify(updated));
      }
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (a.isResolved) return false;
    if (alertFilter === "all") return true;
    if (alertFilter === "CRITIQUE") return a.severity === "CRITIQUE";
    return a.category === alertFilter;
  });

  const criticalCount = alerts.filter((a) => !a.isResolved && a.severity === "CRITIQUE").length;

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a)));
  };

  // Chart data for monthly evolution
  const monthlyChartData = monthlyData.map((m) => ({
    name: `${m.monthName}`,
    "CA Avicole": m.caAvicole,
    "Bénéfice Net": m.beneficeNet,
    "Coûts": m.coutTotal,
  }));

  // Chart data for 5 year growth
  const yearChartData = yearlyData.map((y) => ({
    year: y.year,
    "CA Avicole": y.caAvicole,
    "CA Porcin": y.caPorcin,
    "Bénéfice Net": y.beneficeNet,
  }));

  return (
    <div className="space-y-6">
      {/* Banner / Strategic Mission */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Egg className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Synergie Agro-Pastorale Intégrée</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Synthèse Exécutive Ivoire Élevage
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Exploitation combinant la trésorerie immédiate de l'aviculture de chair
            (rotation tous les 10 jours) et la haute valeur ajoutée de l'élevage porcin
            (engraissement initial suivi d'un cycle complet de reproduction).
          </p>
        </div>
      </div>

      {/* Building Acquisition Savings Status Banner */}
      {(savings.isAvicoleAcquired || savings.isPorcinAcquired) && (
        <div className="bg-emerald-900 text-emerald-100 rounded-xl p-4 border border-emerald-700 flex items-center justify-between flex-wrap gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-800 rounded-lg text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                Mode Bâtiments Acquis Actif : Charges de Location Déduites !
              </div>
              <div className="text-xs text-emerald-200">
                {savings.isAvicoleAcquired && savings.isPorcinAcquired
                  ? "Bâtiments avicoles & porcins acquis en propre."
                  : savings.isAvicoleAcquired
                  ? "Bâtiment avicole acquis en propre."
                  : "Porcherie d'engraissement acquise en propre."}{" "}
                Économie de <strong>{formatFCFA(savings.totalYearlyRentSaved)} / an</strong> sur les charges de structure ({formatFCFA(savings.totalMonthlyRentSaved)} / mois)
                {savings.startupAdvanceSaved > 0 && ` + ${formatFCFA(savings.startupAdvanceSaved)} économisés au démarrage`}.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("hrinfra")}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Gérer les bâtiments
          </button>
        </div>
      )}

      {/* TOP 3 CUSTOMIZABLE KPI CARDS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              📊 Vos 3 Indicateurs Clés de Performance (KPIs)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              Sauvegardés
            </span>
          </div>

          <button
            onClick={() => setIsKpiSelectorOpen(true)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Personnaliser les 3 KPIs Top</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {selectedTopKpis.map((kpiId) => {
            const kpi = kpiCatalog.find((item) => item.id === kpiId) || kpiCatalog[0];
            const IconComponent = kpi.icon;

            return (
              <div
                key={kpi.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-emerald-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      {kpi.title}
                    </span>
                    <div className={`p-2.5 ${kpi.colorBg} ${kpi.colorText} rounded-xl`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>
                  <div className={`text-2xl font-extrabold ${kpi.valueColor}`}>
                    {kpi.value}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {kpi.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION CHEPTEL & EFFECTIFS ANIMAUX EN TEMPS RÉEL (VOLAILLES & PORCINS) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        {/* Header & Main Totals Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                Inventaire Vivant
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Cheptel & Effectifs Animaux en Temps Réel</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Vue complète des lots de volailles, porcs d'engraissement, et reproducteurs porcins (truies & verrats).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Badge Total Volaille */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-2xs">
              <div className="p-2 bg-amber-500 text-white rounded-lg">
                <Egg className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Total Volaille</div>
                <div className="text-lg font-black text-amber-950">
                  {totalPoultryHeadCount.toLocaleString("fr-FR")} <span className="text-xs font-semibold text-amber-800">sujets ({poultryBatches.length} lots)</span>
                </div>
              </div>
            </div>

            {/* Badge Total Porcs */}
            <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-2xs">
              <div className="p-2 bg-pink-600 text-white rounded-lg">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-pink-800 font-bold uppercase tracking-wider">Total Porcin</div>
                <div className="text-lg font-black text-pink-950">
                  {totalPigsHeadCount.toLocaleString("fr-FR")} <span className="text-xs font-semibold text-pink-800">têtes au total</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAddLivestockType(
                  livestockSubTab === "volaille"
                    ? "volaille"
                    : livestockSubTab === "porc_lot"
                    ? "porc_lot"
                    : livestockSubTab === "truies"
                    ? "truie"
                    : "verrat"
                );
                setIsAddLivestockModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Effectif / Lot</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-100 overflow-x-auto pb-2">
          <button
            onClick={() => setLivestockSubTab("volaille")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              livestockSubTab === "volaille"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Egg className="w-4 h-4" />
            <span>🐔 Volailles (Par Lot) — {poultryBatches.length} Lots ({totalPoultryHeadCount} sujets)</span>
          </button>

          <button
            onClick={() => setLivestockSubTab("porc_lot")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              livestockSubTab === "porc_lot"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>🐖 Porcs d'Engraissement — {pigBatches.length} Lots ({totalPigBatchesHeadCount} têtes)</span>
          </button>

          <button
            onClick={() => setLivestockSubTab("truies")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              livestockSubTab === "truies"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>🐷 Truies Reproductrices — {sowsList.length} Truies</span>
          </button>

          <button
            onClick={() => setLivestockSubTab("verrats")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              livestockSubTab === "verrats"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>🐗 Verrats Reproducteurs — {boarsList.length} Verrats</span>
          </button>
        </div>

        {/* TAB 1: VOLAILLES BY LOT */}
        {livestockSubTab === "volaille" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-extrabold uppercase tracking-wider">
                    <th className="p-3">Numéro de Lot</th>
                    <th className="p-3">Race / Souche</th>
                    <th className="p-3">Âge du Lot</th>
                    <th className="p-3">Quantité (Sujets)</th>
                    <th className="p-3">Emplacement</th>
                    <th className="p-3">Statut Phase</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {poultryBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3 font-black text-amber-900 flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>{batch.batchNumber}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{batch.breed}</td>
                      <td className="p-3 font-extrabold text-slate-900 bg-amber-100/50 rounded-lg inline-block my-1.5 px-2 py-0.5">
                        {batch.ageLabel}
                      </td>
                      <td className="p-3 font-black text-amber-800 text-sm">
                        {batch.quantity.toLocaleString("fr-FR")} têtes
                      </td>
                      <td className="p-3 font-medium text-slate-600">{batch.location}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {batch.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeletePoultryBatch(batch.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer ce lot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {poultryBatches.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Aucun lot de volaille enregistré. Cliquez sur "Ajouter un Effectif / Lot" ci-dessus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PORCS D'ENGRAISSEMENT BY LOT */}
        {livestockSubTab === "porc_lot" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-extrabold uppercase tracking-wider">
                    <th className="p-3">Numéro de Lot</th>
                    <th className="p-3">Âge du Lot</th>
                    <th className="p-3">Quantité (Têtes)</th>
                    <th className="p-3">Poids Moyen Est.</th>
                    <th className="p-3">Emplacement Loge</th>
                    <th className="p-3">Statut Phase</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {pigBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-pink-50/40 transition-colors">
                      <td className="p-3 font-black text-pink-900 flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-pink-600" />
                        <span>{batch.batchNumber}</span>
                      </td>
                      <td className="p-3 font-extrabold text-slate-900 bg-pink-100/50 rounded-lg inline-block my-1.5 px-2 py-0.5">
                        {batch.ageLabel}
                      </td>
                      <td className="p-3 font-black text-pink-800 text-sm">
                        {batch.quantity.toLocaleString("fr-FR")} têtes
                      </td>
                      <td className="p-3 font-bold text-slate-700">{batch.averageWeightKg} kg / sujet</td>
                      <td className="p-3 font-medium text-slate-600">{batch.location}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-100 text-pink-800 border border-pink-200">
                          {batch.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeletePigBatch(batch.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer ce lot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pigBatches.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Aucun lot porcin enregistré. Cliquez sur "Ajouter un Effectif / Lot" ci-dessus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TRUIES REPRODUCTRICES (PAR CATÉGORIE ET NUMÉRO DE LOT) */}
        {livestockSubTab === "truies" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Truies Gestantes */}
              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-purple-600 text-white rounded-lg text-xs font-bold">🤰</span>
                    <div>
                      <h4 className="text-sm font-black text-purple-950">Truies Gestantes</h4>
                      <p className="text-[11px] text-purple-700">Identifiées par leur numéro de lot / boucle</p>
                    </div>
                  </div>
                  <span className="bg-purple-200 text-purple-900 font-black text-xs px-2.5 py-1 rounded-full">
                    {pregnantSowsList.length} Truies
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pregnantSowsList.map((sow) => (
                    <div key={sow.id} className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-purple-600" />
                          {sow.sowTag} ({sow.lotNumber})
                        </span>
                        <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {sow.breed}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{sow.details}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Emplacement: <strong>{sow.penLocation}</strong></span>
                        <button
                          onClick={() => handleDeleteSow(sow.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pregnantSowsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2 text-center">Aucune truie gestante répertoriée.</p>
                  )}
                </div>
              </div>

              {/* 2. Truies Allaitantes */}
              <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-pink-200/60 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-pink-600 text-white rounded-lg text-xs font-bold">🍼</span>
                    <div>
                      <h4 className="text-sm font-black text-pink-950">Truies Allaitantes</h4>
                      <p className="text-[11px] text-pink-700">En maternité avec portée sous-mère</p>
                    </div>
                  </div>
                  <span className="bg-pink-200 text-pink-900 font-black text-xs px-2.5 py-1 rounded-full">
                    {lactatingSowsList.length} Truies
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lactatingSowsList.map((sow) => (
                    <div key={sow.id} className="bg-white p-3 rounded-xl border border-pink-100 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-pink-950 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-pink-600" />
                          {sow.sowTag} ({sow.lotNumber})
                        </span>
                        <span className="text-[10px] font-extrabold bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                          {sow.breed}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{sow.details}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Emplacement: <strong>{sow.penLocation}</strong></span>
                        <button
                          onClick={() => handleDeleteSow(sow.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {lactatingSowsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2 text-center">Aucune truie allaitante répertoriée.</p>
                  )}
                </div>
              </div>

              {/* 3. Truies Vides / Non Gestantes */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-amber-600 text-white rounded-lg text-xs font-bold">⭕</span>
                    <div>
                      <h4 className="text-sm font-black text-amber-950">Truies Vides (Non Gestantes)</h4>
                      <p className="text-[11px] text-amber-700">En attente de saillie ou détection de chaleur</p>
                    </div>
                  </div>
                  <span className="bg-amber-200 text-amber-900 font-black text-xs px-2.5 py-1 rounded-full">
                    {emptySowsList.length} Truies
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {emptySowsList.map((sow) => (
                    <div key={sow.id} className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-amber-600" />
                          {sow.sowTag} ({sow.lotNumber})
                        </span>
                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {sow.breed}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{sow.details}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Emplacement: <strong>{sow.penLocation}</strong></span>
                        <button
                          onClick={() => handleDeleteSow(sow.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {emptySowsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2 text-center">Aucune truie vide répertoriée.</p>
                  )}
                </div>
              </div>

              {/* 4. Truies Ayant Mis Bas */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">🐣</span>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">Truies Ayant Mis Bas (Historique Récent)</h4>
                      <p className="text-[11px] text-emerald-700">Identifiées avec leur numéro de lot & historique de mise bas</p>
                    </div>
                  </div>
                  <span className="bg-emerald-200 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-full">
                    {farrowedSowsList.length} Truies
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {farrowedSowsList.map((sow) => (
                    <div key={sow.id} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          {sow.sowTag} ({sow.lotNumber})
                        </span>
                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {sow.breed}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{sow.details}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Emplacement: <strong>{sow.penLocation}</strong></span>
                        <button
                          onClick={() => handleDeleteSow(sow.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {farrowedSowsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2 text-center">Aucune mise bas récente répertoriée.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VERRATS REPRODUCTEURS (IDENTIFIÉS PAR LEUR NUMÉRO D'IDENTIFICATION) */}
        {livestockSubTab === "verrats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {boarsList.map((boar) => (
                <div key={boar.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-blue-300 transition-all shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-black px-2.5 py-1 rounded-lg inline-block mb-1">
                        {boar.idNumber}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{boar.nameCode}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteBoar(boar.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                      title="Supprimer ce verrat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">Race:</span>
                      <span className="font-bold text-slate-900">{boar.breed}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">Âge:</span>
                      <span className="font-bold text-slate-900">{boar.ageLabel}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">Emplacement Loge:</span>
                      <span className="font-bold text-slate-900">{boar.servicePen}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Statut Reproducteur:</span>
                      <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {boar.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {boarsList.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  Aucun verrat reproducteur enregistré. Cliquez sur "Ajouter un Effectif / Lot" ci-dessus.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL TO ADD A NEW LIVESTOCK ITEM OR BATCH */}
      {isAddLivestockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <span>Ajouter un Effectif / Lot au Cheptel</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Saisissez les informations du lot ou reproducteur à inscrire au tableau de bord.
                </p>
              </div>
              <button
                onClick={() => setIsAddLivestockModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 font-black rounded-xl hover:bg-slate-100 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLivestockItem} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Catégorie d'Animaux</label>
                <select
                  value={addLivestockType}
                  onChange={(e) => setAddLivestockType(e.target.value as any)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                >
                  <option value="volaille">🐔 Lot Volaille (Poulet de chair)</option>
                  <option value="porc_lot">🐖 Lot Porcins d'Engraissement</option>
                  <option value="truie">🐷 Truie Reproductrice (Gestante, Allaitante, Vide, Ayant mis bas)</option>
                  <option value="verrat">🐗 Verrat Reproducteur (Identifié par N° ID)</option>
                </select>
              </div>

              {/* Fields for Poultry or Pig Lot */}
              {(addLivestockType === "volaille" || addLivestockType === "porc_lot" || addLivestockType === "truie") && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {addLivestockType === "truie" ? "Numéro de Boucle / Nom Truie" : "Numéro de Lot"}
                  </label>
                  <input
                    type="text"
                    value={formBatchNum}
                    onChange={(e) => setFormBatchNum(e.target.value)}
                    placeholder={
                      addLivestockType === "volaille"
                        ? "ex: Lot Volaille #B2026-B04"
                        : addLivestockType === "porc_lot"
                        ? "ex: Lot Porcs #P-ENG-2026-04"
                        : "ex: Truie T-12 (Lot #LOT-TR-2026-05)"
                    }
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              )}

              {/* Fields for Verrat */}
              {addLivestockType === "verrat" && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Numéro d'Identification Verrat</label>
                    <input
                      type="text"
                      value={formBoarId}
                      onChange={(e) => setFormBoarId(e.target.value)}
                      placeholder="ex: N° ID: 2026-VR-DUROC-05"
                      className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Nom / Code Verrat</label>
                    <input
                      type="text"
                      value={formBoarName}
                      onChange={(e) => setFormBoarName(e.target.value)}
                      placeholder="ex: Verrat 'Ares' (Landrace)"
                      className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </>
              )}

              {/* Status Selector for Truie */}
              {addLivestockType === "truie" && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Statut de la Truie</label>
                  <select
                    value={formSowStatus}
                    onChange={(e) => setFormSowStatus(e.target.value as any)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  >
                    <option value="Gestante">🤰 Gestante</option>
                    <option value="Allaitante">🍼 Allaitante</option>
                    <option value="Vide">⭕ Vide (Non gestante / En attente saillie)</option>
                    <option value="Ayant Mis Bas">🐣 Ayant Mis Bas (Cycle récent)</option>
                  </select>
                </div>
              )}

              {/* Quantity Field */}
              {(addLivestockType === "volaille" || addLivestockType === "porc_lot") && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Quantité (Effectif Têtes)</label>
                  <input
                    type="number"
                    value={formQty}
                    onChange={(e) => setFormQty(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              )}

              {/* Age Label */}
              {addLivestockType !== "truie" && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Âge</label>
                  <input
                    type="text"
                    value={formAgeLabel}
                    onChange={(e) => setFormAgeLabel(e.target.value)}
                    placeholder="ex: 4 semaines (28 jours) ou 18 mois"
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Race / Breed */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Race / Souche</label>
                <input
                  type="text"
                  value={formBreed}
                  onChange={(e) => setFormBreed(e.target.value)}
                  placeholder="ex: Cobb 500 / Large White / Duroc"
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Emplacement Bâtiment / Loge</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="ex: Bâtiment A1 / Loge Engraissement E-02 / Maternité M-01"
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Details for Truie */}
              {addLivestockType === "truie" && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Détails / Notes Suivi</label>
                  <textarea
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="ex: Terme prévu le 12/08/2026. 12 porcelets vivants."
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLivestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPI SELECTION MODAL */}
      {isKpiSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <span>Sélectionner vos 3 KPIs Majeurs</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Choisissez exactement 3 indicateurs prioritaires à afficher en tête de tableau de bord.
                </p>
              </div>
              <button
                onClick={() => setIsKpiSelectorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 font-black rounded-xl hover:bg-slate-100 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {kpiCatalog.map((kpi) => {
                const isSelected = selectedTopKpis.includes(kpi.id);
                const IconComp = kpi.icon;

                return (
                  <div
                    key={kpi.id}
                    onClick={() => handleToggleKpiSelection(kpi.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${kpi.colorBg} ${kpi.colorText}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{kpi.title}</div>
                        <div className="text-[11px] text-slate-500 font-bold">{kpi.value}</div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border font-black text-xs ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">
                {selectedTopKpis.length} / 3 KPIs sélectionnés
              </span>

              <button
                onClick={() => setIsKpiSelectorOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow cursor-pointer"
              >
                Valider mes Réglages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS & PRODUCTION THRESHOLDS SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl relative">
              <Bell className="w-5 h-5" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {criticalCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Alertes & Notifications de Seuils Critiques
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                  {alerts.filter((a) => !a.isResolved).length} Actives
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Surveillance en temps réel des stocks d'aliments et des effectifs animaux proches des seuils de rupture ou de surpopulation.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setAlertFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                alertFilter === "all" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Toutes ({alerts.filter((a) => !a.isResolved).length})
            </button>
            <button
              onClick={() => setAlertFilter("CRITIQUE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                alertFilter === "CRITIQUE" ? "bg-rose-600 text-white shadow" : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critiques ({criticalCount})</span>
            </button>
            <button
              onClick={() => setAlertFilter("Aliment")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                alertFilter === "Aliment" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🌾 Stocks Aliments
            </button>
            <button
              onClick={() => setAlertFilter("Effectif")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                alertFilter === "Effectif" ? "bg-emerald-700 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🐖/🐓 Effectifs Animaux
            </button>
          </div>
        </div>

        {/* Alerts Grid / Cards */}
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Aucune alerte critique dans cette catégorie</h4>
            <p className="text-xs text-slate-500">Tous vos niveaux de stocks d'aliments et vos effectifs animaux sont dans les normes optimales.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAlerts.map((alt) => {
              const isCrit = alt.severity === "CRITIQUE";
              const isAtt = alt.severity === "ATTENTION";

              return (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 relative flex flex-col justify-between ${
                    isCrit
                      ? "bg-rose-50/70 border-rose-300 shadow-xs"
                      : isAtt
                      ? "bg-amber-50/70 border-amber-300 shadow-xs"
                      : "bg-blue-50/70 border-blue-300 shadow-xs"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            isCrit
                              ? "bg-rose-600 text-white"
                              : isAtt
                              ? "bg-amber-500 text-slate-950"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {alt.severity}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          • {alt.category} • {alt.location}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{alt.date}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{alt.title}</h4>

                    <div className="grid grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Niveau Actuel</span>
                        <div className="font-black text-slate-900">{alt.currentValue}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Seuil de Sécurité</span>
                        <div className="font-bold text-rose-700">{alt.thresholdValue}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      ⚠️ {alt.autonomyOrImpact}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Marquer comme traité</span>
                    </button>

                    <button
                      onClick={() => setActiveTab(alt.targetTab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ${
                        isCrit
                          ? "bg-rose-700 hover:bg-rose-800"
                          : isAtt
                          ? "bg-amber-600 hover:bg-amber-700 text-slate-950 font-black"
                          : "bg-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      <span>{alt.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REAL-TIME CRITICAL FEED STOCK LEVELS BAR CHART (RECHARTS) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Graphique des Niveaux de Stock Critiques d'Aliment (Temps Réel)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                  Recharts Bar Chart
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparatif dynamique entre le stock disponible (kg) et le seuil de sécurité minimum par catégorie d'aliment.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setFeedStockFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                feedStockFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tous les stocks ({feedStockLevels.length})
            </button>
            <button
              onClick={() => setFeedStockFilter("Volaille")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                feedStockFilter === "Volaille" ? "bg-amber-500 text-slate-950 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🐔 Volailles
            </button>
            <button
              onClick={() => setFeedStockFilter("Porcin")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                feedStockFilter === "Porcin" ? "bg-pink-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🐖 Porcins
            </button>
            <button
              onClick={() => setFeedStockFilter("CRITIQUE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                feedStockFilter === "CRITIQUE" ? "bg-rose-600 text-white shadow-2xs" : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sous Seuil Sécurité</span>
            </button>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={feedStockLevels.filter((f) => {
                if (feedStockFilter === "all") return true;
                if (feedStockFilter === "CRITIQUE") return f.stockKg < f.safetyThresholdKg;
                return f.category === feedStockFilter;
              })}
              margin={{ top: 20, right: 20, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 700, fill: "#334155" }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748B" }}
                unit=" kg"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as FeedStockLevelItem;
                    const isCrit = data.stockKg <= data.criticalThresholdKg;
                    const isAtt = data.stockKg < data.safetyThresholdKg;

                    return (
                      <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-1.5 min-w-56">
                        <div className="font-black text-amber-400 text-sm border-b border-slate-800 pb-1.5 flex justify-between items-center">
                          <span>{data.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              isCrit
                                ? "bg-rose-600 text-white"
                                : isAtt
                                ? "bg-amber-500 text-slate-950"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {isCrit ? "🚨 Alerte Rupture" : isAtt ? "⚠️ Seuil de Sécurité" : "✓ Optimal"}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Emplacement :</span>
                          <span className="font-bold text-white">{data.location}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Stock Actuel :</span>
                          <span className="font-black text-amber-400">{data.stockKg.toLocaleString("fr-FR")} kg</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Seuil de Sécurité :</span>
                          <span className="font-bold text-slate-400">{data.safetyThresholdKg.toLocaleString("fr-FR")} kg</span>
                        </div>
                        <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5">
                          <span>Autonomie Estimée :</span>
                          <span className="font-black text-emerald-400">{data.autonomyDays} jours ({data.dailyConsumptionKg} kg/j)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="stockKg" name="Stock Disponible Actuel (kg)" radius={[6, 6, 0, 0]}>
                {feedStockLevels
                  .filter((f) => {
                    if (feedStockFilter === "all") return true;
                    if (feedStockFilter === "CRITIQUE") return f.stockKg < f.safetyThresholdKg;
                    return f.category === feedStockFilter;
                  })
                  .map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.stockKg <= entry.criticalThresholdKg
                          ? "#E11D48" // Rose red
                          : entry.stockKg < entry.safetyThresholdKg
                          ? "#F59E0B" // Amber
                          : "#10B981" // Emerald
                      }
                    />
                  ))}
              </Bar>
              <Bar dataKey="safetyThresholdKg" name="Seuil de Sécurité Requis (kg)" fill="#64748B" opacity={0.35} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feed Stock Detail Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {feedStockLevels
            .filter((f) => {
              if (feedStockFilter === "all") return true;
              if (feedStockFilter === "CRITIQUE") return f.stockKg < f.safetyThresholdKg;
              return f.category === feedStockFilter;
            })
            .map((feed) => {
              const isCrit = feed.stockKg <= feed.criticalThresholdKg;
              const isAtt = feed.stockKg < feed.safetyThresholdKg;
              const percentOfSafety = Math.round((feed.stockKg / feed.safetyThresholdKg) * 100);

              return (
                <div
                  key={feed.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    isCrit
                      ? "bg-rose-50/80 border-rose-200"
                      : isAtt
                      ? "bg-amber-50/80 border-amber-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{feed.name}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isCrit
                            ? "bg-rose-600 text-white"
                            : isAtt
                            ? "bg-amber-500 text-slate-950"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {percentOfSafety}% du seuil
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{feed.location}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-600 font-medium">Stock: <strong className="text-slate-900">{feed.stockKg} kg</strong></span>
                      <span className="text-slate-500 text-[11px]">Seuil: <strong>{feed.safetyThresholdKg} kg</strong></span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isCrit ? "bg-rose-600" : isAtt ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentOfSafety, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                    <span className="text-slate-600 font-semibold">
                      Autonomie: <strong className={isCrit ? "text-rose-700 font-black" : "text-slate-900"}>{feed.autonomyDays} jours</strong>
                    </span>
                    <button
                      onClick={() => setActiveTab("suppliers_management")}
                      className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>Commander</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick Navigation Cards for New Major Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab("financial_dashboard")}
          className="p-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl shadow border border-emerald-700/60 hover:border-amber-400 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="space-y-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-800 text-amber-300">
              P&L & RENTABILITÉ
            </span>
            <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
              Tableau de Bord Financier
            </h3>
            <p className="text-xs text-slate-300">
              Consolidation Chiffre d'Affaires, Charges, EBITDA, Résultat Net & Audit IA.
            </p>
          </div>
          <div className="p-3 bg-emerald-800/80 group-hover:bg-amber-500 group-hover:text-slate-950 rounded-xl transition-all shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab("suppliers_management")}
          className="p-4 bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-2xl shadow border border-amber-800/60 hover:border-amber-400 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="space-y-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-900 text-amber-300">
              ACHATS & DEVISE
            </span>
            <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
              Gestion des Fournisseurs
            </h3>
            <p className="text-xs text-amber-100">
              Répertoire multi-modules (poussins, maïs, vétos), factures & comparateur IA.
            </p>
          </div>
          <div className="p-3 bg-amber-900/80 group-hover:bg-amber-500 group-hover:text-slate-950 rounded-xl transition-all shrink-0">
            <Building className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Initial Phase (M1-M5) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Egg className="w-5 h-5 text-emerald-600" />
                <span>Phase Initiale - Évolution Mensuelle (Août - Déc 2026)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Lancement des rotations avicoles (10j) et auto-financement de la porcherie.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("monthly")}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Détails</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatFCFA(Number(value)), ""]}
                  contentStyle={{ backgroundColor: "#1E293B", color: "#FFF", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="CA Avicole" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bénéfice Net" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 5-Year Growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span>Projections Financières (2027 - 2031)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Croissance consolidée du Chiffre d'Affaires et du Bénéfice Net.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("financials5y")}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Tableau complet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip
                  formatter={(value: any) => [formatFCFA(Number(value)), ""]}
                  contentStyle={{ backgroundColor: "#1E293B", color: "#FFF", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="CA Avicole" stackId="1" stroke="#059669" fill="#10B981" />
                <Area type="monotone" dataKey="CA Porcin" stackId="1" stroke="#D97706" fill="#F59E0B" />
                <Area type="monotone" dataKey="Bénéfice Net" stroke="#0F766E" fill="#14B8A6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategic Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aviculture Strategy */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <Egg className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                Volet Avicole : Trésorerie Rapide
              </h4>
              <p className="text-xs text-slate-500">
                Achat à 1,7 kg -&gt; Finition 2,2 kg (IC 2,1)
              </p>
            </div>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 pt-2">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>
                <strong>Coût direct par poulet :</strong> {formatFCFA(2477.89)} (Achat 2 200 + Aliment Finition 277,89 FCFA).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>
                <strong>Recette moyenne par poulet :</strong> {formatFCFA(weightedAveragePouletRevenue)} (Total de la somme des prix des différentes découpes).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>
                <strong>Marge brute unitaire :</strong> {formatFCFA(weightedAveragePouletRevenue - 2477.89)} par sujet vendu.
              </span>
            </li>
          </ul>
          <button
            onClick={() => setActiveTab("aviculture")}
            className="w-full mt-2 py-2 bg-white border border-emerald-600 text-emerald-800 font-semibold rounded-lg text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Explorer le volet Avicole</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Porciculture Strategy */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-600 text-white rounded-xl">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                Volet Porcin : Capitalisation & Vente Massive
              </h4>
              <p className="text-xs text-slate-500">
                Engraissement initial & Transition reproducteurs
              </p>
            </div>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 pt-2">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span>
                <strong>Acquisition initiale :</strong> 10 porcelets en M1 (250k FCFA) + 20 en M2 (500k FCFA).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span>
                <strong>Clôture Décembre 2026 :</strong> Vente des 30 porcs (~75kg carcasse à 2 100 FCFA/kg) = <strong>4 725 000 FCFA</strong> de CA.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span>
                <strong>Phase Croisière (2027+) :</strong> Un CA porcin démarrant à 37,8M FCFA pour atteindre 83,16M FCFA en 2031.
              </span>
            </li>
          </ul>
          <button
            onClick={() => setActiveTab("porciculture")}
            className="w-full mt-2 py-2 bg-white border border-amber-600 text-amber-900 font-semibold rounded-lg text-xs hover:bg-amber-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Explorer le volet Porcin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sales Module Shortcut Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-slate-950 text-amber-400 font-black rounded-full text-[10px] uppercase tracking-wider">
              NOUVEAU MODULE IA
            </span>
            <span className="font-extrabold text-xs uppercase tracking-wide text-slate-900">
              Espace Gestion des Ventes & Commercialisation
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-950">
            Suivi des Clients, Facturation, Vendeurs & Découpes de Viande
          </h3>
          <p className="text-xs text-slate-900 font-medium max-w-xl">
            Gérez vos commandes de poulets et porcs, émettez des factures conformes, calculez les plus-values sur la découpe noble et boostez vos ventes avec l'Assistant IA.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("sales")}
          className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shrink-0 cursor-pointer"
        >
          <span>Accéder au Volet Ventes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feeding Mode & AI Decision Shortcut Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider">
              NUTRITION & GAIN DE POIDS
            </span>
            <span className="font-extrabold text-xs uppercase tracking-wide text-emerald-300">
              Module Gestion des Modes Alimentaires & Décision IA
            </span>
          </div>
          <h3 className="text-lg font-black text-white">
            Suivi Poids Réel vs Prévu (Cobb500 & Porc Hybride) & Rattrapage IA
          </h3>
          <p className="text-xs text-emerald-200 font-medium max-w-xl">
            Saisissez vos pesées régulières, évaluez l'écart de croissance et recevez un plan d'action nutritionnel sur-mesure (rationnement, transition d'aliment, additifs) généré par l'IA Vétérinaire.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("feedmode")}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shrink-0 cursor-pointer"
        >
          <span>Ajuster Régimes Alimentaires</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Vaccines & Daily Tasks Shortcut Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-rose-500 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider">
              SANITAIRE & ROUTINE
            </span>
            <span className="font-extrabold text-xs uppercase tracking-wide text-rose-300">
              Module Vaccins (Alerte J-5) & Planning Tâches Horaires
            </span>
          </div>
          <h3 className="text-lg font-black text-white">
            Alertes Rappels 5 Jours Avant + Horaires Précis des Soins Quotidiens
          </h3>
          <p className="text-xs text-rose-200 font-medium max-w-xl">
            Ne manquez aucun vaccin sanitaire (Gumboro, Newcastle, Parvovirose, Rouget) grâce au déclenchement automatique de l'alerte J-5 et organisez les horaires de travail de vos soignants.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("tasks_health")}
          className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shrink-0 cursor-pointer"
        >
          <span>Gérer Vaccins & Planning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AUDIT JOURNAL: RECENT COMPLETED ACTIONS LOG */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[10px] font-black uppercase mb-1 border border-slate-200">
              <History className="w-3.5 h-3.5 text-slate-700" />
              <span>Historique & Traçabilité Exploitation</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <ListTodo className="w-5 h-5 text-emerald-600" />
              <span>Journal des Dernières Actions Réalisées</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Registre en temps réel des tâches effectuées (Alimentation, Vaccinations, Pesées, Ventes & Entrées en stock).
            </p>
          </div>

          <button
            onClick={() => setIsAddLogModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Consigner une Action</span>
          </button>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {actionLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${log.badgeBg} ${log.badgeText}`}>
                      {log.category.toUpperCase()}
                    </span>
                    <strong className="text-slate-900 text-xs font-black">{log.action}</strong>
                    <span className="text-[11px] text-slate-400 font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 inline ml-1" />
                      <span>{log.time}</span>
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium text-xs leading-relaxed">{log.details}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{log.operator}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TO ADD A NEW ACTION LOG */}
      {isAddLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>Consigner une Nouvelle Action</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrez un événement dans le registre d'audit pour assurer la traçabilité.
                </p>
              </div>
              <button
                onClick={() => setIsAddLogModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 font-black rounded-xl hover:bg-slate-100 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActionLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Catégorie :</label>
                  <select
                    value={newLogCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ActionLogItem["category"];
                      setNewLogCategory(cat);
                      if (cat === "Alimentation") setNewLogAction("Aliment Ajouté");
                      else if (cat === "Vaccination") setNewLogAction("Vaccination Faite");
                      else if (cat === "Pesée") setNewLogAction("Pesée Effectuée");
                      else if (cat === "Vente") setNewLogAction("Vente Enregistrée");
                      else if (cat === "Stock") setNewLogAction("Entrée Stock");
                      else setNewLogAction("Soin Sanitaire");
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
                  >
                    <option value="Alimentation">🌾 Alimentation</option>
                    <option value="Vaccination">💉 Vaccination</option>
                    <option value="Pesée">⚖️ Pesée</option>
                    <option value="Stock">📦 Stock / Entrée</option>
                    <option value="Vente">🛒 Vente</option>
                    <option value="Sanitaire">🩺 Soin Sanitaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Intitulé de l'Action :</label>
                  <input
                    type="text"
                    value={newLogAction}
                    onChange={(e) => setNewLogAction(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                    placeholder="Ex: Aliment Ajouté"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Détails & Précisions :</label>
                <textarea
                  rows={3}
                  value={newLogDetails}
                  onChange={(e) => setNewLogDetails(e.target.value)}
                  placeholder="Ex: Distribution de 20 sacs d'Aliment Finition au Bâtiment A..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Opérateur / Intervenant :</label>
                <input
                  type="text"
                  value={newLogOperator}
                  onChange={(e) => setNewLogOperator(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  placeholder="Ex: Yao (Technicien Volaille)"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow cursor-pointer transition-all flex items-center space-x-2"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Enregistrer l'Action</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operational Directives & Safety Notes */}
      <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold">Facteurs Clés de Succès Ivoire Élevage :</p>
          <p>
            1. Respect rigoureux de la formule d'aliment maison (35% soja) assurant un coût au kg de {formatFCFA(unitCosts.alimentFinition)}.
            <br />
            2. Maintien du taux de mortalité en dessous de 5% grâce au suivi sanitaire rigoureux de l'équipe opérationnelle (1 Volailler + 3 Porchers).
          </p>
        </div>
      </div>
    </div>
  );
};
