"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type ThankYouForm = "contact" | "volunteer" | "partner" | "donation" | "newsletter";

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function messageFor(el: Field) {
  // Lower-case only the first letter, so names like WhatsApp keep their capitals.
  const raw = el.dataset.label ?? el.name;
  const label = raw.charAt(0).toLowerCase() + raw.slice(1);
  if (el.validity.valueMissing) return el instanceof HTMLSelectElement ? `Choose ${label}.` : `Enter your ${label}.`;
  if (el.validity.typeMismatch && el.type === "email") return "Enter a valid email address, like name@example.com.";
  if (el.validity.patternMismatch && el.type === "tel") return "Enter a phone number using digits, spaces and +.";
  if (el.validity.tooShort) return `Add a little more detail (at least ${el.getAttribute("minlength")} characters).`;
  return `Check your ${label}.`;
}

/**
 * Validation and submission for the site's forms. Errors show beside each field and focus
 * moves to the first one.
 *
 * Preview build: a valid form goes straight to its thank-you page and nothing is saved.
 * The admin build replaces `send` with a server action that stores the submission, checks
 * Turnstile and emails the team.
 */
export function useSiteForm(form: ThankYouForm) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const next: Record<string, string> = {};
    let first: HTMLElement | null = null;

    for (const el of Array.from(formEl.elements)) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) continue;
      if (!el.name || el.type === "checkbox") continue;
      if (typeof el.value === "string" && el.type !== "select-one") el.value = el.value.trim();
      if (!el.checkValidity()) {
        next[el.name] = messageFor(el);
        first ??= el;
      }
    }
    // Checkbox groups marked data-required need at least one choice.
    for (const group of Array.from(formEl.querySelectorAll<HTMLFieldSetElement>("fieldset[data-required]"))) {
      const name = group.dataset.name!;
      if (!group.querySelector("input:checked")) {
        next[name] = group.dataset.message ?? "Choose at least one.";
        first ??= group.querySelector("input");
      }
    }

    setErrors(next);
    if (first) {
      first.focus();
      return;
    }
    setPending(true);
    router.push(`/thank-you/${form}`);
  }

  function clear(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  return { errors, pending, onSubmit, clear };
}
