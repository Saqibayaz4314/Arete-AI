import { Link } from "react-router-dom"

const Landing = () => (
  <>
    <section className="hero-section page-wrap">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> AI-powered career preparation</div>
        <h1>Turn your next interview into your <em>breakthrough.</em></h1>
        <p className="hero-lede">Arete reads between the lines of a job description, finds your gaps, and builds the practice plan that gets you ready to win.</p>
        <div className="hero-actions"><Link className="button primary-button large-button" to="/register">Start preparing free <span>↗</span></Link><Link className="text-link" to="/features">See how it works <span>→</span></Link></div>
        <div className="hero-proof"><div className="avatar-stack"><span>AS</span><span>MK</span><span>JD</span><span>+</span></div><p><strong>2,000+</strong> candidates preparing smarter</p></div>
      </div>
      <div className="hero-visual" aria-label="Arete interview readiness report preview">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="report-window"><div className="window-bar"><span /><span /><span /><small>ARETE / READINESS REPORT</small></div><div className="report-body"><div className="report-title"><div><small>YOUR MATCH SCORE</small><h3>Frontend Engineer</h3></div><strong>84<sup>%</sup></strong></div><div className="score-line"><i /></div><div className="report-grid"><div className="mini-panel"><small>SKILLS FOUND</small><b>18</b><span>↑ 12% this week</span></div><div className="mini-panel"><small>SKILL GAPS</small><b>04</b><span className="muted">Ready to drill</span></div></div><div className="insight-card"><span className="insight-icon">✦</span><div><small>ARETE INSIGHT</small><p>Your React architecture experience is a strong match. Let's sharpen your testing story.</p></div></div><div className="report-footer"><span>7-day preparation plan</span><span>View report →</span></div></div></div>
      </div>
    </section>
    <section className="logo-strip"><span>POWERING BETTER PREPARATION FOR</span><b>BUILDERS</b><b>DESIGNERS</b><b>ANALYSTS</b><b>LEADERS</b></section>
    <section className="feature-intro page-wrap"><div><div className="eyebrow">A sharper way forward</div><h2>Preparation that feels like <em>progress.</em></h2></div><p>Stop guessing what to study. Get a clear read on where you stand, then practice exactly what moves the needle.</p></section>
    <section className="three-features page-wrap"><article><span className="feature-number">01</span><h3>See your real fit</h3><p>Upload your resume and a job description. Arete maps your experience to what the role actually needs.</p><Link to="/features">Explore matching <span>→</span></Link></article><article><span className="feature-number">02</span><h3>Practice with intent</h3><p>Generate role-specific technical and behavioral questions that challenge the gaps that matter.</p><Link to="/features">Explore practice <span>→</span></Link></article><article><span className="feature-number">03</span><h3>Know when you are ready</h3><p>Track your progress over time and walk into the room with a plan, not a prayer.</p><Link to="/features">Explore progress <span>→</span></Link></article></section>
    <section className="cta-band page-wrap"><div><div className="eyebrow">Your next chapter starts here</div><h2>Make preparation your <em>unfair advantage.</em></h2></div><Link className="button primary-button large-button" to="/register">Create your free account <span>↗</span></Link></section>
  </>
)

export default Landing
