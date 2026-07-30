import {
  UnitCosts,
  CutDetail,
  MonthlyPhaseData,
  YearProjection,
  Employee,
  InfrastructureItem,
  FeedFormula,
  FeedIngredient,
} from "../types";

export const defaultFeedFormulas: FeedFormula[] = [
  {
    id: "formula-croissance",
    name: "Aliment Croissance Volaille Révisé (11 Ingrédients Optimisés)",
    category: "Aviculture",
    targetUnitCostKey: "alimentCroissance",
    description: "Formule croissance optimisée selon la fiche technique officielle (Farine de poisson, L-Lysine, DL-Méthionine, Phosphate bicalcique & Carbonate de Ca). Coût: 280,09 FCFA/kg (14 005 FCFA/sac 50kg).",
    ingredients: [
      { id: "ing-c1", name: "Maïs jaune", pricePerKg: 170, incorporationPercent: 43.7 },
      { id: "ing-c2", name: "Tourteau de soja", pricePerKg: 350, incorporationPercent: 35.0 },
      { id: "ing-c3", name: "Blé", pricePerKg: 120, incorporationPercent: 12.0 },
      { id: "ing-c4", name: "Farine de poisson (65%)", pricePerKg: 320, incorporationPercent: 4.0 },
      { id: "ing-c5", name: "Huile végétale", pricePerKg: 1000, incorporationPercent: 2.0 },
      { id: "ing-c6", name: "Pré-mix CMV 1%", pricePerKg: 3000, incorporationPercent: 1.0 },
      { id: "ing-c7", name: "Phosphate bicalcique", pricePerKg: 600, incorporationPercent: 1.0 },
      { id: "ing-c8", name: "Carbonate de calcium", pricePerKg: 200, incorporationPercent: 0.8 },
      { id: "ing-c9", name: "Sel de cuisine", pricePerKg: 500, incorporationPercent: 0.3 },
      { id: "ing-c10", name: "L-Lysine", pricePerKg: 2850, incorporationPercent: 0.1 },
      { id: "ing-c11", name: "DL-Méthionine", pricePerKg: 4150, incorporationPercent: 0.1 },
    ],
  },
  {
    id: "formula-finition",
    name: "Aliment Finition Volaille Révisé (11 Ingrédients Optimisés)",
    category: "Aviculture",
    targetUnitCostKey: "alimentFinition",
    description: "Formule finition haute performance pour le poulet de chair (Objectif 2.5 kg). Coût: 301,61 FCFA/kg (15 081 FCFA/sac 50kg).",
    ingredients: [
      { id: "ing-f1", name: "Maïs jaune", pricePerKg: 170, incorporationPercent: 49.0 },
      { id: "ing-f2", name: "Tourteau de soja", pricePerKg: 350, incorporationPercent: 35.0 },
      { id: "ing-f3", name: "Blé", pricePerKg: 120, incorporationPercent: 7.0 },
      { id: "ing-f4", name: "Farine de poisson (65%)", pricePerKg: 320, incorporationPercent: 2.5 },
      { id: "ing-f5", name: "Huile végétale", pricePerKg: 1000, incorporationPercent: 3.0 },
      { id: "ing-f6", name: "Pré-mix CMV 1%", pricePerKg: 3000, incorporationPercent: 1.0 },
      { id: "ing-f7", name: "Phosphate bicalcique", pricePerKg: 600, incorporationPercent: 0.9 },
      { id: "ing-f8", name: "Carbonate de calcium", pricePerKg: 200, incorporationPercent: 1.0 },
      { id: "ing-f9", name: "Sel de cuisine", pricePerKg: 500, incorporationPercent: 0.3 },
      { id: "ing-f10", name: "L-Lysine", pricePerKg: 2850, incorporationPercent: 0.15 },
      { id: "ing-f11", name: "DL-Méthionine", pricePerKg: 4150, incorporationPercent: 0.15 },
    ],
  },
  {
    id: "formula-predemarrage",
    name: "Aliment Prédémarrage / Démarrage Poussin",
    category: "Aviculture",
    targetUnitCostKey: "alimentPredemarrage",
    description: "Formule haute protéine et digestibilité pour les poussins de 0 à 10 jours.",
    ingredients: [
      { id: "ing-20", name: "Maïs jaune sélectionné", pricePerKg: 170, incorporationPercent: 50 },
      { id: "ing-21", name: "Tourteau de Soja (48%)", pricePerKg: 350, incorporationPercent: 32 },
      { id: "ing-22", name: "Farine de Poisson (65%)", pricePerKg: 320, incorporationPercent: 8 },
      { id: "ing-23", name: "Pré-mix Poussin / CMV 5%", pricePerKg: 3000, incorporationPercent: 5 },
      { id: "ing-24", name: "Huile végétale", pricePerKg: 1000, incorporationPercent: 2 },
      { id: "ing-25", name: "Phosphate bicalcique, Carbonate & Sel", pricePerKg: 500, incorporationPercent: 3 },
    ],
  },
  {
    id: "formula-porcin-engraissement",
    name: "Aliment Porcin Croissance / Engraissement",
    category: "Porciculture",
    description: "Ration d'engraissement intensif pour porcs charcutiers de 25 kg à 100 kg.",
    ingredients: [
      { id: "ing-30", name: "Maïs jaune", pricePerKg: 170, incorporationPercent: 45 },
      { id: "ing-31", name: "Son de Riz / Blé", pricePerKg: 120, incorporationPercent: 30 },
      { id: "ing-32", name: "Tourteau de Soja", pricePerKg: 350, incorporationPercent: 18 },
      { id: "ing-33", name: "Farine de Poisson (65%)", pricePerKg: 320, incorporationPercent: 5 },
      { id: "ing-34", name: "CMV Porc + Carbonate + Sel", pricePerKg: 800, incorporationPercent: 2 },
    ],
  },
  {
    id: "formula-porcin-reproduction",
    name: "Aliment Porcin Reproduction (Truies Gestantes/Lactantes)",
    category: "Porciculture",
    description: "Ration spécifique enrichie en minéraux et fibres pour reproducteurs.",
    ingredients: [
      { id: "ing-40", name: "Maïs jaune", pricePerKg: 170, incorporationPercent: 40 },
      { id: "ing-41", name: "Blé / Son", pricePerKg: 120, incorporationPercent: 38 },
      { id: "ing-42", name: "Tourteau de Soja", pricePerKg: 350, incorporationPercent: 16 },
      { id: "ing-43", name: "Farine de Poisson", pricePerKg: 320, incorporationPercent: 3 },
      { id: "ing-44", name: "CMV Truie Gestante / Lactante", pricePerKg: 1200, incorporationPercent: 3 },
    ],
  },
];

