import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import './Events.css';

gsap.registerPlugin(ScrollTrigger);

const Events = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.events-hero-content', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.utils.toArray('.event-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
        });
      });

      gsap.from('.schedule-table-container', {
        scrollTrigger: {
          trigger: '.schedule-table-container',
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.utils.toArray('.gallery-item').forEach((item, i) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          },
          scale: 0.95,
          opacity: 0,
          duration: 0.8,
          delay: (i % 2) * 0.1,
          ease: 'power2.out',
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const events = [
    { date: 'Every Saturday', title: 'Saturday Social & Dinner Dance', timeLoc: '7:30 PM, Assembly Hall', desc: 'Live music, dinner, and dancing' },
    { date: 'Every Sunday', title: 'Sunday Family Brunch', timeLoc: '11 AM, Dining Hall', desc: 'Lavish brunch spread for families' },
    { date: 'Every Wednesday', title: 'Bridge & Cards Evening', timeLoc: '6 PM, Card Room', desc: 'Weekly bridge tournament' },
    { date: 'Aug 15-17', title: 'Tennis Tournament', timeLoc: 'Tennis Courts', desc: 'Annual independence day tennis championship' },
    { date: 'Sep 1', title: 'Founders\' Day Celebration', timeLoc: 'Assembly Hall', desc: 'Commemorating the club\'s 1897 move to Gray\'s Hill' },
    { date: 'First Sat of Month', title: 'Nilgiri Heritage Walk', timeLoc: '7 AM, Club Entrance', desc: 'Guided heritage walk' },
  ];

  const schedule = [
    { day: 'Monday', activity: 'Fitness & Yoga (6 AM), Library Evening (6 PM)' },
    { day: 'Tuesday', activity: 'Tennis Coaching (4 PM)' },
    { day: 'Wednesday', activity: 'Bridge & Cards (6 PM)' },
    { day: 'Thursday', activity: 'Billiards Night (7 PM)' },
    { day: 'Friday', activity: 'Quiz Night (7:30 PM)' },
    { day: 'Saturday', activity: 'Social Dinner Dance (7:30 PM)' },
    { day: 'Sunday', activity: 'Family Brunch (11 AM), Cricket (2 PM)' },
  ];

  return (
    <div className="events-page" ref={containerRef}>
      <section className="events-hero">
        <div className="events-hero-content">
          <motion.span 
            className="events-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >CLUB LIFE</motion.span>
          <h1 className="events-title">Events & Social</h1>
          <p className="events-subtitle">The heartbeat of community life at the club</p>
        </div>
      </section>

      <section className="events-section">
        <h2 className="events-section-title">The Club Calendar</h2>
        <div className="events-grid">
          {events.map((ev, idx) => (
            <div className="event-card" key={idx}>
              <div className="event-date">{ev.date}</div>
              <h3 className="event-card-title">{ev.title}</h3>
              <div className="event-time-loc">{ev.timeLoc}</div>
              <p className="event-desc">{ev.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="events-section bg-cream" style={{ backgroundColor: 'var(--color-cream)' }}>
        <h2 className="events-section-title">Weekly Rhythm</h2>
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Activities</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr key={idx}>
                  <td className="schedule-day">{row.day}</td>
                  <td>{row.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="events-section">
        <h2 className="events-section-title">Moments at the Club</h2>
        <div className="gallery-grid">
          <div className="gallery-item"><img src="/images/real-sports-ground.jpg" alt="Lawn" /></div>
          <div className="gallery-item"><img src="/images/real-heritage-cottage.jpg" alt="Lounge" /></div>
          <div className="gallery-item"><img src="/images/restaurant.jpg" alt="Restaurant" /></div>
          <div className="gallery-item"><img src="/images/billiards.jpg" alt="Billiards" /></div>
        </div>
      </section>
    </div>
  );
};

export default Events;
