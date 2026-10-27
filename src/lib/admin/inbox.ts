export const KINDS = {
  contact: "Message",
  partner: "Partnership",
  volunteer: "Volunteer",
  donation: "Donation notice",
} as const;

export type Kind = keyof typeof KINDS;
export type Submission = {
  id: string;
  kind: Kind;
  name: string;
  email: string;
  phone: string;
  fields: { label: string; value: string }[];
  status: "new" | "read" | "archived";
  created_at: string;
};
