import React, { useState, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  ShieldCheck,
  HeartPulse,
  History,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Pill,
  Syringe,
} from "lucide-react";
import {
  UnitCosts,
  AuditLogEntry,
  VaccineSchedule,
  DailyTask,
  MedicationItem,
} from "../types";
import { getApiUrl } from "../utils/api";
import { defaultAuditLogEntries } from "./AuditLogView";
import {
  defaultVaccineSchedules,
  defaultDailyTasks,
} from "../data/tasksAndVaccinesData";
import { defaultMedicationItems } from "../data/medicationStockData";

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitCosts: UnitCosts;
  initialPrompt?: string;
  initialAnalysisType?: "general" | "sanitary_preventive_audit";
  auditLogs?: AuditLogEntry[];
  vaccineSchedules?: VaccineSchedule[];
  dailyTasks?: DailyTask[];
  medicationItems?: MedicationItem[];
  onOpenStudio?: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  unitCosts,
  initialPrompt,
  initialAnalysisType = "general",
  auditLogs = defaultAuditLogEntries,
  vaccineSchedules = defaultVaccineSchedules,
  dailyTasks = defaultDailyTasks,
  medicationItems = defaultMedicationItems,
  onOpenStudio,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<
    "general" | "sanitary_preventive_audit"
  >(initialAnalysisType);

  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string; isSanitaryReport?: boolean }[]
  >([
    {
      sender: "ai",
      text: "Bonjour ! Je suis votre Conseiller Agro-Pastoral & Expert Vétérinaire IA dédié à IVOIRE ÉLEVAGE.\n\nPosez-moi vos questions ou lancez l'**Analyse Préventive des Cycles Sanitaires** pour croiser vos données d'Audit Log, Vaccins, Tâches terrain et Pharmacie.",
    },
  ]);

  // Handle auto-trigger when opened with initial prompt or sanitary audit mode
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(
        initialPrompt,
        (initialAnalysisType as "general" | "sanitary_preventive_audit") || "general"
      );
    }
  }, [isOpen, initialPrompt, initialAnalysisType]);

  if (!isOpen) return null;

  const quickPrompts = [
    "🛡️ Analyse préventive globale : croiser l'Audit Log et le Suivi Sanitaire pour optimiser les cycles.",
    "💉 Auditer le calendrier de vaccination et détecter les risques de retard (Alerte J-5).",
    "💊 Vérifier les stocks de pharmacie et la chaîne du froid des lots proches de péremption.",
    "🐔 Proposer un plan de prophylaxie optimisé pour les rotations 10 jours de poulets de chair.",
    "🐷 Recommandations sanitaires et préventions de mortalité pour le lot porcin.",
  ];

  const handleSend = async (
    questionToSend?: string,
    overrideType?: "general" | "sanitary_preventive_audit"
  ) => {
    const q = questionToSend || prompt;
    if (!q.trim()) return;

    const currentType = overrideType || selectedAnalysisType;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    if (!questionToSend) setPrompt("");
    setLoading(true);

    try {
      // Assemble full contextual payload combining Audit Log + Tasks & Health data
      const sanitizeLogs = auditLogs.map((l) => ({
        timestamp: l.timestamp,
        user: l.user,
        category: l.category,
        targetItem: l.targetItem,
        previousValue: l.previousValue,
        newValue: l.newValue,
        impactNote: l.impactNote,
      }));

      const sanitizeVaccines = vaccineSchedules.map((v) => ({
        batchName: v.batchName,
        species: v.species,
        vaccineName: v.vaccineName,
        diseaseTarget: v.diseaseTarget,
        scheduledAgeLabel: v.scheduledAgeLabel,
        scheduledDate: v.scheduledDate,
        status: v.status,
        veterinaryNotes: v.veterinaryNotes,
      }));

      const sanitizeTasks = dailyTasks.map((t) => ({
        taskName: t.taskName,
        scheduledTime: t.scheduledTime,
        species: t.species,
        category: t.category,
        assignedTo: t.assignedTo,
        isCompletedToday: t.isCompletedToday,
        notes: t.notes,
      }));

      const sanitizeMeds = medicationItems.map((m) => ({
        name: m.name,
        category: m.category,
        speciesTarget: m.speciesTarget,
        requiresColdChain: m.requiresColdChain,
        batches: m.batches.map((b) => ({
          lotNumber: b.lotNumber,
          expirationDate: b.expirationDate,
          currentQuantity: b.currentQuantity,
          qualityStatus: b.qualityStatus,
        })),
      }));

      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          analysisType: currentType,
          context: {
            company: "IVOIRE ÉLEVAGE",
            unitCosts,
            auditLogsCount: auditLogs.length,
            auditLogs: sanitizeLogs,
            vaccineSchedulesCount: vaccineSchedules.length,
            vaccineSchedules: sanitizeVaccines,
            dailyTasksCount: dailyTasks.length,
            dailyTasks: sanitizeTasks,
            medicationItemsCount: medicationItems.length,
            medicationItems: sanitizeMeds,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `⚠️ ${data.error}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.answer || "Aucune réponse générée.",
            isSanitaryReport: currentType === "sanitary_preventive_audit",
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Erreur de connexion au serveur d'assistance IA.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSanitaryAnalysis = () => {
    setSelectedAnalysisType("sanitary_preventive_audit");
    handleSend(
      "Effectuer une analyse préventive approfondie des cycles sanitaires en croisant le Journal d'Audit (Audit Log) et le Suivi Sanitaire (Vaccins, Tâches & Pharmacie). Fournir un diagnostic de conformité, identifier les risques et recommander un plan d'action préventif.",
      "sanitary_preventive_audit"
    );
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight flex items-center space-x-2">
                <span>Conseiller Agro-Pastoral & Expert Vétérinaire IA</span>
              </h3>
              <p className="text-xs text-emerald-300 flex items-center space-x-1">
                <span>Propulsé par Gemini API • Analyse Croisée Audit & Santé</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-800/80 rounded-xl text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Sanitary Cycle Optimization Trigger Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white p-3.5 px-4 border-b border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
              <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 flex items-center space-x-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Optimisation Préventive des Cycles Sanitaires</span>
              </div>
              <p className="text-[11px] text-emerald-200 leading-snug">
                Croise <strong>{auditLogs.length} événements d'Audit</strong> avec <strong>{vaccineSchedules.length} vaccins</strong>, <strong>{dailyTasks.length} tâches</strong> et <strong>{medicationItems.length} médicaments</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
            {onOpenStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStudio();
                }}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md border border-amber-400/40 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>⚙️ Studio IA APK</span>
              </button>
            )}

            <button
              onClick={handleTriggerSanitaryAnalysis}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center space-x-2 border border-amber-300/50 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>🔍 Lancer l'Analyse Préventive Gemini</span>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-xs sm:text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 space-y-2 shadow-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-800 text-white font-medium rounded-tr-none"
                    : m.isSanitaryReport
                    ? "bg-white text-slate-900 border-2 border-emerald-500 rounded-tl-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                {m.sender === "ai" && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-black text-xs">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Ivoire Élevage IA • Diagnostic Vétérinaire</span>
                    </div>

                    <button
                      onClick={() => handleCopyText(m.text, idx)}
                      className="text-slate-400 hover:text-emerald-700 flex items-center space-x-1 text-[11px] font-bold cursor-pointer"
                      title="Copier le rapport"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-slate-800 text-xs sm:text-sm">
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-slate-700 text-xs font-semibold shadow-md">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <div className="space-y-0.5">
                  <div className="text-emerald-950 font-black">
                    Analyse préventive Gemini en cours...
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Croisement des registres d'audit log, alertes vaccin J-5, observations vocales et stocks de pharmacie...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5 text-xs shrink-0">
          <span className="text-[11px] text-slate-500 font-bold self-center mr-1">
            Suggestions :
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() =>
                handleSend(
                  qp,
                  qp.includes("Analyse préventive")
                    ? "sanitary_preventive_audit"
                    : "general"
                )
              }
              disabled={loading}
              className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-950 border border-slate-300 hover:border-emerald-500 rounded-full font-bold text-[11px] transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez une question ou demandez un conseil d'optimisation sanitaire..."
            className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 px-4 rounded-xl font-bold transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

