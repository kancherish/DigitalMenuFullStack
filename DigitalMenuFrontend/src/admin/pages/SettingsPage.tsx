// pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { restaurantService } from '../services/restaurantService';
import { diffChanged } from '../../util/util';
import type { Restaurant, NavStyle } from '../types';



export function SettingsPage() {
  const { admin, updateCachedRestaurant } = useAuth();
  const restaurantId = admin?.restaurant.publicId;

  const [original, setOriginal] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;

    restaurantService
      .getInfo(restaurantId)
      .then((data) => {
        if (cancelled) return;
        setOriginal(data);
        setForm(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load settings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  function update<K extends keyof Restaurant>(key: K, value: Restaurant[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || !original || !restaurantId) return;

    const changes = diffChanged<Restaurant>(original, form);
    if (Object.keys(changes).length === 0) {
      setSaved(true);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await restaurantService.update(restaurantId, changes as Record<string, unknown>);
      setOriginal(updated);
      setForm(updated);
      updateCachedRestaurant(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading settings...</div>;
  if (!form) return <div className="text-sm text-red-600">{error || 'No restaurant data'}</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Restaurant Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Tagline">
          <input
            type="text"
            value={form.tagline ?? ''}
            onChange={(e) => update('tagline', e.target.value || null)}
            className="input"
          />
        </Field>

        <Field label="Logo URL">
          <input
            type="text"
            value={form.logoUrl ?? ''}
            onChange={(e) => update('logoUrl', e.target.value || null)}
            className="input"
          />
        </Field>

        <Field label="Background URL">
          <input
            type="text"
            value={form.backgroundUrl ?? ''}
            onChange={(e) => update('backgroundUrl', e.target.value || null)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Primary Color">
            <input
              type="color"
              value={form.primaryColor || "#fffff"}
              onChange={(e) => update('primaryColor', e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300"
            />
          </Field>
          <Field label="Accent Color">
            <input
              type="color"
              value={form.accentColor || "#fffff"}
              onChange={(e) => update('accentColor', e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300"
            />
          </Field>
          <Field label="Header Text Color">
            <input
              type="color"
              value={form.headerText || "#fffff"}
              onChange={(e) => update('headerText', e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300"
            />
          </Field>
        </div>

        <Field label="Nav Style">
          <select
            value={form.tabStyle || "tabs"}
            onChange={(e) => update('tabStyle', e.target.value as NavStyle)}
            className="input"
          >
            <option value="tabs">Tabs</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </Field>

        <Field label="Roundness">
          <input
            type="text"
            value={form.roundness || "1remS"}
            onChange={(e) => update('roundness', e.target.value)}
            className="input"
            placeholder="e.g. 0.5rem"
          />
        </Field>

        <Field label="Domain">
          <input
            type="text"
            value={form.domain ?? ''}
            onChange={(e) => update('domain', e.target.value || null)}
            className="input"
            placeholder="e.g. mymenu.example.com"
          />
        </Field>

        <div className="space-y-3 pt-2">
          <Toggle
            label="Show search bar"
            checked={form.showSearch}
            onChange={(v) => update('showSearch', v)}
          />
          <Toggle
            label="Show Divider"
            checked={form.showDivider}
            onChange={(v) => update('showDivider', v)}
          />
          <Toggle
            label="Show item count per category"
            checked={form.showItemCount}
            onChange={(v) => update('showItemCount', v)}
          />
          <Toggle
            label="Sticky navigation"
            checked={form.stickyNav}
            onChange={(v) => update('stickyNav', v)}
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300"
      />
      {label}
    </label>
  );
}