import GovStatCard from "./GovStatCard";

export default function GovModuleKpis({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <GovStatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
