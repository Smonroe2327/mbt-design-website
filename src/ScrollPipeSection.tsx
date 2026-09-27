import { useEffect, useRef, useState } from 'react'

const S = 16, OX = 210, OY = 420, C = 0.8660254
const VW = 700, VH = 490
const PIPE_U   = 4.5
const RACK_E_END = 18
const BENT_ES  = [0, 4.5, 9, 13.5, 18]

function iso(e: number, n: number, u: number): [number, number] {
  return [OX + (e - n) * S * C, OY - (e + n) * S * 0.5 - u * S]
}
function f(v: number) { return v.toFixed(1) }

// Segment: iso-space [e,n,u] coords + tube radius
type Seg = { from: [number,number,number]; to: [number,number,number]; r: number }

// Isometric ellipse end-cap polygon (16 pts, correct for N-U plane / approx for others)
function capPoints(cx: number, cy: number, r: number): string {
  const N = 16, k = 1.1547 // 1/cos30°
  return Array.from({ length: N }, (_, i) => {
    const θ = (i / N) * Math.PI * 2
    return `${f(cx - r * Math.cos(θ))},${f(cy - r * (0.577 * Math.cos(θ) + k * Math.sin(θ)))}`
  }).join(' ')
}

// Cylindrical pipe — layered shading + end caps
function CylPipe({ a, b, r, col, weight = 1.4, flowDur, capA = true, capB = false }: {
  a: [number,number]; b: [number,number]; r: number
  col: string; weight?: number; flowDur?: string
  capA?: boolean; capB?: boolean
}) {
  const dx = b[0]-a[0], dy = b[1]-a[1]
  const len = Math.sqrt(dx*dx+dy*dy)
  if (len < 0.1) return null
  const nx = (-dy/len)*r, ny = (dx/len)*r  // perpendicular offset (bottom side)
  const [ax,ay,bx,by] = [a[0],a[1],b[0],b[1]]

  const body   = `M${f(ax-nx)},${f(ay-ny)} L${f(bx-nx)},${f(by-ny)} L${f(bx+nx)},${f(by+ny)} L${f(ax+nx)},${f(ay+ny)}Z`
  const shadow = `M${f(ax)},${f(ay)} L${f(bx)},${f(by)} L${f(bx+nx)},${f(by+ny)} L${f(ax+nx)},${f(ay+ny)}Z`
  const shine  = `M${f(ax-nx)},${f(ay-ny)} L${f(bx-nx)},${f(by-ny)} L${f(bx-nx*0.35)},${f(by-ny*0.35)} L${f(ax-nx*0.35)},${f(ay-ny*0.35)}Z`

  return (
    <g>
      {/* Rear end cap (B side — mostly hidden, draw first) */}
      {capB && <polygon points={capPoints(bx,by,r)} fill={col} fillOpacity={0.25} stroke={col} strokeWidth={weight*0.6} />}

      {/* Body: base tint */}
      <path d={body} fill={col} fillOpacity={0.13} />
      {/* Shadow belly — bottom half darker */}
      <path d={shadow} fill={col} fillOpacity={0.28} />
      {/* Rim strokes */}
      <line x1={f(ax+nx)} y1={f(ay+ny)} x2={f(bx+nx)} y2={f(by+ny)} stroke={col} strokeWidth={weight} strokeOpacity={0.85} />
      <line x1={f(ax-nx)} y1={f(ay-ny)} x2={f(bx-nx)} y2={f(by-ny)} stroke={col} strokeWidth={weight*0.7} strokeOpacity={0.6} />
      {/* Highlight strip */}
      <path d={shine} fill="rgba(255,255,255,0.13)" />
      {/* Specular top edge */}
      <line x1={f(ax-nx)} y1={f(ay-ny)} x2={f(bx-nx)} y2={f(by-ny)}
        stroke="rgba(255,255,255,0.55)" strokeWidth={weight*0.45} />

      {/* Front end cap (A side — visible face) */}
      {capA && (
        <g>
          <polygon points={capPoints(ax,ay,r)} fill={col} fillOpacity={0.35} stroke={col} strokeWidth={weight*0.7} />
          {/* Cap highlight arc */}
          <line x1={f(ax-nx)} y1={f(ay-ny)} x2={f(ax-nx*0.1)} y2={f(ay-ny*0.1)}
            stroke="rgba(255,255,255,0.45)" strokeWidth={weight*0.5} />
        </g>
      )}

      {/* Flow dash */}
      {flowDur && (
        <line x1={f(ax)} y1={f(ay)} x2={f(bx)} y2={f(by)}
          stroke={col} strokeOpacity={0.65} strokeWidth={weight*0.55}
          strokeDasharray="10 5" fill="none">
          <animate attributeName="stroke-dashoffset" from="15" to="0" dur={flowDur} repeatCount="indefinite" />
        </line>
      )}
    </g>
  )
}

