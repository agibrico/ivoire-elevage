import React, { useState, useEffect } from "react";
import { VaccineSchedule, DailyTask, UnitCosts } from "../types";
import { getApiUrl } from "../utils/api";
import { BatchMedicalTracker } from "./BatchMedicalTracker";
import { MedicationStockManagement } from "./MedicationStockManagement";
import {
  defaultVaccineSchedules,
  defaultDailyTasks,
} from "../data/tasksAndVaccinesData";
import {
  Syringe,
  CheckSquare,
  Clock,
  AlertTriangle,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Bot,
  User,
  Filter,
  ArrowRight,
  Droplets,
  Pill,
  Box,
  Tag,
  Search,
  Check,
  RefreshCw,
  Building,
  Zap,
  FileText,
  Printer,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Smartphone,
  Settings,
  Trash2,
  Radio,
  HeartPulse,
} from "lucide-react";

interface TasksAndHealthViewProps {
  unitCosts: UnitCosts;
  onOpenAIAdvisor?: (prompt?: string, analysisType?: "general" | "sanitary_preventive_audit") => void;
}

export const TasksAndHealthView: React.FC<TasksAndHealthViewProps> = ({ unitCosts, onOpenAIAdvisor }) => {
  // Navigation sub-tab
  const [activeTab, setActiveTab] = useState<"vaccines" | "tasks" | "medical_history" | "meds_stock" | "ai">("vaccines");


  // Filter State
  const [speciesFilter, setSpeciesFilter] = useState<"Tous" | "Aviculture" | "Porciculture">("Tous");
  const [vaccineStatusFilter, setVaccineStatusFilter] = useState<
    "Tous" | "Alerte J-5" | "Planifié" | "Réalisé"
  >("Tous");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("Toutes");

  // Main Data States
  const [vaccines, setVaccines] = useState<VaccineSchedule[]>(defaultVaccineSchedules);
  const [tasks, setTasks] = useState<DailyTask[]>(defaultDailyTasks);

  // Modals State
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRouteSheetPdfOpen, setIsRouteSheetPdfOpen] = useState(false);

  // Quick Touch Sanitary Event Entry State (Tablet & Mobile Optimized)
  const [quickEventType, setQuickEventType] = useState<
    "Vaccination" | "Soin & Médication" | "Mortalité" | "Nettoyage & Biosécurité" | "Alimentation"
  >("Vaccination");
  const [quickPreset, setQuickPreset] = useState<string>("Vaccin Gumboro (Eau de boisson)");
  const [quickLocation, setQuickLocation] = useState<string>("Bâtiment A Volailles");
  const [quickHeadCount, setQuickHeadCount] = useState<number>(1);
  const [quickMortalityCause, setQuickMortalityCause] = useState<string>("Stress thermique");
  const [quickAssigned, setQuickAssigned] = useState<string>("Kouassi (Technicien)");
  const [quickNotes, setQuickNotes] = useState<string>("");

  // Voice Dictation (Reconnaissance Vocale Terrain) State
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionInstance, setSpeechRecognitionInstance] = useState<any>(null);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState<string | null>(null);

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      simulateVoiceDictation("SpeechRecognition non supporté nativement - Démarrage du mode simulation vocale terrain.");
      return;
    }

    try {
      if (speechRecognitionInstance) {
        try { speechRecognitionInstance.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusMsg("🎙️ Enregistrement vocal actif... Parlez clairement.");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuickNotes(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Erreur reconnaissance vocale:", event.error);
        setIsListening(false);
        setVoiceStatusMsg(`⚠️ Micro indisponible (${event.error}) - Bascule en simulation vocale.`);
        simulateVoiceDictation("Fallback simulation vocal suite à l'erreur micro");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setSpeechRecognitionInstance(recognition);
    } catch (err) {
      console.error("Échec lancement SpeechRecognition:", err);
      simulateVoiceDictation("Lancement mode simulation vocale");
    }
  };

  const stopVoiceDictation = () => {
    if (speechRecognitionInstance) {
      try {
        speechRecognitionInstance.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setVoiceStatusMsg("⏹️ Dictée vocale terminée.");
    setTimeout(() => setVoiceStatusMsg(null), 3000);
  };

  const simulateVoiceDictation = (reason?: string) => {
    setIsListening(true);
    setVoiceStatusMsg("🎙️ [Mode Test Vocale Terrain] Simulation de la dictée vocale de l'agent...");

    const sampleDictations = [
      "Rapport Sanitaire Bâtiment A : 2 poulets chétifs isolés, aucune mortalité observée, rappel vaccin Gumboro effectué dans l'eau de boisson.",
      "Inspection Maternité Porcine : Portée sous truie T-01 en excellente santé, distribution de fer dextran 200mg terminée à 08h30.",
      "Relevé Biosécurité : Pédiluve rechargé avec solution antiseptique, curage lisier accompli sans anomalie.",
      "Alerte Terrain : Consommation d'eau légèrement supérieure sur le lot volailles B, distribution de soluté d'électrolytes anti-stress.",
    ];

    const chosenText = sampleDictations[Math.floor(Math.random() * sampleDictations.length)];
    let currentLen = 0;

    const timer = setInterval(() => {
      if (currentLen <= chosenText.length) {
        setQuickNotes(chosenText.substring(0, currentLen));
        currentLen++;
      } else {
        clearInterval(timer);
        setIsListening(false);
        setVoiceStatusMsg("✅ Dictée vocale simulée avec succès et insérée dans les notes !");
        setTimeout(() => setVoiceStatusMsg(null), 4000);
      }
    }, 25);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nowTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    let fullTaskTitle = "";
    let cat: DailyTask["category"] = "Sanitaire & Hygiène";

    if (quickEventType === "Vaccination") {
      fullTaskTitle = `💉 [Saisie Rapide] ${quickPreset}`;
    } else if (quickEventType === "Soin & Médication") {
      fullTaskTitle = `🩺 [Soin Rapide] ${quickPreset}`;
    } else if (quickEventType === "Mortalité") {
      fullTaskTitle = `⚠️ [Relevé Mortalité] ${quickHeadCount} sujet(s) - Cause: ${quickMortalityCause}`;
    } else if (quickEventType === "Nettoyage & Biosécurité") {
      fullTaskTitle = `🧹 [Biosécurité] ${quickPreset}`;
    } else {
      fullTaskTitle = `🌾 [Alimentation] ${quickPreset}`;
      cat = "Alimentation";
    }

    const newTask: DailyTask = {
      id: `task-quick-${Date.now()}`,
      taskName: fullTaskTitle,
      scheduledTime: nowTime,
      species: quickLocation.includes("Porc") || quickLocation.includes("Maternité") ? "Porciculture" : "Aviculture",
      batchOrLocation: quickLocation,
      category: cat,
      assignedTo: quickAssigned,
      recurrence: "Ponctuel",
      isCompletedToday: true,
      completedAt: nowTime,
      notes: quickNotes || "Saisie rapide sur tablette/mobile",
    };

    setTasks([newTask, ...tasks]);
    showToast(`⚡ Événement sanitaire enregistré ! (${fullTaskTitle})`);
    setQuickNotes("");
  };

  // Automatic Birth-Date Vaccine Schedule Generator State
  const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);
  const [autoBatchName, setAutoBatchName] = useState("Bande Poulets Chair #2026-B05");
  const [autoSpecies, setAutoSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [autoBirthDate, setAutoBirthDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [autoHeadcount, setAutoHeadcount] = useState(1000);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };

  // --- SERVICE DE NOTIFICATION LOCALE & ALERTES SANITAIRES ---
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isLocalNotifEnabled, setIsLocalNotifEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("ivoire_sanitary_notif_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("ivoire_sanitary_notif_sound");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "denied";
  });
  const [notifHistory, setNotifHistory] = useState<
    Array<{
      id: string;
      timestamp: string;
      title: string;
      body: string;
      type: "vaccine" | "task" | "test";
      critical: boolean;
    }>
  >(() => {
    const saved = localStorage.getItem("ivoire_sanitary_notif_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Save Preferences to LocalStorage
  useEffect(() => {
    localStorage.setItem("ivoire_sanitary_notif_enabled", JSON.stringify(isLocalNotifEnabled));
  }, [isLocalNotifEnabled]);

  useEffect(() => {
    localStorage.setItem("ivoire_sanitary_notif_sound", JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem("ivoire_sanitary_notif_history", JSON.stringify(notifHistory.slice(0, 20)));
  }, [notifHistory]);

  // Audio Chime Synthesizer using Web Audio API
  const playSanitaryAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1 (E5 - 659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2 (A5 - 880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.2);
      gain2.gain.setValueAtTime(0.4, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn("Échec de génération du signal sonore d'alerte:", e);
    }
  };

  // Dispatch Local Notification (System Web Notification + Audio Chime + In-App Toast)
  const triggerSanitaryLocalNotification = (
    title: string,
    body: string,
    type: "vaccine" | "task" | "test" = "vaccine",
    skipSound: boolean = false
  ) => {
    if (!isLocalNotifEnabled && type !== "test") return;

    // 1. Play Audio Alarm if enabled
    if (isSoundEnabled && !skipSound) {
      playSanitaryAudioChime();
    }

    // 2. Native Web Browser / System Notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag: `sanitary-notif-${type}`,
        });
      } catch (err) {
        console.warn("Erreur d'affichage notification système Web:", err);
      }
    }

    // 3. Log to History & Show Toast
    const nowStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const newEntry = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      title,
      body,
      type,
      critical: type === "vaccine" || title.includes("🚨") || title.includes("CRITIQUE"),
    };

    setNotifHistory((prev) => [newEntry, ...prev.slice(0, 19)]);
    showToast(`${title} : ${body}`);
  };

  // Request Native Browser Permissions
  const handleRequestNotifPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("⚠️ Les notifications natives du navigateur ne sont pas supportées sur cet appareil. Vos alerte sonores et visuelles restent 100% actives.");
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === "granted") {
        showToast("🔔 Notifications système navigateur autorisées avec succès !");
        triggerSanitaryLocalNotification(
          "🚨 Service de Notification Sanitaire Activé",
          "Vous recevrez désormais les alerte système à J-5 pour vos vaccins et tâches critiques.",
          "test"
        );
      } else if (res === "denied") {
        showToast("⚠️ Notifications système bloquées dans le navigateur. L'alarme sonore et les bannière in-app restent actives.");
      }
    } catch (e) {
      console.error("Erreur lors de la demande de permission:", e);
    }
  };

  // Scan & Trigger Notifications for Critical Sanitary Deadlines
  const handleScanSanitaryDeadlines = (manualClick: boolean = false) => {
    const urgentCount = urgentVaccines.length;
    const criticalTasks = tasks.filter(
      (t) => !t.isCompletedToday && (t.category === "Sanitaire & Hygiène" || t.aiPriorityTag === "CRITIQUE SANITAIRE")
    );

    if (urgentCount === 0 && criticalTasks.length === 0) {
      if (manualClick) {
        triggerSanitaryLocalNotification(
          "✅ Aucune Échéance Sanitaire Critique",
          "Tous les vaccins à J-5 et tâches de biosécurité du jour sont sous contrôle !",
          "test"
        );
      }
      return;
    }

    let msgBody = "";
    if (urgentCount > 0 && criticalTasks.length > 0) {
      msgBody = `🚨 ${urgentCount} rappel(s) de vaccin sous 5 jours à préparer et ${criticalTasks.length} tâche(s) de biosécurité en attente !`;
    } else if (urgentCount > 0) {
      msgBody = `🚨 ${urgentCount} vaccin(s) arrivant à échéance dans moins de 5 jours. Veuillez vérifier les doses et préparer le matériel.`;
    } else {
      msgBody = `⚠️ ${criticalTasks.length} tâche(s) sanitaire(s) urgente(s) non réalisée(s) aujourd'hui.`;
    }

    triggerSanitaryLocalNotification("🚨 Alerte Sanitaire & Prophylaxie", msgBody, "vaccine");
  };

  // Auto Scan on initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      const lastScan = localStorage.getItem("ivoire_sanitary_last_scan_date");
      const todayStr = new Date().toISOString().split("T")[0];
      if (
        lastScan !== todayStr &&
        (urgentVaccines.length > 0 || tasks.some((t) => !t.isCompletedToday && t.category === "Sanitaire & Hygiène"))
      ) {
        handleScanSanitaryDeadlines(false);
        localStorage.setItem("ivoire_sanitary_last_scan_date", todayStr);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateBirthDateSchedule = () => {
    if (!autoBatchName.trim() || !autoBirthDate) return;

    const birthDateObj = new Date(autoBirthDate);

    const addDays = (baseDate: Date, days: number): string => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    };

    let newVaccines: VaccineSchedule[] = [];

    if (autoSpecies === "Aviculture") {
      newVaccines = [
        {
          id: `vac-auto-${Date.now()}-1`,
          batchName: autoBatchName,
          species: "Aviculture",
          vaccineName: "HB1 + H120 (Newcastle & Bronchite)",
          diseaseTarget: "Newcastle & Bronchite Infectieuse",
          scheduledAgeDaysOrWeeks: 1,
          scheduledAgeLabel: "Jour 1 (Éclosion)",
          scheduledDate: addDays(birthDateObj, 1),
          administrationRoute: "Goutte oculaire / Spray",
          dosageNotes: `1 dose / poussin sur le lot de ${autoHeadcount} sujets. Reconstituer avec eau distillée.`,
          status: getDaysRemaining(addDays(birthDateObj, 1)) <= 5 && getDaysRemaining(addDays(birthDateObj, 1)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-2`,
          batchName: autoBatchName,
          species: "Aviculture",
          vaccineName: "Gumboro Intermédiaire (Dose 1)",
          diseaseTarget: "Maladie de Gumboro (IBD)",
          scheduledAgeDaysOrWeeks: 7,
          scheduledAgeLabel: "Jour 7 (S1)",
          scheduledDate: addDays(birthDateObj, 7),
          administrationRoute: "Eau de boisson",
          dosageNotes: "Couper l'eau 2h avant. Diluer dans l'eau sans chlore avec 2.5g/L de lait écrémé.",
          status: getDaysRemaining(addDays(birthDateObj, 7)) <= 5 && getDaysRemaining(addDays(birthDateObj, 7)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-3`,
          batchName: autoBatchName,
          species: "Aviculture",
          vaccineName: "Gumboro Intermédiaire (Rappel Dose 2)",
          diseaseTarget: "Maladie de Gumboro (Rappel)",
          scheduledAgeDaysOrWeeks: 14,
          scheduledAgeLabel: "Jour 14 (S2)",
          scheduledDate: addDays(birthDateObj, 14),
          administrationRoute: "Eau de boisson",
          dosageNotes: "Distribution le matin à la fraîche. Vérifier l'imbibition du lot.",
          status: getDaysRemaining(addDays(birthDateObj, 14)) <= 5 && getDaysRemaining(addDays(birthDateObj, 14)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-4`,
          batchName: autoBatchName,
          species: "Aviculture",
          vaccineName: "Newcastle LaSota + Bronchite (Rappel)",
          diseaseTarget: "Newcastle & Bronchite",
          scheduledAgeDaysOrWeeks: 21,
          scheduledAgeLabel: "Jour 21 (S3)",
          scheduledDate: addDays(birthDateObj, 21),
          administrationRoute: "Eau de boisson",
          dosageNotes: "Eau fraîche distribuée en moins de 1h30.",
          status: getDaysRemaining(addDays(birthDateObj, 21)) <= 5 && getDaysRemaining(addDays(birthDateObj, 21)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-5`,
          batchName: autoBatchName,
          species: "Aviculture",
          vaccineName: "Déparasitage Interne + Vitamines Antistress",
          diseaseTarget: "Ascaris / Helminthes & Relance Croissance",
          scheduledAgeDaysOrWeeks: 28,
          scheduledAgeLabel: "Jour 28 (S4)",
          scheduledDate: addDays(birthDateObj, 28),
          administrationRoute: "Eau de boisson",
          dosageNotes: "Traitement vermifuge de 24h suivi de 3 jours de polyvitamines.",
          status: getDaysRemaining(addDays(birthDateObj, 28)) <= 5 && getDaysRemaining(addDays(birthDateObj, 28)) >= 0 ? "Alerte J-5" : "Planifié",
        },
      ];
    } else {
      newVaccines = [
        {
          id: `vac-auto-${Date.now()}-1`,
          batchName: autoBatchName,
          species: "Porciculture",
          vaccineName: "Fer Dextran 200mg + Soins Cordon",
          diseaseTarget: "Anémie néonatale du porcelet",
          scheduledAgeDaysOrWeeks: 3,
          scheduledAgeLabel: "Jour 3 (Maternité)",
          scheduledDate: addDays(birthDateObj, 3),
          administrationRoute: "Injection IM / SC",
          dosageNotes: `2ml par porcelet en IM profonde au niveau du cou sur ${autoHeadcount} suj.`,
          status: getDaysRemaining(addDays(birthDateObj, 3)) <= 5 && getDaysRemaining(addDays(birthDateObj, 3)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-2`,
          batchName: autoBatchName,
          species: "Porciculture",
          vaccineName: "Mycoplasma Hyopneumoniae (Dose 1)",
          diseaseTarget: "Pneumonie Enzootique Porcine",
          scheduledAgeDaysOrWeeks: 14,
          scheduledAgeLabel: "Jour 14 (Sevrage)",
          scheduledDate: addDays(birthDateObj, 14),
          administrationRoute: "Injection IM / SC",
          dosageNotes: "2ml par sujet en IM. Aiguille 16mm stérilisée.",
          status: getDaysRemaining(addDays(birthDateObj, 14)) <= 5 && getDaysRemaining(addDays(birthDateObj, 14)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-3`,
          batchName: autoBatchName,
          species: "Porciculture",
          vaccineName: "Parvovirose + Erysipèle (Rouget)",
          diseaseTarget: "Rouget Porcin & Parvovirose",
          scheduledAgeDaysOrWeeks: 21,
          scheduledAgeLabel: "Jour 21 (S3)",
          scheduledDate: addDays(birthDateObj, 21),
          administrationRoute: "Injection IM / SC",
          dosageNotes: "2ml par sujet en IM. Conserver la chaîne du froid à +4°C.",
          status: getDaysRemaining(addDays(birthDateObj, 21)) <= 5 && getDaysRemaining(addDays(birthDateObj, 21)) >= 0 ? "Alerte J-5" : "Planifié",
        },
        {
          id: `vac-auto-${Date.now()}-4`,
          batchName: autoBatchName,
          species: "Porciculture",
          vaccineName: "Rappel Mycoplasme + Vermifuge Ivermectine",
          diseaseTarget: "Mycoplasme & Parasites Internes",
          scheduledAgeDaysOrWeeks: 28,
          scheduledAgeLabel: "Jour 28 (Post-Sevrage)",
          scheduledDate: addDays(birthDateObj, 28),
          administrationRoute: "Injection IM / SC",
          dosageNotes: "1ml/33kg IM de Vermifuge + 2ml Rappel Mycoplasme.",
          status: getDaysRemaining(addDays(birthDateObj, 28)) <= 5 && getDaysRemaining(addDays(birthDateObj, 28)) >= 0 ? "Alerte J-5" : "Planifié",
        },
      ];
    }

    setVaccines((prev) => [...newVaccines, ...prev]);
    setIsAutoScheduleModalOpen(false);
    showToast(`✅ Calendrier sanitaire calculé et injecté pour le lot "${autoBatchName}" ! (${newVaccines.length} rappels programmé(s))`);
  };

  // Vaccine Form State
  const [vacBatch, setVacBatch] = useState("Bande Poulets #1 - Bâtiment A");
  const [vacSpecies, setVacSpecies] = useState<"Aviculture" | "Porciculture">("Aviculture");
  const [vacName, setVacName] = useState("");
  const [vacTarget, setVacTarget] = useState("");
  const [vacAge, setVacAge] = useState(14);
  const [vacDate, setVacDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  });
  const [vacRoute, setVacRoute] = useState<
    "Eau de boisson" | "Injection IM / SC" | "Goutte oculaire / Spray" | "Trempage / Inhalation"
  >("Eau de boisson");
  const [vacDosage, setVacDosage] = useState("");

  // Task Form State
  const [taskName, setTaskName] = useState("");
  const [taskTime, setTaskTime] = useState("08:00");
  const [taskSpecies, setTaskSpecies] = useState<"Aviculture" | "Porciculture" | "Global">("Global");
  const [taskLocation, setTaskLocation] = useState("Bâtiment Volailles A");
  const [taskCategory, setTaskCategory] = useState<
    "Alimentation" | "Sanitaire & Hygiène" | "Relevés & Pesées" | "Maintenance & Matériel"
  >("Sanitaire & Hygiène");
  const [taskAssigned, setTaskAssigned] = useState("Kouassi (Technicien)");
  const [taskRecurrence, setTaskRecurrence] = useState<
    "Quotidien (2x/jour)" | "Quotidien (Matin)" | "Hebdomadaire" | "Ponctuel"
  >("Quotidien (Matin)");
  const [taskNotes, setTaskNotes] = useState("");

  // AI Assistant State
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customAiQuery, setCustomAiQuery] = useState("");

  // AI Task Prioritization State
  const [isAiPrioritizing, setIsAiPrioritizing] = useState(false);
  const [aiPrioritized, setAiPrioritized] = useState(false);
  const [aiSummaryRationale, setAiSummaryRationale] = useState<string | null>(null);

  // Helper to calculate days remaining until vaccine
  const getDaysRemaining = (scheduledDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(scheduledDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Identify Vaccines Triggering the 5-Day Alert
  const urgentVaccines = vaccines.filter((v) => {
    if (v.status === "Réalisé") return false;
    const daysLeft = getDaysRemaining(v.scheduledDate);
    return daysLeft >= 0 && daysLeft <= 5;
  });

  // AI Automatic Task Prioritization Handler
  const handleAiPrioritizeTasks = async () => {
    setIsAiPrioritizing(true);

    try {
      const hasUrgentVaccines = urgentVaccines.length > 0;

      const prioritizedTasks: DailyTask[] = tasks.map((t) => {
        let rank = 10;
        let tag: "CRITIQUE SANITAIRE" | "HAUTE PRIORITÉ" | "ROUTINE OPTIMISÉE" | "NORMAL" = "NORMAL";
        let reason = "";
        let newTime = t.scheduledTime;
        let newStaff = t.assignedTo;

        const nameLower = t.taskName.toLowerCase();
        const isSanitary =
          t.category === "Sanitaire & Hygiène" ||
          nameLower.includes("vaccin") ||
          nameLower.includes("mortalité") ||
          nameLower.includes("soin") ||
          nameLower.includes("nettoyage");

        if (isSanitary) {
          if (hasUrgentVaccines || nameLower.includes("vaccin") || nameLower.includes("mortalité")) {
            rank = 1;
            tag = "CRITIQUE SANITAIRE";
            newTime = "06:15";
            newStaff = "Kouassi (Technicien Chef)";
            reason = "🚨 Urgence Sanitaire : Préparation du vaccin et contrôle des constantes à l'ouverture du bâtiment avant la chaleur.";
          } else {
            rank = 2;
            tag = "CRITIQUE SANITAIRE";
            newTime = "07:00";
            newStaff = "Dr. Yao (Vétérinaire Conseil)";
            reason = "🛡️ Biosécurité : Désinfection des canalisations & sas sanitaires priorisés en début de service.";
          }
        } else if (t.category === "Alimentation") {
          rank = 3;
          tag = "HAUTE PRIORITÉ";
          if (t.scheduledTime.startsWith("0") || t.scheduledTime.startsWith("1")) {
            newTime = "06:45";
            newStaff = "Yao (Soigneur Volailles)";
            reason = "🌾 Rationnement Matinal : Distribution d'aliment frais avant la montée thermique de 09h00 pour maximiser l'ingestion.";
          } else {
            newTime = "16:30";
            newStaff = "Soro (Porciculture)";
            reason = "🌾 Rationnement du Soir : Repas de fin de journée distribué après nettoyage des auges.";
          }
        } else if (t.category === "Relevés & Pesées") {
          rank = 5;
          tag = "ROUTINE OPTIMISÉE";
          newTime = "06:00";
          newStaff = "Kouassi (Technicien Chef)";
          reason = "📊 Relevé à Jeûn : Prise de température ambiante & comptage des effectifs dès l'aube.";
        } else {
          rank = 7;
          tag = "ROUTINE OPTIMISÉE";
          newTime = "11:00";
          newStaff = "Soro (Responsable Porciculture)";
          reason = "🔧 Maintenance & Nettoyage : Intervention planifiée sur créneau d'heures creuses.";
        }

        return {
          ...t,
          scheduledTime: newTime,
          assignedTo: newStaff,
          aiPriorityRank: rank,
          aiPriorityTag: tag,
          aiReasoning: reason,
        };
      });

      // Sort tasks by aiPriorityRank ascending
      prioritizedTasks.sort((a, b) => (a.aiPriorityRank || 99) - (b.aiPriorityRank || 99));

      setTasks(prioritizedTasks);
      setAiPrioritized(true);

      // Call AI Advisor for custom narrative rationale
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Génère une synthèse de réorganisation automatique des tâches d'élevage d'Ivoire Élevage. Explique comment les impératifs sanitaires (rappels vaccins, biosécurité) et la disponibilité du personnel (Kouassi, Yao, Soro, Dr. Yao) ont été optimisés pour éviter le stress thermique.`,
          context: { urgentVaccinesCount: urgentVaccines.length, totalTasksCount: prioritizedTasks.length },
        }),
      });

      const data = await res.json();
      setAiSummaryRationale(
        data.answer ||
          "🤖 Priorisation Automatique IA Effectuée : Tâches sanitaires critiques réorganisées en première heure (06h00-07h00) pour sécuriser les rappels de vaccin J-5. Rationnement matinal avancé à 06h45 pour éviter le coup de chaleur. Charge de travail équilibrée entre Kouassi, Yao et Soro."
      );
    } catch (err) {
      console.error("AI Priority error:", err);
      setAiSummaryRationale(
        "🤖 Priorisation Automatique IA Effectuée : Tâches sanitaires critiques et rappels vaccins replacés à 06h15-07h00. Planning réorganisé avec succès."
      );
    } finally {
      setIsAiPrioritizing(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.isCompletedToday;
          const nowStr = new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            ...t,
            isCompletedToday: nextState,
            completedAt: nextState ? nowStr : undefined,
          };
        }
        return t;
      })
    );
  };

  // Mark Vaccine as Completed
  const handleMarkVaccineCompleted = (vacId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setVaccines(
      vaccines.map((v) => {
        if (v.id === vacId) {
          return {
            ...v,
            status: "Réalisé",
            completedDate: todayStr,
            veterinaryNotes: "Vaccination validée et enregistrée au registre sanitaire.",
          };
        }
        return v;
      })
    );
  };

  // Submit New Vaccine
  const handleAddVaccineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const daysLeft = getDaysRemaining(vacDate);
    let initStatus: VaccineSchedule["status"] = "Planifié";
    if (daysLeft >= 0 && daysLeft <= 5) {
      initStatus = "Alerte J-5";
    } else if (daysLeft < 0) {
      initStatus = "En retard";
    }

    const newVac: VaccineSchedule = {
      id: `vac-${Date.now()}`,
      batchName: vacBatch,
      species: vacSpecies,
      vaccineName: vacName || "Vaccin Sanitaire",
      diseaseTarget: vacTarget || "Maladie Virale",
      scheduledAgeDaysOrWeeks: vacAge,
      scheduledAgeLabel: vacSpecies === "Aviculture" ? `Jour ${vacAge}` : `Semaine ${vacAge}`,
      scheduledDate: vacDate,
      administrationRoute: vacRoute,
      dosageNotes: vacDosage || "Dose standard selon prescription du vétérinaire.",
      status: initStatus,
    };

    setVaccines([newVac, ...vaccines]);
    setIsVaccineModalOpen(false);
    setVacName("");
    setVacTarget("");
  };

  // Submit New Task
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      taskName: taskName || "Tâche Sanitaire",
      scheduledTime: taskTime,
      species: taskSpecies,
      batchOrLocation: taskLocation,
      category: taskCategory,
      assignedTo: taskAssigned,
      recurrence: taskRecurrence,
      isCompletedToday: false,
      notes: taskNotes,
    };

    // Sort tasks by scheduled time
    const updated = [...tasks, newTask].sort((a, b) =>
      a.scheduledTime.localeCompare(b.scheduledTime)
    );

    setTasks(updated);
    setIsTaskModalOpen(false);
    setTaskName("");
    setTaskNotes("");
  };

  // Consultation AI
  const handleConsultAiHealth = async (prompt?: string) => {
    setIsAiLoading(true);
    setAiAdvice(null);

    const defaultPrompt = `Génère un protocole de prophylaxie sanitaire et un calendrier de vaccination complet pour la ferme Ivoire Élevage :
- Prochaines alertes vaccins : ${urgentVaccines.length} vaccin(s) prévus sous 5 jours.
- Liste des vaccins urgents : ${urgentVaccines.map((v) => `${v.vaccineName} (${v.species}) pour le ${v.scheduledDate}`).join(", ")}
- Nombre de tâches quotidiennes enregistrées : ${tasks.length} tasks (${tasks.filter((t) => t.isCompletedToday).length} réalisées aujourd'hui).

Fournis :
1. Les consignes de préparation biologique 5 jours AVANT la vaccination (coupure d'eau, neutralisation du chlore, hépatoprotecteur).
2. Un contrôle des règles d'hygiène et de biosécurité pour éviter la contamination croisée entre le secteur avicole et le secteur porcin.
3. Des recommandations sur le timing des tâches quotidiennes pour maximiser la vitesse de croissance et réduire le stress des animaux.`;

    try {
      const res = await fetch(getApiUrl("/api/ai/advisor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || defaultPrompt,
          context: { urgentVaccinesCount: urgentVaccines.length, totalTasks: tasks.length },
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setAiAdvice(data.answer);
      } else {
        setAiAdvice(data.error || "Erreur de réponse du serveur IA.");
      }
    } catch (err: any) {
      setAiAdvice("Erreur d'accès à l'IA : " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered Vaccine List
  const filteredVaccines = vaccines.filter((v) => {
    const matchSpecies = speciesFilter === "Tous" || v.species === speciesFilter;
    const daysLeft = getDaysRemaining(v.scheduledDate);
    const isAlert = daysLeft >= 0 && daysLeft <= 5 && v.status !== "Réalisé";

    if (!matchSpecies) return false;

    if (vaccineStatusFilter === "Alerte J-5") return isAlert;
    if (vaccineStatusFilter === "Planifié") return v.status === "Planifié" && !isAlert;
    if (vaccineStatusFilter === "Réalisé") return v.status === "Réalisé";

    return true;
  });

  // Filtered Task List
  const filteredTasks = tasks.filter((t) => {
    const matchSpecies = speciesFilter === "Tous" || t.species === speciesFilter || t.species === "Global";
    const matchCat = taskCategoryFilter === "Toutes" || t.category === taskCategoryFilter;
    return matchSpecies && matchCat;
  });

  // Calculation of task completion progress
  const completedTasksCount = tasks.filter((t) => t.isCompletedToday).length;
  const taskProgressPct = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wide">
                Sanitaire & Routine Quotidienne
              </span>
              <span className="text-slate-300 text-xs font-medium">• Prophylaxie Vétérinaire</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gestion des Vaccins & Tâches Quotidiennes Réglées
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Programmez vos rappels de vaccination avec alertes automatiques 5 jours à l'avance, et planifiez les horaires précis des tâches d'élevage (alimentation, soins, hygiène).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-amber-500/40 relative"
            >
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Alertes Sanitaires ({urgentVaccines.length})</span>
              {isLocalNotifEnabled && (
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute -top-1 -right-1"></span>
              )}
            </button>

            <button
              onClick={() => {
                if (onOpenAIAdvisor) {
                  onOpenAIAdvisor(
                    "Effectuer une analyse préventive approfondie des cycles sanitaires en croisant le Journal d'Audit (Audit Log) et le Suivi Sanitaire (Vaccins, Tâches & Pharmacie).",
                    "sanitary_preventive_audit"
                  );
                }
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-400/40"
            >
              <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>🤖 Optimisation Sanitaire Gemini</span>
            </button>

            <button
              onClick={handleAiPrioritizeTasks}
              disabled={isAiPrioritizing}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-purple-300/40 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isAiPrioritizing ? "Priorisation IA..." : "⚡ Priorisation IA Tâches"}</span>
            </button>

            <button
              onClick={() => setIsVaccineModalOpen(true)}
              className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Syringe className="w-4 h-4" />
              <span>Programmer un Vaccin</span>
            </button>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Tâche Quotidienne</span>
            </button>

            <button
              onClick={() => setActiveTab("meds_stock")}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
            >
              <Pill className="w-4 h-4" />
              <span>Pharmacie & Stocks Lots</span>
            </button>

            <button
              onClick={() => setIsRouteSheetPdfOpen(true)}
              className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-500/40"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>📄 Feuille de Route PDF (Terrain)</span>
            </button>

          </div>
        </div>

        {/* Global Species Filter Bar */}
        <div className="mt-6 pt-4 border-t border-rose-900/60 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="text-rose-200">Filtre par élevage :</span>
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-rose-900/50">
              <button
                onClick={() => setSpeciesFilter("Tous")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  speciesFilter === "Tous"
                    ? "bg-rose-500 text-slate-950 font-extrabold"
                    : "text-rose-200 hover:text-white"
                }`}
              >
                Tous les élevages
              </button>
              <button
                onClick={() => setSpeciesFilter("Aviculture")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  speciesFilter === "Aviculture"
                    ? "bg-rose-500 text-slate-950 font-extrabold"
                    : "text-rose-200 hover:text-white"
                }`}
              >
                🐔 Aviculture
              </button>
              <button
                onClick={() => setSpeciesFilter("Porciculture")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  speciesFilter === "Porciculture"
                    ? "bg-rose-500 text-slate-950 font-extrabold"
                    : "text-rose-200 hover:text-white"
                }`}
              >
                🐖 Porciculture
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-rose-200 font-bold">
            <span className="bg-rose-900/80 px-3 py-1 rounded-lg border border-rose-700/50">
              🚨 {urgentVaccines.length} Vaccins à J-5
            </span>
            <span className="bg-emerald-900/80 px-3 py-1 rounded-lg border border-emerald-700/50 text-emerald-300">
              ✓ {completedTasksCount}/{tasks.length} Tâches effectuées
            </span>
          </div>
        </div>
      </div>

      {/* PROMINENT 5-DAY ALERT BANNER FOR UPCOMING VACCINES */}
      {urgentVaccines.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white rounded-2xl p-5 shadow-lg space-y-3 animate-pulse-subtle border-2 border-rose-400">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-rose-700 p-2.5 rounded-xl shadow">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-slate-950 text-amber-300 font-black rounded-full text-[10px] uppercase tracking-wider">
                    ALERTE SANITAIRE J-5
                  </span>
                  <span className="font-extrabold text-xs text-rose-100 uppercase tracking-wide">
                    Vaccinations imminentes dans moins de 5 jours
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {urgentVaccines.length} rappel(s) de vaccin à préparer immédiatement !
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsNotifModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <BellRing className="w-4 h-4" />
                <span>⚙️ Configurer Alertes & Alarme</span>
              </button>

              <button
                onClick={() => setActiveTab("vaccines")}
                className="bg-slate-950 hover:bg-slate-900 text-rose-300 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <span>Consulter le Répertoire des Vaccins</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
            {urgentVaccines.map((v) => {
              const daysLeft = getDaysRemaining(v.scheduledDate);
              return (
                <div
                  key={v.id}
                  className="bg-slate-950/80 p-3 rounded-xl border border-rose-400/50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-extrabold text-amber-300">{v.vaccineName}</div>
                    <div className="text-[11px] text-rose-200">
                      {v.batchName} ({v.species})
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                      Date : {v.scheduledDate} • {v.administrationRoute}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-black rounded-lg text-xs block">
                      {daysLeft === 0 ? "Aujourd'hui !" : `Dans ${daysLeft} jour(s)`}
                    </span>
                    <button
                      onClick={() => handleMarkVaccineCompleted(v.id)}
                      className="text-[10px] text-emerald-400 font-bold hover:underline mt-1 block"
                    >
                      ✓ Marquer Réalisé
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab("vaccines")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "vaccines"
                ? "border-rose-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Syringe className="w-4 h-4 text-rose-600" />
            <span>Calendrier & Suivi des Vaccins ({vaccines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "tasks"
                ? "border-rose-500 text-slate-950 bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Tâches Quotidiennes & Horaires ({completedTasksCount}/{tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("medical_history")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "medical_history"
                ? "border-emerald-500 text-slate-950 bg-emerald-50 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span>Suivi Médical par Lot & Cycle</span>
          </button>

          <button
            onClick={() => setActiveTab("meds_stock")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "meds_stock"
                ? "border-amber-500 text-slate-950 bg-amber-50 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Pill className="w-4 h-4 text-amber-600" />
            <span>Stock Pharmacie & Alertes Périssabilité</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ai"
                ? "border-rose-500 text-slate-950 bg-rose-50 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bot className="w-4 h-4 text-rose-600" />
            <span>Assistant IA Prophylaxie & Biosécurité</span>
          </button>
        </div>

        {/* SUB-TAB: SUIVI MEDICAL PAR LOT */}
        {activeTab === "medical_history" && (
          <div className="p-6">
            <BatchMedicalTracker />
          </div>
        )}

        {/* SUB-TAB: STOCK PHARMACIE & VACCINS */}
        {activeTab === "meds_stock" && (
          <div className="p-6">
            <MedicationStockManagement />
          </div>
        )}


        {/* SUB-TAB 1: CALENDRIER ET SUIVI DES VACCINS */}
        {activeTab === "vaccines" && (
          <div className="p-6 space-y-6">
            {/* TOAST NOTIFICATION POPUP */}
            {toastNotification && (
              <div className="bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-xl border border-amber-500/40 flex items-center justify-between text-xs font-bold animate-bounce-short">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>{toastNotification}</span>
                </div>
                <button
                  onClick={() => setToastNotification(null)}
                  className="text-slate-400 hover:text-white font-black ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* AUTOMATIC ARRIVAL-DATE VACCINE SCHEDULE CALCULATOR TOOL */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                      <span>Outil de Gestion du Calendrier Vaccinal & Rappels Automatiques</span>
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Calcul par Date d'Arrivée
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sélectionnez la date d'arrivée ou d'éclosion du lot pour calculer les dates exactes des rappels prophylactiques.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAutoScheduleModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ouvrir en Grand Format</span>
                </button>
              </div>

              {/* Interactive Quick Form inside Vaccine View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">1. Espèce / Spéculation :</label>
                  <select
                    value={autoSpecies}
                    onChange={(e) => setAutoSpecies(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
                  >
                    <option value="Aviculture">🐔 Aviculture (Poussins / Volailles)</option>
                    <option value="Porciculture">🐖 Porciculture (Porcelets / Maternité)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    2. Date d'Arrivée / Éclosion :
                  </label>
                  <input
                    type="date"
                    value={autoBirthDate}
                    onChange={(e) => setAutoBirthDate(e.target.value)}
                    className="w-full p-2.5 border border-amber-300 bg-amber-50/50 rounded-xl font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">3. Code du Lot / Bâtiment :</label>
                  <input
                    type="text"
                    value={autoBatchName}
                    onChange={(e) => setAutoBatchName(e.target.value)}
                    placeholder="Ex: Lot Poussins Bâtiment A"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">4. Effectif (Sujets) :</label>
                  <input
                    type="number"
                    value={autoHeadcount}
                    onChange={(e) => setAutoHeadcount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Calculated Timeline Preview */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-amber-300 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Prévisualisation du Calendrier des Rappels ({autoSpecies}) :</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Départ : {new Date(autoBirthDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
                  {autoSpecies === "Aviculture" ? (
                    <>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-rose-400">J+1 (Hatching)</div>
                        <div className="font-bold text-white truncate">HB1 + H120</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 1)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-amber-400">J+7 (Semaine 1)</div>
                        <div className="font-bold text-white truncate">Gumboro Dose 1</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 6)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-rose-300">J+14 (Semaine 2)</div>
                        <div className="font-bold text-white truncate">Gumboro Rappel</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 7)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-emerald-300">J+21 (Semaine 3)</div>
                        <div className="font-bold text-white truncate">Newcastle LaSota</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 7)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-purple-300">J+28 (Semaine 4)</div>
                        <div className="font-bold text-white truncate">Vermifuge + Vitamines</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 7)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-rose-400">J+3 (Maternité)</div>
                        <div className="font-bold text-white truncate">Fer Dextran 200mg</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 3)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-amber-400">J+14 (Sevrage)</div>
                        <div className="font-bold text-white truncate">Mycoplasme Dose 1</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 11)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-rose-300">J+21 (Semaine 3)</div>
                        <div className="font-bold text-white truncate">Parvo + Erysipèle</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 7)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="font-black text-emerald-300">J+28 (Post-Sevrage)</div>
                        <div className="font-bold text-white truncate">Rappel + Vermifuge</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(new Date(autoBirthDate).setDate(new Date(autoBirthDate).getDate() + 7)).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateBirthDateSchedule}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <Syringe className="w-4 h-4 text-white" />
                    <span> Injecter ces Rappels dans le Calendrier Sanitaire</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AUTOMATIC BIRTH-DATE SCHEDULE GENERATOR BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-rose-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    CALENDRIER AUTOMATIQUE PAR DATE DE NAISSANCE
                  </span>
                  <span className="text-amber-300 text-xs font-bold">Rappels Précis</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Génération des Rappels Vaccinaux basés sur les Dates d'Éclosion / Mise bas
                </h3>
                <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
                  Saisissez la date de naissance d'un lot d'animaux pour calculer automatiquement l'ensemble du protocole prophylactique (J+1, J+7, J+14, J+21, J+28) et programmer les alertes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAutoScheduleModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <Calendar className="w-4 h-4 text-slate-950" />
                  <span>Générer un Calendrier par Date de Naissance</span>
                </button>

                <button
                  onClick={() => setIsVaccineModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs border border-white/20 transition-all cursor-pointer"
                >
                  + Vaccin Manuel
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-700">Filtrer par statut :</span>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 font-bold">
                  {(["Tous", "Alerte J-5", "Planifié", "Réalisé"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setVaccineStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        vaccineStatusFilter === st
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-slate-500 font-medium">
                Affichage de {filteredVaccines.length} vaccin(s) enregistré(s)
              </div>
            </div>

            {/* Vaccines Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVaccines.map((vac) => {
                const daysLeft = getDaysRemaining(vac.scheduledDate);
                const isAlert = daysLeft >= 0 && daysLeft <= 5 && vac.status !== "Réalisé";

                return (
                  <div
                    key={vac.id}
                    className={`bg-white p-5 rounded-2xl border transition-all space-y-3 relative ${
                      isAlert
                        ? "border-rose-500 shadow-md ring-2 ring-rose-300"
                        : vac.status === "Réalisé"
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-slate-100 text-slate-700">
                          {vac.species} • {vac.scheduledAgeLabel}
                        </span>
                        <h4 className="font-black text-slate-900 text-base mt-1">{vac.vaccineName}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          vac.status === "Réalisé"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : isAlert
                            ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                            : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        {vac.status === "Réalisé"
                          ? "Réalisé ✓"
                          : isAlert
                          ? `ALERTE J-${daysLeft}`
                          : "Planifié"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between text-slate-800 font-bold">
                        <span>Cible :</span>
                        <span>{vac.diseaseTarget}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bande concernée :</span>
                        <span className="font-semibold text-slate-900">{vac.batchName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mode d'administration :</span>
                        <span className="font-semibold text-rose-800">{vac.administrationRoute}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Date Prévue :</span>
                        <span className="font-mono font-bold text-slate-900">{vac.scheduledDate}</span>
                      </div>
                    </div>

                    {vac.dosageNotes && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                        <strong className="text-slate-800 block mb-0.5">Posologie & Préparation :</strong>
                        {vac.dosageNotes}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          showToast(
                            `📢 Rappel envoyé par SMS/Push à Kouassi (Technicien) pour le vaccin ${vac.vaccineName} (${vac.batchName}) !`
                          )
                        }
                        className="text-[10px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-all"
                      >
                        <Bell className="w-3 h-3 text-amber-600" />
                        <span>Envoyer Rappel</span>
                      </button>

                      {vac.status === "Réalisé" ? (
                        <div className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Fait le {vac.completedDate || "récemment"}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkVaccineCompleted(vac.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          Valider Injection
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: TÂCHES QUOTIDIENNES ET HORAIRES */}
        {activeTab === "tasks" && (
          <div className="p-6 space-y-6">
            {/* QUICK TOUCH SANITARY EVENT ENTRY (TABLET / MOBILE OPTIMIZED) */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border-2 border-rose-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-500 text-slate-950 rounded-xl font-black">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <span>Saisie Rapide d'Événements Sanitaires</span>
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase">
                        Mode Tactile Tablette & Mobile
                      </span>
                    </h3>
                    <p className="text-xs text-rose-200">
                      Enregistrez les soins, mortalités, nettoyages et vaccins réalisés aujourd'hui en 1 clic.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-rose-300 font-mono">
                  Saisie du : <strong className="text-amber-300">{new Date().toLocaleDateString("fr-FR")}</strong>
                </div>
              </div>

              <form onSubmit={handleQuickSubmit} className="space-y-4">
                {/* 1. Type Selector (Large Touch Target Chips) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase text-rose-200 tracking-wider">
                    1. Sélectionner le Type d'Événement Quotidien :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { type: "Vaccination", icon: "💉", label: "Vaccination" },
                      { type: "Soin & Médication", icon: "🩺", label: "Soin & Médic." },
                      { type: "Mortalité", icon: "⚠️", label: "Relevé Mortalité" },
                      { type: "Nettoyage & Biosécurité", icon: "🧹", label: "Nettoyage" },
                      { type: "Alimentation", icon: "🌾", label: "Aliment & Eau" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setQuickEventType(item.type as any);
                          if (item.type === "Vaccination") setQuickPreset("Vaccin Gumboro (Eau de boisson)");
                          else if (item.type === "Soin & Médication") setQuickPreset("Antibio Oxytétracycline (Inj.)");
                          else if (item.type === "Nettoyage & Biosécurité") setQuickPreset("Désinfection pédiluve & matériel");
                          else if (item.type === "Alimentation") setQuickPreset("Distribution ration + Électrolytes");
                        }}
                        className={`p-3 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[52px] border ${
                          quickEventType === item.type
                            ? "bg-amber-400 text-slate-950 border-white shadow-lg scale-[1.02]"
                            : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Quick Presets / Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-rose-900/50">
                  {/* Preset or Stepper details */}
                  {quickEventType === "Mortalité" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-300 block">
                        Nombre de Sujets Perdus & Cause Probable :
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setQuickHeadCount(Math.max(1, quickHeadCount - 1))}
                          className="w-11 h-11 bg-rose-800 hover:bg-rose-700 text-white font-black rounded-xl text-lg flex items-center justify-center cursor-pointer shrink-0"
                        >
                          -
                        </button>
                        <div className="bg-slate-900 border border-slate-700 px-5 py-2 rounded-xl text-center min-w-[80px]">
                          <span className="text-xl font-black text-rose-400">{quickHeadCount}</span>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Tête(s)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuickHeadCount(quickHeadCount + 1)}
                          className="w-11 h-11 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-lg flex items-center justify-center cursor-pointer shrink-0"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickHeadCount(quickHeadCount + 5)}
                          className="px-3 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          +5 sujets
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {["Stress thermique", "Écrasement", "Sujet chétif", "Inconnu"].map((cause) => (
                          <button
                            key={cause}
                            type="button"
                            onClick={() => setQuickMortalityCause(cause)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              quickMortalityCause === cause
                                ? "bg-rose-500 text-slate-950 font-black"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {cause}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-rose-200 block">
                        Sélectionner le Soin / Traitement Préréglé :
                      </label>
                      <select
                        value={quickPreset}
                        onChange={(e) => setQuickPreset(e.target.value)}
                        className="w-full bg-slate-900 text-white font-bold p-3 rounded-xl border border-slate-700 text-xs focus:ring-2 focus:ring-amber-400"
                      >
                        {quickEventType === "Vaccination" && (
                          <>
                            <option value="Vaccin Gumboro (Eau de boisson)">💉 Vaccin Gumboro (Eau de boisson - Dose 1/2)</option>
                            <option value="Vaccin HB1 + H120 (Newcastle & Bronchite)">💉 Vaccin HB1 + H120 (Goutte oculaire)</option>
                            <option value="Rappel Newcastle LaSota">💉 Rappel Newcastle LaSota (Eau sans chlore)</option>
                            <option value="Injection Fer Dextran 200mg (Maternité Porcine)">🐖 Injection Fer Dextran 200mg (Porcelets J3)</option>
                            <option value="Vaccin Mycoplasme Porcin">🐖 Vaccin Mycoplasme (Injection IM)</option>
                          </>
                        )}
                        {quickEventType === "Soin & Médication" && (
                          <>
                            <option value="Antibio Oxytétracycline 20% L.A.">🩺 Antibio Oxytétracycline (Traitement curatif)</option>
                            <option value="Vitamines Anti-stress (Post-vaccination)">💊 Polyvitamines Anti-stress (3 jours)</option>
                            <option value="Vermifuge Ivermectine">🪱 Vermifuge Ivermectine (Déparasitage interne)</option>
                            <option value="Traitement Antiseptique Plaies">🩹 Soin & Antiseptique Plaies/Cordon</option>
                          </>
                        )}
                        {quickEventType === "Nettoyage & Biosécurité" && (
                          <>
                            <option value="Désinfection pédiluve & matériel">🧹 Désinfection pédiluve & sas sanitaire</option>
                            <option value="Renouvellement litière fraîche">🌾 Changement litière copeaux de bois</option>
                            <option value="Curage & Nettoyage lisier">🧼 Curage lisier & lavage haute pression</option>
                            <option value="Vide sanitaire & Chaulage">🏛️ Vide sanitaire, lavage & chaulage murs</option>
                          </>
                        )}
                        {quickEventType === "Alimentation" && (
                          <>
                            <option value="Distribution ration + Électrolytes">🌾 Distribution ration quotidienne + Électrolytes</option>
                            <option value="Purge & Rincage conduites d'eau">💧 Purge & rinçage pipettes d'abreuvement</option>
                            <option value="Distribution aliment croissance">📦 Distribution aliment Croissance / Finition</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Location & Staff selectors */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-rose-200 block">
                      Localisation & Soignant Responsable :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={quickLocation}
                        onChange={(e) => setQuickLocation(e.target.value)}
                        className="bg-slate-900 text-white font-bold p-2.5 rounded-xl border border-slate-700 text-xs"
                      >
                        <option value="Bâtiment A Volailles">🐔 Bât. A Volailles</option>
                        <option value="Bâtiment B Volailles">🐔 Bât. B Volailles</option>
                        <option value="Maternité Porcine">🐖 Maternité Porcine</option>
                        <option value="Porcherie Engraissement">🐖 Porcherie Engraissement</option>
                        <option value="Magasin Stock Aliment">🏬 Magasin Aliment</option>
                      </select>

                      <select
                        value={quickAssigned}
                        onChange={(e) => setQuickAssigned(e.target.value)}
                        className="bg-slate-900 text-white font-bold p-2.5 rounded-xl border border-slate-700 text-xs"
                      >
                        <option value="Kouassi (Technicien)">Kouassi (Technicien)</option>
                        <option value="Yao (Régisseur)">Yao (Régisseur)</option>
                        <option value="Soro (Aide-Éleveur)">Soro (Aide-Éleveur)</option>
                        <option value="Dr. Yao (Vétérinaire)">Dr. Yao (Vétérinaire)</option>
                      </select>
                    </div>

                    {/* RECONNAISSANCE VOCALE TERRAIN (VOICE DICTATION FOR AGENTS) */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                          <Mic className="w-4 h-4 text-amber-400" />
                          <span>3. Dictée Vocale du Rapport Sanitaire (Agent Terrain) :</span>
                        </label>

                        {isListening && (
                          <span className="flex items-center space-x-1 text-[11px] font-black text-rose-400 animate-pulse bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/50">
                            <Radio className="w-3.5 h-3.5 text-rose-500 animate-ping" />
                            <span>ENREGISTREMENT VOCAL EN COURS...</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!isListening ? (
                          <button
                            type="button"
                            onClick={startVoiceDictation}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
                          >
                            <Mic className="w-4 h-4 text-slate-950" />
                            <span>🎙️ Démarrer la Dictée Vocale (fr-FR)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopVoiceDictation}
                            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md animate-pulse"
                          >
                            <MicOff className="w-4 h-4 text-white" />
                            <span>⏹️ Arrêter l'Enregistrement</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => simulateVoiceDictation()}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs border border-amber-500/30 flex items-center space-x-1 transition-all cursor-pointer"
                          title="Tester la dictée vocale si le microphone du navigateur est restreint"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>🧪 Test Vocal</span>
                        </button>

                        {quickNotes && (
                          <button
                            type="button"
                            onClick={() => setQuickNotes("")}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Effacer
                          </button>
                        )}
                      </div>

                      {voiceStatusMsg && (
                        <div className="bg-slate-900 border border-amber-500/40 text-amber-200 text-[11px] p-2 rounded-xl font-mono flex items-center justify-between">
                          <span>{voiceStatusMsg}</span>
                          <button onClick={() => setVoiceStatusMsg(null)} className="text-slate-400 hover:text-white font-bold ml-2">
                            ✕
                          </button>
                        </div>
                      )}

                      <textarea
                        rows={2}
                        placeholder="Dictez ou saisissez votre rapport sanitaire (ex: 2 sujets isolés, lot #2026-B02, administration vaccin complétée)..."
                        value={quickNotes}
                        onChange={(e) => setQuickNotes(e.target.value)}
                        className="w-full bg-slate-900 text-white placeholder-slate-500 font-medium p-2.5 rounded-xl border border-slate-700 text-xs focus:ring-2 focus:ring-amber-400"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Submit 1-Click Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border border-white/40 active:scale-[0.99]"
                >
                  <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                  <span>⚡ ENREGISTRER L'ÉVÉNEMENT SANITAIRE (1-CLIC TACTILE)</span>
                </button>
              </form>
            </div>

            {/* AI PRIORITIZATION CALLOUT BANNER */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-purple-900/80 rounded-xl text-amber-300 shrink-0 mt-0.5">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      Module IA Priorité Sanitaire
                    </span>
                    <span className="text-xs text-purple-200 font-bold">
                      • Réorganisation automatique des tâches
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">
                    Priorisation Automatique des Tâches par l'IA
                  </h4>
                  <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                    L'IA croise les alertes de vaccins à 5 jours, l'urgence sanitaire des lots, le bien-être animal et la disponibilité des soignants pour réorganiser automatiquement l'ordre d'exécution de la journée.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAiPrioritizeTasks}
                disabled={isAiPrioritizing}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-purple-950" />
                <span>{isAiPrioritizing ? "Calcul IA..." : "Réorganiser avec l'IA"}</span>
              </button>
            </div>

            {/* AI Rationale Summary if executed */}
            {aiSummaryRationale && (
              <div className="p-4 bg-purple-50 border border-purple-200 text-purple-950 rounded-2xl space-y-1 shadow-xs">
                <div className="flex items-center space-x-2 font-black text-xs text-purple-900 uppercase">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Justification du Planning Réorganisé par l'IA</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {aiSummaryRationale}
                </p>
              </div>
            )}

            {/* Task Progress Bar & Category Filter */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>Planning Horaires des Tâches Quotidiennes d'Élevage</span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Cochez les tâches au fur et à mesure de leur réalisation dans la journée par vos soignants.
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">Progression du Jour</div>
                    <div className="text-lg font-black text-emerald-800">
                      {completedTasksCount} / {tasks.length} ({taskProgressPct}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgressPct}%` }}
                ></div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="font-bold text-slate-700">Catégorie :</span>
                {(
                  [
                    "Toutes",
                    "Alimentation",
                    "Sanitaire & Hygiène",
                    "Relevés & Pesées",
                    "Maintenance & Matériel",
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTaskCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      taskCategoryFilter === cat
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Timeline List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    task.isCompletedToday
                      ? "bg-emerald-50/40 border-emerald-300 opacity-90"
                      : task.aiPriorityTag === "CRITIQUE SANITAIRE"
                      ? "bg-rose-50/60 border-rose-300 hover:border-rose-400 shadow-xs"
                      : "bg-white border-slate-200 hover:border-amber-400 shadow-xs"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Time Badge */}
                    <div className="bg-slate-950 text-amber-400 px-3 py-2 rounded-xl text-center shrink-0 font-mono shadow-xs">
                      {task.aiPriorityRank && (
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
                          Rang #{task.aiPriorityRank}
                        </div>
                      )}
                      <div className="text-xs font-black">{task.scheduledTime}</div>
                      <div className="text-[9px] text-slate-400 font-sans uppercase">Horaire</div>
                    </div>

                    {/* Task Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {task.aiPriorityTag && (
                          <span
                            className={`px-2 py-0.5 font-black text-[10px] rounded uppercase ${
                              task.aiPriorityTag === "CRITIQUE SANITAIRE"
                                ? "bg-rose-600 text-white"
                                : task.aiPriorityTag === "HAUTE PRIORITÉ"
                                ? "bg-amber-500 text-slate-950"
                                : "bg-purple-100 text-purple-900 border border-purple-300"
                            }`}
                          >
                            {task.aiPriorityTag}
                          </span>
                        )}

                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded uppercase">
                          {task.category}
                        </span>
                        <span className="text-slate-400 text-xs">• {task.batchOrLocation}</span>
                      </div>

                      <h4
                        className={`text-sm font-extrabold ${
                          task.isCompletedToday
                            ? "line-through text-slate-500"
                            : "text-slate-900"
                        }`}
                      >
                        {task.taskName}
                      </h4>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">{task.assignedTo}</span>
                        </span>
                        <span>•</span>
                        <span>{task.recurrence}</span>
                      </div>

                      {task.aiReasoning && (
                        <p className="text-[11px] text-purple-900 font-medium bg-purple-50 p-2 rounded-lg border border-purple-200 mt-1">
                          {task.aiReasoning}
                        </p>
                      )}

                      {task.notes && (
                        <p className="text-[11px] text-slate-600 italic pt-0.5">
                          Note : {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Completion Action Checkbox */}
                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTask(task.id);
                      }}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                        task.isCompletedToday
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-amber-100 text-slate-800 border border-slate-300"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {task.isCompletedToday
                          ? `Effectué (${task.completedAt})`
                          : "Marquer comme fait"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: ASSISTANT IA PROPHYLAXIE & BIOSÉCURITÉ */}
        {activeTab === "ai" && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-rose-950 to-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-rose-300 font-black text-lg">
                <Bot className="w-6 h-6" />
                <span>Expertise IA en Prophylaxie Sanitaire & Biosécurité Ivoire Élevage</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                Obtenez des recommandations sanitaires personnalisées sur le calendrier de vaccination, les désinfections de bâtiments, et l'eau de boisson pour éviter les épidémies.
              </p>

              <button
                onClick={() => handleConsultAiHealth()}
                disabled={isAiLoading}
                className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isAiLoading ? (
                  <span>Analyse en cours...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lancer le Diagnostic Prophylaxie & Vaccins IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Query Bar */}
            <div className="space-y-2">
              <label className="block text-slate-900 font-extrabold text-xs">
                Posez une question à l'Expert Vétérinaire IA :
              </label>
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={customAiQuery}
                  onChange={(e) => setCustomAiQuery(e.target.value)}
                  placeholder="Ex: Quel protocole de désinfection appliquer après la sortie de la Bande #1 ?"
                  className="flex-1 p-3 border border-slate-300 rounded-xl bg-white text-slate-900"
                />
                <button
                  onClick={() => handleConsultAiHealth(customAiQuery)}
                  disabled={isAiLoading || !customAiQuery}
                  className="bg-rose-900 hover:bg-rose-800 text-white font-bold px-5 py-3 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </div>

            {/* AI Decision Output Box */}
            {aiAdvice && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-rose-400" />
                    <span className="text-rose-400 font-extrabold text-sm uppercase tracking-wider">
                      Recommandation Sanitaire IA
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Docteur Vétérinaire IA</span>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {aiAdvice}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD VACCINE */}
      {isVaccineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Syringe className="w-5 h-5 text-rose-600" />
                <span>Programmation d'un Nouveau Vaccin</span>
              </h3>
              <button
                onClick={() => setIsVaccineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVaccineSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom du Vaccin / Souche :</label>
                <input
                  type="text"
                  required
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  placeholder="Ex: Gumboro IBD Intermédiaire"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Élevage / Espèce :</label>
                  <select
                    value={vacSpecies}
                    onChange={(e) => setVacSpecies(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Aviculture">Aviculture (Poulets)</option>
                    <option value="Porciculture">Porciculture (Porcs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bande / Lot :</label>
                  <input
                    type="text"
                    required
                    value={vacBatch}
                    onChange={(e) => setVacBatch(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Âge ({vacSpecies === "Aviculture" ? "Jours" : "Semaines"}) :
                  </label>
                  <input
                    type="number"
                    value={vacAge}
                    onChange={(e) => setVacAge(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date Prévue de Vaccination :</label>
                  <input
                    type="date"
                    required
                    value={vacDate}
                    onChange={(e) => setVacDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-rose-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pathologie Ciblée :</label>
                <input
                  type="text"
                  value={vacTarget}
                  onChange={(e) => setVacTarget(e.target.value)}
                  placeholder="Ex: Maladie de Gumboro (Bursite)"
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mode d'Administration :</label>
                <select
                  value={vacRoute}
                  onChange={(e) => setVacRoute(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                >
                  <option value="Eau de boisson">Eau de boisson (Dilution)</option>
                  <option value="Injection IM / SC">Injection IM / SC (Intramusculaire)</option>
                  <option value="Goutte oculaire / Spray">Goutte oculaire / Spray</option>
                  <option value="Trempage / Inhalation">Trempage du bec / Inhalation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes de Posologie / Recommandations :</label>
                <textarea
                  value={vacDosage}
                  onChange={(e) => setVacDosage(e.target.value)}
                  placeholder="Ex: Diète hydrique 2h avant la distribution."
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                  rows={2}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsVaccineModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold shadow"
                >
                  Enregistrer Vaccin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DAILY TASK */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Création d'une Tâche Quotidienne</span>
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom de la Tâche :</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Ex: Nettoyage et Désinfection des Pipettes"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Horaire Prévu (HH:MM) :</label>
                  <input
                    type="time"
                    required
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Catégorie :</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Alimentation">Alimentation</option>
                    <option value="Sanitaire & Hygiène">Sanitaire & Hygiène</option>
                    <option value="Relevés & Pesées">Relevés & Pesées</option>
                    <option value="Maintenance & Matériel">Maintenance & Matériel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Secteur / Espèce :</label>
                  <select
                    value={taskSpecies}
                    onChange={(e) => setTaskSpecies(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Global">Global (Toute la ferme)</option>
                    <option value="Aviculture">Aviculture (Volailles)</option>
                    <option value="Porciculture">Porciculture (Porcs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Emplacement / Bâtiment :</label>
                  <input
                    type="text"
                    value={taskLocation}
                    onChange={(e) => setTaskLocation(e.target.value)}
                    placeholder="Ex: Bâtiment A"
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Responsable / Agent :</label>
                  <input
                    type="text"
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    placeholder="Ex: Kouassi"
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fréquence :</label>
                  <select
                    value={taskRecurrence}
                    onChange={(e) => setTaskRecurrence(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Quotidien (Matin)">Quotidien (Matin)</option>
                    <option value="Quotidien (2x/jour)">Quotidien (2x/jour)</option>
                    <option value="Hebdomadaire">Hebdomadaire</option>
                    <option value="Ponctuel">Ponctuel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Consignes & Notes :</label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Remarques particulières pour le soignant..."
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                  rows={2}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow cursor-pointer"
                >
                  Ajouter la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTOMATIC BIRTH-DATE VACCINE SCHEDULE GENERATOR MODAL */}
      {isAutoScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span>Calculateur Automatique de Rappels Vaccinaux</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Générez l'ensemble du protocole prophylactique à partir de la date de naissance.
                </p>
              </div>
              <button
                onClick={() => setIsAutoScheduleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 font-black rounded-xl hover:bg-slate-100 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Nom / Code du Lot d'animaux :</label>
                <input
                  type="text"
                  value={autoBatchName}
                  onChange={(e) => setAutoBatchName(e.target.value)}
                  placeholder="Ex: Bande Poulets Chair #2026-B05"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Espèce / Spéculation :</label>
                  <select
                    value={autoSpecies}
                    onChange={(e) => setAutoSpecies(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
                  >
                    <option value="Aviculture">🐔 Aviculture (Poulets / Pondeuses)</option>
                    <option value="Porciculture">🐖 Porciculture (Porcelets / Porcs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Effectif du Lot :</label>
                  <input
                    type="number"
                    value={autoHeadcount}
                    onChange={(e) => setAutoHeadcount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">
                  📅 Date de Naissance / Éclosion / Arrivée :
                </label>
                <input
                  type="date"
                  value={autoBirthDate}
                  onChange={(e) => setAutoBirthDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-amber-50/50"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Les rappels vaccinaux seront calculés aux échéances précises J+1, J+7, J+14, J+21 et J+28.
                </span>
              </div>

              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-rose-950 text-[11px] space-y-1">
                <span className="font-extrabold block text-rose-900">⚡ Protocole Sanitaire qui sera généré :</span>
                {autoSpecies === "Aviculture" ? (
                  <ul className="list-disc list-inside space-y-0.5 text-rose-900">
                    <li><strong>J+1 :</strong> HB1 + H120 (Newcastle & Bronchite)</li>
                    <li><strong>J+7 :</strong> Gumboro Dose 1 (Eau de boisson)</li>
                    <li><strong>J+14 :</strong> Gumboro Dose 2 Rappel</li>
                    <li><strong>J+21 :</strong> Newcastle LaSota Rappel</li>
                    <li><strong>J+28 :</strong> Déparasitage Interne + Vitamines</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-0.5 text-rose-900">
                    <li><strong>J+3 :</strong> Fer Dextran 200mg + Cordon</li>
                    <li><strong>J+14 :</strong> Mycoplasma Hyopneumoniae Dose 1</li>
                    <li><strong>J+21 :</strong> Parvovirose + Erysipèle (Rouget)</li>
                    <li><strong>J+28 :</strong> Rappel Mycoplasme + Vermifuge</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAutoScheduleModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerateBirthDateSchedule}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow cursor-pointer transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Injecter les Rappels Automatiques</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / OVERLAY: FEUILLE DE ROUTE JOURNALIÈRE D'EXPLOITATION (EXPORT PDF / IMPRESSION) */}
      {isRouteSheetPdfOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl border border-slate-300 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header Bar (Hidden during window.print) */}
            <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-4 print:hidden gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Feuille de Route Journalière (Impression & PDF Terrain)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Document officiel d'exécution des tâches d'élevage et de prophylaxie pour les agents de site.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>Imprimer / Sauvegarder en PDF</span>
                </button>
                <button
                  onClick={() => setIsRouteSheetPdfOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE FIELD ROUTE SHEET BODY */}
            <div id="printable-daily-route-sheet" className="space-y-6 p-4 sm:p-6 bg-white text-slate-900 border border-slate-200 rounded-2xl font-sans">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-xs font-black text-emerald-800 tracking-wider uppercase">
                    IVOIRE ÉLEVAGE HOLDING • DIRECTION D'EXPLOITATION
                  </div>
                  <h1 className="text-xl font-black text-slate-950 uppercase mt-0.5">
                    FEUILLE DE ROUTE JOURNALIÈRE DES AGENTS DE TERRAIN
                  </h1>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    Site d'Élevage : <span className="text-slate-900">Ferme Pilote Avicole & Porcine - Abidjan/Yamoussoukro</span>
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-lg">
                    DATE : {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    Visa Supervision : <span className="text-slate-900 font-extrabold">M. Bamba (Chef d'Élevage)</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Emergency & Vaccines */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-rose-900 font-black text-xs uppercase tracking-wider bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <Syringe className="w-4 h-4 text-rose-700" />
                  <span>1. PROTOCOLE SANITAIRE & VACCINATIONS PRIORITAIRES DU JOUR</span>
                </div>

                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-extrabold border-b border-slate-300 text-slate-900">
                      <th className="p-2 border-r border-slate-300">Heure</th>
                      <th className="p-2 border-r border-slate-300">Vaccin / Soin</th>
                      <th className="p-2 border-r border-slate-300">Espèce & Bâtiment</th>
                      <th className="p-2 border-r border-slate-300">Dose / Mode d'Administration</th>
                      <th className="p-2 border-r border-slate-300">Agent Affecté</th>
                      <th className="p-2 text-center">Fait (✓)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-[11px] font-medium">
                    {vaccines.slice(0, 3).map((v) => (
                      <tr key={v.id}>
                        <td className="p-2 font-bold border-r border-slate-300 text-rose-700">07:00</td>
                        <td className="p-2 font-black border-r border-slate-300 text-slate-900">{v.vaccineName}</td>
                        <td className="p-2 border-r border-slate-300">{v.species} - {v.batchOrBuilding}</td>
                        <td className="p-2 border-r border-slate-300 font-bold">{v.dosageAndRoute}</td>
                        <td className="p-2 border-r border-slate-300">{v.assignedTechnician}</td>
                        <td className="p-2 text-center font-bold">
                          <span className="inline-block w-4 h-4 border border-slate-500 rounded-sm"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 2: Daily Scheduled Operations */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider bg-slate-100 p-2 rounded-lg border border-slate-300">
                  <CheckSquare className="w-4 h-4 text-emerald-800" />
                  <span>2. CHRONOGRAMME DES OPÉRATIONS D'ÉLEVAGE QUOTIDIENNES</span>
                </div>

                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-extrabold border-b border-slate-300 text-slate-900">
                      <th className="p-2 border-r border-slate-300 w-16">Horaires</th>
                      <th className="p-2 border-r border-slate-300">Intitulé de la Tâche</th>
                      <th className="p-2 border-r border-slate-300">Secteur / Bâtiment</th>
                      <th className="p-2 border-r border-slate-300">Consignes Spécifiques</th>
                      <th className="p-2 border-r border-slate-300">Responsable</th>
                      <th className="p-2 text-center w-12">Visé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-[11px] font-medium">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-2 font-black border-r border-slate-300 text-slate-950 bg-slate-50">
                          {t.scheduledTime}
                        </td>
                        <td className="p-2 font-bold border-r border-slate-300 text-slate-900">
                          {t.taskName}
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          [{t.species}] {t.batchOrLocation}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-600 font-medium">
                          {t.notes || "Respecter les règles de biosécurité et désinfection des bottes."}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-semibold">
                          {t.assignedTo}
                        </td>
                        <td className="p-2 text-center font-bold">
                          <span className="inline-block w-4 h-4 border border-slate-500 rounded-sm"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 3: Field Logs & Mortality Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="font-extrabold text-xs uppercase text-slate-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                    3. RELEVÉ MANUEL TEMPÉRATURE & EAU (À REMPLIR SITE)
                  </div>
                  <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-slate-300">
                        <th className="p-1.5 border-r border-slate-300">Bâtiment</th>
                        <th className="p-1.5 border-r border-slate-300">Temp. Matin (°C)</th>
                        <th className="p-1.5 border-r border-slate-300">Temp. Soir (°C)</th>
                        <th className="p-1.5">Conso Eau (Litres)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-bold">Bâtiment A (Poussins)</td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">.... °C</td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">.... °C</td>
                        <td className="p-1.5 text-slate-400">........ L</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-bold">Maternité Porcine</td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">.... °C</td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">.... °C</td>
                        <td className="p-1.5 text-slate-400">........ L</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <div className="font-extrabold text-xs uppercase text-slate-900 bg-rose-50 p-1.5 rounded border border-rose-200">
                    4. DÉCLARATION MORTALITÉS & ANOMALIES
                  </div>
                  <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-slate-300">
                        <th className="p-1.5 border-r border-slate-300">Lot / Bâtiment</th>
                        <th className="p-1.5 border-r border-slate-300">Nombre</th>
                        <th className="p-1.5">Cause Suspectée / Symptômes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">.......................</td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">......</td>
                        <td className="p-1.5 text-slate-400">................................................</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">.......................</td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400">......</td>
                        <td className="p-1.5 text-slate-400">................................................</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Signatures */}
              <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs font-bold">
                <div className="space-y-8">
                  <p className="text-slate-700">Signature Technicien de Terrain :</p>
                  <p className="text-slate-400 font-normal italic">Nom & Date : ...............................................</p>
                </div>
                <div className="space-y-8 text-right">
                  <p className="text-slate-700">Visa & Approbation Chef d'Élevage :</p>
                  <p className="text-slate-400 font-normal italic">Signature : ...............................................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOCAL NOTIFICATION SERVICE MODAL */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-rose-900/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30">
                  <BellRing className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    Service de Notifications Locales Sanitaires
                  </h3>
                  <p className="text-xs text-rose-200">
                    Alertes automatiques & signaux sonores pour les échéances vaccinales critiques à J-5
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNotifModalOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Browser Permission Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      Permission Système du Navigateur Web
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      notifPermission === "granted"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : notifPermission === "denied"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {notifPermission === "granted"
                      ? "Autorisé"
                      : notifPermission === "denied"
                      ? "Bloqué par le navigateur"
                      : "En attente d'accord"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {notifPermission === "granted"
                    ? "Votre navigateur est configuré pour afficher les notifications natives du système dès qu'un rappel de vaccin ou une tâche critique approche d'une date limite."
                    : notifPermission === "denied"
                    ? "Les notifications système du navigateur sont désactivées dans les paramètres de votre appareil. Les alertes sonores (Web Audio Synth) et bannières in-app restent toutefois 100% opérationnelles."
                    : "Cliquez ci-dessous pour autoriser les notifications système et recevoir des rappels automatiques directement sur votre écran ou barre de notification."}
                </p>

                {notifPermission !== "granted" && (
                  <button
                    onClick={handleRequestNotifPermission}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Autoriser les Notifications Navigateur / PWA</span>
                  </button>
                )}
              </div>

              {/* Toggles & Options */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Réglages des Alertes Sanitaires
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Enable Notification Switch */}
                  <div
                    onClick={() => setIsLocalNotifEnabled(!isLocalNotifEnabled)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isLocalNotifEnabled
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isLocalNotifEnabled ? "bg-rose-500 text-white" : "bg-slate-300 dark:bg-slate-800 text-slate-600"
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          Alertes Sanitaires
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isLocalNotifEnabled ? "Actives (J-5 & Tâches)" : "Désactivées"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${
                        isLocalNotifEnabled ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isLocalNotifEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Audio Sound Alarm Switch */}
                  <div
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSoundEnabled
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSoundEnabled ? "bg-amber-500 text-slate-950" : "bg-slate-300 dark:bg-slate-800 text-slate-600"
                        }`}
                      >
                        {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          Alarme Sonore (Audio Synth)
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isSoundEnabled ? "Signal Chime actif" : "Silencieux"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${
                        isSoundEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isSoundEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() =>
                    triggerSanitaryLocalNotification(
                      "🔔 Test Alerte Sanitaire & Alarme",
                      "Le service de notification locale fonctionne parfaitement !",
                      "test"
                    )
                  }
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer border border-amber-500/30 shadow-xs"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>📢 Tester Notification & Alarme</span>
                </button>

                <button
                  onClick={() => handleScanSanitaryDeadlines(true)}
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>🔍 Scanner les Échéances Maintenant</span>
                </button>
              </div>

              {/* Active Tracked Deadlines Summary */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Échéances Sanitaires Sous Surveillance (
                  {urgentVaccines.length +
                    tasks.filter((t) => !t.isCompletedToday && t.category === "Sanitaire & Hygiène").length}
                  )
                </h4>

                {urgentVaccines.length === 0 &&
                tasks.filter((t) => !t.isCompletedToday && t.category === "Sanitaire & Hygiène").length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    ✓ Aucune urgence sanitaire immédiate. Tous les rappels de vaccin à J-5 et tâches de biosécurité du jour
                    sont complétés.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {urgentVaccines.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-black text-rose-700 dark:text-rose-300">{v.vaccineName}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {v.batchName} ({v.species}) • Date : {v.scheduledDate}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded">
                          J-5 ALERTE
                        </span>
                      </div>
                    ))}
                    {tasks
                      .filter((t) => !t.isCompletedToday && t.category === "Sanitaire & Hygiène")
                      .map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{t.taskName}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {t.scheduledTime} • {t.assignedTo} ({t.batchOrLocation})
                            </span>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded">
                            TÂCHE EN ATTENTE
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Notification Log History */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Historique des Alertes Diffusées ({notifHistory.length})
                  </h4>
                  {notifHistory.length > 0 && (
                    <button
                      onClick={() => setNotifHistory([])}
                      className="text-[11px] text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Effacer l'historique</span>
                    </button>
                  )}
                </div>

                {notifHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    Aucune notification déclenchée récemment.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {notifHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-start text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                            <span>{item.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.body}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{item.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsNotifModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
