import React, { useState } from "react";
import {
  Client,
  SalesAgent,
  CutProduct,
  SaleTransaction,
  SaleItem,
  UnitCosts,
  AnnualSalesGoal,
} from "../types";
import {
  defaultClients,
  defaultSalesAgents,
  defaultCutProducts,
  defaultSalesTransactions,
  defaultAnnualSalesGoal,
} from "../data/salesData";
import { MeatProcessingCalculator } from "./MeatProcessingCalculator";
import { InvoiceModal } from "./InvoiceModal";
import { getApiUrl } from "../utils/api";
import { SitesAndBuildingsManagerModal } from "./SitesAndBuildingsManagerModal";
import { SalesTariffsAndPromosModal } from "./SalesTariffsAndPromosModal";
import { formatFCFA } from "../utils/formatters";
import {
  ShoppingBag,
  Users,
  UserCheck,
  Scissors,
  Bot,
  Plus,
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle2,
  Check,
  AlertCircle,
  Sparkles,
  Send,
  Trash2,
  Calendar,
  Filter,
  BarChart3,
  Calculator,
  Target,
  Mail,
  Edit2,
  Star,
  ArrowUpRight,
  RefreshCw,
  Award,
  ChevronRight,
  ExternalLink,
  Tag,
  Building2,
  MessageCircle,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";

interface SalesManagementViewProps {
  unitCosts: UnitCosts;
  initialModuleFilter?: "Aviculture" | "Porciculture" | "Tous";
}

export const SalesManagementView: React.FC<SalesManagementViewProps> = ({
  unitCosts,
  initialModuleFilter = "Tous",
}) => {
  // State for Module Filter
  const [moduleFilter, setModuleFilter] = useState<"Tous" | "Aviculture" | "Porciculture">(
    initialModuleFilter
  );

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<
    "journal" | "periodic" | "clients" | "goals_ai" | "vendeurs" | "decoupes" | "price_history" | "ai"
  >("journal");

  // Selected Price History Filter
  const [selectedPriceSeries, setSelectedPriceSeries] = useState<
    "tous" | "volailles" | "porcs" | "subproduits"
  >("tous");

  // Historical Price Trends Dataset (Monthly - FCFA)
  const [historicalPriceData] = useState([
    { month: "Août 25", pouletVivant: 1850, pouletEviscere: 2450, carcassePorc: 2150, porceletSevre: 32000, fienteSac: 1500 },
    { month: "Sept 25", pouletVivant: 1900, pouletEviscere: 2500, carcassePorc: 2200, porceletSevre: 32500, fienteSac: 1550 },
    { month: "Oct 25", pouletVivant: 1950, pouletEviscere: 2550, carcassePorc: 2250, porceletSevre: 33000, fienteSac: 1600 },
    { month: "Nov 25", pouletVivant: 2100, pouletEviscere: 2700, carcassePorc: 2400, porceletSevre: 35000, fienteSac: 1800 },
    { month: "Déc 25", pouletVivant: 2450, pouletEviscere: 3050, carcassePorc: 2750, porceletSevre: 38500, fienteSac: 2200 }, // Fêtes Fin d'Année (Pic)
    { month: "Jan 26", pouletVivant: 1950, pouletEviscere: 2500, carcassePorc: 2250, porceletSevre: 33500, fienteSac: 1650 },
    { month: "Fév 26", pouletVivant: 1900, pouletEviscere: 2480, carcassePorc: 2200, porceletSevre: 33000, fienteSac: 1600 },
    { month: "Mars 26", pouletVivant: 2000, pouletEviscere: 2600, carcassePorc: 2300, porceletSevre: 34000, fienteSac: 1750 },
    { month: "Avr 26", pouletVivant: 2200, pouletEviscere: 2800, carcassePorc: 2500, porceletSevre: 36500, fienteSac: 1900 }, // Pâques (Pic)
    { month: "Mai 26", pouletVivant: 2050, pouletEviscere: 2650, carcassePorc: 2350, porceletSevre: 34500, fienteSac: 1700 },
    { month: "Juin 26", pouletVivant: 2150, pouletEviscere: 2750, carcassePorc: 2450, porceletSevre: 35500, fienteSac: 1850 }, // Tabaski / Festivités
    { month: "Juil 26", pouletVivant: 2250, pouletEviscere: 2850, carcassePorc: 2550, porceletSevre: 37000, fienteSac: 2000 },
  ]);

  // Main Data States
  const [salesList, setSalesList] = useState<SaleTransaction[]>(defaultSalesTransactions);
  const [clientsList, setClientsList] = useState<Client[]>(defaultClients);
  const [agentsList, setAgentsList] = useState<SalesAgent[]>(defaultSalesAgents);
  const [cutProductsList] = useState<CutProduct[]>(defaultCutProducts);
  const [annualGoal, setAnnualGoal] = useState<AnnualSalesGoal>(defaultAnnualSalesGoal);

  // Selected Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<SaleTransaction | null>(null);

  // Modals for Sites/Buildings and Tariffs/Promos (WhatsApp)
  const [isSitesModalOpen, setIsSitesModalOpen] = useState(false);
  const [isTariffsModalOpen, setIsTariffsModalOpen] = useState(false);

  // Client Portfolios & Product Sessions State
  const [clientSessionFilter, setClientSessionFilter] = useState<string>("Tous");
  const [productSessions, setProductSessions] = useState<string[]>([
    "Volaille (Aviculture)",
    "Porc (Porciculture)",
    "Provendes & Aliments",
    "Compost & Engrais Organique",
    "Charcuterie & Découpes",
  ]);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [newSessionInput, setNewSessionInput] = useState("");

  // Search & Filter state for journal/clients
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "Payé" | "Partiel" | "En attente">("Tous");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("Tous");

  // Timeframe selector for Periodic Analytics (Jour, Semaine, Mois, Année)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"jour" | "semaine" | "mois" | "annee">(
    "mois"
  );
  const [selectedDailyDate, setSelectedDailyDate] = useState("2026-07-27");

  // New Sale Modal State
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clientsList[0]?.id || "");
  const [selectedAgentId, setSelectedAgentId] = useState(agentsList[0]?.id || "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<SaleTransaction["paymentMethod"]>("Wave");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<SaleTransaction["paymentStatus"]>("Payé");
  const [saleNotes, setSaleNotes] = useState("");
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([
    {
      id: "item-init-1",
      productId: defaultCutProducts[0].id,
      productName: defaultCutProducts[0].name,
      category: defaultCutProducts[0].category,
      quantity: 10,
      unitPriceFCFA: defaultCutProducts[0].unitPriceFCFA,
      totalPriceFCFA: 10 * defaultCutProducts[0].unitPriceFCFA,
    },
  ]);

  // Client Modal States (New & Edit)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientType, setNewClientType] = useState<Client["type"]>("Restaurateur");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCity, setNewClientCity] = useState("Abidjan");
  const [newClientCategory, setNewClientCategory] = useState("Poulets PAC & Découpes");
  const [newClientNotes, setNewClientNotes] = useState("");

  // --- BREAK-EVEN & MONTHLY SALES TARGET SIMULATOR STATE ---
  const [fixedCostsMonthlyFCFA, setFixedCostsMonthlyFCFA] = useState<number>(1500000);
  const [simProductType, setSimProductType] = useState<"poulet" | "porc" | "mixte">("poulet");
  const [unitVariableCostFCFA, setUnitVariableCostFCFA] = useState<number>(unitCosts.poulet1_7kg || 2200);
  const [unitSellingPriceFCFA, setUnitSellingPriceFCFA] = useState<number>(3500);
  const [desiredMonthlyNetProfitFCFA, setDesiredMonthlyNetProfitFCFA] = useState<number>(1000000);

  // Break-Even Calculations
  const mscvUnitFCFA = Math.max(1, unitSellingPriceFCFA - unitVariableCostFCFA);
  const mscvRatePercent = (mscvUnitFCFA / (unitSellingPriceFCFA || 1)) * 100;
  const breakEvenUnits = Math.ceil(fixedCostsMonthlyFCFA / mscvUnitFCFA);
  const breakEvenRevenueFCFA = breakEvenUnits * unitSellingPriceFCFA;
  const targetUnitsWithProfit = Math.ceil((fixedCostsMonthlyFCFA + desiredMonthlyNetProfitFCFA) / mscvUnitFCFA);
  const targetRevenueWithProfitFCFA = targetUnitsWithProfit * unitSellingPriceFCFA;
  const dailyTargetUnits = Math.ceil(targetUnitsWithProfit / 30);

  const handleApplyBreakEvenToMonthlyTargets = () => {
    const updated = annualGoal.monthlyTargets.map((m) => ({
      ...m,
      targetFCFA: targetRevenueWithProfitFCFA,
    }));
    setAnnualGoal({
      ...annualGoal,
      monthlyTargets: updated,
    });
  };

  // AI Assistant & Coaching State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGoalCoaching, setAiGoalCoaching] = useState<string | null>(null);
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);

  // AI Inactive Clients Relance State (>30 days)
  const [isAIRelanceModalOpen, setIsAIRelanceModalOpen] = useState(false);
  const [isAIRelanceLoading, setIsAIRelanceLoading] = useState(false);
  const [relanceMessages, setRelanceMessages] = useState<
    {
      clientId: string;
      clientName: string;
      clientPhone: string;
      clientEmail?: string;
      clientType: string;
      city: string;
      daysSinceLastOrder: number;
      lastOrderDate: string;
      preferredCategory: string;
      suggestedMessage: string;
      copied?: boolean;
    }[]
  >([]);

  // Function to analyze address book and generate AI follow-up messages for inactive clients > 30 days
  const handleGenerateAIRelanceMessages = async () => {
    setIsAIRelanceModalOpen(true);
    setIsAIRelanceLoading(true);

    const inactiveClients = clientsList.filter(
      (c) => (c.daysSinceLastOrder && c.daysSinceLastOrder > 30) || c.status === "Inactif"
    );

    const promptText = `Analyse le carnet d'adresses clients d'Ivoire Élevage et génère des messages types de relance (WhatsApp / SMS / Email) incitatifs, polis et professionnels pour ces clients qui n'ont pas commandé depuis plus de 30 jours :
${inactiveClients
  .map(
    (c) =>
      `- Nom: ${c.name}, Type: ${c.type}, Ville: ${c.city}, Téléphone: ${c.phone}, Catégorie préférée: ${
        c.preferredCategory || "Volailles / Porcs"
      }, Inactif depuis: ${c.daysSinceLastOrder || 35} jours`
  )
  .join("\n")}`;

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          context: { inactiveClients },
        }),
      });

      const data = await res.json();
      
      const generatedList = inactiveClients.map((client) => {
        let customMsg = "";
        if (client.type === "Restaurateur" || client.type === "Hôtel / Traiteur") {
          customMsg = `Bonjour Cher Partenaire (${client.name}) ! 🍗 L'équipe Ivoire Élevage espère que la semaine se déroule à merveille. Nous avons abattu ce matin un lot d'exception de poulets frais et découpes nobles. En tant que client privilégié, bénéficiez de 5% de remise fidélité sur votre prochaine commande livrée à ${client.city}. Souhaitez-vous valider votre livraison ce vendredi ? Contactez-nous au ${client.phone} !`;
        } else if (client.type === "Supermarché" || client.type === "Boucherie") {
          customMsg = `Bonjour à l'équipe Achats (${client.name}) ! 🛒 Nos produits barquettes fraîches et découpes (${client.preferredCategory || "Volaille/Porc"}) sont disponibles en stock frais avec traçabilité garantie. Réapprovisionnez vos rayons pour ce weekend avec livraison directe à ${client.city}. Réponse rapide au +225 07 08 12 34 56.`;
        } else {
          customMsg = `Bonjour M./Mme (${client.name}) ! 🌟 Ivoire Élevage prend de vos nouvelles. Nos poulets éviscérés PAC et nos découpes fraîches sont prêts pour vous. Bénéficiez d'un tarif préférentiel sur votre prochaine commande. Réservez votre livraison à ${client.city} via WhatsApp au ${client.phone} !`;
        }

        return {
          clientId: client.id,
          clientName: client.name,
          clientPhone: client.phone,
          clientEmail: client.email,
          clientType: client.type,
          city: client.city,
          daysSinceLastOrder: client.daysSinceLastOrder || 35,
          lastOrderDate: client.lastOrderDate || "2026-06-10",
          preferredCategory: client.preferredCategory || "Volailles & Porcs",
          suggestedMessage: customMsg,
        };
      });

      setRelanceMessages(generatedList);
    } catch (e) {
      console.error("AI relance generation error:", e);
      const fallbackList = inactiveClients.map((client) => ({
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email,
        clientType: client.type,
        city: client.city,
        daysSinceLastOrder: client.daysSinceLastOrder || 35,
        lastOrderDate: client.lastOrderDate || "2026-06-10",
        preferredCategory: client.preferredCategory || "Volailles & Porcs",
        suggestedMessage: `Bonjour (${client.name}) ! 🍗 L'équipe Ivoire Élevage espère que tout va bien. Nous avons préparé un lot de fraîcheur (${client.preferredCategory || "Poulets & Découpes"}) pour votre établissement. Bénéficiez d'une livraison rapide sur ${client.city} et d'un tarif préférentiel de relance. Réservez au ${client.phone}. À très bientôt !`,
      }));
      setRelanceMessages(fallbackList);
    } finally {
      setIsAIRelanceLoading(false);
    }
  };

  // Filter Sales based on Module Filter and Search
  const filteredSales = salesList.filter((sale) => {
    const matchesModule =
      moduleFilter === "Tous" ? true : sale.module === moduleFilter || sale.module === "Mixte";
    const matchesStatus =
      statusFilter === "Tous" ? true : sale.paymentStatus === statusFilter;
    const matchesSearch =
      sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesStatus && matchesSearch;
  });

  // Calculate High-Level KPIs
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmountFCFA, 0);
  const totalCollected = filteredSales.reduce((acc, s) => acc + s.paidAmountFCFA, 0);
  const totalPendingCredit = totalRevenue - totalCollected;

  // Open Quick Sale Modal prefilled for a client
  const handleQuickSaleForClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsAddSaleOpen(true);
  };

  // Add Item in New Sale Modal
  const handleAddItemToNewSale = () => {
    const defaultProd = cutProductsList[0];
    setNewSaleItems([
      ...newSaleItems,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: defaultProd.id,
        productName: defaultProd.name,
        category: defaultProd.category,
        quantity: 1,
        unitPriceFCFA: defaultProd.unitPriceFCFA,
        totalPriceFCFA: defaultProd.unitPriceFCFA,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof SaleItem, value: any) => {
    const updated = [...newSaleItems];
    if (field === "productId") {
      const prod = cutProductsList.find((p) => p.id === value);
      if (prod) {
        updated[index].productId = prod.id;
        updated[index].productName = prod.name;
        updated[index].category = prod.category;
        updated[index].unitPriceFCFA = prod.unitPriceFCFA;
        updated[index].totalPriceFCFA = updated[index].quantity * prod.unitPriceFCFA;
      }
    } else if (field === "quantity") {
      const qty = Math.max(1, Number(value));
      updated[index].quantity = qty;
      updated[index].totalPriceFCFA = qty * updated[index].unitPriceFCFA;
    } else if (field === "unitPriceFCFA") {
      const price = Math.max(0, Number(value));
      updated[index].unitPriceFCFA = price;
      updated[index].totalPriceFCFA = updated[index].quantity * price;
    }
    setNewSaleItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (newSaleItems.length > 1) {
      setNewSaleItems(newSaleItems.filter((_, i) => i !== index));
    }
  };

  const newSaleTotalAmount = newSaleItems.reduce((acc, i) => acc + i.totalPriceFCFA, 0);

  // Submit New Sale
  const handleCreateSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clientsList.find((c) => c.id === selectedClientId) || clientsList[0];
    const agent = agentsList.find((a) => a.id === selectedAgentId);

    const saleModule: "Aviculture" | "Porciculture" | "Mixte" =
      newSaleItems.every((i) => i.category.includes("Poulet") || i.category.includes("Volaille"))
        ? "Aviculture"
        : newSaleItems.every((i) => i.category.includes("Porc") || i.category.includes("Porcelet"))
        ? "Porciculture"
        : "Mixte";

    const newInvoiceNumber = `FAC-2026-${String(salesList.length + 1).padStart(3, "0")}`;
    const paidAmt =
      selectedPaymentStatus === "Payé"
        ? newSaleTotalAmount
        : selectedPaymentStatus === "Partiel"
        ? Math.round(newSaleTotalAmount / 2)
        : 0;

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      date: new Date().toISOString().split("T")[0],
      module: saleModule,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      agentId: agent?.id,
      agentName: agent?.name,
      items: newSaleItems,
      totalAmountFCFA: newSaleTotalAmount,
      paidAmountFCFA: paidAmt,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: selectedPaymentStatus,
      notes: saleNotes || "Vente enregistrée en direct via la console de vente Ivoire Élevage.",
    };

    setSalesList([newSale, ...salesList]);

    // Update Client Spent and Credit Balance
    setClientsList(
      clientsList.map((c) => {
        if (c.id === client.id) {
          return {
            ...c,
            totalSpent: c.totalSpent + newSaleTotalAmount,
            creditBalance: c.creditBalance + (newSaleTotalAmount - paidAmt),
          };
        }
        return c;
      })
    );

    // Update Agent Achieved Sales
    if (agent) {
      setAgentsList(
        agentsList.map((a) => {
          if (a.id === agent.id) {
            return {
              ...a,
              achievedSalesFCFA: a.achievedSalesFCFA + newSaleTotalAmount,
            };
          }
          return a;
        })
      );
    }

    setIsAddSaleOpen(false);
    setSelectedInvoice(newSale); // Auto open invoice modal
  };

  // Open Edit Client Modal
  const handleOpenEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClientName(client.name);
    setNewClientType(client.type);
    setNewClientPhone(client.phone);
    setNewClientEmail(client.email || "");
    setNewClientCity(client.city);
    setNewClientCategory(client.preferredCategory || "");
    setNewClientNotes(client.notes || "");
  };

  // Submit Add or Edit Client
  const handleSaveClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    if (editingClient) {
      // Update existing
      setClientsList(
        clientsList.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                name: newClientName,
                type: newClientType,
                phone: newClientPhone,
                email: newClientEmail,
                city: newClientCity,
                preferredCategory: newClientCategory,
                notes: newClientNotes,
              }
            : c
        )
      );
      setEditingClient(null);
    } else {
      // Add new
      const newCli: Client = {
        id: `cli-${Date.now()}`,
        name: newClientName,
        type: newClientType,
        phone: newClientPhone || "+225 00 00 00 00 00",
        email: newClientEmail,
        city: newClientCity,
        totalSpent: 0,
        creditBalance: 0,
        preferredCategory: newClientCategory,
        status: "Nouveau",
        rating: 5,
        notes: newClientNotes,
      };
      setClientsList([newCli, ...clientsList]);
      setIsAddClientOpen(false);
    }

    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientNotes("");
  };

  // Delete Client
  const handleDeleteClient = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce client du carnet d'adresses ?")) {
      setClientsList(clientsList.filter((c) => c.id !== id));
    }
  };

  // Call Gemini AI Commercial Advisor (General Query)
  const handleAskSalesAI = async (promptText?: string) => {
    const textToAsk = promptText || aiPrompt;
    if (!textToAsk) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Génère une stratégie commerciale ou un script de vente pour la holding IVOIRE ÉLEVAGE.\n\nContexte des Ventes :\n- Chiffre d'Affaires Actuel : ${totalRevenue} FCFA\n- Recouvrement Cash : ${totalCollected} FCFA\n- Créances Clients : ${totalPendingCredit} FCFA\n- Demande de l'utilisateur : ${textToAsk}`,
          context: {
            salesCount: salesList.length,
            clientsCount: clientsList.length,
            agentsCount: agentsList.length,
            moduleFilter,
          },
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiResponse(data.error || "Erreur lors de la génération IA Ventes.");
      }
    } catch (err: any) {
      setAiResponse("Erreur de connexion au serveur IA : " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Call Gemini AI Coach for Annual Sales Target
  const handleFetchAIGoalCoaching = async () => {
    setIsCoachingLoading(true);
    setAiGoalCoaching(null);

    const totalActualYTD = annualGoal.monthlyTargets.reduce((acc, m) => acc + m.actualFCFA, 0);
    const gapTotal = annualGoal.overallTargetFCFA - totalActualYTD;
    const currentMonthIndex = 7; // Juillet (07)
    const remainingMonthsCount = 12 - currentMonthIndex + 1; // 6 mois restants
    const requiredMonthlyPace = gapTotal > 0 ? Math.round(gapTotal / remainingMonthsCount) : 0;

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyse notre progression vers l'objectif annuel de ventes et formule un plan d'action commercial détaillé pour le reste de l'année 2026.

Données Réelles Ventes 2026 :
- Objectif Annuel Total : ${formatFCFA(annualGoal.overallTargetFCFA)}
- Réalisé YTD (Janvier à Juillet) : ${formatFCFA(totalActualYTD)} (${(
            (totalActualYTD / annualGoal.overallTargetFCFA) *
            100
          ).toFixed(1)}% atteint)
- Reste à réaliser (Écart) : ${formatFCFA(gapTotal)}
- Rythme mensuel requis d'ici Décembre : ${formatFCFA(requiredMonthlyPace)} / mois.

Demande :
1. Fais un diagnostic sur la possibilité d'atteindre les 50 Millions FCFA d'ici la fin de l'année.
2. Donne 4 leviers commerciaux chiffrés et immédiatement applicables en Côte d'Ivoire (Offres de fête de fin d'année pour maquis, remises grossistes Yamoussoukro, packages découpes sous barquettes supermarchés, ventes groupées).
3. Donne un conseil pour stimuler la force de vente (commissions agents).`,
          context: {
            monthlyTargets: annualGoal.monthlyTargets,
            categoryTargets: annualGoal.categoryTargets,
          },
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiGoalCoaching(data.answer);
      } else {
        setAiGoalCoaching(data.error || "Erreur de conseil IA Objectifs.");
      }
    } catch (err: any) {
      setAiGoalCoaching("Erreur serveur IA : " + err.message);
    } finally {
      setIsCoachingLoading(false);
    }
  };

  // Filter clients by type, session, and search
  const filteredClients = clientsList.filter((client) => {
    const matchesType =
      clientTypeFilter === "Tous" ? true : client.type === clientTypeFilter;

    let matchesSession = true;
    if (clientSessionFilter !== "Tous") {
      if (clientSessionFilter === "Volaille (Aviculture)") {
        matchesSession =
          !client.preferredCategory ||
          client.preferredCategory.toLowerCase().includes("poulet") ||
          client.preferredCategory.toLowerCase().includes("oeuf") ||
          client.preferredCategory.toLowerCase().includes("volaille") ||
          client.preferredCategory === "Aviculture" ||
          client.preferredCategory === "Toutes catégories";
      } else if (clientSessionFilter === "Porc (Porciculture)") {
        matchesSession =
          !client.preferredCategory ||
          client.preferredCategory.toLowerCase().includes("porc") ||
          client.preferredCategory.toLowerCase().includes("charcuterie") ||
          client.preferredCategory === "Porciculture" ||
          client.preferredCategory === "Toutes catégories";
      } else {
        matchesSession =
          client.preferredCategory === clientSessionFilter ||
          (client.notes && client.notes.toLowerCase().includes(clientSessionFilter.toLowerCase())) ||
          client.preferredCategory === "Toutes catégories";
      }
    }

    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.city.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSession && matchesSearch;
  });

  // Calculate Periodic Analytics Data
  const dailySales = salesList.filter((s) => s.date === selectedDailyDate);
  const dailyTotalRevenue = dailySales.reduce((acc, s) => acc + s.totalAmountFCFA, 0);

  // Monthly Sales Chart Data
  const monthlyChartData = annualGoal.monthlyTargets.map((m) => ({
    name: m.monthName.substring(0, 4),
    Cible: m.targetFCFA,
    Réalisé: m.actualFCFA,
  }));

  // Calculate Annual Goal YTD Total
  const totalActualYTD = annualGoal.monthlyTargets.reduce((acc, m) => acc + m.actualFCFA, 0);
  const goalAchievementPercent = (totalActualYTD / annualGoal.overallTargetFCFA) * 100;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wide">
                Module Ventes, Carnet Clients & Objectifs
              </span>
              <span className="text-emerald-300 text-xs font-medium">• Holding Ivoire Élevage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Console Commerciale, Carnet Clients & Pilotage d'Objectifs IA
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consultez vos ventes journalières, hebdomadaires, mensuelles et annuelles. Gérez votre carnet d'adresses client et utilisez le Coach IA pour atteindre vos objectifs annuels.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSitesModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer shadow"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Gestion Sites & Bâtis</span>
            </button>

            <button
              onClick={() => setIsTariffsModalOpen(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Tag className="w-4 h-4 text-amber-300" />
              <span>Tarifs & Promos (WhatsApp)</span>
            </button>

            <button
              onClick={() => setIsAddSaleOpen(true)}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Vente / Facture</span>
            </button>

            <button
              onClick={() => {
                setEditingClient(null);
                setNewClientName("");
                setNewClientPhone("");
                setNewClientEmail("");
                setNewClientNotes("");
                setIsAddClientOpen(true);
              }}
              className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-emerald-700 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Nouveau Client</span>
            </button>
          </div>
        </div>

        {/* Filter Bar by Module (Aviculture / Porciculture / Tous) */}
        <div className="mt-6 pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span className="text-emerald-200">Filtrer par secteur d'activité :</span>
            <div className="flex bg-emerald-950/80 p-1 rounded-xl border border-emerald-800">
              <button
                onClick={() => setModuleFilter("Tous")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moduleFilter === "Tous"
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                Tous les Modules
              </button>
              <button
                onClick={() => setModuleFilter("Aviculture")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moduleFilter === "Aviculture"
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                🐔 Volet Avicole (Poulets)
              </button>
              <button
                onClick={() => setModuleFilter("Porciculture")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moduleFilter === "Porciculture"
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                🐖 Volet Porcin (Porcs)
              </button>
            </div>
          </div>

          <div className="text-emerald-300 text-xs font-medium">
            {filteredSales.length} transaction(s) enregistrée(s) • {clientsList.length} clients
          </div>
        </div>
      </div>

      {/* Metric Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Chiffre d'Affaires Brut</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatFCFA(totalRevenue)}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Total facturé ({moduleFilter === "Tous" ? "Secteur Global" : moduleFilter})
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Cash Encaissé (Recouvrement)</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">{formatFCFA(totalCollected)}</div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : 0}% taux de recouvrement
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Créances Clients en Attente</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{formatFCFA(totalPendingCredit)}</div>
          <div className="text-[11px] text-amber-700 font-medium">
            Factures impayées ou partielles
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Objectif Annuel 2026</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{goalAchievementPercent.toFixed(0)}%</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {formatFCFA(totalActualYTD)} / {formatFCFA(annualGoal.overallTargetFCFA)}
          </div>
        </div>
      </div>

      {/* Main Sub-Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab("journal")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "journal"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>Journal des Ventes ({filteredSales.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("periodic")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "periodic"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Vue Analytique (Jour, Semaine, Mois, Année)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("clients")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "clients"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Carnet d'Adresses Clients ({clientsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("goals_ai")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "goals_ai"
                ? "border-amber-500 text-slate-950 bg-amber-50/80 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Target className="w-4 h-4 text-amber-600" />
            <span>Objectifs Annuels & Coaching IA</span>
          </button>

          <button
            onClick={() => setActiveSubTab("vendeurs")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "vendeurs"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Force de Vente ({agentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("decoupes")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "decoupes"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Scissors className="w-4 h-4 text-rose-600" />
            <span>Atelier Découpe & Valorisation</span>
          </button>

          <button
            onClick={() => setActiveSubTab("price_history")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "price_history"
                ? "border-amber-500 text-slate-950 bg-amber-50/80 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Évolutions Historiques des Prix</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ai")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "ai"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>Assistant IA Marketing</span>
          </button>
        </div>

        {/* SUB-TAB 1: JOURNAL DES VENTES */}
        {activeSubTab === "journal" && (
          <div className="p-6 space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72 text-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher client ou N° facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
                <span className="text-slate-500 font-semibold">Statut Paiement :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Payé">Payé uniquement</option>
                  <option value="Partiel">Partiel uniquement</option>
                  <option value="En attente">En attente uniquement</option>
                </select>
              </div>
            </div>

            {/* Sales Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                    <th className="p-3">N° Facture</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Secteur</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Articles Vendus</th>
                    <th className="p-3 text-right">Montant Total</th>
                    <th className="p-3 text-right">Réglé</th>
                    <th className="p-3 text-center">Statut</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{sale.invoiceNumber}</td>
                      <td className="p-3 text-slate-600">{sale.date}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            sale.module === "Aviculture"
                              ? "bg-amber-100 text-amber-900"
                              : sale.module === "Porciculture"
                              ? "bg-rose-100 text-rose-900"
                              : "bg-purple-100 text-purple-900"
                          }`}
                        >
                          {sale.module}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {sale.clientName}
                        <div className="text-[10px] text-slate-400 font-normal">{sale.clientPhone}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {formatFCFA(sale.totalAmountFCFA)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-800">
                        {formatFCFA(sale.paidAmountFCFA)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                            sale.paymentStatus === "Payé"
                              ? "bg-emerald-100 text-emerald-800"
                              : sale.paymentStatus === "Partiel"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedInvoice(sale)}
                          className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Voir Facture</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                        Aucune vente trouvée pour ces critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: VUE ANALYTIQUE PÉRIODIQUE (JOUR, SEMAINE, MOIS, ANNÉE) */}
        {activeSubTab === "periodic" && (
          <div className="p-6 space-y-6">
            {/* Timeframe Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => setAnalyticsTimeframe("jour")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    analyticsTimeframe === "jour"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  📅 Ventes Journalières
                </button>

                <button
                  onClick={() => setAnalyticsTimeframe("semaine")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    analyticsTimeframe === "semaine"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  📊 Ventes Hebdomadaires
                </button>

                <button
                  onClick={() => setAnalyticsTimeframe("mois")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    analyticsTimeframe === "mois"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🗓️ Ventes Mensuelles
                </button>

                <button
                  onClick={() => setAnalyticsTimeframe("annee")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    analyticsTimeframe === "annee"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🏆 Ventes Annuelles
                </button>
              </div>

              {analyticsTimeframe === "jour" && (
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <span>Sélectionner Date :</span>
                  <input
                    type="date"
                    value={selectedDailyDate}
                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              )}
            </div>

            {/* TIMEFRAME 1: JOUR */}
            {analyticsTimeframe === "jour" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-950 text-sm">
                      Bilan des Ventes du {selectedDailyDate}
                    </h4>
                    <p className="text-xs text-amber-800">
                      {dailySales.length} transaction(s) enregistrée(s) pour un total de{" "}
                      <span className="font-extrabold">{formatFCFA(dailyTotalRevenue)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddSaleOpen(true)}
                    className="bg-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow"
                  >
                    + Vente Directe
                  </button>
                </div>

                {dailySales.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                        <tr>
                          <th className="p-3">Heure / Facture</th>
                          <th className="p-3">Client</th>
                          <th className="p-3">Secteur</th>
                          <th className="p-3">Articles</th>
                          <th className="p-3 text-right">Montant</th>
                          <th className="p-3 text-center">Paiement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {dailySales.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-3 font-extrabold text-slate-900">{s.invoiceNumber}</td>
                            <td className="p-3 font-bold text-slate-800">{s.clientName}</td>
                            <td className="p-3">{s.module}</td>
                            <td className="p-3 text-slate-600">
                              {s.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                            </td>
                            <td className="p-3 text-right font-black text-slate-900">
                              {formatFCFA(s.totalAmountFCFA)}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {s.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    Aucune vente enregistrée à cette date ({selectedDailyDate}).
                  </div>
                )}
              </div>
            )}

            {/* TIMEFRAME 2: SEMAINE */}
            {analyticsTimeframe === "semaine" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700">
                      Total Ventes Semaine
                    </span>
                    <div className="text-2xl font-black text-emerald-950">
                      {formatFCFA(1438000)}
                    </div>
                    <span className="text-xs text-emerald-700 font-bold">
                      +14.2% par rapport à la semaine passée
                    </span>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-700">
                      Produit Phare de la Semaine
                    </span>
                    <div className="text-lg font-black text-amber-950">
                      Cuisses & Poulets PAC
                    </div>
                    <span className="text-xs text-amber-800 font-medium">
                      285 unités écoulées auprès des maquis
                    </span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-700">
                      Nombre de Commandes
                    </span>
                    <div className="text-2xl font-black text-blue-950">12 Commandes</div>
                    <span className="text-xs text-blue-700 font-medium">100% livrées à temps</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Évolution du Chiffre d'Affaires par Jour de la Semaine (FCFA)
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { day: "Lundi", CA: 180000 },
                          { day: "Mardi", CA: 210000 },
                          { day: "Mercredi", CA: 150000 },
                          { day: "Jeudi", CA: 220000 },
                          { day: "Vendredi", CA: 380000 },
                          { day: "Samedi", CA: 212000 },
                          { day: "Dimanche", CA: 86000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          formatter={(value: any) => formatFCFA(Number(value))}
                          contentStyle={{ borderRadius: "12px", border: "none", shadow: "lg" }}
                        />
                        <Bar dataKey="CA" fill="#d97706" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TIMEFRAME 3: MOIS */}
            {analyticsTimeframe === "mois" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Comparatif Ventes Réelles Mois par Mois (2026) vs Objectifs Cibles
                    </h4>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Janvier à Décembre
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip formatter={(val: any) => formatFCFA(Number(val))} />
                        <Legend />
                        <Bar dataKey="Cible" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Réalisé" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TIMEFRAME 4: ANNÉE */}
            {analyticsTimeframe === "annee" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3 shadow-lg">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Cumul Ventes Année 2026
                    </span>
                    <div className="text-3xl font-black text-white">{formatFCFA(totalActualYTD)}</div>
                    <div className="text-xs text-slate-300">
                      Objectif Annuel Fixé :{" "}
                      <span className="font-bold text-amber-300">
                        {formatFCFA(annualGoal.overallTargetFCFA)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-900 text-white p-6 rounded-2xl space-y-3 shadow-lg">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Croissance & Progression
                    </span>
                    <div className="text-3xl font-black text-emerald-300">
                      {goalAchievementPercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-emerald-100">
                      Trajectoire positive tirée par la régularité de la livraison avicole.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: CARNET D'ADRESSES CLIENTS (CRM) */}
        {activeSubTab === "clients" && (
          <div className="p-6 space-y-6">
            {/* AI RELANCE BANNER FOR INACTIVE CLIENTS (>30 DAYS) */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-purple-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-purple-800/80 rounded-xl text-amber-300 shrink-0 mt-0.5">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      IA Assistante Commerciale
                    </span>
                    <span className="text-xs text-purple-200 font-bold">
                      • {clientsList.filter((c) => (c.daysSinceLastOrder && c.daysSinceLastOrder > 30) || c.status === "Inactif").length} Clients Inactifs (&gt; 30 Jours)
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">
                    Analyse du Carnet & Relance Intelligente
                  </h4>
                  <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                    L'IA analyse le comportement d'achat de votre carnet d'adresses et rédige automatiquement des messages types sur-mesure (SMS, WhatsApp, Email) pour réengager vos clients inactifs.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAIRelanceMessages}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow shrink-0"
              >
                <Sparkles className="w-4 h-4 text-purple-900" />
                <span>Générer Messages de Relance</span>
              </button>
            </div>

            {/* PRODUCT SESSIONS SUB-NAVBAR FOR CLIENT PORTFOLIO */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span className="font-extrabold text-sm text-white">
                    Portefeuilles Clients par Session Produit
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddSessionOpen(!isAddSessionOpen)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une Session Produit</span>
                  </button>
                </div>
              </div>

              {/* Add New Session Bar */}
              {isAddSessionOpen && (
                <div className="flex items-center space-x-2 bg-slate-800 p-2.5 rounded-xl border border-emerald-500/50">
                  <input
                    type="text"
                    placeholder="Nom de la nouvelle session (ex: Prestations Vétérinaires, Œufs...)"
                    value={newSessionInput}
                    onChange={(e) => setNewSessionInput(e.target.value)}
                    className="flex-1 bg-slate-950 text-white px-3 py-1.5 rounded-lg text-xs font-bold outline-none border border-slate-700"
                  />
                  <button
                    onClick={() => {
                      if (newSessionInput.trim() && !productSessions.includes(newSessionInput.trim())) {
                        setProductSessions([...productSessions, newSessionInput.trim()]);
                        setClientSessionFilter(newSessionInput.trim());
                        setNewSessionInput("");
                        setIsAddSessionOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg uppercase cursor-pointer"
                  >
                    Valider
                  </button>
                </div>
              )}

              {/* Session Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
                <button
                  onClick={() => setClientSessionFilter("Tous")}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    clientSessionFilter === "Tous"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Tous les Clients ({clientsList.length})
                </button>

                <button
                  onClick={() => setClientSessionFilter("Volaille (Aviculture)")}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                    clientSessionFilter === "Volaille (Aviculture)"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span>🐔 Portefeuille Volaille</span>
                </button>

                <button
                  onClick={() => setClientSessionFilter("Porc (Porciculture)")}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                    clientSessionFilter === "Porc (Porciculture)"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span>🐖 Portefeuille Porc</span>
                </button>

                {productSessions
                  .filter((s) => !s.includes("Volaille") && !s.includes("Porc"))
                  .map((sessionName) => (
                    <button
                      key={sessionName}
                      onClick={() => setClientSessionFilter(sessionName)}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                        clientSessionFilter === sessionName
                          ? "bg-amber-500 text-slate-950 font-black shadow-md"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      📦 {sessionName}
                    </button>
                  ))}
              </div>
            </div>

            {/* Top Toolbar: Search, Type Filter, Add Client */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64 text-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Rechercher nom, tel, ville..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium"
                  />
                </div>

                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-slate-500 font-semibold">Type :</span>
                  <select
                    value={clientTypeFilter}
                    onChange={(e) => setClientTypeFilter(e.target.value)}
                    className="p-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="Tous">Tous les types</option>
                    <option value="Restaurateur">Restaurateurs / Maquis</option>
                    <option value="Boucherie">Boucheries</option>
                    <option value="Grossiste">Grossistes</option>
                    <option value="Supermarché">Supermarchés</option>
                    <option value="Hôtel / Traiteur">Hôtels / Traiteurs</option>
                    <option value="Particulier">Particuliers</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingClient(null);
                  setNewClientName("");
                  setNewClientPhone("");
                  setNewClientEmail("");
                  setNewClientNotes("");
                  setIsAddClientOpen(true);
                }}
                className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Client au Carnet</span>
              </button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.map((client) => {
                const initials = client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                const cleanPhone = client.phone.replace(/[^0-9]/g, "");

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs p-5 space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Client Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-slate-900 text-amber-300 font-black flex items-center justify-center text-sm shadow">
                            {initials}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm leading-tight">
                              {client.name}
                            </h5>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                                {client.type}
                              </span>
                              {client.status === "VIP" && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[10px]">
                                  ⭐ VIP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleOpenEditClient(client)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Modifier Fiche Client"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title="Supprimer Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Contact Details & Links */}
                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold">{client.phone}</span>
                          </div>

                          <div className="flex space-x-1">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] hover:bg-emerald-200"
                              title="Appeler"
                            >
                              Appeler
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-green-600 text-white rounded font-bold text-[10px] hover:bg-green-700"
                              title="Message WhatsApp"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>

                        {client.email && (
                          <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-200/60">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] truncate">{client.email}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-200/60">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-800">{client.city}</span>
                        </div>
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Cumul Achats
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatFCFA(client.totalSpent)}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Solde Dû
                          </span>
                          <span
                            className={`font-black text-sm ${
                              client.creditBalance > 0 ? "text-rose-600" : "text-emerald-700"
                            }`}
                          >
                            {formatFCFA(client.creditBalance)}
                          </span>
                        </div>
                      </div>

                      {client.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                          "{client.notes}"
                        </p>
                      )}
                    </div>

                    {/* Quick Sale Action Button */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleQuickSaleForClient(client.id)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enregistrer Vente pour ce Client</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="col-span-full p-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  Aucun client ne correspond à votre recherche.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: OBJECTIFS ANNUELS & COACHING IA */}
        {activeSubTab === "goals_ai" && (
          <div className="p-6 space-y-6">
            {/* Top Target Summary Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-5 border border-emerald-900">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    <h3 className="font-black text-lg text-white">
                      Objectifs Annuels de Ventes (Exercice 2026)
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-200">
                    Définissez et mesurez vos objectifs mensuels de chiffre d'affaires et sollicitez l'IA Coach Commercial.
                  </p>
                </div>

                {/* Edit Target Input */}
                <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-300 font-bold">Cible Annuelle :</span>
                  <input
                    type="number"
                    value={annualGoal.overallTargetFCFA}
                    onChange={(e) =>
                      setAnnualGoal({
                        ...annualGoal,
                        overallTargetFCFA: Number(e.target.value) || 0,
                      })
                    }
                    className="p-1 bg-slate-900 text-amber-300 font-black text-sm rounded border border-slate-700 w-36 text-right"
                  />
                  <span className="text-xs text-slate-400 font-bold">FCFA</span>
                </div>
              </div>

              {/* YTD Progress Bar & Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-300">
                    Niveau Atteint Cumulé (Janvier - Juillet) : {formatFCFA(totalActualYTD)}
                  </span>
                  <span className="text-amber-300 font-black text-sm">
                    {goalAchievementPercent.toFixed(1)} % de l'objectif
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-4 p-0.5 overflow-hidden border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 shadow-lg"
                    style={{ width: `${Math.min(100, goalAchievementPercent)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Reste à Réaliser : {formatFCFA(Math.max(0, annualGoal.overallTargetFCFA - totalActualYTD))}</span>
                  <span>Cible Finale : {formatFCFA(annualGoal.overallTargetFCFA)}</span>
                </div>
              </div>
            </div>

            {/* BREAK-EVEN & MONTHLY SALES TARGET SIMULATOR */}
            <div className="bg-white rounded-2xl border-2 border-emerald-600/80 shadow-lg p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-emerald-100 text-emerald-900 rounded-xl font-black text-xs flex items-center space-x-1">
                      <Calculator className="w-4 h-4 text-emerald-700" />
                      <span>SIMULATEUR FINANCIER</span>
                    </span>
                    <h4 className="font-black text-slate-900 text-base">
                      Simulateur de Seuil de Rentabilité & Objectifs de Vente Mensuels
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Calculez automatiquement le volume d'animaux et le chiffre d'affaires mensuel requis pour couvrir vos charges fixes et dégager votre bénéfice net cible en utilisant vos coûts unitaires réels.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyBreakEvenToMonthlyTargets}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Appliquer cet Objectif ({formatFCFA(targetRevenueWithProfitFCFA)}) aux Mois 2026</span>
                </button>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Type de produit */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase block">Type de Produit :</label>
                  <select
                    value={simProductType}
                    onChange={(e) => {
                      const val = e.target.value as "poulet" | "porc" | "mixte";
                      setSimProductType(val);
                      if (val === "poulet") {
                        setUnitVariableCostFCFA(unitCosts.poulet1_7kg || 2200);
                        setUnitSellingPriceFCFA(3500);
                      } else if (val === "porc") {
                        setUnitVariableCostFCFA(unitCosts.porcCharcutier || 110000);
                        setUnitSellingPriceFCFA(160000);
                      }
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="poulet">🐔 Poulet de Chair Vivant / PAC</option>
                    <option value="porc">🐖 Porc Charcutier</option>
                    <option value="mixte">📦 Produit Personnalisé / Mixte</option>
                  </select>
                </div>

                {/* Charges Fixes Mensuelles */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase block">
                    Charges Fixes Mensuelles (FCFA) :
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={fixedCostsMonthlyFCFA}
                    onChange={(e) => setFixedCostsMonthlyFCFA(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                  <span className="text-[10px] text-slate-500 font-medium block">Salaires, Électricité, Loyer, Vétérinaire</span>
                </div>

                {/* Coût Variable Unitaire */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase block">
                    Coût Variable Unitaire (FCFA) :
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={unitVariableCostFCFA}
                    onChange={(e) => setUnitVariableCostFCFA(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-xs text-amber-900 focus:ring-2 focus:ring-amber-500 text-right"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block">Coût réel : Aliment + Poussin/Porcelet</span>
                </div>

                {/* Prix de Vente Unitaire Moyen */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase block">
                    Prix Vente Unitaire (FCFA) :
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={unitSellingPriceFCFA}
                    onChange={(e) => setUnitSellingPriceFCFA(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-bold text-xs text-emerald-900 focus:ring-2 focus:ring-emerald-500 text-right"
                  />
                  <span className="text-[10px] text-slate-500 font-medium block">Prix moyen de vente au marché</span>
                </div>

                {/* Bénéfice Net Mensuel Visé */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase block">
                    Bénéfice Net Cible (FCFA/m) :
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={desiredMonthlyNetProfitFCFA}
                    onChange={(e) => setDesiredMonthlyNetProfitFCFA(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-lg font-bold text-xs text-indigo-900 focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                  <span className="text-[10px] text-indigo-700 font-bold block">Profit net mensuel souhaité</span>
                </div>
              </div>

              {/* Results Output KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: MSCV */}
                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
                  <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide">
                    Marge sur Coût Variable (MSCV)
                  </div>
                  <div className="text-xl font-black text-emerald-950">
                    {formatFCFA(mscvUnitFCFA)} / sujet
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    Taux de Marge : {mscvRatePercent.toFixed(1)} %
                  </div>
                </div>

                {/* Card 2: Seuil de Rentabilité (Point Mort) */}
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
                  <div className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wide">
                    Seuil de Rentabilité (Point Mort)
                  </div>
                  <div className="text-xl font-black text-amber-950">
                    {breakEvenUnits.toLocaleString("fr-FR")} sujets / mois
                  </div>
                  <div className="text-xs font-bold text-amber-800">
                    CA Seuil : {formatFCFA(breakEvenRevenueFCFA)} / mois
                  </div>
                </div>

                {/* Card 3: Cible Mensuelle Requise */}
                <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide">
                    Objectif Mensuel Cible (avec Profit)
                  </div>
                  <div className="text-xl font-black text-white">
                    {formatFCFA(targetRevenueWithProfitFCFA)}
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    Volume requis : {targetUnitsWithProfit.toLocaleString("fr-FR")} sujets / mois
                  </div>
                </div>

                {/* Card 4: Cadence Quotidienne */}
                <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-1">
                  <div className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wide">
                    Cadence Quotidienne d'Écoulement
                  </div>
                  <div className="text-xl font-black text-indigo-950">
                    {dailyTargetUnits} sujets / jour
                  </div>
                  <div className="text-xs font-bold text-indigo-700">
                    CA Jour : {formatFCFA(dailyTargetUnits * unitSellingPriceFCFA)} / jour
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Target vs Actual Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Tableau de Suivi Mois par Mois (M1 à M12)
                </h4>
                <span className="text-xs text-slate-500">
                  Écart = Réalisé Effectif - Objectif Cible
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <th className="p-3">Mois</th>
                      <th className="p-3 text-right">Objectif Cible (FCFA)</th>
                      <th className="p-3 text-right">Réalisé Effectif (FCFA)</th>
                      <th className="p-3 text-right">Écart (FCFA)</th>
                      <th className="p-3 text-center">Niveau Atteint</th>
                      <th className="p-3 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {annualGoal.monthlyTargets.map((m, idx) => {
                      const gap = m.actualFCFA - m.targetFCFA;
                      const percent = m.targetFCFA > 0 ? (m.actualFCFA / m.targetFCFA) * 100 : 0;
                      const isFutureMonth = m.actualFCFA === 0;

                      return (
                        <tr key={m.monthIndex} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-slate-900">{m.monthName}</td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              value={m.targetFCFA}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const updated = [...annualGoal.monthlyTargets];
                                updated[idx].targetFCFA = val;
                                setAnnualGoal({ ...annualGoal, monthlyTargets: updated });
                              }}
                              className="w-28 p-1 text-right border border-slate-200 rounded font-bold text-slate-800 bg-slate-50 focus:bg-white"
                            />
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">
                            {formatFCFA(m.actualFCFA)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              gap >= 0 ? "text-emerald-700" : isFutureMonth ? "text-slate-400" : "text-rose-600"
                            }`}
                          >
                            {gap >= 0 ? `+${formatFCFA(gap)}` : formatFCFA(gap)}
                          </td>
                          <td className="p-3 text-center w-32">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-700">
                                {percent.toFixed(0)}%
                              </span>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    percent >= 100
                                      ? "bg-emerald-600"
                                      : percent >= 80
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                  }`}
                                  style={{ width: `${Math.min(100, percent)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {percent >= 100 ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                                Atteint 🎯
                              </span>
                            ) : percent >= 80 ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                                En cours ⚡
                              </span>
                            ) : isFutureMonth ? (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">
                                À venir
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                                En retard ⚠️
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Sales Coach Trigger Section */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 p-6 rounded-2xl border border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-amber-950 font-black text-base">
                    <Bot className="w-5 h-5 text-amber-700" />
                    <span>IA Coach Commercial & Conseils pour Atteindre l'Objectif</span>
                  </div>
                  <p className="text-xs text-slate-700 max-w-xl">
                    Demandez à l'intelligence artificielle d'analyser l'écart restant et de vous fournir des actions stratégiques chiffrées pour réussir vos ventes annuelles.
                  </p>
                </div>

                <button
                  onClick={handleFetchAIGoalCoaching}
                  disabled={isCoachingLoading}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isCoachingLoading ? (
                    <span>Analyse IA en cours...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Consulter l'IA Coach Commercial</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render AI Goal Coaching Response */}
              {aiGoalCoaching && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Bot className="w-4 h-4" />
                      <span>Plan d'Action Commercial IA Gemini</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Ivoire Élevage Ventes</span>
                  </div>
                  <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {aiGoalCoaching}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB 5: SUIVI DES VENDEURS */}
        {activeSubTab === "vendeurs" && (
          <div className="p-6 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-base">
              Performance de la Force de Vente Commerciale
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                    <th className="p-3">Commercial (Vendeur)</th>
                    <th className="p-3">Secteur / Zone</th>
                    <th className="p-3 text-right">Taux Commission</th>
                    <th className="p-3 text-right">Objectif Mensuel</th>
                    <th className="p-3 text-right">Ventes Réalisées</th>
                    <th className="p-3 text-right">Commission Acquise</th>
                    <th className="p-3 text-center">Progression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {agentsList.map((agent) => {
                    const commissionAmount =
                      (agent.achievedSalesFCFA * agent.commissionRatePercent) / 100;
                    const progressPercent =
                      agent.monthlyTargetFCFA > 0
                        ? Math.min(100, (agent.achievedSalesFCFA / agent.monthlyTargetFCFA) * 100)
                        : 0;

                    return (
                      <tr key={agent.id} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">
                          {agent.name}
                          <div className="text-[10px] text-slate-400 font-normal">{agent.phone}</div>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{agent.zone}</td>
                        <td className="p-3 text-right font-bold text-amber-800">
                          {agent.commissionRatePercent} %
                        </td>
                        <td className="p-3 text-right text-slate-600">
                          {formatFCFA(agent.monthlyTargetFCFA)}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {formatFCFA(agent.achievedSalesFCFA)}
                        </td>
                        <td className="p-3 text-right font-extrabold text-emerald-800">
                          {formatFCFA(commissionAmount)}
                        </td>
                        <td className="p-3 text-center w-36">
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-700">
                              {progressPercent.toFixed(0)}%
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progressPercent >= 100 ? "bg-emerald-600" : "bg-amber-500"
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB 6: ATELIER DÉCOUPE & TRANSFORMATION */}
        {activeSubTab === "decoupes" && (
          <div className="p-6">
            <MeatProcessingCalculator />
          </div>
        )}

        {/* SUB-TAB 7: ÉVOLUTIONS HISTORIQUES DES PRIX & ANALYSE STRATÉGIQUE */}
        {activeSubTab === "price_history" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Aide à la Prise de Décision Commerciale & Analyse des Cours</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>Évolution Historique des Prix de Vente (12 Mois)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Suivez les cours historiques du poulet de chair, des carcasses de porc, des porcelets et des sous-produits pour fixer vos tarifs au meilleur moment.
                </p>
              </div>

              {/* Price Series Filter */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
                <button
                  onClick={() => setSelectedPriceSeries("tous")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedPriceSeries === "tous"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tous les Produits
                </button>
                <button
                  onClick={() => setSelectedPriceSeries("volailles")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedPriceSeries === "volailles"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🐔 Volailles (Vivant & PAC)
                </button>
                <button
                  onClick={() => setSelectedPriceSeries("porcs")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedPriceSeries === "porcs"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🐖 Porciculture (Carcasses & Porcelets)
                </button>
                <button
                  onClick={() => setSelectedPriceSeries("subproduits")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedPriceSeries === "subproduits"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌾 Fiente & Lisier
                </button>
              </div>
            </div>

            {/* Price Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                <div className="flex justify-between items-center text-rose-800 font-extrabold text-[10px] uppercase">
                  <span>Poulet PAC Éviscéré</span>
                  <span className="text-emerald-700 font-black">+16.3% / an</span>
                </div>
                <div className="text-2xl font-black text-rose-950">2 850 FCFA / kg</div>
                <span className="text-[10px] text-rose-700">Prix courant Juillet 2026</span>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                <div className="flex justify-between items-center text-purple-800 font-extrabold text-[10px] uppercase">
                  <span>Carcasse Porcine</span>
                  <span className="text-emerald-700 font-black">+18.6% / an</span>
                </div>
                <div className="text-2xl font-black text-purple-950">2 550 FCFA / kg</div>
                <span className="text-[10px] text-purple-700">Demande forte chevilleurs</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <div className="flex justify-between items-center text-amber-800 font-extrabold text-[10px] uppercase">
                  <span>Porcelet Sevré 10kg</span>
                  <span className="text-emerald-700 font-black">+15.6% / an</span>
                </div>
                <div className="text-2xl font-black text-amber-950">37 000 FCFA / suj</div>
                <span className="text-[10px] text-amber-800">Engouement engraisseurs</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex justify-between items-center text-emerald-800 font-extrabold text-[10px] uppercase">
                  <span>Période de Pic Maximale</span>
                  <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black">Novembre - Décembre</span>
                </div>
                <div className="text-2xl font-black text-emerald-950">+25% Marge</div>
                <span className="text-[10px] text-emerald-700">Anticiper les mises en place</span>
              </div>
            </div>

            {/* Recharts Historical Price Line Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Courbe d'Évolution Mensuelle des Prix Unitaires de Vente (FCFA)</span>
                </h4>
                <div className="flex items-center space-x-4 text-[11px] font-bold">
                  {(selectedPriceSeries === "tous" || selectedPriceSeries === "volailles") && (
                    <span className="flex items-center space-x-1 text-rose-600">
                      <span className="w-3 h-3 bg-rose-600 rounded-full inline-block"></span>
                      <span>Poulet PAC (kg)</span>
                    </span>
                  )}
                  {(selectedPriceSeries === "tous" || selectedPriceSeries === "volailles") && (
                    <span className="flex items-center space-x-1 text-amber-600">
                      <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
                      <span>Poulet Vivant (kg)</span>
                    </span>
                  )}
                  {(selectedPriceSeries === "tous" || selectedPriceSeries === "porcs") && (
                    <span className="flex items-center space-x-1 text-purple-600">
                      <span className="w-3 h-3 bg-purple-600 rounded-full inline-block"></span>
                      <span>Carcasse Porc (kg)</span>
                    </span>
                  )}
                  {(selectedPriceSeries === "tous" || selectedPriceSeries === "subproduits") && (
                    <span className="flex items-center space-x-1 text-emerald-600">
                      <span className="w-3 h-3 bg-emerald-600 rounded-full inline-block"></span>
                      <span>Sac Fiente (50kg)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalPriceData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 11, fontWeight: 700 }}
                      tickFormatter={(val) => `${val} FCFA`}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        formatFCFA(Number(value)),
                        name === "pouletVivant"
                          ? "Poulet Vivant (/kg)"
                          : name === "pouletEviscere"
                          ? "Poulet PAC Éviscéré (/kg)"
                          : name === "carcassePorc"
                          ? "Carcasse Porcine (/kg)"
                          : name === "porceletSevre"
                          ? "Porcelet Sevré (/sujet)"
                          : "Sac Fiente 50kg",
                      ]}
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                    />
                    <Legend />

                    {(selectedPriceSeries === "tous" || selectedPriceSeries === "volailles") && (
                      <Line
                        type="monotone"
                        dataKey="pouletEviscere"
                        name="Poulet PAC Éviscéré (FCFA/kg)"
                        stroke="#e11d48"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    )}

                    {(selectedPriceSeries === "tous" || selectedPriceSeries === "volailles") && (
                      <Line
                        type="monotone"
                        dataKey="pouletVivant"
                        name="Poulet Vivant (FCFA/kg)"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 3 }}
                      />
                    )}

                    {(selectedPriceSeries === "tous" || selectedPriceSeries === "porcs") && (
                      <Line
                        type="monotone"
                        dataKey="carcassePorc"
                        name="Carcasse Porcine (FCFA/kg)"
                        stroke="#9333ea"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    )}

                    {(selectedPriceSeries === "tous" || selectedPriceSeries === "subproduits") && (
                      <Line
                        type="monotone"
                        dataKey="fienteSac"
                        name="Sac Fiente Volaille (FCFA/sac)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategic Analysis & Recommendations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Synthèse Comparative & Recommandations Stratégiques Tarifaires</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                      <th className="p-3">Produit / Categorie</th>
                      <th className="p-3">Unité</th>
                      <th className="p-3 text-center">Prix Bas (Saison Sèche)</th>
                      <th className="p-3 text-center text-rose-700">Prix Haut (Fêtes / Pic)</th>
                      <th className="p-3 text-center text-emerald-800">Prix Actuel (Juil 26)</th>
                      <th className="p-3">Conseil Stratégique Vente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-900">Poulet PAC Éviscéré / Barquette</td>
                      <td className="p-3 font-semibold text-slate-500">FCFA / kg</td>
                      <td className="p-3 text-center font-bold text-slate-600">2 450 FCFA</td>
                      <td className="p-3 text-center font-black text-rose-700">3 050 FCFA</td>
                      <td className="p-3 text-center font-black text-emerald-700">2 850 FCFA</td>
                      <td className="p-3 text-slate-600">Privilégier les contrats annuels à prix fixe (2 750 FCFA) avec supermarchés.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-900">Carcasse Porcine Charcutière</td>
                      <td className="p-3 font-semibold text-slate-500">FCFA / kg</td>
                      <td className="p-3 text-center font-bold text-slate-600">2 150 FCFA</td>
                      <td className="p-3 text-center font-black text-rose-700">2 750 FCFA</td>
                      <td className="p-3 text-center font-black text-emerald-700">2 550 FCFA</td>
                      <td className="p-3 text-slate-600">Vendre en découpe sous barquettes (+25% de marge nette vs carcasse entière).</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-900">Porcelet Sevré 10kg</td>
                      <td className="p-3 font-semibold text-slate-500">FCFA / sujet</td>
                      <td className="p-3 text-center font-bold text-slate-600">32 000 FCFA</td>
                      <td className="p-3 text-center font-black text-rose-700">38 500 FCFA</td>
                      <td className="p-3 text-center font-black text-emerald-700">37 000 FCFA</td>
                      <td className="p-3 text-slate-600">Offrir des remises dégressives pour l'achat de lots de plus de 30 porcelets.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-900">Fiente Volaille / Lisier SÉCHÉ</td>
                      <td className="p-3 font-semibold text-slate-500">FCFA / sac 50kg</td>
                      <td className="p-3 text-center font-bold text-slate-600">1 500 FCFA</td>
                      <td className="p-3 text-center font-black text-rose-700">2 200 FCFA</td>
                      <td className="p-3 text-center font-black text-emerald-700">2 000 FCFA</td>
                      <td className="p-3 text-slate-600">S'associer avec les coopératives maraîchères de Yamoussoukro pendant la saison des pluies.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 8: ASSISTANT IA VENTES & EXPANSION */}
        {activeSubTab === "ai" && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 p-5 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-black text-base">
                <Bot className="w-5 h-5 text-amber-700" />
                <span>Assistant IA Commercial & Générateur de Messages Vente</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                Interrogez l'IA pour générer des offres commerciales sur-mesure, des scripts WhatsApp de relance pour les maquis, ou optimiser la tarification de vos produits.
              </p>

              {/* Quick AI Prompts */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() =>
                    handleAskSalesAI(
                      "Propose-moi un message WhatsApp professionnel pour démarcher 20 grands maquis et restaurateurs à Abidjan pour nos poulets découpés prêts-à-cuire."
                    )
                  }
                  className="px-3 py-1.5 bg-white hover:bg-amber-200/50 text-slate-900 border border-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  📱 WhatsApp Démarchage Restaurateurs
                </button>

                <button
                  onClick={() =>
                    handleAskSalesAI(
                      "Comment optimiser le prix de nos morceaux de découpe de porc (côtelettes, filet mignon, jambon) pour écouler 50 carcasses par mois ?"
                    )
                  }
                  className="px-3 py-1.5 bg-white hover:bg-amber-200/50 text-slate-900 border border-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  🥩 Stratégie Prix Découpe Porc
                </button>

                <button
                  onClick={() =>
                    handleAskSalesAI(
                      "Génère une relance de créance polie mais ferme pour un client restaurateur qui doit 150 000 FCFA depuis 15 jours."
                    )
                  }
                  className="px-3 py-1.5 bg-white hover:bg-amber-200/50 text-slate-900 border border-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  ✉️ Message Relance Impayé
                </button>
              </div>
            </div>

            {/* AI Custom Query Input */}
            <div className="space-y-3">
              <label className="block text-slate-900 font-extrabold text-xs">
                Posez votre question commerciale :
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Propose un barème de remises dégressives pour les grossistes achetant plus de 500 poulets..."
                  className="flex-1 p-3 border border-slate-300 rounded-xl bg-white text-xs text-slate-900 focus:outline-emerald-600"
                />
                <button
                  onClick={() => handleAskSalesAI()}
                  disabled={isAiLoading || !aiPrompt}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isAiLoading ? (
                    <span>Génération...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Générer</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Output Display */}
            {aiResponse && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Bot className="w-4 h-4" />
                    <span>Recommandation Commerciale IA Gemini</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ivoire Élevage Ventes</span>
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD SALE MODAL */}
      {isAddSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <span>Enregistrer une Nouvelle Vente / Émettre Facture</span>
              </h3>
              <button
                onClick={() => setIsAddSaleOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSaleSubmit} className="space-y-4 text-xs">
              {/* Select Client & Agent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sélectionner Client :</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900"
                  >
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type} - {c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Commercial Attribué :</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900"
                  >
                    {agentsList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-slate-900">Articles / Produits Vendus :</label>
                  <button
                    type="button"
                    onClick={handleAddItemToNewSale}
                    className="text-amber-800 hover:text-amber-900 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Produit</span>
                  </button>
                </div>

                {newSaleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center"
                  >
                    <div className="col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdateItem(idx, "productId", e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded bg-white font-bold text-slate-900 text-[11px]"
                      >
                        {cutProductsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.module}] {p.name} ({p.unitPriceFCFA} FCFA)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, "quantity", e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded bg-white text-center font-bold text-slate-900"
                        placeholder="Qté"
                      />
                    </div>

                    <div className="col-span-3 text-right font-black text-emerald-800">
                      {formatFCFA(item.totalPriceFCFA)}
                    </div>

                    <div className="col-span-2 text-right">
                      {newSaleItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mode de Paiement :</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="Wave">Wave Mobile Money</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Espèces (Cash)">Espèces (Cash)</option>
                    <option value="Virement Bancaire">Virement Bancaire</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Statut du Paiement :</label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900"
                  >
                    <option value="Payé">Payé au comptant</option>
                    <option value="Partiel">Paiement Partiel / Acompte</option>
                    <option value="En attente">En attente (Crédit client)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Remarques Livraison :</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Ex: Livré à la boucherie Marcory à 08h00..."
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900"
                />
              </div>

              {/* Summary Bar & Submit */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Facture :</div>
                  <div className="text-xl font-black text-amber-600">{formatFCFA(newSaleTotalAmount)}</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSaleOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow"
                  >
                    Enregistrer Vente & Imprimer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT CLIENT MODAL */}
      {(isAddClientOpen || editingClient) && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{editingClient ? "Modifier Client CRM" : "Nouveau Client CRM"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddClientOpen(false);
                  setEditingClient(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom / Enseigne du Client :</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Maquis Le VIP, Grossiste Diallo..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Type de Client :</label>
                  <select
                    value={newClientType}
                    onChange={(e) => setNewClientType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Restaurateur">Restaurateur / Maquis</option>
                    <option value="Boucherie">Boucherie</option>
                    <option value="Grossiste">Grossiste</option>
                    <option value="Supermarché">Supermarché</option>
                    <option value="Hôtel / Traiteur">Hôtel / Traiteur</option>
                    <option value="Particulier">Particulier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ville / Zone :</label>
                  <input
                    type="text"
                    value={newClientCity}
                    onChange={(e) => setNewClientCity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Téléphone / WhatsApp :</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Client :</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@domaine.ci"
                    className="w-full p-2 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Produits Préférés :</label>
                <input
                  type="text"
                  value={newClientCategory}
                  onChange={(e) => setNewClientCategory(e.target.value)}
                  placeholder="Ex: Poulets PAC, Découpes Porc, Carcasses..."
                  className="w-full p-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Préférences :</label>
                <input
                  type="text"
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Ex: Commande 50 kg par semaine, demande livraison tôt le matin..."
                  className="w-full p-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddClientOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow"
                >
                  Enregistrer Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AI CLIENTS RELANCE MODAL (>30 DAYS) */}
      {isAIRelanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 max-w-3xl w-full p-6 space-y-6 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-800 to-indigo-900 text-amber-300 rounded-2xl shadow">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
                    <span>Propositions de Relance IA (Clients &gt; 30 Jours)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Génération automatique de messages de relance personnalisés adaptés aux profils clients.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAIRelanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-black p-2 text-lg rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {isAIRelanceLoading ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-purple-800 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    L'IA analyse le carnet d'adresses & rédige vos relances...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Prise en compte des types d'établissements, historiques de commande et coordonnées pour une stratégie sur-mesure.
                  </p>
                </div>
              ) : relanceMessages.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-extrabold text-emerald-900 text-sm">
                    Excellente nouvelle ! Tous vos clients sont actifs.
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Aucun client n'a dépassé le seuil des 30 jours sans passer de commande dans votre carnet d'adresses.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>
                      💡 {relanceMessages.length} client(s) inactif(s) identifié(s). Cliquez sur WhatsApp ou Email pour expédier directement le message.
                    </span>
                  </div>

                  {relanceMessages.map((msg, index) => {
                    const cleanPhone = msg.clientPhone.replace(/[^0-9]/g, "");

                    const handleCopyMessage = () => {
                      navigator.clipboard.writeText(msg.suggestedMessage);
                      setRelanceMessages((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, copied: true } : m))
                      );
                      setTimeout(() => {
                        setRelanceMessages((prev) =>
                          prev.map((m, i) => (i === index ? { ...m, copied: false } : m))
                        );
                      }, 2500);
                    };

                    return (
                      <div
                        key={msg.clientId}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-purple-400 transition-all space-y-3"
                      >
                        {/* Client Header info */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-sm">{msg.clientName}</span>
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                              {msg.clientType}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">• {msg.city}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[10px]">
                              Inactif depuis {msg.daysSinceLastOrder} jours
                            </span>
                          </div>
                        </div>

                        {/* Editable or review Message Box */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 block">
                            Message Type Proposé par l'IA :
                          </label>
                          <textarea
                            value={msg.suggestedMessage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRelanceMessages((prev) =>
                                prev.map((m, i) => (i === index ? { ...m, suggestedMessage: val } : m))
                              );
                            }}
                            rows={4}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs leading-relaxed focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="text-[11px] text-slate-500 font-bold flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{msg.clientPhone}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={handleCopyMessage}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                msg.copied
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                              }`}
                            >
                              {msg.copied ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              <span>{msg.copied ? "Copié !" : "Copier"}</span>
                            </button>

                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg.suggestedMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Relancer WhatsApp</span>
                            </a>

                            {msg.clientEmail && (
                              <a
                                href={`mailto:${msg.clientEmail}?subject=${encodeURIComponent(
                                  "Offre Privilège Ivoire Élevage"
                                )}&body=${encodeURIComponent(msg.suggestedMessage)}`}
                                className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-extrabold text-xs flex items-center space-x-1 transition-all shadow-xs"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Email</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsAIRelanceModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs shadow cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        sale={selectedInvoice}
      />

      {/* SITES AND BUILDINGS MANAGER MODAL */}
      <SitesAndBuildingsManagerModal
        isOpen={isSitesModalOpen}
        onClose={() => setIsSitesModalOpen(false)}
      />

      {/* SALES TARIFFS AND PROMOS MODAL (WHATSAPP INTEGRATED) */}
      <SalesTariffsAndPromosModal
        isOpen={isTariffsModalOpen}
        onClose={() => setIsTariffsModalOpen(false)}
      />
    </div>
  );
};
