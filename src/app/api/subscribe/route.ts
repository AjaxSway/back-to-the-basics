import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, honeypot } = body;

    // Bot protection — honeypot field should be empty
    if (honeypot) {
      return NextResponse.json({ ok: true });
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
        console.error("[Subscribe] Kit form subscribe failed:", formRes.status, sanitizeLogText(errText));
        return NextResponse.json(
          { ok: false, error: "Subscription service is temporarily unavailable. Please try again soon." },
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

      return NextResponse.json({ ok: true, provider: "kit" });
    }

    console.error("[Subscribe] Kit is not configured for this deployment.");
    return NextResponse.json(
      { ok: false, error: "Subscription service is not configured." },
      { status: 503 }
    );
  } catch (err) {
    console.error("[Subscribe] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Subscription service is temporarily unavailable. Please try again soon." },
      { status: 500 }
    );
  }
}

function sanitizeLogText(value: string) {
  return value
    .slice(0, 240)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, "[redacted]");
}
