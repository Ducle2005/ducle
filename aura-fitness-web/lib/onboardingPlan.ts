import { apiFetch } from "./api";
import { exerciseApi } from "./exerciseApi";
import { workoutApi } from "./workoutApi";
import type { Exercise, Goal, Profile, WorkoutPlanCreateRequest } from "./types";

export interface OnboardingSelections {
  gender: string;
  ageGroup: string;
  bodyType: string;
  goal: string;
  diet: string;
  sugar: string;
  water: string;
  heightUnit: "cm" | "ft";
  heightValue: string;
  fitnessLevel: string;
  focusAreas: string[];
  equipment: string[];
}

const AURA_PLAN_PREFIX = "Aura AI";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const includesAny = (value: string, keys: string[]) => keys.some((key) => normalize(value).includes(key));

function goalFromSelection(goal: string): Goal {
  if (includesAny(goal, ["giam", "cut"])) return "CUT";
  if (includesAny(goal, ["tang", "bulk", "co bap"])) return "BULK";
  return "MAINTAIN";
}

function ageFromGroup(ageGroup: string) {
  const numbers = ageGroup.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length >= 2) return Math.round((numbers[0] + numbers[1]) / 2);
  return numbers[0] ?? 28;
}

function heightInCm(unit: "cm" | "ft", value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(unit === "ft" ? parsed * 30.48 : parsed);
}

function waterIntakeLiters(water: string) {
  const normalized = normalize(water);
  if (normalized.includes("ca phe") || normalized.includes("tra")) return 0.3;
  if (normalized.includes("it hon")) return 0.5;
  if (normalized.includes("2-6")) return 1.2;
  if (normalized.includes("7-10")) return 2.1;
  return 2.8;
}

function experienceLevelFromSelection(level: string) {
  if (includesAny(level, ["so cap", "beginner"])) return "BEGINNER";
  if (includesAny(level, ["cao cap", "advanced"])) return "ADVANCED";
  return "INTERMEDIATE";
}

function workoutTypeFromEquipment(equipment: string[]) {
  const joined = normalize(equipment.join(" "));
  if (includesAny(joined, ["ta don", "barbell", "kettlebell", "pull-up", "keo xa"])) return "GYM";
  if (includesAny(joined, ["day nhay", "cardio"])) return "CARDIO";
  return "CALISTHENICS";
}

function buildProfilePayload(selections: OnboardingSelections): Partial<Profile> {
  const height = heightInCm(selections.heightUnit, selections.heightValue);
  const goal = goalFromSelection(selections.goal);

  return {
    age: ageFromGroup(selections.ageGroup),
    gender: includesAny(selections.gender, ["nu", "female"]) ? "FEMALE" : "MALE",
    height,
    waterIntake: waterIntakeLiters(selections.water),
    goal,
    workoutDaysPerWeek: 3,
    experienceLevel: experienceLevelFromSelection(selections.fitnessLevel),
    preferredWorkoutType: workoutTypeFromEquipment(selections.equipment),
    heightUnit: "CM",
    weightUnit: "KG",
  };
}

function stripNullishValues<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null && value !== undefined),
  ) as Partial<T>;
}

const planBlueprints = [
  {
    name: "Aura AI - Buổi 1: Nền tảng toàn thân",
    description: "Buổi mở đầu được cá nhân hóa từ lựa chọn onboarding: tập toàn thân, kiểm soát kỹ thuật và xây nền sức bền.",
    scheduledDay: "MONDAY",
    names: ["Squat", "Bench Press", "Barbell Row", "Overhead Press", "Plank"],
  },
  {
    name: "Aura AI - Buổi 2: Thân trên & vùng ưu tiên",
    description: "Tập trung ngực, vai, lưng và tay để cải thiện vóc dáng theo vùng cơ bạn đã chọn.",
    scheduledDay: "WEDNESDAY",
    names: ["Incline Dumbbell Press", "Pull Up", "Lateral Raise", "Bicep Curl", "Tricep Extension"],
  },
  {
    name: "Aura AI - Buổi 3: Chân, mông & core",
    description: "Tăng sức mạnh thân dưới, ổn định core và hoàn thiện tuần tập đầu tiên.",
    scheduledDay: "FRIDAY",
    names: ["Deadlift", "Leg Press", "Romanian Deadlift", "Calf Raise", "Crunch"],
  },
];

