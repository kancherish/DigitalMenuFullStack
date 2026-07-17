// pages/AdminLayout.tsx
import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
   { to: '/admin', label: 'Settings' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/items', label: 'Menu Items' },
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

  // Close the drawer automatically whenever the route changes
  function handleNavClick() {
    setDrawerOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="text-sm font-semibold text-slate-900 truncate">
          {admin?.restaurant.name || 'Admin Panel'}
        </div>
        <div className="text-xs text-slate-500 truncate">{admin?.username}</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          end >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    </>
  );

  const activeLabel = navItems.find((n) => n.to === location.pathname)?.label ?? 'Admin Panel';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-60 shrink-0 bg-white border-r border-slate-200 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 h-14">
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={22} className="text-slate-700" />
        </button>
        <span className="text-sm font-semibold text-slate-900">{activeLabel}</span>
        <div className="w-[22px]" /> {/* spacer to balance the flex row */}
      </div>

      {/* Mobile drawer + backdrop */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-64 bg-white flex flex-col z-50 animate-in slide-in-from-left">
            <div className="flex items-center justify-end px-3 pt-3">
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}