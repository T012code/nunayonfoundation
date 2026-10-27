import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { getSettings } from "@/lib/content";
import b from "@/components/page/blocks.module.css";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Nunayon Foundation in Lagos: questions, partnerships, volunteering, media and donations.",
  alternates: { canonical: "/contact" },
};

const ICONS = {
  email: "M4 7l8 5.5L20 7M5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11A1.5 1.5 0 0 1 5.5 5z",
  phone: "M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5L16 13l4 1.5v3A1.5 1.5 0 0 1 18.5 19 14.5 14.5 0 0 1 5 5.5 1.5 1.5 0 0 1 6.5 4z",
  chat: "M5 18.5 6 15a7.5 7.5 0 1 1 3 3zM9 10.5h6M9 13.5h4",
  office: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
};

export default async function ContactPage() {
  const site = await getSettings();
  const tel = site.phone.replace(/\s/g, "");
  const wa = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  const ways = [
    { label: "Email", icon: ICONS.email, value: site.email, href: `mailto:${site.email}` },
    { label: "Phone", icon: ICONS.phone, value: site.phone, href: `tel:${tel}` },
    { label: "WhatsApp", icon: ICONS.chat, value: "Chat with us", href: wa },
    { label: "Office", icon: ICONS.office, value: site.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}` },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you."
        lead="Questions, partnerships, volunteering or press: send us a message and someone from the team will reply within two working days."
      />

      <section className={b.section} style={{ paddingTop: 0 }} aria-label="Ways to reach us">
        <div className="wrap">
          <ul className={styles.ways}>
            {ways.map((w, i) => (
              <Reveal as="li" key={w.label} delay={i * 0.08}>
                <a
                  href={w.href}
                  className={styles.way}
                  {...(w.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <svg viewBox="0 0 24 24" className={styles.wayIcon} aria-hidden="true">
                    <path d={w.icon} />
                  </svg>
                  <span className={styles.wayLabel}>{w.label}</span>
                  <span className={styles.wayValue}>
                    {w.label === "Email" ? (
                      <>
                        {w.value.split("@")[0]}
                        <wbr />@{w.value.split("@")[1]}
                      </>
                    ) : (
                      w.value
                    )}
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="message" className={`${b.section} ${b.sand} ${styles.anchor}`} aria-labelledby="form-title">
        <div className={`wrap ${b.split}`}>
          <div className={b.stickyAside}>
            <SectionHead id="form-title" eyebrow="Send a message" title="Tell us how we can help" />
            <Reveal className={styles.aside}>
              <h3>Partnering with us?</h3>
              <p>
                Churches, mosques, schools and companies sponsor outreaches and whole programmes. Choose
                &ldquo;Partnership&rdquo; and tell us a little about your organisation.
              </p>
              <h3>Office hours</h3>
              <p>Monday to Friday, 9am to 5pm. Visits by appointment.</p>
            </Reveal>
          </div>
          <Reveal className={b.formCard}>
            <Suspense>
              <ContactForm />
            </Suspense>
          </Reveal>
        </div>
      </section>
    </>
  );
}
