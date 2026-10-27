// Placeholder content for the design preview. Every value here moves into the database and
// becomes editable in the admin; figures, names and contact details are stand-ins until the
// foundation supplies the real ones.

import type { ImageRef, ImageSlug } from "./images";

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
  { href: "/volunteer", label: "Volunteer" },
  { href: "/contact", label: "Contact" },
];

export const hero = {
  title: "Helping families across Nigeria grow stronger, together.",
  lead: "We put children in school, help mothers start and grow small businesses, and bring care and clean water to communities that need it.",
  slides: ["children-waving", "classroom-smiles", "health-check", "volunteer-children", "village-group"] as ImageRef[],
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
  image: ImageRef;
  /** Longer introduction for the programme page. */
  intro: string;
  covers: string[];
  steps: { title: string; body: string }[];
  stat: { value: string; label: string };
  photos: ImageRef[];
};

export const programmes: Programme[] = [
  {
    slug: "education-support",
    title: "Education Support",
    summary: "School fees, uniforms, books and back-to-school packs so children stay in class.",
    image: "students-window",
    intro:
      "Too many bright children leave school because a family cannot pay fees or buy a uniform. We cover what keeps them in class, and we stay in touch with their schools through the year.",
    covers: ["School fees and exam fees", "Uniforms, sandals and school bags", "Textbooks and writing materials", "Back-to-school packs each September"],
    steps: [
      { title: "We meet the family", body: "Local leaders and teachers tell us which children are at risk of dropping out." },
      { title: "We pay the school directly", body: "Fees go to the school, and supplies go into the child's hands." },
      { title: "We follow up", body: "We check in with the school each term to see how the child is doing." },
    ],
    stat: { value: "2,400+", label: "children kept in school" },
    photos: ["classroom-smiles", "students-reading", "classroom-lesson", "pupils-studying", "boy-uniform"],
  },
  {
    slug: "women-and-widows-livelihoods",
    title: "Women & Widows Livelihoods",
    summary: "Skills training and small business grants that give mothers a steady income.",
    image: "sewing-lagos",
    intro:
      "When a mother earns, the whole household is steadier. We train women and widows in a trade, give them a grant or starter kit, and mentor them while the business finds its feet.",
    covers: ["Tailoring, catering, hairdressing and soap making", "Business and bookkeeping basics", "Grants and starter kits for graduates", "Six months of follow-up mentoring"],
    steps: [
      { title: "Train", body: "Hands-on classes with local tradespeople, usually over eight weeks." },
      { title: "Equip", body: "Graduates receive a grant or the tools to start trading straight away." },
      { title: "Mentor", body: "We visit and advise until the business is earning on its own." },
    ],
    stat: { value: "650", label: "women supported with grants" },
    photos: ["sewing-lagos", "tailor-workshop", "women-gathering", "food-women"],
  },
  {
    slug: "youth-skills",
    title: "Youth Skills & Digital Training",
    summary: "Vocational and computer training, with starter kits for graduates.",
    image: "laptop-learning",
    intro:
      "Young people need a skill they can earn from. Our classes cover computer basics, digital work and practical trades, and end with a starter kit or a work placement.",
    covers: ["Computer literacy and digital skills", "Practical trades and apprenticeships", "CV writing and interview practice", "Starter kits and placements for graduates"],
    steps: [
      { title: "Learn", body: "Small classes, taught by people who do the work every day." },
      { title: "Practise", body: "Real projects and apprenticeships with local businesses." },
      { title: "Launch", body: "Graduates leave with a kit, a placement or their first clients." },
    ],
    stat: { value: "300+", label: "young people trained" },
    photos: ["laptop-learning", "computer-class", "computer-teacher", "lab-teacher"],
  },
  {
    slug: "community-health",
    title: "Community Health Outreach",
    summary: "Free checks, screenings and medicines, taken to the people who need them.",
    image: "medical-outreach",
    intro:
      "Many families live hours from a clinic. Our volunteer doctors and nurses hold free health days in their communities, with screening, treatment and referrals.",
    covers: ["Blood pressure, sugar and eye checks", "Free basic medicines", "Health talks for mothers and carers", "Referrals for follow-up care"],
    steps: [
      { title: "Plan with the community", body: "We agree a date and place with local leaders and health workers." },
      { title: "Screen and treat", body: "Volunteer clinicians see patients from morning till dusk." },
      { title: "Refer", body: "Anyone who needs more care is referred and supported to get it." },
    ],
    stat: { value: "5,000+", label: "people screened" },
    photos: ["medical-outreach", "health-check", "health-gombe", "health-rural", "health-children", "clinic-check"],
  },
  {
    slug: "food-and-welfare",
    title: "Food & Welfare Relief",
    summary: "Food items, clothing and festive outreaches for families going through hard seasons.",
    image: "relief-supplies",
    intro:
      "Hard seasons come to every family. We distribute food, clothing and essentials to households that need a hand, and hold festive outreaches so no family is left out.",
    covers: ["Food packs for households in need", "Clothing and essentials", "Christmas and Sallah outreaches", "Emergency support after floods and fires"],
    steps: [
      { title: "Identify", body: "Community leaders help us reach the households in greatest need." },
      { title: "Distribute", body: "Volunteers pack and hand out supplies on the day." },
      { title: "Stay close", body: "Families who need longer support are linked to our other programmes." },
    ],
    stat: { value: "1,800", label: "food packs given" },
    photos: ["relief-supplies", "food-women", "volunteer-children", "volunteer-carrying"],
  },
  {
    slug: "clean-water",
    title: "Clean Water & Community Projects",
    summary: "Boreholes and sanitation projects that save hours of walking every day.",
    image: "water-pump",
    intro:
      "Clean water close to home changes everything: children get to school on time and families fall sick less often. We build and maintain boreholes with the communities that use them.",
    covers: ["Hand-pump and solar boreholes", "Water point maintenance", "Hygiene and sanitation teaching", "Small community repairs"],
    steps: [
      { title: "Survey", body: "We test the site and agree ownership with the community." },
      { title: "Build", body: "Local contractors drill and install the borehole." },
      { title: "Maintain", body: "A trained water committee looks after it, with our support." },
    ],
    stat: { value: "9", label: "boreholes built" },
    photos: ["water-pump", "kids-pump", "child-well", "hands-water"],
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
      href: "/volunteer",
      cta: "Become a volunteer",
      image: "volunteer-carrying" as ImageSlug,
    },
    {
      title: "Partner",
      body: "Churches, companies and schools can sponsor an outreach or a programme with us.",
      href: "/contact?topic=partnership#message",
      cta: "Partner with us",
      image: "volunteer-schoolboys" as ImageSlug,
    },
  ],
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  image: ImageRef;
  programme: string;
  body: string[];
  photos?: ImageRef[];
  /** ISO date it was published. */
  date?: string;
};

