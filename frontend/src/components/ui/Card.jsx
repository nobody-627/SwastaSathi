import { clsx } from 'clsx'

export function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-rose-50 shadow-sm',
        hover && 'hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/50 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'rose', className, ...props }) {
  const variants = {
    rose:   'bg-rose-50 text-rose-600 border-rose-200',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:  'bg-amber-50 text-amber-600 border-amber-200',
    blue:   'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    gray:   'bg-gray-100 text-gray-600 border-gray-200',
    red:    'bg-red-50 text-red-600 border-red-200',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border',
        variants[variant] || variants.rose,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function SectionTag({ children }) {
  return (
    <span className="inline-block bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
      {children}
    </span>
  )
}
