export interface FeedStockLevelItem {
  id: string;
  name: string;
  stockKg: number;
  safetyThresholdKg: number;
  criticalThresholdKg: number;
  location: string;
  autonomyDays: number;
  dailyConsumptionKg: number;
  category: "Volaille" | "Porcin" | "Concentré";
}

export const defaultFeedStockLevels: FeedStockLevelItem[] = [
  {
    id: "feed-1",
    name: "Finition Volaille",
    stockKg: 1200,
    safetyThresholdKg: 2000,
    criticalThresholdKg: 1000,
    location: "Silo Principal Bâtiment A",
    autonomyDays: 3,
    dailyConsumptionKg: 400,
    category: "Volaille",
  },
  {
    id: "feed-2",
    name: "Démarrage Poussins",
    stockKg: 350,
    safetyThresholdKg: 600,
    criticalThresholdKg: 300,
    location: "Magasin Central Aliments",
    autonomyDays: 4,
    dailyConsumptionKg: 85,
    category: "Volaille",
  },
  {
    id: "feed-3",
    name: "Croissance Volaille",
    stockKg: 3100,
    safetyThresholdKg: 2200,
    criticalThresholdKg: 1200,
    location: "Silo Bâtiment Volailles B",
    autonomyDays: 10,
    dailyConsumptionKg: 310,
    category: "Volaille",
  },
  {
    id: "feed-4",
    name: "Engraissement Porcs",
    stockKg: 2800,
    safetyThresholdKg: 2500,
    criticalThresholdKg: 1500,
    location: "Silo Porcherie Principal",
    autonomyDays: 9,
    dailyConsumptionKg: 310,
    category: "Porcin",
  },
  {
    id: "feed-5",
    name: "Maternité & Lactation",
    stockKg: 450,
    safetyThresholdKg: 800,
    criticalThresholdKg: 400,
    location: "Magasin Porcherie Maternité",
    autonomyDays: 5,
    dailyConsumptionKg: 90,
    category: "Porcin",
  },
  {
    id: "feed-6",
    name: "Concentré Repro Verrats",
    stockKg: 650,
    safetyThresholdKg: 500,
    criticalThresholdKg: 250,
    location: "Verraterie & Loge Repro",
    autonomyDays: 12,
    dailyConsumptionKg: 55,
    category: "Concentré",
  },
];

export const FEED_STOCK_STORAGE_KEY = "dashboard_feed_stock_levels";

export function loadFeedStockLevels(): FeedStockLevelItem[] {
  try {
    const saved = localStorage.getItem(FEED_STOCK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Erreur de chargement des stocks d'aliments:", e);
  }
  return defaultFeedStockLevels;
}

export function saveFeedStockLevels(items: FeedStockLevelItem[]): void {
  try {
    localStorage.setItem(FEED_STOCK_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Erreur de sauvegarde des stocks d'aliments:", e);
  }
}

export function getCriticalFeedStocks(items: FeedStockLevelItem[]): FeedStockLevelItem[] {
  return items.filter((item) => item.stockKg < item.safetyThresholdKg);
}
