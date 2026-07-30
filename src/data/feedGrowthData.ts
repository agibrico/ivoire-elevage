import { FeedingStandard, BatchFeedingRecord, WeightFeedRule } from "../types";

// Standard Growth Curves for Aviculture (Poulet de chair Cobb 500)
export const avicultureGrowthStandards: FeedingStandard[] = [
  {
    ageDaysOrWeeks: 7,
    ageLabel: "Jour 7 (Semaine 1)",
    species: "Aviculture",
    phase: "Pré-démarrage",
    expectedWeightGrams: 195,
    recommendedDailyFeedGrams: 28,
    cumulativeFeedKg: 0.16,
    targetFCR: 0.82,
    proteinPercent: 22.5,
    energyKcal: 3000,
  },
  {
    ageDaysOrWeeks: 14,
    ageLabel: "Jour 14 (Semaine 2)",
    species: "Aviculture",
    phase: "Démarrage",
    expectedWeightGrams: 470,
    recommendedDailyFeedGrams: 52,
    cumulativeFeedKg: 0.52,
    targetFCR: 1.11,
    proteinPercent: 21.0,
    energyKcal: 3050,
  },
  {
    ageDaysOrWeeks: 21,
    ageLabel: "Jour 21 (Semaine 3)",
    species: "Aviculture",
    phase: "Démarrage",
    expectedWeightGrams: 900,
    recommendedDailyFeedGrams: 85,
    cumulativeFeedKg: 1.12,
    targetFCR: 1.24,
    proteinPercent: 20.0,
    energyKcal: 3100,
  },
  {
    ageDaysOrWeeks: 28,
    ageLabel: "Jour 28 (Semaine 4)",
    species: "Aviculture",
    phase: "Croissance",
    expectedWeightGrams: 1480,
    recommendedDailyFeedGrams: 125,
    cumulativeFeedKg: 2.0,
    targetFCR: 1.35,
    proteinPercent: 19.0,
    energyKcal: 3150,
  },
  {
    ageDaysOrWeeks: 35,
    ageLabel: "Jour 35 (Semaine 5)",
    species: "Aviculture",
    phase: "Croissance",
    expectedWeightGrams: 2150,
    recommendedDailyFeedGrams: 160,
    cumulativeFeedKg: 3.12,
    targetFCR: 1.45,
    proteinPercent: 18.0,
    energyKcal: 3200,
  },
  {
    ageDaysOrWeeks: 42,
    ageLabel: "Jour 42 (Semaine 6)",
    species: "Aviculture",
    phase: "Finition",
    expectedWeightGrams: 2850,
    recommendedDailyFeedGrams: 185,
    cumulativeFeedKg: 4.42,
    targetFCR: 1.55,
    proteinPercent: 17.5,
    energyKcal: 3220,
  },
];

