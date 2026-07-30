import React, { useState, useEffect } from "react";
import { formatFCFA } from "../utils/formatters";
import { initialEmployees, getInfrastructures, getBuildingRentSavings } from "../data/businessPlanData";
import { Employee, UnitCosts } from "../types";
import { saveOfflineEntry } from "../utils/offlineStorage";
import { AnimalDensityCalculatorTool } from "./AnimalDensityCalculatorTool";
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Plus,
  Trash2,
  Edit3,
  Bot,
  Sparkles,
  Phone,
  Briefcase,
  CheckSquare,
  Award,
  Layers,
  Search,
  Filter,
  UserPlus,
  Send,
  X,
  Activity,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calculator,
  Wrench,
  Coins,
  FileSpreadsheet,
  Clock,
} from "lucide-react";

export interface AssetDepreciation {
  id: string;
  name: string;
  category: "Matériel Élevage" | "Bâtiments & Sol" | "Transport & Véhicules" | "Énergie & Eau" | "Transformations & Labo";
  acquisitionCostFCFA: number;
  residualValueFCFA: number;
  lifespanYears: number;
  acquisitionYear: number;
}

const initialAssets: AssetDepreciation[] = [
  {
    id: "asset-1",
    name: "Broyeur-Mélangeur d'Aliment (1.5 Tonne/h)",
    category: "Matériel Élevage",
    acquisitionCostFCFA: 3500000,
    residualValueFCFA: 200000,
    lifespanYears: 5,
    acquisitionYear: 2026,
  },
  {
    id: "asset-2",
    name: "Bâtiment Avicole Semi-Industriel 300m²",
    category: "Bâtiments & Sol",
    acquisitionCostFCFA: 8500000,
    residualValueFCFA: 1000000,
    lifespanYears: 10,
    acquisitionYear: 2026,
  },
  {
    id: "asset-3",
    name: "Porcherie Maternité & Engraissement (80 têtes)",
    category: "Bâtiments & Sol",
    acquisitionCostFCFA: 6000000,
    residualValueFCFA: 500000,
    lifespanYears: 10,
    acquisitionYear: 2026,
  },
  {
    id: "asset-4",
    name: "Groupe Électrogène Inverter 15 kVA",
    category: "Énergie & Eau",
    acquisitionCostFCFA: 2800000,
    residualValueFCFA: 300000,
    lifespanYears: 5,
    acquisitionYear: 2026,
  },
  {
    id: "asset-5",
    name: "Silo d'Aliment & Ligne Abreuvement Pipettes",
    category: "Matériel Élevage",
    acquisitionCostFCFA: 2100000,
    residualValueFCFA: 100000,
    lifespanYears: 5,
    acquisitionYear: 2026,
  },
  {
    id: "asset-6",
    name: "Tricycle / Camionnette Isotherme de Livraison",
    category: "Transport & Véhicules",
    acquisitionCostFCFA: 2500000,
    residualValueFCFA: 250000,
    lifespanYears: 4,
    acquisitionYear: 2026,
  },
];

interface HRAndInfraViewProps {
  unitCosts?: UnitCosts;
  setUnitCosts?: React.Dispatch<React.SetStateAction<UnitCosts>>;
}

