import type { UpdateTemplate } from './types';

export function formatTime(time: string) {
  return new Date(time).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function buildUpdateContent(template: UpdateTemplate, detail: string) {
  const value = detail || '15';

  switch (template) {
    case 'waiting':
      return `Waiting at ${detail || 'the selected'} bus stop`;
    case 'driver':
      return `Driver not arrived at ${detail || 'the selected'} bus stop`;
    case 'delay':
      return `Bus delay for ${value} minutes`;
    case 'arrived':
      return `Bus arrived at ${detail || 'the selected'} bus stop`;
    case 'general':
      return detail || 'General trip update';
    default:
      return 'Trip update';
  }
}

export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string) {
  const [yearText, monthText, dayText] = dateString.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatDisplayDate(dateString: string) {
  const parsedDate = parseLocalDate(dateString);

  if (!parsedDate) {
    return dateString;
  }

  return parsedDate.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function shiftLocalDate(date: Date, days: number) {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + days);
  return shiftedDate;
}

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfLocalDay(date: Date) {
  const nextDay = startOfLocalDay(date);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setMilliseconds(-1);
  return nextDay;
}
