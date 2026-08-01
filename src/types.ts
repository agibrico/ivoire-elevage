export interface FeedIngredient {
  id: string;
  name: string;
  pricePerKg: number; // FCFA / kg
  incorporationPercent: number; // % in mix (e.g. 55 = 55%)
}

export interface FeedFormula {
  id: string;
  name: string;
  category: "Aviculture" | "Porciculture";
  targetUnitCostKey?: keyof UnitCosts;
  description?: string;
  ingredients: FeedIngredient[];
}

export type ApkInstallMode = "ADMINISTRATION_GENERALE" | "AVIVOIRE" | "PORCIVOIRE";

export type ActiveTab =
  | "dashboard"
  | "financial_dashboard"
  | "suppliers_management"
  | "aviculture"
  | "porciculture"
  | "reproduction_maternity"
  | "farm_census"
  | "monthly"
  | "financials5y"
  | "unitcosts"
  | "hrinfra"
  | "simulator"
  | "sales"
  | "feedmode"
  | "tasks_health"
  | "audit_log"
  | "ai_studio";

export interface CustomApkFeatureField {
  id: string;
  label: string;
  type: "number" | "text" | "select" | "checkbox";
  defaultValue?: any;
  options?: string[];
  unit?: string;
  helpText?: string;
}

export interface CustomApkFeatureCalculatedOutput {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  status?: "OK" | "WARNING" | "CRITICAL" | "INFO";
}

export interface ModuleWorkerTask {
  id: string;
  title: string;
  assignedWorker: string;
  workerRole?: string;
  timeOrSchedule: string;
  priority: "Critique" | "Urgente" | "Normale" | "Basse";
  isCompleted: boolean;
  completedAt?: string;
  completedByWorker?: string;
  instructions?: string;
}

export interface CustomApkFeature {
  id: string;
  title: string;
  category: "Aviculture" | "Porciculture" | "Gestion & Finance" | "Santé & Biosécurité" | "Logistique & Ventes";
  iconName: "Calculator" | "ClipboardList" | "HeartPulse" | "Boxes" | "TrendingUp" | "Zap" | "Sparkles" | "Layers" | "ShieldCheck";
  description: string;
  targetApkMode?: ApkInstallMode | "TOUS";
  createdAt: string;
  createdBy: string;
  fields: CustomApkFeatureField[];
  calculationLogicDescription: string;
  defaultOutputs: CustomApkFeatureCalculatedOutput[];
  recommendations: string[];
  workerTasks?: ModuleWorkerTask[];
  isInstalled: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  user: string; // ex: "Gilles (Gestionnaire)", "Kouassi (Technicien)"
  category: "Changement de Prix" | "Mouvement de Stock" | "Paramètre Financier" | "Configuration Alertes" | "Ajustement Sanitaire" | "Observation Terrain";
  targetItem: string; // ex: "Aliment Croissance Poulet", "Stock Maïs Jaune"
  previousValue: string; // ex: "260 FCFA/kg"
  newValue: string; // ex: "266.56 FCFA/kg"
  impactNote?: string;
}

export interface EmailAlertConfig {
  enabled: boolean;
  recipientEmails: string[];
  alertCriticalStock: boolean;
  stockThresholdKg: number;
  alertHighMortality: boolean;
  mortalityThresholdPct: number;
  alertPaymentOverdue: boolean;
  sendDailyDigest: boolean;
  smtpServerStatus: "Connecté" | "En Attente" | "Erreur";
}

export interface VaccineSchedule {
  id: string;
  batchName: string;
  species: "Aviculture" | "Porciculture";
  vaccineName: string; // ex: "HB1 + H120", "Gumboro Intermédiaire", "Parvo + Rouget"
  diseaseTarget: string; // ex: "Newcastle & Bronchite", "Peste Porcine / Rouget"
  scheduledAgeDaysOrWeeks: number;
  scheduledAgeLabel: string;
  scheduledDate: string; // YYYY-MM-DD
  administrationRoute: "Eau de boisson" | "Injection IM / SC" | "Goutte oculaire / Spray" | "Trempage / Inhalation";
  dosageNotes: string;
  status: "Réalisé" | "Planifié" | "Alerte J-5" | "En retard";
  completedDate?: string;
  veterinaryNotes?: string;
  recallDate?: string; // YYYY-MM-DD pour les rappels automatiques
  recallStatus?: "Rappel Programmé" | "Rappel Effectué" | "Rappel Non Requis";
  hasRecall?: boolean;
}

