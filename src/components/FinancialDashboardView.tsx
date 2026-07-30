import React, { useState } from "react";
import { UnitCosts, ActiveTab } from "../types";
import { getApiUrl } from "../utils/api";
import { formatFCFA, formatPercent } from "../utils/formatters";
import { getBuildingRentSavings, initialEmployees } from "../data/businessPlanData";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calculator,
  Sliders,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Sparkles,
  Send,
  Calendar,
  Layers,
  HelpCircle,
  Building,
  Users,
  Briefcase,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface FinancialDashboardViewProps {
  unitCosts: UnitCosts;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({
  unitCosts,
  setActiveTab,
}) => {
  // Sensitivity Simulator & Unit Selling Prices State
  const [chickenPricePerKg, setChickenPricePerKg] = useState<number>(unitCosts.chickenSalePricePerKg || 1800);
  const [porkPricePerKg, setPorkPricePerKg] = useState<number>(unitCosts.porkSalePricePerKg || 2200);
  const [cutsPricePerKg, setCutsPricePerKg] = useState<number>(3200);
  const [externalFeedPricePerKg, setExternalFeedPricePerKg] = useState<number>(260);
  const [cornPricePerKg, setCornPricePerKg] = useState<number>(unitCosts.cornPricePerKg || 180);
  const [mortalityRatePercent, setMortalityRatePercent] = useState<number>(unitCosts.poultryMortalityRate || 3);

  // Sub-tabs in Financial View
  const [activeSubTab, setActiveSubTab] = useState<
    "pnl" | "modules" | "asset_depreciation" | "sensitivity" | "cashflow" | "compare_cycles" | "real_vs_forecast" | "ai_audit"
  >("pnl");

  // Asset Depreciation State & Calculator
  const [farmAssets, setFarmAssets] = useState<
    {
      id: string;
      name: string;
      category: "Bâtiment & Infra" | "Équipement Production" | "Logistique & Transport" | "Investissement RH & Outillage" | "Fabrique Aliment";
      acquisitionCostFCFA: number;
      lifespanYears: number;
      acquisitionYear: number;
      depreciationType: "Linéaire" | "Dégressif";
      notes?: string;
    }[]
  >([
    {
      id: "ast-1",
      name: "Bâtiments Poussinière & Poulailler Chair (Aviculture)",
      category: "Bâtiment & Infra",
      acquisitionCostFCFA: 12500000,
      lifespanYears: 20,
      acquisitionYear: 2024,
      depreciationType: "Linéaire",
      notes: "Structures fermes, charpente métallique et maçonnerie",
    },
    {
      id: "ast-2",
      name: "Porcherie, Maternité & Loges Engraissement (Porciculture)",
      category: "Bâtiment & Infra",
      acquisitionCostFCFA: 15000000,
      lifespanYears: 20,
      acquisitionYear: 2024,
      depreciationType: "Linéaire",
      notes: "Loges bétonnées, couloirs et fosses à lisier",
    },
    {
      id: "ast-3",
      name: "Broyeur, Mélangeur & Silo Fabrique d'Aliment",
      category: "Fabrique Aliment",
      acquisitionCostFCFA: 4500000,
      lifespanYears: 10,
      acquisitionYear: 2025,
      depreciationType: "Linéaire",
      notes: "Unité de trituration et mélange de céréales",
    },
    {
      id: "ast-4",
      name: "Centrale Solaire Photovoltaïque 10kW & Groupe 15kVA",
      category: "Bâtiment & Infra",
      acquisitionCostFCFA: 3800000,
      lifespanYears: 8,
      acquisitionYear: 2025,
      depreciationType: "Linéaire",
      notes: "Onduleur hybride, batteries lithium et panneaux",
    },
    {
      id: "ast-5",
      name: "Camionnette Isotherme & Tricycles de Vente Directe",
      category: "Logistique & Transport",
      acquisitionCostFCFA: 6500000,
      lifespanYears: 5,
      acquisitionYear: 2025,
      depreciationType: "Linéaire",
      notes: "Véhicules de livraison de viande et volailles vivantes",
    },
    {
      id: "ast-6",
      name: "Outillage RH, Matériel Élevage & Pèse-porc Electronique",
      category: "Investissement RH & Outillage",
      acquisitionCostFCFA: 2800000,
      lifespanYears: 5,
      acquisitionYear: 2025,
      depreciationType: "Linéaire",
      notes: "Balançoires, mangeoires automatiques, seringues de soin",
    },
    {
      id: "ast-7",
      name: "Équipements de Sécurité, EPI & Formation RH Équipe",
      category: "Investissement RH & Outillage",
      acquisitionCostFCFA: 1200000,
      lifespanYears: 3,
      acquisitionYear: 2026,
      depreciationType: "Linéaire",
      notes: "Bottes, tenues de biosécurité, trousses de secourisme",
    },
  ]);

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetCategory, setNewAssetCategory] = useState<
    "Bâtiment & Infra" | "Équipement Production" | "Logistique & Transport" | "Investissement RH & Outillage" | "Fabrique Aliment"
  >("Bâtiment & Infra");
  const [newAssetCost, setNewAssetCost] = useState<number>(2000000);
  const [newAssetLifespan, setNewAssetLifespan] = useState<number>(10);
  const [newAssetAcqYear, setNewAssetAcqYear] = useState<number>(2026);
  const [newAssetNotes, setNewAssetNotes] = useState("");

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || newAssetCost <= 0) return;

    const newAst = {
      id: `ast-${Date.now()}`,
      name: newAssetName,
      category: newAssetCategory,
      acquisitionCostFCFA: newAssetCost,
      lifespanYears: newAssetLifespan || 5,
      acquisitionYear: newAssetAcqYear || 2026,
      depreciationType: "Linéaire" as const,
      notes: newAssetNotes || "Actif de production agricole",
    };

    setFarmAssets([...farmAssets, newAst]);
    setIsAssetModalOpen(false);
    setNewAssetName("");
    setNewAssetNotes("");
  };

  const handleDeleteAsset = (assetId: string) => {
    setFarmAssets(farmAssets.filter((a) => a.id !== assetId));
  };

  // Asset Totals & Annual Depreciation Calculation
  const totalAssetGrossValue = farmAssets.reduce((sum, a) => sum + a.acquisitionCostFCFA, 0);
  const calculatedAnnualDepreciation = farmAssets.reduce((sum, a) => {
    return sum + (a.lifespanYears > 0 ? a.acquisitionCostFCFA / a.lifespanYears : 0);
  }, 0);

  // Calculate Net Book Value (VNC) as of current year 2026
  const currentYear = 2026;
  const totalNetBookValue = farmAssets.reduce((sum, a) => {
    const yearsElapsed = Math.max(0, currentYear - a.acquisitionYear + 1);
    const annualDep = a.lifespanYears > 0 ? a.acquisitionCostFCFA / a.lifespanYears : 0;
    const accumulatedDep = Math.min(a.acquisitionCostFCFA, annualDep * yearsElapsed);
    return sum + (a.acquisitionCostFCFA - accumulatedDep);
  }, 0);

  // Cycle Comparison Data & State
  const availableCycles = [
    {
      id: "poultry_2025_q4",
      name: "Poulets Chair Bande V-2025-Q4 (Oct-Nov 2025 - Record)",
      species: "Aviculture",
      headCountInit: 5000,
      headCountFinal: 4860,
      survRate: 97.2,
      cycleDays: 42,
      avgWeightKg: 2.15,
      fcr: 1.62,
      feedCostTotalFCFA: 14200000,
      vetCostTotalFCFA: 850000,
      otherCostsFCFA: 1100000,
      revenueFCFA: 19803000,
    },
    {
      id: "poultry_2026_q1",
      name: "Poulets Chair Bande V-2026-Q1 (Janv-Fév 2026 - Standard)",
      species: "Aviculture",
      headCountInit: 5000,
      headCountFinal: 4680,
      survRate: 93.6,
      cycleDays: 45,
      avgWeightKg: 2.05,
      fcr: 1.81,
      feedCostTotalFCFA: 15850000,
      vetCostTotalFCFA: 1250000,
      otherCostsFCFA: 1200000,
      revenueFCFA: 18252000,
    },
    {
      id: "pork_2025_02",
      name: "Porcs Engraissement Cycle P-2025-02 (Juin-Nov 2025)",
      species: "Porciculture",
      headCountInit: 80,
      headCountFinal: 78,
      survRate: 97.5,
      cycleDays: 160,
      avgWeightKg: 92.0,
      fcr: 2.85,
      feedCostTotalFCFA: 10800000,
      vetCostTotalFCFA: 650000,
      otherCostsFCFA: 950000,
      revenueFCFA: 16192000,
    },
    {
      id: "pork_2026_01",
      name: "Porcs Engraissement Cycle P-2026-01 (Déc-Mai 2026)",
      species: "Porciculture",
      headCountInit: 80,
      headCountFinal: 74,
      survRate: 92.5,
      cycleDays: 175,
      avgWeightKg: 84.5,
      fcr: 3.20,
      feedCostTotalFCFA: 12400000,
      vetCostTotalFCFA: 980000,
      otherCostsFCFA: 1050000,
      revenueFCFA: 14407250,
    },
  ];

  const [selectedCycle1Id, setSelectedCycle1Id] = useState<string>("poultry_2025_q4");
  const [selectedCycle2Id, setSelectedCycle2Id] = useState<string>("poultry_2026_q1");

  // AI Assistant State
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // --- REVENUE CALCULATIONS ---
  // Aviculture: 5000 chicks * (1 - mortality) * 2.1kg average * chickenPricePerKg (e.g. 5 batches / year or monthly phase)
  const poultryHeadCountPerBatch = 5000;
  const netPoultryHeads = Math.round(poultryHeadCountPerBatch * (1 - mortalityRatePercent / 100));
  const avgChickenWeightKg = 2.1;
  const revenuePoultryPerBatch = netPoultryHeads * avgChickenWeightKg * chickenPricePerKg;
  const annualPoultryBatches = 5;
  const annualPoultryRevenue = revenuePoultryPerBatch * annualPoultryBatches;

  // Porciculture: 60 fattening pigs * 85kg * porkPricePerKg * 2.5 cycles/year
  const pigsCountPerCycle = 60;
  const avgPorkWeightKg = 85;
  const revenuePorkPerCycle = pigsCountPerCycle * avgPorkWeightKg * porkPricePerKg;
  const annualPorkCycles = 2.5;
  const annualPorkRevenue = revenuePorkPerCycle * annualPorkCycles;

  // Cut-up sales & feed mill external sales (driven by unit prices)
  const annualCutsKg = 2656.25; // 2,656.25 kg cuts
  const annualCutsRevenue = annualCutsKg * cutsPricePerKg;
  const annualExternalFeedKg = 23846.15; // 23,846.15 kg feed sold
  const annualExternalFeedSales = annualExternalFeedKg * externalFeedPricePerKg;

  const totalAnnualRevenue = annualPoultryRevenue + annualPorkRevenue + annualCutsRevenue + annualExternalFeedSales;
  const monthlyAverageRevenue = totalAnnualRevenue / 12;

  // --- BASELINE COMPARISON (Standard Prices: Poulet 1800, Porc 2200, Découpes 3200, Aliment 260) ---
  const baselinePoultryRev = 5000 * 0.97 * 2.1 * 1800 * 5; // ~50.2M
  const baselinePorkRev = 60 * 85 * 2200 * 2.5; // ~28.05M
  const baselineCutsRev = 2656.25 * 3200; // ~8.5M
  const baselineFeedRev = 23846.15 * 260; // ~6.2M
  const baselineTotalRev = baselinePoultryRev + baselinePorkRev + baselineCutsRev + baselineFeedRev;
  const baselineCoGS = 5000 * 5 * (unitCosts.dayOldChickCost || 500) + 5000 * 0.97 * 3.8 * 5 * (unitCosts.finisherPoultryFeedCostPerKg || 270) + 60 * 250 * 2.5 * (unitCosts.porkFatteningFeedCostPerKg || 240) + ((unitCosts.vetSanitaryCostPerPoultry || 120) * 5000 * 0.97 * 5 + 1500000);
  const baselineGrossMargin = baselineTotalRev - baselineCoGS;

  // --- COST OF GOODS SOLD (CoGS) CALCULATIONS ---
  const chickCostPerUnit = unitCosts.dayOldChickCost || 500;
  const annualChicksCost = poultryHeadCountPerBatch * annualPoultryBatches * chickCostPerUnit;

  // Feed Costs adjusted by Corn Price ratio
  const cornRatio = cornPricePerKg / 180;
  const basePoultryFeedCostPerKg = unitCosts.finisherPoultryFeedCostPerKg || 270;
  const adjustedPoultryFeedCost = basePoultryFeedCostPerKg * (0.6 * cornRatio + 0.4);
  const totalPoultryFeedKgPerBatch = netPoultryHeads * 3.8; // FCR ~1.8 => 3.8kg feed / bird
  const annualPoultryFeedCost = totalPoultryFeedKgPerBatch * annualPoultryBatches * adjustedPoultryFeedCost;

  const basePorkFeedCostPerKg = unitCosts.porkFatteningFeedCostPerKg || 240;
  const adjustedPorkFeedCost = basePorkFeedCostPerKg * (0.6 * cornRatio + 0.4);
  const totalPorkFeedKgPerCycle = pigsCountPerCycle * 250; // 250kg feed per pig to 85kg
  const annualPorkFeedCost = totalPorkFeedKgPerCycle * annualPorkCycles * adjustedPorkFeedCost;

  const annualVetAndSanitaryCost = (unitCosts.vetSanitaryCostPerPoultry || 120) * netPoultryHeads * annualPoultryBatches + 1500000;

  const totalCoGS = annualChicksCost + annualPoultryFeedCost + annualPorkFeedCost + annualVetAndSanitaryCost;
  const grossMargin = totalAnnualRevenue - totalCoGS;
  const grossMarginPercent = totalAnnualRevenue > 0 ? (grossMargin / totalAnnualRevenue) * 100 : 0;

  // --- OPERATIONAL EXPENSES (OpEx) CALCULATIONS ---
  const monthlyHRBudget = initialEmployees.reduce((sum, e) => sum + e.monthlySalaryFCFA + (e.monthlyBonusFCFA || 0), 0);
  const annualHRSalaries = monthlyHRBudget * 12;

  // Rent savings from buildings
  const rentSavings = getBuildingRentSavings(unitCosts);
  const annualRentExpenses = (70000 - rentSavings.totalMonthlyRentSaved) * 12;

  const annualTransportLogistics = 2400000;
  const annualUtilitiesAndEnergy = 1800000;
  const annualMaintenanceAndMisc = 1200000;

  const totalOpEx = annualHRSalaries + annualRentExpenses + annualTransportLogistics + annualUtilitiesAndEnergy + annualMaintenanceAndMisc;

  // EBITDA & Net Income
  const ebitda = grossMargin - totalOpEx;
  const ebitdaMarginPercent = totalAnnualRevenue > 0 ? (ebitda / totalAnnualRevenue) * 100 : 0;
  const depreciationAndAmortization = calculatedAnnualDepreciation || 2500000; // Dépréciation calculée dynamique des bâtiments, équipements & investissements RH
  const netIncomeBeforeTax = ebitda - depreciationAndAmortization;
  const estimatedTax = netIncomeBeforeTax > 0 ? netIncomeBeforeTax * 0.15 : 0; // 15% BIC simplified
  const netIncome = netIncomeBeforeTax - estimatedTax;
  const netMarginPercent = totalAnnualRevenue > 0 ? (netIncome / totalAnnualRevenue) * 100 : 0;

  // Breakeven Analysis (Point Mort)
  const fixedCosts = totalOpEx + depreciationAndAmortization;
  const variableCostRatio = totalAnnualRevenue > 0 ? totalCoGS / totalAnnualRevenue : 0.5;
  const contributionMarginRatio = 1 - variableCostRatio;
  const breakevenRevenue = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;

  // Data for Charts
  const moduleFinancialsData = [
    {
      name: "Aviculture (Chair)",
      ChiffreAffaires: annualPoultryRevenue,
      ChargesDirectes: annualChicksCost + annualPoultryFeedCost,
      MargeBrute: annualPoultryRevenue - (annualChicksCost + annualPoultryFeedCost),
    },
    {
      name: "Porciculture (Engraiss.)",
      ChiffreAffaires: annualPorkRevenue,
      ChargesDirectes: annualPorkFeedCost + 500000,
      MargeBrute: annualPorkRevenue - (annualPorkFeedCost + 500000),
    },
    {
      name: "Découpes & Ventes",
      ChiffreAffaires: annualCutsRevenue,
      ChargesDirectes: 3200000,
      MargeBrute: annualCutsRevenue - 3200000,
    },
    {
      name: "Fabrique Aliments",
      ChiffreAffaires: annualExternalFeedSales,
      ChargesDirectes: 4100000,
      MargeBrute: annualExternalFeedSales - 4100000,
    },
  ];

  const pieRevenueBreakdown = [
    { name: "Poulets de Chair", value: annualPoultryRevenue, color: "#10b981" },
    { name: "Porcs Charcutiers", value: annualPorkRevenue, color: "#f59e0b" },
    { name: "Ventes Découpes", value: annualCutsRevenue, color: "#ef4444" },
    { name: "Ventes Aliments", value: annualExternalFeedSales, color: "#8b5cf6" },
  ];

  const monthlyCashflow12Months = [
    { month: "M1 (Jan)", Recettes: monthlyAverageRevenue * 0.70, Depenses: totalCoGS / 12 + totalOpEx / 12 + 400000 },
    { month: "M2 (Fév)", Recettes: monthlyAverageRevenue * 0.85, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M3 (Mar)", Recettes: monthlyAverageRevenue * 0.95, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M4 (Avr)", Recettes: monthlyAverageRevenue * 1.05, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M5 (Mai)", Recettes: monthlyAverageRevenue * 1.00, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M6 (Juin)", Recettes: monthlyAverageRevenue * 1.10, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M7 (Juil)", Recettes: monthlyAverageRevenue * 1.05, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M8 (Aoû)", Recettes: monthlyAverageRevenue * 1.15, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M9 (Sep)", Recettes: monthlyAverageRevenue * 1.10, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M10 (Oct)", Recettes: monthlyAverageRevenue * 1.20, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M11 (Nov)", Recettes: monthlyAverageRevenue * 1.30, Depenses: totalCoGS / 12 + totalOpEx / 12 },
    { month: "M12 (Déc)", Recettes: monthlyAverageRevenue * 1.45, Depenses: totalCoGS / 12 + totalOpEx / 12 + 200000 },
  ];

  let cumulativeCash = 1500000;
  const monthlyCashflow12MonthsProcessed = monthlyCashflow12Months.map((item) => {
    const net = item.Recettes - item.Depenses;
    cumulativeCash += net;
    return {
      ...item,
      Recettes: Math.round(item.Recettes),
      Depenses: Math.round(item.Depenses),
      SoldeNet: Math.round(net),
      TrésorerieCumulee: Math.round(cumulativeCash),
    };
  });

  // Query AI Financial Advisor
  const handleAskFinancialAI = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiPromptInput;
    if (!promptToSend.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    const contextPayload = {
      annualRevenue: totalAnnualRevenue,
      annualCoGS: totalCoGS,
      grossMargin,
      grossMarginPercent,
      annualOpEx: totalOpEx,
      ebitda,
      netIncome,
      netMarginPercent,
      breakevenRevenue,
      chickenPricePerKg,
      porkPricePerKg,
      cornPricePerKg,
      mortalityRatePercent,
      rentSavings: rentSavings.totalMonthlyRentSaved,
    };

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `[ASSISTANT FINANCIER & AUDIT CONSOLIDE] : ${promptToSend}`,
          context: contextPayload,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiResponse(data.error || "Erreur de réponse de l'assistant financier IA.");
      }
    } catch (err: any) {
      setAiResponse("Erreur de connexion avec l'IA financière : " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Tableau de Bord Financier & Consolidation</span>
              </span>
              <span className="text-emerald-300 text-xs font-medium">• Compte de Résultat & Cash Flow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Analyse Financière & P&L Global Multi-Modules
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consolidez le Chiffre d'Affaires, les charges directes, la masse salariale, l'EBITDA, le résultat net et effectuez des simulations de sensibilité sur les cours des matières premières et ventes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right backdrop-blur">
              <div className="text-[11px] text-slate-400">Chiffre d'Affaires An 1</div>
              <div className="text-xl font-extrabold text-amber-400">
                {formatFCFA(totalAnnualRevenue)}
              </div>
              <div className="text-[10px] text-emerald-400">
                {formatFCFA(monthlyAverageRevenue)} / mois
              </div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right backdrop-blur">
              <div className="text-[11px] text-slate-400">Résultat Net Dégagé</div>
              <div className={`text-xl font-extrabold ${netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatFCFA(netIncome)}
              </div>
              <div className="text-[10px] text-slate-300">
                Marge Nette : {netMarginPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab("pnl")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "pnl"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Compte de Résultat Consolidation (P&L)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("modules")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "modules"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span>Comparatif & Rentabilité par Module</span>
          </button>

          <button
            onClick={() => setActiveSubTab("asset_depreciation")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "asset_depreciation"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Building className="w-4 h-4 text-sky-400" />
            <span>🏢 Amortissement Actifs, Infra & RH</span>
          </button>

          <button
            onClick={() => setActiveSubTab("sensitivity")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "sensitivity"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>Simulateur de Sensibilité & Cours</span>
          </button>

          <button
            onClick={() => setActiveSubTab("cashflow")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "cashflow"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Flux de Trésorerie & BFR</span>
          </button>

          <button
            onClick={() => setActiveSubTab("compare_cycles")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "compare_cycles"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Comparatif de Cycles (Superposition)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("real_vs_forecast")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "real_vs_forecast"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>📈 Réel vs Prévisions Plan 5 Ans</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ai_audit")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "ai_audit"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black animate-pulse"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900"
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>🤖 Audit Financier IA & Conseils</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Chiffre d'Affaires Brut (CA)</span>
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatFCFA(totalAnnualRevenue)}</div>
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <span className="text-emerald-600 font-bold">100%</span>
            <span>des revenus fermes & découpes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Charges Directes (CoGS)</span>
            <span className="p-2 bg-rose-100 text-rose-800 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatFCFA(totalCoGS)}</div>
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <span className="text-rose-600 font-bold">
              {((totalCoGS / (totalAnnualRevenue || 1)) * 100).toFixed(1)}%
            </span>
            <span>Alimentation, Poussins & Véto</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Marge Brute Opérationnelle</span>
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700">{formatFCFA(grossMargin)}</div>
          <div className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1">
            <span>Taux de Marge Brute : {grossMarginPercent.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>EBITDA (Excédent Brut)</span>
            <span className="p-2 bg-purple-100 text-purple-800 rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-purple-900">{formatFCFA(ebitda)}</div>
          <div className="text-xs text-purple-700 font-extrabold flex items-center space-x-1">
            <span>Marge EBITDA : {ebitdaMarginPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: COMPTE DE RÉSULTAT CONSOLIDATION */}
      {activeSubTab === "pnl" && (
        <div className="space-y-6">
          {/* INTERACTIVE UNIT SELLING PRICE ADJUSTMENT TOOL & MARGIN SIMULATOR */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border-2 border-amber-500/40 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700/80 pb-4 gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white flex items-center gap-2">
                    <span>Outil Interactif d'Ajustement des Prix de Vente</span>
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase">
                      Simulateur de Marge Brute
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ajustez les prix unitaires ci-dessous pour observer en temps réel l'impact direct sur le CA et la Marge Brute Estimée.
                  </p>
                </div>
              </div>

              {/* Instant Variance Impact Badge */}
              <div className="bg-slate-950/80 border border-amber-400/40 px-4 py-2.5 rounded-2xl text-right shrink-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                  Impact Immédiat / Marge Brute :
                </div>
                {(() => {
                  const delta = grossMargin - baselineGrossMargin;
                  const isPositive = delta >= 0;
                  return (
                    <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                      <span className={`text-base font-black ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPositive ? "+" : ""}{formatFCFA(delta)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-black ${isPositive ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {isPositive ? "▲" : "▼"} {(((grossMargin - baselineGrossMargin) / (baselineGrossMargin || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* 1. Poulet de Chair */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <span>🐔</span> Poulet de Chair
                  </span>
                  <span className="text-[10px] text-slate-400">FCFA / kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={chickenPricePerKg}
                    onChange={(e) => setChickenPricePerKg(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 text-white font-extrabold text-sm p-1.5 rounded-lg text-center focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-emerald-400">
                    CA: {formatFCFA(annualPoultryRevenue / 1000000)}M
                  </span>
                </div>
                <input
                  type="range"
                  min="1400"
                  max="2600"
                  step="50"
                  value={chickenPricePerKg}
                  onChange={(e) => setChickenPricePerKg(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* 2. Porc Charcutier */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <span>🐖</span> Porc Charcutier
                  </span>
                  <span className="text-[10px] text-slate-400">FCFA / kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={porkPricePerKg}
                    onChange={(e) => setPorkPricePerKg(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 text-white font-extrabold text-sm p-1.5 rounded-lg text-center focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-emerald-400">
                    CA: {formatFCFA(annualPorkRevenue / 1000000)}M
                  </span>
                </div>
                <input
                  type="range"
                  min="1800"
                  max="3200"
                  step="50"
                  value={porkPricePerKg}
                  onChange={(e) => setPorkPricePerKg(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* 3. Ventes Découpes */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <span>🥩</span> Découpes Nobles
                  </span>
                  <span className="text-[10px] text-slate-400">FCFA / kg moy.</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={cutsPricePerKg}
                    onChange={(e) => setCutsPricePerKg(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 text-white font-extrabold text-sm p-1.5 rounded-lg text-center focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-emerald-400">
                    CA: {formatFCFA(annualCutsRevenue / 1000000)}M
                  </span>
                </div>
                <input
                  type="range"
                  min="2200"
                  max="4500"
                  step="100"
                  value={cutsPricePerKg}
                  onChange={(e) => setCutsPricePerKg(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* 4. Ventes Aliments Extérieurs */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <span>🌾</span> Aliments Vendus
                  </span>
                  <span className="text-[10px] text-slate-400">FCFA / kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={externalFeedPricePerKg}
                    onChange={(e) => setExternalFeedPricePerKg(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 text-white font-extrabold text-sm p-1.5 rounded-lg text-center focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-emerald-400">
                    CA: {formatFCFA(annualExternalFeedSales / 1000000)}M
                  </span>
                </div>
                <input
                  type="range"
                  min="180"
                  max="350"
                  step="10"
                  value={externalFeedPricePerKg}
                  onChange={(e) => setExternalFeedPricePerKg(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Scenario Preset Buttons */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 gap-2">
              <span className="text-xs font-bold text-slate-400">⚡ Scénarios Rapides d'Ajustement :</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChickenPricePerKg(2100);
                    setPorkPricePerKg(2500);
                    setCutsPricePerKg(3700);
                    setExternalFeedPricePerKg(290);
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  🎉 Scénario Fêtes (+15%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChickenPricePerKg(1650);
                    setPorkPricePerKg(2000);
                    setCutsPricePerKg(2900);
                    setExternalFeedPricePerKg(240);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  📉 Scénario Concurrentiel (-10%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChickenPricePerKg(1800);
                    setPorkPricePerKg(2200);
                    setCutsPricePerKg(3200);
                    setExternalFeedPricePerKg(260);
                  }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  🔄 Réinitialiser Prix Standards
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>Compte de Résultat Prévisionnel Simplifié (P&L Synthèse Annuelle)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Consolidation de l'ensemble des flux d'exploitation de la holding Ivoire Élevage.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Seuil de Rentabilité : {formatFCFA(breakevenRevenue)}
                </span>
              </div>
            </div>

            {/* P&L Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="p-3.5 rounded-l-xl">Poste Financier (P&L)</th>
                    <th className="p-3.5 text-right">Montant Annuel (FCFA)</th>
                    <th className="p-3.5 text-right">% du CA</th>
                    <th className="p-3.5 rounded-r-xl">Observations & Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-medium text-slate-800">
                  {/* REVENUES */}
                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="p-3 text-emerald-950">1. CHIFFRE D'AFFAIRES CONSOLIDÉ (CA)</td>
                    <td className="p-3 text-right text-emerald-800 font-black text-sm">
                      {formatFCFA(totalAnnualRevenue)}
                    </td>
                    <td className="p-3 text-right text-emerald-800 font-bold">100.0%</td>
                    <td className="p-3 text-slate-600 text-[11px]">Ventes Volailles, Porcs, Découpes, Aliments</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Ventes Poulets de Chair (5000 x 5 bandes)</td>
                    <td className="p-3 text-right font-bold">{formatFCFA(annualPoultryRevenue)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualPoultryRevenue / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {netPoultryHeads * annualPoultryBatches} poulets vendus à ~2.1kg
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Ventes Porcs Charcutiers (60 porcs x 2.5 cycles)</td>
                    <td className="p-3 text-right font-bold">{formatFCFA(annualPorkRevenue)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualPorkRevenue / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">150 porcs de 85kg charcutier</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Ventes Découpes & Charcuterie Détaillée</td>
                    <td className="p-3 text-right font-bold">{formatFCFA(annualCutsRevenue)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualCutsRevenue / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">Poulets découpés, saucisses, côtes de porc</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Ventes Aliments Extérieurs (Prestations Fabrique)</td>
                    <td className="p-3 text-right font-bold">{formatFCFA(annualExternalFeedSales)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualExternalFeedSales / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">Vente de sacs d'aliment aux fermes voisines</td>
                  </tr>

                  {/* CoGS */}
                  <tr className="bg-rose-50/50 font-bold">
                    <td className="p-3 text-rose-950">2. COÛT DES VENTES / CHARGES DIRECTES (CoGS)</td>
                    <td className="p-3 text-right text-rose-800 font-black text-sm">
                      -{formatFCFA(totalCoGS)}
                    </td>
                    <td className="p-3 text-right text-rose-800 font-bold">
                      {((totalCoGS / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">Matières premières, poussins & produits vétérinaires</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Achats Poussins d'un jour (Cobb 500)</td>
                    <td className="p-3 text-right font-bold">-{formatFCFA(annualChicksCost)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualChicksCost / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{poultryHeadCountPerBatch * annualPoultryBatches} poussins x {chickCostPerUnit} FCFA</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Alimentation Volailles (Démarrage/Finition)</td>
                    <td className="p-3 text-right font-bold">-{formatFCFA(annualPoultryFeedCost)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualPoultryFeedCost / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">Prix moyen aliment : {adjustedPoultryFeedCost.toFixed(0)} FCFA/kg</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Alimentation Porcine (Croissance/Engraissement)</td>
                    <td className="p-3 text-right font-bold">-{formatFCFA(annualPorkFeedCost)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualPorkFeedCost / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">Prix moyen aliment : {adjustedPorkFeedCost.toFixed(0)} FCFA/kg</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Soins Vétérinaires, Vaccins & Hygiène</td>
                    <td className="p-3 text-right font-bold">-{formatFCFA(annualVetAndSanitaryCost)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualVetAndSanitaryCost / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">HB1, Gumboro, Fer Dextran, Désinfectants</td>
                  </tr>

                  {/* GROSS MARGIN */}
                  <tr className="bg-amber-100/60 font-black text-slate-900 border-t border-b border-amber-300">
                    <td className="p-3.5 text-amber-950">3. MARGE BRUTE D'EXPLOITATION</td>
                    <td className="p-3.5 text-right text-amber-800 text-base">
                      {formatFCFA(grossMargin)}
                    </td>
                    <td className="p-3.5 text-right text-amber-800">{grossMarginPercent.toFixed(1)}%</td>
                    <td className="p-3.5 text-amber-900 text-[11px]">Marge disponible pour couvrir les OpEx</td>
                  </tr>

                  {/* OPERATIONAL EXPENSES */}
                  <tr className="bg-slate-100 font-bold">
                    <td className="p-3 text-slate-900">4. CHARGES D'EXPLOITATION (OpEx)</td>
                    <td className="p-3 text-right text-slate-900 font-black text-sm">
                      -{formatFCFA(totalOpEx)}
                    </td>
                    <td className="p-3 text-right text-slate-800 font-bold">
                      {((totalOpEx / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">Salaires, loyers, transport, énergie</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Masse Salariale & Primes Personnel ({initialEmployees.length} agents)</td>
                    <td className="p-3 text-right font-bold">-{formatFCFA(annualHRSalaries)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualHRSalaries / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">Fixe : {formatFCFA(monthlyHRBudget * 12)} / an</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Loyers Bâtiments (après déduction d'acquisitions)</td>
                    <td className="p-3 text-right font-bold">
                      -{formatFCFA(annualRentExpenses)}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualRentExpenses / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      Économie annuelle acquise : {formatFCFA(rentSavings.totalYearlyRentSaved)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 pl-6 text-slate-700">• Transport & Logistique de livraison</td>
                    <td className="p-3 text-right font-bold">-{formatFCFA(annualTransportLogistics)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {((annualTransportLogistics / totalAnnualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">Carburant, chauffeurs & livraison clients</td>
                  </tr>

                  {/* EBITDA */}
                  <tr className="bg-purple-100/80 font-black text-slate-900 border-t border-b border-purple-300">
                    <td className="p-3.5 text-purple-950">5. EBITDA (EXCÉDENT BRUT D'EXPLOITATION)</td>
                    <td className="p-3.5 text-right text-purple-900 text-base">
                      {formatFCFA(ebitda)}
                    </td>
                    <td className="p-3.5 text-right text-purple-900">{ebitdaMarginPercent.toFixed(1)}%</td>
                    <td className="p-3.5 text-purple-900 text-[11px]">Rentabilité réelle de l'activité pastorale</td>
                  </tr>

                  {/* NET INCOME */}
                  <tr className="bg-emerald-900 text-white font-black text-sm rounded-xl">
                    <td className="p-4 rounded-l-xl">6. RÉSULTAT NET DÉGAGÉ (NET PROFIT)</td>
                    <td className="p-4 text-right text-amber-400 text-lg rounded-r-none">
                      {formatFCFA(netIncome)}
                    </td>
                    <td className="p-4 text-right text-emerald-200">{netMarginPercent.toFixed(1)}%</td>
                    <td className="p-4 text-emerald-100 text-xs rounded-r-xl">
                      Bénéfice net réinvestissable pour l'expansion
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: COMPARATIF ET RENTABILITÉ PAR MODULE */}
      {activeSubTab === "modules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Chiffre d'Affaires vs Charges Directes par Module (FCFA)</span>
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleFinancialsData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: any) => formatFCFA(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ChiffreAffaires" name="Chiffre d'Affaires" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ChargesDirectes" name="Charges Directes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-amber-600" />
              <span>Répartition des Sources de Revenus (%)</span>
            </h3>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieRevenueBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieRevenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatFCFA(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12-MONTH PROJECTED CASH FLOW LINE CHART */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Évolution Projetée de la Trésorerie sur 12 Mois (Line Chart)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Trajectoire prévisionnelle du solde de trésorerie cumulé, des recettes et dépenses mois par mois.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Solde Trésorerie Cumulée</span>
                </span>
                <span className="flex items-center space-x-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span>Recettes Mensuelles</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span>Dépenses Mensuelles</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCashflow12MonthsProcessed} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: any) => formatFCFA(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="TrésorerieCumulee" name="Trésorerie Cumulée (FCFA)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="Recettes" name="Recettes (FCFA)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="Depenses" name="Dépenses (FCFA)" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SIMULATEUR DE SENSIBILITÉ ET COURS */}
      {activeSubTab === "sensitivity" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <span>Simulateur d'Impact sur la Marge Bénéficiaire</span>
              </h3>
              <p className="text-xs text-slate-500">
                Simulez directement l'impact financier de la baisse de la mortalité (-5%) ou de l'optimisation du coût de revient de l'aliment.
              </p>
            </div>

            <button
              onClick={() => {
                setChickenPricePerKg(1800);
                setPorkPricePerKg(2200);
                setCornPricePerKg(180);
                setMortalityRatePercent(3);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser Hypothèses</span>
            </button>
          </div>

          {/* ONE-CLICK SIMULATION SCENARIO PRESETS */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h4 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                  Scénarios Préréglés d'Optimisation de Marge
                </h4>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase">
                Calculateur d'Impact
              </span>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed">
              Cliquez sur un scénario ci-dessous pour appliquer instantanément l'optimisation et observer le gain sur la marge bénéficiaire annuelle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setMortalityRatePercent(1); // -2% to 1%
                }}
                className="p-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-amber-300 font-extrabold text-xs">
                  <span>📉 Réduction Mortalité (-5% max)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-emerald-100">
                  Passe le taux de perte de 3% à 1% sur le cheptel avicole & porcin.
                </p>
              </button>

              <button
                onClick={() => {
                  setCornPricePerKg(150); // Reduction in feed raw materials
                }}
                className="p-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-emerald-300 font-extrabold text-xs">
                  <span>🌾 Optimisation Coût Aliment (-16%)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-emerald-100">
                  Prix du maïs réduit de 180 à 150 FCFA/kg (fabrication à la ferme).
                </p>
              </button>

              <button
                onClick={() => {
                  setMortalityRatePercent(1);
                  setCornPricePerKg(150);
                }}
                className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-left transition-all cursor-pointer space-y-1 shadow font-bold"
              >
                <div className="flex items-center justify-between font-black text-xs text-slate-950">
                  <span>⚡ Effet Cumulé Maximisé</span>
                  <Zap className="w-4 h-4 text-slate-950" />
                </div>
                <p className="text-[11px] text-slate-900 font-medium">
                  Combine -5% de mortalité ET optimisation du coût de l'aliment.
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* Control 1: Prix Poulet */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Prix de Vente Poulet / kg</span>
                <span className="text-emerald-700 font-extrabold">{chickenPricePerKg} FCFA</span>
              </div>
              <input
                type="range"
                min={1200}
                max={2500}
                step={50}
                value={chickenPricePerKg}
                onChange={(e) => setChickenPricePerKg(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1200 FCFA</span>
                <span>2500 FCFA</span>
              </div>
            </div>

            {/* Control 2: Prix Porc */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Prix de Vente Porc / kg</span>
                <span className="text-amber-700 font-extrabold">{porkPricePerKg} FCFA</span>
              </div>
              <input
                type="range"
                min={1500}
                max={3000}
                step={50}
                value={porkPricePerKg}
                onChange={(e) => setPorkPricePerKg(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1500 FCFA</span>
                <span>3000 FCFA</span>
              </div>
            </div>

            {/* Control 3: Prix Maïs / Aliment */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Coût Matière Maïs / Aliment</span>
                <span className="text-orange-700 font-extrabold">{cornPricePerKg} FCFA/kg</span>
              </div>
              <input
                type="range"
                min={120}
                max={280}
                step={5}
                value={cornPricePerKg}
                onChange={(e) => setCornPricePerKg(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>120 FCFA (Optimisé)</span>
                <span>280 FCFA (Prix Marché)</span>
              </div>
            </div>

            {/* Control 4: Mortalité Volaille */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Taux Mortalité Cheptel</span>
                <span className="text-rose-700 font-extrabold">{mortalityRatePercent}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={mortalityRatePercent}
                onChange={(e) => setMortalityRatePercent(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.5% (Optimisé -5%)</span>
                <span>10% (Alerte)</span>
              </div>
            </div>
          </div>

          {/* Stressed Results */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl space-y-4 shadow-lg border border-slate-800">
            <h4 className="text-sm font-extrabold text-amber-400 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Résultats de la Simulation Marge & Rentabilité :</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Chiffre d'Affaires</span>
                <span className="text-lg font-extrabold text-amber-400">{formatFCFA(totalAnnualRevenue)}</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Charges Directes (CoGS)</span>
                <span className="text-lg font-extrabold text-rose-300">{formatFCFA(totalCoGS)}</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Bénéfice Net Recalculé</span>
                <span className={`text-lg font-extrabold ${netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatFCFA(netIncome)}
                </span>
              </div>

              <div className="p-3 bg-emerald-900/80 rounded-xl border border-emerald-600/80">
                <span className="text-emerald-200 block text-[11px] font-bold">Marge Bénéficiaire Nette</span>
                <span className="text-xl font-black text-amber-300">
                  {netMarginPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-200 block mt-0.5">
                  ({ebitdaMarginPercent.toFixed(1)}% EBITDA)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CALCULATEUR D'AMORTISSEMENT D'ACTIFS & DÉPRÉCIATION INFRA/RH */}
      {activeSubTab === "asset_depreciation" && (
        <div className="space-y-6">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-5 rounded-2xl border border-sky-800 text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                <span>Valeur Brute d'Acquisition Actifs</span>
                <Building className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-black text-white">{formatFCFA(totalAssetGrossValue)}</div>
              <p className="text-[11px] text-sky-200">{farmAssets.length} actifs enregistrés (Infra, Matériel & RH)</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-5 rounded-2xl border border-amber-800 text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Dépréciation Annuelle Totale (D&A)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-300">{formatFCFA(calculatedAnnualDepreciation)} / an</div>
              <p className="text-[11px] text-amber-200/80">Déduite automatiquement dans le compte P&L</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 rounded-2xl border border-emerald-800 text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>Valeur Nette Comptable (VNC 2026)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-300">{formatFCFA(totalNetBookValue)}</div>
              <p className="text-[11px] text-emerald-200">Valeur résiduelle du patrimoine de la ferme</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 text-white space-y-2 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Action Rapide Actifs</span>
                <Plus className="w-4 h-4 text-amber-400" />
              </div>
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Actif (Infra / RH)</span>
              </button>
            </div>
          </div>

          {/* Asset List & Depreciation Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-sky-600" />
                  <span>Inventaire & Plan d'Amortissement des Actifs (Infra & RH)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Calculateur automatique de la dépréciation linéaire selon la durée de vie des équipements et bâtiments.
                </p>
              </div>
              <span className="text-xs font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full border border-sky-200">
                Imputation Annuelle: {formatFCFA(calculatedAnnualDepreciation)}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-extrabold uppercase tracking-wider">
                    <th className="p-3">Désignation de l'Actif</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3 text-right">Coût Acquisition</th>
                    <th className="p-3 text-center">Durée (Ans)</th>
                    <th className="p-3 text-right">Amort. Annuel</th>
                    <th className="p-3 text-center">Année Acq.</th>
                    <th className="p-3 text-right">VNC 2026</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {farmAssets.map((asset) => {
                    const annualDep = asset.lifespanYears > 0 ? asset.acquisitionCostFCFA / asset.lifespanYears : 0;
                    const yearsElapsed = Math.max(0, 2026 - asset.acquisitionYear + 1);
                    const accumDep = Math.min(asset.acquisitionCostFCFA, annualDep * yearsElapsed);
                    const vnc = Math.max(0, asset.acquisitionCostFCFA - accumDep);

                    return (
                      <tr key={asset.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{asset.name}</div>
                          {asset.notes && <div className="text-[11px] text-slate-500">{asset.notes}</div>}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              asset.category === "Bâtiment & Infra"
                                ? "bg-sky-100 text-sky-800 border border-sky-200"
                                : asset.category === "Fabrique Aliment"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : asset.category === "Investissement RH & Outillage"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {asset.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {formatFCFA(asset.acquisitionCostFCFA)}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">{asset.lifespanYears} ans</td>
                        <td className="p-3 text-right font-bold text-amber-700 bg-amber-50/60 my-1 rounded-lg">
                          {formatFCFA(annualDep)} / an
                        </td>
                        <td className="p-3 text-center text-slate-600 font-bold">{asset.acquisitionYear}</td>
                        <td className="p-3 text-right font-black text-emerald-700">{formatFCFA(vnc)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer cet actif"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5-YEAR AMORTIZATION FORECAST TABLE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Tableau Prévisionnel d'Amortissement Consolidé (2026 - 2030)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Évolution de la valeur nette comptable globale et cumul des amortissements déduits sur les 5 prochaines années.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold uppercase text-[11px]">
                    <th className="p-3">Année</th>
                    <th className="p-3 text-right">Valeur Début d'Année</th>
                    <th className="p-3 text-right">Dotation Amortissement Annuel</th>
                    <th className="p-3 text-right">Amortissements Cumulés</th>
                    <th className="p-3 text-right">Valeur Nette Fin d'Année (VNC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {[2026, 2027, 2028, 2029, 2030].map((yr, idx) => {
                    const annualDotation = calculatedAnnualDepreciation;
                    const accumulated = (idx + 1) * annualDotation;
                    const startValue = Math.max(0, totalAssetGrossValue - idx * annualDotation);
                    const endValue = Math.max(0, totalAssetGrossValue - accumulated);

                    return (
                      <tr key={yr} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-black text-slate-900 bg-slate-100/60">{yr}</td>
                        <td className="p-3 text-right font-bold text-slate-700">{formatFCFA(startValue)}</td>
                        <td className="p-3 text-right font-black text-amber-700 bg-amber-50">
                          -{formatFCFA(annualDotation)}
                        </td>
                        <td className="p-3 text-right text-slate-600">{formatFCFA(accumulated)}</td>
                        <td className="p-3 text-right font-black text-emerald-700">{formatFCFA(endValue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Building className="w-5 h-5 text-sky-600" />
                <span>Nouveau Calcul d'Amortissement d'Actif</span>
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-black text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAssetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation de l'Actif / Bâtiment / Équipement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Deuxième Bâtiment Poussinière 2000 sujets"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie d'Actif *</label>
                  <select
                    value={newAssetCategory}
                    onChange={(e: any) => setNewAssetCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Bâtiment & Infra">Bâtiment & Infra</option>
                    <option value="Équipement Production">Équipement Production</option>
                    <option value="Fabrique Aliment">Fabrique Aliment</option>
                    <option value="Logistique & Transport">Logistique & Transport</option>
                    <option value="Investissement RH & Outillage">Investissement RH & Outillage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coût d'Acquisition (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={100000}
                    value={newAssetCost}
                    onChange={(e) => setNewAssetCost(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durée d'Amortissement (Ans) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={newAssetLifespan}
                    onChange={(e) => setNewAssetLifespan(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Année d'Acquisition *</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2030}
                    value={newAssetAcqYear}
                    onChange={(e) => setNewAssetAcqYear(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Emplacement / Détails RH</label>
                <input
                  type="text"
                  placeholder="Ex: Équipements de protection et outillage d'élevage"
                  value={newAssetNotes}
                  onChange={(e) => setNewAssetNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer & Calculer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FLUX DE TRÉSORERIE ET BFR */}
      {activeSubTab === "cashflow" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Projection des Flux de Trésorerie Mensuels (Cash In / Cash Out)</span>
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyCashflow12MonthsProcessed} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: any) => formatFCFA(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Recettes" name="Encaissements Ventes" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="Depenses" name="Décaissements Charges" stroke="#ef4444" strokeWidth={3} />
                <Line type="monotone" dataKey="TrésorerieCumulee" name="Solde Trésorerie Cumulé" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SUB-TAB: VUE COMPARATIVE DE CYCLES D'ÉLEVAGE */}
      {activeSubTab === "compare_cycles" && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md uppercase">
                  📊 SUPERPOSITION DES PERFORMANCES
                </span>
                <span className="text-xs text-slate-500 font-bold">Analyse Comparative d'Élevage</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center space-x-2">
                <Layers className="w-6 h-6 text-amber-600" />
                <span>Comparatif de Deux Cycles d'Élevage & Facteurs de Succès</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Superposez deux bandes (volailles ou porcs) pour identifier immédiatement les facteurs explicatifs d'écart de rentabilité, de FCR et de mortalité.
              </p>
            </div>
          </div>

          {/* Cycle Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-emerald-900 uppercase flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                <span>Sélectionner le Cycle A (Référence / Gagnant) :</span>
              </label>
              <select
                value={selectedCycle1Id}
                onChange={(e) => setSelectedCycle1Id(e.target.value)}
                className="w-full bg-white text-slate-900 p-3 rounded-xl border border-emerald-300 font-bold text-xs shadow-xs focus:ring-2 focus:ring-emerald-500"
              >
                {availableCycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.species})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-900 uppercase flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Sélectionner le Cycle B (Comparé) :</span>
              </label>
              <select
                value={selectedCycle2Id}
                onChange={(e) => setSelectedCycle2Id(e.target.value)}
                className="w-full bg-white text-slate-900 p-3 rounded-xl border border-amber-300 font-bold text-xs shadow-xs focus:ring-2 focus:ring-amber-500"
              >
                {availableCycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.species})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Process Comparisons */}
          {(() => {
            const c1 = availableCycles.find((c) => c.id === selectedCycle1Id) || availableCycles[0];
            const c2 = availableCycles.find((c) => c.id === selectedCycle2Id) || availableCycles[1];

            const c1TotalCosts = c1.feedCostTotalFCFA + c1.vetCostTotalFCFA + c1.otherCostsFCFA;
            const c2TotalCosts = c2.feedCostTotalFCFA + c2.vetCostTotalFCFA + c2.otherCostsFCFA;

            const c1Margin = c1.revenueFCFA - c1TotalCosts;
            const c2Margin = c2.revenueFCFA - c2TotalCosts;

            const c1MarginPct = (c1Margin / c1.revenueFCFA) * 100;
            const c2MarginPct = (c2Margin / c2.revenueFCFA) * 100;

            const c1TotalKgProduced = c1.headCountFinal * c1.avgWeightKg;
            const c2TotalKgProduced = c2.headCountFinal * c2.avgWeightKg;

            const c1CostPerKg = c1TotalCosts / (c1TotalKgProduced || 1);
            const c2CostPerKg = c2TotalCosts / (c2TotalKgProduced || 1);

            const marginGapFCFA = c1Margin - c2Margin;

            const comparisonChartData = [
              { metric: "Chiffre d'Affaires", CycleA: c1.revenueFCFA, CycleB: c2.revenueFCFA },
              { metric: "Coûts Aliments", CycleA: c1.feedCostTotalFCFA, CycleB: c2.feedCostTotalFCFA },
              { metric: "Coûts Totaux", CycleA: c1TotalCosts, CycleB: c2TotalCosts },
              { metric: "Marge Nette", CycleA: c1Margin, CycleB: c2Margin },
            ];

            return (
              <div className="space-y-6">
                {/* Side-by-Side Key Metrics Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-extrabold text-[11px] uppercase">
                        <th className="p-3">Indicateur Clé de Performance (KPI)</th>
                        <th className="p-3 text-emerald-400 bg-emerald-950/60 border-l border-slate-700">
                          {c1.name} (A)
                        </th>
                        <th className="p-3 text-amber-400 bg-amber-950/60 border-l border-slate-700">
                          {c2.name} (B)
                        </th>
                        <th className="p-3 border-l border-slate-700">Écart & Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                      <tr>
                        <td className="p-3 font-bold text-slate-900">🛡️ Taux de Survie (%)</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {c1.survRate}% ({c1.headCountFinal}/{c1.headCountInit})
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {c2.survRate}% ({c2.headCountFinal}/{c2.headCountInit})
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              c1.survRate >= c2.survRate ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {(c1.survRate - c2.survRate).toFixed(1)}% de différence
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-slate-900">🌾 Indice de Consommation (FCR)</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {c1.fcr.toFixed(2)}
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {c2.fcr.toFixed(2)}
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              c1.fcr <= c2.fcr ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {(c1.fcr - c2.fcr).toFixed(2)} points IC
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-slate-900">⚖️ Poids Moyen Unitaire Vendu</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {c1.avgWeightKg} kg / sujet
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {c2.avgWeightKg} kg / sujet
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          {(c1.avgWeightKg - c2.avgWeightKg).toFixed(2)} kg / sujet
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-slate-900">💰 Chiffre d'Affaires Brut (FCFA)</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {formatFCFA(c1.revenueFCFA)}
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {formatFCFA(c2.revenueFCFA)}
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          {formatFCFA(c1.revenueFCFA - c2.revenueFCFA)}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-slate-900">📦 Coûts Aliments Totaux (FCFA)</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {formatFCFA(c1.feedCostTotalFCFA)}
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {formatFCFA(c2.feedCostTotalFCFA)}
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          {formatFCFA(c1.feedCostTotalFCFA - c2.feedCostTotalFCFA)}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-slate-900">💉 Coûts Soins Vétérinaires (FCFA)</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {formatFCFA(c1.vetCostTotalFCFA)}
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {formatFCFA(c2.vetCostTotalFCFA)}
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          {formatFCFA(c1.vetCostTotalFCFA - c2.vetCostTotalFCFA)}
                        </td>
                      </tr>

                      <tr className="bg-slate-100 font-black text-slate-900">
                        <td className="p-3 text-sm">📈 Marge Nette Générée (FCFA & %)</td>
                        <td className="p-3 text-sm font-black text-emerald-900 bg-emerald-100 border-l border-slate-300">
                          {formatFCFA(c1Margin)} ({c1MarginPct.toFixed(1)}%)
                        </td>
                        <td className="p-3 text-sm font-black text-amber-900 bg-amber-100 border-l border-slate-300">
                          {formatFCFA(c2Margin)} ({c2MarginPct.toFixed(1)}%)
                        </td>
                        <td className="p-3 text-sm font-black border-l border-slate-300 text-emerald-700">
                          {formatFCFA(marginGapFCFA)}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-slate-900">🏷️ Coût de Revient Unitaire / kg Produit</td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                          {formatFCFA(c1CostPerKg)} / kg
                        </td>
                        <td className="p-3 font-black text-amber-700 bg-amber-50/50 border-l border-slate-200">
                          {formatFCFA(c2CostPerKg)} / kg
                        </td>
                        <td className="p-3 font-bold border-l border-slate-200">
                          {formatFCFA(c1CostPerKg - c2CostPerKg)} / kg
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Comparative Superimposed Bar Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Superposition Graphique des Volumes Financiers (FCFA)</span>
                  </h4>
                  <div className="h-72 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: "bold" }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                        <Tooltip formatter={(value: any) => formatFCFA(Number(value))} />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
                        <Bar dataKey="CycleA" name={`Cycle A: ${c1.name}`} fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="CycleB" name={`Cycle B: ${c2.name}`} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Success Factors & IA Diagnostic Block */}
                <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl space-y-4 border border-emerald-700 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="font-extrabold text-sm text-amber-300">
                      Analyse Vétérinaire & Synthèse des Facteurs Clés de Succès (FCS)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                      <div className="font-bold text-emerald-300 text-xs">
                        🥇 Gagnant : {c1Margin >= c2Margin ? c1.name : c2.name}
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        Le cycle le plus rentable surpasse l'autre de{" "}
                        <strong className="text-amber-300 font-black">
                          {formatFCFA(Math.abs(marginGapFCFA))}
                        </strong>{" "}
                        de marge nette grâce à un indice de conversion contrôlé et une meilleure maîtrise sanitaire.
                      </p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                      <div className="font-bold text-amber-300 text-xs">
                        🔑 Facteurs de Succès Identifiés :
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                        <li>
                          <strong>Gain FCR :</strong> Écart de {(Math.abs(c1.fcr - c2.fcr)).toFixed(2)} points IC sur l'aliment.
                        </li>
                        <li>
                          <strong>Maîtrise Mortalité :</strong> Écart de {(Math.abs(c1.survRate - c2.survRate)).toFixed(1)}% de survie au sevrage / abattage.
                        </li>
                        <li>
                          <strong>Coût au kg :</strong> Économie de {formatFCFA(Math.abs(c1CostPerKg - c2CostPerKg))} sur chaque kg de viande produit.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUB-TAB: REAL VS FORECAST COMPARISON (GRAPHIC LINE CHART) */}
      {activeSubTab === "real_vs_forecast" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <span>Outil de Comparaison Visuelle : Coûts Réels Constatés vs Prévisions Plan 5 Ans</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Graphique linéaire comparant les coûts de production mensuels réels (FCFA) aux objectifs théoriques définis dans le Business Plan quinquennal.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Conformité Budget : -0,87% d'économie globale</span>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block">Coûts Cumulés Prévisions 5 Ans</span>
              <span className="text-xl font-black text-amber-400">41 550 000 FCFA</span>
              <span className="text-[10px] text-slate-300 font-normal block">Total prévisionnel sur 12 mois écoulés</span>
            </div>

            <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 space-y-1">
              <span className="text-emerald-300 text-[11px] uppercase tracking-wider block">Coûts de Production Réels Constatés</span>
              <span className="text-xl font-black text-emerald-400">41 190 000 FCFA</span>
              <span className="text-[10px] text-emerald-200 font-normal block">Saisies de dépense consolidées</span>
            </div>

            <div className="bg-teal-950 text-white p-4 rounded-2xl border border-teal-800 space-y-1">
              <span className="text-teal-300 text-[11px] uppercase tracking-wider block">Écart Global & Marge Économisée</span>
              <span className="text-xl font-black text-teal-300">-360 000 FCFA (-0,87%)</span>
              <span className="text-[10px] text-teal-200 font-normal block">✅ Économie nette sous budget prévisionnel</span>
            </div>
          </div>

          {/* LINE CHART: REAL VS FORECAST COSTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider">
              <span>Évolution Mensuelle des Coûts : Réel vs Prévisions (Graphique Linéaire)</span>
              <div className="flex items-center space-x-4 text-[11px] font-bold">
                <span className="flex items-center space-x-1.5 text-amber-600">
                  <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
                  <span>Prévisions Plan 5 Ans</span>
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-600">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
                  <span>Coûts Réels Constatés</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan (M1)", forecastCost: 3200000, realCost: 3120000, variance: -80000 },
                    { month: "Fév (M2)", forecastCost: 3250000, realCost: 3280000, variance: +30000 },
                    { month: "Mar (M3)", forecastCost: 3300000, realCost: 3410000, variance: +110000 },
                    { month: "Avr (M4)", forecastCost: 3350000, realCost: 3290000, variance: -60000 },
                    { month: "Mai (M5)", forecastCost: 3400000, realCost: 3310000, variance: -90000 },
                    { month: "Juin (M6)", forecastCost: 3450000, realCost: 3420000, variance: -30000 },
                    { month: "Juil (M7)", forecastCost: 3500000, realCost: 3480000, variance: -20000 },
                    { month: "Août (M8)", forecastCost: 3550000, realCost: 3510000, variance: -40000 },
                    { month: "Sept (M9)", forecastCost: 3600000, realCost: 3590000, variance: -10000 },
                    { month: "Oct (M10)", forecastCost: 3650000, realCost: 3620000, variance: -30000 },
                    { month: "Nov (M11)", forecastCost: 3700000, realCost: 3680000, variance: -20000 },
                    { month: "Déc (M12)", forecastCost: 3800000, realCost: 3750000, variance: -50000 },
                  ]}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(2)}M`} />
                  <Tooltip formatter={(value: any) => formatFCFA(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
                  <Line
                    type="monotone"
                    dataKey="forecastCost"
                    name="Prévisions Plan 5 Ans (FCFA)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="realCost"
                    name="Coûts Réels Constatés (FCFA)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Monthly Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Mois Écoulé</th>
                  <th className="p-3">Prévision Plan 5 Ans</th>
                  <th className="p-3">Coût Réel Constaté</th>
                  <th className="p-3">Écart (FCFA)</th>
                  <th className="p-3">Explication & Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {[
                  { month: "Janvier (M1)", forecastCost: 3200000, realCost: 3120000, notes: "Négociation gros volume aliment poussin" },
                  { month: "Février (M2)", forecastCost: 3250000, realCost: 3280000, notes: "Achat imprévu désinfectant pédiluve" },
                  { month: "Mars (M3)", forecastCost: 3300000, realCost: 3410000, notes: "Hausse temporaire du cours du maïs" },
                  { month: "Avril (M4)", forecastCost: 3350000, realCost: 3290000, notes: "Optimization formulation aliment par l'IA" },
                  { month: "Mai (M5)", forecastCost: 3400000, realCost: 3310000, notes: "Économies d'énergie chauffage poussinière" },
                  { month: "Juin (M6)", forecastCost: 3450000, realCost: 3420000, notes: "Excellente conversion IC sur lot porcs" },
                  { month: "Juillet (M7)", forecastCost: 3500000, realCost: 3480000, notes: "Budget vétérinaire sous contrôle" },
                ].map((row, idx) => {
                  const varFCFA = row.realCost - row.forecastCost;
                  const isSaved = varFCFA <= 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{row.month}</td>
                      <td className="p-3 font-mono text-slate-700">{formatFCFA(row.forecastCost)}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{formatFCFA(row.realCost)}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${isSaved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {varFCFA > 0 ? `+${formatFCFA(varFCFA)}` : formatFCFA(varFCFA)}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px] italic">{row.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AI FINANCIAL AUDIT */}
      {activeSubTab === "ai_audit" && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-amber-500 rounded-xl text-slate-950 shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center space-x-2">
                <span>Auditeur Financier IA & Analyste de Rentabilité Gemini</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300">
                Obtenez des audits instantanés, des conseils pour optimiser votre BFR ou baisser votre FCR.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() =>
                handleAskFinancialAI(
                  "Réalise un audit complet du P&L actuel, identifie le poste de charge le plus critique et donne 3 leviers pour augmenter la marge EBITDA de 5%."
                )
              }
              className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
            >
              <span>📊 Audit du P&L & Levieu de marge EBITDA</span>
            </button>

            <button
              onClick={() =>
                handleAskFinancialAI(
                  "Quelle est la stratégie optimale de paiement des fournisseurs pour optimiser notre BFR en phase de démarrage M1-M3 ?"
                )
              }
              className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
            >
              <span>💳 Stratégie de BFR & Négociation fournisseurs</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Posez votre question financière à l'IA (ex: Quel est l'impact d'une hausse de 10% du prix du soja ?)..."
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskFinancialAI()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => handleAskFinancialAI()}
              disabled={isAiLoading || !aiPromptInput.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition-all shrink-0"
            >
              {isAiLoading ? (
                <span>Analyse...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyser</span>
                </>
              )}
            </button>
          </div>

          {aiResponse && (
            <div className="p-5 bg-slate-800/90 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs">
                <Bot className="w-4 h-4" />
                <span>Recommandation de l'Auditeur Financier IA Gemini :</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
