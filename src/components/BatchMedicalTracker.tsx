import React, { useState, useEffect } from "react";
import {
  Syringe,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  ShieldCheck,
  FileText,
  Activity,
  Droplets,
  Building,
  HeartPulse,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";

export interface BatchMedicalRecord {
  id: string;
  batchName: string;
  species: "Aviculture" | "Porciculture";
  recordType:
    | "Vaccination"
    | "Traitement Antibiotique"
    | "Vitamines & Fortifiants"
    | "Intervention Vétérinaire"
    | "Alerte Sanitaire"
    | "Vermifugation";
  date: string;
  productName: string;
  dosage: string;
  headCountTreated: number;
  veterinarianOrOperator: string;
  status: "Planifié" | "En Cours" | "Achevée / Réussie" | "Alerte Critique";
  notes: string;
}

const DEFAULT_BATCH_MEDICAL_RECORDS: BatchMedicalRecord[] = [
  {
    id: "med-01",
    batchName: "Bande Poulets Chair B-2026-01 (Bâtiment A)",
    species: "Aviculture",
    recordType: "Vaccination",
    date: "2026-07-10",
    productName: "Vaccin Newcastle + HB1 (Goutte Oculaire)",
    dosage: "1 dose / poussin à J-1",
    headCountTreated: 5000,
    veterinarianOrOperator: "Dr. Yao (Vétérinaire Conseil)",
    status: "Achevée / Réussie",
    notes: "Immunisation initiale réalisée à l'écloserie. Aucun effet secondaire.",
  },
  {
    id: "med-02",
    batchName: "Bande Poulets Chair B-2026-01 (Bâtiment A)",
    species: "Aviculture",
    recordType: "Vitamines & Fortifiants",
    date: "2026-07-15",
    productName: "Vitamine AD3E + Électrolytes Anti-Stress",
    dosage: "1g / 2L d'eau de boisson pendant 3 jours",
    headCountTreated: 4980,
    veterinarianOrOperator: "Kouassi (Technicien)",
    status: "Achevée / Réussie",
    notes: "Distribution systématique lors de la forte chaleur (34°C).",
  },
  {
    id: "med-03",
    batchName: "Bande Poulets Chair B-2026-01 (Bâtiment A)",
    species: "Aviculture",
    recordType: "Alerte Sanitaire",
    date: "2026-07-22",
    productName: "Alerte Coccidiose Précoce",
    dosage: "Analyse fécale laboratoire positive",
    headCountTreated: 50,
    veterinarianOrOperator: "Soro (Technicien)",
    status: "Achevée / Réussie",
    notes: "Fientes liquides observées au centre du bâtiment. Isolement et cure anticoccidienne immédiate.",
  },
  {
    id: "med-04",
    batchName: "Porcs Engraissement Cycle P-2026-02 (Porcherie P1)",
    species: "Porciculture",
    recordType: "Intervention Vétérinaire",
    date: "2026-07-05",
    productName: "Fer Dextran 200mg + Coupe de Cordon",
    dosage: "2ml IM / porcelet à J-3",
    headCountTreated: 85,
    veterinarianOrOperator: "Dr. Yao (Vétérinaire Conseil)",
    status: "Achevée / Réussie",
    notes: "Prévention anémie néonatale chez les porcelets de Maternité.",
  },
  {
    id: "med-05",
    batchName: "Porcs Engraissement Cycle P-2026-02 (Porcherie P1)",
    species: "Porciculture",
    recordType: "Vermifugation",
    date: "2026-07-18",
    productName: "Ivermectine Injectable 1%",
    dosage: "1ml pour 33kg de poids vif",
    headCountTreated: 80,
    veterinarianOrOperator: "Yao (Technicien Elevage)",
    status: "Achevée / Réussie",
    notes: "Dparasitage externe et interne complet du lot avant transfert en engraissement.",
  },
];

export const BatchMedicalTracker: React.FC = () => {
  const [records, setRecords] = useState<BatchMedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem("ivoire_elevage_batch_medical_history_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BATCH_MEDICAL_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ivoire_elevage_batch_medical_history_v1", JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState<string>("Tous");
  const [selectedType, setSelectedType] = useState<string>("Tous");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // New Record Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formBatchName, setFormBatchName] = useState<string>("Bande Poulets Chair B-2026-01 (Bâtiment A)");
  const [formSpecies, setFormSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [formType, setFormType] = useState<BatchMedicalRecord["recordType"]>("Vaccination");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formProduct, setFormProduct] = useState<string>("");
  const [formDosage, setFormDosage] = useState<string>("");
  const [formHeadcount, setFormHeadcount] = useState<number>(1000);
  const [formVet, setFormVet] = useState<string>("Dr. Yao (Vétérinaire Conseil)");
  const [formStatus, setFormStatus] = useState<BatchMedicalRecord["status"]>("Achevée / Réussie");
  const [formNotes, setFormNotes] = useState<string>("");

  // Get unique batches list
  const uniqueBatches = Array.from(new Set(records.map((r) => r.batchName)));

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchBatch = selectedBatch === "Tous" || r.batchName === selectedBatch;
    const matchType = selectedType === "Tous" || r.recordType === selectedType;
    const matchSpecies = selectedSpecies === "Tous" || r.species === selectedSpecies;
    const matchSearch =
      searchQuery === "" ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.veterinarianOrOperator.toLowerCase().includes(searchQuery.toLowerCase());

    return matchBatch && matchType && matchSpecies && matchSearch;
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.trim()) return;

    const newRec: BatchMedicalRecord = {
      id: `med-${Date.now()}`,
      batchName: formBatchName,
      species: formSpecies,
      recordType: formType,
      date: formDate,
      productName: formProduct,
      dosage: formDosage || "Dose standard selon prescription",
      headCountTreated: formHeadcount,
      veterinarianOrOperator: formVet,
      status: formStatus,
      notes: formNotes || "Enregistré au registre sanitaire.",
    };

    setRecords([newRec, ...records]);
    setIsModalOpen(false);
    setFormProduct("");
    setFormDosage("");
    setFormNotes("");
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet enregistrement médical ?")) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                <span>Registre Médical par Cycle & Lot</span>
              </span>
              <span className="text-emerald-200 text-xs font-bold">• Historique Traitements & Alertes</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Suivi Sanitaire & Traitements Vétérinaires par Lot
            </h3>
            <p className="text-emerald-100/90 text-xs max-w-2xl">
              Consignez l'historique complet des vaccinations, cures d'antibiotiques, vermifuges et alertes de chaque bande d'animaux pour garantir la traçabilité et le respect des temps d'attente.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer uppercase flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir un Soin / Alerte Sanitaire</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filtres de Traçabilité Sanitaire :</span>
          </span>
          <span className="text-slate-500 text-[11px] font-normal">
            {filteredRecords.length} acte(s) trouvé(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Filtrer par Lot / Bande :</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tous">Tous les Lots / Cycles</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Type d'Acte Médical :</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tous">Tous les types d'actes</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Traitement Antibiotique">Traitement Antibiotique</option>
              <option value="Vitamines & Fortifiants">Vitamines & Fortifiants</option>
              <option value="Intervention Vétérinaire">Intervention Vétérinaire</option>
              <option value="Alerte Sanitaire">Alerte Sanitaire</option>
              <option value="Vermifugation">Vermifugation</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Élevage :</label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tous">Tous les secteurs</option>
              <option value="Aviculture">🐔 Aviculture</option>
              <option value="Porciculture">🐖 Porciculture</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Recherche Médicament / Note :</label>
            <div className="relative">
              <input
                type="text"
                placeholder="ex: Gumboro, Fer, Dr. Yao..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Historique Chronologique des Traitements & Actes Sanitaires</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3">Date</th>
                <th className="p-3">Lot / Bande de Production</th>
                <th className="p-3">Type d'Acte</th>
                <th className="p-3">Produit / Traitement</th>
                <th className="p-3">Posologie & Effectif</th>
                <th className="p-3">Intervenant</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      <div>{r.batchName}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{r.species}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                          r.recordType === "Vaccination"
                            ? "bg-purple-100 text-purple-800"
                            : r.recordType === "Alerte Sanitaire"
                            ? "bg-rose-100 text-rose-800 animate-pulse"
                            : r.recordType === "Traitement Antibiotique"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {r.recordType}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">
                      <div>{r.productName}</div>
                      <div className="text-[10px] text-slate-500 font-normal italic">{r.notes}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div>{r.dosage}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {r.headCountTreated.toLocaleString("fr-FR")} sujets traités
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium whitespace-nowrap">
                      {r.veterinarianOrOperator}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          r.status === "Achevée / Réussie"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "Alerte Critique"
                            ? "bg-rose-200 text-rose-950"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                        title="Supprimer la fiche"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Aucun enregistrement médical ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Medical Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                <span>Nouveau Soin / Traitement / Alerte Sanitaire</span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lot / Bande Concernée * :</label>
                  <input
                    type="text"
                    required
                    value={formBatchName}
                    onChange={(e) => setFormBatchName(e.target.value)}
                    placeholder="ex: Bande Chair B-2026-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secteur Élevage :</label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value as "Aviculture" | "Porciculture")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Aviculture">🐔 Aviculture</option>
                    <option value="Porciculture">🐖 Porciculture</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type d'Acte Médical :</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as BatchMedicalRecord["recordType"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Vaccination">Vaccination</option>
                    <option value="Traitement Antibiotique">Traitement Antibiotique</option>
                    <option value="Vitamines & Fortifiants">Vitamines & Fortifiants</option>
                    <option value="Intervention Vétérinaire">Intervention Vétérinaire</option>
                    <option value="Alerte Sanitaire">Alerte Sanitaire</option>
                    <option value="Vermifugation">Vermifugation</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date de l'Acte * :</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Produit / Traitement * :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Vaccin Gumboro, Oxytétracycline..."
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Posologie / Mode d'Administration :</label>
                  <input
                    type="text"
                    placeholder="ex: 1g/L eau pendant 3 jours"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Effectif Traité (Sujets) :</label>
                  <input
                    type="number"
                    min="1"
                    value={formHeadcount}
                    onChange={(e) => setFormHeadcount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Intervenant / Vétérinaire :</label>
                  <input
                    type="text"
                    value={formVet}
                    onChange={(e) => setFormVet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations / Notes Sanitaires :</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notez les symptômes, la réaction des animaux, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition-all uppercase cursor-pointer"
              >
                Enregistrer l'Acte au Registre Médical
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
