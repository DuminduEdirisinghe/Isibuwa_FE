/**
 * components/landing/HeroSection.jsx
 * Full-screen hero with event name, date, venue and CTA.
 */

import heroBg from '../../assets/hero-bg.jpeg'
import { Button } from '../ui/Button'

export function HeroSection({ event, onBookNow }) {
  const eventDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : 'Saturday, June 6, 2026'

  const remaining = event?.remaining_capacity ?? 150

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Gradient overlay to transition to the dark page content below */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-950/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
        {/* Eyebrow tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/30 border border-primary-500/40 text-primary-300 text-sm font-semibold mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-slow" />
          Limited Spots Available
          {remaining < 150 && (
            <span className="text-accent-400">&nbsp;· {remaining} remaining</span>
          )}
        </div>

        {/* Main headline */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6 animate-slide-up">
          <span className="gradient-text"></span>
          <br />
          <span className="text-white"></span>
        </h1>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-80 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="accent"
            size="lg"
            onClick={onBookNow}
            className="glow-accent"
          >
             Book Your Spot
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => document.getElementById('event-info')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
