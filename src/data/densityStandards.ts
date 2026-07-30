import { BuildingDensityStandard } from "../types";

export const defaultDensityStandards: BuildingDensityStandard[] = [
  // AVICULTURE
  {
    id: "std-avic-1",
    species: "Aviculture",
    growthStage: "Poussins Démarrage (0 à 3 semaines)",
    recommendedDensityPerM2: 25,
    minDensityPerM2: 20,
    maxDensityPerM2: 30,
    isAreaPerAnimal: false,
    feedTroughCmPerHead: 2.5,
    drinkersPer100Head: 2,
    optimalTemperatureC: "32°C à 35°C (J1) puis -2°C/semaine",
    ventilationGuideline: "Aération douce sans courant d'air direct sur la poussinière.",
    notes: "Chauffage requis. Garder une litière sèche en copeaux de bois (5 à 7 cm).",
  },
  {
    id: "std-avic-2",
    species: "Aviculture",
    growthStage: "Poulets de Chair Croissance (3 à 5 semaines)",
    recommendedDensityPerM2: 12,
    minDensityPerM2: 10,
    maxDensityPerM2: 15,
    isAreaPerAnimal: false,
    feedTroughCmPerHead: 5,
    drinkersPer100Head: 3,
    optimalTemperatureC: "24°C à 26°C",
    ventilationGuideline: "Ventilation traversante continue. Renouvellement d'air 1.5 m³/h/kg.",
    notes: "Surveiller l'humidité de la litière et la vitesse de l'air.",
  },
  {
    id: "std-avic-3",
    species: "Aviculture",
    growthStage: "Poulets de Chair Finition / Lourds (5 à 7 semaines - 2.2kg+)",
    recommendedDensityPerM2: 9,
    minDensityPerM2: 8,
    maxDensityPerM2: 10,
    isAreaPerAnimal: false,
    feedTroughCmPerHead: 7,
    drinkersPer100Head: 4,
    optimalTemperatureC: "20°C à 22°C",
    ventilationGuideline: "Ventilation forte requise pour dissiper la chaleur métabolique élevée.",
    notes: "Densité maximale recommandée de 30 à 34 kg de poid vif / m².",
  },
  {
    id: "std-avic-4",
    species: "Aviculture",
    growthStage: "Poulettes Poules Pondeuses au Sol (Ponte)",
    recommendedDensityPerM2: 6,
    minDensityPerM2: 5,
    maxDensityPerM2: 7,
    isAreaPerAnimal: false,
    feedTroughCmPerHead: 10,
    drinkersPer100Head: 5,
    optimalTemperatureC: "18°C à 24°C",
    ventilationGuideline: "Espace nids recommandé : 1 nid pour 5 poules.",
    notes: "Prévoir perchoirs (15cm par poule) et parcours de fiente propre.",
  },

  // PORCICULTURE
  {
    id: "std-porc-1",
    species: "Porciculture",
    growthStage: "Porcelets Post-Sevrage (7 kg à 25 kg)",
    recommendedDensityPerM2: 3, // 3 porcelets par m² = 0.33 m²/porcelet
    minDensityPerM2: 2.5,
    maxDensityPerM2: 3.5,
    isAreaPerAnimal: false,
    feedTroughCmPerHead: 15,
    drinkersPer100Head: 8,
    optimalTemperatureC: "26°C (Sevrage) puis 22°C",
    ventilationGuideline: "Sol caillebotis synthétique ou litière accumulée propre.",
    notes: "Abreuvoirs à tétine réglables en hauteur.",
  },
  {
    id: "std-porc-2",
    species: "Porciculture",
    growthStage: "Porcs Engraissement / Charcutiers (25 kg à 100 kg)",
    recommendedDensityPerM2: 1.2, // ~0.8 m² par porc
    minDensityPerM2: 1.0,
    maxDensityPerM2: 1.4,
    isAreaPerAnimal: false,
    feedTroughCmPerHead: 30,
    drinkersPer100Head: 10,
    optimalTemperatureC: "18°C à 22°C",
    ventilationGuideline: "Bâtiment ouvert ou sous brumisation en climat tropical chaud.",
    notes: "Norme bien-être : 0.75 m² par porc de 100 kg. Prévoir aire de défécation.",
  },
  {
    id: "std-porc-3",
    species: "Porciculture",
    growthStage: "Truies Gestantes en Groupe",
    recommendedDensityPerM2: 2.5, // 2.5 m² PER SOW (Area per animal)
    minDensityPerM2: 2.2,
    maxDensityPerM2: 3.0,
    isAreaPerAnimal: true, // Surface minimale par truie
    feedTroughCmPerHead: 45,
    drinkersPer100Head: 15,
    optimalTemperatureC: "18°C à 21°C",
    ventilationGuideline: "Aération maximale pour éviter le stress thermique et les avortements.",
    notes: "Loges collectives de 4 à 8 truies avec réceptacles de nourrissement individuel.",
  },
  {
    id: "std-porc-4",
    species: "Porciculture",
    growthStage: "Loge de Maternité Porcine (Truie Lactante + Porcelets)",
    recommendedDensityPerM2: 6.0, // 6.0 m² PER MATERNITY PEN
    minDensityPerM2: 5.5,
    maxDensityPerM2: 7.0,
    isAreaPerAnimal: true,
    feedTroughCmPerHead: 50,
    drinkersPer100Head: 20,
    optimalTemperatureC: "Truie : 18°C / Nid Porcelets : 32°C (Lampes Infrarouge)",
    ventilationGuideline: "Zone de confort thermique différenciée (Lampes + barres anti-écrasement).",
    notes: "Espace obligatoire avec cage de mise bas réglable et coin chauffé pour porcelets.",
  }
];

export function calculateOptimalBuildingCapacity(
  lengthM: number,
  widthM: number,
  standard: BuildingDensityStandard
) {
  const areaM2 = Math.max(0.1, lengthM * widthM);

  let optimalCount = 0;
  let minCount = 0;
  let maxCount = 0;

  if (standard.isAreaPerAnimal) {
    // Standard defines m² needed PER ANIMAL
    optimalCount = Math.floor(areaM2 / standard.recommendedDensityPerM2);
    minCount = Math.floor(areaM2 / standard.maxDensityPerM2);
    maxCount = Math.floor(areaM2 / standard.minDensityPerM2);
  } else {
    // Standard defines ANIMALS PER m²
    optimalCount = Math.floor(areaM2 * standard.recommendedDensityPerM2);
    minCount = Math.floor(areaM2 * standard.minDensityPerM2);
    maxCount = Math.floor(areaM2 * standard.maxDensityPerM2);
  }

  const feedTroughMetersNeeded = Number(((optimalCount * standard.feedTroughCmPerHead) / 100).toFixed(2));
  const drinkersNeeded = Math.ceil((optimalCount * standard.drinkersPer100Head) / 100);

  return {
    areaM2: Number(areaM2.toFixed(2)),
    optimalCount: Math.max(1, optimalCount),
    minCount: Math.max(1, minCount),
    maxCount: Math.max(1, maxCount),
    feedTroughMetersNeeded,
    drinkersNeeded,
  };
}
