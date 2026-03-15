import React, { useState, useMemo } from "react";

interface Division {
  id: string;
  title: string;
  icon: string;
}

interface Driver {
  id: string;
  name: string;
  position: string;
  company: string;
  status: string;
  notes: string;
  division_id: string;
  created_at: string;
}

interface StatisticsPanelProps {
  drivers: Driver[];
  divisions: Division[];
  terminalStatuses: string[];
  onExport?: () => void;
  onClear?: () => void;
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  mon.setHours(0, 0, 0, 0);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);

  return { start: mon.getTime(), end: sun.getTime() };
}

export function StatisticsPanel({
  drivers,
  divisions,
  terminalStatuses,
  onExport,
  onClear,
}: StatisticsPanelProps) {
  const { start, end } = getWeekRange();

  const getDivisionTitle = (id: string) =>
    divisions.find((d) => d.id === id)?.title || id;

  const getDivisionIcon = (id: string) =>
    divisions.find((d) => d.id === id)?.icon || "";

  const inWeek = (d: Driver) => {
    const t = new Date(d.created_at).getTime();
    return t >= start && t <= end;
  };

  const hired = drivers.filter((d) => d.status === "hired" && inWeek(d));
  const disqualified = drivers.filter(
    (d) => d.status === "disqualified" && inWeek(d)
  );
  const ghosted = drivers.filter((d) => d.status === "ghosted" && inWeek(d));

  const weekLabel = useMemo(() => {
    const mon = new Date(start);
    const sun = new Date(end);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(mon)} – ${fmt(sun)}`;
  }, [start, end]);

  const StatEntry = ({ driver, type }: { driver: Driver; type: string }) => {
    const typeConfig = {
      hired: {
        bg: "bg-green-50",
        color: "text-accent-green",
        badge: "🏆 Hired",
        badgeBg: "bg-green-100",
      },
      disqualified: {
        bg: "bg-red-50",
        color: "text-destructive",
        badge: "🚫 Disqualified",
        badgeBg: "bg-red-100",
      },
      ghosted: {
        bg: "bg-slate-50",
        color: "text-slate-500",
        badge: "👻 Ghosted",
        badgeBg: "bg-slate-100",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig];

    return (
      <div className={`${config.bg} border border-border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3`}>
        <div className="flex-shrink-0 sm:w-32">
          <div className="font-semibold text-sm text-foreground">
            {driver.name || "—"}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase ${config.color}`}>
            {getDivisionIcon(driver.division_id)} {getDivisionTitle(driver.division_id)}
          </span>
          <span className="text-xs text-muted-foreground">
            {driver.position || "—"}
            {driver.company && ` · ${driver.company}`}
          </span>
          <span className="text-xs text-muted-foreground italic">
            📅{" "}
            {new Date(driver.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${config.badgeBg} ${config.color}`}
          >
            {config.badge}
          </span>
        </div>
      </div>
    );
  };

  const isEmpty = hired.length === 0 && disqualified.length === 0 && ghosted.length === 0;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              📊 Statistics of the Week
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{weekLabel}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-green-100 text-accent-green px-3 py-1 rounded-full text-xs font-bold">
              🏆 Hired <span>{hired.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-red-100 text-destructive px-3 py-1 rounded-full text-xs font-bold">
              🚫 Disqualified <span>{disqualified.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
              👻 Ghosted <span>{ghosted.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isEmpty ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No activity recorded this week yet 💪
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hired Section */}
            {hired.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-accent-green uppercase tracking-wide mb-3">
                  🏆 Hired ({hired.length})
                </h3>
                <div className="space-y-2">
                  {hired.map((driver) => (
                    <StatEntry key={driver.id} driver={driver} type="hired" />
                  ))}
                </div>
              </div>
            )}

            {/* Disqualified Section */}
            {disqualified.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-destructive uppercase tracking-wide mb-3">
                  🚫 Disqualified ({disqualified.length})
                </h3>
                <div className="space-y-2">
                  {disqualified.map((driver) => (
                    <StatEntry
                      key={driver.id}
                      driver={driver}
                      type="disqualified"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ghosted Section */}
            {ghosted.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                  👻 Ghosted ({ghosted.length})
                </h3>
                <div className="space-y-2">
                  {ghosted.map((driver) => (
                    <StatEntry key={driver.id} driver={driver} type="ghosted" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex gap-3 justify-end flex-wrap">
        <button
          onClick={onExport}
          className="text-xs font-semibold text-operator-blue border border-operator-blue hover:bg-operator-blue hover:text-white px-3 py-1 rounded transition-colors"
        >
          📤 Export to Sheets
        </button>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-muted-foreground border border-dashed border-border hover:border-destructive hover:text-destructive px-3 py-1 rounded transition-colors"
        >
          🗑 Clear this week
        </button>
      </div>
    </div>
  );
}
