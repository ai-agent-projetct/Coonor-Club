import { Link } from 'react-router-dom'
import './Footer.css'

const footerLinks = [
  { label: 'Heritage', path: '/heritage' },
  { label: 'Dining', path: '/dining' },
  { label: 'Stay', path: '/accommodation' },
  { label: 'Sports', path: '/sports' },
  { label: 'Facilities', path: '/facilities' },
  { label: 'Events', path: '/events' },
  { label: 'Contact', path: '/contact' },
]

export default function Footer() {
  return (
    <footer className="footer">
      {/* Latin Motto Marquee */}
      <div className="footer__marquee">
        <div className="marquee-track">
          {[...Array(6)].map((_, i) => (
            <span className="marquee-item" key={i}>
              LEGACY ✦ HERITAGE ✦ COMMUNITY ✦ SPIRIT ✦ TRADITION ✦
            </span>
          ))}
        </div>
      </div>

      <div className="footer__content container">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__crest">⚜</span>
            <h3 className="footer__club-name">Coonoor Club</h3>
            <p className="footer__motto text-accent">
              "There are no strangers.<br />
              Just friends you have not met."
            </p>
          </div>

          <div className="footer__nav">
            <h4 className="footer__nav-title text-label">Explore</h4>
            <ul className="footer__nav-list">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__contact">
            <h4 className="footer__nav-title text-label">Visit Us</h4>
            <address className="footer__address">
              <p>134 Club Road, Gray's Hill</p>
              <p>Coonoor, The Nilgiris</p>
              <p>Tamil Nadu – 643101</p>
              <br />
              <p>
                <a href="tel:+914232231714">+91 423-2231714</a>
              </p>
              <p>
                <a href="mailto:coonoorclub1885@gmail.com">
                  coonoorclub1885@gmail.com
                </a>
              </p>
            </address>
          </div>

          <div className="footer__hours">
            <h4 className="footer__nav-title text-label">Club Hours</h4>
            <p>Dining Hall: 7:30 AM – 10:00 PM</p>
            <p>Bar & Lounge: 11:00 AM – 11:00 PM</p>
            <p>Library: 9:00 AM – 9:00 PM</p>
            <p>Tennis Courts: 6:00 AM – 6:00 PM</p>
          </div>
        </div>

        {/* Giant Editorial Wordmark */}
        <div className="footer__wordmark">
          <h2>COONOOR CLUB</h2>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Coonoor Club. All rights reserved.</p>
          <p>Established 1885 · Gray's Hill, Coonoor · The Nilgiris</p>
        </div>
      </div>
    </footer>
  )
}