export function calculateFormulaCostPerKg(ingredients: FeedIngredient[]): number {
  const rawCost = ingredients.reduce(
    (sum, ing) => sum + (ing.pricePerKg * ing.incorporationPercent) / 100,
    0
  );
  return Number(rawCost.toFixed(2));
}

export function calculateTotalIncorporation(ingredients: FeedIngredient[]): number {
  const total = ingredients.reduce((sum, ing) => sum + ing.incorporationPercent, 0);
  return Number(total.toFixed(2));
}

export const defaultUnitCosts: UnitCosts = {
  poussinJour: 600,
  poulet1_7kg: 2200,
  alimentPredemarrage: 600,
  alimentCroissance: 280.09,
  alimentFinition: 301.61,
  porcelet: 25000,
  truieReproductrice: 180000,
  verrat: 200000,
  porcCharcutierPrixKg: 2100,
  porcCharcutierPoidsCarcasse: 75,
  isAvicoleAcquired: false,
  isPorcinAcquired: false,
  loyerMensuelAvicole: 50000,
  loyerMensuelPorcin: 20000,
  avanceAvicoleDemarrage: 200000,
};

// Dynamic helper functions for Building Rent Deductions
export function getBuildingRentSavings(unitCosts?: UnitCosts) {
  const isAvicoleAcquired = unitCosts?.isAvicoleAcquired ?? false;
  const isPorcinAcquired = unitCosts?.isPorcinAcquired ?? false;
  const loyerAvicole = unitCosts?.loyerMensuelAvicole ?? 50000;
  const loyerPorcin = unitCosts?.loyerMensuelPorcin ?? 20000;
  const avanceAvicole = unitCosts?.avanceAvicoleDemarrage ?? 200000;

  const monthlyAvicoleRentSaved = isAvicoleAcquired ? loyerAvicole : 0;
  const monthlyPorcinRentSaved = isPorcinAcquired ? loyerPorcin : 0;
  const totalMonthlyRentSaved = monthlyAvicoleRentSaved + monthlyPorcinRentSaved;
  const totalYearlyRentSaved = totalMonthlyRentSaved * 12;
  const startupAdvanceSaved = isAvicoleAcquired ? avanceAvicole : 0;

  return {
    isAvicoleAcquired,
    isPorcinAcquired,
    monthlyAvicoleRentSaved,
    monthlyPorcinRentSaved,
    totalMonthlyRentSaved,
    totalYearlyRentSaved,
    startupAdvanceSaved,
  };
}

