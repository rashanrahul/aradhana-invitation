
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, KeyRound, Sparkles } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (loginError) throw loginError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin account required.')
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login min-h-screen flex items-center justify-center p-5">
      <div className="admin-login-card w-full max-w-md p-8 md:p-10">

        <div className="text-center mb-8">
          <div className="admin-login-mark"><Sparkles size={25} /></div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a77b6e]">
            Welcome back
          </p>
          <h1 className="admin-login-title text-3xl">
            Aradhana Invitation
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your studio workspace
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter admin email"
              className="w-full border p-3 focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter password"
              className="w-full border p-3 focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-submit w-full text-white disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <KeyRound size={17} />
              {loading ? 'Signing in...' : 'Sign in securely'}
            </span>
          </button>
        </form>

        <div className="mt-7 flex items-center justify-between border-t border-[#eee3dd] pt-5">
          <p className="text-xs text-gray-400">Authorized administrators only</p>
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-medium text-[#76534b] hover:text-[#a77b6e]">
            <ArrowLeft size={14} /> Storefront
          </Link>
        </div>
      </div>
    </div>
  )
}
