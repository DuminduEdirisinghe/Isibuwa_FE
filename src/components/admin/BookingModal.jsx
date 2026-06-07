/**
 * components/admin/BookingModal.jsx
 * Full booking detail modal with approve/reject/checkin actions and confirmation dialogs.
 */

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { getBooking } from '../../services/api'

export function BookingModal({ booking: initialBooking, isOpen, onClose, onApprove, onReject, onCheckin }) {
  const [booking,        setBooking]        = useState(initialBooking)
  const [isLoading,      setIsLoading]      = useState(false)
  const [confirmAction,  setConfirmAction]  = useState(null) // 'approve' | 'reject' | 'checkin' | null
  const [actionLoading,  setActionLoading]  = useState(false)
  const [actionError,    setActionError]    = useState(null)

  // Fetch full booking details (with signed URL) when modal opens
  const fetchDetail = useCallback(async () => {
    if (!initialBooking?.id || !isOpen) return
    setIsLoading(true)
    try {
      const response = await getBooking(initialBooking.id)
      setBooking(response.data)
    } catch {
      // Keep initial data on error
    } finally {
      setIsLoading(false)
    }
  }, [initialBooking?.id, isOpen])

  useEffect(() => {
    fetchDetail()
    setConfirmAction(null)
    setActionError(null)
  }, [fetchDetail])

  if (!booking) return null

  const handleApprove = async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      await onApprove(booking.id)
      onClose()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to approve booking')
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      await onReject(booking.id)
      onClose()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to reject booking')
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleCheckin = async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      await onCheckin(booking.id)
      // Update local state so UI reflects check-in immediately
      setBooking(prev => ({ ...prev, checked_in_at: new Date().toISOString() }))
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to check in')
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const slipUrl = booking.signed_slip_url || booking.payment_slip_url
  const isPdf = slipUrl?.toLowerCase().includes('.pdf') ||
                slipUrl?.includes('/raw/upload/') ||
                booking.payment_slip_url?.toLowerCase().includes('/raw/upload/') ||
                booking.payment_slip_url?.toLowerCase().endsWith('.pdf')

  const isCheckedIn = !!booking.checked_in_at

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Booking #${booking.id}`} size="md">
      <div className="flex flex-col gap-6">

        {/* ── Status badge ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge status={booking.status} />
            {isCheckedIn && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Checked In
              </span>
            )}
          </div>
          <span className="text-xs text-white/30">
            Submitted {new Date(booking.submitted_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>

        {/* ── Attendee details ─────────────────────────────── */}
        <div className="glass rounded-xl p-5 grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name',  value: booking.name },
            { label: 'Email',      value: booking.email },
            { label: 'Phone',      value: booking.phone },
            { label: 'District',   value: booking.district || 'N/A' },
            { label: 'Payment Ref', value: booking.payment_reference || 'N/A' },
            booking.reviewed_at ? {
              label: 'Reviewed',
              value: new Date(booking.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            } : null,
            booking.checked_in_at ? {
              label: 'Checked In At',
              value: new Date(booking.checked_in_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
              }),
            } : null,
          ].filter(Boolean).map((field) => (
            <div key={field.label}>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{field.label}</p>
              <p className="text-white font-medium break-all">{field.value}</p>
            </div>
          ))}
        </div>

        {/* ── Ticket code (if approved) ─────────────────────── */}
        {booking.status === 'approved' && booking.ticket_code && (
          <div className={`rounded-xl border p-5 text-center ${
            isCheckedIn
              ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/40'
              : 'bg-gradient-to-r from-primary-600/30 to-purple-600/30 border-primary-500/40'
          }`}>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Ticket Code</p>
            <p className="text-2xl font-black tracking-widest text-white font-mono">
              {booking.ticket_code}
            </p>
            {booking.issued_at && (
              <p className="text-xs text-white/30 mt-2">
                Issued {new Date(booking.issued_at).toLocaleDateString()}
              </p>
            )}
            {isCheckedIn && (
              <p className="text-xs text-emerald-400 mt-2 font-semibold">
                ✓ Checked in at {new Date(booking.checked_in_at).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
        )}

        {/* ── Check-In button (only for approved, not yet checked in) ─── */}
        {booking.status === 'approved' && booking.ticket_code && !isCheckedIn && (
          <>
            {confirmAction === 'checkin' ? (
              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <p className="text-white/80 text-sm text-center font-medium">
                  🎫 Confirm check-in for <strong>{booking.name}</strong>?<br/>
                  <span className="text-white/50">This action cannot be undone.</span>
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmAction(null)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1"
                    loading={actionLoading}
                    onClick={handleCheckin}
                    id={`confirm-checkin-${booking.id}`}
                  >
                    ✓ Yes, Check In
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="success"
                size="md"
                className="w-full"
                onClick={() => setConfirmAction('checkin')}
                id={`checkin-btn-${booking.id}`}
              >
                🎫 Check In at Gate
              </Button>
            )}
          </>
        )}

        {/* ── Already checked in indicator ──────────────────── */}
        {booking.status === 'approved' && isCheckedIn && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">Already Checked In</p>
              <p className="text-xs text-white/40">
                {new Date(booking.checked_in_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}

        {/* ── Payment slip ─────────────────────────────────── */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Payment Slip</p>
          {isLoading ? (
            <div className="h-32 rounded-xl skeleton" />
          ) : slipUrl ? (
            isPdf ? (
              <a
                href={slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                id={`slip-link-${booking.id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                    View Payment Slip (PDF)
                  </p>
                  <p className="text-xs text-white/30">Opens in new tab · Valid for 1 hour</p>
                </div>
                <svg className="w-4 h-4 text-white/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <a
                href={slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                id={`slip-img-${booking.id}`}
                className="block rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/40 transition-colors group"
              >
                <img
                  src={slipUrl}
                  alt="Payment slip"
                  className="w-full max-h-64 object-contain bg-black/20 group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{ display: 'none' }} className="h-32 items-center justify-center text-white/40 text-sm">
                  Failed to load image · <a href={slipUrl} className="text-primary-400 underline ml-1">Open link</a>
                </div>
              </a>
            )
          ) : (
            <p className="text-white/30 text-sm">No payment slip available</p>
          )}
        </div>

        {/* ── Error ────────────────────────────────────────── */}
        {actionError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {actionError}
          </div>
        )}

        {/* ── Actions (only for pending) ────────────────────── */}
        {booking.status === 'pending' && (
          <>
            {confirmAction && confirmAction !== 'checkin' ? (
              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <p className="text-white/80 text-sm text-center font-medium">
                  {confirmAction === 'approve'
                    ? '✅ Confirm approval? A ticket code will be generated and emailed to the attendee.'
                    : '❌ Confirm rejection? The attendee will be notified by email.'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmAction(null)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={confirmAction === 'approve' ? 'success' : 'danger'}
                    size="sm"
                    className="flex-1"
                    loading={actionLoading}
                    onClick={confirmAction === 'approve' ? handleApprove : handleReject}
                    id={`confirm-${confirmAction}-${booking.id}`}
                  >
                    {confirmAction === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                  </Button>
                </div>
              </div>
            ) : !confirmAction ? (
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  size="md"
                  className="flex-1"
                  onClick={() => setConfirmAction('reject')}
                  id={`reject-btn-${booking.id}`}
                >
                  ✕ Reject
                </Button>
                <Button
                  variant="success"
                  size="md"
                  className="flex-1"
                  onClick={() => setConfirmAction('approve')}
                  id={`approve-btn-${booking.id}`}
                >
                  ✓ Approve
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  )
}
