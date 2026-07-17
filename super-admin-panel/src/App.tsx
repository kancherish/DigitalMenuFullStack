import React, { useState, useRef } from 'react';
import { setTempSecret, getAllAdmins, registerAdmin, deleteAdmin, updateAdmin } from './api';

// ---------- Types ----------

// Adjust these two values to match your actual Prisma NavStyle enum
type NavStyle = 'dropdown' | 'tabs';

interface Restaurant {
  publicId: string;
  name: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  tabStyle?: NavStyle;
  roundness?: string;
  showSearch?: boolean;
  showItemCount?: boolean;
  stickyNav?: boolean;
  domain?: string;
}

interface Admin {
  publicId: string;
  username: string;
  restaurant: Restaurant;
}

interface AdminSection {
  username?: string;
  password?: string;
}

interface RestaurantSection {
  name?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  tabStyle?: NavStyle;
  roundness?: string;
  showSearch?: boolean;
  showItemCount?: boolean;
  stickyNav?: boolean;
  domain?: string;
}

interface AdminUpdateData {
  admin?: AdminSection;
  restaurant?: RestaurantSection;
}

interface RegistrationForm {
  username: string;
  password: string;
  restaurantName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  tabStyle: NavStyle;
  roundness: string;
  showSearch: boolean;
  showItemCount: boolean;
  stickyNav: boolean;
  domain: string;
}

// ---------- Shared helpers ----------
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return typeof err === 'string' ? err : 'Something went wrong';
}

