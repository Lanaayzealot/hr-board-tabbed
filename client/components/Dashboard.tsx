import React, { useState, useEffect } from "react";
import { DivisionCard } from "./DivisionCard";
import { StatisticsPanel } from "./StatisticsPanel";
import { AddDriverModal } from "./AddDriverModal";
import { EditSlotsModal } from "./EditSlotsModal";
import { SaveIndicator } from "./SaveIndicator";
import { useSupabase } from "../hooks/useSupabase";
import { useSaveIndicator } from "../hooks/useSaveIndicator";

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

const DIVISION_ORDER = [
  "reefer",
  "walmart",
  "amazon",
  "portage",
  "dryvan",
];

const TERMINAL_STATUSES = ["hired", "disqualified", "ghosted"];

export function Dashboard() {
  const { divisions, drivers, loading, updateDivision, updateDriver, deleteDriver } =
    useSupabase();
  const { showSave } = useSaveIndicator();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
    null
  );
  const [presetPosition, setPresetPosition] = useState("");

  useEffect(() => {
    if (divisions.length > 0 && !activeTab) {
      const ordered = DIVISION_ORDER.map((id) =>
        divisions.find((d) => d.id === id)
      ).filter(Boolean);
      if (ordered.length > 0) {
        setActiveTab(ordered[0]?.id || null);
      }
    }
  }, [divisions, activeTab]);

  // Update clock and date displays
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const clockEl = document.getElementById("liveClock");
      if (clockEl) {
        clockEl.textContent = timeStr + " CDT";
      }
    };

    const updateWeekRange = () => {
      const now = new Date();
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const fri = new Date(mon);
      fri.setDate(mon.getDate() + 4);
      const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const weekEl = document.getElementById("weekRange");
      if (weekEl) {
        weekEl.textContent = `WEEK: ${fmt(mon)} – ${fmt(fri)}`;
      }
    };

    updateClock();
    updateWeekRange();

    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAddDriver = (divisionId: string, position: string) => {
    setSelectedDivisionId(divisionId);
    setPresetPosition(position);
    setShowAddModal(true);
  };

  const handleOpenSlotsModal = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setShowSlotsModal(true);
  };

  const handleAddDriver = async (driverData: Partial<Driver>) => {
    if (!selectedDivisionId) return;
    try {
      await updateDriver(null, {
        ...driverData,
        division_id: selectedDivisionId,
      });
      await stampDivDate(selectedDivisionId);
      setShowAddModal(false);
      showSave();
    } catch (error) {
      console.error("Error adding driver:", error);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm("Delete this driver?")) return;
    try {
      await deleteDriver(driverId);
      showSave();
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: string) => {
    try {
      await updateDriver(driverId, { status: newStatus });

      const driver = drivers.find((d) => d.id === driverId);
      if (driver && TERMINAL_STATUSES.includes(newStatus)) {
        // When a driver reaches terminal status, stamp the date
        await stampDivDate(driver.division_id);
        // Switch to stats tab to show the update
        setActiveTab("stats");
      }

      showSave();
    } catch (error) {
      console.error("Error updating driver status:", error);
    }
  };

  const stampDivDate = async (divisionId: string) => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const division = divisions.find((d) => d.id === divisionId);
    if (division) {
      await updateDivision(divisionId, { last_updated: dateStr });
    }
  };

  const handleCycleDivStatus = async (divisionId: string) => {
    const division = divisions.find((d) => d.id === divisionId);
    if (!division) return;
    const list: Array<"hiring" | "urgent" | "full"> = ["hiring", "urgent", "full"];
    const currentIndex = list.indexOf(division.div_status);
    const nextStatus = list[(currentIndex + 1) % list.length];
    try {
      await updateDivision(divisionId, { div_status: nextStatus });
      await stampDivDate(divisionId);
      showSave();
    } catch (error) {
      console.error("Error updating division status:", error);
    }
  };

  const handleExportToSheets = async () => {
    try {
      const { start, end } = getWeekRange();
      const hired = drivers.filter(
        (d) =>
          d.status === "hired" &&
          new Date(d.created_at).getTime() >= start &&
          new Date(d.created_at).getTime() <= end
      );
      const disqualified = drivers.filter(
        (d) =>
          d.status === "disqualified" &&
          new Date(d.created_at).getTime() >= start &&
          new Date(d.created_at).getTime() <= end
      );

      if (hired.length === 0 && disqualified.length === 0) {
        alert("No hired/disqualified data to export this week!");
        return;
      }

      // Prepare rows for export
      const rows = [
        ...hired.map((d) => ({
          name: d.name,
          company: d.company,
          position: d.position,
          division: divisions.find((div) => div.id === d.division_id)?.title || d.division_id,
          notes: d.notes || "",
          date: new Date(d.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: "hired",
        })),
        ...disqualified.map((d) => ({
          name: d.name,
          company: d.company,
          position: d.position,
          division: divisions.find((div) => div.id === d.division_id)?.title || d.division_id,
          notes: d.notes || "",
          date: new Date(d.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: "disqualified",
        })),
      ];

      // Send to Google Sheets via Apps Script
      const APPS_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbxouco-i6oxgGPXF6ImVQCwKfGZkox6Ux-hnAf6D-siY1yU-KLi0jSjW9Wc-dr3wfrQ/exec";

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ type: "mixed", rows }),
      });

      showSave(`Exported ${rows.length} records`);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleClearThisWeek = async () => {
    if (!confirm("Clear all hired, disqualified and ghosted entries for this week?"))
      return;

    try {
      const { start, end } = getWeekRange();
      const toClear = drivers.filter(
        (d) =>
          TERMINAL_STATUSES.includes(d.status) &&
          new Date(d.created_at).getTime() >= start &&
          new Date(d.created_at).getTime() <= end
      );

      for (const driver of toClear) {
        await deleteDriver(driver.id);
      }

      showSave();
    } catch (error) {
      console.error("Error clearing week:", error);
    }
  };

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

  const orderedDivisions = DIVISION_ORDER.map((id) =>
    divisions.find((d) => d.id === id)
  ).filter(Boolean) as Division[];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-accent mx-auto mb-4" />
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Driver Recruitment Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1" id="weekRange">
                WEEK: Loading...
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
              onClick={async () => {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 30);
                const toDelete = drivers.filter(
                  (d) =>
                    TERMINAL_STATUSES.includes(d.status) &&
                    new Date(d.created_at) < cutoff
                );
                if (toDelete.length === 0) {
                  alert("No records older than 30 days to purge.");
                  return;
                }
                if (!confirm(`Delete ${toDelete.length} record(s) older than 30 days?`))
                  return;

                try {
                  for (const driver of toDelete) {
                    await deleteDriver(driver.id);
                  }
                  showSave(`Purged ${toDelete.length} old records`);
                } catch (error) {
                  console.error("Purge error:", error);
                }
              }}
              className="text-xs font-semibold text-destructive border border-dashed border-destructive hover:bg-destructive hover:text-destructive-foreground px-3 py-2 rounded-md transition-colors"
            >
              🗑 Purge 30d+
            </button>
              <div
                className="text-sm font-bold text-operator-blue"
                id="liveClock"
              >
                --:--
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-2 flex-wrap border-b border-border">
          {orderedDivisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setActiveTab(div.id)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === div.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {div.icon} {div.title}
            </button>
          ))}
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "stats"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            📊 Statistics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "stats" ? (
          <StatisticsPanel
            drivers={drivers}
            divisions={divisions}
            terminalStatuses={TERMINAL_STATUSES}
            onExport={handleExportToSheets}
            onClear={handleClearThisWeek}
          />
        ) : (
          <>
            {orderedDivisions.map(
              (div) =>
                activeTab === div.id && (
                  <DivisionCard
                    key={div.id}
                    division={div}
                    drivers={drivers.filter((d) => d.division_id === div.id)}
                    onAddDriver={handleOpenAddDriver}
                    onEditSlots={handleOpenSlotsModal}
                    onUpdateDriver={(driverId, field, value) =>
                      updateDriver(driverId, { [field]: value })
                    }
                    onDeleteDriver={handleDeleteDriver}
                    onStatusChange={handleStatusChange}
                    onCycleStatus={handleCycleDivStatus}
                    terminalStatuses={TERMINAL_STATUSES}
                  />
                )
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <SaveIndicator />
      {showAddModal && selectedDivisionId && (
        <AddDriverModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDriver}
          presetPosition={presetPosition}
        />
      )}
      {showSlotsModal && selectedDivisionId && (
        <EditSlotsModal
          isOpen={showSlotsModal}
          onClose={() => setShowSlotsModal(false)}
          divisionId={selectedDivisionId}
          onSave={(oo, cd) => {
            const division = divisions.find((d) => d.id === selectedDivisionId);
            if (division) {
              updateDivision(selectedDivisionId, {
                slots_oo: oo,
                slots_cd: cd,
              });
            }
          }}
        />
      )}
    </div>
  );
}
