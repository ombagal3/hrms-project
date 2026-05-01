// Constants
export const WORK_START = "09:00";
export const WORK_END = "17:00";
export const WORK_HOURS = 8;
export const LATE_THRESHOLD_MINUTES = 45; // 9:45 considered half day
export const PENALTY_AMOUNT = 500;
export const FREE_PAID_LEAVES = 1;

// Parse time string "HH:MM" to minutes from midnight
export const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Minutes to "HH:MM"
export const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Get today's date string YYYY-MM-DD
export const todayStr = () => new Date().toISOString().split("T")[0];

// Check if date is Sunday
export const isSunday = (dateStr) => new Date(dateStr).getDay() === 0;

// Calculate worked hours between check-in and check-out
export const calcWorkedHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const inMins = timeToMinutes(checkIn);
  const outMins = timeToMinutes(checkOut);
  return Math.max(0, (outMins - inMins) / 60);
};

// Determine day status
// Returns: { status, workedHours, deduction, penaltyAmount, salaryEarned }
export const calcDayResult = (record, hourlyRate) => {
  if (!record) return null;

  const { checkIn, checkOut, date } = record;
  const workedHours = calcWorkedHours(checkIn, checkOut);
  const inMins = checkIn ? timeToMinutes(checkIn) : null;
  const startMins = timeToMinutes(WORK_START);

  let status = "present";
  let deduction = 0;
  let penaltyAmount = 0;
  let salaryEarned = 0;

  if (!checkIn) {
    status = "absent";
    deduction = hourlyRate * WORK_HOURS; // full day deduction
  } else if (!checkOut) {
    // Missed checkout = penalty
    status = "missed_checkout";
    penaltyAmount = PENALTY_AMOUNT;
    const halfDaySalary = (hourlyRate * WORK_HOURS) / 2;
    salaryEarned = halfDaySalary;
    deduction = halfDaySalary + penaltyAmount;
  } else {
    const lateMinutes = inMins - startMins;

    if (lateMinutes >= LATE_THRESHOLD_MINUTES) {
      // More than 45 min late = half day
      status = "half_day";
      salaryEarned = (workedHours / WORK_HOURS) * (hourlyRate * WORK_HOURS);
      deduction = (hourlyRate * WORK_HOURS) / 2;
    } else {
      status = "present";
      salaryEarned = Math.min(workedHours, WORK_HOURS) * hourlyRate;
    }
  }

  return { status, workedHours, deduction, penaltyAmount, salaryEarned };
};

// Calculate monthly salary summary
export const calcMonthlySummary = (attendanceRecords, leaves, hourlyRate, month, year) => {
  const totalWorkDays = getDaysInMonth(month, year).filter(d => !isSunday(d));
  
  let totalSalary = 0;
  let totalDeductions = 0;
  let totalPenalty = 0;
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let leaveDays = 0;

  // Process paid leaves
  const monthLeaves = leaves.filter(l => {
    const ld = new Date(l.date);
    return ld.getMonth() + 1 === month && ld.getFullYear() === year && l.status === "approved";
  });

  const paidLeaveCount = monthLeaves.filter(l => l.type === "paid").length;
  const extraPaidLeaves = Math.max(0, paidLeaveCount - FREE_PAID_LEAVES);

  totalWorkDays.forEach(day => {
    const record = attendanceRecords.find(a => a.date === day);
    const isOnLeave = monthLeaves.find(l => l.date === day);

    if (isOnLeave) {
      leaveDays++;
      if (isOnLeave.type === "paid" && paidLeaveCount <= FREE_PAID_LEAVES) {
        totalSalary += hourlyRate * WORK_HOURS; // free paid leave
      }
      // extra paid leave = deduction applied
      return;
    }

    const result = calcDayResult(record, hourlyRate);
    if (!result) {
      absentDays++;
      totalDeductions += hourlyRate * WORK_HOURS;
      return;
    }

    totalSalary += result.salaryEarned;
    totalDeductions += result.deduction;
    totalPenalty += result.penaltyAmount;

    if (result.status === "present") presentDays++;
    else if (result.status === "absent") absentDays++;
    else if (result.status === "half_day" || result.status === "missed_checkout") halfDays++;
  });

  // Extra paid leave deduction
  const extraLeaveDeduction = extraPaidLeaves * (hourlyRate * WORK_HOURS);
  totalDeductions += extraLeaveDeduction;

  const netSalary = Math.max(0, totalSalary - totalPenalty - extraLeaveDeduction);

  return {
    totalWorkDays: totalWorkDays.length,
    presentDays,
    absentDays,
    halfDays,
    leaveDays,
    grossSalary: totalSalary,
    deductions: totalDeductions,
    penalty: totalPenalty,
    netSalary,
    extraLeaveDeduction,
  };
};

// Get all non-Sunday dates in a month
export const getDaysInMonth = (month, year) => {
  const days = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const str = date.toISOString().split("T")[0];
    days.push(str);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Format currency
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// Get current time HH:MM
export const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const ROLE_COLORS = {
  admin: "#e74c3c",
  manager: "#3498db",
  employee: "#2ecc71",
};

export const STATUS_BADGES = {
  present: { label: "Present", color: "success" },
  absent: { label: "Absent", color: "danger" },
  half_day: { label: "Half Day", color: "warning" },
  missed_checkout: { label: "Missed Checkout", color: "warning" },
  leave: { label: "On Leave", color: "info" },
  sunday: { label: "Sunday", color: "secondary" },
};
