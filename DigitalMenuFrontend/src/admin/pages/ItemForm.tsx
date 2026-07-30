import { BadgeSelector } from "../components/BadgeSelector";
import type { ItemFormValues, ItemFormProps } from "../types";
import { useMemo } from "react";
import { Upload, ImageOff, X } from "lucide-react";

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
      alert('Image must be under Image');
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
    <div className="space-y-4 bg-slate-50 rounded-lg border border-slate-200 p-4">
      <input
        type="text"
        placeholder="Item name"
        value={values.name}
        onChange={(e) => update('name', e.target.value)}
        className="input"
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={values.description}
        onChange={(e) => update('description', e.target.value)}
        className="input"
        rows={2}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Item Image</label>

        {previewSrc ? (
          <div className="relative inline-block group">
            <img
              src={previewSrc}
              alt="Item preview"
              className="h-36 w-36 object-cover rounded-md border border-slate-200"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Upload size={16} />
            Upload Image <span className="text-[10px]">MAX Size 5 M.B</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {values.removeImage && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <ImageOff size={12} /> Existing image will be removed on save
          </p>
        )}
      </div>

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => update('pricingMode', 'price')}
          className={`px-3 py-1 rounded-md border ${values.pricingMode === 'price'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-slate-600 border-slate-300'
            }`}
        >
          Single price
        </button>
        <button
          type="button"
          onClick={() => update('pricingMode', 'variants')}
          className={`px-3 py-1 rounded-md border ${values.pricingMode === 'variants'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-slate-600 border-slate-300'
            }`}
        >
          Variants
        </button>
      </div>

      {values.pricingMode === 'price' ? (
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={values.price}
          onChange={(e) => update('price', e.target.value)}
          className="input"
          required
        />
      ) : (
        <div className="space-y-2">
          {values.variants.map((v, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Variant name (e.g. Small)"
                value={v.name}
                onChange={(e) => updateVariant(i, 'name', e.target.value)}
                className="input flex-1"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(i, 'price', e.target.value)}
                  className="input w-full sm:w-28"
                />
                {values.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariantRow(i)} className="text-red-600 text-sm px-2 shrink-0">
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariantRow}
            className="text-sm text-indigo-600 font-medium"
          >
            + Add variant
          </button>
        </div>
      )}

      <BadgeSelector value={values.badges} onChange={(b) => update('badges', b)} />

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}