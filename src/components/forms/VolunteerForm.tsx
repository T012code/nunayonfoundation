"use client";

import { Button } from "@/components/ui/Button";
import type { Copy } from "@/content/copy";
import { submitForm } from "@/app/actions/forms";
import { BotGuard, FormError } from "./BotGuard";
import { PhoneField } from "./PhoneField";
import { ChoiceGroup, SelectField, TextArea, TextField } from "./Field";
import { useSiteForm } from "./useSiteForm";
import styles from "./forms.module.css";

const send = submitForm.bind(null, "volunteer");

export function VolunteerForm({ copy }: { copy: Copy<"forms"> }) {
  const c = copy.volunteer;
  const { errors, formError, pending, attempt, onSubmit, clear, report } = useSiteForm("volunteer", send);
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField name="name" label={copy.common.name} required autoComplete="name" error={errors.name} onEdit={clear} />
        <TextField name="email" label={copy.common.email} type="email" required autoComplete="email" error={errors.email} onEdit={clear} onReport={report} />
      </div>
      <div className={styles.row}>
        <PhoneField name="phone" label={copy.common.phone} required error={errors.phone} onEdit={clear} onReport={report} />
        <SelectField name="state" label={c.state} options={c.stateOptions} required error={errors.state} onEdit={clear} />
      </div>
      <ChoiceGroup
        name="interests"
        legend={c.interests}
        options={c.interestsOptions}
        required
        message={c.interestsError}
        error={errors.interests}
        onEdit={clear}
      />
      <ChoiceGroup
        name="availability"
        legend={c.availability}
        options={c.availabilityOptions}
        compact
        required
        message={c.availabilityError}
        error={errors.availability}
        onEdit={clear}
      />
      <TextArea
        name="about"
        label={c.about}
        rows={4}
        hint={c.aboutHint}
        error={errors.about}
        onEdit={clear}
      />
      <BotGuard resetKey={attempt} />
      <FormError message={formError} />
      <Button type="submit" variant="primary" arrow loading={pending} className={styles.submit}>
        {pending ? copy.common.sending : c.button}
      </Button>
    </form>
  );
}
