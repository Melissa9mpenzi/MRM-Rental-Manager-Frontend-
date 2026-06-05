import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import { workspaceApi } from "../../api/workspaceApi";
import { Input } from "../../components/ui/Input";
import PortalPageHeader from "../../components/system/PortalPageHeader";

export default function SystemAnnouncementsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => workspaceApi.adminAnnouncements(),
    staleTime: 30_000,
  });

  const createMut = useMutation({
    mutationFn: () =>
      workspaceApi.createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        audience,
        is_published: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      setTitle("");
      setBody("");
      toast.success("Announcement published.");
    },
    onError: () => toast.error("Could not publish announcement."),
  });

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Announcements"
        description="Broadcast system messages to tenants, landlords, agents, and government officers."
      />

      <div className="gov-glass space-y-4 p-4">
        <h3 className="gov-panel-title flex items-center gap-2">
          <Megaphone size={16} />
          New announcement
        </h3>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/55">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            placeholder="Maintenance window, policy update, etc."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/55">Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="all">All users</option>
            <option value="tenant">Tenants</option>
            <option value="landlord">Landlords</option>
            <option value="agent">Agents</option>
            <option value="government">Government</option>
          </select>
        </div>
        <button
          type="button"
          disabled={createMut.isPending || !title.trim() || !body.trim()}
          onClick={() => createMut.mutate()}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-[#041208] disabled:opacity-50"
        >
          {createMut.isPending ? "Publishing…" : "Publish"}
        </button>
      </div>

      <div className="gov-glass p-4">
        <h3 className="gov-panel-title">Recent announcements</h3>
        {isLoading ? (
          <p className="mt-4 text-sm text-white/45">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">No announcements yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((a) => (
              <li key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{a.title}</p>
                  <span className="text-[10px] uppercase text-white/35">{a.audience}</span>
                </div>
                <p className="mt-1 text-sm text-white/60">{a.body}</p>
                <p className="mt-2 text-[10px] text-white/35">
                  {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
