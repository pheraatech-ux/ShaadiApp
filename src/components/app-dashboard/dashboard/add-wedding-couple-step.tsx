"use client";

import { CalendarDays } from "lucide-react";
import { useMemo } from "react";

import { Calendar } from "@/components/ui/calendar";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const labelClass = "text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground";
const inputClass = "h-11 rounded-xl bg-muted/40";

function getDaysFromTodayText(dateValue?: Date) {
  if (!dateValue) return "";

  const target = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days from today`;
}

export type AddWeddingCoupleForm = {
  brideName: string;
  groomName: string;
  weddingDate?: Date;
  city: string;
  venueName: string;
  brideFamilyContact: string;
  groomFamilyContact: string;
};

type AddWeddingCoupleStepProps = {
  value: AddWeddingCoupleForm;
  onChange: (next: AddWeddingCoupleForm) => void;
  showErrors?: boolean;
};

function formatDate(date?: Date) {
  if (!date) return "Pick a date";
  return date.toLocaleDateString("en-GB");
}

export function AddWeddingCoupleStep({
  value,
  onChange,
  showErrors = false,
}: AddWeddingCoupleStepProps) {
  const daysFromToday = useMemo(() => getDaysFromTodayText(value.weddingDate), [value.weddingDate]);

  const fieldError = {
    brideName: showErrors && !value.brideName.trim(),
    groomName: showErrors && !value.groomName.trim(),
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-3xl font-semibold tracking-tight">The couple</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic details to create the wedding workspace. You can edit everything later.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Bride&apos;s name *</label>
          <Input
            aria-invalid={fieldError.brideName}
            className={inputClass}
            value={value.brideName}
            onChange={(e) => onChange({ ...value, brideName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Groom&apos;s name *</label>
          <Input
            aria-invalid={fieldError.groomName}
            className={inputClass}
            value={value.groomName}
            onChange={(e) => onChange({ ...value, groomName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Wedding date</label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    inputClass,
                    "w-full justify-between border-input px-3 text-sm font-normal",
                    !value.weddingDate && "text-muted-foreground",
                  )}
                />
              }
            >
              {formatDate(value.weddingDate)}
              <CalendarDays className="size-4 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value.weddingDate}
                onSelect={(date) => onChange({ ...value, weddingDate: date })}
              />
            </PopoverContent>
          </Popover>
          {daysFromToday ? (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{daysFromToday}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className={labelClass}>City</label>
          <Input
            className={inputClass}
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Venue name</label>
        <Input
          className={inputClass}
          value={value.venueName}
          onChange={(e) => onChange({ ...value, venueName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Bride&apos;s family contact</label>
          <PhoneInput
            value={value.brideFamilyContact}
            onChangeNumber={(number) => onChange({ ...value, brideFamilyContact: number })}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Groom&apos;s family contact</label>
          <PhoneInput
            value={value.groomFamilyContact}
            onChangeNumber={(number) => onChange({ ...value, groomFamilyContact: number })}
          />
        </div>
      </div>
    </div>
  );
}
