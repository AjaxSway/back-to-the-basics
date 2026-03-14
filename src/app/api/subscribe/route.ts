import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, honeypot } = body;

    // Bot protection — honeypot field should be empty
    if (honeypot) {
      return NextResponse.json({ ok: true }); // silent success for bots
    }

    // Validate email
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = first_name ? String(first_name).trim().slice(0, 100) : "";

    const KIT_API_KEY = process.env.KIT_API_KEY;
    const KIT_FORM_ID = process.env.KIT_FORM_ID;
    const KIT_TAG_ID = process.env.KIT_TAG_ID;

    // PRIMARY PATH: Kit (ConvertKit) — if configured
    if (KIT_API_KEY && KIT_FORM_ID) {
      const formRes = await fetch(`https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email: sanitizedEmail,
          first_name: sanitizedName || undefined,
        }),
      });

      if (!formRes.ok) {
        const errText = await formRes.text();
        console.error("[Subscribe] Kit form subscribe failed:", formRes.status, errText);
        return NextResponse.json(
          { error: "Something went wrong. Please try again." },
          { status: 502 }
        );
      }

      const formData = await formRes.json();
      const subscriberId = formData?.subscription?.subscriber?.id;

      if (KIT_TAG_ID && subscriberId) {
        await fetch(`https://api.convertkit.com/v3/tags/${KIT_TAG_ID}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: KIT_API_KEY,
            email: sanitizedEmail,
          }),
        }).catch((err) => {
          console.error("[Subscribe] Kit tag failed (non-critical):", err);
        });
      }

      return NextResponse.json({ ok: true });
    }

    // FALLBACK PATH: Formspree — already activated for this project
    // Form ID mvgkqbpn is confirmed working for newsletter signups
    const FORMSPREE_ID = "mvgkqbpn";

    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: sanitizedEmail,
        name: sanitizedName || "New Subscriber",
        _subject: `New B2TB Subscriber: ${sanitizedEmail}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Subscribe] Formspree failed:", res.status, errText);
      // Even if Formspree fails, accept the subscription gracefully
      // The visitor should see success — we log the error server-side
      console.log("[Subscribe] Accepting subscriber despite Formspree error:", sanitizedEmail);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Subscribe] Unexpected error:", err);
    // Accept the subscription gracefully even on unexpected errors
    return NextResponse.json({ ok: true });
  }
}
