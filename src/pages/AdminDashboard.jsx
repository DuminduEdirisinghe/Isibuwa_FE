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
        'bg-[var(--surface-2)] border-r border-[var(--surface-border)]',
        'transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[var(--surface-border)]">
          <a href="/" className="block">
            <p className="text-xl font-black gradient-text">ISIBUWA</p>
            <p className="text-xs text-[var(--ivory-muted)]/30 mt-0.5">Admin Portal</p>
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
                  ? 'bg-[rgba(201,146,42,0.15)] text-[var(--gold-bright)] border border-[var(--gold-primary)]/30'
                  : 'text-[var(--ivory-muted)]/50 hover:text-[var(--ivory)] hover:bg-[var(--surface-3)]',
              ].join(' ')}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4 border-t border-[var(--surface-border)]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2">
            <div className="w-9 h-9 rounded-full bg-[rgba(201,146,42,0.15)] border border-[var(--gold-primary)]/30 flex items-center justify-center text-sm font-bold text-[var(--gold-primary)]">
              {admin?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--ivory)] truncate">{admin?.name}</p>
              <p className="text-xs text-[var(--ivory-muted)]/30 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--ivory-muted)]/40 hover:text-[var(--ivory)] hover:bg-red-500/10 hover:text-red-400 transition-all"
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
    { label: 'Total Bookings',     value: stats?.total,              icon: '🎟️',  colorClass: 'text-[var(--ivory)]',           bgClass: 'bg-[var(--surface-3)]' },
    { label: 'Pending Review',     value: stats?.pending,            icon: '⏳',  colorClass: 'text-amber-400',        bgClass: 'bg-amber-500/20' },
    { label: 'Approved',           value: stats?.approved,           icon: '✅',  colorClass: 'text-emerald-400',      bgClass: 'bg-emerald-500/20' },
    { label: 'Rejected',           value: stats?.rejected,           icon: '❌',  colorClass: 'text-red-400',          bgClass: 'bg-red-500/20' },
    { label: 'Checked In',         value: stats?.checked_in,         icon: '🎫',  colorClass: 'text-cyan-400',         bgClass: 'bg-cyan-500/20' },
    { label: 'Remaining Capacity', value: stats?.remaining_capacity, icon: '💺',  colorClass: 'text-[var(--gold-primary)]',      bgClass: 'bg-[rgba(201,146,42,0.15)]' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ivory)]">Dashboard</h1>
          <p className="text-sm text-[var(--ivory-muted)]/40 mt-1">Isibuwa Festival 2026 — Booking Overview</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      {/* Capacity & District Distribution Grid */}
      {stats && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Capacity visual bar */}
          <div className="glass rounded-2xl p-6 flex flex-col justify-between">
            {(() => {
              const capacity = stats.capacity || 200
              const filled = stats.total - stats.rejected
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-[var(--ivory-muted)]">Capacity Usage</h2>
                    <span className="text-sm text-[var(--ivory-muted)]/40">
                      {filled} / {capacity} filled
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-3)] rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--gold-deep)] via-[var(--gold-primary)] to-[var(--gold-bright)] transition-all duration-700"
                      style={{ width: `${Math.min(100, (filled / capacity) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--ivory-muted)]/30 mt-2">
                    <span>0</span>
                    <span>{capacity}</span>
                  </div>
                </div>
              )
            })()}
            
            <div className="mt-6 p-4 rounded-xl bg-[var(--surface-3)]/40 border border-[var(--surface-border)]">
              <p className="text-xs text-[var(--ivory-muted)] leading-relaxed">
                🎟️ Remaining tickets: <strong className="text-[var(--gold-bright)]">{stats.remaining_capacity}</strong>. Approval rate is <strong className="text-emerald-400">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</strong> of total submissions. Checked in status represents ticket verification at the gate.
              </p>
            </div>
          </div>

          {/* District Distribution Bar Chart */}
          <div className="glass rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-[var(--ivory-muted)] mb-4">Bookings by District</h2>
            {stats.districts && stats.districts.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {(() => {
                  const maxCount = Math.max(...stats.districts.map(d => d.count), 1);
                  return stats.districts.map((d) => {
                    const percent = Math.round((d.count / maxCount) * 100);
                    const totalPercent = Math.round((d.count / stats.total) * 100);
                    return (
                      <div key={d.district} className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-[var(--ivory-muted)] group-hover:text-[var(--ivory)] transition-colors">
                            {d.district}
                          </span>
                          <span className="text-[var(--ivory-muted)]/50">
                            <strong className="text-[var(--ivory)]">{d.count}</strong> {d.count === 1 ? 'booking' : 'bookings'} ({totalPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[var(--surface-3)]/20 rounded-full h-2.5 overflow-hidden border border-[var(--surface-border)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold-primary)] transition-all duration-1000 group-hover:from-[var(--gold-primary)] group-hover:to-[var(--gold-bright)]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[var(--ivory-muted)]/30 text-xs">
                No district data available
              </div>
            )}
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
    handleApprove, handleReject, handleCheckin,
  } = useBookings()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ivory)]">Bookings</h1>
        <p className="text-sm text-[var(--ivory-muted)]/40 mt-1">Review and manage all event bookings</p>
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
          onCheckin={handleCheckin}
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
      <div className="min-h-screen bg-[var(--surface-1)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--ivory-muted)]/40 text-sm">Loading...</p>
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
    <div className="min-h-screen bg-[var(--surface-1)] flex">
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
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-[var(--surface-border)] bg-[var(--surface-2)]">
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--surface-3)] transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--ivory)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
