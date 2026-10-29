"use client";

import { useActionState, useState, useTransition, type ReactNode } from "react";
import { resetPage, savePage } from "@/app/actions/admin/pages";
import { Icon } from "@/components/admin/Icon";
import { ImageField } from "@/components/admin/ImageFields";
import { SaveBar } from "@/components/admin/fields";
import type { ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

// Friendly names for the fields pages use, so the form reads like the page.
const LABELS: Record<string, string> = {
  hero: "Top of the page",
  eyebrow: "Small heading above",
  title: "Heading",
  lead: "Intro",
  intro: "Intro",
  body: "Text",
  text: "Text",
  button: "Button",
  cta: "Closing banner",
  href: "Link (page address)",
  image: "Photo",
  q: "Question",
  a: "Answer",
  label: "Label",
  hint: "Hint",
  value: "Amount or number",
  note: "Note",
  items: "Items",
  chapters: "Chapters",
  values: "Values",
  states: "States",
  steps: "Steps",
  groups: "Topics",
  sections: "Sections",
  id: "Short web name (for links to this part)",
  updated: "Last updated (YYYY-MM-DD)",
  description: "Description for search engines",
  quote: "Quote",
  name: "Name",
  role: "Role",
  more: "Link text",
  read: "Link text",
  card: "Card link text",
  empty: "When there are no stories",
  share: "Share label",
  topics: "Topics label",
  jumpLabel: "Jump list name (read out by screen readers)",
  faq: "Questions",
  roles: "Roles",
  how: "How it works",
  signup: "Sign-up",
  uses: "What gifts do",
  tell: "Tell us you've given",
  tiles: "Contact tiles",
  aside: "Notes beside the form",
  form: "Form heading",
  purpose: "Mission and vision",
  people: "People",
  where: "Where we work",
  impact: "Impact figures",
  programmes: "Programmes",
  story: "Our story",
  ways: "Get involved",
  stories: "News & stories",
  partners: "Partners",
  donate: "Donation band",
  covers: "What it covers",
  photos: "In pictures",
  others: "More programmes",
  footer: "Footer",
  thanks: "Thank-you pages",
  newsletter: "Newsletter",
  notFound: "Page not found",
  partner: "Partnership",
  contact: "Contact",
  volunteer: "Volunteer",
  donation: "Donation",
  whatsapp: "WhatsApp",
  whatsappValue: "WhatsApp tile text",
  giveTitle: "Panel heading",
  giveDonate: "Panel Donate button",
  giveVolunteer: "Panel Volunteer button",
  kicker: "Small heading above",
  explore: "Explore heading",
  involved: "Get involved heading",
  visit: "Contact heading",
  forms: "Forms",
  common: "On every form",
  sending: "Button text while sending",
  topic: "Topic question",
  topicOptions: "Topics to choose from",
  partnerTopic: "Topic that asks for the organisation (must match one of the topics)",
  organisation: "Organisation question",
  organisationHint: "Organisation hint",
  message: "Message question",
  partnerMessage: "Message question for partnerships",
  state: "State question",
  stateOptions: "States to choose from",
  interests: "Ways to help: question",
  interestsOptions: "Ways to help: choices",
  interestsError: "Ways to help: message if none chosen",
  availability: "Availability: question",
  availabilityOptions: "Availability: choices",
  availabilityError: "Availability: message if none chosen",
  about: "Last question",
  aboutHint: "Last question hint",
  amount: "Amount question",
  amountPlaceholder: "Amount example",
  date: "Date question",
  datePlaceholder: "Date example",
  programme: "Programme question",
  anywhere: "First programme choice",
};

const LONG = new Set(["body", "lead", "intro", "text", "a", "note", "mission", "vision", "partnerText", "description", "officeNote", "hoursText"]);

const humanize = (k: string) => {
  const words = k.replace(/([A-Z])/g, " $1").toLowerCase().trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
const labelFor = (k: string) => LABELS[k] ?? humanize(k);
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isImage = (k: string) => k === "image";

/** An empty item shaped like the first default item (photos keep the default photo). */
function blank(template: Json): Json {
  if (Array.isArray(template)) return [];
  if (isObj(template)) return Object.fromEntries(Object.entries(template).map(([k, v]) => [k, isImage(k) ? v : blank(v)]));
  if (typeof template === "number") return 0;
  return "";
}

/** A one-line summary of a list item, for its header. */
function summary(item: Json): string {
  if (typeof item === "string") return item;
  if (isObj(item)) {
    for (const k of ["title", "q", "label", "value", "name", "id"]) if (typeof item[k] === "string" && item[k]) return item[k] as string;
  }
  return "";
}

const placeholderHelp = (def: Json) => {
  const marks = typeof def === "string" ? def.match(/\{\w+\}/g) : null;
  return marks ? `Keep ${marks.join(" and ")} where it should go; it's filled in automatically.` : undefined;
};

export function CopyEditor({ pageKey, defaults, value }: { pageKey: string; defaults: Obj; value: Obj }) {
  const [state, action, pending] = useActionState(savePage.bind(null, pageKey), null);
  const [data, setData] = useState<Obj>(value);
  const [busy, start] = useTransition();
  const [resetNote, setResetNote] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const loose = Object.keys(defaults).filter((k) => !isObj(defaults[k]) && !Array.isArray(defaults[k]));

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="content" value={JSON.stringify(data)} />
      {Object.keys(defaults)
        .filter((k) => isObj(defaults[k]) || Array.isArray(defaults[k]))
        .map((k) => (
          <section key={k} className={styles.card}>
            <h2 className={styles.cardTitle}>{labelFor(k)}</h2>
            <Node name={k} def={defaults[k]} value={data[k]} onChange={(v) => setData((d) => ({ ...d, [k]: v }))} top />
          </section>
        ))}
      {loose.length ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{loose.length === Object.keys(defaults).length ? "Words on the page" : "Other words on the page"}</h2>
          <div className={styles.fields}>
            {loose.map((k) => (
              <Node key={k} name={k} def={defaults[k]} value={data[k]} onChange={(v) => setData((d) => ({ ...d, [k]: v }))} />
            ))}
          </div>
        </section>
      ) : null}

      <SaveBar pending={pending} state={state}>
        {confirmReset ? (
          <>
            <button
              type="button"
              className={styles.dangerButton}
              disabled={busy}
              onClick={() =>
                start(async () => {
                  const r = await resetPage(pageKey);
                  setResetNote(r.ok ? (r.message ?? "") : r.error);
                  if (r.ok) setData(defaults);
                  setConfirmReset(false);
                })
              }
            >
              Yes, use the original text
            </button>
            <button type="button" className={styles.ghostButton} onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className={styles.ghostButton} onClick={() => setConfirmReset(true)}>
            Reset to original
          </button>
        )}
        {resetNote ? (
          <span className={styles.status} data-tone="ok" role="status">
            {resetNote}
          </span>
        ) : null}
      </SaveBar>
    </form>
  );
}

