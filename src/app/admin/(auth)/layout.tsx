import { Logo } from "@/components/brand/Logo";
import styles from "@/components/admin/admin.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.auth}>
      <div className={styles.authCard}>
        <Logo variant="stacked" className={styles.authLogo} />
        {children}
      </div>
    </main>
  );
}
