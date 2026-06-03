/**
 * components/landing/Artists.jsx
 * Artist lineup cards — reads from event.artists JSONB array.
 * Renders an interactive carousel if there are more than 4 artists.
 */

import { useRef, useState, useEffect } from 'react'
import artist1 from '../../assets/Artisit1.jpeg'
import artist2 from '../../assets/Artisit2.jpeg'
import artist3 from '../../assets/Artisit3.jpeg'
import artist4 from '../../assets/Artisit4.jpeg'
import artist5 from '../../assets/Artisit5.jpeg'

const artistImages = {
  'Artisit1.jpeg': artist1,
  'Artisit2.jpeg': artist2,
  'Artisit3.jpeg': artist3,
  'Artisit4.jpeg': artist4,
  'Artisit5.jpeg': artist5,
}

const GENRE_COLORS = {
  'Vocalist':        'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  'Instrumentalist': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
}

const GENRE_BADGE_COLORS = {
  'Vocalist':        'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Instrumentalist': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

function ArtistCard({ artist }) {
  const gradient  = GENRE_COLORS[artist.genre]         || 'from-primary-500/20 to-purple-500/20 border-primary-500/30'
  const badgeColor = GENRE_BADGE_COLORS[artist.genre]  || 'bg-primary-500/20 text-primary-300 border-primary-500/30'

  return (
    <div className={`group relative rounded-2xl border bg-gradient-to-br ${gradient} p-6 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:shadow-xl overflow-hidden h-full flex flex-col justify-between`}>
      {/* Background orb */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />

      <div className="relative flex-1 flex flex-col">
        {/* Artist Image */}
        <div className="w-full h-56 rounded-xl overflow-hidden mb-5 bg-dark-900 border border-white/10 relative">
          {artist.image && artistImages[artist.image] ? (
            <img
              src={artistImages[artist.image]}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20 text-3xl">
              🎵
            </div>
          )}
        </div>

        {/* Genre / Location badge */}
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${badgeColor}`}>
            {artist.genre}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>

        {/* Bio */}
        <p className="text-sm text-white/60 leading-relaxed flex-1">{artist.bio}</p>
      </div>
    </div>
  )
}

const DEFAULT_ARTISTS = [
  { name: 'M.G. Buddhima Prasad Priyanath', genre: 'Vocalist', bio: 'Talented vocalist from Rathnapura, bringing soulful classical and fusion performances.', image: 'Artisit1.jpeg' },
  { name: 'Hashara Sandamini',              genre: 'Vocalist', bio: 'Enchanting vocal artist from Rathnapura, known for expressive melodies and pop fusion.', image: 'Artisit2.jpeg' },
  { name: 'R.A. Devindi Hirushika',         genre: 'Vocalist', bio: 'Vibrant performing artist from Kegalle, blending traditional rhythms with contemporary styles.', image: 'Artisit3.jpeg' },
  { name: 'Sasanda Sankalana',              genre: 'Instrumentalist', bio: 'Versatile multi-instrumentalist from Kalutara, delivering energetic live music.', image: 'Artisit4.jpeg' },
  { name: 'S. Rasindu Karunathilaka',       genre: 'Vocalist', bio: 'Rising star from Rathnapura, capturing audiences with powerful vocals and stage presence.', image: 'Artisit5.jpeg' },
]

export function Artists({ event }) {
  const artists = event?.artists?.length ? event.artists : DEFAULT_ARTISTS
  const scrollRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollLimits)
      checkScrollLimits()
      window.addEventListener('resize', checkScrollLimits)
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScrollLimits)
      }
      window.removeEventListener('resize', checkScrollLimits)
    }
  }, [artists])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="artists" className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/30 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-400 text-sm font-semibold mb-4 tracking-wider uppercase">
            Lineup
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Meet the <span className="gradient-text-gold">Artists</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            World-class performers bringing you an unforgettable night of music.
          </p>
        </div>

        {/* Carousel / Grid Wrapper */}
        <div className="relative group/carousel px-4 sm:px-0">
          {/* Left Arrow Button */}
          {artists.length > 4 && showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-[-16px] lg:left-[-30px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-dark-800/90 border border-white/10 hover:border-accent-500/50 hover:bg-accent-500 hover:text-dark-900 text-white flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
              aria-label="Previous slide"
            >
              <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow Button */}
          {artists.length > 4 && showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-[-16px] lg:right-[-30px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-dark-800/90 border border-white/10 hover:border-accent-500/50 hover:bg-accent-500 hover:text-dark-900 text-white flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
              aria-label="Next slide"
            >
              <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className={[
              'flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none',
              artists.length > 4 ? 'gap-6 pb-4' : 'grid sm:grid-cols-2 lg:grid-cols-4 gap-6'
            ].join(' ')}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {artists.map((artist, i) => (
              <div
                key={i}
                className={[
                  artists.length > 4
                    ? 'snap-start shrink-0 w-[80vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]'
                    : 'w-full'
                ].join(' ')}
              >
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-2xl">🎶</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  )
}
