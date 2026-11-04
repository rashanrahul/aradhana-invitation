import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import BrandFooter from '../components/BrandFooter'
import {
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  Eye,
  X,
  MessageCircle,
  ArrowUpRight,
  Search,
} from 'lucide-react'


export default function ProductsPage() {
const [products, setProducts] = useState([])
const [categories, setCategories] = useState([])
const [cart, setCart] = useState([])
const [searchQuery, setSearchQuery] = useState('')
const [loading, setLoading] = useState(true)
const [loadError, setLoadError] = useState('')

const [searchParams, setSearchParams] = useSearchParams()
const categoryFromUrl = searchParams.get('category')
const [selectedProduct, setSelectedProduct] = useState(null)
const selectedCategory = categoryFromUrl || 'all'
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

  function selectCategory(categoryId) {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (categoryId === 'all') {
      nextSearchParams.delete('category')
    } else {
      nextSearchParams.set('category', categoryId)
    }

    setSearchParams(nextSearchParams)
  }

  function closePreview() {
    setSelectedProduct(null)
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

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredProducts =
    products.filter(product => {
      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory
      const matchesSearch =
        !normalizedQuery ||
        [product.name_en, product.name_si, product.description_en, product.description_si]
          .filter(Boolean)
          .some(value => value.toLocaleLowerCase().includes(normalizedQuery))

      return matchesCategory && matchesSearch
    })

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

const contactAboutProduct = (product) => {
  const phone = '94707937390'

  const message = `Hello Aradhana Invitation!

I am interested in this product:

Product: ${product.name_en}
Price: LKR ${Number(product.price).toLocaleString()}

Please provide more details.`

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  window.open(url, '_blank')
}


  return (
    <div className="catalog-page min-h-screen">
      <div className="mx-auto max-w-7xl px-5">

        <div className="catalog-topbar">
          <Link to="/" className="catalog-brand" aria-label="Aradhana Invitation home">
            <span className="catalog-brand-logo-frame">
              <img src="/logo.png" alt="" className="catalog-brand-logo" />
            </span>
            <span className="catalog-brand-wordmark">
              <strong>ARADHANA</strong>
              <small>INVITATION</small>
            </span>
          </Link>
          <div className="catalog-topbar-links">
            <Link to="/" className="catalog-topbar-link">Home</Link>
            <Link to="/track-order" className="catalog-topbar-link">
              Track an order <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#a77b6e]">
            Thoughtfully made for your moments
          </p>
          <h1 className="catalog-heading">
            Our Invitations
          </h1>
          <p className="mt-3 text-gray-500">
            Choose your favourite invitation designs
          </p>
        </div>

        <div className="catalog-tools mb-8">
          <label className="catalog-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search invitations..."
              aria-label="Search invitations"
            />
          </label>

          <div className="catalog-category-filters flex flex-wrap justify-center gap-3">
          <button
            onClick={() => selectCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            className={`catalog-filter rounded-full px-5 py-2.5 ${
              selectedCategory === 'all' ? 'is-selected' : ''
            }`}
          >
            All
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => selectCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
              className={`catalog-filter rounded-full px-5 py-2.5 ${
                selectedCategory === category.id ? 'is-selected' : ''
              }`}
            >
              {category.name_en}
            </button>
          ))}
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => document.getElementById('shopping-cart')?.scrollIntoView({ behavior: 'smooth' })}
            disabled={cartCount === 0}
            className="catalog-cart-shortcut flex items-center gap-2 rounded-full border border-[#eadfd8] bg-[#fffdfa] px-5 py-3 shadow-sm disabled:cursor-not-allowed disabled:opacity-65"
          >
            <ShoppingCart />
            <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          </button>
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
            {searchQuery || selectedCategory !== 'all'
              ? 'No invitations match those filters. Try another search or category.'
              : 'No products available yet.'}
          </p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="catalog-product-card"
              >
                <img
                  src={product.image_url || 'https://placehold.co/600x400?text=Invitation'}
                  alt={product.name_en}
                  className="catalog-product-image h-64 w-full object-cover"
                />

                <div className="catalog-product-details p-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {product.name_en}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description_en}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
  <span className="catalog-price text-xl font-bold">
    LKR {Number(product.price).toLocaleString()}
  </span>

  <div className="flex items-center gap-2">
    {product.video_url && (
      <button
        onClick={() => setSelectedProduct(product)}
        className="flex items-center gap-2 rounded-full border border-[#76534b] px-4 py-2 text-sm font-medium text-[#76534b] transition hover:bg-[#76534b] hover:text-white"
      >
        <Eye size={17} />
        Preview
      </button>
    )}

    <button
      onClick={() => addToCart(product)}
      className="catalog-action flex items-center gap-2 px-4 py-2"
    >
      <Plus size={17} />
      Add
    </button>
    <button
  onClick={() => contactAboutProduct(product)}
  className="flex items-center justify-center gap-2 rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
