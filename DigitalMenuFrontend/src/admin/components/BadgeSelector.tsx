import { isDietBadge, isTagBadge, TAG_BADGE_CONFIG, TAG_BADGE_NAMES } from '../../util/util'
import type { DietBadge, TagBadge } from '../types';

interface BadgeSelectorProps {
  value: string[];
  onChange: (badges: string[]) => void;
}

export function BadgeSelector({ value, onChange }: BadgeSelectorProps) {
  const currentDiet = value.find(isDietBadge) as DietBadge | undefined;
  const currentTags = value.filter(isTagBadge);

  function setDiet(diet: DietBadge | null) {
    const tags = value.filter(isTagBadge);
    onChange(diet ? [diet, ...tags] : tags);
  }

  function toggleTag(tag: TagBadge) {
    const diet = value.find(isDietBadge);
    const tags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onChange(diet ? [diet, ...tags] : tags);
  }

  const pill = (active: boolean) =>
    `px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
    }`;

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium text-slate-500 mb-1.5">Diet</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDiet(null)} className={pill(!currentDiet)}>
            None
          </button>
          <button type="button" onClick={() => setDiet('veg')} className={pill(currentDiet === 'veg')}>
            Veg
          </button>
          <button type="button" onClick={() => setDiet('non-veg')} className={pill(currentDiet === 'non-veg')}>
            Non-Veg
          </button>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-slate-500 mb-1.5">Tags</div>
        <div className="flex flex-wrap gap-2">
          {TAG_BADGE_NAMES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={pill(currentTags.includes(tag))}
            >
              {TAG_BADGE_CONFIG[tag].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}