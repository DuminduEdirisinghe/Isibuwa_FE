/**
 * components/admin/BookingModal.jsx
 * Full booking detail modal with approve/reject/checkin actions and confirmation dialogs.
 */

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { getBooking } from '../../services/api'

export function BookingModal({ booking: initialBooking, isOpen, onClose, onApprove, onReject, onCheckin, onDelete, initialConfirmAction = null }) {
  const [booking,        setBooking]        = useState(initialBooking)
  const [isLoading,      setIsLoading]      = useState(false)
  const [confirmAction,  setConfirmAction]  = useState(initialConfirmAction) // 'approve' | 'reject' | 'checkin' | 'delete_step1' | 'delete_step2' | null
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
    setConfirmAction(initialConfirmAction)
    setActionError(null)
  }, [fetchDetail, initialConfirmAction])

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

  const handleDelete = async () => {
    if (!onDelete) return
    setActionLoading(true)
    setActionError(null)
    try {
      await onDelete(booking.id)
      onClose()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to delete booking')
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
          <span className="text-xs text-[var(--ivory-muted)]/30">
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
              <p className="text-xs text-[var(--ivory-muted)]/40 uppercase tracking-wider mb-1">{field.label}</p>
              <p className="text-[var(--ivory)] font-medium break-all">{field.value}</p>
            </div>
          ))}
        </div>

        {/* ── Ticket code (if approved) ─────────────────────── */}
        {booking.status === 'approved' && booking.ticket_code && (
          <div className={`rounded-xl border p-5 text-center ${
            isCheckedIn
              ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/40'
              : 'bg-gradient-to-r from-[rgba(166,113,24,0.15)] to-[rgba(201,146,42,0.15)] border-[var(--gold-primary)]/30'
          }`}>
            <p className="text-xs text-[var(--ivory-muted)]/50 uppercase tracking-widest mb-2">Ticket Code</p>
            <p className="text-2xl font-black tracking-widest text-[var(--ivory)] font-mono">
              {booking.ticket_code}
            </p>
            {booking.issued_at && (
              <p className="text-xs text-[var(--ivory-muted)]/30 mt-2">
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
          {(() => {
            const getDownloadUrl = (url, name, isPdfFile) => {
              if (!url) return '#'
              if (url.includes('/upload/')) {
                const ext = isPdfFile ? '.pdf' : ''
                const cleanName = `Payment_Slip_${(name || 'Attendee').replace(/[^a-zA-Z0-9]/g, '_')}_${booking.id}${ext}`
                return url.replace('/upload/', `/upload/fl_attachment:${cleanName}/`)
              }
              return url
            }

            const downloadUrl = slipUrl ? getDownloadUrl(slipUrl, booking.name, isPdf) : '#'

            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[var(--ivory-muted)]/40 uppercase tracking-wider">Payment Slip / Attachment</p>
                  {slipUrl && (
                    <a
                      href={downloadUrl}
                      download={`Payment_Slip_${(booking.name || 'Booking').replace(/[^a-zA-Z0-9]/g, '_')}_${booking.id}${isPdf ? '.pdf' : '.jpg'}`}
                      id={`slip-download-top-${booking.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--gold-primary)]/15 border border-[var(--gold-primary)]/30 hover:bg-[var(--gold-primary)]/25 text-xs font-semibold text-[var(--gold-bright)] transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download File</span>
                    </a>
                  )}
                </div>

                {isLoading ? (
                  <div className="h-32 rounded-xl skeleton" />
                ) : slipUrl ? (
                  isPdf ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={slipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`slip-link-${booking.id}`}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--surface-3)] border border-[var(--surface-border)] hover:bg-[var(--surface-3)]/80 text-xs font-semibold text-[var(--ivory)] hover:text-[var(--gold-primary)] transition-all group"
                        >
                          <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span>Open PDF in New Tab ↗</span>
                        </a>

                        <a
                          href={downloadUrl}
                          download={`Payment_Slip_${(booking.name || 'Booking').replace(/[^a-zA-Z0-9]/g, '_')}_${booking.id}.pdf`}
                          id={`slip-download-btn-${booking.id}`}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--gold-primary)]/20 border border-[var(--gold-primary)]/40 hover:bg-[var(--gold-primary)]/30 text-xs font-semibold text-[var(--gold-bright)] transition-all"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download PDF File</span>
                        </a>
                      </div>

                      {/* Embedded PDF Viewer */}
                      <div className="w-full h-80 rounded-xl overflow-hidden border border-[var(--surface-border)] bg-black/40 relative">
                        <iframe
                          src={slipUrl}
                          title={`Payment slip PDF for ${booking.name}`}
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <a
                        href={slipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`slip-img-${booking.id}`}
                        className="block rounded-xl overflow-hidden border border-[var(--surface-border)] hover:border-[var(--gold-primary)]/40 transition-colors group relative"
                      >
                        <img
                          src={slipUrl}
                          alt="Payment slip"
                          className="w-full max-h-64 object-contain bg-black/20 group-hover:scale-[1.01] transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div style={{ display: 'none' }} className="h-32 items-center justify-center text-[var(--ivory-muted)]/40 text-sm">
                          Failed to load image · <a href={slipUrl} className="text-[var(--gold-primary)] underline ml-1">Open link</a>
                        </div>
                      </a>
                      <div className="flex justify-end">
                        <a
                          href={downloadUrl}
                          download={`Payment_Slip_${(booking.name || 'Booking').replace(/[^a-zA-Z0-9]/g, '_')}_${booking.id}.jpg`}
                          className="inline-flex items-center gap-1.5 text-xs text-[var(--gold-primary)] hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Image File
                        </a>
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-[var(--ivory-muted)]/30 text-sm">No payment slip available</p>
                )}
              </>
            )
          })()}
        </div>

        {/* ── Error ────────────────────────────────────────── */}
        {actionError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {actionError}
          </div>
        )}

        {/* ── Confirm Delete Step 1 ─────────────────────────── */}
        {confirmAction === 'delete_step1' && (
          <div className="glass rounded-xl p-4 flex flex-col gap-3 border border-amber-500/40 bg-amber-500/10">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <span>⚠️ Delete Confirmation — Step 1 of 2</span>
            </div>
            <p className="text-[var(--ivory)] text-sm leading-relaxed">
              Are you sure you want to delete the booking for <strong className="text-white">{booking.name}</strong> ({booking.email})?
              <br/>
              <span className="text-[var(--ivory-muted)]/60 text-xs">This will remove their record and any issued ticket from the database.</span>
            </p>
            <div className="flex gap-3 pt-1">
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
                variant="danger"
                size="sm"
                className="flex-1 font-semibold"
                onClick={() => setConfirmAction('delete_step2')}
                id={`delete-step1-proceed-${booking.id}`}
              >
                Proceed to Final Confirmation →
              </Button>
            </div>
          </div>
        )}

        {/* ── Confirm Delete Step 2 (Final Confirmation) ────── */}
        {confirmAction === 'delete_step2' && (
          <div className="glass rounded-xl p-4 flex flex-col gap-3 border-2 border-red-500 bg-red-950/40 shadow-lg shadow-red-500/10">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
              <span>🚨 FINAL CONFIRMATION — Step 2 of 2</span>
            </div>
            <p className="text-red-200 text-sm font-medium leading-relaxed">
              Are you ABSOLUTELY sure you want to PERMANENTLY delete booking #{booking.id} for <strong className="text-white underline">{booking.name}</strong>?
              <br/>
              <span className="text-red-400/90 text-xs font-normal">This action is permanent and CANNOT be undone!</span>
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-[var(--ivory-muted)]"
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
              >
                Cancel & Keep Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
                loading={actionLoading}
                onClick={handleDelete}
                id={`confirm-delete-final-${booking.id}`}
              >
                🔥 Yes, Permanently Delete
              </Button>
            </div>
          </div>
        )}

        {/* ── Actions (for pending bookings) ────────────────── */}
        {booking.status === 'pending' && (!confirmAction || confirmAction === 'approve' || confirmAction === 'reject') && (
          <>
            {confirmAction && confirmAction !== 'checkin' ? (
              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <p className="text-[var(--ivory)]/80 text-sm text-center font-medium">
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

        {/* ── Delete Option Button (Available for all statuses) ── */}
        {onDelete && !confirmAction && (
          <div className="pt-2 border-t border-[var(--surface-border)] flex justify-end">
            <button
              id={`delete-booking-btn-${booking.id}`}
              onClick={() => setConfirmAction('delete_step1')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Booking
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
