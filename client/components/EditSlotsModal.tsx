import React, { useState, useEffect } from "react";

interface EditSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionId: string;
  onSave: (oo: number, cd: number) => void;
}

export function EditSlotsModal({
  isOpen,
  onClose,
  divisionId,
  onSave,
}: EditSlotsModalProps) {
  const [slotsOO, setSlotsOO] = useState("5");
  const [slotsCD, setSlotsCD] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oo = parseInt(slotsOO) || 0;
    const cd = parseInt(slotsCD) || 0;
    onSave(oo, cd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-6">✏️ Edit Slots</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Owner Operators */}
            <div>
              <label className="block text-xs font-semibold text-operator-blue uppercase mb-2">
                🔵 OO
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={slotsOO}
                onChange={(e) => setSlotsOO(e.target.value)}
                className="w-full px-3 py-2 text-lg font-bold text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Company Drivers */}
            <div>
              <label className="block text-xs font-semibold text-company-green uppercase mb-2">
                🟢 CD
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={slotsCD}
                onChange={(e) => setSlotsCD(e.target.value)}
                className="w-full px-3 py-2 text-lg font-bold text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-semibold text-muted-foreground border border-border rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
