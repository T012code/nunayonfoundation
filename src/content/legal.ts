import { site } from "./site";

// Policy pages. Plain data so the admin can take them over later; a block is a paragraph,
// or a list when it is an array.
export type LegalBlock = string | string[];
export type LegalSection = { id: string; title: string; body: LegalBlock[] };
export type LegalPage = {
  eyebrow: string;
  title: string;
  lead: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

const UPDATED = "2026-10-27";

export const privacy: LegalPage = {
  eyebrow: "Privacy policy",
  title: "How we look after your information",
  lead: "We collect only what we need to reply to you, organise outreaches and send the updates you ask for. We never sell it.",
  description: "What Nunayon Foundation collects through this website, why, who processes it, how long we keep it and your rights under Nigerian data protection law.",
  updated: UPDATED,
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: [
        `${site.name} ("we", "us") is a charitable foundation based in Lagos, Nigeria. We decide how the information you give us through nunayonfoundation.org is used, which makes us the data controller under the Nigeria Data Protection Act 2023.`,
        `You can reach us about anything in this policy at ${site.email}, or by post at ${site.address}.`,
      ],
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      body: [
        "We only collect what you choose to send us through a form on this site:",
        [
          "Contact and partnership messages: your name, email, optional phone number, organisation and your message.",
          "Volunteer sign-ups: your name, email, phone, state, the roles you're interested in, your availability and anything else you tell us.",
          "Donation notices: your name, email, the amount, the date of the transfer and the programme you chose. We never ask for card or bank login details.",
          "Newsletter sign-ups: your email address and the date you confirmed it.",
        ],
        "We also keep a simple record of when each form was sent, and use privacy-friendly visitor statistics that do not identify you (see below).",
      ],
    },
    {
      id: "why",
      title: "Why we use it",
      body: [
        "We use your information to:",
        [
          "reply to your message and keep a record of our conversation;",
          "match your donation to the transfer we receive and send your receipt;",
          "place you on outreaches that suit your skills and availability;",
          "send the newsletter, only after you confirm your address.",
        ],
        "Our legal basis is your consent (newsletter), taking steps you asked for (replying, receipts, volunteering), and our legitimate interest in running the foundation well (records and security). You can withdraw consent at any time.",
      ],
    },
    {
      id: "sharing",
      title: "Who else sees it",
      body: [
        "We never sell, rent or trade your information. A small number of trusted services process it on our behalf, under contracts that require them to keep it safe:",
        [
          "Vercel, which hosts this website and provides our visitor statistics;",
          "Supabase, which stores form submissions and newsletter sign-ups (servers in the European Union);",
          "Cloudflare, which manages our domain and checks forms are sent by people, not bots (Turnstile);",
          "our email provider, which delivers our replies and the newsletter.",
        ],
        "Some of these services store data outside Nigeria. Where they do, we rely on the safeguards allowed under the Nigeria Data Protection Act, such as contractual protections. We'll share information with authorities only when the law requires it.",
      ],
    },
    {
      id: "statistics",
      title: "Visitor statistics",
      body: [
        "We count page visits with Vercel Web Analytics. It does not use cookies, does not follow you across other websites and does not store your IP address. We see totals such as the most-read pages and the countries visits come from, never who you are.",
      ],
    },
    {
      id: "keeping",
      title: "How long we keep it",
      body: [
        [
          "Messages and volunteer sign-ups: up to two years after our last contact with you.",
          "Donation records: six years, as Nigerian tax and accounting rules require.",
          "Newsletter: until you unsubscribe. Every newsletter has a one-click unsubscribe link.",
        ],
        "After that we delete it, or keep it only in a form that no longer identifies you.",
      ],
    },
    {
      id: "security",
      title: "Keeping it safe",
      body: [
        "Information travels to us encrypted (HTTPS) and is stored with access limited to the few team members who need it. Their accounts are protected with strong passwords and, for administrators, a second sign-in step. Every change in our admin area is logged.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: [
        "Under the Nigeria Data Protection Act 2023 you can ask us to:",
        [
          "show you the information we hold about you;",
          "correct anything that is wrong;",
          "delete your information, unless the law requires us to keep it;",
          "stop or limit how we use it, or send it to you in a portable format;",
          "stop sending you the newsletter.",
        ],
        `Email ${site.email} and we'll respond within 30 days. If you're unhappy with our answer, you can complain to the Nigeria Data Protection Commission (ndpc.gov.ng).`,
      ],
    },
    {
      id: "children",
      title: "Children",
      body: [
        "This website is not meant for children under 18 to send us information. Photos of children on this site are used with the permission of a parent or guardian, and we never publish a child's full name or exact location.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: [
        "If we change how we use your information, we'll update this page and the date at the top. If the change is significant, we'll tell newsletter subscribers by email.",
      ],
    },
  ],
};

