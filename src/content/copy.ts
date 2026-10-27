// Every page's words (and the photos that sit beside them), editable in the admin under
// Content › Pages. These are the defaults: the site shows them until someone edits a page, and
// anything never edited keeps falling back to them. Programmes, news, the gallery, board
// members, the home page hero and site details have their own admin sections.

import type { ImageRef } from "./images";
import { cookies, privacy, terms, type LegalPage } from "./legal";
import { about, donate, faq, volunteer } from "./pages";
import { impact, story, ways } from "./site";

/** Policy text for editing: paragraphs separated by blank lines, list items starting with "- ". */
const legalCopy = (page: LegalPage) => ({
  eyebrow: page.eyebrow,
  title: page.title,
  lead: page.lead,
  description: page.description,
  updated: page.updated,
  sections: page.sections.map((s) => ({
    id: s.id,
    title: s.title,
    body: s.body.map((b) => (Array.isArray(b) ? b.map((i) => `- ${i}`).join("\n") : b)).join("\n\n"),
  })),
});

const img = (r: ImageRef) => r;

export const COPY = {
  home: {
    impact: { title: impact.title },
    programmes: {
      eyebrow: "What we do",
      title: "Every programme, one aim: families who can stand on their own.",
      intro: "Each outreach is planned with local leaders, so help arrives where it is needed and keeps working after we leave.",
      card: "Learn more",
      button: "All programmes",
    },
    story: {
      eyebrow: story.eyebrow,
      title: story.title,
      values: [...story.values],
      chapters: story.chapters.map((c) => ({ ...c })),
      image: img(story.image),
      quote: { ...story.quote },
      button: "About us",
    },
    ways: { eyebrow: ways.eyebrow, title: ways.title, items: ways.items.map((w) => ({ ...w, image: img(w.image) })) },
    stories: { eyebrow: "News & stories", title: "From our recent outreaches", button: "All stories" },
    partners: { title: "Partners and friends who make outreaches possible" },
    donate: {
      eyebrow: "Give by bank transfer",
      title: "Every naira reaches a child, a family or a community.",
      lead: "Transfer any amount to the account below, then let us know so we can thank you and tell you where it went.",
      button: "I've made a donation",
      bankLabel: "Bank",
      nameLabel: "Account name",
      numberLabel: "Account number",
    },
  },

  about: {
    hero: { ...about.hero, image: img(about.hero.image) },
    purpose: {
      eyebrow: "Why we exist",
      title: "What we are working towards",
      missionLabel: "Our mission",
      mission: about.mission,
      visionLabel: "Our vision",
      vision: about.vision,
    },
    values: {
      eyebrow: "Our values",
      title: "Four things that shape every outreach",
      lead: "They guide who we work with, how we spend every gift, and how we treat the families we meet.",
      items: about.values.map((v) => ({ ...v })),
    },
    people: {
      eyebrow: "Our people",
      title: "Founder, trustees and team",
      lead: "A small team in Lagos, a board of trustees who hold us to account, and hundreds of volunteers across the country.",
    },
    where: {
      eyebrow: "Where we work",
      title: "Based in Lagos, reaching communities across Nigeria",
      officeLabel: "Our office",
      officeNote: "Visits by appointment. Call or WhatsApp {phone}.",
      states: [...about.states],
    },
  },

  programmes: {
    hero: {
      eyebrow: "Programmes",
      title: "Every programme, one aim: families who can stand on their own.",
      lead: "Every outreach is planned with local leaders and followed up after the day. Choose a programme to see what it covers and how it works.",
    },
    jumpLabel: "Jump to a programme",
    more: "About this programme",
    cta: { title: "Help us reach the next family.", body: "" },
  },

  programme: {
    covers: { eyebrow: "What it covers", title: "Where your support goes" },
    how: { eyebrow: "How it works", title: "From the first visit to the follow-up" },
    photos: { eyebrow: "In pictures", title: "From our outreaches", link: "Open the gallery" },
    stories: { eyebrow: "Stories", title: "Recent news from this programme" },
    others: { eyebrow: "More programmes", title: "See what else we do" },
    cta: { title: "Support {programme}.", body: "" },
  },

  news: {
    hero: {
      eyebrow: "News",
      title: "Stories from the field.",
      lead: "What happened at our outreaches, who we met, and what your support made possible.",
    },
    read: "Read the story",
    empty: "New stories are on their way. Check back soon.",
  },

  story: {
    share: "Share this story",
    more: { eyebrow: "Keep reading", title: "More stories" },
  },

  gallery: {
    hero: {
      eyebrow: "Gallery",
      title: "Moments from our outreaches.",
      lead: "Choose an album, or open any photo to see it full size. Use the arrow keys or swipe to move between photos.",
    },
    cta: { title: "Be part of the next photo.", body: "Join us at an outreach as a volunteer, or give so the next one can happen." },
  },

  volunteer: {
    hero: { ...volunteer.hero, image: img(volunteer.hero.image), button: "Sign up to volunteer" },
    roles: {
      eyebrow: "Ways to help",
      title: "Bring what you're good at",
      lead: "Every outreach needs a mix of people. Choose one role or a few; we'll match you to where you're needed.",
      items: volunteer.roles.map((r) => ({ ...r, image: img(r.image) })),
    },
    how: { eyebrow: "How it works", title: "Three steps to your first outreach", steps: volunteer.steps.map((s) => ({ ...s })) },
    signup: {
      eyebrow: "Sign up",
      title: "Join the volunteer team",
      note: "It takes about two minutes. We'll call you within a week to say hello and talk about the next outreach.",
    },
    faq: { eyebrow: "Questions", title: "Before you sign up", items: volunteer.faqs.map((f) => ({ ...f })) },
  },

  donate: {
    hero: { ...donate.hero },
    uses: {
      eyebrow: "What your gift does",
      title: "Every amount does something real",
      lead: "These are typical costs from our recent outreaches.",
      items: donate.uses.map((u) => ({ ...u })),
    },
    tell: {
      eyebrow: "Already given?",
      title: "Tell us you've given",
      note: "We'll match your transfer, send a receipt to your email and let you know where your gift went.",
    },
    faq: { eyebrow: "Questions", title: "About giving", items: donate.faqs.map((f) => ({ ...f })) },
  },

  contact: {
    hero: {
      eyebrow: "Contact",
      title: "We'd love to hear from you.",
      lead: "Questions, partnerships, volunteering or press: send us a message and someone from the team will reply within two working days.",
    },
    tiles: { email: "Email", phone: "Phone", whatsapp: "WhatsApp", whatsappValue: "Chat with us", office: "Office" },
    form: { eyebrow: "Send a message", title: "Tell us how we can help" },
    aside: {
      partnerTitle: "Partnering with us?",
      partnerText:
        "Churches, mosques, schools and companies sponsor outreaches and whole programmes. Choose “Partnership” and tell us a little about your organisation.",
      hoursTitle: "Office hours",
      hoursText: "Monday to Friday, 9am to 5pm. Visits by appointment.",
    },
  },

  faq: {
    hero: { ...faq.hero },
    topics: "Topics",
    groups: faq.groups.map((g) => ({ id: g.id, title: g.title, items: g.items.map((i) => ({ ...i })) })),
    cta: {
      title: "Still have a question?",
      body: "Send us a message and we'll reply within two working days. For something quick, WhatsApp is fastest.",
      button: "Send a message",
      whatsapp: "WhatsApp us",
    },
  },

  privacy: legalCopy(privacy),
  terms: legalCopy(terms),
  cookies: legalCopy(cookies),

  site: {
    cta: {
      title: "There is a place for you in this work.",
      body: "Give by bank transfer, volunteer at an outreach, or partner with us as a church, school or company.",
      donate: "Donate",
      volunteer: "Volunteer",
    },
    footer: {
      kicker: "Newsletter",
      title: "Stories from the field, in your inbox.",
      text: "One email a month about the families we meet and what your support did. No spam, and you can leave any time.",
      giveTitle: "Every outreach starts with someone like you.",
      giveDonate: "Donate",
      giveVolunteer: "Volunteer",
      explore: "Explore",
      involved: "Get involved",
      visit: "Visit or write",
      whatsapp: "WhatsApp us",
    },
    thanks: {
      newsletter: {
        title: "You're nearly on the list.",
        body: "We've sent a confirmation email. Click the link inside and the next story from the field will land in your inbox.",
        button: "Read our latest stories",
      },
      contact: {
        title: "Thank you. Your message is with us.",
        body: "Someone from the foundation will reply within two working days. If it's urgent, call or WhatsApp us.",
        button: "See what we do",
      },
      volunteer: {
        title: "Thank you for offering your time.",
        body: "We'll be in touch about the next outreach near you and how you'd like to help.",
        button: "See past outreaches",
      },
      partner: {
        title: "Thank you for reaching out to partner with us.",
        body: "Our team will review your details and contact you to talk about what we can do together.",
        button: "Explore our programmes",
      },
      donation: {
        title: "Thank you for your gift.",
        body: "We'll confirm when your transfer arrives and let you know where it goes. Your kindness keeps children in school and families on their feet.",
        button: "See your support at work",
      },
    },
    newsletter: {
      confirmedTitle: "You're on the list. Welcome.",
      confirmedBody:
        "Thank you for confirming. You'll hear from us a few times a year with stories from our outreaches. Every email has a link to unsubscribe.",
      failedTitle: "That link didn't work.",
      failedBody: "It may have expired or been copied incompletely. Sign up again from the bottom of any page and we'll send a fresh link.",
      unsubscribeTitle: "Unsubscribe from our newsletter?",
      unsubscribeBody: "We'll stop sending stories from the field to {email}. You can come back whenever you like.",
      unsubscribeButton: "Yes, unsubscribe me",
      keepButton: "Keep me subscribed",
      unsubscribedTitle: "You've been unsubscribed.",
      unsubscribedBody: "{email} won't get any more newsletters from us. Thank you for reading for as long as you did.",
      resubscribeButton: "I changed my mind, resubscribe",
      alreadyTitle: "You're already unsubscribed.",
      alreadyBody: "{email} isn't on our newsletter list. Want our stories again? It takes one click.",
      welcomeBackTitle: "Welcome back.",
      welcomeBackBody: "{email} is on the list again. The next story from the field will land in your inbox.",
      brokenTitle: "This unsubscribe link isn't complete.",
      brokenBody:
        "Use the Unsubscribe link at the bottom of any of our newsletters, or write to us and we'll take you off the list ourselves.",
    },
    notFound: {
      title: "We couldn't find that page.",
      body: "The link may be old, or the page may have moved. Try one of these, or tell us what you were looking for.",
    },
  },
};

