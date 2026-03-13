export function Button({ children, variant = 'primary', onClick, className = '', href }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  if (href) {
    return (
      <a href={href} className={`${base} inline-flex items-center gap-2 ${className}`}>
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={`${base} inline-flex items-center gap-2 ${className}`}>
      {children}
    </button>
  )
}
