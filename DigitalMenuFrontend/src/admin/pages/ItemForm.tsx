import { BadgeSelector } from "../components/BadgeSelector";
import type { ItemFormValues, ItemFormProps } from "../types";
import { useMemo } from "react";
import { Upload, ImageOff, X } from "lucide-react";

const inputStyles =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

export default function ItemForm({ values, onChange, onSubmit, onCancel, submitLabel, submitting }: ItemFormProps) {

  const previewSrc = useMemo(() => {
    if (values.imageFile) return URL.createObjectURL(values.imageFile);
    if (values.imageUrl && !values.removeImage) return values.imageUrl;
    return null;
  }, [values.imageFile, values.imageUrl, values.removeImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith("image")) {
      alert('File must be an image');
      e.target.value = '';
      return;
    }
    onChange({ ...values, imageFile: file, removeImage: false });
    e.target.value = ''; // allow re-selecting same file
  };

  const handleRemoveImage = () => {
    onChange({ ...values, imageFile: null, removeImage: true });
  };

  function update<K extends keyof ItemFormValues>(key: K, val: ItemFormValues[K]) {
    onChange({ ...values, [key]: val });
  }

  function updateVariant(index: number, field: 'name' | 'price', val: string) {
    const variants = values.variants.map((v, i) => (i === index ? { ...v, [field]: val } : v));
    update('variants', variants);
  }

  function addVariantRow() {
    update('variants', [...values.variants, { name: '', price: '' }]);
  }

  function removeVariantRow(index: number) {
    update('variants', values.variants.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5 bg-slate-50 rounded-xl border border-slate-200 p-5">
      {/* Availability */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5">
        <div>
          <span className="text-sm font-medium text-gray-700">Available</span>
          <p className="text-xs text-slate-500">Turn off if this item is temporarily out of stock</p>
        </div>
        <Toggle checked={values.available ?? true} onChange={(v) => update('available', v)} />
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Item name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputStyles}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className={inputStyles}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Item Image</label>

        {previewSrc ? (
          <div className="relative inline-block group">
            <img
              src={previewSrc}
              alt="Item preview"
              className="h-36 w-36 rounded-lg border border-slate-200 object-cover shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
            <Upload size={16} />
            Upload Image <span className="text-[10px] text-indigo-500">MAX 5MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}

        {values.removeImage && (
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <ImageOff size={12} /> Existing image will be removed on save
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Pricing</label>
        <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => update('pricingMode', 'price')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              values.pricingMode === 'price' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Single price
          </button>
          <button
            type="button"
            onClick={() => update('pricingMode', 'variants')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              values.pricingMode === 'variants' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Variants
          </button>
        </div>
      </div>

      {values.pricingMode === 'price' ? (
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={values.price}
          onChange={(e) => update('price', e.target.value)}
          className={inputStyles}
          required
        />
      ) : (
        <div className="space-y-2">
          {values.variants.map((v, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="Variant name (e.g. Small)"
                value={v.name}
                onChange={(e) => updateVariant(i, 'name', e.target.value)}
                className={`${inputStyles} flex-1`}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(i, 'price', e.target.value)}
                  className={`${inputStyles} w-full sm:w-28`}
                />
                {values.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantRow(i)}
                    className="shrink-0 rounded-lg border border-gray-200 px-2.5 text-sm text-red-600 hover:bg-red-50"
                    title="Remove variant"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addVariantRow} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            + Add variant
          </button>
        </div>
      )}

      <BadgeSelector value={values.badges} onChange={(b) => update('badges', b)} />

      <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}