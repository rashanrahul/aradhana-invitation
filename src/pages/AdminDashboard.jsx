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
    <section>
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
            className="rounded-xl border border-[#eee3dd] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

      <div className="mt-8 rounded-xl border border-[#eee3dd] bg-white p-6">
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
  const [access, setAccess] = useState('checking')
  const [signOutError, setSignOutError] = useState('')

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
    <div className="min-h-screen bg-[#f8f5f2] md:flex">
      <aside className="bg-[#493832] p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <Link to="/admin/dashboard" className="block">
          <span className="font-serif text-xl tracking-[0.18em]">ARADHANA</span>
          <span className="mt-1 block text-[10px] tracking-[0.35em] text-white/70">ADMIN DASHBOARD</span>
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
          className="mt-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white md:mt-10"
        >
          <LogOut size={18} />
          Sign out
        </button>
        {signOutError && (
          <p className="mt-2 px-4 text-xs text-red-200" role="alert">{signOutError}</p>
        )}
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export { DashboardOverview }
