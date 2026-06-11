function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>SIDDHI JEWELLS</h3>
          <p>Authentic Tibetan jewellery, silver, copper, crystals, and gemstones. Handcrafted with love and tradition.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="#">Home</a>
          <a href="#">New Arrivals</a>
          <a href="#">Sale</a>
          <a href="#">Blog</a>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
            </svg>
            <span>+977 9840000000</span>
          </div>
          <div className="contact-item">
            <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.6" fill="none"/>
            </svg>
            <span>info@siddhijewells.com</span>
          </div>
          <div className="contact-item">
            <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/>
            </svg>
            <span>Jyatha, Kathmandu, Nepal</span>
          </div>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 1.1.21V9.51a6.34 6.34 0 0 0-1.1-.11 6.36 6.36 0 0 0-4.59 10.86 6.36 6.36 0 0 0 10.8-4.44c0-.14 0-.28-.01-.42V9.69a7.53 7.53 0 0 0 4.03 1.1v-3.5a4.85 4.85 0 0 1-1.99-.6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Siddhi Jewells. All rights reserved. | Silver • Copper • Crystals • Gemstones</p>
      </div>
    </footer>
  )
}

export default Footer