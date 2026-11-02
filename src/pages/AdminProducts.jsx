
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, ImagePlus, ArrowLeft,
  Package, X, RefreshCw
} from 'lucide-react'

export default function AdminProducts() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const emptyForm = {
    name_en: '',
    name_si: '',
    description_en: '',
    description_si: '',
    category_id: '',
    price: '',
    image_url: '',
    is_active: true
  }

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      navigate('/admin')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      navigate('/admin')
      return
    }

    await fetchData()
  }

  async function fetchData() {
    setLoading(true)
    setError('')

    const [productResult, categoryResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('categories')
        .select('id, name_en, name_si')
        .eq('is_active', true)
        .order('name_en')
    ])

    if (productResult.error) {
      setError(productResult.error.message)
    } else {
      setProducts(productResult.data || [])
    }

    if (categoryResult.error) {
      setError(categoryResult.error.message)
    } else {
      setCategories(categoryResult.data || [])
    }

    setLoading(false)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setImageFile(null)

    const fileInput = document.getElementById('product-image')
    if (fileInput) fileInput.value = ''
  }

  function editProduct(product) {
    setEditingId(product.id)

    setForm({
      name_en: product.name_en || '',
      name_si: product.name_si || '',
      description_en: product.description_en || '',
      description_si: product.description_si || '',
      category_id: product.category_id || '',
      price: String(product.price ?? ''),
      image_url: product.image_url || '',
      is_active: product.is_active ?? true
    })

    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function uploadImage() {
    if (!imageFile) return form.image_url

    const extension = imageFile.name.split('.').pop()
    const fileName = `products/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('invitation-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('invitation-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      if (!form.name_en.trim() || !form.name_si.trim()) {
        throw new Error('Please enter product names in both languages.')
      }

      if (form.price === '' || Number(form.price) < 0) {
        throw new Error('Please enter a valid product price.')
      }

      const imageUrl = await uploadImage()

      const productData = {
        name_en: form.name_en.trim(),
        name_si: form.name_si.trim(),
        description_en: form.description_en.trim(),
        description_si: form.description_si.trim(),
        category_id: form.category_id || null,
        price: Number(form.price),
        image_url: imageUrl || null,
        is_active: form.is_active,
        updated_at: new Date().toISOString()
      }

      let result

      if (editingId) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
      }

      if (result.error) throw result.error

      setMessage(editingId
        ? 'Product updated successfully!'
        : 'Product added successfully!'
      )

      resetForm()
      await fetchData()

    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Product deleted successfully!')
    await fetchData()
  }

  async function toggleStatus(product) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      setError(error.message)
      return
    }

    await fetchData()
  }

  return (
    <div className="admin-content admin-products-page min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Dashboard overview
        </button>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Products Management
            </h1>
            <p className="mt-2 text-gray-500">
              Manage your invitation designs and prices.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Product Form */}
        <div className="mb-10 rounded-xl border bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              {editingId ? <Pencil size={20} /> : <Plus size={20} />}
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            {editingId && (
              <button onClick={resetForm} className="text-gray-500">
                <X size={22} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Name (English) *
                </label>
                <input
                  name="name_en"
                  value={form.name_en}
                  onChange={handleChange}
                  required
                  placeholder="Wedding Invitation Design 01"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Name (Sinhala) *
                </label>
                <input
                  name="name_si"
                  value={form.name_si}
                  onChange={handleChange}
                  required
                  placeholder="විවාහ ආරාධනා නිර්මාණය 01"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-white p-3"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name_en} / {category.name_si}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (LKR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="2500"
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description (English)
                </label>
                <textarea
                  name="description_en"
                  value={form.description_en}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border p-3"
                  placeholder="Enter product description..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description (Sinhala)
                </label>
                <textarea
                  name="description_si"
                  value={form.description_si}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border p-3"
                  placeholder="නිර්මාණයේ විස්තර ඇතුළත් කරන්න..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Image
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border p-3"
              />

              {imageFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {imageFile.name}
                </p>
              )}

              {!imageFile && form.image_url && (
                <img
                  src={form.image_url}
                  alt="Current product"
                  className="mt-3 h-28 w-28 rounded-lg object-cover"
                />
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              <span className="text-sm">Active Product</span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <Plus size={18} />
                {saving
                  ? 'Saving...'
                  : editingId ? 'Update Product' : 'Add Product'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-6 py-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Product List */}
        <div>
          <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
            <Package size={22} />
            All Products ({products.length})
          </h2>

          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <div className="rounded-xl border bg-white p-10 text-center">
              <ImagePlus className="mx-auto mb-3 text-gray-400" size={40} />
              <p className="text-gray-500">No products added yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => {
                const category = categories.find(
                  item => item.id === product.category_id
                )

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name_en}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gray-100">
                        <ImagePlus size={40} className="text-gray-400" />
                      </div>
                    )}

                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="font-semibold">{product.name_en}</h3>
                        <p className="text-sm text-gray-500">
                          {product.name_si}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500">
                        {category
                          ? category.name_en
                          : 'No category assigned'}
                      </p>

                      <p className="text-lg font-bold">
                        LKR {Number(product.price).toLocaleString('en-LK')}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleStatus(product)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editProduct(product)}
                            title="Edit product"
                            className="rounded-lg border p-2 hover:bg-gray-100"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            title="Delete product"
                            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
