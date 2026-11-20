import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { categoryService } from '../services/categoryService';
import { diffChanged } from '../../util/util';
import type { Category } from '../types';
import type { FormEvent } from 'react';
import { IconPicker } from '../components/IconPicker';
import { ICONS, DEFAULT_ICON_string } from '../../util/util';
import { Check, Pencil, Plus, Tags, Trash2, X } from 'lucide-react';
import { Alert, Button, EmptyState, PageHeader, Spinner } from '../components/ui';

export function CategoriesPage() {
  const { admin } = useAuth();
  const restaurantId = admin?.restaurant.publicId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON_string);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; icon: string } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;

    categoryService
      .getByRestaurant(restaurantId)
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load categories');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    setError(null);
    try {
      const created = await categoryService.add(newName.trim(), newIcon.trim() || undefined);
      setCategories((prev) => [...prev, created]);
      setNewName('');
      setNewIcon(DEFAULT_ICON_string);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.publicId);
    setEditForm({ name: cat.name, icon: cat.icon || '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function handleSaveEdit(cat: Category) {
    if (!editForm) return;

    const changes = diffChanged({ name: cat.name, icon: cat.icon }, editForm);

    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }

    setSavingEdit(true);
    setError(null);
    try {
      const updateData: { name?: string; icon?: string } = {};
      if (changes.name !== undefined) updateData.name = changes.name;
      if (changes.icon !== undefined) {
        updateData.icon = changes.icon === null ? '' : changes.icon;
      }

      const updated = await categoryService.update(cat.publicId, updateData);
      setCategories((prev) => prev.map((c) => (c.publicId === updated.publicId ? updated : c)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(categoryId: string) {
    if (!confirm('Delete this category? Items inside it will also be deleted.')) return;

    setDeletingId(categoryId);
    setError(null);
    try {
      await categoryService.delete(categoryId);
      setCategories((prev) => prev.filter((c) => c.publicId !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <Spinner label="Loading categories..." />;

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your menu into sections your customers can browse."
        action={
          <span className="rounded-full border border-slate-200 bg-ui-surface px-3 py-1 text-xs font-medium text-slate-600">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </span>
        }
      />

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-slate-200 bg-ui-surface p-4 shadow-sm">
        <label className="mb-3 block text-sm font-medium text-slate-800">Add a category</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="input"
            required
          />
          <IconPicker value={newIcon || DEFAULT_ICON_string} onChange={setNewIcon} className="w-full sm:w-40" />
          <Button type="submit" disabled={adding} className="whitespace-nowrap">
            <Plus size={16} />
            {adding ? 'Adding...' : 'Add category'}
          </Button>
        </div>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tags size={20} />}
          title="No categories yet"
          description="Add your first category above to start building your menu."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-ui-surface shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            All categories
          </div>
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const isEditing = editingId === cat.publicId;
              const CategoryIcon = cat.icon ? ICONS[cat.icon] : null;

              return (
                <div key={cat.publicId} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                  {isEditing && editForm ? (
                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="input flex-1"
                      />
                      <IconPicker
                        value={editForm.icon}
                        onChange={(icon) => setEditForm({ ...editForm, icon })}
                        className="w-full sm:w-40"
                      />
                      <div className="flex shrink-0 gap-2">
                        <Button type="button" onClick={() => handleSaveEdit(cat)} disabled={savingEdit}>
                          <Check size={15} />
                          Save
                        </Button>
                        <Button type="button" variant="secondary" onClick={cancelEdit}>
                          <X size={15} />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          {CategoryIcon ? <CategoryIcon size={17} /> : <Tags size={17} />}
                        </div>
                        <span className="truncate text-sm font-medium text-slate-900">{cat.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button type="button" variant="ghost" onClick={() => startEdit(cat)}>
                          <Pencil size={15} />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(cat.publicId)}
                          disabled={deletingId === cat.publicId}
                        >
                          <Trash2 size={15} />
                          {deletingId === cat.publicId ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
