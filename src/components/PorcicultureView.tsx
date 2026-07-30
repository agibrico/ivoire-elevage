import React, { useState } from "react";
import { UnitCosts } from "../types";
import { formatFCFA, formatFCFADecimal } from "../utils/formatters";
import { PiggyBank, Calendar, DollarSign, Calculator, CheckCircle2 } from "lucide-react";

interface PorcicultureViewProps {
  unitCosts: UnitCosts;
}

export const PorcicultureView: React.FC<PorcicultureViewProps> = ({ unitCosts }) => {
  // Interactive Porcine Simulator state
  const [numPigs, setNumPigs] = useState<number>(30);
  const [pigletPrice, setPigletPrice] = useState<number>(unitCosts.porcelet);
  const [carcassWeightKg, setCarcassWeightKg] = useState<number>(unitCosts.porcCharcutierPoidsCarcasse);
  const [pricePerKg, setPricePerKg] = useState<number>(unitCosts.porcCharcutierPrixKg);
  const [estimatedFeedCostPerPig, setEstimatedFeedCostPerPig] = useState<number>(65000); // FCFA per pig for fattening

  // Specific December Dual-Batch Calculation (Achetes fin aout = 70kg, achetes fin septembre = 60kg)
  const augBatchPigs = 10;
  const augBatchCarcassKg = 70;
  const augBatchRev = augBatchPigs * augBatchCarcassKg * pricePerKg; // 1,470,000 FCFA @ 2100

  const sepBatchPigs = 20;
  const sepBatchCarcassKg = 60;
  const sepBatchRev = sepBatchPigs * sepBatchCarcassKg * pricePerKg; // 2,520,000 FCFA @ 2100

  const decTotalPigs = augBatchPigs + sepBatchPigs; // 30 porcs
  const decTotalRevenue = augBatchRev + sepBatchRev; // 3,990,000 FCFA
  const decTotalPurchaseCost = decTotalPigs * pigletPrice; // 750,000 FCFA
  const decTotalGain = decTotalRevenue - decTotalPurchaseCost; // 3,240,000 FCFA
  const decWeightedAvgCarcass = (augBatchPigs * augBatchCarcassKg + sepBatchPigs * sepBatchCarcassKg) / decTotalPigs; // 63.33 kg

  // General single-batch simulator calculations
  const revenuePerHead = carcassWeightKg * pricePerKg;
  const totalRevenue = numPigs * revenuePerHead;
  const totalPurchaseCost = numPigs * pigletPrice;
  const totalFeedCost = numPigs * estimatedFeedCostPerPig;
  const totalCost = totalPurchaseCost + totalFeedCost;
  const netMargin = totalRevenue - totalCost;
  const marginPerHead = revenuePerHead - (pigletPrice + estimatedFeedCostPerPig);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-amber-900 rounded-2xl p-6 text-white shadow-md border border-amber-800 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-800 text-amber-200 border border-amber-700 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2">
            <PiggyBank className="w-3.5 h-3.5 text-amber-300" />
            <span>Volet Porcin : Engraissement & Reproduction</span>
          </div>
          <h2 className="text-2xl font-extrabold">
            Stratégie d'Engraissement Initial & Reproduction (Août - Décembre 2026)
          </h2>
          <p className="text-amber-100 text-sm max-w-2xl mt-1">
            Les bénéfices générés par la rotation avicole financent l'acquisition des porcelets. En décembre, la vente des 30 porcs (10 porcs d'août à 70 kg + 20 porcs de sept. à 60 kg) génère <strong>3 990 000 FCFA</strong> de CA.
          </p>
        </div>

        <div className="bg-amber-950/90 p-4 rounded-xl border border-amber-700/60 text-right">
          <div className="text-xs text-amber-300">CA Vente Décembre 2026</div>
          <div className="text-2xl font-extrabold text-amber-400">
            {formatFCFA(decTotalRevenue)}
          </div>
          <div className="text-xs text-amber-200">Gain sur achat : +{formatFCFA(decTotalGain)}</div>
        </div>
      </div>

      {/* Timeline of Initial Acquisitions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span>Chronologie de la Phase Initiale (Engraissement)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200/80 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-md">
                Fin Août 2026 (Mois 1)
              </span>
              <span className="text-xs font-extrabold text-slate-500">Étape 1</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              Achat des 10 premiers porcelets
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Achat de 10 porcelets à <strong>{formatFCFA(25000)}</strong> = <strong>{formatFCFA(250000)}</strong>.
            </p>
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-medium">
              ✓ Financé à 100% par les bénéfices de la rotation avicole du mois 1 ({formatFCFA(674500)}).
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200/80 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-md">
                Fin Sept. 2026 (Mois 2)
              </span>
              <span className="text-xs font-extrabold text-slate-500">Étape 2</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              Achat de 20 porcelets supplémentaires
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Achat de 20 porcelets à <strong>{formatFCFA(25000)}</strong> = <strong>{formatFCFA(500000)}</strong>.
              Effectif total porté à <strong>30 porcelets</strong> en engraissement.
            </p>
            <div className="text-xs text-amber-800 bg-amber-100/70 border border-amber-200 p-2 rounded-lg font-medium">
              • Recruitment du 1er porcher dédié ({formatFCFA(60000)}/mois).
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-amber-100/60 rounded-xl p-5 border border-amber-300 relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-300 px-2.5 py-1 rounded-md">
                Fin Déc. 2026 (Mois 5)
              </span>
              <span className="text-xs font-extrabold text-amber-800">Étape 3 - Clôture</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              Vente des 30 Porcs (2 Lots Engraissés)
            </h4>
            <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
              <div>• <strong>Lot 1 (Fin Août) :</strong> 10 porcs × 70 kg carcasse × {formatFCFA(pricePerKg)} = <strong>{formatFCFA(augBatchRev)}</strong></div>
              <div>• <strong>Lot 2 (Fin Sept.) :</strong> 20 porcs × 60 kg carcasse × {formatFCFA(pricePerKg)} = <strong>{formatFCFA(sepBatchRev)}</strong></div>
            </div>
            <div className="text-xs font-extrabold text-amber-950 bg-amber-400 p-2.5 rounded-lg shadow-sm">
              CA Total : {formatFCFA(decTotalRevenue)} (Gain sur achat : +{formatFCFA(decTotalGain)})
            </div>
          </div>
        </div>
      </div>

      {/* Detailed December Sale Gain Table/Breakdown */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-extrabold text-amber-950 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-amber-700" />
            <span>Détail du Gain sur la Vente des Porcs en Décembre 2026</span>
          </h3>
          <span className="text-xs font-bold text-amber-800 bg-amber-200 px-3 py-1 rounded-full border border-amber-300">
            Tarif carcasse : {formatFCFA(pricePerKg)} / kg
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Lot 1 - Août */}
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-900 text-sm border-b border-amber-100 pb-2">
              <span>Lot 1 : Porcs Achetés Fin Août</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-extrabold">10 sujets</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between"><span>Poids carcasse en décembre :</span><strong className="text-slate-900">70 kg / sujet</strong></div>
              <div className="flex justify-between"><span>Prix d'achat initial (fin août) :</span><span>10 × {formatFCFA(pigletPrice)} = {formatFCFA(10 * pigletPrice)}</span></div>
              <div className="flex justify-between"><span>Recette brute générée :</span><strong className="text-emerald-700">10 × 70 kg × {formatFCFA(pricePerKg)} = {formatFCFA(augBatchRev)}</strong></div>
              <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-amber-900">
                <span>Gain brut sur achat porcelets :</span>
                <span className="text-emerald-800 font-black">+{formatFCFA(augBatchRev - 10 * pigletPrice)}</span>
              </div>
            </div>
          </div>

          {/* Lot 2 - Septembre */}
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-900 text-sm border-b border-amber-100 pb-2">
              <span>Lot 2 : Porcs Achetés Fin Septembre</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-extrabold">20 sujets</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between"><span>Poids carcasse en décembre :</span><strong className="text-slate-900">60 kg / sujet</strong></div>
              <div className="flex justify-between"><span>Prix d'achat initial (fin sept.) :</span><span>20 × {formatFCFA(pigletPrice)} = {formatFCFA(20 * pigletPrice)}</span></div>
              <div className="flex justify-between"><span>Recette brute générée :</span><strong className="text-emerald-700">20 × 60 kg × {formatFCFA(pricePerKg)} = {formatFCFA(sepBatchRev)}</strong></div>
              <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-amber-900">
                <span>Gain brut sur achat porcelets :</span>
                <span className="text-emerald-800 font-black">+{formatFCFA(sepBatchRev - 20 * pigletPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Summary Line */}
        <div className="bg-amber-900 text-white p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-amber-200 font-semibold">Total Cumulé Vente Porcine (Décembre 2026) :</div>
            <div className="text-sm text-amber-100 mt-0.5">30 porcs | Poids carcasse moyen : {decWeightedAvgCarcass.toFixed(1)} kg | Recette moyenne : {formatFCFA(Math.round(decTotalRevenue / 30))}/sujet</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-amber-300 uppercase font-bold">Chiffre d'Affaires : {formatFCFA(decTotalRevenue)}</div>
            <div className="text-lg font-black text-amber-400">Gain Net sur Achat Porcelets : +{formatFCFA(decTotalGain)}</div>
          </div>
        </div>
      </div>

      {/* Breeding & Infrastructure Unit Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breeding Unit Reference */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Reproducteurs & Tarifs de Référence</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs text-slate-700">
            <div className="py-2.5 flex justify-between items-center">
              <span>Porcelet d'engraissement (30-45 jours)</span>
              <span className="font-bold text-slate-900">{formatFCFA(unitCosts.porcelet)}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span>Truie reproductrice sélectionnée</span>
              <span className="font-bold text-slate-900">{formatFCFA(unitCosts.truieReproductrice)}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span>Verrat reproducteur</span>
              <span className="font-bold text-slate-900">{formatFCFA(unitCosts.verrat)}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span>Prix du porc charcutier (carcasse ~75 kg)</span>
              <span className="font-bold text-emerald-700">{formatFCFA(unitCosts.porcCharcutierPrixKg)} / kg</span>
            </div>

            <div className="pt-2 flex justify-between items-center font-bold text-slate-900 text-sm">
              <span>Valeur moyenne porc charcutier fini :</span>
              <span className="text-amber-700">{formatFCFA(revenuePerHead)}</span>
            </div>
          </div>
        </div>

        {/* Infrastructure & Capacity */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <span>Bâtiments & Logistique Porcine</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Porcherie d'Engraissement Initiale :</div>
              <div className="text-slate-600">
                Location mensuelle de <strong>{formatFCFA(20000)}/mois</strong> avec une capacité initiale de <strong>80 têtes</strong>.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Bâtiments Reproducteurs Spécifiques :</div>
              <div className="text-slate-600">
                Construction et aménagement de loges pour les reproducteurs prévus 1 mois avant chaque acquisition de truies/verrats.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Planification des Salaires Porchers :</div>
              <div className="text-slate-600">
                - 1er porcher : Septembre 2026 ({formatFCFA(60000)}/mois)<br />
                - 2ème porcher : Mars 2027 ({formatFCFA(60000)}/mois)<br />
                - 3ème porcher : Juin 2027 ({formatFCFA(60000)}/mois)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Porcine Simulator */}
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <span>Simulateur de Vente Porcine & Marge</span>
          </h3>
          <span className="text-xs bg-amber-800 text-amber-200 px-3 py-1 rounded-full border border-amber-700">
            Testez différentes hypothèses de prix et de charges d'engraissement
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60">
            <label className="text-xs font-semibold text-amber-200 block mb-1">
              Nombre de porcs à vendre :
            </label>
            <input
              type="number"
              value={numPigs}
              onChange={(e) => setNumPigs(Math.max(1, Number(e.target.value)))}
              className="w-full bg-amber-900 text-white font-bold p-2 rounded border border-amber-600 text-sm"
            />
          </div>

          <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60">
            <label className="text-xs font-semibold text-amber-200 block mb-1">
              Prix d'achat par porcelet (FCFA) :
            </label>
            <input
              type="number"
              value={pigletPrice}
              onChange={(e) => setPigletPrice(Number(e.target.value))}
              className="w-full bg-amber-900 text-white font-bold p-2 rounded border border-amber-600 text-sm"
            />
          </div>

          <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60">
            <label className="text-xs font-semibold text-amber-200 block mb-1">
              Poids carcasse moyen (kg) :
            </label>
            <input
              type="number"
              value={carcassWeightKg}
              onChange={(e) => setCarcassWeightKg(Number(e.target.value))}
              className="w-full bg-amber-900 text-white font-bold p-2 rounded border border-amber-600 text-sm"
            />
          </div>

          <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60">
            <label className="text-xs font-semibold text-amber-200 block mb-1">
              Prix de vente carcasse (FCFA/kg) :
            </label>
            <input
              type="number"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(Number(e.target.value))}
              className="w-full bg-amber-900 text-white font-bold p-2 rounded border border-amber-600 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-amber-800">
          <div className="bg-amber-800/60 p-3 rounded-xl">
            <div className="text-xs text-amber-300">Recette Totale de la Vente :</div>
            <div className="text-xl font-bold text-white">{formatFCFA(totalRevenue)}</div>
            <div className="text-xs text-amber-200 mt-0.5">{formatFCFA(revenuePerHead)} / tête</div>
          </div>

          <div className="bg-amber-800/60 p-3 rounded-xl">
            <div className="text-xs text-amber-300">Coût d'Acquisition des Porcelets :</div>
            <div className="text-xl font-bold text-white">{formatFCFA(totalPurchaseCost)}</div>
          </div>

          <div className="bg-amber-400 text-amber-950 p-3 rounded-xl">
            <div className="text-xs font-bold uppercase tracking-wider">Chiffre d'Affaires Net Ajusté :</div>
            <div className="text-2xl font-black">{formatFCFA(netMargin)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
