import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Tags,
  Package,
  ClipboardList,
  Store,
  LogOut,
  LoaderCircle,
} from 'lucide-react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const navigation = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/dashboard/categories', label: 'Categories', icon: Tags },
  { to: '/admin/dashboard/products', label: 'Products', icon: Package },
  { to: '/admin/dashboard/orders', label: 'Orders', icon: ClipboardList },
]

function DashboardOverview() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCounts() {
      const results = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ])

      if (!mounted) return

      const failedResult = results.find((result) => result.error)
      if (failedResult) {
        setError(`Unable to load dashboard summary: ${failedResult.error.message}`)
      } else {
        setCounts(results.map((result) => result.count ?? 0))
      }
    }

    loadCounts()
    return () => {
      mounted = false
    }
  }, [])

  const cards = [
    { label: 'Categories', count: counts?.[0], to: '/admin/dashboard/categories', icon: Tags },
    { label: 'Products', count: counts?.[1], to: '/admin/dashboard/products', icon: Package },
    { label: 'Orders', count: counts?.[2], to: '/admin/dashboard/orders', icon: ClipboardList },
  ]

  return (
    <section className="admin-overview">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a77b6e]">
          Aradhana Invitation
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#42332f]">Dashboard Overview</h1>
        <p className="mt-2 text-gray-500">Manage your store from one place.</p>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(({ label, count, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="admin-overview-card"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">{label}</span>
              <Icon className="text-[#a77b6e]" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-[#42332f]">
              {count ?? (error ? '—' : '...')}
            </p>
            <span className="mt-3 inline-block text-sm text-[#76534b]">Manage {label.toLowerCase()} →</span>
          </Link>
        ))}
      </div>

      <div className="admin-overview-panel mt-8">
        <h2 className="text-lg font-semibold text-[#42332f]">Storefront connection</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Active categories and products are shown on the customer website. Order updates
          are managed here and are available through customer order tracking.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#76534b] px-4 py-2.5 text-sm text-white hover:bg-[#60433d]"
        >
          <Store size={17} />
          View customer website
        </Link>
      </div>
    </section>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [access, setAccess] = useState('checking')
  const [signOutError, setSignOutError] = useState('')
  const currentSection = navigation.find(({ to, end }) =>
    end ? location.pathname === to : location.pathname.startsWith(to)
  )?.label || 'Dashboard'

  useEffect(() => {
    let mounted = true

    async function verifyAdmin() {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (!mounted) return
      if (authError || !user) {
        setAccess('unauthenticated')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!mounted) return

      if (profileError || profile?.role !== 'admin') {
        setAccess('forbidden')
        return
      }

      setAccess('admin')
    }

    verifyAdmin()
    return () => {
      mounted = false
    }
  }, [])

  async function handleSignOut() {
    setSignOutError('')
    const { error } = await supabase.auth.signOut()

    if (error) {
      setSignOutError(error.message)
      return
    }

    navigate('/admin', { replace: true })
  }

  if (access === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        <LoaderCircle className="mr-3 animate-spin" />
        Verifying administrator access...
      </div>
    )
  }

  if (access === 'unauthenticated') return <Navigate to="/admin" replace />
  if (access === 'forbidden') return <Navigate to="/" replace />

  return (
    <div className="admin-shell min-h-screen md:flex">
      <aside className="admin-sidebar p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <Link to="/admin/dashboard" className="admin-brand" aria-label="Aradhana Invitation admin dashboard">
          <span className="admin-brand-logo-frame">
            <img src="/logo.png" alt="" className="admin-brand-logo" />
          </span>
          <span className="admin-brand-caption">STUDIO ADMIN</span>
        </Link>

        <nav className="mt-8 flex gap-2 overflow-x-auto md:flex-col" aria-label="Admin dashboard">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="admin-signout mt-6 flex items-center gap-3 px-4 py-3 text-sm text-white/75 md:mt-10"
        >
          <LogOut size={18} />
          Sign out
        </button>
        {signOutError && (
          <p className="mt-2 px-4 text-xs text-red-200" role="alert">{signOutError}</p>
        )}
      </aside>

      <main className="admin-main min-w-0 flex-1">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-eyebrow">Workspace / {currentSection}</p>
            <h1 className="admin-topbar-title">{currentSection}</h1>
          </div>
          <Link to="/" className="admin-topbar-link" aria-label="View customer storefront">
            <Store size={17} />
            <span>View store</span>
          </Link>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

export { DashboardOverview }