export function getStartupInvestmentMois1(unitCosts?: UnitCosts) {
  const isAvicoleAcquired = unitCosts?.isAvicoleAcquired ?? false;
  const pouletPrix = unitCosts?.poulet1_7kg ?? 2200;
  const avanceDemarrage = unitCosts?.avanceAvicoleDemarrage ?? 200000;

  const avanceBatimentAvicole = isAvicoleAcquired ? 0 : avanceDemarrage;
  const achat150Poulets = 150 * pouletPrix;
  const alimentFinition = Math.round(150 * 1.05 * (unitCosts?.alimentFinition ?? 264.66));
  const depensesDiverses = 15000;
  const totalFCFA = achat150Poulets + avanceBatimentAvicole + alimentFinition + depensesDiverses;

  return {
    achat150Poulets,
    avanceBatimentAvicole,
    alimentFinition,
    depensesDiverses,
    totalFCFA,
  };
}

export function getMonthlyInitialPhaseData(unitCosts?: UnitCosts): MonthlyPhaseData[] {
  const savings = getBuildingRentSavings(unitCosts);

  return monthlyInitialPhaseData.map((m) => {
    let rentDeduction = savings.totalMonthlyRentSaved;
    if (m.monthId === "M1") {
      rentDeduction += savings.startupAdvanceSaved;
    }

    const coutTotal = Math.max(0, m.coutTotal - rentDeduction);
    const beneficeNet = m.caAvicole - coutTotal;

    return {
      ...m,
      coutTotal,
      beneficeNet,
    };
  });
}

export function getYearlyProjectionsData(unitCosts?: UnitCosts): YearProjection[] {
  const savings = getBuildingRentSavings(unitCosts);
  const yearlyRentDeduction = savings.totalYearlyRentSaved;

  return yearlyProjectionsData.map((y) => {
    const chargesStructure = Math.max(0, y.chargesStructure - yearlyRentDeduction);
    const beneficeNet = y.caTotal - y.chargesOperationnelles - chargesStructure;

    return {
      ...y,
      chargesStructure,
      beneficeNet,
    };
  });
}

export function getInfrastructures(unitCosts?: UnitCosts): InfrastructureItem[] {
  const isAvicoleAcquired = unitCosts?.isAvicoleAcquired ?? false;
  const isPorcinAcquired = unitCosts?.isPorcinAcquired ?? false;
  const loyerAvicole = unitCosts?.loyerMensuelAvicole ?? 50000;
  const loyerPorcin = unitCosts?.loyerMensuelPorcin ?? 20000;
  const avanceAvicole = unitCosts?.avanceAvicoleDemarrage ?? 200000;

  return [
    {
      id: "infra-1",
      name: "Bâtiment Avicole Principal",
      type: "Avicole",
      initialCostFCFA: isAvicoleAcquired ? 0 : avanceAvicole,
      monthlyRentFCFA: isAvicoleAcquired ? 0 : loyerAvicole,
      capacity: "Rotation permanente (bandes tous les 10 jours)",
      notes: isAvicoleAcquired
        ? "Bâtiment acquis en propre (Propriétaire). Aucune avance ni frais de location."
        : "Loué avec avance au Mois 1 (50 000 FCFA/mois).",
    },
    {
      id: "infra-2",
      name: "Porcherie d'Engraissement (80 têtes)",
      type: "Porcin",
      initialCostFCFA: 0,
      monthlyRentFCFA: isPorcinAcquired ? 0 : loyerPorcin,
      capacity: "80 têtes d'engraissement initial",
      notes: isPorcinAcquired
        ? "Porcherie acquise en propre (Propriétaire). Frais de location annulés."
        : "Location initiale (20 000 FCFA/mois). Aménagements spécifiques prévus 1 mois avant acquisitions.",
    },
    {
      id: "infra-3",
      name: "Bâtiments Reproducteurs Porcins",
      type: "Porcin",
      initialCostFCFA: 1500000,
      monthlyRentFCFA: 0,
      capacity: "Loge truies & verrats",
      notes: "Construction/aménagement 1 mois avant chaque vague d'acquisition de reproducteurs (Propriété).",
    },
  ];
}

