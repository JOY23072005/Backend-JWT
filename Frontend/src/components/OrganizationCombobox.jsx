import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

/**
 * Searchable organization combobox.
 * Displays organization names, but reports the underlying org id
 * (the `orgid` field returned by GET /org) to the caller via onChange.
 */
function OrganizationCombobox({
  id,
  organizations,
  isLoading,
  value,
  onChange,
  onBlur,
  error,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOrg = organizations.find((org) => org.orgid === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(query.toLowerCase())
  );

  const displayValue = isOpen ? query : selectedOrg?.name || "";

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={isLoading ? "Loading organizations..." : "Search organization..."}
          disabled={isLoading}
          value={displayValue}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange("");
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ChevronDown size={16} />
          )}
        </span>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
          {filteredOrgs.length === 0 ? (
            <p className="px-3 py-2 text-sm text-foreground/50">
              No organizations found
            </p>
          ) : (
            filteredOrgs.map((org) => (
              org.isActive && <button
                type="button"
                key={org.orgid}
                onClick={() => {
                  onChange(org.orgid);
                  setQuery(org.name);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-primary/10 ${
                  org.orgid === value
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                }`}
              >
                {org.name}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
export default OrganizationCombobox
