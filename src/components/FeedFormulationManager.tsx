import React, { useState } from "react";
import { FeedFormula, FeedIngredient, UnitCosts } from "../types";
import { formatFCFA, formatFCFADecimal } from "../utils/formatters";
import {
  defaultFeedFormulas,
  calculateFormulaCostPerKg,
  calculateTotalIncorporation,
} from "../data/businessPlanData";
import {
  Wheat,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  DollarSign,
  Percent,
} from "lucide-react";

interface FeedFormulationManagerProps {
  unitCosts: UnitCosts;
  setUnitCosts: React.Dispatch<React.SetStateAction<UnitCosts>>;
}

// Preset raw materials with official Cote d'Ivoire revised market prices in FCFA/kg (Doc Avivoire)
const RAW_MATERIAL_PRESETS = [
  { name: "Maïs jaune", price: 170, category: "Céréale / Énergie" },
  { name: "Tourteau de soja", price: 350, category: "Protéine végétale" },
  { name: "Blé", price: 120, category: "Céréale / Énergie" },
  { name: "Farine de poisson (65%)", price: 320, category: "Protéine animale" },
  { name: "Huile végétale", price: 1000, category: "Énergie / Lipide" },
  { name: "Pré-mix CMV 1%", price: 3000, category: "Premix / Vitamines" },
  { name: "Phosphate bicalcique", price: 600, category: "Minéral (Ca/P)" },
  { name: "Carbonate de calcium", price: 200, category: "Minéral (Calcium)" },
  { name: "Sel de cuisine", price: 500, category: "Minéral (NaCl)" },
  { name: "L-Lysine", price: 2850, category: "Acide Aminé Synthétique" },
  { name: "DL-Méthionine", price: 4150, category: "Acide Aminé Synthétique" },
];

