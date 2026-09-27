// Process pipe isometric technical drawing — generic industrial piping arrangement

const S = 24          // px per isometric unit
const OX = 160        // SVG origin x (iso 0,0,0)
const OY = 352        // SVG origin y
const C = 0.8660254   // cos 30°

function iso(e: number, n: number, u: number): [number, number] {
  return [
    OX + (e - n) * S * C,
    OY - (e + n) * S * 0.5 - u * S,
  ]
}

function f(v: number) { return v.toFixed(1) }

// Direction unit vectors (SVG space)
const E_DIR: [number, number] = [C, -0.5]    // East
const N_DIR: [number, number] = [-C, -0.5]   // North
const U_DIR: [number, number] = [0, -1]      // Up

function perpOf(d: [number, number]): [number, number] {
  return [-d[1], d[0]]
}

// Filled parallelogram tube between two SVG points
function tubePath(a: [number, number], b: [number, number], r: number): string {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 0.1) return ''
  const nx = (-dy / len) * r, ny = (dx / len) * r
  return [
    `M${f(a[0] + nx)},${f(a[1] + ny)}`,
    `L${f(b[0] + nx)},${f(b[1] + ny)}`,
    `L${f(b[0] - nx)},${f(b[1] - ny)}`,
    `L${f(a[0] - nx)},${f(a[1] - ny)}`,
    'Z',
  ].join(' ')
}

interface TubeProps {
  a: [number, number]
  b: [number, number]
  r: number
  fill?: string
  stroke?: string
  sw?: number
}

function Tube({ a, b, r, fill = '#dedad2', stroke = '#1a1a1a', sw = 0.9 }: TubeProps) {
  const d = tubePath(a, b, r)
  if (!d) return null
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
}

function Flange({ pt, dir, r }: { pt: [number, number]; dir: [number, number]; r: number }) {
  const [ax, ay] = dir
  const px = -ay * r * 1.5, py = ax * r * 1.5
  const offsets = [-2.5, 2.5]
  return (
    <g stroke="#1a1a1a" strokeWidth={1.4} strokeLinecap="round">
      {offsets.map((o, i) => (
        <line
          key={i}
          x1={f(pt[0] + ax * o + px)} y1={f(pt[1] + ay * o + py)}
          x2={f(pt[0] + ax * o - px)} y2={f(pt[1] + ay * o - py)}
        />
      ))}
    </g>
  )
}

function GateValve({ center, along, r }: { center: [number, number]; along: [number, number]; r: number }) {
  const [ax, ay] = along
  const [px, py] = perpOf(along)
  const vl = r * 1.6, vw = r * 1.4
  const [cx, cy] = center
  const tri1 = `${f(cx)},${f(cy)} ${f(cx - ax * vl + px * vw)},${f(cy - ay * vl + py * vw)} ${f(cx - ax * vl - px * vw)},${f(cy - ay * vl - py * vw)}`
  const tri2 = `${f(cx)},${f(cy)} ${f(cx + ax * vl + px * vw)},${f(cy + ay * vl + py * vw)} ${f(cx + ax * vl - px * vw)},${f(cy + ay * vl - py * vw)}`
  const stemY = cy - r * 2.8
  const hwR = r * 1.05
  return (
    <g stroke="#1a1a1a" fill="#f0ece4" strokeWidth={0.85}>
      <polygon points={tri1} />
      <polygon points={tri2} />
      <line x1={f(cx)} y1={f(cy)} x2={f(cx)} y2={f(stemY)} strokeWidth={0.7} />
      <ellipse cx={f(cx)} cy={f(stemY)} rx={f(hwR)} ry={f(hwR * 0.38)} fill="none" strokeWidth={0.7} />
      <line x1={f(cx - hwR * 0.7)} y1={f(stemY)} x2={f(cx + hwR * 0.7)} y2={f(stemY)} strokeWidth={0.5} />
    </g>
  )
}

