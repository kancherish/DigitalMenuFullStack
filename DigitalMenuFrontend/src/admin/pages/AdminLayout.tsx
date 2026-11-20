import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ExternalLink,
  LogOut,
  Menu,
  Settings2,
  Tags,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui';
import { ThemeToggle } from '../theme/ThemeToggle';

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/admin', label: 'Settings', icon: Settings2 },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/items', label: 'Menu Items', icon: UtensilsCrossed },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  function handleNavClick() {
    setDrawerOpen(false);
  }

  const restaurantName = admin?.restaurant.name || 'Admin Panel';
  const initial = restaurantName.trim().charAt(0).toUpperCase() || 'D';
  const publicMenuUrl = admin?.restaurant.publicId
    ? `${window.location.origin}/${admin.restaurant.publicId}`
    : null;

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-ui-border px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ui-accent-solid text-white shadow-sm">
          <UtensilsCrossed size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight text-ui-text">DigitalMenu</div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-ui-subtle">Admin console</div>
        </div>
      </div>

      <div className="mx-3 mt-4 rounded-xl border border-ui-border bg-ui-muted-surface p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ui-surface text-sm font-semibold text-ui-accent-text shadow-sm ring-1 ring-ui-border">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ui-text">{restaurantName}</div>
            <div className="truncate text-xs text-ui-muted">{admin?.username}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ui-subtle">Workspace</p>
        <div className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ui-accent-soft text-ui-accent-text'
                    : 'text-ui-muted hover:bg-ui-muted-surface hover:text-ui-text'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="space-y-3 border-t border-ui-border px-3 py-4">
        <div className="flex items-center justify-between gap-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ui-subtle">Appearance</span>
          <ThemeToggle />
        </div>
        {publicMenuUrl && (
          <a
            href={publicMenuUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ui-muted transition-colors hover:bg-ui-muted-surface hover:text-ui-text"
          >
            <ExternalLink size={17} />
            View live menu
          </a>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start px-3 py-2.5"
        >
          <LogOut size={17} />
          Log out
        </Button>
      </div>
    </>
  );

  const activeLabel = navItems.find((n) => n.to === location.pathname)?.label ?? 'Admin Panel';

  return (
    <div className="admin-scope flex min-h-screen bg-ui-bg">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ui-border bg-ui-surface md:flex">
        {sidebarContent}
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-ui-border bg-ui-surface px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ui-muted hover:bg-ui-muted-surface hover:text-ui-text"
          >
            <Menu size={21} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ui-accent-solid text-white">
            <UtensilsCrossed size={16} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ui-text">DigitalMenu</span>
        </div>
        <span className="text-xs font-medium text-ui-muted">{activeLabel}</span>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="relative z-50 flex w-72 flex-col bg-ui-surface shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-ui-muted hover:bg-ui-muted-surface"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-10 pt-20 md:px-8 md:py-8 md:pt-8">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
