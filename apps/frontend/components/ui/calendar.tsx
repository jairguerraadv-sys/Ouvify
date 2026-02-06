"use client";

import * as React from "react";

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

/**
 * Componente Calendar provisório
 * TODO: Implementar calendário completo com react-day-picker
 */
export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className = "",
}: CalendarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      const date = e.target.value ? new Date(e.target.value) : undefined;
      onSelect(date);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className={`p-3 ${className}`}>
      <input
        type="date"
        value={formatDate(selected)}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded-md"
        disabled={disabled ? disabled(new Date()) : false}
      />
    </div>
  );
}
