import React, { useState } from "react";
import { UnitCosts, CutDetail } from "../types";
import { formatFCFA, formatFCFADecimal, formatPercent } from "../utils/formatters";
import {
  defaultCutBreakdown,
  weightedAveragePouletRevenue,
  startupInvestmentMois1,
} from "../data/businessPlanData";
import { Egg, PieChart as PieChartIcon, Calculator, Check, ArrowUpRight, Scale, Wheat, Sparkles, CheckCircle2, TrendingUp, Info } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface AvicultureViewProps {
  unitCosts: UnitCosts;
}

export const AvicultureView: React.FC<AvicultureViewProps> = ({ unitCosts }) => {
  // Local state for interactive cut prices
  const [cuts, setCuts] = useState<CutDetail[]>(defaultCutBreakdown);
  const [batchSize, setBatchSize] = useState<number>(150);
  const [mortalityPercent, setMortalityPercent] = useState<number>(5);
  const [entirePouletPrice, setEntirePouletPrice] = useState<number>(3500);

  // Recette moyenne du poulet = Total de la somme des prix des différentes découpes
  const totalCutRevenuePerSubject = cuts.reduce((sum, item) => sum + item.revenueFCFA, 0);
  const currentPouletRevenue = totalCutRevenuePerSubject;

  // Direct cost per chick (1.7kg purchase + finishing feed)
  // Consommation: 0.5kg gain * IC 2.1 = 1.05kg
  const feedQtyKg = 1.05;
  const feedCostPerSubject = feedQtyKg * unitCosts.alimentFinition; // 277.89
  const totalDirectCostPerSubject = unitCosts.poulet1_7kg + feedCostPerSubject; // 2477.89

  // Batch calculations
  const survivingBirds = Math.floor(batchSize * (1 - mortalityPercent / 100));
  const totalBatchRevenue = survivingBirds * currentPouletRevenue;
  const totalBatchCost = batchSize * totalDirectCostPerSubject;
  const batchGrossProfit = totalBatchRevenue - totalBatchCost;
  const marginPerBird = currentPouletRevenue - totalDirectCostPerSubject;

  const COLORS = ["#059669", "#10B981", "#34D399", "#D97706", "#F59E0B", "#FBBF24", "#6EE7B7"];

  const handlePriceChange = (id: string, newPrice: number) => {
    setCuts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          let rev = 0;
          if (c.unitType === "kg") {
            rev = (c.weightGrams / 1000) * newPrice;
          } else {
            rev = newPrice;
          }
          return { ...c, pricePerKgOrUnit: newPrice, revenueFCFA: rev };
        }
        return c;
      })
    );
  };

  const cutPieData = cuts.map((c) => ({
    name: c.name,
    value: Math.round(c.revenueFCFA),
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-md border border-emerald-800 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-800 text-emerald-200 border border-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2">
            <Egg className="w-3.5 h-3.5 text-amber-400" />
            <span>Volet Avicole Intensif</span>
          </div>
          <h2 className="text-2xl font-extrabold">
            Rotation Échelonnée Tous les 10 Jours & Découpes
          </h2>
          <p className="text-emerald-200 text-sm max-w-2xl mt-1">
            Garantie d'un flux de trésorerie immédiat dès le premier mois. Achat de poulets vifs de 1,7 kg, finition rapide jusqu'à 2,2 kg et valorisation optimale par découpes.
          </p>
        </div>

        <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-700/60 text-right">
          <div className="text-xs text-emerald-300">Recette Moyenne (Total Découpes)</div>
          <div className="text-2xl font-extrabold text-amber-400">
            {formatFCFA(Math.round(currentPouletRevenue))}
          </div>
          <div className="text-xs text-emerald-200">somme des prix des découpes</div>
        </div>
      </div>

      {/* Direct Cost & Startup Investment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Cost Formula */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>A. Calcul du Coût de Revient Direct (Poulet de 1,7 kg à 2,2 kg)</span>
          </h3>

          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3 text-xs text-slate-800">
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/60">
              <span className="font-medium text-slate-600">Prix d'achat vif (1,7 kg) :</span>
              <span className="font-bold">{formatFCFA(unitCosts.poulet1_7kg)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-200/60">
              <span className="font-medium text-slate-600">Gain de poids visé :</span>
              <span className="font-bold">500 g (de 1,7 kg à 2,2 kg)</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-200/60">
              <span className="font-medium text-slate-600">Indice de Consommation (IC) :</span>
              <span className="font-bold text-emerald-700">2,1 sur la phase de finition</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-200/60">
              <span className="font-medium text-slate-600">Aliment Finition consommé :</span>
              <span className="font-bold">0,5 kg x 2,1 = 1,05 kg d'Aliment Finition</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-200/60">
              <span className="font-medium text-slate-600">Coût Alimentation ({formatFCFADecimal(unitCosts.alimentFinition)}/kg) :</span>
              <span className="font-bold text-emerald-800">{formatFCFADecimal(feedCostPerSubject)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-emerald-900">
              <span>Coût de Revient Direct (Achat + Aliment) :</span>
              <span className="text-emerald-700 text-base">{formatFCFADecimal(totalDirectCostPerSubject)}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex justify-between items-center">
            <div>
              <div className="font-bold">Marge Brute sur Coût Direct :</div>
              <div className="text-slate-600">Recette moyenne ({formatFCFA(Math.round(currentPouletRevenue))}) - Coût direct ({formatFCFADecimal(totalDirectCostPerSubject)})</div>
            </div>
            <div className="text-lg font-extrabold text-amber-700">
              +{formatFCFADecimal(marginPerBird)} / poulet
            </div>
          </div>
        </div>

        {/* Startup Investment M1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-amber-600" />
            <span>B. Investissement Initial de Démarrage (Mois 1 - 150 Poulets)</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs text-slate-700">
            <div className="py-2.5 flex justify-between items-center">
              <span>Achat des 150 poulets de 1,7 kg (150 x 2 200 FCFA)</span>
              <span className="font-bold text-slate-900">{formatFCFA(startupInvestmentMois1.achat150Poulets)}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span>Avance bâtiment avicole (Mois 1)</span>
              <span className="font-bold text-slate-900">{formatFCFA(startupInvestmentMois1.avanceBatimentAvicole)}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span>Alimentation finition associée (150 x 1,05 kg x 264,66)</span>
              <span className="font-bold text-slate-900">{formatFCFA(startupInvestmentMois1.alimentFinition)}</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span>Dépenses diverses / Litière / Énergie</span>
              <span className="font-bold text-slate-900">{formatFCFA(startupInvestmentMois1.depensesDiverses)}</span>
            </div>

            <div className="pt-3 pb-1 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>TOTAL INVESTISSEMENT DÉMARRAGE :</span>
              <span className="text-emerald-700 text-base bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                {formatFCFA(startupInvestmentMois1.totalFCFA)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <strong>Remarque :</strong> Cet investissement initial de 586 699 FCFA est amorti dès les premières ventes du Mois 1 et permet d'amorcer le cycle de rotation d'achat de porcelets.
          </div>
        </div>
      </div>

      {/* Cut Breakdown & Interactive Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-emerald-600" />
              <span>C. Valuation & Découpes (Recette = Somme des Prix des Découpes)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sur un poulet de 2,2 kg vif (carcasse nette ~1,65 kg). La recette moyenne du poulet est calculée par la somme totale des prix des différentes découpes.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
            <div className="text-xs text-slate-600 font-medium">Recette Moyenne (Somme Découpes) :</div>
            <div className="text-base font-extrabold text-emerald-800">
              {formatFCFADecimal(totalCutRevenuePerSubject)} / poulet
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-3">Morceau / Découpe</th>
                  <th className="p-3 text-center">Part (%)</th>
                  <th className="p-3 text-center">Poids (g)</th>
                  <th className="p-3 text-right">Tarif Unitaire (FCFA)</th>
                  <th className="p-3 text-right">Recette Générée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cuts.map((cut) => (
                  <tr key={cut.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-800 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>{cut.name}</span>
                    </td>
                    <td className="p-3 text-center text-slate-600">{formatPercent(cut.sharePercent)}</td>
                    <td className="p-3 text-center text-slate-600">{cut.weightGrams} g</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <input
                          type="number"
                          value={cut.pricePerKgOrUnit}
                          onChange={(e) => handlePriceChange(cut.id, Number(e.target.value))}
                          className="w-20 text-right px-2 py-1 border border-slate-300 rounded font-bold text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-slate-500">
                          {cut.unitType === "kg" ? "/kg" : cut.unitType === "paire" ? "/p" : "/u"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">
                      {formatFCFADecimal(cut.revenueFCFA)}
                    </td>
                  </tr>
                ))}
                {/* Entier row */}
                <tr className="bg-amber-50/50">
                  <td className="p-3 font-bold text-amber-900" colSpan={3}>
                    Vente Entier (30% du lot global)
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center space-x-1">
                      <input
                        type="number"
                        value={entirePouletPrice}
                        onChange={(e) => setEntirePouletPrice(Number(e.target.value))}
                        className="w-20 text-right px-2 py-1 border border-amber-300 rounded font-bold text-amber-900 text-xs"
                      />
                      <span className="text-amber-700">/unité</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-extrabold text-amber-800">
                    {formatFCFA(entirePouletPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pie Chart */}
          <div className="h-64 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Répartition des Recettes par Découpe (FCFA)
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={cutPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cutPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatFCFA(Number(value)), "Recette"]} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* REVISED FEED FORMULATION & KEY INGREDIENTS SECTION (DOC AVIVOIRE) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase mb-1">
              <Wheat className="w-3.5 h-3.5 text-amber-600" />
              <span>Formulations Alimentaires Révisées (Pour 100 kg)</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Alimentation Poulet de Chair & Analyse des 5 Ingrédients
            </h3>
            <p className="text-xs text-slate-500">
              Nouvelles formulations avec Farine de poisson, L-Lysine, DL-Méthionine, Phosphate bicalcique et Carbonate de calcium.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
              Coût Croissance: 280,09 FCFA/kg (14 005 FCFA/sac 50kg)
            </span>
            <span className="text-xs font-black bg-sky-100 text-sky-800 px-3 py-1.5 rounded-xl border border-sky-200">
              Coût Finition: 301,61 FCFA/kg (15 081 FCFA/sac 50kg)
            </span>
          </div>
        </div>

        {/* 2 Tables: Croissance vs Finition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table A. Aliment Croissance */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-emerald-900 text-white p-3 flex justify-between items-center text-xs font-bold">
              <span className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>A. Aliment Croissance (100 kg)</span>
              </span>
              <span className="bg-emerald-800 px-2 py-0.5 rounded text-[11px] text-amber-300">
                Coût: 28 009 FCFA (280,09 FCFA/kg)
              </span>
            </div>
            <div className="p-3 bg-slate-50 text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-1">Ingrédient</th>
                    <th className="py-1 text-center">Qté (kg)</th>
                    <th className="py-1 text-right">Prix/kg</th>
                    <th className="py-1 text-right">Total FCFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr><td className="py-1 font-semibold">Maïs</td><td className="text-center font-bold">43,70 kg</td><td className="text-right">170 FCFA</td><td className="text-right font-bold text-slate-900">7 429 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Tourteau de soja</td><td className="text-center font-bold">35,00 kg</td><td className="text-right">350 FCFA</td><td className="text-right font-bold text-slate-900">12 250 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Blé</td><td className="text-center font-bold">12,00 kg</td><td className="text-right">120 FCFA</td><td className="text-right font-bold text-slate-900">1 440 FCFA</td></tr>
                  <tr className="bg-amber-50/60"><td className="py-1 font-bold text-amber-900">Farine de poisson (65%)</td><td className="text-center font-bold">4,00 kg</td><td className="text-right">320 FCFA</td><td className="text-right font-bold text-amber-900">1 280 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Huile végétale</td><td className="text-center font-bold">2,00 kg</td><td className="text-right">1 000 FCFA</td><td className="text-right font-bold text-slate-900">2 000 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Pré-mix CMV 1%</td><td className="text-center font-bold">1,00 kg</td><td className="text-right">3 000 FCFA</td><td className="text-right font-bold text-slate-900">3 000 FCFA</td></tr>
                  <tr className="bg-sky-50/60"><td className="py-1 font-bold text-sky-900">Phosphate bicalcique</td><td className="text-center font-bold">1,00 kg</td><td className="text-right">600 FCFA</td><td className="text-right font-bold text-sky-900">600 FCFA</td></tr>
                  <tr className="bg-sky-50/60"><td className="py-1 font-bold text-sky-900">Carbonate de calcium</td><td className="text-center font-bold">0,80 kg</td><td className="text-right">200 FCFA</td><td className="text-right font-bold text-sky-900">160 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Sel</td><td className="text-center font-bold">0,30 kg</td><td className="text-right">500 FCFA</td><td className="text-right font-bold text-slate-900">150 FCFA</td></tr>
                  <tr className="bg-purple-50/60"><td className="py-1 font-bold text-purple-900">L-Lysine</td><td className="text-center font-bold">0,10 kg</td><td className="text-right">2 850 FCFA</td><td className="text-right font-bold text-purple-900">285 FCFA</td></tr>
                  <tr className="bg-purple-50/60"><td className="py-1 font-bold text-purple-900">DL-Méthionine</td><td className="text-center font-bold">0,10 kg</td><td className="text-right">4 150 FCFA</td><td className="text-right font-bold text-purple-900">415 FCFA</td></tr>
                  <tr className="font-black bg-emerald-100 text-emerald-950">
                    <td className="py-1.5">TOTAL (100 kg)</td>
                    <td className="text-center py-1.5">100,00 kg</td>
                    <td className="text-right py-1.5">-</td>
                    <td className="text-right py-1.5 text-xs text-emerald-900">28 009 FCFA</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-[10px] text-emerald-800 font-bold bg-emerald-100/60 p-2 rounded flex justify-between">
                <span>Coût de revient : 280,09 FCFA/kg</span>
                <span>Coût sac 50 kg : 14 005 FCFA</span>
              </div>
            </div>
          </div>

          {/* Table B. Aliment Finition */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-sky-900 text-white p-3 flex justify-between items-center text-xs font-bold">
              <span className="flex items-center space-x-2">
                <Wheat className="w-4 h-4 text-sky-300" />
                <span>B. Aliment Finition (100 kg)</span>
              </span>
              <span className="bg-sky-800 px-2 py-0.5 rounded text-[11px] text-amber-300">
                Coût: 30 161 FCFA (301,61 FCFA/kg)
              </span>
            </div>
            <div className="p-3 bg-slate-50 text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-1">Ingrédient</th>
                    <th className="py-1 text-center">Qté (kg)</th>
                    <th className="py-1 text-right">Prix/kg</th>
                    <th className="py-1 text-right">Total FCFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr><td className="py-1 font-semibold">Maïs</td><td className="text-center font-bold">49,00 kg</td><td className="text-right">170 FCFA</td><td className="text-right font-bold text-slate-900">8 330 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Tourteau de soja</td><td className="text-center font-bold">35,00 kg</td><td className="text-right">350 FCFA</td><td className="text-right font-bold text-slate-900">12 250 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Blé</td><td className="text-center font-bold">7,00 kg</td><td className="text-right">120 FCFA</td><td className="text-right font-bold text-slate-900">840 FCFA</td></tr>
                  <tr className="bg-amber-50/60"><td className="py-1 font-bold text-amber-900">Farine de poisson (65%)</td><td className="text-center font-bold">2,50 kg</td><td className="text-right">320 FCFA</td><td className="text-right font-bold text-amber-900">800 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Huile végétale</td><td className="text-center font-bold">3,00 kg</td><td className="text-right">1 000 FCFA</td><td className="text-right font-bold text-slate-900">3 000 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Pré-mix CMV 1%</td><td className="text-center font-bold">1,00 kg</td><td className="text-right">3 000 FCFA</td><td className="text-right font-bold text-slate-900">3 000 FCFA</td></tr>
                  <tr className="bg-sky-50/60"><td className="py-1 font-bold text-sky-900">Phosphate bicalcique</td><td className="text-center font-bold">0,90 kg</td><td className="text-right">600 FCFA</td><td className="text-right font-bold text-sky-900">540 FCFA</td></tr>
                  <tr className="bg-sky-50/60"><td className="py-1 font-bold text-sky-900">Carbonate de calcium</td><td className="text-center font-bold">1,00 kg</td><td className="text-right">200 FCFA</td><td className="text-right font-bold text-sky-900">200 FCFA</td></tr>
                  <tr><td className="py-1 font-semibold">Sel</td><td className="text-center font-bold">0,30 kg</td><td className="text-right">500 FCFA</td><td className="text-right font-bold text-slate-900">150 FCFA</td></tr>
                  <tr className="bg-purple-50/60"><td className="py-1 font-bold text-purple-900">L-Lysine</td><td className="text-center font-bold">0,15 kg</td><td className="text-right">2 850 FCFA</td><td className="text-right font-bold text-purple-900">428 FCFA</td></tr>
                  <tr className="bg-purple-50/60"><td className="py-1 font-bold text-purple-900">DL-Méthionine</td><td className="text-center font-bold">0,15 kg</td><td className="text-right">4 150 FCFA</td><td className="text-right font-bold text-purple-900">623 FCFA</td></tr>
                  <tr className="font-black bg-sky-100 text-sky-950">
                    <td className="py-1.5">TOTAL (100 kg)</td>
                    <td className="text-center py-1.5">100,00 kg</td>
                    <td className="text-right py-1.5">-</td>
                    <td className="text-right py-1.5 text-xs text-sky-900">30 161 FCFA</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-[10px] text-sky-800 font-bold bg-sky-100/60 p-2 rounded flex justify-between">
                <span>Coût de revient : 301,61 FCFA/kg</span>
                <span>Coût sac 50 kg : 15 081 FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roles of key ingredients & Performance Targets */}
        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-amber-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Rôle des Nouveaux Ingrédients & Performance Pondérale Attendu</span>
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-bold">
              Souches Cobb 500 / Ross 308 / Arbor Acres
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">1. Farine de poisson (320 FCFA/kg)</div>
              <p className="text-slate-300">Protéines 55-65% très digestibles + Lysine/Méthionine. Accélère la croissance, renforce l'immunité et développe le filet (poitrine).</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-purple-300">2. L-Lysine (2850 FCFA) & DL-Méthionine (4150 FCFA)</div>
              <p className="text-slate-300">Acides aminés essentiels limitants. Équilibrent les rations céréalières, stimulent la masse musculaire, le plumage et la santé hépatique.</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-sky-300">3. Phosphate bicalcique (600 FCFA) & Carbonate (200 FCFA)</div>
              <p className="text-slate-300">Synergie Phospho-Calcique (Ca/P ~ 2:1). Solidité osseuse, prévention des boiteries et soutien musculaire à moindre coût.</p>
            </div>
          </div>

          <div className="bg-emerald-950/80 p-3 rounded-lg border border-emerald-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center space-x-2 font-bold text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Objectifs de Poids Cibles :</span>
            </div>
            <div className="flex items-center space-x-4 font-black">
              <span className="bg-emerald-900 px-3 py-1 rounded border border-emerald-600 text-amber-300">
                À 35 jours (5 semaines) : 2,2 kg / sujet
              </span>
              <span className="bg-emerald-900 px-3 py-1 rounded border border-emerald-600 text-amber-300">
                À 42 jours (6 semaines) : 2,5 kg / sujet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Batch Simulator */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <span>Simulateur Rapide de Bande Avicole</span>
          </h3>
          <span className="text-xs bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700">
            Calculateur instantané de rentabilité par lot
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Input 1 */}
          <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700/60">
            <label className="text-xs font-semibold text-emerald-200 block mb-1">
              Nombre de sujets par bande :
            </label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Math.max(10, Number(e.target.value)))}
              className="w-full bg-emerald-900 text-white font-bold p-2 rounded border border-emerald-600 text-sm"
            />
          </div>

          {/* Input 2 */}
          <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700/60">
            <label className="text-xs font-semibold text-emerald-200 block mb-1">
              Taux de mortalité estimé (%) :
            </label>
            <input
              type="number"
              step="0.5"
              value={mortalityPercent}
              onChange={(e) => setMortalityPercent(Number(e.target.value))}
              className="w-full bg-emerald-900 text-white font-bold p-2 rounded border border-emerald-600 text-sm"
            />
          </div>

          {/* Input 3 */}
          <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700/60">
            <label className="text-xs font-semibold text-emerald-200 block mb-1">
              Sujets vendus prévus :
            </label>
            <div className="text-xl font-extrabold text-amber-400 p-1">
              {survivingBirds} poulets ({formatPercent(100 - mortalityPercent)} survie)
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-800">
          <div className="bg-emerald-800/60 p-3 rounded-xl">
            <div className="text-xs text-emerald-300">Recette Totale du Lot :</div>
            <div className="text-xl font-bold text-white">{formatFCFA(totalBatchRevenue)}</div>
          </div>

          <div className="bg-emerald-800/60 p-3 rounded-xl">
            <div className="text-xs text-emerald-300">Coût Direct Total (Achat + Aliment) :</div>
            <div className="text-xl font-bold text-white">{formatFCFADecimal(totalBatchCost)}</div>
          </div>

          <div className="bg-amber-500 text-emerald-950 p-3 rounded-xl">
            <div className="text-xs font-bold uppercase tracking-wider">Marge Brute Net du Lot :</div>
            <div className="text-2xl font-black">{formatFCFADecimal(batchGrossProfit)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