// Flanged pipe termination — double ring
function FlangeCap({ at, dir, r, col }: { at:[number,number]; dir:[number,number]; r:number; col:string }) {
  const [dx,dy] = dir, len = Math.sqrt(dx*dx+dy*dy)
  const nx = (-dy/len)*r, ny = (dx/len)*r
  const fr = 1.35  // flange oversize factor
  return (
    <g>
      <polygon points={capPoints(at[0], at[1], r)} fill={col} fillOpacity={0.25} stroke={col} strokeWidth={1.5} />
      {/* Flange ring (wider) */}
      <line x1={f(at[0]+nx*fr)} y1={f(at[1]+ny*fr)} x2={f(at[0]-nx*fr)} y2={f(at[1]-ny*fr)}
        stroke={col} strokeWidth={2.5} strokeLinecap="square" opacity={0.9} />
      <line x1={f(at[0]+nx*fr)} y1={f(at[1]+ny*fr)} x2={f(at[0]-nx*fr)} y2={f(at[1]-ny*fr)}
        stroke={col} strokeWidth={4.5} strokeLinecap="square" opacity={0.15} />
      {/* Second ring (bolts) */}
      <line x1={f(at[0]+nx*fr*0.9)} y1={f(at[1]+ny*fr*0.9)} x2={f(at[0]-nx*fr*0.9)} y2={f(at[1]-ny*fr*0.9)}
        stroke={col} strokeWidth={1} opacity={0.5} />
    </g>
  )
}

