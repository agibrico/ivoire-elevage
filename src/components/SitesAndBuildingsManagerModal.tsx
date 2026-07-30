import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  MapPin,
  Tag,
  UserCheck,
  Maximize2,
  Search,
  Filter,
  DollarSign,
  Info,
  Warehouse,
  Briefcase,
  Store,
  Scissors,
  Check,
} from "lucide-react";
import { formatFCFA } from "../utils/formatters";

export interface SiteBuilding {
  id: string;
  name: string;
  siteName: string; // ex: Site Bingerville, Site Bouaké, Siège
  type:
    | "Ferme Aviculture"
    | "Ferme Porciculture"
    | "Polyculture / Mixte"
    | "Magasin & Entrepôt"
    | "Bureaux Administratifs"
    | "Atelier d'Abattage & Découpe"
    | "Laboratoire & Couvoir";
  capacity: string; // ex: 5 000 sujets, 80 truies, 100 Tonnes
  surfaceM2: number;
  managerName: string;
  status: "En Exploitation" | "En Rénovation" | "Vide Sanitaire" | "En Construction";
  estimatedValueFCFA: number;
  description: string;
}

const DEFAULT_SITES_BUILDINGS: SiteBuilding[] = [
  {
    id: "sb-1",
    name: "Bâtiment Avicole A1 (Poussinière & Chair)",
    siteName: "Ferme Principale Bingerville",
    type: "Ferme Aviculture",
    capacity: "5 000 poulets de chair",
    surfaceM2: 300,
    managerName: "Kouassi Jean-Marc (Chef Élevage)",
    status: "En Exploitation",
    estimatedValueFCFA: 8500000,
    description: "Ventilation dynamique, ligne d'abreuvement pipettes et mangeoires automatiques.",
  },
  {
    id: "sb-2",
    name: "Porcherie Maternité & Engraissement P1",
    siteName: "Ferme Principale Bingerville",
    type: "Ferme Porciculture",
    capacity: "12 loges (80 porcs)",
    surfaceM2: 250,
    managerName: "Yao Germain (Spécialiste Porcin)",
    status: "En Exploitation",
    estimatedValueFCFA: 6000000,
    description: "Sols en caillebotis, abreuvoirs tétines, système d'évacuation du lisier.",
  },
  {
    id: "sb-3",
    name: "Magasin Central de Stockage Aliments & Provendes",
    siteName: "Ferme Principale Bingerville",
    type: "Magasin & Entrepôt",
    capacity: "50 Tonnes d'aliments & matières premières",
    surfaceM2: 150,
    managerName: "Soro Fatou (Gestionnaire Stock)",
    status: "En Exploitation",
    estimatedValueFCFA: 4200000,
    description: "Magasin sec palettisé pour conservation du maïs, tourteaux, premix et sacs.",
  },
  {
    id: "sb-4",
    name: "Atelier d'Abattage & Découpe Isotherme",
    siteName: "Site Industriel Zone Abidjan",
    type: "Atelier d'Abattage & Découpe",
    capacity: "500 poulets/jour & 20 porcs/jour",
    surfaceM2: 120,
    managerName: "Dr. Bamba (Responsable Qualité)",
    status: "En Exploitation",
    estimatedValueFCFA: 12000000,
    description: "Chambre froide négative/positive, penderies à carcasse, emballeuse sous-vide.",
  },
  {
    id: "sb-5",
    name: "Bureaux Administratifs & Direction Commerciale",
    siteName: "Siège Abidjan Plateau",
    type: "Bureaux Administratifs",
    capacity: "15 postes de travail",
    surfaceM2: 90,
    managerName: "Atsé Brice (Directeur Général)",
    status: "En Exploitation",
    estimatedValueFCFA: 5000000,
    description: "Bureaux climatisés, salle de réunion et comptabilité centrale.",
  },
];

