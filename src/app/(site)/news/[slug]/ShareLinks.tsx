"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./article.module.css";

// Simple one-colour marks, drawn with currentColor so they follow the button's state.
const ICONS = {
  facebook: (
    <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" />
  ),
  x: <path d="M17.6 3.5h3l-6.6 7.5 7.7 10.2h-6l-4.7-6.2-5.4 6.2h-3l7-8L2.3 3.5h6.2l4.3 5.7zm-1 15.9h1.6L7.5 5.2H5.7z" />,
  instagram: (
    <path
      fillRule="evenodd"
      d="M12 3.5c-2.3 0-2.6 0-3.5.1-2.3.1-3.6 1.4-3.8 3.8C4.6 8.4 4.6 8.7 4.6 12s0 3.6.1 4.5c.1 2.4 1.5 3.7 3.8 3.8.9.1 1.2.1 3.5.1s2.6 0 3.5-.1c2.3-.1 3.7-1.4 3.8-3.8.1-.9.1-1.2.1-4.5s0-3.6-.1-4.5c-.1-2.3-1.5-3.7-3.8-3.8-.9-.1-1.2-.1-3.5-.1zm0 4.4a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2zm0 6.8a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4zm4.3-7.9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
    />
  ),
  whatsapp: (
    <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2zm0 16a7.2 7.2 0 0 1-3.7-1l-.3-.2-2.7.7.7-2.6-.2-.3A7.2 7.2 0 1 1 12 19.2zm4-5.4c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a5.9 5.9 0 0 1-2.9-2.6c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4a.8.8 0 0 0-.6.3 2.4 2.4 0 0 0-.8 1.8 4.3 4.3 0 0 0 .9 2.2 9.6 9.6 0 0 0 3.7 3.3c1.4.6 1.9.6 2.6.5.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1z" />
  ),
  link: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1m2 4a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"
    />
  ),
  check: <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />,
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.shareIcon}>
      {ICONS[name]}
    </svg>
  );
}

/**
 * Share a story to Facebook, X, Instagram or WhatsApp, or copy its link. Instagram has no
 * share link for web pages: on phones the button opens the device's share sheet (which lists
 * Instagram); elsewhere it copies the link and opens Instagram, ready to paste.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [note, setNote] = useState<{ text: string; key: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const say = (message: string) => {
    setNote({ text: message, key: Date.now() });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setNote(null);
      setCopied(false);
    }, 3200);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  const onCopy = async () => {
    if (await copy()) {
      setCopied(true);
      say("Link copied. Paste it anywhere you like.");
    } else {
      say("Couldn't copy automatically. Copy the link from your address bar.");
    }
  };

  const onInstagram = async () => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closing the share sheet isn't an error worth showing.
      }
      return;
    }
    const ok = await copy();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    say(ok ? "Link copied. Paste it into your Instagram story, post or bio." : "Copy the link from your address bar, then paste it on Instagram.");
  };

  const links = [
    { name: "facebook" as const, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "x" as const, label: "X", href: `https://x.com/intent/post?text=${text}&url=${u}` },
    { name: "whatsapp" as const, label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];

  return (
    <div className={styles.share}>
      <span className={styles.shareLabel}>Share this story</span>
      <div className={styles.shareButtons}>
        {links.slice(0, 2).map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={styles.shareButton} data-network={l.name}>
            <Icon name={l.name} />
            <span>{l.label}</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ))}
        <button type="button" onClick={onInstagram} className={styles.shareButton} data-network="instagram">
          <Icon name="instagram" />
          <span>Instagram</span>
        </button>
        {links.slice(2).map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={styles.shareButton} data-network={l.name}>
            <Icon name={l.name} />
            <span>{l.label}</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ))}
        <button type="button" onClick={onCopy} className={styles.shareButton} data-network="copy" data-copied={copied || undefined}>
          <Icon name={copied ? "check" : "link"} />
          <span>{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>
      <p className={styles.shareNote} role="status" aria-live="polite">
        {note ? <span key={note.key}>{note.text}</span> : null}
      </p>
    </div>
  );
}
