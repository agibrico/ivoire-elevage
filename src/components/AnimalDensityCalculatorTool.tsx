import React, { useState, useEffect } from "react";
import {
  BuildingDensityStandard,
  BuildingDensityCalculation,
  UnitCosts,
} from "../types";
import { defaultDensityStandards, calculateOptimalBuildingCapacity } from "../data/densityStandards";
import { CameraRoomMeasurerModal } from "./CameraRoomMeasurerModal";
import {
  Calculator,
  Camera,
  Ruler,
  Building,
  CheckCircle2,
  AlertTriangle,
  Info,
  Thermometer,
  Wind,
  Droplets,
  Plus,
  Trash2,
  Sparkles,
  Share2,
  FileText,
  Activity,
  Layers,
} from "lucide-react";

interface AnimalDensityCalculatorToolProps {
  unitCosts?: UnitCosts;
}

export const AnimalDensityCalculatorTool: React.FC<AnimalDensityCalculatorToolProps> = ({
  unitCosts,
}) => {
  // Input Building Dimensions
  const [buildingName, setBuildingName] = useState<string>("Bâtiment Elevage #1");
  const [lengthMeters, setLengthMeters] = useState<number>(20);
  const [widthMeters, setWidthMeters] = useState<number>(10);
  const [selectedSpecies, setSelectedSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [selectedStandardId, setSelectedStandardId] = useState<string>("std-avic-3");

  // Camera Measurement Modal state
  const [isCameraMeasurerOpen, setIsCameraMeasurerOpen] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Saved Building Densities list (Local Storage cached)
  const [savedCalculations, setSavedCalculations] = useState<BuildingDensityCalculation[]>(() => {
    try {
      const raw = localStorage.getItem("ivoire_elevage_building_densities_v1");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "calc-1",
        buildingName: "Bâtiment Volaille A1 (Poulets de Chair)",
        lengthMeters: 30,
        widthMeters: 10,
        totalAreaM2: 300,
        species: "Aviculture",
        growthStage: "Poulets de Chair Finition / Lourds (5 à 7 semaines - 2.2kg+)",
        calculatedOptimalCount: 2700,
        calculatedMinCount: 2400,
        calculatedMaxCount: 3000,
        feedTroughMetersNeeded: 189,
        drinkersNeeded: 108,
        createdAt: "2026-07-28 09:30",
      },
      {
        id: "calc-2",
        buildingName: "Porcherie Engraissement P2",
        lengthMeters: 25,
        widthMeters: 8,
        totalAreaM2: 200,
        species: "Porciculture",
        growthStage: "Porcs Engraissement / Charcutiers (25 kg à 100 kg)",
        calculatedOptimalCount: 240,
        calculatedMinCount: 200,
        calculatedMaxCount: 280,
        feedTroughMetersNeeded: 72,
        drinkersNeeded: 24,
        createdAt: "2026-07-28 09:45",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("ivoire_elevage_building_densities_v1", JSON.stringify(savedCalculations));
    } catch (e) {
      console.error(e);
    }
  }, [savedCalculations]);

  // Filter available standards for selected species
  const availableStandards = defaultDensityStandards.filter(
    (std) => std.species === selectedSpecies
  );

  const activeStandard =
    defaultDensityStandards.find((std) => std.id === selectedStandardId) ||
    availableStandards[0] ||
    defaultDensityStandards[0];

  // Perform Real-Time Calculation
  const result = calculateOptimalBuildingCapacity(
    lengthMeters,
    widthMeters,
    activeStandard
  );

  // Handle Dimension Update from Camera Tool
  const handleApplyDimensionsFromCamera = (
    lengthM: number,
    widthM: number,
    snapshotPhotoUrl?: string
  ) => {
    setLengthMeters(lengthM);
    setWidthMeters(widthM);
    if (snapshotPhotoUrl) {
      setCapturedPhotoUrl(snapshotPhotoUrl);
    }
  };

  // Save current calculation to history
  const handleSaveCalculation = () => {
    const newCalc: BuildingDensityCalculation = {
      id: `calc-${Date.now()}`,
      buildingName: buildingName.trim() || "Nouveau Bâtiment",
      lengthMeters,
      widthMeters,
      totalAreaM2: result.areaM2,
      species: selectedSpecies,
      growthStage: activeStandard.growthStage,
      calculatedOptimalCount: result.optimalCount,
      calculatedMinCount: result.minCount,
      calculatedMaxCount: result.maxCount,
      feedTroughMetersNeeded: result.feedTroughMetersNeeded,
      drinkersNeeded: result.drinkersNeeded,
      snapshotPhotoUrl: capturedPhotoUrl || undefined,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setSavedCalculations([newCalc, ...savedCalculations]);
    alert(`Calcul de densité pour "${newCalc.buildingName}" sauvegardé avec succès !`);
  };

  const handleDeleteSavedCalculation = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement de densité ?")) {
      setSavedCalculations(savedCalculations.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Outil d'Aide à la Décision - Densité Animale</span>
              </span>
              <span className="text-emerald-300 text-xs font-bold">• Caméra Télémètre Intégrée</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Calculateur de Capacité Optimale par Bâtiment
            </h2>
            <p className="text-amber-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Déterminez le nombre idéal de sujets (poussins, poulets de chair, pondeuses, porcelets, charcutiers, truies) selon la surface ($m^2$) et le stade de croissance, avec mesure par la caméra du téléphone.
            </p>
          </div>

          <button
            onClick={() => setIsCameraMeasurerOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl transition-all cursor-pointer uppercase tracking-wider shrink-0"
          >
            <Camera className="w-5 h-5 text-slate-950 animate-pulse" />
            <span>Mesurer avec la Caméra du Téléphone</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters & Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Ruler className="w-4 h-4 text-amber-600" />
            <span>Paramètres du Bâtiment & Stade</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Désignation du Bâtiment :</label>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="ex: Bâtiment Volaille Chair A1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Secteur / Espèce :</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecies("Aviculture");
                    const firstAvic = defaultDensityStandards.find((s) => s.species === "Aviculture");
                    if (firstAvic) setSelectedStandardId(firstAvic.id);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSpecies === "Aviculture"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🐔 Aviculture (Poulets)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecies("Porciculture");
                    const firstPorc = defaultDensityStandards.find((s) => s.species === "Porciculture");
                    if (firstPorc) setSelectedStandardId(firstPorc.id);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSpecies === "Porciculture"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🐖 Porciculture (Porcs)
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Stade de Croissance & Norme :</label>
              <select
                value={selectedStandardId}
                onChange={(e) => setSelectedStandardId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {availableStandards.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.growthStage}
                  </option>
                ))}
              </select>
            </div>

            {/* Length & Width Dimensions */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-amber-950 font-bold">
                <span>Dimensions Physiques :</span>
                <button
                  type="button"
                  onClick={() => setIsCameraMeasurerOpen(true)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 underline font-extrabold flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ouvrir Caméra</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Longueur ($L$) :</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-mono font-black text-slate-900"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">m</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Largeur ($W$) :</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={widthMeters}
                      onChange={(e) => setWidthMeters(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-mono font-black text-slate-900"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">m</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 text-slate-700 font-extrabold text-xs">
                <span>Surface Totale Disponible :</span>
                <span className="text-amber-700 font-mono text-sm bg-amber-100 px-2 py-0.5 rounded">
                  {result.areaM2} m²
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCalculation}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Enregistrer cette Densité dans le Registre</span>
            </button>
          </div>
        </div>

        {/* Right Results Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommandations de Densité & Équipements</span>
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {activeStandard.growthStage}
            </span>
          </div>

          {/* Density Key Highlights Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              Nombre Optimal d'Animaux Suggéré :
            </div>

            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                {result.optimalCount.toLocaleString("fr-FR")}{" "}
                <span className="text-base font-normal text-slate-300">
                  {selectedSpecies === "Aviculture" ? "sujets" : "porcs / truies"}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                Plage Conseillée : {result.minCount} à {result.maxCount}
              </div>
            </div>

            {/* Density Standard Formula Ratio */}
            <div className="text-xs text-slate-300 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span>Ratio Norme Vétérinaire :</span>
              <span className="font-bold text-emerald-400 font-mono">
                {activeStandard.isAreaPerAnimal
                  ? `${activeStandard.recommendedDensityPerM2} m² / sujet`
                  : `${activeStandard.recommendedDensityPerM2} sujets / m²`}
              </span>
            </div>
          </div>

          {/* Equipment & Environmental Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Feed Troughs Need */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-bold flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Mangeoires & Mangeries Requis :</span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">
                {result.feedTroughMetersNeeded} mètres linéaires
              </div>
              <div className="text-[11px] text-slate-500">
                Basé sur {activeStandard.feedTroughCmPerHead} cm d'auge linéaire par animal.
              </div>
            </div>

            {/* Drinkers Need */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-bold flex items-center space-x-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Abreuvoirs / Pipettes Nécessaires :</span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">
                {result.drinkersNeeded} unités
              </div>
              <div className="text-[11px] text-slate-500">
                Norme de {activeStandard.drinkersPer100Head} pipettes / abreuvoirs pour 100 sujets.
              </div>
            </div>

            {/* Temperature */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-bold flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span>Température de Confort :</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {activeStandard.optimalTemperatureC}
              </div>
            </div>

            {/* Ventilation */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-bold flex items-center space-x-1">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span>Recommandation Aération :</span>
              </div>
              <div className="text-xs font-bold text-slate-800">
                {activeStandard.ventilationGuideline}
              </div>
            </div>
          </div>

          {/* Zootechnical Advice Note */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
            <div className="font-extrabold flex items-center space-x-1 text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Consigne d'Hygiène & Biosécurité :</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              {activeStandard.notes}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Building Densities History Table */}
      {savedCalculations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <span>Registre des Capacités par Bâtiment Enregistrés ({savedCalculations.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-3">Bâtiment / Local</th>
                  <th className="p-3">Secteur & Stade</th>
                  <th className="p-3">Surface (m²)</th>
                  <th className="p-3 text-right">Capacité Optimale</th>
                  <th className="p-3 text-right">Mangeoires (m)</th>
                  <th className="p-3 text-right">Abreuvoirs</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {savedCalculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{calc.buildingName}</td>
                    <td className="p-3 text-slate-600 font-medium">{calc.growthStage}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {calc.lengthMeters}m × {calc.widthMeters}m ({calc.totalAreaM2} m²)
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700 font-mono text-sm">
                      {calc.calculatedOptimalCount.toLocaleString("fr-FR")} sujets
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {calc.feedTroughMetersNeeded} m
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {calc.drinkersNeeded}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteSavedCalculation(calc.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Camera Room Measurer Modal Launcher */}
      <CameraRoomMeasurerModal
        isOpen={isCameraMeasurerOpen}
        onClose={() => setIsCameraMeasurerOpen(false)}
        onApplyDimensions={handleApplyDimensionsFromCamera}
        initialLength={lengthMeters}
        initialWidth={widthMeters}
      />
    </div>
  );
};
