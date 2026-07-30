import React, { useState } from "react";
import { UnitCosts } from "../types";
import { formatFCFA, formatPercent } from "../utils/formatters";
import { getBuildingRentSavings, weightedAveragePouletRevenue } from "../data/businessPlanData";
import { Calculator, RefreshCw, Check, Sparkles, TrendingUp, AlertTriangle, Building, CheckCircle2, Coins, Wrench, Clock, Zap, ArrowUpRight } from "lucide-react";

interface GlobalSimulatorViewProps {
  unitCosts: UnitCosts;
  setUnitCosts?: React.Dispatch<React.SetStateAction<UnitCosts>>;
}

export const GlobalSimulatorView: React.FC<GlobalSimulatorViewProps> = ({
  unitCosts,
  setUnitCosts,
}) => {
  const savings = getBuildingRentSavings(unitCosts);

  // Scenario sliders / inputs
  const [broilersPerMonth, setBroilersPerMonth] = useState<number>(600); // e.g. M2 level
  const [broilerMortality, setBroilerMortality] = useState<number>(5);
  const [chickenSellingPrice, setChickenSellingPrice] = useState<number>(weightedAveragePouletRevenue); // Recette moyenne = somme des prix des découpes
  const [broilerFeedCostKg, setBroilerFeedCostKg] = useState<number>(unitCosts.alimentFinition);

  const [pigsSoldPerYear, setPigsSoldPerYear] = useState<number>(100);
  const [pigCarcassWeight, setPigCarcassWeight] = useState<number>(75);
  const [pigSellingPriceKg, setPigSellingPriceKg] = useState<number>(unitCosts.porcCharcutierPrixKg);
  const [pigletPurchasePrice, setPigletPurchasePrice] = useState<number>(unitCosts.porcelet);

  // Default yearly fixed costs before rent deduction
  const [baseYearlyFixedCosts, setBaseYearlyFixedCosts] = useState<number>(9600000);

  // Quick Equipment ROI Calculator State
  const [equipmentName, setEquipmentName] = useState<string>("Broyeur-Mélangeur d'Aliment (1.5T/h)");
  const [equipmentCostFCFA, setEquipmentCostFCFA] = useState<number>(3500000);
  const [yearlyProductivityGainFCFA, setYearlyProductivityGainFCFA] = useState<number>(1800000);
  const [yearlyMaintenanceCostFCFA, setYearlyMaintenanceCostFCFA] = useState<number>(150000);
  const [equipmentLifespanYears, setEquipmentLifespanYears] = useState<number>(5);

  // Interactive Break-Even Calculator State (Point Mort Têtes & Cycles)
  const [chickenBatchSize, setChickenBatchSize] = useState<number>(600); // Taille d'une bande de poulets
  const [pigBatchSize, setPigBatchSize] = useState<number>(25); // Taille d'un lot d'engraissement porcin
  const [breakEvenMode, setBreakEvenMode] = useState<"consolidated" | "poultry_only" | "pork_only">("consolidated");

  // Dynamic yearly fixed costs deducting building rents if acquired
  const effectiveFixedCosts = Math.max(0, baseYearlyFixedCosts - savings.totalYearlyRentSaved);

  // Calculations
  // 1. Aviculture Yearly
  const totalBroilersStarted = broilersPerMonth * 12;
  const survivingBroilers = Math.floor(totalBroilersStarted * (1 - broilerMortality / 100));
  const yearlyAvicultureRevenue = survivingBroilers * chickenSellingPrice;

  // Direct costs broilers: Purchase (2200) + Feed (1.05kg * feedCost)
  const broilerDirectCostUnit = unitCosts.poulet1_7kg + 1.05 * broilerFeedCostKg;
  const yearlyAvicultureDirectCost = totalBroilersStarted * broilerDirectCostUnit;

  // 2. Porciculture Yearly
  const yearlyPorkRevenue = pigsSoldPerYear * pigCarcassWeight * pigSellingPriceKg;
  const yearlyPorkDirectCost = pigsSoldPerYear * (pigletPurchasePrice + 65000); // 65k feed estimate

  // Total
  const totalYearlyRevenue = yearlyAvicultureRevenue + yearlyPorkRevenue;
  const totalYearlyDirectCosts = yearlyAvicultureDirectCost + yearlyPorkDirectCost;
  const totalYearlyCosts = totalYearlyDirectCosts + effectiveFixedCosts;
  const yearlyNetProfit = totalYearlyRevenue - totalYearlyCosts;
  const netMarginPercent = (yearlyNetProfit / totalYearlyRevenue) * 100;

  const handleToggleAvicole = () => {
    if (!setUnitCosts) return;
    setUnitCosts((prev) => ({
      ...prev,
      isAvicoleAcquired: !prev.isAvicoleAcquired,
    }));
  };

  const handleTogglePorcin = () => {
    if (!setUnitCosts) return;
    setUnitCosts((prev) => ({
      ...prev,
      isPorcinAcquired: !prev.isPorcinAcquired,
    }));
  };

  const handleResetSimulator = () => {
    setBroilersPerMonth(600);
    setBroilerMortality(5);
    setChickenSellingPrice(weightedAveragePouletRevenue);
    setBroilerFeedCostKg(unitCosts.alimentFinition);
    setPigsSoldPerYear(100);
    setPigCarcassWeight(75);
    setPigSellingPriceKg(unitCosts.porcCharcutierPrixKg);
    setPigletPurchasePrice(unitCosts.porcelet);
    setBaseYearlyFixedCosts(9600000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 rounded-2xl p-6 text-white shadow-md border border-emerald-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500 text-slate-950 font-extrabold px-3 py-1 rounded-full text-xs uppercase mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulateur Financier Personnalisé</span>
          </div>
          <h2 className="text-2xl font-extrabold">
            Simulateur Global de Sensibilité de la Holding
          </h2>
          <p className="text-emerald-200 text-sm max-w-2xl mt-1">
            Modifiez le volume de poussins, les taux de mortalité, le prix de vente des porcs ou les charges fixes pour calculer immédiatement la rentabilité annuelle prévisionnelle.
          </p>
        </div>

        <button
          onClick={handleResetSimulator}
          className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-emerald-100 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réinitialiser les hypothèses</span>
        </button>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aviculture Parameters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Hypothèses du Volet Avicole
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Production mensuelle de poulets vifs :</span>
                <span className="text-emerald-700 font-bold">{broilersPerMonth} sujets / mois</span>
              </div>
              <input
                type="range"
                min="150"
                max="2000"
                step="50"
                value={broilersPerMonth}
                onChange={(e) => setBroilersPerMonth(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Taux de mortalité estimé (%) :</span>
                <span className="text-emerald-700 font-bold">{broilerMortality}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={broilerMortality}
                onChange={(e) => setBroilerMortality(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Recette moyenne de vente par poulet (FCFA) :</span>
                <span className="text-emerald-700 font-bold">{formatFCFA(chickenSellingPrice)}</span>
              </div>
              <input
                type="number"
                step="50"
                value={chickenSellingPrice}
                onChange={(e) => setChickenSellingPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Prix de l'Aliment Finition (FCFA/kg) :</span>
                <span className="text-emerald-700 font-bold">{formatFCFA(broilerFeedCostKg)}</span>
              </div>
              <input
                type="number"
                step="1"
                value={broilerFeedCostKg}
                onChange={(e) => setBroilerFeedCostKg(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Porciculture Parameters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Hypothèses du Volet Porcin & Charges Fixes
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Porcs charcutiers vendus par an :</span>
                <span className="text-amber-700 font-bold">{pigsSoldPerYear} têtes / an</span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={pigsSoldPerYear}
                onChange={(e) => setPigsSoldPerYear(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Poids carcasse moyen (kg) :</span>
                <span className="text-amber-700 font-bold">{pigCarcassWeight} kg</span>
              </div>
              <input
                type="number"
                value={pigCarcassWeight}
                onChange={(e) => setPigCarcassWeight(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Prix carcasse de vente (FCFA/kg) :</span>
                <span className="text-amber-700 font-bold">{formatFCFA(pigSellingPriceKg)}</span>
              </div>
              <input
                type="number"
                value={pigSellingPriceKg}
                onChange={(e) => setPigSellingPriceKg(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Charges de Structure Annuelles de Base (FCFA) :</span>
                <span className="text-rose-700 font-bold">{formatFCFA(baseYearlyFixedCosts)}</span>
              </div>
              <input
                type="number"
                step="100000"
                value={baseYearlyFixedCosts}
                onChange={(e) => setBaseYearlyFixedCosts(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
              />
            </div>

            {/* Building Acquisition Toggles */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Statut des Bâtiments (Déduction des loyers) :</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 bg-slate-100 p-2 rounded-lg cursor-pointer hover:bg-slate-200 text-[11px] font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={unitCosts.isAvicoleAcquired}
                    onChange={handleToggleAvicole}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span>Avicole Acquis (-50k/m)</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-100 p-2 rounded-lg cursor-pointer hover:bg-slate-200 text-[11px] font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={unitCosts.isPorcinAcquired}
                    onChange={handleTogglePorcin}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span>Porcin Acquis (-20k/m)</span>
                </label>
              </div>

              {savings.totalYearlyRentSaved > 0 && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg font-bold border border-emerald-200 flex items-center justify-between">
                  <span>Charges de structure effectives après déductions :</span>
                  <span className="text-emerald-800 font-extrabold">{formatFCFA(effectiveFixedCosts)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Consolidated Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-6">
        <h3 className="text-xl font-extrabold flex items-center space-x-2 text-amber-400">
          <Sparkles className="w-6 h-6" />
          <span>Résultats de la Simulation Annuelle</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <div className="text-xs text-slate-400">CA Avicole Simulée</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatFCFA(yearlyAvicultureRevenue)}
            </div>
            <div className="text-[11px] text-slate-400">
              {survivingBroilers} poulets x {formatFCFA(chickenSellingPrice)}
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <div className="text-xs text-slate-400">CA Porcin Simulé</div>
            <div className="text-xl font-extrabold text-amber-400">
              {formatFCFA(yearlyPorkRevenue)}
            </div>
            <div className="text-[11px] text-slate-400">
              {pigsSoldPerYear} porcs x {formatFCFA(pigCarcassWeight * pigSellingPriceKg)}
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <div className="text-xs text-slate-400">Coûts Totaux Simulés</div>
            <div className="text-xl font-extrabold text-rose-400">
              {formatFCFA(totalYearlyCosts)}
            </div>
            <div className="text-[11px] text-slate-400">
              Directs + Structure ({formatFCFA(effectiveFixedCosts)})
            </div>
          </div>

          <div className="bg-amber-500 text-slate-950 p-4 rounded-xl space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider">Bénéfice Net Projeté</div>
            <div className="text-2xl font-black">{formatFCFA(yearlyNetProfit)}</div>
            <div className="text-xs font-semibold">
              Marge Nette : {formatPercent(netMarginPercent)}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE BREAK-EVEN POINT CALCULATOR (CALCUL DU POINT MORT EN TÊTES & CYCLES) */}
      {(() => {
        // Base revenues and costs
        const totalRevenue = totalYearlyRevenue;
        const totalVariableCosts = totalYearlyDirectCosts;
        const contributionMargin = totalRevenue - totalVariableCosts;
        const contributionMarginRatio = totalRevenue > 0 ? contributionMargin / totalRevenue : 0.4;
        const breakEvenRevenue = contributionMarginRatio > 0 ? effectiveFixedCosts / contributionMarginRatio : 0;
        const breakEvenMonthly = breakEvenRevenue / 12;
        const safetyMarginFCFA = totalRevenue - breakEvenRevenue;
        const safetyMarginPercent = totalRevenue > 0 ? (safetyMarginFCFA / totalRevenue) * 100 : 0;
        const breakEvenRatioPercent = breakEvenRevenue > 0 ? Math.round((totalRevenue / breakEvenRevenue) * 100) : 0;

        // Poultry Specifics
        const avgChickenPrice = chickenSellingPrice || weightedAveragePouletRevenue;
        const chickenDirectCostUnit = unitCosts.poulet1_7kg + 1.05 * broilerFeedCostKg;
        const chickenUnitMargin = Math.max(1, avgChickenPrice - chickenDirectCostUnit);
        const chickensBreakEvenTotal = Math.ceil(effectiveFixedCosts / chickenUnitMargin);
        const chickenBatchesToBreakEven = (chickensBreakEvenTotal / (chickenBatchSize || 1)).toFixed(1);
        const chickensPerMonthToBreakEven = Math.ceil(chickensBreakEvenTotal / 12);

        // Pork Specifics
        const avgPorkPrice = pigCarcassWeight * pigSellingPriceKg || 165000;
        const pigDirectCostUnit = pigletPurchasePrice + 65000;
        const pigUnitMargin = Math.max(1, avgPorkPrice - pigDirectCostUnit);
        const pigsBreakEvenTotal = Math.ceil(effectiveFixedCosts / pigUnitMargin);
        const pigBatchesToBreakEven = (pigsBreakEvenTotal / (pigBatchSize || 1)).toFixed(1);
        const pigsPerMonthToBreakEven = Math.ceil(pigsBreakEvenTotal / 12);

        // Calculate Break-Even Month (Point Mort Temporel)
        const breakEvenMonthFraction = totalRevenue > 0 ? (breakEvenRevenue / totalRevenue) * 12 : 12;
        const breakEvenMonthInt = Math.min(12, Math.max(1, Math.ceil(breakEvenMonthFraction)));
        const monthNames = [
          "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
          "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        const breakEvenMonthName = monthNames[breakEvenMonthInt - 1] || "Décembre";

        return (
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-600/30 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[11px] font-black uppercase mb-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-700" />
                  <span>Outil Interactif Point Mort & Seuil de Rentabilité</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Calculateur du Point Mort (en Têtes, Bandes & Cycles d'Élevage)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Déterminez exactement combien de sujets (poulets vifs ou porcs charcutiers) et combien de bandes/cycles doivent être commercialisés pour couvrir l'intégralité de vos charges opérationnelles.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBreakEvenMode("consolidated")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    breakEvenMode === "consolidated"
                      ? "bg-amber-500 text-slate-950 shadow font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌐 Global Consolidé
                </button>
                <button
                  type="button"
                  onClick={() => setBreakEvenMode("poultry_only")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    breakEvenMode === "poultry_only"
                      ? "bg-emerald-600 text-white shadow font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🐔 Avicole Pur
                </button>
                <button
                  type="button"
                  onClick={() => setBreakEvenMode("pork_only")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    breakEvenMode === "pork_only"
                      ? "bg-rose-600 text-white shadow font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🐖 Porcin Pur
                </button>
              </div>
            </div>

            {/* Interactive Batch Size Sliders & Fixed Cost Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 flex justify-between">
                  <span>Taille d'une Bande Volailles (sujets / bande) :</span>
                  <span className="text-emerald-700 font-black">{chickenBatchSize} poussins</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={chickenBatchSize}
                  onChange={(e) => setChickenBatchSize(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Sert à calculer le point mort en nombre de cycles/bandes.
                </span>
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 flex justify-between">
                  <span>Taille d'un Lot Porcs (porcs / lot) :</span>
                  <span className="text-amber-700 font-black">{pigBatchSize} porcs</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={pigBatchSize}
                  onChange={(e) => setPigBatchSize(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Sert à calculer le point mort en lots d'engraissement.
                </span>
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 flex justify-between">
                  <span>Charges Fixes Opérationnelles (FCFA/an) :</span>
                  <span className="text-rose-700 font-black">{formatFCFA(effectiveFixedCosts)}</span>
                </label>
                <input
                  type="number"
                  step="200000"
                  value={baseYearlyFixedCosts}
                  onChange={(e) => setBaseYearlyFixedCosts(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Structure, salaires, loyers nets, carburant, amortissements.
                </span>
              </div>
            </div>

            {/* Break-Even Point Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* CA Point Mort */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">1. CA Seuil (Point Mort FCFA)</span>
                <div className="text-xl font-black text-white">
                  {formatFCFA(breakEvenRevenue)} / an
                </div>
                <div className="text-[10px] text-slate-400">
                  soit {formatFCFA(breakEvenMonthly)} / mois
                </div>
              </div>

              {/* Têtes de Volailles */}
              <div className={`p-4 rounded-2xl border space-y-1 ${breakEvenMode === "pork_only" ? "opacity-40 bg-slate-50 border-slate-200" : "bg-emerald-50 border-emerald-200 text-emerald-950"}`}>
                <span className="text-[10px] font-black uppercase text-emerald-800">2. Point Mort Volailles (Têtes)</span>
                <div className="text-xl font-black text-emerald-700">
                  {chickensBreakEvenTotal.toLocaleString()} poulets / an
                </div>
                <div className="text-[10px] font-semibold text-emerald-800">
                  soit <strong>{chickensPerMonthToBreakEven.toLocaleString()} poulets / mois</strong>
                </div>
              </div>

              {/* Bandes Volailles */}
              <div className={`p-4 rounded-2xl border space-y-1 ${breakEvenMode === "pork_only" ? "opacity-40 bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-200 text-amber-950"}`}>
                <span className="text-[10px] font-black uppercase text-amber-900">3. Point Mort Cycles Volailles</span>
                <div className="text-xl font-black text-amber-700">
                  {chickenBatchesToBreakEven} Bandes / an
                </div>
                <div className="text-[10px] font-semibold text-amber-900">
                  sur la base de <strong>{chickenBatchSize} sujets / bande</strong>
                </div>
              </div>

              {/* Porcs / Cycles */}
              <div className={`p-4 rounded-2xl border space-y-1 ${breakEvenMode === "poultry_only" ? "opacity-40 bg-slate-50 border-slate-200" : "bg-rose-50 border-rose-200 text-rose-950"}`}>
                <span className="text-[10px] font-black uppercase text-rose-900">4. Point Mort Porciculture</span>
                <div className="text-xl font-black text-rose-700">
                  {pigsBreakEvenTotal.toLocaleString()} porcs / an ({pigBatchesToBreakEven} lots)
                </div>
                <div className="text-[10px] font-semibold text-rose-900">
                  soit <strong>{pigsPerMonthToBreakEven} porcs / mois</strong> (lots de {pigBatchSize})
                </div>
              </div>
            </div>

            {/* Break-Even Progress Bar & Date */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between text-xs font-bold gap-1">
                <span className="text-slate-800">
                  Niveau d'Activité Actuel vs Seuil de Rentabilité ({breakEvenRatioPercent}% Couverts) :
                </span>
                <span className="text-emerald-700 font-extrabold">
                  Date estimée d'atteinte du Point Mort : <u className="text-amber-800">{breakEvenMonthName} (Mois {breakEvenMonthFraction.toFixed(1)})</u>
                </span>
              </div>

              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300 relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    breakEvenRatioPercent >= 100
                      ? "bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600"
                      : "bg-gradient-to-r from-rose-500 to-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, breakEvenRatioPercent)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>0 FCFA (Déficit)</span>
                <span className="text-slate-900 font-black">
                  Seuil de Rentabilité : {formatFCFA(breakEvenRevenue)}
                </span>
                <span className="text-emerald-700 font-black">
                  CA Simulé : {formatFCFA(totalRevenue)} (+{formatFCFA(safetyMarginFCFA)} de Marge)
                </span>
              </div>
            </div>

            {/* Key Insights & Unit Margins Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2 border border-emerald-800">
                <div className="flex items-center space-x-2 text-emerald-400 font-black text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marge sur Coût Variable Unitaires (MCV)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Poulet de Chair :</span>
                    <span className="font-extrabold text-emerald-300 text-sm">{formatFCFA(chickenUnitMargin)} / sujet</span>
                    <span className="text-[10px] text-slate-400 block">Prix ({formatFCFA(avgChickenPrice)}) - Coût ({formatFCFA(chickenDirectCostUnit)})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Porc Charcutier :</span>
                    <span className="font-extrabold text-amber-300 text-sm">{formatFCFA(pigUnitMargin)} / porc</span>
                    <span className="text-[10px] text-slate-400 block">Prix ({formatFCFA(avgPorkPrice)}) - Coût ({formatFCFA(pigDirectCostUnit)})</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center space-x-2 text-amber-400 font-black text-xs uppercase">
                  <TrendingUp className="w-4 h-4" />
                  <span>Diagnostic de Sécurité Exploitation</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {safetyMarginPercent >= 25 ? (
                    <span className="text-emerald-400 font-bold">
                      ✅ Marge de sécurité confortable ({safetyMarginPercent.toFixed(1)}%). L'exploitation peut essuyer une baisse d'activité de {formatFCFA(safetyMarginFCFA)} avant d'atteindre le seuil de rentabilité.
                    </span>
                  ) : safetyMarginPercent >= 0 ? (
                    <span className="text-amber-300 font-bold">
                      ⚠️ Marge de sécurité modérée ({safetyMarginPercent.toFixed(1)}%). Augmenter la taille des bandes ou optimiser l'indice de consommation alimentaire pour écarter tout risque.
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      🛑 Seuil non atteint ! Bilan déficitaire de {formatFCFA(Math.abs(safetyMarginFCFA))}. Augmenter les volumes de vente ou réduire les charges fixes de structure.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QUICK EQUIPMENT ROI CALCULATOR (RETOUR SUR INVESTISSEMENT MATÉRIEL) */}
      {(() => {
        const netAnnualGain = Math.max(0, yearlyProductivityGainFCFA - yearlyMaintenanceCostFCFA);
        const paybackYears = netAnnualGain > 0 ? equipmentCostFCFA / netAnnualGain : 0;
        const paybackMonths = Math.round(paybackYears * 12);
        const totalNetLifetimeGain = (netAnnualGain * equipmentLifespanYears) - equipmentCostFCFA;
        const roiPercent = equipmentCostFCFA > 0 ? (totalNetLifetimeGain / equipmentCostFCFA) * 100 : 0;

        return (
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border-2 border-emerald-500/40 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">
                      Calculateur de Retour sur Investissement (ROI Matériel)
                    </h3>
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase">
                      Rentabilité Équipements
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Évaluez et comparez le coût d'acquisition d'un nouvel équipement par rapport aux gains de productivité et économies générés.
                  </p>
                </div>
              </div>

              {/* Instant Payback KPI Badge */}
              <div className="bg-slate-950/80 border border-emerald-400/40 px-4 py-2.5 rounded-2xl text-right shrink-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                  Délai d'Amortissement Estimé :
                </div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  {paybackMonths > 0 ? `${paybackMonths} Mois` : "Immédiat"}
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    ({paybackYears.toFixed(1)} ans)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Equipment Presets Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Sélectionner un Équipement Préréglé (Modèles Type) :</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    name: "Broyeur-Mélangeur d'Aliment (1.5T/h)",
                    cost: 3500000,
                    gain: 1800000,
                    maint: 150000,
                    life: 5,
                    icon: "⚙️",
                  },
                  {
                    name: "Abreuvement Automatique Pipettes",
                    cost: 1200000,
                    gain: 650000,
                    maint: 50000,
                    life: 5,
                    icon: "💧",
                  },
                  {
                    name: "Kit Solaire & Régulation Bâtiment",
                    cost: 2800000,
                    gain: 1100000,
                    maint: 100000,
                    life: 7,
                    icon: "☀️",
                  },
                  {
                    name: "Silo Stockage Vrac 10T & Convoyeur",
                    cost: 2000000,
                    gain: 900000,
                    maint: 80000,
                    life: 8,
                    icon: "🏬",
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setEquipmentName(preset.name);
                      setEquipmentCostFCFA(preset.cost);
                      setYearlyProductivityGainFCFA(preset.gain);
                      setYearlyMaintenanceCostFCFA(preset.maint);
                      setEquipmentLifespanYears(preset.life);
                    }}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                      equipmentName === preset.name
                        ? "bg-emerald-500 text-slate-950 border-white shadow-lg font-extrabold scale-[1.02]"
                        : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <span>{preset.icon}</span>
                      <span className="truncate">{preset.name}</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-1 flex justify-between">
                      <span>Prix: {formatFCFA(preset.cost)}</span>
                      <span>Gain: +{formatFCFA(preset.gain)}/an</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Inputs & Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
              {/* 1. Equipment Name & Cost */}
              <div className="space-y-2">
                <label className="font-extrabold text-amber-300 block">
                  1. Nom & Coût d'Acquisition (FCFA) :
                </label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold p-2 rounded-xl text-xs"
                />
                <input
                  type="number"
                  step="100000"
                  value={equipmentCostFCFA}
                  onChange={(e) => setEquipmentCostFCFA(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-extrabold p-2 rounded-xl text-xs"
                />
              </div>

              {/* 2. Projected Productivity Gains */}
              <div className="space-y-2">
                <label className="font-extrabold text-emerald-300 block">
                  2. Gains / Économies Annuels (FCFA/an) :
                </label>
                <input
                  type="number"
                  step="50000"
                  value={yearlyProductivityGainFCFA}
                  onChange={(e) => setYearlyProductivityGainFCFA(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-emerald-300 font-extrabold p-2 rounded-xl text-xs"
                />
                <span className="text-[10px] text-slate-400 block">
                  Réduction mortalité, baisse coût aliment, gain temps.
                </span>
              </div>

              {/* 3. Maintenance Cost */}
              <div className="space-y-2">
                <label className="font-extrabold text-rose-300 block">
                  3. Maintenance Annuelle (FCFA/an) :
                </label>
                <input
                  type="number"
                  step="10000"
                  value={yearlyMaintenanceCostFCFA}
                  onChange={(e) => setYearlyMaintenanceCostFCFA(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-rose-300 font-extrabold p-2 rounded-xl text-xs"
                />
                <span className="text-[10px] text-slate-400 block">
                  Entretien, pièces d'usure, électricité/carburant.
                </span>
              </div>

              {/* 4. Lifespan */}
              <div className="space-y-2">
                <label className="font-extrabold text-blue-300 block">
                  4. Durée de Vie Estimée (Années) :
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={equipmentLifespanYears}
                    onChange={(e) => setEquipmentLifespanYears(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <span className="font-black text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
                    {equipmentLifespanYears} ans
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Période d'amortissement technique du matériel.
                </span>
              </div>
            </div>

            {/* ROI Results Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Gain Net Annuel</div>
                <div className="text-xl font-black text-emerald-400">
                  +{formatFCFA(netAnnualGain)} / an
                </div>
                <div className="text-[10px] text-slate-400">
                  Gains (+{formatFCFA(yearlyProductivityGainFCFA)}) - Maint. ({formatFCFA(yearlyMaintenanceCostFCFA)})
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Délai Récupération (Payback)</div>
                <div className="text-xl font-black text-amber-400">
                  {paybackMonths} mois <span className="text-xs text-slate-400 font-normal">({paybackYears.toFixed(1)} ans)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Temps pour rembourser l'investissement initial
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Profit Net sur {equipmentLifespanYears} Ans</div>
                <div className={`text-xl font-black ${totalNetLifetimeGain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatFCFA(totalNetLifetimeGain)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Gain net accumulé après amortissement complet
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl space-y-1 shadow-md">
                <div className="text-[10px] font-black uppercase text-slate-950">ROI Global (%)</div>
                <div className="text-2xl font-black">
                  {roiPercent.toFixed(1)}%
                </div>
                <div className="text-[10px] font-bold text-slate-900">
                  Rendement net global sur l'investissement
                </div>
              </div>
            </div>

            {/* Decision Recommendation Banner */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-black">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    Avis de Décision d'Investissement :
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {paybackYears <= 3 ? (
                      <span className="text-emerald-400 font-bold">
                        ✅ EXCELLENT ROI : L'investissement s'amortit en seulement {paybackMonths} mois. Projet d'acquisition fortement recommandé.
                      </span>
                    ) : paybackYears <= 5 ? (
                      <span className="text-amber-300 font-bold">
                        ⚠️ ROI MOYEN : Amortissement en {paybackYears.toFixed(1)} ans. Investissement viable à moyen terme.
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold">
                        🛑 ROI FAIBLE : Amortissement supérieur à 5 ans. Vérifier si les réductions de coûts peuvent être optimisées.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Ratio Gain/Coût : <strong className="text-amber-300">{((yearlyProductivityGainFCFA * equipmentLifespanYears) / (equipmentCostFCFA || 1)).toFixed(2)}x</strong>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
