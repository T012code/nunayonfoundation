"use client";

import { Button } from "@/components/ui/Button";
import { programmes } from "@/content/site";
import { SelectField, TextArea, TextField } from "./Field";
import { useSiteForm } from "./useSiteForm";
import styles from "./forms.module.css";

/** "I've made a donation": lets the team match the transfer, thank the donor and send a receipt. */
export function DonationForm() {
  const { errors, pending, onSubmit, clear } = useSiteForm("donation");
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField name="name" label="Name on the transfer" required autoComplete="name" error={errors.name} onEdit={clear} />
        <TextField name="email" label="Email for your receipt" type="email" required autoComplete="email" error={errors.email} onEdit={clear} />
      </div>
      <div className={styles.row}>
        <TextField
          name="amount"
          label="Amount (₦)"
          required
          pattern="[0-9,. ]{2,15}"
          placeholder="e.g. 25,000"
          error={errors.amount}
          onEdit={clear}
        />
        <TextField name="date" label="Date of transfer" required placeholder="e.g. 3 November" error={errors.date} onEdit={clear} />
      </div>
      <SelectField
        name="programme"
        label="Where should it go?"
        options={["Wherever it's needed most", ...programmes.map((p) => p.title)]}
        defaultValue="Wherever it's needed most"
        error={errors.programme}
        onEdit={clear}
      />
      <TextArea name="note" label="A note to the team" rows={3} error={errors.note} onEdit={clear} />
      <Button type="submit" variant="primary" arrow loading={pending} className={styles.submit}>
        {pending ? "Sending" : "Tell us you've given"}
      </Button>
    </form>
  );
}
