// components/IconPicker.tsx
import { useState, useRef, useEffect } from 'react';
import { ICONS, ICON_NAMES } from '../../util/util';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className = '' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const SelectedIcon = value ? ICONS[value] : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center gap-2 w-full justify-between"
      >
        <span className="flex items-center gap-2">
          {SelectedIcon ? (
            <SelectedIcon size={18} className="text-slate-500 shrink-0" />
          ) : (
            <span className="text-slate-400">No icon</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto py-1">
          <li
            className="px-3 py-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
          >
            <span className="text-slate-400">No icon</span>
          </li>
          {ICON_NAMES.map((name) => {
            const Icon = ICONS[name];
            return (
              <li
                key={name}
                className={`px-3 py-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2 ${
                  value === name ? 'bg-slate-50' : ''
                }`}
                onClick={() => {
                  onChange(name);
                  setIsOpen(false);
                }}
              >
                <Icon size={18} className="text-slate-500 shrink-0" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}