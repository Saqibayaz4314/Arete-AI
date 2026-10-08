import { Link, NavLink, Outlet } from "react-router-dom"
import "./marketing.scss"

const MarketingLayout = () => (
  <div className="marketing-shell">
    <header className="marketing-nav">
      <Link className="brand-mark" to="/">
        <img src="/arete_logo.png" alt="Arete" />
        <span>arete<span>.ai</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavLink to="/features">Features</NavLink>
        <NavLink to="/docs">Docs</NavLink>
        <NavLink to="/pricing">Pricing</NavLink>
      </nav>
      <div className="nav-actions">
        <Link className="nav-sign-in" to="/login">Sign in</Link>
        <Link className="button primary-button nav-cta" to="/register">Get started <span>↗</span></Link>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="marketing-footer">
      <Link className="brand-mark" to="/">
        <img src="/arete_logo.png" alt="Arete" />
        <span>arete<span>.ai</span></span>
      </Link>
      <p>Build the career you are ready for.</p>
      <div className="footer-links"><Link to="/features">Features</Link><Link to="/docs">Docs</Link><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link></div>
      <small>© 2026 Arete AI. Built for ambitious candidates.</small>
    </footer>
  </div>
)

export default MarketingLayout
