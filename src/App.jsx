import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import ProductsPage from './pages/ProductsPage'

import AdminLogin from './pages/AdminLogin'
import AdminCategories from './pages/AdminCategories'

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
      discoverButton: 'Discover Our Story',
    },
    SI: {
      home: 'මුල් පිටුව',
      collections: 'නිර්මාණ',
      about: 'අපි ගැන',
      contact: 'සම්බන්ධ වන්න',
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
      discoverButton: 'අපි ගැන දැනගන්න',
    }
  }

  const t = content[language]

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#42332f]">

      {/* Announcement */}
      <div className="bg-[#76534b] py-2 text-center text-xs tracking-[2px] text-white">
        CREATE BEAUTIFUL MEMORIES WITH ARADHANA
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#eee3dd] bg-[#fffaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-serif font-bold tracking-[3px] text-[#76534b]">
              ARADHANA
            </h1>
            <p className="text-center text-[9px] tracking-[5px]">
              INVITATION
            </p>
          </div>

          <nav className="hidden items-center gap-9 md:flex">
            <a href="#" className="hover:text-[#a77b6e]">{t.home}</a>
            <a href="#collections" className="hover:text-[#a77b6e]">{t.collections}</a>
            <a href="#about" className="hover:text-[#a77b6e]">{t.about}</a>
            <a href="#contact" className="hover:text-[#a77b6e]">{t.contact}</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'EN' ? 'SI' : 'EN')}
              className="border border-[#76534b] px-3 py-2 text-xs tracking-wider hover:bg-[#76534b] hover:text-white"
            >
              {language === 'EN' ? 'සිංහල' : 'ENGLISH'}
            </button>

            <button className="hidden md:block">
              <ShoppingBag size={20} />
            </button>

            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-5 border-t p-6 md:hidden">
            <a href="#">{t.home}</a>
            <a href="#collections">{t.collections}</a>
            <a href="#about">{t.about}</a>
            <a href="#contact">{t.contact}</a>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800"
          alt="Elegant wedding invitation celebration"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative mx-auto w-full max-w-7xl px-8 py-24 text-white">
          <div className="max-w-2xl">
            <p className="mb-6 text-sm tracking-[4px]">
              <Sparkles className="mr-2 inline" size={16} />
              {t.heroSmall}
            </p>

            <h2 className="font-serif text-5xl leading-tight md:text-7xl">
              {t.heroTitle}
              <br />
              {t.heroTitle2}
            </h2>

            <p className="mt-7 max-w-lg text-lg leading-8 text-white/85">
              {t.heroDescription}
            </p>

            <a
              href="#collections"
              className="mt-9 inline-flex items-center gap-3 bg-[#b58b79] px-8 py-4 text-sm tracking-wider transition hover:bg-white hover:text-[#76534b]"
            >
              {t.explore}
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="collections" className="mx-auto max-w-7xl px-6 py-24">

        <div className="mb-12 text-center">
          <p className="text-xs tracking-[4px] text-[#a77b6e]">
            {t.featured}
          </p>

          <h2 className="mt-4 font-serif text-3xl md:text-5xl">
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
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const title = language === 'SI'
                  ? category.name_si || category.name_en
                  : category.name_en || category.name_si
                const description = language === 'SI'
                  ? category.description_si || category.description_en
                  : category.description_en || category.description_si

                return (
                  <div key={category.id} className="group cursor-pointer">
                    <div className="overflow-hidden bg-[#eee3dd]">
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

                    <div className="flex items-center justify-between py-5">
                      <div>
                        <h3 className="font-serif text-xl">{title}</h3>
                        {description && (
                          <p className="mt-2 text-sm text-[#786660]">{description}</p>
                        )}
                      </div>
                      <ChevronRight className="shrink-0 text-[#a77b6e]" />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <button className="border border-[#76534b] px-10 py-4 text-xs tracking-[2px] transition hover:bg-[#76534b] hover:text-white">
                {t.viewAll}
              </button>
            </div>
          </>
        )}
      </section>

      {/* About */}
      <section id="about" className="bg-[#f2e8e2]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">

          <div>
            <img
              src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1000"
              alt="Wedding invitation decoration"
              className="h-[450px] w-full object-cover"
            />
          </div>

          <div>
            <p className="text-xs tracking-[4px] text-[#a77b6e]">
              {t.discover}
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
              {t.discoverTitle}
            </h2>

            <p className="mt-6 leading-8 text-[#786660]">
              {t.discoverText}
            </p>

            <button className="mt-8 flex items-center gap-3 border-b border-[#76534b] pb-2 text-sm">
              {t.discoverButton}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#493832] px-6 py-14 text-center text-white">
        <h2 className="font-serif text-3xl tracking-[4px]">ARADHANA</h2>
        <p className="mt-2 text-xs tracking-[5px]">INVITATION</p>

        <p className="mt-7 text-sm text-white/70">
          Beautiful Invitations for Your Special Moments.
        </p>

        <div className="mt-8 flex justify-center gap-6">
        </div>

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

        {/* Admin Category Management */}
        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />

        {/* Admin Product Management */}
        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route path="/products" element={<ProductsPage />} />
        
        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
