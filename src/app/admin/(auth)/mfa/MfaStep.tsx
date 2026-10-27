"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MfaSetup } from "@/components/admin/MfaSetup";
import { signOut } from "@/app/actions/admin/auth";
import styles from "@/components/admin/admin.module.css";
import { Welcome } from "../Welcome";

export function MfaStep({ enrolled }: { enrolled: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  if (done) return <Welcome title={enrolled ? "Welcome back" : "You're all set"} />;
  return (
    <>
      <h1 className={styles.authTitle}>{enrolled ? "Two-step sign-in" : "Set up two-step sign-in"}</h1>
      {!enrolled ? (
        <p className={styles.muted}>Your account needs an authenticator app as well as your password. It takes a minute, once.</p>
      ) : null}
      <MfaSetup
        enrolled={enrolled}
        onDone={() => {
          setDone(true);
          router.replace("/admin");
          router.refresh();
        }}
      />
      <form action={signOut}>
        <button type="submit" className={`${styles.textLink} ${styles.linkButton}`}>
          Use a different account
        </button>
      </form>
    </>
  );
}
