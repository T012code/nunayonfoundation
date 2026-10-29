"use client";

import { Button } from "@/components/ui/Button";
import { submitForm } from "@/app/actions/forms";
import { BotGuard, FormError } from "./BotGuard";
import { SelectField, TextArea, TextField } from "./Field";
import type { Copy } from "@/content/copy";
import { useSiteForm } from "./useSiteForm";
import styles from "./forms.module.css";

/** "I've made a donation": lets the team match the transfer, thank the donor and send a receipt. */
const send = submitForm.bind(null, "donation");

export function DonationForm({ programmes, copy }: { programmes: string[]; copy: Copy<"forms"> }) {
  const c = copy.donation;
  const { errors, formError, pending, attempt, onSubmit, clear, report } = useSiteForm("donation", send);
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField name="name" label={c.name} required autoComplete="name" error={errors.name} onEdit={clear} />
        <TextField name="email" label={c.email} type="email" required autoComplete="email" error={errors.email} onEdit={clear} onReport={report} />
      </div>
      <div className={styles.row}>
        <TextField
          name="amount"
          label={c.amount}
          required
          pattern="[0-9,. ]{2,15}"
          placeholder={c.amountPlaceholder}
          error={errors.amount}
          onEdit={clear}
        />
        <TextField name="date" label={c.date} required placeholder={c.datePlaceholder} error={errors.date} onEdit={clear} />
      </div>
      <SelectField
        name="programme"
        label={c.programme}
        options={[c.anywhere, ...programmes]}
        defaultValue={c.anywhere}
        error={errors.programme}
        onEdit={clear}
      />
      <TextArea name="note" label={c.note} rows={3} error={errors.note} onEdit={clear} />
      <BotGuard resetKey={attempt} />
      <FormError message={formError} />
      <Button type="submit" variant="primary" arrow loading={pending} className={styles.submit}>
        {pending ? copy.common.sending : c.button}
      </Button>
    </form>
  );
}
