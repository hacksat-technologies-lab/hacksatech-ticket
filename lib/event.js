// Everything event-specific lives here. For a new event, edit this file only.
export const EVENT = {
  name: "Hacksat Connect",
  year: "2026",
  tagline: "Connect. Collaborate. Create.",
  dateISO: "2026-12-12",
  startsAt: "2026-12-12T09:00:00+01:00", // Lagos time, drives the countdown
  dateLabel: "Saturday, 12 December 2026",
  dateShort: "Sat, 12 Dec",
  timeLabel: "9:00 AM",
  venue: "Justice Buba Ardo Rd, Jimeta, Yola 640102, Adamawa State",
  city: "Yola, Adamawa State",
  mapsUrl: "https://maps.app.goo.gl/s7tm7Jjsuti8EivN6",
  whatsapp: "2348100448196",
  supportEmail: "info@hacksatech.com",
  site: "https://hacksatech.com",
  salesOpen: true,
  socials: [
    ["Instagram", "https://www.instagram.com/hacksatechltd/"],
    ["X", "https://x.com/Hacksatechltd"],
    ["Facebook", "https://www.facebook.com/Hacksatechltd"],
    ["LinkedIn", "https://www.linkedin.com/company/hacksat-tech-ltd/"],
    ["YouTube", "https://youtube.com/@hacksatechltd"],
  ],
};

// Landing page photos live in /public/images (from the hacksatech.com gallery).
// Hero background slides, in order. Changes every HERO_INTERVAL ms.
export const HERO_SLIDES = ["/images/slide1.webp", "/images/slide2.webp", "/images/slide3.webp", "/images/slide4.webp", "/images/slide5.webp"];
export const HERO_INTERVAL = 5000;

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
