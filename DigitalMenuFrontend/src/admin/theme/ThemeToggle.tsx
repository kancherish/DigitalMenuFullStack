import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from './themeContext';

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex rounded-lg border border-ui-border bg-ui-muted-surface p-0.5"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={`${label} theme`}
          aria-pressed={theme === value}
          title={`${label} theme`}
          className={`rounded-md p-1.5 transition-colors ${
            theme === value
              ? 'bg-ui-surface text-ui-accent shadow-sm'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
