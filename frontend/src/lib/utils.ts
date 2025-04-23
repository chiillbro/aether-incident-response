import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    // Handle cases with more than 2 names, just take first and last
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    } else if (names.length === 1 && names[0].length > 0) {
        return names[0].substring(0, 2).toUpperCase();
    }
    return '?';
};

