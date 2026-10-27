// Team roles and permissions, shared by the admin pages and the server.

export const PERMISSIONS = ["news", "gallery", "programmes", "people", "inbox", "newsletter", "settings", "activity"] as const;
export type Permission = (typeof PERMISSIONS)[number];
export type Role = "super_admin" | "admin" | "editor" | "communications";

export const PERMISSION_LABELS: Record<Permission, { label: string; help: string }> = {
  news: { label: "News", help: "Write, edit and publish stories" },
  gallery: { label: "Gallery", help: "Albums and photo uploads" },
  programmes: { label: "Programmes", help: "Programme pages" },
  people: { label: "People", help: "Founder, trustees and team" },
  inbox: { label: "Inbox", help: "Messages, volunteers and donation notices" },
  newsletter: { label: "Newsletter", help: "Subscribers and sending newsletters" },
  settings: { label: "Site settings", help: "Contact details, bank accounts, figures and home page" },
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
  admin: ["news", "gallery", "programmes", "people", "inbox", "newsletter", "settings", "activity"],
  editor: ["news", "gallery", "programmes", "people"],
  communications: ["inbox", "newsletter", "news"],
};
