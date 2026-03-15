import React, { useState } from "react";

interface Driver {
  id: string;
  name: string;
  position: string;
  company: string;
  Truck: string;
  status: string;
  notes: string;
}

interface DriverSlotProps {
  driver: Driver;
  onUpdate: (driverId: string, field: string, value: any) => void;
  onDelete: (driverId: string) => void;
  onStatusChange: (driverId: string, status: string) => void;
}

const STATUSES = [
  { key: "preapproval", label: "Pre-Approval", icon: "🔍" },
  { key: "drugtest", label: "Drug Test Pending", icon: "🧪" },
  { key: "onhold", label: "On Hold", icon: "⏸" },
  { key: "ready", label: "Ready to Go", icon: "✅" },
  { key: "ghosted", label: "Ghosted", icon: "👻" },
  { key: "hired", label: "Hired", icon: "🏆" },
  { key: "disqualified", label: "Disqualified", icon: "🚫" },
];

const COMPANIES = [
  "Sayram Express LLC",
  "Iconic Logistics LLC",
  "Sayram Logistics Co",
  "Golden Mile LLC",
  "Money Express INC",
];

export function DriverSlot({ driver, onUpdate, onDelete, onStatusChange }: DriverSlotProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const isOO =
    driver.position &&
    (driver.position.toLowerCase().includes("owner") ||
      driver.position.toLowerCase().includes("lease"));

  const statusInfo = STATUSES.find((s) => s.key === driver.status);

  return (
    <div className="bg-white border border-border rounded-lg p-3 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Name */}
      <div className="flex-shrink-0 sm:w-32">
        {editingField === "name" ? (
          <input
            type="text"
            defaultValue={driver.name}
            onBlur={(e) => {
              onUpdate(driver.id, "name", e.target.value);
              setEditingField(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdate(driver.id, "name", e.currentTarget.value);
                setEditingField(null);
              }
            }}
            autoFocus
            className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        ) : (
          <div
            onClick={() => setEditingField("name")}
            className="font-semibold text-sm text-foreground cursor-text"
          >
            {driver.name || "—"}
          </div>
        )}
      </div>

      {/* Position */}
      <div
        className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${
          isOO ? "text-operator-blue" : "text-company-green"
        }`}
      >
        {driver.position || "—"}
      </div>

      {/* Company */}
      <select
        value={driver.company || ""}
        onChange={(e) => onUpdate(driver.id, "company", e.target.value)}
        className="flex-shrink-0 text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white cursor-pointer"
      >
        <option value="">Select...</option>
        {COMPANIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Truck */}
      <input
        type="text"
        value={driver.Truck || ""}
        onChange={(e) => onUpdate(driver.id, "Truck", e.target.value)}
        placeholder="Truck"
        className="flex-shrink-0 w-20 text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {/* Status */}
      <select
        value={driver.status || ""}
        onChange={(e) => onStatusChange(driver.id, e.target.value)}
        className="flex-shrink-0 text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white cursor-pointer"
      >
        {STATUSES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.icon} {s.label}
          </option>
        ))}
      </select>

      {/* Notes */}
      <input
        type="text"
        value={driver.notes || ""}
        onChange={(e) => onUpdate(driver.id, "notes", e.target.value)}
        placeholder="Notes"
        className="flex-1 text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {/* Delete Button */}
      <button
        onClick={() => onDelete(driver.id)}
        className="flex-shrink-0 text-xs text-muted-foreground hover:text-destructive opacity-0 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
