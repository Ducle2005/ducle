const DAY_LABELS: Record<string, string> = {
  MONDAY: "Thứ hai",
  TUESDAY: "Thứ ba",
  WEDNESDAY: "Thứ tư",
  THURSDAY: "Thứ năm",
  FRIDAY: "Thứ sáu",
  SATURDAY: "Thứ bảy",
  SUNDAY: "Chủ nhật",
};

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  CHEST: "Ngực",
  BACK: "Lưng",
  LEGS: "Chân",
  SHOULDERS: "Vai",
  ARMS: "Tay",
  CORE: "Cơ lõi",
  GLUTES: "Mông",
  FULL_BODY: "Toàn thân",
  CARDIO: "Tim mạch",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Mới bắt đầu",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  DUMBBELL: "Tạ đơn",
  BARBELL: "Tạ đòn",
  BODYWEIGHT: "Trọng lượng cơ thể",
  MACHINE: "Máy tập",
  CABLE: "Cáp kéo",
  KETTLEBELL: "Tạ ấm",
  RESISTANCE_BAND: "Dây kháng lực",
  MEDICINE_BALL: "Bóng tạ",
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Bữa sáng",
  LUNCH: "Bữa trưa",
  DINNER: "Bữa tối",
  SNACK: "Bữa phụ",
};

const GOAL_LABELS: Record<string, string> = {
  MAINTAIN: "Duy trì",
  CUT: "Giảm mỡ",
  BULK: "Tăng cơ",
};

function fallbackLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLocalizedValue(
  labels: Record<string, string>,
  value: string | null | undefined,
  emptyLabel?: string
) {
  if (!value) {
    return emptyLabel ?? "";
  }

  return labels[value] ?? fallbackLabel(value);
}

export function getDayLabel(value: string | null | undefined) {
  return getLocalizedValue(DAY_LABELS, value, "Ngày bất kỳ");
}

export function getMuscleGroupLabel(value: string) {
  return getLocalizedValue(MUSCLE_GROUP_LABELS, value);
}

export function getDifficultyLabel(value: string) {
  return getLocalizedValue(DIFFICULTY_LABELS, value);
}

export function getEquipmentLabel(value: string) {
  return getLocalizedValue(EQUIPMENT_LABELS, value);
}

export function getMealTypeLabel(value: string) {
  return getLocalizedValue(MEAL_TYPE_LABELS, value);
}

export function getGoalLabel(value: string) {
  return getLocalizedValue(GOAL_LABELS, value);
}
