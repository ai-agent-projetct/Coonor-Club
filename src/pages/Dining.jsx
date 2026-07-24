import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import './Dining.css';

gsap.registerPlugin(ScrollTrigger);

const Dining = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.from('.hero-content > *', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
      });

      // Split sections animation
      const splitSections = gsap.utils.toArray('.split-section');
      splitSections.forEach((section) => {
        const image = section.querySelector('.split-image');
        const content = section.querySelector('.split-content');
        
        gsap.fromTo(image, 
          { x: section.classList.contains('reversed') ? 50 : -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
            }
          }
        );

        gsap.fromTo(content, 
          { x: section.classList.contains('reversed') ? -50 : 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
            }
          }
        );
      });

      // Lawn High Tea Animation
      gsap.from('.lawn-content > *', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.lawn-section',
          start: 'top 70%',
        }
      });

      // Dress Code Animation
      gsap.from('.dress-code-card', {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: '.dress-code-section',
          start: 'top 80%',
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className="dining-page" ref={containerRef}>
      {/* Hero Section */}
      <section className="dining-hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(/images/restaurant.jpg)' }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-label">CULINARY HERITAGE</span>
          <h1 className="hero-title">Dine at the Club</h1>
          <p className="hero-subtitle">Where tradition meets gastronomy in the heart of the Nilgiris</p>
        </div>
      </section>

      {/* Restaurant Section */}
      <section className="split-section restaurant-section">
        <div className="split-image-container">
          <img src="/images/restaurant.jpg" alt="The Dining Hall" className="split-image" />
        </div>
        <div className="split-content">
          <h2 className="section-title">The Dining Hall</h2>
          <p className="section-description">
            Experience traditional British club roast meals, Anglo-Indian heritage dishes, South Indian specialties, North Indian cuisine, and Continental fare. The high-ceiling teak wood dining room, dressed in crisp white tablecloths and illuminated by gleaming brass light fixtures, offers a dining experience steeped in history.
          </p>
          <div className="menu-highlights">
            <h3>Menu Highlights</h3>
            <ul>
              <li>Heritage Roasts & Grills</li>
              <li>Anglo-Indian Specialties</li>
              <li>South Indian Classics</li>
              <li>Continental Selection</li>
              <li>High Tea & Light Bites</li>
            </ul>
          </div>
          <div className="hours-info">
            <p><strong>Dining Hours:</strong> 7:30 AM – 10:00 PM</p>
            <p className="note">Guests are kindly requested to place orders in advance for lunch and dinner.</p>
          </div>
        </div>
      </section>

      {/* Bar Section */}
      <section className="split-section reversed bar-section">
        <div className="split-content">
          <h2 className="section-title">The Lounge Bar</h2>
          <p className="section-description">
            Step into our atmospheric wood-paneled bar featuring a polished brass counter, leather stools, and shelves adorned with vintage spirit bottles. Enjoy classic spirits, wines, beers, and cocktails served in an intimate colonial setting. A brick fireplace adds warmth on cool Nilgiri evenings, creating the perfect ambiance for camaraderie.
          </p>
          <div className="hours-info">
            <p><strong>Bar Hours:</strong> 11:00 AM – 11:00 PM</p>
            <p className="note">Smart casual attire required after 7 PM.</p>
          </div>
        </div>
        <div className="split-image-container">
          <img src="/images/bar.jpg" alt="The Lounge Bar" className="split-image" />
        </div>
      </section>

      {/* Lawn High Tea Section */}
      <section className="lawn-section">
        <div className="lawn-bg" style={{ backgroundImage: 'url(/images/real-sports-ground.jpg)' }}></div>
        <div className="lawn-overlay"></div>
        <div className="lawn-content">
          <h2 className="lawn-title">Lawn High Tea</h2>
          <p className="lawn-description">
            Afternoon tea, coffee, and light snacks served on the sunlit front lawns during clear weather, with panoramic views of the Nilgiri hills.
          </p>
        </div>
      </section>

      {/* Dress Code Section */}
      <section className="dress-code-section">
        <div className="dress-code-card">
          <h2 className="dress-code-title">Club Dress Code</h2>
          <div className="dress-code-content">
            <div className="dress-code-item">
              <h3>Evening Attire</h3>
              <p>Collared shirts, trousers, and closed leather shoes are expected.</p>
            </div>
            <div className="dress-code-item strictly-no">
              <h3>Strictly Prohibited (After 7 PM)</h3>
              <p>Shorts, sleeveless tees, and slippers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dining;
