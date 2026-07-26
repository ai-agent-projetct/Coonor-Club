import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Dining.css';

gsap.registerPlugin(ScrollTrigger);

/* Real menus & tariffs from the club's three dining venues */
const menus = [
  {
    key: 'planters',
    name: "The Planters' Table",
    tag: 'MAIN RESTAURANT',
    hours: '7:00 AM – 10:30 PM',
    access: 'Members & Guests',
    items: [
      ['Dosa (varieties)', '₹40'],
      ['Idly / Uthappam', '₹30'],
      ['Soup of the day', '₹60'],
      ['Butter Chicken Masala', '₹180'],
      ['Steaks & Grills', '₹220'],
      ['Fish & Chips', '₹190'],
      ['Fried Rice / Noodles', '₹120'],
      ['Dhal & Rasam', '₹40'],
      ['Desserts', '₹80'],
    ],
    note: 'Starters from ₹20 · Mains from ₹40 · Smart Casual',
  },
  {
    key: 'veranda',
    name: 'The Veranda Tearoom',
    tag: 'AFTERNOON TEA',
    hours: '3:00 PM – 6:30 PM',
    access: 'Members & Guests',
    items: [
      ['Orthodox Green Tea', '₹35'],
      ['Nilgiri Black Tea', '₹35'],
      ['White Tea', '₹70'],
      ['Filter Coffee', '₹20'],
      ['Cappuccino', '₹55'],
      ['Hot Chocolate', '₹150'],
      ['Cold Coffee', '₹120'],
      ['Ginger Cake', '₹40'],
      ['Fresh Fruit Juice', '₹75'],
    ],
    note: 'Served with a backdrop of the Nilgiri tea gardens · Smart Casual',
  },
  {
    key: 'rajbar',
    name: 'The Raj Bar',
    tag: "MEMBERS' BAR",
    hours: '12:00 PM – 11:00 PM',
    access: 'Members only · guests with a member',
    items: [
      ['Single Malt Whisky', '₹450'],
      ['Blended Whisky', '₹280'],
      ['Old Monk Rum', '₹220'],
      ['Vodka / Brandy', '₹240'],
      ['Kingfisher Beer', '₹180'],
      ['Red / White Wine', '₹350'],
      ['Gin & Tonic', '₹260'],
      ['Mojito', '₹220'],
      ['Virgin Piña Colada', '₹160'],
    ],
    note: 'Established 1924 · The club’s historic members’ bar',
  },
];

