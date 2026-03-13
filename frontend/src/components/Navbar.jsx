import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, X, User } from 'lucide-react'
import Button from './ui/Button'
import { useAuth } from '../contexts/AuthContext'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI Prediction', href: '/prediction' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (evt) => {
      if (menuRef.current && !menuRef.current.contains(evt.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      window.addEventListener('mousedown', onClick)
      return () => window.removeEventListener('mousedown', onClick)
    }
  }, [menuOpen])

  const scrollTo = (href) => {
    setOpen(false)
    if (href.startsWith('#')) {
      // Check if we're on the home page
      if (window.location.pathname === '/') {
        const el = document.querySelector(href)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // Navigate to home page first, then scroll
        window.location.href = '/' + href
      }
    } else if (href.startsWith('/')) {
      // Handle navigation to routes
      window.location.href = href
    } else if (href === '/') {
      // Handle home navigation
      window.location.href = href
    }
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-50' : 'bg-transparent'
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
        {/* Logo */}
        <div className="flex items-center flex-1">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Heart size={16} className="text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              <span className="font-serif">Swasth</span>Sathi
            </span>
          </Link>
        </div>

        {/* Desktop nav - Centered */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className="text-sm font-medium text-gray-500 hover:text-rose-500 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA - Right aligned */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md"
              >
                <User size={16} />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white shadow-lg py-2 text-sm">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/dashboard')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/profile')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50"
                  >
                    Profile
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="outline">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Create account</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-rose-50 text-gray-600"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-rose-50 px-4 py-4 flex flex-col gap-2 shadow-lg">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className="text-left text-sm font-medium text-gray-600 hover:text-rose-500 py-2 px-3 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {label}
            </button>
          ))}

          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-1">
            {user ? (
              <>
                <Link to="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile" className="w-full" onClick={() => setOpen(false)}>
                  <Button size="sm" variant="outline" className="w-full">
                    Profile
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="soft"
                  className="w-full"
                  onClick={() => {
                    setOpen(false)
                    logout()
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" className="w-full" onClick={() => setOpen(false)}>
                  <Button size="sm" variant="outline" className="w-full">
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
