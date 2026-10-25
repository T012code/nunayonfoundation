// Placeholder content for the inner pages. Like site.ts, all of this moves into the database
// with the admin build; names, figures and details are stand-ins.

import type { ImageSlug } from "./images";

export const about = {
  hero: {
    eyebrow: "About us",
    title: "A family foundation, working with communities across Nigeria.",
    lead: "From our office in Lagos, we plan and deliver outreaches with local leaders, schools and places of worship, and stay in touch long after the day itself.",
    image: "volunteer-children" as ImageSlug,
  },
  mission:
    "To help families across Nigeria meet today's needs and build a steadier tomorrow, through education, health, livelihoods and clean water.",
  vision: "Communities where every child learns, every family earns, and no one is left to struggle alone.",
  values: [
    { title: "Compassion", body: "We listen first and treat every person with dignity." },
    { title: "Faith", body: "We count it a blessing to serve, and it shapes how we work." },
    { title: "Integrity", body: "Every naira is accounted for, and we report back on where it went." },
    { title: "Service", body: "We go to communities in person, and we come back." },
  ],
  people: [
    { name: "Placeholder Name", role: "Founder" },
    { name: "Placeholder Name", role: "Chair, Board of Trustees" },
    { name: "Placeholder Name", role: "Trustee" },
    { name: "Placeholder Name", role: "Trustee" },
    { name: "Placeholder Name", role: "Programmes Lead" },
    { name: "Placeholder Name", role: "Volunteer Coordinator" },
  ],
  states: ["Lagos", "Ogun", "Oyo", "Kaduna", "Kano", "Katsina", "Gombe", "Enugu", "Abia", "Rivers", "Plateau", "FCT Abuja"],
};

export const volunteer = {
  hero: {
    eyebrow: "Volunteer",
    title: "Give a day, and see what it changes.",
    lead: "Our outreaches run on volunteers: teachers, nurses, drivers, photographers, packers and people who simply show up. There is a place for you.",
    image: "volunteer-carrying" as ImageSlug,
  },
  roles: [
    { title: "Teaching & mentoring", body: "Help in classes, run reading sessions or mentor young people in our skills programmes.", image: "classroom-lesson" as ImageSlug },
    { title: "Medical & health", body: "Doctors, nurses, pharmacists and health students staff our free health days.", image: "clinic-check" as ImageSlug },
    { title: "Outreach & logistics", body: "Pack supplies, drive, set up venues and keep the day running on time.", image: "volunteer-children" as ImageSlug },
    { title: "Media & storytelling", body: "Photograph, film and write about our work, with consent from the people in it.", image: "volunteer-schoolboys" as ImageSlug },
  ],
  steps: [
    { title: "Sign up", body: "Tell us where you are, what you enjoy doing and when you're free." },
    { title: "Meet the team", body: "We'll call you, answer your questions and match you to an outreach." },
    { title: "Join an outreach", body: "Come along on the day with a short briefing. Most volunteers come back." },
  ],
  interests: ["Teaching & mentoring", "Medical & health", "Outreach & logistics", "Media & storytelling", "Fundraising", "Anything that's needed"],
  availability: ["Weekends", "Weekdays", "School holidays", "Once in a while"],
  faqs: [
    { q: "Do I need experience?", a: "No. We'll brief you before every outreach, and you'll work alongside people who have done it before. Medical roles need the relevant qualification." },
    { q: "How much time do I need to give?", a: "As much or as little as you like. Many volunteers join two or three outreaches a year." },
    { q: "Can I volunteer as a group?", a: "Yes. Churches, mosques, schools and companies often volunteer together. Mention it in the form." },
    { q: "Will I be safe?", a: "We plan every outreach with local leaders, travel together and brief everyone on safety and safeguarding." },
  ],
};

export const donate = {
  hero: {
    eyebrow: "Donate",
    title: "Your gift goes straight to a family.",
    lead: "Give by bank transfer, then tell us you've given. We'll confirm when it arrives and show you where it went.",
  },
  uses: [
    { value: "₦10,000", body: "buys a back-to-school pack: bag, books, sandals and writing materials." },
    { value: "₦25,000", body: "covers a term's school fees for one child." },
    { value: "₦50,000", body: "gives a woman the starter kit for her trade." },
    { value: "₦150,000", body: "funds medicines for a free community health day." },
  ],
  faqs: [
    { q: "Can I give from abroad?", a: "Yes. For now, please transfer to the naira account. A dollar or pound account will be added here when it's available." },
    { q: "Will I get a receipt?", a: "Yes. Tell us you've given using the form below and we'll email a receipt once the transfer arrives." },
    { q: "Can I give to a specific programme?", a: "Yes. Choose the programme in the form and we'll put your gift towards it." },
    { q: "Can my company or church partner with you?", a: "Yes. Choose Partnership on the contact form and we'll be in touch." },
  ],
};

export type Album = { slug: string; title: string; photos: { image: ImageSlug; caption: string }[] };

export const albums: Album[] = [
  {
    slug: "back-to-school",
    title: "Back to school",
    photos: [
      { image: "classroom-smiles", caption: "First day back, with new bags and books." },
      { image: "students-reading", caption: "Reading together after the September outreach." },
      { image: "classroom-lesson", caption: "A lesson in full swing." },
      { image: "pupils-studying", caption: "Pupils at work in Igbo-Etche." },
      { image: "boy-uniform", caption: "A new uniform, measured to size." },
      { image: "students-window", caption: "Secondary school students we support." },
    ],
  },
  {
    slug: "health-days",
    title: "Health days",
    photos: [
      { image: "medical-outreach", caption: "Volunteer clinicians at a community health day." },
      { image: "health-check", caption: "Blood pressure checks for older residents." },
      { image: "health-gombe", caption: "Health talks with children and carers." },
      { image: "health-rural", caption: "Visiting families at home." },
      { image: "health-children", caption: "A health worker with two of the children she saw." },
      { image: "clinic-check", caption: "Follow-up care at a partner clinic." },
    ],
  },
  {
    slug: "skills-and-livelihoods",
    title: "Skills & livelihoods",
    photos: [
      { image: "sewing-lagos", caption: "A tailoring graduate with her machine." },
      { image: "tailor-workshop", caption: "Practice in a local workshop." },
      { image: "laptop-learning", caption: "Digital skills class." },
      { image: "computer-class", caption: "Learning in the computer room." },
      { image: "computer-teacher", caption: "One of our volunteer instructors." },
      { image: "lab-teacher", caption: "One-to-one help in class." },
    ],
  },
  {
    slug: "community-outreaches",
    title: "Community outreaches",
    photos: [
      { image: "children-waving", caption: "A warm welcome on arrival." },
      { image: "village-group", caption: "The children who came to say hello." },
      { image: "volunteer-children", caption: "Games with the children while parents queue." },
      { image: "volunteer-carrying", caption: "One of our volunteers at a family day." },
      { image: "relief-supplies", caption: "Taking home a food pack." },
      { image: "food-women", caption: "Food relief for families in a hard season." },
      { image: "women-gathering", caption: "Women's group meeting." },
      { image: "smiling-children", caption: "All smiles at the end of the day." },
    ],
  },
  {
    slug: "clean-water",
    title: "Clean water",
    photos: [
      { image: "water-pump", caption: "Water, a short walk from home." },
      { image: "kids-pump", caption: "Children at the new hand pump." },
      { image: "child-well", caption: "Collecting water before school." },
      { image: "hands-water", caption: "Clean water at last." },
    ],
  },
];

export const contactTopics = ["General enquiry", "Partnership", "Volunteering", "Donations", "Media & press", "Something else"];