function CheckValve({ center, along, r }: { center: [number, number]; along: [number, number]; r: number }) {
  const [ax, ay] = along
  const [px, py] = perpOf(along)
  const vl = r * 1.4, vw = r * 1.3
  const [cx, cy] = center
  const pts = `${f(cx + ax * vl)},${f(cy + ay * vl)} ${f(cx - ax * vl + px * vw)},${f(cy - ay * vl + py * vw)} ${f(cx - ax * vl - px * vw)},${f(cy - ay * vl - py * vw)}`
  return (
    <g stroke="#1a1a1a" fill="#c8c4bc" strokeWidth={0.85}>
      <polygon points={pts} />
      <line
        x1={f(cx - ax * vl + px * vw)} y1={f(cy - ay * vl + py * vw)}
        x2={f(cx - ax * vl - px * vw)} y2={f(cy - ay * vl - py * vw)}
        strokeWidth={1.3}
      />
    </g>
  )
}

function Reducer({ a, b, r1, r2 }: { a: [number, number]; b: [number, number]; r1: number; r2: number }) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len, ny = dx / len
  const d = `M${f(a[0] + nx * r1)},${f(a[1] + ny * r1)} L${f(b[0] + nx * r2)},${f(b[1] + ny * r2)} L${f(b[0] - nx * r2)},${f(b[1] - ny * r2)} L${f(a[0] - nx * r1)},${f(a[1] - ny * r1)} Z`
  return <path d={d} fill="#dedad2" stroke="#1a1a1a" strokeWidth={0.9} />
}

function Support({ top, r }: { top: [number, number]; r: number }) {
  const [tx, ty] = top
  const tw = r * 1.7
  return (
    <g stroke="#1a1a1a" strokeWidth={0.6} fill="#d4d0c8">
      <line x1={f(tx)} y1={f(ty + r)} x2={f(tx)} y2={f(ty + r + 18)} />
      <polygon points={`${f(tx)},${f(ty + r + 18)} ${f(tx - tw)},${f(ty + r + 29)} ${f(tx + tw)},${f(ty + r + 29)}`} />
      <line x1={f(tx - tw * 1.4)} y1={f(ty + r + 29)} x2={f(tx + tw * 1.4)} y2={f(ty + r + 29)} strokeWidth={1.2} />
    </g>
  )
}

function Instrument({ pt, label }: { pt: [number, number]; label: string }) {
  const [cx, cy] = pt
  return (
    <g stroke="#1a1a1a" strokeWidth={0.65}>
      <line x1={f(cx)} y1={f(cy)} x2={f(cx)} y2={f(cy - 18)} />
      <circle cx={f(cx)} cy={f(cy - 26)} r={8} fill="#f5f2eb" stroke="#1a1a1a" strokeWidth={0.65} />
      <text x={f(cx)} y={f(cy - 23)} textAnchor="middle" fontSize="5" fill="#1a1a1a" fontFamily="Space Mono,monospace" fontWeight="700">
        {label}
      </text>
    </g>
  )
}

function PipeLabel({ pt, text, anchor = 'start' }: { pt: [number, number]; text: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text
      x={f(pt[0])} y={f(pt[1])}
      textAnchor={anchor}
      fontSize="6.5"
      fill="#555555"
      fontFamily="Space Mono,monospace"
      letterSpacing="0.3"
    >
      {text}
    </text>
  )
}