export interface DailyTask {
  id: string;
  taskName: string;
  scheduledTime: string; // HH:MM ex: "06:30"
  species: "Aviculture" | "Porciculture" | "Global";
  batchOrLocation: string; // ex: "Bâtiment Volailles A", "Maternité Porcine"
  category: "Alimentation" | "Sanitaire & Hygiène" | "Relevés & Pesées" | "Maintenance & Matériel";
  assignedTo: string; // ex: "Kouassi (Technicien)", "Dr. Yao"
  recurrence: "Quotidien (2x/jour)" | "Quotidien (Matin)" | "Hebdomadaire" | "Ponctuel";
  isCompletedToday: boolean;
  completedAt?: string;
  notes?: string;
  aiPriorityRank?: number;
  aiPriorityTag?: "CRITIQUE SANITAIRE" | "HAUTE PRIORITÉ" | "ROUTINE OPTIMISÉE" | "NORMAL";
  aiReasoning?: string;
}

export interface FeedingStandard {
  ageDaysOrWeeks: number; // Age in days (Aviculture) or weeks (Porciculture)
  ageLabel: string; // e.g. "Jour 7 (S1)" or "Semaine 8"
  species: "Aviculture" | "Porciculture";
  phase: "Pré-démarrage" | "Démarrage" | "Croissance" | "Finition" | "Gestante" | "Lactante";
  expectedWeightGrams: number; // Standard target weight
  recommendedDailyFeedGrams: number; // g / subject / day
  cumulativeFeedKg: number; // Cumulative kg consumed per animal
  targetFCR: number; // Target Feed Conversion Ratio (IC)
  proteinPercent: number; // % Proteine brute (PB)
  energyKcal: number; // Energie métabolisable (EM kcal/kg)
}

