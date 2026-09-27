import { useRef, useEffect, useMemo, useState } from 'react'
import CustomCursor from './CustomCursor'
import { Reveal, FillButton, SiteNav } from './shared'

// ─── Scroll Phrases ───────────────────────────────────────────────────────────
function ScrollPhrases({ phrases }: { phrases: string[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [opacities, setOpacities] = useState(phrases.map(() => 0))

  useEffect(() => {
    const handler = () => {
      const el = wrapRef.current; if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      const slice = 1 / phrases.length
      setOpacities(phrases.map((_, i) => {
        const start = i * slice, mid = start + slice * 0.5, end = start + slice
        let o = 0
        if (progress < start) o = 0
        else if (progress < mid) o = (progress - start) / (mid - start)
        else if (progress < end) o = 1 - (progress - mid) / (end - mid)
        return Math.max(0, Math.min(1, o))
      }))
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [phrases])

  return (
    <div ref={wrapRef} style={{ height: `${phrases.length * 200}vh` }}>
      <div className="sticky top-0 h-screen">
        {phrases.map((text, i) => (
          <div key={text} className="absolute inset-0 flex items-center justify-center px-6 md:px-10 pointer-events-none"
            style={{ opacity: opacities[i] }}>
            <p className="font-bold uppercase tracking-tight text-[#111] text-center"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 7rem)' }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Coordination Field ────────────────────────────────────────────────────────
const COLS = 24
const ROWS = 13
const TOTAL = COLS * ROWS
const CLASH_COUNT = 22

function CertaintyField() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const progressRef = useRef(0)

  const noise = useMemo(() => Array.from({ length: TOTAL }, (_, i) => {
    const s1 = Math.sin(i * 9301 + 49297) * 233280; const r1 = s1 - Math.floor(s1)
    const s2 = Math.sin(i * 7331 + 1234) * 233280;  const r2 = s2 - Math.floor(s2)
    const s3 = Math.sin(i * 3571 + 8765) * 233280;  const r3 = s3 - Math.floor(s3)
    return { x: (r1 - 0.5) * 2, y: (r2 - 0.5) * 2, phase: r3 }
  }), [])

  const clashIndices = useMemo(() => {
    // Sort all indices by phase descending, then pick top CLASH_COUNT.
    // This spreads clashes across the whole grid rather than clustering at low indices.
    return Array.from({ length: TOTAL }, (_, i) => i)
      .sort((a, b) => noise[b].phase - noise[a].phase)
      .slice(0, CLASH_COUNT)
  }, [noise])

  useEffect(() => {
    const handler = () => {
      const el = wrapRef.current; if (!el) return
      const rect = el.getBoundingClientRect()
      progressRef.current = Math.max(0, Math.min(1, -rect.top / (el.offsetHeight - window.innerHeight)))
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      const r = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * r
      canvas.height = canvas.offsetHeight * r
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const render = () => {
      const p = progressRef.current
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width, H = canvas.height
      const e = easeOut(p)
      const t = Date.now()

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, W, H)

      // Faint background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx.lineWidth = 0.5 * dpr
      const bg = 48 * dpr
      for (let x = 0; x < W; x += bg) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += bg) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      const mx = W * 0.07, my = H * 0.12
      const gW = W - mx * 2, gH = H - my * 2
      const cellW = gW / (COLS - 1), cellH = gH / (ROWS - 1)
      const maxDisp = Math.min(cellW, cellH) * 2.8

      const clashesVisible = Math.max(0, CLASH_COUNT - Math.floor(CLASH_COUNT * Math.min(p / 0.82, 1)))

      // Scan line sweeps left→right snapping dots to exact grid positions
      const scanProgress = Math.min(e * 1.08, 1)
      const scanX = mx + gW * scanProgress

      // Dot positions — left of scan line: locked to exact grid; right: still displaced
      const positions: [number, number][] = []
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          const idx = i * ROWS + j
          const n = noise[idx]
          const gx = mx + i * cellW, gy = my + j * cellH
          if (gx <= scanX) {
            positions.push([gx, gy])
          } else {
            positions.push([gx + n.x * maxDisp, gy + n.y * maxDisp])
          }
        }
      }

      // Scan line visual — bright vertical rule with trailing glow
      if (scanProgress < 1) {
        const grad = ctx.createLinearGradient(scanX - 28 * dpr, 0, scanX + 4 * dpr, 0)
        grad.addColorStop(0, 'rgba(41,82,255,0)')
        grad.addColorStop(0.6, `rgba(41,82,255,0.08)`)
        grad.addColorStop(1, `rgba(120,160,255,0.22)`)
        ctx.fillStyle = grad
        ctx.fillRect(scanX - 28 * dpr, my - 4 * dpr, 32 * dpr, gH + 8 * dpr)
        ctx.strokeStyle = 'rgba(180,210,255,0.75)'
        ctx.lineWidth = dpr
        ctx.setLineDash([])
        ctx.beginPath(); ctx.moveTo(scanX, my - 6 * dpr); ctx.lineTo(scanX, my + gH + 6 * dpr); ctx.stroke()
        // Tick marks along scan line
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 0.5 * dpr
        for (let j = 0; j < ROWS; j++) {
          const gy = my + j * cellH
          ctx.beginPath(); ctx.moveTo(scanX - 3 * dpr, gy); ctx.lineTo(scanX + 3 * dpr, gy); ctx.stroke()
        }
      }

      // Mesh lines (appear as dots settle)
      if (e > 0.55) {
        const meshP = easeOutCubic(Math.min((e - 0.55) / 0.35, 1))
        ctx.strokeStyle = `rgba(41,82,255,${meshP * 0.07})`
        ctx.lineWidth = 0.5 * dpr
        for (let i = 0; i < COLS - 1; i++) {
          for (let j = 0; j < ROWS; j++) {
            const a = positions[i * ROWS + j], b = positions[(i + 1) * ROWS + j]
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
          }
        }
        for (let i = 0; i < COLS; i++) {
          for (let j = 0; j < ROWS - 1; j++) {
            const a = positions[i * ROWS + j], b = positions[i * ROWS + j + 1]
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
          }
        }
      }

      // Dots
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          const idx = i * ROWS + j
          const [x, y] = positions[idx]
          const clashIdx = clashIndices.indexOf(idx)
          const isClash = clashIdx !== -1 && clashIdx < clashesVisible
          const pulse = Math.sin(t * 0.004 + idx * 0.8) * 0.5 + 0.5
          const gx = mx + i * cellW
          const locked = gx <= scanX

          if (isClash) {
            // Pulsing clash ring
            ctx.beginPath()
            ctx.arc(x, y, (10 + pulse * 6) * dpr, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(230,51,41,${0.15 + pulse * 0.12})`
            ctx.lineWidth = dpr; ctx.stroke()
            // Core dot
            ctx.beginPath(); ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(230,51,41,${0.75 + pulse * 0.25})`
            ctx.fill()
          } else {
            const dotE = locked ? 1 : 0
            const r = Math.round(lerp(160, 41, dotE))
            const g = Math.round(lerp(130, 82, dotE))
            const b = Math.round(lerp(100, 255, dotE))
            const alpha = lerp(0.22, 0.7, dotE)
            const size = lerp(1.4, 2.0, dotE) * dpr
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
            ctx.fill()
          }
        }
      }

      // Precision targeting reticle on active clashes
      if (clashesVisible > 0) {
        const reticleTargets = clashIndices.slice(0, Math.min(4, clashesVisible))
        for (const idx of reticleTargets) {
          const [x, y] = positions[idx]
          const pulse = Math.sin(t * 0.003 + idx) * 0.5 + 0.5
          const sz = (16 + pulse * 3) * dpr
          const arm = 5 * dpr
          ctx.strokeStyle = `rgba(230,51,41,${0.5 + pulse * 0.3})`
          ctx.lineWidth = dpr
          ctx.setLineDash([])
          // Corner bracket reticle
          const corners: [number,number][] = [[-1,-1],[1,-1],[1,1],[-1,1]]
          for (const [sx, sy] of corners) {
            ctx.beginPath(); ctx.moveTo(x + sx*sz, y + sy*sz); ctx.lineTo(x + sx*(sz-arm), y + sy*sz); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(x + sx*sz, y + sy*sz); ctx.lineTo(x + sx*sz, y + sy*(sz-arm)); ctx.stroke()
          }
          // Crosshair lines
          ctx.strokeStyle = `rgba(230,51,41,${0.18 + pulse * 0.1})`
          ctx.beginPath(); ctx.moveTo(x - sz*1.6, y); ctx.lineTo(x - sz*1.1, y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(x + sz*1.1, y); ctx.lineTo(x + sz*1.6, y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(x, y - sz*1.6); ctx.lineTo(x, y - sz*1.1); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(x, y + sz*1.1); ctx.lineTo(x, y + sz*1.6); ctx.stroke()
        }
      }

      // Phase text (bottom-left, above dimension lines)
      {
        let phaseText = ''
        let phaseAlpha = 0
        if (p > 0.04 && p < 0.38) {
          phaseText = 'SCANNING MODEL — LOCKING ELEMENT POSITIONS'
          phaseAlpha = easeOutCubic(Math.min((p - 0.04) / 0.1, 1)) * (1 - easeOutCubic(Math.max(0, (p - 0.3) / 0.08)))
        } else if (p >= 0.38 && p < 0.72) {
          phaseText = 'DETECTING CLASHES — RESOLVING INTERFERENCES'
          phaseAlpha = easeOutCubic(Math.min((p - 0.38) / 0.1, 1)) * (1 - easeOutCubic(Math.max(0, (p - 0.64) / 0.08)))
        } else if (p >= 0.72 && p < 0.86) {
          phaseText = 'VERIFYING CLEARANCES — CONFIRMING TOLERANCES'
          phaseAlpha = easeOutCubic(Math.min((p - 0.72) / 0.1, 1)) * (1 - easeOutCubic(Math.max(0, (p - 0.80) / 0.06)))
        }
        if (phaseText && phaseAlpha > 0) {
          ctx.font = `${7.5 * dpr}px "Space Mono", monospace`
          ctx.fillStyle = `rgba(41,82,255,${phaseAlpha * 0.7})`
          ctx.textAlign = 'left'
          ctx.fillText(phaseText, mx, my + gH + 38 * dpr)
        }
      }

      // Dimension lines (after 68%)
      if (p > 0.68) {
        const lp = easeOutCubic(Math.min((p - 0.68) / 0.22, 1))
        ctx.setLineDash([3 * dpr, 4 * dpr])
        ctx.strokeStyle = `rgba(41,82,255,${lp * 0.35})`
        ctx.lineWidth = dpr * 0.75

        // Horizontal span
        const dimY = my + gH + 22 * dpr
        ctx.beginPath(); ctx.moveTo(mx, dimY); ctx.lineTo(mx + gW * lp, dimY); ctx.stroke()
        if (lp > 0.05) { ctx.beginPath(); ctx.moveTo(mx, dimY - 5 * dpr); ctx.lineTo(mx, dimY + 5 * dpr); ctx.stroke() }
        if (lp > 0.96) { ctx.beginPath(); ctx.moveTo(mx + gW, dimY - 5 * dpr); ctx.lineTo(mx + gW, dimY + 5 * dpr); ctx.stroke() }

        // Vertical span
        const dimX = mx - 22 * dpr
        ctx.beginPath(); ctx.moveTo(dimX, my); ctx.lineTo(dimX, my + gH * lp); ctx.stroke()
        if (lp > 0.05) { ctx.beginPath(); ctx.moveTo(dimX - 5 * dpr, my); ctx.lineTo(dimX + 5 * dpr, my); ctx.stroke() }
        if (lp > 0.96) { ctx.beginPath(); ctx.moveTo(dimX - 5 * dpr, my + gH); ctx.lineTo(dimX + 5 * dpr, my + gH); ctx.stroke() }

        ctx.setLineDash([])

        if (lp > 0.85) {
          const ta = (lp - 0.85) / 0.15
          ctx.font = `${6.5 * dpr}px "Space Mono", monospace`
          ctx.fillStyle = `rgba(41,82,255,${ta * 0.55})`
          ctx.textAlign = 'center'
          ctx.fillText(`${(COLS - 1) * 8}'-0"  E/W  COORD SPAN`, mx + gW / 2, dimY + 13 * dpr)
          ctx.save()
          ctx.translate(dimX - 12 * dpr, my + gH / 2)
          ctx.rotate(-Math.PI / 2)
          ctx.textAlign = 'center'
          ctx.fillText(`${(ROWS - 1) * 8}'-0"  N/S`, 0, 0)
          ctx.restore()
        }
      }

      // Status panel (top right)
      const panW = 195 * dpr, panH = 82 * dpr
      const panX = W - panW - 16 * dpr, panY = 16 * dpr
      ctx.fillStyle = 'rgba(8,8,8,0.85)'
      ctx.fillRect(panX, panY, panW, panH)
      ctx.strokeStyle = clashesVisible > 0 ? 'rgba(230,51,41,0.3)' : 'rgba(41,82,255,0.35)'
      ctx.lineWidth = dpr; ctx.strokeRect(panX, panY, panW, panH)

      ctx.font = `${7 * dpr}px "Space Mono", monospace`
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.textAlign = 'left'
      ctx.fillText('COORDINATION STATUS', panX + 10 * dpr, panY + 17 * dpr)

      ctx.font = `bold ${26 * dpr}px "Space Mono", monospace`
      ctx.fillStyle = clashesVisible > 0 ? '#e63329' : '#2952ff'
      ctx.fillText(String(clashesVisible).padStart(2, '0'), panX + 10 * dpr, panY + 52 * dpr)

      ctx.font = `${7.5 * dpr}px "Space Mono", monospace`
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.fillText(clashesVisible > 0 ? 'ACTIVE CLASHES' : '✓ CLASH FREE', panX + 56 * dpr, panY + 50 * dpr)

      const barX = panX + 10 * dpr, barY = panY + 66 * dpr, barW = panW - 20 * dpr
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.fillRect(barX, barY, barW, 3 * dpr)
      const resolved = 1 - clashesVisible / CLASH_COUNT
      ctx.fillStyle = clashesVisible > 0 ? '#e63329' : '#2952ff'
      ctx.fillRect(barX, barY, barW * resolved, 3 * dpr)

      // Section label top left
      ctx.font = `${7 * dpr}px "Space Mono", monospace`
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.textAlign = 'left'
      ctx.fillText('MEP-COORD-VIZ-01  ·  REV.A  ·  MBT DESIGN GROUP', mx, my - 12 * dpr)

      // Resolved label (bottom center, clear of status panel)
      if (p > 0.85) {
        const cp = easeOutCubic(Math.min((p - 0.85) / 0.15, 1))
        ctx.font = `bold ${9 * dpr}px "Space Mono", monospace`
        ctx.fillStyle = `rgba(41,82,255,${cp * 0.9})`
        ctx.textAlign = 'center'
        ctx.fillText('✓  MODEL COORDINATED  —  FABRICATION READY', W / 2, H - my * 0.45)
      }

      // North arrow (bottom left)
      const ax = mx + 18 * dpr, ay = H - my * 0.55
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = dpr
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 18 * dpr); ctx.stroke()
      ctx.font = `${7 * dpr}px "Space Mono", monospace`
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.textAlign = 'center'
      ctx.fillText('N', ax, ay - 22 * dpr)

      rafRef.current = requestAnimationFrame(render)
    }

    render()
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current!) }
  }, [noise, clashIndices])

  return (
    <div ref={wrapRef} style={{ height: '300vh' }} className="relative">
      <div className="sticky top-16 h-[calc(100dvh-4rem)] bg-[#080808] flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-6 md:px-10 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/40">Coordination Field</span>
            <span className="hidden md:block font-mono text-[10px] tracking-wider text-white/18">BIM Clash Detection · Live Coordination Model</span>
          </div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/25">↓ SCROLL TO RESOLVE</span>
        </div>
        <canvas ref={canvasRef} className="flex-1 w-full block" />
        <div className="shrink-0 flex items-center justify-between px-6 md:px-10 py-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/25">MBT DESIGN — PRECISION OVER SPEED</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/25">ZERO SURPRISES</span>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { label: 'OBSERVE', desc: 'We audit your project scope, existing documentation, and team structure to build a coordination baseline. Nothing moves forward until we understand the full picture.' },
  { label: 'ADVISE', desc: 'Our engineers identify risks, coordination gaps, and optimization opportunities before work begins. We bring problems to the surface in the model — not on the job site.' },
  { label: 'EXECUTE', desc: 'Fully coordinated BIM deliverables, clash-free models, and fabrication-ready documentation. Every spool, hanger, and fitting accounted for before a single piece is cut.' },
  { label: 'VERIFY', desc: 'QA/QC review cycles ensure every deliverable meets specification and field tolerance requirements. We do not close out until the model and the field are reconciled.' },
]

const DIFFERENTIATORS = [
  {
    num: '01',
    title: 'Technology Meets Expertise',
    body: 'We seamlessly merge cutting-edge BIM technology, deep MEP expertise, and practical creativity. The result is coordination that solves real problems — not just a model that looks good on screen.',
  },
  {
    num: '02',
    title: 'Built to Disrupt',
    body: 'MBT was founded with a deliberate intent to revolutionize MEP design and construction norms. We do not follow industry conventions for their own sake — we push boundaries to deliver better outcomes.',
  },
  {
    num: '03',
    title: 'Veterans at the Helm',
    body: 'Our leadership team consists of industry veterans with a proven track record on complex projects. That experience informs every decision — from coordination strategy to how we staff and manage a project.',
  },
  {
    num: '04',
    title: 'Constructability as a Standard',
    body: 'Constructability, efficiency, and risk mitigation are not services we offer — they are the baseline of everything we produce. Every deliverable is evaluated against whether it actually works in the field.',
  },
]

const PILLARS = [
  {
    num: '01',
    title: 'Precision Over Speed',
    body: 'We take the time to do the coordination work correctly. A resolved model delivered on schedule is worth more than a fast deliverable that creates field problems.',
  },
  {
    num: '02',
    title: 'Fabrication First',
    body: 'Every decision in our coordination process is made with the fabrication shop in mind. Our documentation is designed to go directly to production without interpretation.',
  },
  {
    num: '03',
    title: 'Embedded Partnership',
    body: 'We function as an extension of your team. We learn your standards, your workflows, and your constraints — so our deliverables integrate seamlessly into your process.',
  },
  {
    num: '04',
    title: 'Zero Surprises',
    body: 'Clashes, interferences, and coordination issues are resolved in the model. The field team walks in with a resolved design and a clear scope — not a puzzle to solve.',
  },
]

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[#eeebe4]">
      <CustomCursor />

      <SiteNav />

      {/* Hero */}
      <div className="pt-16 border-b border-[#d4d0c8]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24 md:py-32">
          <Reveal>
            <div className="font-mono text-xs text-[#666] tracking-[0.3em] uppercase mb-6">Our Vision</div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-bold tracking-tight leading-[0.9] uppercase mb-8">
              <span className="text-[#2952ff]">BUILT</span><br />
              ON PRECISION
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[#555] max-w-xl text-sm leading-relaxed">
              MBT Design was built on a single belief — that the most valuable thing we can deliver is certainty. Certainty that the model is coordinated. Certainty that the documents are fabrication-ready. Certainty that the field team has what they need before they need it.<br /><br />Certainty about us.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Coordination Field */}
      <CertaintyField />

      {/* Pillars */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24 border-b border-[#d4d0c8]">
        <Reveal>
          <div className="font-mono text-xs text-[#666] tracking-[0.3em] uppercase mb-16">What We Stand For</div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {PILLARS.map((p, i) => (
            <Reveal key={p.num} delay={i * 80}>
              <div className={`border-[#d4d0c8] p-10 hover:bg-[#e6e2da] transition-colors duration-300 group
                ${i % 2 === 0 ? 'border-r' : ''}
                ${i < 2 ? 'border-b' : ''}
              `}>
                <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] mb-5">[{p.num}]</div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#111] mb-4 group-hover:text-[#2952ff] transition-colors duration-300">{p.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{p.body}</p>
                <div className="mt-8 h-px bg-[#e63329] opacity-40 w-8 group-hover:w-16 group-hover:opacity-80 transition-all duration-300" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* What Sets Us Apart */}
      <div className="bg-[#e6e2da] border-b border-[#d4d0c8]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24">
          <Reveal>
            <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] uppercase mb-3">DIFFERENTIATORS</div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-20">
              WHAT SETS US APART
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {DIFFERENTIATORS.map((d, i) => (
              <Reveal key={d.num} delay={i * 100}>
                <div className={`px-0 lg:px-10 first:pl-0 pb-12 lg:pb-0 ${i > 0 ? 'border-t md:border-t-0 lg:border-l border-[#d4d0c8] pt-12 lg:pt-0' : ''}`}>
                  <div className="font-mono text-[12px] text-[#e63329] tracking-[0.3em] mb-4">[{d.num}]</div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">{d.title}</h3>
                  <p className="text-xs text-[#444] leading-relaxed">{d.body}</p>
                  <div className="mt-8 h-px bg-[#e63329] opacity-40 w-8" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll phrases */}
      <div className="border-t border-[#d4d0c8]">
        <ScrollPhrases phrases={['RIGHT THERE WITH YOU', 'FOR THE WHOLE DESIGN']} />
      </div>

      {/* CTA */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24 text-center">
        <Reveal>
          <p className="font-mono text-xs text-[#666] tracking-[0.3em] uppercase mb-6">Ready to build?</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="text-[clamp(1.8rem,4vw,4rem)] font-bold tracking-tight uppercase mb-10">
            LET'S WORK<br />
            <span className="text-[#2952ff]">TOGETHER</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <FillButton href="mailto:info@mbtdesign.net" label="START CONVERSATION" />
        </Reveal>
      </div>

      {/* Footer strip */}
      <div className="border-t border-[#d4d0c8] py-8 px-6 md:px-10">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#999] tracking-[0.2em] uppercase">© MBT Design Group</span>
          <span className="font-mono text-[11px] text-[#999] tracking-[0.2em] uppercase">BIM · MEP · Constructability</span>
        </div>
      </div>
    </div>
  )
}
