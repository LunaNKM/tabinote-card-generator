export function normalizeSource(url?: string | null): string {
  if (!url) return "Photo | Pinterest";

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("pinterest")) return "Photo | Pinterest";
    if (host.includes("oliveyoung")) return "Photo | 올리브영";
    if (host.includes("lotte")) return "Photo | 롯데면세점";
    if (host.includes("instagram")) return "Photo | Instagram";
    if (host.includes("naver")) return "Photo | 네이버";
    if (host.includes("daiso")) return "Photo | 다이소";
    if (host.includes("amazon")) return "Photo | Amazon";
    return `Photo | ${host.split(".")[0]}`;
  } catch {
    return "Photo | source";
  }
}
