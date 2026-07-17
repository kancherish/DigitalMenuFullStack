import React, { useState } from 'react';

type FormState = {
    username: string;
    password: string;
    restaurantName: string;
    tagline: string;
    primaryColor: string;
    accentColor: string;
    tabStyle: string;
    roundness: string;
    showSearch: boolean;
    showItemCount: boolean;
    stickyNav: boolean;
    domain: string;
};

type AdminRegistrationFormProps = {
    onRegister: (data: FormState) => void;
};

function AdminRegistrationForm({ onRegister }: AdminRegistrationFormProps) {
    const [form, setForm] = useState<FormState>({
        username: '',
        password: '',
        restaurantName: '',
        tagline: '',
        primaryColor: '#000000',
        accentColor: '#ffffff',
        tabStyle: 'tabs',
        roundness: '1rem',
        showSearch: false,
        showItemCount: false,
        stickyNav: false,
        domain: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setForm((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Add Restaurant Admin</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Create a login and configure the restaurant's menu appearance.
                </p>
            </div>

            {/* Account */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Account
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* Restaurant details */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Restaurant
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Restaurant name</label>
                        <input
                            name="restaurantName"
                            placeholder="Restaurant Name"
                            value={form.restaurantName}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tagline</label>
                        <input
                            name="tagline"
                            placeholder="Tagline"
                            value={form.tagline}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Domain (optional)</label>
                        <input
                            name="domain"
                            placeholder="menu.restaurant.com"
                            value={form.domain}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* Theme */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Theme
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Primary color</label>
                        <div className="mt-1 flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2">
                            <input
                                name="primaryColor"
                                type="color"
                                value={form.primaryColor}
                                onChange={handleChange}
                                className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                            />
                            <span className="text-sm text-slate-500">{form.primaryColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Accent color</label>
                        <div className="mt-1 flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2">
                            <input
                                name="accentColor"
                                type="color"
                                value={form.accentColor}
                                onChange={handleChange}
                                className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                            />
                            <span className="text-sm text-slate-500">{form.accentColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tab style</label>
                        <select
                            name="tabStyle"
                            value={form.tabStyle}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="tabs">Tabs</option>
                            <option value="buttons">Buttons</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Roundness</label>
                        <input
                            name="roundness"
                            placeholder="e.g. 1rem"
                            value={form.roundness}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* Layout toggles */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Layout options
                </h3>
                <div className="space-y-3">
                    {[
                        { name: 'showSearch', label: 'Show search bar' },
                        { name: 'showItemCount', label: 'Show item count' },
                        { name: 'stickyNav', label: 'Sticky navigation' },
                    ].map((opt) => (
                        <label key={opt.name} className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                                name={opt.name}
                                type="checkbox"
                                checked={form[opt.name as keyof typeof form] as boolean}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
                <button
                    type="submit"
                    className="w-full sm:w-auto rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Register admin
                </button>
            </div>
        </form>
    );
}

export default AdminRegistrationForm