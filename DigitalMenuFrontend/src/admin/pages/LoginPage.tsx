import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Check, LockKeyhole, QrCode, UtensilsCrossed, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Alert, Button, Spinner } from '../components/ui';
import { ThemeToggle } from '../theme/ThemeToggle';

const inputStyles =
  'w-full rounded-lg border border-ui-border-strong bg-ui-surface py-2.5 pl-10 pr-3 text-sm text-ui-text shadow-sm transition-colors placeholder:text-ui-subtle focus:border-ui-accent focus:outline-none focus:ring-2 focus:ring-ui-accent/20';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, isCheckingSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/admin';

  if (isCheckingSession) {
    return (
      <div className="admin-scope flex min-h-screen items-center justify-center bg-ui-bg">
        <Spinner label="Checking your session..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-scope flex min-h-screen items-center justify-center bg-ui-bg px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-ui-surface shadow-xl shadow-black/10 ring-1 ring-ui-border lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0c0c0c] p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.10),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(160,160,160,0.14),transparent_45%)]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">DigitalMenu</div>
              <div className="text-xs text-white/50">Restaurant management</div>
            </div>
          </div>

          <div className="relative">
            <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
              Your menu, beautifully managed.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Update dishes, branding, and layout in one place. Your customers see the changes instantly.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: UtensilsCrossed, label: 'Manage categories and items' },
                { icon: QrCode, label: 'Share your menu with a QR code' },
                { icon: Check, label: 'Customize every detail of your menu' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                    <Icon size={14} />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-white/40">Built for modern restaurants</p>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ui-accent-solid text-white shadow-sm">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-sm font-semibold text-ui-text">DigitalMenu</span>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ui-text">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ui-muted">Sign in to manage your restaurant menu.</p>

          {error && (
            <Alert>
              <span>{error}</span>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-ui-text">
                Username
              </label>
              <div className="relative">
                <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-subtle" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Your username"
                  className={inputStyles}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ui-text">
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-subtle" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={inputStyles}
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-ui-subtle">DigitalMenu · Restaurant Admin</p>
        </div>
      </div>
    </div>
  );
}
