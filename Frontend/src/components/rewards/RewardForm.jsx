import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import OrganizationCombobox from "../OrganizationCombobox";
import axiosInstance from "../../api/axios";

export default function RewardForm({ initialValues, loading, onSubmit }) {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(initialValues?.image_url || null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const { user } = useAuth();
  const canChooseOrganization = user?.role === "admin";

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data } = await axiosInstance.get("/org");
        setOrganizations(data.organizations || []);
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    if (!initialValues && canChooseOrganization) {
      fetchOrganizations();
    }
  }, [canChooseOrganization]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialValues?.title || "",
      coinCost: initialValues?.coinCost ?? "",
      orgId: initialValues?.orgId || "",
      image: undefined,
    },
  });

  const image = watch("image");

  useEffect(() => {
    reset({
      title: initialValues?.title || "",
      coinCost: initialValues?.coinCost ?? "",
      orgId: initialValues?.orgId || "",
      image: undefined,
    });
    setImagePreview(initialValues?.image_url || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useEffect(() => {
    const file = image?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handleRemoveImage = () => {
    setValue("image", undefined);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitHandler = (values) => {
    onSubmit?.({
      title: values.title.trim(),
      coinCost: Number(values.coinCost),
      orgId: values.orgId,
      image: values.image?.[0] || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
          Reward Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Amazon Gift Card"
          disabled={loading}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.title ? "border-red-400" : "border-border"
          }`}
          {...register("title", {
            required: "Reward title is required",
            minLength: { value: 2, message: "Title must be at least 2 characters" },
            maxLength: { value: 100, message: "Title must be under 100 characters" },
          })}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>
      
      {canChooseOrganization && !initialValues && (
        <div>
          <label
            htmlFor="orgId"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Organization
          </label>

          <Controller
            name="orgId"
            control={control}
            rules={{
              required: "Please select an organization.",
            }}
            render={({ field }) => (
              <OrganizationCombobox
                id="orgId"
                organizations={organizations}
                isLoading={isLoadingOrgs}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.orgId?.message}
              />
            )}
          />
        </div>
      )}

      <div>
        <label htmlFor="coinCost" className="mb-1.5 block text-sm font-medium text-foreground">
          Coin Cost
        </label>
        <input
          id="coinCost"
          type="number"
          placeholder="e.g. 500"
          disabled={loading}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.coinCost ? "border-red-400" : "border-border"
          }`}
          {...register("coinCost", {
            required: "Coin cost is required",
            valueAsNumber: true,
            validate: (value) => (value > 0 ? true : "Coin cost must be positive"),
          })}
        />
        {errors.coinCost && <p className="mt-1 text-xs text-red-600">{errors.coinCost.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Reward Image <span className="font-normal text-foreground/40">(optional)</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-foreground/5">
            {imagePreview ? (
              <img src={imagePreview} alt="Reward preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={22} className="text-foreground/30" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={14} /> Upload Image
            </button>
            {imagePreview && (
              <button
                type="button"
                disabled={loading}
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register("image")}
            ref={(e) => {
              register("image").ref(e);
              fileInputRef.current = e;
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {initialValues ? "Save Changes" : "Create Reward"}
        </button>
      </div>
    </form>
  );
}