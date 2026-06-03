/**
 * pages/AdminDashboard.jsx
 * Protected admin dashboard with sidebar navigation, stats, and booking management.
 */

import { useState } from 'react'
import { useAuth }        from '../hooks/useAuth'
import { useBookings }    from '../hooks/useBookings'
import { useStats }       from '../hooks/useStats'
import { StatsCard }      from '../components/admin/StatsCard'
import { BookingTable }   from '../components/admin/BookingTable'
import { BookingModal }   from '../components/admin/BookingModal'
import { Button }         from '../components/ui/Button'

// ── Sidebar ──────────────────────────────────────────────────
function Sidebar({ activeView, setActiveView, admin, onLogout, isMobileOpen, onMobileClose }) {
  const navItems = [
    { id: 'stats',    label: 'Dashboard', icon: '📊' },
    { id: 'bookings', label: 'Bookings',  icon: '🎟️' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={[
        'fixed lg:static inset-y-0 left-0 z-40',
        'w-64 flex flex-col',
        'bg-dark-800 border-r border-white/5',
        'transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <a href="/" className="block">
            <p className="text-xl font-black gradient-text">ISIBUWA</p>
            <p className="text-xs text-white/30 mt-0.5">Admin Portal</p>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => { setActiveView(item.id); onMobileClose?.() }}
              className={[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                'transition-all duration-200 text-left',
                activeView === item.id
                  ? 'bg-primary-600/30 text-white border border-primary-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2">
            <div className="w-9 h-9 rounded-full bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400">
              {admin?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name}</p>
              <p className="text-xs text-white/30 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Stats View ───────────────────────────────────────────────
function StatsView() {
  const { stats, isLoading, refetch } = useStats()

  const cards = [
    { label: 'Total Bookings',     value: stats?.total,              icon: '🎟️',  colorClass: 'text-white',           bgClass: 'bg-white/10' },
    { label: 'Pending Review',     value: stats?.pending,            icon: '⏳',  colorClass: 'text-amber-400',        bgClass: 'bg-amber-500/20' },
    { label: 'Approved',           value: stats?.approved,           icon: '✅',  colorClass: 'text-emerald-400',      bgClass: 'bg-emerald-500/20' },
    { label: 'Rejected',           value: stats?.rejected,           icon: '❌',  colorClass: 'text-red-400',          bgClass: 'bg-red-500/20' },
    { label: 'Remaining Capacity', value: stats?.remaining_capacity, icon: '💺',  colorClass: 'text-primary-400',      bgClass: 'bg-primary-500/20' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Isibuwa Festival 2026 — Booking Overview</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            colorClass={card.colorClass}
            bgClass={card.bgClass}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Capacity visual bar */}
      {stats && !isLoading && (
        <div className="mt-8 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">Capacity Usage</h2>
            <span className="text-sm text-white/40">
              {stats.total - stats.rejected} / 150 filled
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-600 via-purple-500 to-accent-500 transition-all duration-700"
              style={{ width: `${Math.min(100, ((stats.total - stats.rejected) / 150) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-2">
            <span>0</span>
            <span>150</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bookings View ────────────────────────────────────────────
function BookingsView() {
  const [selectedBooking, setSelectedBooking] = useState(null)

  const {
    bookings, total, page, totalPages, limit,
    search, statusFilter, isLoading,
    setPage, setSearch, setStatusFilter,
    handleApprove, handleReject,
  } = useBookings()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-sm text-white/40 mt-1">Review and manage all event bookings</p>
      </div>

      <BookingTable
        bookings={bookings}
        isLoading={isLoading}
        onSelect={setSelectedBooking}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const { admin, logout, isAuthenticated, loading } = useAuth()
  const [activeView,    setActiveView]    = useState('stats')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show loading while auth state rehydrates
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated (also handled by ProtectedRoute in main.jsx)
  if (!isAuthenticated) {
    window.location.href = '/admin/login'
    return null
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        admin={admin}
        onLogout={logout}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-dark-800">
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold gradient-text">ISIBUWA Admin</span>
          <div className="w-9" /> {/* spacer */}
        </div>

        {/* Page content */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {activeView === 'stats'    && <StatsView />}
          {activeView === 'bookings' && <BookingsView />}
        </div>
      </main>
    </div>
  )
}
