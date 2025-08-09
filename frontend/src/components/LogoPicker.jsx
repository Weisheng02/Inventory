import React, { useMemo } from 'react';
import { ICON_CATALOG, iconUrlForId } from '../constants.js';

export default function LogoPicker({ value, onChange }) {
  const flat = useMemo(() => ICON_CATALOG.flatMap(group => group.items.map(i => ({ ...i, group: group.category }))), []);
  const selected = flat.find(i => iconUrlForId(i.id) === value);

  return (
    <div>
      <div className="label mb-2">Icon</div>
      <div className="space-y-3 max-h-64 overflow-auto pr-1">
        {ICON_CATALOG.map(group => (
          <div key={group.category}>
            <div className="text-xs text-gray-600 mb-2">{group.category}</div>
            <div className="grid grid-cols-6 gap-2">
              {group.items.map(({ label, id }) => {
                const url = iconUrlForId(id);
                const active = url === value;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`glass rounded-xl p-2 flex items-center justify-center border ${active ? 'ring-2 ring-brand-400 border-white/80' : 'border-white/40'}`}
                    title={label}
                    onClick={() => onChange(url)}
                  >
                    <img src={url} alt={label} className="w-7 h-7 object-contain" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {selected ? <div className="text-xs text-gray-600 mt-2">Selected: {selected.label}</div> : null}
    </div>
  );
}


