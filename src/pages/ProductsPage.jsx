import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react'

export default function ProductsPage() {
const [products, setProducts] = useState([])
const [categories, setCategories] = useState([])
const [cart, setCart] = useState([])
const [loading, setLoading] = useState(true)
const [loadError, setLoadError] = useState('')

const [searchParams] = useSearchParams()
const categoryFromUrl = searchParams.get('category')

const [selectedCategory, setSelectedCategory] = useState(
  categoryFromUrl || 'all'
)
  const [showCheckout, setShowCheckout] = useState(false)

  const [customer, setCustomer] = useState({
  name: '',
  phone: '',
  email: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    let mounted = true

    async function refreshData() {
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

      if (!mounted) return

      const errors = [productResult.error, categoryResult.error].filter(Boolean)

      if (errors.length > 0) {
        errors.forEach(error => console.error(error))
        setLoadError('Unable to load invitations. Please try again later.')
      } else {
        setProducts(productResult.data || [])
        setCategories(categoryResult.data || [])
        setLoadError('')
      }

      setLoading(false)
    }

    refreshData()

    const channel = supabase
      .channel('customer-products-and-categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        refreshData
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        refreshData
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Product live updates failed: ${status}`)
        }
      })

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
  setSelectedCategory(categoryFromUrl || 'all')
}, [categoryFromUrl])

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

  
async function submitOrder(e) {
  e.preventDefault()

  if (cart.length === 0) {
    setOrderError('Your cart is empty.')
    return
  }

  setSubmitting(true)
  setOrderError('')

  const { data, error } = await supabase.rpc(
    'place_customer_order',
    {
      p_customer_name: customer.name,
      p_customer_phone: customer.phone,
      p_customer_email: customer.email || null,
      p_items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    }
  )

  setSubmitting(false)

  if (error) {
    console.error(error)
    setOrderError(error.message || 'Unable to submit your order.')
    return
  }

  setOrderResult(data)
  setCart([])
  setShowCheckout(false)
}


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
        ) : loadError ? (
          <p className="py-20 text-center text-red-600" role="alert">
            {loadError}
          </p>
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
              onClick={() => setShowCheckout(true)}
              className="mt-6 w-full rounded-full bg-rose-600 py-3 font-semibold text-white hover:bg-rose-700"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        
{orderResult ? (
  <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
    <div className="mb-4 text-5xl">🎉</div>

    <h2 className="text-2xl font-bold text-gray-800">
      Order Submitted Successfully!
    </h2>

    <p className="mt-3 text-gray-500">
      Thank you! Your order has been received.
    </p>

    <div className="my-6 rounded-xl bg-rose-50 p-5">
      <p className="text-sm text-gray-600">
        Your Tracking Number
      </p>

      <p className="mt-2 break-all text-2xl font-bold text-rose-600">
        {orderResult.order_number}
      </p>
    </div>

    <p className="font-semibold">
      Total: LKR {Number(orderResult.total_amount).toLocaleString()}
    </p>

    <p className="mt-2 text-sm text-gray-500">
      Status: {orderResult.status}
    </p>

    <button
      onClick={() => {
        setOrderResult(null)
        setCustomer({ name: '', phone: '', email: '' })
      }}
      className="mt-6 rounded-full bg-rose-600 px-7 py-3 text-white"
    >
      Continue Shopping
    </button>
  </div>
) : showCheckout ? (
  <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-7 shadow-lg">
    <h2 className="mb-2 text-2xl font-bold">
      Customer Details
    </h2>

    <p className="mb-6 text-sm text-gray-500">
      Enter your details to submit your order. No payment is required.
    </p>

    <form onSubmit={submitOrder} className="space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        required
        minLength={2}
        maxLength={100}
        value={customer.name}
        onChange={e => setCustomer({ ...customer, name: e.target.value })}
        className="w-full rounded-lg border p-3"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        required
        minLength={7}
        maxLength={20}
        value={customer.phone}
        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
        className="w-full rounded-lg border p-3"
      />

      <input
        type="email"
        placeholder="Email Address (Optional)"
        maxLength={254}
        value={customer.email}
        onChange={e => setCustomer({ ...customer, email: e.target.value })}
        className="w-full rounded-lg border p-3"
      />

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="font-semibold">
          Order Total: LKR {total.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          No online payment is required.
        </p>
      </div>

      {orderError && (
        <p className="text-sm text-red-600">{orderError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-rose-600 py-3 font-semibold text-white disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Order'}
      </button>

      <button
        type="button"
        onClick={() => setShowCheckout(false)}
        className="w-full rounded-full border py-3"
      >
        Back to Cart
      </button>
    </form>
  </div>
) : null}


      </div>
    </div>
  )
}
