"use client";

import { Button } from "@/components/ui/Button";
import { volunteer } from "@/content/pages";
import { submitForm } from "@/app/actions/forms";
import { BotGuard, FormError } from "./BotGuard";
import { ChoiceGroup, SelectField, TextArea, TextField } from "./Field";
import { useSiteForm } from "./useSiteForm";
import styles from "./forms.module.css";

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Outside Nigeria",
];

const send = submitForm.bind(null, "volunteer");

export function VolunteerForm() {
  const { errors, formError, pending, attempt, onSubmit, clear } = useSiteForm("volunteer", send);
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} onEdit={clear} />
        <TextField name="email" label="Email" type="email" required autoComplete="email" error={errors.email} onEdit={clear} />
      </div>
      <div className={styles.row}>
        <TextField
          name="phone"
          label="Phone or WhatsApp"
          type="tel"
          required
          autoComplete="tel"
          pattern="[0-9+ ()-]{7,20}"
          error={errors.phone}
          onEdit={clear}
        />
        <SelectField name="state" label="State you live in" options={STATES} required error={errors.state} onEdit={clear} />
      </div>
      <ChoiceGroup
        name="interests"
        legend="How would you like to help?"
        options={volunteer.interests}
        required
        message="Choose at least one way you'd like to help."
        error={errors.interests}
        onEdit={clear}
      />
      <ChoiceGroup
        name="availability"
        legend="When are you usually free?"
        options={volunteer.availability}
        required
        message="Choose when you're usually free."
        error={errors.availability}
        onEdit={clear}
      />
      <TextArea
        name="about"
        label="Anything else we should know?"
        rows={4}
        hint="Skills, qualifications, or if you're volunteering as a group."
        error={errors.about}
        onEdit={clear}
      />
      <BotGuard resetKey={attempt} />
      <FormError message={formError} />
      <Button type="submit" variant="primary" arrow loading={pending} className={styles.submit}>
        {pending ? "Sending" : "Sign me up"}
      </Button>
    </form>
  );
}
