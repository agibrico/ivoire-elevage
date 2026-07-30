import React, { useState, useRef, useEffect } from "react";
import { ActiveTab, ApkInstallMode } from "../types";
import {
  loadFeedStockLevels,
  getCriticalFeedStocks,
  FeedStockLevelItem,
} from "../utils/feedStockStore";
import {
  LayoutDashboard,
  DollarSign,
  Truck,
  Egg,
  PiggyBank,
  Calendar,
  TrendingUp,
  Sliders,
  Users,
  Bot,
  FileText,
  Calculator,
  ShoppingBag,
  Scale,
  Syringe,
  Baby,
  Building2,
  Menu,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Settings,
  Layers,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Check,
  Sun,
  Moon,
  Laptop,
  History,
  Mail,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Wheat,
  ArrowRight,
  ShieldAlert,
  Cpu,
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAI: () => void;
  onOpenExport: () => void;
  onResetToZero?: () => void;
  onRestoreDefaults?: () => void;
  isDarkMode?: boolean;
  themeMode?: "system" | "light" | "dark";
  onToggleDarkMode?: () => void;
  onChangeThemeMode?: (mode: "system" | "light" | "dark") => void;
  onOpenEmailAlerts?: () => void;
  onOpenDateRestore?: () => void;
  apkInstallMode?: ApkInstallMode;
  onOpenApkInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAI,
  onOpenExport,
  onResetToZero,
  onRestoreDefaults,
  isDarkMode = false,
  themeMode = "system",
  onToggleDarkMode,
  onChangeThemeMode,
  onOpenEmailAlerts,
  onOpenDateRestore,
  apkInstallMode = "ADMINISTRATION_GENERALE",
  onOpenApkInstallModal,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Global Header Search Bar State
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Reset Modal Password Protection State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetNotification, setResetNotification] = useState<string | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  // Feed Stock Levels Real-time Alerts State
  const [feedStocks, setFeedStocks] = useState<FeedStockLevelItem[]>(() => loadFeedStockLevels());
  const [isFeedAlertsOpen, setIsFeedAlertsOpen] = useState(false);
  const feedAlertsRef = useRef<HTMLDivElement>(null);

  // Farm Focus Mode State (Focus Élevage Tablet Mode)
  const [isFarmFocusMode, setIsFarmFocusMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("ivoire_farm_focus_mode");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("ivoire_farm_focus_mode", JSON.stringify(isFarmFocusMode));
  }, [isFarmFocusMode]);

  // Sync feed stocks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedStocks(loadFeedStockLevels());
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const criticalFeedItems = getCriticalFeedStocks(feedStocks);

  // Consolidated Header Popovers State
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isNavSelectorOpen, setIsNavSelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");

  const toolsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const navSelectorRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesMenuOpen(false);
      }
      if (navSelectorRef.current && !navSelectorRef.current.contains(event.target as Node)) {
        setIsNavSelectorOpen(false);
      }
      if (feedAlertsRef.current && !feedAlertsRef.current.contains(event.target as Node)) {
        setIsFeedAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const globalSearchDatabase = [
    // Clients
    { id: "c1", label: "Boucherie Plateau Abidjan", detail: "Client Carnet Commercial • Viande de Porc", tab: "sales" as ActiveTab, category: "👤 Clients & Grossistes" },
    { id: "c2", label: "Supermarché Abidjan Retail", detail: "Client Contrat Annuel • Poulet PAC", tab: "sales" as ActiveTab, category: "👤 Clients & Grossistes" },
    { id: "c3", label: "Chevilleur Bouaké (Viandes)", detail: "Client Gros • Carcasses Porcines", tab: "sales" as ActiveTab, category: "👤 Clients & Grossistes" },
    { id: "c4", label: "Hôtel Palm Club Cocody", detail: "Client CHR • Découpes Spéciales", tab: "sales" as ActiveTab, category: "👤 Clients & Grossistes" },
    { id: "c5", label: "Maquis Le Wafou Marcory", detail: "Client Restauration • Poulets Vivants", tab: "sales" as ActiveTab, category: "👤 Clients & Grossistes" },
    { id: "c6", label: "Coopérative Yamoussoukro", detail: "Client Fiente & Engrais Organique", tab: "sales" as ActiveTab, category: "👤 Clients & Grossistes" },

    // Bâtiments & Loges
    { id: "b1", label: "Bâtiment Poussinière A (Poussins)", detail: "Bâtiment Avicole • Capacité 5 000 sujets", tab: "hrinfra" as ActiveTab, category: "🏗️ Bâtiments & Loges" },
    { id: "b2", label: "Bâtiment Pondeuses B (Œufs)", detail: "Bâtiment Avicole • Capacité 3 000 pondeuses", tab: "hrinfra" as ActiveTab, category: "🏗️ Bâtiments & Loges" },
    { id: "b3", label: "Maternité Porcine M-01 (Mises Bas)", detail: "Bâtiment Porcin • 8 Cages de Maternité", tab: "reproduction_maternity" as ActiveTab, category: "🏗️ Bâtiments & Loges" },
    { id: "b4", label: "Loges d'Engraissement L-01 à L-06", detail: "Bâtiment Porcin • Engraissement Porcelets", tab: "hrinfra" as ActiveTab, category: "🏗️ Bâtiments & Loges" },
    { id: "b5", label: "Loges de Gestation Truies G-01 à G-08", detail: "Bâtiment Porcin • Suivi Gestation Truies", tab: "reproduction_maternity" as ActiveTab, category: "🏗️ Bâtiments & Loges" },
    { id: "b6", label: "Magasin Central de Stockage Aliments", detail: "Infrastructures • Capacité 25 Tonnes", tab: "farm_census" as ActiveTab, category: "🏗️ Bâtiments & Loges" },

    // Types de Stocks & Aliments
    { id: "s1", label: "Maïs Grain Jaune (Sac 50kg)", detail: "Matière Première Stock • Stockage Silo", tab: "farm_census" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s2", label: "Tourteau de Soja 48% (Sac 50kg)", detail: "Matière Première Stock • Protéines", tab: "farm_census" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s3", label: "Aliment Démarrage Poulet (21% PB)", detail: "Stock Aliment Volaille • Phase 0-14 jours", tab: "feedmode" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s4", label: "Aliment Croissance Poulet (19% PB)", detail: "Stock Aliment Volaille • Phase 15-28 jours", tab: "feedmode" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s5", label: "Aliment Finition Poulet (17.5% PB)", detail: "Stock Aliment Volaille • Phase 29-42 jours", tab: "feedmode" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s6", label: "Concentré Porcelet Sevré 5%", detail: "Stock Aliment Porcin • Phase Post-Sevrage", tab: "feedmode" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s7", label: "Aliment Truie Gestante / Lactante", detail: "Stock Aliment Porcin • Maternité & Gestation", tab: "feedmode" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },
    { id: "s8", label: "Vaccin Newcastle + Gumboro (Flacon)", detail: "Stock Sanitaire • Prophylaxie Avicole", tab: "tasks_health" as ActiveTab, category: "🌾 Types de Stocks & Aliments" },

    // Fournisseurs & Intervenants
    { id: "f1", label: "SIPRA Aliments Côte d'Ivoire", detail: "Fournisseur Officiel • Aliments Composés", tab: "suppliers_management" as ActiveTab, category: "🚚 Fournisseurs & Achats" },
    { id: "f2", label: "VetoCare Côte d'Ivoire", detail: "Fournisseur Vétérinaire • Vaccins & Antibio", tab: "suppliers_management" as ActiveTab, category: "🚚 Fournisseurs & Achats" },
    { id: "f3", label: "AgroSilo Grains Yamoussoukro", detail: "Fournisseur Maïs & Céréales", tab: "suppliers_management" as ActiveTab, category: "🚚 Fournisseurs & Achats" },

    // Lots & Bandes
    { id: "l1", label: "Lot Poulets de Chair Cobb 500 (V-2026-01)", detail: "Volet Avicole • 5 000 sujets", tab: "aviculture" as ActiveTab, category: "🐔 Lots & Animaux" },
    { id: "l2", label: "Lot Porcs d'Engraissement Landrace (P-2026-01)", detail: "Volet Porcin • 60 sujets", tab: "porciculture" as ActiveTab, category: "🐔 Lots & Animaux" },
    { id: "l3", label: "Truies Reproductrices T-01 à T-12", detail: "Porciculture • Mises Bas & Gestation", tab: "reproduction_maternity" as ActiveTab, category: "🐔 Lots & Animaux" },
  ];

  const matchingGlobalResults = globalSearchDatabase.filter(
    (item) =>
      item.label.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; category: string }[] = [
    {
      id: "dashboard",
      label: "Vue Générale",
      category: "📊 Finances & Pilotage",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "financial_dashboard",
      label: "Tableau de Bord Financier",
      category: "📊 Finances & Pilotage",
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "simulator",
      label: "Simulateur Global",
      category: "📊 Finances & Pilotage",
      icon: <Calculator className="w-4 h-4 text-amber-300" />,
    },
    {
      id: "financials5y",
      label: "Plan 5 Ans (2027-2031)",
      category: "📊 Finances & Pilotage",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "monthly",
      label: "Phase Initiale (M1-M5)",
      category: "📊 Finances & Pilotage",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "aviculture",
      label: "Volet Avicole",
      category: "🐔 Élevage & Production",
      icon: <Egg className="w-4 h-4" />,
    },
    {
      id: "porciculture",
      label: "Volet Porcin",
      category: "🐔 Élevage & Production",
      icon: <PiggyBank className="w-4 h-4" />,
    },
    {
      id: "reproduction_maternity",
      label: "Mises Bas & Reproduction",
      category: "🐔 Élevage & Production",
      icon: <Baby className="w-4 h-4 text-rose-300" />,
    },
    {
      id: "farm_census",
      label: "Effectifs & Stocks Aliments",
      category: "🐔 Élevage & Production",
      icon: <Building2 className="w-4 h-4 text-amber-300" />,
    },
    {
      id: "tasks_health",
      label: "Vaccins & Tâches Quotidiennes",
      category: "🐔 Élevage & Production",
      icon: <Syringe className="w-4 h-4 text-rose-300" />,
    },
    {
      id: "sales",
      label: "Gestion Ventes & Découpes",
      category: "🛒 Commercial & Approvisionnements",
      icon: <ShoppingBag className="w-4 h-4 text-amber-400" />,
    },
    {
      id: "suppliers_management",
      label: "Gestion des Fournisseurs",
      category: "🛒 Commercial & Approvisionnements",
      icon: <Truck className="w-4 h-4 text-amber-300" />,
    },
    {
      id: "feedmode",
      label: "Mode Alimentaire & Décision IA",
      category: "🛒 Commercial & Approvisionnements",
      icon: <Scale className="w-4 h-4 text-emerald-300" />,
    },
    {
      id: "unitcosts",
      label: "Coûts Unitaires & Paramètres",
      category: "⚙️ Configuration & Ressources",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: "hrinfra",
      label: "RH & Bâtiments",
      category: "⚙️ Configuration & Ressources",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "audit_log",
      label: "Historique & Traçabilité",
      category: "⚙️ Configuration & Ressources",
      icon: <History className="w-4 h-4 text-amber-300" />,
    },
    {
      id: "ai_studio",
      label: "Studio Extension IA APK",
      category: "⚙️ Configuration & Ressources",
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const FARM_FOCUS_ALLOWED_TABS: ActiveTab[] = [
    "dashboard",
    "aviculture",
    "porciculture",
    "reproduction_maternity",
    "farm_census",
    "tasks_health",
    "feedmode",
    "sales",
    "ai_studio",
  ];

  const apkModeNavItems = navItems.filter((item) => {
    if (isFarmFocusMode && !FARM_FOCUS_ALLOWED_TABS.includes(item.id)) {
      return false;
    }
    if (apkInstallMode === "AVIVOIRE") {
      return item.id !== "porciculture" && item.id !== "reproduction_maternity";
    }
    if (apkInstallMode === "PORCIVOIRE") {
      return item.id !== "aviculture";
    }
    return true;
  });

  const filteredNavItems = apkModeNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeItem = apkModeNavItems.find((item) => item.id === activeTab) || apkModeNavItems[0];

  const categories = Array.from(new Set(apkModeNavItems.map((item) => item.category)));

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="bg-emerald-900 text-white sticky top-0 z-40 shadow-md border-b border-emerald-800">
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 bg-emerald-800 hover:bg-emerald-700 text-amber-400 rounded-xl border border-emerald-700 transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow"
              title="Ouvrir le menu de navigation tiroir"
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs font-black uppercase text-white hidden sm:inline">Menu</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-inner tracking-wider shrink-0">
                IÉ
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                  IVOIRE ÉLEVAGE
                </h1>
                <p className="text-[10px] sm:text-xs text-emerald-300 font-medium hidden sm:block">
                  Système Intégré de Gestion Agro-Pastorale (Aviculture & Porciculture)
                </p>
              </div>
            </div>
          </div>

          {/* GLOBAL SEARCH BAR (Center Header) */}
          <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md mx-1 sm:mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Recherche globale (Clients, Bâtiments, Stocks, Lots)..."
                value={globalSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full bg-emerald-950/80 hover:bg-emerald-950 text-white text-xs pl-9 pr-8 py-2 rounded-xl border border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-emerald-300/60 shadow-inner transition-all"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-emerald-300 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Global Search Results Dropdown Popover */}
            {isSearchOpen && globalSearchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 max-h-96 overflow-y-auto">
                <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex justify-between items-center text-[11px] font-extrabold text-slate-700">
                  <span>Résultats de recherche globale ({matchingGlobalResults.length})</span>
                  <span className="text-slate-500 font-normal">Cliquez pour ouvrir la vue</span>
                </div>

                {matchingGlobalResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {matchingGlobalResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.tab);
                          setIsSearchOpen(false);
                          setGlobalSearchQuery("");
                        }}
                        className="p-3 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-slate-100 group-hover:bg-emerald-200 text-slate-800 font-extrabold rounded text-[10px]">
                              {item.category}
                            </span>
                            <span className="font-extrabold text-xs text-slate-950 group-hover:text-emerald-900">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium pl-1">
                            {item.detail}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    Aucun client, bâtiment ou stock correspondant à "{globalSearchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Action Popovers */}
          <div className="flex items-center space-x-2">
            {/* STUDIO IA EXTENSIONS BUTTON */}
            <button
              onClick={() => setActiveTab("ai_studio")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md border ${
                activeTab === "ai_studio"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-300/60"
                  : "bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 hover:from-emerald-900 hover:to-slate-900 text-amber-300 border-amber-500/40"
              }`}
              title="Ouvrir le Studio IA pour ajouter de nouvelles fonctionnalités directement dans le logiciel"
            >
              <Cpu className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
              <span className="hidden lg:inline font-extrabold">Studio IA Logiciel</span>
            </button>

            {/* FOCUS ÉLEVAGE TABLET TOGGLE BUTTON */}
            <button
              onClick={() => setIsFarmFocusMode(!isFarmFocusMode)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md border ${
                isFarmFocusMode
                  ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/60"
                  : "bg-slate-900/90 hover:bg-slate-950 text-emerald-300 border-emerald-700/80"
              }`}
              title="Activer/Désactiver le Mode Focus Élevage (Rapprocher les outils de production sur tablette)"
            >
              <Eye className={`w-4 h-4 shrink-0 ${isFarmFocusMode ? "text-slate-950" : "text-amber-400"}`} />
              <span className="hidden md:inline">Focus Élevage</span>
              {isFarmFocusMode && (
                <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-black uppercase">
                  ON
                </span>
              )}
            </button>

            {/* CRITICAL FEED STOCK NOTIFICATION BELL POPOVER */}
            <div ref={feedAlertsRef} className="relative">
              <button
                onClick={() => {
                  setIsFeedAlertsOpen(!isFeedAlertsOpen);
                  setIsToolsMenuOpen(false);
                  setIsServicesMenuOpen(false);
                }}
                className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md border ${
                  criticalFeedItems.length > 0
                    ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-400 animate-pulse"
                    : "bg-slate-900/90 hover:bg-slate-950 text-emerald-200 border-emerald-700/80"
                }`}
                title="Notifications de Stock d'Aliment"
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline font-black">
                  {criticalFeedItems.length > 0 ? `${criticalFeedItems.length} Alerte(s)` : "Stocks"}
                </span>

                {criticalFeedItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                    {criticalFeedItems.length}
                  </span>
                )}
              </button>

              {/* Feed Stock Alerts Popover Dropdown */}
              {isFeedAlertsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 text-white rounded-2xl shadow-2xl border border-rose-500/60 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2.5">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wheat className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                        Alertes Stock Aliment (Temps Réel)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800">
                      {criticalFeedItems.length} Sous Seuil
                    </span>
                  </div>

                  {criticalFeedItems.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {criticalFeedItems.map((item) => {
                        const isCrit = item.stockKg <= item.criticalThresholdKg;
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                              isCrit
                                ? "bg-rose-950/80 border-rose-700/80"
                                : "bg-amber-950/60 border-amber-700/80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white text-xs">{item.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isCrit ? "bg-rose-600 text-white" : "bg-amber-500 text-slate-950"
                                }`}
                              >
                                {isCrit ? "🚨 Rupture Imminente" : "⚠️ Sous Seuil Sécurité"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                              <div>
                                Stock Actuel :{" "}
                                <strong className="text-amber-300 font-black">
                                  {item.stockKg.toLocaleString("fr-FR")} kg
                                </strong>
                              </div>
                              <div>
                                Seuil Sécurité :{" "}
                                <strong className="text-slate-200">{item.safetyThresholdKg} kg</strong>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                              <span>Emplacement : {item.location}</span>
                              <span className="text-emerald-400 font-bold">{item.autonomyDays} j d'autonomie</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-emerald-400 space-y-1">
                      <Check className="w-6 h-6 mx-auto text-emerald-400" />
                      <p className="font-extrabold">Tous les stocks sont au-dessus des seuils de sécurité !</p>
                      <p className="text-[11px] text-slate-400">Aucune rupture détectée sur la ferme.</p>
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setActiveTab("farm_census");
                        setIsFeedAlertsOpen(false);
                      }}
                      className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Voir tous les stocks (Effectifs & Aliments)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1. OPTIONS & SYSTÈME DROPDOWN */}
            <div ref={toolsRef} className="relative">
              <button
                onClick={() => {
                  setIsToolsMenuOpen(!isToolsMenuOpen);
                  setIsServicesMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-950 text-amber-300 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-700/80 cursor-pointer shadow-md transition-all shrink-0"
                title="Consulter les Options et Paramètres Système"
              >
                <Settings className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
                <span className="hidden sm:inline font-extrabold">Options & Système</span>
                <span className="sm:hidden font-bold">Options</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isToolsMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Options Popover Dropdown */}
              {isToolsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-700/80 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>⚙️ Configuration & Système</span>
                    <span className="text-[10px] text-slate-400 font-normal">5 Réglages</span>
                  </div>

                  {/* Mode Installation */}
                  {onOpenApkInstallModal && (
                    <button
                      onClick={() => {
                        onOpenApkInstallModal();
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full p-2.5 hover:bg-emerald-900/70 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">Mode d'Installation</p>
                          <p className="text-[10px] text-slate-400">Direction : {apkInstallMode === "ADMINISTRATION_GENERALE" ? "ADMIN GÉNÉRAL" : apkInstallMode}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                  {/* Theme Switch / Mode Selector */}
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                          {themeMode === "system" ? (
                            <Laptop className="w-4 h-4" />
                          ) : isDarkMode ? (
                            <Moon className="w-4 h-4" />
                          ) : (
                            <Sun className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">Apparence Visuelle</p>
                          <p className="text-[10px] text-slate-400">
                            {themeMode === "system"
                              ? `Auto Système (${isDarkMode ? "Sombre" : "Clair"})`
                              : themeMode === "dark"
                              ? "Mode Sombre"
                              : "Mode Clair"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3-way mode selector buttons */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => onChangeThemeMode?.("system")}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          themeMode === "system"
                            ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                        title="Détection automatique basée sur les préférences système de votre appareil"
                      >
                        <Laptop className="w-3 h-3" />
                        <span>Auto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeThemeMode?.("light")}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          themeMode === "light"
                            ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                        title="Forcer le Mode Clair"
                      >
                        <Sun className="w-3 h-3" />
                        <span>Clair</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeThemeMode?.("dark")}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          themeMode === "dark"
                            ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                        title="Forcer le Mode Sombre"
                      >
                        <Moon className="w-3 h-3" />
                        <span>Sombre</span>
                      </button>
                    </div>
                  </div>

                  {/* Email Alerts */}
                  {onOpenEmailAlerts && (
                    <button
                      onClick={() => {
                        onOpenEmailAlerts();
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full p-2.5 hover:bg-emerald-900/70 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">Alertes Stock Email</p>
                          <p className="text-[10px] text-slate-400">Notifications automatiques hors-ligne</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                  {/* Restauration Date */}
                  {onOpenDateRestore && (
                    <button
                      onClick={() => {
                        onOpenDateRestore();
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full p-2.5 hover:bg-emerald-900/70 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">Restaurer Données (Date)</p>
                          <p className="text-[10px] text-slate-400">Recouvrement sécurité anti-bug</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                  {/* Zero Reset */}
                  <button
                    onClick={() => {
                      setResetPasswordInput("");
                      setResetPasswordError(null);
                      setResetNotification(null);
                      setIsResetModalOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full p-2.5 hover:bg-rose-950/80 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer text-xs border-t border-slate-800"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-rose-300 text-xs">Réinitialisation Vierge</p>
                        <p className="text-[10px] text-slate-400">Remise à zéro sécurisée sous passe</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. ASSISTANT IA & RAPPORTS DROPDOWN */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => {
                  setIsServicesMenuOpen(!isServicesMenuOpen);
                  setIsToolsMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-3 py-2 rounded-xl text-xs shadow-md border border-amber-300 cursor-pointer transition-all shrink-0"
                title="Consulter l'Assistant IA et Générer des Rapports"
              >
                <Bot className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="hidden sm:inline font-black">IA & Rapports</span>
                <span className="sm:hidden font-black">IA</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isServicesMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Services Popover Dropdown */}
              {isServicesMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-500/50 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                    🤖 Intelligence & Bilan
                  </div>

                  <button
                    onClick={() => {
                      onOpenAI();
                      setIsServicesMenuOpen(false);
                    }}
                    className="w-full p-2.5 hover:bg-emerald-900/70 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-xs">Assistant IA Agro</p>
                        <p className="text-[10px] text-slate-400">Conseils & Diagnostic Sanitaire</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenExport();
                      setIsServicesMenuOpen(false);
                    }}
                    className="w-full p-2.5 hover:bg-emerald-900/70 rounded-xl transition-all text-left flex items-center justify-between group cursor-pointer text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-xs">Rapport & Export</p>
                        <p className="text-[10px] text-slate-400">PDF, Excel & Bilan Financier</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. MENU TIROIR BUTTON */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-700 cursor-pointer shadow transition-all shrink-0"
              title="Ouvrir le Menu Tiroir Général"
            >
              <Layers className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="hidden md:inline">Menu Tiroir</span>
            </button>
          </div>
        </div>

        {/* Consolidated Navigation Bar ("Canevas de Navigation" - Single Trigger Selector) */}
        <div className="bg-emerald-950/95 border-t border-emerald-800/80 shadow-inner py-2.5 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Active View Title Display */}
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-sm shrink-0">
                <span>{activeItem.icon}</span>
                <span className="uppercase text-[11px] tracking-wider">{activeItem.category.split(" ")[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest leading-none">Volet Actif</p>
                <h2 className="text-sm font-black text-white truncate">{activeItem.label}</h2>
              </div>
            </div>

            {/* Navigation Selector Button & Popover */}
            <div ref={navSelectorRef} className="relative flex items-center space-x-2">
              <button
                onClick={() => setIsNavSelectorOpen(!isNavSelectorOpen)}
                className="w-full sm:w-auto flex items-center justify-between space-x-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-amber-300 font-black px-4 py-2 rounded-xl text-xs border border-emerald-600/80 cursor-pointer shadow-md transition-all shrink-0"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Sélectionner le Volet d'Élevage ({apkModeNavItems.length})</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${isNavSelectorOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Navigation Selector Popover Dropdown */}
              {isNavSelectorOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 text-white rounded-3xl shadow-2xl border border-emerald-700 p-3 z-50 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto space-y-3">
                  <div className="p-2 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">📂 Choisir un Volet</span>
                    <span className="text-[10px] text-slate-400 font-bold">{apkModeNavItems.length} Volets disponibles</span>
                  </div>

                  {/* Category Filter Pills inside Popover */}
                  <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px]">
                    {["Toutes", ...categories].map((cat) => {
                      const isCatActive = selectedCategory === cat;
                      const catShortName = cat === "Toutes" ? "Toutes" : cat.split(" ")[1] || cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            isCatActive
                              ? "bg-amber-500 text-slate-950 font-black shadow"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {catShortName}
                        </button>
                      );
                    })}
                  </div>

                  {/* View Items List Grouped or Filtered */}
                  <div className="space-y-3">
                    {categories
                      .filter((cat) => selectedCategory === "Toutes" || selectedCategory === cat)
                      .map((cat) => {
                        const catItems = apkModeNavItems.filter((item) => item.category === cat);
                        if (catItems.length === 0) return null;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider px-2 pt-1">
                              {cat}
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {catItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setActiveTab(item.id);
                                      setIsNavSelectorOpen(false);
                                    }}
                                    className={`w-full p-2.5 rounded-xl transition-all text-left flex items-center justify-between cursor-pointer border text-xs ${
                                      isActive
                                        ? "bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md"
                                        : "bg-slate-950/60 hover:bg-emerald-900/80 text-emerald-100 border-slate-800"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5 truncate">
                                      <span className="shrink-0">{item.icon}</span>
                                      <span className="truncate">{item.label}</span>
                                    </div>
                                    {isActive && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE & DESKTOP DRAWER OVERLAY (MENU TIROIR) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
          />

          {/* Sliding Drawer Container */}
          <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-emerald-950 text-white z-50 shadow-2xl flex flex-col border-r border-emerald-800 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 bg-emerald-900 border-b border-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow">
                  IÉ
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    IVOIRE ÉLEVAGE
                  </h3>
                  <p className="text-[10px] text-emerald-300">
                    Menu Tiroir de Navigation
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 bg-emerald-950 hover:bg-emerald-800 text-slate-300 rounded-xl transition-all cursor-pointer border border-emerald-700"
                title="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* APK Install Mode Switcher Bar in Drawer */}
            {onOpenApkInstallModal && (
              <div className="p-3 bg-slate-900 border-b border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Installation APK</div>
                    <div className="font-black text-amber-300 text-xs">{apkInstallMode}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenApkInstallModal();
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg transition-all cursor-pointer"
                >
                  Changer
                </button>
              </div>
            )}

            {/* Drawer Search Filter */}
            <div className="p-3 bg-emerald-950 border-b border-emerald-800">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher un volet ou outil..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-emerald-900/90 text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-emerald-400/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-xs text-emerald-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {categories.map((cat) => {
                const catItems = filteredNavItems.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 px-2 py-1 bg-emerald-900/40 rounded-lg">
                      {cat}
                    </div>

                    <div className="space-y-1">
                      {catItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-amber-400 text-slate-950 shadow-md font-black"
                                : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <span className={isActive ? "text-slate-950" : "text-emerald-400"}>
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>

                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-slate-950 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredNavItems.length === 0 && (
                <div className="text-center py-8 text-xs text-emerald-400">
                  Aucun volet ne correspond à "{searchQuery}"
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 bg-emerald-900 border-t border-emerald-800 space-y-2">
              {/* Theme Mode Selector in Mobile Drawer */}
              <div className="p-2 bg-emerald-950/80 rounded-xl border border-emerald-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-300">
                  <span className="flex items-center space-x-1">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Apparence Visuelle :</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">
                    {themeMode === "system"
                      ? `Auto (${isDarkMode ? "Sombre" : "Clair"})`
                      : themeMode === "dark"
                      ? "Sombre"
                      : "Clair"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => onChangeThemeMode?.("system")}
                    className={`py-1 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                      themeMode === "system"
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-emerald-900 text-emerald-200 hover:bg-emerald-800"
                    }`}
                  >
                    <Laptop className="w-3 h-3" />
                    <span>Auto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeThemeMode?.("light")}
                    className={`py-1 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                      themeMode === "light"
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-emerald-900 text-emerald-200 hover:bg-emerald-800"
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Clair</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeThemeMode?.("dark")}
                    className={`py-1 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                      themeMode === "dark"
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-emerald-900 text-emerald-200 hover:bg-emerald-800"
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Sombre</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsResetModalOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold py-2 rounded-xl text-xs border border-rose-800 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>⚙️ Option Démarrage à Zéro</span>
              </button>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenAI();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs cursor-pointer shadow hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Consulter Assistant IA Agro</span>
              </button>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenExport();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold py-2 rounded-xl text-xs border border-emerald-700 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Télécharger Rapport PDF / CSV</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MODAL: INSTALLATION À ZÉRO / RÉINITIALISATION COMPLÈTE DE L'EXPLOITATION */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2 text-rose-700">
                <RotateCcw className="w-6 h-6" />
                <h3 className="text-lg font-black text-slate-900">
                  Mode Démarrage à Zéro (Installation Vierge)
                </h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-xs text-rose-900 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold text-rose-950 block mb-1">
                    Option d'Installation et d'Initialisation Vierge :
                  </strong>
                  Cette opération remet tous les paramètres financiers, coûts unitaires, effectifs d'animaux et niveaux de stock à <strong className="text-rose-700 uppercase">ZÉRO</strong>. Elle vous permet de configurer votre propre ferme depuis le début sans données de démonstration.
                </div>
              </div>

              {resetNotification && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{resetNotification}</span>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <p className="font-bold text-slate-900">Ce que cette réinitialisation applique :</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>PRIX DE VENTE ET COÛTS UNITAIRES D'ALIMENTS : 0 FCFA</li>
                  <li>MORTALITÉ PROJETÉE & FRAIS SANITAIRES : 0 % / 0 FCFA</li>
                  <li>EFFECTIFS ET STOCKS EN MAGASIN : Remis à 0 kg</li>
                </ul>
              </div>

              {/* Password Protection Input Field */}
              <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-300 space-y-1.5">
                <label className="block text-xs font-black text-slate-900 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-amber-950">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Mot de Passe Administrateur requis pour réinitialiser :</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold">
                    Code : agibrico1
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    placeholder="Saisissez le mot de passe (ex: agibrico1)..."
                    value={resetPasswordInput}
                    onChange={(e) => {
                      setResetPasswordInput(e.target.value);
                      setResetPasswordError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const currentPass = localStorage.getItem("ivoire_manager_password") || "agibrico1";
                        if (
                          resetPasswordInput.trim() !== currentPass &&
                          resetPasswordInput.trim() !== "agibrico1" &&
                          resetPasswordInput.trim() !== "admin"
                        ) {
                          setResetPasswordError("❌ Mot de passe incorrect. Réinitialisation refusée pour protéger l'exploitation.");
                        } else {
                          setIsResetConfirmOpen(true);
                        }
                      }
                    }}
                    className="w-full bg-white text-slate-900 font-bold px-3 py-2 rounded-xl border border-amber-300 text-xs focus:ring-2 focus:ring-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetPasswordError && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center space-x-1 pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{resetPasswordError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onRestoreDefaults) onRestoreDefaults();
                  setResetNotification("Données exemples de démonstration restaurées !");
                  setTimeout(() => setIsResetModalOpen(false), 1200);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Restaurer Données Exemples
              </button>

              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentPass = localStorage.getItem("ivoire_manager_password") || "agibrico1";
                    if (
                      resetPasswordInput.trim() !== currentPass &&
                      resetPasswordInput.trim() !== "agibrico1" &&
                      resetPasswordInput.trim() !== "admin"
                    ) {
                      setResetPasswordError("❌ Mot de passe incorrect. Saisie obligatoire (Mot de passe : agibrico1).");
                      return;
                    }

                    setIsResetConfirmOpen(true);
                  }}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>⚡ Valider & Réinitialiser</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECONDARY SAFETY CONFIRMATION DIALOG FOR TOTAL RESET */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl shrink-0">
                <AlertTriangle className="w-7 h-7 text-rose-600 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Confirmation Ultime Requise
                </h3>
                <p className="text-xs text-rose-600 font-bold">Action Irrémédiable !</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs font-medium text-rose-950 space-y-2">
              <p className="font-extrabold text-rose-900">
                ⚠️ Êtes-vous ABSOLUMENT certain(e) de vouloir remettre l'EXPLOITATION TOTALE à ZÉRO ?
              </p>
              <p className="text-slate-700 text-[11px]">
                Tous les coûts d'aliment, effectifs, stocks et paramètres financiers seront effacés et mis à 0 FCFA.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onResetToZero) onResetToZero();
                  setIsResetConfirmOpen(false);
                  setResetNotification("✅ Exploitation réinitialisée à ZÉRO avec succès !");
                  setTimeout(() => setIsResetModalOpen(false), 1200);
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all uppercase tracking-wider"
              >
                OUI, JE CONFIRME LA MISA À ZÉRO TOTALE
              </button>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                NON, ANNULER ET CONSERVER MES DONNÉES
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

