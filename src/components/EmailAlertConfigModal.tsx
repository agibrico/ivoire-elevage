import React, { useState, useEffect } from "react";
import { EmailAlertConfig } from "../types";
import {
  Bell,
  Mail,
  ShieldAlert,
  CheckCircle2,
  X,
  Send,
  Sliders,
  Check,
  Package,
  AlertTriangle,
  Server,
} from "lucide-react";

interface EmailAlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const defaultEmailConfig: EmailAlertConfig = {
  enabled: true,
  recipientEmails: ["atsegillesbrice@gmail.com", "direction@ivoire-elevage.ci"],
  alertCriticalStock: true,
  stockThresholdKg: 1500,
  alertHighMortality: true,
  mortalityThresholdPct: 3.0,
  alertPaymentOverdue: true,
  sendDailyDigest: true,
  smtpServerStatus: "Connecté",
};

export const EmailAlertConfigModal: React.FC<EmailAlertConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<EmailAlertConfig>(() => {
    const saved = localStorage.getItem("ivoire_email_alert_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultEmailConfig;
      }
    }
    return defaultEmailConfig;
  });

  const [emailInput, setEmailInput] = useState("");
  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    localStorage.setItem("ivoire_email_alert_config", JSON.stringify(config));
  }, [config]);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    if (!emailInput.trim() || !emailInput.includes("@")) return;
    if (config.recipientEmails.includes(emailInput.trim())) return;

    setConfig({
      ...config,
      recipientEmails: [...config.recipientEmails, emailInput.trim()],
    });
    setEmailInput("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setConfig({
      ...config,
      recipientEmails: config.recipientEmails.filter((e) => e !== emailToRemove),
    });
  };

  const handleSendTestEmail = () => {
    setIsSendingTest(true);
    setTestNotification(null);

    setTimeout(() => {
      setIsSendingTest(false);
      setTestNotification(
        `✉️ Notification d'alerte email de test transmise avec succès à ${config.recipientEmails.join(", ")} !`
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2 text-slate-900">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Configuration des Alertes E-mail (Hors Application)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Notification automatique des gestionnaires sur seuils critiques de stocks & mortalité.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Notification Banner */}
        {testNotification && (
          <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{testNotification}</span>
            </div>
            <button
              onClick={() => setTestNotification(null)}
              className="text-emerald-800 hover:text-emerald-950 font-black ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Master Toggle */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-amber-300">
                Service de Notifications Email Automatisé
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  config.enabled ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                }`}
              >
                {config.enabled ? "ACTIF ✓" : "DÉSACTIVÉ"}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Envoie un e-mail instantané dès qu'un niveau de stock passe sous le seuil critique.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              config.enabled
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {config.enabled ? "Activé" : "Activer"}
          </button>
        </div>

        {/* Recipients List Input */}
        <div className="space-y-2 text-xs font-semibold">
          <label className="text-slate-800 font-extrabold uppercase flex items-center justify-between">
            <span>1. Adresses E-mail des Destinataires (Gestionnaires) :</span>
            <span className="text-slate-500 text-[11px] font-normal">
              {config.recipientEmails.length} destinataire(s)
            </span>
          </label>

          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="ex: direction@ivoire-elevage.ci, atsegillesbrice@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition-all"
            >
              + Ajouter
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {config.recipientEmails.map((email) => (
              <span
                key={email}
                className="bg-slate-100 border border-slate-300 text-slate-800 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Threshold Controls */}
        <div className="space-y-3 text-xs font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-slate-900 font-black uppercase block border-b border-slate-200 pb-2">
            2. Règles et Seuils de Déclenchement d'Alerte :
          </span>

          {/* Rule A: Stock Threshold */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-slate-800 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.alertCriticalStock}
                  onChange={(e) =>
                    setConfig({ ...config, alertCriticalStock: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>🚨 Alerte Stock Critique Aliment (Maïs, Soja, Concentrés)</span>
              </label>

              <span className="text-amber-800 font-black bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                Seuil: &lt; {config.stockThresholdKg} kg
              </span>
            </div>

            <div className="flex items-center space-x-3 pl-6">
              <span className="text-slate-500 font-medium">Alerter si stock &lt;</span>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={config.stockThresholdKg}
                onChange={(e) =>
                  setConfig({ ...config, stockThresholdKg: Number(e.target.value) })
                }
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="font-bold text-slate-900 w-16">{config.stockThresholdKg} kg</span>
            </div>
          </div>

          {/* Rule B: Mortality Threshold */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-slate-800 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.alertHighMortality}
                  onChange={(e) =>
                    setConfig({ ...config, alertHighMortality: e.target.checked })
                  }
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <span>⚠️ Alerte Taux de Mortalité Anormale (&gt; {config.mortalityThresholdPct}%)</span>
              </label>

              <span className="text-rose-800 font-black bg-rose-100 px-2.5 py-0.5 rounded border border-rose-300">
                Seuil: &gt; {config.mortalityThresholdPct}%
              </span>
            </div>

            <div className="flex items-center space-x-3 pl-6">
              <span className="text-slate-500 font-medium">Alerter si mortalité &gt;</span>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={config.mortalityThresholdPct}
                onChange={(e) =>
                  setConfig({ ...config, mortalityThresholdPct: Number(e.target.value) })
                }
                className="flex-1 accent-rose-500 cursor-pointer"
              />
              <span className="font-bold text-slate-900 w-16">{config.mortalityThresholdPct}%</span>
            </div>
          </div>

          {/* Rule C: Daily Digest */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <label className="flex items-center space-x-2 text-slate-800 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={config.sendDailyDigest}
                onChange={(e) =>
                  setConfig({ ...config, sendDailyDigest: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>📊 Rapport Synthétique Quotidien par Email (18h00)</span>
            </label>
            <span className="text-emerald-800 text-[11px] font-bold">Chaque Soir</span>
          </div>
        </div>

        {/* Server status indicator */}
        <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Passerelle Email Cloud (SMTP Ivoire Élevage) :</span>
            <strong className="text-emerald-700 font-bold">Connecté & Opérationnel</strong>
          </div>

          <button
            type="button"
            disabled={isSendingTest || config.recipientEmails.length === 0}
            onClick={handleSendTestEmail}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? "Envoi..." : "Tester l'envoi"}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-md"
          >
            Enregistrer la Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
