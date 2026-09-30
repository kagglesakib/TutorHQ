/**
 * Utilities for formatting dates with day names and billing months with month names and MM-YYYY code.
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Parses a date string safely without UTC timezone shift.
 */
export function parseDateSafe(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  const str = String(dateInput).trim();
  if (!str) return null;

  // Check YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  // Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats date to display Day Name with date.
 * Example:
 *  - "2026-09-29" -> "Tue, 29 Sep 2026" (or "Tuesday, 29 Sep 2026" if fullDay: true)
 */
export function formatDateWithDay(
  dateInput?: string | Date | null,
  options: {
    fullDay?: boolean;
    fullMonth?: boolean;
    includeYear?: boolean;
  } = {}
): string {
  if (!dateInput) return '—';
  const d = parseDateSafe(dateInput);
  if (!d) return String(dateInput);

  const { fullDay = false, fullMonth = false, includeYear = true } = options;

  const dayOfWeek = fullDay ? DAY_NAMES[d.getDay()] : DAY_SHORT_NAMES[d.getDay()];
  const dayOfMonth = d.getDate();
  const month = fullMonth ? MONTH_NAMES[d.getMonth()] : MONTH_SHORT_NAMES[d.getMonth()];
  const year = d.getFullYear();

  if (!includeYear) {
    return `${dayOfWeek}, ${dayOfMonth} ${month}`;
  }

  return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
}

/**
 * Formats a billing month string (e.g. "2026-06", "06-2026", "2026-6")
 * to show the Month Name along with the "06-2026" (MM-YYYY) format.
 * Example:
 *  - "2026-06" -> "June 2026 (06-2026)"
 *  - "2026-09" -> "September 2026 (09-2026)"
 */
export function formatBillingMonth(
  monthInput?: string | null,
  options: {
    shortMonth?: boolean;
    compact?: boolean;
  } = {}
): string {
  if (!monthInput) return 'Current';

  const str = String(monthInput).trim();
  if (!str) return 'Current';

  let year: number | null = null;
  let monthNum: number | null = null; // 1 - 12

  // Match YYYY-MM
  const yyyyMm = str.match(/^(\d{4})[-/](\d{1,2})/);
  if (yyyyMm) {
    year = parseInt(yyyyMm[1], 10);
    monthNum = parseInt(yyyyMm[2], 10);
  } else {
    // Match MM-YYYY
    const mmYyyy = str.match(/^(\d{1,2})[-/](\d{4})/);
    if (mmYyyy) {
      monthNum = parseInt(mmYyyy[1], 10);
      year = parseInt(mmYyyy[2], 10);
    }
  }

  if (monthNum === null || year === null || monthNum < 1 || monthNum > 12) {
    // Fallback if unable to parse standard numeric month
    return str;
  }

  const mmCode = String(monthNum).padStart(2, '0');
  const code = `${mmCode}-${year}`;
  const monthName = options.shortMonth
    ? MONTH_SHORT_NAMES[monthNum - 1]
    : MONTH_NAMES[monthNum - 1];

  if (options.compact) {
    return `${monthName} (${code})`;
  }

  return `${monthName} ${year} (${code})`;
}

/**
 * Parses date and returns parts for flexible responsive display
 */
export function getDateWithDayParts(dateInput?: string | Date | null) {
  if (!dateInput) return null;
  const d = parseDateSafe(dateInput);
  if (!d) return null;

  return {
    dayOfWeek: DAY_NAMES[d.getDay()],
    dayShort: DAY_SHORT_NAMES[d.getDay()],
    dayOfMonth: d.getDate(),
    monthShort: MONTH_SHORT_NAMES[d.getMonth()],
    monthFull: MONTH_NAMES[d.getMonth()],
    year: d.getFullYear(),
    formatted: `${DAY_SHORT_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT_NAMES[d.getMonth()]} ${d.getFullYear()}`,
  };
}

/**
 * Parses billing month and returns parts for structured multi-line or inline rendering
 */
export function getBillingMonthParts(monthInput?: string | null) {
  if (!monthInput) return null;
  const str = String(monthInput).trim();
  if (!str) return null;

  let year: number | null = null;
  let monthNum: number | null = null;

  const yyyyMm = str.match(/^(\d{4})[-/](\d{1,2})/);
  if (yyyyMm) {
    year = parseInt(yyyyMm[1], 10);
    monthNum = parseInt(yyyyMm[2], 10);
  } else {
    const mmYyyy = str.match(/^(\d{1,2})[-/](\d{4})/);
    if (mmYyyy) {
      monthNum = parseInt(mmYyyy[1], 10);
      year = parseInt(mmYyyy[2], 10);
    }
  }

  if (monthNum === null || year === null || monthNum < 1 || monthNum > 12) {
    return {
      monthName: str,
      monthShort: str,
      year: '',
      code: str,
      fullLabel: str,
    };
  }

  const mmCode = String(monthNum).padStart(2, '0');
  const code = `${mmCode}-${year}`;
  const monthName = MONTH_NAMES[monthNum - 1];
  const monthShort = MONTH_SHORT_NAMES[monthNum - 1];

  return {
    monthName,
    monthShort,
    year,
    code,
    fullLabel: `${monthName} ${year} (${code})`,
    compactLabel: `${monthShort} ${year} (${code})`,
  };
}
