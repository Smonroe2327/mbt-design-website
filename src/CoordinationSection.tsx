import { useEffect, useRef, useState } from 'react'

const W = 800
const H = 500

// Each note: svgX/Y = pin location in SVG coords, threshold = scroll % to appear
const NOTES = [
  {
    threshold: 0.12,
    svgX: 182, svgY: 148,
    label: 'CHW-S-01',
    system: 'CHILLED WATER SUPPLY',
    spec: '8" SCH-40 / 2" FIBER GLASS INSUL.',
    note: 'BOP EL. +11\'-2". Hanger at 10\'-0" O.C. Insulated OD 12.625" — verify clearance to adjacent HWS.',
    alert: false,
    quadrant: 'bl',
  },
  {
    threshold: 0.26,
    svgX: 260, svgY: 122,
    label: 'MEP-CLR-04',
    system: 'CLEARANCE VIOLATION',
    spec: 'CHW-S × W18×35 BOTTOM FLANGE',
    note: 'Insulated OD of 8" CHW-S conflicts with W18×35 bottom flange by 1.25". Reroute required — coordinate with structural.',
    alert: true,
    quadrant: 'tr',
  },
  {
    threshold: 0.42,
    svgX: 530, svgY: 130,
    label: 'HVAC-SA-01',
    system: 'SUPPLY AIR DUCT',
    spec: '30"×18" GI DUCT — LOW PRESSURE',
    note: 'TOP EL. +13\'-4". Duct route adjusted 6" east to maintain 2" clearance from structural beam web.',
    alert: false,
    quadrant: 'tr',
  },
  {
    threshold: 0.58,
    svgX: 390, svgY: 222,
    label: 'ELEC-TRAY-01',
    system: 'POWER CABLE TRAY',
    spec: '24"W × 4"D — 12 GA GALV.',
    note: 'BOP EL. +10\'-6". Tray route shifted 8" south at col. line 6 to clear sprinkler branch riser. Separate tray for data per NEC.',
    alert: false,
    quadrant: 'bl',
  },
  {
    threshold: 0.74,
    svgX: 598, svgY: 286,
    label: 'SPRK-WET-03',
    system: 'WET PIPE SPRINKLER MAIN',
    spec: '2" SCH-10 CPVC — ORDINARY HAZARD',
    note: 'CL EL. +9\'-8". Branch drop to pendent head at +9\'-0" FF. Coordinate with reflected ceiling grid at 9\'-0".',
    alert: false,
    quadrant: 'tr',
  },
  {
    threshold: 0.88,
    svgX: 350, svgY: 168,
    label: 'HHW-S-02',
    system: 'HEATING HOT WATER SUPPLY',
    spec: '4" SCH-40 / 1.5" MINERAL WOOL INSUL.',
    note: 'BOP EL. +11\'-8". Pair with HHW-R at 4" centers. Expansion loop required at col. line 6 — 14" offset.',
    alert: false,
    quadrant: 'tr',
  },
]