// Standard Growth Curves for Porciculture (Porc Charcutier Hybride)
export const porcicultureGrowthStandards: FeedingStandard[] = [
  {
    ageDaysOrWeeks: 4,
    ageLabel: "Semaine 4 (Sèvre 28 jours)",
    species: "Porciculture",
    phase: "Pré-démarrage",
    expectedWeightGrams: 7500, // 7.5 kg
    recommendedDailyFeedGrams: 300,
    cumulativeFeedKg: 4.0,
    targetFCR: 1.1,
    proteinPercent: 20.5,
    energyKcal: 3300,
  },
  {
    ageDaysOrWeeks: 8,
    ageLabel: "Semaine 8 (Post-sevrage)",
    species: "Porciculture",
    phase: "Démarrage",
    expectedWeightGrams: 18000, // 18 kg
    recommendedDailyFeedGrams: 850,
    cumulativeFeedKg: 21.0,
    targetFCR: 1.45,
    proteinPercent: 18.5,
    energyKcal: 3250,
  },
  {
    ageDaysOrWeeks: 12,
    ageLabel: "Semaine 12 (Engraissement 1)",
    species: "Porciculture",
    phase: "Croissance",
    expectedWeightGrams: 38000, // 38 kg
    recommendedDailyFeedGrams: 1600,
    cumulativeFeedKg: 58.0,
    targetFCR: 2.1,
    proteinPercent: 16.5,
    energyKcal: 3150,
  },
  {
    ageDaysOrWeeks: 16,
    ageLabel: "Semaine 16 (Engraissement 2)",
    species: "Porciculture",
    phase: "Croissance",
    expectedWeightGrams: 62000, // 62 kg
    recommendedDailyFeedGrams: 2300,
    cumulativeFeedKg: 110.0,
    targetFCR: 2.6,
    proteinPercent: 15.5,
    energyKcal: 3100,
  },
  {
    ageDaysOrWeeks: 20,
    ageLabel: "Semaine 20 (Finition carcasse)",
    species: "Porciculture",
    phase: "Finition",
    expectedWeightGrams: 90000, // 90 kg
    recommendedDailyFeedGrams: 2900,
    cumulativeFeedKg: 178.0,
    targetFCR: 3.1,
    proteinPercent: 14.5,
    energyKcal: 3050,
  },
  {
    ageDaysOrWeeks: 24,
    ageLabel: "Semaine 24 (Lourds / Reproduction)",
    species: "Porciculture",
    phase: "Finition",
    expectedWeightGrams: 115000, // 115 kg
    recommendedDailyFeedGrams: 3200,
    cumulativeFeedKg: 255.0,
    targetFCR: 3.4,
    proteinPercent: 14.0,
    energyKcal: 3000,
  },
];

// Active Batches with Real Weighings & Weight Gap Scenarios
export const defaultBatchFeedingRecords: BatchFeedingRecord[] = [
  {
    id: "batch-v1",
    batchName: "Bande Poulets #1 - Bâtiment A (Bingerville)",
    species: "Aviculture",
    breed: "Cobb 500",
    headCount: 1000,
    ageDaysOrWeeks: 28, // 28 jours (4 semaines)
    ageLabel: "Jour 28 (Semaine 4)",
    actualWeightGrams: 1320, // Retard léger: 1320g vs 1480g prévu (-10.8%)
    expectedWeightGrams: 1480,
    actualDailyFeedGrams: 110, // Ration donnée: 110g vs 125g prévu
    expectedDailyFeedGrams: 125,
    currentFeedType: "Croissance",
    feedingRegimen: "Rationné (Strict)",
    waterConsumptionLitersPerHead: 0.24,
    lastWeighingDate: "2026-07-24",
    notes: "Sous-consommation constatée suite à une forte chaleur mardi dernier.",
  },
  {
    id: "batch-v2",
    batchName: "Bande Poulets #2 - Bâtiment B (Yopougon)",
    species: "Aviculture",
    breed: "Ross 308",
    headCount: 1500,
    ageDaysOrWeeks: 35, // 35 jours
    ageLabel: "Jour 35 (Semaine 5)",
    actualWeightGrams: 2240, // Avance de croissance: +4.2%
    expectedWeightGrams: 2150,
    actualDailyFeedGrams: 165,
    expectedDailyFeedGrams: 160,
    currentFeedType: "Croissance",
    feedingRegimen: "À volonté (Ad libitum)",
    waterConsumptionLitersPerHead: 0.35,
    lastWeighingDate: "2026-07-25",
    notes: "Excellente vitalité, aliment croissance enrichi à 19.5% PB.",
  },
  {
    id: "batch-p1",
    batchName: "Lot Porcs Engraissement #A - Loges 1 à 4",
    species: "Porciculture",
    breed: "Hybride Large White x Pietrain",
    headCount: 80,
    ageDaysOrWeeks: 16, // 16 semaines
    ageLabel: "Semaine 16 (Engraissement)",
    actualWeightGrams: 54000, // 54 kg vs 62 kg prévu (-12.9% retard important)
    expectedWeightGrams: 62000,
    actualDailyFeedGrams: 1950, // 1.95 kg/jour vs 2.3 kg recommandé
    expectedDailyFeedGrams: 2300,
    currentFeedType: "Croissance",
    feedingRegimen: "Rationné (Strict)",
    waterConsumptionLitersPerHead: 5.5,
    lastWeighingDate: "2026-07-22",
    notes: "Auge à réajuster, compétition entre porcs observée dans la loge 2.",
  },
  {
    id: "batch-p2",
    batchName: "Lot Truies Gestantes & Génisses",
    species: "Porciculture",
    breed: "Grand Porc Blanc LW",
    headCount: 12,
    ageDaysOrWeeks: 24, // 24 semaines
    ageLabel: "Semaine 24 (Reproduction)",
    actualWeightGrams: 118000, // 118 kg vs 115 kg (+2.6%)
    expectedWeightGrams: 115000,
    actualDailyFeedGrams: 2800,
    expectedDailyFeedGrams: 3000,
    currentFeedType: "Gestante",
    feedingRegimen: "Rationné (Strict)",
    waterConsumptionLitersPerHead: 12.0,
    lastWeighingDate: "2026-07-20",
    notes: "Régime spécial gestation contrôlé avec fibres (son de blé).",
  },
];

