import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { Badge, ConfirmDialog } from "../ui/index.jsx";

const UNIT_TYPE_LABELS = {
  bedsitter:     "Bedsitter",
  studio:        "Studio",
  one_bedroom:   "1 Bedroom",
  two_bedroom:   "2 Bedroom",
  three_bedroom: "3 Bedroom",
  shop:          "Shop",
  office:        "Office",
  other:         "Other",
};

const STATUS_CYCLE = {
  vacant:      "occupied",
  occupied:    "maintenance",
  maintenance: "vacant",
};

const STATUS_COLORS = {
  vacant:      "border-l-gray-300",
  occupied:    "border-l-brand-teal",
  maintenance: "border-l-amber-400",
};

export default function UnitCard({ unit, propertyId }) {
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusMutation = useMutation({
    mutationFn: (status) => propertiesApi.updateUnitStatus(unit.id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      toast.success(`Unit ${unit.unit_number} → ${updated.status}`);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Status update failed."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertiesApi.deleteUnit(unit.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      toast.success(`Unit ${unit.unit_number} deleted.`);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Delete failed."),
  });

  const formatted = new Intl.NumberFormat("en-UG").format(unit.rent_amount);

  return (
    <>
      <div className={`card border-l-4 ${STATUS_COLORS[unit.status]} relative`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-bold text-brand-dark text-base">
              Unit {unit.unit_number}
            </div>
            <div className="text-xs text-brand-mid mt-0.5">
              {UNIT_TYPE_LABELS[unit.unit_type] || unit.unit_type}
              {unit.floor_number > 0 && ` · Floor ${unit.floor_number}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={unit.status} variant={unit.status} />
            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-lg text-brand-mid hover:bg-brand-tealLt hover:text-brand-teal transition-colors"
              >
                <MoreVertical size={15} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white border border-brand-tealLt rounded-lg shadow-modal w-44 py-1">
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-brand-dark hover:bg-brand-tealLt transition-colors"
                      onClick={() => {
                        statusMutation.mutate(STATUS_CYCLE[unit.status]);
                        setMenuOpen(false);
                      }}
                    >
                      <ArrowRightLeft size={14} />
                      Mark as {STATUS_CYCLE[unit.status]}
                    </button>
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                    >
                      <Trash2 size={14} />
                      Delete unit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rent */}
        <div className="text-brand-teal font-bold text-lg leading-tight">
          UGX {formatted}
          <span className="text-brand-mid text-xs font-normal ml-1">/month</span>
        </div>

        {/* Amenities */}
        {unit.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {unit.amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-xs bg-brand-bg text-brand-mid px-2 py-0.5 rounded-full border border-brand-tealLt">
                {a}
              </span>
            ))}
            {unit.amenities.length > 3 && (
              <span className="text-xs text-brand-mid">+{unit.amenities.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Unit"
        message={`Are you sure you want to delete Unit ${unit.unit_number}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />
    </>
  );
}