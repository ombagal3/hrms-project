export const normalHours = 8;
export const monthlyWorkDays = 26;
export const monthlyWorkHours = normalHours * monthlyWorkDays;

export const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export const getLocalDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

export const getPayrollRates = (monthlySalary) => {
  const salary = Number(monthlySalary || 0);
  const dailySalary = salary ? salary / monthlyWorkDays : 0;
  const hourlySalary = salary ? salary / monthlyWorkHours : 0;

  return {
    monthlySalary: salary,
    dailySalary,
    hourlySalary
  };
};

export const calculateCheckoutPayroll = ({
  checkInAt,
  checkOutAt,
  monthlySalary
}) => {
  const { dailySalary, hourlySalary } = getPayrollRates(monthlySalary);
  const checkInTime = new Date(checkInAt);
  const checkOutTime = new Date(checkOutAt);
  const workedHours = Math.max(
    0,
    (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
  );
  const overtimeHours = Math.max(0, workedHours - normalHours);
  const checkedOutBeforeNoon = checkOutTime.getHours() < 12;
  const salaryAmount = checkedOutBeforeNoon
    ? dailySalary / 2
    : workedHours * hourlySalary;

  return {
    workedHours: roundMoney(workedHours),
    overtimeHours: roundMoney(overtimeHours),
    salaryAmount: roundMoney(salaryAmount),
    dayType: checkedOutBeforeNoon ? "half-day" : "workday"
  };
};

export const getCurrentMonthRange = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
};

export const isSameMonthKey = (dateKey, value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  return String(dateKey || "").startsWith(monthKey);
};

export const getPaidSundaysUntilToday = (value = new Date()) => {
  const today = value instanceof Date ? value : new Date(value);
  const { start, end } = getCurrentMonthRange(today);
  const lastDate = end > today ? today : end;
  const sundays = [];
  const cursor = new Date(start);

  while (cursor <= lastDate) {
    if (cursor.getDay() === 0) {
      sundays.push(getLocalDateKey(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return sundays;
};

export const buildSundayAttendance = ({ user, date, monthlySalary }) => {
  const { dailySalary, hourlySalary } = getPayrollRates(monthlySalary);

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    date,
    checkIn: "Sunday Paid",
    checkInAt: "",
    checkOut: "Sunday Paid",
    checkOutAt: "",
    normalHours,
    monthlySalary: Number(monthlySalary || 0),
    hourlySalary,
    workedHours: 0,
    overtimeHours: 0,
    salaryAmount: roundMoney(dailySalary),
    status: "paid-sunday",
    dayType: "paid-sunday"
  };
};

export const getAttendanceTotal = (records) => {
  return roundMoney(
    records.reduce((total, item) => total + Number(item.salaryAmount || 0), 0)
  );
};
