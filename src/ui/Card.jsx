export function Card({ children, className = '', hover = true }) {
  return (
    <div className={`card p-6 ${hover ? '' : 'hover:translate-y-0 hover:shadow-card'} ${className}`}>
      {children}
    </div>
  )
}
