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
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Justice Buba Ardo Rd, Jimeta, Yola 640102, Adamawa State"),
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

// Landing page content. Images live in /public/images (from the hacksatech.com gallery).
export const HERO_IMAGE = { src: "/images/hero-800.webp", alt: "Attendees at the Hacksat cybersecurity meetup in Yola" };

export const PILLARS = [
  ["Connect", "Meet students, developers, founders and tech enthusiasts from across Adamawa and beyond."],
  ["Collaborate", "Swap ideas, find teammates and learn from people already building in tech."],
  ["Create", "Leave with new skills, new contacts and the push to start building."],
];

export const STATS = [
  ["1,400+", "community members"],
  ["47+", "events hosted"],
  ["2018", "building since"],
];

export const GALLERY = [
  // captions are the album names on hacksatech.com/gallery
  ["/images/g1-560.webp", "Techpreneurship Reboot, Kano"],
  ["/images/g2-560.webp", "Future Mind Summit, 1st edition"],
  ["/images/g3-560.webp", "MLH DigitalOcean workshop"],
  ["/images/g4-560.webp", "Our first event: Local Hack Day 2018"],
  ["/images/g5-560.webp", "Nigerian Red Cross Society, Yola North"],
  ["/images/g6-560.webp", "Facebook Security Workshop 2019"],
  ["/images/g7-560.webp", "Yola WordPress Meetup 2019"],
  ["/images/g8-560.webp", "MLH Local Hack Day: Build"],
];

// price in naira. color = tier accent (matches the printed tickets)
export const TIERS = [
  {
    id: "student",
    name: "High School Student",
    short: "Student",
    price: 2000,
    color: "#1e90d6",
    needsSchool: true,
    image: "/images/tier-student",
    blurb: "For high school students. School name required.",
  },
  {
    id: "regular",
    name: "Regular Ticket",
    short: "Regular",
    price: 3000,
    color: "#5b4bc4",
    image: "/images/tier-regular",
    needsSchool: false,
    blurb: "General admission to Hacksat Connect.",
  },
  {
    id: "premium",
    name: "Premium Ticket",
    short: "Premium",
    price: 10000,
    color: "#14b8a6",
    image: "/images/tier-premium",
    needsSchool: false,
    blurb: "Premium access to Hacksat Connect.",
  },
];

export const getTier = (id) => TIERS.find((t) => t.id === id);
export const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");