export const HRAndInfraView: React.FC<HRAndInfraViewProps> = ({
  unitCosts,
  setUnitCosts,
}) => {
  // Infrastructure Savings
  const infrastructures = getInfrastructures(unitCosts);
  const savings = getBuildingRentSavings(unitCosts);

  // HR Employees State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [selectedModule, setSelectedModule] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sub-tabs in HR View
  const [activeSubTab, setActiveSubTab] = useState<"agents" | "analytics" | "ai_assistant" | "density_tool" | "buildings" | "depreciation">("agents");

  // Assets & Amortization State (Cached locally for offline access)
  const [assets, setAssets] = useState<AssetDepreciation[]>(() => {
    try {
      const saved = localStorage.getItem("ivoire_elevage_assets_v1");
      return saved ? JSON.parse(saved) : initialAssets;
    } catch (e) {
      return initialAssets;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ivoire_elevage_assets_v1", JSON.stringify(assets));
    } catch (e) {
      console.error(e);
    }
  }, [assets]);

  // Asset Form State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<AssetDepreciation | null>(null);
  const [assetName, setAssetName] = useState<string>("");
  const [assetCategory, setAssetCategory] = useState<AssetDepreciation["category"]>("Matériel Élevage");
  const [assetCost, setAssetCost] = useState<number>(3000000);
  const [assetResidual, setAssetResidual] = useState<number>(200000);
  const [assetLifespan, setAssetLifespan] = useState<number>(5);
  const [assetYear, setAssetYear] = useState<number>(2026);

  // Open Add Asset Modal
  const handleOpenAddAssetModal = (preset?: Partial<AssetDepreciation>) => {
    setEditingAsset(null);
    setAssetName(preset?.name || "");
    setAssetCategory(preset?.category || "Matériel Élevage");
    setAssetCost(preset?.acquisitionCostFCFA || 3000000);
    setAssetResidual(preset?.residualValueFCFA || 200000);
    setAssetLifespan(preset?.lifespanYears || 5);
    setAssetYear(preset?.acquisitionYear || 2026);
    setIsAssetModalOpen(true);
  };

  // Open Edit Asset Modal
  const handleOpenEditAssetModal = (asset: AssetDepreciation) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetCategory(asset.category);
    setAssetCost(asset.acquisitionCostFCFA);
    setAssetResidual(asset.residualValueFCFA);
    setAssetLifespan(asset.lifespanYears);
    setAssetYear(asset.acquisitionYear);
    setIsAssetModalOpen(true);
  };

  // Save Asset (Create / Edit)
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || assetCost <= 0 || assetLifespan <= 0) return;

    if (editingAsset) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingAsset.id
            ? {
                ...a,
                name: assetName,
                category: assetCategory,
                acquisitionCostFCFA: Number(assetCost),
                residualValueFCFA: Number(assetResidual),
                lifespanYears: Number(assetLifespan),
                acquisitionYear: Number(assetYear),
              }
            : a
        )
      );
      saveOfflineEntry("unit_costs", `Modification équipement amortissable : ${assetName}`, {
        action: "update_asset",
        assetName,
        assetCost,
      });
    } else {
      const newAsset: AssetDepreciation = {
        id: `asset-${Date.now()}`,
        name: assetName,
        category: assetCategory,
        acquisitionCostFCFA: Number(assetCost),
        residualValueFCFA: Number(assetResidual),
        lifespanYears: Number(assetLifespan),
        acquisitionYear: Number(assetYear),
      };
      setAssets((prev) => [...prev, newAsset]);
      saveOfflineEntry("unit_costs", `Ajout nouvel équipement amortissable : ${assetName}`, {
        action: "create_asset",
        assetName,
        assetCost,
      });
    }

    setIsAssetModalOpen(false);
  };

  // Delete Asset
  const handleDeleteAsset = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement du plan d'amortissement ?")) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      saveOfflineEntry("unit_costs", `Suppression équipement amortissable ID: ${id}`, { id });
    }
  };

  // Add/Edit Agent Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [formFullName, setFormFullName] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("");
  const [formAgentType, setFormAgentType] = useState<string>("");
  const [formSectorModule, setFormSectorModule] = useState<
    "Aviculture" | "Porciculture" | "Maternité & Élevage" | "Fabrique d'Aliments" | "Hygiène & Sanitaire" | "Administration & Ventes" | "Toutes Fermes"
  >("Aviculture");
  const [formSalary, setFormSalary] = useState<number>(75000);
  const [formBonus, setFormBonus] = useState<number>(15000);
  const [formStartDate, setFormStartDate] = useState<string>("Août 2026");
  const [formPhone, setFormPhone] = useState<string>("+225 07 00 00 00 00");
  const [formStatus, setFormStatus] = useState<"Actif" | "Congé" | "Inactif">("Actif");
  const [formTasks, setFormTasks] = useState<string[]>([
    "Suivi quotidien de l'alimentation et de l'eau",
    "Nettoyage et hygiène des installations",
  ]);
  const [newTaskInput, setNewTaskInput] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");

  // AI Assistant Drawer / Chat State
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Calculation Metrics
  const totalEmployeesCount = employees.length;
  const totalMonthlyBaseSalary = employees.reduce((sum, e) => sum + e.monthlySalaryFCFA, 0);
  const totalMonthlyBonus = employees.reduce((sum, e) => sum + e.monthlyBonusFCFA, 0);
  const totalMonthlyHRBudget = totalMonthlyBaseSalary + totalMonthlyBonus;

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesModule =
      selectedModule === "Tous" ||
      emp.sectorModule === selectedModule ||
      emp.sector === selectedModule;
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.agentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  // Building Acquisition Toggles
  const toggleAvicoleAcquisition = () => {
    if (!setUnitCosts) return;
    setUnitCosts((prev) => ({
      ...prev,
      isAvicoleAcquired: !prev.isAvicoleAcquired,
    }));
  };

  const togglePorcinAcquisition = () => {
    if (!setUnitCosts) return;
    setUnitCosts((prev) => ({
      ...prev,
      isPorcinAcquired: !prev.isPorcinAcquired,
    }));
  };

  const toggleAcquireAll = () => {
    if (!setUnitCosts) return;
    const allAcquired = savings.isAvicoleAcquired && savings.isPorcinAcquired;
    setUnitCosts((prev) => ({
      ...prev,
      isAvicoleAcquired: !allAcquired,
      isPorcinAcquired: !allAcquired,
    }));
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormFullName("");
    setFormRole("Technicien Éleveur");
    setFormAgentType("Technicien Suivi Élevage");
    setFormSectorModule("Aviculture");
    setFormSalary(70000);
    setFormBonus(15000);
    setFormStartDate("Août 2026");
    setFormPhone("+225 07 00 00 00 00");
    setFormStatus("Actif");
    setFormTasks([
      "Rationnement quotidien et surveillance des abreuvoirs",
      "Saisie des fiches de mortalité et pesée hebdomadaire",
    ]);
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormFullName(emp.fullName);
    setFormRole(emp.role);
    setFormAgentType(emp.agentType);
    setFormSectorModule(emp.sectorModule || emp.sector || "Aviculture");
    setFormSalary(emp.monthlySalaryFCFA);
    setFormBonus(emp.monthlyBonusFCFA || 0);
    setFormStartDate(emp.startDate);
    setFormPhone(emp.contactPhone || "+225 07 00 00 00 00");
    setFormStatus(emp.status || "Actif");
    setFormTasks(emp.assignedTasks && emp.assignedTasks.length > 0 ? [...emp.assignedTasks] : ["Tâche principale"]);
    setFormNotes(emp.notes || "");
    setIsModalOpen(true);
  };

  // Add Task to Form
  const handleAddTaskToForm = () => {
    if (!newTaskInput.trim()) return;
    setFormTasks((prev) => [...prev, newTaskInput.trim()]);
    setNewTaskInput("");
  };

  // Remove Task from Form
  const handleRemoveTaskFromForm = (index: number) => {
    setFormTasks((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Agent (Create / Edit)
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formAgentType.trim()) return;

    if (editingEmployee) {
      // Edit existing
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id
            ? {
                ...emp,
                fullName: formFullName,
                role: formRole,
                agentType: formAgentType,
                sector: formSectorModule,
                sectorModule: formSectorModule,
                monthlySalaryFCFA: Number(formSalary),
                monthlyBonusFCFA: Number(formBonus),
                startDate: formStartDate,
                contactPhone: formPhone,
                status: formStatus,
                assignedTasks: formTasks,
                notes: formNotes,
              }
            : emp
        )
      );
    } else {
      // Create new
      const newEmp: Employee = {
        id: `emp-custom-${Date.now()}`,
        fullName: formFullName,
        role: formRole || "Agent de Ferme",
        agentType: formAgentType,
        sector: formSectorModule,
        sectorModule: formSectorModule,
        startDate: formStartDate,
        monthlySalaryFCFA: Number(formSalary),
        monthlyBonusFCFA: Number(formBonus),
        assignedTasks: formTasks,
        contactPhone: formPhone,
        status: formStatus,
        performanceScore: 95,
        notes: formNotes,
      };
      setEmployees((prev) => [...prev, newEmp]);
    }

    setIsModalOpen(false);
  };

  // Delete Agent
  const handleDeleteEmployee = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet agent RH ?")) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Toggle Employee Task Directly in List
  const handleToggleTaskInList = (empId: string, taskIdx: number) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const updatedTasks = [...emp.assignedTasks];
        if (updatedTasks[taskIdx].startsWith("✓ ")) {
          updatedTasks[taskIdx] = updatedTasks[taskIdx].replace("✓ ", "");
        } else {
          updatedTasks[taskIdx] = "✓ " + updatedTasks[taskIdx];
        }
        return { ...emp, assignedTasks: updatedTasks };
      })
    );
  };

  // Query AI HR Assistant
  const handleAskAiAssistant = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiPromptInput;
    if (!promptToSend.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    const contextPayload = {
      employeesCount: employees.length,
      totalBaseSalary: totalMonthlyBaseSalary,
      totalBonus: totalMonthlyBonus,
      totalHRBudget: totalMonthlyHRBudget,
      employeesSummary: employees.map((e) => ({
        name: e.fullName,
        agentType: e.agentType,
        module: e.sectorModule,
        salary: e.monthlySalaryFCFA,
        bonus: e.monthlyBonusFCFA,
        tasksCount: e.assignedTasks.length,
      })),
    };

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `[ASSISTANT IA VOLET RH & PERSONNEL] : ${promptToSend}`,
          context: contextPayload,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiResponse(data.error || "Erreur de réponse de l'assistant IA RH.");
      }
    } catch (err: any) {
      setAiResponse("Erreur de connexion avec l'IA RH : " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Ressources Humaines & Organisation</span>
              </span>
              <span className="text-emerald-300 text-xs font-medium">• Ivoire Élevage Holding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gestion du Personnel & Affiliation par Module
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Définissez les types d'agents (vétérinaire, éleveur, meunier, commercial), leurs salaires fixes, bonus de performance, fiches de postes et affectations par module avec l'assistance IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right backdrop-blur">
              <div className="text-[11px] text-slate-400">Effectif Actif</div>
              <div className="text-xl font-extrabold text-amber-400">
                {totalEmployeesCount} Agents
              </div>
              <div className="text-[10px] text-emerald-400">Secteurs & Modules</div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right backdrop-blur">
              <div className="text-[11px] text-slate-400">Masse Salariale + Primes</div>
              <div className="text-xl font-extrabold text-emerald-400">
                {formatFCFA(totalMonthlyHRBudget)} / mois
              </div>
              <div className="text-[10px] text-slate-300">
                Fixe : {formatFCFA(totalMonthlyBaseSalary)} | Primes : {formatFCFA(totalMonthlyBonus)}
              </div>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau Personnel RH</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab("agents")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "agents"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Répertoire du Personnel & Tâches ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "analytics"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Répartition Masse Salariale par Module</span>
          </button>

          <button
            onClick={() => setActiveSubTab("density_tool")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "density_tool"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-amber-950/80 text-amber-300 border border-amber-700/60 hover:bg-amber-900"
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>📐 Calcul Densité Animale & Mesure Caméra</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ai_assistant")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "ai_assistant"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black animate-pulse"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900"
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>🤖 Assistant IA RH & Fiches de Poste</span>
          </button>

          <button
            onClick={() => setActiveSubTab("buildings")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "buildings"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Bâtiments & Déductions Loyers</span>
          </button>

          <button
            onClick={() => setActiveSubTab("depreciation")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "depreciation"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-300" />
            <span>📊 Amortissement Linéaire Matériel & Infra</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AGENTS & TASKS */}
      {activeSubTab === "agents" && (
        <div className="space-y-6">
          {/* Search and Module Filter */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher un agent par nom, type de poste ou compétence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 shrink-0">Module :</span>
              {[
                "Tous",
                "Aviculture",
                "Porciculture",
                "Maternité & Élevage",
                "Fabrique d'Aliments",
                "Hygiène & Sanitaire",
                "Administration & Ventes",
              ].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedModule(mod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedModule === mod
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          emp.sectorModule === "Aviculture"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : emp.sectorModule === "Porciculture" || emp.sectorModule === "Maternité & Élevage"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : emp.sectorModule === "Fabrique d'Aliments"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : emp.sectorModule === "Hygiène & Sanitaire"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {emp.sectorModule || emp.sector}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {emp.fullName}
                      </h3>
                      <p className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                        {emp.agentType}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                        title="Modifier cet agent"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financials & Dates */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Salaire Fixe</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatFCFA(emp.monthlySalaryFCFA)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Bonus / Primes</span>
                      <span className="font-extrabold text-amber-700 text-sm">
                        +{formatFCFA(emp.monthlyBonusFCFA || 0)}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Embauche : {emp.startDate}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {emp.contactPhone || "Non renseigné"}
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fiche de Poste & Tâches ({emp.assignedTasks?.length || 0})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Cliquer pour cocher</span>
                    </div>

                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs">
                      {emp.assignedTasks && emp.assignedTasks.length > 0 ? (
                        emp.assignedTasks.map((t, idx) => {
                          const isDone = t.startsWith("✓ ");
                          return (
                            <div
                              key={idx}
                              onClick={() => handleToggleTaskInList(emp.id, idx)}
                              className={`p-2 rounded-lg border text-[11px] cursor-pointer transition-all flex items-start space-x-2 ${
                                isDone
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 line-through opacity-80"
                                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded border border-slate-300" />
                                )}
                              </span>
                              <span className="leading-tight">{t.replace("✓ ", "")}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-slate-400 italic p-2 bg-slate-50 rounded">
                          Aucune tâche attribuée pour le moment.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                {emp.notes && (
                  <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100 leading-snug">
                    💡 <strong>Note RH :</strong> {emp.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANALYTICS & HR BUDGET BREAKDOWN */}
      {activeSubTab === "analytics" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Répartition Budgétaire de la Masse Salariale par Module</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "Aviculture",
              "Porciculture",
              "Maternité & Élevage",
              "Fabrique d'Aliments",
              "Hygiène & Sanitaire",
              "Administration & Ventes",
            ].map((moduleName) => {
              const modAgents = employees.filter((e) => e.sectorModule === moduleName || e.sector === moduleName);
              const modSalary = modAgents.reduce((sum, e) => sum + e.monthlySalaryFCFA, 0);
              const modBonus = modAgents.reduce((sum, e) => sum + e.monthlyBonusFCFA, 0);
              const modTotal = modSalary + modBonus;
              const percentOfTotal = totalMonthlyHRBudget > 0 ? (modTotal / totalMonthlyHRBudget) * 100 : 0;

              return (
                <div
                  key={moduleName}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{moduleName}</span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {modAgents.length} agent(s)
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black text-slate-900">{formatFCFA(modTotal)} / mois</div>
                    <div className="text-xs text-slate-500">
                      Fixe : {formatFCFA(modSalary)} | Primes : {formatFCFA(modBonus)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Part du budget RH</span>
                      <span className="font-bold text-slate-800">{percentOfTotal.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AI HR ASSISTANT */}
      {activeSubTab === "ai_assistant" && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 rounded-xl text-slate-950 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold flex items-center space-x-2">
                  <span>Assistant Vétérinaire & Conseiller RH Ivoire Élevage</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-300">
                  Générez des fiches de postes, des critères de primes, ou optimisez la répartition des tâches par secteur.
                </p>
              </div>
            </div>
          </div>

          {/* Quick AI Action Buttons */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-300">💡 Demandes instantanées proposées par l'IA :</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleAskAiAssistant(
                    "Génère une fiche de poste détaillée avec 5 tâches opérationnelles de biosécurité et 1 critère de prime de performance pour un Technicien Avicole Senior."
                  )
                }
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <span>📋 Fiche de poste & Tâches Technicien Avicole</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() =>
                  handleAskAiAssistant(
                    "Propose une grille de calcul de bonus/primes mensuels pour le personnel de maternité porcine basée sur le taux de sevrage (ex: >11 porcelets/truie)."
                  )
                }
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <span>📈 Grille de primes de sevrage porcin</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() =>
                  handleAskAiAssistant(
                    "Analyse l'équité de la masse salariale actuelle et suggère une stratégie de recrutement d'un aide-soignant pour la fabrique d'aliment."
                  )
                }
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <span>⚖️ Audit de masse salariale & recrutement</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() =>
                  handleAskAiAssistant(
                    "Rédige un programme d'hygiène et de nettoyage hebdomadaire à affecter au deuxième porcher."
                  )
                }
                className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <span>🛡️ Planning hygiène pour porcherie</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Posez votre question RH à l'IA (ex: Comment motiver le personnel sur le taux de conversion aliment ?)..."
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAiAssistant()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => handleAskAiAssistant()}
              disabled={isAiLoading || !aiPromptInput.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition-all shrink-0"
            >
              {isAiLoading ? (
                <span>Analyse en cours...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </>
              )}
            </button>
          </div>

          {/* AI Output Response */}
          {aiResponse && (
            <div className="p-5 bg-slate-800/90 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs">
                <Bot className="w-4 h-4" />
                <span>Recommandation Conseils RH & Vétérinaire Gemini :</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: ANIMAL DENSITY & CAMERA ROOM MEASURER */}
      {activeSubTab === "density_tool" && (
        <AnimalDensityCalculatorTool unitCosts={unitCosts} />
      )}

      {/* SUB-TAB 4: BUILDINGS & RENT DEDUCTION CONTROL */}
      {activeSubTab === "buildings" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/60 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-emerald-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-800 rounded-xl text-amber-400">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">
                    Option d'Acquisition des Bâtiments (Retirer les Sommes de Location)
                  </h3>
                  <p className="text-emerald-200 text-xs mt-0.5">
                    Cochez les bâtiments acquis en propre pour supprimer automatiquement leurs loyers mensuels et avances de vos charges.
                  </p>
                </div>
              </div>

              <button
                onClick={toggleAcquireAll}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow cursor-pointer border ${
                  savings.isAvicoleAcquired && savings.isPorcinAcquired
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
                }`}
              >
                {savings.isAvicoleAcquired && savings.isPorcinAcquired
                  ? "Remettre tous en location"
                  : "Acquérir tous les bâtiments (Déduire les locations)"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bâtiment Avicole Control */}
              <div
                onClick={toggleAvicoleAcquisition}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  savings.isAvicoleAcquired
                    ? "bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50"
                    : "bg-slate-800/80 border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm flex items-center space-x-2">
                    <span>Bâtiment Avicole Principal</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        savings.isAvicoleAcquired
                          ? "bg-emerald-800 text-emerald-200"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {savings.isAvicoleAcquired ? "Acquis / Propriétaire" : "En Location (50k/mois)"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {savings.isAvicoleAcquired
                      ? "0 FCFA de loyer + 0 FCFA d'avance au démarrage (Retirés du compte de résultat)"
                      : "Loyer : 50 000 FCFA/mois | Avance M1 : 200 000 FCFA"}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={savings.isAvicoleAcquired}
                  onChange={toggleAvicoleAcquisition}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Porcherie Control */}
              <div
                onClick={togglePorcinAcquisition}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  savings.isPorcinAcquired
                    ? "bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50"
                    : "bg-slate-800/80 border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm flex items-center space-x-2">
                    <span>Porcherie d'Engraissement (80 têtes)</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        savings.isPorcinAcquired
                          ? "bg-amber-800 text-amber-200"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {savings.isPorcinAcquired ? "Acquise / Propriétaire" : "En Location (20k/mois)"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {savings.isPorcinAcquired
                      ? "0 FCFA de loyer (20 000 FCFA/mois retirés du compte de résultat)"
                      : "Loyer : 20 000 FCFA/mois"}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={savings.isPorcinAcquired}
                  onChange={togglePorcinAcquisition}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Dynamic Savings Impact Banner */}
            {(savings.isAvicoleAcquired || savings.isPorcinAcquired) && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Impact immédiat sur les comptes de la holding :</span>
                </div>
                <div className="flex items-center space-x-4 font-extrabold text-amber-300 text-sm">
                  <span>-{formatFCFA(savings.totalMonthlyRentSaved)} / mois</span>
                  <span>-{formatFCFA(savings.totalYearlyRentSaved)} / an</span>
                  {savings.startupAdvanceSaved > 0 && (
                    <span className="text-emerald-300">
                      -{formatFCFA(savings.startupAdvanceSaved)} au démarrage (M1)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Building className="w-5 h-5 text-amber-600" />
              <span>Infrastructures & Capacités des Sites</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infrastructures.map((infra) => (
                <div
                  key={infra.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{infra.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        infra.monthlyRentFCFA === 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {infra.monthlyRentFCFA === 0 ? "Propriété Directe" : "En Location"}
                    </span>
                  </div>

                  <div className="text-slate-600 leading-relaxed">{infra.notes}</div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 font-medium">
                    <div>
                      <span className="text-slate-500">Capacité :</span>{" "}
                      <span className="text-slate-900 font-bold">{infra.capacity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">Loyer/Entretien :</span>{" "}
                      <span
                        className={`font-bold ${
                          infra.monthlyRentFCFA === 0 ? "text-emerald-700" : "text-amber-800"
                        }`}
                      >
                        {infra.monthlyRentFCFA > 0
                          ? `${formatFCFA(infra.monthlyRentFCFA)} / mois`
                          : "0 FCFA (Acquis / Propre)"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: LINEAR DEPRECIATION CALCULATOR (AMORTISSEMENT LINÉAIRE MATÉRIEL & INFRASTRUCTURES) */}
      {activeSubTab === "depreciation" && (() => {
        const totalAcquisitionCost = assets.reduce((sum, a) => sum + a.acquisitionCostFCFA, 0);
        const totalResidualValue = assets.reduce((sum, a) => sum + a.residualValueFCFA, 0);
        const totalDepreciableBase = totalAcquisitionCost - totalResidualValue;

        const totalYearlyAmortization = assets.reduce((sum, a) => {
          const base = Math.max(0, a.acquisitionCostFCFA - a.residualValueFCFA);
          return sum + (a.lifespanYears > 0 ? base / a.lifespanYears : 0);
        }, 0);

        const totalMonthlyAmortization = totalYearlyAmortization / 12;

        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-900/40 space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-amber-900/60 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-500/30">
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    <span>Précision des Coûts Fixes d'Exploitation sur 5 Ans</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Calculateur d'Amortissement Linéaire du Matériel & des Infrastructures
                  </h3>
                  <p className="text-amber-200/80 text-xs max-w-3xl leading-relaxed">
                    Évaluez précisément la perte de valeur annuelle de votre parc de machines (broyeurs, générateurs, silos) et bâtiments. La dotation mensuelle aux amortissements est automatiquement intégrée à vos coûts fixes pour un P&L réaliste.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenAddAssetModal()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel Équipement / Infra</span>
                </button>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Valeur Totale d'Achat</span>
                  <div className="text-lg font-black text-white">{formatFCFA(totalAcquisitionCost)}</div>
                  <span className="text-[10px] text-slate-400">{assets.length} équipement(s) répertorié(s)</span>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Base Net Amortissable</span>
                  <div className="text-lg font-black text-amber-300">{formatFCFA(totalDepreciableBase)}</div>
                  <span className="text-[10px] text-slate-400">Achat moins valeur résiduelle ({formatFCFA(totalResidualValue)})</span>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dotation Annuelle Totale</span>
                  <div className="text-lg font-black text-emerald-400">{formatFCFA(totalYearlyAmortization)} / an</div>
                  <span className="text-[10px] text-slate-400">Impact annuel sur le Résultat Brut</span>
                </div>

                <div className="p-3.5 bg-amber-500 text-slate-950 rounded-xl space-y-1 shadow">
                  <span className="text-[10px] uppercase font-black">Dotation Mensuelle (Coût Fixe)</span>
                  <div className="text-xl font-black">{formatFCFA(totalMonthlyAmortization)} / mois</div>
                  <span className="text-[10px] font-bold text-slate-900">Montant d'amortissement aux coûts fixes</span>
                </div>
              </div>
            </div>

            {/* Presets Quick Addition Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Ajout rapide d'équipements standards d'élevage :</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() =>
                    handleOpenAddAssetModal({
                      name: "Groupe Électrogène Inverter 20 kVA",
                      category: "Énergie & Eau",
                      acquisitionCostFCFA: 3200000,
                      residualValueFCFA: 300000,
                      lifespanYears: 5,
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  + Groupe Électrogène 20 kVA
                </button>
                <button
                  onClick={() =>
                    handleOpenAddAssetModal({
                      name: "Mélangeur Horizontal d'Aliments 2 Tonnes",
                      category: "Matériel Élevage",
                      acquisitionCostFCFA: 4500000,
                      residualValueFCFA: 400000,
                      lifespanYears: 6,
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  + Mélangeur 2 Tonnes
                </button>
                <button
                  onClick={() =>
                    handleOpenAddAssetModal({
                      name: "Chambre Froide Isotherme Conservation Œufs/Viande",
                      category: "Transformations & Labo",
                      acquisitionCostFCFA: 5000000,
                      residualValueFCFA: 500000,
                      lifespanYears: 7,
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-900 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  + Chambre Froide Isotherme
                </button>
                <button
                  onClick={() =>
                    handleOpenAddAssetModal({
                      name: "Forage Hydraulique & Château d'Eau 10 000L",
                      category: "Énergie & Eau",
                      acquisitionCostFCFA: 4000000,
                      residualValueFCFA: 500000,
                      lifespanYears: 10,
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-orange-100 text-slate-800 hover:text-orange-900 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  + Forage & Château d'Eau 10kL
                </button>
              </div>
            </div>

            {/* Asset Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Tableau des Immobilisations & Taux d'Amortissement Linéaire</span>
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {assets.length} équipement(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Désignation Équipement / Infra</th>
                      <th className="p-3">Catégorie</th>
                      <th className="p-3 text-right">Valeur D'Achat (FCFA)</th>
                      <th className="p-3 text-right">Valeur Résiduelle</th>
                      <th className="p-3 text-center">Durée</th>
                      <th className="p-3 text-center">Taux Linéaire</th>
                      <th className="p-3 text-right">Amort. Annuel</th>
                      <th className="p-3 text-right">Amort. Mensuel</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {assets.map((asset) => {
                      const base = Math.max(0, asset.acquisitionCostFCFA - asset.residualValueFCFA);
                      const yearly = asset.lifespanYears > 0 ? base / asset.lifespanYears : 0;
                      const monthly = yearly / 12;
                      const linearRate = asset.lifespanYears > 0 ? (100 / asset.lifespanYears).toFixed(1) : "0";

                      return (
                        <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-slate-900">
                            {asset.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Acquis en {asset.acquisitionYear}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {asset.category}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {formatFCFA(asset.acquisitionCostFCFA)}
                          </td>
                          <td className="p-3 text-right text-slate-500">
                            {formatFCFA(asset.residualValueFCFA)}
                          </td>
                          <td className="p-3 text-center font-bold text-amber-700">
                            {asset.lifespanYears} ans
                          </td>
                          <td className="p-3 text-center font-extrabold text-emerald-700">
                            {linearRate}% / an
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">
                            {formatFCFA(yearly)} / an
                          </td>
                          <td className="p-3 text-right font-extrabold text-emerald-600">
                            {formatFCFA(monthly)} / mois
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenEditAssetModal(asset)}
                                className="p-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-1 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5-Year Depreciation Plan Schedule Table (Plan d'Amortissement Linéaire sur 5 Ans) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>Plan d'Amortissement Linéaire Prévisionnel sur 5 Ans (2027 - 2031)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Évolution de la Valeur Nette Comptable (VNC) et des Amortissements Cumulés par équipement.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-black uppercase text-[10px]">
                      <th className="p-3">Équipement</th>
                      <th className="p-3 text-right">Valeur d'Achat</th>
                      <th className="p-3 text-right">Année 1 (2027) VNC</th>
                      <th className="p-3 text-right">Année 2 (2028) VNC</th>
                      <th className="p-3 text-right">Année 3 (2029) VNC</th>
                      <th className="p-3 text-right">Année 4 (2030) VNC</th>
                      <th className="p-3 text-right">Année 5 (2031) VNC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {assets.map((asset) => {
                      const base = Math.max(0, asset.acquisitionCostFCFA - asset.residualValueFCFA);
                      const yearly = asset.lifespanYears > 0 ? base / asset.lifespanYears : 0;

                      // Compute VNC for years 1 through 5
                      const vncYears = [1, 2, 3, 4, 5].map((y) => {
                        const cumAmort = Math.min(base, yearly * y);
                        return Math.max(asset.residualValueFCFA, asset.acquisitionCostFCFA - cumAmort);
                      });

                      return (
                        <tr key={asset.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{asset.name}</td>
                          <td className="p-3 text-right font-black text-slate-900">
                            {formatFCFA(asset.acquisitionCostFCFA)}
                          </td>
                          {vncYears.map((vnc, idx) => (
                            <td key={idx} className="p-3 text-right font-bold text-slate-700">
                              {formatFCFA(vnc)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: ADD / EDIT ASSET */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <span>{editingAsset ? "Modifier l'Équipement" : "Ajouter un Équipement Amortissable"}</span>
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation de l'Équipement ou Bâtiment</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Broyeur d'aliment 1.5T/h"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={assetCategory}
                    onChange={(e: any) => setAssetCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Matériel Élevage">Matériel Élevage</option>
                    <option value="Bâtiments & Sol">Bâtiments & Sol</option>
                    <option value="Transport & Véhicules">Transport & Véhicules</option>
                    <option value="Énergie & Eau">Énergie & Eau</option>
                    <option value="Transformations & Labo">Transformations & Labo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Année d'Acquisition</label>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    value={assetYear}
                    onChange={(e) => setAssetYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valeur d'Acquisition Initial (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    required
                    value={assetCost}
                    onChange={(e) => setAssetCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valeur Résiduelle Estimée (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={assetResidual}
                    onChange={(e) => setAssetResidual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-amber-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Durée d'Amortissement (années) : <span className="text-emerald-700">{assetLifespan} ans</span> (
                  {assetLifespan > 0 ? (100 / assetLifespan).toFixed(1) : 0}% / an)
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={assetLifespan}
                  onChange={(e) => setAssetLifespan(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 space-y-1">
                <span className="font-bold block text-[11px] text-amber-900">Aperçu du calcul d'amortissement :</span>
                <div className="flex justify-between font-extrabold text-xs">
                  <span>Dotation Annuelle : {formatFCFA(Math.max(0, (assetCost - assetResidual) / (assetLifespan || 1)))} / an</span>
                  <span className="text-emerald-700">
                    {formatFCFA(Math.max(0, (assetCost - assetResidual) / (assetLifespan || 1) / 12))} / mois
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>{editingEmployee ? "Modifier l'Agent RH" : "Créer un Nouvel Agent RH"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom complet & Prénom</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Kouadio Michel"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Intitulé du Poste / Rôle</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Responsable Maternité"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type d'Agent RH</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Technicien Vétérinaire Senior"
                    value={formAgentType}
                    onChange={(e) => setFormAgentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Module / Secteur d'Affiliation</label>
                  <select
                    value={formSectorModule}
                    onChange={(e: any) => setFormSectorModule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Aviculture">Aviculture</option>
                    <option value="Porciculture">Porciculture</option>
                    <option value="Maternité & Élevage">Maternité & Élevage</option>
                    <option value="Fabrique d'Aliments">Fabrique d'Aliments</option>
                    <option value="Hygiène & Sanitaire">Hygiène & Sanitaire</option>
                    <option value="Administration & Ventes">Administration & Ventes</option>
                    <option value="Toutes Fermes">Toutes Fermes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Salaire Fixe Mensuel (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bonus / Primes (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formBonus}
                    onChange={(e) => setFormBonus(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-amber-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d'embauche</label>
                  <input
                    type="text"
                    placeholder="ex: Août 2026"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone & Contact</label>
                  <input
                    type="text"
                    placeholder="ex: +225 07 12 34 56 78"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Tasks Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-800">
                  Fiche de Poste & Tâches Attribuées ({formTasks.length})
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une tâche spécifique..."
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTaskToForm();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTaskToForm}
                    className="px-3 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {formTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                    >
                      <span className="truncate pr-2">• {task}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskFromForm(idx)}
                        className="text-rose-500 hover:text-rose-700 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes RH & Observations</label>
                <textarea
                  rows={2}
                  placeholder="Remarques particulières, compétences spécifiques, équipement fourni..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-black shadow cursor-pointer"
                >
                  {editingEmployee ? "Enregistrer les modifications" : "Créer l'Agent RH"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
