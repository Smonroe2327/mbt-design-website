import { useEffect, useRef, useState } from 'react'

const W = 600
const H = 440

// Isometric projection helpers
// iso(x,y,z) → SVG pixel coords
// origin placed at (300, 340) — bottom-center of the canvas
const OX = 300, OY = 340
const COS30 = 0.866
const SIN30 = 0.5
const SCALE = 28 // pixels per unit

function iso(x: number, y: number, z: number): [number, number] {
  const px = OX + (x - y) * COS30 * SCALE
  const py = OY + (x + y) * SIN30 * SCALE - z * SCALE
  return [px, py]
}

function pt(x: number, y: number, z: number) {
  const [px, py] = iso(x, y, z)
  return `${px.toFixed(1)},${py.toFixed(1)}`
}

// Draw a box face (top, front-x, front-y)
function boxPoints(x: number, y: number, z: number, dx: number, dy: number, dz: number) {
  // Returns [top, frontX, frontY] face polygon point strings
  const c = iso(x, y, z)
  const cx = iso(x + dx, y, z)
  const cy = iso(x, y + dy, z)
  const cxy = iso(x + dx, y + dy, z)
  const ct = iso(x, y, z + dz)
  const ctx = iso(x + dx, y, z + dz)
  const cty = iso(x, y + dy, z + dz)
  const ctxy = iso(x + dx, y + dy, z + dz)
  const top = [ct, ctx, ctxy, cty].map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const frontY = [c, cx, ctx, ct].map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const frontX = [c, cy, cty, ct].map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return { top, frontY, frontX }
}

// Pipe segment along X axis
function PipeX({ x1, y, z, x2, r, fill = '#0c0c0c', stroke = '#fff', sw = 0.9 }: {
  x1: number; y: number; z: number; x2: number; r: number
  fill?: string; stroke?: string; sw?: number
}) {
  const [ax, ay] = iso(x1, y - r, z)
  const [bx, by] = iso(x2, y - r, z)
  const [cx2, cy2] = iso(x2, y + r, z)
  const [dx, dy2] = iso(x1, y + r, z)
  const [tx, ty] = iso(x1, y, z + r)
  const [tx2, ty2] = iso(x2, y, z + r)
  const [bx2, by2] = iso(x1, y, z - r)
  const [bx3, by3] = iso(x2, y, z - r)
  return (
    <g>
      {/* Bottom face */}
      <polygon points={`${ax},${ay} ${bx},${by} ${bx3},${by3} ${bx2},${by2}`} fill={fill} stroke={stroke} strokeWidth={sw * 0.6} />
      {/* Front face */}
      <polygon points={`${ax},${ay} ${bx},${by} ${cx2},${cy2} ${dx},${dy2}`} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Top face */}
      <polygon points={`${dx},${dy2} ${cx2},${cy2} ${tx2},${ty2} ${tx},${ty}`} fill="#161616" stroke={stroke} strokeWidth={sw} />
    </g>
  )
}

