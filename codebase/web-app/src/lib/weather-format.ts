import { format, formatDistanceToNowStrict } from 'date-fns';

export function formatReadingTime(timestamp: string) {
  return format(new Date(timestamp), 'MMM d, yyyy h:mm:ss a');
}

export function formatReadingAge(timestamp: string) {
  return `${formatDistanceToNowStrict(new Date(timestamp))} ago`;
}

export function formatNumber(value: number | null | undefined, unit = '') {
  if (value == null) {
    return 'N/A';
  }

  return `${Number(value.toFixed(1)).toLocaleString()}${unit}`;
}
