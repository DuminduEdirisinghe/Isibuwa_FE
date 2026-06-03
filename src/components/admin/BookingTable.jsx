/**
 * components/admin/BookingTable.jsx
 * Paginated, searchable, filterable booking table for admin dashboard.
 */

import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

// ── Loading skeleton ─────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded skeleton" style={{ width: `${60 + (i * 11) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ── Empty state ──────────────────────────────────────────────
function EmptyState({ search, statusFilter }) {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
            {search || statusFilter ? '🔍' : '📋'}
          </div>
          <p className="text-white/50 font-medium">
            {search || statusFilter ? 'No bookings match your filters' : 'No bookings yet'}
          </p>
          {(search || statusFilter) && (
            <p className="text-white/30 text-sm">Try adjusting your search or filter</p>
          )}
        </div>
      </td>
    </tr>
  )
}

export function BookingTable({
  bookings,
  isLoading,
  onSelect,
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            id="booking-search"
            placeholder="Search by name, email, district or reference..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent transition-all"
          />
        </div>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/60 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* ── Total count ──────────────────────────────────────── */}
      <p className="text-sm text-white/40">
        {isLoading ? 'Loading...' : `${total} booking${total !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : bookings.length === 0 ? (
                <EmptyState search={search} statusFilter={statusFilter} />
              ) : (
                bookings.map((booking, idx) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => onSelect(booking)}
                  >
                    <td className="px-4 py-4 text-white/40 font-mono text-xs">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-4 py-4 font-medium text-white">
                      {booking.name}
                    </td>
                    <td className="px-4 py-4 text-white/60">
                      {booking.email}
                    </td>
                    <td className="px-4 py-4 text-white/60">
                      {booking.phone}
                    </td>
                    <td className="px-4 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-4 py-4 text-white/40 text-xs">
                      {new Date(booking.submitted_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        id={`view-booking-${booking.id}`}
                        onClick={(e) => { e.stopPropagation(); onSelect(booking) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-400 hover:bg-primary-500/20 transition-colors"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-white/40">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              ← Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
