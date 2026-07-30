import React, { useState } from "react";
import {
  BatchFeedingRecord,
  FeedingStandard,
  UnitCosts,
  AIDecisionAdvice,
  WeightFeedRule,
  LotWeighingSample,
} from "../types";
import {
  avicultureGrowthStandards,
  porcicultureGrowthStandards,
  defaultBatchFeedingRecords,
  defaultWeightFeedRules,
  getRecommendedFeedByWeight,
} from "../data/feedGrowthData";
import { getApiUrl } from "../utils/api";
import { formatFCFA } from "../utils/formatters";
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Zap,
  Droplets,
  Calendar,
  Utensils,
  Wheat,
  Activity,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Layers,
  Check,
  Trash2,
  Sliders,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  PackageX,
  ShoppingBag,
  X,
  Minus,
  Calculator,
  DollarSign,
  Users,
  Thermometer,
  Printer,
  Copy,
  FileText,
  Award,
  Flame,
} from "lucide-react";

interface FeedGrowthManagementViewProps {
  unitCosts: UnitCosts;
  initialSpecies?: "Tous" | "Aviculture" | "Porciculture";
}

export const FeedGrowthManagementView: React.FC<FeedGrowthManagementViewProps> = ({
  unitCosts,
  initialSpecies = "Tous",
}) => {
  // Species Filter
  const [speciesFilter, setSpeciesFilter] = useState<"Tous" | "Aviculture" | "Porciculture">(
    initialSpecies
  );

  // Active Sub Tab
  const [activeTab, setActiveTab] = useState<
    "auto_weight_feed" | "batches" | "simulator" | "ration_formulation_sim" | "standards" | "ai"
  >("auto_weight_feed");

  // --- CORN, SOYBEAN & CAKES RATION FORMULATION SIMULATOR STATE ---
  const [rationCornPercent, setRationCornPercent] = useState<number>(60); // 60% Maïs
  const [rationSoybeanPercent, setRationSoybeanPercent] = useState<number>(20); // 20% Soja
  const [rationCakesPercent, setRationCakesPercent] = useState<number>(12); // 12% Tourteaux (Palmiste/Coton) & Sons
  const [rationFishPercent, setRationFishPercent] = useState<number>(3); // 3% Farine de poisson
  const [rationPremixPercent, setRationPremixPercent] = useState<number>(5); // 5% Premix/Concentré CMV

  // Raw material cost inputs (FCFA / kg)
  const [rawCornPriceFCFA, setRawCornPriceFCFA] = useState<number>(unitCosts.cornPricePerKg || 170);
  const [rawSoybeanPriceFCFA, setRawSoybeanPriceFCFA] = useState<number>(unitCosts.soybeanPricePerKg || 350);
  const [rawCakesPriceFCFA, setRawCakesPriceFCFA] = useState<number>(unitCosts.branPricePerKg || 120);
  const [rawFishPriceFCFA, setRawFishPriceFCFA] = useState<number>(320);
  const [rawPremixPriceFCFA, setRawPremixPriceFCFA] = useState<number>(unitCosts.premixPricePerKg || 1200);

  // Commercial Feed Price comparison
  const [commercialBagPriceFCFA, setCommercialBagPriceFCFA] = useState<number>(18500); // 18 500 FCFA le sac 50kg (370 FCFA/kg)

  // Batch simulation metrics
  const [formulationHeadCount, setFormulationHeadCount] = useState<number>(1000); // 1 000 sujets
  const [formulationDailyGrams, setFormulationDailyGrams] = useState<number>(120); // 120 g / sujet / jour
  const [formulationPeriodDays, setFormulationPeriodDays] = useState<number>(30); // 30 jours
  const [formulationFCR, setFormulationFCR] = useState<number>(1.75); // Indice de consommation 1.75

  // Ration formulation calculations
  const totalRationPercent =
    rationCornPercent + rationSoybeanPercent + rationCakesPercent + rationFishPercent + rationPremixPercent;
  const isRationPercentValid = Math.abs(totalRationPercent - 100) < 0.1;

  // Cost per kg of formulated ration
  const formulatedCostPerKgFCFA =
    (rationCornPercent / 100) * rawCornPriceFCFA +
    (rationSoybeanPercent / 100) * rawSoybeanPriceFCFA +
    (rationCakesPercent / 100) * rawCakesPriceFCFA +
    (rationFishPercent / 100) * rawFishPriceFCFA +
    (rationPremixPercent / 100) * rawPremixPriceFCFA;

  const formulatedBagPriceFCFA = formulatedCostPerKgFCFA * 50;
  const commercialCostPerKgFCFA = commercialBagPriceFCFA / 50;

  const bagSavingsFCFA = commercialBagPriceFCFA - formulatedBagPriceFCFA;
  const bagSavingsPercent = commercialBagPriceFCFA > 0 ? (bagSavingsFCFA / commercialBagPriceFCFA) * 100 : 0;

  // Batch totals
  const dailyLotConsumptionKg = (formulationHeadCount * formulationDailyGrams) / 1000;
  const totalPeriodConsumptionKg = dailyLotConsumptionKg * formulationPeriodDays;
  const totalPeriodBags = Math.ceil(totalPeriodConsumptionKg / 50);

  const totalFormulatedPeriodCostFCFA = totalPeriodConsumptionKg * formulatedCostPerKgFCFA;
  const totalCommercialPeriodCostFCFA = totalPeriodConsumptionKg * commercialCostPerKgFCFA;
  const totalNetSavingsFCFA = totalCommercialPeriodCostFCFA - totalFormulatedPeriodCostFCFA;

  const feedCostPerKgGainFormulated = formulatedCostPerKgFCFA * formulationFCR;
  const feedCostPerKgGainCommercial = commercialCostPerKgFCFA * formulationFCR;

  // Batches State
  const [batches, setBatches] = useState<BatchFeedingRecord[]>(defaultBatchFeedingRecords);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || "");

  // Auto Weight-Feed Session State
  const [autoSelectedBatchId, setAutoSelectedBatchId] = useState<string>(
    defaultBatchFeedingRecords[0]?.id || ""
  );
  const [autoSpecies, setAutoSpecies] = useState<"Aviculture" | "Porciculture">("Porciculture");
  const [autoHeadCount, setAutoHeadCount] = useState<number>(80);
  const [autoWeightMode, setAutoWeightMode] = useState<"samples" | "direct">("samples");
  const [autoDirectWeightGrams, setAutoDirectWeightGrams] = useState<number>(18500);

  // Sample weighing records for batch
  const [samples, setSamples] = useState<LotWeighingSample[]>([
    { id: "s1", subjectLabel: "Sujet #1 (Porcelet)", weightGrams: 17800 },
    { id: "s2", subjectLabel: "Sujet #2 (Porcelet)", weightGrams: 19200 },
    { id: "s3", subjectLabel: "Sujet #3 (Porcelet)", weightGrams: 18400 },
    { id: "s4", subjectLabel: "Sujet #4 (Porcelet)", weightGrams: 18900 },
    { id: "s5", subjectLabel: "Sujet #5 (Porcelet)", weightGrams: 18200 },
  ]);
  const [newSampleKgInput, setNewSampleKgInput] = useState<string>("");
  const [autoNotification, setAutoNotification] = useState<string | null>(null);

  // Selected Batch Detail
  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  // Simulator Custom State
  const [simSpecies, setSimSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [simAge, setSimAge] = useState<number>(28); // 28 days for chicken, or 16 weeks for pig
  const [simHeadCount, setSimHeadCount] = useState<number>(1000);
  const [simActualWeight, setSimActualWeight] = useState<number>(1320); // grams
  const [simDailyFeed, setSimDailyFeed] = useState<number>(110); // grams / head / day
  const [simFeedType, setSimFeedType] = useState<
    "Pré-démarrage" | "Démarrage" | "Croissance" | "Finition" | "Gestante" | "Lactante"
  >("Croissance");
  const [simRegimen, setSimRegimen] = useState<
    "À volonté (Ad libitum)" | "Rationné (Strict)" | "Séquentiel" | "Rattrapage Compensateur"
  >("Rationné (Strict)");

  // --- RATIONING & FCR SIMULATOR STATE ---
  const [rationSpecies, setRationSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [rationHeadCount, setRationHeadCount] = useState<number>(1000); // 1 000 sujets
  const [targetGainKgPerHead, setTargetGainKgPerHead] = useState<number>(2.2); // 2.2 kg gain target
  const [bagPriceFCFA, setBagPriceFCFA] = useState<number>(18500); // 18 500 FCFA / sac 50kg

  // Customizable FCR (Indice de Consommation) per Phase
  const [fcrDemarrage, setFcrDemarrage] = useState<number>(1.35);
  const [fcrCroissance, setFcrCroissance] = useState<number>(1.65);
  const [fcrFinition, setFcrFinition] = useState<number>(1.85);

  // Phase Durations (Days)
  const [daysDemarrage, setDaysDemarrage] = useState<number>(14);
  const [daysCroissance, setDaysCroissance] = useState<number>(14);
  const [daysFinition, setDaysFinition] = useState<number>(14);

  // New Batch Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchSpecies, setNewBatchSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [newBatchBreed, setNewBatchBreed] = useState("Cobb 500");
  const [newBatchHeadCount, setNewBatchHeadCount] = useState(500);
  const [newBatchAge, setNewBatchAge] = useState(21);
  const [newBatchActualWeight, setNewBatchActualWeight] = useState(850);
  const [newBatchDailyFeed, setNewBatchDailyFeed] = useState(80);

  // --- FEED STOCK INVENTORY & LOW STOCK ALERT STATE ---
  const [feedStock, setFeedStock] = useState<Record<string, number>>({
    "Pré-démarrage": 250, // 250 kg (5 sacs de 50kg)
    "Démarrage": 400,     // 400 kg (8 sacs)
    "Croissance": 500,    // 500 kg (10 sacs)
    "Finition": 850,      // 850 kg (17 sacs)
    "Gestante": 350,      // 350 kg (7 sacs)
    "Lactante": 200,      // 200 kg (4 sacs)
  });

  const [stockHorizonDays, setStockHorizonDays] = useState<number>(14); // 14 jours par défaut
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);

  // AI Decision State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiPromptCustom, setAiPromptCustom] = useState("");

  // Get matching standard for current simulator inputs
  const currentStandards =
    simSpecies === "Aviculture" ? avicultureGrowthStandards : porcicultureGrowthStandards;

  // Find standard for current age or closest lower age
  const matchedStandard =
    currentStandards.find((s) => s.ageDaysOrWeeks >= simAge) ||
    currentStandards[currentStandards.length - 1];

  const expectedWeight = matchedStandard ? matchedStandard.expectedWeightGrams : 1480;
  const expectedFeed = matchedStandard ? matchedStandard.recommendedDailyFeedGrams : 125;

  // Calculations for Gap Analysis
  const weightGapGrams = simActualWeight - expectedWeight;
  const weightGapPercent = expectedWeight > 0 ? (weightGapGrams / expectedWeight) * 100 : 0;

  const feedGapGrams = simDailyFeed - expectedFeed;
  const feedGapPercent = expectedFeed > 0 ? (feedGapGrams / expectedFeed) * 100 : 0;

  // Estimate FCR (Indice de Consommation)
  // IC = Total Aliments / Gain de poids
  const estimatedFCR =
    simActualWeight > 0
      ? (simDailyFeed * simAge) / simActualWeight
      : matchedStandard.targetFCR;

  // Status Badge Determination
  const getGrowthStatus = (gapPercent: number) => {
    if (gapPercent >= 5) return { label: "Surcroissance (+5%+)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (gapPercent >= -5) return { label: "Conforme à la Norme (±5%)", color: "bg-blue-100 text-blue-800 border-blue-300" };
    if (gapPercent >= -12) return { label: "Retard Modéré (-5% à -12%)", color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "Retard Critique (<-12%)", color: "bg-rose-100 text-rose-800 border-rose-300" };
  };

  const statusInfo = getGrowthStatus(weightGapPercent);

  // --- CALCULATIONS FOR AUTOMATIC WEIGHT-FEED ALLOCATION SESSION ---
  const activeAutoBatch = batches.find((b) => b.id === autoSelectedBatchId);

  // Synchronize when batch selection changes
  const handleSelectAutoBatch = (batchId: string) => {
    setAutoSelectedBatchId(batchId);
    const found = batches.find((b) => b.id === batchId);
    if (found) {
      setAutoSpecies(found.species);
      setAutoHeadCount(found.headCount);
      if (autoWeightMode === "direct") {
        setAutoDirectWeightGrams(found.actualWeightGrams);
      }
    }
  };

  // Sample weighing stats
  const sampleCount = samples.length;
  const sampleAvgGrams =
    sampleCount > 0
      ? samples.reduce((acc, curr) => acc + curr.weightGrams, 0) / sampleCount
      : 18500;
  const sampleMinGrams = sampleCount > 0 ? Math.min(...samples.map((s) => s.weightGrams)) : 0;
  const sampleMaxGrams = sampleCount > 0 ? Math.max(...samples.map((s) => s.weightGrams)) : 0;

  const effectiveWeightGrams =
    autoWeightMode === "samples" ? sampleAvgGrams : autoDirectWeightGrams;

  // Recommended feed rule based on weight
  const recommendedRule = getRecommendedFeedByWeight(autoSpecies, effectiveWeightGrams);

  // Unit feed price calculation (in FCFA/kg)
  const feedCostPerKg =
    autoSpecies === "Aviculture"
      ? recommendedRule.feedCategoryPhase === "Pré-démarrage"
        ? unitCosts.alimentPredemarrage
        : recommendedRule.feedCategoryPhase === "Finition"
        ? unitCosts.alimentFinition
        : unitCosts.alimentCroissance
      : recommendedRule.feedCategoryPhase === "Pré-démarrage"
      ? unitCosts.alimentPredemarrage * 1.12
      : recommendedRule.feedCategoryPhase === "Finition"
      ? unitCosts.alimentFinition
      : unitCosts.alimentCroissance;

  const totalLotDailyFeedKg = (autoHeadCount * recommendedRule.recommendedDailyFeedGrams) / 1000;
  const totalLotDailyFeedCostFCFA = totalLotDailyFeedKg * feedCostPerKg;

  // Active Auto Batch Predicted Feed vs Available Stock
  const autoRequiredFeedCategory = recommendedRule.feedCategoryPhase; // e.g. "Croissance"
  const autoDailyFeedKg = totalLotDailyFeedKg; // total daily feed for this lot (kg)
  const autoPredictedFeedKg = autoDailyFeedKg * stockHorizonDays; // predicted feed needed over projection horizon (kg)
  const autoAvailableStockKg = feedStock[autoRequiredFeedCategory] || 0;
  const autoStockDeficitKg = autoPredictedFeedKg - autoAvailableStockKg;
  const isAutoStockLow = autoStockDeficitKg > 0 && autoDailyFeedKg > 0;
  const autoStockAutonomyDays = autoDailyFeedKg > 0 ? autoAvailableStockKg / autoDailyFeedKg : 999;
  const autoDeficitBags = Math.max(0, Math.ceil(autoStockDeficitKg / 50));
  const autoDeficitCostFCFA = autoStockDeficitKg * feedCostPerKg;

  // --- NUTRITIONAL & DAILY RATION CALCULATOR BY LIVE WEIGHT STATE ---
  const [calcAmbientTemp, setCalcAmbientTemp] = useState<number>(28); // 28°C default ambient temperature
  const [calcMealsPerDay, setCalcMealsPerDay] = useState<number>(3); // 3 meals per day
  const [isNutritionReportModalOpen, setIsNutritionReportModalOpen] = useState<boolean>(false);
  const [reportCopied, setReportCopied] = useState<boolean>(false);

  // --- DETAILED NUTRITIONAL & RATION CALCULATIONS BASED ON LIVE WEIGHT ---
  const liveWeightKg = effectiveWeightGrams / 1000;

  // Thermal stress impact coefficients
  const isHeatStress = calcAmbientTemp > (autoSpecies === "Porciculture" ? 25 : 24);
  const tempDelta = Math.max(0, calcAmbientTemp - (autoSpecies === "Porciculture" ? 25 : 24));
  
  // Feed intake thermal adjustment factor (appetite reduces in heat)
  const feedTempFactor = Math.max(0.70, 1 - tempDelta * (autoSpecies === "Porciculture" ? 0.015 : 0.018));
  
  // Water intake thermal adjustment factor (water increases in heat)
  const waterTempFactor = 1 + tempDelta * (autoSpecies === "Porciculture" ? 0.04 : 0.05);

  // Base daily ration per head from standard weight rule (g/head/day)
  const baseRuleFeedGrams = recommendedRule.recommendedDailyFeedGrams;
  const actualAdjustedDailyFeedGrams = Math.round(baseRuleFeedGrams * feedTempFactor);

  // Daily Intake Capacity (% of live weight)
  const dailyIntakePctLiveWeight = liveWeightKg > 0 ? ((actualAdjustedDailyFeedGrams / 1000) / liveWeightKg) * 100 : 0;

  // Daily Metabolizable Energy (EM) per head (kcal/head/day)
  const dailyEnergyKcalPerHead = Math.round((actualAdjustedDailyFeedGrams / 1000) * recommendedRule.energyKcal);

  // Daily Crude Protein (PB) per head (g/head/day)
  const dailyProteinGramsPerHead = (actualAdjustedDailyFeedGrams * (recommendedRule.proteinPercent / 100));

  // Daily Digestible Lysine per head (g/head/day)
  const lysinePctOfPB = autoSpecies === "Porciculture" ? 0.068 : 0.060;
  const dailyLysineGramsPerHead = (dailyProteinGramsPerHead * lysinePctOfPB);

  // Daily Calcium & Phosphorus per head (g/head/day)
  const calciumPct = autoSpecies === "Porciculture" ? 0.0075 : 0.0090;
  const phosphorusPct = autoSpecies === "Porciculture" ? 0.0042 : 0.0045;
  const dailyCalciumGramsPerHead = (actualAdjustedDailyFeedGrams * calciumPct);
  const dailyPhosphorusGramsPerHead = (actualAdjustedDailyFeedGrams * phosphorusPct);

  // Daily Water requirement per head (L/head/day)
  const baseWaterToFeedRatio = autoSpecies === "Porciculture" ? 3.2 : 2.1;
  const dailyWaterLitersPerHead = ((actualAdjustedDailyFeedGrams / 1000) * baseWaterToFeedRatio * waterTempFactor);

  // Estimated GMQ (Gain Moyen Quotidien en g/jour) & FCR (Indice de Consommation)
  let estimatedGMQGrams = 0;
  let estimatedFCRRatio = 1.5;
  if (autoSpecies === "Porciculture") {
    if (liveWeightKg <= 8) { estimatedGMQGrams = 320; estimatedFCRRatio = 1.25; }
    else if (liveWeightKg <= 15) { estimatedGMQGrams = 480; estimatedFCRRatio = 1.45; }
    else if (liveWeightKg <= 30) { estimatedGMQGrams = 620; estimatedFCRRatio = 1.95; }
    else if (liveWeightKg <= 60) { estimatedGMQGrams = 780; estimatedFCRRatio = 2.45; }
    else { estimatedGMQGrams = 850; estimatedFCRRatio = 3.10; }
  } else {
    if (liveWeightKg <= 0.25) { estimatedGMQGrams = 30; estimatedFCRRatio = 0.95; }
    else if (liveWeightKg <= 1.1) { estimatedGMQGrams = 52; estimatedFCRRatio = 1.25; }
    else if (liveWeightKg <= 2.2) { estimatedGMQGrams = 68; estimatedFCRRatio = 1.45; }
    else { estimatedGMQGrams = 75; estimatedFCRRatio = 1.65; }
  }

  // Batch Aggregates with Thermal Factor
  const totalBatchDailyFeedKgAdjusted = (autoHeadCount * actualAdjustedDailyFeedGrams) / 1000;
  const totalBatchDailyWaterLitersAdjusted = autoHeadCount * dailyWaterLitersPerHead;
  const totalBatchDailyCostFCFAAdjusted = totalBatchDailyFeedKgAdjusted * feedCostPerKg;
  const totalBatchMonthlyCostFCFAAdjusted = totalBatchDailyCostFCFAAdjusted * 30;
  const feedCostPerKgGainFCFAAdjusted = estimatedGMQGrams > 0 ? ((actualAdjustedDailyFeedGrams / estimatedGMQGrams) * feedCostPerKg) : 0;

  // Meal Distribution Breakdown
  const getMealBreakdown = () => {
    if (calcMealsPerDay === 2) {
      return [
        { name: "Repas #1 - Matin Tôt (06:00)", pct: 50, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.50), kgLot: (totalBatchDailyFeedKgAdjusted * 0.50) },
        { name: "Repas #2 - Soir Frais (17:00)", pct: 50, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.50), kgLot: (totalBatchDailyFeedKgAdjusted * 0.50) },
      ];
    }
    if (calcMealsPerDay === 3) {
      return [
        { name: "Repas #1 - Matin Tôt (06:00)", pct: 40, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.40), kgLot: (totalBatchDailyFeedKgAdjusted * 0.40) },
        { name: "Repas #2 - Midi (12:00)", pct: 30, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.30), kgLot: (totalBatchDailyFeedKgAdjusted * 0.30) },
        { name: "Repas #3 - Soir Frais (17:30)", pct: 30, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.30), kgLot: (totalBatchDailyFeedKgAdjusted * 0.30) },
      ];
    }
    return [
      { name: "Repas #1 - Matin Tôt (06:00)", pct: 30, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.30), kgLot: (totalBatchDailyFeedKgAdjusted * 0.30) },
      { name: "Repas #2 - Matinée (10:30)", pct: 25, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.25), kgLot: (totalBatchDailyFeedKgAdjusted * 0.25) },
      { name: "Repas #3 - Début Après-Midi (14:30)", pct: 25, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.25), kgLot: (totalBatchDailyFeedKgAdjusted * 0.25) },
      { name: "Repas #4 - Soir (18:30)", pct: 20, gramsHead: Math.round(actualAdjustedDailyFeedGrams * 0.20), kgLot: (totalBatchDailyFeedKgAdjusted * 0.20) },
    ];
  };

  const mealsBreakdown = getMealBreakdown();

  // Farm-wide Low Stock Alerts for active categories
  const farmStockAlerts = Object.keys(feedStock).map((phase) => {
    const matchingBatches = batches.filter((b) => b.currentFeedType === phase);
    const dailyDemandKg = matchingBatches.reduce(
      (acc, b) => acc + (b.headCount * b.actualDailyFeedGrams) / 1000,
      0
    );
    const predictedDemandKg = dailyDemandKg * stockHorizonDays;
    const availKg = feedStock[phase] || 0;
    const deficitKg = predictedDemandKg - availKg;
    const autonomyDays = dailyDemandKg > 0 ? availKg / dailyDemandKg : 999;

    return {
      phase,
      matchingBatchesCount: matchingBatches.length,
      dailyDemandKg,
      predictedDemandKg,
      availKg,
      deficitKg,
      isLow: deficitKg > 0 && dailyDemandKg > 0,
      autonomyDays,
    };
  }).filter((a) => a.isLow);

  // Add sample handler
  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    const valKg = parseFloat(newSampleKgInput);
    if (isNaN(valKg) || valKg <= 0) return;
    const newSample: LotWeighingSample = {
      id: `sample-${Date.now()}`,
      subjectLabel: `Sujet #${samples.length + 1}`,
      weightGrams: Math.round(valKg * 1000),
    };
    setSamples([...samples, newSample]);
    setNewSampleKgInput("");
  };

  // Remove sample
  const handleRemoveSample = (sampleId: string) => {
    setSamples(samples.filter((s) => s.id !== sampleId));
  };

  // Apply transition to batch
  const handleApplyAutoFeedToBatch = () => {
    if (!autoSelectedBatchId) return;
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === autoSelectedBatchId) {
          return {
            ...b,
            currentFeedType: recommendedRule.feedCategoryPhase,
            actualDailyFeedGrams: recommendedRule.recommendedDailyFeedGrams,
            actualWeightGrams: Math.round(effectiveWeightGrams),
            lastWeighingDate: new Date().toISOString().split("T")[0],
            notes: `Mise à jour automatique par pesée (${(effectiveWeightGrams / 1000).toFixed(2)} kg) -> ${recommendedRule.feedTypeName}`,
          };
        }
        return b;
      })
    );
    setAutoNotification(
      `Le lot "${activeAutoBatch?.batchName || "sélectionné"}" a été mis à jour avec succès : passage à l'Aliment "${recommendedRule.feedTypeName}" (Ration : ${recommendedRule.recommendedDailyFeedGrams} g/sujet/j).`
    );
    setTimeout(() => setAutoNotification(null), 7000);
  };

  // Filtered Records for Active Tab
  const filteredBatches = batches.filter((b) =>
    speciesFilter === "Tous" ? true : b.species === speciesFilter
  );

  // Handle Load Batch into Simulator
  const handleLoadBatchIntoSimulator = (batch: BatchFeedingRecord) => {
    setSimSpecies(batch.species);
    setSimAge(batch.ageDaysOrWeeks);
    setSimHeadCount(batch.headCount);
    setSimActualWeight(batch.actualWeightGrams);
    setSimDailyFeed(batch.actualDailyFeedGrams);
    setSimFeedType(batch.currentFeedType);
    setSimRegimen(batch.feedingRegimen);
    setActiveTab("simulator");
  };

  // Submit New Batch
  const handleAddBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st =
      newBatchSpecies === "Aviculture"
        ? avicultureGrowthStandards.find((s) => s.ageDaysOrWeeks >= newBatchAge) || avicultureGrowthStandards[2]
        : porcicultureGrowthStandards.find((s) => s.ageDaysOrWeeks >= newBatchAge) || porcicultureGrowthStandards[2];

    const record: BatchFeedingRecord = {
      id: `batch-${Date.now()}`,
      batchName: newBatchName || `Bande ${newBatchSpecies} #${batches.length + 1}`,
      species: newBatchSpecies,
      breed: newBatchBreed,
      headCount: newBatchHeadCount,
      ageDaysOrWeeks: newBatchAge,
      ageLabel: newBatchSpecies === "Aviculture" ? `Jour ${newBatchAge}` : `Semaine ${newBatchAge}`,
      actualWeightGrams: newBatchActualWeight,
      expectedWeightGrams: st.expectedWeightGrams,
      actualDailyFeedGrams: newBatchDailyFeed,
      expectedDailyFeedGrams: st.recommendedDailyFeedGrams,
      currentFeedType: st.phase as any,
      feedingRegimen: "Rationné (Strict)",
      waterConsumptionLitersPerHead: newBatchSpecies === "Aviculture" ? 0.25 : 6.0,
      lastWeighingDate: new Date().toISOString().split("T")[0],
      notes: "Pesée enregistrée via le module de gestion des modes alimentaires.",
    };

    setBatches([record, ...batches]);
    setSelectedBatchId(record.id);
    setIsAddModalOpen(false);
  };

  // Call Gemini AI for Feeding Decision
  const handleConsultAiDecision = async (customPrompt?: string) => {
    setIsAiLoading(true);
    setAiAdvice(null);

    const targetPrompt =
      customPrompt ||
      `Analyse la situation d'élevage suivante et génère des recommandations précises d'ajustement du mode alimentaire et de la ration :
- Espèce : ${simSpecies} (Race : ${simSpecies === "Aviculture" ? "Cobb 500" : "Porc Hybride"})
- Effectif : ${simHeadCount} sujets
- Âge actuel : ${simAge} ${simSpecies === "Aviculture" ? "jours" : "semaines"}
- Poids Réel Mesuré : ${simActualWeight} g (${(simActualWeight / 1000).toFixed(2)} kg)
- Poids Prévu (Norme Standard) : ${expectedWeight} g (${(expectedWeight / 1000).toFixed(2)} kg)
- Écart de poids : ${weightGapGrams} g (${weightGapPercent.toFixed(1)} %)
- Ration actuelle distribuée : ${simDailyFeed} g/sujet/jour (Norme : ${expectedFeed} g)
- Indice de Consommation estimé (IC) : ${estimatedFCR.toFixed(2)} (Cible : ${matchedStandard.targetFCR})
- Type d'aliment actuel : ${simFeedType}
- Mode de distribution actuel : ${simRegimen}

Fournis :
1. Un diagnostic vétérinaire et zootechnique de la cause de cet écart.
2. La décision recommandée sur le Mode Alimentaire (Rationnement strict, Ad Libitum, Rattrapage ou Séquentiel).
3. Le type d'aliment idéal (% Protéines Brutes, Énergie, minéraux, lysine/méthionine) et la ration exacte en g/jour.
4. Les ajouts recommandés dans l'eau de boisson (vitamines anti-stress, hépatoprotecteur, acidifiant ou vermifuge).
5. Un plan d'action opérationnel sur 7 à 14 jours pour recouvrer la courbe standard de croissance.`;

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetPrompt,
          context: {
            simSpecies,
            simAge,
            weightGapPercent,
            estimatedFCR,
            simFeedType,
          },
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiAdvice(data.answer);
      } else {
        setAiAdvice(data.error || "Erreur de réponse du serveur IA.");
      }
    } catch (err: any) {
      setAiAdvice("Erreur lors de la consultation de l'IA : " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wide">
                Gains de Poids & Nutrition
              </span>
              <span className="text-emerald-300 text-xs font-medium">• Ivoire Élevage Holding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gestion des Modes Alimentaires & Analyse Poids Réel / Prévu
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Comparez le poids mesuré aux normes théoriques de croissance (Cobb 500 / Porc Hybride), détectez les écarts et activez le module IA pour réajuster vos rations et vos programmes nutritionnels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsStockModalOpen(true)}
              className={`flex items-center space-x-2 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer ${
                isAutoStockLow || farmStockAlerts.length > 0
                  ? "bg-rose-500 hover:bg-rose-400 text-white animate-pulse ring-2 ring-rose-300"
                  : "bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>📦 Stock Aliment ({stockHorizonDays}j)</span>
              {(isAutoStockLow || farmStockAlerts.length > 0) && (
                <span className="px-2 py-0.5 bg-white text-rose-950 text-[10px] font-black rounded-full">
                  ⚠️ Stock Bas
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Saisir une Nouvelle Pesée</span>
            </button>
          </div>
        </div>

        {/* Species Filter Switcher */}
        <div className="mt-6 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-300">Afficher par espèce :</span>
            <div className="flex bg-emerald-950/80 p-1 rounded-xl border border-emerald-800">
              <button
                onClick={() => setSpeciesFilter("Tous")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  speciesFilter === "Tous"
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                Toutes les Bandes
              </button>
              <button
                onClick={() => setSpeciesFilter("Aviculture")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  speciesFilter === "Aviculture"
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                🐔 Volet Avicole (Poulets)
              </button>
              <button
                onClick={() => setSpeciesFilter("Porciculture")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  speciesFilter === "Porciculture"
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                🐖 Volet Porcin (Porcs)
              </button>
            </div>
          </div>

          <div className="text-emerald-300 text-xs">
            {filteredBatches.length} lot(s) en suivi actif
          </div>
        </div>
      </div>

      {/* Global Low Stock Alert Banner */}
      {(isAutoStockLow || farmStockAlerts.length > 0) && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border-2 border-rose-500/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-rose-500/30 text-rose-300 rounded-2xl shrink-0 mt-0.5">
              <PackageX className="w-7 h-7 text-rose-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="px-2.5 py-0.5 bg-rose-500 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider">
                  🚨 ALERTE STOCK BAS D'ALIMENT EN MAGASIN
                </span>
                <span className="text-xs font-bold text-rose-300">
                  • Projection sur {stockHorizonDays} Jours de Consommation
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white">
                {isAutoStockLow ? (
                  <>
                    La quantité d'Aliment <u className="text-amber-300 font-black">{autoRequiredFeedCategory}</u> prédite ({autoPredictedFeedKg.toFixed(0)} kg) dépasse le stock disponible ({autoAvailableStockKg} kg) !
                  </>
                ) : (
                  <>Rupture de stock d'aliment prédite sur {farmStockAlerts.length} catégorie(s) !</>
                )}
              </h4>
              <p className="text-xs text-rose-200 font-medium leading-relaxed">
                Rupture d'alimentation estimée dans <strong className="text-amber-300 font-black">{autoStockAutonomyDays.toFixed(1)} jours</strong> pour le lot <span className="font-extrabold text-white">"{activeAutoBatch?.batchName || "actuel"}"</span> ({autoHeadCount} sujets).
                Déficit à recharger : <strong className="text-white font-black">{autoStockDeficitKg.toFixed(0)} kg ({autoDeficitBags} sacs de 50kg)</strong> — Coût estimé : <strong className="text-amber-300 font-bold">{formatFCFA(autoDeficitCostFCFA)}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStockModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4.5 py-3 rounded-xl text-xs shrink-0 flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-slate-950" />
            <span>📦 Recharger le Stock</span>
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab("auto_weight_feed")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "auto_weight_feed"
                ? "border-emerald-600 text-slate-950 bg-emerald-50/70 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>⚡ Affectation Automatique par Poids du Lot</span>
            <span className="px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-full">
              AUTO
            </span>
          </button>

          <button
            onClick={() => setActiveTab("batches")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "batches"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Suivi des Pesées & Bandes en Élevage ({filteredBatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "simulator"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Simulateur Écart Poids & Rationnement</span>
          </button>

          <button
            onClick={() => setActiveTab("ration_formulation_sim")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ration_formulation_sim"
                ? "border-amber-500 text-slate-950 bg-amber-50 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>🥣 Formulation Ration Maïs/Soja & Coût</span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
              NOUVEAU
            </span>
          </button>

          <button
            onClick={() => setActiveTab("standards")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "standards"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Wheat className="w-4 h-4 text-blue-600" />
            <span>Normes de Croissance (Cobb500 & Porc)</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ai"
                ? "border-amber-500 text-slate-950 bg-amber-50 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bot className="w-4 h-4 text-amber-600" />
            <span>Module IA Prise de Décision Alimentaire</span>
          </button>
        </div>

        {/* SUB-TAB 0: AFFECTATION AUTOMATIQUE PAR POIDS DU LOT */}
        {activeTab === "auto_weight_feed" && (
          <div className="p-6 space-y-6">
            {/* Notification banner */}
            {autoNotification && (
              <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-bold">{autoNotification}</p>
                </div>
                <button
                  onClick={() => setAutoNotification(null)}
                  className="text-xs font-black underline text-emerald-800 hover:text-emerald-950 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

            {/* Intro Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider">
                    MODULE DE DÉCISION AUTOMATIQUE
                  </span>
                  <span className="text-emerald-300 text-xs font-semibold">• Indexé sur Grilles Zootechniques</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Affectation Automatique du Type d'Aliment selon le Poids Moyen du Lot
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  En fonction du poids moyen d'un lot ou de la pesée d'un échantillon d'animaux du même lot (porcelets ou volailles), l'application identifie automatiquement le type d'aliment exige, recalcule les ratios nutritionnels et permet une mise à jour instantanée du lot.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleSelectAutoBatch(batches[0]?.id || "")}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Lot Selection & Weighing Sample Input (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Lot Selection Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>1. Sélection du Lot en Élevage</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {batches.length} lots actifs
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choisir une Bande / Lot :
                    </label>
                    <select
                      value={autoSelectedBatchId}
                      onChange={(e) => handleSelectAutoBatch(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.species === "Porciculture" ? "🐖" : "🐔"} {b.batchName} ({b.headCount} sujets - Aliment actuel : {b.currentFeedType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Espèce :
                      </label>
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setAutoSpecies("Porciculture")}
                          className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            autoSpecies === "Porciculture"
                              ? "bg-rose-500 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          🐖 Porcin
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutoSpecies("Aviculture")}
                          className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            autoSpecies === "Aviculture"
                              ? "bg-amber-500 text-slate-950 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          🐔 Avicole
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Effectif du Lot (Sujets) :
                      </label>
                      <input
                        type="number"
                        value={autoHeadCount}
                        onChange={(e) => setAutoHeadCount(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Input Mode Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span>2. Détermination du Poids Moyen du Lot</span>
                    </h4>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAutoWeightMode("samples")}
                      className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                        autoWeightMode === "samples"
                          ? "bg-white text-emerald-900 font-black shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📊 Pesée Échantillon (5-10 sujets)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoWeightMode("direct")}
                      className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                        autoWeightMode === "direct"
                          ? "bg-white text-emerald-900 font-black shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ✏️ Poids Moyen Direct (kg)
                    </button>
                  </div>

                  {autoWeightMode === "direct" ? (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Saisir le Poids Moyen du Lot (en kg) :
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          value={(autoDirectWeightGrams / 1000).toString()}
                          onChange={(e) =>
                            setAutoDirectWeightGrams(Math.max(0, Number(e.target.value) * 1000))
                          }
                          className="flex-1 p-3 bg-emerald-50/50 border border-emerald-300 rounded-xl font-black text-lg text-emerald-900"
                        />
                        <span className="font-extrabold text-slate-700 text-sm">kg / sujet</span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Équivalent en grammes : {autoDirectWeightGrams.toLocaleString("fr-FR")} g
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Peser un échantillon d'animaux du même lot sur le terrain et saisir leur poids individuel ci-dessous :
                      </p>

                      {/* Add Sample Input */}
                      <form onSubmit={handleAddSample} className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 18.5 kg"
                          value={newSampleKgInput}
                          onChange={(e) => setNewSampleKgInput(e.target.value)}
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900"
                        />
                        <span className="text-xs font-bold text-slate-500">kg</span>
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </button>
                      </form>

                      {/* Samples List Table */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {samples.map((s, idx) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                          >
                            <span className="text-slate-600">{s.subjectLabel || `Sujet #${idx + 1}`}</span>
                            <div className="flex items-center space-x-3">
                              <span className="text-emerald-800 font-extrabold text-sm">
                                {(s.weightGrams / 1000).toFixed(2)} kg
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSample(s.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                title="Supprimer ce sujet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sample Stats Summary */}
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10px] font-extrabold text-amber-800 uppercase">Échantillon</div>
                          <div className="text-sm font-black text-slate-900">{sampleCount} sujets</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-extrabold text-amber-800 uppercase">Min - Max</div>
                          <div className="text-xs font-bold text-slate-800">
                            {(sampleMinGrams / 1000).toFixed(1)} - {(sampleMaxGrams / 1000).toFixed(1)} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-extrabold text-amber-800 uppercase">Poids Moyen</div>
                          <div className="text-sm font-black text-emerald-800">
                            {(sampleAvgGrams / 1000).toFixed(2)} kg
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Instant Automated Recommendation & Action Plan (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Result Card: Recommended Feed Type */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md p-6 space-y-5 relative overflow-hidden">
                  
                  {/* Top Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Zap className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          RÉSULTAT DU CALCUL AUTOMATIQUE
                        </span>
                        <h4 className="text-base font-black text-slate-900">
                          Aliment Indiqué pour ce Poids Moyen ({(effectiveWeightGrams / 1000).toFixed(2)} kg)
                        </h4>
                      </div>
                    </div>

                    <div className="px-3 py-1 bg-emerald-800 text-white rounded-full font-black text-xs uppercase tracking-wide">
                      Phase : {recommendedRule.feedCategoryPhase}
                    </div>
                  </div>

                  {/* Feed Name Banner */}
                  <div className="p-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl shadow-inner space-y-2">
                    <div className="text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                      Aliment Recommandé à Consommer :
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300">
                      {recommendedRule.feedTypeName}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {recommendedRule.description}
                    </p>
                  </div>

                  {/* Nutritional & Daily Ration Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Taux Protéines (PB)</div>
                      <div className="text-base font-black text-slate-900">{recommendedRule.proteinPercent}% PB</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Énergie Métabolisable</div>
                      <div className="text-base font-black text-slate-900">{recommendedRule.energyKcal} kcal</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Présentation</div>
                      <div className="text-xs font-black text-slate-800 leading-snug">{recommendedRule.presentation}</div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-0.5">
                      <div className="text-[10px] font-extrabold text-emerald-800 uppercase">Ration par Sujet</div>
                      <div className="text-base font-black text-emerald-900">
                        {recommendedRule.recommendedDailyFeedGrams} g / j
                      </div>
                    </div>
                  </div>

                  {/* Total Lot Financial & Quantity Calculations */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                      <span>CALCUL DE LA CONSOMMATION DU LOT ({autoHeadCount} SUJETS)</span>
                      <span>Prix unitaire : {formatFCFA(feedCostPerKg)} / kg</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold">Besoin Total Quotidien :</div>
                        <div className="text-xl font-black text-white">
                          {totalLotDailyFeedKg.toFixed(1)} kg / jour
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold">Coût Alimentaire Quotidien du Lot :</div>
                        <div className="text-xl font-black text-emerald-400">
                          {formatFCFA(totalLotDailyFeedCostFCFA)} / jour
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Level & Low Stock Alert Notification Card */}
                  <div className={`p-4.5 rounded-2xl border space-y-3 transition-all ${
                    isAutoStockLow
                      ? "bg-rose-50 border-rose-300 shadow-xs"
                      : "bg-emerald-50/80 border-emerald-300"
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        {isAutoStockLow ? (
                          <PackageX className="w-5 h-5 text-rose-600 shrink-0" />
                        ) : (
                          <Package className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-extrabold text-xs uppercase tracking-wide text-slate-900 block">
                            Diagnostic Stock & Autonomie Alimentaire
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Projection sur horizon de {stockHorizonDays} jours de consommation
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsStockModalOpen(true)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-extrabold text-slate-800 flex items-center space-x-1 shadow-2xs cursor-pointer"
                      >
                        <Sliders className="w-3 h-3 text-emerald-700" />
                        <span>Ajuster Stock</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Aliment Requis</span>
                        <span className="text-slate-900 font-black">{autoRequiredFeedCategory}</span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Besoins ({stockHorizonDays}j)</span>
                        <span className="text-slate-900 font-black">{autoPredictedFeedKg.toFixed(0)} kg</span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Stock Disponible</span>
                        <span className={`font-black ${isAutoStockLow ? "text-rose-600" : "text-emerald-700"}`}>
                          {autoAvailableStockKg} kg ({ (autoAvailableStockKg / 50).toFixed(1) } sacs)
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Autonomie Estimée</span>
                        <span className={`font-black ${autoStockAutonomyDays < stockHorizonDays ? "text-amber-600" : "text-emerald-700"}`}>
                          {autoStockAutonomyDays.toFixed(1)} jours
                        </span>
                      </div>
                    </div>

                    {/* Visual Coverage Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">
                          Couverture de Stock : {Math.min(100, Math.round((autoAvailableStockKg / (autoPredictedFeedKg || 1)) * 100))}%
                        </span>
                        {isAutoStockLow ? (
                          <span className="text-rose-600 font-black flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>DÉFICIT : -{autoStockDeficitKg.toFixed(0)} kg ({autoDeficitBags} sacs)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-black">✅ Stock Suffisant</span>
                        )}
                      </div>

                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isAutoStockLow
                              ? "bg-rose-500"
                              : autoStockAutonomyDays < 20
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((autoAvailableStockKg / (autoPredictedFeedKg || 1)) * 100))}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Alert Notice Banner if Low Stock */}
                    {isAutoStockLow && (
                      <div className="p-3 bg-rose-100/90 border border-rose-300 rounded-xl text-rose-950 text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-black text-rose-950">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>ALERTE STOCK BAS : RECOMMANDATION D'ACHAT IMMÉDIATE</span>
                        </div>
                        <p className="font-medium text-slate-800 leading-relaxed">
                          La quantité d'aliment prédite pour le lot actuel (<strong className="text-slate-900">{autoPredictedFeedKg.toFixed(0)} kg sur {stockHorizonDays} jours</strong>) dépasse le stock disponible en magasin (<strong className="text-rose-700">{autoAvailableStockKg} kg</strong>).
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-rose-200 text-xs font-bold">
                          <span className="text-rose-900">
                            Quantité manquante : <strong>{autoStockDeficitKg.toFixed(0)} kg ({autoDeficitBags} sacs de 50 kg)</strong>
                          </span>
                          <span className="text-emerald-900 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md">
                            Coût : {formatFCFA(autoDeficitCostFCFA)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alignment with Lot & Transition Action Button */}
                  {activeAutoBatch && (
                    <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
                      activeAutoBatch.currentFeedType === recommendedRule.feedCategoryPhase
                        ? "bg-emerald-50/70 border-emerald-300"
                        : "bg-amber-50 border-amber-300"
                    }`}>
                      <div className="flex items-start space-x-3">
                        {activeAutoBatch.currentFeedType === recommendedRule.feedCategoryPhase ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <div className={`font-extrabold text-xs uppercase tracking-wide ${
                            activeAutoBatch.currentFeedType === recommendedRule.feedCategoryPhase
                              ? "text-emerald-900"
                              : "text-amber-900"
                          }`}>
                            {activeAutoBatch.currentFeedType === recommendedRule.feedCategoryPhase
                              ? "✅ ALIMENTATION CONFORME AU POIDS MOYEN"
                              : "⚠️ TRANSITION D'ALIMENT REQUISE POUR CE LOT"}
                          </div>
                          <p className="text-xs text-slate-700 font-medium">
                            Le lot <span className="font-extrabold text-slate-900">{activeAutoBatch.batchName}</span> consomme actuellement de l'Aliment <span className="font-bold underline">{activeAutoBatch.currentFeedType}</span>.
                            {activeAutoBatch.currentFeedType !== recommendedRule.feedCategoryPhase && (
                              <span> Le poids moyen mesuré de {(effectiveWeightGrams / 1000).toFixed(2)} kg exige de basculer vers l'<strong>{recommendedRule.feedTypeName}</strong>.</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleApplyAutoFeedToBatch}
                          className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Appliquer Automatiquement à ce Lot dans l'Application</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transition Instructions Protocol */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      <span>Protocole Vétérinaire de Transition Alimentaire :</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {recommendedRule.transitionInstructions}
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* Section 2.5: CALCULATEUR AUTOMATIQUE DES BESOINS NUTRITIONNELS ET RATIONS DÉTAILLÉES PAR POIDS VIF */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                      OUTIL ZOOTECHNIQUE D'ÉLEVAGE
                    </span>
                    <h4 className="font-black text-slate-900 text-lg">
                      Calculateur Automatique des Besoins Nutritionnels & Rations Quotidiennes par Poids Vif
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNutritionReportModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer border border-amber-500/30"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>🖨️ Fiche Technique Vétérinaire</span>
                  </button>
                </div>
              </div>

              {/* CONTROLS BAR: Temperature, Meals Per Day & Live Weight Slider */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Température Ambiante */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                      <Thermometer className={`w-4 h-4 ${isHeatStress ? "text-rose-600 animate-pulse" : "text-emerald-600"}`} />
                      <span>Température Bâtiment :</span>
                    </label>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      isHeatStress ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {calcAmbientTemp}°C
                    </span>
                  </div>

                  <input
                    type="range"
                    min="18"
                    max="38"
                    value={calcAmbientTemp}
                    onChange={(e) => setCalcAmbientTemp(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>18°C (Optimal)</span>
                    <span>25°C (Neutre)</span>
                    <span className="text-rose-600 font-extrabold">38°C (Forte Chaleur)</span>
                  </div>

                  {isHeatStress && (
                    <div className="text-[10px] text-rose-700 font-extrabold bg-rose-50 p-1.5 rounded border border-rose-200 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>Ajustement Thermique : Appétit -{(tempDelta * (autoSpecies === "Porciculture" ? 1.5 : 1.8)).toFixed(1)}% | Eau +{(tempDelta * (autoSpecies === "Porciculture" ? 4 : 5)).toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {/* 2. Repas par jour */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <Utensils className="w-4 h-4 text-amber-600" />
                    <span>Fréquence des Repas :</span>
                  </label>

                  <div className="flex bg-white p-1 rounded-xl border border-slate-300 text-xs font-bold">
                    {[2, 3, 4].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCalcMealsPerDay(m)}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          calcMealsPerDay === m
                            ? "bg-slate-900 text-amber-300 font-black shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {m} Repas/j
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium">
                    {calcMealsPerDay === 2 && "Matin (50%) & Soir (50%) aux heures fraîches."}
                    {calcMealsPerDay === 3 && "Matin (40%), Midi (30%) & Soir (30%)."}
                    {calcMealsPerDay === 4 && "Distribution fractionnée toutes les 4 heures."}
                  </p>
                </div>

                {/* 3. Ajustement Rapide du Poids Vif ($PV$) */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Poids Vif ($PV$) du Sujet :</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.05"
                      value={liveWeightKg.toFixed(2)}
                      onChange={(e) => setAutoDirectWeightGrams(Math.max(10, Number(e.target.value) * 1000))}
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-slate-900"
                    />
                    <span className="text-xs font-extrabold text-slate-700">kg live</span>
                  </div>

                  <input
                    type="range"
                    min={autoSpecies === "Porciculture" ? "5" : "0.1"}
                    max={autoSpecies === "Porciculture" ? "120" : "3.5"}
                    step={autoSpecies === "Porciculture" ? "1" : "0.05"}
                    value={liveWeightKg}
                    onChange={(e) => {
                      setAutoWeightMode("direct");
                      setAutoDirectWeightGrams(Number(e.target.value) * 1000);
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

              </div>

              {/* GRID OF 6 DETAILED NUTRITIONAL REQUIREMENT CARDS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>1. Profil des Besoins Nutritionnels Calculés (Par Sujet / Jour)</span>
                  </h5>
                  <span className="text-[10px] font-bold text-slate-500">Poids Vif ($PV$) : {liveWeightKg.toFixed(2)} kg</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  
                  {/* KPI 1: Appétit MS / Intake */}
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 space-y-1">
                    <div className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center justify-between">
                      <span>Appétit MS</span>
                      <Utensils className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {actualAdjustedDailyFeedGrams} g/j
                    </div>
                    <div className="text-[10px] font-bold text-emerald-700">
                      {(actualAdjustedDailyFeedGrams / 1000).toFixed(3)} kg/j ({dailyIntakePctLiveWeight.toFixed(1)}% du PV)
                    </div>
                  </div>

                  {/* KPI 2: Énergie Métabolisable */}
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 space-y-1">
                    <div className="text-[10px] font-extrabold text-amber-800 uppercase flex items-center justify-between">
                      <span>Énergie Métabolisable</span>
                      <Zap className="w-3 h-3 text-amber-600" />
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {dailyEnergyKcalPerHead.toLocaleString("fr-FR")} kcal
                    </div>
                    <div className="text-[10px] font-bold text-amber-700">
                      Densité : {recommendedRule.energyKcal} kcal/kg
                    </div>
                  </div>

                  {/* KPI 3: Protéine Brute */}
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 space-y-1">
                    <div className="text-[10px] font-extrabold text-blue-800 uppercase flex items-center justify-between">
                      <span>Protéine Brute</span>
                      <Wheat className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {dailyProteinGramsPerHead.toFixed(1)} g PB/j
                    </div>
                    <div className="text-[10px] font-bold text-blue-700">
                      Taux Alim : {recommendedRule.proteinPercent}% PB
                    </div>
                  </div>

                  {/* KPI 4: Lysine Digestible */}
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 space-y-1">
                    <div className="text-[10px] font-extrabold text-purple-800 uppercase flex items-center justify-between">
                      <span>Lysine Digestible</span>
                      <Activity className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {dailyLysineGramsPerHead.toFixed(2)} g Lys/j
                    </div>
                    <div className="text-[10px] font-bold text-purple-700">
                      1er Acide Aminé Limitant
                    </div>
                  </div>

                  {/* KPI 5: Minéraux Ca / P */}
                  <div className="p-3 bg-gradient-to-br from-slate-100 to-white rounded-xl border border-slate-300 space-y-1">
                    <div className="text-[10px] font-extrabold text-slate-700 uppercase flex items-center justify-between">
                      <span>Calcium & Phosphore</span>
                      <Sliders className="w-3 h-3 text-slate-600" />
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {dailyCalciumGramsPerHead.toFixed(1)}g Ca / {dailyPhosphorusGramsPerHead.toFixed(1)}g P
                    </div>
                    <div className="text-[10px] font-bold text-slate-600">
                      Ratio Ca/P = {(dailyCalciumGramsPerHead / (dailyPhosphorusGramsPerHead || 1)).toFixed(2)}
                    </div>
                  </div>

                  {/* KPI 6: Eau de Boisson */}
                  <div className="p-3 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-200 space-y-1">
                    <div className="text-[10px] font-extrabold text-cyan-800 uppercase flex items-center justify-between">
                      <span>Eau de Boisson</span>
                      <Droplets className="w-3 h-3 text-cyan-600" />
                    </div>
                    <div className="text-lg font-black text-cyan-900">
                      {dailyWaterLitersPerHead.toFixed(2)} L/j
                    </div>
                    <div className="text-[10px] font-bold text-cyan-700">
                      Lot : {totalBatchDailyWaterLitersAdjusted.toFixed(0)} Litres / jour
                    </div>
                  </div>

                </div>
              </div>

              {/* MEAL BREAKDOWN TABLE & BATCH TOTALS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* Meal Schedule Table (7 cols) */}
                <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-emerald-600" />
                      <span>Plan de Distribution Fractionnée par Repas ({calcMealsPerDay} repas / jour)</span>
                    </h5>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Lot de {autoHeadCount} sujets
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="bg-slate-200/80 text-slate-700 font-extrabold uppercase text-[10px]">
                          <th className="p-2.5">Repas</th>
                          <th className="p-2.5">% Ration</th>
                          <th className="p-2.5">Grammes / Sujet</th>
                          <th className="p-2.5">Poids Total Lot (kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {mealsBreakdown.map((m, i) => (
                          <tr key={i} className="hover:bg-white font-bold text-slate-800">
                            <td className="p-2.5 text-slate-900 font-extrabold">{m.name}</td>
                            <td className="p-2.5 text-amber-700">{m.pct}%</td>
                            <td className="p-2.5 text-emerald-800">{m.gramsHead} g</td>
                            <td className="p-2.5 text-slate-900 font-black">{m.kgLot.toFixed(1)} kg</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-100/70 text-slate-900 font-black text-xs">
                          <td className="p-2.5 uppercase">TOTAL QUOTIDIEN</td>
                          <td className="p-2.5">100%</td>
                          <td className="p-2.5">{actualAdjustedDailyFeedGrams} g / j</td>
                          <td className="p-2.5 text-emerald-900 text-sm">{totalBatchDailyFeedKgAdjusted.toFixed(1)} kg / j</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Performance & Financial Forecast Card (5 cols) */}
                <div className="lg:col-span-5 bg-slate-900 text-white p-4.5 rounded-2xl space-y-4 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span>Objectifs & Rentabilité Lot</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Aliment : {recommendedRule.feedTypeName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Gain Moyen Quotidien (GMQ)</span>
                        <span className="text-lg font-black text-emerald-400">+{estimatedGMQGrams} g / jour</span>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Indice de Consommation (IC)</span>
                        <span className="text-lg font-black text-amber-300">{estimatedFCRRatio.toFixed(2)}</span>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Coût Alimentaire Jour Lot</span>
                        <span className="text-base font-black text-white">{formatFCFA(totalBatchDailyCostFCFAAdjusted)}</span>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Coût Aliment par kg de Gain</span>
                        <span className="text-base font-black text-emerald-300">{formatFCFA(feedCostPerKgGainFCFAAdjusted)} / kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-extrabold text-slate-300">
                    <span>Budget Alimentaire Mensuel :</span>
                    <span className="text-amber-400 text-sm font-black">{formatFCFA(totalBatchMonthlyCostFCFAAdjusted)} / mois</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 3: Grille Officielle de Correspondance Poids → Aliment */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-black text-slate-900 text-base flex items-center space-x-2">
                  <Wheat className="w-5 h-5 text-amber-600" />
                  <span>Grille Officielle de Correspondance : Tranche de Poids Moyen → Type d'Aliment</span>
                </h4>
                <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                  {autoSpecies === "Porciculture" ? "🐖 Normes Porcines" : "🐔 Normes Avicoles"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                      <th className="p-3">Tranche de Poids Moyen</th>
                      <th className="p-3">Type d'Aliment Officiel</th>
                      <th className="p-3">Phase</th>
                      <th className="p-3">Protéines (% PB)</th>
                      <th className="p-3">Énergie (kcal)</th>
                      <th className="p-3">Présentation</th>
                      <th className="p-3">Ration Recommandée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {defaultWeightFeedRules
                      .filter((r) => r.species === autoSpecies)
                      .map((rule) => {
                        const isCurrentActiveRule =
                          effectiveWeightGrams >= rule.minWeightGrams &&
                          effectiveWeightGrams < rule.maxWeightGrams;
                        return (
                          <tr
                            key={rule.id}
                            className={`transition-colors ${
                              isCurrentActiveRule
                                ? "bg-amber-100/80 font-black text-slate-950 border-l-4 border-l-amber-500"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 font-extrabold">
                              {rule.species === "Porciculture"
                                ? `${(rule.minWeightGrams / 1000).toFixed(0)} à ${(rule.maxWeightGrams / 1000).toFixed(0)} kg`
                                : `${rule.minWeightGrams} à ${rule.maxWeightGrams} g`}
                            </td>
                            <td className="p-3 font-bold text-slate-900">{rule.feedTypeName}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md text-[10px] font-bold">
                                {rule.feedCategoryPhase}
                              </span>
                            </td>
                            <td className="p-3">{rule.proteinPercent}% PB</td>
                            <td className="p-3">{rule.energyKcal} kcal/kg</td>
                            <td className="p-3 text-slate-600">{rule.presentation}</td>
                            <td className="p-3 font-extrabold text-emerald-800">
                              {rule.recommendedDailyFeedGrams} g / sujet / jour
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB 1: SUIVI DES PESÉES ET BANDES */}
        {activeTab === "batches" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredBatches.map((batch) => {
                const gapGrams = batch.actualWeightGrams - batch.expectedWeightGrams;
                const gapPct =
                  batch.expectedWeightGrams > 0
                    ? (gapGrams / batch.expectedWeightGrams) * 100
                    : 0;
                const status = getGrowthStatus(gapPct);

                return (
                  <div
                    key={batch.id}
                    onClick={() => handleLoadBatchIntoSimulator(batch)}
                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-slate-100 text-slate-700">
                          {batch.species} • {batch.breed}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1">{batch.batchName}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                        {gapPct >= 0 ? `+${gapPct.toFixed(1)}%` : `${gapPct.toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px]">Âge Actuel</span>
                        <div className="font-extrabold text-slate-900">{batch.ageLabel}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Effectif</span>
                        <div className="font-extrabold text-slate-900">{batch.headCount} sujets</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Poids Réel</span>
                        <div className="font-black text-emerald-800">
                          {batch.actualWeightGrams >= 1000
                            ? `${(batch.actualWeightGrams / 1000).toFixed(2)} kg`
                            : `${batch.actualWeightGrams} g`}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Poids Norme</span>
                        <div className="font-bold text-slate-600">
                          {batch.expectedWeightGrams >= 1000
                            ? `${(batch.expectedWeightGrams / 1000).toFixed(2)} kg`
                            : `${batch.expectedWeightGrams} g`}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Ration distribuée :</span>
                        <strong className="text-slate-900">{batch.actualDailyFeedGrams} g/sujet/j</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Aliment :</span>
                        <span className="font-semibold text-amber-800">{batch.currentFeedType} ({batch.feedingRegimen})</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
                      <span>Simuler & Consulter IA</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: SIMULATEUR ÉCART POIDS & RATIONNEMENT */}
        {activeTab === "simulator" && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Analyseur Dynamique d'Écart de Poids & Programme Alimentaire</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Espèce d'Élevage :</label>
                  <select
                    value={simSpecies}
                    onChange={(e) => setSimSpecies(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-extrabold text-slate-900"
                  >
                    <option value="Aviculture">Aviculture (Poulet de chair)</option>
                    <option value="Porciculture">Porciculture (Porc charcutier)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Âge ({simSpecies === "Aviculture" ? "Jours" : "Semaines"}) :
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={simAge}
                    onChange={(e) => setSimAge(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Poids Réel Mesuré (Grammes) :
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={simActualWeight}
                    onChange={(e) => setSimActualWeight(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-extrabold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    = {(simActualWeight / 1000).toFixed(2)} kg / sujet
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Ration Distribuée (g / sujet / jour) :
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={simDailyFeed}
                    onChange={(e) => setSimDailyFeed(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-extrabold text-slate-900"
                  />
                </div>
              </div>

              {/* Regimen & Feed Type Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Type d'Aliment Actuel :</label>
                  <select
                    value={simFeedType}
                    onChange={(e) => setSimFeedType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                  >
                    <option value="Pré-démarrage">Pré-démarrage (Haute protéine 22%+)</option>
                    <option value="Démarrage">Démarrage (20-21% Protéines)</option>
                    <option value="Croissance">Croissance (18-19% Protéines)</option>
                    <option value="Finition">Finition (16-17.5% Protéines)</option>
                    <option value="Gestante">Gestante (Sons & Fibres)</option>
                    <option value="Lactante">Lactante (Haute énergie)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mode de Distribution (Régime) :</label>
                  <select
                    value={simRegimen}
                    onChange={(e) => setSimRegimen(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                  >
                    <option value="À volonté (Ad libitum)">À volonté (Ad libitum)</option>
                    <option value="Rationné (Strict)">Rationné (Strict en 2 ou 3 repas)</option>
                    <option value="Séquentiel">Séquentiel (Alimentation fractionnée)</option>
                    <option value="Rattrapage Compensateur">Rattrapage Compensateur (Ration enrichie)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-slate-500 text-xs font-semibold">Poids Réel vs Poids Prévu</div>
                <div className="text-2xl font-black text-slate-900">
                  {(simActualWeight / 1000).toFixed(2)} kg{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    (Prévu: {(expectedWeight / 1000).toFixed(2)} kg)
                  </span>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-slate-500 text-xs font-semibold">Écart de Poids Unitaire</div>
                <div className={`text-2xl font-black ${weightGapGrams >= 0 ? "text-emerald-800" : "text-rose-600"}`}>
                  {weightGapGrams >= 0 ? `+${weightGapGrams} g` : `${weightGapGrams} g`}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Différence de {weightGapPercent.toFixed(1)}% par rapport à la courbe
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-slate-500 text-xs font-semibold">Indice de Consommation Estimé (IC)</div>
                <div className="text-2xl font-black text-amber-800">
                  {estimatedFCR.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal"> (Cible: {matchedStandard.targetFCR})</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Ratio de transformation aliment/viande
                </div>
              </div>
            </div>

            {/* Quick Action to Trigger AI Decision */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
                  <Bot className="w-5 h-5 text-amber-700" />
                  <span>Obtenir la Décision Optimale de l'IA Vétérinaire</span>
                </div>
                <p className="text-xs text-slate-700 max-w-xl">
                  L'IA analysera cet écart de poids ({weightGapPercent.toFixed(1)}%) et générera le programme de correction (changement de formule, vitamines anti-stress, réajustement des heures de repas).
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab("ai");
                  handleConsultAiDecision();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Générer Décision Alimentaire IA</span>
              </button>
            </div>

            {/* --- TOOL DE SIMULATION DE RATIONNEMENT & STOCKS PAR PHASE (FCR PARAMÉTRABLES) --- */}
            {(() => {
              const gainDemarrageKg = targetGainKgPerHead * 0.20;
              const gainCroissanceKg = targetGainKgPerHead * 0.50;
              const gainFinitionKg = targetGainKgPerHead * 0.30;

              const feedDemarragePerHeadKg = gainDemarrageKg * fcrDemarrage;
              const feedCroissancePerHeadKg = gainCroissanceKg * fcrCroissance;
              const feedFinitionPerHeadKg = gainFinitionKg * fcrFinition;

              const totalFeedDemarrageKg = feedDemarragePerHeadKg * rationHeadCount;
              const totalFeedCroissanceKg = feedCroissancePerHeadKg * rationHeadCount;
              const totalFeedFinitionKg = feedFinitionPerHeadKg * rationHeadCount;

              const totalFeedAllPhasesKg = totalFeedDemarrageKg + totalFeedCroissanceKg + totalFeedFinitionKg;
              const totalFeedAllPhasesTons = totalFeedAllPhasesKg / 1000;

              const bagsDemarrage = Math.ceil(totalFeedDemarrageKg / 50);
              const bagsCroissance = Math.ceil(totalFeedCroissanceKg / 50);
              const bagsFinition = Math.ceil(totalFeedFinitionKg / 50);
              const totalBagsAllPhases = bagsDemarrage + bagsCroissance + bagsFinition;

              const costDemarrageFCFA = bagsDemarrage * bagPriceFCFA;
              const costCroissanceFCFA = bagsCroissance * bagPriceFCFA;
              const costFinitionFCFA = bagsFinition * bagPriceFCFA;
              const totalCostAllPhasesFCFA = costDemarrageFCFA + costCroissanceFCFA + costFinitionFCFA;

              const weightedAvgFCR = totalFeedAllPhasesKg / (targetGainKgPerHead * rationHeadCount || 1);

              return (
                <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-2xl border border-emerald-800 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                          🧪 MODULE AVANCÉ
                        </span>
                        <span className="text-emerald-300 text-xs font-semibold">
                          Calculateur Exact de Stock Alimentaire par Phase de Croissance
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white flex items-center space-x-2">
                        <Scale className="w-6 h-6 text-amber-400" />
                        <span>Simulateur de Rationnement & FCR Paramétrables</span>
                      </h3>
                      <p className="text-xs text-emerald-200/90 max-w-2xl">
                        Calculez la quantité exacte d'aliments en stock (sacs de 50kg, tonnes, budget) nécessaire pour amener un lot à son poids cible en modulant les indices de conversion (FCR).
                      </p>
                    </div>

                    <div className="bg-emerald-900/80 p-3 rounded-2xl border border-emerald-700 text-right">
                      <div className="text-[10px] text-emerald-300 uppercase font-black">Besoin Total Aliment</div>
                      <div className="text-2xl font-black text-amber-300">
                        {totalFeedAllPhasesTons.toFixed(2)} Tonnes
                      </div>
                      <div className="text-xs text-emerald-200 font-bold">
                        {totalBagsAllPhases} Sacs de 50kg • {formatFCFA(totalCostAllPhasesFCFA)}
                      </div>
                    </div>
                  </div>

                  {/* Controls Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <label className="text-emerald-300 font-extrabold block">Espèce & Production :</label>
                      <select
                        value={rationSpecies}
                        onChange={(e) => {
                          const sp = e.target.value as any;
                          setRationSpecies(sp);
                          if (sp === "Aviculture") {
                            setTargetGainKgPerHead(2.2);
                            setFcrDemarrage(1.35);
                            setFcrCroissance(1.65);
                            setFcrFinition(1.85);
                          } else {
                            setTargetGainKgPerHead(85);
                            setFcrDemarrage(2.10);
                            setFcrCroissance(2.70);
                            setFcrFinition(3.20);
                          }
                        }}
                        className="w-full bg-slate-900 text-white p-2 rounded-xl border border-emerald-600 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="Aviculture">Poulet de Chair (Aviculture)</option>
                        <option value="Porciculture">Porc d'Engraissement (Porciculture)</option>
                      </select>
                    </div>

                    <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <label className="text-emerald-300 font-extrabold block">Effectif du Lot (Sujets) :</label>
                      <input
                        type="number"
                        min="1"
                        value={rationHeadCount}
                        onChange={(e) => setRationHeadCount(Number(e.target.value))}
                        className="w-full bg-slate-900 text-white p-2 rounded-xl border border-emerald-600 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <label className="text-emerald-300 font-extrabold block">Gain de Poids Cible / Sujet (kg) :</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={targetGainKgPerHead}
                        onChange={(e) => setTargetGainKgPerHead(Number(e.target.value))}
                        className="w-full bg-slate-900 text-white p-2 rounded-xl border border-emerald-600 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                      <label className="text-emerald-300 font-extrabold block">Prix du Sac de 50kg (FCFA) :</label>
                      <input
                        type="number"
                        step="500"
                        value={bagPriceFCFA}
                        onChange={(e) => setBagPriceFCFA(Number(e.target.value))}
                        className="w-full bg-slate-900 text-white p-2 rounded-xl border border-emerald-600 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* FCR Paramétrables Sliders / Inputs per Phase */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-300 flex items-center space-x-1.5">
                        <Sliders className="w-4 h-4" />
                        <span>Paramétrage du Taux de Conversion Alimentaire (FCR / Indice de Consommation) :</span>
                      </span>
                      <span className="text-emerald-300 font-bold">
                        FCR Moyen Pondéré du Cycle : <strong className="text-amber-400 text-sm font-black">{weightedAvgFCR.toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      {/* Phase 1: Démarrage */}
                      <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-emerald-300">Phase 1 : Démarrage</span>
                          <span className="px-2 py-0.5 bg-emerald-800 text-emerald-100 rounded text-[10px] font-bold">
                            0 - {daysDemarrage} J
                          </span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 flex justify-between">
                            <span>FCR / IC Démarrage :</span>
                            <strong className="text-amber-300 font-black">{fcrDemarrage.toFixed(2)}</strong>
                          </label>
                          <input
                            type="range"
                            min="1.0"
                            max="4.0"
                            step="0.05"
                            value={fcrDemarrage}
                            onChange={(e) => setFcrDemarrage(Number(e.target.value))}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Gain cible phase : <strong>{gainDemarrageKg.toFixed(2)} kg/sujet</strong>
                        </div>
                      </div>

                      {/* Phase 2: Croissance */}
                      <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-emerald-300">Phase 2 : Croissance</span>
                          <span className="px-2 py-0.5 bg-emerald-800 text-emerald-100 rounded text-[10px] font-bold">
                            {daysDemarrage + 1} - {daysDemarrage + daysCroissance} J
                          </span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 flex justify-between">
                            <span>FCR / IC Croissance :</span>
                            <strong className="text-amber-300 font-black">{fcrCroissance.toFixed(2)}</strong>
                          </label>
                          <input
                            type="range"
                            min="1.0"
                            max="4.5"
                            step="0.05"
                            value={fcrCroissance}
                            onChange={(e) => setFcrCroissance(Number(e.target.value))}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Gain cible phase : <strong>{gainCroissanceKg.toFixed(2)} kg/sujet</strong>
                        </div>
                      </div>

                      {/* Phase 3: Finition */}
                      <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-emerald-300">Phase 3 : Finition</span>
                          <span className="px-2 py-0.5 bg-emerald-800 text-emerald-100 rounded text-[10px] font-bold">
                            {daysDemarrage + daysCroissance + 1} - {daysDemarrage + daysCroissance + daysFinition} J
                          </span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 flex justify-between">
                            <span>FCR / IC Finition :</span>
                            <strong className="text-amber-300 font-black">{fcrFinition.toFixed(2)}</strong>
                          </label>
                          <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.05"
                            value={fcrFinition}
                            onChange={(e) => setFcrFinition(Number(e.target.value))}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Gain cible phase : <strong>{gainFinitionKg.toFixed(2)} kg/sujet</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Results Table Breakdown by Phase */}
                  <div className="overflow-x-auto bg-slate-900/90 rounded-2xl border border-emerald-800/80 p-4">
                    <h4 className="text-xs font-black text-amber-300 mb-3 flex items-center space-x-2">
                      <Wheat className="w-4 h-4 text-emerald-400" />
                      <span>Tableau Synthétique du Stock Alimentaire Requis par Phase</span>
                    </h4>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-emerald-800 text-emerald-300 font-extrabold uppercase text-[10px]">
                          <th className="p-2.5">Phase de Croissance</th>
                          <th className="p-2.5">FCR Paramétré</th>
                          <th className="p-2.5">Gain Cible / Sujet</th>
                          <th className="p-2.5">Consom. / Sujet</th>
                          <th className="p-2.5">Stock Nécessaire (kg)</th>
                          <th className="p-2.5">Sacs de 50kg</th>
                          <th className="p-2.5">Budget Phase (FCFA)</th>
                          <th className="p-2.5">Ration Quotidienne Moy.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-900/60 font-medium text-emerald-100">
                        <tr>
                          <td className="p-2.5 font-bold text-white">Démarrage (Haute Protéine)</td>
                          <td className="p-2.5 text-amber-300 font-black">{fcrDemarrage.toFixed(2)}</td>
                          <td className="p-2.5">{gainDemarrageKg.toFixed(2)} kg</td>
                          <td className="p-2.5 font-bold">{feedDemarragePerHeadKg.toFixed(2)} kg</td>
                          <td className="p-2.5 font-black text-white">{totalFeedDemarrageKg.toFixed(0)} kg</td>
                          <td className="p-2.5 font-bold text-amber-300">{bagsDemarrage} sacs</td>
                          <td className="p-2.5 font-black text-amber-300">{formatFCFA(costDemarrageFCFA)}</td>
                          <td className="p-2.5 text-emerald-300 font-semibold">
                            {((feedDemarragePerHeadKg / daysDemarrage) * 1000).toFixed(0)} g / jour
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-white">Croissance (Équilibrée)</td>
                          <td className="p-2.5 text-amber-300 font-black">{fcrCroissance.toFixed(2)}</td>
                          <td className="p-2.5">{gainCroissanceKg.toFixed(2)} kg</td>
                          <td className="p-2.5 font-bold">{feedCroissancePerHeadKg.toFixed(2)} kg</td>
                          <td className="p-2.5 font-black text-white">{totalFeedCroissanceKg.toFixed(0)} kg</td>
                          <td className="p-2.5 font-bold text-amber-300">{bagsCroissance} sacs</td>
                          <td className="p-2.5 font-black text-amber-300">{formatFCFA(costCroissanceFCFA)}</td>
                          <td className="p-2.5 text-emerald-300 font-semibold">
                            {((feedCroissancePerHeadKg / daysCroissance) * 1000).toFixed(0)} g / jour
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-white">Finition (Énergétique)</td>
                          <td className="p-2.5 text-amber-300 font-black">{fcrFinition.toFixed(2)}</td>
                          <td className="p-2.5">{gainFinitionKg.toFixed(2)} kg</td>
                          <td className="p-2.5 font-bold">{feedFinitionPerHeadKg.toFixed(2)} kg</td>
                          <td className="p-2.5 font-black text-white">{totalFeedFinitionKg.toFixed(0)} kg</td>
                          <td className="p-2.5 font-bold text-amber-300">{bagsFinition} sacs</td>
                          <td className="p-2.5 font-black text-amber-300">{formatFCFA(costFinitionFCFA)}</td>
                          <td className="p-2.5 text-emerald-300 font-semibold">
                            {((feedFinitionPerHeadKg / daysFinition) * 1000).toFixed(0)} g / jour
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-900/80 border-t-2 border-amber-400 font-black text-white">
                          <td className="p-2.5">TOTAL TOUTES PHASES</td>
                          <td className="p-2.5 text-amber-300">{weightedAvgFCR.toFixed(2)} (Moy)</td>
                          <td className="p-2.5 text-amber-300">{targetGainKgPerHead.toFixed(2)} kg</td>
                          <td className="p-2.5 text-amber-300">
                            {(feedDemarragePerHeadKg + feedCroissancePerHeadKg + feedFinitionPerHeadKg).toFixed(2)} kg
                          </td>
                          <td className="p-2.5 text-amber-400 text-sm">
                            {totalFeedAllPhasesKg.toFixed(0)} kg ({totalFeedAllPhasesTons.toFixed(2)} T)
                          </td>
                          <td className="p-2.5 text-amber-300 text-sm">{totalBagsAllPhases} Sacs</td>
                          <td className="p-2.5 text-amber-300 text-sm">{formatFCFA(totalCostAllPhasesFCFA)}</td>
                          <td className="p-2.5 text-emerald-200">Ration Intégrale</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SUB-TAB 3: NORMES DE CROISSANCE DE RÉFÉRENCE */}
        {activeTab === "standards" && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">
                Normes Standard Aviculture (Poulet de Chair Cobb 500)
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <th className="p-3">Âge</th>
                      <th className="p-3">Phase Alimentaire</th>
                      <th className="p-3 text-right">Poids Cible (g)</th>
                      <th className="p-3 text-right">Ration Recommandée (g/j)</th>
                      <th className="p-3 text-right">Cumul Aliment (kg)</th>
                      <th className="p-3 text-right">IC Cible (FCR)</th>
                      <th className="p-3 text-right">% Protéines</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {avicultureGrowthStandards.map((st) => (
                      <tr key={st.ageDaysOrWeeks} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">{st.ageLabel}</td>
                        <td className="p-3 font-bold text-amber-800">{st.phase}</td>
                        <td className="p-3 text-right font-black text-emerald-800">{st.expectedWeightGrams} g</td>
                        <td className="p-3 text-right font-bold text-slate-900">{st.recommendedDailyFeedGrams} g</td>
                        <td className="p-3 text-right text-slate-600">{st.cumulativeFeedKg} kg</td>
                        <td className="p-3 text-right font-bold text-blue-800">{st.targetFCR}</td>
                        <td className="p-3 text-right text-slate-700">{st.proteinPercent} % PB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-extrabold text-slate-900 text-base">
                Normes Standard Porciculture (Porc Charcutier Hybride)
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <th className="p-3">Âge</th>
                      <th className="p-3">Phase Alimentaire</th>
                      <th className="p-3 text-right">Poids Cible (kg)</th>
                      <th className="p-3 text-right">Ration Recommandée (g/j)</th>
                      <th className="p-3 text-right">Cumul Aliment (kg)</th>
                      <th className="p-3 text-right">IC Cible (FCR)</th>
                      <th className="p-3 text-right">% Protéines</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {porcicultureGrowthStandards.map((st) => (
                      <tr key={st.ageDaysOrWeeks} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">{st.ageLabel}</td>
                        <td className="p-3 font-bold text-rose-800">{st.phase}</td>
                        <td className="p-3 text-right font-black text-emerald-800">
                          {(st.expectedWeightGrams / 1000).toFixed(1)} kg
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{st.recommendedDailyFeedGrams} g</td>
                        <td className="p-3 text-right text-slate-600">{st.cumulativeFeedKg} kg</td>
                        <td className="p-3 text-right font-bold text-blue-800">{st.targetFCR}</td>
                        <td className="p-3 text-right text-slate-700">{st.proteinPercent} % PB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: MODULE IA DÉCISIONNEL ALIMENTAIRE */}
        {activeTab === "ai" && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-amber-400 font-black text-lg">
                <Bot className="w-6 h-6" />
                <span>Moteur IA de Prise de Décision Nutritionnelle & Zootechnique</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                L'IA analyse les courbes de poids de votre cheptel, identifie les goulots d'étranglement (chaleur, mauvaise digestion, aliment sous-dosé) et génère des ordonnances de rattrapage alimentaire.
              </p>

              <button
                onClick={() => handleConsultAiDecision()}
                disabled={isAiLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isAiLoading ? (
                  <span>Génération en cours...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lancer l'Analyse IA du Lot Actuel ({simSpecies})</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom AI Query Bar */}
            <div className="space-y-2">
              <label className="block text-slate-900 font-extrabold text-xs">
                Posez une question spécifique à l'IA Nutritionnelle :
              </label>
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={aiPromptCustom}
                  onChange={(e) => setAiPromptCustom(e.target.value)}
                  placeholder="Ex: Quel additif ajouter dans l'eau lors des pics de chaleur de 35°C à Abidjan ?"
                  className="flex-1 p-3 border border-slate-300 rounded-xl bg-white text-slate-900"
                />
                <button
                  onClick={() => handleConsultAiDecision(aiPromptCustom)}
                  disabled={isAiLoading || !aiPromptCustom}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </div>

            {/* AI Decision Output Box */}
            {aiAdvice && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                      Décision & Rapport Recommandé IA
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Expert Vétérinaire Ivoire Élevage</span>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {aiAdvice}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD WEIGHING RECORD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Saisie d'une Nouvelle Pesée d'Élevage</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom du Lot / Bande :</label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Ex: Bande Poulets #4 Bâtiment B"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Espèce :</label>
                  <select
                    value={newBatchSpecies}
                    onChange={(e) => setNewBatchSpecies(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="Aviculture">Aviculture (Poulet)</option>
                    <option value="Porciculture">Porciculture (Porc)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Souche / Race :</label>
                  <input
                    type="text"
                    value={newBatchBreed}
                    onChange={(e) => setNewBatchBreed(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Effectif :</label>
                  <input
                    type="number"
                    value={newBatchHeadCount}
                    onChange={(e) => setNewBatchHeadCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Âge :</label>
                  <input
                    type="number"
                    value={newBatchAge}
                    onChange={(e) => setNewBatchAge(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Poids Réel (g) :</label>
                  <input
                    type="number"
                    value={newBatchActualWeight}
                    onChange={(e) => setNewBatchActualWeight(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ration Donnée (g/sujet/j) :</label>
                <input
                  type="number"
                  value={newBatchDailyFeed}
                  onChange={(e) => setNewBatchDailyFeed(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow cursor-pointer"
                >
                  Enregistrer Pesée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* SUB-TAB: FORMULATION DE RATION MAÏS / SOJA & IMPACT COÛT */}
        {activeTab === "ration_formulation_sim" && (
          <div className="p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-wider">
                    SIMULATEUR FINANCIER & ZOOTECHNIQUE
                  </span>
                  <span className="text-emerald-300 text-xs font-semibold">• Auto-Formulation "Fait-Maison"</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Formulation de Ration (Maïs & Soja) & Impact Coût de Revient
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/90 max-w-3xl">
                  Simulez l'impact financier direct de la fabrication locale de votre aliment en ajustant les proportions de maïs, tourteau de soja, son et concentrés CMV vs l'achat d'aliment industriel du commerce.
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Coût Estimé au kg</span>
                <span className="text-2xl font-black text-amber-400">{formulatedCostPerKgFCFA.toFixed(1)} FCFA / kg</span>
                <span className="text-xs font-extrabold text-emerald-200">
                  {formulatedBagPriceFCFA.toLocaleString("fr-FR")} FCFA / Sac 50kg
                </span>
              </div>
            </div>

            {/* Presets & Quick Formulation Templates */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Formules Type Recommandées (1-Clic Pre-remplissage)</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">Cliquez pour appliquer la ration type</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRationCornPercent(60);
                    setRationSoybeanPercent(22);
                    setRationCakesPercent(10);
                    setRationFishPercent(3);
                    setRationPremixPercent(5);
                    setFormulationDailyGrams(45);
                    setFormulationFCR(1.55);
                  }}
                  className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-amber-900">🐔 Démarrage Volaille</span>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded">Cobb500</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    60% Maïs • 22% Soja • 10% Tourteaux/Sons • 3% Poisson • 5% Premix
                  </p>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">IC : 1.55 • 45g/j</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRationCornPercent(65);
                    setRationSoybeanPercent(16);
                    setRationCakesPercent(12);
                    setRationFishPercent(3);
                    setRationPremixPercent(4);
                    setFormulationDailyGrams(130);
                    setFormulationFCR(1.75);
                  }}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-900">🐔 Finition Volaille</span>
                    <span className="text-[10px] font-black bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded">Chair</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    65% Maïs • 16% Soja • 12% Tourteaux • 3% Poisson • 4% Premix
                  </p>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">IC : 1.75 • 130g/j</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRationCornPercent(62);
                    setRationSoybeanPercent(14);
                    setRationCakesPercent(18);
                    setRationFishPercent(3);
                    setRationPremixPercent(3);
                    setFormulationDailyGrams(2100);
                    setFormulationFCR(2.80);
                  }}
                  className="p-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-rose-900">🐖 Engraissement Porc</span>
                    <span className="text-[10px] font-black bg-rose-200 text-rose-950 px-1.5 py-0.5 rounded">Charcutier</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    62% Maïs • 14% Soja • 18% Tourteaux • 3% Poisson • 3% Premix
                  </p>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">IC : 2.80 • 2.1kg/j</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRationCornPercent(55);
                    setRationSoybeanPercent(20);
                    setRationCakesPercent(15);
                    setRationFishPercent(4);
                    setRationPremixPercent(6);
                    setFormulationDailyGrams(5500);
                    setFormulationFCR(2.50);
                  }}
                  className="p-3 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-900">🐖 Truie Lactation</span>
                    <span className="text-[10px] font-black bg-indigo-200 text-indigo-950 px-1.5 py-0.5 rounded">Maternité</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    55% Maïs • 20% Soja • 15% Tourteaux • 4% Poisson • 6% Premix
                  </p>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">Ration Lactation : 5.5kg/j</div>
                </button>
              </div>
            </div>

            {/* Sliders & Percentage Formulation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Formulation Controls & Raw Prices */}
              <div className="lg:col-span-7 space-y-5">
                {/* Sliders Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-5 h-5 text-emerald-700" />
                      <h4 className="text-sm font-black text-slate-900">1. Proportion des Matières Premières (% de la Ration)</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        isRationPercentValid
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300 animate-pulse"
                      }`}
                    >
                      {isRationPercentValid ? "✅ Total = 100%" : `⚠️ Total actuel = ${totalRationPercent}% (Ajuster)`}
                    </span>
                  </div>

                  {!isRationPercentValid && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-bold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Attention : La somme des pourcentages doit faire exactement 100% pour garantir un coût calculé exact.</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Maïs */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-amber-950 flex items-center space-x-1.5">
                          <span>🌽 Maïs Grain / Concasse (Énergie)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rationCornPercent}
                            onChange={(e) => setRationCornPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 p-1 text-center font-black bg-white border border-amber-300 rounded-lg text-xs"
                          />
                          <span className="text-amber-900 font-black">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="85"
                        step="1"
                        value={rationCornPercent}
                        onChange={(e) => setRationCornPercent(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Min (0%)</span>
                        <span>Coût apporté : {((rationCornPercent / 100) * rawCornPriceFCFA).toFixed(1)} FCFA/kg</span>
                        <span>Max (85%)</span>
                      </div>
                    </div>

                    {/* Soja */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-emerald-950 flex items-center space-x-1.5">
                          <span>🫘 Tourteau de Soja (Protéines Nobles)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rationSoybeanPercent}
                            onChange={(e) => setRationSoybeanPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 p-1 text-center font-black bg-white border border-emerald-300 rounded-lg text-xs"
                          />
                          <span className="text-emerald-900 font-black">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={rationSoybeanPercent}
                        onChange={(e) => setRationSoybeanPercent(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Min (0%)</span>
                        <span>Coût apporté : {((rationSoybeanPercent / 100) * rawSoybeanPriceFCFA).toFixed(1)} FCFA/kg</span>
                        <span>Max (50%)</span>
                      </div>
                    </div>

                    {/* Tourteaux (Palmiste/Coton) & Sons */}
                    <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-300/80 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-amber-950 flex items-center space-x-1.5">
                          <span>🥥 Tourteaux (Palmiste / Coton) & Sons de Céréales</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rationCakesPercent}
                            onChange={(e) => setRationCakesPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 p-1 text-center font-black bg-white border border-amber-300 rounded-lg text-xs"
                          />
                          <span className="text-amber-900 font-black">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        value={rationCakesPercent}
                        onChange={(e) => setRationCakesPercent(Number(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Min (0%)</span>
                        <span>Coût apporté : {((rationCakesPercent / 100) * rawCakesPriceFCFA).toFixed(1)} FCFA/kg</span>
                        <span>Max (40%)</span>
                      </div>
                    </div>

                    {/* Farine de Poisson */}
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-blue-950 flex items-center space-x-1.5">
                          <span>🐟 Farine de Poisson / Concentrés Protéiques</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rationFishPercent}
                            onChange={(e) => setRationFishPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 p-1 text-center font-black bg-white border border-blue-300 rounded-lg text-xs"
                          />
                          <span className="text-blue-900 font-black">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={rationFishPercent}
                        onChange={(e) => setRationFishPercent(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Min (0%)</span>
                        <span>Coût apporté : {((rationFishPercent / 100) * rawFishPriceFCFA).toFixed(1)} FCFA/kg</span>
                        <span>Max (20%)</span>
                      </div>
                    </div>

                    {/* Premix / CMV */}
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-purple-950 flex items-center space-x-1.5">
                          <span>🧪 CMV / Premix Concentré (Vitamines & Minéraux)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rationPremixPercent}
                            onChange={(e) => setRationPremixPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-16 p-1 text-center font-black bg-white border border-purple-300 rounded-lg text-xs"
                          />
                          <span className="text-purple-900 font-black">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="1"
                        value={rationPremixPercent}
                        onChange={(e) => setRationPremixPercent(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Min (0%)</span>
                        <span>Coût apporté : {((rationPremixPercent / 100) * rawPremixPriceFCFA).toFixed(1)} FCFA/kg</span>
                        <span>Max (15%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Material Prices Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      <h4 className="text-sm font-black text-slate-900">2. Prix d'Achat des Matières Premières & Comparatif</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">Tarifs Marché Ivoirien (FCFA)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase block">🌽 Maïs (FCFA/kg)</label>
                      <input
                        type="number"
                        value={rawCornPriceFCFA}
                        onChange={(e) => setRawCornPriceFCFA(Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase block">🫘 Soja (FCFA/kg)</label>
                      <input
                        type="number"
                        value={rawSoybeanPriceFCFA}
                        onChange={(e) => setRawSoybeanPriceFCFA(Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase block">🥥 Tourteaux (FCFA/kg)</label>
                      <input
                        type="number"
                        value={rawCakesPriceFCFA}
                        onChange={(e) => setRawCakesPriceFCFA(Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase block">🐟 Poisson (FCFA/kg)</label>
                      <input
                        type="number"
                        value={rawFishPriceFCFA}
                        onChange={(e) => setRawFishPriceFCFA(Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase block">🧪 Premix (FCFA/kg)</label>
                      <input
                        type="number"
                        value={rawPremixPriceFCFA}
                        onChange={(e) => setRawPremixPriceFCFA(Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Prix du Sac de 50 kg de l'Aliment du Commerce (Réf) :</span>
                      <span className="text-[11px] text-slate-600">Aliment pré-fabriqué vendu en magasin agro (ex: Ivograin/SIPRA)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={commercialBagPriceFCFA}
                        onChange={(e) => setCommercialBagPriceFCFA(Math.max(1, Number(e.target.value)))}
                        className="w-28 p-2 text-right font-black text-xs bg-white border border-amber-300 rounded-lg"
                      />
                      <span className="text-xs font-black text-amber-900">FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Batch Simulation Metrics Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-black text-slate-900">3. Caractéristiques de la Bande d'Élevage à Simuler</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase">Effectif Lot (Sujets)</label>
                      <input
                        type="number"
                        value={formulationHeadCount}
                        onChange={(e) => setFormulationHeadCount(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase">Ration (g / sujet / j)</label>
                      <input
                        type="number"
                        value={formulationDailyGrams}
                        onChange={(e) => setFormulationDailyGrams(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase">Durée Phase (Jours)</label>
                      <input
                        type="number"
                        value={formulationPeriodDays}
                        onChange={(e) => setFormulationPeriodDays(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase">Indice Conso (IC/FCR)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formulationFCR}
                        onChange={(e) => setFormulationFCR(Math.max(0.5, Number(e.target.value)))}
                        className="w-full p-2 text-right font-black text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Financial Impact & Comparison Panel */}
              <div className="lg:col-span-5 space-y-5">
                {/* Result Highlights Panel */}
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>Bilan Économique & Gain Net</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full">
                      Bande de {formulationHeadCount} sujets
                    </span>
                  </div>

                  {/* Coût au sac comparé */}
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-800/80 rounded-2xl border border-emerald-700/50 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">Ration Formulée (Sac 50kg)</p>
                        <p className="text-xl font-black text-amber-400">
                          {formulatedBagPriceFCFA.toLocaleString("fr-FR")} FCFA
                        </p>
                        <p className="text-[10px] text-emerald-300">{formulatedCostPerKgFCFA.toFixed(1)} FCFA / kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400 font-bold uppercase">Aliment Commerce (50kg)</p>
                        <p className="text-xl font-black text-slate-300">
                          {commercialBagPriceFCFA.toLocaleString("fr-FR")} FCFA
                        </p>
                        <p className="text-[10px] text-slate-400">{commercialCostPerKgFCFA.toFixed(1)} FCFA / kg</p>
                      </div>
                    </div>

                    {/* Economie par sac */}
                    <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                      bagSavingsFCFA >= 0
                        ? "bg-emerald-900/90 border-emerald-500 text-white"
                        : "bg-rose-900/90 border-rose-500 text-white"
                    }`}>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                        {bagSavingsFCFA >= 0 ? "🎉 Économie Réalisée par Sac de 50 kg" : "⚠️ Surcoût par Sac"}
                      </p>
                      <p className="text-2xl font-black text-amber-300">
                        {Math.abs(bagSavingsFCFA).toLocaleString("fr-FR")} FCFA / sac
                      </p>
                      <p className="text-xs font-bold text-emerald-200">
                        Soit {Math.abs(bagSavingsPercent).toFixed(1)}% {bagSavingsFCFA >= 0 ? "moins cher que l'aliment du commerce" : "plus cher"}
                      </p>
                    </div>
                  </div>

                  {/* Totaux sur la période de la bande */}
                  <div className="space-y-2 border-t border-emerald-800/80 pt-4 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Besoin Total en Aliment ({formulationPeriodDays} jours) :</span>
                      <strong className="text-amber-300 font-black">
                        {totalPeriodConsumptionKg.toLocaleString("fr-FR")} kg ({totalPeriodBags} sacs)
                      </strong>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Budget Aliment avec Ration Fait-Maison :</span>
                      <strong className="text-amber-400 font-black">
                        {totalFormulatedPeriodCostFCFA.toLocaleString("fr-FR")} FCFA
                      </strong>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Budget Aliment Commerce Industriel :</span>
                      <strong className="text-slate-400 font-black">
                        {totalCommercialPeriodCostFCFA.toLocaleString("fr-FR")} FCFA
                      </strong>
                    </div>

                    <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-between font-black mt-2 shadow-lg">
                      <span className="text-xs uppercase">Économie Globale sur le Lot :</span>
                      <span className="text-lg">
                        {totalNetSavingsFCFA >= 0 ? "+" : ""}{totalNetSavingsFCFA.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Impact sur le Coût du kg de Viande */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                      🥩 Coût Alimentaire par kg de Croissance Produit :
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Ration Formulée :</span>
                        <strong className="text-emerald-400 font-black text-sm">
                          {feedCostPerKgGainFormulated.toFixed(0)} FCFA / kg
                        </strong>
                      </div>

                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Aliment Commerce :</span>
                        <strong className="text-slate-300 font-black text-sm">
                          {feedCostPerKgGainCommercial.toFixed(0)} FCFA / kg
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composition Breakdown Bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    📊 Répartition de la Composition de la Ration
                  </h4>

                  <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner border border-slate-200 text-[10px] font-black text-white">
                    <div style={{ width: `${rationCornPercent}%` }} className="bg-amber-500 flex items-center justify-center truncate px-1" title="Maïs">
                      {rationCornPercent}% Maïs
                    </div>
                    <div style={{ width: `${rationSoybeanPercent}%` }} className="bg-emerald-600 flex items-center justify-center truncate px-1" title="Soja">
                      {rationSoybeanPercent}% Soja
                    </div>
                    <div style={{ width: `${rationCakesPercent}%` }} className="bg-amber-700 flex items-center justify-center truncate px-1" title="Tourteaux">
                      {rationCakesPercent}% Tourteaux
                    </div>
                    <div style={{ width: `${rationFishPercent}%` }} className="bg-blue-600 flex items-center justify-center truncate px-1" title="Poisson">
                      {rationFishPercent}% Poisson
                    </div>
                    <div style={{ width: `${rationPremixPercent}%` }} className="bg-purple-600 flex items-center justify-center truncate px-1" title="CMV">
                      {rationPremixPercent}% CMV
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-bold text-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 bg-amber-500 rounded-xs"></div>
                      <span>Maïs : {((rationCornPercent / 100) * rawCornPriceFCFA).toFixed(1)} FCFA/kg</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 bg-emerald-600 rounded-xs"></div>
                      <span>Soja : {((rationSoybeanPercent / 100) * rawSoybeanPriceFCFA).toFixed(1)} FCFA/kg</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 bg-amber-700 rounded-xs"></div>
                      <span>Tourteaux : {((rationCakesPercent / 100) * rawCakesPriceFCFA).toFixed(1)} FCFA/kg</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 bg-blue-600 rounded-xs"></div>
                      <span>Poisson : {((rationFishPercent / 100) * rawFishPriceFCFA).toFixed(1)} FCFA/kg</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 bg-purple-600 rounded-xs"></div>
                      <span>CMV : {((rationPremixPercent / 100) * rawPremixPriceFCFA).toFixed(1)} FCFA/kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* MODAL: Stock Management & Refill */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    📦 Magasin & Réapprovisionnement des Stocks d'Aliments
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ajustez les quantités disponibles en stock pour recalculer automatiquement les alertes de rupture.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Projection Horizon Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Horizon de Prévision des Besoins :
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {stockHorizonDays} jours de projection
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs font-bold">
                {[7, 14, 21, 30, 45].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setStockHorizonDays(days)}
                    className={`py-2 rounded-xl border transition-all cursor-pointer ${
                      stockHorizonDays === days
                        ? "bg-slate-900 text-amber-400 border-slate-900 font-black shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {days} Jours
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Table */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Stock Disponible par Type d'Aliment (en kg et sacs de 50kg) :</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  * 1 Sac = 50 kg d'aliment
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { phase: "Pré-démarrage", label: "Aliment Pré-démarrage (Poussins / Porcelets)" },
                  { phase: "Démarrage", label: "Aliment Démarrage" },
                  { phase: "Croissance", label: "Aliment Croissance" },
                  { phase: "Finition", label: "Aliment Finition" },
                  { phase: "Gestante", label: "Aliment Porc Gestante" },
                  { phase: "Lactante", label: "Aliment Porc Lactante" },
                ].map(({ phase, label }) => {
                  const currentKg = feedStock[phase] || 0;
                  const matchingBatches = batches.filter((b) => b.currentFeedType === phase);
                  const dailyDemandKg = matchingBatches.reduce(
                    (acc, b) => acc + (b.headCount * b.actualDailyFeedGrams) / 1000,
                    0
                  );
                  const autoDemandKg =
                    recommendedRule.feedCategoryPhase === phase ? autoDailyFeedKg : 0;
                  const totalDailyDemand = Math.max(dailyDemandKg, autoDemandKg);
                  const forecastedDemandKg = totalDailyDemand * stockHorizonDays;
                  const isLow = forecastedDemandKg > currentKg && totalDailyDemand > 0;

                  return (
                    <div
                      key={phase}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                        isLow
                          ? "bg-rose-50/90 border-rose-300 shadow-2xs"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-xs text-slate-900">{phase}</span>
                            <span className="text-[11px] text-slate-500 font-medium">({label})</span>
                            {isLow && (
                              <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-md uppercase tracking-wide">
                                ⚠️ Stock Bas
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Besoins {stockHorizonDays}j : <strong className="text-slate-900 font-bold">{forecastedDemandKg.toFixed(0)} kg</strong> ({ (forecastedDemandKg / 50).toFixed(1) } sacs)
                          </div>
                        </div>

                        {/* Input & Quick refill buttons */}
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          <div className="relative w-32">
                            <input
                              type="number"
                              value={currentKg}
                              onChange={(e) =>
                                setFeedStock({
                                  ...feedStock,
                                  [phase]: Math.max(0, Number(e.target.value)),
                                })
                              }
                              className={`w-full p-2 pr-7 text-right rounded-xl border font-black text-xs ${
                                isLow
                                  ? "bg-white border-rose-400 text-rose-950"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            />
                            <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">
                              kg
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-bold w-16 text-center">
                            {(currentKg / 50).toFixed(1)} sacs
                          </span>
                        </div>
                      </div>

                      {/* Quick Add Buttons */}
                      <div className="flex items-center justify-end space-x-1.5 pt-1 border-t border-slate-200/60 text-[10px]">
                        <span className="text-slate-400 font-semibold mr-1">Recharger rapide :</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFeedStock({
                              ...feedStock,
                              [phase]: currentKg + 50,
                            })
                          }
                          className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-800 font-extrabold rounded-lg transition-all cursor-pointer"
                        >
                          + 1 Sac (50kg)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFeedStock({
                              ...feedStock,
                              [phase]: currentKg + 250,
                            })
                          }
                          className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-800 font-extrabold rounded-lg transition-all cursor-pointer"
                        >
                          + 5 Sacs (250kg)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFeedStock({
                              ...feedStock,
                              [phase]: currentKg + 500,
                            })
                          }
                          className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-800 font-extrabold rounded-lg transition-all cursor-pointer"
                        >
                          + 10 Sacs (500kg)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Toutes les modifications sont immédiatement répercutées dans l'application.
              </span>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Fermer & Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VETERINARY RATIONING REPORT MODAL */}
      {isNutritionReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider">
                  RAPPORT VÉTÉRINAIRE OFFICIEL DE RATIONNEMENT
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Fiche Technique de Calcul des Besoins Nutritionnels & Rations
                </h3>
                <p className="text-xs text-slate-500">
                  Document généré pour la conduite d'élevage du lot : <strong>{activeAutoBatch?.batchName || "Bande Sélectionnée"}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNutritionReportModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content Container */}
            <div className="space-y-6 text-slate-900 text-xs">
              
              {/* Top Meta Info Grid */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Espèce & Phase</span>
                  <span className="font-black text-slate-900">{autoSpecies} ({recommendedRule.feedCategoryPhase})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Poids Vif ($PV$) Moyen</span>
                  <span className="font-black text-emerald-700 text-sm">{liveWeightKg.toFixed(2)} kg / sujet</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Effectif du Lot</span>
                  <span className="font-black text-slate-900">{autoHeadCount} sujets</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Température & Climat</span>
                  <span className={`font-black ${isHeatStress ? "text-rose-600" : "text-emerald-700"}`}>
                    {calcAmbientTemp}°C {isHeatStress ? "(Stress Thermique)" : "(Optimal)"}
                  </span>
                </div>
              </div>

              {/* Recommended Feed Summary */}
              <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2">
                <div className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  Aliment Préconisé : {recommendedRule.feedTypeName}
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {recommendedRule.description}
                </p>
                <div className="text-amber-300 text-[11px] font-bold pt-1 border-t border-emerald-900">
                  Protocole de Transition : {recommendedRule.transitionInstructions}
                </div>
              </div>

              {/* Detailed Nutrient Requirement Table */}
              <div className="space-y-2">
                <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">
                  1. Besoins Nutritionnels Calculés (Sujet & Lot / Jour)
                </h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 text-xs font-medium">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 border">Nutriment / Paramètre</th>
                        <th className="p-2.5 border">Recommandation / Sujet / J</th>
                        <th className="p-2.5 border">Total Lot ({autoHeadCount} sujets) / J</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                      <tr>
                        <td className="p-2.5 border text-slate-900">Ration Alimentaire (Ingestion MS)</td>
                        <td className="p-2.5 border text-emerald-800">{actualAdjustedDailyFeedGrams} g / sujet / jour ({dailyIntakePctLiveWeight.toFixed(1)}% PV)</td>
                        <td className="p-2.5 border font-black text-slate-900">{totalBatchDailyFeedKgAdjusted.toFixed(1)} kg / jour ({ (totalBatchDailyFeedKgAdjusted / 50).toFixed(1) } sacs)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border text-slate-900">Énergie Métabolisable (EM)</td>
                        <td className="p-2.5 border">{dailyEnergyKcalPerHead.toLocaleString("fr-FR")} kcal / j ({recommendedRule.energyKcal} kcal/kg)</td>
                        <td className="p-2.5 border">{(dailyEnergyKcalPerHead * autoHeadCount).toLocaleString("fr-FR")} kcal / jour</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border text-slate-900">Protéines Brutes (PB)</td>
                        <td className="p-2.5 border">{dailyProteinGramsPerHead.toFixed(1)} g PB / j ({recommendedRule.proteinPercent}% PB)</td>
                        <td className="p-2.5 border">{((dailyProteinGramsPerHead * autoHeadCount) / 1000).toFixed(2)} kg PB / jour</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border text-slate-900">Lysine Digestible</td>
                        <td className="p-2.5 border">{dailyLysineGramsPerHead.toFixed(2)} g Lys / j</td>
                        <td className="p-2.5 border">{((dailyLysineGramsPerHead * autoHeadCount) / 1000).toFixed(2)} kg Lys / jour</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border text-slate-900">Calcium (Ca) & Phosphore Assimilable (P)</td>
                        <td className="p-2.5 border">{dailyCalciumGramsPerHead.toFixed(1)}g Ca / {dailyPhosphorusGramsPerHead.toFixed(1)}g P</td>
                        <td className="p-2.5 border">{((dailyCalciumGramsPerHead * autoHeadCount) / 1000).toFixed(2)}kg Ca / {((dailyPhosphorusGramsPerHead * autoHeadCount) / 1000).toFixed(2)}kg P</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border text-slate-900">Eau de Boisson (Sécurité Hydrique)</td>
                        <td className="p-2.5 border text-cyan-800">{dailyWaterLitersPerHead.toFixed(2)} L / sujet / jour</td>
                        <td className="p-2.5 border font-black text-cyan-900">{totalBatchDailyWaterLitersAdjusted.toFixed(0)} Litres / jour</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Meal Distribution Breakdown Table */}
              <div className="space-y-2">
                <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">
                  2. Programme de Distribution des Repas ({calcMealsPerDay} repas / jour)
                </h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-2 border">Repas</th>
                        <th className="p-2 border">% Ration</th>
                        <th className="p-2 border">Quantité Sujet</th>
                        <th className="p-2 border">Quantité Totale Lot à Peser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                      {mealsBreakdown.map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border text-slate-900 font-extrabold">{m.name}</td>
                          <td className="p-2 border text-amber-700">{m.pct}%</td>
                          <td className="p-2 border text-emerald-800">{m.gramsHead} g</td>
                          <td className="p-2 border font-black text-slate-900">{m.kgLot.toFixed(1)} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial & Performance Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gain Moyen GMQ</span>
                  <span className="text-sm font-black text-emerald-400">+{estimatedGMQGrams} g/jour</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Indice Cible IC</span>
                  <span className="text-sm font-black text-amber-300">{estimatedFCRRatio.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Coût Aliment Jour</span>
                  <span className="text-sm font-black text-white">{formatFCFA(totalBatchDailyCostFCFAAdjusted)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Coût / kg de Gain</span>
                  <span className="text-sm font-black text-emerald-300">{formatFCFA(feedCostPerKgGainFCFAAdjusted)} / kg</span>
                </div>
              </div>

            </div>

            {/* Modal Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `FICHE DE RATIONNEMENT - ${activeAutoBatch?.batchName || "Lot"}\n` +
                    `Espèce: ${autoSpecies} | Poids Vif: ${liveWeightKg.toFixed(2)} kg | Effectif: ${autoHeadCount} sujets\n` +
                    `Aliment: ${recommendedRule.feedTypeName}\n` +
                    `Ration/Sujet: ${actualAdjustedDailyFeedGrams} g/j | Total Lot: ${totalBatchDailyFeedKgAdjusted.toFixed(1)} kg/j\n` +
                    `Eau Total Lot: ${totalBatchDailyWaterLitersAdjusted.toFixed(0)} L/j | Coût Jour: ${formatFCFA(totalBatchDailyCostFCFAAdjusted)}`
                  );
                  setReportCopied(true);
                  setTimeout(() => setReportCopied(false), 3000);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>{reportCopied ? "✅ Fiche Copiée !" : "Copier le Résumé Texte"}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer la Fiche Technique</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNutritionReportModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
