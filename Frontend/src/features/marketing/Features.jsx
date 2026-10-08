import { Link } from "react-router-dom"

const features = [
  ["01", "Resume intelligence", "Go beyond keyword matching. Arete understands the evidence in your experience and translates it into the language of your target role."],
  ["02", "Role fit analysis", "See a clear match score, the strengths to lead with, and the gaps that deserve your attention before interview day."],
  ["03", "AI interview practice", "Practice questions shaped around the exact role, from technical deep dives to the behavioral moments that reveal how you think."],
  ["04", "Skill gap drills", "Turn every weak spot into a focused drill with practical prompts and a preparation path you can actually follow."],
  ["05", "Progress dashboard", "Keep your momentum visible. Review sessions, track improvements, and know when your preparation is paying off."],
  ["06", "Exportable reports", "Take your insights with you. Download a polished report to revisit before the big day or share with a mentor."],
]

const Features = () => <div className="subpage page-wrap"><div className="subpage-hero"><div className="eyebrow">The Arete advantage</div><h1>Everything you need to prepare with <em>clarity.</em></h1><p>One intelligent workspace for turning a job opportunity into a focused, confident interview plan.</p></div><div className="feature-list">{features.map(([number, title, text]) => <article key={number}><span className="feature-number">{number}</span><div><h2>{title}</h2><p>{text}</p></div><span className="feature-arrow">↗</span></article>)}</div><div className="subpage-cta"><h2>Ready to see your edge?</h2><Link className="button primary-button" to="/register">Start for free <span>↗</span></Link></div></div>

export default Features