// ── Pipe systems — main runs + realistic connections ───────────────────────────
const SYSTEMS = [
  {
    id: 'CHW', threshold: 0.10,
    color: '#2196f3', flowDur: '1.1s',
    name: 'CHILLER WATER', abbr: 'CHW-S / CHW-R',
    pipes: [{ n: 0.25, r: 12, label: 'CHW-S' }, { n: 1.65, r: 12, label: 'CHW-R' }],
    tagN: 0.25,
    spec: '8" NOM — A106 GR.B — SCH 40 — 3" FOAM GLASS INSUL.',
    note: 'Primary chiller loop, 44°F / 54°F. Largest pipes on rack — 200+ GPM design. Foam glass insulation with ASJ jacket. Vapor barrier critical at all penetrations.',
    extras: [
      // Entry: vertical risers from chiller room below at E=0
      { from: [0, 0.25, 0],      to: [0, 0.25, PIPE_U],    r: 11 },
      { from: [0, 1.65, 0],      to: [0, 1.65, PIPE_U],    r: 11 },
      // Exit: 90° turn N at E=18, then vertical drops to AHU
      { from: [18, 0.25, PIPE_U], to: [18, 5.5, PIPE_U],   r: 11 },
      { from: [18, 1.65, PIPE_U], to: [18, 5.5, PIPE_U],   r: 11 },
      { from: [18, 5.5, PIPE_U],  to: [18, 5.5, 0],        r: 11 },
      // Cross-header connecting supply & return at exit N point
      { from: [18, 0.25, PIPE_U], to: [18, 1.65, PIPE_U],  r: 6  },
    ] as Seg[],
    flanges: [
      { at: [0, 0.25, 0],  r: 11 },
      { at: [0, 1.65, 0],  r: 11 },
      { at: [18, 5.5, 0],  r: 11 },
    ],
  },
  {
    id: 'HW', threshold: 0.26,
    color: '#e84040', flowDur: '0.75s',
    name: 'HOT WATER SYSTEM', abbr: 'HW-S / HW-R',
    pipes: [{ n: 3.2, r: 8, label: 'HW-S' }, { n: 4.15, r: 7, label: 'HW-R' }],
    tagN: 3.2,
    spec: '4" NOM — A53 GR.B — SCH 40 — 2" MIN. WOOL INSUL.',
    note: '180°F supply / 160°F return. Expansion loops at col. bays 2 and 4. Insulated and jacketed. Spring hangers at equipment connections.',
    extras: [
      // Entry: horizontal from boiler room at E<0 (pipe enters from side)
      { from: [-3, 3.2,  PIPE_U], to: [0, 3.2,  PIPE_U], r: 7 },
      { from: [-3, 4.15, PIPE_U], to: [0, 4.15, PIPE_U], r: 6 },
      // Mid-rack AHU drops at E=9 bent
      { from: [9, 3.2,  PIPE_U], to: [9, 3.2,  0.8], r: 5 },
      { from: [9, 4.15, PIPE_U], to: [9, 4.15, 0.8], r: 4 },
      // Exit: turn N then drop
      { from: [18, 3.2,  PIPE_U], to: [18, 7, PIPE_U], r: 7 },
      { from: [18, 4.15, PIPE_U], to: [18, 7, PIPE_U], r: 6 },
      { from: [18, 7,    PIPE_U], to: [18, 7, 0],      r: 6 },
    ] as Seg[],
    flanges: [
      { at: [-3, 3.2,  PIPE_U], r: 7 },
      { at: [-3, 4.15, PIPE_U], r: 6 },
      { at: [9,  3.2,  0.8],    r: 5 },
      { at: [9,  4.15, 0.8],    r: 4 },
      { at: [18, 7,    0],      r: 6 },
    ],
  },
  {
    id: 'CW', threshold: 0.42,
    color: '#26a69a', flowDur: '1.3s',
    name: 'CONDENSER WATER', abbr: 'CW-S / CW-R',
    pipes: [{ n: 5.3, r: 10, label: 'CW-S' }, { n: 6.5, r: 10, label: 'CW-R' }],
    tagN: 5.3,
    spec: '6" NOM — A53 GR.B — SCH 40 — UN-INSULATED',
    note: 'Open cooling tower loop, 85°F / 95°F. Strainer at each AHU connection. Non-oxidizing biocide program. Blowdown at bent 4.',
    extras: [
      // Entry: come from side (tower is to the left)
      { from: [-4, 5.3, PIPE_U], to: [0, 5.3, PIPE_U], r: 9 },
      { from: [-4, 6.5, PIPE_U], to: [0, 6.5, PIPE_U], r: 9 },
      // Mid-rack drop at E=13.5 — supply branch to chiller
      { from: [13.5, 5.3, PIPE_U], to: [13.5, 5.3, 0], r: 6 },
      // Exit: long N extension to cooling tower
      { from: [18, 5.3, PIPE_U], to: [18, 10.5, PIPE_U], r: 9 },
      { from: [18, 6.5, PIPE_U], to: [18, 10.5, PIPE_U], r: 9 },
    ] as Seg[],
    flanges: [
      { at: [-4, 5.3, PIPE_U],   r: 9 },
      { at: [-4, 6.5, PIPE_U],   r: 9 },
      { at: [13.5, 5.3, 0],      r: 6 },
      { at: [18, 10.5, PIPE_U],  r: 9 },
    ],
  },
  {
    id: 'GLY', threshold: 0.57,
    color: '#ab47bc', flowDur: '0.9s',
    name: 'GLYCOL SYSTEM', abbr: 'GLY-S / GLY-R',
    pipes: [{ n: 7.7, r: 5, label: 'GLY-S' }, { n: 8.4, r: 5, label: 'GLY-R' }],
    tagN: 7.7,
    spec: '2" NOM — SS 316L — SCH 10S — 1.5" FOAM INSUL.',
    note: '25% Propylene Glycol. Secondary coil cross-connects. Stainless steel throughout. Sample port every 50\'–0".',
    extras: [
      // Entry: vertical riser at E=0 from glycol mixing skid below
      { from: [0, 7.7, 0], to: [0, 7.7, PIPE_U], r: 4 },
      { from: [0, 8.4, 0], to: [0, 8.4, PIPE_U], r: 4 },
      // Mid-rack branch at E=6 turning N then dropping — secondary coil
      { from: [6, 7.7, PIPE_U], to: [6, 10, PIPE_U], r: 3 },
      { from: [6, 10,  PIPE_U], to: [6, 10, 1.5],    r: 3 },
      // Exit: blind flanged ends (no extension, just caps)
    ] as Seg[],
    flanges: [
      { at: [0,  7.7, 0],    r: 4 },
      { at: [0,  8.4, 0],    r: 4 },
      { at: [6,  10,  1.5],  r: 3 },
      { at: [18, 7.7, PIPE_U], r: 4 },
      { at: [18, 8.4, PIPE_U], r: 4 },
    ],
  },
  {
    id: 'WAS', threshold: 0.72,
    color: '#90a4ae', flowDur: '2.0s',
    name: 'PROCESS WASTE', abbr: 'P-WASTE / DRAIN',
    pipes: [{ n: 9.3, r: 8, label: 'P-WASTE' }, { n: 10.2, r: 5, label: 'DRAIN' }],
    tagN: 9.3,
    spec: '4" / 2" NOM — PVC SCH 40 — GRAVITY DRAIN',
    note: 'Process waste collected at sumps, gravity to treatment. Cleanout at every bend. Confirm slope 1/8" per foot min.',
    extras: [
      // Multiple drops along rack at collection points
      { from: [4.5,  9.3, PIPE_U], to: [4.5,  9.3,  0], r: 6 },
      { from: [4.5, 10.2, PIPE_U], to: [4.5, 10.2,  0], r: 4 },
      { from: [13.5, 9.3, PIPE_U], to: [13.5, 9.3,  0], r: 6 },
      // Exit: both pipes converge then drop to sump
      { from: [18, 9.3,  PIPE_U], to: [18, 9.3,  0], r: 7 },
      { from: [18, 10.2, PIPE_U], to: [18, 10.2, 0], r: 4 },
    ] as Seg[],
    flanges: [
      { at: [4.5,  9.3,  0], r: 6 },
      { at: [4.5,  10.2, 0], r: 4 },
      { at: [13.5, 9.3,  0], r: 6 },
      { at: [18,   9.3,  0], r: 7 },
      { at: [18,  10.2,  0], r: 4 },
    ],
  },
  {
    id: 'CHM', threshold: 0.87,
    color: '#ffca28', flowDur: '0.55s',
    name: 'CHEMICAL LINES', abbr: 'CHEM-A / CHEM-B',
    pipes: [{ n: 11.1, r: 4, label: 'CHEM-A' }, { n: 11.7, r: 3, label: 'CHEM-B' }],
    tagN: 11.1,
    spec: '1.5" / 1" NOM — CPVC SCH 80 — SECONDARY CONTAINMENT',
    note: 'Acid/base service with containment trough. CPVC for corrosion resistance. Check valves at all T connections.',
    extras: [
      // Entry: short horizontal entry from chemical storage room (side)
      { from: [-2, 11.1, PIPE_U], to: [0, 11.1, PIPE_U], r: 3 },
      { from: [-2, 11.7, PIPE_U], to: [0, 11.7, PIPE_U], r: 2.5 },
      // Exit: turn N, then short drop to day tank
      { from: [18, 11.1, PIPE_U], to: [18, 12.5, PIPE_U], r: 3 },
      { from: [18, 11.7, PIPE_U], to: [18, 12.5, PIPE_U], r: 2.5 },
      { from: [18, 12.5, PIPE_U], to: [18, 12.5, 2],      r: 2.5 },
    ] as Seg[],
    flanges: [
      { at: [-2,  11.1, PIPE_U], r: 3   },
      { at: [-2,  11.7, PIPE_U], r: 2.5 },
      { at: [18,  12.5, 2],      r: 2.5 },
    ],
  },
]

