import type { Exercise } from "./types";
import { getYouTubeVideoId } from "./video";
import { getFullImageUrl } from "./api";

function isCustomExerciseImage(url: string) {
  return url.startsWith("/") || url.startsWith("uploads/") || url.includes("/uploads/") || url.startsWith("data:");
}

function isExerciseImage(url: string) {
  if (url.includes("/onboarding/")) return false;
  if (url.startsWith("http://") || url.startsWith("https://")) return true;
  return isCustomExerciseImage(url);
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeRemoteImageUrl(url: string) {
  if (
    url.startsWith("http://") &&
    !url.includes("localhost") &&
    !url.includes("127.0.0.1")
  ) {
    return url.replace(/^http:\/\//, "https://");
  }

  return url;
}

export function getExerciseFallbackImageSrc(exercise: Pick<Exercise, "name" | "muscleGroup" | "equipment">): string {
  const muscle = escapeSvgText((exercise.muscleGroup || "TRAINING").replace(/_/g, " "));
  const equipment = escapeSvgText((exercise.equipment || "EXERCISE").replace(/_/g, " "));
  const name = escapeSvgText(exercise.name || "Exercise");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#151a28"/>
          <stop offset="55%" stop-color="#090d18"/>
          <stop offset="100%" stop-color="#251107"/>
        </linearGradient>
        <radialGradient id="glow" cx="72%" cy="22%" r="58%">
          <stop offset="0%" stop-color="#fb923c" stop-opacity="0.38"/>
          <stop offset="48%" stop-color="#f97316" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <rect width="1200" height="675" fill="url(#glow)"/>
      <g opacity="0.16" stroke="#fed7aa" stroke-width="3">
        <path d="M160 516h880"/>
        <path d="M234 250h732"/>
        <path d="M313 168h574"/>
      </g>
      <g transform="translate(170 150)">
        <rect width="144" height="144" rx="38" fill="#fb923c" opacity="0.16"/>
        <path d="M43 76h58M72 47v58" stroke="#fdba74" stroke-width="15" stroke-linecap="round"/>
        <circle cx="72" cy="76" r="48" fill="none" stroke="#f97316" stroke-width="10"/>
      </g>
      <text x="170" y="392" fill="#fff7ed" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="900" letter-spacing="-1">${name}</text>
      <text x="172" y="456" fill="#fdba74" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900" letter-spacing="5">${muscle} / ${equipment}</text>
      <rect x="170" y="492" width="248" height="10" rx="5" fill="#f97316"/>
      <rect x="436" y="492" width="124" height="10" rx="5" fill="#f59e0b" opacity="0.72"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getExerciseImageSrc(exercise: Exercise): string {
  const raw = exercise.imageUrl?.trim();
  const videoId = getYouTubeVideoId(exercise.videoUrl);

  // ── CUSTOM NAME-BASED MAPPING FOR REAL PEOPLE PHOTOS ──
  const nameLower = exercise.name?.toLowerCase() || "";
  if (nameLower.includes("squat") || nameLower.includes("ganh dui")) {
    return "/exercises/squat.png";
  }
  if (nameLower.includes("bench press") || nameLower.includes("day nguc")) {
    if (nameLower.includes("incline") || nameLower.includes("doc len")) {
      return "/onboarding/goal-muscle-gain.png";
    }
    return "/exercises/bench-press.png";
  }
  if (nameLower.includes("barbell row") || nameLower.includes("cheo lung")) {
    return "/exercises/barbell-row.png";
  }
  if (nameLower.includes("overhead press") || nameLower.includes("day vai")) {
    return "/exercises/overhead-press.png";
  }
  if (nameLower.includes("pull up") || nameLower.includes("keo xa")) {
    return "/onboarding/body-muscular.png";
  }
  if (nameLower.includes("lateral raise") || nameLower.includes("dang vai")) {
    return "/onboarding/gender-male.png";
  }
  if (nameLower.includes("bicep curl") || nameLower.includes("cuon tay")) {
    return "/onboarding/body-muscular.png";
  }
  if (nameLower.includes("tricep") || nameLower.includes("tay sau")) {
    return "/onboarding/body-lean.png";
  }
  if (nameLower.includes("romanian deadlift") || nameLower.includes("rdl")) {
    return "/exercises/barbell-row.png";
  }
  if (nameLower.includes("deadlift") || nameLower.includes("keo lung")) {
    return "/exercises/barbell-row.png";
  }
  if (nameLower.includes("leg press") || nameLower.includes("dap dui")) {
    return "/exercises/squat.png";
  }
  if (nameLower.includes("calf raise") || nameLower.includes("nhon got")) {
    return "/onboarding/body-average.png";
  }
  if (nameLower.includes("crunch") || nameLower.includes("gap bung")) {
    return "/onboarding/goal-cut-real.png";
  }
  if (nameLower.includes("plank")) {
    return "/onboarding/body-lean.png";
  }
  if (nameLower.includes("dumbbell press") && (nameLower.includes("incline") || nameLower.includes("doc len"))) {
    return "/onboarding/goal-muscle-gain.png";
  }

  // Keep real exercise imagery from backend uploads or external catalog URLs.
  // Onboarding illustrations are intentionally ignored here because they crop badly in exercise cards.
  if (raw && raw.length > 0 && isExerciseImage(raw)) {
    // If the image is a backend-relative path (e.g. /uploads/...),
    // convert it to an absolute URL so Next/Image will fetch it directly from the backend.
    if (raw.startsWith("/")) {
      return getFullImageUrl(raw);
    }

    if (raw.startsWith("uploads/")) {
      return getFullImageUrl(`/${raw}`);
    }

    return normalizeRemoteImageUrl(raw);
  }

  // Prefer the thumbnail of the actual tutorial video when no valid exercise image exists.
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  return getExerciseFallbackImageSrc(exercise);
}
