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

export function getYouTubeEmbedUrl(url: string | null | undefined, name?: string) {
  const id = getYouTubeVideoId(url);
  
  if (id && !UNAVAILABLE_YOUTUBE_VIDEO_IDS.has(id)) {
    return `https://www.youtube.com/embed/${id}`;
  }

  if (name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("squat") || nameLower.includes("ganh dui")) {
      return "https://www.youtube.com/embed/ultWGrY3OQA";
    }
    if (nameLower.includes("bench press") || nameLower.includes("day nguc")) {
      if (nameLower.includes("incline") || nameLower.includes("doc len")) {
        return "https://www.youtube.com/embed/8iPjfLa5pDU";
      }
      return "https://www.youtube.com/embed/rT7DgipK6B8";
    }
    if (nameLower.includes("barbell row") || nameLower.includes("cheo lung")) {
      return "https://www.youtube.com/embed/RQU8K-PMkpA";
    }
    if (nameLower.includes("overhead press") || nameLower.includes("day vai")) {
      return "https://www.youtube.com/embed/2yjwHevEzP0";
    }
    if (nameLower.includes("pull up") || nameLower.includes("len xa")) {
      return "https://www.youtube.com/embed/eGo4IYlbE5g";
    }
    if (nameLower.includes("lateral raise") || nameLower.includes("dang ta vai")) {
      return "https://www.youtube.com/embed/3VcKaX3J8xs";
    }
    if (nameLower.includes("bicep curl") || nameLower.includes("cuon ta tay")) {
      return "https://www.youtube.com/embed/ykJgrb560_8";
    }
    if (nameLower.includes("tricep extension") || nameLower.includes("duoi tay sau")) {
      return "https://www.youtube.com/embed/nRiJVZD5m80";
    }
    if (nameLower.includes("romanian deadlift") || nameLower.includes("rdl")) {
      return "https://www.youtube.com/embed/2SHsk9AzdgA";
    }
    if (nameLower.includes("deadlift")) {
      return "https://www.youtube.com/embed/op9kVnSso6Q";
    }
    if (nameLower.includes("leg press") || nameLower.includes("dap dui")) {
      return "https://www.youtube.com/embed/IZxyjW7MPJQ";
    }
    if (nameLower.includes("calf raise") || nameLower.includes("nhon got")) {
      return "https://www.youtube.com/embed/8pI7S8s6Mhk";
    }
    if (nameLower.includes("crunch") || nameLower.includes("gap bung")) {
      return "https://www.youtube.com/embed/Xyd_fa5zoEU";
    }
    if (nameLower.includes("plank")) {
      return "https://www.youtube.com/embed/pSHjTRCQxIw";
    }
  }

  return "";
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