export interface BatchFeedingRecord {
  id: string;
  batchName: string; // ex: "Bande Volaille #3 - Bâtiment A"
  species: "Aviculture" | "Porciculture";
  breed: string; // ex: "Cobb 500" or "Porc Hybride LW"
  headCount: number; // Number of animals
  ageDaysOrWeeks: number; // Current age (days for birds, weeks for pigs)
  ageLabel: string;
  actualWeightGrams: number; // Poids réel mesuré (g)
  expectedWeightGrams: number; // Poids prévu par la norme (g)
  actualDailyFeedGrams: number; // Ration réelle donnée (g/sujet/jour)
  expectedDailyFeedGrams: number; // Ration recommandée (g/sujet/jour)
  currentFeedType: "Pré-démarrage" | "Démarrage" | "Croissance" | "Finition" | "Gestante" | "Lactante";
  feedingRegimen: "À volonté (Ad libitum)" | "Rationné (Strict)" | "Séquentiel" | "Rattrapage Compensateur";
  waterConsumptionLitersPerHead: number; // Liter water/head/day
  lastWeighingDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface WeightFeedRule {
  id: string;
  species: "Aviculture" | "Porciculture";
  minWeightGrams: number; // e.g. 0
  maxWeightGrams: number; // e.g. 8000 (8 kg)
  feedTypeName: string; // e.g. "Aliment Porcelet Sous-Mère & Prestarter"
  feedCategoryPhase: "Pré-démarrage" | "Démarrage" | "Croissance" | "Finition" | "Gestante" | "Lactante";
  recommendedDailyFeedGrams: number; // g / subject / day
  proteinPercent: number; // % PB
  energyKcal: number; // EM kcal/kg
  presentation: "Granulé Laitier 2mm" | "Granulé 2.5mm" | "Miette" | "Poudre / Farine" | "Granulé 4mm";
  description: string;
  transitionInstructions: string;
}

export interface LotWeighingSample {
  id: string;
  subjectLabel: string;
  weightGrams: number;
}

export interface AIDecisionAdvice {
  diagnosis: string; // Diagnostic du retard ou de la surcroissance
  growthGapPercent: number; // % de différence (ex: -12.5% ou +5%)
  fcrEstimate: number; // Indice de consommation
  recommendedFeedType: string; // Quel type d'aliment passer
  recommendedDailyRationGrams: number; // Nouvelle ration préconisée
  recommendedRegimen: string; // Mode d'alimentation préconisé
  nutritionalAdjustments: string[]; // Liste de correctifs (ex: boost protéine +2%, vermifuge, rationnement)
  actionPlan: string; // Plan d'action détaillé pas-à-pas
}

export interface Client {
  id: string;
  name: string;
  type: "Restaurateur" | "Grossiste" | "Particulier" | "Supermarché" | "Boucherie" | "Hôtel / Traiteur";
  phone: string;
  email?: string;
  city: string; // ex: Abidjan, Yamoussoukro, Bouaké, San Pedro
  totalSpent: number; // FCFA cumulative purchases
  creditBalance: number; // FCFA unpaid invoices
  preferredCategory?: string; // ex: "Poulets vivants", "Carcasses Porc", "Découpes Volaille"
  status?: "Actif" | "VIP" | "Nouveau" | "Inactif";
  rating?: number; // 1 to 5 stars
  notes?: string;
  lastOrderDate?: string; // YYYY-MM-DD
  daysSinceLastOrder?: number; // e.g. 38 days
}

export interface MonthlyTargetGoal {
  monthIndex: number; // 1 to 12
  monthName: string; // "Janvier", "Février", etc.
  targetFCFA: number;
  actualFCFA: number;
  notes?: string;
}

export interface AnnualSalesGoal {
  year: number; // ex: 2026
  overallTargetFCFA: number; // ex: 50 000 000 FCFA
  monthlyTargets: MonthlyTargetGoal[];
  categoryTargets: {
    category: string;
    targetFCFA: number;
    actualFCFA: number;
  }[];
  aiAdviceHistory?: {
    date: string;
    summary: string;
  }[];
}

export interface SalesAgent {
  id: string;
  name: string;
  phone: string;
  zone: string; // ex: "Abidjan Nord - Cocody", "Yamoussoukro & Centre"
  commissionRatePercent: number; // ex: 3%
  monthlyTargetFCFA: number; // ex: 2 000 000 FCFA
  achievedSalesFCFA: number; // FCFA total sales done by this agent
}

export interface CutProduct {
  id: string;
  module: "Aviculture" | "Porciculture";
  name: string; // ex: "Escalope de Poulet", "Côtelette de Porc"
  category: "Poulet Entier" | "Porc Entier" | "Porcelet" | "Découpe Volaille" | "Découpe Porc" | "Saucisse / Charcuterie";
  unitPriceFCFA: number; // FCFA per unit or kg
  unitType: "kg" | "unité" | "carton 10kg" | "barquette";
  stockQty: number;
  yieldInfo?: string; // ex: "0.7 kg / poulet de 2.2 kg"
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  category: "Poulet Entier" | "Porc Entier" | "Porcelet" | "Découpe Volaille" | "Découpe Porc" | "Saucisse / Charcuterie";
  quantity: number;
  unitPriceFCFA: number;
  totalPriceFCFA: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNumber: string; // ex: "FAC-2026-001"
  date: string; // YYYY-MM-DD
  module: "Aviculture" | "Porciculture" | "Mixte";
  clientId: string;
  clientName: string;
  clientPhone: string;
  agentId?: string;
  agentName?: string;
  items: SaleItem[];
  totalAmountFCFA: number;
  paidAmountFCFA: number;
  paymentMethod: "Espèces (Cash)" | "Wave" | "Orange Money" | "MTN MoMo" | "Chèque" | "Virement Bancaire";
  paymentStatus: "Payé" | "Partiel" | "En attente";
  notes?: string;
}

export interface UnitCosts {
  poussinJour?: number; // 600 FCFA
  chickPrice?: number; // 600 FCFA
  poulet1_7kg?: number; // 2200 FCFA
  alimentPredemarrage?: number; // 600 FCFA/kg
  alimentCroissance?: number; // 266.56 FCFA/kg
  alimentFinition?: number; // 264.66 FCFA/kg
  porcelet?: number; // 25000 FCFA
  truieReproductrice?: number; // 180000 FCFA
  verrat?: number; // 200000 FCFA
  porcCharcutierPrixKg?: number; // 2100 FCFA/kg
  porcCharcutierPoidsCarcasse?: number; // 75 kg
  
