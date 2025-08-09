import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchItems, deleteItem } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import { CATEGORY_OPTIONS, CURRENCY_PREFIX } from '../constants.js';

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [collapsedCats, setCollapsedCats] = useState(() => new Set());
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchItems();
        setItems(data);
      } catch (e) {
        toast.show('Failed to load items');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const categories = CATEGORY_OPTIONS;
  const statuses = useMemo(() => Array.from(new Set(items.map(i => i.status).filter(Boolean))), [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesQ = !q || i.name?.toLowerCase().includes(q.toLowerCase()) || i.notes?.toLowerCase().includes(q.toLowerCase());
      const matchesC = !category || i.category === category;
      const matchesS = !status || i.status === status;
      return matchesQ && matchesC && matchesS;
    });
  }, [items, q, category, status]);

  const daysBetween = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    const ms = today.setHours(0,0,0,0) - d.setHours(0,0,0,0);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.show('Deleted');
    } catch (e) {
      toast.show('Delete failed');
    }
  };

  const isAll = !category;
  const grouped = useMemo(() => {
    if (!isAll) return {};
    const map = new Map();
    for (const it of filtered) {
      const key = it.category || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    const ordered = {};
    CATEGORY_OPTIONS.forEach((c) => {
      if (map.has(c)) ordered[c] = map.get(c);
    });
    for (const [k, v] of map.entries()) {
      if (!(k in ordered)) ordered[k] = v;
    }
    return ordered;
  }, [filtered, isAll]);

  const toggleCollapse = (cat) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setQ('');
    setCategory('');
    setStatus('');
  };

  return (
    <div className="space-y-3">
      <div className="glass rounded-xl p-2">
        <div className="flex items-center gap-2">
          <input className="input input-bordered input-xs flex-1" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select select-bordered select-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
            {["", ...categories].map((c) => (
              <button
                key={c || 'All'}
                type="button"
                className={`badge ${category===c ? 'badge-primary' : 'badge-ghost'} badge-sm cursor-pointer select-none`}
                onClick={() => setCategory(c)}
              >{c || 'All'}</button>
            ))}
          </div>
          {(q || category || status) && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500">No items</div>
      ) : isAll ? (
        <div className="space-y-2">
          {Object.entries(grouped).map(([cat, arr]) => (
            <div key={cat} className="space-y-1.5">
              <div className="px-1.5 flex items-center justify-between">
                <button type="button" className="badge badge-ghost badge-xs" onClick={() => toggleCollapse(cat)}>
                  <span className="mr-1">{collapsedCats.has(cat) ? '▸' : '▾'}</span>{cat} · {arr.length}
                </button>
                {/* quick jump to filter this category */}
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setCategory(cat)}>Filter</button>
              </div>
              {!collapsedCats.has(cat) && (
                <ul className="space-y-1.5">
                {arr.map((i) => (
                  <li key={i.id} className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                    {i.image_url ? (
                      <img src={i.image_url} alt="icon" className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-white/60 rounded border border-white/50 flex items-center justify-center text-gray-400 text-xs">Icon</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm leading-snug truncate">{i.name}</div>
                      <div className="text-[10px] text-gray-600 truncate">{i.status}{i.purchase_date ? ` • Used ${daysBetween(i.purchase_date) ?? '?'} days` : ''}</div>
                    </div>
                    {i.price ? <div className="text-[11px] text-gray-800 whitespace-nowrap">{CURRENCY_PREFIX} {Number(i.price).toFixed(2)}</div> : null}
                    <div className="flex gap-1 ml-2">
                      <Link className="btn btn-secondary btn-xs rounded-full" to={`/edit/${i.id}`}>Edit</Link>
                      <button className="btn btn-ghost btn-xs rounded-full" onClick={() => onDelete(i.id)}>Del</button>
                    </div>
                  </li>
                ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filtered.map((i) => (
            <div key={i.id} className="card compact-card">
              <div className="card-header text-sm">{i.category || 'Item'}</div>
              <div className="card-body flex gap-2 items-center">
                {i.image_url ? (
                  <img src={i.image_url} alt="icon" className="w-14 h-14 object-contain rounded-lg" />
                ) : (
                  <div className="w-14 h-14 bg-white/60 rounded-lg border border-white/50 flex items-center justify-center text-gray-400">Icon</div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-base leading-tight">{i.name}</div>
                  <div className="text-xs text-gray-600">{i.status}{i.purchase_date ? ` • Used ${daysBetween(i.purchase_date) ?? '?'} days` : ''}</div>
                  {i.price ? <div className="text-xs text-gray-800 mt-0.5">{CURRENCY_PREFIX} {Number(i.price).toFixed(2)}</div> : null}
                </div>
                <div className="flex flex-col gap-1">
                  <Link className="btn btn-secondary btn-sm rounded-full" to={`/edit/${i.id}`}>Edit</Link>
                  <button className="btn btn-ghost btn-sm rounded-full" onClick={() => onDelete(i.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button for mobile */}
      <button className="fab lg:hidden" onClick={() => window.location.assign('/add')} aria-label="Add New">+</button>
    </div>
  );
}


