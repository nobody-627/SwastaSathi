const VARIANTS = {
  normal:    'bg-emerald-100 text-emerald-700',
  warning:   'bg-amber-100 text-amber-700',
  critical:  'bg-rose-100 text-rose-700',
  info:      'bg-blue-100 text-blue-700',
  default:   'bg-gray-100 text-gray-600',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
