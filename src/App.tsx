import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PipeDrawingPanel } from './ScrollPipeSection'
import CustomCursor from './CustomCursor'
import { Reveal, FillButton, SiteNav } from './shared'
import splashLogo from './assets/logo-transparent.png'


// ─── Splash Screen ────────────────────────────────────────────────────────────
const SPLASH_STORAGE_KEY = 'mbtSplashSeenV2'
let splashAvailable = sessionStorage.getItem(SPLASH_STORAGE_KEY) !== '1'

function claimSplash() {
  if (!splashAvailable) return false
  splashAvailable = false
  sessionStorage.setItem(SPLASH_STORAGE_KEY, '1')
  return true
}

const SPLASH_PANELS = [
  '#e63329', '#0a0a0a', '#2952ff', '#e63329', '#0a0a0a', '#2952ff', '#e63329',
]

// Phases:
//  'idle'     — black screen, power button glows softly at center-bottom
//  'pressing' — button press animation plays
//  'reveal'   — colored bands rise up, logo glows in
//  'fadeout'  — everything fades to transparent together
//  'gone'     — unmounted

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'pressing' | 'reveal' | 'fadeout' | 'gone'>('idle')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pressing'), 1000)
    const t2 = setTimeout(() => setPhase('reveal'),   1800)
    const t3 = setTimeout(() => setPhase('fadeout'),  7000)
    const t4 = setTimeout(() => { setPhase('gone'); onComplete() }, 8500)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onComplete])

  if (phase === 'gone') return null

  const showBands = phase === 'reveal' || phase === 'fadeout'
  const isFading  = phase === 'fadeout'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black"
      style={{ opacity: isFading ? 0 : 1, transition: isFading ? 'opacity 2s ease' : 'none' }}>

      {/* ── Reveal layers ── */}
      {showBands && (
        <>
          {/* z=1 · Solid black base */}
          <div className="absolute inset-0 bg-black" />

          {/* z=2 · Logo — dims to bright, lit from below */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
            <img
              src={splashLogo}
              alt="MBT Design"
              draggable={false}
              style={{
                width: 'clamp(240px, 36vw, 500px)',
                height: 'auto',
                userSelect: 'none',
                animation: 'splashLogoEmerge 4s cubic-bezier(0.2,0,0.5,1) 0.8s both',
              }}
            />
          </div>

          {/* z=3 · Static light source — radial gradient anchored at button position.
               No scaling or movement; pure opacity fade-in.
               Creates warm neon glow at source, red halo mid, darkness at top edges. */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3,
            background: `radial-gradient(ellipse 140% 120% at 50% 102%,
              rgba(255,255,255,0.7)     0%,
              rgba( 41, 82,255,0.85)   5%,
              rgba( 41, 82,255,0.55)  18%,
              rgba( 20, 40,200,0.28)  35%,
              rgba(  0,  0,  0,0.0)   55%,
              rgba(  0,  0,  0,0.55)  80%,
              rgba(  0,  0,  0,0.85) 100%)`,
            animation: 'splashLightIn 3.5s cubic-bezier(0.2,0,0.5,1) 0s both',
          }} />

          {/* z=4 · Flat black — slow graceful lift, the main reveal */}
          <div className="absolute inset-0" style={{ zIndex: 4,
            background: '#000',
            animation: 'splashDarkLift 4s cubic-bezier(0.1,0,0.3,1) 0s both',
          }} />
        </>
      )}

      {/* ── Power button — center bottom, visible on black screen ── */}
      <div className="absolute z-20 pointer-events-none"
        style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)' }}>

        {/* Idle breathing ring */}
        {phase === 'idle' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 88, height: 88, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            transform: 'translate(-50%,-50%)',
            animation: 'pwrIdleRing 2s ease-in-out infinite',
          }} />
        )}

        {/* Ripple on press */}
        {phase === 'pressing' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 88, height: 88, borderRadius: '50%',
            border: '2px solid white',
            animation: 'pwrRipple 0.8s cubic-bezier(0.2,0,0.8,1) 0.25s both',
          }} />
        )}

        {/* Button SVG
            Power symbol: arc radius 17, center (44,44).
            Gap at top ≈60°. Arc from (54.7, 29.5) clockwise 300° to (33.3, 29.5).
            Line from top-center (44,20) down to (44,40).
        */}
        <svg width="88" height="88" viewBox="0 0 88 88"
          style={{
            display: 'block',
            opacity: showBands ? 0 : 1,
            transition: showBands ? 'opacity 0.4s ease' : 'none',
            animation: phase === 'pressing'
              ? 'pwrBtnPress 0.6s cubic-bezier(0.4,0,0.2,1) 0s both, pwrBtnNeon 0.55s ease-out 0.28s both'
              : phase === 'idle'
              ? 'pwrBtnIdle 2.4s ease-in-out infinite'
              : 'none',
          }}>
          {/* Outer ring */}
          <circle cx="44" cy="44" r="38" fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          {/* Inner surface ring */}
          <circle cx="44" cy="44" r="29" fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
          {/* Power arc — 300° clockwise, gap at top (60°) */}
          <path d="M 52.5 29.5 A 17 17 0 1 1 35.5 29.5"
            fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          {/* Power line — dead center top */}
          <line x1="44" y1="20" x2="44" y2="40"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Label */}
        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
          opacity: showBands ? 0 : 1,
          transition: showBands ? 'opacity 0.3s ease' : 'none',
        }}>
          POWER ON
        </div>
      </div>

    </div>
  )
}

