import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import ProductsPage from './pages/ProductsPage'
import TrackOrder from './pages/TrackOrder'
import WhatsAppButton from './components/WhatsAppButton'

import AdminLogin from './pages/AdminLogin'
import AdminCategories from './pages/AdminCategories'
import AdminDashboard, { DashboardOverview } from './pages/AdminDashboard'

import {
  Menu,
  X,
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

function HomePage() {

  const [language, setLanguage] = useState('EN')
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')

  useEffect(() => {
    let mounted = true

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_en, name_si, description_en, description_si, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (!mounted) return

      if (error) {
        setCategoriesError(`Unable to load categories: ${error.message}`)
        console.error('Failed to load customer categories:', error.message)
      } else {
        setCategories(data || [])
        setCategoriesError('')
      }

      setCategoriesLoading(false)
    }

    fetchCategories()

    const channel = supabase
      .channel('customer-categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        fetchCategories,
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Category live updates failed: ${status}`)
        }
      })

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const content = {
    EN: {
      home: 'Home',
      collections: 'Collections',
      about: 'About Us',
      contact: 'Contact',
      trackOrder: 'Track Your Order',
      shopNow: 'Shop Now',
      heroSmall: 'MAKE EVERY MOMENT SPECIAL',
      heroTitle: 'Beautiful Invitations,',
      heroTitle2: 'Unforgettable Moments.',
      heroDescription: 'Discover thoughtfully designed digital invitations for your most precious celebrations.',
      explore: 'Explore Collection',
      featured: 'OUR COLLECTION',
      featuredTitle: 'Invitations for Every Occasion',
      viewAll: 'View All',
      wedding: 'Wedding Invitations',
      birthday: 'Birthday Invitations',
      engagement: 'Engagement Invitations',
      corporate: 'Corporate Invitations',
      discover: 'A LITTLE MORE ABOUT US',
      discoverTitle: 'Every celebration deserves a beautiful beginning.',
      discoverText: 'At Aradhana Invitation, we believe every special moment deserves an invitation as unique as the occasion itself.',
      discoverButton: 'Explore the Collection',
    },
    SI: {
      home: 'මුල් පිටුව',
      collections: 'නිර්මාණ',
      about: 'අපි ගැන',
      contact: 'සම්බන්ධ වන්න',
      trackOrder: 'ඔබේ ඇණවුම පරීක්ෂා කරන්න',
      shopNow: 'නිර්මාණ මිලදී ගන්න',
      heroSmall: 'ඔබේ සෑම මොහොතක්ම විශේෂ කරගන්න',
      heroTitle: 'ලස්සන ආරාධනා,',
      heroTitle2: 'අමතක නොවන මතකයන්.',
      heroDescription: 'ඔබේ ජීවිතයේ වටිනාම අවස්ථාවන් සඳහා නිර්මාණය කළ අලංකාර ඩිජිටල් ආරාධනා.',
      explore: 'නිර්මාණ බලන්න',
      featured: 'අපගේ නිර්මාණ',
      featuredTitle: 'සෑම අවස්ථාවක් සඳහාම ආරාධනා',
      viewAll: 'සියල්ල බලන්න',
      wedding: 'මංගල ආරාධනා',
      birthday: 'උපන්දින ආරාධනා',
      engagement: 'විවාහ ගිවිසගැනීමේ ආරාධනා',
      corporate: 'ආයතනික ආරාධනා',
      discover: 'අපි ගැන තවත්',
      discoverTitle: 'සෑම සැමරුමකටම සුන්දර ආරම්භයක්.',
      discoverText: 'Aradhana Invitation තුළින් ඔබේ ජීවිතයේ විශේෂ අවස්ථාවන් සඳහා සුවිශේෂී ආරාධනා නිර්මාණය කරන්නෙමු.',
      discoverButton: 'අපගේ නිර්මාණ බලන්න',
    }
  }

  const t = content[language]

  return (
    <div className="storefront min-h-screen text-[#42332f]">

      {/* Announcement */}
      <div className="announcement-bar text-center text-white">
        CREATE BEAUTIFUL MEMORIES WITH ARADHANA
      </div>

      {/* Navbar */}
      <header className="store-header sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link to="/" className="store-brand flex items-center gap-3" aria-label="Aradhana Invitation home">
            <span className="store-brand-logo-frame">
              <img
                src="/logo.png"
                alt=""
                className="store-brand-logo"
              />
            </span>
            <span>
              <span className="store-brand-wordmark block font-serif font-bold text-[#76534b]">
                ARADHANA
              </span>
              <span className="store-brand-subtitle mt-1 block text-[10px] text-[#76534b]">
                INVITATION
              </span>
            </span>
          </Link>
          
<nav className="store-nav hidden items-center gap-7 md:flex">
  <a href="#" className="hover:text-[#a77b6e]">
    {t.home}
  </a>

  <a href="#collections" className="hover:text-[#a77b6e]">
    {t.collections}
  </a>

  <a href="#about" className="hover:text-[#a77b6e]">
    {t.about}
  </a>

  <a href="#contact" className="hover:text-[#a77b6e]">
    {t.contact}
  </a>

  <Link to="/products" className="hover:text-[#a77b6e]">
    {t.shopNow}
  </Link>

  <Link
    to="/track-order"
    className="track-link border border-[#76534b] transition hover:bg-[#76534b] hover:text-white"
  >
    {t.trackOrder}
  </Link>
</nav>


          <div className="store-header-actions flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'EN' ? 'SI' : 'EN')}
              className="language-toggle border border-[#76534b] text-xs tracking-wider hover:bg-[#76534b] hover:text-white"
            >
              {language === 'EN' ? 'සිංහල' : 'ENGLISH'}
            </button>

              <Link
                to="/products"
                className="store-bag-link hidden md:grid"
                aria-label="Browse invitation designs"
              >
                <ShoppingBag size={18} />
              </Link>

            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        
{menuOpen && (
  <nav className="store-mobile-nav flex flex-col gap-5 border-t p-6 md:hidden">
    <a href="#" onClick={() => setMenuOpen(false)}>
      {t.home}
    </a>

    <a href="#collections" onClick={() => setMenuOpen(false)}>
      {t.collections}
    </a>

    <a href="#about" onClick={() => setMenuOpen(false)}>
      {t.about}
    </a>

    <a href="#contact" onClick={() => setMenuOpen(false)}>
      {t.contact}
    </a>

    <Link
      to="/products"
      onClick={() => setMenuOpen(false)}
    >
      {t.shopNow}
    </Link>

    <Link
      to="/track-order"
      onClick={() => setMenuOpen(false)}
      className="font-semibold text-[#a77b6e]"
    >
      {t.trackOrder}
    </Link>
  </nav>
)}

      </header>

      {/* Hero Section */}
      <section className="store-hero relative flex min-h-[600px] items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800"
          alt="Elegant wedding invitation celebration"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div         className="store-hero-shade absolute inset-0" />

        <div className="store-hero-content relative mx-auto w-full px-8 py-24 text-white">
          <div className="max-w-2xl">
            <p className="store-hero-kicker mb-6">
              <Sparkles className="mr-2 inline" size={16} />
              {t.heroSmall}
            </p>

            <h2 className="store-hero-title">
              {t.heroTitle}
              <br />
              {t.heroTitle2}
            </h2>

            <p className="store-hero-description mt-7">
              {t.heroDescription}
            </p>

            
<div className="mt-9 flex flex-wrap gap-4">
  <Link
    to="/products"
    className="primary-store-button inline-flex items-center gap-3 text-sm tracking-wider"
  >
    {t.explore}
    <ArrowRight size={17} />
  </Link>

  <Link
    to="/track-order"
    className="secondary-store-button inline-flex items-center gap-3 border text-sm tracking-wider"
  >
    {t.trackOrder}
    <ShoppingBag size={17} />
  </Link>
</div>

          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="collections" className="collection-section mx-auto px-6 py-24">

        <div className="mb-12 text-center">
          <p className="section-kicker">
            {t.featured}
          </p>

          <h2 className="section-heading mt-4">
            {t.featuredTitle}
          </h2>

          <div className="mx-auto mt-5 h-px w-20 bg-[#b58b79]" />
        </div>

        {categoriesLoading ? (
          <p className="text-center text-[#786660]" role="status">
            Loading collections...
          </p>
        ) : categoriesError ? (
          <p className="text-center text-[#a33]" role="alert">
            {categoriesError}
          </p>
        ) : categories.length === 0 ? (
          <p className="text-center text-[#786660]">
            No collections are available right now.
          </p>
        ) : (
          <>
            <div className="collection-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const title = language === 'SI'
                  ? category.name_si || category.name_en
                  : category.name_en || category.name_si
                const description = language === 'SI'
                  ? category.description_si || category.description_en
                  : category.description_en || category.description_si

                return (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.id}`}
                        className="collection-card group block cursor-pointer"
                      >
                        
                        
                    <div className="collection-image">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={title}
                          className="h-[330px] w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-[330px] items-center justify-center px-6 text-center font-serif text-xl text-[#76534b]">
                          {title}
                        </div>
                      )}
                    </div>

                    <div className="collection-card-info flex items-center justify-between py-5">
                      <div>
                        <h3 className="font-serif text-xl">{title}</h3>
                        {description && (
                          <p className="mt-2 text-sm text-[#786660]">{description}</p>
                        )}
                      </div>
                      <ChevronRight className="shrink-0 text-[#a77b6e]" />
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/products"
              className="collection-cta inline-block border border-[#76534b] text-xs tracking-[2px] transition hover:bg-[#76534b] hover:text-white"
              >
            {t.viewAll}
            </Link>
            </div>
          </>
        )}
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">

          <div>
            <img
              src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1000"
              alt="Wedding invitation decoration"
              className="about-image w-full object-cover"
            />
          </div>

          <div>
            <p className="section-kicker">
              {t.discover}
            </p>

            <h2 className="about-heading mt-5">
              {t.discoverTitle}
            </h2>

            <p className="mt-6 leading-8 text-[#786660]">
              {t.discoverText}
            </p>

            <Link to="/products" className="mt-8 inline-flex items-center gap-3 border-b border-[#76534b] pb-2 text-sm">
              {t.discoverButton}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="store-footer px-6 py-14 text-center text-white">
        <Link to="/" className="store-footer-brand" aria-label="Aradhana Invitation home">
          <span className="store-footer-logo-frame">
            <img src="/logo.png" alt="Aradhana Invitation" className="store-footer-logo" />
          </span>
        </Link>

        <p className="mt-6 text-sm text-white/70">
          Beautiful Invitations for Your Special Moments.
        </p>

        <div className="mt-12 border-t border-white/20 pt-7 text-xs text-white/50">
          © {new Date().getFullYear()} Aradhana Invitation. All Rights Reserved.
        </div>
      </footer>

    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Login */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Secured admin dashboard and management sections */}
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route index element={<DashboardOverview />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route
          path="/admin/categories"
          element={<Navigate to="/admin/dashboard/categories" replace />}
        />
        <Route
          path="/admin/products"
          element={<Navigate to="/admin/dashboard/products" replace />}
        />
        <Route
          path="/admin/orders"
          element={<Navigate to="/admin/dashboard/orders" replace />}
        />

        <Route path="/track-order" element={<TrackOrder />} />

        <Route path="/products" element={<ProductsPage />} />

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <WhatsAppButton />
    </BrowserRouter>
  )
}

export default App
