import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-hero-content', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from('.contact-info', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: 'top 80%',
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.from('.contact-form', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: 'top 80%',
        },
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2
      });

      gsap.utils.toArray('.direction-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.15,
          ease: 'power2.out',
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="contact-page" ref={containerRef}>
      <section className="contact-hero">
        <div className="contact-hero-content">
          <motion.span 
            className="contact-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >GET IN TOUCH</motion.span>
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">We look forward to welcoming you</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Club Information</h3>
            <p><strong>Address:</strong><br />Club Road, Coonoor – 643 101,<br />The Nilgiris, Tamil Nadu, India<br /><em>Reg. No. 22 of 1991</em></p>
            <p><strong>Phone:</strong><br />0423 223 1717</p>
            <p><strong>WhatsApp:</strong><br />+91 93445 14897</p>
            <p><strong>Email:</strong><br />info@coonoorclub.com</p>
            <p><strong>Club Hours:</strong><br />Daily: 10:00 AM – 10:00 PM</p>
            <p><strong>How to reach:</strong><br />Nearest railway station: Coonoor (Nilgiri Mountain Railway)<br />Nearest airport: Coimbatore (100 km)</p>
          </div>

          <div className="contact-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Your email address" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="Your phone number" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select required>
                  <option value="">Select a subject...</option>
                  <option value="Event Booking">Event Booking</option>
                  <option value="Dining Reservation">Dining Reservation</option>
                  <option value="Guest Accommodation">Guest Accommodation</option>
                  <option value="Membership">Membership</option>
                  <option value="General Enquiry">General Enquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <section className="map-section">
        <iframe 
          title="Coonoor Club Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1134!2d76.8!3d11.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCoonoor+Club!5e0!3m2!1sen!2sin!4v1" 
          className="map-iframe" 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      <section className="contact-section" style={{ backgroundColor: 'var(--color-cream)' }}>
        <h2 className="directions-section-title">Getting Here</h2>
        <div className="directions-grid">
          <div className="direction-card">
            <h4>By Rail</h4>
            <p>The UNESCO heritage Nilgiri Mountain Railway connects Mettupalayam to Coonoor. A memorable journey through tunnels and tea gardens.</p>
          </div>
          <div className="direction-card">
            <h4>By Road</h4>
            <p>Coonoor is 70 km from Coimbatore via NH181. Well-connected by bus and taxi services.</p>
          </div>
          <div className="direction-card">
            <h4>By Air</h4>
            <p>Coimbatore International Airport (CJB) is the nearest airport, approximately 100 km from Coonoor.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
