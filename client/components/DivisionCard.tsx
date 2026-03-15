import React, { useState } from "react";
import { DriverSlot } from "./DriverSlot";

interface Division {
  id: string;
  title: string;
  icon: string;
  div_status: "hiring" | "urgent" | "full";
  slots_oo: number;
  slots_cd: number;
  last_updated: string;
}

interface Driver {
  id: string;
  name: string;
  position: string;
  company: string;
  Truck: string;
  status: string;
  notes: string;
  division_id: string;
  created_at: string;
}

interface DivisionCardProps {
  division: Division;
  drivers: Driver[];
  onAddDriver: (divisionId: string, position: string) => void;
  onEditSlots: (divisionId: string) => void;
  onUpdateDriver: (driverId: string, field: string, value: any) => void;
  onDeleteDriver: (driverId: string) => void;
  onStatusChange: (driverId: string, status: string) => void;
  onCycleStatus: (divisionId: string) => void;
  terminalStatuses: string[];
}

function isOO(position?: string) {
  return (
    position &&
    (position.toLowerCase().includes("owner") ||
      position.toLowerCase().includes("lease"))
  );
}

function isCD(position?: string) {
  return position && position.toLowerCase().includes("company");
}

export function DivisionCard({
  division,
  drivers,
  onAddDriver,
  onEditSlots,
  onUpdateDriver,
  onDeleteDriver,
  onStatusChange,
  onCycleStatus,
  terminalStatuses,
}: DivisionCardProps) {
  const activeDrivers = drivers.filter(
    (d) => !terminalStatuses.includes(d.status)
  );

  const ooDrivers = activeDrivers.filter((d) => isOO(d.position));
  const cdDrivers = activeDrivers.filter((d) => isCD(d.position));

  const totalOO = division.slots_oo || 0;
  const totalCD = division.slots_cd || 0;
  const total = totalOO + totalCD;

  const coveredOO = ooDrivers.length;
  const coveredCD = cdDrivers.length;
  const covered = activeDrivers.length;

  const pct = total > 0 ? Math.min(100, Math.round((covered / total) * 100)) : 0;
  const emptyOO = Math.max(0, totalOO - coveredOO);
  const emptyCD = Math.max(0, totalCD - coveredCD);

  const statusConfig = {
    hiring: { label: "🔴 Hiring", color: "text-destructive border-destructive" },
    urgent: {
      label: "🚨 Urgent Hire",
      color: "text-destructive border-destructive",
    },
    full: { label: "🟢 Full", color: "text-accent-green border-accent-green" },
  };

  const currentStatus = statusConfig[division.div_status];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{division.icon}</span>
          <h2 className="text-xl font-bold text-foreground">{division.title}</h2>
        </div>
        <button
          onClick={() => onCycleStatus(division.id)}
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${currentStatus.color} cursor-pointer hover:opacity-80 transition-opacity`}
          title="Click to cycle status"
        >
          {currentStatus.label}
        </button>
      </div>

      {/* Progress Section */}
      <div className="p-6 border-b border-border bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-3xl font-bold text-operator-blue">
                {covered}
              </span>
              <span className="text-base text-muted-foreground ml-2">/ {total} covered</span>
            </div>
            <div className="text-base text-muted-foreground">
              CD: <span className="font-bold text-operator-blue">{coveredCD}</span>
              <span className="mx-2">·</span>
              OO: <span className="font-bold text-company-green">{coveredOO}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onEditSlots(division.id)}
              className="text-xs font-semibold text-muted-foreground border border-border hover:border-accent hover:text-foreground px-3 py-1 rounded-md transition-colors"
            >
              ➕ Add Slots
            </button>
            <button
              className="text-xs font-semibold text-muted-foreground border border-border hover:border-accent-blue hover:text-operator-blue px-3 py-1 rounded-md transition-colors"
              title={`Last updated: ${division.last_updated || "—"}`}
            >
              🕒 {division.last_updated || "—"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-end">
            <span className="text-sm font-bold text-operator-blue">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-operator-blue transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div className="p-6 space-y-6">
        {/* Owner Operators */}
        <div>
          <h3 className="text-xs font-bold text-operator-blue uppercase tracking-wide mb-3">
            🔵 Owner Operators
          </h3>
          <div className="space-y-2">
            {ooDrivers.map((driver) => (
              <DriverSlot
                key={driver.id}
                driver={driver}
                onUpdate={onUpdateDriver}
                onDelete={onDeleteDriver}
                onStatusChange={onStatusChange}
              />
            ))}
            {Array.from({ length: emptyOO }).map((_, i) => (
              <button
                key={`empty-oo-${i}`}
                onClick={() => onAddDriver(division.id, "Owner Operator")}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-sm text-slate-400 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                <span>Add Driver</span>
              </button>
            ))}
          </div>
        </div>

        {/* Company Drivers */}
        <div>
          <h3 className="text-xs font-bold text-company-green uppercase tracking-wide mb-3">
            🟢 Company Drivers
          </h3>
          <div className="space-y-2">
            {cdDrivers.map((driver) => (
              <DriverSlot
                key={driver.id}
                driver={driver}
                onUpdate={onUpdateDriver}
                onDelete={onDeleteDriver}
                onStatusChange={onStatusChange}
              />
            ))}
            {Array.from({ length: emptyCD }).map((_, i) => (
              <button
                key={`empty-cd-${i}`}
                onClick={() => onAddDriver(division.id, "Company Driver")}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-sm text-slate-400 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                <span>Add Driver</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
