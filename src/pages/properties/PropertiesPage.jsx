import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Search, Building2, DoorOpen, DoorClosed,
  ChevronRight, Archive, ArchiveRestore, Trash2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { propertiesApi } from "../../api/propertiesApi";
import { Button } from "../../components/ui/Button";
import { Badge, ConfirmDialog, EmptyState, StatCard } from "../../components/ui/index.jsx";
import { ErrorPanel, LoadingPanel } from "../../components/ui/StatePanel";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

import { platformApiOrigin } from "../../api/config";

const API_ORIGIN = platformApiOrigin();

// ── Property Card ─────────────────────────────────────────────────
function PropertyCard({ property }) {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => propertiesApi.delete(property.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property deleted.");
      setConfirmDelete(false);
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Could not delete property.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () =>
      property.is_active
        ? propertiesApi.archive(property.id)
        : propertiesApi.restore(property.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success(property.is_active ? "Property archived." : "Property restored.");
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Action failed."),
  });

  const occupancyColor =
    property.occupancy_rate >= 80 ? "text-brand-teal" :
    property.occupancy_rate >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <>
    <div className={`card hover:border-brand-teal transition-all duration-150 ${!property.is_active ? "opacity-60" : ""}`}>
      {/* Photo banner */}
      {property.photo_path ? (
        <div className="h-32 -mx-5 -mt-5 mb-4 rounded-t-lg overflow-hidden">
          <img
            src={property.photo_path.startsWith('http') ? property.photo_path : `${API_ORIGIN}${property.photo_path}`}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gradient-to-r', 'from-brand-tealLt', 'to-white/10'); }}
          />
        </div>
      ) : (
        <div className="h-20 -mx-5 -mt-5 mb-4 rounded-t-lg bg-gradient-to-r from-brand-tealLt to-white/10 flex items-center justify-center">
          <Building2 size={32} className="text-brand-teal opacity-50" />
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {!property.photo_path && (
            <div className="w-10 h-10 rounded-lg bg-brand-tealLt flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-brand-teal" />
            </div>
          )}
          <div>
            <div className="font-bold text-brand-dark">{property.name}</div>
            <div className="text-xs text-brand-mid mt-0.5">{property.address}</div>
            {property.parish && (
              <div className="text-xs text-brand-mid">{property.parish}, {property.district}</div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            label={property.is_active ? "Active" : "Archived"}
            variant={property.is_active ? "active" : "archived"}
          />
          {property.gov_verification_status === "verified" ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              KCCA verified
            </span>
          ) : (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300" title="Visible to tenants; full trust badge after KCCA approval">
              KCCA pending
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Total",       value: property.total_units,       color: "text-brand-dark" },
          { label: "Occupied",   value: property.occupied_units,    color: "text-brand-teal" },
          { label: "Vacant",     value: property.vacant_units,      color: "text-gray-500" },
          { label: "Maintenance",value: property.maintenance_units, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-brand-bg rounded-lg p-2 text-center">
            <div className={`font-bold text-lg ${color}`}>{value}</div>
            <div className="text-xs text-brand-mid">{label}</div>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-brand-mid font-medium">Occupancy</span>
          <span className={`font-bold ${occupancyColor}`}>{property.occupancy_rate}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-brand-teal rounded-full transition-all duration-500"
            style={{ width: `${property.occupancy_rate}%` }}
          />
        </div>
      </div>

      {/* Expected rent */}
      <div className="text-xs text-brand-mid mb-4">
        Expected monthly:{" "}
        <span className="font-bold text-brand-dark">
          UGX {new Intl.NumberFormat("en-UG").format(property.expected_monthly_rent)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={`/landlord/properties/${property.id}`} className="flex-1">
          <Button variant="outline" fullWidth className="text-xs">
            <ChevronRight size={14} />
            View Units
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => setConfirmDelete(true)}
          loading={deleteMutation.isPending}
          className="text-xs px-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          title="Delete permanently"
          aria-label="Delete property"
        >
          <Trash2 size={15} />
        </Button>
        <Button
          variant="ghost"
          onClick={() => archiveMutation.mutate()}
          loading={archiveMutation.isPending}
          className="text-xs px-3"
          title={property.is_active ? "Archive" : "Restore"}
          aria-label={property.is_active ? "Archive property" : "Restore property"}
        >
          {property.is_active
            ? <Archive size={15} />
            : <ArchiveRestore size={15} />
          }
        </Button>
      </div>
    </div>

    <ConfirmDialog
      open={confirmDelete}
      title="Delete property?"
      message={`"${property.name}" and all its units will be removed permanently. This cannot be undone. Archive instead if you may need the records later.`}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={() => deleteMutation.mutate()}
      onCancel={() => setConfirmDelete(false)}
    />
    </>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function PropertiesPage() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const { data: propertiesRaw, isLoading, isError } = useQuery({
    queryKey: ["properties", search, showArchived],
    queryFn: () => propertiesApi.list({ search, include_archived: showArchived }),
  });
  const properties = Array.isArray(propertiesRaw) ? propertiesRaw : [];

  const asNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Aggregate stats (API returns occupied_units, vacant_units, expected_monthly_rent per property)
  const occupiedUnits = properties.reduce((s, p) => s + asNum(p.occupied_units), 0);
  const vacantUnits = properties.reduce((s, p) => s + asNum(p.vacant_units), 0);
  const totalRent = properties.reduce((s, p) => s + asNum(p.expected_monthly_rent), 0);

  return (
    <AppPageScaffold
      variant="registry"
      icon={Building2}
      title="Properties"
      description={`${properties.length} propert${properties.length === 1 ? "y" : "ies"} in your portfolio`}
      actions={
        <Button onClick={() => navigate("/landlord/properties/new")}>
          <Plus size={16} />
          Add Property
        </Button>
      }
    >
      {/* Portfolio stats */}
      {properties.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Building2} label="Properties" value={String(properties.length)} color="teal" />
          <StatCard icon={DoorClosed} label="Occupied Units" value={String(occupiedUnits)} color="teal" />
          <StatCard icon={DoorOpen} label="Vacant Units" value={String(vacantUnits)} color="gray" />
          <StatCard
            icon={Building2}
            label="Expected Monthly"
            value={`UGX ${new Intl.NumberFormat("en-UG").format(totalRent)}`}
            color="blue"
          />
        </div>
      )}

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
          <input
            className="input-field pl-9"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-mid font-semibold select-none">
          <input
            type="checkbox"
            className="w-4 h-4 accent-brand-teal"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

      {/* Properties grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <LoadingPanel key={i} className="h-64" />
          ))}
        </div>
      ) : isError ? (
        <ErrorPanel
          title="Could not load properties"
          description="Check your connection and API configuration, then try again."
        />
      ) : properties.length === 0 ? (
        <div className="card border-dashed border-white/10 bg-white/[0.02]">
          <EmptyState
            icon={Building2}
            title={search ? "No properties match your search" : "No properties yet"}
            description={
              search
                ? "Try a different search term."
                : "Add your first property to start tracking units and tenants."
            }
            action={
              !search && (
                <Button onClick={() => navigate("/landlord/properties/new")}>
                  <Plus size={16} /> Add First Property
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

    </AppPageScaffold>
  );
}