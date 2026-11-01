
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    id: null,
    name_en: '',
    name_si: '',
    description_en: '',
    description_si: '',
    image_url: '',
    is_active: true,
  })

  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    setLoading(true)

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      setMessage('Please log in to access the admin dashboard.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      setMessage('Access denied. Admin permission required.')
      setLoading(false)
      return
    }

    setIsAdmin(true)
    await fetchCategories()
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setCategories(data || [])
    }

    setLoading(false)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function resetForm() {
    setForm({
      id: null,
      name_en: '',
      name_si: '',
      description_en: '',
      description_si: '',
      image_url: '',
      is_active: true,
    })

    setImageFile(null)
    setMessage('')
  }

  async function uploadImage() {
    if (!imageFile) return form.image_url

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Please select a JPG, PNG, or WEBP image.')
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5 MB.')
    }

    const filePath = `categories/${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { error } = await supabase.storage
      .from('invitation-images')
      .upload(filePath, imageFile, {
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from('invitation-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const imageUrl = await uploadImage()

      const categoryData = {
        name_en: form.name_en.trim(),
        name_si: form.name_si.trim(),
        description_en: form.description_en.trim(),
        description_si: form.description_si.trim(),
        image_url: imageUrl,
        is_active: form.is_active,
      }

      let result

      if (form.id) {
        result = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', form.id)
      } else {
        result = await supabase
          .from('categories')
          .insert([categoryData])
      }

      if (result.error) throw result.error

      setMessage(
        form.id
          ? 'Category updated successfully!'
          : 'Category added successfully!'
      )

      resetForm()
      await fetchCategories()
    } catch (error) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  function editCategory(category) {
    setForm({
      id: category.id,
      name_en: category.name_en || '',
      name_si: category.name_si || '',
      description_en: category.description_en || '',
      description_si: category.description_si || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
    })

    setImageFile(null)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteCategory(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Category deleted successfully!')
      await fetchCategories()
    }
  }

  async function toggleStatus(category) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id)

    if (error) {
      setMessage(error.message)
    } else {
      await fetchCategories()
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading categories...</div>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-3">Admin Access Required</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Category Management
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your English and Sinhala invitation categories.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-blue-50 text-blue-700 p-3">
            {message}
          </div>
        )}

        {/* CATEGORY FORM */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-5">
            {form.id ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name (English) *
                </label>
                <input
                  name="name_en"
                  value={form.name_en}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg p-3"
                  placeholder="Wedding Invitation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name (Sinhala) *
                </label>
                <input
                  name="name_si"
                  value={form.name_si}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg p-3"
                  placeholder="විවාහ ආරාධනා"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  English Description
                </label>
                <textarea
                  name="description_en"
                  value={form.description_en}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sinhala Description
                </label>
                <textarea
                  name="description_si"
                  value={form.description_si}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-lg p-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category Image
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-3"
              />

              {imageFile && (
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {imageFile.name}
                </p>
              )}

              {!imageFile && form.image_url && (
                <img
                  src={form.image_url}
                  alt="Current category"
                  className="mt-3 w-32 h-24 object-cover rounded-lg"
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
              <span className="text-sm">Active Category</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : form.id
                    ? 'Update Category'
                    : 'Add Category'}
              </button>

              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CATEGORY LIST */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-5">
            Existing Categories ({categories.length})
          </h2>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border rounded-xl overflow-hidden"
                >
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name_en}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">
                      {category.name_en}
                    </h3>

                    <p className="text-gray-600 text-sm mt-1">
                      {category.name_si}
                    </p>

                    <span
                      className={`inline-block mt-3 text-xs px-3 py-1 rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => editCategory(category)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(category)}
                        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
