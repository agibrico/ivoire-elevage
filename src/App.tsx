import React, { useState, useEffect } from "react";
import { ActiveTab, UnitCosts } from "./types";
import { defaultUnitCosts } from "./data/businessPlanData";
import { Navbar } from "./components/Navbar";
import { OfflineStatusBanner } from "./components/OfflineStatusBanner";
import { loadUnitCostsFromCache, saveUnitCostsToCache } from "./utils/offlineStorage";
import { DashboardView } from "./components/DashboardView";
import { AvicultureView } from "./components/AvicultureView";
import { PorcicultureView } from "./components/PorcicultureView";
import { MonthlyPhaseView } from "./components/MonthlyPhaseView";
import { Financials5YearView } from "./components/Financials5YearView";
import { UnitCostsView } from "./components/UnitCostsView";
import { HRAndInfraView } from "./components/HRAndInfraView";
import { GlobalSimulatorView } from "./components/GlobalSimulatorView";
import { SalesManagementView } from "./components/SalesManagementView";
import { FeedGrowthManagementView } from "./components/FeedGrowthManagementView";
import { TasksAndHealthView } from "./components/TasksAndHealthView";
import { FarrowingAndBreedingView } from "./components/FarrowingAndBreedingView";
import { FarmCensusAndMovementsView } from "./components/FarmCensusAndMovementsView";
import { FinancialDashboardView } from "./components/FinancialDashboardView";
import { SuppliersManagementView } from "./components/SuppliersManagementView";
import { AuditLogView } from "./components/AuditLogView";
import { AIFeatureStudioView } from "./components/AIFeatureStudioView";
import { EmailAlertConfigModal } from "./components/EmailAlertConfigModal";
import { DateRestoreModal } from "./components/DateRestoreModal";
import { AIAdvisorModal } from "./components/AIAdvisorModal";
import { ExportReportModal } from "./components/ExportReportModal";
import { AuthSessionManagementModal } from "./components/AuthSessionManagementModal";
import { APKInstallModeModal } from "./components/APKInstallModeModal";
import { OnboardingGuideModal } from "./components/OnboardingGuideModal";
import { DailyAISynthesisModal } from "./components/DailyAISynthesisModal";
import { AppLockScreen } from "./components/AppLockScreen";
import { getApkInstallMode } from "./utils/apkInstallStore";
import { getCurrentUserSession } from "./data/authStore";
import { UserSession, ApkInstallMode } from "./types";
import { Home, ArrowLeft, ChevronRight, Bot, ShieldCheck, UserCheck, Smartphone } from "lucide-react";