// ── Building wireframe ────────────────────────────────────────────────────────
function BuildingEnvelope() {
  const c = 'rgba(210,225,255,1)'
  const sw = 1.4
  const BE = 19.5, BN = 12.8, BU_HIGH = 8.5
  const N_NEAR = -1.0
  const fbl = iso(0,    N_NEAR, 0),      fbr = iso(BE, N_NEAR, 0)
  const ftl = iso(0,    N_NEAR, BU_HIGH), ftr = iso(BE, N_NEAR, BU_HIGH)
  const rbl = iso(BE,   BN,     0),      rtl = iso(BE, BN,     BU_HIGH)
  const btl = iso(0,    BN,     BU_HIGH)
  const FLOORS = [2.5, 5.0]
  const COL_ES = [0, 4.5, 9, 13.5, 18, 19.5]

  return (
    <g className="building-breath" stroke={c} strokeWidth={sw} fill="none">
      <polyline points={[fbl,ftl,ftr,fbr].map(p=>p.join(',')).join(' ')} />
      <line x1={f(fbl[0])} y1={f(fbl[1])} x2={f(fbr[0])} y2={f(fbr[1])} />
      {FLOORS.map(u => {
        const a = iso(0, N_NEAR, u), b = iso(BE, N_NEAR, u)
        return (
          <g key={`fl${u}`}>
            <line x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} strokeWidth={1.1} />
            <line x1={f(iso(0,N_NEAR,u-0.18)[0])} y1={f(iso(0,N_NEAR,u-0.18)[1])}
                  x2={f(iso(BE,N_NEAR,u-0.18)[0])} y2={f(iso(BE,N_NEAR,u-0.18)[1])} strokeWidth={0.4} />
          </g>
        )
      })}
      {COL_ES.map(e => {
        const base = iso(e, N_NEAR, 0), top = iso(e, N_NEAR, BU_HIGH)
        return <line key={`col${e}`} x1={f(base[0])} y1={f(base[1])} x2={f(top[0])} y2={f(top[1])} />
      })}
      {[0, 4.5, 9, 13.5].map(e0 => {
        const e1 = e0 + 4.5
        const WINS = [[0+0.3, 2.5-0.3], [2.5+0.3, 5.0-0.3], [5.0+0.3, BU_HIGH-0.3]]
        return WINS.flatMap(([u0, u1]) =>
          [0.3, 1.1, 1.9, 2.7].map((sub, wi) => {
            const eA = e0 + sub, eB = eA + 0.65
            if (eB > e1 - 0.1) return null
            const tl = iso(eA, N_NEAR, u1), tr = iso(eB, N_NEAR, u1)
            const bl = iso(eA, N_NEAR, u0)
            return (
              <g key={`win-${e0}-${u0}-${wi}`} strokeWidth={0.4}>
                <line x1={f(bl[0])} y1={f(bl[1])} x2={f(tl[0])} y2={f(tl[1])} />
                <line x1={f(tl[0])} y1={f(tl[1])} x2={f(tr[0])} y2={f(tr[1])} />
              </g>
            )
          })
        )
      })}
      <polyline points={[fbr, ftr, rtl, rbl].map(p=>p.join(',')).join(' ')} />
      <line x1={f(fbr[0])} y1={f(fbr[1])} x2={f(rbl[0])} y2={f(rbl[1])} />
      {FLOORS.map(u => {
        const a = iso(BE, N_NEAR, u), b = iso(BE, BN, u)
        return <line key={`rf${u}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} strokeWidth={1.1} />
      })}
      <polyline points={[ftl, ftr, rtl, btl, ftl].map(p=>p.join(',')).join(' ')} />
      {(() => {
        const CUT_U = PIPE_U
        const a = iso(0, N_NEAR, CUT_U), b = iso(BE, N_NEAR, CUT_U)
        const c3 = iso(BE, BN, CUT_U), d = iso(0, BN, CUT_U)
        return (
          <g strokeDasharray="8 5" strokeWidth={0.9} stroke="rgba(230,51,41,0.55)">
            <polyline points={[a,b,c3,d,a].map(p=>p.join(',')).join(' ')} />
            <text x={f(a[0]-32)} y={f(a[1])} textAnchor="end" fontSize="8"
              fill="rgba(230,51,41,0.7)" fontFamily="Space Mono,monospace" stroke="none">SECTION ⊗</text>
          </g>
        )
      })()}
      {[...FLOORS, BU_HIGH].map(u => {
        const pt = iso(0, N_NEAR, u)
        const label = u === BU_HIGH ? `+${f(u*10)}'-0" ROOF` : `+${f(u*10)}'-0" FF`
        return (
          <g key={`ev${u}`}>
            <line x1={f(pt[0]-22)} y1={f(pt[1])} x2={f(pt[0]-2)} y2={f(pt[1])}
              stroke="rgba(210,225,255,0.85)" strokeWidth={1.0} />
            <text x={f(pt[0]-24)} y={f(pt[1]+2)} textAnchor="end" fontSize="7"
              fill="rgba(210,225,255,0.8)" fontFamily="Space Mono,monospace" stroke="none">{label}</text>
          </g>
        )
      })}
    </g>
  )
}

