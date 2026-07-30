import { UserSession, AccreditedTaskOption } from "../types";

export const availableAccreditedTasks: AccreditedTaskOption[] = [
  {
    id: "task-1",
    code: "DENSITE_CAMERA",
    label: "📷 Mesure Bâtiment par Caméra & Calcul Densité",
    category: "Gestion & Saisie",
    description: "Accès à la caméra du téléphone pour mesurer les dimensions et calculer la densité animale optimale.",
  },
  {
    id: "task-2",
    code: "SAISIE_ELEVAGE",
    label: "🐔 Saisie Élevage, Pesées & Sanitaire",
    category: "Gestion & Saisie",
    description: "Enregistrement des rations d'aliment, mortalités, pesées de bande et vaccins.",
  },
  {
    id: "task-3",
    code: "SAISIE_VENTES",
    label: "💵 Ventes, Facturation & Clients",
    category: "Gestion & Saisie",
    description: "Émission de factures, enregistrement des ventes de poulets, porcs et découpes.",
  },
  {
    id: "task-4",
    code: "MODIF_STOCKS",
    label: "📦 Stocks & Commandes Fournisseurs",
    category: "Gestion & Saisie",
    description: "Gestion des stocks de maïs, soja, alim. et passation de commandes auprès des fournisseurs.",
  },
  {
    id: "task-5",
    code: "ACCES_FINANCIER",
    label: "📈 Bilan Financier & Compte de Résultat",
    category: "Validation & Financer",
    description: "Consultation des tableaux de bord financiers, EBITDA, et projections 5 ans.",
  },
  {
    id: "task-6",
    code: "VALIDATION_AGENT",
    label: "👥 Inscription d'Employés & Gestion Équipe",
    category: "Administration",
    description: "Enregistrement de nouveaux agents avec scan de pièce CNI et demande d'activation.",
  },
  {
    id: "task-7",
    code: "RESTAURATION_DATE",
    label: "⏳ Restauration Historique & Snapshots",
    category: "Secours & Restauration",
    description: "Restauration des données à une date antérieure et export de sauvegardes JSON.",
  },
  {
    id: "task-8",
    code: "REINITIALISATION_ZERO",
    label: "⚡ Mise à Zéro Totale de l'Exploitation",
    category: "Administration",
    description: "Permission critique de remise à zéro globale des chiffres avec mot de passe.",
  },
];

