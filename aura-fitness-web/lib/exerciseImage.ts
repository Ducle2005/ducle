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

const EXERCISE_PHOTO_MAP: Record<string, string> = {
  "squat": "/exercises/squat.png",
  "bench press": "/exercises/bench-press.png",
  "barbell row": "/exercises/barbell-row.png",
  "overhead press": "/exercises/overhead-press.png",
  "pull up": "/onboarding/body-muscular.png",
  "lateral raise": "/onboarding/gender-male.png",
  "bicep curl": "/onboarding/age-18-29.png",
  "tricep extension": "/onboarding/age-18-29.png",
  "deadlift": "/onboarding/goal-muscle-gain.png",
  "leg press": "/onboarding/body-average.png",
  "romanian deadlift": "/onboarding/goal-muscle-gain.png",
  "calf raise": "/onboarding/body-average.png",
  "crunch": "/onboarding/goal-cut-real.png",
  "plank": "/onboarding/body-lean.png",
  "incline dumbbell press": "/onboarding/goal-muscle-gain.png"
};

export function getExerciseFallbackImageSrc(exercise: Pick<Exercise, "name" | "muscleGroup" | "equipment">): string {
  return "/onboarding/gender-male.png";
}

export function getExerciseImageSrc(exercise: Exercise): string {
  const raw = exercise.imageUrl?.trim();
  const videoId = getYouTubeVideoId(exercise.videoUrl);

  const nameLower = exercise.name?.toLowerCase() || "";
  for (const [key, path] of Object.entries(EXERCISE_PHOTO_MAP)) {
    if (nameLower.includes(key)) {
      return path;
    }
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
