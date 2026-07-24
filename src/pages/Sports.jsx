import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Sports.css';

gsap.registerPlugin(ScrollTrigger);

const Sports = () => {
  const heroRef = useRef(null);
  const facilitiesRef = useRef(null);
  const fitnessRef = useRef(null);

  useEffect(() => {
    // Hero
    gsap.fromTo(
      heroRef.current.querySelector('.hero-content'),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
    );

    // Facilities
    gsap.fromTo(
      facilitiesRef.current.querySelectorAll('.facility-card'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: facilitiesRef.current,
          start: 'top 75%',
        },
      }
    );

    // Fitness
    gsap.fromTo(
      fitnessRef.current,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: fitnessRef.current,
          start: 'top 85%',
        },
      }
    );
  }, []);

  const facilities = [
    {
      id: 1,
      title: 'Lawn Tennis',
      description: 'The founding sport of the club. Outdoor lawn and hard courts surrounded by eucalyptus trees.',
      hours: '6 AM – 6 PM',
      image: '/images/real-sports-ground.jpg',
      icon: '🎾'
    },
    {
      id: 2,
      title: 'Billiards & Snooker',
      description: 'Heritage billiards room with full-sized vintage tables dating to 1906.',
      hours: '11 AM – 10 PM',
      image: '/images/billiards.jpg',
      icon: '🎱'
    },
    {
      id: 3,
      title: 'Squash',
      description: 'Classic indoor squash racquets court for an energetic workout.',
      hours: '6 AM – 9 PM',
      image: null,
      icon: '🏸'
    },
    {
      id: 4,
      title: 'Library & Reading',
      description: 'Quiet space with extensive book collections, historical archives, and periodicals.',
      hours: '9 AM – 8 PM',
      image: '/images/library.jpg',
      icon: '📚'
    },
    {
      id: 5,
      title: 'Badminton',
      description: 'Well-maintained indoor badminton facilities for members of all skill levels.',
      hours: '6 AM – 9 PM',
      image: null,
      icon: '🏸'
    },
    {
      id: 6,
      title: 'Cards & Games',
      description: 'Dedicated rooms for bridge, rummy, and other traditional card games.',
      hours: '2 PM – 11 PM',
      image: null,
      icon: '🃏'
    }
  ];

  return (
    <div className="sports-page">
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg" style={{ backgroundImage: 'url(/images/real-sports-ground.jpg)' }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-label">RECREATION</span>
          <h1 className="hero-title">Sports &amp; Leisure</h1>
          <p className="hero-subtitle">Active pursuits amidst the Nilgiri hills since 1885</p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="facilities-section" ref={facilitiesRef}>
        <div className="container">
          <div className="section-header">
            <h2>Our Facilities</h2>
            <div className="divider"></div>
          </div>
          
          <div className="facilities-grid">
            {facilities.map((facility) => (
              <div className="facility-card" key={facility.id}>
                {facility.image && (
                  <div className="card-bg" style={{ backgroundImage: `url(${facility.image})` }}></div>
                )}
                <div className="card-content">
                  <div className="card-icon">{facility.icon}</div>
                  <h3>{facility.title}</h3>
                  <div className="card-reveal">
                    <p>{facility.description}</p>
                    <span className="hours">⏱ Hours: {facility.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitness Section */}
      <section className="fitness-section" ref={fitnessRef}>
        <div className="container">
          <div className="fitness-content">
            <h2>Fitness &amp; Wellness</h2>
            <p>Beyond our dedicated sports courts, the Coonoor Club features a well-equipped fitness center for daily workouts. Our 5-acre property also serves as a beautiful joggers' park, offering a serene walking track winding through lush gardens and heritage architecture.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sports;
