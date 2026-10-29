"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Copy } from "@/content/copy";
import { submitForm } from "@/app/actions/forms";
import { BotGuard, FormError } from "./BotGuard";
import { PhoneField } from "./PhoneField";
import { SelectField, TextArea, TextField } from "./Field";
import { useSiteForm } from "./useSiteForm";
import styles from "./forms.module.css";

const sendContact = submitForm.bind(null, "contact");
const sendPartner = submitForm.bind(null, "partner");

type FormsCopy = Copy<"forms">;

/** A ?topic= link (e.g. from the donate page) picks the topic that starts with that word. */
function topicFromLink(link: string | null, topics: string[], partner: string) {
  if (!link) return "";
  if (link === "partnership") return partner;
  return topics.find((t) => t.toLowerCase().startsWith(link.slice(0, 5).toLowerCase())) ?? "";
}

export function ContactForm({ copy }: { copy: FormsCopy }) {
  const c = copy.contact;
  const params = useSearchParams();
  const initial = topicFromLink(params.get("topic"), c.topicOptions, c.partnerTopic);
  const [topic, setTopic] = useState(initial);
  const partnership = !!c.partnerTopic && topic === c.partnerTopic;
  const { errors, formError, pending, attempt, onSubmit, clear, report } = useSiteForm(
    partnership ? "partner" : "contact",
    partnership ? sendPartner : sendContact,
  );

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField name="name" label={copy.common.name} required autoComplete="name" error={errors.name} onEdit={clear} />
        <TextField name="email" label={copy.common.email} type="email" required autoComplete="email" error={errors.email} onEdit={clear} onReport={report} />
      </div>
      <div className={styles.row}>
        <PhoneField name="phone" label={copy.common.phone} required error={errors.phone} onEdit={clear} onReport={report} />
        <SelectField
          name="topic"
          label={c.topic}
          options={c.topicOptions}
          required
          defaultValue={initial}
          error={errors.topic}
          onEdit={clear}
          onValue={setTopic}
        />
      </div>
      {partnership ? (
        <TextField
          name="organisation"
          label={c.organisation}
          required
          autoComplete="organization"
          hint={c.organisationHint}
          error={errors.organisation}
          onEdit={clear}
        />
      ) : null}
      <TextArea
        name="message"
        label={partnership ? c.partnerMessage : c.message}
        required
        minLength={10}
        error={errors.message}
        onEdit={clear}
      />
      {c.note ? <p className={styles.note}>{c.note}</p> : null}
      <BotGuard resetKey={attempt} />
      <FormError message={formError} />
      <Button type="submit" variant="primary" arrow loading={pending} className={styles.submit}>
        {pending ? copy.common.sending : c.button}
      </Button>
    </form>
  );
}
