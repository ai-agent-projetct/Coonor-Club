import { useEffect, useRef } from 'react'
import './CursorTrail.css'

/* ═══════════════════════════════════════════════════════
   CURSOR TRAIL — Golden particles follow the mouse.
   Rendered once at the app level so it works on every page.
   ═══════════════════════════════════════════════════════ */
export default function CursorTrail() {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const animRef = useRef()

  useEffect(() => {
    // Skip when the visitor prefers reduced motion.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => {
      for (let i = 0; i < 3; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          life: 1,
          color: Math.random() > 0.5 ? '#D4AF37' : '#B5651D',
        })
      }
      if (particles.current.length > 100) particles.current = particles.current.slice(-100)
    }
    window.addEventListener('mousemove', handleMouse)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter(p => {
        p.x += p.speedX; p.y += p.speedY; p.life -= 0.02; p.size *= 0.98
        if (p.life <= 0) return false
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0')
        ctx.fill()
        return true
      })
      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-trail-canvas" />
}
