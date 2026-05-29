import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Plus, Building2, DoorOpen, DoorClosed,
  Wrench, TrendingUp, Filter, Pencil,
} from "lucide-react";
import { propertiesApi } from "../../api/propertiesApi";
import { Button } from "../../components/ui/Button";
import { StatCard, EmptyState } from "../../components/ui/index.jsx";
import AddUnitModal from "../../components/domain/AddUnitModal";
import EditPropertyModal from "../../components/domain/EditPropertyModal";
import UnitCard from "../../components/domain/UnitCard";

const STATUS_FILTERS = ["all", "occupied", "vacant", "maintenance"];
import { listingImageUrl, mediaImageFallback, uploadMediaUrl } from "../../lib/mediaUrl";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const propertyId = parseInt(id);
  const [addUnitOpen, setAddUnitOpen]   = useState(false);
  const [editOpen, setEditOpen]         = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertiesApi.get(propertyId),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-brand-tealLt/40 rounded animate-pulse" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-brand-tealLt/30" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="card text-center py-16">
        <Building2 size={40} className="text-brand-mid mx-auto mb-3" />
        <h2 className="text-brand-dark font-bold mb-1">Property not found</h2>
        <Link to="/landlord/properties">
          <Button variant="outline"><ArrowLeft size={14} /> Back</Button>
        </Link>
      </div>
    );
  }

  const units = property.units || [];
  const filteredUnits = statusFilter === "all"
    ? units
    : units.filter((u) => u.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/landlord/properties"
        className="inline-flex items-center gap-1.5 text-sm text-brand-mid hover:text-brand-teal transition-colors"
      >
        <ArrowLeft size={14} /> All Properties
      </Link>

      {/* Hero photo or header */}
      {property.photo_path ? (
        <div className="relative rounded-xl overflow-hidden h-52 w-full">
          <img
            src={listingImageUrl(property.photo_path)}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={mediaImageFallback}
          />
          {/* Overlay with name */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{property.name}</h2>
              <p className="text-white/70 text-sm">
                {property.address}
                {property.parish && ` · ${property.parish}`}
                {property.district && `, ${property.district}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)} className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs">
                <Pencil size={13} /> Edit
              </Button>
              <Button onClick={() => setAddUnitOpen(true)} className="text-xs">
                <Plus size={14} /> Add Unit
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {property.video_path && (
        <div className="card overflow-hidden p-0">
          <p className="border-b border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/45">
            Property tour video
          </p>
          <video
            src={uploadMediaUrl(property.video_path)}
            controls
            className="w-full max-h-80 bg-black"
            playsInline
            preload="metadata"
          />
        </div>
      )}

      {!property.photo_path ? (
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-brand-dark">{property.name}</h2>
            <p className="text-brand-mid text-sm mt-0.5">
              {property.address}
              {property.parish && ` · ${property.parish}`}
              {property.district && `, ${property.district}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil size={14} /> Edit Property
            </Button>
            <Button onClick={() => setAddUnitOpen(true)}>
              <Plus size={16} /> Add Unit
            </Button>
          </div>
        </div>
      ) : null}

      {/* Description */}
      {property.description && (
        <p className="text-brand-mid text-sm">{property.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Building2}  label="Total Units"    value={property.total_units} color="teal" />
        <StatCard icon={DoorClosed} label="Occupied"       value={property.occupied_units}
          sub={`${property.occupancy_rate}% occupancy`} color="teal" />
        <StatCard icon={DoorOpen}   label="Vacant"         value={property.vacant_units} color="gray" />
        <StatCard icon={TrendingUp} label="Monthly Rent"
          value={`UGX ${new Intl.NumberFormat("en-UG").format(property.expected_monthly_rent)}`}
          sub="from occupied units" color="blue" />
      </div>

      {/* Occupancy bar */}
      {property.total_units > 0 && (
        <div className="card py-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-brand-mid font-semibold">Occupancy</span>
            <span className="font-bold text-brand-dark">{property.occupancy_rate}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-teal rounded-full transition-all duration-700"
              style={{ width: `${property.occupancy_rate}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-brand-mid">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-teal" />{property.occupied_units} occupied
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300" />{property.vacant_units} vacant
            </span>
            {property.maintenance_units > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />{property.maintenance_units} maintenance
              </span>
            )}
          </div>
        </div>
      )}

      {/* Units */}
      <div>
        {units.length > 0 && (
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            <Filter size={14} className="text-brand-mid mr-1" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors
                  ${statusFilter === f
                    ? "bg-brand-teal text-[#041208]"
                    : "border border-white/12 bg-white/[0.06] text-white/70 hover:border-brand-teal/45 hover:text-brand-teal"
                  }`}
              >
                {f === "all"
                  ? `All (${units.length})`
                  : `${f} (${units.filter((u) => u.status === f).length})`
                }
              </button>
            ))}
          </div>
        )}

        {units.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={DoorOpen}
              title="No units yet"
              description="Add units to track tenants and payments."
              action={
                <Button onClick={() => setAddUnitOpen(true)}>
                  <Plus size={16} /> Add First Unit
                </Button>
              }
            />
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-brand-mid text-sm">No <strong>{statusFilter}</strong> units.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <UnitCard key={unit.id} unit={unit} propertyId={propertyId} />
            ))}
          </div>
        )}
      </div>

      <AddUnitModal
        open={addUnitOpen}
        onClose={() => setAddUnitOpen(false)}
        propertyId={propertyId}
      />
      <EditPropertyModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        property={property}
      />
    </div>
  );
}