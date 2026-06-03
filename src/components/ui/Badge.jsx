/**
 * components/ui/Badge.jsx
 * Status badge with color coding.
 */

const styles = {
  pending:  'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

const icons = {
  pending:  '⏳',
  approved: '✅',
  rejected: '❌',
}

const labels = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function Badge({ status, className = '' }) {
  const style = styles[status] || styles.pending
  const icon  = icons[status]  || '●'
  const label = labels[status] || status

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        'tracking-wide uppercase',
        style,
        className,
      ].join(' ')}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  )
}
