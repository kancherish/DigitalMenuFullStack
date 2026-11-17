// pages/SettingsPage.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { restaurantService } from '../services/restaurantService';
import { diffChanged } from '../../util/util';
import type { Restaurant, NavStyle } from '../types';
import { THEME_PRESETS, getPresetSwatch, type ThemePreset } from '../themePresets';
import { CopyIcon, LockIcon, Check, AlertCircle, QrCode, Download } from 'lucide-react';

// text-base on mobile prevents iOS Safari from zooming into focused inputs
const inputStyles =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

export function SettingsPage() {
  const { admin, updateCachedRestaurant } = useAuth();
  const restaurantId = admin?.restaurant.publicId;

  const [original, setOriginal] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const dirty = useMemo(
    () => (form && original ? Object.keys(diffChanged<Restaurant>(original, form)).length > 0 : false),
    [form, original],
  );

  function update<K extends keyof Restaurant>(key: K, value: Restaurant[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function applyPreset(preset: ThemePreset) {
    setForm((prev) => (prev ? { ...prev, ...preset.values } : prev));
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      console.error('Failed to copy text: ', err);
    }
  }

  async function handleDownloadQr() {
    if (!menuUrl) return;
    try {
      const res = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(menuUrl)}`,
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(form?.name || 'menu').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download QR code');
      console.error('Failed to download QR code: ', err);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-100" />
          <div className="h-48 rounded-xl bg-gray-100" />
          <div className="h-48 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }
  if (!form) {
    return <div className="mx-auto w-full max-w-6xl text-sm text-red-600">{error || 'No restaurant data'}</div>;
  }

  const showPhoto = form.headerLayout !== 'minimal';
  const menuUrl = form.domain
    ? /^https?:\/\//.test(form.domain)
      ? form.domain
      : `https://${form.domain}`
    : restaurantId
      ? `${window.location.origin}/${restaurantId}`
      : '';

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Restaurant Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Control how your menu page looks and behaves.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate={false}>
        {error && (
          <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}

        {/* Domain — full width */}
        <Section title="Domain" description="Your public menu address. Contact support to change it." compact>
          <Field label="Menu URL">
            <div className="flex items-stretch gap-2">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={form.domain ?? ''}
                  disabled
                  placeholder="e.g. mymenu.example.com"
                  className={`${inputStyles} truncate pr-9`}
                />
                {form.domain && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(menuUrl || form.domain || '')}
                disabled={!menuUrl}
                title="Copy menu link"
                aria-label="Copy menu link"
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            {menuUrl && (
              <div className="mt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowQr((v) => !v)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <QrCode className="h-4 w-4" />
                  {showQr ? 'Hide QR code' : 'Show QR code'}
                </button>
                {showQr && (
                  <div className="inline-flex flex-col items-start gap-3">
                    <div className="inline-block rounded-lg border border-gray-200 bg-white p-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(menuUrl)}`}
                        alt="Menu QR code"
                        width={180}
                        height={180}
                        className="h-[180px] w-[180px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                      Download QR
                    </button>
                  </div>
                )}
              </div>
            )}
          </Field>
        </Section>

        {/* Theme Presets */}
        <Section title="Theme Presets" description="Start from a ready-made look, then fine-tune anything below.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {THEME_PRESETS.map((preset) => {
              const active = isPresetActive(preset, form);
              const [primary, accent, surface] = getPresetSwatch(preset);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  aria-pressed={active}
                  className={`flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500/30'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: primary }} />
                      <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: accent }} />
                      <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: surface }} />
                    </span>
                    {active && <Check className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{preset.name}</span>
                  <span className="text-xs text-slate-500">{preset.description}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            Applying a preset fills the style fields below. Review and press “Save changes” to keep it.
          </p>
        </Section>

        {/*
          One layout for every screen size: a single column on mobile,
          two independent (masonry-style) columns on desktop. Sections never split across columns.
        */}
        <div className="lg:columns-2 lg:gap-6">
          {/* Branding */}
          <Section title="Branding" description="Name, tagline and images shown on your menu.">
            <Field label="Name">
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputStyles} required />
            </Field>
            <Field label="Tagline">
              <input type="text" value={form.tagline ?? ''} onChange={(e) => update('tagline', e.target.value || null)} className={inputStyles} placeholder="A short line under your name" />
            </Field>
            <Field label="Logo URL">
              <input type="url" inputMode="url" value={form.logoUrl ?? ''} onChange={(e) => update('logoUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/logo.png" />
            </Field>
            <Field label="Background URL">
              <input type="url" inputMode="url" value={form.backgroundUrl ?? ''} onChange={(e) => update('backgroundUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/cover.jpg" />
            </Field>
            <Field label="Default Item Image URL">
              <input type="url" inputMode="url" value={form.defaultImageUrl ?? ''} onChange={(e) => update('defaultImageUrl', e.target.value || null)} className={inputStyles} placeholder="https://example.com/image.jpg" />
            </Field>
            <ToggleCard label="Enable Item Image" checked={form.showItemImage} onChange={(v) => update('showItemImage', v)} />
          </Section>

          {/* Appearance */}
          <Section title="Appearance" description="Colors, navigation and header look.">
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <ColorField label="Primary" value={form.primaryColor || '#ffffff'} onChange={(v) => update('primaryColor', v)} />
              <ColorField label="Accent" value={form.accentColor || '#ffffff'} onChange={(v) => update('accentColor', v)} />
              <ColorField label="Body Text" value={form.BodyTextColor || form.primaryColor || '#ffffff'} onChange={(v) => update('BodyTextColor', v)} />
              <ColorField label="Header Text" value={form.headerText || '#ffffff'} onChange={(v) => update('headerText', v)} />
              <ColorField label="Background" value={form.surfaceColor || '#ffffff'} onChange={(v) => update('surfaceColor', v)} />
            </div>

            <Divider />

            <Field label="Nav Style">
              <select value={form.tabStyle || 'tabs'} onChange={(e) => update('tabStyle', e.target.value as NavStyle)} className={inputStyles}>
                <option value="tabs">Tabs</option>
                <option value="dropdown">Dropdown</option>
                <option value="continuous">Continuous (all categories in one scroll)</option>
              </select>
            </Field>
            <Field label="Nav Size">
              <SegmentedControl value={form.categorySize || 'md'} onChange={(v) => update('categorySize', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
            </Field>
            {form.tabStyle === 'tabs' && (
              <div className="rounded-lg border border-dashed border-gray-200 p-3">
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
            {form.tabStyle === 'continuous' && (
              <div className="rounded-lg border border-dashed border-gray-200 p-3">
                <p className="text-xs text-slate-500">Continuous mode shows every category with its items in one scrolling list — no tabs or dropdown. Search still appears above the menu when enabled.</p>
              </div>
            )}

            <Divider />

            <Field label="Roundness">
              <input type="text" value={form.roundness || '1rem'} onChange={(e) => update('roundness', e.target.value)} className={inputStyles} placeholder="e.g. 0.5rem" />
            </Field>
            <Field label="Header Alignment">
              <SegmentedControl value={form.headerAlign || 'center'} onChange={(v) => update('headerAlign', v)} options={[{ value: 'center', label: 'Center' }, { value: 'left', label: 'Left' }]} />
            </Field>
            <Field label="Header Size">
              <SegmentedControl value={form.headerSize || 'default'} onChange={(v) => update('headerSize', v)} options={[{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }]} />
            </Field>
            <Field label="Header Layout">
              <select value={form.headerLayout || 'banner'} onChange={(e) => update('headerLayout', e.target.value as Restaurant['headerLayout'])} className={inputStyles}>
                <option value="banner">Banner (full cover photo)</option>
                <option value="minimal">Minimal (no photo)</option>
                <option value="split">Split (logo beside name)</option>
              </select>
            </Field>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
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
              <select value={form.overlayStyle || 'gradient'} onChange={(e) => update('overlayStyle', e.target.value as Restaurant['overlayStyle'])} className={inputStyles} disabled={!showPhoto}>
                <option value="gradient">Gradient</option>
                <option value="solid">Solid</option>
                <option value="none">None</option>
              </select>
            </Field>
            {form.overlayStyle !== 'none' && showPhoto && (
              <Field label={`Overlay Intensity — ${Math.round((form.overlayIntensity ?? 1) * 100)}%`}>
                <RangeInput min={0} max={1} step={0.05} value={form.overlayIntensity ?? 1} onChange={(v) => update('overlayIntensity', v)} />
              </Field>
            )}
          </Section>

          {/* Header Style */}
          <Section title="Header Style" description="Fine-tune spacing, logo and text styling.">
            <Field label="Vertical Spacing">
              <SegmentedControl value={form.headerSpacing || 'default'} onChange={(v) => update('headerSpacing', v)} options={[{ value: 'tight', label: 'Tight' }, { value: 'default', label: 'Default' }, { value: 'loose', label: 'Loose' }]} />
            </Field>
            <Field label="Max Width">
              <SegmentedControl value={form.headerMaxWidth || 'full'} onChange={(v) => update('headerMaxWidth', v)} options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'full', label: 'Full' }]} />
            </Field>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <ColorField label="Name Color" value={form.headerNameColor || form.headerText || '#ffffff'} onChange={(v) => update('headerNameColor', v)} />
              <ColorField label="Tagline Color" value={form.headerTaglineColor || form.headerText || '#ffffff'} onChange={(v) => update('headerTaglineColor', v)} />
            </div>
            <Field label="Logo Size">
              <SegmentedControl value={form.logoSize || 'auto'} onChange={(v) => update('logoSize', v)} options={[{ value: 'auto', label: 'Auto' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} />
            </Field>
            <Field label="Divider Style">
              <select value={form.headerDividerStyle || 'line'} onChange={(e) => update('headerDividerStyle', e.target.value as Restaurant['headerDividerStyle'])} className={inputStyles}>
                <option value="line">Line</option>
                <option value="dots">Dots</option>
                <option value="diamond">Diamond</option>
                <option value="none">None</option>
              </select>
            </Field>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <Field label={`Photo Focus X — ${Math.round(form.headerBackgroundPositionX ?? 50)}%`}>
                <RangeInput min={0} max={100} step={1} value={form.headerBackgroundPositionX ?? 50} onChange={(v) => update('headerBackgroundPositionX', v)} disabled={!showPhoto} />
              </Field>
              <Field label={`Photo Focus Y — ${Math.round(form.headerBackgroundPositionY ?? 50)}%`}>
                <RangeInput min={0} max={100} step={1} value={form.headerBackgroundPositionY ?? 50} onChange={(v) => update('headerBackgroundPositionY', v)} disabled={!showPhoto} />
              </Field>
            </div>
            <Field label={`Photo Zoom — ${Math.round((form.headerBackgroundZoom ?? 1) * 100)}%`}>
              <RangeInput min={1} max={2} step={0.05} value={form.headerBackgroundZoom ?? 1} onChange={(v) => update('headerBackgroundZoom', v)} disabled={!showPhoto} />
            </Field>

            <Divider />

            <div className="divide-y divide-gray-100">
              <ToggleRow label="Show logo" checked={form.showLogo ?? true} onChange={(v) => update('showLogo', v)} />
              <ToggleRow label="Accent panel behind logo" checked={form.headerAccentPanel ?? true} onChange={(v) => update('headerAccentPanel', v)} />
              <ToggleRow label="Gradient restaurant name" checked={form.headerNameGradient ?? true} onChange={(v) => update('headerNameGradient', v)} />
              <ToggleRow label="Uppercase tagline" checked={form.headerUppercaseTagline ?? true} onChange={(v) => update('headerUppercaseTagline', v)} />
              <ToggleRow label="Shimmer animation" checked={form.headerShimmer ?? true} onChange={(v) => update('headerShimmer', v)} />
            </div>
            {form.headerNameGradient !== false && (
              <div className="space-y-4 rounded-lg border border-dashed border-gray-200 p-3">
                <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                  <ColorField label="Gradient Start" value={form.headerNameGradientFrom || form.headerNameColor || form.headerText || '#ffffff'} onChange={(v) => update('headerNameGradientFrom', v)} />
                  <ColorField label="Gradient End" value={form.headerNameGradientTo || form.accentColor || '#0ea5e9'} onChange={(v) => update('headerNameGradientTo', v)} />
                </div>
                <Field label={`Gradient Angle — ${form.headerNameGradientAngle ?? 120}°`}>
                  <RangeInput min={0} max={360} step={5} value={form.headerNameGradientAngle ?? 120} onChange={(v) => update('headerNameGradientAngle', v)} />
                </Field>
              </div>
            )}
            {form.headerAccentPanel !== false && (
              <Field label={`Accent Panel Intensity — ${Math.round((form.headerPanelIntensity ?? 1) * 100)}%`}>
                <RangeInput min={0} max={1} step={0.05} value={form.headerPanelIntensity ?? 1} onChange={(v) => update('headerPanelIntensity', v)} />
              </Field>
            )}
          </Section>

          {/* Item Cards */}
          <Section title="Item Cards" description="How menu items are displayed.">
            <Field label="Card Size">
              <SegmentedControl value={form.itemSize || 'md'} onChange={(v) => update('itemSize', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
            </Field>
            <Field label="Image Position">
              <SegmentedControl value={form.itemImagePosition || 'left'} onChange={(v) => update('itemImagePosition', v)} options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} />
            </Field>
            <Field label="Image Shape">
              <SegmentedControl value={form.itemImageShape || 'rounded'} onChange={(v) => update('itemImageShape', v)} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'circle', label: 'Circle' }]} />
            </Field>
            <Field label="Currency Symbol">
              <input type="text" value={form.currencySymbol ?? '₹'} onChange={(e) => update('currencySymbol', e.target.value)} className={`${inputStyles} sm:max-w-[8rem]`} placeholder="₹" maxLength={3} />
            </Field>
          </Section>

          {/* Display Options */}
          <Section title="Display Options" description="Toggle menu page features.">
            <div className="divide-y divide-gray-100">
              <ToggleRow label="Show search bar" checked={form.showSearch} onChange={(v) => update('showSearch', v)} />
              <ToggleRow label="Show divider" checked={form.showDivider} onChange={(v) => update('showDivider', v)} />
              <ToggleRow label="Show item count per category" checked={form.showItemCount} onChange={(v) => update('showItemCount', v)} />
              <ToggleRow label="Sticky navigation" checked={form.stickyNav} onChange={(v) => update('stickyNav', v)} />
              <ToggleRow label="Show PDF download button" checked={form.showPdfDownload ?? true} onChange={(v) => update('showPdfDownload', v)} />
            </div>
            {form.showPdfDownload !== false && (
              <div className="mt-3">
                <Field label="PDF Button Placement">
                  <select
                    value={form.pdfDownloadPlacement || 'bottom_right'}
                    onChange={(e) => update('pdfDownloadPlacement', e.target.value as Restaurant['pdfDownloadPlacement'])}
                    className={inputStyles}
                  >
                    <option value="bottom_right">Bottom right</option>
                    <option value="bottom_left">Bottom left</option>
                    <option value="top_right">Top right</option>
                    <option value="top_left">Top left</option>
                  </select>
                </Field>
              </div>
            )}
          </Section>

          {/* Announcement Board */}
          <Section title="Announcement Board" description="Show a message above your menu — specials, hours, anything.">
            <ToggleCard label="Enable Board" checked={form.boardEnabled ?? false} onChange={(v) => update('boardEnabled', v)} />
            {form.boardEnabled && (
              <Field label={`Board Text — ${(form.boardText ?? '').length}/200`}>
                <textarea
                  value={form.boardText ?? ''}
                  onChange={(e) => update('boardText', e.target.value.slice(0, 200))}
                  className={inputStyles}
                  rows={3}
                  placeholder="e.g. Today's special: Paneer Tikka Thali — ₹249. Available till 9 PM!"
                />
              </Field>
            )}
          </Section>
        </div>

        {/* Save bar */}
        <div className="sticky bottom-0 z-40 -mx-4 border-t border-gray-200 bg-white/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-white/75 sm:mx-0 sm:rounded-xl sm:border sm:px-5 sm:shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm">
              {saved && !dirty ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              ) : dirty ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Unsaved changes
                </span>
              ) : (
                <span className="text-slate-400">No changes</span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || !dirty}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function isPresetActive(preset: ThemePreset, form: Restaurant): boolean {
  return Object.entries(preset.values).every(
    ([key, value]) => (form as unknown as Record<string, unknown>)[key] === value,
  );
}

/* ---------- Layout primitives ---------- */

function Section({
  title,
  description,
  compact = false,
  children,
}: {
  title: string;
  description?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`mb-5 break-inside-avoid rounded-xl border border-gray-200 bg-white shadow-sm sm:mb-6 ${
        compact ? 'p-4 sm:p-5' : 'p-4 sm:p-6'
      }`}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>}
      </div>
      <div className="space-y-4 sm:space-y-5">{children}</div>
    </section>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </div>
  );
}

/* ---------- Inputs ---------- */

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
          className="w-full min-w-0 border-0 bg-transparent font-mono text-sm uppercase text-gray-600 focus:outline-none"
        />
      </div>
    </Field>
  );
}

function RangeInput({
  value,
  onChange,
  min,
  max,
  step,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 w-full cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// Whole row is tappable — a much bigger touch target on mobile
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3 py-2"
      onClick={() => onChange(!checked)}
    >
      <span className="text-sm text-slate-700">{label}</span>
      <div onClick={(e) => e.stopPropagation()}>
        <Toggle label={label} checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
      onClick={() => onChange(!checked)}
    >
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div onClick={(e) => e.stopPropagation()}>
        <Toggle label={label} checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

// Full-width, equal-sized segments so options never overflow a narrow screen
function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div role="radiogroup" className="flex w-full rounded-lg border border-gray-300 bg-gray-50 p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`min-w-0 flex-1 truncate rounded-md px-2 py-2 text-sm font-medium transition-colors sm:px-3 sm:py-1.5 ${
              active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}