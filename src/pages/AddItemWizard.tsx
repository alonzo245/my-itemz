import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { createItem, createCategory } from "@/services/dataService";
import { useToast } from "@/components/Toast";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { CURRENCIES } from "@/utils/currency";
import type { Currency } from "@/types";

const STEPS = 4;
const CATEGORY_ICONS = [
  "📦",
  "🪑",
  "📱",
  "👕",
  "📚",
  "🎮",
  "🖼️",
  "💡",
  "🔧",
  "📷",
];

export function AddItemWizard() {
  const navigate = useNavigate();
  const { show: toast } = useToast();
  const {
    categories,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("ILS");
  const [wantToSell, setWantToSell] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    color: "#3b82f6",
    icon: "📦",
  });
  const [addingCategory, setAddingCategory] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) nameInputRef.current?.focus();
  }, [step]);

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!categoryId;
    if (step === 2)
      return price !== "" && !Number.isNaN(Number(price)) && Number(price) >= 0;
    if (step === 3) return true;
    return false;
  };

  const handleNext = () => {
    if (step < STEPS - 1) setStep((s) => s + 1);
    else handleSave();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createItem({
        name: name.trim(),
        categoryId,
        price: Number(price),
        currency,
        wantToSell,
      });
      toast("Item saved!", "success");
      navigate("/");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryForm.name.trim()) {
      toast("Category name is required", "error");
      return;
    }
    setAddingCategory(true);
    try {
      const created = await createCategory({
        name: newCategoryForm.name.trim(),
        color: newCategoryForm.color,
        icon: newCategoryForm.icon,
      });
      await refetchCategories();
      setCategoryId(created._id);
      setAddCategoryOpen(false);
      setNewCategoryForm({ name: "", color: "#3b82f6", icon: "📦" });
      toast("Category added", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to add category", "error");
    } finally {
      setAddingCategory(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 pb-8 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-gray-400 touch-target py-2">
          Cancel
        </Link>
        <span className="text-sm text-gray-400">
          Step {step + 1} of {STEPS}
        </span>
      </header>
      <div className="mx-auto max-w-md">
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === step
                  ? "bg-primary"
                  : i < step
                    ? "bg-primary/50"
                    : "bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <Card className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">
              Item name
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Lamp"
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-4 py-3 text-lg text-text placeholder-gray-500 touch-target"
              autoComplete="off"
            />
          </Card>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <Card className="mb-6">
            <p className="mb-3 text-sm text-gray-400">Choose category</p>
            {categoriesLoading ? (
              <p className="text-gray-400">Loading categories...</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setCategoryId(c._id)}
                    className={`flex flex-col items-center justify-center rounded-lg py-3 touch-target ${
                      categoryId === c._id
                        ? "bg-primary text-white"
                        : "bg-bg-elevated text-text"
                    }`}
                  >
                    <span className="text-lg">{c.icon ?? "📦"}</span>
                    <span className="mt-0.5 truncate w-full px-1 text-center text-xs font-medium">
                      {c.name}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAddCategoryOpen(true)}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-500 py-3 text-gray-400 transition-colors hover:border-primary hover:text-primary touch-target"
                >
                  <span className="text-lg">+</span>
                  <span className="mt-0.5 text-xs font-medium">
                    Add category
                  </span>
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Price & currency */}
        {step === 2 && (
          <Card className="mb-6">
            <label className="mb-2 block text-sm text-gray-400">Currency</label>
            <div className="mb-4 flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium touch-target ${
                    currency === c
                      ? "bg-primary text-white"
                      : "bg-bg-elevated text-gray-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="mb-2 block text-sm text-gray-400">Price</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-4 py-4 text-2xl text-text placeholder-gray-500 touch-target"
            />
          </Card>
        )}

        {/* Step 3: Want to sell */}
        {step === 3 && (
          <Card className="mb-6">
            <p className="mb-3 text-sm text-gray-400">
              Want to sell this item?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWantToSell(true)}
                className={`rounded-lg py-3 text-sm font-medium touch-target ${
                  wantToSell
                    ? "bg-primary text-white"
                    : "bg-bg-elevated text-gray-400"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWantToSell(false)}
                className={`rounded-lg py-3 text-sm font-medium touch-target ${
                  !wantToSell
                    ? "bg-primary text-white"
                    : "bg-bg-elevated text-gray-400"
                }`}
              >
                No
              </button>
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-xl bg-bg-card py-4 font-medium text-text touch-target"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext() || saving}
            className="flex-1 rounded-xl bg-primary py-4 font-medium text-white touch-target disabled:opacity-50"
          >
            {saving ? "Saving..." : step === STEPS - 1 ? "Save" : "Next"}
          </button>
        </div>
      </div>

      <Modal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        title="Add category"
        actions={
          <>
            <button
              type="button"
              onClick={() => setAddCategoryOpen(false)}
              className="rounded-lg bg-bg-elevated px-4 py-2 text-text touch-target"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={addingCategory || !newCategoryForm.name.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-white touch-target disabled:opacity-50"
            >
              {addingCategory ? "Adding..." : "Add"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Name</label>
            <input
              value={newCategoryForm.name}
              onChange={(e) =>
                setNewCategoryForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-3 py-2 text-text touch-target"
              placeholder="e.g. Electronics"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Color</label>
            <input
              type="color"
              value={newCategoryForm.color}
              onChange={(e) =>
                setNewCategoryForm((f) => ({ ...f, color: e.target.value }))
              }
              className="h-10 w-full cursor-pointer rounded border-0 touch-target"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Icon</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewCategoryForm((f) => ({ ...f, icon }))}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl touch-target ${
                    newCategoryForm.icon === icon
                      ? "ring-2 ring-primary bg-primary/20"
                      : "bg-bg-elevated"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
