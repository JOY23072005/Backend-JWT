import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import RewardForm from "./RewardForm.jsx";
import { createReward, updateReward, updateRewardImage } from "../../api/rewards";

export default function RewardModal({ mode, reward, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open, reward]);

  if (!open) return null;

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { title: values.title, coinCost: values.coinCost};
      let response = isEdit
        ? await updateReward(reward.rewardId, payload)
        : await createReward({...payload, orgId: values.orgId});

      if (values.image) {
        const rewardId = isEdit ? reward.rewardId : response?.data?._id || response?._id;
        response = await updateRewardImage(rewardId, values.image);
      }

      toast.success(isEdit ? "Reward updated successfully" : "Reward created successfully");
      onSuccess?.(response);
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} reward. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Reward" : "Add Reward"}
          </h2>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && !error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-foreground/60">
              <Loader2 size={14} className="animate-spin" />
              {isEdit ? "Saving changes..." : "Creating reward..."}
            </div>
          )}

          <RewardForm initialValues={isEdit ? reward : null} loading={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}