/** One field, group or list, shaped like its default. */
function Node({ name, def, value, onChange, top }: { name: string; def: Json; value: Json | undefined; onChange: (v: Json) => void; top?: boolean }) {
  if (Array.isArray(def)) return <List name={name} def={def} value={Array.isArray(value) ? value : def} onChange={onChange} />;

  if (isObj(def)) {
    const obj = isObj(value) ? value : def;
    const content: ReactNode = (
      <div className={styles.fields}>
        {Object.keys(def).map((k) => (
          <Node key={k} name={k} def={def[k]} value={obj[k]} onChange={(v) => onChange({ ...obj, [k]: v })} />
        ))}
      </div>
    );
    return top ? content : (
      <fieldset className={styles.copyGroup}>
        <legend>{labelFor(name)}</legend>
        {content}
      </fieldset>
    );
  }

  if (isImage(name)) {
    // An empty default means the photo is optional (a page heading with or without one).
    const optional = def === "";
    return (
      <ImageField
        label={labelFor(name)}
        required={!optional}
        help={optional ? "Shown beside the page heading. Leave empty for a heading without a photo." : undefined}
        value={((value ?? def) || null) as ImageRef | null}
        onChange={(v) => onChange((v ?? def) as Json)}
      />
    );
  }

  if (typeof def === "number") {
    return (
      <label className={styles.field}>
        <span className={styles.label}>{labelFor(name)}</span>
        <input className={styles.input} type="number" value={typeof value === "number" ? value : def} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }

  const text = typeof value === "string" ? value : String(def ?? "");
  const long = LONG.has(name) || String(def).length > 90 || text.length > 90;
  const help = placeholderHelp(def);
  return (
    <label className={styles.field}>
      <span className={styles.label}>{labelFor(name)}</span>
      {help ? <span className={styles.help}>{help}</span> : null}
      {name === "body" && String(def).includes("\n\n") ? (
        <span className={styles.help}>Leave a blank line between paragraphs. Start lines with “- ” for a list.</span>
      ) : null}
      {long ? (
        <textarea
          className={styles.textarea}
          data-tall={String(def).length > 400 || undefined}
          rows={Math.min(14, Math.max(3, Math.ceil(text.length / 90)))}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className={styles.input} value={text} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** A list: each item can be moved, removed, and new ones added. */
function List({ name, def, value, onChange }: { name: string; def: Json[]; value: Json[]; onChange: (v: Json[]) => void }) {
  const template = def[0] ?? "";
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const single = labelFor(name).replace(/ies$/, "y").replace(/s$/, "").toLowerCase();
  const simple = typeof template === "string";
  return (
    <div className={styles.fields}>
      {!simple ? null : <span className={styles.label}>{labelFor(name)}</span>}
      <ol className={styles.copyList}>
        {value.map((item, i) => (
          <li key={i} className={simple ? styles.copyRow : styles.copyItem}>
            {simple ? (
              <input
                className={styles.input}
                value={typeof item === "string" ? item : ""}
                aria-label={`${labelFor(name)} ${i + 1}`}
                onChange={(e) => onChange(value.map((v, k) => (k === i ? e.target.value : v)))}
              />
            ) : (
              <>
                <div className={styles.copyItemHead}>
                  <strong>
                    {i + 1}. {summary(item) || `New ${single}`}
                  </strong>
                </div>
                <Node name={name} def={template} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} top />
              </>
            )}
            <div className={styles.copyTools}>
              <button type="button" className={styles.iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <Icon name="up" />
              </button>
              <button type="button" className={styles.iconButton} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
                <Icon name="down" />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                data-danger=""
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                aria-label={`Remove ${summary(item) || single}`}
              >
                <Icon name="trash" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div>
        <button type="button" className={styles.secondaryButton} onClick={() => onChange([...value, blank(template)])}>
          <Icon name="plus" /> Add {single}
        </button>
      </div>
    </div>
  );
}
