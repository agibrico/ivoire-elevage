import React, { useState } from "react";
import { formatFCFA, formatNumber } from "../utils/formatters";
import { getMonthlyInitialPhaseData } from "../data/businessPlanData";
import { MonthlyPhaseData, UnitCosts } from "../types";
import { Calendar, TrendingUp, PiggyBank, CheckCircle2, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface MonthlyPhaseViewProps {
  unitCosts?: UnitCosts;
}

export const MonthlyPhaseView: React.FC<MonthlyPhaseViewProps> = ({ unitCosts }) => {
  const monthlyData = getMonthlyInitialPhaseData(unitCosts);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyPhaseData>(monthlyData[0]);

  const totalCAAvicole5M = monthlyData.reduce((sum, m) => sum + m.caAvicole, 0);
  const totalBeneficeNet5M = monthlyData.reduce((sum, m) => sum + m.beneficeNet, 0);

  const chartData = monthlyData.map((m) => ({
    name: `${m.monthId} (${m.monthName})`,
    "CA Avicole": m.caAvicole,
    "Coût Total": m.coutTotal,
    "Bénéfice Net": m.beneficeNet,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-800 text-emerald-200 border border-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase Initiale de Démarrage (Août - Décembre 2026)</span>
          </div>
          <h2 className="text-2xl font-extrabold">
            Évolution Mensuelle M1 à M5
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            Trajectoire mensuelle montrant la montée en puissance du volume de poussins, le chiffre d'affaires avicole en hausse constante, et le couplage avec les achats & ventes porcines.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-right">
            <div className="text-xs text-slate-400">Total CA Avicole (5 Mois)</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatFCFA(totalCAAvicole5M)}
            </div>
          </div>
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-right">
            <div className="text-xs text-slate-400">Total Bénéfice Net (5 Mois)</div>
            <div className="text-xl font-extrabold text-amber-400">
              {formatFCFA(totalBeneficeNet5M)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table from PDF Document */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>4. Tableau d'Évolution Mensuelle de la Phase Initiale (Août - Décembre 2026)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-white uppercase tracking-wider font-semibold">
                <th className="p-3 rounded-tl-lg">Mois</th>
                <th className="p-3 text-center">Bandes (10J)</th>
                <th className="p-3 text-center">Poussins</th>
                <th className="p-3 text-center">Vendus (95%)</th>
                <th className="p-3 text-right">CA Avicole (FCFA)</th>
                <th className="p-3 text-right">Coût Total (FCFA)</th>
                <th className="p-3 text-right">Bénéfice Net (FCFA)</th>
                <th className="p-3 rounded-tr-lg">Actions Porcines Associated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {monthlyData.map((m) => {
                const isSelected = selectedMonth.monthId === m.monthId;
                return (
                  <tr
                    key={m.monthId}
                    onClick={() => setSelectedMonth(m)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-amber-50/90 font-bold border-l-4 border-amber-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 text-slate-900 font-bold">
                      {m.monthId} ({m.monthName})
                    </td>
                    <td className="p-3 text-center text-slate-700">{m.bandes10j}</td>
                    <td className="p-3 text-center text-slate-700">{m.poussins}</td>
                    <td className="p-3 text-center text-emerald-700 font-semibold">
                      {formatNumber(m.vendus95)}
                    </td>
                    <td className="p-3 text-right text-emerald-800 font-bold">
                      {formatFCFA(m.caAvicole)}
                    </td>
                    <td className="p-3 text-right text-rose-700">
                      {formatFCFA(m.coutTotal)}
                    </td>
                    <td className="p-3 text-right text-amber-700 font-extrabold text-sm">
                      {formatFCFA(m.beneficeNet)}
                    </td>
                    <td className="p-3 text-slate-700 text-xs italic">
                      {m.actionsPorcines}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Card for Selected Month & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Month Detail */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
            <div>
              <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                Fiche Mensuelle Détaillée
              </div>
              <h4 className="text-xl font-extrabold">
                Mois {selectedMonth.monthId} - {selectedMonth.monthName} {selectedMonth.year}
              </h4>
            </div>
            <div className="p-2 bg-emerald-800 text-amber-400 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-emerald-800/50">
              <span className="text-emerald-200">Volume de Bandes (10j) :</span>
              <span className="font-bold text-white text-sm">{selectedMonth.bandes10j} sujet(s)</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-800/50">
              <span className="text-emerald-200">Poussins mis en élevage :</span>
              <span className="font-bold text-white">{selectedMonth.poussins} sujets</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-800/50">
              <span className="text-emerald-200">Sujets vendus (Taux 95%) :</span>
              <span className="font-bold text-amber-300">{selectedMonth.vendus95} poulets</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-800/50">
              <span className="text-emerald-200">Chiffre d'Affaires Avicole :</span>
              <span className="font-bold text-emerald-300">{formatFCFA(selectedMonth.caAvicole)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-emerald-800/50">
              <span className="text-emerald-200">Coûts d'Exploitation :</span>
              <span className="font-bold text-rose-300">{formatFCFA(selectedMonth.coutTotal)}</span>
            </div>

            <div className="flex justify-between items-center py-2 text-sm font-extrabold bg-emerald-950/80 px-3 rounded-lg border border-emerald-700/60">
              <span className="text-amber-300">BÉNÉFICE NET AVICOLE :</span>
              <span className="text-amber-400 text-base">{formatFCFA(selectedMonth.beneficeNet)}</span>
            </div>
          </div>

          <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60 space-y-1">
            <div className="text-xs font-bold text-amber-300 flex items-center space-x-1">
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Action Porcine du Mois :</span>
            </div>
            <div className="text-xs text-amber-100">{selectedMonth.actionsPorcines}</div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Comparatif Financier Phase de Lancement (FCFA)</span>
          </h4>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(value: any) => [formatFCFA(Number(value)), ""]} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="CA Avicole" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Coût Total" fill="#E11D48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bénéfice Net" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