export const FeedFormulationManager: React.FC<FeedFormulationManagerProps> = ({
  unitCosts,
  setUnitCosts,
}) => {
  const [formulas, setFormulas] = useState<FeedFormula[]>(defaultFeedFormulas);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>("formula-finition");

  // New Ingredient Input state
  const [newIngName, setNewIngName] = useState<string>("");
  const [newIngPrice, setNewIngPrice] = useState<number | "">(180);
  const [newIngPercent, setNewIngPercent] = useState<number | "">(5);

  // New Formula creation state
  const [isCreatingFormula, setIsCreatingFormula] = useState<boolean>(false);
  const [newFormulaName, setNewFormulaName] = useState<string>("");
  const [newFormulaCategory, setNewFormulaCategory] = useState<"Aviculture" | "Porciculture">("Aviculture");

  const activeFormula = formulas.find((f) => f.id === selectedFormulaId) || formulas[0];

  const totalCostPerKg = calculateFormulaCostPerKg(activeFormula.ingredients);
  const totalIncorporation = calculateTotalIncorporation(activeFormula.ingredients);

  // Helper to sync formula cost to unitCosts if linked
  const syncUnitCosts = (formula: FeedFormula, newIngredients: FeedIngredient[]) => {
    if (formula.targetUnitCostKey) {
      const newCost = calculateFormulaCostPerKg(newIngredients);
      setUnitCosts((prev) => ({
        ...prev,
        [formula.targetUnitCostKey!]: newCost,
      }));
    }
  };

  // Update ingredients list for active formula
  const updateIngredients = (newIngredients: FeedIngredient[]) => {
    setFormulas((prev) =>
      prev.map((f) => {
        if (f.id === activeFormula.id) {
          const updated = { ...f, ingredients: newIngredients };
          syncUnitCosts(updated, newIngredients);
          return updated;
        }
        return f;
      })
    );
  };

  // 1. Modify ingredient field
  const handleIngredientChange = (
    ingId: string,
    field: "name" | "pricePerKg" | "incorporationPercent",
    value: string | number
  ) => {
    const updated = activeFormula.ingredients.map((ing) => {
      if (ing.id === ingId) {
        return {
          ...ing,
          [field]: typeof value === "number" ? Math.max(0, value) : value,
        };
      }
      return ing;
    });
    updateIngredients(updated);
  };

  // 2. Add ingredient
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim() || newIngPrice === "" || newIngPercent === "") return;

    const newIng: FeedIngredient = {
      id: `ing-${Date.now()}`,
      name: newIngName.trim(),
      pricePerKg: Number(newIngPrice),
      incorporationPercent: Number(newIngPercent),
    };

    const updated = [...activeFormula.ingredients, newIng];
    updateIngredients(updated);

    // Reset input fields
    setNewIngName("");
    setNewIngPrice(180);
    setNewIngPercent(5);
  };

  // Select Preset
  const handleSelectPreset = (preset: { name: string; price: number }) => {
    setNewIngName(preset.name);
    setNewIngPrice(preset.price);
  };

  // 3. Remove ingredient
  const handleRemoveIngredient = (ingId: string) => {
    const updated = activeFormula.ingredients.filter((ing) => ing.id !== ingId);
    updateIngredients(updated);
  };

  // Reset current formula to default
  const handleResetFormula = () => {
    const defaultForm = defaultFeedFormulas.find((f) => f.id === activeFormula.id);
    if (defaultForm) {
      updateIngredients(defaultForm.ingredients);
    }
  };

  // Create New Custom Formula
  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormulaName.trim()) return;

    const newForm: FeedFormula = {
      id: `formula-${Date.now()}`,
      name: newFormulaName.trim(),
      category: newFormulaCategory,
      description: "Formule sur-mesure d'aliment composé.",
      ingredients: [
        { id: `ing-${Date.now()}-1`, name: "Maïs jaune", pricePerKg: 180, incorporationPercent: 60 },
        { id: `ing-${Date.now()}-2`, name: "Tourteau de Soja (46%)", pricePerKg: 410, incorporationPercent: 35 },
        { id: `ing-${Date.now()}-3`, name: "Concentré & Sel", pricePerKg: 400, incorporationPercent: 5 },
      ],
    };

    setFormulas((prev) => [...prev, newForm]);
    setSelectedFormulaId(newForm.id);
    setIsCreatingFormula(false);
    setNewFormulaName("");
  };

  // Delete custom formula
  const handleDeleteFormula = (formulaId: string) => {
    if (formulas.length <= 1) return;
    const filtered = formulas.filter((f) => f.id !== formulaId);
    setFormulas(filtered);
    setSelectedFormulaId(filtered[0].id);
  };

  // Smart Formulation Adjustment Actions
  const [smartToast, setSmartToast] = useState<string | null>(null);

  const currentCornPrice = unitCosts.cornPricePerKg || 180;
  const currentSoybeanPrice = unitCosts.soybeanPricePerKg || 410;
  const currentBranPrice = unitCosts.branPricePerKg || 120;

  const handleApplyCornOptimization = () => {
    let updated = [...activeFormula.ingredients];
    let cornFound = false;
    let branFound = false;

    updated = updated.map((ing) => {
      if (ing.name.toLowerCase().includes("maïs") || ing.name.toLowerCase().includes("corn")) {
        cornFound = true;
        return { ...ing, pricePerKg: currentCornPrice, incorporationPercent: Math.max(0, ing.incorporationPercent - 5) };
      }
      if (ing.name.toLowerCase().includes("son")) {
        branFound = true;
        return { ...ing, pricePerKg: currentBranPrice, incorporationPercent: ing.incorporationPercent + 5 };
      }
      return ing;
    });

    if (!branFound && cornFound) {
      updated.push({
        id: `ing-auto-${Date.now()}`,
        name: "Son de Blé",
        pricePerKg: currentBranPrice,
        incorporationPercent: 5,
      });
    }

    updateIngredients(updated);
    setSmartToast(`✅ Formulation ajustée avec succès ! (-5% Maïs à ${currentCornPrice} FCFA, +5% Son de blé à ${currentBranPrice} FCFA)`);
    setTimeout(() => setSmartToast(null), 5000);
  };

  const handleApplySoybeanOptimization = () => {
    let updated = [...activeFormula.ingredients];
    let soyFound = false;
    let lysineFound = false;

    updated = updated.map((ing) => {
      if (ing.name.toLowerCase().includes("soja")) {
        soyFound = true;
        return { ...ing, pricePerKg: currentSoybeanPrice, incorporationPercent: Math.max(0, ing.incorporationPercent - 3) };
      }
      if (ing.name.toLowerCase().includes("lysine")) {
        lysineFound = true;
        return { ...ing, incorporationPercent: ing.incorporationPercent + 3 };
      }
      return ing;
    });

    if (!lysineFound && soyFound) {
      updated.push({
        id: `ing-lysine-${Date.now()}`,
        name: "L-Lysine (Premix 98%)",
        pricePerKg: 2800,
        incorporationPercent: 3,
      });
    }

    updateIngredients(updated);
    setSmartToast(`✅ Formulation optimisée ! (-3% Soja à ${currentSoybeanPrice} FCFA/kg +3% L-Lysine pour équilibre d'acides aminés)`);
    setTimeout(() => setSmartToast(null), 5000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Title & Introduction */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-700 rounded-xl">
            <Wheat className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Formulation des Aliments & Gestion des Ingrédients
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Ajoutez, retirez ou modifiez le prix (FCFA/kg) et le % d'incorporation des matières premières pour recalculer automatiquement les coûts par kg d'aliment.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingFormula(!isCreatingFormula)}
          className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une nouvelle formule</span>
        </button>
      </div>

      {/* SMART NOTIFICATION BANNER: FORMULATION ADJUSTMENTS BASED ON RAW MATERIAL UNIT COSTS */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-amber-500/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-black text-xs uppercase tracking-wider text-amber-300">
              Système de Notifications Intelligentes & Optimization de Formulation
            </span>
          </div>
          <span className="text-[11px] text-amber-200 bg-amber-900/80 px-2.5 py-0.5 rounded-full font-bold">
            Basé sur les coûts unitaires des matières premières
          </span>
        </div>

        {smartToast && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black animate-bounce-short">
            {smartToast}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Suggestion 1: Corn price optimization */}
          <div className="bg-slate-950/80 border border-amber-500/30 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>🌽 Ajustement Maïs vs Son ({currentCornPrice} FCFA/kg)</span>
                <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-2 py-0.5 rounded">
                  Économie ~{Math.max(5, Math.round((currentCornPrice - currentBranPrice) * 0.05))} FCFA/kg
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Coût maïs configuré : <strong>{currentCornPrice} FCFA/kg</strong>. Nous vous suggérons de réduire le maïs de 5% dans <em>{activeFormula.name}</em> et d'augmenter le son de blé ({currentBranPrice} FCFA/kg).
              </p>
            </div>
            <button
              onClick={handleApplyCornOptimization}
              className="mt-2 w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all cursor-pointer shadow"
            >
              ⚡ Appliquer Substitution Maïs (-5%) / Son (+5%)
            </button>
          </div>

          {/* Suggestion 2: Soybean price optimization */}
          <div className="bg-slate-950/80 border border-amber-500/30 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>🌱 Optimization Tourteau de Soja ({currentSoybeanPrice} FCFA/kg)</span>
                <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-2 py-0.5 rounded">
                  Économie ~12.5 FCFA/kg
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Coût tourteau de soja : <strong>{currentSoybeanPrice} FCFA/kg</strong>. Suggestion : Incorporer 3% de L-Lysine et réduire le soja de 3% pour optimiser le bilan protéique.
              </p>
            </div>
            <button
              onClick={handleApplySoybeanOptimization}
              className="mt-2 w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition-all cursor-pointer shadow"
            >
              ⚡ Appliquer Optimization Soja (-3%) + L-Lysine
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Form to create a new Feed Formula */}
      {isCreatingFormula && (
        <form
          onSubmit={handleCreateFormula}
          className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl space-y-3"
        >
          <div className="font-bold text-emerald-950 text-sm flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Nouveau Type d'Aliment Composé</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Nom du type d'aliment :</label>
              <input
                type="text"
                placeholder="Ex: Aliment Poussins Démarrage Spécial, Ration Truies Lactantes..."
                value={newFormulaName}
                onChange={(e) => setNewFormulaName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Secteur :</label>
              <select
                value={newFormulaCategory}
                onChange={(e) => setNewFormulaCategory(e.target.value as "Aviculture" | "Porciculture")}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
              >
                <option value="Aviculture">Aviculture</option>
                <option value="Porciculture">Porciculture</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingFormula(false)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-sm"
            >
              Créer la formule
            </button>
          </div>
        </form>
      )}

      {/* Formula Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {formulas.map((form) => {
          const isSelected = form.id === selectedFormulaId;
          const cost = calculateFormulaCostPerKg(form.ingredients);

          return (
            <button
              key={form.id}
              onClick={() => setSelectedFormulaId(form.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-300"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <span>{form.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? "bg-amber-700 text-white" : "bg-slate-200 text-slate-800"}`}>
                {formatFCFADecimal(cost)} / kg
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Formula Details Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 text-[10px] font-bold uppercase">
                {activeFormula.category}
              </span>
              {activeFormula.targetUnitCostKey && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold">
                  Synchronisé avec Business Plan ({activeFormula.targetUnitCostKey})
                </span>
              )}
            </div>
            <h4 className="text-xl font-extrabold mt-1 text-white">{activeFormula.name}</h4>
            <p className="text-slate-400 text-xs mt-0.5">{activeFormula.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetFormula}
              title="Réinitialiser cette formule par défaut"
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>

            {!activeFormula.targetUnitCostKey && formulas.length > 1 && (
              <button
                onClick={() => handleDeleteFormula(activeFormula.id)}
                title="Supprimer cette formule sur-mesure"
                className="p-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards for the Formula */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          {/* Cost Per Kg */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="text-slate-400 font-medium">Coût Calculé par Kg</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {formatFCFADecimal(totalCostPerKg)} <span className="text-xs font-normal text-slate-300">FCFA / kg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Coût du sac de 50 kg : <strong className="text-white">{formatFCFA(Math.round(totalCostPerKg * 50))}</strong>
            </div>
          </div>

          {/* Total Incorporation % */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="text-slate-400 font-medium">Taux d'Incorporation Total</div>
            <div
              className={`text-2xl font-black mt-0.5 flex items-center space-x-2 ${
                Math.abs(totalIncorporation - 100) < 0.1
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              <span>{totalIncorporation} %</span>
              {Math.abs(totalIncorporation - 100) < 0.1 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {Math.abs(totalIncorporation - 100) < 0.1 ? (
                <span className="text-emerald-300 font-semibold">Formule équilibrée à 100%</span>
              ) : totalIncorporation < 100 ? (
                <span className="text-amber-300">Incomplet (manque {(100 - totalIncorporation).toFixed(1)}%)</span>
              ) : (
                <span className="text-rose-300">Surplus (+{(totalIncorporation - 100).toFixed(1)}%)</span>
              )}
            </div>
          </div>

          {/* Ingredient Count */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="text-slate-400 font-medium">Nombre d'Ingrédients</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {activeFormula.ingredients.length} <span className="text-xs font-normal text-slate-300">matières premières</span>
            </div>
            <div className="text-[11px] text-emerald-300 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Répercuté en temps réel sur le business plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Formulation Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <span>Composition Détaillée de la Formule</span>
            <span className="text-xs font-normal text-slate-500">
              (Modifiez directement le prix ou le % pour actualiser le coût)
            </span>
          </h5>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white uppercase font-bold text-[11px] tracking-wider">
                <th className="p-3">Matière Première / Ingrédient</th>
                <th className="p-3 text-right">Prix Unitaire (FCFA / kg)</th>
                <th className="p-3 text-right">% Incorporation (%)</th>
                <th className="p-3 text-right">Coût Apporté (FCFA/kg)</th>
                <th className="p-3 text-right">Part dans le coût</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium bg-white">
              {activeFormula.ingredients.map((ing) => {
                const costContribution = (ing.pricePerKg * ing.incorporationPercent) / 100;
                const costShare = totalCostPerKg > 0 ? (costContribution / totalCostPerKg) * 100 : 0;

                return (
                  <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Ingredient Name */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(ing.id, "name", e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded font-semibold text-slate-900 focus:border-amber-500 focus:outline-none"
                      />
                    </td>

                    {/* Price per Kg */}
                    <td className="p-2.5 text-right w-36">
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={ing.pricePerKg}
                          onChange={(e) =>
                            handleIngredientChange(ing.id, "pricePerKg", Number(e.target.value))
                          }
                          className="w-full p-1.5 text-right pr-12 border border-slate-200 rounded font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">
                          FCFA
                        </span>
                      </div>
                    </td>

                    {/* % Incorporation */}
                    <td className="p-2.5 text-right w-32">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={ing.incorporationPercent}
                          onChange={(e) =>
                            handleIngredientChange(ing.id, "incorporationPercent", Number(e.target.value))
                          }
                          className="w-full p-1.5 text-right pr-6 border border-slate-200 rounded font-bold text-emerald-800 bg-emerald-50/50 focus:border-amber-500 focus:outline-none"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-emerald-600 font-extrabold">
                          %
                        </span>
                      </div>
                    </td>

                    {/* Computed Contribution */}
                    <td className="p-2.5 text-right font-bold text-slate-900 text-sm">
                      {formatFCFADecimal(costContribution)}
                    </td>

                    {/* Cost Share % */}
                    <td className="p-2.5 text-right text-slate-600 font-semibold">
                      {costShare.toFixed(1)} %
                    </td>

                    {/* Delete Action */}
                    <td className="p-2.5 text-center w-16">
                      <button
                        onClick={() => handleRemoveIngredient(ing.id)}
                        title="Retirer cet ingrédient de la formule"
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Total Summary Row */}
              <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300 text-sm">
                <td className="p-3">TOTAL FORMULE</td>
                <td className="p-3 text-right text-xs text-slate-500">-</td>
                <td
                  className={`p-3 text-right ${
                    Math.abs(totalIncorporation - 100) < 0.1
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {totalIncorporation} %
                </td>
                <td className="p-3 text-right text-emerald-900 font-black text-base">
                  {formatFCFADecimal(totalCostPerKg)} FCFA
                </td>
                <td className="p-3 text-right">100 %</td>
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Ingredient Section */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Ajouter un Nouvel Ingrédient à la Formule</span>
        </h5>

        {/* Quick Presets Buttons */}
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1.5">
            Matières premières courantes (Cliquer pour sélectionner) :
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RAW_MATERIAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                {preset.name} <span className="text-slate-400 font-normal">({preset.price} F)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Ingredient Form */}
        <form onSubmit={handleAddIngredient} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end">
          <div className="sm:col-span-5">
            <label className="block text-slate-700 font-semibold mb-1">Nom de l'ingrédient / Matière première :</label>
            <input
              type="text"
              placeholder="Ex: Tourteau de Coton, Farine de Plumes..."
              value={newIngName}
              onChange={(e) => setNewIngName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-700 font-semibold mb-1">Prix Unitaire (FCFA / kg) :</label>
            <input
              type="number"
              min="0"
              step="1"
              value={newIngPrice}
              onChange={(e) => setNewIngPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">% Incorporation :</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={newIngPercent}
              onChange={(e) => setNewIngPercent(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-800"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition-all shadow cursor-pointer flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION DOCUMENT OFFICIEL: ANALYSE DES 5 NOUVEAUX INGRÉDIENTS & PERFORMANCES */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-500/30 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-900/80 text-emerald-300 border border-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Document Technique Avivoire & Formulations Révisées</span>
            </div>
            <h4 className="text-lg font-extrabold text-white">
              Analyse des 5 Nouveaux Ingrédients & Synergie Minérale
            </h4>
            <p className="text-xs text-slate-300">
              Formulations optimisées à 100 kg avec apport équilibré d'acides aminés de synthèse et minéraux assimilables.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 text-center">
              <div className="text-[10px] text-slate-400">Sac 50kg Croissance</div>
              <div className="text-sm font-black text-amber-400">14 005 FCFA</div>
              <div className="text-[10px] text-emerald-400">280,09 FCFA/kg</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 text-center">
              <div className="text-[10px] text-slate-400">Sac 50kg Finition</div>
              <div className="text-sm font-black text-amber-400">15 081 FCFA</div>
              <div className="text-[10px] text-emerald-400">301,61 FCFA/kg</div>
            </div>
          </div>
        </div>

        {/* Grid of the 5 key ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* 1. Farine de poisson */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-300 border-b border-slate-800 pb-1.5">
              <span>🐟 1. Farine de poisson (65%)</span>
              <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">320 FCFA/kg</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Apports :</strong> 55 à 65% de protéines haute qualité, riche en lysine/méthionine naturelles, calcium, phosphore & oméga-3.
            </p>
            <p className="text-[11px] text-emerald-300">
              <strong>Importance :</strong> Accélère la croissance, améliore l'Indice de Consommation (IC), renforce l'immunité et développe les filets de poitrine.
            </p>
          </div>

          {/* 2. L-Lysine */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-300 border-b border-slate-800 pb-1.5">
              <span>🧬 2. L-Lysine</span>
              <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">2 850 FCFA/kg</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Apports :</strong> Acide aminé essentiel strict indispensable à la synthèse protéique.
            </p>
            <p className="text-[11px] text-emerald-300">
              <strong>Importance :</strong> Développement musculaire rapide, meilleure conversion alimentaire, hausse du rendement en viande et réduction du gaspillage d'azote.
            </p>
          </div>

          {/* 3. DL-Méthionine */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-300 border-b border-slate-800 pb-1.5">
              <span>🔬 3. DL-Méthionine</span>
              <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">4 150 FCFA/kg</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Apports :</strong> Premier acide aminé limitant dans les rations céréalières maïs/soja.
            </p>
            <p className="text-[11px] text-emerald-300">
              <strong>Importance :</strong> Vitesse de croissance, qualité du plumage, soutien de la fonction hépatique (santé du foie) et renforcement immunitaire.
            </p>
          </div>

          {/* 4. Phosphate bicalcique */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-300 border-b border-slate-800 pb-1.5">
              <span>🦴 4. Phosphate bicalcique</span>
              <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">600 FCFA/kg</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Apports :</strong> Source équilibrée de calcium et phosphore minéral hautement assimilables.
            </p>
            <p className="text-[11px] text-emerald-300">
              <strong>Importance :</strong> Construction d'un squelette solide, prévention des déformations des pattes et des boiteries en forte croissance.
            </p>
          </div>

          {/* 5. Carbonate de calcium */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-300 border-b border-slate-800 pb-1.5">
              <span>🪨 5. Carbonate de calcium</span>
              <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px]">200 FCFA/kg</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Apports :</strong> Source très concentrée en calcium minéral pur à très faible coût.
            </p>
            <p className="text-[11px] text-emerald-300">
              <strong>Importance :</strong> Densité osseuse, contraction musculaire, transmission nerveuse et ajustement économique du taux de Ca.
            </p>
          </div>

          {/* Synergies & Target Performance Weights */}
          <div className="bg-emerald-950/90 p-4 rounded-xl border border-emerald-500/60 space-y-2 text-white">
            <div className="font-extrabold text-amber-300 border-b border-emerald-800 pb-1.5 flex items-center justify-between">
              <span>🎯 Synergie & Poids Cibles (Cobb 500)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-emerald-100">
              <strong>Rapport Ca/P :</strong> Équilibre minéral optimal à ~2:1 évitant les carences osseuses.
            </p>
            <div className="pt-1 space-y-1 text-[11px] font-bold">
              <div className="flex justify-between bg-slate-950/60 px-2 py-1 rounded border border-emerald-700/40">
                <span>À 35 jours (5 sem) :</span>
                <span className="text-amber-300 font-black">2,2 kg / sujet</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 px-2 py-1 rounded border border-emerald-700/40">
                <span>À 42 jours (6 sem) :</span>
                <span className="text-amber-300 font-black">2,5 kg / sujet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
