import { Building2, X, Calendar } from "lucide-react";

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
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function OrganizationDetailsDrawer({ organization, open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative flex h-full w-full max-w-md transform flex-col bg-card shadow-lg transition-transform duration-300 ease-in-out sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Organization Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!organization ? (
            <p className="text-sm text-foreground/50">No organization selected.</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 pb-5 border-b border-border">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-foreground/5">
                  {organization.image_url ? (
                    <img
                      src={organization.image_url}
                      alt={organization.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 size={28} className="text-foreground/30" />
                  )}
                </div>
                <h3 className="text-center text-base font-semibold text-foreground">
                  {organization.name}
                </h3>
              </div>

              <div className="mt-2">
                <DetailRow label="Organization Name">{organization.name || "—"}</DetailRow>
                <DetailRow label="Organization Code">{organization.code || "—"}</DetailRow>
                <DetailRow label="Category">{organization.category || "—"}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge isActive={organization.isActive} />
                </DetailRow>
                <DetailRow label="Created Date">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-foreground/40" />
                    {formatDate(organization.createdAt || organization.created_at)}
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