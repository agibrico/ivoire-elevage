/**
 * Offline Storage & Synchronization Utility
 * Permet la mise en cache locale (localStorage / IndexedDB) des données de saisie rapide d'élevage
 * pour assurer un fonctionnement ininterrompu en zone blanche / hors-ligne.
 */

export interface OfflineEntry {
  id: string;
  category: "census" | "health_task" | "breeding" | "sales" | "unit_costs" | "hr_agent";
  title: string;
  timestamp: string;
  data: Record<string, any>;
  synced: boolean;
}

const STORAGE_KEY = "ivoire_elevage_offline_entries_v1";
const UNIT_COSTS_STORAGE_KEY = "ivoire_elevage_unit_costs_v1";

const DB_NAME = "IvoireElevageIndexedDB";
const DB_VERSION = 1;
const STORE_OFFLINE_QUEUE = "offline_queue";

/**
 * Initialiser la base de données locale IndexedDB
 */
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB n'est pas supporté par ce navigateur."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
        const store = db.createObjectStore(STORE_OFFLINE_QUEUE, { keyPath: "id" });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      console.error("Erreur d'ouverture d'IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Persister / Synchroniser une liste d'entrées vers IndexedDB
 */
export async function syncEntriesToIndexedDB(entries: OfflineEntry[]): Promise<number> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OFFLINE_QUEUE, "readwrite");
      const store = tx.objectStore(STORE_OFFLINE_QUEUE);
      let count = 0;

      entries.forEach((entry) => {
        store.put({ ...entry, synced: true, syncedAt: new Date().toISOString() });
        count++;
      });

      tx.oncomplete = () => {
        db.close();
        resolve(count);
      };

      tx.onerror = (err) => {
        db.close();
        reject(err);
      };
    });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement dans IndexedDB:", err);
    return 0;
  }
}

/**
 * Récupérer toutes les saisies archivées dans la base IndexedDB locale
 */
export async function getIndexedDBEntries(): Promise<OfflineEntry[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OFFLINE_QUEUE, "readonly");
      const store = tx.objectStore(STORE_OFFLINE_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };

      request.onerror = (err) => {
        db.close();
        reject(err);
      };
    });
  } catch (err) {
    console.error("Erreur de lecture d'IndexedDB:", err);
    return [];
  }
}

/**
 * Synchronisation forcée des données en attente vers IndexedDB localement
 */
export async function forceSyncToIndexedDB(): Promise<{ syncedCount: number; totalIndexedDB: number }> {
  const allEntries = getOfflineEntries();
  const unsyncedEntries = allEntries.filter((e) => !e.synced);

  // 1. Enregistrer dans IndexedDB
  const entriesToSync = unsyncedEntries.length > 0 ? unsyncedEntries : allEntries;
  const syncedCount = await syncEntriesToIndexedDB(entriesToSync);

  // 2. Mettre à jour le statut dans localStorage
  markAllEntriesSynced();

  // 3. Lire le total d'objets dans IndexedDB
  const indexedDBEntries = await getIndexedDBEntries();

  return {
    syncedCount: syncedCount,
    totalIndexedDB: indexedDBEntries.length,
  };
}

/**
 * Sauvegarder une saisie rapide en mode hors-ligne
 */
export function saveOfflineEntry(
  category: OfflineEntry["category"],
  title: string,
  data: Record<string, any>
): OfflineEntry {
  const newEntry: OfflineEntry = {
    id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    category,
    title,
    timestamp: new Date().toISOString(),
    data,
    synced: navigator.onLine,
  };

  try {
    const existing = getOfflineEntries();
    const updated = [newEntry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Si en ligne, persister immédiatement dans IndexedDB
    if (navigator.onLine) {
      syncEntriesToIndexedDB([newEntry]).catch(() => {});
    }
  } catch (err) {
    console.error("Erreur lors de la sauvegarde locale hors-ligne:", err);
  }

  return newEntry;
}

/**
 * Récupérer toutes les saisies hors-ligne en cache
 */
export function getOfflineEntries(category?: OfflineEntry["category"]): OfflineEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: OfflineEntry[] = JSON.parse(raw);
    if (category) {
      return entries.filter((e) => e.category === category);
    }
    return entries;
  } catch (err) {
    console.error("Erreur de lecture du cache local:", err);
    return [];
  }
}

/**
 * Marquer toutes les saisies hors-ligne comme synchronisées
 */
