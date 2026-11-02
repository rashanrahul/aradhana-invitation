
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const [productResult, categoryResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),

      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    ])

    if (productResult.error) {
      console.error(productResult.error)
    } else {
      setProducts(productResult.data || [])
    }

    if (categoryResult.error) {
      console.error(categoryResult.error)
    } else {
      setCategories(categoryResult.data || [])
    }

    setLoading(false)
  }

  function addToCart(product) {
    setCart(current => {
      const existing = current.find(item => item.id === product.id)

      if (existing) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })
  }

  function changeQuantity(id, amount) {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(
          product => product.category_id === selectedCategory
        )

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-[#fffaf7] px-5 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Our Invitations
          </h1>
          <p className="mt-3 text-gray-500">
            Choose your favourite invitation designs
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-5 py-2 ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            All
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-5 py-2 ${
                selectedCategory === category.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {category.name_en}
            </button>
          ))}
        </div>

        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm">
            <ShoppingCart />
            <span>{cartCount} items</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={35} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="py-20 text-center text-gray-500">
            No products available yet.
          </p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <img
                  src={product.image_url || 'https://placehold.co/600x400?text=Invitation'}
                  alt={product.name_en}
                  className="h-64 w-full object-cover"
                />

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {product.name_en}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description_en}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-bold text-rose-600">
                      LKR {Number(product.price).toLocaleString()}
                    </span>

                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
                    >
                      <Plus size={17} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-12 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
              <ShoppingCart />
              Your Cart
            </h2>

            {cart.map(item => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b py-4"
              >
                <div>
                  <h3 className="font-semibold">{item.name_en}</h3>
                  <p className="text-sm text-gray-500">
                    LKR {Number(item.price).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changeQuantity(item.id, -1)}
                    className="rounded-full bg-gray-100 p-2"
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => changeQuantity(item.id, 1)}
                    className="rounded-full bg-gray-100 p-2"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>

            <button
              onClick={() => alert('Checkout page will be connected next.')}
              className="mt-6 w-full rounded-full bg-rose-600 py-3 font-semibold text-white hover:bg-rose-700"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