const Dining = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content > *', { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.5 });

      gsap.utils.toArray('.split-section').forEach((section) => {
        const image = section.querySelector('.split-image');
        const content = section.querySelector('.split-content');
        const reversed = section.classList.contains('reversed');
        gsap.fromTo(image, { x: reversed ? 50 : -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 75%' } });
        gsap.fromTo(content, { x: reversed ? -50 : 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 75%' } });
      });

      gsap.from('.menu-card', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.menu-section', start: 'top 78%' },
      })

      gsap.from('.seasonal-card', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.seasonal-section', start: 'top 80%' },
      });

      gsap.from('.lawn-content > *', {
        y: 30, opacity: 0, duration: 1, stagger: 0.2,
        scrollTrigger: { trigger: '.lawn-section', start: 'top 70%' },
      });

      gsap.from('.dress-code-card', {
        scale: 0.95, opacity: 0, duration: 1,
        scrollTrigger: { trigger: '.dress-code-section', start: 'top 80%' },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="dining-page" ref={containerRef}>
      {/* Hero */}
      <section className="dining-hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(/images/club-dining1.jpg)' }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-label">CULINARY HERITAGE</span>
          <h1 className="hero-title">Dine at the Club</h1>
          <p className="hero-subtitle">Three storied venues, one legacy — since 1885</p>
        </div>
      </section>

      {/* The Planters' Table */}
      <section className="split-section restaurant-section">
        <div className="split-image-container">
          <img src="/images/club-planters.jpg" alt="The Planters' Table" className="split-image" />
        </div>
        <div className="split-content">
          <span className="section-eyebrow">Main Restaurant</span>
          <h2 className="section-title">The Planters' Table</h2>
          <p className="section-description">
            Our multi-cuisine dining room serves South Indian, Continental, Chinese and North Indian
            fare beneath teak-panelled halls dressed in crisp white linen and warm brass light. From
            crisp dosas at dawn to grills and butter chicken by night, it is the heart of club life.
          </p>
          <div className="menu-highlights">
            <h3>Menu Highlights</h3>
            <ul>
              <li>Dosa, Idly & Uthappam</li>
              <li>Steaks, Grills & Pepper Fry</li>
              <li>Butter Chicken & Biryani</li>
              <li>Continental & Chinese</li>
              <li>Fish & Chips · Desserts</li>
            </ul>
          </div>
          <div className="hours-info">
            <p><strong>Hours:</strong> 7:00 AM – 10:30 PM · Members &amp; Guests</p>
            <p className="note">Kindly place lunch &amp; dinner orders in advance.</p>
          </div>
        </div>
      </section>

      {/* The Veranda Tearoom */}
      <section className="split-section reversed tearoom-section">
        <div className="split-content">
          <span className="section-eyebrow">Afternoon Tea</span>
          <h2 className="section-title">The Veranda Tearoom</h2>
          <p className="section-description">
            Take the celebrated teas of the Nilgiris — orthodox green, white and CTC — with fresh
            coffee and light bites, served on the veranda against a backdrop of rolling tea gardens.
            A gentle afternoon ritual in the cool hill air.
          </p>
          <div className="menu-highlights">
            <h3>House Favourites</h3>
            <ul>
              <li>Orthodox Green &amp; White Tea</li>
              <li>Filter Coffee &amp; Cappuccino</li>
              <li>Hot Chocolate &amp; Cold Coffee</li>
              <li>Ginger Cake &amp; Cookies</li>
            </ul>
          </div>
          <div className="hours-info">
            <p><strong>Hours:</strong> 3:00 PM – 6:30 PM · Members &amp; Guests</p>
          </div>
        </div>
        <div className="split-image-container">
          <img src="/images/club-veranda.jpg" alt="The Veranda Tearoom" className="split-image" />
        </div>
      </section>

      {/* The Raj Bar */}
      <section className="split-section bar-section">
        <div className="split-image-container">
          <img src="/images/club-bar.jpg" alt="The Raj Bar" className="split-image" />
        </div>
        <div className="split-content">
          <span className="section-eyebrow">Members' Bar · Est. 1924</span>
          <h2 className="section-title">The Raj Bar</h2>
          <p className="section-description">
            The club's historic wood-panelled bar, watched over by mounted trophies and antique clocks.
            Single malts, blended whiskies, classic cocktails and chilled beer are poured across a
            polished counter — the natural home of an evening at the club.
          </p>
          <div className="hours-info">
            <p><strong>Hours:</strong> 12:00 PM – 11:00 PM · Members only</p>
            <p className="note">Guests welcome when accompanied by a member. Smart casual after 7 PM.</p>
          </div>
        </div>
      </section>

      {/* Menu & Tariff */}
      <section className="menu-section">
        <div className="section-header">
          <span className="section-eyebrow">À la Carte</span>
          <h2>Menu &amp; Tariff</h2>
          <p>A selection from each venue. Prices in Indian Rupees, inclusive of applicable taxes.</p>
        </div>
        <div className="menu-grid">
          {menus.map((m) => (
            <div className="menu-card" key={m.key}>
              <div className="menu-card-head">
                <span className="menu-card-tag">{m.tag}</span>
                <h3>{m.name}</h3>
                <span className="menu-card-hours">{m.hours}</span>
              </div>
              <ul className="menu-list">
                {m.items.map(([name, price]) => (
                  <li key={name}><span>{name}</span><span className="menu-price">{price}</span></li>
                ))}
              </ul>
              <p className="menu-card-note">{m.note}</p>
            </div>
          ))}
        </div>
        <p className="menu-foot">Daily breakfast specials rotate through poori masala, iddyappam, appam, pongal &amp; more. Seasonal menus include the Nilgiri High Tea, monsoon thali (Jul–Sep) and Christmas dinner.</p>
      </section>

      {/* Lawn High Tea */}
      <section className="lawn-section">
        <div className="lawn-bg" style={{ backgroundImage: 'url(/images/club-outsideview.jpg)' }}></div>
        <div className="lawn-overlay"></div>
        <div className="lawn-content">
          <h2 className="lawn-title">Tea on the Front Lawn</h2>
          <p className="lawn-description">
            On clear afternoons, tea, coffee and light snacks are served on the sunlit front lawns,
            with panoramic views across the Nilgiri hills.
          </p>
        </div>
      </section>

      {/* Seasonal & Special Events */}
      <section className="seasonal-section">
        <div className="section-header">
          <span className="section-eyebrow">Through the Year</span>
          <h2>Seasonal &amp; Special Events</h2>
          <p>Beyond the daily table, the club's calendar turns with the Nilgiri seasons.</p>
        </div>
        <div className="seasonal-grid">
          {[
            { icon: '🫖', title: 'Nilgiri High Tea', text: 'A grand afternoon spread of Nilgiri teas, savouries and cakes on the sunlit lawn.' },
            { icon: '🍽️', title: 'Sunday Specials', text: "Rotating chef's specials and unhurried family lunches every Sunday." },
            { icon: '🌧️', title: 'Monsoon Thali', text: 'A hearty regional thali served through the monsoon months (July–September).' },
            { icon: '🎄', title: 'Christmas Dinner', text: "The club's cherished festive dinner, carols and celebrations each December." },
          ].map((s) => (
            <div className="seasonal-card" key={s.title}>
              <div className="seasonal-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dress Code */}
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