// Pipe segment along Y axis
function PipeY({ x, y1, z, y2, r, fill = '#0c0c0c', stroke = '#fff', sw = 0.9 }: {
  x: number; y1: number; z: number; y2: number; r: number
  fill?: string; stroke?: string; sw?: number
}) {
  const [ax, ay] = iso(x - r, y1, z)
  const [bx, by] = iso(x + r, y1, z)
  const [cx2, cy2] = iso(x + r, y2, z)
  const [dx, dy2] = iso(x - r, y2, z)
  const [tx, ty] = iso(x, y1, z + r)
  const [tx2, ty2] = iso(x, y2, z + r)
  const [btx, bty] = iso(x, y1, z - r)
  const [btx2, bty2] = iso(x, y2, z - r)
  return (
    <g>
      <polygon points={`${ax},${ay} ${bx},${by} ${btx2},${bty2} ${btx},${bty}`} fill={fill} stroke={stroke} strokeWidth={sw * 0.6} />
      <polygon points={`${ax},${ay} ${bx},${by} ${cx2},${cy2} ${dx},${dy2}`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <polygon points={`${ax},${ay} ${dx},${dy2} ${tx2},${ty2} ${tx},${ty}`} fill="#161616" stroke={stroke} strokeWidth={sw} />
    </g>
  )
}

// Vertical pipe (along Z)
function PipeZ({ x, y, z1, z2, r, fill = '#0c0c0c', stroke = '#fff', sw = 0.9 }: {
  x: number; y: number; z1: number; z2: number; r: number
  fill?: string; stroke?: string; sw?: number
}) {
  const [ax, ay] = iso(x - r, y, z1)
  const [bx, by] = iso(x + r, y, z1)
  const [cx2, cy2] = iso(x + r, y, z2)
  const [dx, dy2] = iso(x - r, y, z2)
  const [ex, ey] = iso(x, y - r, z1)
  const [fx, fy] = iso(x, y + r, z1)
  const [gx, gy] = iso(x, y + r, z2)
  const [hx, hy] = iso(x, y - r, z2)
  return (
    <g>
      {/* Left face */}
      <polygon points={`${ax},${ay} ${ex},${ey} ${hx},${hy} ${dx},${dy2}`} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right face */}
      <polygon points={`${ex},${ey} ${bx},${by} ${cx2},${cy2} ${hx},${hy}`} fill="#161616" stroke={stroke} strokeWidth={sw} />
      {/* Top cap */}
      <polygon points={`${dx},${dy2} ${hx},${hy} ${cx2},${cy2} ${gx},${gy}`} fill="#202020" stroke={stroke} strokeWidth={sw} />
    </g>
  )
}

