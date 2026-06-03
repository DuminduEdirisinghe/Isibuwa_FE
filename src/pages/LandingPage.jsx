/**
 * pages/LandingPage.jsx
 * Public-facing event landing page.
 * Sections: HeroSection → EventInfo → Artists → BookingForm
 */

import { useState, useEffect, useRef } from 'react'
import { HeroSection }  from '../components/landing/HeroSection'
import { EventInfo }    from '../components/landing/EventInfo'
import { Artists }      from '../components/landing/Artists'
import { BookingForm }  from '../components/booking/BookingForm'
import { getEvent }     from '../services/api'

export default function LandingPage() {
  const [event,     setEvent]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const bookingRef = useRef(null)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await getEvent()
        setEvent(response.data)
      } catch {
        // Use fallback data if API unavailable
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [])

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* ── Hero ───────────────────────────────────────────── */}
      <HeroSection event={event} onBookNow={scrollToBooking} />

      {/* ── Event info ─────────────────────────────────────── */}
      <EventInfo event={event} />

      {/* ── Artists lineup ─────────────────────────────────── */}
      <Artists event={event} />

      {/* ── Booking form ───────────────────────────────────── */}
      <section
        id="booking"
        ref={bookingRef}
        className="py-24 px-4 relative"
      >
        {/* Gradient background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/40 to-dark-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-400 text-sm font-semibold mb-4 tracking-wider uppercase">
              Secure Your Spot
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Book Your <span className="gradient-text">Ticket</span>
            </h2>
            <p className="text-white/50 leading-relaxed">
              Submit your booking with proof of payment. We'll review and send your ticket code by email.
            </p>
            {event?.remaining_capacity !== undefined && event.remaining_capacity <= 30 && (
              <p className="mt-4 text-accent-400 font-semibold animate-pulse-slow">
                🔥 Only {event.remaining_capacity} spots left — book now!
              </p>
            )}
          </div>

          {/* Form card */}
          <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-24 rounded skeleton mb-2" />
                    <div className="h-12 rounded-xl skeleton" />
                  </div>
                ))}
                <div className="h-14 rounded-xl skeleton mt-6" />
              </div>
            ) : (
              <BookingForm />
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <p className="text-2xl font-black gradient-text mb-2">ISIBUWA FESTIVAL 2026</p>
        <p className="text-white/30 text-sm">
          {event?.venue || 'Deraniyagala, Kegalle'} ·{' '}
          {event?.date
            ? new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'June 6, 2026'}
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <a href="/admin/login" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            Admin Portal
          </a>
        </div>
      </footer>
    </div>
  )
}
