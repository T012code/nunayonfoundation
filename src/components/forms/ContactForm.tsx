"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { contactTopics } from "@/content/pages";
import { submitForm } from "@/app/actions/forms";
import { BotGuard, FormError } from "./BotGuard";
import { PhoneField } from "./PhoneField";
import { SelectField, TextArea, TextField } from "./Field";
import { useSiteForm } from "./useSiteForm";
import styles from "./forms.module.css";

const sendContact = submitForm.bind(null, "contact");
const sendPartner = submitForm.bind(null, "partner");

const FROM_LINK: Record<string, string> = { partnership: "Partnership", volunteering: "Volunteering", donations: "Donations" };

export function ContactForm() {
  const params = useSearchParams();
  const initial = FROM_LINK[params.get("topic") ?? ""] ?? "";
  const [topic, setTopic] = useState(initial);
  const partnership = topic === "Partnership";
  const { errors, formError, pending, attempt, onSubmit, clear, report } = useSiteForm(
    partnership ? "partner" : "contact",
    partnership ? sendPartner : sendContact,
  );

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} onEdit={clear} />
        <TextField name="email" label="Email" type="email" required autoComplete="email" error={errors.email} onEdit={clear} onReport={report} />
      </div>
      <div className={styles.row}>
        <PhoneField name="phone" label="Phone or WhatsApp" required error={errors.phone} onEdit={clear} onReport={report} />
        <SelectField
          name="topic"
          label="What is it about?"
          options={contactTopics}
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
          label="Organisation"
          required
          autoComplete="organization"
          hint="Church, school, company or group you represent."
          error={errors.organisation}
          onEdit={clear}
        />
      ) : null}
      <TextArea
        name="message"
        label={partnership ? "How would you like to partner with us?" : "Message"}
        required
        minLength={10}
        error={errors.message}
        onEdit={clear}
      />
      <p className={styles.note}>We reply within two working days. We only use your details to answer you.</p>
      <BotGuard resetKey={attempt} />
      <FormError message={formError} />
      <Button type="submit" variant="primary" arrow loading={pending} className={styles.submit}>
        {pending ? "Sending" : "Send message"}
      </Button>
    </form>
  );
}
