import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  "Educational",
  "Corporate",
  "Non-Profit",
  "Government",
  "Healthcare",
  "Retail",
  "Technology",
  "Other",
];

export default function OrganizationForm({
  initialValues,
  loading,
  onSubmit,
}) {
  const isEdit = Boolean(initialValues?.orgid);

  const fileInputRef = useRef(null);

  const [logoPreview, setLogoPreview] = useState(
    initialValues?.image_url || null
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      code: "",
      category: "",
    },
  });

  const logoFile = watch("logo");

  useEffect(() => {
    reset({
      name: initialValues?.name || "",
      code: initialValues?.code || "",
      category: initialValues?.category || "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setLogoPreview(initialValues?.image_url || null);
  }, [initialValues, reset]);

  useEffect(() => {
    if (!logoFile?.length) return;

    const url = URL.createObjectURL(logoFile[0]);

    setLogoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const handleRemoveLogo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setLogoPreview(initialValues?.image_url || null);
  };

  const submitHandler = (values) => {
    onSubmit({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      category: values.category,
      logo: values.logo?.[0] || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-5"
    >
      {/* Name */}

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Organization Name
        </label>

        <input
          type="text"
          disabled={loading}
          placeholder="Organization Name"
          className={`w-full rounded-md border px-3 py-2 ${
            errors.name
              ? "border-red-500"
              : "border-border"
          }`}
          {...register("name", {
            required: "Organization name is required",
          })}
        />

        {errors.name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Code */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Organization Code
        </label>

        <input
          type="text"
          disabled={loading || isEdit}
          readOnly={isEdit}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm uppercase text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.code ? "border-red-400" : "border-border"
          } ${isEdit ? "bg-foreground/5 text-foreground/60" : ""}`}
          {...register("code", {
            required: "Organization code is required",
          })}
        />

        {isEdit && (
          <p className="mt-1 text-xs text-foreground/50">
            Organization code cannot be changed.
          </p>
        )}

        {errors.code && (
          <p className="mt-1 text-xs text-red-500">
            {errors.code.message}
          </p>
        )}
      </div>

      {/* Category */}

      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
          Category
        </label>

        <select
          disabled={loading}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.category ? "border-red-400" : "border-border"
          }`}
          {...register("category", {
            required: "Select a category",
          })}
        >
          <option value="">
            Select Category
          </option>

          {CATEGORY_OPTIONS.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        {errors.category && (
          <p className="mt-1 text-xs text-red-500">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Logo */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Logo
        </label>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border">
            {logoPreview ? (
              <img
                src={logoPreview}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={22} />
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              <Upload
                size={15}
                className="mr-2 inline"
              />
              Upload
            </button>

            {logoPreview && (
              <button
                type="button"
                disabled={loading}
                onClick={handleRemoveLogo}
                className="rounded-md border px-3 py-2 text-sm text-red-600"
              >
                <X
                  size={15}
                  className="mr-2 inline"
                />
                Remove
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register("logo")}
            ref={(e) => {
              register("logo").ref(e);
              fileInputRef.current = e;
            }}
          />
        </div>
      </div>

      {/* Submit */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground"
        >
          {loading && (
            <Loader2
              size={16}
              className="animate-spin"
            />
          )}

          {isEdit
            ? "Save Changes"
            : "Create Organization"}
        </button>
      </div>
    </form>
  );
}