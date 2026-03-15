import React, { useState, useEffect } from "react";

interface Driver {
  name: string;
  position: string;
  company: string;
  Truck: string;
  status: string;
  notes: string;
}

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (driverData: Partial<Driver>) => void;
  presetPosition: string;
}

const COMPANIES = [
  "Sayram Express LLC",
  "Iconic Logistics LLC",
  "Sayram Logistics Co",
  "Golden Mile LLC",
  "Money Express INC",
];

export function AddDriverModal({
  isOpen,
  onClose,
  onAdd,
  presetPosition,
}: AddDriverModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    position: presetPosition,
    company: "",
    Truck: "",
    status: "preapproval",
    notes: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      position: presetPosition,
    }));
  }, [presetPosition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter driver name");
      return;
    }
    if (!formData.position) {
      alert("Please select position");
      return;
    }
    if (!formData.company) {
      alert("Please select company");
      return;
    }

    onAdd(formData);
    setFormData({
      name: "",
      position: presetPosition,
      company: "",
      Truck: "",
      status: "preapproval",
      notes: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">➕ Add Driver</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Driver Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. John Smith"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Position
              </label>
              <select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">— Select Position —</option>
                <option value="Owner Operator">Owner Operator</option>
                <option value="Lease Operator">Lease Operator</option>
                <option value="Company Driver">Company Driver</option>
              </select>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Company
              </label>
              <select
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">— Select Company —</option>
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Truck */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Truck
              </label>
              <input
                type="text"
                value={formData.Truck}
                onChange={(e) =>
                  setFormData({ ...formData, Truck: e.target.value })
                }
                placeholder="e.g. Truck 101 or T-234"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="preapproval">🔍 Pre-Approval</option>
                <option value="drugtest">🧪 Drug Test Pending</option>
                <option value="onhold">⏸ On Hold</option>
                <option value="ready">✅ Ready to Go</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="e.g. Drug test pending"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
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
                Save Driver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