// ---------- Main App ----------
function App() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [editData, setEditData] = useState<AdminUpdateData>({});
  const originalDataRef = useRef<{ admin: AdminSection; restaurant: RestaurantSection } | null>(null);

  const handleUnlock = () => {
    if (secret.trim()) {
      setTempSecret(secret.trim());
      setIsAuthenticated(true);
      fetchAdmins();
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAllAdmins();
      setAdmins(res.data as unknown as Admin[]);
    } catch (err) {
      const message = getErrorMessage(err);
      alert('Failed to fetch admins: ' + message);
      if (message.includes('400') || message.includes('401')) {
        setIsAuthenticated(false);
        setTempSecret('');
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleCopy(textToCopy: string) {
      try {
        // Use the native Clipboard API
        await navigator.clipboard.writeText(textToCopy);


        // Reset the button text after 2 seconds
        setTimeout(() => window.alert("Copied"), 2000);
      } catch (err) {
        window.alert("Failed To Copy For Sure")
        console.error('Failed to copy text: ', err);
      }
  }

  const handleRegister = async (formData: RegistrationForm) => {
    try {
      await registerAdmin(formData);
      await fetchAdmins();
    } catch (err) {
      alert('Registration failed: ' + getErrorMessage(err));
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!window.confirm('Delete this admin?')) return;
    try {
      await deleteAdmin(publicId);
      await fetchAdmins();
    } catch (err) {
      alert('Deletion failed: ' + getErrorMessage(err));
    }
  };

  const startEditing = (admin: Admin) => {
    const restaurant = admin.restaurant;
    const original = {
      admin: { username: admin.username },
      restaurant: { ...restaurant },
    };
    originalDataRef.current = original;

    setEditingRestaurantId(restaurant.publicId);
    setEditData({
      admin: { username: admin.username },
      restaurant: {
        name: restaurant.name,
        tagline: restaurant.tagline || '',
        primaryColor: restaurant.primaryColor || '#4f46e5',
        accentColor: restaurant.accentColor || '#ffffff',
        tabStyle: restaurant.tabStyle || 'dropdown',
        roundness: restaurant.roundness || '1rem',
        showSearch: restaurant.showSearch || false,
        showItemCount: restaurant.showItemCount || false,
        stickyNav: restaurant.stickyNav || false,
        domain: restaurant.domain || '',
      },
    });
  };

  const cancelEditing = () => {
    setEditingRestaurantId(null);
    setEditData({});
    originalDataRef.current = null;
  };

  const handleAdminChange = <K extends keyof AdminSection>(field: K, value: AdminSection[K]) => {
    setEditData((prev) => ({
      ...prev,
      admin: { ...prev.admin, [field]: value },
    }));
  };

  const handleRestaurantChange = <K extends keyof RestaurantSection>(
    field: K,
    value: RestaurantSection[K]
  ) => {
    setEditData((prev) => ({
      ...prev,
      restaurant: { ...prev.restaurant, [field]: value },
    }));
  };

  const handleUpdate = async () => {
    if (!editingRestaurantId || !originalDataRef.current) return;

    const original = originalDataRef.current;
    const current = editData;

    const getChanged = <T extends Record<string, unknown>>(orig: T, curr: T): Partial<T> => {
      const changed: Partial<T> = {};
      for (const key in curr) {
        if (key === 'password' && !curr[key]) continue; // skip empty password
        if (orig[key] !== curr[key]) {
          changed[key] = curr[key];
        }
      }
      return changed;
    };

    const changedAdmin = getChanged(original.admin as Record<string, unknown>, (current.admin || {}) as Record<string, unknown>);
    const changedRestaurant = getChanged(original.restaurant as Record<string, unknown>, (current.restaurant || {}) as Record<string, unknown>);

    if (Object.keys(changedAdmin).length === 0 && Object.keys(changedRestaurant).length === 0) {
      alert('No changes detected.');
      return;
    }

    const payload: AdminUpdateData = {};
    if (Object.keys(changedAdmin).length > 0) payload.admin = changedAdmin;
    if (Object.keys(changedRestaurant).length > 0) payload.restaurant = changedRestaurant;

    setSaving(true);
    try {
      await updateAdmin(editingRestaurantId, payload);
      await fetchAdmins();
      cancelEditing();
    } catch (err) {
      alert('Update failed: ' + getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ----- Lock screen -----
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-slate-900">Super Admin Panel</h2>
          <p className="mt-1 text-sm text-slate-500">Enter the secret key to access.</p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Secret key"
            className="mt-6 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleUnlock}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Super Admin Panel</h1>
          <button
            onClick={() => { setIsAuthenticated(false); setTempSecret(''); }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 transition-colors"
          >
            Lock
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <AdminRegistrationForm onRegister={handleRegister} />

        <section>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
            Existing Admins
          </h2>

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : admins?.length === 0 ? (
            <p className="text-sm text-slate-500">No admins yet.</p>
          ) : (
            <ul className="space-y-3">
              {admins?.map((admin) => {
                const isEditing = editingRestaurantId === admin.restaurant.publicId;
                return (
                  <li
                    key={admin.publicId}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{admin.username}</p>
                        <p className="text-xs text-slate-500">
                          {admin.restaurant?.name || 'No restaurant'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{admin.restaurant.publicId}</p>
                        <button onClick={()=>{handleCopy(admin.restaurant.publicId)}} className="copy-btn">
                            Copy
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => (isEditing ? cancelEditing() : startEditing(admin))}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDelete(admin.publicId)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 space-y-5">
                        <div>
                          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Admin
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Username">
                              <input
                                type="text"
                                value={editData.admin?.username || ''}
                                onChange={(e) => handleAdminChange('username', e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                            <Field label="New password">
                              <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={editData.admin?.password || ''}
                                onChange={(e) => handleAdminChange('password', e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Restaurant
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Name">
                              <input
                                type="text"
                                value={editData.restaurant?.name || ''}
                                onChange={(e) => handleRestaurantChange('name', e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                            <Field label="Tagline">
                              <input
                                type="text"
                                value={editData.restaurant?.tagline || ''}
                                onChange={(e) => handleRestaurantChange('tagline', e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                            <Field label="Primary color">
                              <input
                                type="color"
                                value={editData.restaurant?.primaryColor || '#4f46e5'}
                                onChange={(e) => handleRestaurantChange('primaryColor', e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-300"
                              />
                            </Field>
                            <Field label="Accent color">
                              <input
                                type="color"
                                value={editData.restaurant?.accentColor || '#ffffff'}
                                onChange={(e) => handleRestaurantChange('accentColor', e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-300"
                              />
                            </Field>
                            <Field label="Tab style">
                              <select
                                value={editData.restaurant?.tabStyle || 'dropdown'}
                                onChange={(e) =>
                                  handleRestaurantChange('tabStyle', e.target.value as NavStyle)
                                }
                                className={inputClass}
                              >
                                <option value="dropdown">dropdown</option>
                                <option value="tabs">tabs</option>
                              </select>
                            </Field>
                            <Field label="Roundness">
                              <input
                                type="text"
                                placeholder="e.g. 1rem"
                                value={editData.restaurant?.roundness || ''}
                                onChange={(e) => handleRestaurantChange('roundness', e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                            <Field label="Domain">
                              <input
                                type="text"
                                placeholder="optional"
                                value={editData.restaurant?.domain || ''}
                                onChange={(e) => handleRestaurantChange('domain', e.target.value)}
                                className={inputClass}
                              />
                            </Field>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-4">
                            <Checkbox
                              label="Show search"
                              checked={editData.restaurant?.showSearch || false}
                              onChange={(v) => handleRestaurantChange('showSearch', v)}
                            />
                            <Checkbox
                              label="Show item count"
                              checked={editData.restaurant?.showItemCount || false}
                              onChange={(v) => handleRestaurantChange('showItemCount', v)}
                            />
                            <Checkbox
                              label="Sticky nav"
                              checked={editData.restaurant?.stickyNav || false}
                              onChange={(v) => handleRestaurantChange('stickyNav', v)}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {saving ? 'Saving...' : 'Save changes'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

// ---------- Small presentational helpers ----------
const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
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
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      {label}
    </label>
  );
}

// ---------- Registration Form ----------
function AdminRegistrationForm({ onRegister }: { onRegister: (data: RegistrationForm) => void }) {
  const [form, setForm] = useState<RegistrationForm>({
    username: '',
    password: '',
    restaurantName: '',
    tagline: '',
    primaryColor: '#4f46e5',
    accentColor: '#ffffff',
    tabStyle: 'dropdown',
    roundness: '1rem',
    showSearch: false,
    showItemCount: false,
    stickyNav: false,
    domain: '',
  });

  const setField = <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
        Add Restaurant Admin
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Username">
          <input
            required
            value={form.username}
            onChange={(e) => setField('username', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Restaurant name">
          <input
            required
            value={form.restaurantName}
            onChange={(e) => setField('restaurantName', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tagline">
          <input
            value={form.tagline}
            onChange={(e) => setField('tagline', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Primary color">
          <input
            type="color"
            value={form.primaryColor}
            onChange={(e) => setField('primaryColor', e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-300"
          />
        </Field>
        <Field label="Accent color">
          <input
            type="color"
            value={form.accentColor}
            onChange={(e) => setField('accentColor', e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-300"
          />
        </Field>
        <Field label="Tab style">
          <select
            value={form.tabStyle}
            onChange={(e) => setField('tabStyle', e.target.value as NavStyle)}
            className={inputClass}
          >
            <option value="dropdown">dropdown</option>
            <option value="tabs">tabs</option>
          </select>
        </Field>
        <Field label="Roundness">
          <input
            value={form.roundness}
            onChange={(e) => setField('roundness', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Domain">
          <input
            value={form.domain}
            onChange={(e) => setField('domain', e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <Checkbox label="Show search" checked={form.showSearch} onChange={(v) => setField('showSearch', v)} />
        <Checkbox label="Show item count" checked={form.showItemCount} onChange={(v) => setField('showItemCount', v)} />
        <Checkbox label="Sticky nav" checked={form.stickyNav} onChange={(v) => setField('stickyNav', v)} />
      </div>

      <button
        type="submit"
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Register
      </button>
    </form>
  );
}

export default App;