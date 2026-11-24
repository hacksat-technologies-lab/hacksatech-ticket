import { EVENT, HERO_IMAGE, PILLARS, STATS, GALLERY } from "@/lib/event";
import Checkout from "./Checkout";
import Countdown from "./Countdown";

const faqs = [
  ["How will I get my ticket?", "Right after payment your ticket opens on screen, ready to download as an image, and a copy is emailed to you. Show the QR code at the entrance."],
  ["I paid but did not get an email.", "Check your spam folder. It is safe to leave the payment page. If nothing arrives in a few minutes, message us on WhatsApp with your name and phone number."],
  ["Which ticket should I pick?", "High School Student is for students in secondary school and needs your school name. Regular is general admission. Premium is the top tier."],
  ["Can I buy with cash?", "Yes. Cash and transfer sales are handled by the Hacksat team. Contact us on WhatsApp."],
];

const Icon = ({ d }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ICONS = {
  Connect: "M8 12h8M7 7a5 5 0 1 0 0 10M17 7a5 5 0 1 1 0 10",
  Collaborate: "M16 11a4 4 0 1 0-8 0M3 20a6 6 0 0 1 6-5h6a6 6 0 0 1 6 5",
  Create: "M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z",
  date: "M7 3v3M17 3v3M4 9h16M5 6h14v14H5z",
  time: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  pin: "M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
};

export default function Home() {
  return (
    <main className="wrap wide">
      <header className="glass nav">
        <a className="logo" href={EVENT.site}>HACKSAT<b>.</b></a>
        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#venue">Venue</a>
          <a className="nav-cta" href="#tickets">Get tickets</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <img src={HERO_IMAGE.src} alt="" fetchPriority="high" width="800" height="531" />
        </div>
        <div className="hero-body">
          <div className="chip"><span className="live-dot" />{EVENT.dateShort} {EVENT.year} · {EVENT.city}</div>
          <h1>Hacksat<br /><span>Connect</span> <em>2026</em></h1>
          <p className="lead">{EVENT.tagline} A day of tech, community and opportunity in Yola.</p>
          <div className="hero-cta">
            <a className="btn" href="#tickets">Get your ticket</a>
            <a className="btn-ghost" href="#about">Learn more</a>
          </div>
          <Countdown to={EVENT.startsAt} />
        </div>
      </section>

      <section className="details">
        <div className="glass detail"><span className="ico"><Icon d={ICONS.date} /></span><div><span>Date</span><b>{EVENT.dateShort}</b></div></div>
        <div className="glass detail"><span className="ico"><Icon d={ICONS.time} /></span><div><span>Time</span><b>{EVENT.timeLabel}</b></div></div>
        <a className="glass detail" href={EVENT.mapsUrl} target="_blank" rel="noopener"><span className="ico"><Icon d={ICONS.pin} /></span><div><span>Venue</span><b>Jimeta, Yola</b></div></a>
      </section>

      <section id="about" className="section">
        <p className="kicker">Why attend</p>
        <h2 className="h2">One day. One community. <span className="grad">Endless connections.</span></h2>
        <div className="pillars">
          {PILLARS.map(([title, text]) => (
            <div key={title} className="glass pillar">
              <span className="ico big"><Icon d={ICONS[title]} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="stats">
          {STATS.map(([n, l]) => (
            <div key={l}><b>{n}</b><span>{l}</span></div>
          ))}
        </div>
      </section>

      <section id="tickets" className="section">
        <p className="kicker">Tickets</p>
        <h2 className="h2">Choose your ticket</h2>
        <p className="muted sub">Pay securely with Paystack. Your ticket appears instantly and lands in your inbox.</p>
        <Checkout />
      </section>

      <section className="section">
        <p className="kicker">Past events</p>
        <h2 className="h2">Moments from the community</h2>
        <p className="muted sub">Since 2018 Hacksat has run hackathons, bootcamps and meetups across Northern Nigeria.</p>
        <div className="gallery" tabIndex={0} aria-label="Photos from past Hacksat events">
          {GALLERY.map(([src, cap]) => (
            <figure key={src} className="shot">
              <img src={src} alt={cap} loading="lazy" decoding="async" width="280" height="350" />
              <figcaption>{cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="venue" className="section">
        <p className="kicker">Venue</p>
        <div className="glass venue">
          <div>
            <h2 className="h2">See you in Yola</h2>
            <p className="muted">{EVENT.venue}</p>
            <p className="venue-time"><b>{EVENT.dateLabel}</b> · Doors open {EVENT.timeLabel}</p>
          </div>
          <a className="btn" href={EVENT.mapsUrl} target="_blank" rel="noopener">Open in Google Maps</a>
        </div>
      </section>

      <section className="section">
        <p className="kicker">FAQ</p>
        <h2 className="h2">Good to know</h2>
        <div className="faq">
          {faqs.map(([q, a]) => (
            <details key={q} className="glass">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="foot">
        <div className="glass foot-card">
          <a className="logo" href={EVENT.site}>HACKSAT<b>.</b></a>
          <p className="muted small">Innovating technology across Africa.</p>
          <div className="socials">
            {EVENT.socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener">{n}</a>)}
          </div>
          <a className="btn-glass glass" href={`https://wa.me/${EVENT.whatsapp}`} target="_blank" rel="noopener">Questions? Chat on WhatsApp</a>
        </div>
        <p className="muted small">© 2026 Hacksat Tech Ltd · {EVENT.supportEmail}</p>
      </footer>
    </main>
  );
}
