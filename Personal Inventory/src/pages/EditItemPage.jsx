import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function EditItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let ignore = false
    async function load() {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`)
      if (!res.ok) return
      const data = await res.json()
      if (!ignore) setForm(data.item)
    }
    if (user) load()
    return () => { ignore = true }
  }, [user, id])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (form.purchase_price && isNaN(Number(form.purchase_price))) errs.purchase_price = 'Must be a number'
    if (form.resale_price && isNaN(Number(form.resale_price))) errs.resale_price = 'Must be a number'
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          purchase_price: form.purchase_price === '' ? '' : Number(form.purchase_price),
          resale_price: form.resale_price === '' ? '' : Number(form.resale_price),
        }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Item updated')
      navigate(`/items/${encodeURIComponent(id)}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return <p className="text-sm text-gray-600">Please login to edit items.</p>
  }
  if (!form) return null

  return (
    <motion.form onSubmit={onSubmit} className="max-w-2xl space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-semibold">Edit Item</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="ID">
          <input name="id" value={form.id} disabled className="w-full rounded-xl border-gray-300 bg-gray-100" />
        </Field>
        <Field label="Name" error={errors.name}>
          <input name="name" value={form.name} onChange={onChange} className="w-full rounded-xl border-gray-300" />
        </Field>
        <Field label="Category">
          <input name="category" value={form.category} onChange={onChange} className="w-full rounded-xl border-gray-300" />
        </Field>
        <Field label="Purchase Date">
          <input type="date" name="purchase_date" value={form.purchase_date} onChange={onChange} className="w-full rounded-xl border-gray-300" />
        </Field>
        <Field label="Purchase Price" error={errors.purchase_price}>
          <input name="purchase_price" value={form.purchase_price} onChange={onChange} inputMode="decimal" className="w-full rounded-xl border-gray-300" />
        </Field>
        <Field label="Status">
          <select name="status" value={form.status} onChange={onChange} className="w-full rounded-xl border-gray-300">
            <option value="listed">Listed</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Resale Price" error={errors.resale_price}>
          <input name="resale_price" value={form.resale_price} onChange={onChange} inputMode="decimal" className="w-full rounded-xl border-gray-300" />
        </Field>
        <Field label="Photos (comma-separated URLs)">
          <input name="photos" value={form.photos} onChange={onChange} className="w-full rounded-xl border-gray-300" />
        </Field>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={4} className="w-full rounded-xl border-gray-300" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={submitting} className="px-4 py-2 rounded-2xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 shadow">Save</button>
      </div>
    </motion.form>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}


