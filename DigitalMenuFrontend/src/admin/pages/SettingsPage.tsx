// pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { restaurantService } from '../services/restaurantService';
import { diffChanged } from '../../util/util';
import type { Restaurant, NavStyle } from '../types';
import { CopyIcon, LockIcon, Check } from 'lucide-react';

const inputStyles =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

const sectionStyles = 'rounded-xl border border-gray-200 bg-white p-5 space-y-5';
const compactSectionStyles = 'rounded-xl border border-gray-200 bg-white p-4 space-y-3';

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

  async function handleCopy(textToCopy: string) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setTimeout(() => window.alert('Copied'), 500);
    } catch (err) {
      window.alert('Failed To Copy For Sure');
      console.error('Failed to copy text: ', err);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto lg:max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }
  if (!form) return <div className="max-w-2xl mx-auto lg:max-w-7xl text-sm text-red-600">{error || 'No restaurant data'}</div>;

  return (
    <div className="max-w-2xl mx-auto lg:max-w-7xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900">Restaurant Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Control how your menu page looks and behaves.</p>
      </div>

     <form onSubmit={handleSubmit} className="space-y-6 pb-20 lg:pb-6">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Domain — full width, compact */}
        <section className={compactSectionStyles}>
          <h2 className="text-sm font-semibold text-slate-900">Domain</h2>
          <Field label="Menu URL">
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={form.domain ?? ''}
                  disabled
                  placeholder="e.g. mymenu.example.com"
                  className={`${inputStyles} bg-gray-50 text-gray-600 cursor-not-allowed pr-8 truncate`}
                />
                {form.domain && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleCopy(form.domain ?? '')}
                disabled={!form.domain}
                title="Copy domain"
                className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          </Field>
        </section>

        {/* MOBILE: single column, original order */}
        <div className="space-y-6 lg:hidden">
          {/* Branding */}
          <section className={sectionStyles}>
            <h2 className="text-sm font-semibold text-slate-900">Branding</h2>
            <Field label="Name">
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputStyles} required />
            </Field>
            <Field label="Tagline">
              <input type="text" value={form.tagline ?? ''} onChange={(e) => update('tagline', e.target.value || null)} className={inputStyles} placeholder="A short line under your name" />
            </Field>
            <Field label="Logo URL">
              <input type="text" value={form.logoUrl ?? ''} onChange={(e) => update('logoUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/logo.png" />
            </Field>
            <Field label="Background URL">
              <input type="text" value={form.backgroundUrl ?? ''} onChange={(e) => update('backgroundUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/cover.jpg" />
            </Field>
            <Field label="Default Item Image URL">
              <div className="space-y-3">
                <input type="text" value={form.defaultImageUrl ?? ''} onChange={(e) => update('defaultImageUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/image.jpg" />
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-gray-700">Enable Item Image</span>
                  <Toggle label="Enable Item Image" checked={form.showItemImage} onChange={(v) => update('showItemImage', v)} />
                </div>
              </div>
            </Field>
          </section>

          {/* Appearance */}
          <section className={sectionStyles}>
            <h2 className="text-sm font-semibold text-slate-900">Appearance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorField label="Primary" value={form.primaryColor || '#ffffff'} onChange={(v) => update('primaryColor', v)} />
              <ColorField label="Accent" value={form.accentColor || '#ffffff'} onChange={(v) => update('accentColor', v)} />
              <ColorField label="Header Text" value={form.headerText || '#ffffff'} onChange={(v) => update('headerText', v)} />
              <ColorField label="Background" value={form.surfaceColor || '#ffffff'} onChange={(v) => update('surfaceColor', v)} />
            </div>
            <Field label="Nav Style">
              <select value={form.tabStyle || 'tabs'} onChange={(e) => update('tabStyle', e.target.value as NavStyle)} className={inputStyles}>
                <option value="tabs">Tabs</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </Field>
            <Field label="Nav Size">
              <SegmentedControl value={form.categorySize || 'md'} onChange={(v) => update('categorySize', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
            </Field>
            {form.tabStyle === 'tabs' && (
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-dashed border-gray-200 p-3">
                <Field label="Tab Style">
                  <SegmentedControl value={form.categoryVariant || 'pill'} onChange={(v) => update('categoryVariant', v)} options={[{ value: 'pill', label: 'Pill' }, { value: 'underline', label: 'Underline' }]} />
                </Field>
              </div>
            )}
            {form.tabStyle === 'dropdown' && (
              <div className="rounded-lg border border-dashed border-gray-200 p-3">
                <p className="text-xs text-slate-500">Dropdown nav uses Nav Size above for spacing. No additional layout options apply.</p>
              </div>
            )}
            <Field label="Roundness">
              <input type="text" value={form.roundness || '1rem'} onChange={(e) => update('roundness', e.target.value)} className={inputStyles} placeholder="e.g. 0.5rem" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Header Alignment">
                <SegmentedControl value={form.headerAlign || 'center'} onChange={(v) => update('headerAlign', v)} options={[{ value: 'center', label: 'Center' }, { value: 'left', label: 'Left' }]} />
              </Field>
              <Field label="Header Size">
                <SegmentedControl value={form.headerSize || 'default'} onChange={(v) => update('headerSize', v)} options={[{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }]} />
              </Field>
            </div>
            <Field label="Header Layout">
              <select value={form.headerLayout || 'banner'} onChange={(e) => update('headerLayout', e.target.value as Restaurant['headerLayout'])} className={inputStyles}>
                <option value="banner">Banner (full cover photo)</option>
                <option value="minimal">Minimal (no photo)</option>
                <option value="split">Split (logo beside name)</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Logo Shape">
                <select value={form.logoShape || 'circle'} onChange={(e) => update('logoShape', e.target.value as Restaurant['logoShape'])} className={inputStyles}>
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                </select>
              </Field>
              <Field label="Heading Font">
                <select value={form.headingFont || 'serif'} onChange={(e) => update('headingFont', e.target.value as Restaurant['headingFont'])} className={inputStyles}>
                  <option value="serif">Serif</option>
                  <option value="sans">Sans</option>
                  <option value="display">Display</option>
                </select>
              </Field>
            </div>
            <Field label="Photo Overlay">
              <select value={form.overlayStyle || 'gradient'} onChange={(e) => update('overlayStyle', e.target.value as Restaurant['overlayStyle'])} className={inputStyles} disabled={form.headerLayout === 'minimal'}>
                <option value="gradient">Gradient</option>
                <option value="solid">Solid</option>
                <option value="none">None</option>
              </select>
            </Field>
            {form.overlayStyle !== 'none' && form.headerLayout !== 'minimal' && (
              <Field label={`Overlay Intensity — ${Math.round((form.overlayIntensity ?? 1) * 100)}%`}>
                <input type="range" min={0} max={1} step={0.05} value={form.overlayIntensity ?? 1} onChange={(e) => update('overlayIntensity', Number(e.target.value))} className="w-full accent-indigo-600" />
              </Field>
            )}
          </section>

          {/* Item Cards */}
          <section className={sectionStyles}>
            <h2 className="text-sm font-semibold text-slate-900">Item Cards</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Card Size">
                <SegmentedControl value={form.itemSize || 'md'} onChange={(v) => update('itemSize', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
              </Field>
              <Field label="Image Position">
                <SegmentedControl value={form.itemImagePosition || 'left'} onChange={(v) => update('itemImagePosition', v)} options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} />
              </Field>
            </div>
            <Field label="Image Shape">
              <SegmentedControl value={form.itemImageShape || 'rounded'} onChange={(v) => update('itemImageShape', v)} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'circle', label: 'Circle' }]} />
            </Field>
            <Field label="Currency Symbol">
              <input type="text" value={form.currencySymbol ?? '₹'} onChange={(e) => update('currencySymbol', e.target.value)} className={inputStyles} placeholder="₹" maxLength={3} />
            </Field>
          </section>

          {/* Announcement Board */}
          <section className={sectionStyles}>
            <h2 className="text-sm font-semibold text-slate-900">Announcement Board</h2>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <div>
                <span className="text-sm font-medium text-gray-700">Enable Board</span>
                <p className="text-xs text-slate-500">Show a message above your menu — specials, hours, anything</p>
              </div>
              <Toggle label="Enable Board" checked={form.boardEnabled ?? false} onChange={(v) => update('boardEnabled', v)} />
            </div>
            {form.boardEnabled && (
              <Field label={`Board Text — ${(form.boardText ?? '').length}/200`}>
                <textarea value={form.boardText ?? ''} onChange={(e) => update('boardText', e.target.value.slice(0, 200))} className={inputStyles} rows={3} placeholder="e.g. Today's special: Paneer Tikka Thali — ₹249. Available till 9 PM!" />
              </Field>
            )}
          </section>

          {/* Display Options */}
          <section className={sectionStyles}>
            <h2 className="text-sm font-semibold text-slate-900">Display Options</h2>
            <div className="space-y-1">
              <ToggleRow label="Show search bar" checked={form.showSearch} onChange={(v) => update('showSearch', v)} />
              <ToggleRow label="Show divider" checked={form.showDivider} onChange={(v) => update('showDivider', v)} />
              <ToggleRow label="Show item count per category" checked={form.showItemCount} onChange={(v) => update('showItemCount', v)} />
              <ToggleRow label="Sticky navigation" checked={form.stickyNav} onChange={(v) => update('stickyNav', v)} />
            </div>
          </section>
        </div>

        {/* DESKTOP: two independent columns — no shared row heights */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Branding */}
            <section className={sectionStyles}>
              <h2 className="text-sm font-semibold text-slate-900">Branding</h2>
              <Field label="Name">
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputStyles} required />
              </Field>
              <Field label="Tagline">
                <input type="text" value={form.tagline ?? ''} onChange={(e) => update('tagline', e.target.value || null)} className={inputStyles} placeholder="A short line under your name" />
              </Field>
              <Field label="Logo URL">
                <input type="text" value={form.logoUrl ?? ''} onChange={(e) => update('logoUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/logo.png" />
              </Field>
              <Field label="Background URL">
                <input type="text" value={form.backgroundUrl ?? ''} onChange={(e) => update('backgroundUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/cover.jpg" />
              </Field>
              <Field label="Default Item Image URL">
                <div className="space-y-3">
                  <input type="text" value={form.defaultImageUrl ?? ''} onChange={(e) => update('defaultImageUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/image.jpg" />
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <span className="text-sm font-medium text-gray-700">Enable Item Image</span>
                    <Toggle label="Enable Item Image" checked={form.showItemImage} onChange={(v) => update('showItemImage', v)} />
                  </div>
                </div>
              </Field>
            </section>

            {/* Item Cards */}
            <section className={sectionStyles}>
              <h2 className="text-sm font-semibold text-slate-900">Item Cards</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Card Size">
                  <SegmentedControl value={form.itemSize || 'md'} onChange={(v) => update('itemSize', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
                </Field>
                <Field label="Image Position">
                  <SegmentedControl value={form.itemImagePosition || 'left'} onChange={(v) => update('itemImagePosition', v)} options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} />
                </Field>
              </div>
              <Field label="Image Shape">
                <SegmentedControl value={form.itemImageShape || 'rounded'} onChange={(v) => update('itemImageShape', v)} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'circle', label: 'Circle' }]} />
              </Field>
              <Field label="Currency Symbol">
                <input type="text" value={form.currencySymbol ?? '₹'} onChange={(e) => update('currencySymbol', e.target.value)} className={inputStyles} placeholder="₹" maxLength={3} />
              </Field>
            </section>

            {/* Display Options */}
            <section className={sectionStyles}>
              <h2 className="text-sm font-semibold text-slate-900">Display Options</h2>
              <div className="space-y-1">
                <ToggleRow label="Show search bar" checked={form.showSearch} onChange={(v) => update('showSearch', v)} />
                <ToggleRow label="Show divider" checked={form.showDivider} onChange={(v) => update('showDivider', v)} />
                <ToggleRow label="Show item count per category" checked={form.showItemCount} onChange={(v) => update('showItemCount', v)} />
                <ToggleRow label="Sticky navigation" checked={form.stickyNav} onChange={(v) => update('stickyNav', v)} />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Appearance */}
            <section className={sectionStyles}>
              <h2 className="text-sm font-semibold text-slate-900">Appearance</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ColorField label="Primary" value={form.primaryColor || '#ffffff'} onChange={(v) => update('primaryColor', v)} />
                <ColorField label="Accent" value={form.accentColor || '#ffffff'} onChange={(v) => update('accentColor', v)} />
                <ColorField label="Header Text" value={form.headerText || '#ffffff'} onChange={(v) => update('headerText', v)} />
                <ColorField label="Background" value={form.surfaceColor || '#ffffff'} onChange={(v) => update('surfaceColor', v)} />
              </div>
              <Field label="Nav Style">
                <select value={form.tabStyle || 'tabs'} onChange={(e) => update('tabStyle', e.target.value as NavStyle)} className={inputStyles}>
                  <option value="tabs">Tabs</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </Field>
              <Field label="Nav Size">
                <SegmentedControl value={form.categorySize || 'md'} onChange={(v) => update('categorySize', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
              </Field>
              {form.tabStyle === 'tabs' && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-dashed border-gray-200 p-3">
                  <Field label="Tab Style">
                    <SegmentedControl value={form.categoryVariant || 'pill'} onChange={(v) => update('categoryVariant', v)} options={[{ value: 'pill', label: 'Pill' }, { value: 'underline', label: 'Underline' }]} />
                  </Field>
                </div>
              )}
              {form.tabStyle === 'dropdown' && (
                <div className="rounded-lg border border-dashed border-gray-200 p-3">
                  <p className="text-xs text-slate-500">Dropdown nav uses Nav Size above for spacing. No additional layout options apply.</p>
                </div>
              )}
              <Field label="Roundness">
                <input type="text" value={form.roundness || '1rem'} onChange={(e) => update('roundness', e.target.value)} className={inputStyles} placeholder="e.g. 0.5rem" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Header Alignment">
                  <SegmentedControl value={form.headerAlign || 'center'} onChange={(v) => update('headerAlign', v)} options={[{ value: 'center', label: 'Center' }, { value: 'left', label: 'Left' }]} />
                </Field>
                <Field label="Header Size">
                  <SegmentedControl value={form.headerSize || 'default'} onChange={(v) => update('headerSize', v)} options={[{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }]} />
                </Field>
              </div>
              <Field label="Header Layout">
                <select value={form.headerLayout || 'banner'} onChange={(e) => update('headerLayout', e.target.value as Restaurant['headerLayout'])} className={inputStyles}>
                  <option value="banner">Banner (full cover photo)</option>
                  <option value="minimal">Minimal (no photo)</option>
                  <option value="split">Split (logo beside name)</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Logo Shape">
                  <select value={form.logoShape || 'circle'} onChange={(e) => update('logoShape', e.target.value as Restaurant['logoShape'])} className={inputStyles}>
                    <option value="circle">Circle</option>
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                  </select>
                </Field>
                <Field label="Heading Font">
                  <select value={form.headingFont || 'serif'} onChange={(e) => update('headingFont', e.target.value as Restaurant['headingFont'])} className={inputStyles}>
                    <option value="serif">Serif</option>
                    <option value="sans">Sans</option>
                    <option value="display">Display</option>
                  </select>
                </Field>
              </div>
              <Field label="Photo Overlay">
                <select value={form.overlayStyle || 'gradient'} onChange={(e) => update('overlayStyle', e.target.value as Restaurant['overlayStyle'])} className={inputStyles} disabled={form.headerLayout === 'minimal'}>
                  <option value="gradient">Gradient</option>
                  <option value="solid">Solid</option>
                  <option value="none">None</option>
                </select>
              </Field>
              {form.overlayStyle !== 'none' && form.headerLayout !== 'minimal' && (
                <Field label={`Overlay Intensity — ${Math.round((form.overlayIntensity ?? 1) * 100)}%`}>
                  <input type="range" min={0} max={1} step={0.05} value={form.overlayIntensity ?? 1} onChange={(e) => update('overlayIntensity', Number(e.target.value))} className="w-full accent-indigo-600" />
                </Field>
              )}
            </section>

            {/* Announcement Board */}
            <section className={sectionStyles}>
              <h2 className="text-sm font-semibold text-slate-900">Announcement Board</h2>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <div>
                  <span className="text-sm font-medium text-gray-700">Enable Board</span>
                  <p className="text-xs text-slate-500">Show a message above your menu — specials, hours, anything</p>
                </div>
                <Toggle label="Enable Board" checked={form.boardEnabled ?? false} onChange={(v) => update('boardEnabled', v)} />
              </div>
              {form.boardEnabled && (
                <Field label={`Board Text — ${(form.boardText ?? '').length}/200`}>
                  <textarea value={form.boardText ?? ''} onChange={(e) => update('boardText', e.target.value.slice(0, 200))} className={inputStyles} rows={3} placeholder="e.g. Today's special: Paneer Tikka Thali — ₹249. Available till 9 PM!" />
                </Field>
              )}
            </section>
          </div>
        </div>
        {/* Save bar */}
        <div className="sticky bottom-0 inset-x-0 z-50 flex items-center gap-3 border-t border-gray-200 bg-white/90 py-4 backdrop-blur-sm">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1.5 shadow-sm">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full min-w-0 border-0 bg-transparent text-xs font-mono text-gray-600 focus:outline-none" />
      </div>
    </Field>
  );
}

function Toggle({ checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <Toggle label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

function SegmentedControl<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${value === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}