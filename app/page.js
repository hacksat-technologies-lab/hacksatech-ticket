import { EVENT, HERO_SLIDES, HERO_INTERVAL, TIERS } from "@/lib/event";
import Checkout from "./Checkout";
import Countdown from "./Countdown";
import HeroSlides from "./HeroSlides";

const steps = [
  ["Pick a ticket", "Choose your ticket and enter your name, phone and email."],
  ["Pay with Paystack", "Secure checkout that takes under a minute."],
  ["Show your QR", "Your ticket opens instantly and is emailed to you. Show the QR code at the entrance."],
];

const faqs = [
  ["I paid but did not get an email.", "Check your spam folder. It is safe to leave the payment page. If nothing arrives in a few minutes, message us on WhatsApp with your name and phone number."],
  ["Which ticket should I pick?", "Student is for secondary school students and needs your school name. Regular is general admission. Premium is the top tier."],
  ["Can I buy with cash?", "Yes. Cash and transfer sales are handled by the Hacksat team. Contact us on WhatsApp."],
];

export default function Home() {
  return (
    <main className="wrap wide">
      <header className="glass nav">
        <a className="logo" href={EVENT.site} aria-label="Hacksat home"><img src="/logo-white.png" alt="Hacksat" width="122" height="112" /></a>
        <nav className="nav-links">
          <a href="#venue">Venue</a>
          <a href="#faq">FAQ</a>
          <a className="nav-cta" href="#tickets">Get tickets</a>
        </nav>
      </header>

      <section className="hero">
        <HeroSlides slides={HERO_SLIDES} interval={HERO_INTERVAL} />
        <div className="hero-body">
          <div className="chip"><span className="live-dot" />{EVENT.dateShort} {EVENT.year} · {EVENT.city}</div>
          <h1>Hacksat<br /><span>Connect</span> <em>2026</em></h1>
          <p className="lead">{EVENT.tagline} A day of tech, community and opportunity in Yola.</p>
          <a className="btn" href="#tickets">Get your ticket</a>
          <a className="stubs" href="#tickets" aria-label="See ticket prices">
            {TIERS.map((t, n) => (
              <span key={t.id} className={`stub s${n + 1}`}><i>{t.price / 1000}K</i><span>{t.short}</span></span>
            ))}
          </a>
          <Countdown to={EVENT.startsAt} />
        </div>
      </section>

      <section id="venue" className="facts">
        <div><span>Date</span><b>{EVENT.dateLabel}</b></div>
        <div><span>Doors open</span><b>{EVENT.timeLabel}</b></div>
        <div className="facts-venue">
          <span>Venue</span><b>{EVENT.venue}</b>
          <a href={EVENT.mapsUrl} target="_blank" rel="noopener">Get directions →</a>
        </div>
      </section>

      <section id="tickets" className="section tickets">
        <p className="kicker">Tickets on sale</p>
        <h2 className="h2">Choose your ticket</h2>
        <Checkout />
      </section>

      <section className="section">
        <p className="kicker">How it works</p>
        <ol className="steps">
          {steps.map(([title, text], n) => (
            <li key={title}><i>0{n + 1}</i><b>{title}</b><p>{text}</p></li>
          ))}
        </ol>
      </section>

      <section id="faq" className="section">
        <p className="kicker">FAQ</p>
        <div className="faq">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="foot">
        <a className="logo big" href={EVENT.site} aria-label="Hacksat home"><img src="/logo-white.png" alt="Hacksat" width="122" height="112" loading="lazy" /></a>
        <a className="foot-wa" href={`https://wa.me/${EVENT.whatsapp}`} target="_blank" rel="noopener">Questions? Chat with us on WhatsApp</a>
        <nav className="socials">
          {EVENT.socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener">{n}</a>)}
        </nav>
        <p className="muted small">© 2026 Hacksat Tech Ltd · {EVENT.supportEmail}</p>
      </footer>
    </main>
  );
}
