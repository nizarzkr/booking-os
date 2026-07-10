"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays={showOutsideDays}
      className={cn("relative p-1", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center px-8",
        caption_label: "text-sm font-medium capitalize",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
        button_next:
          "absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-center text-[0.7rem] font-medium uppercase text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center text-sm",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-md font-normal transition-colors hover:bg-accent hover:text-foreground aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary",
        today: "font-semibold text-primary aria-selected:text-primary-foreground",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