  // Acquisition des Bâtiments (Option pour retirer les frais de location)
  isAvicoleAcquired?: boolean; // Si true, le bâtiment avicole est acquis en propre (0 FCFA location, 0 FCFA avance)
  isPorcinAcquired?: boolean;  // Si true, la porcherie est acquise en propre (0 FCFA location)
  loyerMensuelAvicole?: number; // 50 000 FCFA par défaut
  loyerMensuelPorcin?: number;  // 20 000 FCFA par défaut
  avanceAvicoleDemarrage?: number; // 200 000 FCFA par défaut
  [key: string]: any;
}

export interface CutDetail {
  id: string;
  name: string;
  sharePercent: number; // % of dressed weight
  weightGrams: number;
  pricePerKgOrUnit: number; // FCFA
  unitType: "kg" | "unite" | "paire";
  revenueFCFA: number;
}

export interface MonthlyPhaseData {
  monthId: string; // M1, M2...
  monthName: string; // Août, Septembre...
  year: number; // 2026
  bandes10j: number;
  poussins: number;
  vendus95: number;
  caAvicole: number;
  coutTotal: number;
  beneficeNet: number;
  actionsPorcines: string;
}

export interface YearProjection {
  year: number;
  caAvicole: number;
  caPorcin: number;
  caTotal: number;
  chargesOperationnelles: number;
  chargesStructure: number;
  beneficeNet: number;
}

export type UserRole = "ADMIN_GENERAL" | "RESPONSABLE_DEPT" | "EMPLOYE";

export type DepartmentCategory =
  | "Aviculture"
  | "Porciculture"
  | "Maternité & Élevage"
  | "Fabrique d'Aliments"
  | "Hygiène & Sanitaire"
  | "Administration & Ventes"
  | "Finances & Comptabilité"
  | "Toutes Fermes";

export interface AccreditedTaskOption {
  id: string;
  code: string;
  label: string;
  category: "Gestion & Saisie" | "Validation & Financer" | "Secours & Restauration" | "Administration";
  description: string;
}

export interface WorkerWeeklyTask {
  day: string;
  title: string;
  category: string;
  description: string;
}

export interface WorkerHourlyRoutine {
  timeSlot: string;
  title: string;
  category: string;
  description: string;
}

export interface CustomJobRole {
  id: string;
  role: string;
  title: string;
  subTitle: string;
  description: string;
  iconEmoji: string;
  badgeBg: string;
  borderBg: string;
  speciesName: "Aviculture" | "Porciculture" | "Multi-Spécifique";
  defaultTab: string;
  weeklyTasks: WorkerWeeklyTask[];
  hourlyRoutine: WorkerHourlyRoutine[];
  isCustom: boolean;
}

export interface UserSession {
  id: string;
  username: string; // Login ID or phone or email
  email?: string; // Recognized email e.g. atsegillesbrice@gmail.com
  passwordPlainText?: string; // Encrypted/Local simulation
  fullName: string;
  firstNames?: string;
  phone: string;
  role: UserRole;
  department: DepartmentCategory;
  assignedWorkerRole?: "VOLAILLER" | "PORCHER" | "RESPONSABLE_GLOBAL";
  isActivatedByAdmin: boolean;
  activatedByManagerId?: string;
  activatedByManagerName?: string;
  isPendingAdminValidation?: boolean;
  mustChangePasswordOnFirstLogin: boolean;
  hasChangedPassword: boolean;
  idCardScanUrl?: string; // Captured photo or uploaded CNI
  idCardNumber?: string;
  accreditedTasks: string[]; // Codes of permissions e.g. ["DENSITE_CAMERA", "SAISIE_VENTES", "PRIX_UNITE", "REINITIALISATION"]
  lastLogin?: string;
  status: "Actif" | "En attente validation Admin" | "Inactif" | "Bloqué";
  notes?: string;
}

export interface BuildingDensityStandard {
  id: string;
  species: "Aviculture" | "Porciculture";
  growthStage: string; // e.g. "Poussins (0-3 semaines)", "Poulets de chair Finition", "Pondeuses au sol", "Porcelets Sevrés", "Porcs Charcutiers 50-100kg", "Truies Gestantes", "Truies Lactantes (Loge Maternité)"
  recommendedDensityPerM2: number; // e.g., 10 subjects/m² or 0.4 m²/subject
  minDensityPerM2: number;
  maxDensityPerM2: number;
  isAreaPerAnimal?: boolean; // if true, recommendation is in m² per animal (e.g. 2.5 m² / sow)
  feedTroughCmPerHead: number; // cm linear trough space per head
  drinkersPer100Head: number; // number of drinkers/pipettes per 100 heads
  optimalTemperatureC: string;
  ventilationGuideline: string;
  notes: string;
}

export interface BuildingDensityCalculation {
  id: string;
  buildingName: string;
  lengthMeters: number;
  widthMeters: number;
  totalAreaM2: number;
  species: "Aviculture" | "Porciculture";
  growthStage: string;
  calculatedOptimalCount: number;
  calculatedMinCount: number;
  calculatedMaxCount: number;
  feedTroughMetersNeeded: number;
  drinkersNeeded: number;
  snapshotPhotoUrl?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  firstNames?: string;
  role: string;
  agentType: string; // ex: "Technicien Vétérinaire", "Responsable Maternité", "Ouvrier Avicole", "Meunier Alimentation"
  sector: "Aviculture" | "Porciculture" | "Maternité & Élevage" | "Fabrique d'Aliments" | "Hygiène & Sanitaire" | "Administration & Ventes" | "Toutes Fermes";
  sectorModule: "Aviculture" | "Porciculture" | "Maternité & Élevage" | "Fabrique d'Aliments" | "Hygiène & Sanitaire" | "Administration & Ventes" | "Toutes Fermes";
  startDate: string; // ex: "Août 2026" or "2026-08-01"
  monthlySalaryFCFA: number; // Base salary e.g. 75 000 FCFA
  monthlyBonusFCFA: number; // Primes / Bonus e.g. 15 000 FCFA
  assignedTasks: string[]; // List of specific daily or weekly tasks
  contactPhone?: string;
  status: "Actif" | "Congé" | "Inactif" | "En attente validation Admin";
  performanceScore?: number; // % e.g. 95%
  notes?: string;
  // Auth & Registration enhancements
  username?: string;
  idCardScanUrl?: string; // Photo scan of CNI / Passeport
  idCardNumber?: string;
  accreditedTasks?: string[]; // Codes of permissions/tasks accredited
  userRole?: UserRole;
  isActivatedByAdmin?: boolean;
  isPendingAdminValidation?: boolean;
  activatedByManagerName?: string;
  mustChangePasswordOnFirstLogin?: boolean;
  hasChangedPassword?: boolean;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  type: "Avicole" | "Porcin";
  initialCostFCFA: number;
  monthlyRentFCFA: number;
  capacity: string;
  notes: string;
}

// --- SESSION 1: REPRODUCTION, MISES BAS, ALLAITEMENTS & ENGRAISSEMENT ---
export interface FarrowingRecord {
  id: string;
  sowCode: string; // ex: "Truie T-01 LW"
  farrowingDate: string; // YYYY-MM-DD
  litterNumber: number; // ex: 1, 2, 3
  bornAlive: number; // porcelets nés vivants
  stillborn: number; // mort-nés
  mummified: number; // mummifiés
  totalBorn: number;
  averageBirthWeightKg: number; // ex: 1.35 kg
  farrowingPen: string; // ex: "Maternité - Loge M-02"
  status: "En allaitement" | "Sevré" | "Clôturé";
  notes?: string;
}

export interface SucklingLitter {
  id: string;
  farrowingRecordId: string;
  sowCode: string;
  penLocation: string;
  farrowingDate: string;
  currentPigletCount: number; // Porcelets vivants actuellement sous mère
  sucklingDays: number; // Jours d'allaitement en cours (ex: 21 jours)
  targetWeaningDays: number; // Target ex: 28 jours
  expectedWeaningDate: string;
  sowDailyFeedKg: number; // Ration truie lactante ex: 6.0 kg/j
  creepFeedType: "Pré-démarrage (Sous-mère)";
  creepFeedDailyKgTotal: number; // Alimentation porcelets
  sucklingMortalityCount: number; // Pertes durant allaitement
  status: "En cours" | "Prêt pour sevrage" | "Sevré";
  notes?: string;
}

export interface FatteningBatch {
  id: string;
  batchName: string; // ex: "Lot Engraissement Eng-2026-B1"
  sourceSowCode?: string;
  weaningDate: string; // Date de transfert en engraissement
  initialHeadCount: number;
  currentHeadCount: number;
  initialAvgWeightKg: number; // ex: 7.5 kg
  currentAvgWeightKg: number; // ex: 38.0 kg
  targetSlaughterWeightKg: number; // ex: 85.0 kg
  currentFeedType: "Démarrage" | "Croissance" | "Finition";
  averageDailyGainGrams: number; // GMQ ex: 680 g/j
  locationPen: string; // ex: "Engraissement Bâtiment P2"
  estimatedSlaughterDate: string;
  status: "En croissance" | "Prêt pour abattage / vente" | "Vendu";
  notes?: string;
}

// --- SESSION 2: EFFECTIFS FERMES, MOUVEMENTS & PRÉVISIONS STOCKS D'ALIMENTS ---
export interface FarmBuilding {
  id: string;
  name: string; // ex: "Maternité Porcine A", "Bâtiment Poulet A1"
  type: "Maternité" | "Post-sevrage" | "Engraissement" | "Poussinière" | "Poulailler Chair" | "Pondeuses";
  species: "Porciculture" | "Aviculture";
  capacity: number;
  currentHeads: number;
}

export interface FarmSite {
  id: string;
  name: string; // ex: "Ferme Principale Bingerville", "Site Grand-Bassam"
  location: string;
  managerName: string;
  contactPhone: string;
  capacityHeads: number;
  buildings: FarmBuilding[];
  poultryCount: number;
  porcineCount: number;
  feedStockKg: Record<string, number>; // "Pré-démarrage": 250, "Croissance": 500...
  notes?: string;
}

export interface AnimalMovement {
  id: string;
  date: string; // YYYY-MM-DD
  species: "Porciculture" | "Aviculture";
  movementType:
    | "Transfert Maternité -> Engraissement"
    | "Transfert Inter-Fermes"
    | "Entrée / Achat Nouveau Lot"
    | "Sortie Vente / Abattage"
    | "Mise en Réforme / Perte";
  sourceFarmName: string;
  sourceBuilding: string;
  destinationFarmName: string;
  destinationBuilding: string;
  headCount: number;
  averageWeightKg?: number;
  reason: string;
  veterinaryStatus: "Conforme / Isolé" | "Contrôle Effectué" | "En Attente";
  recordedBy: string;
}

// --- SUPPLIERS MANAGEMENT TYPES ---
export interface SupplierOrder {
  id: string;
  orderNumber: string; // ex: "CMD-2026-089"
  date: string; // YYYY-MM-DD
  itemDescription: string; // ex: "50 tonnes Maïs Jaune Korhogo"
  module: "Aviculture" | "Porciculture" | "Fabrique d'Aliments" | "Hygiène & Sanitaire" | "Infrastructures & Matériel" | "Logistique & Transport";
  quantity: number;
  unitLabel: string; // ex: "Kg", "Sacs 50kg", "Flacons", "Sujets"
  unitPriceFCFA: number;
  totalAmountFCFA: number;
  amountPaidFCFA: number;
  paymentStatus: "Payé" | "Acompte Versé" | "En Attente de Paiement" | "Litige / Non Conforme";
  deliveryStatus: "Livré & Conforme" | "En Transit" | "Commandé";
  deliveryDate?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string; // ex: "FOURN-ALIM-01"
  name: string; // ex: "Grands Moulins d'Abidjan (GMA)"
  category:
    | "Couvoirs & Poussins"
    | "Éleveurs Porcins & Génétique"
    | "Matières Premières & Céréales"
    | "Produits Vétérinaires & Vaccins"
    | "Matériel & Équipements"
    | "Logistique & Transport";
  modulesSupported: ("Aviculture" | "Porciculture" | "Fabrique d'Aliments" | "Hygiène & Sanitaire" | "Infrastructures & Matériel" | "Logistique & Transport")[];
  contactName: string;
  phone: string;
  email?: string;
  cityLocation: string; // ex: "Abidjan (Zone Industrielle Yopougon)", "Korhogo", "Bouaké"
  ratingStars: number; // 1 to 5
  paymentTerms: "Comptant" | "Paiement Wave / Mobile" | "Avance 50% / Solde à la livraison" | "30 Jours Fin de Mois";
  status: "Actif" | "Partenaire Privilégié" | "En Réévaluation" | "Inactif";
  totalPurchasesFCFA: number;
  outstandingDebtFCFA: number; // Dettes dues
  ordersHistory: SupplierOrder[];
  qualityCertifications?: string[];
  notes?: string;
}

// --- MEDICATIONS, VACCINES & BATCH LOT MANAGEMENT TYPES ---
export interface MedicationBatchLot {
  id: string;
  lotNumber: string; // ex: "LOT-VAC-2026-08A", "LOT-ABX-9942"
  expirationDate: string; // YYYY-MM-DD
  initialQuantity: number;
  currentQuantity: number;
  unitPriceFCFA: number;
  supplierName?: string;
  receivedDate: string; // YYYY-MM-DD
  storageLocation: string; // ex: "Frigo Pharmacie 4°C", "Armoire Bâtiment A"
  qualityStatus: "Conforme" | "Quarantaine" | "Périmé" | "Détruit";
}

export interface MedicationItem {
  id: string;
  code: string; // ex: "MED-VAC-01"
  name: string; // ex: "Vaccin HB1 + H120 (Newcastle & Bronchite)"
  activeIngredient?: string; // ex: "Souche HB1 + H120 lyophilisée"
  category:
    | "Vaccin (Chaîne du Froid)"
    | "Antibiotique / Anti-infectieux"
    | "Vitamines & Fortifiants"
    | "Antiparasitaire & Vermifuge"
    | "Désinfectant & Biosécurité";
  speciesTarget: "Aviculture" | "Porciculture" | "Toutes Espèces";
  unit: "Doses" | "Flacons" | "Litres" | "Sachets 100g" | "Boîtes" | "KG";
  minStockAlertThreshold: number;
  requiresColdChain: boolean; // 2°C - 8°C
  storageTemperatureNote: string; // ex: "Conserver entre +2°C et +8°C"
  batches: MedicationBatchLot[];
  notes?: string;
}

export interface MedicationMovement {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm
  medicationId: string;
  medicationName: string;
  lotNumber: string;
  movementType: "Réception Achat" | "Consommation Traitement" | "Retrait Périmé / Destruction" | "Ajustement Inventaire";
  quantity: number;
  unit: string;
  targetBatchName?: string; // ex: "Lot Poussins P3", "Truies Maternité B"
  prescribedBy?: string; // ex: "Dr. Yao (Vétérinaire)", "Kouassi (Technicien)"
  notes?: string;
}