// ── Pipe rack structural steel ────────────────────────────────────────────────
function RackStructure() {
  const stl = 'rgba(160,180,210,0.32)', sw = 0.65, N_SPAN = 12.2
  return (
    <g stroke={stl} strokeWidth={sw} fill="none">
      {BENT_ES.map(e => [0, N_SPAN].map(n => {
        const base = iso(e,n,0), top = iso(e,n,PIPE_U+0.5)
        return (
          <g key={`leg${e}-${n}`}>
            <line x1={f(base[0])} y1={f(base[1])} x2={f(top[0])} y2={f(top[1])} strokeWidth={1.0} />
            <line x1={f(base[0]-8)} y1={f(base[1])} x2={f(base[0]+8)} y2={f(base[1])} strokeWidth={1.2} />
          </g>
        )
      }))}
      {BENT_ES.map(e => {
        const a = iso(e,0,PIPE_U), b = iso(e,N_SPAN,PIPE_U)
        return (
          <g key={`beam${e}`}>
            <line x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} strokeWidth={1.2} />
            <line x1={f(a[0]-3)} y1={f(a[1])} x2={f(a[0]+3)} y2={f(a[1])} strokeWidth={1.5} />
            <line x1={f(b[0]-3)} y1={f(b[1])} x2={f(b[0]+3)} y2={f(b[1])} strokeWidth={1.5} />
          </g>
        )
      })}
      {[0, N_SPAN].map(n => {
        const a = iso(0,n,PIPE_U), b = iso(RACK_E_END,n,PIPE_U)
        return <line key={`str${n}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} strokeWidth={0.9} />
      })}
      {[0,18].map(e => {
        const tl = iso(e,0,PIPE_U+0.5), tr = iso(e,N_SPAN,PIPE_U+0.5)
        const bl = iso(e,0,0), br = iso(e,N_SPAN,0)
        return (
          <g key={`brace${e}`} strokeDasharray="4 3" strokeWidth={0.5}>
            <line x1={f(tl[0])} y1={f(tl[1])} x2={f(br[0])} y2={f(br[1])} />
            <line x1={f(bl[0])} y1={f(bl[1])} x2={f(tr[0])} y2={f(tr[1])} />
          </g>
        )
      })}
      {BENT_ES.map((e, i) => {
        const pt = iso(e,0,0)
        return (
          <g key={`lbl${e}`}>
            <circle cx={f(pt[0])} cy={f(pt[1]+16)} r={7.5} fill="#0d1117" stroke={stl} strokeWidth={0.5} />
            <text x={f(pt[0])} y={f(pt[1]+19)} textAnchor="middle" fontSize="8"
              fill="rgba(160,180,210,0.4)" fontFamily="Space Mono,monospace">{i+1}</text>
          </g>
        )
      })}
    </g>
  )
}

// ── One pipe system ───────────────────────────────────────────────────────────
function PipeSystem({ sys, active, latest }: { sys: typeof SYSTEMS[0]; active: boolean; latest: boolean }) {
  const col = sys.color
  const op  = active ? (latest ? 1 : 0.5) : 0

  return (
    <g style={{ opacity: op, transition: 'opacity 0.65s ease' }}>

      {/* Main horizontal runs */}
      {sys.pipes.map(pipe => {
        const a = iso(0, pipe.n, PIPE_U), b = iso(RACK_E_END, pipe.n, PIPE_U)
        return (
          <g key={pipe.label}>
            <CylPipe a={a} b={b} r={pipe.r} col={col}
              weight={latest ? 1.5 : 1.0}
              flowDur={latest ? sys.flowDur : undefined}
              capA={false} capB={false} />
            <text x={f(a[0]+4)} y={f(a[1]-pipe.r-4)} fontSize="7" fill={col}
              fontFamily="Space Mono,monospace" fontWeight="700" opacity={latest ? 1 : 0.5}>
              {pipe.label}
            </text>
          </g>
        )
      })}

      {/* Extras: bends, risers, drops, headers */}
      {sys.extras.map((seg, i) => {
        const a = iso(...seg.from), b = iso(...seg.to)
        return (
          <CylPipe key={i} a={a} b={b} r={seg.r} col={col}
            weight={latest ? 1.3 : 0.9}
            capA={false} capB={false} />
        )
      })}

      {/* Flange caps at pipe terminations */}
      {sys.flanges?.map((fl, i) => {
        const at = iso(...fl.at as [number,number,number])
        // Compute direction to point the flange — use the last segment ending here
        const matchSeg = sys.extras.find(s =>
          Math.abs(s.to[0]-fl.at[0])<0.01 && Math.abs(s.to[1]-fl.at[1])<0.01 && Math.abs(s.to[2]-fl.at[2])<0.01
        )
        let dir: [number,number] = [1, 0]
        if (matchSeg) {
          const fa = iso(...matchSeg.from), fb = iso(...matchSeg.to)
          const dx = fb[0]-fa[0], dy = fb[1]-fa[1]
          dir = [dx, dy]
        }
        return <FlangeCap key={i} at={at} dir={dir} r={fl.r} col={col} />
      })}
    </g>
  )
}

// ── Compounding spec feed — cards accumulate as systems reveal ─────────────────
function SpecFeed({ systems, activeIdx, latestSys, progress }: {
  systems: typeof SYSTEMS
  activeIdx: number
  latestSys: typeof SYSTEMS[0] | null
  progress: number
}) {
  const feedRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever a new system appears
  useEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [activeIdx])

  return (
    <div className="hidden lg:flex flex-col shrink-0" style={{ width: 260, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="font-mono text-[11px] tracking-[0.3em] text-white/50 uppercase">Pipe Specifications</span>
        <span className="font-mono text-[11px] text-white/45">
          {activeIdx + 1}<span className="text-white/10"> / {systems.length}</span>
        </span>
      </div>

      {/* Scrollable feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto flex flex-col"
        style={{ scrollbarWidth: 'none' }}>

        {activeIdx === -1 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-25 px-5">
            <div className="w-8 h-px bg-white/20" />
            <span className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase text-center">
              Scroll to reveal<br />pipe systems
            </span>
          </div>
        )}

        {systems.map((sys, i) => {
          const revealed = progress >= sys.threshold
          const isLatest = sys === latestSys
          if (!revealed) return null

          return (
            <div key={sys.id}
              style={{
                borderLeft: `2px solid ${isLatest ? sys.color : `${sys.color}40`}`,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                opacity: isLatest ? 1 : 0.6,
                transition: 'opacity 0.4s ease, border-color 0.4s ease',
                animation: 'specSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) both',
              }}
              className="shrink-0 px-4 py-3.5">

              {/* System header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm shrink-0 transition-all duration-400"
                    style={{ backgroundColor: isLatest ? sys.color : `${sys.color}80` }} />
                  <span className="font-mono text-[10px] tracking-[0.25em] font-bold uppercase"
                    style={{ color: sys.color }}>
                    {String(i + 1).padStart(2, '0')} — {sys.id}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/45 tracking-widest uppercase">
                  {isLatest ? '● ACTIVE' : '✓'}
                </span>
              </div>

              {/* System name */}
              <div className="font-bold text-white text-[11px] uppercase tracking-tight mb-2 leading-tight">
                {sys.name}
              </div>

              {/* Pipe labels */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {sys.pipes.map(p => (
                  <span key={p.label} className="font-mono text-[10px] px-1.5 py-0.5 tracking-wide"
                    style={{ background: `${sys.color}18`, border: `1px solid ${sys.color}35`, color: sys.color }}>
                    {p.label}
                  </span>
                ))}
              </div>

              {/* Spec string */}
              <div className="font-mono text-[11px] leading-relaxed mb-2"
                style={{ color: 'rgba(255,255,255,0.38)' }}>
                {sys.spec}
              </div>

              {/* Note — only show in full on the latest card */}
              <div className="text-[11px] leading-relaxed"
                style={{
                  color: isLatest ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)',
                  maxHeight: isLatest ? 200 : 28,
                  overflow: 'hidden',
                  transition: 'max-height 0.5s ease, color 0.4s ease',
                }}>
                {sys.note}
              </div>
            </div>
          )
        })}

        {/* Bottom padding so last card isn't flush */}
        <div className="shrink-0 h-4" />
      </div>

      {/* Progress bar footer */}
      <div className="shrink-0 px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-white/45 tracking-widest uppercase">Rack Load</span>
          <span className="font-mono text-[10px]" style={{ color: progress > 0 ? '#e63329' : 'rgba(255,255,255,0.15)' }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="h-px w-full bg-white/8 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[#e63329] transition-all duration-200"
            style={{ width: `${progress * 100}%` }} />
          {systems.map(s => (
            <div key={s.id} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${s.threshold * 100}%`, backgroundColor: `${s.color}60` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shared drawing panel (takes progress as prop) ──────────────────────────────
export function PipeDrawingPanel({ progress }: { progress: number }) {
  const activeIdx  = SYSTEMS.reduce((acc, s, i) => (progress >= s.threshold ? i : acc), -1)
  const latestSys  = activeIdx >= 0 ? SYSTEMS[activeIdx] : null
  const activeCount = activeIdx + 1

  // Measure the drawing cell so SVG is sized explicitly — avoids CSS height chain issues
  const drawingCellRef = useRef<HTMLDivElement>(null)
  const [svgBox, setSvgBox] = useState({ x: 0, y: 0, w: 0, h: 0 })
  useEffect(() => {
    const el = drawingCellRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect()
      const pad = 16
      const aw = width - pad * 2
      const ah = height - pad * 2
      const aspect = VW / VH
      let w = aw, h = ah
      if (w / h > aspect) w = h * aspect
      else h = w / aspect
      setSvgBox({ x: (width - w) / 2, y: (height - h) / 2, w, h })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0a0a08 60%, #0d0b06 100%)' }}>

        <div className="shrink-0 flex items-center justify-between px-6 md:px-12 pt-4 pb-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="text-base md:text-lg font-bold uppercase tracking-tight text-white leading-tight">
              Process Pipe Rack<br />
              <span className="font-normal text-sm text-[#aaa] tracking-wide normal-case">Multi-System Isometric</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {latestSys && (
              <div className="flex items-center gap-2 border px-3 py-1.5" style={{ borderColor: `${latestSys.color}55` }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: latestSys.color }} />
                <span className="font-mono text-[11px] tracking-widest font-bold" style={{ color: latestSys.color }}>
                  {latestSys.abbr}
                </span>
              </div>
            )}
            <div className="text-right">
              <div className="font-mono text-xl font-bold text-white leading-none">
                {activeCount}<span className="font-normal text-sm text-white/30">/{SYSTEMS.length}</span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-white/30 mt-0.5">SYSTEMS ON RACK</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div ref={drawingCellRef} className="relative overflow-hidden" style={{ flex: 1, minHeight: 0 }}>
            {(['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'] as const).map(cls => {
              const t = cls.includes('top'), l = cls.includes('left')
              return (
                <div key={cls} className={`absolute ${cls} pointer-events-none`} style={{ zIndex:2,
                  width:18, height:18, borderColor:'rgba(255,255,255,0.1)',
                  borderTopWidth: t?1:0, borderBottomWidth:!t?1:0,
                  borderLeftWidth: l?1:0, borderRightWidth:!l?1:0 }} />
              )
            })}

            {svgBox.w > 0 && (
              <div style={{ position:'absolute', left: svgBox.x, top: svgBox.y, width: svgBox.w, height: svgBox.h }}>
              <svg viewBox={`0 0 ${VW} ${VH}`} width={svgBox.w} height={svgBox.h} aria-hidden="true">
                <defs>
                  <radialGradient id="bgGrad" cx="40%" cy="60%" r="70%">
                    <stop offset="0%" stopColor="#0a0a08" />
                    <stop offset="100%" stopColor="#0d0b06" />
                  </radialGradient>
                </defs>
                <rect width={VW} height={VH} fill="url(#bgGrad)" />
                {Array.from({length:11},(_,i)=>{
                  const a=iso(i*2,0,0), b=iso(i*2,13,0)
                  return <line key={`gg${i}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} stroke="rgba(255,255,255,0.025)" strokeWidth={0.4}/>
                })}
                {Array.from({length:7},(_,i)=>{
                  const a=iso(0,i*2,0), b=iso(20,i*2,0)
                  return <line key={`gg2${i}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} stroke="rgba(255,255,255,0.025)" strokeWidth={0.4}/>
                })}
                <BuildingEnvelope />
                <RackStructure />
                {[...SYSTEMS].reverse().map(sys => (
                  <PipeSystem key={sys.id} sys={sys}
                    active={progress >= sys.threshold}
                    latest={sys === latestSys} />
                ))}
                <text x={f(VW-8)} y={f(VH-8)} textAnchor="end" fontSize="7"
                  fill="rgba(255,255,255,0.06)" fontFamily="Space Mono,monospace">
                  REVIT MEP — 3D AXONOMETRIC — PIPE RACK COORDINATION
                </text>
                <g transform="translate(42,42)">
                  <circle r={13} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                  <polygon points="0,-10 2.5,5 0,3 -2.5,5" fill="rgba(255,255,255,0.45)" />
                  <text textAnchor="middle" y={8} fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="Space Mono,monospace">N</text>
                </g>
              </svg>

              {SYSTEMS.map(sys => {
                const [sx, sy] = iso(7, sys.tagN, PIPE_U)
                const active = progress >= sys.threshold
                const isLatest = sys === latestSys
                return (
                  <div key={sys.id} className="absolute pointer-events-none"
                    style={{ left:`${(sx/VW)*100}%`, top:`${(sy/VH)*100}%`,
                      opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(6px)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease', zIndex: isLatest ? 10 : 4 }}>
                    <div className="absolute w-2.5 h-2.5 rounded-full"
                      style={{ left:-5, top:-5, backgroundColor: isLatest ? sys.color : `${sys.color}66`,
                        boxShadow: isLatest ? `0 0 14px ${sys.color}` : 'none',
                        border: `1.5px solid ${sys.color}` }} />
                    <div className="absolute whitespace-nowrap" style={{ left:8, top:-11 }}>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5"
                        style={{ background: isLatest ? sys.color : `${sys.color}28`,
                          border: `1px solid ${sys.color}80`, backdropFilter:'blur(6px)' }}>
                        <span className="font-mono font-bold tracking-widest"
                          style={{ fontSize:11, color: isLatest ? '#000' : sys.color }}>
                          {sys.abbr}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              </div>
            )}

            <div className="absolute right-2 top-4 bottom-4 w-px" style={{ background:'rgba(255,255,255,0.08)' }}>
              <div className="absolute top-0 left-0 w-full bg-[#e63329]" style={{ height:`${progress*100}%` }} />
              {SYSTEMS.map((s,i) => (
                <div key={i} className="absolute -left-1 w-2.5 h-px"
                  style={{ top:`${s.threshold*100}%`,
                    backgroundColor: progress>=s.threshold ? s.color : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
          </div>

          <SpecFeed systems={SYSTEMS} activeIdx={activeIdx} latestSys={latestSys} progress={progress} />
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 md:px-12 py-2"
          style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/50">
            {progress < 0.99 ? '↓  SCROLL TO LOAD PIPE SYSTEMS ONTO RACK' : '✓  FULL RACK LOADED — ALL SYSTEMS ACTIVE'}
          </span>
          <span className="font-mono text-[11px] tracking-widest text-white/40">
            BIM LVL 2  |  MEP-RACK-ISO-01  |  REV.06
          </span>
        </div>
    </div>
  )
}

// ── Standalone self-contained version (keeps backwards compat) ─────────────────
export default function ScrollPipeSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handler = () => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setProgress(Math.max(0, Math.min(1, -rect.top / (el.offsetHeight - window.innerHeight))))
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div ref={wrapRef} style={{ height: '580vh' }} className="relative">
      <div className="sticky top-0 h-screen">
        <PipeDrawingPanel progress={progress} />
      </div>
    </div>
  )
}
