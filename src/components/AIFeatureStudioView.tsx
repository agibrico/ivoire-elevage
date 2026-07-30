import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calculator,
  ClipboardList,
  HeartPulse,
  Boxes,
  TrendingUp,
  Zap,
  Layers,
  Smartphone,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Sliders,
  Check,
  Wifi,
  Globe,
} from "lucide-react";
import { CustomApkFeature, ApkInstallMode, UnitCosts } from "../types";
import { getApiUrl } from "../utils/api";
import { getApkInstallMode } from "../utils/apkInstallStore";

interface AIFeatureStudioViewProps {
  unitCosts: UnitCosts;
}

// Built-in default features that demonstrate dynamic APK extensions
export const defaultApkFeatures: CustomApkFeature[] = [
  {
    id: "default_feat_water_feed_ratio",
    title: "Calculateur Ratio Eau/Aliment & Alerte Déshydratation",
    category: "Aviculture",
    iconName: "Calculator",
    description: "Analyse le ratio quotidien entre l'eau consommée (Litres) et l'aliment (Kg) pour détecter précocement les coups de chaleur ou infections digestives chez les poulets de chair.",
    targetApkMode: "AVIVOIRE",
    createdAt: "2026-07-30 08:00",
    createdBy: "Module IA Ivoire Élevage",
    fields: [
      {
        id: "num_birds",
        label: "Effectif de la Bande (Poulets)",
        type: "number",
        defaultValue: 1000,
        unit: "sujets",
        helpText: "Nombre actuel de volailles en bâtiment",
      },
      {
        id: "age_days",
        label: "Âge de la bande (Jours)",
        type: "number",
        defaultValue: 21,
        unit: "jours",
        helpText: "Nombre de jours depuis l'arrivée des poussins",
      },
      {
        id: "water_liters",
        label: "Consommation d'eau mesurée",
        type: "number",
        defaultValue: 210,
        unit: "Litres / jour",
        helpText: "Volume total relevé au compteur d'eau",
      },
      {
        id: "feed_kg",
        label: "Consommation d'aliment mesurée",
        type: "number",
        defaultValue: 105,
        unit: "Kg / jour",
        helpText: "Poids total d'aliment distribué",
      },
    ],
    calculationLogicDescription: "Ratio optimal Eau/Aliment sous climat tropical : 1.8 à 2.2 L / Kg d'aliment. Un ratio > 2.5 indique un stress thermique ou fuite, < 1.6 indique une rupture d'eau ou maladie.",
    defaultOutputs: [
      {
        id: "ratio_result",
        label: "Ratio Eau / Aliment Calculé",
        value: "2.00 L / Kg",
        unit: "L/Kg",
        note: "Plage idéale (1.8 - 2.2 L/Kg)",
        status: "OK",
      },
      {
        id: "water_per_bird",
        label: "Consommation par sujet",
        value: "210 ml / sujet",
        unit: "ml",
        note: "Conforme pour J21 sous 28°C",
        status: "OK",
      },
    ],
    recommendations: [
      "Purger les lignes de pipettes à 11h et 15h lors des pics de chaleur.",
      "Ajouter l'acidifiant / antistress thermique dans la citerne tampon si T° > 32°C.",
    ],
    isInstalled: true,
  },
  {
    id: "default_feat_pig_gmq",
    title: "Simulateur GMQ & Coût Carcasse Porcine",
    category: "Porciculture",
    iconName: "TrendingUp",
    description: "Calcule le Gain Moyen Quotidien (GMQ) en grammes/jour et le coût de revient alimentaire par kg de carcasse d'engraissement porcin.",
    targetApkMode: "PORCIVOIRE",
    createdAt: "2026-07-30 08:30",
    createdBy: "Module IA Ivoire Élevage",
    fields: [
      {
        id: "initial_weight",
        label: "Poids initial moyen (Poids entrée)",
        type: "number",
        defaultValue: 12.5,
        unit: "kg",
        helpText: "Poids moyen à l'achat du porcelet",
      },
      {
        id: "current_weight",
        label: "Poids actuel ou estimé",
        type: "number",
        defaultValue: 75.0,
        unit: "kg carcasse",
        helpText: "Poids cible de vente",
      },
      {
        id: "days_in_farm",
        label: "Durée d'engraissement",
        type: "number",
        defaultValue: 120,
        unit: "jours",
        helpText: "Nombres de jours sur le site",
      },
      {
        id: "feed_cost_per_pig",
        label: "Coût alimentaire cumulé par porc",
        type: "number",
        defaultValue: 65000,
        unit: "FCFA",
        helpText: "Total aliments consommés par tête",
      },
    ],
    calculationLogicDescription: "GMQ = (Poids Final - Poids Initial) / Nbr Jours * 1000. Coût Alimentaire / Kg = Coût Aliment / Poids Carcasse.",
    defaultOutputs: [
      {
        id: "gmq_output",
        label: "Gain Moyen Quotidien (GMQ)",
        value: "520.8 g / jour",
        unit: "g/j",
        note: "Excellente croissance (> 500 g/j)",
        status: "OK",
      },
      {
        id: "feed_cost_kg",
        label: "Coût Aliment / kg Carcasse",
        value: "866.7 FCFA / kg",
        unit: "FCFA/kg",
        note: "Marge brute sous prix de vente à 2 100 FCFA/kg : 1 233 FCFA/kg",
        status: "OK",
      },
    ],
    recommendations: [
      "Ajuster la ration de finition au-delà de 60 kg avec la formule concentrée 15%.",
      "S'assurer du déparasitage interne avant l'entrée en engraissement.",
    ],
    isInstalled: true,
  },
  {
    id: "default_feat_biosecurity_score",
    title: "Grille d'Évaluation Biosécurité & Risque Épidémie",
    category: "Santé & Biosécurité",
    iconName: "ShieldCheck",
    description: "Audit rapide des 5 points critiques d'entrée de ferme (pédiluve, désinfection véhicules, registre visiteurs, sas d'habillage, quarantaine).",
    targetApkMode: "TOUS",
    createdAt: "2026-07-30 09:00",
    createdBy: "Module IA Ivoire Élevage",
    fields: [
      {
        id: "pediluve_active",
        label: "Pédiluve rechargé avec désinfectant valide ?",
        type: "select",
        options: ["Oui (Quotidien)", "Incertain (> 3 jours)", "Non (Sec / Épuisé)"],
        defaultValue: "Oui (Quotidien)",
        helpText: "Contrôle visuel au portail d'accès",
      },
      {
        id: "visitor_register",
        label: "Registre des visiteurs renseigné à 100% ?",
        type: "select",
        options: ["Oui", "Partiellement", "Non"],
        defaultValue: "Oui",
        helpText: "Vérification des accès extérieurs",
      },
      {
        id: "protective_clothing",
        label: "Port de bottes & combinaisons réservées au site ?",
        type: "select",
        options: ["Oui (Systématique)", "Non"],
        defaultValue: "Oui (Systématique)",
        helpText: "Équipement de protection individuelle",
      },
    ],
    calculationLogicDescription: "Score de conformité basé sur la pondération des barrières sanitaires. 100% = Risque Faible, < 70% = Alerte Majeure.",
    defaultOutputs: [
      {
        id: "biosecurity_score",
        label: "Indice de Conformité Biosécurité",
        value: "100 %",
        unit: "%",
        note: "Ferme protégée à niveau maximal",
        status: "OK",
      },
    ],
    recommendations: [
      "Renouveler la solution de gréosol/chloramine dans le pédiluve tous les 2 jours.",
      "Conserver les registres d'accès au moins 6 mois pour l'audit vétérinaire.",
    ],
    isInstalled: true,
  },
];

