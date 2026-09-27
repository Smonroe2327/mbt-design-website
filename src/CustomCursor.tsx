import { useEffect, useRef } from 'react'

const RED = '#e63329'
const TRAIL_LEN = 80

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const headRef   = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number>(0)
  const rawRef    = useRef({ x: -500, y: -500 })
  const posRef    = useRef({ x: -500, y: -500 })
  const trailRef  = useRef<Array<{ x: number; y: number }>>([])
  const visRef    = useRef(false)
  const hoverRef  = useRef(false)
  const downRef   = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const head   = headRef.current!

    const dprRef = { current: window.devicePixelRatio || 1 }
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const raw = rawRef.current
      const cur = posRef.current

      // Lerp cursor position
      cur.x += (raw.x - cur.x) * 0.18
      cur.y += (raw.y - cur.y) * 0.18

      const trail0 = trailRef.current
      trail0.push({ x: cur.x, y: cur.y })
      if (trail0.length > TRAIL_LEN) trail0.shift()

      const trail = trail0
      const ctx = canvas.getContext('2d')!
      const dpr = dprRef.current
      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      if (visRef.current && trail.length > 1) {
        // Draw newest→oldest with destination-over so each segment goes behind
        // the already-drawn newer ones — junctions are hidden under the brighter head.
        ctx.globalCompositeOperation = 'destination-over'
        ctx.lineCap  = 'round'
        ctx.lineJoin = 'round'
        for (let i = trail.length - 1; i >= 1; i--) {
          const t = i / (trail.length - 1)
          ctx.beginPath()
          ctx.moveTo(trail[i].x,   trail[i].y)
          ctx.lineTo(trail[i-1].x, trail[i-1].y)
          ctx.strokeStyle = `rgba(230,51,41,${Math.pow(t, 1.6) * 0.88})`
          ctx.lineWidth   = Math.pow(t, 1.2) * 3.5
          ctx.stroke()
        }
        ctx.globalCompositeOperation = 'source-over'
      }
      ctx.restore()

      // Move head square
      const headSize = downRef.current ? 7 : hoverRef.current ? 16 : 11
      head.style.width  = `${headSize}px`
      head.style.height = `${headSize}px`
      head.style.opacity = visRef.current ? '1' : '0'
      head.style.transform = `translate3d(${cur.x}px,${cur.y}px,0) translate(-50%,-50%)`

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const onMove  = (e: MouseEvent) => { rawRef.current = { x: e.clientX, y: e.clientY }; visRef.current = true }
    const onLeave  = () => { visRef.current = false }
    const onEnter  = () => { visRef.current = true }
    const onDown   = () => { downRef.current  = true }
    const onUp     = () => { downRef.current  = false }
    const onOver   = (e: MouseEvent) => {
      const el = e.target as Element
      hoverRef.current = !!el.closest('a,button,[role="button"],input,textarea,select')
    }

    document.addEventListener('mousemove',  onMove,  { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseover',  onOver,  { passive: true })
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseover',  onOver)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
    }
  }, [])

  return (
    <>
      {/* Full-viewport canvas for the tail */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none',
          zIndex: 2147483600,
        }}
      />
      {/* Head square */}
      <div
        ref={headRef}
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 11, height: 11,
          backgroundColor: RED,
          pointerEvents: 'none',
          zIndex: 2147483601,
          opacity: 0,
          transition: 'opacity 0.2s ease, width 0.12s ease, height 0.12s ease',
          willChange: 'transform',
        }}
      />
    </>
  )
}
