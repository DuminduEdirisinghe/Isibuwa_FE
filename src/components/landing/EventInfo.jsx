/**
 * components/landing/EventInfo.jsx
 * Event description, date/time, venue, and ticket price.
 */

export function EventInfo({ event }) {
  const eventDate = event?.date
    ? new Date(event.date)
    : new Date('2026-06-06T18:00:00+05:30')

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  const infoCards = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Date',
      value: formattedDate,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Time',
      value: formattedTime,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Venue',
      value: event?.venue || 'Deraniyagala, Kegalle',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      label: 'Ticket Price',
      value: event?.ticket_price
        ? `LKR ${Number(event.ticket_price).toLocaleString()}`
        : 'Free Entry',
    },
  ]

  return (
    <section id="event-info" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-400 text-sm font-semibold mb-4 tracking-wider uppercase">
            About The Event
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            One Night. <span className="gradient-text">Infinite Vibes.</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {event?.description || 'The biggest music event of the year returns! An unforgettable night of live music, electrifying performances, and pure energy.'}
          </p>
        </div>

        {/* Info cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {infoCards.map((card, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 group hover:bg-primary-600/10 hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className="text-white font-semibold leading-snug">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        {event?.remaining_capacity !== undefined && (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm mb-3">
              <span className="text-white font-bold">{150 - (event.remaining_capacity ?? 0)}</span> of 150 spots filled
            </p>
            <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-700"
                style={{ width: `${((150 - (event.remaining_capacity ?? 0)) / 150) * 100}%` }}
              />
            </div>
            {event.remaining_capacity <= 20 && (
              <p className="text-accent-400 text-sm font-semibold mt-3 animate-pulse-slow">
                🔥 Only {event.remaining_capacity} spots left!
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
