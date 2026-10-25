// Placeholder content for the design preview. Every value here moves into the database and
// becomes editable in the admin; figures, names and contact details are stand-ins until the
// foundation supplies the real ones.

import type { ImageSlug } from "./images";

export const site = {
  name: "Nunayon Foundation",
  tagline: "Empowering lives. Building communities.",
  description:
    "Nunayon Foundation runs education, health, livelihood and relief outreaches for families in communities across Nigeria, from our office in Lagos.",
  address: "12 Placeholder Street, Ikeja, Lagos",
  email: "hello@nunayonfoundation.org",
  phone: "+234 800 000 0000",
  whatsapp: "+234 800 000 0000",
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
    { label: "X", href: "https://x.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
};

export const nav = [
  { href: "/about", label: "About" },
  { href: "/programmes", label: "Programmes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/get-involved", label: "Get involved" },
  { href: "/contact", label: "Contact" },
];

export const hero = {
  title: "Helping families across Nigeria grow stronger, together.",
  lead: "We put children in school, help mothers start and grow small businesses, and bring care and clean water to communities that need it.",
  slides: ["children-waving", "classroom-smiles", "health-check", "volunteer-children", "village-group"] satisfies ImageSlug[],
};

// Placeholder figures until the foundation supplies its own.
export const impact = {
  title: "What your support has done so far",
  stats: [
    { value: 2400, suffix: "+", label: "Children kept in school" },
    { value: 650, suffix: "", label: "Families supported with business grants" },
    { value: 38, suffix: "", label: "Community outreaches held" },
    { value: 12, suffix: "", label: "States reached" },
  ],
};

export type Programme = {
  slug: string;
  title: string;
  summary: string;
  image: ImageSlug;
};

export const programmes: Programme[] = [
  {
    slug: "education-support",
    title: "Education Support",
    summary: "School fees, uniforms, books and back-to-school packs so children stay in class.",
    image: "students-window",
  },
  {
    slug: "women-and-widows-livelihoods",
    title: "Women & Widows Livelihoods",
    summary: "Skills training and small business grants that give mothers a steady income.",
    image: "sewing-lagos",
  },
  {
    slug: "youth-skills",
    title: "Youth Skills & Digital Training",
    summary: "Vocational and computer training, with starter kits for graduates.",
    image: "laptop-learning",
  },
  {
    slug: "community-health",
    title: "Community Health Outreach",
    summary: "Free checks, screenings and medicines, taken to the people who need them.",
    image: "medical-outreach",
  },
  {
    slug: "food-and-welfare",
    title: "Food & Welfare Relief",
    summary: "Food items, clothing and festive outreaches for families going through hard seasons.",
    image: "relief-supplies",
  },
  {
    slug: "clean-water",
    title: "Clean Water & Community Projects",
    summary: "Boreholes and sanitation projects that save hours of walking every day.",
    image: "water-pump",
  },
];

export const story = {
  eyebrow: "Our story",
  title: "Started by a family who believed every community deserves a fair start.",
  values: ["Compassion", "Faith", "Integrity", "Service"],
  chapters: [
    {
      title: "Where we started",
      body: "Nunayon Foundation began with a simple habit: helping the families around us with school fees, food and a listening ear. Word spread, and so did the work.",
    },
    {
      title: "What we do today",
      body: "From our office in Lagos, we plan outreaches with local leaders, churches, mosques and schools, and travel to communities across Nigeria to deliver them.",
    },
    {
      title: "Where we are going",
      body: "We want every outreach to leave something lasting behind: a child still in school a year later, a shop still open, a borehole still running.",
    },
  ],
  image: "children-portrait" as ImageSlug,
  quote: {
    text: "We count it a blessing to serve. Every family we meet teaches us something about courage.",
    name: "Placeholder Name",
    role: "Founder, Nunayon Foundation",
  },
};

export const ways = {
  eyebrow: "Get involved",
  title: "There is a place for you in this work",
  items: [
    {
      title: "Give",
      body: "A bank transfer of any size goes straight into school fees, grants and outreach supplies.",
      href: "/donate",
      cta: "Donate now",
      image: "relief-supplies" as ImageSlug,
    },
    {
      title: "Volunteer",
      body: "Teach, organise, drive, take photos or lend a medical hand at our next outreach.",
      href: "/get-involved#volunteer",
      cta: "Become a volunteer",
      image: "volunteer-carrying" as ImageSlug,
    },
    {
      title: "Partner",
      body: "Churches, companies and schools can sponsor an outreach or a programme with us.",
      href: "/get-involved#partner",
      cta: "Partner with us",
      image: "volunteer-schoolboys" as ImageSlug,
    },
  ],
};

export type Article = { slug: string; title: string; excerpt: string; image: ImageSlug };

export const articles: Article[] = [
  {
    slug: "back-to-school-packs",
    title: "Back-to-school packs for 300 pupils",
    excerpt: "Bags, books, sandals and uniforms went home with every pupil at our September outreach.",
    image: "students-reading",
  },
  {
    slug: "free-health-screening",
    title: "A free health screening day for 500 residents",
    excerpt: "Volunteer doctors and nurses checked blood pressure, sugar levels and eyesight from morning till dusk.",
    image: "health-gombe",
  },
  {
    slug: "first-borehole",
    title: "Clean water, a short walk from home",
    excerpt: "A new borehole now serves families who used to walk an hour each way for water.",
    image: "kids-pump",
  },
];

// Placeholder bank details; real ones come from the admin.
export const bank = {
  accounts: [
    { currency: "NGN", bank: "Placeholder Bank PLC", name: "Nunayon Foundation", number: "0123456789" },
  ],
};
