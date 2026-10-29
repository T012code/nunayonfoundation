// The public site's status (Admin → Site status) and the suggested wording for each page.

export type SiteMode = "live" | "maintenance" | "coming_soon";

export const MODE_DEFAULTS = {
  maintenance: {
    title: "Back shortly.",
    message: "We're making a few improvements to the site.",
  },
  coming_soon: {
    title: "Coming soon.",
    message: "Our new website is almost ready. Leave your email and we'll tell you when it opens.",
  },
} as const;

/** Pages that keep working whatever the status: newsletter links in emails people already have. */
export const ALWAYS_OPEN = ["/newsletter/", "/thank-you/newsletter"];
