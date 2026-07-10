"use client";

import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { CalendarIcon, X } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Parse "yyyy-mm-dd" en Date locale (évite le décalage de fuseau). */
function isoToDate(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Formate une Date en "yyyy-mm-dd" (sans fuseau). */
function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Sélecteur de date crème : bouton + popover calendrier. Entrée/sortie en ISO
 * `yyyy-mm-dd` (comme les colonnes DB) pour ne rien changer aux actions.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Choisir une date…",
  clearable = true,
  id,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = isoToDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            className={cn(
              "flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              !value && "text-muted-foreground",
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span className="flex-1 truncate">
          {value ? dayjs(value).locale("fr").format("D MMMM YYYY") : placeholder}
        </span>
        {clearable && value && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Effacer la date"
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            <X className="size-3.5" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? dateToIso(date) : null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
