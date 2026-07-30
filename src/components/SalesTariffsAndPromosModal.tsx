import React, { useState, useEffect } from "react";
import {
  Tag,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  Send,
  MessageCircle,
  Sparkles,
  Percent,
  X,
  Search,
  CheckCircle2,
  Phone,
  Share2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { formatFCFA } from "../utils/formatters";
import { UnitCosts, Client } from "../types";
import { defaultClients } from "../data/salesData";

export interface SellingTariffProduct {
  id: string;
  name: string;
  category: "Volaille (Aviculture)" | "Porc (Porciculture)" | "Aliments & Provendes" | "Compost & Subproduits" | "Divers";
  unit: string; // ex: kg, tête, sac, alvéole
  basePriceFCFA: number;
  promoDiscountFCFA: number; // reduction fixe en FCFA ou calculée
  promoDiscountPercent: number; // reduction en %
  isPromoActive: boolean;
  promoLabel: string; // ex: Promo Fêtes, Tarif Gros, Remise Fidélité
}

const DEFAULT_TARIFFS: SellingTariffProduct[] = [
  {
    id: "tar-1",
    name: "Poulet de Chair Vivant (1,8 kg - 2.0 kg)",
    category: "Volaille (Aviculture)",
    unit: "sujet",
    basePriceFCFA: 2200,
    promoDiscountFCFA: 100,
    promoDiscountPercent: 5,
    isPromoActive: true,
    promoLabel: "Promo Vente de Gros (>50 sujets)",
  },
  {
    id: "tar-2",
    name: "Poulet Éviscéré / Prêt à Cuire (PAC)",
    category: "Volaille (Aviculture)",
    unit: "kg",
    basePriceFCFA: 2800,
    promoDiscountFCFA: 0,
    promoDiscountPercent: 0,
    isPromoActive: false,
    promoLabel: "Tarif Standard",
  },
  {
    id: "tar-3",
    name: "Porc Charcutier Sur Pied (75 kg - 90 kg)",
    category: "Porc (Porciculture)",
    unit: "kg",
    basePriceFCFA: 2200,
    promoDiscountFCFA: 100,
    promoDiscountPercent: 4.5,
    isPromoActive: true,
    promoLabel: "Ajustement Prix Charcuterie",
  },
  {
    id: "tar-4",
    name: "Carcasse de Porc Fraîche Fendue",
    category: "Porc (Porciculture)",
    unit: "kg",
    basePriceFCFA: 2600,
    promoDiscountFCFA: 0,
    promoDiscountPercent: 0,
    isPromoActive: false,
    promoLabel: "Tarif Chevilleur",
  },
  {
    id: "tar-5",
    name: "Porcelet Sevré Hybride (10 - 12 kg)",
    category: "Porc (Porciculture)",
    unit: "tête",
    basePriceFCFA: 35000,
    promoDiscountFCFA: 2000,
    promoDiscountPercent: 5.7,
    isPromoActive: true,
    promoLabel: "Offre Spéciale Éleveurs",
  },
  {
    id: "tar-6",
    name: "Sac de Fiente Séchée / Engrais Organique (50 kg)",
    category: "Compost & Subproduits",
    unit: "sac",
    basePriceFCFA: 2000,
    promoDiscountFCFA: 200,
    promoDiscountPercent: 10,
    isPromoActive: true,
    promoLabel: "Remise Maraîchers (>20 sacs)",
  },
  {
    id: "tar-7",
    name: "Aliment Croissance Poulet (Sac de 50 kg)",
    category: "Aliments & Provendes",
    unit: "sac",
    basePriceFCFA: 16500,
    promoDiscountFCFA: 500,
    promoDiscountPercent: 3,
    isPromoActive: false,
    promoLabel: "Tarif Usine",
  },
];

interface SalesTariffsAndPromosModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitCosts?: UnitCosts;
}

