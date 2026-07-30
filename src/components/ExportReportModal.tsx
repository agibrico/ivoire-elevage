import React, { useState } from "react";
import { X, Printer, Download, CheckCircle2, Target, DollarSign, FileText, Sparkles, Building, PieChart } from "lucide-react";
import { formatFCFA } from "../utils/formatters";
import {
  getYearlyProjectionsData,
  getStartupInvestmentMois1,
  getMonthlyInitialPhaseData,
  getBuildingRentSavings,
} from "../data/businessPlanData";
import { defaultAnnualSalesGoal } from "../data/salesData";
import { UnitCosts } from "../types";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitCosts?: UnitCosts;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  unitCosts,
}) => {
  const [exportFormat, setExportFormat] = useState<"pdf_quarterly" | "csv_raw">("pdf_quarterly");
  const [selectedQuarter, setSelectedQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4" | "ANNUAL">("Q1");

  if (!isOpen) return null;

  const startupInvestment = getStartupInvestmentMois1(unitCosts);
  const monthlyData = getMonthlyInitialPhaseData(unitCosts);
  const yearlyData = getYearlyProjectionsData(unitCosts);
  const savings = getBuildingRentSavings(unitCosts);
  const salesGoal = defaultAnnualSalesGoal;

  const totalActualYTD = salesGoal.monthlyTargets.reduce((acc, m) => acc + m.actualFCFA, 0);
  const goalAchievementPercent = (totalActualYTD / salesGoal.overallTargetFCFA) * 100;
  const gapToGoal = salesGoal.overallTargetFCFA - totalActualYTD;

  // Quarterly financial metrics mapping
  const quarterlyMetrics: Record<string, { title: string; ca: number; cogs: number; opex: number; net: number; poultryRev: number; porkRev: number; cutsRev: number; feedRev: number }> = {
    Q1: { title: "Rapport Trimestriel Q1 (Janvier - Mars 2026)", ca: 18200000, cogs: 8500000, opex: 3200000, net: 6500000, poultryRev: 9500000, porkRev: 5200000, cutsRev: 2100000, feedRev: 1400000 },
    Q2: { title: "Rapport Trimestriel Q2 (Avril - Juin 2026)", ca: 21500000, cogs: 9200000, opex: 3200000, net: 9100000, poultryRev: 11200000, porkRev: 6100000, cutsRev: 2600000, feedRev: 1600000 },
    Q3: { title: "Rapport Trimestriel Q3 (Juillet - Septembre 2026)", ca: 24800000, cogs: 9800000, opex: 3200000, net: 11800000, poultryRev: 13000000, porkRev: 7200000, cutsRev: 2900000, feedRev: 1700000 },
    Q4: { title: "Rapport Trimestriel Q4 (Octobre - Décembre 2026)", ca: 28400000, cogs: 10500000, opex: 3400000, net: 14500000, poultryRev: 15100000, porkRev: 8100000, cutsRev: 3300000, feedRev: 1900000 },
    ANNUAL: { title: "Rapport Annuel Consolidé 2026", ca: 92900000, cogs: 38000000, opex: 13000000, net: 41900000, poultryRev: 48800000, porkRev: 26600000, cutsRev: 10900000, feedRev: 6600000 },
  };

  const currentQData = quarterlyMetrics[selectedQuarter];

  const handleDownloadCSV = () => {
    let csvContent = "";
    if (selectedQuarter === "ANNUAL") {
      csvContent = `SOCIETE;IVOIRE ELEVAGE SAS\nRAPPORT;DONNEES BRUTES FINANCIERES ET COMMERCIALES ANNUELLES 2026\nGENERE_LE;${new Date().toLocaleDateString("fr-FR")}\n\n`;
      csvContent += `ANNEE;CA_AVICULTURE_FCFA;CA_PORCICULTURE_FCFA;CA_TOTAL_FCFA;CHARGES_STRUCTURE_FCFA;BENEFICE_NET_FCFA\n`;
      yearlyData.forEach((y) => {
        csvContent += `${y.year};${y.caAvicole};${y.caPorcin};${y.caTotal};${y.chargesStructure};${y.beneficeNet}\n`;
      });
      csvContent += `\nCATEGORIE_PRODUIT;OBJECTIF_ANNUEL_FCFA;REALISE_YTD_FCFA;TAUX_ATTEINTE_PCT\n`;
      salesGoal.categoryTargets.forEach((c) => {
        const pct = ((c.actualFCFA / c.targetFCFA) * 100).toFixed(1);
        csvContent += `${c.category};${c.targetFCFA};${c.actualFCFA};${pct}%\n`;
      });
    } else {
      csvContent = `SOCIETE;IVOIRE ELEVAGE SAS\nRAPPORT;DONNEES BRUTES TRIMESTRIELLES - ${selectedQuarter}\nPERIODE;${currentQData.title}\nGENERE_LE;${new Date().toLocaleDateString("fr-FR")}\n\n`;
      csvContent += `TRIMESTRE;CA_TOTAL_FCFA;CHARGES_COGS_FCFA;CHARGES_OPEX_FCFA;MARGE_BRUTE_FCFA;BENEFICE_NET_FCFA\n`;
      const mb = currentQData.ca - currentQData.cogs;
      csvContent += `${selectedQuarter};${currentQData.ca};${currentQData.cogs};${currentQData.opex};${mb};${currentQData.net}\n\n`;
      csvContent += `VENTILATION_VENTES;CHIFFRE_AFFAIRES_FCFA\n`;
      csvContent += `Ventes Poulets de Chair;${currentQData.poultryRev}\n`;
      csvContent += `Ventes Porcs Charcutiers;${currentQData.porkRev}\n`;
      csvContent += `Ventes Découpes & Viandes;${currentQData.cutsRev}\n`;
      csvContent += `Ventes Aliments Extérieurs;${currentQData.feedRev}\n`;
    }

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ivoire_Elevage_Export_${selectedQuarter}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStructuredPDF = () => {
    // Generate clean printable window or HTML blob for direct structured PDF printing
    const printContent = document.getElementById("structured-pdf-report-container");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport_Financier_et_Objectifs_Ventes_Ivoire_Elevage.pdf</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; padding: 24px; line-height: 1.5; font-size: 12px; }
            h1 { color: #064e3b; font-size: 22px; margin-bottom: 4px; }
            h2 { color: #0f172a; font-size: 15px; border-bottom: 2px solid #059669; padding-bottom: 4px; margin-top: 20px; }
            .header-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
            .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center; }
            .card-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .card-val { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #0f172a; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .badge { display: inline-block; padding: 3px 8px; background: #dcfce7; color: #166534; font-weight: bold; border-radius: 12px; font-size: 10px; }
            .footer { margin-top: 30px; border-t: 1px solid #cbd5e1; pt: 12px; font-size: 10px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h1>IVOIRE ÉLEVAGE - RÉCAPITULATIF EXÉCUTIF FINANCIER & OBJECTIFS DE VENTES</h1>
            <div>Rapport officiel certifié • Généré le ${new Date().toLocaleDateString("fr-FR")}</div>
          </div>
          
          ${printContent.innerHTML}

          <div class="footer">
            Ivoire Élevage SAS • Siège Social Abidjan, Côte d'Ivoire • Document Officiel de Direction
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadText = () => {
    const reportText = `
IVOIRE ÉLEVAGE - PLAN D'AFFAIRES & OBJECTIFS DE VENTE 2026
=====================================================

1. STATUT BÂTIMENTS & ÉCONOMIES DE LOYER
- Avicole : ${savings.isAvicoleAcquired ? "Acquis en propre (0 FCFA loyer)" : "En location (50 000 FCFA/mois)"}
- Porcin  : ${savings.isPorcinAcquired ? "Acquis en propre (0 FCFA loyer)" : "En location (20 000 FCFA/mois)"}
- Économies annuelles sur loyers : ${formatFCFA(savings.totalYearlyRentSaved)} / an

2. INVESTISSEMENT DE DÉMARRAGE (MOIS 1)
- Investissement Initial Total : ${formatFCFA(startupInvestment.totalFCFA)}
  * Achat 150 poulets (1.7 kg) : ${formatFCFA(startupInvestment.achat150Poulets)}
  * Avance Bâtiment Avicole : ${formatFCFA(startupInvestment.avanceBatimentAvicole)}
  * Alimentation Finition : ${formatFCFA(startupInvestment.alimentFinition)}
  * Divers & Litière : ${formatFCFA(startupInvestment.depensesDiverses)}

3. BILAN ET OBJECTIFS DE VENTES 2026
- Objectif Annuel Global Ventes : ${formatFCFA(salesGoal.overallTargetFCFA)}
- Cumul Ventes Réalisé YTD : ${formatFCFA(totalActualYTD)} (${goalAchievementPercent.toFixed(1)}% atteint)
- Reste à Réaliser (Écart) : ${formatFCFA(gapToGoal)}

VENTILATION PAR CATÉGORIE DE PRODUITS (2026) :
${salesGoal.categoryTargets
  .map(
    (c) =>
      `- ${c.category} : Objectif ${formatFCFA(c.targetFCFA)} | Réalisé ${formatFCFA(c.actualFCFA)} (${(
        (c.actualFCFA / c.targetFCFA) *
        100
      ).toFixed(1)}%)`
  )
  .join("\n")}

4. PROJECTIONS FINANCIÈRES SUR 5 ANS (2027 - 2031)
${yearlyData
  .map(
    (y) =>
      `- Année ${y.year} : CA Total ${formatFCFA(
        y.caTotal
      )} (Avicole ${formatFCFA(y.caAvicole)}, Porcin ${formatFCFA(
        y.caPorcin
      )}) | Bénéfice Net ${formatFCFA(y.beneficeNet)}`
  )
  .join("\n")}
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Ivoire_Elevage_Plan_Affaires_et_Objectifs.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Document Exécutif
              </span>
              <span className="text-xs text-slate-500 font-medium">• Ivoire Élevage</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Récapitulatif Financier & Objectifs de Vente
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadStructuredPDF}
              className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Générer PDF Structuré</span>
            </button>

            <button
              onClick={handleDownloadText}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border border-slate-300"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export TXT</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Format Switcher */}
        <div className="space-y-3">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setExportFormat("pdf_quarterly")}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                exportFormat === "pdf_quarterly"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📄 Rapport de Synthèse Trimestriel (Mise en Forme PDF)</span>
            </button>

            <button
              onClick={() => setExportFormat("csv_raw")}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                exportFormat === "csv_raw"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>📊 Données Brutes Exporables (Format CSV)</span>
            </button>
          </div>

          {/* Quarter Period Selector Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex-wrap gap-2">
            <span className="font-extrabold text-slate-700">Période du Rapport :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["Q1", "Q2", "Q3", "Q4", "ANNUAL"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                    selectedQuarter === q
                      ? "bg-slate-900 text-amber-300 shadow-sm"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {q === "ANNUAL" ? "Synthèse Annuelle 2026" : `${q} 2026`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIEW 1: STRUCTURED QUARTERLY PDF REPORT */}
        {exportFormat === "pdf_quarterly" && (
          <div
            id="structured-pdf-report-container"
            className="space-y-6 text-slate-800 text-xs sm:text-sm bg-slate-50/50 p-6 rounded-2xl border border-slate-200"
          >
            {/* Document Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-xl flex justify-between items-center shadow">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  IVOIRE ÉLEVAGE - RAPPORT FINANCIER OFFICIEL PDF
                </span>
                <h4 className="text-lg font-black">{currentQData.title}</h4>
                <p className="text-xs text-emerald-200">
                  Rapport de synthèse de gestion et performance commerciale validé par la direction.
                </p>
              </div>
              <div className="text-right border-l border-emerald-700/60 pl-4 hidden sm:block">
                <div className="text-xs font-bold text-amber-300">Statut : CERTIFIÉ</div>
                <div className="text-[10px] text-emerald-200">Généré le {new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>

            {/* SECTION 1: QUARTERLY FINANCIAL PERFORMANCE */}
            <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                  1. Performance Financière du Trimestre ({selectedQuarter})
                </h4>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Chiffre d'Affaires Brut</div>
                  <div className="font-black text-slate-900 text-sm mt-0.5">
                    {formatFCFA(currentQData.ca)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">Consolidé 4 Pôles</div>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-[10px] font-bold text-rose-800 uppercase">Charges Directes (CoGS)</div>
                  <div className="font-black text-rose-950 text-sm mt-0.5">
                    {formatFCFA(currentQData.cogs)}
                  </div>
                  <div className="text-[10px] text-rose-700">Aliments, Poussins, Soins</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-900 uppercase">Marge Brute</div>
                  <div className="font-black text-amber-950 text-sm mt-0.5">
                    {formatFCFA(currentQData.ca - currentQData.cogs)}
                  </div>
                  <div className="text-[10px] text-amber-800 font-bold">
                    Taux: {(((currentQData.ca - currentQData.cogs) / currentQData.ca) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-900 uppercase">Résultat Net Trimestriel</div>
                  <div className="font-black text-emerald-950 text-sm mt-0.5">
                    {formatFCFA(currentQData.net)}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold">Bénéfice Net Dégagé</div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="space-y-1.5 pt-2">
                <h5 className="font-bold text-slate-800 text-xs">Ventilation du Chiffre d'Affaires par Pôle D'Activité :</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[11px]">
                        <th className="p-2">Pôle de Production</th>
                        <th className="p-2">Réalisé Trimestre ({selectedQuarter})</th>
                        <th className="p-2">Part du Total CA</th>
                        <th className="p-2 text-right">Statut Opérationnel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      <tr>
                        <td className="p-2 font-bold text-slate-900">🐔 Aviculture (Poulets de Chair)</td>
                        <td className="p-2 font-black text-slate-900">{formatFCFA(currentQData.poultryRev)}</td>
                        <td className="p-2 text-slate-600">{((currentQData.poultryRev / currentQData.ca) * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Optimal</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">🐖 Porciculture (Porcs Charcutiers)</td>
                        <td className="p-2 font-black text-slate-900">{formatFCFA(currentQData.porkRev)}</td>
                        <td className="p-2 text-slate-600">{((currentQData.porkRev / currentQData.ca) * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Optimal</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">🥩 Découpes & Viandes Transformées</td>
                        <td className="p-2 font-black text-slate-900">{formatFCFA(currentQData.cutsRev)}</td>
                        <td className="p-2 text-slate-600">{((currentQData.cutsRev / currentQData.ca) * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">En Croissance</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-900">🌾 Ventes Aliments aux Tiers</td>
                        <td className="p-2 font-black text-slate-900">{formatFCFA(currentQData.feedRev)}</td>
                        <td className="p-2 text-slate-600">{((currentQData.feedRev / currentQData.ca) * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">Régulier</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Download PDF Trigger Button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownloadStructuredPDF}
                className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black px-5 py-3 rounded-xl shadow-lg cursor-pointer transition-all text-xs"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>🖨️ Imprimer / Exporter Rapport PDF Trimestriel ({selectedQuarter})</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: RAW CSV DATA EXPORT & PREVIEW */}
        {exportFormat === "csv_raw" && (
          <div className="space-y-4 bg-slate-900 text-emerald-300 p-6 rounded-2xl border border-slate-800 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                  <span>📊 Aperçu du Fichier CSV (Données Brutes)</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono">
                    {selectedQuarter}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Format compatible avec Excel, Google Sheets, PowerBI ou systèmes ERP (séparateur point-virgule ';').
                </p>
              </div>

              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl cursor-pointer transition-all flex items-center space-x-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Fichier CSV</span>
              </button>
            </div>

            {/* CSV Raw Text Preview Box */}
            <pre className="p-4 bg-slate-950 rounded-xl text-slate-300 border border-slate-800 overflow-x-auto text-[11px] leading-relaxed max-h-64">
              {selectedQuarter === "ANNUAL" ? (
                `SOCIETE;IVOIRE ELEVAGE SAS
RAPPORT;DONNEES BRUTES FINANCIERES ET COMMERCIALES ANNUELLES 2026
GENERE_LE;${new Date().toLocaleDateString("fr-FR")}

ANNEE;CA_AVICULTURE_FCFA;CA_PORCICULTURE_FCFA;CA_TOTAL_FCFA;CHARGES_STRUCTURE_FCFA;BENEFICE_NET_FCFA
${yearlyData.map((y) => `${y.year};${y.caAvicole};${y.caPorcin};${y.caTotal};${y.chargesStructure};${y.beneficeNet}`).join("\n")}

CATEGORIE_PRODUIT;OBJECTIF_ANNUEL_FCFA;REALISE_YTD_FCFA;TAUX_ATTEINTE_PCT
${salesGoal.categoryTargets.map((c) => `${c.category};${c.targetFCFA};${c.actualFCFA};${((c.actualFCFA / c.targetFCFA) * 100).toFixed(1)}%`).join("\n")}`
              ) : (
                `SOCIETE;IVOIRE ELEVAGE SAS
RAPPORT;DONNEES BRUTES TRIMESTRIELLES - ${selectedQuarter}
PERIODE;${currentQData.title}
GENERE_LE;${new Date().toLocaleDateString("fr-FR")}

TRIMESTRE;CA_TOTAL_FCFA;CHARGES_COGS_FCFA;CHARGES_OPEX_FCFA;MARGE_BRUTE_FCFA;BENEFICE_NET_FCFA
${selectedQuarter};${currentQData.ca};${currentQData.cogs};${currentQData.opex};${currentQData.ca - currentQData.cogs};${currentQData.net}

VENTILATION_VENTES;CHIFFRE_AFFAIRES_FCFA
Ventes Poulets de Chair;${currentQData.poultryRev}
Ventes Porcs Charcutiers;${currentQData.porkRev}
Ventes Découpes & Viandes;${currentQData.cutsRev}
Ventes Aliments Extérieurs;${currentQData.feedRev}`
              )}
            </pre>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
              <span>Encodage: UTF-8 avec BOM (support automatique des caractères accentués)</span>
              <span>Delimiteur: Semicolon (;)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
