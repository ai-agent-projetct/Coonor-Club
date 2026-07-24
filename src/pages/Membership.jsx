import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import './Membership.css';

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    title: 'Heritage Accommodation',
    desc: 'Access to exclusive rooms and cottages.',
    icon: '🗝️'
  },
  {
    title: 'Fine Dining',
    desc: 'Restaurant and bar privileges.',
    icon: '🍽️'
  },
  {
    title: 'Sports Facilities',
    desc: 'Tennis, billiards, squash, and more.',
    icon: '🎾'
  },
  {
    title: 'Library Access',
    desc: 'Extensive collection and quiet reading rooms.',
    icon: '📚'
  },
  {
    title: 'Social Events',
    desc: 'Club functions, celebrations, and cultural events.',
    icon: '🎭'
  },
  {
    title: 'Reciprocal Privileges',
    desc: 'Access to 70+ affiliated clubs across India.',
    icon: '🤝'
  }
];

const affiliates = [
  {
    region: 'Karnataka',
    clubs: ['Bangalore Club', 'Bowring Institute', 'Century Club', 'Bangalore City Club']
  },
  {
    region: 'Tamil Nadu',
    clubs: ['Cosmopolitan Club (Chennai)', 'Madras Gymkhana Club', 'Madras Cricket Club', 'Coimbatore Club', 'The Kodaikanal Club']
  },
  {
    region: 'Telangana & AP',
    clubs: ['Secunderabad Club', 'Waltair Club (Visakhapatnam)']
  },
  {
    region: 'Maharashtra & Goa',
    clubs: ['Willingdon Sports Club (Mumbai)', 'Poona Club (Pune)', 'PYC Hindu Gymkhana (Pune)']
  },
  {
    region: 'West Bengal',
    clubs: ['Saturday Club (Kolkata)', 'Tollygunge Club (Kolkata)']
  },
  {
    region: 'Other',
    clubs: ['CP Club (Nagpur)', 'Bamboo Club (Pollibetta)', 'Cochin Club (Kochi)']
  }
];

const rules = [
  'Access: Private members-only club',
  'Reciprocal members must produce valid Home Club ID Card and Letter of Introduction',
  'Dress code: Smart casual to formal in bar and dining areas',
  'No shorts, sleeveless tees, or slippers after 7 PM',
  'Quiet decorum in library, card rooms, and residential zones'
];

function AccordionItem({ affiliate, isOpen, onClick }) {
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header" onClick={onClick}>
        {affiliate.region}
        <span className="accordion-icon">▼</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="accordion-content-inner">
              <ul>
                {affiliate.clubs.map((club, idx) => (
                  <li key={idx}>{club}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Membership() {
  const [openRegion, setOpenRegion] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', club: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.membership-hero-label', { y: 30, opacity: 0, duration: 1, delay: 0.2 });
      gsap.from('.membership-hero-title', { y: 50, opacity: 0, duration: 1, delay: 0.4 });
      gsap.from('.membership-hero-subtitle', { y: 30, opacity: 0, duration: 1, delay: 0.6 });

      // Benefits stagger
      gsap.from('.benefit-card', {
        scrollTrigger: {
          trigger: '.membership-benefits',
          start: 'top 75%'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
      });

      // Accordion section fade
      gsap.from('.accordion-container', {
        scrollTrigger: {
          trigger: '.membership-affiliates',
          start: 'top 75%'
        },
        y: 40,
        opacity: 0,
        duration: 1
      });

      // Form animation
      gsap.from('.form-container', {
        scrollTrigger: {
          trigger: '.membership-enquiry',
          start: 'top 75%'
        },
        scale: 0.95,
        opacity: 0,
        duration: 1
      });

      // Rules card
      gsap.from('.rules-card', {
        scrollTrigger: {
          trigger: '.membership-rules',
          start: 'top 75%'
        },
        y: 50,
        opacity: 0,
        duration: 1
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Enquiry Form Submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="membership-page" ref={containerRef}>
      <section className="membership-hero">
        <div className="membership-hero-content">
          <span className="membership-hero-label">JOIN THE FELLOWSHIP</span>
          <h1 className="membership-hero-title">Membership</h1>
          <p className="membership-hero-subtitle">Become part of a distinguished legacy spanning over a century</p>
        </div>
      </section>

      <section className="membership-benefits">
        <div className="membership-container">
          <h2 className="section-title">Membership Privileges</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-affiliates">
        <div className="membership-container">
          <h2 className="section-title">Our Affiliate Network</h2>
          <p className="section-subtitle">Access to 70+ prestigious clubs across India</p>
          <div className="accordion-container">
            {affiliates.map((affiliate, idx) => (
              <AccordionItem
                key={idx}
                affiliate={affiliate}
                isOpen={openRegion === idx}
                onClick={() => setOpenRegion(openRegion === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="membership-enquiry">
        <div className="membership-container">
          <h2 className="section-title">Membership Enquiry</h2>
          <p className="section-subtitle">Express your interest in joining the Coonoor Club fellowship</p>
          
          <div className="form-container">
            {isSuccess ? (
              <div className="form-success">
                <h3>Thank You</h3>
                <p>Your enquiry has been received. Our membership committee will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="club">Current Club Affiliation (Optional)</label>
                  <input type="text" id="club" name="club" className="form-control" value={formData.club} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" className="form-control" value={formData.message} onChange={handleInputChange} required></textarea>
                </div>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="membership-rules">
        <div className="membership-container">
          <h2 className="section-title">Club Protocol</h2>
          <div className="rules-card">
            <ul className="rules-list">
              {rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
