/**
 * pages/LandingPage.jsx
 * Redesigned public-facing event landing page and booking system.
 * Style Direction: Tactile Luxury — deep dark surfaces, warm amber/gold accents,
 * cinematic full-screen hero with intentional content spread across the entire viewport.
 *
 * KEY CHANGE: Hero is now a true full-screen composition.
 * - Sasnaka logo: top-left corner, anchored
 * - Gate Pass card: top-right corner, anchored  
 * - Isimbuwa artwork: dead center, large and dominant
 * - Availability badge + description + CTAs: bottom-left
 * - All four corners used intentionally — nothing crammed, nothing wasted
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getEvent, submitBooking } from '../services/api'

// Local Assets
import artist1 from '../assets/Artisit1.jpeg'
import artist2 from '../assets/Artisit2.jpeg'
import artist3 from '../assets/Artisit3.jpeg'
import artist4 from '../assets/Artisit4.jpeg'
import artist5 from '../assets/Artisit5.jpg'
import artist6 from '../assets/Artisit6.jpg'
import artist8 from '../assets/Artisit8.jpg'
import artist9 from '../assets/Artisit9.jpg'
import artist10 from '../assets/Artisit10.jpg'
import artist11 from '../assets/Artisit11.jpg'
import artist12 from '../assets/Artisit12.jpg'
import moderator from '../assets/Moderor.jpg'
import reviewer1 from '../assets/Reviewer1.jpg'
import reviewer2 from '../assets/Reviewer2.jpg'
import reviewer3 from '../assets/Reviewer3.jpg'
import reviewer4 from '../assets/Reviewer4.jpg'
import reviewer5 from '../assets/Reviewer5.jpg'
import reviewer6 from '../assets/Reviewer6.jpg'
import reviewer7 from '../assets/Reviewer7.jpg'
import heroBg from '../assets/hero-bg.jpeg'
import isibuwaLogo from '../assets/Isibuwa_logo.png'
import sasnakaLogo from '../assets/Sasnaka_logo.png'

const artistImages = {
  'Artisit1.jpeg': artist1,
  'Artisit2.jpeg': artist2,
  'Artisit3.jpeg': artist3,
  'Artisit4.jpeg': artist4,
  'Artisit5.jpg': artist5,
  'Artisit6.jpg': artist6,
  'Artisit8.jpg': artist8,
  'Artisit9.jpg': artist9,
  'Artisit10.jpg': artist10,
  'Artisit11.jpg': artist11,
  'Artisit12.jpg': artist12,
  'Moderor.jpg': moderator,
  'Reviewer1.jpg': reviewer1,
  'Reviewer2.jpg': reviewer2,
  'Reviewer3.jpg': reviewer3,
  'Reviewer4.jpg': reviewer4,
  'Reviewer5.jpg': reviewer5,
  'Reviewer6.jpg': reviewer6,
  'Reviewer7.jpg': reviewer7,
}


const INSTRUMENTALISTS_LIST = [
  {
    name: 'Malshan Ranawella',
    genre: 'Violinist',
    image: 'Artisit11.jpg',
    district: 'Kegalle'
  },
  {
    name: 'Punsarani Anodya',
    genre: 'Violinist',
    image: 'Artisit1.jpeg',
    district: 'Colombo'
  },
  {
    name: 'Methnal Liyanage',
    genre: 'Flutist',
    image: 'Artisit2.jpeg',
    district: 'Galle'
  },
  {
    name: 'Ravindu Dileepa',
    genre: 'Lead Guitarist',
    image: 'Artisit3.jpeg',
    district: 'Rathnapura'
  },
  {
    name: 'Rasindu Karunathilaka',
    genre: 'Lead Guitarist',
    image: 'Artisit4.jpeg',
    district: 'Rathnapura'
  },
  {
    name: 'Minhaj Ali',
    genre: 'Keyboards',
    image: 'Artisit10.jpg',
    district: 'Colombo'
  },
  {
    name: 'Nimsara Nimesh',
    genre: 'Percussionist',
    image: 'Artisit12.jpg',
    district: 'Colombo'
  }
]

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Phone must be at least 7 characters').max(20),
  district: z.string().min(2, 'District must be at least 2 characters').max(50),
  payment_reference: z.string().min(3, 'Payment reference must be at least 3 characters').max(50),
})

export default function LandingPage() {
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [bookingStatus, setBookingStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [bookingId, setBookingId] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const bookingRef = useRef(null)
  const fileInputRef = useRef(null)
  // No carousel auto-scroll refs needed (single-copy display)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema)
  })

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await getEvent()
        setEvent(response.data)
      } catch {
        // Fallback info if API is offline
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])



  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.section-fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── File Upload Handlers ─────────────────────────────────────
  const validateFile = (f) => {
    const accepted = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!accepted.includes(f.type)) return 'Only JPEG, PNG, and PDF files are accepted'
    if (f.size > 5 * 1024 * 1024) return 'File size must not exceed 5MB'
    return null
  }

  const handleFileChange = useCallback((f) => {
    const err = validateFile(f)
    if (err) { setFileError(err); setFile(null) }
    else { setFileError(null); setFile(f) }
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileChange(dropped)
  }

  const handleFormSubmit = async (data) => {
    if (!file) { setFileError('Payment slip is required'); return }
    setFileError(null)
    setBookingStatus('loading')
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('district', data.district)
      formData.append('payment_reference', data.payment_reference)
      formData.append('payment_slip', file)
      const response = await submitBooking(formData)
      setBookingId(response.data.bookingId)
      setBookingStatus('success')
      reset()
      setFile(null)
    } catch (err) {
      const statusCode = err.response?.status
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      if (statusCode === 409) setBookingStatus('full')
      else { setBookingStatus('error'); setErrorMsg(msg) }
    }
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Saturday, July 25, 2026'

  const formattedTime = event?.date
    ? new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '06:00 PM'

  const remaining = event?.remaining_capacity ?? 150

  const getAvailabilityBadge = (rem) => {
    if (rem === 0) return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] font-semibold border border-slate-500/30 bg-slate-500/10 text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
        Sold Out
      </span>
    )
    if (rem <= 30) return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] font-semibold border border-orange-500/30 bg-orange-500/10 text-orange-400">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
        Few Left — {rem} spots
      </span>
    )
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] font-semibold border border-[var(--gold-primary)] bg-[rgba(201,146,42,0.12)] text-[var(--gold-bright)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-bright)] animate-pulse flex-shrink-0" />
        Available
      </span>
    )
  }

  return (
    <div className="min-h-screen selection:bg-[var(--gold-primary)] selection:text-[var(--surface-1)]">

      {/* ── Navigation ───────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b border-[var(--surface-border)] bg-[var(--surface-2)]/95 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-[0_4px_24px_rgba(201,146,42,0.08)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-xl font-bold tracking-[0.15em] text-[var(--gold-bright)] hover:opacity-80 transition-opacity">
            ISIMBUWA
          </a>
          <div className="hidden md:flex items-center gap-5 text-[10px] tracking-[0.08em] text-[var(--ivory-muted)]/60 font-mono">
            <span>6.9231° N, 80.3475° E</span>
            <span className="w-px h-3 bg-[var(--surface-border)]" />
            <span>KEGALLE, SRI LANKA</span>
            <span className="w-px h-3 bg-[var(--surface-border)]" />
            <span>JULY 25, 2026</span>
          </div>
          <button
            onClick={scrollToBooking}
            className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] border border-[var(--gold-primary)] text-[var(--gold-bright)] bg-transparent hover:bg-[var(--gold-primary)] hover:text-[var(--surface-1)] active:scale-[0.97] transition-all duration-200"
          >
            Get Ticket
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — Full screen cinematic composition
          
          Layout uses absolute positioning for a true "poster" 
          layout where every zone of the screen is used:
          
          ┌─────────────────────────────────────────────────────┐
          │ [SASNAKA LOGO — top left]    [GATE PASS — top right]│
          │                                                     │
          │              [ISIMBUWA ARTWORK — center]             │
          │                                                     │
          │ [BADGE]                                             │
          │ [DESCRIPTION]                      [SCROLL HINT]   │
          │ [BUTTONS]                                           │
          └─────────────────────────────────────────────────────┘
      ══════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[100svh] overflow-hidden bg-[var(--surface-1)] border-b border-[var(--surface-border)]">

        {/* ── Background image — full cover, slightly blurred ── */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})`, filter: 'blur(3px)', transform: 'scale(1.04)' }}
        />

        {/* ── Vignette overlays — cinematic depth ── */}
        {/* Bottom fade to surface (for content legibility) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-1)] via-[var(--surface-1)]/20 to-transparent" />
        {/* Left fade (for description text legibility) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-1)]/80 via-transparent to-transparent" />
        {/* Right fade (for gate pass card legibility) */}
        <div className="absolute inset-0 bg-gradient-to-l from-[var(--surface-1)]/70 via-transparent to-transparent" />
        {/* Top fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-1)]/60 via-transparent to-transparent" />

        {/* ── Ambient gold glow at center ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--gold-primary)]/8 rounded-full blur-[100px] pointer-events-none" />

        {/* ── MOBILE layout (< lg): stacked vertical ── */}
        <div className="lg:hidden flex flex-col min-h-[100svh] pt-16 pb-10 px-5 relative z-10">
          {/* Mobile poster card */}
          <div className="relative w-full rounded-none overflow-hidden border border-[var(--surface-border)] bg-black/30 mb-6 flex-shrink-0">
            <img src={heroBg} alt="" className="w-full h-auto object-cover opacity-50 blur-sm scale-105 select-none pointer-events-none" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <img src={sasnakaLogo} alt="Sasnaka Sansada Foundation" className="h-10 w-auto object-contain opacity-90" />
              <img src={isibuwaLogo} alt="Isimbuwa '26" className="w-[90%] max-w-[360px] sm:max-w-[420px] h-auto object-contain drop-shadow-[0_0_40px_rgba(201,146,42,0.4)]" />
            </div>
          </div>
          {/* Mobile content */}
          <div className="flex flex-col gap-4">
            {getAvailabilityBadge(remaining)}
            <p className="text-[var(--ivory-muted)] text-sm leading-[1.85] font-light max-w-md">
              Isimbuwa Festival returns for its 2026 edition in the serene wilderness of Deraniyagala. Experience an evening dedicated to authentic musical artistry, bringing together classical melodies, vocal performances, and deep instrumental fusion under the stars.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={scrollToBooking}
                className="w-full sm:w-auto px-8 py-4 text-[11px] font-bold uppercase tracking-[0.14em] bg-[var(--gold-primary)] hover:bg-[var(--gold-bright)] text-[var(--surface-1)] active:scale-[0.98] transition-all"
              >
                Secure Ticket
              </button>
              <button
                onClick={() => document.getElementById('lineup')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 text-[11px] font-bold uppercase tracking-[0.14em] border border-[var(--surface-border)] hover:border-[var(--gold-deep)] text-[var(--ivory-muted)] hover:text-[var(--ivory)] active:scale-[0.98] transition-all"
              >
                Lineup
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            DESKTOP layout (>= lg): absolute positioned poster
            All four corners + center used intentionally
        ════════════════════════════════════════════════════ */}
        <div className="hidden lg:block absolute inset-0 z-10">

          {/* ┌── TOP-LEFT: Sasnaka Sansada organiser mark ───── */}
          <div className="absolute top-0 left-0 pt-24 pl-10 xl:pl-16">
            <img
              src={sasnakaLogo}
              alt="Presented by Sasnaka Sansada Foundation"
              className="h-16 xl:h-20 w-auto object-contain opacity-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* ┌── TOP-RIGHT: Gate Pass card ─────────────────── */}
          <div className="absolute top-0 right-0 pt-24 pr-10 xl:pr-16">
            <div className="w-72 xl:w-80 bg-[var(--surface-3)]/85 backdrop-blur-lg border border-[var(--surface-border)] hover:border-[var(--gold-primary)]/40 transition-all duration-300 relative overflow-hidden group">
              {/* Corner marks */}
              <span className="absolute top-0 left-0 w-3 h-[1px] bg-[var(--gold-primary)]" />
              <span className="absolute top-0 left-0 w-[1px] h-3 bg-[var(--gold-primary)]" />
              <span className="absolute bottom-0 right-0 w-3 h-[1px] bg-[var(--gold-primary)]" />
              <span className="absolute bottom-0 right-0 w-[1px] h-3 bg-[var(--gold-primary)]" />
              {/* Perforation strip */}
              <div className="absolute left-0 top-0 bottom-0 w-7 flex flex-col justify-evenly items-center border-r border-dashed border-[var(--surface-border)]">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-[var(--surface-1)] border border-[var(--surface-border)]" />
                ))}
              </div>
              {/* Card content */}
              <div className="pl-10 pr-5 py-5">
                <div className="flex justify-between items-start border-b border-[var(--surface-border)] pb-4 mb-4">
                  <div>
                    <p className="text-[9px] tracking-[0.12em] text-[var(--ivory-muted)]/50 font-mono uppercase mb-1">Gate Pass</p>
                    <h3 className="font-display text-base font-medium text-[var(--ivory)] leading-tight">Isimbuwa Festival '26</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] tracking-[0.12em] text-[var(--ivory-muted)]/50 font-mono uppercase mb-1">Price</p>
                    <p className="text-lg font-bold text-[var(--gold-bright)]">LKR 500</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] tracking-[0.12em] text-[var(--gold-deep)] font-mono uppercase mb-1">Schedule</p>
                    <p className="text-xs text-[var(--ivory-muted)] font-mono">{formattedDate}</p>
                    <p className="text-[10px] text-[var(--ivory-muted)]/50 font-mono mt-0.5">Doors open at {formattedTime}</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.12em] text-[var(--gold-deep)] font-mono uppercase mb-1">Venue</p>
                    <p className="text-xs text-[var(--ivory-muted)] font-mono">{event?.venue || 'Deraniyagala, Kegalle'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ┌── CENTER: Isimbuwa artwork — dominant and large ─ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={isibuwaLogo}
              alt="Isimbuwa '26"
              className="w-[55vw] xl:w-[50vw] max-w-[850px] h-auto object-contain
                         drop-shadow-[0_0_80px_rgba(201,146,42,0.35)]
                         drop-shadow-[0_0_160px_rgba(201,146,42,0.15)]"
            />
          </div>

          {/* ┌── BOTTOM-LEFT: Badge + description + CTAs ────── */}
          <div className="absolute bottom-0 left-0 pb-12 pl-10 xl:pl-16 max-w-md xl:max-w-lg">
            <div className="mb-5">
              {getAvailabilityBadge(remaining)}
            </div>
            <p
              className="text-[var(--ivory-muted)] text-sm xl:text-[15px] leading-[1.9] font-light mb-8"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.8)' }}
            >
              Isimbuwa Festival returns for its 2026 edition in the serene wilderness of Deraniyagala. Experience an evening dedicated to authentic musical artistry, bringing together classical melodies, vocal performances, and deep instrumental fusion under the stars.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToBooking}
                className="px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] bg-[var(--gold-primary)] hover:bg-[var(--gold-bright)] text-[var(--surface-1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Secure Ticket
              </button>
              <button
                onClick={() => document.getElementById('lineup')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] border border-[var(--surface-border)] hover:border-[var(--gold-deep)] text-[var(--ivory-muted)] hover:text-[var(--ivory)] active:scale-[0.98] transition-all duration-200"
              >
                Lineup
              </button>
            </div>
          </div>

          {/* ┌── BOTTOM-RIGHT: Scroll hint ─────────────────── */}
          <div className="absolute bottom-0 right-0 pb-12 pr-10 xl:pr-16 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[0.16em] text-[var(--ivory-muted)]/30 font-mono uppercase" style={{ writingMode: 'vertical-rl' }}>
              SCROLL
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-[var(--gold-primary)]/30 to-transparent" />
          </div>

        </div>
        {/* end desktop absolute layer */}

      </section>
      {/* ── End Hero ─────────────────────────────────────────── */}



      {/* ── Booking / Registration Section ──────────────────── */}
      <section id="booking" ref={bookingRef} className="section-fade py-24 px-6 md:px-12 relative bg-[var(--surface-1)]">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--gold-primary)]/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">

          {/* Left column: instructions + order summary */}
          <div className="lg:col-span-5 text-left text-[var(--ivory-muted)]">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--gold-primary)] font-semibold font-mono mb-2">Registration Gate</p>
            <h2 className="font-display text-4xl font-light italic text-[var(--gold-bright)] mb-6">
              Claim Your Passage
            </h2>
            <p className="text-sm font-light leading-relaxed mb-5">
              To complete your entry registration, please follow the steps below:
            </p>

            {/* Styled step list */}
            <div className="space-y-4 mb-6">
              {[
                ['Transfer the ticket fee of ', 'LKR 500.00', ' to the bank account specified.'],
                ['Note down the transaction Reference ID.', '', ''],
                ['Save the digital transfer receipt (JPEG, PNG, or PDF).', '', ''],
                ['Fill out the form and upload your payment proof.', '', ''],
              ].map(([pre, bold, post], i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-6 h-6 border border-[var(--gold-deep)] text-[var(--gold-primary)] text-[10px] font-mono font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-[var(--ivory-muted)]/65 leading-relaxed">
                    {pre}{bold && <strong className="text-[var(--ivory)] font-semibold">{bold}</strong>}{post}
                  </p>
                </div>
              ))}
            </div>

            {/* Notice */}
            <div className="mb-6 flex gap-3 items-start">
              <span className="text-red-500/90 text-sm leading-none mt-[2px]">•</span>
              <p className="text-[13px] text-red-500/90 leading-relaxed">
                Tickets will be issued strictly to sasnaka sansada members whose names have been registered on the district lists. We will not be responsible for any tickets purchased by individuals whose names are not included in the respective district lists.
              </p>
            </div>

            {/* Payment Details Card */}
            <div className="mt-5 mb-5 bg-[var(--surface-3)] border border-[var(--gold-primary)]/25 relative overflow-hidden">
              {/* Top accent bar */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--gold-primary)]/50 to-transparent" />
              <div className="p-5">
                <p className="text-[9px] tracking-[0.14em] text-[var(--gold-primary)] font-mono uppercase pb-3 mb-3 border-b border-[var(--surface-border)] flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Bank Transfer Details
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[var(--ivory-muted)]/50 flex-shrink-0">Account Name</span>
                    <span className="text-[var(--ivory)] font-semibold text-right">Sasnaka Sansada</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[var(--ivory-muted)]/50 flex-shrink-0">Account No.</span>
                    <span className="text-[var(--gold-bright)] font-bold font-mono tracking-wider text-right">8020003825</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[var(--ivory-muted)]/50 flex-shrink-0">Bank</span>
                    <span className="text-[var(--ivory)] text-right">Commercial Bank PLC</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[var(--ivory-muted)]/50 flex-shrink-0">Branch</span>
                    <span className="text-[var(--ivory)] text-right">City Office</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--ivory-muted)]/35 leading-relaxed">
              * Our administration team will verify the payment reference within 48 hours and issue your unique check-in code directly to your email.
            </p>

            {/* Order Summary */}
            <div className="mt-8 bg-[var(--surface-3)] border border-[var(--surface-border)] relative overflow-hidden">
              {/* Top accent bar */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--gold-primary)]/40 to-transparent" />
              <div className="p-5">
                <p className="text-[9px] tracking-[0.14em] text-[var(--ivory-muted)]/35 font-mono uppercase pb-3 mb-3 border-b border-[var(--surface-border)]">
                  Order Summary
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--ivory-muted)]/55">1× Festival Entry Pass (General)</span>
                    <span className="text-[var(--ivory-muted)] font-medium tabular-nums">LKR 500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ivory-muted)]/55">Processing Fee</span>
                    <span className="text-[var(--gold-bright)] font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-dashed border-[var(--surface-border)] pt-3 flex justify-between text-sm">
                    <span className="text-[var(--ivory)] font-medium">Total Amount Due</span>
                    <span className="text-[var(--gold-bright)] font-bold tabular-nums">LKR 500.00</span>
                  </div>
                </div>
                {/* Decorative barcode */}
                <div className="mt-5 pt-4 border-t border-[var(--surface-border)] flex gap-[2px] items-end opacity-25 pointer-events-none" aria-hidden="true">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: `${5 + Math.sin(i * 1.7) * 4}px`, width: '2px' }}
                      className={i % 3 === 0 ? 'bg-[var(--gold-primary)]' : 'bg-[var(--surface-border)]'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: form */}
          <div className="lg:col-span-7 bg-[var(--surface-2)] border border-[var(--surface-border)] relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-primary)]/50 to-transparent" />

            <div className="p-7 xl:p-9 pt-8">
              {isLoading ? (
                <div className="space-y-6">
                  <div className="h-5 w-32 bg-[var(--surface-3)] animate-pulse rounded-sm" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-24 bg-[var(--surface-3)] animate-pulse rounded-sm" />
                      <div className="h-11 bg-[var(--surface-3)] animate-pulse rounded-sm" />
                    </div>
                  ))}
                </div>

              ) : bookingStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-3xl font-light text-[var(--ivory)] mb-2">Registration Staged</h3>
                  <p className="text-[var(--ivory-muted)]/60 text-xs mb-8 max-w-xs mx-auto leading-relaxed">
                    Your payment receipt has been queued for verification. Check your email within 24 hours.
                  </p>
                  <div className="max-w-xs mx-auto bg-[var(--surface-1)] border border-[var(--surface-border)] p-6 text-left font-mono text-xs"
                    style={{ animation: 'stamp 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}>
                    <div className="border-b border-[var(--surface-border)] pb-4 mb-4 text-center">
                      <p className="text-sm font-semibold tracking-[0.16em] text-[var(--ivory)] font-display uppercase">ISIMBUWA PASS</p>
                      <p className="text-[9px] text-[var(--ivory-muted)]/25 mt-1">№ REC-2026-{bookingId}</p>
                    </div>
                    <div className="space-y-2 text-[var(--ivory-muted)]/60 mb-5">
                      <div className="flex justify-between"><span>status</span><span className="text-[var(--gold-primary)] font-semibold uppercase">Pending</span></div>
                      <div className="flex justify-between"><span>booking id</span><span className="text-[var(--ivory)]">{bookingId}</span></div>
                      <div className="flex justify-between"><span>pass tier</span><span className="text-[var(--ivory)]">General Pass</span></div>
                    </div>
                    <div className="border-t-2 border-dashed border-[var(--surface-border)] pt-4 text-[10px] text-[var(--ivory-muted)]/30 leading-relaxed space-y-1">
                      <p className="text-center font-semibold text-[var(--ivory-muted)]/40 mb-2 uppercase tracking-widest">Next Steps</p>
                      <p>1. Admins verify the payment transaction code.</p>
                      <p>2. Your ticket will be emailed once approved.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingStatus('idle')}
                    className="mt-8 px-6 py-3 text-[11px] uppercase tracking-[0.12em] border border-[var(--surface-border)] hover:border-[var(--gold-deep)] bg-transparent hover:bg-[var(--surface-3)] text-[var(--ivory-muted)] hover:text-[var(--ivory)] active:scale-[0.98] transition-all"
                  >
                    Submit Another Slip
                  </button>
                </div>

              ) : bookingStatus === 'full' ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-3xl font-light text-[var(--ivory)] mb-3">Gate Closed</h3>
                  <p className="text-[var(--ivory-muted)]/35 text-xs leading-relaxed max-w-xs mx-auto">
                    All 150 available entry slots for Isimbuwa Festival 2026 have been filled. Stay tuned for future editions.
                  </p>
                </div>

              ) : (
                <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-5">

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--ivory-muted)]/70 font-medium">
                      Full Name <span className="text-[var(--gold-primary)]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Binura Senevirathna"
                      className="w-full bg-[var(--surface-3)] border border-[var(--surface-border)] px-4 py-3 text-sm text-[var(--ivory)] placeholder-[var(--ivory-muted)]/25 focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[rgba(201,146,42,0.15)] transition-all"
                    />
                    {errors.name && <p className="text-[11px] text-red-400 flex items-center gap-1.5"><span>⚠</span>{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--ivory-muted)]/70 font-medium">
                      Email Address <span className="text-[var(--gold-primary)]">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="you@example.com"
                      className="w-full bg-[var(--surface-3)] border border-[var(--surface-border)] px-4 py-3 text-sm text-[var(--ivory)] placeholder-[var(--ivory-muted)]/25 focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[rgba(201,146,42,0.15)] transition-all"
                    />
                    {errors.email && <p className="text-[11px] text-red-400 flex items-center gap-1.5"><span>⚠</span>{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--ivory-muted)]/70 font-medium">
                      Phone Number <span className="text-[var(--gold-primary)]">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="+94 77 123 4567"
                      className="w-full bg-[var(--surface-3)] border border-[var(--surface-border)] px-4 py-3 text-sm text-[var(--ivory)] placeholder-[var(--ivory-muted)]/25 focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[rgba(201,146,42,0.15)] transition-all"
                    />
                    {errors.phone && <p className="text-[11px] text-red-400 flex items-center gap-1.5"><span>⚠</span>{errors.phone.message}</p>}
                  </div>

                  {/* District */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--ivory-muted)]/70 font-medium">
                      District <span className="text-[var(--gold-primary)]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register('district')}
                        className="w-full bg-[var(--surface-3)] border border-[var(--surface-border)] px-4 py-3 text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[rgba(201,146,42,0.15)] transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[var(--surface-3)] text-[var(--ivory-muted)]/40">Select your district</option>
                        {SRI_LANKAN_DISTRICTS.map(d => (
                          <option key={d} value={d} className="bg-[var(--surface-3)] text-[var(--ivory)]">{d}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--gold-primary)]">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                    {errors.district && <p className="text-[11px] text-red-400 flex items-center gap-1.5"><span>⚠</span>{errors.district.message}</p>}
                  </div>

                  {/* Payment Reference */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--ivory-muted)]/70 font-medium">
                      Payment Reference Number <span className="text-[var(--gold-primary)]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('payment_reference')}
                      placeholder="e.g. TXN1029384"
                      className="w-full bg-[var(--surface-3)] border border-[var(--surface-border)] px-4 py-3 text-sm text-[var(--ivory)] placeholder-[var(--ivory-muted)]/25 focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[rgba(201,146,42,0.15)] transition-all"
                    />
                    {errors.payment_reference && <p className="text-[11px] text-red-400 flex items-center gap-1.5"><span>⚠</span>{errors.payment_reference.message}</p>}
                  </div>

                  {/* File Upload */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--ivory-muted)]/70 font-medium">
                      Payment Slip Receipt <span className="text-[var(--gold-primary)]">*</span>
                      <span className="ml-1.5 text-[var(--ivory-muted)]/30 lowercase normal-case">(jpeg, png, pdf · max 5mb)</span>
                    </label>
                    <div
                      onDragEnter={e => { e.preventDefault(); setDragActive(true) }}
                      onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
                      onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={[
                        'border border-dashed p-6 cursor-pointer flex flex-col items-center justify-center gap-2.5 transition-all min-h-[100px]',
                        dragActive ? 'border-[var(--gold-primary)] bg-[rgba(201,146,42,0.07)]'
                          : file ? 'border-emerald-500/40 bg-emerald-500/5'
                            : fileError ? 'border-red-500/35 bg-red-500/5'
                              : 'border-[var(--gold-deep)]/60 bg-[var(--surface-3)] hover:border-[var(--gold-primary)]/60'
                      ].join(' ')}
                    >
                      <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => { const f = e.target.files[0]; if (f) handleFileChange(f) }}
                        className="hidden"
                      />
                      {file ? (
                        <div className="text-center">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-xs font-semibold text-emerald-400">Receipt Attached</p>
                          <p className="text-[10px] text-[var(--ivory-muted)]/35 mt-0.5 max-w-[200px] truncate">{file.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-9 h-9 rounded-full bg-[var(--surface-3)] border border-[var(--surface-border)] flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-[var(--gold-primary)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-xs text-[var(--ivory-muted)]/70">
                            <span className="text-[var(--gold-primary)] font-semibold">Upload document</span> or drag files
                          </p>
                        </div>
                      )}
                    </div>
                    {fileError && <p className="text-[11px] text-red-400 flex items-center gap-1.5" role="alert"><span>⚠</span>{fileError}</p>}
                  </div>

                  {bookingStatus === 'error' && (
                    <div className="p-4 bg-red-500/8 border border-red-500/20 text-red-400 text-xs">{errorMsg}</div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingStatus === 'loading'}
                    className="w-full mt-2 py-4 text-[11px] font-bold uppercase tracking-[0.14em] bg-[var(--gold-primary)] hover:bg-[var(--gold-bright)] hover:scale-[1.005] text-[var(--surface-1)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  >
                    {bookingStatus === 'loading' ? (
                      <>
                        <span className="w-3 h-3 border border-[var(--surface-1)]/60 border-t-[var(--surface-1)] rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : 'Register Pass'}
                  </button>


                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Artists Lineup Section ────────────────────────────── */}
      <section id="lineup" className="section-fade py-24 px-6 md:px-12 border-b border-[var(--surface-border)] bg-[var(--surface-2)]">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-2 border-[var(--gold-primary)] pl-5 mb-16">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--gold-primary)] font-semibold font-mono mb-2">Featured Performers</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light italic text-[var(--gold-bright)]">
              The Artistry Lineup
            </h2>
          </div>

          {/* ── Moderator Sub-section ── */}
          <div className="mb-16">
            <h3 className="font-display text-lg tracking-[0.15em] text-[var(--gold-primary)] uppercase border-b border-[var(--surface-border)] pb-3 mb-8">
              Festival Host & Moderator
            </h3>
            <div className="flex justify-center">
              {(event?.moderators || []).map((artist, idx) => (
                <div
                  key={idx}
                  className="w-full max-w-[260px] group relative bg-[var(--surface-3)] border border-[var(--surface-border)] p-4 transition-all duration-300 hover:border-[var(--gold-primary)]/35 flex flex-col justify-between overflow-hidden
                            after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--gold-primary)] after:transition-all after:duration-500 hover:after:w-full"
                >
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-[var(--gold-deep)]/60 font-bold z-10">
                    M1
                  </span>
                  <div>
                    <div className="w-full aspect-[3/4] overflow-hidden bg-black/40 border border-[var(--surface-border)] relative mb-4">
                      {artist.image && artistImages[artist.image] ? (
                        <img
                          src={artistImages[artist.image]}
                          alt={artist.name}
                          className="w-full h-full object-cover filter grayscale contrast-[1.2] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--ivory-muted)]/10 text-4xl">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] tracking-[0.14em] text-[var(--gold-deep)] font-mono uppercase mb-1">
                      <span>{artist.genre}</span>
                      <span className="text-[var(--ivory-muted)]/40">{artist.district}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ivory)] mb-2 leading-tight group-hover:text-[var(--gold-primary)] transition-colors duration-200">
                      {artist.name}
                    </h3>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ── Vocalists Sub-section ── */}

          <div className="mb-16">
            <h3 className="font-display text-lg tracking-[0.15em] text-[var(--gold-primary)] uppercase border-b border-[var(--surface-border)] pb-3 mb-8">
              Vocalists
            </h3>

            <div
              className="flex flex-row gap-5 overflow-x-auto pb-4"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(event?.vocalists || []).map((artist, idx) => (
                <div
                  key={idx}
                  style={{ minWidth: '260px', maxWidth: '260px', flexShrink: 0 }}
                  className="group relative bg-[var(--surface-3)] border border-[var(--surface-border)] p-4 transition-all duration-300 hover:border-[var(--gold-primary)]/35 flex flex-col justify-between overflow-hidden
                          after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--gold-primary)] after:transition-all after:duration-500 hover:after:w-full"
                >
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-[var(--gold-deep)]/60 font-bold z-10">
                    V{String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="w-full aspect-[3/4] overflow-hidden bg-black/40 border border-[var(--surface-border)] relative mb-4">
                      {artist.image && artistImages[artist.image] ? (
                        <img
                          src={artistImages[artist.image]}
                          alt={artist.name}
                          className="w-full h-full object-cover filter grayscale contrast-[1.2] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--ivory-muted)]/10 text-4xl">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] tracking-[0.14em] text-[var(--gold-deep)] font-mono uppercase mb-1">
                      <span>{artist.genre}</span>
                      <span className="text-[var(--ivory-muted)]/40">{artist.district}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ivory)] mb-2 leading-tight group-hover:text-[var(--gold-primary)] transition-colors duration-200">
                      {artist.name}
                    </h3>
                  </div>

                </div>
              ))}
            </div>
          </div>
          {/* ── Instrument Players Sub-section ── */}

          <div>
            <h3 className="font-display text-lg tracking-[0.15em] text-[var(--gold-primary)] uppercase border-b border-[var(--surface-border)] pb-3 mb-8">
              Instrument Players
            </h3>

            <div
              className="flex flex-row gap-5 overflow-x-auto pb-4"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(event?.instrumentalists || []).map((artist, idx) => (
                <div
                  key={idx}
                  style={{ minWidth: '260px', maxWidth: '260px', flexShrink: 0 }}
                  className="group relative bg-[var(--surface-3)] border border-[var(--surface-border)] p-4 transition-all duration-300 hover:border-[var(--gold-primary)]/35 flex flex-col justify-between overflow-hidden
                          after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--gold-primary)] after:transition-all after:duration-500 hover:after:w-full"
                >
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-[var(--gold-deep)]/60 font-bold z-10">
                    I{String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="w-full aspect-[3/4] overflow-hidden bg-black/40 border border-[var(--surface-border)] relative mb-4">
                      {artist.image && artistImages[artist.image] ? (
                        <img
                          src={artistImages[artist.image]}
                          alt={artist.name}
                          className="w-full h-full object-cover filter grayscale contrast-[1.2] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--ivory-muted)]/10 text-4xl">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] tracking-[0.14em] text-[var(--gold-deep)] font-mono uppercase mb-1">
                      <span>{artist.genre}</span>
                      <span className="text-[var(--ivory-muted)]/40">{artist.district}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ivory)] mb-2 leading-tight group-hover:text-[var(--gold-primary)] transition-colors duration-200">
                      {artist.name}
                    </h3>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ── Reviewers Sub-section ── */}

          <div className="mt-16">
            <h3 className="font-display text-lg tracking-[0.15em] text-[var(--gold-primary)] uppercase border-b border-[var(--surface-border)] pb-3 mb-8">
              Reviewers
            </h3>

            <div
              className="flex flex-row gap-5 overflow-x-auto pb-4"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(event?.reviewers || []).map((reviewer, idx) => (
                <div
                  key={idx}
                  style={{ minWidth: '260px', maxWidth: '260px', flexShrink: 0 }}
                  className="group relative bg-[var(--surface-3)] border border-[var(--surface-border)] p-4 transition-all duration-300 hover:border-[var(--gold-primary)]/35 flex flex-col justify-between overflow-hidden
                          after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--gold-primary)] after:transition-all after:duration-500 hover:after:w-full"
                >
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-[var(--gold-deep)]/60 font-bold z-10">
                    R{String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="w-full aspect-[3/4] overflow-hidden bg-black/40 border border-[var(--surface-border)] relative mb-4">
                      {reviewer.image && artistImages[reviewer.image] ? (
                        <img
                          src={artistImages[reviewer.image]}
                          alt={reviewer.name}
                          className="w-full h-full object-cover filter grayscale contrast-[1.2] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--ivory-muted)]/10 text-4xl">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] tracking-[0.14em] text-[var(--gold-deep)] font-mono uppercase mb-1">
                      <span>{reviewer.genre}</span>
                      <span className="text-[var(--ivory-muted)]/40">{reviewer.district}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ivory)] mb-2 leading-tight group-hover:text-[var(--gold-primary)] transition-colors duration-200">
                      {reviewer.name}
                    </h3>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--surface-border)] py-12 px-6 text-center bg-[var(--surface-1)]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[var(--gold-primary)]/50 to-transparent mx-auto mb-8" />
        <p className="font-display text-xl font-light italic text-[var(--gold-bright)] tracking-[0.1em] mb-2">
          ISIMBUWA FESTIVAL 2026
        </p>
        <p className="text-[var(--ivory-muted)]/30 text-[11px] font-light">
          {event?.venue || 'Deraniyagala, Kegalle'} · {formattedDate}
        </p>
        <div className="flex justify-center mt-7">
          <a href="/admin/login"
            className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[var(--ivory-muted)]/18 hover:text-[var(--gold-primary)] font-mono transition-colors duration-200">
            Access Admin Gate
          </a>
        </div>
      </footer>

      {/*
        ── Global styles needed in index.css or a <style> tag ──
        
        Add these to your index.css:

        .section-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .section-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes stamp {
          from { transform: scale(1.12); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      */}
    </div>
  )
}