import { VaccineSchedule, DailyTask } from "../types";

// Helper to generate ISO date strings relative to today for accurate dynamic J-5 calculation
const getFutureDate = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
};

const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

// Initial Vaccination Records for Active Batches
export const defaultVaccineSchedules: VaccineSchedule[] = [
  {
    id: "vac-av-1",
    batchName: "Bande Poulets #1 - Bâtiment A",
    species: "Aviculture",
    vaccineName: "HB1 + H120 (Newcastle & Bronchite)",
    diseaseTarget: "Maladie de Newcastle & Bronchite Infectieuse",
    scheduledAgeDaysOrWeeks: 7,
    scheduledAgeLabel: "Jour 7",
    scheduledDate: getPastDate(21), // Completed 21 days ago
    administrationRoute: "Eau de boisson",
    dosageNotes: "1000 doses diluées dans 10L d'eau fraiche sans chlore + Lait écumé 2.5g/L.",
    status: "Réalisé",
    completedDate: getPastDate(21),
    veterinaryNotes: "Vaccination effectuée sans réaction indésirable.",
  },
  {
    id: "vac-av-2",
    batchName: "Bande Poulets #1 - Bâtiment A",
    species: "Aviculture",
    vaccineName: "Gumboro IBD Intermédiaire (Rappel)",
    diseaseTarget: "Maladie de Gumboro (Bursite infectieuse)",
    scheduledAgeDaysOrWeeks: 28,
    scheduledAgeLabel: "Jour 28",
    scheduledDate: getFutureDate(2), // RAPPEL DANS 2 JOURS ! (ALERTE J-5)
    administrationRoute: "Eau de boisson",
    dosageNotes: "Diète hydrique de 2 heures préalable. Stabilisateur de chlore obligatoire.",
    status: "Alerte J-5",
    veterinaryNotes: "Vérifier la propreté des pipettes et la température de l'eau.",
  },
  {
    id: "vac-av-3",
    batchName: "Bande Poulets #2 - Bâtiment B",
    species: "Aviculture",
    vaccineName: "Clon 30 / La Sota (Newcastle Rappel)",
    diseaseTarget: "Maladie de Newcastle (Souche virulente)",
    scheduledAgeDaysOrWeeks: 35,
    scheduledAgeLabel: "Jour 35",
    scheduledDate: getFutureDate(4), // RAPPEL DANS 4 JOURS ! (ALERTE J-5)
    administrationRoute: "Goutte oculaire / Spray",
    dosageNotes: "Pulvérisation fine avec nébuliseur adapté ou goutte dans l'œil.",
    status: "Alerte J-5",
    veterinaryNotes: "Avertir le vétérinaire conseil avant application.",
  },
  {
    id: "vac-porc-1",
    batchName: "Lot Porcs Engraissement #A - Loges 1-4",
    species: "Porciculture",
    vaccineName: "Mycoplasma hyopneumoniae (Pneumonie)",
    diseaseTarget: "Pneumonie Enzootique Porcine",
    scheduledAgeDaysOrWeeks: 4,
    scheduledAgeLabel: "Semaine 4 (Sevrage)",
    scheduledDate: getPastDate(12),
    administrationRoute: "Injection IM / SC",
    dosageNotes: "2 mL par porcelet en intramusculaire au niveau du cou.",
    status: "Réalisé",
    completedDate: getPastDate(12),
    veterinaryNotes: "Injecteur automatique désinfecté.",
  },
  {
    id: "vac-porc-2",
    batchName: "Lot Porcs Engraissement #A - Loges 1-4",
    species: "Porciculture",
    vaccineName: "Parvovirose + Rouget Porcin (Rappel)",
    diseaseTarget: "Rouget du Porc & Parvovirose Reproductive",
    scheduledAgeDaysOrWeeks: 18,
    scheduledAgeLabel: "Semaine 18",
    scheduledDate: getFutureDate(3), // RAPPEL DANS 3 JOURS ! (ALERTE J-5)
    administrationRoute: "Injection IM / SC",
    dosageNotes: "2 mL en IM profonde derrière la base de l'oreille.",
    status: "Alerte J-5",
    veterinaryNotes: "Rappel systématique avant transfert vers la loge de finition.",
  },
  {
    id: "vac-porc-3",
    batchName: "Lot Truies Gestantes & Génisses",
    species: "Porciculture",
    vaccineName: "Colibacillose & Clostridiose Neonatale",
    diseaseTarget: "Diarrhée néonatale des porcelets",
    scheduledAgeDaysOrWeeks: 22,
    scheduledAgeLabel: "Semaine 22 (Pre-Maternité)",
    scheduledDate: getFutureDate(14), // Dans 14 jours
    administrationRoute: "Injection IM / SC",
    dosageNotes: "Vaccination des truies 3 semaines avant la mise bas prévue.",
    status: "Planifié",
    veterinaryNotes: "Protège les porcelets via le colostrum.",
  },
];