// 70% découpe sur un poulet vif de 2.2kg (carcasse nette ~1.65 kg)
export const defaultCutBreakdown: CutDetail[] = [
  {
    id: "escalopes",
    name: "Escalopes",
    sharePercent: 25,
    weightGrams: 412.5,
    pricePerKgOrUnit: 3000,
    unitType: "kg",
    revenueFCFA: 1237.5,
  },
  {
    id: "cuisses",
    name: "Cuisses",
    sharePercent: 32,
    weightGrams: 528.0,
    pricePerKgOrUnit: 2200,
    unitType: "kg",
    revenueFCFA: 1161.6,
  },
  {
    id: "ailes",
    name: "Ailes",
    sharePercent: 12,
    weightGrams: 198.0,
    pricePerKgOrUnit: 2700,
    unitType: "kg",
    revenueFCFA: 534.6,
  },
  {
    id: "tete_cou_dos",
    name: "Tête - Cou - Dos",
    sharePercent: 18,
    weightGrams: 297.0,
    pricePerKgOrUnit: 1000,
    unitType: "kg",
    revenueFCFA: 297.0,
  },
  {
    id: "pattes",
    name: "Pattes",
    sharePercent: 4,
    weightGrams: 66.0,
    pricePerKgOrUnit: 150, // 1 paire = 150 FCFA
    unitType: "paire",
    revenueFCFA: 150.0,
  },
  {
    id: "gesier",
    name: "Gésier",
    sharePercent: 3,
    weightGrams: 49.5,
    pricePerKgOrUnit: 100, // 1 unité = 100 FCFA
    unitType: "unite",
    revenueFCFA: 100.0,
  },
  {
    id: "foie",
    name: "Foie",
    sharePercent: 6,
    weightGrams: 99.0,
    pricePerKgOrUnit: 1000,
    unitType: "kg",
    revenueFCFA: 99.0,
  },
];

export const totalDecoupeRevenue = defaultCutBreakdown.reduce(
  (sum, item) => sum + item.revenueFCFA,
  0
); // = 3,579.7 FCFA

export const pouletEntierRevenue = 3500; // FCFA

// Recette moyenne par poulet : égale au total de la somme des prix des différentes découpes (3 580 FCFA)
export const weightedAveragePouletRevenue = Math.round(totalDecoupeRevenue); // 3 580 FCFA

export const startupInvestmentMois1 = {
  achat150Poulets: 330000, // 150 * 2 200
  avanceBatimentAvicole: 200000,
  alimentFinition: 41699, // 150 * 1.05 kg * 264.66
  depensesDiverses: 15000,
  totalFCFA: 586699,
};

export const monthlyInitialPhaseData: MonthlyPhaseData[] = [
  {
    monthId: "M1",
    monthName: "Août",
    year: 2026,
    bandes10j: 150, // 150 (+150 poulets 1,7kg)
    poussins: 450,
    vendus95: 427.5,
    caAvicole: 1624500,
    coutTotal: 950000,
    beneficeNet: 674500,
    actionsPorcines: "Achat 10 porcelets (250k FCFA) financé par l'aviculture.",
  },
  {
    monthId: "M2",
    monthName: "Septembre",
    year: 2026,
    bandes10j: 200,
    poussins: 600,
    vendus95: 570.0,
    caAvicole: 2166000,
    coutTotal: 1176500,
    beneficeNet: 989500,
    actionsPorcines: "Achat 20 porcelets (500k FCFA). Total 30 porcs. Embauche 1er porcher.",
  },
  {
    monthId: "M3",
    monthName: "Octobre",
    year: 2026,
    bandes10j: 250,
    poussins: 750,
    vendus95: 712.5,
    caAvicole: 2707500,
    coutTotal: 1403000,
    beneficeNet: 1304500,
    actionsPorcines: "Suivi continu de l'engraissement des 30 porcs.",
  },
  {
    monthId: "M4",
    monthName: "Novembre",
    year: 2026,
    bandes10j: 300,
    poussins: 900,
    vendus95: 855.0,
    caAvicole: 3249000,
    coutTotal: 1629500,
    beneficeNet: 1619500,
    actionsPorcines: "Préparation de la grande vente des porcs de décembre.",
  },
  {
    monthId: "M5",
    monthName: "Décembre",
    year: 2026,
    bandes10j: 400,
    poussins: 1200,
    vendus95: 1140.0,
    caAvicole: 4332000,
    coutTotal: 2153000,
    beneficeNet: 2179000,
    actionsPorcines: "Vente de 30 porcs (10 porcs fin août à 70kg = 1,47M FCFA + 20 porcs fin sept. à 60kg = 2,52M FCFA). CA Total Porcin = 3 990 000 FCFA.",
  },
];