export type CopyKey = keyof typeof COPY;
export type Copy<K extends CopyKey> = (typeof COPY)[K];

/** The pages listed in the admin, in the order people think of them. */
export const COPY_PAGES: { key: CopyKey; title: string; path: string; about: string }[] = [
  { key: "home", title: "Home page", path: "/", about: "Section headings and text below the hero, Our story, Get involved and the donation band." },
  { key: "about", title: "About us", path: "/about", about: "Mission, vision, values, the people heading and where we work." },
  { key: "programmes", title: "Programmes (list)", path: "/programmes", about: "The heading and closing banner on the programmes page." },
  { key: "programme", title: "Programme pages", path: "/programmes", about: "Section headings shared by every programme page." },
  { key: "news", title: "News (list)", path: "/news", about: "The heading on the news page." },
  { key: "story", title: "News story pages", path: "/news", about: "Headings shared by every news story." },
  { key: "gallery", title: "Gallery", path: "/gallery", about: "The heading and closing banner on the gallery page." },
  { key: "volunteer", title: "Volunteer", path: "/volunteer", about: "Roles, steps, sign-up text and questions." },
  { key: "donate", title: "Donate", path: "/donate", about: "What gifts do, the tell-us text and questions." },
  { key: "contact", title: "Contact", path: "/contact", about: "The heading, contact tiles and the side notes by the form." },
  { key: "faq", title: "FAQ", path: "/faq", about: "Every question and answer, grouped by topic." },
  { key: "privacy", title: "Privacy policy", path: "/privacy", about: "The full policy text." },
  { key: "terms", title: "Terms & conditions", path: "/terms", about: "The full terms text." },
  { key: "cookies", title: "Cookie policy", path: "/cookies", about: "The full cookie policy text." },
  { key: "site", title: "Site-wide text", path: "/", about: "Footer, the closing banner, thank-you messages, newsletter pages and the page-not-found message." },
];