// Rectangular duct along X
function DuctX({ x1, y, z, x2, w, h, fill = '#0f0f0f', stroke = '#fff', sw = 1 }: {
  x1: number; y: number; z: number; x2: number; w: number; h: number
  fill?: string; stroke?: string; sw?: number
}) {
  const hw = w / 2; const hh = h / 2
  // front face (y - hw side)
  const a = iso(x1, y - hw, z - hh)
  const b = iso(x2, y - hw, z - hh)
  const c = iso(x2, y - hw, z + hh)
  const d = iso(x1, y - hw, z + hh)
  // top face
  const e = iso(x1, y + hw, z + hh)
  const f = iso(x2, y + hw, z + hh)
  // side face (x2 end)
  const g = iso(x2, y + hw, z - hh)
  const p = (v: number[]) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`
  return (
    <g>
      {/* Front face */}
      <polygon points={`${p(a)} ${p(b)} ${p(c)} ${p(d)}`} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Top face */}
      <polygon points={`${p(d)} ${p(c)} ${p(f)} ${p(e)}`} fill="#1a1a1a" stroke={stroke} strokeWidth={sw} />
      {/* Right end cap */}
      <polygon points={`${p(b)} ${p(g)} ${p(f)} ${p(c)}`} fill="#111" stroke={stroke} strokeWidth={sw} />
      {/* Left end cap lines */}
      <line x1={a[0]} y1={a[1]} x2={d[0]} y2={d[1]} stroke={stroke} strokeWidth={sw * 0.5} />
    </g>
  )
}

export default function BimGraphic({ className = '', ready = true }: { className?: string; ready?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealX, setRevealX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef({ startClient: 0, startReveal: 0 })
  const animStarted = useRef(false)

  useEffect(() => {
    if (!ready || animStarted.current) return
    animStarted.current = true
    // Small delay so the fade-in completes first, then sweep
    setTimeout(() => {
      const dur = 2400
      let t0: number | null = null
      const frame = (ts: number) => {
        if (!t0) t0 = ts
        const p = Math.min((ts - t0) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setRevealX(Math.round(eased * W))
        if (p < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, 400)
  }, [ready])

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: '100%', position: 'relative', cursor: dragging ? 'ew-resize' : 'crosshair', touchAction: 'none' }}
      onPointerDown={e => {
        setDragging(true)
        dragRef.current = { startClient: e.clientX, startReveal: revealX }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={e => {
        if (!dragging) return
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        const delta = ((e.clientX - dragRef.current.startClient) / r.width) * W
        setRevealX(Math.max(0, Math.min(W, dragRef.current.startReveal + delta)))
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <defs>
          <clipPath id="bim-clip">
            <rect x="0" y="0" width={revealX} height={H} />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#000" />

        {/* Isometric grid */}
        {Array.from({ length: 20 }, (_, i) => {
          // Lines going NE (x-axis)
          const [ax, ay] = iso(-5, i - 2, 0)
          const [bx, by] = iso(12, i - 2, 0)
          // Lines going NW (y-axis)
          const [cx2, cy2] = iso(i - 2, -5, 0)
          const [dx, dy] = iso(i - 2, 12, 0)
          return (
            <g key={i} opacity="0.35">
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#161616" strokeWidth="0.4" />
              <line x1={cx2} y1={cy2} x2={dx} y2={dy} stroke="#161616" strokeWidth="0.4" />
            </g>
          )
        })}

        {/* ══ STATIC DRAWING (always visible) ══ */}
        <BimScene />

        {/* ══ REVEALED LAYER ══ */}
        <g clipPath="url(#bim-clip)">
          <BimAnnotations />
        </g>

        {/* Scanline */}
        {revealX > 4 && revealX < W - 4 && (
          <g>
            <line x1={revealX} y1={0} x2={revealX} y2={H}
                  stroke="#e63329" strokeWidth="0.8" opacity="0.9" />
            <rect x={revealX - 5} y={H / 2 - 5} width={10} height={10}
                  fill="#000" stroke="#e63329" strokeWidth="0.8"
                  transform={`rotate(45 ${revealX} ${H / 2})`} />
          </g>
        )}

        {/* HUD */}
        <text x={W - 6} y={H - 5} textAnchor="end"
              fontFamily="Space Mono,monospace" fontSize="6" fill="#252525" letterSpacing="0.8">
          {revealX < W - 6
            ? `[ DRAG TO REVEAL ]  SCAN ${Math.round((revealX / W) * 100)}%`
            : '[ DRAG TO CONCEAL ]'}
        </text>
      </svg>
    </div>
  )
}

// ── Full isometric MEP scene ──────────────────────────────────────────────────
function BimScene() {
  return (
    <g>
      {/* Title block */}
      <rect x="8" y="6" width="196" height="30" fill="none" stroke="#1e1e1e" strokeWidth="0.5" />
      <line x1="8" y1="18" x2="204" y2="18" stroke="#1e1e1e" strokeWidth="0.3" />
      <text x="14" y="14" fontFamily="Space Mono,monospace" fontSize="7" fill="#ffffff" letterSpacing="1.2">MBT DESIGN GROUP</text>
      <text x="14" y="25" fontFamily="Space Mono,monospace" fontSize="5" fill="#555" letterSpacing="0.8">MEP COORDINATION  —  SECTION A</text>
      <text x="14" y="33" fontFamily="Space Mono,monospace" fontSize="4.5" fill="#333" letterSpacing="0.6">DWG: MEP-2024-COO-A101  REV.04</text>

      {/* ── Structure slab (floor plane) ── */}
      <polygon points={`${pt(-5,8,0)} ${pt(9,8,0)} ${pt(9,-2,0)} ${pt(-5,-2,0)}`}
               fill="#050505" stroke="#1a1a1a" strokeWidth="0.5" />
      {/* Slab thickness */}
      <polygon points={`${pt(-5,8,0)} ${pt(-5,8,-0.3)} ${pt(9,8,-0.3)} ${pt(9,8,0)}`}
               fill="#0a0a0a" stroke="#141414" strokeWidth="0.4" />

      {/* ── Structural columns ── */}
      {[[-4,7],[-4,-1],[8,7],[8,-1]].map(([cx,cy],i) => {
        const b = boxPoints(cx-0.15, cy-0.15, -0.3, 0.3, 0.3, 6)
        return (
          <g key={i}>
            <polygon points={b.top} fill="#111" stroke="#2a2a2a" strokeWidth="0.4" />
            <polygon points={b.frontY} fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="0.4" />
            <polygon points={b.frontX} fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="0.4" />
          </g>
        )
      })}

      {/* ── Overhead structure beams ── */}
      {/* X-direction beam */}
      {[7,-1].map(yb => {
        const b = boxPoints(-4, yb-0.12, 5.2, 12, 0.24, 0.35)
        return (
          <g key={yb}>
            <polygon points={b.top} fill="#111" stroke="#222" strokeWidth="0.5" />
            <polygon points={b.frontY} fill="#0c0c0c" stroke="#222" strokeWidth="0.5" />
          </g>
        )
      })}
      {/* Y-direction beam */}
      {[-4,8].map(xb => {
        const b = boxPoints(xb-0.12, -1, 5.2, 0.24, 8, 0.35)
        return (
          <g key={xb}>
            <polygon points={b.top} fill="#111" stroke="#222" strokeWidth="0.5" />
            <polygon points={b.frontX} fill="#0c0c0c" stroke="#222" strokeWidth="0.5" />
          </g>
        )
      })}

      {/* ── Main CHW supply pipe (large, X-axis) ── */}
      <PipeX x1={-4} y={2} z={4.5} x2={8} r={0.28} stroke="#ffffff" sw={1} />
      {/* Insulation jacket */}
      <PipeX x1={-4} y={2} z={4.5} x2={8} r={0.42} fill="transparent" stroke="#333" sw={0.5} />

      {/* ── CHW return pipe (X-axis, slightly lower) ── */}
      <PipeX x1={-4} y={3} z={4.5} x2={8} r={0.22} stroke="#cccccc" sw={0.8} />
      <PipeX x1={-4} y={3} z={4.5} x2={8} r={0.34} fill="transparent" stroke="#2a2a2a" sw={0.4} />

      {/* ── HHW supply + return pipes ── */}
      <PipeX x1={-4} y={4} z={4.5} x2={8} r={0.18} stroke="#aaaaaa" sw={0.7} />
      <PipeX x1={-4} y={4.7} z={4.5} x2={8} r={0.15} stroke="#888" sw={0.6} />

      {/* ── Vertical risers ── */}
      <PipeZ x={-3} y={2} z1={0} z2={4.5} r={0.28} stroke="#ffffff" sw={1} />
      <PipeZ x={-3} y={3} z1={0} z2={4.5} r={0.22} stroke="#cccccc" sw={0.8} />
      <PipeZ x={7} y={2} z1={0} z2={4.5} r={0.28} stroke="#ffffff" sw={1} />
      <PipeZ x={7} y={3} z1={0} z2={4.5} r={0.22} stroke="#cccccc" sw={0.8} />

      {/* ── Branch pipe tapping off main (Y-axis) ── */}
      <PipeY x={2} y1={2} z={3.2} y2={6} r={0.15} stroke="#aaaaaa" sw={0.7} />
      <PipeY x={5} y1={2} z={2.8} y2={6} r={0.12} stroke="#888" sw={0.6} />

      {/* ── Valve bodies on main supply ── */}
      {[0, 4].map(xv => {
        const [px, py] = iso(xv, 2 - 0.28, 4.5)
        const [px2, py2] = iso(xv, 2 + 0.28, 4.5)
        const [px3, py3] = iso(xv, 2, 4.5 + 0.45)
        return (
          <g key={xv}>
            <line x1={px} y1={py} x2={px2} y2={py2} stroke="#ffffff" strokeWidth="1.2" />
            <line x1={px} y1={py} x2={px2} y2={py2} stroke="#ffffff" strokeWidth="0.5"
                  transform={`rotate(90 ${(px+px2)/2} ${(py+py2)/2})`} />
            <line x1={(px+px2)/2} y1={(py+py2)/2} x2={px3} y2={py3} stroke="#ffffff" strokeWidth="0.6" />
            <circle cx={px3} cy={py3} r="2.5" fill="#111" stroke="#ffffff" strokeWidth="0.6" />
          </g>
        )
      })}

      {/* ── HVAC rectangular supply duct (X-axis) ── */}
      <DuctX x1={-3} y={0} z={4.8} x2={7} w={1.4} h={0.7} stroke="#ffffff" sw={1} />

      {/* ── Flex duct connector ── */}
      {Array.from({ length: 6 }, (_, i) => {
        const xf = 7 + i * 0.18
        const [a1, a2] = iso(xf, -0.7, 4.65 + (i % 2) * 0.08)
        const [b1, b2] = iso(xf, 0.7, 4.95 + (i % 2) * 0.08)
        return <line key={i} x1={a1} y1={a2} x2={b1} y2={b2} stroke="#555" strokeWidth="0.5" />
      })}

      {/* ── Return duct (parallel, smaller) ── */}
      <DuctX x1={-3} y={5.5} z={4.6} x2={7} w={1.0} h={0.5} stroke="#aaaaaa" sw={0.7} />

      {/* ── Cable tray (Y-axis) ── */}
      {(() => {
        const b = boxPoints(-2, -2, 3.8, 0.08, 9, 0.06)
        const b2 = boxPoints(0, -2, 3.8, 0.08, 9, 0.06)
        const b3 = boxPoints(2, -2, 3.8, 0.08, 9, 0.06)
        // Tray sides
        const [s1x, s1y] = iso(-2.2, -2, 3.8)
        const [s2x, s2y] = iso(-2.2, 7, 3.8)
        const [s3x, s3y] = iso(2.2, -2, 3.8)
        const [s4x, s4y] = iso(2.2, 7, 3.8)
        const [t1x, t1y] = iso(-2.2, -2, 3.88)
        const [t2x, t2y] = iso(-2.2, 7, 3.88)
        const [t3x, t3y] = iso(2.2, -2, 3.88)
        const [t4x, t4y] = iso(2.2, 7, 3.88)
        return (
          <g>
            {/* Tray side rails */}
            <line x1={s1x} y1={s1y} x2={s2x} y2={s2y} stroke="#ffffff" strokeWidth="0.7" />
            <line x1={s3x} y1={s3y} x2={s4x} y2={s4y} stroke="#aaaaaa" strokeWidth="0.7" />
            {/* Rungs */}
            {Array.from({ length: 9 }, (_, i) => {
              const yr = -2 + i
              const [rx1, ry1] = iso(-2.2, yr, 3.84)
              const [rx2, ry2] = iso(2.2, yr, 3.84)
              return <line key={i} x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#888" strokeWidth="0.4" />
            })}
          </g>
        )
      })()}

      {/* ── Conduit runs ── */}
      <PipeX x1={-4} y={-1} z={3.5} x2={8} r={0.08} stroke="#888" sw={0.5} />
      <PipeX x1={-4} y={-1.3} z={3.5} x2={8} r={0.06} stroke="#666" sw={0.4} />
      <PipeX x1={-4} y={-0.7} z={3.5} x2={8} r={0.06} stroke="#666" sw={0.4} />

      {/* ── Sprinkler main + heads ── */}
      <PipeX x1={-4} y={6} z={4.2} x2={8} r={0.1} stroke="#aaa" sw={0.6} />
      {[-2, 0, 2, 4, 6].map(xs => {
        const [hx, hy] = iso(xs, 6, 4.1)
        const [tx, ty] = iso(xs, 6, 4.4)
        return (
          <g key={xs}>
            <line x1={hx} y1={hy} x2={tx} y2={ty} stroke="#888" strokeWidth="0.5" />
            <circle cx={hx} cy={hy} r="2.5" fill="none" stroke="#888" strokeWidth="0.5" />
            {/* Deflector arms */}
            {[-3,3].map(dx => {
              const [dx1, dy1] = iso(xs + dx * 0.1, 6 - 0.15, 4.08)
              return <line key={dx} x1={hx} y1={hy} x2={dx1} y2={dy1} stroke="#666" strokeWidth="0.4" />
            })}
          </g>
        )
      })}

      {/* ── Hanger rods ── */}
      {[[-2,2],[0,2],[2,2],[4,2],[6,2],[-2,3],[2,3],[6,3]].map(([xh,yh],i) => {
        const [ax, ay] = iso(xh, yh, 5.55)
        const [bx, by] = iso(xh, yh, 4.95)
        return (
          <g key={i}>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#333" strokeWidth="0.5" strokeDasharray="2 1.5" />
          </g>
        )
      })}

      {/* ── Elevation markers ── */}
      {[[4.5,'EL. +14\'- 6"'],[3.2,'EL. +10\'- 6"'],[0,'EL. 0\'- 0"']].map(([z,label],i) => {
        const [mx, my] = iso(-5.5, 3, z as number)
        const [mx2, my2] = iso(-5.5, 8, z as number)
        return (
          <g key={i}>
            <line x1={mx} y1={my} x2={mx2} y2={my2} stroke="#1e1e1e" strokeWidth="0.4" strokeDasharray="8 3" />
            <text x={mx - 4} y={my - 2} textAnchor="end"
                  fontFamily="Space Mono,monospace" fontSize="5.5" fill="#2a2a2a" letterSpacing="0.5">
              {label as string}
            </text>
          </g>
        )
      })}

      {/* North arrow */}
      <g transform={`translate(${W - 26}, ${H - 42})`}>
        <circle r="13" fill="none" stroke="#1e1e1e" strokeWidth="0.6" />
        <polygon points="0,-10 3,4 0,1 -3,4" fill="#555" />
        <text textAnchor="middle" y="6" fontFamily="Space Mono,monospace" fontSize="5.5" fill="#444">N</text>
      </g>
    </g>
  )
}

// ── Annotation overlay (revealed by scanline) ─────────────────────────────────
function BimAnnotations() {
  const items = [
    { x: -3, y: 2, z: 4.5, label: 'CHW-SUP-01', sub: '8" SCH-40 INSUL.', alert: false },
    { x: 4, y: 2, z: 4.5, label: 'MEP-CLR-04', sub: 'CLEARANCE VIOLATION', alert: true },
    { x: 2, y: 0, z: 4.8, label: 'HVAC-SA-01', sub: 'SUPPLY DUCT 24×14"', alert: false },
    { x: 0, y: -1, z: 3.5, label: 'COND-2"EMT', sub: 'ELECTRICAL CONDUIT', alert: false },
    { x: 0, y: 6, z: 4.2, label: 'SPRK-WET-03', sub: 'WET PIPE 2" SCH-10', alert: false },
    { x: 5, y: 3, z: 2.8, label: 'PIPE-GRP-07', sub: 'HHW RETURN 4"', alert: false },
  ]

  return (
    <g>
      {/* Clash highlight box */}
      {(() => {
        const [cx, cy] = iso(4, 2, 4.5)
        return (
          <g>
            <rect x={cx - 18} y={cy - 14} width={36} height={28}
                  fill="#e63329" fillOpacity="0.1"
                  stroke="#e63329" strokeWidth="1" strokeDasharray="3 2" />
          </g>
        )
      })()}

      {items.map((item, i) => {
        const [px, py] = iso(item.x, item.y, item.z)
        const offsets = [[50,-55],[55,-30],[40,-60],[-90,-40],[60,-50],[65,-35]]
        const [ox, oy] = offsets[i] || [40, -40]
        const color = item.alert ? '#e63329' : '#ffffff'
        const lx = px + ox
        const ly = py + oy
        const boxW = 80
        return (
          <g key={item.label}>
            <line x1={px} y1={py} x2={lx + (ox >= 0 ? 0 : boxW)} y2={ly + 12}
                  stroke={color} strokeWidth="0.5" opacity="0.7" />
            <circle cx={px} cy={py} r="3" fill="none" stroke={color} strokeWidth="0.7" />
            <circle cx={px} cy={py} r="1.2" fill={color} />
            <rect x={ox >= 0 ? lx : lx - boxW} y={ly}
                  width={boxW} height={24}
                  fill={item.alert ? 'rgba(230,51,41,0.15)' : 'rgba(0,0,0,0.82)'}
                  stroke={color} strokeWidth="0.55" />
            <text x={ox >= 0 ? lx + 4 : lx - boxW + 4} y={ly + 10}
                  fontFamily="Space Mono,monospace" fontSize="6" fill={color}
                  fontWeight="700" letterSpacing="0.5">{item.label}</text>
            <text x={ox >= 0 ? lx + 4 : lx - boxW + 4} y={ly + 19}
                  fontFamily="Space Mono,monospace" fontSize="4.8" fill={item.alert ? '#e63329' : '#777'}
                  letterSpacing="0.3">{item.sub}</text>
          </g>
        )
      })}
    </g>
  )
}
