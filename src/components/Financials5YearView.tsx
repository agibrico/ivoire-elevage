import React, { useState } from "react";
import { formatFCFA, formatPercent } from "../utils/formatters";
import { getYearlyProjectionsData } from "../data/businessPlanData";
import { UnitCosts } from "../types";
import { TrendingUp, DollarSign, Award, ArrowUpRight, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";

interface Financials5YearViewProps {
  unitCosts?: UnitCosts;
}

export const Financials5YearView: React.FC<Financials5YearViewProps> = ({ unitCosts }) => {
  const yearlyData = getYearlyProjectionsData(unitCosts);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);
  const selectedYear = yearlyData[selectedYearIndex];

  const chartData = yearlyData.map((y) => ({
    year: `Année ${y.year}`,
    "CA Avicole": y.caAvicole,
    "CA Porcin": y.caPorcin,
    "Charges Totales": y.chargesOperationnelles + y.chargesStructure,
    "Bénéfice Net": y.beneficeNet,
    "Marge Nette %": Number(((y.beneficeNet / y.caTotal) * 100).toFixed(1)),
  }));

  const total5YearsRevenue = yearlyData.reduce((sum, y) => sum + y.caTotal, 0);
  const total5YearsProfit = yearlyData.reduce((sum, y) => sum + y.beneficeNet, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500 text-emerald-950 font-bold px-3 py-1 rounded-full text-xs uppercase mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Plan d'Expansion 5 Ans (2027 - 2031)</span>
          </div>
          <h2 className="text-2xl font-extrabold">
            Compte de Résultat Prévisionnel Consolidé en Régime de Croisière
          </h2>
          <p className="text-emerald-200 text-sm max-w-2xl mt-1">
            Mise en lumière de la surcroissance tirée par la porciculture de reproduction et la stabilisation des ventes d'escalopes et poulets entiers.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-emerald-900 p-3.5 rounded-xl border border-emerald-700 text-right">
            <div className="text-xs text-emerald-300">CA Total Cumulé (5 Ans)</div>
            <div className="text-xl font-extrabold text-amber-400">
              {formatFCFA(total5YearsRevenue)}
            </div>
          </div>
          <div className="bg-emerald-900 p-3.5 rounded-xl border border-emerald-700 text-right">
            <div className="text-xs text-emerald-300">Bénéfice Net Cumulé</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatFCFA(total5YearsProfit)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table from PDF Document Section 5 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span>5. Expansion sur 5 Ans (2027 - 2031) : Compte de Résultat Prévisionnel Consolidé</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                <th className="p-3 rounded-tl-lg">Indicateurs (en FCFA)</th>
                {yearlyData.map((y) => (
                  <th key={y.year} className="p-3 text-right">
                    Année {y.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-emerald-800 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>CA Avicole</span>
                </td>
                {yearlyData.map((y) => (
                  <td key={y.year} className="p-3 text-right font-semibold text-emerald-700">
                    {formatFCFA(y.caAvicole)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-amber-800 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>CA Porcin</span>
                </td>
                {yearlyData.map((y) => (
                  <td key={y.year} className="p-3 text-right font-semibold text-amber-700">
                    {formatFCFA(y.caPorcin)}
                  </td>
                ))}
              </tr>

              <tr className="bg-emerald-50/70 font-bold">
                <td className="p-3 text-emerald-950 text-sm">CA TOTAL</td>
                {yearlyData.map((y) => (
                  <td key={y.year} className="p-3 text-right text-emerald-900 text-sm font-extrabold">
                    {formatFCFA(y.caTotal)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="p-3 text-rose-800">Charges Opérationnelles</td>
                {yearlyData.map((y) => (
                  <td key={y.year} className="p-3 text-right text-rose-700">
                    {formatFCFA(y.chargesOperationnelles)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="p-3 text-rose-900">Charges de Structure</td>
                {yearlyData.map((y) => (
                  <td key={y.year} className="p-3 text-right text-rose-800">
                    {formatFCFA(y.chargesStructure)}
                  </td>
                ))}
              </tr>

              <tr className="bg-amber-400 text-slate-950 font-black text-sm">
                <td className="p-3 rounded-bl-lg">BÉNÉFICE NET ANNUEL</td>
                {yearlyData.map((y) => (
                  <td key={y.year} className="p-3 text-right rounded-br-lg text-base">
                    {formatFCFA(y.beneficeNet)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Year Selector & Performance Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Year Detail Focus */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-base">
              Focus Annuel Sélectionné
            </h4>
            <select
              value={selectedYearIndex}
              onChange={(e) => setSelectedYearIndex(Number(e.target.value))}
              className="bg-slate-100 font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
            >
              {yearlyData.map((y, idx) => (
                <option key={y.year} value={idx}>
                  Année {y.year}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-slate-500 font-medium">Répartition du CA :</div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-700">Avicole: {formatFCFA(selectedYear.caAvicole)}</span>
                <span className="text-amber-700">Porcin: {formatFCFA(selectedYear.caPorcin)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-slate-500 font-medium">Total Charges d'Exploitation :</div>
              <div className="font-bold text-rose-700 text-sm">
                {formatFCFA(selectedYear.chargesOperationnelles + selectedYear.chargesStructure)}
              </div>
            </div>

            <div className="p-3 bg-amber-500 text-slate-950 rounded-xl space-y-1">
              <div className="font-bold uppercase tracking-wider text-xs">Bénéfice Net Réalisé :</div>
              <div className="text-2xl font-black">{formatFCFA(selectedYear.beneficeNet)}</div>
              <div className="text-xs font-semibold">
                Rentabilité Nette / CA : {formatPercent((selectedYear.beneficeNet / selectedYear.caTotal) * 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            <span>Analyse de Croissance du CA & du Bénéfice Net (2027 - 2031)</span>
          </h4>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000000}M`} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 60]} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(value: any, name: any) => [name === "Marge Nette %" ? `${value}%` : formatFCFA(Number(value)), name]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar yAxisId="left" dataKey="CA Avicole" stackId="a" fill="#059669" />
                <Bar yAxisId="left" dataKey="CA Porcin" stackId="a" fill="#D97706" />
                <Line yAxisId="left" type="monotone" dataKey="Bénéfice Net" stroke="#0F766E" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="Marge Nette %" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
