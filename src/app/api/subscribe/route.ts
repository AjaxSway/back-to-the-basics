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

    if (!KIT_API_KEY || !KIT_FORM_ID) {
      console.error("[Subscribe] Missing KIT_API_KEY or KIT_FORM_ID environment variables.");
      return NextResponse.json(
        { error: "Subscription service is being configured. Please try again soon." },
        { status: 503 }
      );
    }

    // Step 1: Add subscriber to Kit form (this creates or upserts the subscriber)
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

    // Step 2: Tag subscriber if KIT_TAG_ID is configured
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
  } catch (err) {
    console.error("[Subscribe] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