// Initial Daily Tasks with Specific Hours & Names
export const defaultDailyTasks: DailyTask[] = [
  {
    id: "task-1",
    taskName: "Inspection Sanitaire & Relevé Mortalité / Température",
    scheduledTime: "06:00",
    species: "Global",
    batchOrLocation: "Tous Bâtiments (Volailles & Porcs)",
    category: "Relevés & Pesées",
    assignedTo: "Kouassi (Technicien Chef)",
    recurrence: "Quotidien (Matin)",
    isCompletedToday: true,
    completedAt: "06:15",
    notes: "Température à 28°C en poussinière, RAS sur l'effectif.",
  },
  {
    id: "task-2",
    taskName: "Distribution Aliment Pré-démarrage & Démarrage (1ère Ration)",
    scheduledTime: "06:30",
    species: "Aviculture",
    batchOrLocation: "Bâtiment A (1000 sujets)",
    category: "Alimentation",
    assignedTo: "Yao (Soigneur Volailles)",
    recurrence: "Quotidien (2x/jour)",
    isCompletedToday: true,
    completedAt: "06:45",
    notes: "110 kg d'aliment servi dans les trémies.",
  },
  {
    id: "task-3",
    taskName: "Nettoyage & Purge des Pipettes d'Eau + Traitement Acidifiant",
    scheduledTime: "08:00",
    species: "Aviculture",
    batchOrLocation: "Bâtiment B",
    category: "Sanitaire & Hygiène",
    assignedTo: "Yao (Soigneur Volailles)",
    recurrence: "Quotidien (Matin)",
    isCompletedToday: false,
    notes: "Vérifier le niveau d'acidifiant organique dans la cuve mère.",
  },
  {
    id: "task-4",
    taskName: "Alimentation Truies & Porcelets + Soin des Nombrils",
    scheduledTime: "08:30",
    species: "Porciculture",
    batchOrLocation: "Maternité Porcine (Loges 1-4)",
    category: "Alimentation",
    assignedTo: "Soro (Responsable Porciculture)",
    recurrence: "Quotidien (2x/jour)",
    isCompletedToday: true,
    completedAt: "08:40",
    notes: "Distribution de la ration lactante enrichie + spray antiseptique.",
  },
  {
    id: "task-5",
    taskName: "Préparation Matériel & Eau Neutre pour Vaccin Gumboro J-5",
    scheduledTime: "11:00",
    species: "Aviculture",
    batchOrLocation: "Bâtiment A",
    category: "Sanitaire & Hygiène",
    assignedTo: "Kouassi (Technicien Chef)",
    recurrence: "Ponctuel",
    isCompletedToday: false,
    notes: "Purger l'eau chlorée et préparer le lait écumé en poudre.",
  },
  {
    id: "task-6",
    taskName: "Distribution Aliment Croissance / Finition (2ème Ration)",
    scheduledTime: "16:00",
    species: "Global",
    batchOrLocation: "Ferme Gloire Ivoire (Tous Lots)",
    category: "Alimentation",
    assignedTo: "Équipe du Soir (Yao & Soro)",
    recurrence: "Quotidien (2x/jour)",
    isCompletedToday: false,
    notes: "S'assurer que toutes les auges et trémies sont approvisionnées.",
  },
  {
    id: "task-7",
    taskName: "Lavage & Racle des Liquides en Souille / Loges Porcines",
    scheduledTime: "17:00",
    species: "Porciculture",
    batchOrLocation: "Loges Engraissement 1 à 6",
    category: "Sanitaire & Hygiène",
    assignedTo: "Soro (Responsable Porciculture)",
    recurrence: "Quotidien (Matin)",
    isCompletedToday: false,
    notes: "Désinfection au grésyl 2%.",
  },
];
