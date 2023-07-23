import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, numDecimal: number) {
  return (Math.round(num * 100) / 100).toFixed(numDecimal);
}

export function roundToNearestHalf(num: number) {
  return Math.round(num * 2) / 2;
}
