import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { site } from "@/content/site";
import b from "@/components/page/blocks.module.css";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Nunayon Foundation in Lagos: questions, partnerships, volunteering, media and donations.",
  alternates: { canonical: "/contact" },
};

const tel = site.phone.replace(/\s/g, "");
const wa = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

export default function ContactPage() {
  const ways = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "Phone", value: site.phone, href: `tel:${tel}` },
    { label: "WhatsApp", value: "Chat with us", href: wa },
    { label: "Office", value: site.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}` },
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