>
  <MessageCircle size={18} />
  WhatsApp Inquiry
</button>
  </div>
</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(
          <div id="shopping-cart" className="catalog-cart mt-12">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
              <ShoppingCart />
              Your Cart
            </h2>

            {cart.length === 0 ? (
              <div className="catalog-empty-cart">
                <p>Your cart is waiting for something lovely.</p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-4 text-sm font-semibold text-[#76534b] underline underline-offset-4"
                >
                  Browse invitations
                </button>
              </div>
            ) : cart.map(item => (
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

            {cart.length > 0 && (
              <>
                <div className="mt-6 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>LKR {total.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="catalog-action mt-6 w-full py-3"
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}

        
{orderResult ? (
  <div className="tracking-card mx-auto mt-10 max-w-xl text-center shadow-lg">
    <div className="mb-4 text-5xl">🎉</div>

    <h2 className="text-2xl font-bold text-gray-800">
      Order Submitted Successfully!
    </h2>

    <p className="mt-3 text-gray-500">
      Thank you! Your order has been received.
    </p>

    <div className="my-6 rounded-xl bg-[#f7ede8] p-5">
      <p className="text-sm text-gray-600">
        Your Tracking Number
      </p>

      <p className="mt-2 break-all text-2xl font-bold text-[#76534b]">
        {orderResult.order_number}
      </p>
    </div>

    <p className="font-semibold">
      Total: LKR {Number(orderResult.total_amount).toLocaleString()}
    </p>

    <p className="mt-2 text-sm text-gray-500">
      Status: {orderResult.status}
    </p>

    
<a
  href={`https://wa.me/94707937390?text=${encodeURIComponent(
    `Hello Aradhana Invitation!

I have successfully placed an order.

My Tracking Number: ${orderResult.order_number}

Customer Name: ${customer.name}
Total: LKR ${Number(orderResult.total_amount).toLocaleString()}

Please provide me with more details about my order.`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600"
>
  <MessageCircle size={20} />
  Contact Us on WhatsApp
</a>


    <button
      onClick={() => {
        setOrderResult(null)
        setCustomer({ name: '', phone: '', email: '' })
      }}
      className="catalog-action mt-6 px-7 py-3"
    >
      Continue Shopping
    </button>
  </div>
) : showCheckout ? (
  <div className="tracking-card mx-auto mt-10 max-w-xl shadow-lg">
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
        <p className="text-sm text-red-600" role="alert">{orderError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="catalog-action w-full py-3 disabled:opacity-50"
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

    {selectedProduct && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
    onClick={closePreview}
  >
    <div
      className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedProduct.name_en}
        </h2>

        <button
          onClick={closePreview}
          className="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
          aria-label="Close video preview"
        >
          <X size={22} />
        </button>
      </div>

      <video
        key={selectedProduct.id}
        src={selectedProduct.video_url}
        autoPlay
        playsInline
        controls
        preload="auto"
        onEnded={closePreview}
        className="max-h-[75vh] w-full rounded-xl bg-black"
      />
    </div>
  </div>
)}

      </div>
      <BrandFooter />
    </div>
  )
}
