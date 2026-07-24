import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════
   ULTRA-SMOOTH SCROLL-DRIVEN VIDEO HERO
   The video is encoded all-intra (every frame a keyframe), so
   seeking any frame is instant. Scroll progress (already
   Lenis-smoothed) sets a target time; a single lerp eases the
   video's currentTime toward it → silky, cut-free scrubbing.
   ═══════════════════════════════════════════════════════ */
function ScrollVideo() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    let targetTime = 0
    let currentTime = 0
    let rafId = null
    let ready = false
    let seeking = false

    video.addEventListener('seeked', () => { seeking = false })

    // Single lerp loop — eases the frame we show toward the scroll target.
    const render = () => {
      if (ready && video.duration) {
        currentTime += (targetTime - currentTime) * 0.16
        // Only issue a new seek when the previous one has resolved and the
        // delta is meaningful — avoids queueing seeks and CPU thrash.
        if (!seeking && Math.abs(targetTime - currentTime) > 0.008) {
          seeking = true
          video.currentTime = currentTime
        }
      }
      rafId = requestAnimationFrame(render)
    }

    let triggers = []
    const initScrubber = () => {
      ready = true
      video.pause()
      try { video.currentTime = 0 } catch (e) {}
      rafId = requestAnimationFrame(render)

      // Map scroll progress → target frame time. scrub:false because the
      // progress is already smoothed by Lenis; the lerp adds the final silk.
      triggers.push(ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (video.duration) targetTime = self.progress * video.duration
        },
      }))

      // Cinematic parallax: the hero text drifts up, scales and fades as the
      // first third of the runway is scrubbed, handing the frame to the film.
      triggers.push(
        gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '42% top',
            scrub: true,
          },
        })
          .to(contentRef.current, { y: -90, scale: 0.94, opacity: 0, ease: 'none' }, 0)
          .to(overlayRef.current, { '--veil': 0.15, ease: 'none' }, 0)
          .scrollTrigger
      )
    }

    if (video.readyState >= 1) initScrubber()
    else video.addEventListener('loadedmetadata', initScrubber)

    return () => {
      video.removeEventListener('loadedmetadata', initScrubber)
      if (rafId) cancelAnimationFrame(rafId)
      triggers.forEach((t) => t && t.kill && t.kill())
      ScrollTrigger.getAll().forEach((t) => { if (t.trigger === container) t.kill() })
    }
  }, [])

  return (
    <div className="scroll-video-container" ref={containerRef}>
      {/* Fixed viewport that sticks while scrolling */}
      <div className="scroll-video-sticky">
        <video
          ref={videoRef}
          src="/images/hero-scrub.mp4"
          poster="/images/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          className="scroll-video"
        />
        {/* Overlay content on top of video */}
        <div className="hero-overlay" ref={overlayRef}>
          <div className="hero-content" ref={contentRef}>
            <div className="hero-badge">EST. 1885 · THE NILGIRIS</div>
            <h1 className="hero-title">
              <span className="hero-title-line">COONOOR</span>
              <span className="hero-title-line hero-title-outline">CLUB</span>
            </h1>
            <p className="hero-subtitle">
              <em>"There are no strangers. Just friends you have not met"</em>
            </p>
            <div className="hero-cta-row">
              <Link to="/heritage" className="btn btn-primary"><span>Discover Our Legacy</span></Link>
              <Link to="/membership" className="btn btn-outline"><span>Become a Member</span></Link>
            </div>
          </div>
          <div className="scroll-indicator">
            <span>Scroll to Explore</span>
            <div className="scroll-line"><div className="scroll-dot"></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CURSOR TRAIL — Golden particles follow the mouse
   ═══════════════════════════════════════════════════════ */
function CursorTrail() {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const animRef = useRef()

  useEffect(() => {
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

/* ═══════════════════════════════════════════════════════
   TILT CARD — 3D parallax on hover with glow tracking
   ═══════════════════════════════════════════════════════ */
const TiltCard = ({ title, image, link, subtitle }) => {
  const cardRef = useRef()
  const glowRef = useRef()
  const navigate = useNavigate()

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    card.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -20}deg) rotateY(${(x - 0.5) * 20}deg) scale3d(1.05,1.05,1.05)`
    if (glowRef.current) glowRef.current.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(212,175,55,0.3) 0%, transparent 60%)`
  }
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)'
    if (glowRef.current) glowRef.current.style.background = 'transparent'
  }

  return (
    <div className="tilt-card" ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => navigate(link)}>
      <div className="tilt-card-bg" style={{ backgroundImage: `url(${image})` }} />
      <div className="tilt-card-glow" ref={glowRef} />
      <div className="tilt-card-overlay">
        <span className="tilt-card-label">{subtitle || 'Explore'}</span>
        <h3 className="tilt-card-title">{title}</h3>
        <div className="tilt-card-arrow">→</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════ */
