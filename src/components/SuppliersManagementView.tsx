import React, { useState } from "react";
import { Supplier, SupplierOrder, UnitCosts } from "../types";
import { getApiUrl } from "../utils/api";
import { initialSuppliers } from "../data/suppliersData";
import { formatFCFA } from "../utils/formatters";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Edit3,
  Trash2,
  ShoppingBag,
  Bot,
  Sparkles,
  Send,
  X,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Package,
} from "lucide-react";

interface SuppliersManagementViewProps {
  unitCosts?: UnitCosts;
}

export const SuppliersManagementView: React.FC<SuppliersManagementViewProps> = ({
  unitCosts,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  // Filters
  const [selectedModule, setSelectedModule] = useState<string>("Tous");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "orders" | "debts" | "ai_sourcing">("directory");

  // Selected Supplier for Drawer/Details
  const [selectedSupplierForOrders, setSelectedSupplierForOrders] = useState<Supplier | null>(null);

  // Modal State for Add/Edit Supplier
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form Fields for Supplier
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<Supplier["category"]>("Couvoirs & Poussins");
  const [formContactName, setFormContactName] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formCityLocation, setFormCityLocation] = useState<string>("");
  const [formRatingStars, setFormRatingStars] = useState<number>(5);
  const [formPaymentTerms, setFormPaymentTerms] = useState<Supplier["paymentTerms"]>("Paiement Wave / Mobile");
  const [formStatus, setFormStatus] = useState<Supplier["status"]>("Actif");
  const [formNotes, setFormNotes] = useState<string>("");

  // Modal State for Add Order
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [targetSupplierForNewOrder, setTargetSupplierForNewOrder] = useState<Supplier | null>(null);

  // Order Form Fields
  const [orderDescription, setOrderDescription] = useState<string>("");
  const [orderModule, setOrderModule] = useState<SupplierOrder["module"]>("Fabrique d'Aliments");
  const [orderQuantity, setOrderQuantity] = useState<number>(1000);
  const [orderUnitLabel, setOrderUnitLabel] = useState<string>("Kg");
  const [orderUnitPrice, setOrderUnitPrice] = useState<number>(180);
  const [orderAmountPaid, setOrderAmountPaid] = useState<number>(180000);
  const [orderNotes, setOrderNotes] = useState<string>("");

  // AI Sourcing Assistant State
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // --- CALCULATED AGGREGATES ---
  const totalSuppliersCount = suppliers.length;
  const totalPurchasesConsolidated = suppliers.reduce((sum, s) => sum + s.totalPurchasesFCFA, 0);
  const totalOutstandingDebts = suppliers.reduce((sum, s) => sum + s.outstandingDebtFCFA, 0);

  // Filtered Suppliers List
  const filteredSuppliers = suppliers.filter((supp) => {
    const matchesModule =
      selectedModule === "Tous" ||
      supp.modulesSupported.includes(selectedModule as any);

    const matchesCategory =
      selectedCategory === "Toutes" || supp.category === selectedCategory;

    const matchesSearch =
      supp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supp.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supp.cityLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supp.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesModule && matchesCategory && matchesSearch;
  });

  // Flat list of all orders across suppliers
  const allOrdersList = suppliers.flatMap((s) =>
    s.ordersHistory.map((ord) => ({
      ...ord,
      supplierName: s.name,
      supplierCode: s.code,
      supplierPhone: s.phone,
    }))
  );

  // Open Add Supplier Modal
  const handleOpenAddSupplierModal = () => {
    setEditingSupplier(null);
    setFormName("");
    setFormCategory("Matières Premières & Céréales");
    setFormContactName("");
    setFormPhone("+225 07 00 00 00 00");
    setFormEmail("");
    setFormCityLocation("Abidjan");
    setFormRatingStars(5);
    setFormPaymentTerms("Paiement Wave / Mobile");
    setFormStatus("Actif");
    setFormNotes("");
    setIsSupplierModalOpen(true);
  };

  // Open Edit Supplier Modal
  const handleOpenEditSupplierModal = (supp: Supplier) => {
    setEditingSupplier(supp);
    setFormName(supp.name);
    setFormCategory(supp.category);
    setFormContactName(supp.contactName);
    setFormPhone(supp.phone);
    setFormEmail(supp.email || "");
    setFormCityLocation(supp.cityLocation);
    setFormRatingStars(supp.ratingStars);
    setFormPaymentTerms(supp.paymentTerms);
    setFormStatus(supp.status);
    setFormNotes(supp.notes || "");
    setIsSupplierModalOpen(true);
  };

  // Save Supplier
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContactName.trim()) return;

    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                name: formName,
                category: formCategory,
                contactName: formContactName,
                phone: formPhone,
                email: formEmail,
                cityLocation: formCityLocation,
                ratingStars: formRatingStars,
                paymentTerms: formPaymentTerms,
                status: formStatus,
                notes: formNotes,
              }
            : s
        )
      );
    } else {
      const newCodeNumber = String(suppliers.length + 1).padStart(2, "0");
      const newSupplier: Supplier = {
        id: `supp-custom-${Date.now()}`,
        code: `FOURN-${formCategory.substring(0, 4).toUpperCase()}-${newCodeNumber}`,
        name: formName,
        category: formCategory,
        modulesSupported: ["Aviculture", "Porciculture", "Fabrique d'Aliments"],
        contactName: formContactName,
        phone: formPhone,
        email: formEmail,
        cityLocation: formCityLocation,
        ratingStars: formRatingStars,
        paymentTerms: formPaymentTerms,
        status: formStatus,
        totalPurchasesFCFA: 0,
        outstandingDebtFCFA: 0,
        ordersHistory: [],
        notes: formNotes,
      };
      setSuppliers((prev) => [...prev, newSupplier]);
    }

    setIsSupplierModalOpen(false);
  };

  // Delete Supplier
  const handleDeleteSupplier = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Open Order Modal
  const handleOpenAddOrderModal = (supp: Supplier) => {
    setTargetSupplierForNewOrder(supp);
    setOrderDescription(`Commande Matières Premières / Matériel`);
    setOrderModule(
      supp.modulesSupported[0] || "Fabrique d'Aliments"
    );
    setOrderQuantity(1000);
    setOrderUnitLabel("Kg");
    setOrderUnitPrice(200);
    setOrderAmountPaid(200000);
    setOrderNotes("");
    setIsOrderModalOpen(true);
  };

  // Create Order
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSupplierForNewOrder || !orderDescription.trim()) return;

    const totalAmount = orderQuantity * orderUnitPrice;
    const debtAmount = Math.max(0, totalAmount - orderAmountPaid);
    const paymentStatus: SupplierOrder["paymentStatus"] =
      debtAmount === 0
        ? "Payé"
        : orderAmountPaid > 0
        ? "Acompte Versé"
        : "En Attente de Paiement";

    const newOrder: SupplierOrder = {
      id: `cmd-${Date.now()}`,
      orderNumber: `CMD-2026-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      itemDescription: orderDescription,
      module: orderModule,
      quantity: Number(orderQuantity),
      unitLabel: orderUnitLabel,
      unitPriceFCFA: Number(orderUnitPrice),
      totalAmountFCFA: totalAmount,
      amountPaidFCFA: Number(orderAmountPaid),
      paymentStatus: paymentStatus,
      deliveryStatus: "En Transit",
      notes: orderNotes,
    };

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== targetSupplierForNewOrder.id) return s;
        return {
          ...s,
          totalPurchasesFCFA: s.totalPurchasesFCFA + totalAmount,
          outstandingDebtFCFA: s.outstandingDebtFCFA + debtAmount,
          ordersHistory: [newOrder, ...s.ordersHistory],
        };
      })
    );

    setIsOrderModalOpen(false);
  };

  // Record Payment on Order
  const handleSettleOrderDebt = (supplierId: string, orderId: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== supplierId) return s;
        let debtPaid = 0;
        const updatedOrders = s.ordersHistory.map((ord) => {
          if (ord.id !== orderId) return ord;
          debtPaid = ord.totalAmountFCFA - ord.amountPaidFCFA;
          return {
            ...ord,
            amountPaidFCFA: ord.totalAmountFCFA,
            paymentStatus: "Payé" as const,
            deliveryStatus: "Livré & Conforme" as const,
          };
        });

        return {
          ...s,
          outstandingDebtFCFA: Math.max(0, s.outstandingDebtFCFA - debtPaid),
          ordersHistory: updatedOrders,
        };
      })
    );
  };

  // Query AI Sourcing Assistant
  const handleAskSourcingAI = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiPromptInput;
    if (!promptToSend.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    const contextPayload = {
      suppliersCount: suppliers.length,
      totalPurchases: totalPurchasesConsolidated,
      totalDebts: totalOutstandingDebts,
      suppliersSummary: suppliers.map((s) => ({
        name: s.name,
        category: s.category,
        location: s.cityLocation,
        rating: s.ratingStars,
        debt: s.outstandingDebtFCFA,
      })),
    };

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `[ASSISTANT ACHATS & GESTION DES FOURNISSEURS MULTI-MODULES] : ${promptToSend}`,
          context: contextPayload,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiResponse(data.error || "Erreur de réponse de l'assistant achats.");
      }
    } catch (err: any) {
      setAiResponse("Erreur de connexion avec l'IA Achat : " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Gestion Centralisée des Fournisseurs</span>
              </span>
              <span className="text-emerald-300 text-xs font-medium">• Tous Modules Ivoire Élevage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Répertoire des Fournisseurs, Commandes & Dettes
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Gérez les couvoirs (poussins), producteurs de maïs/soja, vétérinaires, équipementiers et transporteurs avec suivi des factures, règlements et assistant d'appels d'offres IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right backdrop-blur">
              <div className="text-[11px] text-slate-400">Total Achats Cumulés</div>
              <div className="text-xl font-extrabold text-emerald-400">
                {formatFCFA(totalPurchasesConsolidated)}
              </div>
              <div className="text-[10px] text-slate-300">{totalSuppliersCount} Fournisseurs Référencés</div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-right backdrop-blur">
              <div className="text-[11px] text-slate-400">Factures à Payer (Dettes)</div>
              <div className="text-xl font-extrabold text-rose-400">
                {formatFCFA(totalOutstandingDebts)}
              </div>
              <div className="text-[10px] text-amber-400">Encours Fournisseurs</div>
            </div>

            <button
              onClick={handleOpenAddSupplierModal}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau Fournisseur</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab("directory")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "directory"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Répertoire par Module ({filteredSuppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("orders")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "orders"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Historique des Commandes & Livraisons ({allOrdersList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("debts")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "debts"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4 text-rose-300" />
            <span>Suivi des Factures & Dettes Due</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ai_sourcing")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "ai_sourcing"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black animate-pulse"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900"
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>🤖 Assistant Sourcing & Comparateur IA</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DIRECTORY */}
      {activeSubTab === "directory" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville (Korhogo, Abidjan...), contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 shrink-0">Catégorie :</span>
              {[
                "Toutes",
                "Couvoirs & Poussins",
                "Éleveurs Porcins & Génétique",
                "Matières Premières & Céréales",
                "Produits Vétérinaires & Vaccins",
                "Matériel & Équipements",
                "Logistique & Transport",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSuppliers.map((supp) => (
              <div
                key={supp.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        {supp.code}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {supp.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {supp.category}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditSupplierModal(supp)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supp.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{supp.ratingStars}/5</span>
                    </div>

                    <div className="text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{supp.cityLocation}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{supp.contactName} ({supp.phone})</span>
                    </div>

                    {supp.email && (
                      <div className="text-slate-500 text-[11px] flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{supp.email}</span>
                      </div>
                    )}

                    <div className="text-slate-500 text-[11px] pt-1">
                      💳 <strong>Conditions :</strong> {supp.paymentTerms}
                    </div>
                  </div>

                  {/* Financials Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Cumul Achats</span>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {formatFCFA(supp.totalPurchasesFCFA)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Dette Due</span>
                      <span
                        className={`font-extrabold text-xs ${
                          supp.outstandingDebtFCFA > 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {formatFCFA(supp.outstandingDebtFCFA)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddOrderModal(supp)}
                    className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvelle Commande</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ORDERS HISTORY */}
      {activeSubTab === "orders" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span>Historique Général des Commandes Fournisseurs</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="p-3 rounded-l-xl">N° Commande & Date</th>
                  <th className="p-3">Fournisseur & Contact</th>
                  <th className="p-3">Désignation Produit</th>
                  <th className="p-3">Module</th>
                  <th className="p-3 text-right">Quantité & P.U</th>
                  <th className="p-3 text-right">Total FCFA</th>
                  <th className="p-3 text-center">Statut Paiement</th>
                  <th className="p-3 text-center rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allOrdersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">{ord.date}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{ord.supplierName}</div>
                      <div className="text-[10px] text-slate-400">{ord.supplierPhone}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 max-w-xs">{ord.itemDescription}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                        {ord.module}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div>{ord.quantity} {ord.unitLabel}</div>
                      <div className="text-[10px] text-slate-400">@{ord.unitPriceFCFA} FCFA</div>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      {formatFCFA(ord.totalAmountFCFA)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          ord.paymentStatus === "Payé"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.paymentStatus === "Acompte Versé"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {ord.paymentStatus !== "Payé" && (
                        <button
                          onClick={() => {
                            const supp = suppliers.find((s) => s.name === ord.supplierName);
                            if (supp) handleSettleOrderDebt(supp.id, ord.id);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Régler Solde
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEBTS */}
      {activeSubTab === "debts" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-rose-600" />
            <span>Factures en Attente & Dettes Due aux Fournisseurs</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers
              .filter((s) => s.outstandingDebtFCFA > 0)
              .map((supp) => (
                <div key={supp.id} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{supp.name}</h4>
                    <p className="text-xs text-slate-500">Contact : {supp.phone}</p>
                    <p className="text-xs text-slate-600 mt-1">💳 Terme : {supp.paymentTerms}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-400 block">Montant Dû</span>
                    <span className="text-base font-black text-rose-600">{formatFCFA(supp.outstandingDebtFCFA)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AI SOURCING */}
      {activeSubTab === "ai_sourcing" && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-amber-500 rounded-xl text-slate-950 shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center space-x-2">
                <span>Assistant Sourcing, Négociation & Comparateur d'Appels d'Offres</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300">
                Comparez les devis, négociez les termes de paiement Wave/Comptant et choisissez la meilleure offre de maïs ou couvoir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() =>
                handleAskSourcingAI(
                  "Rédige une demande de devis (RFQ) professionnelle à envoyer aux coopératives de Korhogo pour l'achat de 50 tonnes de maïs jaune sec (< 12% humidité)."
                )
              }
              className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
            >
              <span>📝 Rédiger une demande de devis (RFQ) Maïs</span>
            </button>

            <button
              onClick={() =>
                handleAskSourcingAI(
                  "Quels sont les critères essentiels pour évaluer la qualité d'un couvoir de poussins d'un jour en Côte d'Ivoire (souche Cobb 500) ?"
                )
              }
              className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between group"
            >
              <span>🐣 Critères d'évaluation de couvoir de poussins</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Posez votre question achats/sourcing à l'IA..."
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskSourcingAI()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => handleAskSourcingAI()}
              disabled={isAiLoading || !aiPromptInput.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition-all shrink-0"
            >
              {isAiLoading ? (
                <span>Analyse...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </>
              )}
            </button>
          </div>

          {aiResponse && (
            <div className="p-5 bg-slate-800/90 border border-amber-500/40 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs">
                <Bot className="w-4 h-4" />
                <span>Conseil de l'Expert Sourcing & Achats Gemini :</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD/EDIT SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <span>{editingSupplier ? "Modifier le Fournisseur" : "Enregistrer un Fournisseur"}</span>
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom / Raison Sociale</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Couvoir National FOANI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Couvoirs & Poussins">Couvoirs & Poussins</option>
                    <option value="Éleveurs Porcins & Génétique">Éleveurs Porcins & Génétique</option>
                    <option value="Matières Premières & Céréales">Matières Premières & Céréales</option>
                    <option value="Produits Vétérinaires & Vaccins">Produits Vétérinaires & Vaccins</option>
                    <option value="Matériel & Équipements">Matériel & Équipements</option>
                    <option value="Logistique & Transport">Logistique & Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville / Localisation</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Korhogo"
                    value={formCityLocation}
                    onChange={(e) => setFormCityLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Principal</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: M. Coulibaly"
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    placeholder="+225 07 00 00 00 00"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Conditions de Règlement</label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e: any) => setFormPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Comptant">Comptant</option>
                    <option value="Paiement Wave / Mobile">Paiement Wave / Mobile</option>
                    <option value="Avance 50% / Solde à la livraison">Avance 50% / Solde à la livraison</option>
                    <option value="30 Jours Fin de Mois">30 Jours Fin de Mois</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Évaluation (Étoiles)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formRatingStars}
                    onChange={(e) => setFormRatingStars(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
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

      {/* MODAL: ADD ORDER */}
      {isOrderModalOpen && targetSupplierForNewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>Nouvelle Commande d'Achat : {targetSupplierForNewOrder.name}</span>
              </h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation du Produit / Service</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 20 Tonnes Maïs Jaune Korhogo"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Module Destinataire</label>
                  <select
                    value={orderModule}
                    onChange={(e: any) => setOrderModule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Aviculture">Aviculture</option>
                    <option value="Porciculture">Porciculture</option>
                    <option value="Fabrique d'Aliments">Fabrique d'Aliments</option>
                    <option value="Hygiène & Sanitaire">Hygiène & Sanitaire</option>
                    <option value="Infrastructures & Matériel">Infrastructures & Matériel</option>
                    <option value="Logistique & Transport">Logistique & Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité & Unité</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min={1}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Number(e.target.value))}
                      className="w-2/3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      value={orderUnitLabel}
                      onChange={(e) => setOrderUnitLabel(e.target.value)}
                      className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix Unitaire (FCFA)</label>
                  <input
                    type="number"
                    min={1}
                    value={orderUnitPrice}
                    onChange={(e) => setOrderUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Acompte / Payé (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    value={orderAmountPaid}
                    onChange={(e) => setOrderAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl font-extrabold text-slate-900 flex justify-between">
                <span>Total Commande :</span>
                <span className="text-amber-700">{formatFCFA(orderQuantity * orderUnitPrice)}</span>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl shadow cursor-pointer"
                >
                  Valider Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
