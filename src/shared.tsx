import { useRef, useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import navLogo from './assets/logo-nav.png'

// ─── Reveal ───────────────────────────────────────────────────────────────────
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: {
  children: React.ReactNode; className?: string; delay?: number; as?: keyof React.JSX.IntrinsicElements
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  const AnyTag = Tag as any
  return (
    <AnyTag ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </AnyTag>
  )
}

// ─── FillButton ───────────────────────────────────────────────────────────────
const GRID_COLS = 12
const GRID_ROWS = 3
const GRID_CELLS = GRID_COLS * GRID_ROWS

export function FillButton({ href, label }: { href: string; label: string }) {
  const delays = useMemo(() => Array.from({ length: GRID_CELLS }, (_, i) => {
    const col = i % GRID_COLS
    const row = Math.floor(i / GRID_COLS)
    const base = (col + row * 0.6) / (GRID_COLS + GRID_ROWS * 0.6)
    return Math.round(base * 220 + Math.random() * 40)
  }), [])

  return (
    <a href={href} className="btn-fill">
      <div className="btn-fill-grid" aria-hidden="true">
        {delays.map((d, i) => (
          <div key={i} className="btn-fill-cell" style={{ '--d': `${d}ms` } as React.CSSProperties} />
        ))}
      </div>
      <div className="btn-fill-label">
        <div className="btn-fill-label-inner label-top"><span className="btn-fill-text">{label}</span></div>
        <div className="btn-fill-label-inner label-bot"><span className="btn-fill-text">{label}</span></div>
      </div>
      <div className="btn-fill-icon">
        <div className="btn-fill-icon-inner icon-top">
          <svg width="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M11.875 14.375L16.25 9.93818L11.875 5.625M16.25 9.93818H2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
        </div>
        <div className="btn-fill-icon-inner icon-bot">
          <svg width="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M11.875 14.375L16.25 9.93818L11.875 5.625M16.25 9.93818H2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
        </div>
      </div>
    </a>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Vision', href: '/vision' },
  { label: 'Team', href: '/team' },
  { label: 'Markets', href: '/markets' },
  { label: 'Contact', href: '/#contact' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // After navigating to home with a hash, scroll to the target
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location])

  const handleHashLink = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    setMenuOpen(false)
    const [path, hash] = href.split('#')
    if (location.pathname === (path || '/')) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`${path || '/'}#${hash}`)
    }
  }

  return (
    <nav aria-label="Primary" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#eeebe4]/95 backdrop-blur-sm border-b border-[#d4d0c8]`}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/"><img src={navLogo} alt="MBT Design" style={{ height: 40, width: 'auto', mixBlendMode: 'multiply' }} /></Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => l.href.includes('#') ? (
            <a key={l.href} href={l.href} onClick={e => handleHashLink(e, l.href)} className="text-xs tracking-[0.2em] uppercase text-[#666666] hover:text-[#0a0a0a] transition-colors duration-200">{l.label}</a>
          ) : (
            <Link key={l.href} to={l.href} className="text-xs tracking-[0.2em] uppercase text-[#666666] hover:text-[#0a0a0a] transition-colors duration-200">{l.label}</Link>
          ))}
        </div>
        <button className="md:hidden text-[#0a0a0a] p-2" onClick={() => setMenuOpen(v => !v)} aria-label="Menu" aria-expanded={menuOpen} aria-controls="mobile-nav">
          <div className="space-y-1.5 w-5">
            <div className={`h-px bg-[#111111] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`h-px bg-[#111111] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`h-px bg-[#111111] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>
      {menuOpen && (
        <div id="mobile-nav" className="md:hidden bg-[#eeebe4] border-t border-[#d4d0c8] px-6 pb-8 pt-4 space-y-5">
          {NAV_LINKS.map(l => l.href.includes('#') ? (
            <a key={l.href} href={l.href} onClick={e => handleHashLink(e, l.href)} className="block text-xs tracking-[0.2em] uppercase text-[#666666] hover:text-[#0a0a0a] transition-colors">{l.label}</a>
          ) : (
            <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)} className="block text-xs tracking-[0.2em] uppercase text-[#666666] hover:text-[#0a0a0a] transition-colors">{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
