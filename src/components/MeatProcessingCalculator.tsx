import React, { useState } from "react";
import { formatFCFA, formatPercent } from "../utils/formatters";
import { Scissors, TrendingUp, Sparkles, CheckCircle2, ShoppingBag, Info, ShieldCheck, RefreshCw } from "lucide-react";

export const MeatProcessingCalculator: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<"Aviculture" | "Porciculture">("Aviculture");

  // Aviculture Cutting Simulation State
  const [chickenCount, setChickenCount] = useState<number>(100);
  const [chickenWeightKg, setChickenWeightKg] = useState<number>(2.2);
  const [wholeChickenPrice, setWholeChickenPrice] = useState<number>(3500); // FCFA per unit

  // Poultry Cut Prices (FCFA / kg)
  const [priceFilet, setPriceFilet] = useState<number>(4200);
  const [priceCuisses, setPriceCuisses] = useState<number>(3400);
  const [priceAiles, setPriceAiles] = useState<number>(2500);
  const [priceCarcasse, setPriceCarcasse] = useState<number>(1200);
  const [priceAbats, setPriceAbats] = useState<number>(3000);

  // Porciculture Cutting Simulation State
  const [pigCount, setPigCount] = useState<number>(5);
  const [pigCarcassWeightKg, setPigCarcassWeightKg] = useState<number>(75);
  const [wholeCarcassPriceKg, setWholeCarcassPriceKg] = useState<number>(2100); // FCFA per kg carcass

  // Pork Cut Prices (FCFA / kg)
  const [porkPriceCotelettes, setPorkPriceCotelettes] = useState<number>(3200);
  const [porkPriceFiletMignon, setPorkPriceFiletMignon] = useState<number>(4500);
  const [porkPriceJambon, setPorkPriceJambon] = useState<number>(3600);
  const [porkPricePoitrine, setPorkPricePoitrine] = useState<number>(3000);
  const [porkPriceEpaule, setPorkPriceEpaule] = useState<number>(2800);

  // Packaging & Labor Cost per unit/animal
  const [packagingCostPerAnimal, setPackagingCostPerAnimal] = useState<number>(150);

  // --- CALCULATIONS: AVICULTURE ---
  const totalLiveWeightKg = chickenCount * chickenWeightKg;
  const totalWholeRevenue = chickenCount * wholeChickenPrice;

  // Dressed yield ~ 75% of live weight = 1.65 kg per 2.2kg chicken
  const totalDressedWeightKg = totalLiveWeightKg * 0.75;

  // Yield breakdown for 1.65 kg dressed chicken:
  // Filet (32%) = 0.528 kg
  // Cuisses (35%) = 0.5775 kg
  // Ailes (12%) = 0.198 kg
  // Abats (8%) = 0.132 kg
  // Carcasse / Cou (13%) = 0.2145 kg
  const kgFilet = totalDressedWeightKg * 0.32;
  const kgCuisses = totalDressedWeightKg * 0.35;
  const kgAiles = totalDressedWeightKg * 0.12;
  const kgAbats = totalDressedWeightKg * 0.08;
  const kgCarcasse = totalDressedWeightKg * 0.13;

  const revFilet = kgFilet * priceFilet;
  const revCuisses = kgCuisses * priceCuisses;
  const revAiles = kgAiles * priceAiles;
  const revAbats = kgAbats * priceAbats;
  const revCarcasse = kgCarcasse * priceCarcasse;

  const totalCutGrossRevenueAviculture = revFilet + revCuisses + revAiles + revAbats + revCarcasse;
  const totalProcessingCostAviculture = chickenCount * packagingCostPerAnimal;
  const totalCutNetRevenueAviculture = totalCutGrossRevenueAviculture - totalProcessingCostAviculture;
  const addedValueAviculture = totalCutNetRevenueAviculture - totalWholeRevenue;
  const addedValuePercentAviculture = totalWholeRevenue > 0 ? (addedValueAviculture / totalWholeRevenue) * 100 : 0;

  // --- CALCULATIONS: PORCICULTURE ---
  const totalPorkCarcassKg = pigCount * pigCarcassWeightKg;
  const totalWholeCarcassRevenue = totalPorkCarcassKg * wholeCarcassPriceKg;

  // Pork yield breakdown from carcass weight (75kg):
  // Côtelettes (22%) = 16.5 kg
  // Filet Mignon (5%) = 3.75 kg
  // Jambon (28%) = 21 kg
  // Poitrine / Lard (20%) = 15 kg
  // Épaule / Rôti (18%) = 13.5 kg
  // Perte / Os (7%) = 5.25 kg
  const kgCotelettes = totalPorkCarcassKg * 0.22;
  const kgFiletMignon = totalPorkCarcassKg * 0.05;
  const kgJambon = totalPorkCarcassKg * 0.28;
  const kgPoitrine = totalPorkCarcassKg * 0.20;
  const kgEpaule = totalPorkCarcassKg * 0.18;

  const revCotelettes = kgCotelettes * porkPriceCotelettes;
  const revFiletMignon = kgFiletMignon * porkPriceFiletMignon;
  const revJambon = kgJambon * porkPriceJambon;
  const revPoitrine = kgPoitrine * porkPricePoitrine;
  const revEpaule = kgEpaule * porkPriceEpaule;

  const totalCutGrossRevenuePorc = revCotelettes + revFiletMignon + revJambon + revPoitrine + revEpaule;
  const totalProcessingCostPorc = pigCount * 2500; // 2500 FCFA packaging & butchering cost per pig
  const totalCutNetRevenuePorc = totalCutGrossRevenuePorc - totalProcessingCostPorc;
  const addedValuePorc = totalCutNetRevenuePorc - totalWholeCarcassRevenue;
  const addedValuePercentPorc = totalWholeCarcassRevenue > 0 ? (addedValuePorc / totalWholeCarcassRevenue) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 text-rose-700 rounded-xl">
            <Scissors className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Atelier Découpe & Valorisation des Produits Transformés
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Simulez le gain de valeur ajoutée entre la vente de l'animal entier (ou carcasse) et la découpe détaillée en morceaux nobles.
            </p>
          </div>
        </div>

        {/* Module Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedModule("Aviculture")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              selectedModule === "Aviculture"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Découpe Volaille (Poulet)
          </button>
          <button
            onClick={() => setSelectedModule("Porciculture")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              selectedModule === "Porciculture"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Découpe Porcine (Porc)
          </button>
        </div>
      </div>

      {/* AVICULTURE ATELIER DÉCOUPE */}
      {selectedModule === "Aviculture" && (
        <div className="space-y-6">
          {/* Input Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre de poulets à découper :</label>
              <input
                type="number"
                min="1"
                value={chickenCount}
                onChange={(e) => setChickenCount(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Poids vif moyen (kg) :</label>
              <input
                type="number"
                step="0.1"
                value={chickenWeightKg}
                onChange={(e) => setChickenWeightKg(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prix Poulet Entier Vivant (FCFA/unité) :</label>
              <input
                type="number"
                step="100"
                value={wholeChickenPrice}
                onChange={(e) => setWholeChickenPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Frais Sachet / Emballage (FCFA/poulet) :</label>
              <input
                type="number"
                step="10"
                value={packagingCostPerAnimal}
                onChange={(e) => setPackagingCostPerAnimal(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Cutting Price Settings & Yield Table */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <span>Prix de Vente des Morceaux Découpés (FCFA / kg)</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase font-bold text-[11px]">
                    <th className="p-3">Morceau / Part</th>
                    <th className="p-3 text-right">Rendement %</th>
                    <th className="p-3 text-right">Poids Obtenu</th>
                    <th className="p-3 text-right">Prix de Vente (FCFA/kg)</th>
                    <th className="p-3 text-right">Chiffre d'Affaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Filets / Escalopes (Poitrine)</td>
                    <td className="p-3 text-right">32 %</td>
                    <td className="p-3 text-right">{kgFilet.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={priceFilet}
                        onChange={(e) => setPriceFilet(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revFilet)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Cuisses de Volaille</td>
                    <td className="p-3 text-right">35 %</td>
                    <td className="p-3 text-right">{kgCuisses.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={priceCuisses}
                        onChange={(e) => setPriceCuisses(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revCuisses)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Ailes de Volaille</td>
                    <td className="p-3 text-right">12 %</td>
                    <td className="p-3 text-right">{kgAiles.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={priceAiles}
                        onChange={(e) => setPriceAiles(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revAiles)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Foies & Gésiers (Abats)</td>
                    <td className="p-3 text-right">8 %</td>
                    <td className="p-3 text-right">{kgAbats.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={priceAbats}
                        onChange={(e) => setPriceAbats(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revAbats)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Carcasses, Cou & Tête (Soupe/Sauce)</td>
                    <td className="p-3 text-right">13 %</td>
                    <td className="p-3 text-right">{kgCarcasse.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={priceCarcasse}
                        onChange={(e) => setPriceCarcasse(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revCarcasse)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison Cards: Vente Entier vs Vente Découpé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-semibold">1. Vente Poulet Entier Vivant</div>
              <div className="text-xl font-black text-slate-900 mt-1">{formatFCFA(totalWholeRevenue)}</div>
              <div className="text-slate-500 mt-1">{chickenCount} poulets à {formatFCFA(wholeChickenPrice)}/u</div>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-semibold">2. Vente Poulet Découpé (Nette)</div>
              <div className="text-xl font-black text-emerald-800 mt-1">{formatFCFA(totalCutNetRevenueAviculture)}</div>
              <div className="text-slate-500 mt-1">
                Brut: {formatFCFA(totalCutGrossRevenueAviculture)} - Emballages: {formatFCFA(totalProcessingCostAviculture)}
              </div>
            </div>

            <div className="bg-emerald-900 text-white p-4 rounded-xl space-y-1 shadow-md">
              <div className="text-emerald-300 font-bold flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Valeur Ajoutée par la Découpe</span>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                +{formatFCFA(addedValueAviculture)}
              </div>
              <div className="text-xs text-emerald-200 font-semibold">
                Gain supplémentaire : <strong className="text-amber-300">+{addedValuePercentAviculture.toFixed(1)}%</strong> (+{formatFCFA(Math.round(addedValueAviculture / chickenCount))} par poulet)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PORCICULTURE ATELIER DÉCOUPE */}
      {selectedModule === "Porciculture" && (
        <div className="space-y-6">
          {/* Input Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre de porcs à découper :</label>
              <input
                type="number"
                min="1"
                value={pigCount}
                onChange={(e) => setPigCount(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Poids carcasse moyen (kg) :</label>
              <input
                type="number"
                step="1"
                value={pigCarcassWeightKg}
                onChange={(e) => setPigCarcassWeightKg(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prix Carcasse Entière (FCFA/kg) :</label>
              <input
                type="number"
                step="50"
                value={wholeCarcassPriceKg}
                onChange={(e) => setWholeCarcassPriceKg(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Poids Carcasse Total (kg) :</label>
              <div className="p-2 bg-slate-200 font-extrabold text-slate-900 rounded-lg text-sm">
                {totalPorkCarcassKg} kg
              </div>
            </div>
          </div>

          {/* Cutting Table for Pork */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <span>Prix de Vente des Découpes Nobles de Porc (FCFA / kg)</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase font-bold text-[11px]">
                    <th className="p-3">Morceau Noble / Découpe</th>
                    <th className="p-3 text-right">Part Carcasse %</th>
                    <th className="p-3 text-right">Poids Obtenu (kg)</th>
                    <th className="p-3 text-right">Prix de Vente (FCFA/kg)</th>
                    <th className="p-3 text-right">Chiffre d'Affaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Côtelettes de Porc</td>
                    <td className="p-3 text-right">22 %</td>
                    <td className="p-3 text-right">{kgCotelettes.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={porkPriceCotelettes}
                        onChange={(e) => setPorkPriceCotelettes(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revCotelettes)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Filet Mignon (Partie très noble)</td>
                    <td className="p-3 text-right">5 %</td>
                    <td className="p-3 text-right">{kgFiletMignon.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={porkPriceFiletMignon}
                        onChange={(e) => setPorkPriceFiletMignon(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revFiletMignon)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Jambon / Cuisseau désossé</td>
                    <td className="p-3 text-right">28 %</td>
                    <td className="p-3 text-right">{kgJambon.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={porkPriceJambon}
                        onChange={(e) => setPorkPriceJambon(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revJambon)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Poitrine & Lard Fumé / Maquis</td>
                    <td className="p-3 text-right">20 %</td>
                    <td className="p-3 text-right">{kgPoitrine.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={porkPricePoitrine}
                        onChange={(e) => setPorkPricePoitrine(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revPoitrine)}</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-900">Épaule & Rôti de Porc</td>
                    <td className="p-3 text-right">18 %</td>
                    <td className="p-3 text-right">{kgEpaule.toFixed(1)} kg</td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        value={porkPriceEpaule}
                        onChange={(e) => setPorkPriceEpaule(Number(e.target.value))}
                        className="p-1 text-right border border-slate-300 rounded font-bold w-full"
                      />
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-800">{formatFCFA(revEpaule)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pork Yield Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-semibold">1. Vente Carcasse Entière (Nue)</div>
              <div className="text-xl font-black text-slate-900 mt-1">{formatFCFA(totalWholeCarcassRevenue)}</div>
              <div className="text-slate-500 mt-1">{totalPorkCarcassKg} kg à {formatFCFA(wholeCarcassPriceKg)}/kg</div>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-semibold">2. Vente Morceaux Découpés (Nette)</div>
              <div className="text-xl font-black text-emerald-800 mt-1">{formatFCFA(totalCutNetRevenuePorc)}</div>
              <div className="text-slate-500 mt-1">
                Brut: {formatFCFA(totalCutGrossRevenuePorc)} - Boucherie & Emballage: {formatFCFA(totalProcessingCostPorc)}
              </div>
            </div>

            <div className="bg-rose-950 text-white p-4 rounded-xl space-y-1 shadow-md">
              <div className="text-rose-300 font-bold flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Marge Supplémentaire Découpe Porc</span>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                +{formatFCFA(addedValuePorc)}
              </div>
              <div className="text-xs text-rose-200 font-semibold">
                Marge nette par porc : <strong className="text-amber-300">+{formatFCFA(Math.round(addedValuePorc / pigCount))}</strong> (+{addedValuePercentPorc.toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
