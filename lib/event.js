// Everything event-specific lives here. For a new event, edit this file only.
export const EVENT = {
  name: "Hacksat Connect",
  year: "2026",
  tagline: "Connect. Collaborate. Create.",
  dateISO: "2026-12-12",
  dateLabel: "Saturday, 12 December 2026",
  timeLabel: "9:00 AM",
  venue: "Justice Buba Ardo Rd, Jimeta, Yola 640102, Adamawa State",
  city: "Yola, Adamawa State",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Justice Buba Ardo Rd, Jimeta, Yola 640102, Adamawa State"),
  whatsapp: "2348100448196",
  supportEmail: "info@hacksatech.com",
  site: "https://hacksatech.com",
  salesOpen: true,
};

// price in naira. color = tier accent (matches the printed tickets)
export const TIERS = [
  {
    id: "student",
    name: "High School Student",
    short: "Student",
    price: 2000,
    color: "#1e90d6",
    needsSchool: true,
    blurb: "For high school students. School name required.",
  },
  {
    id: "regular",
    name: "Regular Ticket",
    short: "Regular",
    price: 3000,
    color: "#5b4bc4",
    needsSchool: false,
    blurb: "General admission to Hacksat Connect.",
  },
  {
    id: "premium",
    name: "Premium Ticket",
    short: "Premium",
    price: 10000,
    color: "#14b8a6",
    needsSchool: false,
    blurb: "Premium access to Hacksat Connect.",
  },
];

export const getTier = (id) => TIERS.find((t) => t.id === id);
export const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");
