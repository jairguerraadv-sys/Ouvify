"use client";

import * as React from "react";

export interface PopoverProps {
  children: React.ReactNode;
}

export interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface PopoverContentProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Componente Popover provisório
 * TODO: Implementar popover completo com @radix-ui/react-popover
 */
export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function PopoverTrigger({ children, asChild }: PopoverTriggerProps) {
  const { open, setOpen } = React.useContext(PopoverContext);

  const handleClick = () => {
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function PopoverContent({
  className = "",
  children,
}: PopoverContentProps) {
  const { open, setOpen } = React.useContext(PopoverContext);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className={`absolute z-50 mt-2 ${className}`}>{children}</div>
    </>
  );
}