export const terms: LegalPage = {
  eyebrow: "Terms & conditions",
  title: "Terms of using this website",
  lead: "The ground rules for using nunayonfoundation.org, giving through it and using what you find here.",
  description: "The terms that apply when you use the Nunayon Foundation website, send a form or give by bank transfer.",
  updated: UPDATED,
  sections: [
    {
      id: "about",
      title: "About these terms",
      body: [
        `This website is run by ${site.name}, based in Lagos, Nigeria. By using it you agree to these terms. If you don't agree, please don't use the site.`,
      ],
    },
    {
      id: "using",
      title: "Using the site",
      body: [
        "You're welcome to read, share and link to any page. Please don't:",
        [
          "send false information, or forms in someone else's name;",
          "try to break, overload or get around the security of the site;",
          "use automated tools to collect content or email addresses from it.",
        ],
      ],
    },
    {
      id: "donations",
      title: "Donations",
      body: [
        "Donations are made by bank transfer directly to the foundation's account shown on the Donate page. Please check the account name before you send. We are not responsible for transfers sent to the wrong account.",
        "Gifts are voluntary and generally can't be refunded. If you've given by mistake or the amount is wrong, contact us within 30 days and we'll do our best to help.",
        "If you choose a programme, we'll put your gift towards it. If that programme is fully funded, we'll use your gift where the need is greatest and tell you.",
      ],
    },
    {
      id: "volunteering",
      title: "Volunteering",
      body: [
        "Signing up to volunteer doesn't create a job or contract. We'll confirm each outreach with you directly. You'll be asked to follow our safeguarding guidance, especially around children, and may be asked for references.",
      ],
    },
    {
      id: "content",
      title: "Our content and photos",
      body: [
        "Text, photos, the logo and design on this site belong to the foundation or are used with permission. You may share them to talk about our work, with credit. Please ask us before using them for anything else, and never use photos of the people we serve in a way that could identify or embarrass them.",
      ],
    },
    {
      id: "accuracy",
      title: "Accuracy and links",
      body: [
        "We work to keep everything here accurate and up to date, but figures and plans can change. Links to other websites are for convenience; we're not responsible for their content.",
      ],
    },
    {
      id: "liability",
      title: "Limits of our responsibility",
      body: [
        "The site is provided as it is. As far as the law allows, we aren't liable for any loss caused by using it or by it being unavailable. Nothing here limits any rights you have that can't be excluded by law.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      body: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Lagos State have jurisdiction over any dispute.",
        `Questions about these terms? Email ${site.email}.`,
      ],
    },
  ],
};

export const cookies: LegalPage = {
  eyebrow: "Cookies",
  title: "We barely use cookies",
  lead: "No advertising cookies and no tracking across other websites. That's why you don't see a cookie banner here.",
  description: "Which cookies and similar technologies the Nunayon Foundation website uses, and why there is no cookie banner.",
  updated: UPDATED,
  sections: [
    {
      id: "what",
      title: "What cookies are",
      body: [
        "Cookies are small files a website saves in your browser. Some are needed for a site to work; others follow you around the web for advertising. We only use the first kind, and only where needed.",
      ],
    },
    {
      id: "visitors",
      title: "If you're visiting",
      body: [
        "Reading the site sets no cookies at all. Our visitor statistics (Vercel Web Analytics) count visits without cookies and without storing your IP address.",
        "When you send a form, Cloudflare Turnstile checks that you're a person rather than a bot. It may store a short-lived value in your browser for that check only. It isn't used for advertising.",
      ],
    },
    {
      id: "team",
      title: "If you're on our team",
      body: [
        "Signing in to the admin area sets cookies that keep you signed in securely. They're strictly necessary, expire when you sign out or after a period of inactivity, and are only set for team members.",
      ],
    },
    {
      id: "control",
      title: "Your choices",
      body: [
        "You can block or delete cookies in your browser settings. The public site will work exactly the same; only the admin sign-in needs them.",
        "If we ever add cookies that aren't strictly necessary, we'll ask for your permission first and update this page.",
      ],
    },
  ],
};
