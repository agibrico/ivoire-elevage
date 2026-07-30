import React, { useState } from "react";
import {
  MedicationItem,
  MedicationBatchLot,
  MedicationMovement,
} from "../types";
import {
  defaultMedicationItems,
  defaultMedicationMovements,
} from "../data/medicationStockData";
import {
  Pill,
  Syringe,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Thermometer,
  Box,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Printer,
  Copy,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Building2,
  RefreshCw,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const MedicationStockManagement: React.FC = () => {
  // Main Data States
  const [items, setItems] = useState<MedicationItem[]>(defaultMedicationItems);
  const [movements, setMovements] = useState<MedicationMovement[]>(defaultMedicationMovements);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Tous");
  const [speciesFilter, setSpeciesFilter] = useState<string>("Tous");
  const [expiryFilter, setExpiryFilter] = useState<"Tous" | "Périmé" | "Urgent30j" | "StockBas">("Tous");

  // Expanded Cards State
  const [expandedItemId, setExpandedItemId] = useState<string | null>("med-vac-01");

  // Active Tab inside Medication Module
  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "movements" | "alerts">("inventory");

  // Modals State
  const [isNewMedModalOpen, setIsNewMedModalOpen] = useState(false);
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [selectedMedForLot, setSelectedMedForLot] = useState<MedicationItem | null>(null);
  const [selectedMedForConsume, setSelectedMedForConsume] = useState<MedicationItem | null>(null);

  // New Medication Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedCode, setNewMedCode] = useState("");
  const [newMedActiveIngredient, setNewMedActiveIngredient] = useState("");
  const [newMedCategory, setNewMedCategory] = useState<MedicationItem["category"]>("Vaccin (Chaîne du Froid)");
  const [newMedSpecies, setNewMedSpecies] = useState<MedicationItem["speciesTarget"]>("Toutes Espèces");
  const [newMedUnit, setNewMedUnit] = useState<MedicationItem["unit"]>("Flacons");
  const [newMedMinThreshold, setNewMedMinThreshold] = useState<number>(5);
  const [newMedRequiresColdChain, setNewMedRequiresColdChain] = useState<boolean>(false);
  const [newMedTempNote, setNewMedTempNote] = useState("");
  const [newMedNotes, setNewMedNotes] = useState("");

  // New Lot Form State
  const [newLotNumber, setNewLotNumber] = useState("");
  const [newLotExpDate, setNewLotExpDate] = useState("");
  const [newLotQuantity, setNewLotQuantity] = useState<number>(100);
  const [newLotUnitPrice, setNewLotUnitPrice] = useState<number>(1500);
  const [newLotSupplier, setNewLotSupplier] = useState("VetAgro Côte d'Ivoire");
  const [newLotStorageLocation, setNewLotStorageLocation] = useState("Armoire Pharmacie Principal");

  // Consumption / Usage Form State
  const [consumeLotId, setConsumeLotId] = useState("");
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [consumeTargetBatch, setConsumeTargetBatch] = useState("Bâtiment A Volailles");
  const [consumePrescribedBy, setConsumePrescribedBy] = useState("Dr. Yao (Vétérinaire)");
  const [consumeNotes, setConsumeNotes] = useState("");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- HELPER CALCULATIONS & EXPIRATION CONTROLS ---
  const todayDate = new Date();
  
  const getDaysUntilExpiry = (expDateStr: string): number => {
    const expDate = new Date(expDateStr);
    const diffTime = expDate.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLotExpiryStatus = (expDateStr: string, qualityStatus: string) => {
    if (qualityStatus === "Détruit") return { label: "Détruit", color: "bg-slate-200 text-slate-700 border-slate-300", priority: 4 };
    if (qualityStatus === "Quarantaine") return { label: "Quarantaine", color: "bg-amber-100 text-amber-800 border-amber-300", priority: 3 };

    const daysLeft = getDaysUntilExpiry(expDateStr);
    if (daysLeft < 0) {
      return { label: `PÉRIMÉ (${Math.abs(daysLeft)}j)`, color: "bg-rose-600 text-white font-black animate-pulse border-rose-700", priority: 0 };
    }
    if (daysLeft <= 15) {
      return { label: `🚨 EXPIRE DANS ${daysLeft}j`, color: "bg-rose-100 text-rose-800 font-extrabold border-rose-300", priority: 1 };
    }
    if (daysLeft <= 30) {
      return { label: `⚠️ Expire sous ${daysLeft}j`, color: "bg-amber-100 text-amber-800 font-bold border-amber-300", priority: 2 };
    }
    return { label: `Valide (${daysLeft}j)`, color: "bg-emerald-100 text-emerald-800 font-medium border-emerald-300", priority: 5 };
  };

  // Item Total Stock Calculation
  const getItemTotalStock = (item: MedicationItem) => {
    return item.batches
      .filter((b) => b.qualityStatus !== "Détruit")
      .reduce((sum, b) => sum + b.currentQuantity, 0);
  };

  // Item Total Value Calculation (FCFA)
  const getItemTotalValue = (item: MedicationItem) => {
    return item.batches
      .filter((b) => b.qualityStatus !== "Détruit")
      .reduce((sum, b) => sum + (b.currentQuantity * b.unitPriceFCFA), 0);
  };

  // Farm-wide KPI Stats
  let totalPharmacyValueFCFA = 0;
  let totalExpiredLotsCount = 0;
  let totalUrgent30DaysLotsCount = 0;
  let totalLowStockItemsCount = 0;
  let totalColdChainVaccinesCount = 0;

  const expiredLotsList: { item: MedicationItem; lot: MedicationBatchLot; daysLeft: number }[] = [];
  const urgent30DaysLotsList: { item: MedicationItem; lot: MedicationBatchLot; daysLeft: number }[] = [];

  items.forEach((item) => {
    const totalStock = getItemTotalStock(item);
    totalPharmacyValueFCFA += getItemTotalValue(item);

    if (totalStock <= item.minStockAlertThreshold) {
      totalLowStockItemsCount++;
    }

    if (item.requiresColdChain) {
      totalColdChainVaccinesCount++;
    }

    item.batches.forEach((lot) => {
      if (lot.qualityStatus === "Détruit") return;
      const days = getDaysUntilExpiry(lot.expirationDate);
      if (days < 0 || lot.qualityStatus === "Périmé") {
        totalExpiredLotsCount++;
        expiredLotsList.push({ item, lot, daysLeft: days });
      } else if (days <= 30) {
        totalUrgent30DaysLotsCount++;
        urgent30DaysLotsList.push({ item, lot, daysLeft: days });
      }
    });
  });

  // Filtered Items Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.activeIngredient && item.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.batches.some((b) => b.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "Tous" || item.category === categoryFilter;
    const matchesSpecies = speciesFilter === "Tous" || item.speciesTarget === speciesFilter || item.speciesTarget === "Toutes Espèces";

    let matchesExpiry = true;
    if (expiryFilter === "Périmé") {
      matchesExpiry = item.batches.some((b) => getDaysUntilExpiry(b.expirationDate) < 0 || b.qualityStatus === "Périmé");
    } else if (expiryFilter === "Urgent30j") {
      matchesExpiry = item.batches.some((b) => {
        const d = getDaysUntilExpiry(b.expirationDate);
        return d >= 0 && d <= 30;
      });
    } else if (expiryFilter === "StockBas") {
      matchesExpiry = getItemTotalStock(item) <= item.minStockAlertThreshold;
    }

    return matchesSearch && matchesCategory && matchesSpecies && matchesExpiry;
  });

  // --- ACTIONS ---
  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newMed: MedicationItem = {
      id: `med-custom-${Date.now()}`,
      code: newMedCode.trim() || `MED-CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: newMedName.trim(),
      activeIngredient: newMedActiveIngredient.trim() || undefined,
      category: newMedCategory,
      speciesTarget: newMedSpecies,
      unit: newMedUnit,
      minStockAlertThreshold: newMedMinThreshold,
      requiresColdChain: newMedRequiresColdChain,
      storageTemperatureNote: newMedTempNote.trim() || (newMedRequiresColdChain ? "Conserver entre +2°C et +8°C" : "Température ambiante < 25°C"),
      notes: newMedNotes.trim() || undefined,
      batches: [],
    };

    setItems([newMed, ...items]);
    setIsNewMedModalOpen(false);
    showToast(`✅ Produit pharmacie "${newMed.name}" ajouté avec succès.`);

    // Reset Form
    setNewMedName("");
    setNewMedCode("");
    setNewMedActiveIngredient("");
    setNewMedNotes("");
  };

  const handleOpenAddLot = (item: MedicationItem) => {
    setSelectedMedForLot(item);
    setNewLotNumber(`LOT-${item.code.replace("MED-", "")}-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
    
    // Default expiry 1 year ahead
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setNewLotExpDate(nextYear.toISOString().split("T")[0]);
    setIsAddLotModalOpen(true);
  };

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForLot || !newLotNumber.trim() || !newLotExpDate) return;

    const newLot: MedicationBatchLot = {
      id: `lot-custom-${Date.now()}`,
      lotNumber: newLotNumber.trim().toUpperCase(),
      expirationDate: newLotExpDate,
      initialQuantity: newLotQuantity,
      currentQuantity: newLotQuantity,
      unitPriceFCFA: newLotUnitPrice,
      supplierName: newLotSupplier.trim() || "Fournisseur Agréé",
      receivedDate: new Date().toISOString().split("T")[0],
      storageLocation: newLotStorageLocation.trim() || "Pharmacie Centrale",
      qualityStatus: "Conforme",
    };

    const updatedItems = items.map((med) => {
      if (med.id === selectedMedForLot.id) {
        return {
          ...med,
          batches: [newLot, ...med.batches],
        };
      }
      return med;
    });

    setItems(updatedItems);

    // Record movement
    const newMovement: MedicationMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
      medicationId: selectedMedForLot.id,
      medicationName: selectedMedForLot.name,
      lotNumber: newLot.lotNumber,
      movementType: "Réception Achat",
      quantity: newLotQuantity,
      unit: selectedMedForLot.unit,
      prescribedBy: "Gestionnaire Stock Pharmacie",
      notes: `Livraison du lot par ${newLot.supplierName}. Stockage: ${newLot.storageLocation}`,
    };

    setMovements([newMovement, ...movements]);
    setIsAddLotModalOpen(false);
    showToast(`📦 Nouveau Lot ${newLot.lotNumber} enregistré (${newLotQuantity} ${selectedMedForLot.unit}).`);
  };

  const handleOpenConsumeModal = (item: MedicationItem) => {
    setSelectedMedForConsume(item);
    const validBatches = item.batches.filter((b) => b.currentQuantity > 0 && b.qualityStatus === "Conforme");
    if (validBatches.length > 0) {
      setConsumeLotId(validBatches[0].id);
    } else if (item.batches.length > 0) {
      setConsumeLotId(item.batches[0].id);
    }
    setConsumeQty(1);
    setIsConsumeModalOpen(true);
  };

  const handleRecordConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForConsume || !consumeLotId || consumeQty <= 0) return;

    let targetLotNumber = "";

    const updatedItems = items.map((med) => {
      if (med.id === selectedMedForConsume.id) {
        const updatedBatches = med.batches.map((lot) => {
          if (lot.id === consumeLotId) {
            targetLotNumber = lot.lotNumber;
            const newQty = Math.max(0, lot.currentQuantity - consumeQty);
            return { ...lot, currentQuantity: newQty };
          }
          return lot;
        });
        return { ...med, batches: updatedBatches };
      }
      return med;
    });

    setItems(updatedItems);

    // Record Movement
    const newMovement: MedicationMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
      medicationId: selectedMedForConsume.id,
      medicationName: selectedMedForConsume.name,
      lotNumber: targetLotNumber,
      movementType: "Consommation Traitement",
      quantity: consumeQty,
      unit: selectedMedForConsume.unit,
      targetBatchName: consumeTargetBatch,
      prescribedBy: consumePrescribedBy,
      notes: consumeNotes.trim() || `Administration sanitaire au lot ${consumeTargetBatch}`,
    };

    setMovements([newMovement, ...movements]);
    setIsConsumeModalOpen(false);
    showToast(`💉 Consommation de ${consumeQty} ${selectedMedForConsume.unit} enregistrée sur le lot ${consumeTargetBatch}.`);
  };

  const handleDisposeExpiredLot = (medId: string, lotId: string, lotNum: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer et détruire le lot périmé "${lotNum}" ? Cette opération est irréversible.`)) {
      return;
    }

    let disposedQty = 0;
    let medName = "";
    let medUnit = "";

    const updatedItems = items.map((med) => {
      if (med.id === medId) {
        medName = med.name;
        medUnit = med.unit;
        const updatedBatches = med.batches.map((lot) => {
          if (lot.id === lotId) {
            disposedQty = lot.currentQuantity;
            return { ...lot, currentQuantity: 0, qualityStatus: "Détruit" as const };
          }
          return lot;
        });
        return { ...med, batches: updatedBatches };
      }
      return med;
    });

    setItems(updatedItems);

    // Record Disposal Movement
    const newMovement: MedicationMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
      medicationId: medId,
      medicationName: medName,
      lotNumber: lotNum,
      movementType: "Retrait Périmé / Destruction",
      quantity: disposedQty,
      unit: medUnit,
      prescribedBy: "Dr. Yao (Vétérinaire)",
      notes: `Mise au rebut et destruction réglementaire du lot périmé. Quantité détruite: ${disposedQty} ${medUnit}.`,
    };

    setMovements([newMovement, ...movements]);
    showToast(`🗑️ Lot périmé ${lotNum} détruit et retiré du stock avec succès.`);
  };

  const formatFCFA = (val: number) => {
    return Math.round(val).toLocaleString("fr-FR") + " FCFA";
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-amber-300 px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center space-x-3 text-xs font-bold animate-bounce-short">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner KPI Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <Pill className="w-3.5 h-3.5 text-amber-400" />
                <span>Gestion Vétérinaire & Pharmacie</span>
              </span>
              <span className="text-slate-300 text-xs font-medium">• Suivi des Lots & Traçabilité</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-3">
              <span>Stock Pharmacie, Vaccins & Traçabilité des Lots</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Contrôlez les stocks de médicaments, prévenez les risques sanitaires grâce à l'alerte automatique des péremptions par lot (Chaîne du froid, vaccins, antibiotiques).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewMedModalOpen(true)}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Produit Pharmacie</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer border border-slate-600"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Imprimer l'Inventaire</span>
            </button>
          </div>
        </div>

        {/* 4 Key Performance Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valeur Totale Stock</span>
            <span className="text-lg font-black text-emerald-400">{formatFCFA(totalPharmacyValueFCFA)}</span>
            <span className="text-[10px] text-slate-400 block">{items.length} références en pharmacie</span>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${
            totalExpiredLotsCount > 0 ? "bg-rose-950/80 border-rose-500/80 animate-pulse" : "bg-slate-800/80 border-slate-700/60"
          }`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className={totalExpiredLotsCount > 0 ? "text-rose-300" : "text-slate-400"}>Lots Périmés</span>
              <ShieldAlert className={`w-3.5 h-3.5 ${totalExpiredLotsCount > 0 ? "text-rose-400" : "text-slate-500"}`} />
            </div>
            <span className={`text-lg font-black ${totalExpiredLotsCount > 0 ? "text-rose-300" : "text-white"}`}>
              {totalExpiredLotsCount} lot(s) périmé(s)
            </span>
            <span className="text-[10px] text-slate-400 block">
              {totalExpiredLotsCount > 0 ? "⚠️ À détruire immédiatement !" : "Aucun produit périmé en rayon"}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${
            totalUrgent30DaysLotsCount > 0 ? "bg-amber-950/80 border-amber-500/80" : "bg-slate-800/80 border-slate-700/60"
          }`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className={totalUrgent30DaysLotsCount > 0 ? "text-amber-300" : "text-slate-400"}>Péremption &lt; 30 Jours</span>
              <Clock className={`w-3.5 h-3.5 ${totalUrgent30DaysLotsCount > 0 ? "text-amber-400" : "text-slate-500"}`} />
            </div>
            <span className={`text-lg font-black ${totalUrgent30DaysLotsCount > 0 ? "text-amber-300" : "text-white"}`}>
              {totalUrgent30DaysLotsCount} lot(s) vigilant(s)
            </span>
            <span className="text-[10px] text-slate-400 block">À consommer en priorité</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Chaîne du Froid (2-8°C)</span>
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-lg font-black text-cyan-300">{totalColdChainVaccinesCount} vaccins frigo</span>
            <span className="text-[10px] text-slate-400 block">Surveillance frigo active</span>
          </div>

        </div>
      </div>

      {/* PROMINENT EXPIRATION & SAFETY ALERT BANNER */}
      {(totalExpiredLotsCount > 0 || totalUrgent30DaysLotsCount > 0) && (
        <div className={`rounded-2xl p-5 border-2 shadow-lg space-y-3 ${
          totalExpiredLotsCount > 0
            ? "bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white border-rose-500"
            : "bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white border-amber-500"
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl shadow-md ${
                totalExpiredLotsCount > 0 ? "bg-rose-600 text-white animate-bounce" : "bg-amber-500 text-slate-950"
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    totalExpiredLotsCount > 0 ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-950"
                  }`}>
                    {totalExpiredLotsCount > 0 ? "🚨 ALERTE SANITAIRE LOTS PÉRIMÉS" : "⚠️ VIGILANCE PÉREMPTION J-30"}
                  </span>
                  <span className="text-xs text-slate-300 font-bold">
                    Contrôle de Sécurité Vétérinaire
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  {totalExpiredLotsCount > 0
                    ? `${totalExpiredLotsCount} lot(s) de médicament/vaccin sont PÉRIMÉS ! Interdiction d'administration.`
                    : `${totalUrgent30DaysLotsCount} lot(s) arrivent à échéance dans les 30 prochains jours.`}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setExpiryFilter(totalExpiredLotsCount > 0 ? "Périmé" : "Urgent30j")}
                className="px-4 py-2 bg-white text-slate-900 font-black text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer shadow-md"
              >
                Filtrer ces Lots en Rayon
              </button>
            </div>
          </div>

          {/* List of Expired & Urgent Lots */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
            {expiredLotsList.map(({ item, lot, daysLeft }) => (
              <div key={lot.id} className="bg-slate-950/90 p-3 rounded-xl border border-rose-500/80 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-white block">{item.name}</span>
                  <span className="text-[10px] text-rose-300 font-mono">
                    Lot: {lot.lotNumber} • Exp: {lot.expirationDate}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Qte restante: {lot.currentQuantity} {item.unit}
                  </span>
                </div>
                <button
                  onClick={() => handleDisposeExpiredLot(item.id, lot.id, lot.lotNumber)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer shrink-0 ml-2 shadow-xs"
                >
                  🗑️ Détruire Lot
                </button>
              </div>
            ))}

            {urgent30DaysLotsList.map(({ item, lot, daysLeft }) => (
              <div key={lot.id} className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/60 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-amber-200 block">{item.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    Lot: {lot.lotNumber} • Expire dans {daysLeft}j ({lot.expirationDate})
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Qte restante: {lot.currentQuantity} {item.unit}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenConsumeModal(item)}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg transition-all cursor-pointer shrink-0 ml-2 shadow-xs"
                >
                  💉 Consommer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab("inventory")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "inventory"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Box className="w-4 h-4 text-amber-600" />
            <span>Catalogue & Relevé des Stocks ({filteredItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("movements")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "movements"
                ? "border-amber-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Historique des Mouvements & Traçabilité ({movements.length})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        {activeSubTab === "inventory" && (
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-semibold">
            
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher vaccin, produit, composant, lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold"
              >
                <option value="Tous">Toutes Catégories Pharmacie</option>
                <option value="Vaccin (Chaîne du Froid)">Vaccin (Chaîne du Froid)</option>
                <option value="Antibiotique / Anti-infectieux">Antibiotique / Anti-infectieux</option>
                <option value="Vitamines & Fortifiants">Vitamines & Fortifiants</option>
                <option value="Antiparasitaire & Vermifuge">Antiparasitaire & Vermifuge</option>
                <option value="Désinfectant & Biosécurité">Désinfectant & Biosécurité</option>
              </select>
            </div>

            {/* Species Filter */}
            <div className="md:col-span-2">
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold"
              >
                <option value="Tous">Toutes Cibles</option>
                <option value="Aviculture">🐔 Aviculture</option>
                <option value="Porciculture">🐖 Porciculture</option>
                <option value="Toutes Espèces">🌐 Toutes Espèces</option>
              </select>
            </div>

            {/* Expiry / Stock Alert Filter */}
            <div className="md:col-span-3">
              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold"
              >
                <option value="Tous">Tous États de Péremption</option>
                <option value="Périmé">🚨 Lots Périmés uniquement</option>
                <option value="Urgent30j">⚠️ Expire dans moins de 30 jours</option>
                <option value="StockBas">📉 Stock Bas (&lt; Seuil Mini)</option>
              </select>
            </div>

          </div>
        )}

        {/* --- SUB-TAB 1: CATALOGUE DES MEDICAMENTS & LOTS --- */}
        {activeSubTab === "inventory" && (
          <div className="p-4 sm:p-6 space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Box className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-sm">Aucun produit ne correspond à vos filtres</h4>
                <p className="text-xs text-slate-500">Ajustez vos critères de recherche ou ajoutez une nouvelle référence pharmacie.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("Tous");
                    setSpeciesFilter("Tous");
                    setExpiryFilter("Tous");
                  }}
                  className="px-4 py-2 bg-slate-900 text-amber-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((med) => {
                  const totalStock = getItemTotalStock(med);
                  const totalVal = getItemTotalValue(med);
                  const isLowStock = totalStock <= med.minStockAlertThreshold;
                  const isExpanded = expandedItemId === med.id;

                  // Check if any lot in this med is expired or expiring soon
                  const hasExpiredLot = med.batches.some((b) => getDaysUntilExpiry(b.expirationDate) < 0 || b.qualityStatus === "Périmé");
                  const hasUrgent30jLot = med.batches.some((b) => {
                    const d = getDaysUntilExpiry(b.expirationDate);
                    return d >= 0 && d <= 30 && b.qualityStatus !== "Détruit";
                  });

                  return (
                    <div
                      key={med.id}
                      className={`bg-white rounded-2xl border transition-all shadow-xs ${
                        hasExpiredLot
                          ? "border-rose-400 ring-2 ring-rose-100"
                          : isLowStock
                          ? "border-amber-300"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Main Item Header */}
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex items-start space-x-3.5">
                          <div className={`p-3 rounded-2xl shrink-0 ${
                            med.category === "Vaccin (Chaîne du Froid)"
                              ? "bg-cyan-100 text-cyan-800"
                              : med.category === "Antibiotique / Anti-infectieux"
                              ? "bg-rose-100 text-rose-800"
                              : med.category === "Vitamines & Fortifiants"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {med.category === "Vaccin (Chaîne du Froid)" ? (
                              <Syringe className="w-6 h-6" />
                            ) : (
                              <Pill className="w-6 h-6" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                                {med.code}
                              </span>

                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800">
                                {med.category}
                              </span>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                med.speciesTarget === "Aviculture"
                                  ? "bg-rose-100 text-rose-800"
                                  : med.speciesTarget === "Porciculture"
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}>
                                {med.speciesTarget === "Aviculture" ? "🐔 Aviculture" : med.speciesTarget === "Porciculture" ? "🐖 Porciculture" : "🌐 Toutes Espèces"}
                              </span>

                              {med.requiresColdChain && (
                                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-800 font-extrabold text-[10px] rounded-full border border-cyan-200 flex items-center space-x-1">
                                  <Thermometer className="w-3 h-3 text-cyan-600" />
                                  <span>2°C - 8°C Frigo</span>
                                </span>
                              )}

                              {hasExpiredLot && (
                                <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-full animate-pulse">
                                  🚨 LOT PÉRIMÉ DÉTECTÉ
                                </span>
                              )}

                              {!hasExpiredLot && hasUrgent30jLot && (
                                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
                                  ⚠️ PÉREMPTION J-30
                                </span>
                              )}
                            </div>

                            <h4 className="font-black text-slate-900 text-base">{med.name}</h4>
                            {med.activeIngredient && (
                              <p className="text-xs text-slate-500 font-medium">
                                Principal actif : {med.activeIngredient}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Summary Metrics & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                          
                          <div className="text-left md:text-right space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Stock Disponible</span>
                            <span className={`text-base font-black ${
                              isLowStock ? "text-amber-600" : "text-slate-900"
                            }`}>
                              {totalStock.toLocaleString("fr-FR")} {med.unit}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Valeur : {formatFCFA(totalVal)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenConsumeModal(med)}
                              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                            >
                              <Syringe className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Consommer</span>
                            </button>

                            <button
                              onClick={() => handleOpenAddLot(med)}
                              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer border border-amber-500/30"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">+ Lot</span>
                            </button>

                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : med.id)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                              title="Afficher les détails des lots"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                        </div>

                      </div>

                      {/* Expanded Section: Detailed Lot / Batch Management */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl space-y-4">
                          
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                              <Layers className="w-4 h-4 text-amber-600" />
                              <span>Traçabilité des Lots / Batches pour "{med.name}" ({med.batches.length} lots enregistré(s))</span>
                            </h5>

                            <button
                              onClick={() => handleOpenAddLot(med)}
                              className="text-xs font-extrabold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Réceptionner un Nouveau Lot</span>
                            </button>
                          </div>

                          {med.storageTemperatureNote && (
                            <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900 font-medium flex items-center space-x-2">
                              <Thermometer className="w-4 h-4 text-cyan-600 shrink-0" />
                              <span><strong>Consigne de conservation :</strong> {med.storageTemperatureNote}</span>
                            </div>
                          )}

                          {med.batches.length === 0 ? (
                            <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
                              Aucun lot en réserve pour cet article. Cliquez sur "+ Lot" pour enregistrer une livraison.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs font-medium bg-white rounded-xl border border-slate-200">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-200">
                                    <th className="p-3">Numéro de Lot</th>
                                    <th className="p-3">Date de Péremption</th>
                                    <th className="p-3">Statut Sécurité</th>
                                    <th className="p-3">Stock Actuel / Initial</th>
                                    <th className="p-3">Emplacement Stock</th>
                                    <th className="p-3">Prix Unitaire</th>
                                    <th className="p-3 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                                  {med.batches.map((lot) => {
                                    const statusObj = getLotExpiryStatus(lot.expirationDate, lot.qualityStatus);
                                    const isExpired = statusObj.priority === 0;

                                    return (
                                      <tr key={lot.id} className={`hover:bg-slate-50/80 ${isExpired ? "bg-rose-50/70" : ""}`}>
                                        <td className="p-3 font-mono text-slate-900 font-black">
                                          {lot.lotNumber}
                                        </td>

                                        <td className="p-3 font-mono">
                                          {lot.expirationDate}
                                        </td>

                                        <td className="p-3">
                                          <span className={`px-2.5 py-1 rounded-md text-[10px] border ${statusObj.color}`}>
                                            {statusObj.label}
                                          </span>
                                        </td>

                                        <td className="p-3 font-black text-slate-900">
                                          {lot.currentQuantity} / {lot.initialQuantity} {med.unit}
                                        </td>

                                        <td className="p-3 text-slate-600 text-[11px]">
                                          {lot.storageLocation}
                                        </td>

                                        <td className="p-3 text-slate-700 font-mono">
                                          {formatFCFA(lot.unitPriceFCFA)} / {med.unit}
                                        </td>

                                        <td className="p-3 text-right">
                                          {isExpired ? (
                                            <button
                                              onClick={() => handleDisposeExpiredLot(med.id, lot.id, lot.lotNumber)}
                                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] rounded-lg cursor-pointer transition-all shadow-xs"
                                            >
                                              🗑️ Retirer & Détruire
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedMedForConsume(med);
                                                setConsumeLotId(lot.id);
                                                setConsumeQty(1);
                                                setIsConsumeModalOpen(true);
                                              }}
                                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all"
                                            >
                                              💉 Utiliser
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- SUB-TAB 2: HISTORIQUE DES MOVEMENTS ET TRACABILITE --- */}
        {activeSubTab === "movements" && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Journal des Mouvements de Pharmacie & Registre de Traçabilité</h4>
                <p className="text-xs text-slate-500">Historique complet des réceptions de lots, traitements vétérinaires et éliminations sanitaires.</p>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {movements.length} entrée(s) enregistrée(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium bg-white rounded-2xl border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Type Mouvement</th>
                    <th className="p-3">Produit Pharmacie</th>
                    <th className="p-3">N° de Lot</th>
                    <th className="p-3">Quantité</th>
                    <th className="p-3">Cible / Usage</th>
                    <th className="p-3">Prescrit / Enregistré Par</th>
                    <th className="p-3">Notes & Motif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                  {movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                        {mov.timestamp}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${
                          mov.movementType === "Réception Achat"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : mov.movementType === "Consommation Traitement"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : mov.movementType === "Retrait Périmé / Destruction"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}>
                          {mov.movementType}
                        </span>
                      </td>

                      <td className="p-3 font-extrabold text-slate-900">
                        {mov.medicationName}
                      </td>

                      <td className="p-3 font-mono text-amber-700">
                        {mov.lotNumber}
                      </td>

                      <td className="p-3 font-black text-slate-900">
                        {mov.quantity} {mov.unit}
                      </td>

                      <td className="p-3 text-slate-700">
                        {mov.targetBatchName || "-"}
                      </td>

                      <td className="p-3 text-slate-600 text-[11px]">
                        {mov.prescribedBy || "Technicien"}
                      </td>

                      <td className="p-3 text-slate-500 font-normal italic">
                        {mov.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL 1: ADD NEW MEDICATION REFERENCE --- */}
      {isNewMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Nouveau Produit Vétérinaire</h3>
                  <p className="text-xs text-slate-500">Référence produit pharmacie (Vaccin, Antibiotique, Vitamines)</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewMedModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800">Nom du Produit / Vaccin *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Vaccin Newcastle HB1"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">Code Produit / Référence</label>
                  <input
                    type="text"
                    placeholder="ex: MED-VAC-004"
                    value={newMedCode}
                    onChange={(e) => setNewMedCode(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800">Principe Actif / Composition</label>
                <input
                  type="text"
                  placeholder="ex: Souche vivant atténuée H120 + HB1"
                  value={newMedActiveIngredient}
                  onChange={(e) => setNewMedActiveIngredient(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800">Catégorie</label>
                  <select
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Vaccin (Chaîne du Froid)">Vaccin (Chaîne du Froid)</option>
                    <option value="Antibiotique / Anti-infectieux">Antibiotique / Anti-infectieux</option>
                    <option value="Vitamines & Fortifiants">Vitamines & Fortifiants</option>
                    <option value="Antiparasitaire & Vermifuge">Antiparasitaire & Vermifuge</option>
                    <option value="Désinfectant & Biosécurité">Désinfectant & Biosécurité</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">Espèce Cible</label>
                  <select
                    value={newMedSpecies}
                    onChange={(e) => setNewMedSpecies(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Aviculture">🐔 Aviculture</option>
                    <option value="Porciculture">🐖 Porciculture</option>
                    <option value="Toutes Espèces">🌐 Toutes Espèces</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">Unité de Comptage</label>
                  <select
                    value={newMedUnit}
                    onChange={(e) => setNewMedUnit(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Doses">Doses</option>
                    <option value="Flacons">Flacons</option>
                    <option value="Litres">Litres</option>
                    <option value="Sachets 100g">Sachets 100g</option>
                    <option value="Boîtes">Boîtes</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-slate-800">Seuil Minimal d'Alerte Stock Bas</label>
                  <input
                    type="number"
                    min="1"
                    value={newMedMinThreshold}
                    onChange={(e) => setNewMedMinThreshold(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMedRequiresColdChain}
                      onChange={(e) => setNewMedRequiresColdChain(e.target.checked)}
                      className="w-4 h-4 accent-cyan-600 rounded"
                    />
                    <span className="font-extrabold text-cyan-900">Requiert Chaîne du Froid (2°C - 8°C)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800">Note de Conservation & Posologie</label>
                <input
                  type="text"
                  placeholder="ex: Conserver entre +2°C et +8°C au frigo vito-pharmacie"
                  value={newMedTempNote}
                  onChange={(e) => setNewMedTempNote(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewMedModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer le Produit
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD NEW LOT / BATCH DELIVERY --- */}
      {isAddLotModalOpen && selectedMedForLot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 block">RÉCEPTION DE LIVRAISON</span>
                <h3 className="text-base font-black text-slate-900">Enregistrer un Nouveau Lot pour "{selectedMedForLot.name}"</h3>
              </div>
              <button
                onClick={() => setIsAddLotModalOpen(false)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800">Numéro de Lot Fabricant *</label>
                  <input
                    type="text"
                    required
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 text-rose-700 font-black">Date de Péremption *</label>
                  <input
                    type="date"
                    required
                    value={newLotExpDate}
                    onChange={(e) => setNewLotExpDate(e.target.value)}
                    className="w-full p-2.5 border border-rose-300 rounded-xl font-bold text-rose-900 bg-rose-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800">Quantité Livrée ({selectedMedForLot.unit}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newLotQuantity}
                    onChange={(e) => setNewLotQuantity(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-black text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">Prix Unitaire (FCFA / {selectedMedForLot.unit})</label>
                  <input
                    type="number"
                    min="0"
                    value={newLotUnitPrice}
                    onChange={(e) => setNewLotUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800">Fournisseur Vétérinaire</label>
                <input
                  type="text"
                  value={newLotSupplier}
                  onChange={(e) => setNewLotSupplier(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800">Emplacement de Stockage sur la Ferme</label>
                <input
                  type="text"
                  placeholder="ex: Frigo Pharmacie #1 (4°C) ou Armoire Bâtiment A"
                  value={newLotStorageLocation}
                  onChange={(e) => setNewLotStorageLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddLotModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer le Lot
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: LOG CONSUMPTION / ADMINISTRATION --- */}
      {isConsumeModalOpen && selectedMedForConsume && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 block">ADMINISTRATION SANITAIRE</span>
                <h3 className="text-base font-black text-slate-900">Enregistrer une Consommation de "{selectedMedForConsume.name}"</h3>
              </div>
              <button
                onClick={() => setIsConsumeModalOpen(false)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordConsumption} className="space-y-4 text-xs font-semibold">
              
              <div className="space-y-1">
                <label className="text-slate-800 font-extrabold">Sélectionner le Lot à Utiliser (FEFO - Premier Expiré, Premier Sorti) *</label>
                <select
                  value={consumeLotId}
                  onChange={(e) => setConsumeLotId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  {selectedMedForConsume.batches.map((b) => {
                    const daysLeft = getDaysUntilExpiry(b.expirationDate);
                    return (
                      <option key={b.id} value={b.id} disabled={b.currentQuantity <= 0}>
                        Lot: {b.lotNumber} ({b.currentQuantity} {selectedMedForConsume.unit} dispo) • Exp: {b.expirationDate} ({daysLeft < 0 ? "PÉRIMÉ" : `${daysLeft}j restants`})
                      </option>

                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800">Quantité Consommée ({selectedMedForConsume.unit}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={consumeQty}
                    onChange={(e) => setConsumeQty(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-black text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800">Lot d'Animaux / Bâtiment Cible *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Lot Poussins P3 / Maternité"
                    value={consumeTargetBatch}
                    onChange={(e) => setConsumeTargetBatch(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800">Prescrit / Administré Par</label>
                <input
                  type="text"
                  value={consumePrescribedBy}
                  onChange={(e) => setConsumePrescribedBy(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800">Motif & Observations Vétérinaires</label>
                <input
                  type="text"
                  placeholder="ex: Vaccination préventive systématique J14"
                  value={consumeNotes}
                  onChange={(e) => setConsumeNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsConsumeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl cursor-pointer shadow-md"
                >
                  Valider la Consommation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
