import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export das outras libs para conveniência
export * from "./api";
export * from "./validation";
export * from "./helpers";
export * from "./types";
