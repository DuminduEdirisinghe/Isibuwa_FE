/**
 * components/admin/BookingTable.jsx
 * Paginated, searchable, filterable booking table for admin dashboard.
 */

import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

// ── Loading skeleton ─────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--surface-border)]">
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
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface-3)] flex items-center justify-center text-3xl">
            {search || statusFilter ? '🔍' : '📋'}
          </div>
          <p className="text-[var(--ivory-muted)]/50 font-medium">
            {search || statusFilter ? 'No bookings match your filters' : 'No bookings yet'}
          </p>
          {(search || statusFilter) && (
            <p className="text-[var(--ivory-muted)]/30 text-sm">Try adjusting your search or filter</p>
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
  onDeleteRequest,
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
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ivory-muted)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            id="booking-search"
            placeholder="Search by name, email, district or reference..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-3)] border border-[var(--surface-border)] text-[var(--ivory)] placeholder:[var(--ivory-muted)]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]/40 focus:border-transparent transition-all"
          />
        </div>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--surface-3)] border border-[var(--surface-border)] text-[var(--ivory)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]/40 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="" className="bg-[var(--surface-2)]">All Statuses</option>
          <option value="pending" className="bg-[var(--surface-2)]">Pending</option>
          <option value="approved" className="bg-[var(--surface-2)]">Approved</option>
          <option value="rejected" className="bg-[var(--surface-2)]">Rejected</option>
        </select>
      </div>

      {/* ── Total count ──────────────────────────────────────── */}
      <p className="text-sm text-[var(--ivory-muted)]/40">
        {isLoading ? 'Loading...' : `${total} booking${total !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--surface-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--surface-border)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ivory-muted)]/50 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : bookings.length === 0 ? (
                <EmptyState search={search} statusFilter={statusFilter} />
              ) : (
                bookings.map((booking, idx) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-[var(--surface-3)] transition-colors cursor-pointer group"
                    onClick={() => onSelect(booking)}
                  >
                    <td className="px-4 py-4 text-[var(--ivory-muted)]/40 font-mono text-xs">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-4 py-4 font-medium text-[var(--ivory)]">
                      {booking.name}
                    </td>
                    <td className="px-4 py-4 text-[var(--ivory-muted)]">
                      {booking.email}
                    </td>
                    <td className="px-4 py-4 text-[var(--ivory-muted)]">
                      {booking.phone}
                    </td>
                    <td className="px-4 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-4 py-4 text-[var(--ivory-muted)]/40 text-xs">
                      {new Date(booking.submitted_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4 flex items-center gap-2">
                      <button
                        id={`view-booking-${booking.id}`}
                        onClick={(e) => { e.stopPropagation(); onSelect(booking) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--gold-primary)] hover:bg-[rgba(201,146,42,0.15)] transition-colors"
                      >
                        View →
                      </button>
                      {(booking.signed_slip_url || booking.payment_slip_url) && (
                        <a
                          href={(() => {
                            const url = booking.signed_slip_url || booking.payment_slip_url
                            if (url && url.includes('/upload/')) {
                              const cleanName = `Payment_Slip_${(booking.name || 'Attendee').replace(/[^a-zA-Z0-9]/g, '_')}_${booking.id}`
                              return url.replace('/upload/', `/upload/fl_attachment:${cleanName}/`)
                            }
                            return url
                          })()}
                          download={`Payment_Slip_${booking.name}_${booking.id}`}
                          title="Download Payment Slip / Ticket PDF"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-[var(--ivory-muted)]/60 hover:text-[var(--gold-bright)] hover:bg-[rgba(201,146,42,0.15)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      )}
                      {onDeleteRequest && (
                        <button
                          id={`delete-booking-row-${booking.id}`}
                          title="Delete Booking (2-step confirmation)"
                          onClick={(e) => { e.stopPropagation(); onDeleteRequest(booking) }}
                          className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
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
          <p className="text-xs text-[var(--ivory-muted)]/40">
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