export const SalesTariffsAndPromosModal: React.FC<SalesTariffsAndPromosModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tariffs, setTariffs] = useState<SellingTariffProduct[]>(() => {
    try {
      const saved = localStorage.getItem("ivoire_elevage_sales_tariffs_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TARIFFS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ivoire_elevage_sales_tariffs_v1", JSON.stringify(tariffs));
    } catch (e) {
      console.error(e);
    }
  }, [tariffs]);

  // Editing state
  const [editingTariffId, setEditingTariffId] = useState<string | null>(null);
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editPromoDiscount, setEditPromoDiscount] = useState<number>(0);
  const [editPromoLabel, setEditPromoLabel] = useState<string>("");
  const [editIsPromoActive, setEditIsPromoActive] = useState<boolean>(false);

  // New Tariff Form State
  const [isNewTariffOpen, setIsNewTariffOpen] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState<string>("");
  const [newCategory, setNewCategory] = useState<SellingTariffProduct["category"]>("Volaille (Aviculture)");
  const [newUnit, setNewUnit] = useState<string>("kg");
  const [newBasePrice, setNewBasePrice] = useState<number>(2000);

  // WhatsApp Sharing Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [selectedClientPhone, setSelectedClientPhone] = useState<string>("+225 07 08 09 10 11");
  const [selectedClientName, setSelectedClientName] = useState<string>("Client Grossiste");
  const [whatsappSearch, setWhatsappSearch] = useState<string>("");

  if (!isOpen) return null;

  // Save Edit
  const handleStartEdit = (t: SellingTariffProduct) => {
    setEditingTariffId(t.id);
    setEditBasePrice(t.basePriceFCFA);
    setEditPromoDiscount(t.promoDiscountFCFA);
    setEditPromoLabel(t.promoLabel);
    setEditIsPromoActive(t.isPromoActive);
  };

  const handleSaveEdit = (id: string) => {
    setTariffs(
      tariffs.map((t) => {
        if (t.id === id) {
          const discount = Math.max(0, editPromoDiscount);
          const percent = t.basePriceFCFA > 0 ? (discount / editBasePrice) * 100 : 0;
          return {
            ...t,
            basePriceFCFA: editBasePrice,
            promoDiscountFCFA: discount,
            promoDiscountPercent: Number(percent.toFixed(1)),
            promoLabel: editPromoLabel || "Tarif Réajusté",
            isPromoActive: editIsPromoActive,
          };
        }
        return t;
      })
    );
    setEditingTariffId(null);
  };

  const handleTogglePromo = (id: string) => {
    setTariffs(
      tariffs.map((t) => (t.id === id ? { ...t, isPromoActive: !t.isPromoActive } : t))
    );
  };

  const handleCreateTariff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newTar: SellingTariffProduct = {
      id: `tar-${Date.now()}`,
      name: newProductName,
      category: newCategory,
      unit: newUnit || "unité",
      basePriceFCFA: newBasePrice,
      promoDiscountFCFA: 0,
      promoDiscountPercent: 0,
      isPromoActive: false,
      promoLabel: "Tarif Standard",
    };

    setTariffs([...tariffs, newTar]);
    setIsNewTariffOpen(false);
    setNewProductName("");
  };

  const handleDeleteTariff = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce tarif de vente ?")) {
      setTariffs(tariffs.filter((t) => t.id !== id));
    }
  };

  // Generate WhatsApp Message
  const buildWhatsAppMessage = () => {
    let msg = `Bonjour ${selectedClientName},\n\n`;
    msg += `📋 *GRILLE TARIFAIRE OFFICIELLE & PROMOTIONS EN COURS - IVOIRE ÉLEVAGE*\n\n`;
    msg += `Voici nos tarifs de vente actuels pour vos commandes :\n\n`;

    tariffs.forEach((t) => {
      const finalPrice = t.isPromoActive ? Math.max(0, t.basePriceFCFA - t.promoDiscountFCFA) : t.basePriceFCFA;
      msg += `🔹 *${t.name}*\n`;
      if (t.isPromoActive && t.promoDiscountFCFA > 0) {
        msg += `   • Prix Promo: *${formatFCFA(finalPrice)}* / ${t.unit} (Au lieu de ${formatFCFA(t.basePriceFCFA)})\n`;
        msg += `   • 🏷️ _${t.promoLabel}_\n`;
      } else {
        msg += `   • Prix: *${formatFCFA(finalPrice)}* / ${t.unit}\n`;
      }
      msg += `\n`;
    });

    msg += `📍 *Lieu de retrait / Livraison disponible*\n`;
    msg += `📞 Contact Service Commercial : +225 07 00 00 00 00\n`;
    msg += `Merci pour votre confiance ! 🐓🐖`;

    return msg;
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    const cleanPhone = selectedClientPhone.replace(/[^0-9]/g, "");
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 my-auto space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Politique Commerciale & Tarifs</span>
              </span>
              <span className="text-slate-500 text-xs font-bold">• {tariffs.length} Produits référencés</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Gestion des Tarifs de Vente & Réajustements Promo
            </h3>
            <p className="text-slate-500 text-xs">
              Fixez les prix de vente, appliquez des remises promotionnelles et envoyez la grille tarifaire directement par WhatsApp aux clients.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2 uppercase"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>Envoyer par WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-xs font-bold text-slate-700 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Catalogue Officiel des Prix de Vente & Offres Spéciales</span>
          </div>

          <button
            onClick={() => setIsNewTariffOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ajouter un Produit / Tarif</span>
          </button>
        </div>

        {/* Tariffs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3">Produit & Catégorie</th>
                <th className="p-3">Unité</th>
                <th className="p-3">Prix de Base (FCFA)</th>
                <th className="p-3">Remise / Promo (FCFA)</th>
                <th className="p-3">Prix de Vente Effectif</th>
                <th className="p-3 text-center">Statut Promo</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tariffs.map((t) => {
                const isEditing = editingTariffId === t.id;
                const effectivePrice = t.isPromoActive ? Math.max(0, t.basePriceFCFA - t.promoDiscountFCFA) : t.basePriceFCFA;

                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{t.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{t.category}</span>
                    </td>

                    <td className="p-3 font-mono text-slate-600 font-bold uppercase">{t.unit}</td>

                    <td className="p-3 font-mono font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editBasePrice}
                          onChange={(e) => setEditBasePrice(Number(e.target.value))}
                          className="w-24 bg-white border border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold"
                        />
                      ) : (
                        formatFCFA(t.basePriceFCFA)
                      )}
                    </td>

                    <td className="p-3 font-mono font-bold">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="number"
                            value={editPromoDiscount}
                            onChange={(e) => setEditPromoDiscount(Number(e.target.value))}
                            placeholder="Remise FCFA"
                            className="w-24 bg-white border border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={editPromoLabel}
                            onChange={(e) => setEditPromoLabel(e.target.value)}
                            placeholder="Libellé Promo"
                            className="w-32 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-[10px]"
                          />
                        </div>
                      ) : t.promoDiscountFCFA > 0 ? (
                        <div className="text-amber-700">
                          <div>-{formatFCFA(t.promoDiscountFCFA)} ({t.promoDiscountPercent}%)</div>
                          <div className="text-[10px] text-slate-500 font-normal italic">{t.promoLabel}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    <td className="p-3 font-mono font-black text-sm text-emerald-700 bg-emerald-50/50">
                      {formatFCFA(effectivePrice)}
                      {t.isPromoActive && t.promoDiscountFCFA > 0 && (
                        <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                          PROMO
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleTogglePromo(t.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                          t.isPromoActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {t.isPromoActive ? "PROMO ACTIVE" : "STANDARD"}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(t.id)}
                          className="px-3 py-1 bg-emerald-600 text-white font-black rounded-lg text-xs hover:bg-emerald-500"
                        >
                          Valider
                        </button>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleStartEdit(t)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg"
                            title="Modifier prix & promo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTariff(t.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Add New Product Tariff */}
        {isNewTariffOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Ajouter un Tarif Produit</span>
                </h4>
                <button onClick={() => setIsNewTariffOpen(false)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTariff} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Produit / Prestation * :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Poulet Fumé, Poussin d'un Jour, Porc Frais..."
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie Commerciale :</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SellingTariffProduct["category"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Volaille (Aviculture)">🐔 Volaille (Aviculture)</option>
                    <option value="Porc (Porciculture)">🐖 Porc (Porciculture)</option>
                    <option value="Aliments & Provendes">🌾 Aliments & Provendes</option>
                    <option value="Compost & Subproduits">💩 Compost & Subproduits</option>
                    <option value="Divers">📦 Divers</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Unité de Vente :</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="ex: kg, sujet, sac"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prix de Base (FCFA) :</label>
                    <input
                      type="number"
                      value={newBasePrice}
                      onChange={(e) => setNewBasePrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase shadow cursor-pointer"
                >
                  Enregistrer le Produit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Send WhatsApp Message */}
        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span>Envoyer la Grille Tarifaire via WhatsApp</span>
                </h4>
                <button onClick={() => setIsWhatsAppModalOpen(false)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sélectionner un Client Destinataire :</label>
                  <select
                    onChange={(e) => {
                      const client = defaultClients.find((c) => c.id === e.target.value);
                      if (client) {
                        setSelectedClientName(client.name);
                        setSelectedClientPhone(client.phone || "+225 07 00 00 00 00");
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choisir un client dans le carnet --</option>
                    {defaultClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || "Pas de tél"}) - {c.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nom du Client :</label>
                    <input
                      type="text"
                      value={selectedClientName}
                      onChange={(e) => setSelectedClientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Numéro WhatsApp (+225) :</label>
                    <input
                      type="text"
                      value={selectedClientPhone}
                      onChange={(e) => setSelectedClientPhone(e.target.value)}
                      placeholder="+225 07..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aperçu du Message Formaté :</label>
                  <textarea
                    rows={8}
                    readOnly
                    value={buildWhatsAppMessage()}
                    className="w-full bg-slate-900 text-emerald-300 font-mono text-[11px] p-3 rounded-2xl border border-slate-800 outline-none"
                  />
                </div>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition-all uppercase cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Ouvrir WhatsApp & Envoyer au Client</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