export const articles: Article[] = [
  {
    slug: "back-to-school-packs",
    title: "Back-to-school packs for 300 pupils",
    excerpt: "Bags, books, sandals and uniforms went home with every pupil at our September outreach.",
    image: "students-reading",
    programme: "education-support",
    body: [
      "On the first Saturday of September, the school hall filled up early. Parents queued with their children, many of whom had not been sure they would return to class this term.",
      "Volunteers handed out 300 packs, each with a school bag, exercise books, a mathematical set, sandals and a uniform measured to size the week before.",
      "For 41 of the pupils, we also paid the term's fees directly to the school. Their head teacher told us that last year, a third of that class did not come back after the holidays.",
      "We will visit again at mid-term to see how every child is getting on.",
    ],
    photos: ["classroom-lesson", "pupils-studying"],
  },
  {
    slug: "free-health-screening",
    title: "A free health screening day for 500 residents",
    excerpt: "Volunteer doctors and nurses checked blood pressure, sugar levels and eyesight from morning till dusk.",
    image: "health-gombe",
    programme: "community-health",
    body: [
      "Twelve volunteer doctors, nurses and pharmacists set up in the community hall at 8am. By noon, the queue stretched past the market.",
      "Over the day, 500 residents had their blood pressure, blood sugar and eyesight checked. Many had never been screened before.",
      "Sixty-three people were found with high blood pressure, and 18 were referred for follow-up care, which the foundation is supporting.",
    ],
    photos: ["health-rural", "clinic-check"],
  },
  {
    slug: "first-borehole",
    title: "Clean water, a short walk from home",
    excerpt: "A new borehole now serves families who used to walk an hour each way for water.",
    image: "kids-pump",
    programme: "clean-water",
    body: [
      "Before this year, families in the settlement walked an hour each way to the nearest reliable water point, often before school.",
      "The new hand-pump borehole was drilled in six days by a local contractor. A water committee of five residents has been trained to look after it.",
      "The head teacher says morning attendance has already improved.",
    ],
    photos: ["child-well", "hands-water"],
  },
  {
    slug: "sixty-women-graduate",
    title: "Sixty women graduate from skills training",
    excerpt: "After eight weeks of classes, every graduate left with a grant or a starter kit for her trade.",
    image: "tailor-workshop",
    programme: "women-and-widows-livelihoods",
    body: [
      "The graduation started with a song and ended with sixty women carrying sewing machines, ovens and hair dryers home.",
      "Over eight weeks, they learned tailoring, catering or hairdressing from local tradespeople, plus the basics of keeping accounts.",
      "Our team will visit each of them over the next six months as their businesses get going.",
    ],
    photos: ["sewing-lagos", "women-gathering"],
  },
  {
    slug: "youth-digital-bootcamp",
    title: "A digital skills bootcamp for young people",
    excerpt: "Forty young people spent a month learning computer skills, and twelve have already found paid work.",
    image: "computer-class",
    programme: "youth-skills",
    body: [
      "For four weeks, forty young people met every weekday to learn computer basics, design and online work.",
      "Volunteer instructors set real projects for local businesses, so every student finished with work to show.",
      "Twelve graduates have since found paid work, and the rest are on placements with our partners.",
    ],
    photos: ["computer-teacher", "lab-teacher"],
  },
  {
    slug: "christmas-food-outreach",
    title: "A Christmas outreach for 400 families",
    excerpt: "Rice, oil, beans and a little something for the children, for every family on the list.",
    image: "food-women",
    programme: "food-and-welfare",
    body: [
      "In the week before Christmas, volunteers packed 400 food parcels with rice, beans, oil, tomatoes and seasoning.",
      "Every family also took home a small gift for each child, donated by supporters in Lagos.",
      "We are grateful to everyone who gave, packed, drove and served to make the day possible.",
    ],
    photos: ["relief-supplies", "volunteer-children"],
  },
];

// Placeholder bank details; real ones come from the admin.
export type Social = { label: string; href: string };
export type BankAccount = { currency: string; bank: string; name: string; number: string };
export type Stat = { value: number; suffix: string; label: string };

export const bank = {
  accounts: [
    { currency: "NGN", bank: "Placeholder Bank PLC", name: "Nunayon Foundation", number: "0123456789" },
  ],
};