export const defaultWeightFeedRules: WeightFeedRule[] = [
  // PORCICULTURE
  {
    id: "p-rule-1",
    species: "Porciculture",
    minWeightGrams: 0,
    maxWeightGrams: 8000, // 0 - 8 kg
    feedTypeName: "Aliment Porcelet Sous-Mère & Prestarter (Laitier)",
    feedCategoryPhase: "Pré-démarrage",
    recommendedDailyFeedGrams: 250,
    proteinPercent: 22.0,
    energyKcal: 3350,
    presentation: "Granulé Laitier 2mm",
    description: "Aliment hyper-digestible enrichi en sérum de lait pour sous-mère et sevrage très précoce.",
    transitionInstructions: "Distribuer en petites fractions 4 à 6 fois par jour pour stimuler l'appétit.",
  },
  {
    id: "p-rule-2",
    species: "Porciculture",
    minWeightGrams: 8000,
    maxWeightGrams: 15000, // 8 - 15 kg
    feedTypeName: "Aliment Porcelet 1er Âge / Post-Sevrage",
    feedCategoryPhase: "Pré-démarrage",
    recommendedDailyFeedGrams: 600,
    proteinPercent: 20.0,
    energyKcal: 3280,
    presentation: "Granulé 2.5mm",
    description: "Sécurise le sevrage, prévient la diarrhée d'assimilation et renforce la flore intestinale.",
    transitionInstructions: "Transition progressive sur 3 jours (75% Prestarter + 25% 1er Âge J1).",
  },
  {
    id: "p-rule-3",
    species: "Porciculture",
    minWeightGrams: 15000,
    maxWeightGrams: 30000, // 15 - 30 kg
    feedTypeName: "Aliment Porcelet 2ème Âge / Démarrage",
    feedCategoryPhase: "Démarrage",
    recommendedDailyFeedGrams: 1200,
    proteinPercent: 18.5,
    energyKcal: 3200,
    presentation: "Granulé 2.5mm",
    description: "Soutient la croissance osseuse et musculaire rapide du porcelet en élevage.",
    transitionInstructions: "Mélanger 50/50 pendant 2 jours avant d'administrer 100% 2ème Âge.",
  },
  {
    id: "p-rule-4",
    species: "Porciculture",
    minWeightGrams: 30000,
    maxWeightGrams: 60000, // 30 - 60 kg
    feedTypeName: "Aliment Porc Engraissement - Croissance",
    feedCategoryPhase: "Croissance",
    recommendedDailyFeedGrams: 2100,
    proteinPercent: 16.5,
    energyKcal: 3120,
    presentation: "Poudre / Farine",
    description: "Maximise le gain de poids quotidien moyen (GMQ) avec un excellent indice de consommation.",
    transitionInstructions: "Transition directe sur 24h avec accès permanent à de l'eau propre.",
  },
  {
    id: "p-rule-5",
    species: "Porciculture",
    minWeightGrams: 60000,
    maxWeightGrams: 200000, // > 60 kg
    feedTypeName: "Aliment Porc Engraissement - Finition",
    feedCategoryPhase: "Finition",
    recommendedDailyFeedGrams: 2850,
    proteinPercent: 14.5,
    energyKcal: 3050,
    presentation: "Poudre / Farine",
    description: "Affinement de la carcasse, amélioration de la fermeté du lard et rendement à l'abattage.",
    transitionInstructions: "Distribuer 2 fois par jour aux heures fraîches pour optimiser le bilan énergétique.",
  },

  // AVICULTURE
  {
    id: "v-rule-1",
    species: "Aviculture",
    minWeightGrams: 0,
    maxWeightGrams: 250, // 0 - 250 g
    feedTypeName: "Aliment Volaille Pré-Démarrage (Haute Proximité)",
    feedCategoryPhase: "Pré-démarrage",
    recommendedDailyFeedGrams: 28,
    proteinPercent: 22.5,
    energyKcal: 3000,
    presentation: "Miette",
    description: "Miette très fine riche en protéines solubles et acides aminés essentiels pour démarrer le poussin.",
    transitionInstructions: "Épandre sur alvéoles ou assiettes basses à volonté pendant les 10 premiers jours.",
  },
  {
    id: "v-rule-2",
    species: "Aviculture",
    minWeightGrams: 250,
    maxWeightGrams: 1100, // 250g - 1.1kg
    feedTypeName: "Aliment Volaille Démarrage (Croissance S1-S3)",
    feedCategoryPhase: "Démarrage",
    recommendedDailyFeedGrams: 70,
    proteinPercent: 20.5,
    energyKcal: 3080,
    presentation: "Miette",
    description: "Soutient le développement du squelette, des organes vitaux et du système immunitaire.",
    transitionInstructions: "Passer progressivement des assiettes de démarrage aux trémies automatiques.",
  },
  {
    id: "v-rule-3",
    species: "Aviculture",
    minWeightGrams: 1100,
    maxWeightGrams: 2200, // 1.1kg - 2.2kg
    feedTypeName: "Aliment Volaille Croissance (Muscle & Squelette)",
    feedCategoryPhase: "Croissance",
    recommendedDailyFeedGrams: 140,
    proteinPercent: 19.0,
    energyKcal: 3150,
    presentation: "Granulé 4mm",
    description: "Développement musculaire rapide du blanc et des cuisses avec valorisation optimale.",
    transitionInstructions: "Ajuster la hauteur des mangeoires à la hauteur du dos des poulets.",
  },
  {
    id: "v-rule-4",
    species: "Aviculture",
    minWeightGrams: 2200,
    maxWeightGrams: 10000, // > 2.2 kg
    feedTypeName: "Aliment Volaille Finition (Carcasse & Poids Marché)",
    feedCategoryPhase: "Finition",
    recommendedDailyFeedGrams: 180,
    proteinPercent: 17.5,
    energyKcal: 3220,
    presentation: "Granulé 4mm",
    description: "Finition de la masse corporelle avant vente aux restaurateurs et grossistes.",
    transitionInstructions: "Retirer tout traitement antibiotique au moins 5 jours avant la vente.",
  },
];

export function getRecommendedFeedByWeight(
  species: "Aviculture" | "Porciculture",
  weightGrams: number
): WeightFeedRule {
  const rules = defaultWeightFeedRules.filter((r) => r.species === species);
  const matched = rules.find((r) => weightGrams >= r.minWeightGrams && weightGrams < r.maxWeightGrams);
  if (matched) return matched;
  return rules[rules.length - 1] || defaultWeightFeedRules[0];
}