export default function CoordinationSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handler = () => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, -rect.top / total)))
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const activeNotes = NOTES.filter(n => progress >= n.threshold)

  return (
    <div ref={wrapRef} style={{ height: '500vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#eeebe4] flex flex-col">

        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between px-8 md:px-14 pt-6 pb-4 border-b border-[#d4d0c8]">
          <div>
            <div className="font-mono text-[10px] text-[#e63329] tracking-[0.3em] mb-0.5">LIVE COORDINATION REVIEW</div>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">
              MEP Section A — Clash Detection &amp; Resolution
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <Stat value={activeNotes.length} total={NOTES.length} label="NOTES REVEALED" />
            <Stat value={NOTES.filter(n => n.alert && progress >= n.threshold).length} total={1} label="CLASHES ACTIVE" alert />
            <div className="font-mono text-[10px] text-[#888888] tracking-widest">
              SCROLL {Math.round(progress * 100)}%
            </div>
          </div>
        </div>

        {/* Drawing area */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect width={W} height={H} fill="#f5f2eb" />
            <SectionView progress={progress} />
          </svg>

          {/* HTML annotation cards */}
          {NOTES.map(note => {
            const active = progress >= note.threshold
            const pxPct = (note.svgX / W) * 100
            const pyPct = (note.svgY / H) * 100
            const isRight = note.quadrant === 'tr' || note.quadrant === 'br'
            const isTop   = note.quadrant === 'tr' || note.quadrant === 'tl'
            return (
              <div key={note.label}
                className="absolute pointer-events-none"
                style={{ left: `${pxPct}%`, top: `${pyPct}%`, opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
                {/* Pin dot */}
                <div className="absolute w-3 h-3 rounded-full border-2 flex items-center justify-center"
                     style={{ left: -6, top: -6, borderColor: note.alert ? '#e63329' : '#1a1a1a', backgroundColor: note.alert ? '#e63329' : 'transparent', boxShadow: note.alert ? '0 0 10px rgba(230,51,41,0.5)' : 'none' }} />
                {/* Card */}
                <div style={{ position: 'absolute', [isTop ? 'bottom' : 'top']: 8, [isRight ? 'left' : 'right']: 10, width: 210 }}>
                  <div style={{ border: `1px solid ${note.alert ? '#e63329' : '#d4d0c8'}`, backgroundColor: note.alert ? 'rgba(230,51,41,0.08)' : 'rgba(245,242,235,0.97)', backdropFilter: 'blur(6px)', padding: '10px 12px' }}>
                    <div className="flex items-center gap-2 mb-1">
                      {note.alert && <span className="font-mono text-[8px] bg-[#e63329] text-white px-1.5 py-0.5 tracking-wider font-bold">CLASH</span>}
                      <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color: note.alert ? '#e63329' : '#1a1a1a' }}>{note.label}</span>
                    </div>
                    <div className="font-mono text-[8px] tracking-wider mb-1 uppercase" style={{ color: '#444444' }}>{note.system}</div>
                    <div className="font-mono text-[8px] tracking-wide mb-2" style={{ color: '#666666' }}>{note.spec}</div>
                    <div className="text-[9px] leading-relaxed border-t pt-1.5 mt-1" style={{ color: '#333333', borderColor: '#d4d0c8' }}>{note.note}</div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Scroll progress rail */}
          <div className="absolute right-3 top-3 bottom-3 w-px bg-[#d4d0c8]">
            <div className="absolute top-0 left-0 w-full bg-[#e63329]" style={{ height: `${progress * 100}%` }} />
            {NOTES.map(n => (
              <div key={n.label} className="absolute -left-1 w-3 h-px"
                   style={{ top: `${n.threshold * 100}%`, backgroundColor: progress >= n.threshold ? (n.alert ? '#e63329' : '#1a1a1a') : '#cccccc' }} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-8 md:px-14 py-2.5 border-t border-[#d4d0c8]">
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase" style={{ color: '#777777' }}>
            {progress < 0.99 ? '↓  SCROLL TO REVEAL COORDINATION NOTES' : '✓  ALL COORDINATION NOTES REVEALED'}
          </span>
          <span className="font-mono text-[8px] tracking-widest" style={{ color: '#666666' }}>
            SECTION A-A  |  SCALE: 1½" = 1'-0"  |  DWG MEP-COO-A101  |  REV.04
          </span>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, total, label, alert = false }: { value: number; total: number; label: string; alert?: boolean }) {
  return (
    <div className="text-right">
      <div className={`font-mono text-xl font-bold leading-none ${alert && value > 0 ? 'text-[#e63329]' : 'text-[#1a1a1a]'}`}>
        {value}<span className="font-normal text-sm" style={{ color: '#777777' }}>/{total}</span>
      </div>
      <div className="font-mono text-[8px] tracking-[0.2em] mt-0.5" style={{ color: '#777777' }}>{label}</div>
    </div>
  )
}

// ── Accurate 2D MEP Section View ─────────────────────────────────────────────
function SectionView({ progress }: { progress: number }) {
  const S = '#1a1a1a'    // primary stroke
  const D = '#555555'    // dim stroke
  const F = '#999999'    // faint
  const R = '#e63329'    // red/alert

  // Layout constants (SVG px)
  const LEFT  = 90   // left margin (column line 5)
  const RIGHT = 740  // right margin (column line 6)
  const SLAB_TOP = 48
  const SLAB_BOT = 78
  const BEAM_TOP = SLAB_BOT
  const BEAM_BOT = 178   // 18" deep beam @ ~6px/in
  const BEAM_CX  = 415
  const BEAM_TFW = 90    // top/bot flange half-width
  const BEAM_WEB = 5     // web half-width
  const CEIL_Y   = 360   // ceiling grid line
  const FLOOR_Y  = 430

  // Pipe centers
  const CHW_S = { cx: 182, cy: 155, r: 18, ins: 27 }   // 8" pipe, 2" insul
  const CHW_R = { cx: 182, cy: 210, r: 18, ins: 27 }
  const HWS   = { cx: 352, cy: 158, r: 10, ins: 16 }   // 4" pipe, 1.5" insul
  const HWR   = { cx: 352, cy: 198, r: 10, ins: 16 }
  const CWS   = { cx: 430, cy: 215, r:  6, ins:  9 }   // 2" pipe
  const SPRK  = { cx: 598, cy: 286, r:  5 }             // 2" sprinkler

  // Duct bounds
  const DUCT_SA = { x1: 460, y1: 100, x2: 728, y2: 154 }   // 30"×18" supply
  const DUCT_RA = { x1: 460, y1: 162, x2: 728, y2: 204 }   // 24"×14" return

  // Cable tray
  const CT = { x1: 110, y1: 234, x2: 420, y2: 252 }

  // Clash active flag
  const clashActive = progress >= 0.26

  return (
    <g fontFamily="Space Mono,monospace">

      {/* ── Column grid lines ── */}
      <line x1={LEFT}  y1={30}  x2={LEFT}  y2={FLOOR_Y} stroke='#444444' strokeWidth="0.6" strokeDasharray="6 4" />
      <line x1={RIGHT} y1={30}  x2={RIGHT} y2={FLOOR_Y} stroke='#444444' strokeWidth="0.6" strokeDasharray="6 4" />
      {/* Grid bubbles top */}
      <GridBubble x={LEFT}  y={22} label="5" />
      <GridBubble x={RIGHT} y={22} label="6" />
      {/* Grid bubbles bottom */}
      <GridBubble x={LEFT}  y={FLOOR_Y + 8} label="5" />
      <GridBubble x={RIGHT} y={FLOOR_Y + 8} label="6" />

      {/* ── Concrete slab (crosshatched) ── */}
      <rect x={LEFT - 10} y={SLAB_TOP} width={RIGHT - LEFT + 20} height={SLAB_BOT - SLAB_TOP}
            fill="#ccc8c0" stroke={S} strokeWidth="0.8" />
      {/* Diagonal hatch */}
      {Array.from({ length: 28 }, (_, i) => {
        const x = LEFT - 10 + i * 24
        return <line key={i} x1={x} y1={SLAB_TOP} x2={x - 26} y2={SLAB_BOT} stroke='#aaa8a0' strokeWidth="0.4" />
      })}
      <text x={(LEFT + RIGHT) / 2} y={SLAB_TOP - 6} textAnchor="middle" fontSize="6" fill='#555555' letterSpacing="2">
        CONCRETE SLAB — 6" NW (12" TOTAL DEPTH)
      </text>

      {/* ── Steel beam W18×35 (I-beam profile) ── */}
      {/* Top flange */}
      <rect x={BEAM_CX - BEAM_TFW} y={BEAM_TOP} width={BEAM_TFW * 2} height={8}
            fill="#d8d4cc" stroke={S} strokeWidth="0.9" />
      {/* Web */}
      <rect x={BEAM_CX - BEAM_WEB} y={BEAM_TOP + 8} width={BEAM_WEB * 2} height={BEAM_BOT - BEAM_TOP - 16}
            fill="#dedad2" stroke={S} strokeWidth="0.9" />
      {/* Bottom flange */}
      <rect x={BEAM_CX - BEAM_TFW} y={BEAM_BOT - 8} width={BEAM_TFW * 2} height={8}
            fill="#d8d4cc" stroke={S} strokeWidth="0.9" />
      {/* Label */}
      <text x={BEAM_CX} y={BEAM_BOT + 14} textAnchor="middle" fontSize="6.5" fill='#cccccc' letterSpacing="1">W18×35</text>

      {/* ── HVAC Supply Duct 30"×18" ── */}
      <rect x={DUCT_SA.x1} y={DUCT_SA.y1} width={DUCT_SA.x2 - DUCT_SA.x1} height={DUCT_SA.y2 - DUCT_SA.y1}
            fill="#e6e2da" stroke={S} strokeWidth="1.1" />
      {/* X cross inside duct (indicates duct going into page) */}
      <line x1={DUCT_SA.x1} y1={DUCT_SA.y1} x2={DUCT_SA.x2} y2={DUCT_SA.y2} stroke='#aaaaaa' strokeWidth="0.5" />
      <line x1={DUCT_SA.x2} y1={DUCT_SA.y1} x2={DUCT_SA.x1} y2={DUCT_SA.y2} stroke='#aaaaaa' strokeWidth="0.5" />
      {/* Label */}
      <text x={(DUCT_SA.x1 + DUCT_SA.x2) / 2} y={(DUCT_SA.y1 + DUCT_SA.y2) / 2 - 4} textAnchor="middle" fontSize="6" fill={S} letterSpacing="0.5">SA-1</text>
      <text x={(DUCT_SA.x1 + DUCT_SA.x2) / 2} y={(DUCT_SA.y1 + DUCT_SA.y2) / 2 + 7} textAnchor="middle" fontSize="5.5" fill='#cccccc'>30"×18"</text>

      {/* ── HVAC Return Duct 24"×14" ── */}
      <rect x={DUCT_RA.x1} y={DUCT_RA.y1} width={DUCT_RA.x2 - DUCT_RA.x1} height={DUCT_RA.y2 - DUCT_RA.y1}
            fill="#ccc8c0" stroke='#aaaaaa' strokeWidth="0.9" />
      <line x1={DUCT_RA.x1} y1={DUCT_RA.y1} x2={DUCT_RA.x2} y2={DUCT_RA.y2} stroke='#aaa8a0' strokeWidth="0.4" />
      <line x1={DUCT_RA.x2} y1={DUCT_RA.y1} x2={DUCT_RA.x1} y2={DUCT_RA.y2} stroke='#aaa8a0' strokeWidth="0.4" />
      <text x={(DUCT_RA.x1 + DUCT_RA.x2) / 2} y={(DUCT_RA.y1 + DUCT_RA.y2) / 2 - 3} textAnchor="middle" fontSize="5.5" fill='#cccccc'>RA-1  24"×14"</text>

      {/* ── Cable Tray ── */}
      {/* Tray sides */}
      <line x1={CT.x1} y1={CT.y1} x2={CT.x2} y2={CT.y1} stroke={S} strokeWidth="0.8" />
      <line x1={CT.x1} y1={CT.y2} x2={CT.x2} y2={CT.y2} stroke={S} strokeWidth="0.8" />
      <line x1={CT.x1} y1={CT.y1} x2={CT.x1} y2={CT.y2} stroke={S} strokeWidth="0.8" />
      <line x1={CT.x2} y1={CT.y1} x2={CT.x2} y2={CT.y2} stroke='#aaaaaa' strokeWidth="0.8" />
      {/* Rungs */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = CT.x1 + 10 + i * 26
        if (x > CT.x2 - 10) return null
        return <line key={i} x1={x} y1={CT.y1} x2={x} y2={CT.y2} stroke='#aaaaaa' strokeWidth="0.5" />
      })}
      <text x={(CT.x1 + CT.x2) / 2} y={CT.y2 + 11} textAnchor="middle" fontSize="6" fill='#cccccc' letterSpacing="0.5">CT-1  24"W × 4"D</text>

      {/* ── Conduit bundle (near cable tray) ── */}
      {[{cx: 130, cy: 224}, {cx: 144, cy: 224}, {cx: 130, cy: 238}, {cx: 144, cy: 238}].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={c.cy} r={5} fill="#e0dcd4" stroke='#888888' strokeWidth="0.6" />
        </g>
      ))}
      <text x={137} y={254} textAnchor="middle" fontSize="5" fill='#555555'>1½" EMT</text>

      {/* ── Pipes ── */}
      {/* CHW Supply */}
      <Pipe {...CHW_S} label="CHW-S" size='8"' stroke={S} />
      {/* CHW Return */}
      <Pipe {...CHW_R} label="CHW-R" size='8"' stroke='#aaaaaa' />
      {/* HWS */}
      <Pipe {...HWS} label="HWS" size='4"' stroke='#aaaaaa' />
      {/* HWR */}
      <Pipe {...HWR} label="HWR" size='4"' stroke='#aaaaaa' />
      {/* CWS */}
      <Pipe {...CWS} label="CWS" size='2"' stroke='#444444' />
      {/* Sprinkler main */}
      <Pipe {...SPRK} r={5} label="SPRK" size='2"' stroke='#444444' />

      {/* ── Sprinkler pendant drops ── */}
      {[490, 560, 630, 700].map(x => (
        <g key={x}>
          <line x1={x} y1={CEIL_Y} x2={x} y2={CEIL_Y + 30} stroke='#aaaaaa' strokeWidth="0.5" />
          <line x1={x - 8} y1={CEIL_Y + 30} x2={x + 8} y2={CEIL_Y + 30} stroke='#aaaaaa' strokeWidth="0.8" />
        </g>
      ))}

      {/* ── Hanger rods (triangle anchors to slab) ── */}
      {[182, 352, 530, 598].map(x => (
        <g key={x}>
          <line x1={x} y1={SLAB_BOT} x2={x} y2={SLAB_BOT + 20} stroke='#aaaaaa' strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx={x} cy={SLAB_BOT + 22} r={3} fill="none" stroke='#aaaaaa' strokeWidth="0.5" />
        </g>
      ))}

      {/* ── Elevation markers (right side) ── */}
      <ElevMarker x={LEFT - 12} y={SLAB_BOT}  label={"+15'-6\" FF"} />
      <ElevMarker x={LEFT - 12} y={BEAM_BOT}  label={"+13'-0\" BOS"} />
      <ElevMarker x={LEFT - 12} y={CHW_S.cy}  label={"+11'-3\" CL"} />
      <ElevMarker x={LEFT - 12} y={CT.y1}     label={"+10'-6\" BOP"} />
      <ElevMarker x={LEFT - 12} y={CEIL_Y}    label={"+9'-0\" CLG"} />
      <ElevMarker x={LEFT - 12} y={FLOOR_Y}   label={"0'-0\" FF"} />

      {/* ── Ceiling grid (dashed) ── */}
      <line x1={LEFT} y1={CEIL_Y} x2={RIGHT} y2={CEIL_Y} stroke="#c8c4bc" strokeWidth="0.8" strokeDasharray="12 6" />
      <text x={LEFT + 6} y={CEIL_Y - 4} fontSize="6" fill="#888" letterSpacing="1">SUSPENDED ACOUSTICAL CEILING  EL. +9'-0"</text>

      {/* ── Finished floor ── */}
      {/* Hatched floor slab */}
      <rect x={LEFT - 10} y={FLOOR_Y} width={RIGHT - LEFT + 20} height={14}
            fill="#ccc8c0" stroke='#aaaaaa' strokeWidth="0.5" />
      {Array.from({ length: 28 }, (_, i) => {
        const x = LEFT - 10 + i * 24
        return <line key={i} x1={x} y1={FLOOR_Y} x2={x - 14} y2={FLOOR_Y + 14} stroke='#aaa8a0' strokeWidth="0.35" />
      })}

      {/* ── Section cut symbol ── */}
      <SectionMark x={LEFT - 22} y1={SLAB_TOP + 10} y2={FLOOR_Y - 10} label="A" />

      {/* ── Dimension string (bay width) ── */}
      <DimString x1={LEFT} x2={RIGHT} y={FLOOR_Y + 28} label={"25'-0\"  CLEAR BAY WIDTH"} />

      {/* ── Clash indicator (appears at progress 0.26) ── */}
      {clashActive && (
        <g>
          <circle cx={CHW_S.cx} cy={CHW_S.cy - CHW_S.ins + 3} r={32}
                  fill="none" stroke={R} strokeWidth="1" strokeDasharray="4 2" opacity="0.8" />
          <circle cx={CHW_S.cx} cy={CHW_S.cy - CHW_S.ins + 3} r={32}
                  fill={R} fillOpacity="0.06" />
          {/* "X" clash marker */}
          <line x1={CHW_S.cx - 8} y1={BEAM_BOT - 14} x2={CHW_S.cx + 8} y2={BEAM_BOT - 2} stroke={R} strokeWidth="1.2" />
          <line x1={CHW_S.cx + 8} y1={BEAM_BOT - 14} x2={CHW_S.cx - 8} y2={BEAM_BOT - 2} stroke={R} strokeWidth="1.2" />
          <text x={CHW_S.cx + 14} y={BEAM_BOT - 2} fontSize="6" fill={R} letterSpacing="0.5" fontWeight="700">CLASH</text>
        </g>
      )}

      {/* ── Title block ── */}
      <rect x={LEFT} y={H - 38} width={RIGHT - LEFT} height={30} fill="none" stroke="#bbb8b0" strokeWidth="0.5" />
      <line x1={LEFT} y1={H - 24} x2={RIGHT} y2={H - 24} stroke="#bbb8b0" strokeWidth="0.3" />
      <text x={LEFT + 8} y={H - 28} fontSize="7" fill={'#1a1a1a'} letterSpacing="1.2">MBT DESIGN GROUP  —  MEP SECTION A-A</text>
      <text x={LEFT + 8} y={H - 14} fontSize="5.5" fill='#555555' letterSpacing="0.8">PROJECT: HOUSTON MEDICAL CENTER  |  DWG: MEP-COO-A101  |  REV. 04  |  DATE: 2024-09</text>

      {/* ── North arrow ── */}
      <g transform={`translate(${RIGHT + 20}, 60)`}>
        <circle r={14} fill="none" stroke='#444444' strokeWidth="0.6" />
        <polygon points="0,-11 3,5 0,2 -3,5" fill='#cccccc' />
        <text textAnchor="middle" y={7} fontSize="6" fill='#555555'>N</text>
      </g>

    </g>
  )
}

// ── Pipe cross-section symbol ─────────────────────────────────────────────────
function Pipe({ cx, cy, r, ins, label, size, stroke }: {
  cx: number; cy: number; r: number; ins?: number; label: string; size: string; stroke: string
}) {
  return (
    <g>
      {/* Insulation (dashed outer circle) */}
      {ins && (
        <circle cx={cx} cy={cy} r={ins} fill="none" stroke={stroke} strokeWidth="0.5" strokeDasharray="3 2" opacity="0.5" />
      )}
      {/* Pipe wall */}
      <circle cx={cx} cy={cy} r={r} fill="#f0ede6" stroke={stroke} strokeWidth="0.9" />
      {/* Centerline crosshairs */}
      <line x1={cx - r - 5} y1={cy} x2={cx + r + 5} y2={cy} stroke={stroke} strokeWidth="0.3" strokeDasharray="3 2" opacity="0.5" />
      <line x1={cx} y1={cy - r - 5} x2={cx} y2={cy + r + 5} stroke={stroke} strokeWidth="0.3" strokeDasharray="3 2" opacity="0.5" />
      {/* Label */}
      <text x={cx} y={cy - r - (ins ? ins - r + 6 : 8)} textAnchor="middle"
            fontSize="6" fill={stroke} fontWeight="700" letterSpacing="0.5">{label}</text>
      <text x={cx} y={cy + r + (ins ? ins - r + 10 : 10)} textAnchor="middle"
            fontSize="5.5" fill={stroke} opacity="0.7">{size}</text>
    </g>
  )
}

// ── Elevation marker (left rail) ─────────────────────────────────────────────
function ElevMarker({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 14} y2={y} stroke="#999" strokeWidth="0.5" />
      <text x={x - 2} y={y + 3} textAnchor="end" fontSize="5.5" fill="#444" letterSpacing="0.3">{label}</text>
    </g>
  )
}

// ── Section cut marker ────────────────────────────────────────────────────────
function SectionMark({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y1 + 16} x2={x} y2={y2 - 16} stroke="#999" strokeWidth="0.5" strokeDasharray="4 3" />
      <circle cx={x} cy={y1 + 8} r={8} fill="#dedad2" stroke="#888" strokeWidth="0.5" />
      <text x={x} y={y1 + 11} textAnchor="middle" fontSize="6" fill="#444" fontWeight="700">{label}</text>
      <circle cx={x} cy={y2 - 8} r={8} fill="#dedad2" stroke="#888" strokeWidth="0.5" />
      <text x={x} y={y2 - 5} textAnchor="middle" fontSize="6" fill="#444" fontWeight="700">{label}</text>
    </g>
  )
}

// ── Dimension string ──────────────────────────────────────────────────────────
function DimString({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke="#999" strokeWidth="0.5" />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke="#999" strokeWidth="0.5" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#999" strokeWidth="0.5" />
      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize="6" fill="#444" letterSpacing="0.5">{label}</text>
    </g>
  )
}

// ── Column grid bubble ────────────────────────────────────────────────────────
function GridBubble({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="#dedad2" stroke="#888" strokeWidth="0.6" />
      <text x={x} y={y + 3} textAnchor="middle" fontSize="7" fill="#444" fontWeight="700">{label}</text>
    </g>
  )
}
