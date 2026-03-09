"use client";

import { useState } from "react";

/* ───────────────────────── DATA ───────────────────────── */

const THREE_LAWS = [
  {
    word: "Guarded",
    desc: "Protect your mind. What you allow in shapes what comes out. Guard your attention, your energy, and your peace. Not everything deserves access to you.",
  },
  {
    word: "Grounded",
    desc: "Stay rooted in what is real. Not trends, not noise, not the opinions of people who have never built anything. Stand on principle, not popularity.",
  },
  {
    word: "Grateful",
    desc: "Gratitude is not soft. It is the sharpest weapon against entitlement, bitterness, and drift. Grateful people build. Ungrateful people destroy.",
  },
];

const DOCTRINE_DAYS = [
  "Foundations",
  "Vision",
  "Action",
  "Structure",
  "Ownership",
  "Protection",
  "Order",
  "Effort",
  "Intention",
  "Calm",
  "Discipline",
  "Focus",
  "Consistency",
  "Responsibility",
  "Integrity",
  "Gratitude",
  "Service",
  "Relationships",
  "Growth",
  "Strength",
  "Courage",
  "Character",
  "Influence",
  "Patience",
  "Stewardship",
  "Purpose",
  "Vision Expanded",
  "Legacy",
  "Reflection",
  "Renewal",
];

const TWELVE_PILLARS = [
  { month: "January", pillar: "Awareness" },
  { month: "February", pillar: "Discipline" },
  { month: "March", pillar: "Ownership" },
  { month: "April", pillar: "Courage" },
  { month: "May", pillar: "Service" },
  { month: "June", pillar: "Integrity" },
  { month: "July", pillar: "Gratitude" },
  { month: "August", pillar: "Strength" },
  { month: "September", pillar: "Vision" },
  { month: "October", pillar: "Stewardship" },
  { month: "November", pillar: "Legacy" },
  { month: "December", pillar: "Renewal" },
];

/* ───────────────────────── COMPONENTS ───────────────────────── */

function Divider() {
  return <div className="gold-divider mx-auto my-16 w-full max-w-md" />;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-center text-3xl font-bold tracking-wide text-gold-primary md:text-4xl">
      {children}
    </h2>
  );
}

/* ───────────────────────── SECTIONS ───────────────────────── */

function Hero() {
  return (
    <section className="hero-glow relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Decorative ring */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[420px] w-[420px] rounded-full border border-gold-deep/20 md:h-[560px] md:w-[560px]" />
      </div>

      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-gold-ember">
        A Movement for the Intentional
      </p>

      <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-gold-primary md:text-7xl">
        Back to the Basics
      </h1>

      <p className="mt-6 text-xl font-medium tracking-wide text-gold-motto md:text-2xl">
        Guarded&ensp;&middot;&ensp;Grounded&ensp;&middot;&ensp;Grateful
      </p>

      <p className="mt-4 max-w-xl text-lg text-cream/70">
        Restoring clarity in a distracted world.
      </p>

      <a
        href="#join"
        className="mt-10 inline-block rounded-full border-2 border-gold-deep bg-transparent px-8 py-3 font-semibold text-gold-deep transition hover:bg-gold-deep hover:text-cosmic"
      >
        Join the Movement
      </a>
    </section>
  );
}

function ThreeLaws() {
  return (
    <section id="laws" className="px-6 py-20">
      <SectionHeading>The Three Laws</SectionHeading>
      <p className="mx-auto mb-12 max-w-2xl text-center text-cream/60">
        Every decision, every habit, every relationship passes through these
        three gates.
      </p>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {THREE_LAWS.map((law) => (
          <div
            key={law.word}
            className="card-hover rounded-2xl border border-gold-deep/20 bg-cosmic/60 p-8 backdrop-blur"
          >
            <h3 className="mb-3 text-2xl font-bold text-gold-deep">
              {law.word}
            </h3>
            <p className="leading-relaxed text-cream/70">{law.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DoctrineChallenge() {
  return (
    <section id="doctrine" className="px-6 py-20">
      <SectionHeading>The 30-Day Doctrine Challenge</SectionHeading>
      <p className="mx-auto mb-12 max-w-2xl text-center text-cream/60">
        Thirty days. Thirty principles. One commitment to live with intention.
      </p>

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {DOCTRINE_DAYS.map((day, i) => (
          <div
            key={day}
            className="card-hover flex flex-col items-center rounded-xl border border-bronze/40 bg-cosmic/50 px-3 py-4 text-center"
          >
            <span className="text-xs font-bold text-gold-ember">
              Day {i + 1}
            </span>
            <span className="mt-1 text-sm font-semibold text-gold-primary">
              {day}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TwelvePillars() {
  return (
    <section id="pillars" className="px-6 py-20">
      <SectionHeading>The 12 Pillars</SectionHeading>
      <p className="mx-auto mb-12 max-w-2xl text-center text-cream/60">
        A year-long framework. Each month sharpens one dimension of who you are
        becoming.
      </p>

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {TWELVE_PILLARS.map((p) => (
          <div
            key={p.month}
            className="card-hover rounded-xl border border-gold-deep/20 bg-cosmic/50 p-6 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-ember">
              {p.month}
            </p>
            <p className="mt-2 text-xl font-bold text-gold-primary">
              {p.pillar}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function JoinMovement() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section id="join" className="px-6 py-20">
      <SectionHeading>Join the Movement</SectionHeading>
      <p className="mx-auto mb-10 max-w-xl text-center text-cream/60">
        Get the doctrine delivered. No spam. No fluff. Just clarity.
      </p>

      {submitted ? (
        <p className="text-center text-lg font-semibold text-gold-deep">
          You are in. Welcome to the movement.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-gold-deep/40 bg-cosmic/80 px-6 py-3 text-cream placeholder-cream/40 outline-none focus:border-gold-deep"
          />
          <button
            type="submit"
            className="rounded-full bg-gold-deep px-8 py-3 font-semibold text-cosmic transition hover:bg-gold-primary"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}

function Community() {
  return (
    <section id="community" className="px-6 py-20 text-center">
      <SectionHeading>Community</SectionHeading>
      <p className="mx-auto mb-8 max-w-xl text-cream/60">
        The movement is stronger together. A private space for those committed
        to living with intention.
      </p>
      <a
        href="#"
        className="inline-block rounded-full border-2 border-gold-ember bg-transparent px-8 py-3 font-semibold text-gold-ember transition hover:bg-gold-ember hover:text-cosmic"
      >
        Coming Soon
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-bronze/30 px-6 py-10 text-center text-sm text-cream/40">
      <p className="mb-4 text-gold-motto/80">
        Guarded&ensp;&middot;&ensp;Grounded&ensp;&middot;&ensp;Grateful
      </p>
      <div className="mb-6 flex items-center justify-center gap-6">
        <a
          href="#"
          className="transition hover:text-gold-deep"
          aria-label="Instagram"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
        <a
          href="#"
          className="transition hover:text-gold-deep"
          aria-label="Facebook"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <a
          href="#"
          className="transition hover:text-gold-deep"
          aria-label="X / Twitter"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href="#"
          className="transition hover:text-gold-deep"
          aria-label="YouTube"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
      </div>
      <p>
        &copy; {new Date().getFullYear()} Back to the Basics Movement. All
        rights reserved.
      </p>
    </footer>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl">
      <Hero />
      <Divider />
      <ThreeLaws />
      <Divider />
      <DoctrineChallenge />
      <Divider />
      <TwelvePillars />
      <Divider />
      <JoinMovement />
      <Divider />
      <Community />
      <Footer />
    </main>
  );
}
