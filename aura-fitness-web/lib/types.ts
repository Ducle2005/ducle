export type Goal = "CUT" | "BULK" | "MAINTAIN";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface AuthUser {
  email: string;
  name: string;
  avatarUrl?: string;
  roles?: string[];
}

export interface JwtAuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface Profile {
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  waterIntake: number | null;
  calorieTarget: number | null;
  goal: Goal | null;
  avatarUrl?: string;
  targetWeight?: number;
  workoutDaysPerWeek?: number;
  experienceLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
  preferredWorkoutType?: "GYM" | "CARDIO" | "CALISTHENICS" | string;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
  reminderDays?: string | null;
  theme?: "DARK" | "LIGHT" | string;
  weightUnit?: "KG" | "LB" | string;
  heightUnit?: "CM" | "FT" | string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIcon: string;
  dateEarned: string;
}

export interface GamificationSummary {
  level: number;
  experience: number;
  nextLevelExp: number;
  streak: number;
  totalAchievements: number;
  recentAchievements: Achievement[];
}

export interface FoodLog {
  id: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  date: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionMacroTargets {
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutritionSummary {
  logs: FoodLog[];
  totals: NutritionTotals;
  target: number | null;
  macroTargets?: NutritionMacroTargets;
}

export interface WeightHistoryItem {
  id: number;
  weight: number;
  date: string;
}

export interface WeightTrends {
  history: WeightHistoryItem[];
  change7d?: number;
  change30d?: number;
}

export interface VolumeProgressionItem {
  date: string;
  volume: number;
  planName: string;
}

export interface WeeklyComparison {
  currentWeekVolume: number;
  lastWeekVolume: number;
  deltaPercentage: number;
}

export interface StagnationInsight {
  status: "STAGNANT" | "PROGRESSING" | "INSUFFICIENT_DATA";
  advice?: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string[];
  imageUrl: string;
  videoUrl: string;
}

export interface ExercisePageResponse {
  content: Exercise[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface WorkoutExercise {
  id: number;
  exercise: Exercise;
  targetSets: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  supersetGroup?: string | null;
  notes?: string | null;
  sortOrder: number | null;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  description: string | null;
  scheduledDay: string | null;
  goal?: string | null;
  programWeek?: number | null;
  archived?: boolean;
  workoutExercises: WorkoutExercise[];
}

export interface WorkoutSet {
  id?: number;
  workoutExercise: WorkoutExercise;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  setType?: string | null;
  rpe?: number | null;
  rir?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  supersetGroup?: string | null;
  notes?: string | null;
  completed: boolean;
}

export interface WorkoutSession {
  id: number;
  workoutPlan: WorkoutPlan | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
  workoutSets: WorkoutSet[];
}

export interface WorkoutHistoryItem {
  sessionId: number;
  planName: string;
  scheduledDay: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  durationMinutes: number;
  completedSets: number;
  exerciseCount: number;
  totalVolume: number;
}

export interface WorkoutSetLogInput {
  workoutExerciseId: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  setType?: string | null;
  rpe?: number | null;
  rir?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  supersetGroup?: string | null;
  notes?: string | null;
  completed: boolean;
}

export interface WorkoutPlanExerciseDraft {
  exercise: Exercise;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  supersetGroup?: string | null;
  notes?: string | null;
  sortOrder: number;
}

export interface WorkoutPlanCreateRequest {
  name: string;
  description: string;
  scheduledDay: string | null;
  goal?: string | null;
  programWeek?: number | null;
  workoutExercises: Array<{
    exercise: { id: number };
    targetSets: number;
    targetReps: number;
    targetWeight: number | null;
    restSeconds?: number | null;
    tempo?: string | null;
    supersetGroup?: string | null;
    notes?: string | null;
    sortOrder: number;
  }>;
}

export interface WorkoutExercisePerformance {
  exerciseId: number;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  bestOneRepMax: number;
  bestVolume: number;
  trend: "INSUFFICIENT_DATA" | "PROGRESSING" | "DROPPING" | "PLATEAU" | string;
  recommendation: string;
  recentSets: Array<{
    startTime: string;
    planName: string;
    setNumber: number | null;
    weight: number | null;
    reps: number | null;
    setType?: string | null;
    rpe?: number | null;
    rir?: number | null;
    notes?: string | null;
    volume: number;
    oneRepMax: number;
  }>;
}
