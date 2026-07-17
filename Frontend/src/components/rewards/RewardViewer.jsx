import { Gift, X, Calendar } from "lucide-react";

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const DetailRow = ({ label, children }) => (
  <div className="border-b border-border py-4 last:border-0">
    <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">{label}</p>
    <div className="mt-1.5 text-sm text-foreground">{children}</div>
  </div>
);

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

export default function RewardViewer({ reward, open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Reward Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {!reward ? (
            <p className="text-sm text-foreground/50">No reward selected.</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 border-b border-border pb-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-foreground/5">
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.title} className="h-full w-full object-cover" />
                  ) : (
                    <Gift size={28} className="text-foreground/30" />
                  )}
                </div>
                <h3 className="text-center text-base font-semibold text-foreground">{reward.title}</h3>
              </div>

              <div className="mt-2">
                <DetailRow label="Reward Title">{reward.title || "—"}</DetailRow>
                <DetailRow label="Coin Cost">{reward.coinCost ?? "—"}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge isActive={reward.isActive} />
                </DetailRow>
                <DetailRow label="Created At">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-foreground/40" />
                    {formatDate(reward.createdAt)}
                  </span>
                </DetailRow>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}