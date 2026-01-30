import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '@/services/dataService';
import { useToast } from '@/components/Toast';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import type { Category } from '@/types';

const ICONS = ['📦', '🪑', '📱', '👕', '📚', '🎮', '🖼️', '💡', '🔧', '📷'];

export function CategoryManagement() {
  const { categories, loading, error, refetch } = useCategories();
  const { show: toast } = useToast();
  const [modal, setModal] = useState<{ open: true; category?: Category } | { open: false }>({ open: false });
  const [form, setForm] = useState({ name: '', color: '#3b82f6', icon: '📦' });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setForm({ name: '', color: '#3b82f6', icon: '📦' });
    setModal({ open: true });
  };

  const openEdit = (category: Category) => {
    setForm({
      name: category.name,
      color: category.color ?? '#3b82f6',
      icon: category.icon ?? '📦',
    });
    setModal({ open: true, category });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (modal.open && modal.category) {
        await updateCategory(modal.category._id, {
          name: form.name.trim(),
          color: form.color,
          icon: form.icon,
        });
        toast('Category updated', 'success');
      } else {
        await createCategory({
          name: form.name.trim(),
          color: form.color,
          icon: form.icon,
        });
        toast('Category added', 'success');
      }
      setModal({ open: false });
      refetch();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category: Category) => {
    setDeleteModal({ id: category._id, name: category.name });
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteModal.id);
      toast('Category deleted', 'success');
      refetch();
      setDeleteModal(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-danger">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Categories</h1>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white touch-target"
        >
          Add category
        </button>
      </div>
      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No categories. Add one to use in items.</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => (
            <li key={c._id}>
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ backgroundColor: (c.color ?? '#3b82f6') + '30' }}
                  >
                    {c.icon ?? '📦'}
                  </span>
                  <span className="font-medium text-text">{c.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="rounded-lg bg-bg-elevated px-3 py-2 text-sm text-text touch-target"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(c)}
                    className="rounded-lg bg-danger/80 px-3 py-2 text-sm text-white touch-target"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.open && modal.category ? 'Edit category' : 'New category'}
        actions={
          <>
            <button
              type="button"
              onClick={() => setModal({ open: false })}
              className="rounded-lg bg-bg-elevated px-4 py-2 text-text touch-target"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-white touch-target disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        {modal.open && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-600 bg-bg-elevated px-3 py-2 text-text touch-target"
                placeholder="e.g. Electronics"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="h-10 w-full cursor-pointer rounded border-0 touch-target"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon }))}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl touch-target ${
                      form.icon === icon ? 'ring-2 ring-primary' : 'bg-bg-elevated'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete category?"
        actions={
          <>
            <button
              type="button"
              onClick={() => setDeleteModal(null)}
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
        {deleteModal && (
          <p>
            Delete &quot;{deleteModal.name}&quot;? Items in this category will keep their data but
            will have no category.
          </p>
        )}
      </Modal>
    </div>
  );
}
