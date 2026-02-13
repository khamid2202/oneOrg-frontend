/* ─── Day constants ─── */
export const DAYS = ["Mon", "Tues", "Wed", "Thu", "Fri"];

export const DAY_MAP = {
  Mon: 1,
  Tues: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
};

export const DAY_BY_INDEX = Object.fromEntries(
  Object.entries(DAY_MAP).map(([key, value]) => [value, key]),
);

/* ─── Layout constants (used as Tailwind class fragments) ─── */
export const CELL_MIN_W = "min-w-[130px]";
export const SKELETON_COLS = 6;
export const SKELETON_ROWS = 6;

/* ─── Helpers ─── */

/** Stable unique key for a teacher inside a timetable item. */
export const getTeacherValue = (item) => {
  const teacherId = item.teacher_id ?? item.teacher?.id;
  if (teacherId != null) return String(teacherId);
  const teacherName =
    typeof item.teacher === "string"
      ? item.teacher
      : item.teacher?.full_name || item.teacher?.name;
  return teacherName ? `name:${teacherName.toLowerCase()}` : "";
};

/** Human-readable class label for a timetable item. */
export const getClassLabel = (item) =>
  item.class_pair ||
  (item.grade != null && item.class != null
    ? `${item.grade}-${item.class}`
    : `Group ${item.group_id}`);

/** Resolve the short day name ("Mon", "Tues", …) for a timetable item. */
export const getDayName = (item) => {
  const rawDay = item.day_index ?? DAY_MAP[item.day] ?? item.day;
  return DAY_BY_INDEX[Number(rawDay)] || rawDay;
};

/** Fill in missing computed fields on a raw timetable row. */
export const transformItem = (item) => ({
  ...item,
  day_index: item.day_index ?? DAY_MAP[item.day],
  time_id: item.time_id ?? `${item.start_time}-${item.end_time}`,
  group_id: item.group_id ?? `${item.grade}-${item.class}`,
});

/* ─── Derived option maps ─── */

export const buildDerivedMaps = (data) => {
  // Class options
  const classMap = new Map();
  data.forEach((item) => {
    if (item.group_id == null) return;
    const value = String(item.group_id);
    if (!classMap.has(value)) classMap.set(value, getClassLabel(item));
  });
  const classOptions = Array.from(classMap, ([value, label]) => ({
    value,
    label,
  })).sort((a, b) => a.label.localeCompare(b.label));

  // Teacher options
  const teacherMap = new Map();
  data.forEach((item) => {
    const value = getTeacherValue(item);
    if (!value || teacherMap.has(value)) return;
    const teacherId = item.teacher_id ?? item.teacher?.id;
    const teacherName =
      typeof item.teacher === "string"
        ? item.teacher
        : item.teacher?.full_name || item.teacher?.name;
    teacherMap.set(value, teacherName || `Teacher ${teacherId}`);
  });
  const teacherOptions = Array.from(teacherMap, ([value, label]) => ({
    value,
    label,
  })).sort((a, b) => a.label.localeCompare(b.label));

  // Day options (only days present in data, in canonical order)
  const daySet = new Set();
  data.forEach((item) => {
    const dayName = getDayName(item);
    if (DAYS.includes(dayName)) daySet.add(dayName);
  });
  const dayOptions = DAYS.filter((day) => daySet.has(day));

  return { classOptions, teacherOptions, dayOptions };
};

/* ─── Grid builder ─── */

export const buildGrid = (data) => {
  const timeSlotsMap = new Map();
  data.forEach((item) => {
    if (!timeSlotsMap.has(item.time_id)) {
      timeSlotsMap.set(item.time_id, {
        id: item.time_id,
        start: item.start_time,
        end: item.end_time,
        slot: item.time_slot,
      });
    }
  });
  const timeSlots = Array.from(timeSlotsMap.values()).sort((a, b) =>
    (a.start || "").localeCompare(b.start || ""),
  );

  const classesMap = new Map();
  data.forEach((item) => {
    if (!classesMap.has(item.group_id)) {
      classesMap.set(item.group_id, {
        id: item.group_id,
        class_pair: item.class_pair,
        grade: item.grade,
        class: item.class,
      });
    }
  });
  const classesSorted = Array.from(classesMap.values()).sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return (a.class || "").toString().localeCompare((b.class || "").toString());
  });

  const gridData = new Map();
  data.forEach((item) => {
    const key = `${item.day_index}_${item.time_id}_${item.group_id}`;
    gridData.set(key, item);
  });

  return { timeSlots, classesSorted, gridData };
};

/* ─── Client-side filter ─── */

export const filterTimetableData = (data, filters) => {
  let result = data;

  if (filters.classes.length > 0) {
    result = result.filter((item) =>
      filters.classes.includes(String(item.group_id ?? "")),
    );
  }
  if (filters.teachers.length > 0) {
    result = result.filter((item) =>
      filters.teachers.includes(getTeacherValue(item)),
    );
  }
  if (filters.days.length > 0) {
    result = result.filter((item) => filters.days.includes(getDayName(item)));
  }
  return result;
};
