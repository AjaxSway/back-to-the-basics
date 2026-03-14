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

    // FALLBACK PATH: FormSubmit.co — works immediately, no account needed
    // Sends subscriber info to George AND sends auto-reply to the subscriber
    const FORMSUBMIT_EMAIL = "contact@backtothebasicsmovement.com";

    const formData = new FormData();
    formData.append("email", sanitizedEmail);
    formData.append("name", sanitizedName || "New Subscriber");
    formData.append("_subject", `New B2TB Subscriber: ${sanitizedEmail}`);
    formData.append("_template", "box");
    formData.append("_captcha", "false");

    // Auto-reply to the subscriber
    formData.append("_autoresponse",
      `Welcome to the Back to the Basics Movement.\n\n` +
      `Thank you for joining. This movement exists for a simple reason: to return to the principles that build strong lives.\n\n` +
      `In a world filled with noise, distraction, and endless opinions, many people feel pulled in a thousand directions. Back to the Basics is a reminder that strength is built through a few timeless principles practiced daily.\n\n` +
      `You will receive updates, reflections, and practical insights designed to challenge your thinking and strengthen your foundation.\n\n` +
      `If something you read resonates with you, pass it on to someone who may need it. Strength spreads when it is shared.\n\n` +
      `Guarded. Grounded. Grateful.\n` +
      `Back to the Basics Movement\n` +
      `backtothebasicsmovement.com`
    );

    const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("[Subscribe] FormSubmit failed:", res.status);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Subscribe] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