// ─── Coordinate Tracker ───────────────────────────────────────────────────────
function CoordTracker() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return (
    <span className="font-mono text-[12px] text-[#666666] tracking-widest select-none">
      X:{String(pos.x).padStart(4, '0')}PX / Y:{String(pos.y).padStart(4, '0')}PX
    </span>
  )
}



// ─── Hero + Pipe (scroll-driven) ──────────────────────────────────────────────
function HeroSection({ booted }: { booted: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const handler = () => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, -rect.top / scrollable)))
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Shared hero content block
  const heroContent = (
    <div className="relative"
      style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(30px)', transition: 'opacity 1s ease 0.2s, transform 1s ease 0.2s' }}>
      <h1 className="text-[clamp(1.5rem,3vw,3.8rem)] font-bold tracking-tight leading-[0.92] uppercase mb-5">
        <span className="text-[#2952ff]">EMPOWER</span> YOUR<br />
        PROJECTS<br />
        WITH ADVANCED<br />
        BIM SERVICES
      </h1>
      <p className="text-[#555555] max-w-sm text-sm leading-relaxed mb-8">
        Streamlining production, optimizing constructability, and mitigating risk
        for complex MEP building systems — industrial, commercial, and government sectors.
      </p>
      <div className="flex flex-wrap gap-3 items-center mb-10">
        <FillButton href="#solutions" label="EXPLORE SOLUTIONS" />
      </div>
      <div className="pt-6 border-t border-[#d4d0c8] grid grid-cols-3 gap-6">
        {[
          { value: '60+', suffix: 'YRS', label: 'EXPERIENCE' },
          { value: '50+', suffix: '', label: 'PROJECTS' },
          { value: '100+', suffix: '', label: 'PARTNERS' },
        ].map(stat => (
          <div key={stat.label}>
            <div className="font-mono font-bold text-[#1a1a1a] leading-none flex items-baseline gap-1.5">
              <span className="text-[clamp(1.3rem,2.2vw,2.4rem)]">{stat.value}</span>
              {stat.suffix && <span className="text-sm font-bold text-[#1a1a1a]">{stat.suffix}</span>}
            </div>
            <div className="font-mono text-[11px] text-[#666666] tracking-[0.2em] mt-1.5 uppercase leading-snug">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile-only: hero above the scroll section, flows normally */}
      <section className="lg:hidden relative flex flex-col justify-center px-8 py-16"
        style={{ background: 'linear-gradient(135deg, #eeebe4 60%, #e0dbd0 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {heroContent}
      </section>

      {/* 580vh scroll wrapper — pipe animation driven by scroll */}
      <div ref={wrapRef} style={{ height: '580vh', background: '#0a0a0a' }}>
        <div className="sticky top-16 overflow-hidden h-[calc(100dvh-4rem)] grid"
          style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,55%)' }}>

          {/* Desktop-only: hero inside the sticky grid */}
          <section className="hidden lg:flex relative flex-col justify-center px-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #eeebe4 60%, #e0dbd0 100%)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
            <div className="absolute inset-y-0 right-0 w-24 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, rgba(26,22,18,0.18))' }} />
            {heroContent}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
              style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease 1.4s' }}>
              <span className="font-mono text-[11px] text-[#666] tracking-[0.3em]">
                [{progress < 0.99 ? 'LOADING SYSTEMS…' : 'ALL SYSTEMS LOADED'}]
              </span>
              <div className="w-24 h-px bg-[#d4d0c8] relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-[#e63329] transition-all duration-100"
                  style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          </section>

          {/* Pipe panel — col-span-full on mobile, single col on desktop */}
          <div className="col-span-full lg:col-span-1 h-full overflow-hidden">
            <PipeDrawingPanel progress={progress} />
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Problems ─────────────────────────────────────────────────────────────────
const PROBLEMS = [
  { num: '01', title: 'COORDINATION FAILURES', body: 'Disconnected teams produce conflicting drawings that aren\'t discovered until construction — costing time and budget.' },
  { num: '02', title: 'CLASH DELAYS', body: 'Undetected clashes between MEP systems and structure stop work in the field, triggering costly change orders.' },
  { num: '03', title: 'FABRICATION GAPS', body: 'Imprecise documentation means fabricators improvise in the field, introducing risk and undermining quality.' },
  { num: '04', title: 'SCHEDULE OVERRUNS', body: 'Without risk mitigation built into the process, timelines slip and stakeholder trust erodes.' },
]

function Problems() {
  return (
    <section className="py-32 px-6 md:px-10 border-t border-[#d4d0c8]">
      <div className="max-w-screen-2xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] mb-3">PROBLEM SPACE</div>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-20">WHERE PROJECTS<br />BREAK DOWN</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.num} delay={i * 80}>
              <div className="border border-[#d4d0c8] p-8 hover:border-[#b8b4ac] hover:bg-[#e6e2da] transition-all duration-300 group h-full">
                <div className="font-mono text-5xl font-bold text-[#151515] group-hover:text-[#e63329] transition-colors duration-300 mb-6 leading-tight select-none">
                  {p.num}
                </div>
                <h3 className="text-xs font-bold tracking-[0.18em] uppercase mb-4 text-[#0a0a0a]">{p.title}</h3>
                <p className="text-xs text-[#444444] leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Solutions ────────────────────────────────────────────────────────────────
const SOLUTIONS = [
  {
    num: '01', tag: 'INTEGRATED BIM',
    title: 'COLLABORATIVE INFORMATION SHARING',
    body: 'We unify project stakeholders on a single BIM platform — architects, engineers, contractors, and owners working from one coordinated model. Conflicts surface early, decisions happen fast.',
    tags: ['Revit', 'Navisworks', 'Coordination', 'IFC Export'],
  },
  {
    num: '02', tag: 'MEP COORDINATION',
    title: 'FABRICATION-READY DOCUMENTATION',
    body: 'Our MEP expertise produces construction documents that go directly to the fabrication shop without interpretation. Every spool, hanger, and fitting is accounted for before a single piece is cut.',
    tags: ['Spoolgen', 'Isometrics', 'Hanger Design', 'QA/QC'],
  },
  {
    num: '03', tag: 'CONSTRUCTABILITY',
    title: 'CONFLICTS ELIMINATED BEFORE GROUND BREAKS',
    body: 'Advanced clash detection and constructability analysis identify every interference in the model. The field team walks in with a resolved design — not a puzzle to solve.',
    tags: ['Clash Detection', '4D Simulation', 'Field Review', 'RFI Reduction'],
  },
  {
    num: '04', tag: 'RISK MITIGATION',
    title: 'PROTECT YOUR TIMELINE AND BUDGET',
    body: 'We embed risk identification into every phase: design, coordination, and construction support. Early warnings mean small adjustments instead of expensive course corrections.',
    tags: ['Schedule Analysis', 'Cost Control', 'Change Management', 'Reporting'],
  },
]

function Solutions() {
  return (
    <section id="solutions" className="py-32 px-6 md:px-10 border-t border-[#d4d0c8]">
      <div className="max-w-screen-2xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] mb-3">SOLUTIONS</div>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-20">HOW WE SOLVE IT</h2>
        </Reveal>
        <div>
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.num}>
              <div className={`border-t border-[#d4d0c8] py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start group hover:bg-[#e6e2da] transition-colors duration-300 px-2 ${i === SOLUTIONS.length - 1 ? 'border-b' : ''}`}>
                <div className="lg:col-span-1">
                  <span className="font-mono text-xs text-[#e63329]">[{s.num}]</span>
                </div>
                <div className="lg:col-span-3">
                  <div className="font-mono text-[12px] tracking-[0.3em] text-[#666666] uppercase mb-3">{s.tag}</div>
                  <h3 className="text-xl font-bold uppercase tracking-tight leading-snug">{s.title}</h3>
                </div>
                <div className="lg:col-span-5">
                  <p className="text-[#666666] leading-relaxed text-sm">{s.body}</p>
                </div>
                <div className="lg:col-span-3 flex flex-wrap gap-2">
                  {s.tags.map(t => (
                    <span key={t} className="font-mono text-[12px] tracking-[0.15em] uppercase border border-[#c0bbb2] text-[#555555] px-3 py-1.5 group-hover:border-[#2a2a2a] group-hover:text-[#666666] transition-all">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Methodology ─────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'OBSERVE', desc: 'We audit your project scope, existing documentation, and team structure to build a coordination baseline.' },
  { label: 'ADVISE', desc: 'Our engineers identify risks, coordination gaps, and optimization opportunities before work begins.' },
  { label: 'EXECUTE', desc: 'Fully coordinated BIM deliverables, clash-free models, and fabrication-ready documentation.' },
  { label: 'VERIFY', desc: 'QA/QC review cycles ensure every deliverable meets specification and field tolerance requirements.' },
]

function Methodology() {
  return (
    <section id="vision" className="py-32 px-6 md:px-10 bg-[#e6e2da] border-t border-[#d4d0c8]">
      <div className="max-w-screen-2xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] mb-3">METHODOLOGY</div>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-20">THE <span className="text-[#2952ff]">MBT</span> PROCESS</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {STEPS.map((step, i) => (
            <Reveal key={step.label} delay={i * 100}>
              <div className={`px-0 lg:px-10 first:pl-0 pb-12 lg:pb-0 ${i > 0 ? 'border-t md:border-t-0 lg:border-l border-[#e0e0e0] pt-12 lg:pt-0' : ''}`}>
                <div className="font-mono text-[12px] text-[#e63329] tracking-[0.3em] mb-4">[{String(i + 1).padStart(2, '0')}]</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">{step.label}</h3>
                <p className="text-xs text-[#444444] leading-relaxed">{step.desc}</p>
                <div className="mt-8 h-px bg-[#e63329] opacity-40 w-8" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Markets Marquee ──────────────────────────────────────────────────────────
const MARKET_ITEMS = [
  'INDUSTRIAL', 'COMMERCIAL', 'PROCESS FACILITIES', 'OIL & GAS',
  'INSTITUTIONAL', 'GOVERNMENT', 'DEPARTMENT OF DEFENSE', 'HEALTHCARE',
  'SEMI-CONDUCTOR', 'PHARMACEUTICAL', 'DATA CENTERS',
]

function Markets() {
  return (
    <section id="markets" className="py-24 border-t border-[#d4d0c8] overflow-hidden">
      <Reveal>
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 mb-10">
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em]">MARKETS SERVED</div>
        </div>
      </Reveal>
      <div className="relative w-full overflow-hidden">
        <div className="flex marquee-track" style={{ width: 'max-content' }}>
          {[...MARKET_ITEMS, ...MARKET_ITEMS].map((m, i) => (
            <div key={i} className="inline-flex items-center">
              <Link to="/markets" className="font-mono text-3xl md:text-4xl font-bold text-[#b0aca4] px-8 uppercase tracking-tight hover:text-[#2952ff] transition-colors duration-200">
                {m}
              </Link>
              <span className="text-[#666666] text-xl select-none">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Services Grid ────────────────────────────────────────────────────────────
const SERVICES = [
  { id: '01', name: 'ESTIMATING' },
  { id: '02', name: 'STAFFING AUGMENTATION' },
  { id: '03', name: 'PROJECT COORDINATION' },
  { id: '04', name: 'VISUALIZATION & SIMULATION' },
  { id: '05', name: 'CLASH DETECTION' },
  { id: '06', name: '3D MODELING' },
  { id: '07', name: 'QUALITY ASSURANCE' },
  { id: '08', name: 'RISK MANAGEMENT' },
  { id: '09', name: 'DESIGN OPTIMIZATION' },
  { id: '10', name: 'FABRICATION DOCUMENTATION' },
]

function ServicesGrid() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="py-32 px-6 md:px-10 border-t border-[#d4d0c8]">
      <div className="max-w-screen-2xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] mb-3">CAPABILITIES</div>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-20">FULL-SPECTRUM<br />SERVICES</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {SERVICES.map(s => (
            <Reveal key={s.id}>
              <div
                className={`border-t border-[#d4d0c8] py-6 px-2 flex items-center justify-between cursor-default transition-all duration-200 ${hovered === s.id ? 'bg-[#e6e2da] pl-5' : ''}`}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center gap-6">
                  <span className="font-mono text-[12px] text-[#2a2a2a]">[{s.id}]</span>
                  <span className={`text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-200 ${hovered === s.id ? 'text-[#0a0a0a]' : 'text-[#444444]'}`}>
                    {s.name}
                  </span>
                </div>
                <div className={`h-px transition-all duration-300 ${hovered === s.id ? 'bg-[#e63329] w-8' : 'bg-[#dddddd] w-4'}`} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section id="contact" className="py-40 px-6 md:px-10 border-t border-[#d4d0c8] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(rgba(230,51,41,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(230,51,41,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="max-w-screen-2xl mx-auto relative">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] mb-6 flex items-center gap-3">
            <div className="w-6 h-px bg-[#e63329]" />
            INITIATE PROJECT
          </div>
          <h2 className="text-[clamp(2rem,6vw,5rem)] font-bold uppercase tracking-tight leading-[0.93] mb-10 max-w-3xl">
            READY TO BUILD<br /><span className="text-[#2952ff]">WITHOUT</span><br />
            COMPROMISE?
          </h2>
          <p className="text-[#444444] max-w-md text-sm leading-relaxed mb-12">
            Bring us into your next project. Whether you need full BIM coordination, clash detection, or staffing augmentation — we deliver fabrication-ready results.
          </p>
          <FillButton href="mailto:info@mbtdesign.net" label="START CONVERSATION" />
        </Reveal>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#d4d0c8] px-6 md:px-10 py-10">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#e63329]" />
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#666666]">MBT DESIGN</span>
        </div>
        <div className="font-mono text-xs text-[#444444] tracking-widest">
          © 2025 MBT DESIGN — ALL RIGHTS RESERVED
        </div>
        <div className="flex items-center gap-6">
          {['LinkedIn', 'Instagram', 'Facebook'].map(s => (
            <a key={s} href="#" className="font-mono text-[12px] text-[#666666] tracking-[0.2em] uppercase hover:text-[#0a0a0a] transition-colors duration-200">
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 h-px z-50 bg-[#d4d0c8]">
      <div
        className="h-full bg-[#e63329] transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
// ─── Opening Frame ────────────────────────────────────────────────────────────
function OpeningFrame({ booted }: { booted: boolean }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (booted) { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }
  }, [booted])

  return (
    <section className="relative flex flex-col justify-center items-start overflow-hidden"
      style={{ height: '100dvh', background: '#0a0a0a' }}>

      {/* Subtle warm grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Red vertical accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e63329]"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.2s' }} />

      <div className="relative px-8 md:px-20 max-w-screen-2xl">

        {/* Main statement */}
        <h1 className="font-bold uppercase tracking-tight leading-[0.88]"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 10rem)',
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s' }}>
          <span className="text-[#2952ff]">ENGINEERING</span><br />
          <span className="text-white">THE BUILT</span><br />
          <span className="text-white">WORLD.</span>
        </h1>

        {/* Sub-line */}
        <p className="mt-8 font-mono text-[clamp(10px,2.5vw,13px)] text-[#666] tracking-[0.15em] uppercase leading-relaxed"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'opacity 0.7s ease 0.9s, transform 0.7s ease 0.9s' }}>
          Engineering — BIM Coordination — Constructability
        </p>
      </div>

      {/* Scroll to enter */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.4s' }}>
        <span className="font-mono text-[10px] tracking-[0.35em] text-[#444] uppercase">Scroll to Enter</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#e63329] to-transparent"
          style={{ animation: 'scrollBounce 2s ease-in-out infinite' }} />
      </div>

    </section>
  )
}

export default function App() {
  const [showSplash] = useState(claimSplash)
  const [booted, setBooted] = useState(!showSplash)

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, '1')
    setBooted(true)
  }, [])

  return (
    <>
      <CustomCursor />
      {showSplash && !booted && <SplashScreen onComplete={handleComplete} />}
      <div style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <ScrollProgress />
        <SiteNav />
        <OpeningFrame booted={booted} />
        <HeroSection booted={booted} />
        <Problems />
        <Solutions />
        <Methodology />
        <Markets />
        <ServicesGrid />
        <CTA />
        <Footer />
      </div>
    </>
  )
}
