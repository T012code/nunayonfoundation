// Team roles and permissions, shared by the admin pages and the server.

export const PERMISSIONS = ["pages", "news", "gallery", "programmes", "people", "inbox", "newsletter", "settings", "activity"] as const;
export type Permission = (typeof PERMISSIONS)[number];
export type Role = "super_admin" | "admin" | "editor" | "communications";

export const PERMISSION_LABELS: Record<Permission, { label: string; help: string }> = {
  pages: { label: "Pages", help: "Headings and text on every page" },
  news: { label: "News", help: "Write, edit and publish stories" },
  gallery: { label: "Gallery", help: "Albums and photo uploads" },
  programmes: { label: "Programmes", help: "Programme pages" },
  people: { label: "Board members", help: "Founder, trustees and board on the About page" },
  inbox: { label: "Inbox", help: "Messages, volunteers and donation notices" },
  newsletter: { label: "Newsletter", help: "Subscribers and sending newsletters" },
  settings: { label: "Site settings", help: "Contact details, bank accounts, the home page hero and figures" },
  activity: { label: "Activity log", help: "See who changed what" },
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  editor: "Editor",
  communications: "Communications",
};

// What each role starts with; the super admin can adjust any person's permissions.
export const ROLE_PRESETS: Record<Exclude<Role, "super_admin">, Permission[]> = {
  admin: ["pages", "news", "gallery", "programmes", "people", "inbox", "newsletter", "settings", "activity"],
  editor: ["pages", "news", "gallery", "programmes", "people"],
  communications: ["pages", "inbox", "newsletter", "news"],
};
