/**
 * components/ui/Input.jsx
 * Styled form input compatible with react-hook-form.
 */

export function Input({
  label,
  name,
  register,
  error,
  type        = 'text',
  placeholder = '',
  className   = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-white/80"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={[
          'w-full rounded-xl px-4 py-3 text-base',
          'bg-white/5 border border-white/10',
          'text-white placeholder:text-white/30',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          error
            ? 'border-red-500/60 focus:ring-red-500/50 bg-red-500/5'
            : 'focus:ring-primary-500/60 hover:border-white/20',
          className,
        ].join(' ')}
        {...(register ? register(name) : {})}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  )
}