export const defaultUsers: UserSession[] = [
  {
    id: "usr-admin-1",
    username: "admin",
    passwordPlainText: "agibrico1",
    fullName: "ATSE Gilles Brice",
    firstNames: "Gilles Brice",
    phone: "+225 07 08 09 10 11",
    role: "ADMIN_GENERAL",
    department: "Finances & Comptabilité",
    isActivatedByAdmin: true,
    mustChangePasswordOnFirstLogin: false,
    hasChangedPassword: true,
    idCardNumber: "CNI-CI-2026-987654",
    accreditedTasks: availableAccreditedTasks.map((t) => t.code),
    status: "Actif",
    lastLogin: "2026-07-28 10:00:00",
    notes: "Administrateur Général & Propriétaire de la Holding Ivoire Élevage.",
  },
  {
    id: "usr-avivoire-1",
    username: "avivoire",
    passwordPlainText: "1234",
    fullName: "Responsable Direction AVIVOIRE",
    firstNames: "Responsable Gérant",
    phone: "+225 05 04 03 02 01",
    role: "RESPONSABLE_DEPT",
    department: "Aviculture",
    isActivatedByAdmin: true,
    mustChangePasswordOnFirstLogin: false,
    hasChangedPassword: true,
    idCardNumber: "CNI-CI-AVIVOIRE-2026",
    accreditedTasks: availableAccreditedTasks.map((t) => t.code),
    status: "Actif",
    notes: "Directeur Gérant AVIVOIRE (Pôle Aviculture & Volailles). Mot de passe par défaut: 1234",
  },
  {
    id: "usr-porcivoire-1",
    username: "porcivoire",
    passwordPlainText: "1234",
    fullName: "Responsable Direction PORCIVOIRE",
    firstNames: "Responsable Gérant",
    phone: "+225 01 02 03 04 05",
    role: "RESPONSABLE_DEPT",
    department: "Porciculture",
    isActivatedByAdmin: true,
    mustChangePasswordOnFirstLogin: false,
    hasChangedPassword: true,
    idCardNumber: "CNI-CI-PORCIVOIRE-2026",
    accreditedTasks: availableAccreditedTasks.map((t) => t.code),
    status: "Actif",
    notes: "Directeur Gérant PORCIVOIRE (Pôle Porciculture & Maternité). Mot de passe par défaut: 1234",
  },
  {
    id: "usr-resp-avic",
    username: "resp.avic",
    passwordPlainText: "1234",
    fullName: "Kouassi Jean",
    firstNames: "Jean",
    phone: "+225 05 04 03 02 01",
    role: "RESPONSABLE_DEPT",
    department: "Aviculture",
    isActivatedByAdmin: true,
    mustChangePasswordOnFirstLogin: false,
    hasChangedPassword: true,
    idCardNumber: "CNI-CI-2025-112233",
    accreditedTasks: [
      "DENSITE_CAMERA",
      "SAISIE_ELEVAGE",
      "SAISIE_VENTES",
      "MODIF_STOCKS",
      "VALIDATION_AGENT",
    ],
    status: "Actif",
    notes: "Responsable du Pôle Avicole (Poussins, Bâtiments Chair & Pondeuses). Mot de passe: 1234",
  },
  {
    id: "usr-resp-porc",
    username: "resp.porc",
    passwordPlainText: "1234",
    fullName: "Dr. Koffi Marcel",
    firstNames: "Marcel",
    phone: "+225 01 02 03 04 05",
    role: "RESPONSABLE_DEPT",
    department: "Porciculture",
    isActivatedByAdmin: true,
    mustChangePasswordOnFirstLogin: false,
    hasChangedPassword: true,
    idCardNumber: "CNI-CI-2024-445566",
    accreditedTasks: [
      "DENSITE_CAMERA",
      "SAISIE_ELEVAGE",
      "SAISIE_VENTES",
      "MODIF_STOCKS",
      "VALIDATION_AGENT",
    ],
    status: "Actif",
    notes: "Chef de Département Porcin & Maternité. Mot de passe: 1234",
  },
  {
    id: "usr-emp-yao",
    username: "emp.yao",
    passwordPlainText: "agibrico1",
    fullName: "Yao Bienvenu",
    firstNames: "Bienvenu",
    phone: "+225 07 44 55 66 77",
    role: "EMPLOYE",
    department: "Aviculture",
    isActivatedByAdmin: false,
    isPendingAdminValidation: true,
    activatedByManagerName: "Kouassi Jean (Resp. Aviculture)",
    mustChangePasswordOnFirstLogin: true,
    hasChangedPassword: false,
    idCardNumber: "CNI-CI-2026-778899",
    accreditedTasks: ["DENSITE_CAMERA", "SAISIE_ELEVAGE"],
    status: "En attente validation Admin",
    notes: "Employé Avicole en cours de validation finale par l'Administrateur Général.",
  },
];

const LOCAL_USERS_KEY = "ivoire_elevage_sessions_v2";
const CURRENT_USER_KEY = "ivoire_elevage_current_session_v2";

export function loadAllUserSessions(): UserSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading users from storage", e);
  }
  // Initialize default users
  saveAllUserSessions(defaultUsers);
  return defaultUsers;
}

export function saveAllUserSessions(sessions: UserSession[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Error saving users to storage", e);
  }
}

export function getCurrentUserSession(): UserSession {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Refresh with master list in case permissions changed
      const all = loadAllUserSessions();
      const match = all.find((u) => u.id === parsed.id || u.username === parsed.username);
      if (match) return match;
    }
  } catch (e) {
    console.error("Error loading current session", e);
  }
  const all = loadAllUserSessions();
  const admin = all.find((u) => u.role === "ADMIN_GENERAL") || all[0];
  saveCurrentUserSession(admin);
  return admin;
}

export function saveCurrentUserSession(session: UserSession): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Error saving current session", e);
  }
}