export const yearlyProjectionsData: YearProjection[] = [
  {
    year: 2027,
    caAvicole: 71478000,
    caPorcin: 37800000,
    caTotal: 109278000,
    chargesOperationnelles: 48500000,
    chargesStructure: 8400000,
    beneficeNet: 52378000,
  },
  {
    year: 2028,
    caAvicole: 75051900,
    caPorcin: 56700000,
    caTotal: 131751900,
    chargesOperationnelles: 55000000,
    chargesStructure: 9600000,
    beneficeNet: 67151900,
  },
  {
    year: 2029,
    caAvicole: 78804495,
    caPorcin: 68040000,
    caTotal: 146844495,
    chargesOperationnelles: 60000000,
    chargesStructure: 10200000,
    beneficeNet: 76644495,
  },
  {
    year: 2030,
    caAvicole: 82744720,
    caPorcin: 75600000,
    caTotal: 158344720,
    chargesOperationnelles: 64000000,
    chargesStructure: 10800000,
    beneficeNet: 83544720,
  },
  {
    year: 2031,
    caAvicole: 86881956,
    caPorcin: 83160000,
    caTotal: 170041956,
    chargesOperationnelles: 69000000,
    chargesStructure: 11500000,
    beneficeNet: 89541956,
  },
];

export const initialEmployees: Employee[] = [
  {
    id: "emp-vol-1",
    fullName: "Kouassi Jean-Baptiste",
    role: "Responsable Volailler",
    agentType: "Technicien Éleveur Avicole Senior",
    sector: "Aviculture",
    sectorModule: "Aviculture",
    startDate: "Août 2026",
    monthlySalaryFCFA: 75000,
    monthlyBonusFCFA: 15000,
    assignedTasks: [
      "Distribution ration démarrage & finition poussinière",
      "Contrôle température et ventilation des bâtiments",
      "Administration des vaccins HB1, Newcastle & Gumboro",
      "Suivi des pesées hebdomadaires et calcul FCR"
    ],
    contactPhone: "+225 07 48 12 34 56",
    status: "Actif",
    performanceScore: 96,
    notes: "Spécialiste de la conduite des poulets de chair Cobb 500."
  },
  {
    id: "emp-porc-1",
    fullName: "Koffi Emmanuel",
    role: "Responsable Porcherie & Maternité",
    agentType: "Conducteur Maternité & Élevage Porcin",
    sector: "Porciculture",
    sectorModule: "Maternité & Élevage",
    startDate: "Septembre 2026",
    monthlySalaryFCFA: 70000,
    monthlyBonusFCFA: 20000,
    assignedTasks: [
      "Détection des chaleurs et organisation des saillies",
      "Surveillance continue des mises bas et soins aux porcelets",
      "Injection de fer Dextran J+3 et coupe des dents",
      "Rationnement spécifique des truies lactantes"
    ],
    contactPhone: "+225 05 89 23 45 67",
    status: "Actif",
    performanceScore: 94,
    notes: "Excellente maîtrise du taux de survie des porcelets à la naissance (12.5 vivants/portée)."
  },
  {
    id: "emp-alim-1",
    fullName: "Yao N'Guessan",
    role: "Responsable Fabrique Aliment",
    agentType: "Meunier & Animateur de Formulation",
    sector: "Fabrique d'Aliments",
    sectorModule: "Fabrique d'Aliments",
    startDate: "Août 2026",
    monthlySalaryFCFA: 65000,
    monthlyBonusFCFA: 10000,
    assignedTasks: [
      "Broyage et concassage du maïs jaune sélectionné",
      "Incorporation exacte des CMV, soja et farine de poisson",
      "Contrôle qualité des mélanges et densité des sacs 50kg",
      "Gestion des stocks de matières premières et approvisionnement"
    ],
    contactPhone: "+225 01 23 45 67 89",
    status: "Actif",
    performanceScore: 92,
    notes: "Assure un coût moyen de fabrication inférieur à 265 FCFA/kg."
  },
  {
    id: "emp-vet-1",
    fullName: "Dr. Touré Ibrahim",
    role: "Vétérinaire & Hygiéniste",
    agentType: "Doctorant Vétérinaire & Conseil Biosécurité",
    sector: "Hygiène & Sanitaire",
    sectorModule: "Hygiène & Sanitaire",
    startDate: "Juillet 2026",
    monthlySalaryFCFA: 120000,
    monthlyBonusFCFA: 30000,
    assignedTasks: [
      "Audits de biosécurité et vérification des pédiluves",
      "Planification des traitements vermifuges & antiparasitaires",
      "Nécropsie et analyses des causes de mortalité",
      "Délivrance des certificats sanitaires pour la vente"
    ],
    contactPhone: "+225 07 09 87 65 43",
    status: "Actif",
    performanceScore: 98,
    notes: "Supervise le protocole sanitaire sur les sites de Bingerville et Bassam."
  },
  {
    id: "emp-porc-2",
    fullName: "Bamba Lassina",
    role: "Deuxième Porcher (Engraissement)",
    agentType: "Technicien Suivi Engraissement",
    sector: "Porciculture",
    sectorModule: "Porciculture",
    startDate: "Mars 2027",
    monthlySalaryFCFA: 60000,
    monthlyBonusFCFA: 10000,
    assignedTasks: [
      "Lavage quotidien des loges d'engraissement à haute pression",
      "Pesaing mensuel des bandes en croissance",
      "Surveillance de la consommation d'eau et d'aliment"
    ],
    contactPhone: "+225 05 11 22 33 44",
    status: "Actif",
    performanceScore: 90,
    notes: "Affecté au bâtiment d'engraissement B3."
  },
  {
    id: "emp-com-1",
    fullName: "Sékou Camara",
    role: "Commercial & Livreur Pro",
    agentType: "Chauffeur Livreur & Commercial Terrain",
    sector: "Administration & Ventes",
    sectorModule: "Administration & Ventes",
    startDate: "Août 2026",
    monthlySalaryFCFA: 80000,
    monthlyBonusFCFA: 25000,
    assignedTasks: [
      "Livraison des poulets vivants et carcasses chez les restaurateurs",
      "Prospections de nouveaux grossistes sur Abidjan Nord & Cocody",
      "Encaissement Wave / Cash et remise des bordereaux de vente"
    ],
    contactPhone: "+225 07 66 77 88 99",
    status: "Actif",
    performanceScore: 95,
    notes: "A atteint 110% de l'objectif mensuel de vente de poulets au M1."
  }
];

export const initialInfrastructures: InfrastructureItem[] = [
  {
    id: "infra-1",
    name: "Bâtiment Avicole Principal",
    type: "Avicole",
    initialCostFCFA: 200000, // Avance mois 1
    monthlyRentFCFA: 50000, // Loyer/entretien
    capacity: "Rotation permanente (bandes tous les 10 jours)",
    notes: "Loué ou construit avec avance au Mois 1.",
  },
  {
    id: "infra-2",
    name: "Porcherie d'Engraissement (80 têtes)",
    type: "Porcin",
    initialCostFCFA: 0,
    monthlyRentFCFA: 20000,
    capacity: "80 têtes d'engraissement initial",
    notes: "Location initiale. Aménagements spécifiques prévus 1 mois avant acquisitions.",
  },
  {
    id: "infra-3",
    name: "Bâtiments Reproducteurs Porcins",
    type: "Porcin",
    initialCostFCFA: 1500000,
    monthlyRentFCFA: 0,
    capacity: "Loge truies & verrats",
    notes: "Construction/aménagement 1 mois avant chaque vague d'acquisition de reproducteurs.",
  },
];
