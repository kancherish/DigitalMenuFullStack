import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { categoryService } from '../services/categoryService';
import { itemService } from '../services/itemService';
import { diffChanged } from '../../util/util';
import ItemForm from './ItemForm';
import type { Category, Item, ItemFormValues, ItemPayload } from '../types';
import { emptyItemForm } from '../components/ItemFormValues';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { Alert, Button, EmptyState, PageHeader, Spinner } from '../components/ui';

function itemToFormValues(item: Item): ItemFormValues {
  const hasVariants = item.variants.length > 0;
  const existingImageUrl = item.imageURL ?? (item as { imageUrl?: string }).imageUrl ?? '';
  return {
    name: item.name,
    description: item.description ?? '',
    pricingMode: hasVariants ? 'variants' : 'price',
    price: item.price !== null ? String(item.price) : '',
    variants: hasVariants
      ? item.variants.map((v) => ({ name: v.name, price: String(v.price) }))
      : [{ name: '', price: '' }],
    badges: item.badges,
    imageMode: existingImageUrl ? 'url' : 'upload',
    imageUrl: existingImageUrl,
    imageFile: null,
    available: item.available,
    removeImage: false,
  };
}

// Builds only JSON fields that changed. Image changes are handled separately.
function buildItemChanges(original: Item, form: ItemFormValues) {
  const changes: ItemPayload = {};

  const flatOriginal = { name: original.name, description: original.description ?? '', available: original.available };
  const flatUpdated = { name: form.name, description: form.description, available: form.available };
  Object.assign(changes, diffChanged(flatOriginal, flatUpdated));

  const badgeChanges = diffChanged({ badges: original.badges }, { badges: form.badges }, ['badges']);
  Object.assign(changes, badgeChanges);

  if (form.removeImage) {
    changes.removeImage = true;
  } else if (form.imageMode === 'url') {
    const newImageUrl = (form.imageUrl ?? '').trim();
    const originalImageUrl = original.imageURL ?? (original as { imageUrl?: string }).imageUrl ?? '';
    if (newImageUrl !== originalImageUrl) changes.imageURL = newImageUrl;
  }

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
    available: form.available,
    imageURL: form.imageMode === 'url' ? form.imageUrl?.trim() || undefined : undefined,
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

function validatePricing(form: ItemFormValues): string | null {
  if (form.pricingMode === 'price') {
    if (form.price.trim() === '') return 'Enter a price (use 0 for free).';
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return 'Enter a valid price.';
    return null;
  }

  const variants = form.variants.filter((v) => v.name.trim());
  if (variants.length === 0) return 'Add at least one variant with a name and price.';
  if (variants.some((v) => v.price.trim() === '' || !Number.isFinite(Number(v.price)) || Number(v.price) < 0)) {
    return 'Enter a valid price for every variant.';
  }
  return null;
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

  function handleCategoryChange(categoryId: string) {
    if (categoryId === activeCategoryId) return;
    setAdding(false);
    setAddForm(emptyItemForm);
    cancelEdit();
    setError(null);
    setActiveCategoryId(categoryId);
  }

  async function handleAdd() {
    if (!activeCategoryId || !addForm.name.trim()) return;
    const pricingError = validatePricing(addForm);
    if (pricingError) {
      setError(pricingError);
      return;
    }

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
    const pricingError = validatePricing(editForm);
    if (pricingError) {
      setError(pricingError);
      return;
    }
    const changes = buildItemChanges(item, editForm);
    const hasJsonChanges = Object.keys(changes).length > 0;
    const hasImageChange = editForm.imageFile !== null || editForm.removeImage;

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

  // quick toggle from the list row, without opening the full edit form
  async function handleQuickToggleAvailable(item: Item) {
    setError(null);
    try {
      const updated = await itemService.update(item.publicId, { available: !item.available });
      setItems((prev) => prev.map((i) => (i.publicId === updated.publicId ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
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

  const currency = admin?.restaurant.currencySymbol || '₹';

  if (loadingCategories) {
    return <Spinner label="Loading menu items..." />;
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed size={20} />}
        title="No categories yet"
        description="Add a category first, then come back to add items to your menu."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Menu Items"
        description="Manage what's on your menu, by category."
        action={
          <span className="rounded-full border border-slate-200 bg-ui-surface px-3 py-1 text-xs font-medium text-slate-600">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        }
      />

      <div className="scrollbar-hide mb-6 flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-ui-surface p-1.5 shadow-sm">
        {categories.map((cat) => (
          <button
            key={cat.publicId}
            type="button"
            onClick={() => handleCategoryChange(cat.publicId)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              activeCategoryId === cat.publicId
                ? 'bg-ui-accent-solid text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      {!adding ? (
        <Button type="button" variant="secondary" onClick={() => setAdding(true)} className="mb-6">
          <Plus size={16} />
          Add item
        </Button>
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
        <Spinner label="Loading items..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={20} />}
          title="No items in this category"
          description="Add your first item to this category to make it appear on your menu."
        />
      ) : (
        <div className="space-y-3">
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

            const imageUrl =
              (item as { imageUrl?: string; imageURL?: string }).imageUrl ??
              (item as { imageUrl?: string; imageURL?: string }).imageURL;

            return (
              <div
                key={item.publicId}
                className={`rounded-xl border bg-ui-surface p-4 shadow-sm transition-colors hover:border-slate-300 ${
                  item.available === false ? 'border-slate-200 opacity-75' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className={`h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover ${
                          item.available === false ? 'grayscale' : ''
                        }`}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                        {item.available === false && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Sold out
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-2 text-sm font-medium text-slate-800">
                        {item.variants.length > 0
                          ? item.variants.map((v) => `${v.name}: ${currency}${v.price}`).join(' · ')
                          : `${currency}${item.price ?? 0}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" onClick={() => startEdit(item)}>
                        <Pencil size={14} />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(item.publicId)}
                        disabled={deletingId === item.publicId}
                      >
                        <Trash2 size={14} />
                        {deletingId === item.publicId ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleQuickToggleAvailable(item)}
                    >
                      {item.available === false ? 'Mark available' : 'Mark sold out'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}