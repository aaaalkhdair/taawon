export function ageYears(birthDate: string, now = new Date()) {
  const b = new Date(birthDate);
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

/** Local YYYY-MM-DD */
export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** 1-based plan week for a date, clamped to [1, totalWeeks]. */
export function planWeek(startDate: string | null | undefined, totalWeeks = 12, now = new Date()) {
  if (!startDate) return 1;
  const diff = Math.floor((now.getTime() - new Date(startDate).getTime()) / 86400000);
  return Math.max(1, Math.min(totalWeeks, Math.floor(diff / 7) + 1));
}

export function formatDate(iso: string, locale: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", opts).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: string) {
  return formatDate(iso, locale, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
