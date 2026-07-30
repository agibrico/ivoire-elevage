import { ApkInstallMode } from "../types";

const APK_INSTALL_MODE_KEY = "ivoire_apk_install_mode_v1";

export function getApkInstallMode(): ApkInstallMode {
  // Build-time mode locking for specific APK modules
  const lockedMode = (import.meta as any).env.VITE_APK_MODE;
  if (lockedMode === "AVIVOIRE" || lockedMode === "PORCIVOIRE" || lockedMode === "ADMINISTRATION_GENERALE") {
    return lockedMode as ApkInstallMode;
  }

  try {
    const saved = localStorage.getItem(APK_INSTALL_MODE_KEY);
    if (saved === "AVIVOIRE" || saved === "PORCIVOIRE" || saved === "ADMINISTRATION_GENERALE") {
      return saved;
    }
  } catch (e) {
    console.error("Error reading APK install mode from storage", e);
  }
  return "ADMINISTRATION_GENERALE";
}

export function saveApkInstallMode(mode: ApkInstallMode): void {
  try {
    localStorage.setItem(APK_INSTALL_MODE_KEY, mode);
  } catch (e) {
    console.error("Error saving APK install mode to storage", e);
  }
}

/**
  * Default password for AVIVOIRE and PORCIVOIRE manager activation is "1234".
  * For ADMIN_GENERAL, "1234" or "agibrico1" are accepted.
  */
export function verifyApkManagerPassword(mode: ApkInstallMode, passwordInput: string): boolean {
  const cleaned = passwordInput.trim();
  if (mode === "AVIVOIRE" || mode === "PORCIVOIRE") {
    return cleaned === "1234" || cleaned === "agibrico1";
  }
  if (mode === "ADMINISTRATION_GENERALE") {
    return cleaned === "1234" || cleaned === "agibrico1";
  }
  return false;
}

export function getApkModeDetails(mode: ApkInstallMode) {
  switch (mode) {
    case "AVIVOIRE":
      return {
        title: "AVIVOIRE",
        subTitle: "Direction Aviculture & Volailles",
        description: "Installation dédiée exclusivement à l'Aviculture (Poulets de chair, Pondeuses, Alimentation Avicole, Bâtiments Avicoles & Ventes Volailles).",
        badgeBg: "bg-amber-500 text-slate-950",
        borderBg: "border-amber-500",
        iconEmoji: "🐔",
        defaultPassword: "1234",
      };
    case "PORCIVOIRE":
      return {
        title: "PORCIVOIRE",
        subTitle: "Direction Porciculture & Maternité",
        description: "Installation dédiée exclusivement à la Porciculture (Porcheries, Reproduction & Maternité, Alimentation Porcine & Ventes Carcasses).",
        badgeBg: "bg-emerald-500 text-slate-950",
        borderBg: "border-emerald-500",
        iconEmoji: "🐖",
        defaultPassword: "1234",
      };
    case "ADMINISTRATION_GENERALE":
    default:
      return {
        title: "ADMINISTRATION GÉNÉRALE",
        subTitle: "Holding Agro-Pastorale Globale",
        description: "Accès complet et sans restriction à tous les modules (Aviculture, Porciculture, Finances, RH, Ventes & Alertes).",
        badgeBg: "bg-blue-600 text-white",
        borderBg: "border-blue-500",
        iconEmoji: "👑",
        defaultPassword: "1234 ou agibrico1",
      };
  }
}
