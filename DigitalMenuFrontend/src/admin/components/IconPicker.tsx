// components/IconPicker.tsx
import { ICONS, ICON_NAMES } from '../../util/util';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className = '' }: IconPickerProps) {
  const SelectedIcon = value ? ICONS[value] : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SelectedIcon && <SelectedIcon size={18} className="text-slate-500 shrink-0" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">No icon</option>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}