export default function PipeAxon({ className = '' }: { className?: string }) {
  const R8 = 10, R6 = 7, R4 = 5  // pipe radii in SVG px

  // Key isometric coordinates
  const mS   = iso(0, 0, 0)       // main header start
  const tee  = iso(3, 0, 0)       // tee branch point
  const redA = iso(6.5, 0, 0)     // reducer start (8")
  const redB = iso(7, 0, 0)       // reducer end (→ 4")
  const mE   = iso(10, 0, 0)      // main end / riser base
  const bE   = iso(3, 4.5, 0)     // branch end
  const rT   = iso(10, 0, 5.5)    // riser top / elbow
  const tE   = iso(6, 0, 5.5)     // top westward run end

  // Valve positions
  const gv1 = iso(1.5, 0, 0)      // gate valve, main
  const cv1 = iso(3, 2, 0)        // check valve, branch
  const gv2 = iso(10, 0, 2.8)     // gate valve, riser

  // Instrument positions
  const pi1 = iso(5, 0, 0)        // pressure gauge on main

  return (
    <svg
      viewBox="0 0 520 430"
      style={{ display: 'block', width: '100%', height: 'auto' }}
      className={className}
      aria-hidden="true"
    >
      {/* ── Background ─────────────────────────────────────── */}
      <rect width="520" height="430" fill="transparent" />

      {/* ── Faint iso reference plane grid ─────────────────── */}
      {[0, 2, 4, 6, 8, 10].map(e => {
        const a = iso(e, 0, 0), b = iso(e, 4.5, 0)
        return <line key={`eg${e}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} stroke="#c8c4bc" strokeWidth="0.35" strokeDasharray="3 4" />
      })}
      {[0, 1.5, 3, 4.5].map(n => {
        const a = iso(0, n, 0), b = iso(10, n, 0)
        return <line key={`ng${n}`} x1={f(a[0])} y1={f(a[1])} x2={f(b[0])} y2={f(b[1])} stroke="#c8c4bc" strokeWidth="0.35" strokeDasharray="3 4" />
      })}

      {/* ── Pipe supports (draw first, behind pipes) ─────── */}
      <Support top={iso(0, 0, 0)} r={R8} />
      <Support top={iso(4.5, 0, 0)} r={R8} />
      <Support top={iso(8.5, 0, 0)} r={R4} />

      {/* ── Branch pipe (N dir, 6") ─────────────────────── */}
      <Tube a={tee} b={iso(3, 1, 0)} r={R6} />
      {/* gap for check valve */}
      <Tube a={iso(3, 2.6, 0)} b={bE} r={R6} />

      {/* Branch blind flange cap at end */}
      {(() => {
        const [px, py] = perpOf(N_DIR)
        return (
          <g stroke="#1a1a1a" fill="#dedad2" strokeWidth={0.9}>
            <line
              x1={f(bE[0] + px * R6 * 1.6)} y1={f(bE[1] + py * R6 * 1.6)}
              x2={f(bE[0] - px * R6 * 1.6)} y2={f(bE[1] - py * R6 * 1.6)}
              strokeWidth={2.2}
            />
            <ellipse cx={f(bE[0])} cy={f(bE[1])} rx={f(R6 * 1.1)} ry={f(R6 * 0.45)} strokeWidth={0.7} />
          </g>
        )
      })()}

      {/* ── Main header 8" (E dir) ─────────────────────── */}
      {/* Segment A: start → before gate valve */}
      <Tube a={mS} b={iso(0.9, 0, 0)} r={R8} />
      {/* Segment B: after gate valve → tee */}
      <Tube a={iso(2.1, 0, 0)} b={tee} r={R8} />
      {/* Segment C: tee → reducer start */}
      <Tube a={tee} b={redA} r={R8} />
      {/* Reducer (8"→4") */}
      <Reducer a={redA} b={redB} r1={R8} r2={R4} />
      {/* Segment D: after reducer → main end elbow */}
      <Tube a={redB} b={mE} r={R4} />

      {/* ── Riser (U dir, 4") ─────────────────────────── */}
      {/* Segment below gate valve */}
      <Tube a={mE} b={iso(10, 0, 1.9)} r={R4} />
      {/* Segment above gate valve */}
      <Tube a={iso(10, 0, 3.7)} b={rT} r={R4} />

      {/* ── Top westward run (E dir, 4") ─────────────── */}
      <Tube a={rT} b={tE} r={R4} />

      {/* ── Elbow indicators (small arcs at pipe corners) ─ */}
      {/* At mE (E→U turn): fillet arc */}
      {(() => {
        const arc = `M${f(mE[0] + E_DIR[0] * R4)},${f(mE[1] + E_DIR[1] * R4)} Q${f(mE[0])},${f(mE[1])} ${f(mE[0] + U_DIR[0] * R4)},${f(mE[1] + U_DIR[1] * R4)}`
        const arc2 = `M${f(mE[0] - E_DIR[0] * R4)},${f(mE[1] - E_DIR[1] * R4)} Q${f(mE[0])},${f(mE[1])} ${f(mE[0] - U_DIR[0] * R4)},${f(mE[1] - U_DIR[1] * R4)}`
        return (
          <g fill="#dedad2" stroke="#1a1a1a" strokeWidth={0.9}>
            <path d={arc} fill="none" />
            <path d={arc2} fill="none" />
          </g>
        )
      })()}
      {/* At rT (U→W turn) */}
      {(() => {
        const revE: [number, number] = [-E_DIR[0], -E_DIR[1]]
        const arc = `M${f(rT[0] + U_DIR[0] * R4)},${f(rT[1] + U_DIR[1] * R4)} Q${f(rT[0])},${f(rT[1])} ${f(rT[0] + revE[0] * R4)},${f(rT[1] + revE[1] * R4)}`
        const arc2 = `M${f(rT[0] - U_DIR[0] * R4)},${f(rT[1] - U_DIR[1] * R4)} Q${f(rT[0])},${f(rT[1])} ${f(rT[0] - revE[0] * R4)},${f(rT[1] - revE[1] * R4)}`
        return (
          <g fill="none" stroke="#1a1a1a" strokeWidth={0.9}>
            <path d={arc} />
            <path d={arc2} />
          </g>
        )
      })()}

      {/* ── Valves ─────────────────────────────────────── */}
      <GateValve center={gv1} along={E_DIR} r={R8} />
      <CheckValve center={cv1} along={N_DIR} r={R6} />
      <GateValve center={gv2} along={U_DIR} r={R4} />

      {/* ── Flanges ────────────────────────────────────── */}
      {/* Main header nozzle end */}
      <Flange pt={iso(0.25, 0, 0)} dir={E_DIR} r={R8} />
      {/* Main end (before elbow) */}
      <Flange pt={iso(9.8, 0, 0)} dir={E_DIR} r={R4} />
      {/* Branch blind flange */}
      <Flange pt={iso(3, 4.25, 0)} dir={N_DIR} r={R6} />
      {/* Top run end */}
      <Flange pt={iso(6.25, 0, 5.5)} dir={E_DIR} r={R4} />

      {/* ── Instruments ────────────────────────────────── */}
      <Instrument pt={pi1} label="PI" />
      <Instrument pt={iso(3, 1, 0)} label="FI" />

      {/* ── Spec text (pipe sizes, no project labels) ──── */}
      <PipeLabel pt={[iso(4, 0, 0)[0] - 4, iso(4, 0, 0)[1] - R8 - 6]} text='8" — A106 GR.B' anchor="middle" />
      <PipeLabel pt={[iso(3, 2.5, 0)[0] - R6 - 18, iso(3, 2.5, 0)[1]]} text='6" — A53' anchor="end" />
      <PipeLabel pt={[iso(10, 0, 3, )[0] + R4 + 6, iso(10, 0, 3)[1]]} text='4" — SCH 80' anchor="start" />
      <PipeLabel pt={[iso(8, 0, 5.5)[0], iso(8, 0, 5.5)[1] - R4 - 5]} text='4" — A106' anchor="middle" />

      {/* ── Centerline marks along main ────────────────── */}
      {[1.5, 4.5, 7.5].map(e => {
        const pt = iso(e, 0, 0)
        return (
          <g key={e} stroke="#aaa8a0" strokeWidth={0.4} strokeDasharray="5 3">
            <line x1={f(pt[0] - E_DIR[0] * 12)} y1={f(pt[1] - E_DIR[1] * 12)} x2={f(pt[0] + E_DIR[0] * 12)} y2={f(pt[1] + E_DIR[1] * 12)} />
          </g>
        )
      })}

      {/* ── North arrow ───────────────────────────────── */}
      <g transform="translate(460,385)">
        <circle r={12} fill="none" stroke="#b0aca4" strokeWidth={0.6} />
        <polygon points="0,-9 2,4 0,2 -2,4" fill="#888" />
        <text textAnchor="middle" y={6} fontSize="6" fill="#888" fontFamily="Space Mono,monospace">N</text>
      </g>

      {/* ── Scale bar ─────────────────────────────────── */}
      <g stroke="#888" strokeWidth={0.6} fontFamily="Space Mono,monospace" fill="#888">
        <line x1="30" y1="395" x2="78" y2="395" />
        <line x1="30" y1="392" x2="30" y2="398" />
        <line x1="54" y1="392" x2="54" y2="398" />
        <line x1="78" y1="392" x2="78" y2="398" />
        <text x="30" y="407" fontSize="5.5" textAnchor="middle">0</text>
        <text x="54" y="407" fontSize="5.5" textAnchor="middle">5'</text>
        <text x="78" y="407" fontSize="5.5" textAnchor="middle">10'</text>
        <text x="54" y="415" fontSize="5" textAnchor="middle" letterSpacing="0.5">ISOMETRIC</text>
      </g>
    </svg>
  )
}