export function markAllEntriesSynced(): number {
  try {
    const entries = getOfflineEntries();
    const countToSync = entries.filter((e) => !e.synced).length;
    const updated = entries.map((e) => ({ ...e, synced: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return countToSync;
  } catch (err) {
    console.error("Erreur lors de la synchronisation:", err);
    return 0;
  }
}

/**
 * Effacer les données synchronisées anciennes
 */
export function clearSyncedOfflineEntries(): void {
  try {
    const entries = getOfflineEntries();
    const unsyncedOnly = entries.filter((e) => !e.synced);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unsyncedOnly));
  } catch (err) {
    console.error("Erreur de nettoyage du cache local:", err);
  }
}

/**
 * Sauvegarder les coûts unitaires et configurations critiques dans le localStorage
 */
export function saveUnitCostsToCache(unitCosts: any): void {
  try {
    localStorage.setItem(UNIT_COSTS_STORAGE_KEY, JSON.stringify(unitCosts));
  } catch (err) {
    console.error("Erreur de mise en cache des coûts unitaires:", err);
  }
}

/**
 * Charger les coûts unitaires depuis le localStorage
 */
export function loadUnitCostsFromCache(): any | null {
  try {
    const raw = localStorage.getItem(UNIT_COSTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Erreur de chargement des coûts unitaires en cache:", err);
    return null;
  }
}

// ----------------------------------------------------------------------
// CACHE DES FICHES TECHNIQUES DE PRODUCTION & PROPHYLAXIE (MODE HORS-LIGNE)
// ----------------------------------------------------------------------
const TECH_SPECS_CACHE_KEY = "ivoire_elevage_tech_specs_v2";

export interface TechnicalSheetItem {
  id: string;
  title: string;
  species: "Aviculture" | "Porciculture" | "Alimentation & Ration" | "Biosécurité & Vété";
  category: string;
  lastUpdated: string;
  summary: string;
  keyMetrics: { label: string; value: string }[];
  contentSections: { title: string; details: string[] }[];
}

export const defaultOfflineTechnicalSheets: TechnicalSheetItem[] = [
  {
    id: "tech-cobb500",
    title: "Fiche Technique Poulet de Chair (Souche Cobb 500)",
    species: "Aviculture",
    category: "Génétique & Normes de Croissance",
    lastUpdated: "2026-07-29",
    summary: "Performances cibles zootechniques pour l'élevage intensif en climat chaud (Côte d'Ivoire).",
    keyMetrics: [
      { label: "Poids Cible J42", value: "2.10 à 2.30 kg" },
      { label: "Indice de Conso (IC)", value: "1.60 à 1.70" },
      { label: "Conso Aliment Totale", value: "3.7 à 3.9 kg / sujet" },
      { label: "Mortalité Normale", value: "< 3.0 %" },
    ],
    contentSections: [
      {
        title: "Tableau de Conso & Croissance par Semaine",
        details: [
          "S1 (J1-J7): Conso 160g/sujet • Poids 180g • Aliment Démarrage (21% Protéines)",
          "S2 (J8-J14): Conso 380g/sujet • Poids 420g • Aliment Démarrage (20% Protéines)",
          "S3 (J15-J21): Conso 680g/sujet • Poids 850g • Transition Croissance (19% Protéines)",
          "S4 (J22-J28): Conso 980g/sujet • Poids 1 350g • Croissance (18.5% Protéines)",
          "S5 (J29-J35): Conso 1 200g/sujet • Poids 1 850g • Finition (17.5% Protéines)",
          "S6 (J36-J42): Conso 1 400g/sujet • Poids 2 250g • Vente & Retrait antibiotiques",
        ],
      },
      {
        title: "Normes d'Ambiance & Densité",
        details: [
          "Densité maximale: 10 à 12 sujets / m² en bâtiment ouvert avec brasseurs d'air.",
          "Température démarrage: 33°C à J1, baisser de 2°C par semaine jusqu'à 24°C.",
          "Eau de boisson: Prévoir 2 à 2.5 litres d'eau pour 1 kg d'aliment consommé.",
        ],
      },
    ],
  },
  {
    id: "tech-duroc-pork",
    title: "Fiche Technique Porc d'Engraissement (Lignée Duroc x Landrace)",
    species: "Porciculture",
    category: "Croissance Porcine & GMQ",
    lastUpdated: "2026-07-29",
    summary: "Guide d'engraissement de 15 kg au poids d'abattage de 90 kg en 120 jours.",
    keyMetrics: [
      { label: "GMQ Moyen", value: "620 à 680 g / jour" },
      { label: "Indice de Conso (IC)", value: "2.65 à 2.80" },
      { label: "Durée Engraissement", value: "115 à 125 jours" },
      { label: "Poids Abattage Cible", value: "85 à 95 kg" },
    ],
    contentSections: [
      {
        title: "Plan de Rationnement & Phases",
        details: [
          "Post-Sevrage (10 - 25 kg): Ration 0.8 à 1.2 kg/jour • 18% Protéines • Lysine 1.15%",
          "Croissance (25 - 55 kg): Ration 1.6 à 2.1 kg/jour • 16% Protéines • Lysine 0.95%",
          "Finition (55 - 90 kg): Ration 2.3 à 2.8 kg/jour • 14.5% Protéines • Lysine 0.80%",
        ],
      },
      {
        title: "Besoins en Eau & Espace",
        details: [
          "Espace par porc charcutier: Minimum 0.8 à 1.0 m² par sujet en loge bétonnée.",
          "Débit abreuvoir tétine: 1.5 à 2.0 Litres / minute par tétine.",
        ],
      },
    ],
  },
  {
    id: "tech-vaccine-protocol",
    title: "Protocoles de Prophylaxie Sanitaire & Traitements Vétérinaires",
    species: "Biosécurité & Vété",
    category: "Prophylaxie & Rappels",
    lastUpdated: "2026-07-29",
    summary: "Procédures d'urgence sanitaires et calendrier universel de vaccination par espèce.",
    keyMetrics: [
      { label: "Rappel Gumboro", value: "J7 & J14 (Eau sans chlore)" },
      { label: "Rappel Newcastle", value: "J1 & J21 (LaSota)" },
      { label: "Fer Porcelets", value: "J3 (2ml IM)" },
      { label: "Vide Sanitaire", value: "14 jours minimum" },
    ],
    contentSections: [
      {
        title: "Préparation des Vaccins en Eau de Boisson",
        details: [
          "1. Stopper la chloration de l'eau 48h avant la vaccination.",
          "2. Assoiffer la bande pendant 1h30 à 2h selon la température ambiante.",
          "3. Ajouter 2.5g de lait écrémé en poudre par Litre d'eau pour protéger les souches virales.",
          "4. Distribuer le vaccin et s'assurer que 100% des sujets s'abreuvent en moins de 90 minutes.",
        ],
      },
    ],
  },
  {
    id: "tech-feed-formulation",
    title: "Guide de Formulation Local Aliment (Maïs, Soja, Son & Premix)",
    species: "Alimentation & Ration",
    category: "Rationnement Fait-Maison",
    lastUpdated: "2026-07-29",
    summary: "Formules optimales pour minimiser le coût du kg d'aliment tout en maintenant l'énergie métabolisable.",
    keyMetrics: [
      { label: "Taux Maïs (Volailles)", value: "60% à 68%" },
      { label: "Taux Soja 48%", value: "20% à 28%" },
      { label: "Économie Moyenne", value: "35 à 60 FCFA / kg" },
    ],
    contentSections: [
      {
        title: "Formule Type Chair Finition (pour 100 kg d'aliment)",
        details: [
          "Maïs concassé sec : 66 kg (Énergie métabolisable ~3 100 kcal)",
          "Tourteau de Soja 48% : 20 kg (Apport protéique)",
          "Son de blé ou maïs : 10 kg (Fibres et digestibilité)",
          "CMV / Premix Chair 4% : 4 kg (Acides aminés, Ca, P, Vitamines)",
        ],
      },
    ],
  },
];

/**
 * Sauvegarder les fiches techniques dans le cache local
 */
export function saveTechnicalSpecsToCache(sheets: TechnicalSheetItem[]): void {
  try {
    localStorage.setItem(TECH_SPECS_CACHE_KEY, JSON.stringify(sheets));
  } catch (err) {
    console.error("Erreur de mise en cache des fiches techniques:", err);
  }
}

/**
 * Charger les fiches techniques depuis le cache local (avec fallback par défaut)
 */
export function getOfflineTechnicalSpecs(): TechnicalSheetItem[] {
  try {
    const raw = localStorage.getItem(TECH_SPECS_CACHE_KEY);
    if (!raw) {
      saveTechnicalSpecsToCache(defaultOfflineTechnicalSheets);
      return defaultOfflineTechnicalSheets;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erreur de chargement des fiches techniques hors-ligne:", err);
    return defaultOfflineTechnicalSheets;
  }
}

/**
 * Synchroniser toutes les fiches techniques et données de production vers IndexedDB
 */
export async function syncProductionDataForOffline(): Promise<{ sheetsCount: number; timestamp: string }> {
  const sheets = getOfflineTechnicalSpecs();
  saveTechnicalSpecsToCache(sheets);

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_OFFLINE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_OFFLINE_QUEUE);

    sheets.forEach((sheet) => {
      store.put({
        id: `tech_spec_${sheet.id}`,
        category: "health_task",
        title: `[Fiche Technique Cached] ${sheet.title}`,
        timestamp: new Date().toISOString(),
        data: sheet,
        synced: true,
      });
    });

    await new Promise((resolve) => {
      tx.oncomplete = resolve;
    });
    db.close();
  } catch (e) {
    console.warn("Mise en cache IndexedDB partielle:", e);
  }

  return {
    sheetsCount: sheets.length,
    timestamp: new Date().toLocaleString("fr-FR"),
  };
}


