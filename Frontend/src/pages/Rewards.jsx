import { useEffect, useRef, useState } from "react";
import { Search, Plus, Eye, Pencil, ToggleLeft, Gift, Trash, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { deleteReward, getRewards, toggleRewardStatus, uploadRewardsCSV } from "../api/rewards";
import DataTable from "../components/DataTable.jsx";
import ActionsMenu from "../components/ActionsMenu.jsx";
import RewardModal from "../components/rewards/RewardModal.jsx";
import RewardViewer from "../components/rewards/RewardViewer.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx";

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const tableColumns = [
  { header: "Image", className: "w-20", skeletonClass: "h-10 w-10 rounded-full" },
  { header: "Title", skeletonClass: "h-3 w-32" },
  { header: "Coin Cost", skeletonClass: "h-3 w-16" },
  { header: "Organization", skeletonClass: "h-3 w-32" },
  { header: "Status", className: "w-24", skeletonClass: "h-5 w-16 rounded-full" },
  { header: "Created At", skeletonClass: "h-3 w-24" },
  { header: "Actions", className: "w-16", skeletonClass: "h-5 w-5" },
];

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const debounceRef = useRef(null);
  const csvInputRef = useRef(null);

  const [selectedReward, setSelectedReward] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const STATUS_FILTERS = [{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "inactive", label: "Inactive" }];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchRewards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isActiveParam = statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined;
      const data = await getRewards({ page, limit: 10, search: debouncedSearch, isActive: isActiveParam });
      setRewards(data?.rewards ?? []);
      setPagination(data?.pagination ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load rewards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, statusFilter]);

  const handleDelete = async (target) => {
    const targetId = target.rewardId;
    try {
      const res = await deleteReward(targetId);
      
      console.log(res);

      if (res.success) {
        toast.success("Deleted!");
      } else {
        toast.error("Deletion failed!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to delete reward: ${target.title}.`);
    } finally {
      fetchRewards();
    }
  }

  const handleCSVUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const res = await uploadRewardsCSV(file);

      toast.success(
        res.message || "Rewards uploaded successfully."
      );

      fetchRewards();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to upload CSV."
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleToggleStatus = async (targetReward) => {
    const targetId = targetReward.rewardId;
    const nextStatus = !targetReward.isActive;
    setTogglingId(targetId);
    setRewards((prev) => prev.map((r) => (r.rewardId === targetId ? { ...r, isActive: nextStatus } : r)));

    try {
      await toggleRewardStatus(targetId, nextStatus);
      toast.success(`Successfully updated status for ${targetReward.title}`);
    } catch (err) {
      setRewards((prev) => prev.map((r) => (r.rewardId === targetId ? { ...r, isActive: targetReward.isActive } : r)));
      toast.error(err?.response?.data?.message || `Failed to update status for ${targetReward.title}.`);
    } finally {
      setTogglingId(null);
    }
  };

  const openAction = (targetReward, mode) => {
    setSelectedReward(targetReward);
    if (mode === "view") setViewOpen(true);
    if (mode === "edit") {
      setModalMode("edit");
      setModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Rewards
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Manage redeemable rewards for employees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            <Upload size={16} />
            Upload CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedReward(null);
              setModalMode("create");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Add Reward
          </button>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {STATUS_FILTERS.map(f => (
            <button key={f.key} type="button" onClick={() => { setStatusFilter(f.key); setPage(1); }} className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === f.key ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-foreground/5"}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <DataTable
        columns={tableColumns}
        data={rewards}
        isLoading={isLoading}
        error={error}
        onRetry={fetchRewards}
        pagination={pagination}
        onPageChange={(nextPage) => setPage(nextPage)}
        emptyMessage="No rewards found"
        emptyIcon={Gift}
        renderRow={(reward, index) => {
          const currentId = reward.rewardId;
          const openUpward = rewards.length > 2 && index >= rewards.length - 2;

          const rewardActions = [
            { label: "View", icon: Eye, onClick: () => openAction(reward, "view") },
            { label: "Edit", icon: Pencil, onClick: () => openAction(reward, "edit") },
            { label: "Delete", icon: Trash, onClick: () => handleDelete(reward) },
          ];

          return (
            <tr key={currentId} className="border-b border-border last:border-0 transition-colors hover:bg-foreground/5">
              <td className="p-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.title} className="h-full w-full object-cover" />
                  ) : (
                    <Gift size={18} />
                  )}
                </div>
              </td>
              <td className="p-4 font-medium text-foreground truncate">{reward.title}</td>
              <td className="p-4 text-foreground/70">{reward.coinCost}</td>
              <td className="p-4 text-foreground/70">{reward.organization}</td>
              <td className="p-4"><ToggleSwitch isActive={reward.isActive} isBusy={togglingId === currentId} onToggle={() => handleToggleStatus(reward)} /></td>
              <td className="p-4 text-foreground/70">{formatDate(reward.createdAt)}</td>
              <td className="p-4 overflow-visible">
                <ActionsMenu actions={rewardActions} openUpward={openUpward} />
              </td>
            </tr>
          );
        }}
      />

      <RewardModal
        mode={modalMode}
        reward={selectedReward}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchRewards}
      />

      <RewardViewer reward={selectedReward} open={viewOpen} onClose={() => setViewOpen(false)} />
    </div>
  );
}