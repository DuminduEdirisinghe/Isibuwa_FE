/**
 * pages/LandingPage.jsx
 * Redesigned public-facing event landing page and booking system.
 * Style Direction: Tactile Luxury (deep dark surfaces, rich warm amber/gold accents, 
 * thin high-contrast borders, refined editorial typography hierarchy).
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
import artist5 from '../assets/Artisit5.jpeg'
import heroBg from '../assets/hero-bg.jpeg'

const artistImages = {
  'Artisit1.jpeg': artist1,
  'Artisit2.jpeg': artist2,
  'Artisit3.jpeg': artist3,
  'Artisit4.jpeg': artist4,
  'Artisit5.jpeg': artist5,
}

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
  const [bookingStatus, setBookingStatus] = useState('idle') // idle | loading | success | error | full
  const [errorMsg, setErrorMsg] = useState('')
  const [bookingId, setBookingId] = useState(null)

  const bookingRef = useRef(null)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(bookingSchema) })

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

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── File Upload Handlers ─────────────────────────────────────
  const validateFile = (f) => {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!acceptedTypes.includes(f.type)) return 'Only JPEG, PNG, and PDF files are accepted'
    if (f.size > 5 * 1024 * 1024) return 'File size must not exceed 5MB'
    return null
  }

  const handleFileChange = useCallback((f) => {
    const err = validateFile(f)
    if (err) {
      setFileError(err)
      setFile(null)
    } else {
      setFileError(null)
      setFile(f)
    }
  }, [onChange => {}])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileChange(droppedFile)
  }

  const handleFormSubmit = async (data) => {
    if (!file) {
      setFileError('Payment slip is required')
      return
    }
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

      if (statusCode === 409) {
        setBookingStatus('full')
      } else {
        setBookingStatus('error')
        setErrorMsg(msg)
      }
    }
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : 'Saturday, June 6, 2026'

  const formattedTime = event?.date
    ? new Date(event.date).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      })
    : '06:00 PM'

  const remaining = event?.remaining_capacity ?? 150

  // ── Availability status style helper ─────────────────────────
  const getAvailabilityBadge = (rem) => {
    if (rem === 0) {
      return (
        <span className="px-3 py-1 text-xs uppercase tracking-wider font-semibold border border-slate-500/20 bg-slate-500/10 text-slate-400 rounded-sm">
          Sold Out
        </span>
      )
    }
    if (rem <= 30) {
      return (
        <span className="px-3 py-1 text-xs uppercase tracking-wider font-semibold border border-orange-500/20 bg-orange-500/10 text-orange-400 rounded-sm animate-pulse-slow">
          Few Left ({rem} spots)
        </span>
      )
    }
    return (
      <span className="px-3 py-1 text-xs uppercase tracking-wider font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-sm">
        Available
      </span>
    )
  }

  return (
    <div className="min-h-screen selection:bg-accent-500 selection:text-dark-950">
      
      {/* ── Navigation Header ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2533]/40 bg-[#0b090e]/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="font-display text-xl font-bold tracking-widest text-primary-400 hover:opacity-85 transition-all">
            ISIBUWA
          </a>
          <div className="hidden md:flex items-center gap-6 text-[10px] tracking-widest text-white/40 font-mono">
            <span>6.9231° N, 80.3475° E</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>KEGALLE, SRI LANKA</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>JUNE 6, 2026</span>
          </div>
          <div>
            <button
              onClick={scrollToBooking}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-primary-500/25 hover:border-primary-500 hover:text-primary-400 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all rounded-none text-primary-400"
            >
              Get Ticket
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Absolute Overlay on Desktop, Stacked on Mobile) ─────────────────── */}
      <section
        className="relative pt-28 lg:pt-0 pb-16 px-6 md:px-12 flex flex-col items-center justify-center min-h-[85vh] lg:min-h-screen border-b border-[#2a2533]/20 bg-[#0b090e] lg:bg-cover lg:bg-center lg:bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      >
        {/* Subtle dark gradient overlay at the bottom only for desktop (to transition to content) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b090e] via-transparent to-transparent pointer-events-none hidden lg:block" />
        
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative z-10">
          
          {/* Main Visual Poster (Visible ONLY on mobile/tablet to avoid squishing/cropping issues) */}
          <div className="w-full max-w-4xl overflow-hidden mb-8 border border-[#2a2533]/45 bg-black lg:hidden">
            <img
              src={heroBg}
              alt="ඉසිඹුව '26"
              className="w-full h-auto object-contain select-none pointer-events-none"
            />
          </div>

          {/* Details & Actions Grid (Overlays the background on desktop, stacks below the poster on mobile) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
            
            {/* Description & CTA (Aligned bottom-left, stays below the Sasnaka logo on the left) */}
            <div className="lg:col-span-4 flex flex-col justify-end items-start pb-4">
              <div className="mb-4">
                {getAvailabilityBadge(remaining)}
              </div>
              <p className="text-white/80 lg:text-white/90 text-sm leading-relaxed max-w-sm font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Isibuwa Festival returns for its 2026 edition in the serene wilderness of Deraniyagala. Experience an evening dedicated to authentic musical artistry, bringing together classical melodies, vocal performances, and deep instrumental fusion under the stars.
              </p>
              <div className="flex gap-4 mt-8 w-full sm:w-auto">
                <button
                  onClick={scrollToBooking}
                  className="flex-1 sm:flex-none px-6 py-3.5 text-xs font-bold uppercase tracking-widest bg-primary-500 hover:bg-accent-500 text-dark-950 active:scale-[0.98] transition-all rounded-none glow-primary"
                >
                  Secure Ticket
                </button>
                <button
                  onClick={() => document.getElementById('lineup')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 sm:flex-none px-6 py-3.5 text-xs font-bold uppercase tracking-widest border border-white/20 hover:border-white bg-white/10 hover:bg-white/20 text-white active:scale-[0.98] transition-all rounded-none"
                >
                  Lineup
                </button>
              </div>
            </div>

            {/* Empty center column on desktop to keep the glowing Sinhala event logo completely clear */}
            <div className="hidden lg:block lg:col-span-4 pointer-events-none" />

            {/* Concert Details Pass Card (Aligned center-right/middle, fits perfectly in the empty right canopy) */}
            <div className="lg:col-span-4 flex items-end lg:items-center justify-end">
              <div className="w-full max-w-sm bg-[#131118]/90 backdrop-blur-md border border-primary-500/20 p-6 relative overflow-hidden group hover:border-primary-500/35 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-[1px] bg-primary-500" />
                <div className="absolute top-0 left-0 w-[1px] h-2 bg-primary-500" />
                <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-primary-500" />
                <div className="absolute bottom-0 right-0 w-[1px] h-2 bg-primary-500" />

                <div className="flex justify-between items-start border-b border-[#2a2533] pb-4 mb-4">
                  <div>
                    <p className="text-[9px] tracking-widest text-primary-400 font-semibold font-mono uppercase">Gate Pass</p>
                    <h3 className="font-display text-lg font-bold text-white mt-0.5">Isibuwa Festival '26</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] tracking-widest text-white/40 font-mono uppercase">Price</p>
                    <p className="text-base font-bold text-primary-400 mt-0.5">LKR 500</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-light text-white/80">
                  <div>
                    <p className="text-[9px] tracking-widest text-white/30 font-mono uppercase">Schedule</p>
                    <p className="text-white/95 font-medium mt-0.5">{formattedDate}</p>
                    <p className="text-white/50 text-[10px] mt-0.5">Doors open at {formattedTime}</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-widest text-white/30 font-mono uppercase">Venue Coordinates</p>
                    <p className="text-white/95 font-medium mt-0.5">{event?.venue || 'Deraniyagala, Kegalle'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Artists Lineup Section ────────────────────────────── */}
      <section id="lineup" className="py-24 px-6 md:px-12 border-b border-[#2a2533]/20 bg-[#0f0d13]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-primary-400 font-semibold font-mono mb-2">Featured Performers</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light italic text-primary-400">
              The Artistry Lineup
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {event?.artists?.map((artist, idx) => (
              <div
                key={idx}
                className="group relative bg-[#131118] border border-[#2a2533] p-4 transition-all duration-300 hover:border-primary-500/30 flex flex-col justify-between"
              >
                <div>
                  {/* High contrast visual with transition */}
                  <div className="w-full h-64 overflow-hidden bg-black/40 border border-white/5 relative mb-4">
                    {artist.image && artistImages[artist.image] ? (
                      <img
                        src={artistImages[artist.image]}
                        alt={artist.name}
                        className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl">
                        🎵
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] tracking-widest text-primary-400 font-mono uppercase mb-1">{artist.genre}</p>
                  <h3 className="font-display text-lg font-bold text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors">
                    {artist.name}
                  </h3>
                </div>
                <p className="text-xs text-white/40 leading-relaxed font-light mt-auto">
                  {artist.bio}
                </p>
              </div>
            )) || (
              <div className="col-span-full text-center py-12 text-white/30 text-xs">
                Lineup details will be finalized shortly.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Booking Form / Flow ──────────────────────────────── */}
      <section id="booking" ref={bookingRef} className="py-24 px-6 md:px-12 relative bg-[#0b090e]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Booking Instructions & Summary */}
          <div className="lg:col-span-5 text-left text-white/60">
            <p className="text-xs uppercase tracking-widest text-primary-400 font-semibold font-mono mb-2">Registration Gate</p>
            <h2 className="font-display text-4xl font-light italic text-primary-400 mb-6">
              Claim Your Passage
            </h2>
            <div className="space-y-6 text-sm font-light leading-relaxed">
              <p>
                To complete your entry registration, please follow the steps below:
              </p>
              <ol className="list-decimal list-inside space-y-3 pl-1 text-white/50 text-xs">
                <li>Transfer the ticket fee of <strong className="text-white">LKR 500.00</strong> to the bank account specified.</li>
                <li>Make sure to note down the transaction Reference ID.</li>
                <li>Take a screenshot or save the digital transfer receipt (JPEG, PNG, or PDF).</li>
                <li>Fill out the registration form on the right and upload your payment proof.</li>
              </ol>
              <p className="text-white/40 text-xs">
                * Our administration team will verify the payment reference within 24 hours and issue your unique check-in code directly to your email.
              </p>
            </div>

            {/* Price breakdown summary (Static) */}
            <div className="mt-8 bg-[#131118] border border-[#2a2533] p-5 rounded-none">
              <p className="text-[10px] tracking-widest text-white/40 font-mono uppercase mb-3 border-b border-[#2a2533] pb-2">Order Summary</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">1x Festival Entry Pass (General)</span>
                  <span className="text-white/80 font-medium">LKR 500.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Processing Fee</span>
                  <span className="text-emerald-500 font-semibold">FREE</span>
                </div>
                <div className="border-t border-dashed border-[#2a2533] pt-3 flex justify-between text-sm">
                  <span className="text-white font-medium">Total Amount Due</span>
                  <span className="text-primary-400 font-bold">LKR 500.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Upload Area */}
          <div className="lg:col-span-7 bg-[#131118] border border-primary-500/10 p-8 rounded-none relative">
            
            {/* Skeletons/Loading state */}
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-6 w-32 bg-white/5 rounded skeleton" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-white/5 rounded skeleton" />
                      <div className="h-11 bg-white/5 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ) : bookingStatus === 'success' ? (
              /* Redesigned Confirmation Receipt View */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-3xl font-light text-white mb-2">Registration Staged</h3>
                <p className="text-white/60 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
                  Your payment receipt has been queued for verification.
                </p>

                {/* Tactile Virtual Receipt */}
                <div className="max-w-xs mx-auto bg-[#0b090e] border border-[#2a2533] p-6 text-left relative overflow-hidden font-mono text-xs">
                  <div className="border-b border-[#2a2533] pb-4 mb-4 text-center">
                    <p className="text-sm font-semibold tracking-widest text-white font-display uppercase">ISIBUWA PASS</p>
                    <p className="text-[9px] text-white/30 mt-1">№ REC-2026-{bookingId}</p>
                  </div>
                  <div className="space-y-2 text-white/50 mb-6">
                    <div className="flex justify-between">
                      <span>status:</span>
                      <span className="text-amber-400 font-semibold uppercase">Pending</span>
                    </div>
                    <div className="flex justify-between">
                      <span>booking id:</span>
                      <span className="text-white font-medium">{bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>pass tier:</span>
                      <span className="text-white">General Pass</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-[#2a2533] pt-4 text-[10px] text-white/30 leading-relaxed">
                    <p className="text-center font-semibold text-white/50 mb-2 uppercase">Next Steps</p>
                    <p>1. Admins verify the payment transaction code.</p>
                    <p>2. Approved ticket details will automatically be emailed to you.</p>
                  </div>
                </div>

                <button
                  onClick={() => setBookingStatus('idle')}
                  className="mt-8 px-6 py-3 text-xs uppercase tracking-widest border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/8 text-white active:scale-[0.98] transition-all rounded-none"
                >
                  Submit Another Slip
                </button>
              </div>
            ) : bookingStatus === 'full' ? (
              /* Redesigned Sold Out state */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-500/10 border border-slate-500/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-3xl font-light text-white mb-2">Gate Closed</h3>
                <p className="text-white/40 text-xs leading-relaxed max-w-sm mx-auto">
                  Unfortunately, all 150 available entry slots for Isibuwa Festival 2026 have been booked. Stay tuned for future editions.
                </p>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-6">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Full Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Binura Senevirathna"
                    className="w-full bg-black/20 border border-[#2a2533] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all rounded-none"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className="w-full bg-black/20 border border-[#2a2533] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all rounded-none"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-black/20 border border-[#2a2533] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all rounded-none"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* District */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">District</label>
                  <div className="relative">
                    <select
                      {...register('district')}
                      className="w-full bg-black/20 border border-[#2a2533] px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all rounded-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#131118] text-white/40">Select your district</option>
                      {SRI_LANKAN_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist} className="bg-[#131118] text-white">
                          {dist}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/30">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.district && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.district.message}
                    </p>
                  )}
                </div>

                {/* Payment Reference */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">Payment Reference Number</label>
                  <input
                    type="text"
                    {...register('payment_reference')}
                    placeholder="e.g. TXN1029384"
                    className="w-full bg-black/20 border border-[#2a2533] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all rounded-none"
                  />
                  {errors.payment_reference && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.payment_reference.message}
                    </p>
                  )}
                </div>

                {/* File Upload zone */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-medium">
                    Payment Slip Receipt <span className="text-white/30 lowercase">(jpeg, png, pdf · max 5mb)</span>
                  </label>
                  
                  <div
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                    onDragOver={(e)  => { e.preventDefault(); setDragActive(true) }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={[
                      'border border-dashed p-6 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all rounded-none',
                      dragActive
                        ? 'border-primary-500 bg-primary-500/5 scale-[1.005]'
                        : file
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : fileError
                        ? 'border-red-500/40 bg-red-500/5'
                        : 'border-[#2a2533] bg-black/10 hover:border-primary-500/30 hover:bg-black/20'
                    ].join(' ')}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const selected = e.target.files[0]
                        if (selected) handleFileChange(selected)
                      }}
                      className="hidden"
                    />

                    {file ? (
                      <div className="text-center flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-emerald-400">Receipt Attached</p>
                        <p className="text-[10px] text-white/40 mt-1 max-w-[200px] truncate">{file.name}</p>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-white/30">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/60">
                          <span className="text-primary-400 font-semibold">Upload document</span> or drag files
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {fileError && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1" role="alert">
                      <span>⚠</span> {fileError}
                    </p>
                  )}
                </div>

                {bookingStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-none">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingStatus === 'loading'}
                  className="w-full mt-4 py-4 text-xs font-bold uppercase tracking-widest bg-primary-500 hover:bg-accent-500 text-dark-950 active:scale-[0.98] transition-all rounded-none glow-primary"
                >
                  {bookingStatus === 'loading' ? 'Submitting...' : 'Register Pass'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-[#2a2533]/30 py-12 px-6 text-center bg-[#070609]">
        <p className="font-display text-2xl font-light italic text-primary-400 tracking-wider mb-2">ISIBUWA FESTIVAL 2026</p>
        <p className="text-white/30 text-[11px] font-light">
          {event?.venue || 'Deraniyagala, Kegalle'} · {formattedDate}
        </p>
        <div className="flex justify-center mt-6">
          <a href="/admin/login" className="text-[10px] tracking-widest uppercase font-semibold text-white/20 hover:text-white/50 font-mono transition-colors">
            Access Admin Gate
          </a>
        </div>
      </footer>
    </div>
  )
}
