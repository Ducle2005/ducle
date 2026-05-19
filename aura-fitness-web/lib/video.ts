const UNAVAILABLE_YOUTUBE_VIDEO_IDS = new Set([
  "roCP6wC66kg",
  "MeIiGibT6X0",
  "8bbE6nqH9v8",
  "iSSAk4XCs5A",
  "T_SAn2u9QTM",
  "xSBA_mSInFw",
  "Rd8nK4jzC1I",
  "YSxHifyIrvE",
  "Vf8_P0q2D1M",
  "6ZKnHHL_zN8",
  "d_KZx7pKNM4",
  "wkD8rjk6OGE",
  "fuK3n7AY3S4",
  "YyvSfVLYd80",
  "FK4rkOt_2_I",
  "mVy9onvD9v8",
  "gsS6N-S8S8k",
  "hGZ_S7E8y2E",
  "9xQp28SshS4",
  "mjGWSB8mI_Y",
  "H6Uo4Wf1v_Q",
  "S0Zf7uF4B_Q",
  "pS68XitK07o",
  "RD_vUnKwqqI",
  "U2OKweZ-PrA",
  "tMAiNQJoxf0",
]);

export function getYouTubeVideoId(url: string | null | undefined) {
  if (!url) return "";

  const normalizeId = (id: string | null | undefined) => {
    if (!id || !/^[a-zA-Z0-9_-]{8,20}$/.test(id)) return "";
    return id;
  };

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return normalizeId(parsed.pathname.replace("/", ""));
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return normalizeId(id);

      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) return normalizeId(embedMatch[1]);
    }
  } catch {
    return "";
  }

  return "";
}

export function getYouTubeEmbedUrl(url: string | null | undefined) {
  const id = getYouTubeVideoId(url);
  if (UNAVAILABLE_YOUTUBE_VIDEO_IDS.has(id)) return "";
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

export function getYouTubeThumbnailUrl(url: string | null | undefined) {
  const id = getYouTubeVideoId(url);
  if (UNAVAILABLE_YOUTUBE_VIDEO_IDS.has(id)) return "";
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export function getYouTubeSearchUrl(query: string | null | undefined) {
  const normalizedQuery = query?.trim() || "exercise tutorial";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${normalizedQuery} exercise tutorial proper form`)}`;
}
