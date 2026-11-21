export default function NotFound() {
  return (
    <main className="wrap center">
      <div className="glass card pad" style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 className="h2">Ticket not found</h1>
        <p className="muted">Check the link in your email, or message us on WhatsApp and we will sort it out.</p>
        <a className="btn" href="/">Back home</a>
      </div>
    </main>
  );
}
