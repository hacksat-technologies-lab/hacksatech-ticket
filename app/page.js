import { EVENT } from "@/lib/event";
import Checkout from "./Checkout";

const faqs = [
  ["How will I get my ticket?", "Right after payment your ticket opens on screen and a copy is emailed to you. Show the QR code at the entrance."],
  ["I paid but did not get an email.", "Check your spam folder. You can also leave the payment page safely. If nothing arrives in a few minutes, message us on WhatsApp with your name and phone number."],
  ["Which ticket should I pick?", "High School Student is for students in secondary school and needs your school name. Regular is general admission. Premium is the top tier."],
  ["Can I buy with cash?", "Yes. Cash and transfer sales are handled by the Hacksat team. Contact us on WhatsApp."],
];

export default function Home() {
  return (
    <main className="wrap">
      <header className="glass nav">
        <a className="logo" href={EVENT.site}>HACKSAT<b>.</b></a>
        <a className="nav-link" href="#tickets">Tickets</a>
      </header>

      <section className="hero">
        <div className="chip">12 Dec 2026 · Yola</div>
        <h1>Hacksat<br /><span>Connect</span> <em>2026</em></h1>
        <p className="lead">{EVENT.tagline}</p>
        <a className="btn" href="#tickets">Get your ticket</a>
        <div className="stubs" aria-hidden="true">
          <div className="stub s1"><i>2K</i><span>Student</span></div>
          <div className="stub s2"><i>3K</i><span>Regular</span></div>
          <div className="stub s3"><i>10K</i><span>Premium</span></div>
        </div>
        <div className="facts glass">
          <div><span>Date</span><b>{EVENT.dateLabel.replace("Saturday, ", "Sat, ")}</b></div>
          <div><span>Time</span><b>{EVENT.timeLabel}</b></div>
          <div className="wide"><span>Venue</span><b>{EVENT.venue}</b></div>
        </div>
      </section>

      <section id="tickets" className="section">
        <h2 className="h2">Choose your ticket</h2>
        <p className="muted">Pay securely with Paystack. Your ticket arrives instantly.</p>
        <Checkout />
      </section>

      <section className="section">
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
        <a className="glass btn-glass" href={`https://wa.me/${EVENT.whatsapp}`} target="_blank" rel="noopener">Chat on WhatsApp</a>
        <p className="muted small">© 2026 Hacksat Tech Ltd · {EVENT.supportEmail}</p>
      </footer>
    </main>
  );
}