export const AIFeatureStudioView: React.FC<AIFeatureStudioViewProps> = ({ unitCosts }) => {
  const currentApkMode = getApkInstallMode();

  // Installed features in LocalStorage
  const [installedFeatures, setInstalledFeatures] = useState<CustomApkFeature[]>(() => {
    try {
      const saved = localStorage.getItem("ivoire_custom_apk_features");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return defaultApkFeatures;
  });

  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFeature, setGeneratedFeature] = useState<CustomApkFeature | null>(null);
  const [activeTestFeature, setActiveTestFeature] = useState<CustomApkFeature | null>(defaultApkFeatures[0]);
  const [testFieldValues, setTestFieldValues] = useState<Record<string, any>>({});
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  // Sync test field values when active test feature changes
  useEffect(() => {
    if (activeTestFeature) {
      const initial: Record<string, any> = {};
      activeTestFeature.fields.forEach((f) => {
        initial[f.id] = f.defaultValue !== undefined ? f.defaultValue : "";
      });
      setTestFieldValues(initial);
    }
  }, [activeTestFeature]);

  // Persist installed features
  const saveInstalledFeatures = (updated: CustomApkFeature[]) => {
    setInstalledFeatures(updated);
    localStorage.setItem("ivoire_custom_apk_features", JSON.stringify(updated));
  };

  const presetPromptChips = [
    "🐔 Formulaire de suivi de température & alerte coup de chaleur poussins J1-J7",
    "🐷 Outil de calcul de la ration quotidienne truies allaitantes & porcelets",
    "🩺 Registre de suivi de mortalité quotidienne & alerte de seuil épidémique (>1.5%)",
    "⚡ Estimateur de consommation de gaz & coût de chauffage des poulaillers",
    "📦 Calculateur de stock maïs & soja jours d'autonomie restants",
  ];

  const handleGenerateFeature = async (promptOverride?: string) => {
    const q = promptOverride || promptInput;
    if (!q.trim()) return;

    setIsGenerating(true);
    setGeneratedFeature(null);
    setInstallSuccessMessage(null);

    try {
      const res = await fetch(getApiUrl("/api/ai/feature-builder"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          apkMode: currentApkMode,
          userRole: "Gestionnaire",
        }),
      });

      const data = await res.json();
      if (data.success && data.feature) {
        const newFeat: CustomApkFeature = {
          id: `custom_feat_${Date.now()}`,
          title: data.feature.title || "Nouvelle Fonctionnalité APK",
          category: data.feature.category || "Gestion & Finance",
          iconName: data.feature.iconName || "Sparkles",
          description: data.feature.description || "Fonctionnalité personnalisée générée par Gemini IA.",
          targetApkMode: data.feature.targetApkMode || "TOUS",
          createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          createdBy: "Générateur IA APK (Gemini 3.6)",
          fields: data.feature.fields || [],
          calculationLogicDescription: data.feature.calculationLogicDescription || "Calculs automatisés.",
          defaultOutputs: data.feature.defaultOutputs || [],
          recommendations: data.feature.recommendations || [],
          isInstalled: false,
        };

        setGeneratedFeature(newFeat);
        setActiveTestFeature(newFeat);
      } else {
        alert("Erreur lors de la génération : " + (data.error || "Réponse invalide"));
      }
    } catch (err: any) {
      alert("Erreur réseau : " + (err.message || "Erreur de connexion"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstallFeature = (feat: CustomApkFeature) => {
    const installedFeat = { ...feat, isInstalled: true };
    const exists = installedFeatures.some((f) => f.id === feat.id);
    let updatedList: CustomApkFeature[];
    if (exists) {
      updatedList = installedFeatures.map((f) => (f.id === feat.id ? installedFeat : f));
    } else {
      updatedList = [installedFeat, ...installedFeatures];
    }
    saveInstalledFeatures(updatedList);
    setGeneratedFeature(null);
    setActiveTestFeature(installedFeat);
    setInstallSuccessMessage(`La fonctionnalité "${feat.title}" a été ajoutée et activée directement dans votre logiciel installé !`);
    setTimeout(() => setInstallSuccessMessage(null), 4000);
  };

  const handleUninstallFeature = (id: string) => {
    if (confirm("Voulez-vous vraiment retirer cette fonctionnalité du logiciel installé ?")) {
      const updated = installedFeatures.filter((f) => f.id !== id);
      saveInstalledFeatures(updated);
      if (activeTestFeature?.id === id) {
        setActiveTestFeature(updated[0] || null);
      }
    }
  };

  const handleFieldValueChange = (fieldId: string, val: any) => {
    setTestFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Calculator":
        return <Calculator className="w-5 h-5" />;
      case "ClipboardList":
        return <ClipboardList className="w-5 h-5" />;
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5" />;
      case "Boxes":
        return <Boxes className="w-5 h-5" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5" />;
      case "Zap":
        return <Zap className="w-5 h-5" />;
      case "Layers":
        return <Layers className="w-5 h-5" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Studio IA & Extension du Logiciel</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Connexion Internet Active • Gemini 3.6 Flash</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Générateur de Fonctionnalités IA en Ligne
            </h1>
            <p className="text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              Ajoutez en direct via Internet de nouveaux outils interactifs, formulaires de suivi terrain, calculateurs de rationnement ou grilles d'audit personnalisées directement intégrés dans votre logiciel installé <strong>Ivoire Élevage</strong>.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shrink-0">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="text-xs">
              <div className="text-slate-400 font-medium">Mode APK Actif</div>
              <div className="font-black text-white text-sm">
                {currentApkMode === "ADMINISTRATION_GENERALE"
                  ? "👑 Admin Général"
                  : currentApkMode === "AVIVOIRE"
                  ? "🐔 Avivoire"
                  : "🐷 Porcivoire"}
              </div>
              <div className="text-emerald-400 text-[11px] font-bold mt-0.5">
                {installedFeatures.length} module(s) disponible(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      {installSuccessMessage && (
        <div className="bg-emerald-900/90 border-2 border-emerald-500 text-white p-4 rounded-2xl flex items-center space-x-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <span className="font-bold text-sm">{installSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Prompt/Studio + Right Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Creator & Feature Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prompt Generator Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-black text-base border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <span>Créer une nouvelle fonctionnalité IA</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Décrivez l'outil, le registre terrain ou le calculateur que vous souhaitez créer. Gemini construira les champs de saisie, les formules et les conseils associés.
            </p>

            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ex: Formulaire de suivi de la pesée hebdomadaire des poulets avec calcul d'homogénéité et alerte si écart-type > 10%..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />

            {/* Quick Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Exemples rapides de fonctionnalités :
              </span>
              <div className="flex flex-col gap-1.5">
                {presetPromptChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPromptInput(chip);
                      handleGenerateFeature(chip);
                    }}
                    disabled={isGenerating}
                    className="text-left text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-950 border border-slate-200 hover:border-emerald-400 rounded-xl p-2 font-medium transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="line-clamp-1">{chip}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleGenerateFeature()}
              disabled={isGenerating || !promptInput.trim()}
              className="w-full bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Génération du module via Internet (Gemini)...</span>
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span>Générer la Fonctionnalité (En Ligne)</span>
                </>
              )}
            </button>
          </div>

          {/* Installed Features Library */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-base">
                <Boxes className="w-5 h-5 text-emerald-700" />
                <span>Modules Installés ({installedFeatures.length})</span>
              </div>
              <span className="text-xs font-bold text-slate-400">Bibliothèque APK</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {installedFeatures.map((feat) => {
                const isActive = activeTestFeature?.id === feat.id;
                return (
                  <div
                    key={feat.id}
                    onClick={() => setActiveTestFeature(feat)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-emerald-50 border-emerald-500 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? "bg-emerald-800 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {getIconComponent(feat.iconName)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                            {feat.title}
                          </h4>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                            {feat.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      {isActive && (
                        <span className="text-[10px] bg-emerald-800 text-white font-black px-2 py-0.5 rounded-md">
                          Actif
                        </span>
                      )}
                      {!feat.id.startsWith("default_feat") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUninstallFeature(feat.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Désinstaller le module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Playground & Feature Executor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeTestFeature ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
              {/* Feature Header */}
              <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-sm">
                    {getIconComponent(activeTestFeature.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-black uppercase">
                        {activeTestFeature.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Créé par {activeTestFeature.createdBy}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white mt-0.5">
                      {activeTestFeature.title}
                    </h2>
                  </div>
                </div>

                {generatedFeature?.id === activeTestFeature.id && !activeTestFeature.isInstalled && (
                  <button
                    onClick={() => handleInstallFeature(activeTestFeature)}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 shrink-0 border border-amber-300/50"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>📥 Activer dans le Logiciel</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="p-5 bg-slate-50 border-b border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeTestFeature.description}
              </div>

              {/* Form Inputs Section */}
              <div className="p-5 space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <span>Saisies de Terrain & Paramètres de Calcul</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeTestFeature.fields.map((field) => (
                    <div key={field.id} className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">
                        {field.label} {field.unit && <span className="text-slate-500 font-normal">({field.unit})</span>}
                      </label>

                      {field.type === "number" && (
                        <input
                          type="number"
                          value={testFieldValues[field.id] ?? field.defaultValue ?? ""}
                          onChange={(e) => handleFieldValueChange(field.id, parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                      )}

                      {field.type === "text" && (
                        <input
                          type="text"
                          value={testFieldValues[field.id] ?? field.defaultValue ?? ""}
                          onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                      )}

                      {field.type === "select" && (
                        <select
                          value={testFieldValues[field.id] ?? field.defaultValue ?? ""}
                          onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        >
                          {field.options?.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.helpText && (
                        <p className="text-[11px] text-slate-500 italic">
                          {field.helpText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Outputs / Results Section */}
              <div className="p-5 bg-emerald-950 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                  <h3 className="font-black text-sm text-emerald-300 uppercase tracking-wider flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Résultats & Diagnostic Dynamique IA</span>
                  </h3>
                  <span className="text-xs text-emerald-400/80 font-bold">Mise à jour automatique</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeTestFeature.defaultOutputs.map((out) => (
                    <div
                      key={out.id}
                      className="bg-slate-900/90 border border-emerald-800/60 rounded-xl p-4 space-y-1 shadow-md"
                    >
                      <div className="text-xs text-emerald-300 font-bold">{out.label}</div>
                      <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                        {out.value}
                      </div>
                      {out.note && (
                        <div className="text-[11px] text-slate-300 font-medium">
                          {out.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calculation Logic Explanation */}
                <div className="bg-slate-900/60 border border-emerald-800/40 rounded-xl p-3.5 text-xs text-emerald-200 space-y-1">
                  <div className="font-bold text-amber-300">Logique de calcul appliquée :</div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeTestFeature.calculationLogicDescription}
                  </p>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-5 space-y-3 bg-white">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Recommandations d'Action Terrain</span>
                </h3>

                <ul className="space-y-2 text-xs text-slate-700">
                  {activeTestFeature.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
              <Bot className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-base text-slate-800">
                Aucun module sélectionné
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choisissez un module dans la liste de gauche ou générez une nouvelle fonctionnalité sur-mesure avec Gemini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
