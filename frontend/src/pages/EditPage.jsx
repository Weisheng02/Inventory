import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem, fetchItems, updateItem } from '../api.js';
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../constants.js';
import LogoPicker from '../components/LogoPicker.jsx';
import { useToast } from '../components/Toast.jsx';

export default function EditPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(mode === 'edit');
  const [form, setForm] = useState({
    name: '',
    category: '',
    purchase_date: '',
    price: '',
    status: '',
    notes: '',
    image_url: '',
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        try {
          const items = await fetchItems();
          const found = items.find((i) => String(i.id) === String(id));
          if (!found) throw new Error('Not found');
          setForm({
            name: found.name || '',
            category: found.category || '',
            purchase_date: found.purchase_date || '',
            price: found.price || '',
            status: found.status || '',
            notes: found.notes || '',
            image_url: found.image_url || '',
          });
        } catch (e) {
          toast.show('Failed to load item');
          navigate('/');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, id, navigate, toast]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'price' ? value.replace(/[^\d.]/g, '') : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name.trim()) {
        toast.show('Name is required');
        return;
      }
      if (mode === 'add') {
        await createItem({ ...form, price: Number(form.price || 0) });
        toast.show('Added');
      } else {
        await updateItem(id, { ...form, price: Number(form.price || 0) });
        toast.show('Updated');
      }
      navigate('/');
    } catch (e) {
      toast.show('Save failed');
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading…</div>;

  return (
    <form id="edit-form" onSubmit={onSubmit} className="space-y-4 card">
      <div className="card-header">Item Details</div>
      <div className="card-body space-y-4">
        <Field label="Name" name="name" value={form.name} onChange={onChange} required inputClass="input input-bordered w-full" />
        <label className="block">
          <div className="label">Category</div>
          <select className="select select-bordered w-full" name="category" value={form.category} onChange={onChange}>
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <Field label="Purchase Date" name="purchase_date" value={form.purchase_date} onChange={onChange} type="date" inputClass="input input-bordered w-full" />
        <Field label="Price" name="price" value={form.price} onChange={onChange} type="number" step="0.01" inputClass="input input-bordered w-full" />
        <label className="block">
          <div className="label">Status</div>
          <select className="select select-bordered w-full" name="status" value={form.status} onChange={onChange}>
            <option value="">Select status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <Field label="Notes" name="notes" value={form.notes} onChange={onChange} textarea inputClass="textarea textarea-bordered w-full" />
        <LogoPicker value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, type = 'text', textarea, required, step, inputClass }) {
  return (
    <label className="block">
      <div className="label">{label}{required ? ' *' : ''}</div>
      {textarea ? (
        <textarea className={inputClass || 'textarea textarea-bordered w-full min-h-[100px]'} name={name} value={value} onChange={onChange} />
      ) : (
        <input className={inputClass || 'input input-bordered w-full'} name={name} value={value} onChange={onChange} type={type} step={step} required={required} />
      )}
    </label>
  );
}


