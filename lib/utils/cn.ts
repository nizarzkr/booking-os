import { clsx, type ClassValue } from "clsx";

/** Concatène des classes CSS conditionnelles (helper pour Tailwind). */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
