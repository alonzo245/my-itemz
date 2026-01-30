import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useItems } from "@/hooks/useItems";
import { useCategories } from "@/hooks/useCategories";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { updateItem, deleteItem } from "@/services/dataService";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/utils/currency";
import type { Item } from "@/types";

export function Home() {
  const [searchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [wantToSellFilter, setWantToSellFilter] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    const cat = searchParams.get("categoryId") ?? "";
    const sell = searchParams.get("wantToSell");
    setCategoryFilter(cat);
    setWantToSellFilter(sell === "true" ? true : undefined);
  }, [searchParams]);
  const { items, loading, error, refetch } = useItems({
    categoryId: categoryFilter || undefined,
    wantToSell: wantToSellFilter,
  });
  const { categories } = useCategories();

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-danger">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <h1 className="mb-4 text-2xl font-bold text-text">My Items</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-600 bg-bg-card px-3 py-2 text-text touch-target"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWantToSellFilter(undefined)}
            className={`rounded-lg px-3 py-2 touch-target ${
              wantToSellFilter === undefined
                ? "bg-primary text-white"
                : "bg-bg-card text-gray-400"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setWantToSellFilter(true)}
            className={`rounded-lg px-3 py-2 touch-target ${
              wantToSellFilter === true
                ? "bg-primary text-white"
                : "bg-bg-card text-gray-400"
            }`}
          >
            Want to sell
          </button>
        </div>
      </div>
      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">
          No items yet. Tap + to add one.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              categories={categories}
              onUpdate={refetch}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemCard({
  item,
  categories,
  onUpdate,
}: {
  item: Item;
  categories: { _id: string; name: string; icon?: string }[];
  onUpdate: () => void;
}) {
  const { show: toast } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cat = categories.find((c) => c._id === item.categoryId);

  const handleToggleSelling = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      await updateItem(item._id, { wantToSell: !item.wantToSell });
      toast(
        item.wantToSell ? "Marked as not selling" : "Marked as selling",
        "success",
      );
      onUpdate();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to update", "error");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteItem(item._id);
      toast("Item deleted", "success");
      setDeleteModal(false);
      onUpdate();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li>
      <Card className="flex items-center gap-3 transition-opacity active:opacity-90">
        <Link
          to={`/items/${item._id}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text truncate">{item.name}</p>
            <p className="text-sm text-gray-400">
              {cat ? `${cat.icon ?? ""} ${cat.name}` : "—"} ·{" "}
              {formatPrice(item.price, item.currency ?? "ILS")}
            </p>
          </div>
        </Link>
        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleToggleSelling}
            disabled={toggling}
            className={`rounded-full px-2.5 py-1 text-xs font-medium touch-target transition-colors ${
              item.wantToSell
                ? "bg-primary/20 text-primary"
                : "bg-bg-elevated text-gray-400"
            } ${toggling ? "opacity-50" : ""}`}
            title={item.wantToSell ? "Mark as not selling" : "Mark as selling"}
          >
            {toggling ? "…" : item.wantToSell ? "Selling" : "Not selling"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteModal(true);
            }}
            className="rounded-lg bg-danger/20 px-2 py-1 text-xs font-medium text-danger touch-target hover:bg-danger/30"
            title="Delete item"
          >
            Delete
          </button>
        </div>
      </Card>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete item?"
        actions={
          <>
            <button
              type="button"
              onClick={() => setDeleteModal(false)}
              className="rounded-lg bg-bg-elevated px-4 py-2 text-text touch-target"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-danger px-4 py-2 text-white touch-target disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p>Delete &quot;{item.name}&quot;? This cannot be undone.</p>
      </Modal>
    </li>
  );
}
