import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { categoryService } from '../services/categoryService';
import { itemService } from '../services/itemService';
import { diffChanged } from '../../util/util';
import ItemForm from './ItemForm';
import type { Category, Item, ItemFormValues } from '../types';
import { emptyItemForm } from '../components/ItemFormValues';

function itemToFormValues(item: Item): ItemFormValues {
  const hasVariants = item.variants.length > 0;
  return {
    name: item.name,
    description: item.description ?? '',
    pricingMode: hasVariants ? 'variants' : 'price',
    price: item.price !== null ? String(item.price) : '',
    variants: hasVariants
      ? item.variants.map((v) => ({ name: v.name, price: String(v.price) }))
      : [{ name: '', price: '' }],
    badges: item.badges,
    imageUrl: ((item as { imageUrl?: string | undefined; imageURL?: string | undefined }).imageUrl ??
      (item as { imageUrl?: string | undefined; imageURL?: string | undefined }).imageURL) ?? undefined,
    imageFile: null,
    removeImage: false,
  };
}

// Builds only JSON fields that changed. Image changes are handled separately.
function buildItemChanges(original: Item, form: ItemFormValues) {
  const changes: Record<string, unknown> = {};

  const flatOriginal = { name: original.name, description: original.description ?? '' };
  const flatUpdated = { name: form.name, description: form.description };
  Object.assign(changes, diffChanged(flatOriginal, flatUpdated));

  const badgeChanges = diffChanged({ badges: original.badges }, { badges: form.badges }, ['badges']);
  Object.assign(changes, badgeChanges);

  const originalHasVariants = original.variants.length > 0;
  const modeChanged = originalHasVariants !== (form.pricingMode === 'variants');

  if (form.pricingMode === 'price') {
    const newPrice = Number(form.price);
    if (modeChanged || original.price !== newPrice) {
      changes.price = newPrice;
    }
  } else {
    const newVariants = form.variants
      .filter((v) => v.name.trim())
      .map((v) => ({ name: v.name.trim(), price: Number(v.price) }));
    const originalVariants = original.variants.map((v) => ({ name: v.name, price: v.price }));
    if (modeChanged || JSON.stringify(originalVariants) !== JSON.stringify(newVariants)) {
      changes.variants = newVariants;
    }
  }

  return changes;
}

function buildNewItemPayload(form: ItemFormValues, categoryId: string) {
  const base = {
    name: form.name,
    description: form.description || undefined,
    category_id: categoryId,
    badges: form.badges,
  };

  if (form.pricingMode === 'price') {
    return { ...base, price: Number(form.price) };
  }

  return {
    ...base,
    variants: form.variants
      .filter((v) => v.name.trim())
      .map((v) => ({ name: v.name.trim(), price: Number(v.price) })),
  };
}

export function ItemsPage() {
  const { admin } = useAuth();
  const restaurantId = admin?.restaurant.publicId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<ItemFormValues>(emptyItemForm);
  const [savingAdd, setSavingAdd] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ItemFormValues | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    categoryService
      .getByRestaurant(restaurantId)
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setActiveCategoryId(data[0].publicId);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load categories'))
      .finally(() => setLoadingCategories(false));
  }, [restaurantId]);

  useEffect(() => {
    if (!activeCategoryId) return;
    let cancelled = false;
    setLoadingItems(true);

    itemService
      .getByCategory(activeCategoryId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load items');
      })
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategoryId]);

  async function handleAdd() {
    if (!activeCategoryId || !addForm.name.trim()) return;

    setSavingAdd(true);
    setError(null);
    try {
      const payload = buildNewItemPayload(addForm, activeCategoryId);
      const created = await itemService.add(payload, addForm.imageFile || undefined);
      setItems((prev) => [...prev, created]);
      setAddForm(emptyItemForm);
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSavingAdd(false);
    }
  }

  function startEdit(item: Item) {
    setEditingId(item.publicId);
    setEditForm(itemToFormValues(item));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function handleSaveEdit(item: Item) {
    if (!editForm) return;
    const changes = buildItemChanges(item, editForm);
    const hasJsonChanges = Object.keys(changes).length > 0;
    const hasImageChange = editForm.imageFile !== null || editForm.removeImage;
    console.log(changes)
    if (!hasJsonChanges && !hasImageChange) {
      cancelEdit();
      return;
    }

    setSavingEdit(true);
    setError(null);
    try {
      const updated = await itemService.update(
        item.publicId,
        changes,
        editForm.imageFile || undefined,
        editForm.removeImage
      );
      setItems((prev) => prev.map((i) => (i.publicId === updated.publicId ? updated : i)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('Delete this item?')) return;

    setDeletingId(itemId);
    setError(null);
    try {
      await itemService.delete(itemId);
      setItems((prev) => prev.filter((i) => i.publicId !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  }

  if (loadingCategories) return <div className="text-sm text-slate-500">Loading...</div>;

  if (categories.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No categories yet — add one on the Categories page first.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Menu Items</h1>

      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.publicId}
            onClick={() => setActiveCategoryId(cat.publicId)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeCategoryId === cat.publicId
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          + Add item
        </button>
      ) : (
        <div className="mb-6">
          <ItemForm
            values={addForm}
            onChange={setAddForm}
            onSubmit={handleAdd}
            onCancel={() => {
              setAdding(false);
              setAddForm(emptyItemForm);
            }}
            submitLabel="Add item"
            submitting={savingAdd}
          />
        </div>
      )}

      {loadingItems ? (
        <div className="text-sm text-slate-500">Loading items...</div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-6">No items in this category</div>
          )}

          {items.map((item) => {
            const isEditing = editingId === item.publicId;

            if (isEditing && editForm) {
              return (
                <ItemForm
                  key={item.publicId}
                  values={editForm}
                  onChange={setEditForm}
                  onSubmit={() => handleSaveEdit(item)}
                  onCancel={cancelEdit}
                  submitLabel="Save"
                  submitting={savingEdit}
                />
              );
            }

            return (
              <div
                key={item.publicId}
                className="bg-white rounded-lg border border-slate-200 p-4 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {(() => {
                    const imageUrl = (item as { imageUrl?: string | undefined; imageURL?: string | undefined }).imageUrl ??
                      (item as { imageUrl?: string | undefined; imageURL?: string | undefined }).imageURL;
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-md border border-slate-200 shrink-0"
                      />
                    ) : null;
                  })()}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                    )}
                    <div className="text-sm text-slate-700 mt-1">
                      {item.variants.length > 0
                        ? item.variants.map((v) => `${v.name}: ₹${v.price}`).join(' · ')
                        : `₹${item.price}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.publicId)}
                    disabled={deletingId === item.publicId}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === item.publicId ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}