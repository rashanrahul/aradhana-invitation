import {
  ArrowUpRight,
  MessageCircle,
  Music2,
  Phone,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

function FacebookMark() {
  return <span aria-hidden="true" className="brand-footer-facebook-mark">f</span>
}

function InstagramMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

const socialLinks = [
  {
    label: 'Facebook',
    detail: 'Find us on Facebook',
    href: 'https://www.facebook.com/share/19t6S2USqS/',
    icon: FacebookMark,
  },
  {
    label: 'Instagram',
    detail: 'Follow our latest designs',
    href: 'https://www.instagram.com/aradhanainvitationslk?exln=ZjN1ZTk5ZWkwNDAx',
    icon: InstagramMark,
  },
  {
    label: 'TikTok',
    detail: 'A little inspiration, daily',
    href: 'https://www.tiktok.com/@aradhanainvitationslk',
    icon: Music2,
  },
]

export default function BrandFooter() {
  return (
    <footer className="brand-footer">
      <div className="brand-footer-inner">
        <div className="brand-footer-main">
          <div className="brand-footer-intro">
            <Link to="/" className="brand-footer-brand" aria-label="Aradhana Invitation home">
              <span className="brand-footer-logo-frame">
                <img src="/logo.png" alt="" className="brand-footer-logo" />
              </span>
              <span className="brand-footer-wordmark">
                <strong>ARADHANA</strong>
                <small>INVITATION</small>
              </span>
            </Link>
            <p>Beautiful beginnings for your most meaningful moments.</p>
          </div>

          <div className="brand-footer-social">
            <p className="brand-footer-eyebrow">Follow our story</p>
            <div className="brand-footer-social-links">
              {socialLinks.map(({ label, detail, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-footer-social-link"
                >
                  <span className="brand-footer-icon"><Icon size={19} /></span>
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                  <ArrowUpRight size={15} className="brand-footer-arrow" />
                </a>
              ))}
            </div>
          </div>

          <div className="brand-footer-contact">
            <p className="brand-footer-eyebrow">Let’s make it special</p>
            <a href="tel:+94707937390" className="brand-footer-phone">
              <Phone size={17} />
              <span>070 793 7390</span>
            </a>
            <a
              href="https://wa.me/94707937390?text=Hello%20Aradhana%20Invitation!%20I%20would%20like%20to%20make%20an%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="brand-footer-whatsapp"
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="brand-footer-bottom">
          <span>© {currentYear} Aradhana Invitation. All rights reserved.</span>
          <span className="brand-footer-signoff">Made with care for your celebrations <Music2 size={14} /></span>
        </div>
      </div>
    </footer>
  )
}
