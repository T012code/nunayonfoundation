"use client";

import { useRef, useState } from "react";
import { MediaDialog } from "@/components/admin/MediaDialog";
import { image, type ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

type Tool = "bold" | "italic" | "heading" | "list" | "numbered" | "divider";

const TOOLS: { tool: Tool; label: string; text: string; title: string }[] = [
  { tool: "bold", label: "Bold", text: "B", title: "Bold (wraps the selected words in **)" },
  { tool: "italic", label: "Italic", text: "I", title: "Italic (wraps the selected words in _)" },
  { tool: "heading", label: "Heading", text: "H", title: "Heading (starts the line with ##)" },
  { tool: "list", label: "Bullet list", text: "•", title: "Bullet list (starts each line with -)" },
  { tool: "numbered", label: "Numbered list", text: "1.", title: "Numbered list (starts each line with 1.)" },
  { tool: "divider", label: "Divider", text: "—", title: "A line across the email" },
];

/**
 * The newsletter message box with a formatting toolbar. The toolbar writes simple marks into
 * the text (**bold**, ## heading, - list, [words](link)), which the letterhead turns into
 * formatted email; the same text doubles as the plain-text version. Photos need an absolute
 * address, so they're taken from the media library.
 */
export function BodyEditor({
  value,
  onChange,
  siteUrl,
}: {
  value: string;
  onChange: (v: string) => void;
  siteUrl: string;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [panel, setPanel] = useState<null | "link" | "button">(null);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");
  const [library, setLibrary] = useState(false);
  const saved = useRef<[number, number]>([0, 0]);

  // Replace the selection (or insert at the cursor), then put the cursor after the change.
  const edit = (fn: (before: string, selected: string, after: string) => [string, string, string]) => {
    const el = area.current;
    if (!el) return;
    const [start, end] = panel || library ? saved.current : [el.selectionStart, el.selectionEnd];
    const [b, sel, a] = fn(value.slice(0, start), value.slice(start, end), value.slice(end));
    const next = b + sel + a;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(b.length, b.length + sel.length);
    });
  };

  // Whole lines covered by the selection.
  const lines = (prefix: (i: number) => string) =>
    edit((b, sel, a) => {
      const lineStart = b.lastIndexOf("\n") + 1;
      const lineEndRel = a.indexOf("\n");
      const head = b.slice(0, lineStart);
      const block = b.slice(lineStart) + sel + (lineEndRel < 0 ? a : a.slice(0, lineEndRel));
      const tail = lineEndRel < 0 ? "" : a.slice(lineEndRel);
      const out = block
        .split("\n")
        .map((l, i) => prefix(i) + l.replace(/^(#{2,3} |[-*] |\d+[.)] )/, ""))
        .join("\n");
      return [head, out, tail];
    });

  // A block on its own, with blank lines around it.
  const block = (text: string) =>
    edit((b, _sel, a) => {
      const pre = b.length === 0 || b.endsWith("\n\n") ? "" : b.endsWith("\n") ? "\n" : "\n\n";
      const post = a.startsWith("\n\n") || a.length === 0 ? "" : a.startsWith("\n") ? "\n" : "\n\n";
      return [b + pre, text, post + a];
    });

  const apply = (tool: Tool) => {
    if (tool === "bold") edit((b, s, a) => [b + "**", s || "bold words", "**" + a]);
    if (tool === "italic") edit((b, s, a) => [b + "_", s || "words", "_" + a]);
    if (tool === "heading") lines(() => "## ");
    if (tool === "list") lines(() => "- ");
    if (tool === "numbered") lines((i) => `${i + 1}. `);
    if (tool === "divider") block("---");
  };

  const openPanel = (kind: "link" | "button") => {
    const el = area.current;
    if (el) saved.current = [el.selectionStart, el.selectionEnd];
    setLinkText(el ? value.slice(el.selectionStart, el.selectionEnd) : "");
    setLinkUrl("https://");
    setPanel(kind);
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!/^(https?:\/\/\S+|mailto:\S+)$/.test(url)) return;
    const text = linkText.trim() || (panel === "button" ? "Find out more" : url.replace(/^https?:\/\//, ""));
    if (panel === "button") block(`[button: ${text}](${url})`);
    else edit((b, _s, a) => [b, `[${text}](${url})`, a]);
    setPanel(null);
  };

  const insertPhoto = (refs: ImageRef[]) => {
    const parts = refs.map((ref) => {
      const src = image(ref);
      // Built-in photos live on the site; uploads already have a full address.
      const url = src.src.startsWith("/") ? `${siteUrl}${src.src.replace(/-\d+\.webp$/, "-1600.webp")}` : src.src;
      return `![${src.alt.replace(/[[\]]/g, "")}](${url})`;
    });
    block(parts.join("\n\n"));
  };

  return (
    <div className={styles.field}>
      <span className={styles.label} id="body-label">
        Message <span className={styles.muted}>(required)</span>
      </span>
      <div className={styles.editor}>
        <div className={styles.editorBar} role="toolbar" aria-label="Formatting" aria-controls="newsletter-body">
          {TOOLS.map((t) => (
            <button key={t.tool} type="button" className={styles.toolButton} data-tool={t.tool} onClick={() => apply(t.tool)} aria-label={t.label} title={t.title}>
              {t.text}
            </button>
          ))}
          <span className={styles.toolSep} aria-hidden="true" />
          <button type="button" className={styles.toolButton} data-wide="" onClick={() => openPanel("link")} aria-expanded={panel === "link"}>
            Link
          </button>
          <button type="button" className={styles.toolButton} data-wide="" onClick={() => openPanel("button")} aria-expanded={panel === "button"}>
            Button
          </button>
          <button
            type="button"
            className={styles.toolButton}
            data-wide=""
            onClick={() => {
              const el = area.current;
              if (el) saved.current = [el.selectionStart, el.selectionEnd];
              setLibrary(true);
            }}
          >
            Photo
          </button>
        </div>

        {panel ? (
          <div className={styles.toolPanel}>
            <label className={styles.field}>
              <span className={styles.label}>{panel === "button" ? "Button words" : "Words to show"}</span>
              <input className={styles.input} value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder={panel === "button" ? "Donate now" : "our latest story"} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Link address</span>
              <input
                className={styles.input}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), insertLink())}
                autoFocus
              />
            </label>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryButton} onClick={insertLink} disabled={!/^(https?:\/\/\S+\.\S+|mailto:\S+)$/.test(linkUrl.trim())}>
                Insert {panel}
              </button>
              <button type="button" className={styles.ghostButton} onClick={() => setPanel(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <textarea
          ref={area}
          id="newsletter-body"
          aria-labelledby="body-label"
          className={styles.textarea}
          data-tall=""
          name="body"
          required
          maxLength={20000}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <span className={styles.help}>
        Leave a blank line between paragraphs. Select words, then use the toolbar. The preview shows exactly what subscribers will get.
      </span>
      <MediaDialog multiple open={library} onClose={() => setLibrary(false)} onPick={insertPhoto} />
    </div>
  );
}