const TAB_TITLES: Record<ActiveTab, string> = {
  dashboard: "Tableau de Bord Général",
  financial_dashboard: "Tableau de Bord Financier (P&L, Rentabilité)",
  suppliers_management: "Gestion des Fournisseurs & Achats",
  aviculture: "Volet Avicole (Poulets & Œufs)",
  porciculture: "Volet Porcin (Engraissement & Carcasses)",
  reproduction_maternity: "Mises Bas & Reproduction Porcine",
  farm_census: "Effectifs Fermes & Stocks Aliments",
  monthly: "Phase Initiale (M1-M5)",
  financials5y: "Plan 5 Ans (2027-2031)",
  unitcosts: "Paramètres & Coûts Unitaires",
  hrinfra: "RH & Bâtiments",
  simulator: "Simulateur Global",
  sales: "Ventes, Carnet Clients & Objectifs IA",
  feedmode: "Mode Alimentaire & Décision IA",
  tasks_health: "Tâches & Suivi Sanitaire",
  audit_log: "Historique des Modifications & Traçabilité",
  ai_studio: "Studio Extension IA & Modules Logiciel",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>(["dashboard"]);
  const [unitCosts, setUnitCosts] = useState<UnitCosts>(() => {
    const cached = loadUnitCostsFromCache();
    return cached || defaultUnitCosts;
  });

  // Global Dark / System Theme Mode state ('system' | 'light' | 'dark')
  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">(() => {
    const saved = localStorage.getItem("ivoire_theme_mode");
    if (saved === "system" || saved === "light" || saved === "dark") {
      return saved as "system" | "light" | "dark";
    }
    const savedOld = localStorage.getItem("ivoire_dark_mode");
    if (savedOld !== null) {
      return JSON.parse(savedOld) ? "dark" : "light";
    }
    return "system";
  });

  const [effectiveDarkMode, setEffectiveDarkMode] = useState<boolean>(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("ivoire_theme_mode", themeMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let isDark = false;
      if (themeMode === "dark") {
        isDark = true;
      } else if (themeMode === "light") {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      setEffectiveDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    const handleSystemThemeChange = () => {
      if (themeMode === "system") {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [themeMode]);

  const handleToggleDarkMode = () => {
    if (themeMode === "system") {
      setThemeMode(effectiveDarkMode ? "light" : "dark");
    } else if (themeMode === "dark") {
      setThemeMode("light");
    } else {
      setThemeMode("dark");
    }
  };

  // User Session & Auth state
  const [currentUserSession, setCurrentUserSession] = useState<UserSession>(getCurrentUserSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // APK Installation Mode state (ADMINISTRATION_GENERALE | AVIVOIRE | PORCIVOIRE)
  const [apkInstallMode, setApkInstallMode] = useState<ApkInstallMode>(() => getApkInstallMode());
  const [isApkInstallModalOpen, setIsApkInstallModalOpen] = useState<boolean>(false);

  // Handle successful unlock from AppLockScreen (email recognition & automatic UI adapt)
  const handleAppUnlocked = (user: UserSession) => {
    setCurrentUserSession(user);
    setIsUnlocked(true);

    // Reinstallation & Email recognition logic: Auto-adapt interface & APK mode
    if (user.assignedWorkerRole === "PORCHER" || user.email?.includes("porcivoire") || user.department === "Porciculture") {
      setApkInstallMode("PORCIVOIRE");
      setActiveTab("tasks_health");
    } else if (user.assignedWorkerRole === "VOLAILLER" || user.email?.includes("avivoire") || user.department === "Aviculture") {
      setApkInstallMode("AVIVOIRE");
      setActiveTab("tasks_health");
    } else if (user.role === "ADMIN_GENERAL") {
      setApkInstallMode("ADMINISTRATION_GENERALE");
    }
  };

  // Onboarding & Daily Synthesis Modal States
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isDailySynthesisModalOpen, setIsDailySynthesisModalOpen] = useState<boolean>(false);

  // Auto trigger onboarding on first access of a mode if not dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(`ivoire_onboarding_dismissed_${apkInstallMode}`);
      if (dismissed !== "true") {
        setIsOnboardingModalOpen(true);
      }
    } catch (e) {}
  }, [apkInstallMode]);

  // Auto redirect if active tab is hidden in current APK mode
  useEffect(() => {
    if (apkInstallMode === "AVIVOIRE" && (activeTab === "porciculture" || activeTab === "reproduction_maternity")) {
      setActiveTab("aviculture");
    } else if (apkInstallMode === "PORCIVOIRE" && activeTab === "aviculture") {
      setActiveTab("porciculture");
    }
  }, [apkInstallMode, activeTab]);

  // Email Alerts Modal state
  const [isEmailAlertsOpen, setIsEmailAlertsOpen] = useState(false);

  // Date Restore Modal state
  const [isDateRestoreOpen, setIsDateRestoreOpen] = useState(false);

  useEffect(() => {
    saveUnitCostsToCache(unitCosts);
  }, [unitCosts]);

  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [aiAnalysisType, setAiAnalysisType] = useState<"general" | "sanitary_preventive_audit">("general");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleOpenAIAdvisor = (prompt?: string, type: "general" | "sanitary_preventive_audit" = "general") => {
    setAiInitialPrompt(prompt);
    setAiAnalysisType(type);
    setIsAIOpen(true);
  };

  const handleSetActiveTab = (newTab: ActiveTab) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, newTab]);
      setActiveTab(newTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoHome = () => {
    if (activeTab !== "dashboard") {
      setTabHistory((prev) => [...prev, "dashboard"]);
      setActiveTab("dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      updated.pop(); // remove current tab
      const prev = updated[updated.length - 1];
      setTabHistory(updated);
      setActiveTab(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActiveTab("dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetToZero = () => {
    const zeroed: UnitCosts = {
      chickPrice: 0,
      chickTransport: 0,
      starterFeedPricePerKg: 0,
      growerFeedPricePerKg: 0,
      finisherFeedPricePerKg: 0,
      veterinaryCostPerChick: 0,
      energyCostPerChick: 0,
      litterCostPerChick: 0,
      poultryMortalityRate: 0,
      chickenSalePricePerKg: 0,
      pigletPurchasePrice: 0,
      pigletTransport: 0,
      pigStarterFeedPricePerKg: 0,
      pigGrowerFeedPricePerKg: 0,
      pigFinisherFeedPricePerKg: 0,
      pigGestationFeedPricePerKg: 0,
      pigLactationFeedPricePerKg: 0,
      veterinaryCostPerPig: 0,
      porkMortalityRate: 0,
      porkSalePricePerKg: 0,
      cornPricePerKg: 0,
      soybeanPricePerKg: 0,
      premixPricePerKg: 0,
      branPricePerKg: 0,
    };
    setUnitCosts(zeroed);
    saveUnitCostsToCache(zeroed);
  };

  const handleRestoreDefaults = () => {
    setUnitCosts(defaultUnitCosts);
    saveUnitCostsToCache(defaultUnitCosts);
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors duration-300 ${effectiveDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      
      {/* PASSWORD GATEKEEPER BEFORE DISPLAYING ANY APPLICATION INTERFACE */}
      {!isUnlocked && (
        <AppLockScreen onUnlocked={handleAppUnlocked} />
      )}

      {/* Main Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onResetToZero={handleResetToZero}
        onRestoreDefaults={handleRestoreDefaults}
        isDarkMode={effectiveDarkMode}
        themeMode={themeMode}
        onToggleDarkMode={handleToggleDarkMode}
        onChangeThemeMode={(mode) => setThemeMode(mode)}
        onOpenEmailAlerts={() => setIsEmailAlertsOpen(true)}
        onOpenDateRestore={() => setIsDateRestoreOpen(true)}
        apkInstallMode={apkInstallMode}
        onOpenApkInstallModal={() => setIsApkInstallModalOpen(true)}
        onOpenOnboardingModal={() => setIsOnboardingModalOpen(true)}
      />

      {/* Offline Status & Local Cache Banner */}
      <OfflineStatusBanner />

      {/* Quick Navigation Toolbar (Home & Back Buttons) */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 shadow-inner px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Back & Home Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoHome}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title="Retourner à l'Accueil (Tableau de Bord Général)"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </button>

            <button
              onClick={handleGoBack}
              disabled={tabHistory.length <= 1 && activeTab === "dashboard"}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                tabHistory.length <= 1 && activeTab === "dashboard"
                  ? "bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800"
                  : "bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 cursor-pointer shadow"
              }`}
              title="Page ou interface précédente"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center space-x-1 text-slate-400 pl-2">
              <span className="text-slate-500">Ivoire Élevage</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-amber-300">
                {TAB_TITLES[activeTab] || activeTab}
              </span>
            </div>
          </div>

          {/* Quick Module Jump Badge & Session Button */}
          <div className="flex items-center space-x-2 text-[11px]">
            {/* Authenticated User Session Badge Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold border border-emerald-500/50 shadow transition-all cursor-pointer"
              title="Gérer les sessions, accréditations et activations d'agents"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>
                Session: <strong>{currentUserSession.fullName}</strong> ({currentUserSession.role})
              </span>
            </button>

            <span className="text-slate-400 hidden md:inline">| Accès:</span>
            <button
              onClick={() => handleSetActiveTab("sales")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === "sales"
                  ? "bg-amber-400 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50"
              }`}
            >
              💼 Ventes
            </button>
            <button
              onClick={() => handleSetActiveTab("financial_dashboard")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === "financial_dashboard"
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/50"
              }`}
            >
              📊 Financier
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            unitCosts={unitCosts}
            setActiveTab={handleSetActiveTab}
            apkInstallMode={apkInstallMode}
            onOpenDailySynthesis={() => setIsDailySynthesisModalOpen(true)}
            onOpenOnboardingGuide={() => setIsOnboardingModalOpen(true)}
          />
        )}

        {activeTab === "financial_dashboard" && (
          <FinancialDashboardView unitCosts={unitCosts} setActiveTab={handleSetActiveTab} />
        )}

        {activeTab === "suppliers_management" && (
          <SuppliersManagementView unitCosts={unitCosts} />
        )}

        {activeTab === "aviculture" && (
          <AvicultureView unitCosts={unitCosts} />
        )}

        {activeTab === "porciculture" && (
          <PorcicultureView unitCosts={unitCosts} />
        )}

        {activeTab === "reproduction_maternity" && (
          <FarrowingAndBreedingView unitCosts={unitCosts} />
        )}

        {activeTab === "farm_census" && (
          <FarmCensusAndMovementsView unitCosts={unitCosts} />
        )}

        {activeTab === "monthly" && <MonthlyPhaseView unitCosts={unitCosts} />}

        {activeTab === "financials5y" && <Financials5YearView unitCosts={unitCosts} />}

        {activeTab === "unitcosts" && (
          <UnitCostsView unitCosts={unitCosts} setUnitCosts={setUnitCosts} />
        )}

        {activeTab === "hrinfra" && (
          <HRAndInfraView unitCosts={unitCosts} setUnitCosts={setUnitCosts} />
        )}

        {activeTab === "simulator" && (
          <GlobalSimulatorView unitCosts={unitCosts} setUnitCosts={setUnitCosts} />
        )}

        {activeTab === "sales" && (
          <SalesManagementView unitCosts={unitCosts} />
        )}

        {activeTab === "feedmode" && (
          <FeedGrowthManagementView unitCosts={unitCosts} />
        )}

        {activeTab === "tasks_health" && (
          <TasksAndHealthView
            unitCosts={unitCosts}
            onOpenAIAdvisor={handleOpenAIAdvisor}
          />
        )}

        {activeTab === "audit_log" && (
          <AuditLogView
            unitCosts={unitCosts}
            onOpenAIAdvisor={handleOpenAIAdvisor}
          />
        )}

        {activeTab === "ai_studio" && (
          <AIFeatureStudioView unitCosts={unitCosts} />
        )}
      </main>

      {/* Floating Assistant Button for quick mobile/desktop access */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsAIOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 cursor-pointer border-2 border-white/40"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider">
            Conseiller IA Ivoire Élevage
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-amber-500 text-emerald-950 font-bold flex items-center justify-center text-xs">
              IÉ
            </div>
            <span className="font-bold text-white">IVOIRE ÉLEVAGE</span>
            <span className="text-emerald-400">— Holding Agro-Pastorale Intégrée</span>
          </div>

          <div className="text-center sm:text-right text-emerald-400">
            Aviculture & Porciculture • Plan d'Implantation, Coûts et Bénéfices
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmailAlertConfigModal
        isOpen={isEmailAlertsOpen}
        onClose={() => setIsEmailAlertsOpen(false)}
      />

      <DateRestoreModal
        isOpen={isDateRestoreOpen}
        onClose={() => setIsDateRestoreOpen(false)}
        currentUnitCosts={unitCosts}
        onRestoreUnitCosts={(restored) => {
          setUnitCosts(restored);
          saveUnitCostsToCache(restored);
        }}
      />

      <AIAdvisorModal
        isOpen={isAIOpen}
        onClose={() => {
          setIsAIOpen(false);
          setAiInitialPrompt(undefined);
          setAiAnalysisType("general");
        }}
        unitCosts={unitCosts}
        initialPrompt={aiInitialPrompt}
        initialAnalysisType={aiAnalysisType}
        onOpenStudio={() => setActiveTab("ai_studio")}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        unitCosts={unitCosts}
      />

      <AuthSessionManagementModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUserSession}
        onUserSessionChanged={(newUser) => setCurrentUserSession(newUser)}
      />

      <APKInstallModeModal
        isOpen={isApkInstallModalOpen}
        onClose={() => setIsApkInstallModalOpen(false)}
        currentMode={apkInstallMode}
        onModeChanged={(newMode, updatedUser) => {
          setApkInstallMode(newMode);
          if (updatedUser) {
            setCurrentUserSession(updatedUser);
          }
        }}
      />

      <OnboardingGuideModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        apkMode={apkInstallMode}
        onOpenApkInstallModal={() => setIsApkInstallModalOpen(true)}
      />

      <DailyAISynthesisModal
        isOpen={isDailySynthesisModalOpen}
        onClose={() => setIsDailySynthesisModalOpen(false)}
        apkMode={apkInstallMode}
      />
    </div>
  );
}