const AnimatedCounter = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 2000, fd = 1000/60, total = Math.round(duration/fd), ease = t => t*(2-t)
        let frame = 0
        const counter = setInterval(() => {
          frame++
          setCount(Math.round(end * ease(frame/total)))
          if (frame === total) { clearInterval(counter); setCount(end) }
        }, fd)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   PARALLAX IMAGE
   ═══════════════════════════════════════════════════════ */
const ParallaxImage = ({ src, alt, depth = 0.1 }) => {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * depth
      el.querySelector('img').style.transform = `translateY(${offset}px) scale(1.15)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [depth])
  return <div className="parallax-img-wrapper" ref={ref}><img src={src} alt={alt} /></div>
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  const mainRef = useRef()
  const heritageRef = useRef()
  const ctaRef = useRef()
  const [activeTest, setActiveTest] = useState(0)

  const testimonials = [
    { quote: "A sanctuary of heritage where time slows down. The Coonoor Club is not just a place, it's an emotion passed down through generations.", author: "Arun Singhal", role: "Member since 1998" },
    { quote: "The evenings by the fireplace in the lounge, surrounded by century-old timber, are memories I cherish the most.", author: "Meera Krishnan", role: "Member since 2005" },
    { quote: "A perfect blend of colonial elegance and modern warmth. It truly lives up to its motto—you only meet friends here.", author: "David Harrison", role: "Affiliated Member" },
    { quote: "From the immaculate tennis courts to the historic billiards room, every corner tells a story of the Nilgiris.", author: "Sanjay Patel", role: "Member since 2012" },
  ]

  useEffect(() => {
    const interval = setInterval(() => setActiveTest(p => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heritage section
      gsap.from('.heritage-text-content > *', {
        scrollTrigger: { trigger: heritageRef.current, start: 'top 75%' },
        y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out'
      })
      gsap.from('.heritage-image-wrapper', {
        scrollTrigger: { trigger: heritageRef.current, start: 'top 75%' },
        x: -80, opacity: 0, duration: 1.2, ease: 'power3.out'
      })
      // Facilities
      gsap.from('.tilt-card', {
        scrollTrigger: { trigger: '.facilities-section', start: 'top 75%' },
        y: 80, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out'
      })
      // Gallery
      gsap.from('.gallery-scroll-item', {
        scrollTrigger: { trigger: '.gallery-strip', start: 'top 80%' },
        x: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
      })
      // CTA band
      gsap.from('.cta-band-content > *', {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out'
      })
    }, mainRef)
    return () => ctx.revert()
  }, [])

  return (
    <main className="home-container" ref={mainRef}>
      <CursorTrail />

      {/* ── SECTION I — Scroll-Driven Video Hero ── */}
      <ScrollVideo />

      {/* ── Content below the video ── */}
      <div className="content-wrapper">

        {/* ── SECTION II — Heritage Manifesto ── */}
        <section className="heritage-section section" ref={heritageRef}>
          <div className="container heritage-grid">
            <div className="heritage-image-wrapper">
              <ParallaxImage src="/images/real-entrance.jpg" alt="Coonoor Club Entrance" depth={0.15} />
            </div>
            <div className="heritage-text-content">
              <span className="text-label">Our Heritage</span>
              <h2>A Legacy Written in Timber & Mist</h2>
              <div className="divider"></div>
              <p>
                Nestled in the misty embrace of the Nilgiri hills, the Coonoor Club was
                founded in 1885 by General Richard Hamilton and Charles Thomas Campbell Gray.
                For over a century, it has stood as a bastion of colonial heritage, sporting
                excellence, and unparalleled camaraderie.
              </p>
              <p>
                Spread across 5 pristine acres on Gray's Hill, our club continues to honor
                its storied past while welcoming the future, ensuring that the spirit of the
                Nilgiris remains eternal.
              </p>
              <Link to="/heritage" className="btn btn-outline">
                <span>Read Our Story</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── SECTION III — Real Photos Gallery ── */}
        <section className="gallery-strip section-dark section">
          <div className="container">
            <div className="gallery-strip-header">
              <span className="text-label">The Estate</span>
              <h2>Five Acres of Heritage</h2>
            </div>
            <div className="gallery-scroll">
              <div className="gallery-scroll-inner">
                {[
                  { src: '/images/real-exterior-1.jpg', label: 'The Main Building' },
                  { src: '/images/real-entrance.jpg', label: 'The Entrance Porch' },
                  { src: '/images/real-cottage.jpg', label: 'The Heritage Cottage' },
                  { src: '/images/real-sports-ground.jpg', label: 'The Sports Ground' },
                  { src: '/images/real-heritage-cottage.jpg', label: 'Garden Cottage' },
                ].map((item, i) => (
                  <div className="gallery-scroll-item" key={i}>
                    <img src={item.src} alt={item.label} />
                    <span className="gallery-scroll-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION IV — Motto Marquee ── */}
        <section className="marquee-section">
          <div className="marquee-track">
            {[...Array(6)].map((_, i) => (
              <span className="marquee-item" key={i}>LEGACY ✦ HERITAGE ✦ COMMUNITY ✦ SPIRIT ✦ TRADITION ✦</span>
            ))}
          </div>
        </section>

        {/* ── SECTION V — Facilities 3D Tilt Cards ── */}
        <section className="facilities-section section">
          <div className="container">
            <div className="section-header">
              <span className="text-label">Experience</span>
              <h2>The Club Life</h2>
              <p>Explore the facilities that make Coonoor Club a home away from home</p>
            </div>
            <div className="facilities-grid">
              <TiltCard title="The Dining Hall" subtitle="Fine Dining" image="/images/restaurant.jpg" link="/dining" />
              <TiltCard title="The Lounge Bar" subtitle="Spirits & Stories" image="/images/bar.jpg" link="/dining" />
              <TiltCard title="Heritage Billiards" subtitle="Since 1906" image="/images/billiards.jpg" link="/sports" />
              <TiltCard title="Lawn Tennis" subtitle="The Founding Sport" image="/images/real-sports-ground.jpg" link="/sports" />
              <TiltCard title="The Library" subtitle="Quiet Hours" image="/images/library.jpg" link="/sports" />
              <TiltCard title="Heritage Stay" subtitle="Rooms & Cottages" image="/images/real-cottage.jpg" link="/accommodation" />
            </div>
          </div>
        </section>

        {/* ── SECTION VI — Stats ── */}
        <section className="stats-section section">
          <div className="container stats-grid">
            <AnimatedCounter end={1885} label="Founded" />
            <AnimatedCounter end={900} suffix="+" label="Members" />
            <AnimatedCounter end={70} suffix="+" label="Affiliated Clubs" />
            <AnimatedCounter end={5} label="Acres of Heritage" />
          </div>
        </section>

        {/* ── SECTION VII — Testimonials ── */}
        <section className="testimonials-section" style={{ backgroundImage: 'url(/images/real-heritage-cottage.jpg)' }}>
          <div className="testimonials-overlay" />
          <div className="testimonials-content">
            <span className="text-label">Members' Voice</span>
            <div className="quote-icon">"</div>
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card ${i === activeTest ? 'active' : ''}`}>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">{t.author}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            ))}
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`dot ${i === activeTest ? 'active' : ''}`} onClick={() => setActiveTest(i)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION VIII — CTA Band ── */}
        <section className="cta-band" ref={ctaRef}>
          <div className="cta-band-content">
            <span className="text-label" style={{ color: '#D4AF37' }}>Join the Fellowship</span>
            <h2>Begin Your Legacy</h2>
            <p>Join a fellowship of distinguished members spanning over a century of tradition in the Nilgiris.</p>
            <Link to="/membership" className="btn btn-primary"><span>Discover Membership</span></Link>
          </div>
        </section>

      </div>
    </main>
  )
}
