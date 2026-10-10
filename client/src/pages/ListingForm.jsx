import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setError('')
      return
    }

    let active = true
    api.get(`/listings/${id}`)
      .then((res) => {
        if (!active) return
        const listing = res.data.listing || {}
        setForm({
          title: listing.title ?? '',
          description: listing.description ?? '',
          price: Number(listing.price) || 0,
          category: listing.category ?? 'other',
          condition: listing.condition ?? 'used',
          status: listing.status ?? 'active'
        })
      })
      .catch((err) => {
        if (!active) return
        setError(err?.response?.data?.message || 'Failed to load listing')
      })

    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const payload = { ...form, price: Number(form.price) }

      if (isEdit) {
        await api.patch(`/listings/${id}`, payload)
      } else {
        const { status, ...createPayload } = payload
        await api.post('/listings', createPayload)
      }

      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Title</span>
          <input className="input" name="title" value={form.title} onChange={onChange} placeholder="Calculus textbook" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Price</span>
            <input className="input" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Category</span>
            <select className="input" name="category" value={form.category} onChange={onChange}>
              <option value="textbooks">textbooks</option>
              <option value="electronics">electronics</option>
              <option value="furniture">furniture</option>
              <option value="clothing">clothing</option>
              <option value="other">other</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Condition</span>
            <select className="input" name="condition" value={form.condition} onChange={onChange}>
              <option value="new">new</option>
              <option value="like-new">like-new</option>
              <option value="used">used</option>
              <option value="worn">worn</option>
            </select>
          </label>

          {isEdit && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Status</span>
              <select className="input" name="status" value={form.status} onChange={onChange}>
                <option value="active">active</option>
                <option value="sold">sold</option>
              </select>
            </label>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <textarea className="input min-h-28" name="description" value={form.description} onChange={onChange} placeholder="Describe your item" />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
