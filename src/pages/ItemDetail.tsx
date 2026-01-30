import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getItem, updateItem, deleteItem } from '@/services/dataService';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/components/Toast';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { CURRENCIES, formatPrice } from '@/utils/currency';
import type { Item } from '@/types';
import type { Currency } from '@/types';

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show: toast } = useToast();
  const { categories } = useCategories();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    currency: 'ILS' as Currency,
    wantToSell: true,
    categoryId: '',
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getItem(id)
      .then((data) => {
        setItem(data);
        setForm({
          name: data.name,
          price: String(data.price),
          currency: (data.currency ?? 'ILS') as Currency,
          wantToSell: data.wantToSell,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl ?? '',
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateItem(id, {
        name: form.name.trim(),
        price: Number(form.price),
        currency: form.currency,
        wantToSell: form.wantToSell,
        categoryId: form.categoryId || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      });
      setItem(updated);
      setEditing(false);
      toast('Item updated', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteItem(id);
      toast('Item deleted', 'success');
      navigate('/');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  if (loading) return <p className="px-4 py-8 text-center text-gray-400">Loading...</p>;
  if (error || !item) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-danger">{error ?? 'Item not found'}</p>
        <Link to="/" className="mt-4 inline-block text-primary">Back to list</Link>
      </div>
    );
  }

  const category = categories.find((c) => c._id === item.categoryId);

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-gray-400 touch-target py-2">← Back</Link>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white touch-target"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <Card className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-3 py-2 text-text touch-target"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-3 py-2 text-text touch-target"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Currency</label>
            <div className="mb-2 flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, currency: c }))}
                  className={`flex-1 rounded-lg py-2 text-sm touch-target ${
                    form.currency === c ? 'bg-primary text-white' : 'bg-bg-elevated text-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="mb-1 block text-sm text-gray-400">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-3 py-2 text-text touch-target"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Want to sell</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, wantToSell: true }))}
                className={`flex-1 rounded-lg py-2 touch-target ${form.wantToSell ? 'bg-primary text-white' : 'bg-bg-elevated text-gray-400'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, wantToSell: false }))}
                className={`flex-1 rounded-lg py-2 touch-target ${!form.wantToSell ? 'bg-primary text-white' : 'bg-bg-elevated text-gray-400'}`}
              >
                No
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-3 py-2 text-text touch-target"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg bg-bg-elevated py-2 text-text touch-target"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-primary py-2 text-white touch-target disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt=""
              className="mb-4 h-48 w-full rounded-lg object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-text">{item.name}</h1>
          <p className="mt-1 text-gray-400">{category?.name ?? '—'}</p>
          <p className="mt-2 text-xl font-medium text-text">
            {formatPrice(item.price, item.currency ?? 'ILS')}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Want to sell: {item.wantToSell ? 'Yes' : 'No'}
          </p>
          <button
            type="button"
            onClick={() => setDeleteModal(true)}
            className="mt-6 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white touch-target"
          >
            Delete item
          </button>
        </Card>
      )}

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
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p>This cannot be undone.</p>
      </Modal>
    </div>
  );
}
