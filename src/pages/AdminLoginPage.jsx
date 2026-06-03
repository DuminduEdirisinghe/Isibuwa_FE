/**
 * pages/AdminLoginPage.jsx
 * Admin login with email + password, JWT storage, error display.
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/admin/dashboard'
    }
  }, [isAuthenticated])

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block mb-6">
            <span className="text-3xl font-black gradient-text">ISIBUWA</span>
          </a>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/40 text-sm">Sign in to manage bookings</p>
        </div>

        {/* Login card */}
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              label="Email Address"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="admin@yourevent.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
              placeholder="••••••••"
            />

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
              id="admin-login-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            ← Back to event site
          </a>
        </div>
      </div>
    </div>
  )
}
