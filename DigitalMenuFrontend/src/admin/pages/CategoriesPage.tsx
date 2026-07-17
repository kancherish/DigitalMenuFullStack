// pages/CategoriesPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { categoryService } from '../services/categoryService';
import { diffChanged } from '../../util/util';
import type { Category } from '../types';
import type { FormEvent } from 'react';
import { IconPicker } from '../components/IconPicker';
import { ICONS, DEFAULT_ICON_string } from '../../util/util';

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
    setEditForm({ name: cat.name, icon: cat.icon || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function handleSaveEdit(cat: Category) {
    if (!editForm) return;

    const changes = diffChanged(
      { name: cat.name, icon: cat.icon },
      editForm
    );

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
        updateData.icon = changes.icon === null ? "" : changes.icon;
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

  if (loading) return <div className="text-sm text-slate-500">Loading categories...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Categories</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name"
          className="input"
          required
        />
        <IconPicker value={newIcon || DEFAULT_ICON_string} onChange={setNewIcon} className="w-40" />
        <button
          type="submit"
          disabled={adding}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
        {categories.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-500 text-center">No categories yet</div>
        )}

        {categories.map((cat) => {
          const isEditing = editingId === cat.publicId;

          return (
           <div key={cat.publicId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              {isEditing && editForm ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
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
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => handleSaveEdit(cat)} disabled={savingEdit} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {(() => {
                    if (!cat.icon) {
                      return
                    }
                    const CatIcon = ICONS[cat.icon];
                    return CatIcon ? <CatIcon size={18} className="text-slate-500" /> : null;
                  })()}
                  <span className="flex-1 text-sm text-slate-900">{cat.name}</span>
                  <button onClick={() => startEdit(cat)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.publicId)}
                    disabled={deletingId === cat.publicId}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === cat.publicId ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}