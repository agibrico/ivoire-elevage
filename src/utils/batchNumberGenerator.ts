/**
 * Auto-generates unique, standard lot numbers for livestock, feed manufacturing, and farm operations.
 */

let counter = 100;

export function generateAutoLotNumber(
  category: "AVICULTURE" | "PORCICULTURE" | "MATERNITE" | "ENGRAISSEMENT" | "ALIMENT" | "TRANSIT" | "GENERIC",
  suffix?: string
): string {
  const currentYear = new Date().getFullYear();
  counter += 1;
  const seq = String(counter).padStart(3, "0");

  const prefixMap: Record<string, string> = {
    AVICULTURE: "LOT-AV",
    PORCICULTURE: "LOT-PORC",
    MATERNITE: "LOT-MAT",
    ENGRAISSEMENT: "LOT-ENG",
    ALIMENT: "LOT-ALIM",
    TRANSIT: "LOT-MOV",
    GENERIC: "LOT",
  };

  const prefix = prefixMap[category] || "LOT";
  return suffix ? `${prefix}-${currentYear}-${seq}-${suffix}` : `${prefix}-${currentYear}-${seq}`;
}

export function formatBatchLabelWithAutoNum(
  autoNum: string,
  rawName: string
): string {
  if (rawName.startsWith("LOT-")) return rawName;
  return `[${autoNum}] ${rawName}`;
}
