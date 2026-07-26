import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Accommodation.css';

gsap.registerPlugin(ScrollTrigger);

const Accommodation = () => {
  // refs for scroll animations
  const heroRef = useRef(null);
  const roomsRef = useRef(null);
  const amenitiesRef = useRef(null);
  const bookingRef = useRef(null);

  useEffect(() => {
    // Hero Animation
    gsap.fromTo(
      heroRef.current.querySelector('.hero-content'),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
    );

    // Rooms Animation
    gsap.fromTo(
      roomsRef.current.querySelectorAll('.room-card'),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: roomsRef.current,
          start: 'top 80%',
        },
      }
    );

    // Amenities Animation
    gsap.fromTo(
      amenitiesRef.current.querySelectorAll('.amenity-item'),
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: amenitiesRef.current,
          start: 'top 80%',
        },
      }
    );

    // Booking Animation
    gsap.fromTo(
      bookingRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bookingRef.current,
          start: 'top 90%',
        },
      }
    );
  }, []);

  return (
    <div className="accommodation-page">
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg" style={{ backgroundImage: 'url(/images/club-sitting.jpg)' }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-label">HERITAGE ACCOMMODATION</span>
          <h1 className="hero-title">Stay at the Club</h1>
          <p className="hero-subtitle">Colonial charm meets hill-station comfort</p>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="rooms-section" ref={roomsRef}>
        <div className="container">
          <div className="section-header">
            <h2>Our Rooms &amp; Cottages</h2>
            <p>The club offers a limited number of guest rooms and cottages (around 6 units), tastefully furnished with period wooden furniture, cozy fireplaces, tea/coffee makers, and en-suite bathrooms. Non-A/C (unnecessary at Coonoor's altitude). Each room opens to garden lawns or panoramic hill views.</p>
          </div>
          
          <div className="rooms-grid">
            <div className="room-card">
              <div className="room-image-wrapper">
                <div className="room-image" style={{ backgroundImage: 'url(/images/club-event1.jpg)' }}></div>
              </div>
              <div className="room-details">
                <h3>Heritage Suite</h3>
                <p>Spacious room with antique four-poster bed, brick fireplace, period furniture.</p>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image-wrapper">
                <div className="room-image" style={{ backgroundImage: 'url(/images/club-sitting.jpg)' }}></div>
              </div>
              <div className="room-details">
                <h3>Garden Cottage</h3>
                <p>Private cottage with wraparound veranda, garden views, sitting area.</p>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image-wrapper">
                <div className="room-image" style={{ backgroundImage: 'url(/images/club-event3.jpg)' }}></div>
              </div>
              <div className="room-details">
                <h3>Colonial Room</h3>
                <p>Classic high-ceiling room with vintage decor and hill views.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="amenities-section" ref={amenitiesRef}>
        <div className="container">
          <h2>Room Amenities</h2>
          <div className="amenities-grid">
            <div className="amenity-item">🔥 Fireplace</div>
            <div className="amenity-item">🌡️ Room Heater</div>
            <div className="amenity-item">☕ Tea/Coffee Maker</div>
            <div className="amenity-item">📺 TV</div>
            <div className="amenity-item">🚿 Hot Water</div>
            <div className="amenity-item">🌲 Garden View</div>
            <div className="amenity-item">🛎️ Room Service</div>
            <div className="amenity-item">🧹 Housekeeping</div>
          </div>
        </div>
      </section>

      {/* Life at the Club — auto-scrolling gallery */}
      <section className="stay-gallery-section">
        <div className="container">
          <div className="section-header"><h2>Life at the Club</h2>
            <p>A glimpse of the rooms, lounges and grounds that await your stay.</p></div>
        </div>
        <div className="stay-marquee">
          <div className="stay-marquee-track">
            {[...['club-event1.jpg', 'club-sitting.jpg', 'club-event3.jpg', 'club-event2.jpg', 'club-hall2.jpg', 'club-rooftop.jpg', 'club-frontlawn.jpg', 'guest-room.jpg', 'club-outsideview.jpg', 'real-cottage.jpg'],
              ...['club-event1.jpg', 'club-sitting.jpg', 'club-event3.jpg', 'club-event2.jpg', 'club-hall2.jpg', 'club-rooftop.jpg', 'club-frontlawn.jpg', 'guest-room.jpg', 'club-outsideview.jpg', 'real-cottage.jpg']]
              .map((src, i) => (
                <div className="stay-marquee-item" key={i} aria-hidden={i >= 10}>
                  <img src={`/images/${src}`} alt="" loading="lazy" />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Booking Note Section */}
      <section className="booking-section" ref={bookingRef}>
        <div className="container">
          <div className="booking-card">
            <h3>Exclusive Access</h3>
            <p>Accommodation is reserved exclusively for members and members of reciprocal affiliated clubs. Advance booking through the club office is mandatory.</p>
            <a href="/contact" className="btn-primary">Contact the Club</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accommodation;
