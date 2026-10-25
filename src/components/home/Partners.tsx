import styles from "./Partners.module.css";

// Placeholder tiles until partner logos are uploaded in the admin.
export function Partners() {
  return (
    <section className={styles.section} aria-labelledby="partners-title">
      <div className={`wrap ${styles.inner}`}>
        <h2 id="partners-title" className={styles.title}>
          Partners and friends who make outreaches possible
        </h2>
        <ul className={styles.logos}>
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className={styles.logo}>
              Partner logo
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