function findExercise(catalog: Exercise[], nameMatch: string, usedIds: Set<number>) {
  const normalizedName = normalize(nameMatch);
  return (
    catalog.find((exercise) => !usedIds.has(exercise.id) && normalize(exercise.name).includes(normalizedName)) ??
    catalog.find((exercise) => !usedIds.has(exercise.id) && normalizedName.includes(normalize(exercise.name)))
  );
}

function fallbackExercises(catalog: Exercise[], usedIds: Set<number>, count: number) {
  return catalog.filter((exercise) => !usedIds.has(exercise.id)).slice(0, count);
}

function buildWorkoutExercises(catalog: Exercise[], names: string[], selections: OnboardingSelections) {
  const usedIds = new Set<number>();
  const experience = experienceLevelFromSelection(selections.fitnessLevel);
  const goal = goalFromSelection(selections.goal);
  const baseSets = experience === "ADVANCED" ? 4 : experience === "BEGINNER" ? 3 : 4;
  const baseReps = goal === "BULK" ? 8 : goal === "CUT" ? 12 : 10;

  const matched = names
    .map((name) => {
      const exercise = findExercise(catalog, name, usedIds);
      if (exercise) usedIds.add(exercise.id);
      return exercise;
    })
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  const exercises = matched.length >= 3 ? matched : [...matched, ...fallbackExercises(catalog, usedIds, 5 - matched.length)];

  return exercises.slice(0, 5).map((exercise, index) => ({
    exercise: { id: exercise.id },
    targetSets: baseSets,
    targetReps: index === 0 && goal === "BULK" ? 6 : baseReps,
    targetWeight: null,
    restSeconds: goal === "CUT" ? 60 : 90,
    tempo: "2-0-2",
    notes: "Tạo tự động từ bài kiểm tra Aura Fitness.",
    sortOrder: index + 1,
  }));
}

function personalizePlan(plan: (typeof planBlueprints)[number], selections: OnboardingSelections): WorkoutPlanCreateRequest {
  const goal = goalFromSelection(selections.goal);
  const goalText = goal === "CUT" ? "giảm mỡ" : goal === "BULK" ? "tăng cơ" : "giữ dáng";
  const focusText = selections.focusAreas.length > 0 ? selections.focusAreas.join(", ") : "toàn thân";

  return {
    name: plan.name,
    description: `${plan.description} Mục tiêu chính: ${goalText}. Vùng ưu tiên: ${focusText}.`,
    scheduledDay: plan.scheduledDay,
    goal,
    programWeek: 1,
    workoutExercises: [],
  };
}

export async function completeOnboardingPlan(selections: OnboardingSelections) {
  const currentProfile = await apiFetch<Profile>("/profile").catch(() => null);
  const profilePayload = {
    ...(currentProfile ?? {}),
    ...stripNullishValues(buildProfilePayload(selections) as Record<string, unknown>),
  };

  await apiFetch<Profile>("/profile", {
    method: "PUT",
    body: JSON.stringify(profilePayload),
  }).catch((error) => {
    console.warn("Could not save onboarding profile", error);
  });

  const existingPlans = await workoutApi.getPlans().catch(() => []);
  const hasAuraPlan = existingPlans.some((plan) => plan.name?.startsWith(AURA_PLAN_PREFIX));
  if (hasAuraPlan) return;

  const { content: catalog } = await exerciseApi.getExercises({ page: 0, size: 200 });
  if (catalog.length === 0) return;

  for (const blueprint of planBlueprints) {
    const plan = personalizePlan(blueprint, selections);
    const workoutExercises = buildWorkoutExercises(catalog, blueprint.names, selections);
    if (workoutExercises.length > 0) {
      await workoutApi.createPlan({ ...plan, workoutExercises });
    }
  }
}
