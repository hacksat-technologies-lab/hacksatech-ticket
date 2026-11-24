import Desk from "./Desk";

// Hidden page for issuing tickets to people who paid cash. Not linked anywhere and not indexed.
// Every request needs DESK_PASSCODE, checked on the server.
export const metadata = { title: "Ticket desk", robots: { index: false, follow: false } };

export default function DeskPage() {
  return (
    <main className="wrap center desk">
      <Desk />
    </main>
  );
}