interface SitesAndBuildingsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SitesAndBuildingsManagerModal: React.FC<SitesAndBuildingsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sites, setSites] = useState<SiteBuilding[]>(() => {
    try {
      const saved = localStorage.getItem("ivoire_elevage_sites_buildings_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SITES_BUILDINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ivoire_elevage_sites_buildings_v1", JSON.stringify(sites));
    } catch (e) {
      console.error(e);
    }
  }, [sites]);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("Tous");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Add / Edit Form Modal
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState<string>("");
  const [formSiteName, setFormSiteName] = useState<string>("Ferme Bingerville");
  const [formType, setFormType] = useState<SiteBuilding["type"]>("Ferme Aviculture");
  const [formCapacity, setFormCapacity] = useState<string>("");
  const [formSurface, setFormSurface] = useState<number>(100);
  const [formManager, setFormManager] = useState<string>("");
  const [formStatus, setFormStatus] = useState<SiteBuilding["status"]>("En Exploitation");
  const [formValue, setFormValue] = useState<number>(5000000);
  const [formDescription, setFormDescription] = useState<string>("");

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormName("");
    setFormSiteName("Ferme Bingerville");
    setFormType("Ferme Aviculture");
    setFormCapacity("1000 sujets");
    setFormSurface(120);
    setFormManager("Technicien Chef");
    setFormStatus("En Exploitation");
    setFormValue(5000000);
    setFormDescription("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (sb: SiteBuilding) => {
    setEditingId(sb.id);
    setFormName(sb.name);
    setFormSiteName(sb.siteName);
    setFormType(sb.type);
    setFormCapacity(sb.capacity);
    setFormSurface(sb.surfaceM2);
    setFormManager(sb.managerName);
    setFormStatus(sb.status);
    setFormValue(sb.estimatedValueFCFA);
    setFormDescription(sb.description);
    setIsFormOpen(true);
  };

  const handleSaveSiteBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingId) {
      setSites(
        sites.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formName,
                siteName: formSiteName,
                type: formType,
                capacity: formCapacity,
                surfaceM2: formSurface,
                managerName: formManager,
                status: formStatus,
                estimatedValueFCFA: formValue,
                description: formDescription,
              }
            : s
        )
      );
    } else {
      const newSB: SiteBuilding = {
        id: `sb-${Date.now()}`,
        name: formName,
        siteName: formSiteName,
        type: formType,
        capacity: formCapacity,
        surfaceM2: formSurface,
        managerName: formManager,
        status: formStatus,
        estimatedValueFCFA: formValue,
        description: formDescription,
      };
      setSites([newSB, ...sites]);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce bâtiment / site ?")) {
      setSites(sites.filter((s) => s.id !== id));
    }
  };

  // Filtered List
  const filteredSites = sites.filter((s) => {
    const matchType = selectedType === "Tous" || s.type === selectedType;
    const matchStatus = selectedStatus === "Tous" || s.status === selectedStatus;
    const matchSearch =
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.managerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchType && matchStatus && matchSearch;
  });

  const totalValue = sites.reduce((sum, s) => sum + s.estimatedValueFCFA, 0);
  const totalSurface = sites.reduce((sum, s) => sum + s.surfaceM2, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 my-auto space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Patrimoine & Infrastructure</span>
              </span>
              <span className="text-slate-500 text-xs font-bold">• {sites.length} Site(s) & Bâtis</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Gestion des Sites, Fermes & Bâtiments d'Exploitation
            </h3>
            <p className="text-slate-500 text-xs">
              Cartographie des infrastructures : fermes (aviculture, porciculture, mixte), magasins de stockage, abattoirs et bureaux.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenAddForm}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2 uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Bâtiment / Site</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider block">Valeur Patrimoniale Totale</span>
            <span className="text-xl font-black text-emerald-400">{formatFCFA(totalValue)}</span>
            <span className="text-[10px] text-slate-300 font-normal block">Valeur estimée des bâtiments & aménagements</span>
          </div>

          <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 space-y-1">
            <span className="text-emerald-300 text-[11px] uppercase tracking-wider block">Superficie Totale Exploite</span>
            <span className="text-xl font-black text-emerald-300">{totalSurface.toLocaleString("fr-FR")} m²</span>
            <span className="text-[10px] text-emerald-200 font-normal block">Cumul des bâtiments et hangars couverts</span>
          </div>

          <div className="bg-teal-950 text-white p-4 rounded-2xl border border-teal-800 space-y-1">
            <span className="text-teal-300 text-[11px] uppercase tracking-wider block">Répartition par Type</span>
            <div className="text-[11px] text-teal-100 font-medium space-y-0.5">
              <span>🐔 Aviculture: {sites.filter((s) => s.type === "Ferme Aviculture").length} site(s)</span> |{" "}
              <span>🐖 Porciculture: {sites.filter((s) => s.type === "Ferme Porciculture").length} site(s)</span>
            </div>
            <span className="text-[10px] text-teal-200 font-normal block">Magasins & Bureaux: {sites.filter((s) => s.type.includes("Magasin") || s.type.includes("Bureaux")).length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-500 block mb-1 text-[11px]">Type d'Infrastucture / Élevage :</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tous">Tous les types d'infrastructures</option>
                <option value="Ferme Aviculture">🐔 Ferme Aviculture</option>
                <option value="Ferme Porciculture">🐖 Ferme Porciculture</option>
                <option value="Polyculture / Mixte">🌿 Polyculture / Mixte</option>
                <option value="Magasin & Entrepôt">📦 Magasin & Entrepôt</option>
                <option value="Bureaux Administratifs">🏢 Bureaux Administratifs</option>
                <option value="Atelier d'Abattage & Découpe">🥩 Atelier d'Abattage & Découpe</option>
                <option value="Laboratoire & Couvoir">🧪 Laboratoire & Couvoir</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-500 block mb-1 text-[11px]">Statut d'Exploitation :</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="En Exploitation">En Exploitation</option>
                <option value="Vide Sanitaire">Vide Sanitaire</option>
                <option value="En Rénovation">En Rénovation</option>
                <option value="En Construction">En Construction</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-500 block mb-1 text-[11px]">Recherche par Nom / Responsable :</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ex: Bingerville, Kouassi, Magasin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Sites & Buildings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
          {filteredSites.map((sb) => (
            <div
              key={sb.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 inline-block mb-1">
                      {sb.type}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">{sb.name}</h4>
                    <p className="text-slate-500 text-xs flex items-center gap-1 font-medium mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{sb.siteName}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                      sb.status === "En Exploitation"
                        ? "bg-emerald-100 text-emerald-800"
                        : sb.status === "Vide Sanitaire"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {sb.status}
                  </span>
                </div>

                <p className="text-slate-600 text-xs italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{sb.description}"
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 font-normal block">Capacité d'Accueil :</span>
                    <span className="text-emerald-700">{sb.capacity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Superficie :</span>
                    <span className="text-slate-900">{sb.surfaceM2} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Responsable :</span>
                    <span className="text-slate-800">{sb.managerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal block">Valeur Estimée :</span>
                    <span className="text-slate-900">{formatFCFA(sb.estimatedValueFCFA)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleOpenEditForm(sb)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDelete(sb.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Form Add/Edit Site Building */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>{editingId ? "Modifier l'Infrastructure" : "Nouveau Bâtiment / Site"}</span>
                </h4>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSiteBuilding} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Désignation du Bâtiment / Bâti * :</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ex: Bâtiment Avicole A2, Magasin Provendes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Localisation / Site * :</label>
                    <input
                      type="text"
                      required
                      value={formSiteName}
                      onChange={(e) => setFormSiteName(e.target.value)}
                      placeholder="ex: Ferme Bingerville"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Type d'Infrastucture * :</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as SiteBuilding["type"])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Ferme Aviculture">🐔 Ferme Aviculture</option>
                      <option value="Ferme Porciculture">🐖 Ferme Porciculture</option>
                      <option value="Polyculture / Mixte">🌿 Polyculture / Mixte</option>
                      <option value="Magasin & Entrepôt">📦 Magasin & Entrepôt</option>
                      <option value="Bureaux Administratifs">🏢 Bureaux Administratifs</option>
                      <option value="Atelier d'Abattage & Découpe">🥩 Atelier d'Abattage & Découpe</option>
                      <option value="Laboratoire & Couvoir">🧪 Laboratoire & Couvoir</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Capacité d'Accueil :</label>
                    <input
                      type="text"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      placeholder="ex: 5 000 sujets, 50 Tonnes"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Superficie (m²) :</label>
                    <input
                      type="number"
                      value={formSurface}
                      onChange={(e) => setFormSurface(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Responsable / Chef de Site :</label>
                    <input
                      type="text"
                      value={formManager}
                      onChange={(e) => setFormManager(e.target.value)}
                      placeholder="ex: Kouassi Jean"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Statut d'Exploitation :</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as SiteBuilding["status"])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="En Exploitation">En Exploitation</option>
                      <option value="Vide Sanitaire">Vide Sanitaire</option>
                      <option value="En Rénovation">En Rénovation</option>
                      <option value="En Construction">En Construction</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valeur Estimée de la Structure (FCFA) :</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Équipements :</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Équipements installés, ventilation, isolation..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition-all uppercase cursor-pointer"
                >
                  {editingId ? "Mettre à Jour" : "Créer l'Infrastructure"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
