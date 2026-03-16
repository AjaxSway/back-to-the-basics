import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Back to the Basics Movement",
  description:
    "Privacy Policy for Back to the Basics Movement. Learn how we handle your data.",
};

export default function PrivacyPolicy() {
  return (
    <main
      style={{
        fontFamily: "'Montserrat', sans-serif",
        background: "#050403",
        color: "#d0c8b8",
        minHeight: "100vh",
        lineHeight: 1.85,
        fontSize: 17,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "60px 40px 30px",
          borderBottom: "1px solid rgba(202,144,61,0.15)",
          textAlign: "center",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#ca903d",
            letterSpacing: 4,
            textTransform: "uppercase" as const,
            textDecoration: "none",
          }}
        >
          Back to the Basics
        </a>
      </header>

      {/* Content */}
      <article
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "60px 24px 100px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.6rem",
            fontWeight: 600,
            color: "#eee6d6",
            marginBottom: 8,
            letterSpacing: 2,
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: "#8a7e6e", marginBottom: 48, fontSize: "0.95rem" }}>
          Effective Date: March 16, 2026 &mdash; Last Updated: March 16, 2026
        </p>

        <Section title="1. Introduction">
          <p>
            Back to the Basics Movement (&quot;B2TB,&quot; &quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) operates the website at{" "}
            <a
              href="https://backtothebasicsmovement.com"
              style={{ color: "#ca903d", textDecoration: "none" }}
            >
              backtothebasicsmovement.com
            </a>
            . This Privacy Policy explains what information we collect, how we
            use it, and your rights regarding that information. B2TB Movement
            LLC is registered in the state of Arizona.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            We collect only what you voluntarily provide through our website:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong>Email addresses</strong> &mdash; Collected when you
              subscribe to our mailing list through the subscribe form on our
              website.
            </li>
            <li>
              <strong>Story submissions</strong> &mdash; Collected when you
              submit your personal story through our contact form. This may
              include your name, email address, and the content of your message.
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not collect information passively. We do not use tracking
            pixels, behavioral analytics, or profiling tools.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong>Email addresses</strong> &mdash; Used to send you updates,
              newsletters, and communications related to the Back to the Basics
              Movement. You can unsubscribe at any time using the link in any
              email.
            </li>
            <li>
              <strong>Story submissions</strong> &mdash; Read by our team to
              understand your experience. Stories may be featured on the website
              or in communications only with your explicit permission.
            </li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          <p>
            We use a small number of third-party services to operate the
            website. Each processes only the minimum data necessary:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong>Vercel</strong> &mdash; Hosts our website. Vercel may
              collect standard server logs (IP address, browser type, pages
              visited) as part of normal web hosting. See{" "}
              <ExtLink href="https://vercel.com/legal/privacy-policy">
                Vercel Privacy Policy
              </ExtLink>
              .
            </li>
            <li>
              <strong>FormSubmit</strong> &mdash; Processes story submissions
              from our contact form and delivers them to our email. See{" "}
              <ExtLink href="https://formsubmit.co/privacy.pdf">
                FormSubmit Privacy Policy
              </ExtLink>
              .
            </li>
            <li>
              <strong>Kit (ConvertKit)</strong> &mdash; Manages our email
              subscriber list and sends newsletters when connected. See{" "}
              <ExtLink href="https://kit.com/privacy">
                Kit Privacy Policy
              </ExtLink>
              .
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not sell, rent, or share your personal information with any
            third party for advertising or marketing purposes.
          </p>
        </Section>

        <Section title="5. Cookies and Tracking">
          <p>
            Our website does not use marketing cookies, advertising cookies, or
            tracking pixels. The only cookies that may be set are essential
            cookies required for basic website functionality (such as session
            management by our hosting provider). We do not use Google Analytics
            or any similar analytics platform.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your email address on our mailing list until you
            unsubscribe. Story submissions are retained indefinitely unless you
            request deletion. You may request removal of your data at any time
            by contacting us at the address below.
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            We take reasonable measures to protect the information you provide.
            Our website is served over HTTPS. Third-party services we use
            maintain their own security practices. However, no method of
            transmission over the internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong>Access</strong> &mdash; Request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Correction</strong> &mdash; Request correction of
              inaccurate data.
            </li>
            <li>
              <strong>Deletion</strong> &mdash; Request deletion of your
              personal data from our systems.
            </li>
            <li>
              <strong>Unsubscribe</strong> &mdash; Opt out of email
              communications at any time via the unsubscribe link in any email,
              or by contacting us directly.
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To exercise any of these rights, email us at the address in Section
            11 below.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            Our website is not directed at children under 13. We do not
            knowingly collect personal information from children. If you believe
            a child has submitted information through our site, please contact
            us and we will promptly remove it.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy as our practices evolve. Material
            changes will be reflected with an updated &quot;Last Updated&quot;
            date at the top of this page. Continued use of the website after
            changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions or concerns about this Privacy Policy can be directed to:
          </p>
          <p style={{ marginTop: 8 }}>
            B2TB Movement LLC
            <br />
            Tucson, Arizona
          </p>
          <p style={{ marginTop: 8 }}>
            <a
              href="mailto:contact@backtothebasicsmovement.com"
              style={{ color: "#ca903d", textDecoration: "none" }}
            >
              contact@backtothebasicsmovement.com
            </a>
          </p>
        </Section>
      </article>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px 24px",
          borderTop: "1px solid rgba(202,144,61,0.1)",
          color: "#5a5245",
          fontSize: "0.85rem",
        }}
      >
        &copy; 2026 B2TB Movement LLC. All rights reserved.
      </footer>
    </main>
  );
}

/* -- Helper Components --------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.4rem",
          fontWeight: 600,
          color: "#e8c97a",
          marginBottom: 12,
          letterSpacing: 1,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#d0c8b8" }}>{children}</div>
    </section>
  );
}

function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#ca903d", textDecoration: "underline" }}
    >
      {children}
    </a>
  );
}
