import { LuCircleAlert, LuShieldCheck, LuTriangleAlert } from "react-icons/lu";

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getVerdictConfig(label: string) {
  const normalized = label.trim().toUpperCase();

  if (
    normalized.includes("NORMAL") ||
    normalized.includes("SAFE") ||
    normalized.includes("AMAN") ||
    normalized.includes("LEGIT")
  ) {
    return {
      badge: "Aman / Normal",
      headline: "Tidak Ditemukan Indikasi Penipuan",
      summary:
        "Konten ini memiliki pola komunikasi wajar dan tidak mengarah pada modus penipuan umum.",
      accentBorder: "border-l-emerald-600",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      barClass: "bg-emerald-600",
      iconClass: "text-emerald-600 dark:text-emerald-400",
      Icon: LuShieldCheck,
    };
  }

  if (
    normalized.includes("SUSPICIOUS") ||
    normalized.includes("MENCURIGAKAN") ||
    normalized.includes("WASPADA")
  ) {
    return {
      badge: "Perlu Kewaspadaan",
      headline: "Ditemukan Beberapa Pola Mencurigakan",
      summary:
        "Terdapat elemen yang patut diverifikasi ulang sebelum Anda merespons atau mengklik tautan.",
      accentBorder: "border-l-amber-500",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      barClass: "bg-amber-500",
      iconClass: "text-amber-600 dark:text-amber-400",
      Icon: LuTriangleAlert,
    };
  }

  return {
    badge: label.replace(/_/g, " "),
    headline: "Terindikasi Penipuan",
    summary:
      "Konten ini mengandung pola rekayasa sosial atau ciri penipuan berisiko tinggi.",
    accentBorder: "border-l-red-600",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400",
    barClass: "bg-red-600",
    iconClass: "text-red-600 dark:text-red-400",
    Icon: LuCircleAlert,
  };
}
