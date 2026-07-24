import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════
   SMOOTH SCROLL — Lenis driving GSAP ScrollTrigger.
   A dedicated rAF loop advances Lenis every frame, and each
   Lenis scroll tick pushes ScrollTrigger.update() so every
   scrubbed animation / the hero video stay perfectly in phase
   with the smoothed scroll value → cut-free, jitter-free.
   (gsap.ticker is NOT used to drive Lenis: it sleeps when idle
   and would stall the loop.)
   ═══════════════════════════════════════════════════════════ */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,                                            // inertia length — higher = more glide
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expo-out
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,   // slightly slower wheel = more cinematic
      touchMultiplier: 1.4,
      syncTouch: true,        // smooth on touch devices too
    })

    // Keep ScrollTrigger in lock-step with Lenis' smoothed scroll value.
    lenis.on('scroll', ScrollTrigger.update)

    // Dedicated rAF loop — always running, independent of GSAP's ticker.
    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Expose for any component that wants to programmatically scroll.
    window.__lenis = lenis

    return () => {
      cancelAnimationFrame(rafId)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  return children
}
