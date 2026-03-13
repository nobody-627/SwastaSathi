import { clsx } from 'clsx'

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-300',
    outline: 'border-2 border-rose-400 text-rose-500 bg-transparent hover:bg-rose-50 hover:-translate-y-0.5',
    ghost:   'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-xl',
    danger:  'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:-translate-y-0.5',
    soft:    'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
    xl: 'text-lg px-8 py-4',
  }

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
