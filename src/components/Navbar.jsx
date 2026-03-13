import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { label: 'Features',   href: '#features' },
    { label: 'Dashboard',  href: '#dashboard' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing',    href: '#pricing' },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-rose-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-card rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">
            Swasth<span className="gradient-text">Sathi</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
            Sign in
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="btn-primary text-sm px-5 py-2.5">
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-rose-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-rose-500 py-1.5 transition-colors">
              {l.label}
            </a>
          ))}
          <button onClick={() => { navigate('/login'); setOpen(false) }}
            className="w-full text-left text-sm font-semibold text-rose-600 hover:text-rose-700 py-1.5">
            Sign in
          </button>
          <button onClick={() => { navigate('/dashboard'); setOpen(false) }}
            className="btn-primary w-full justify-center text-sm mt-2">
            Get Started
          </button>
        </div>
      )}
    </header>
  )
}
