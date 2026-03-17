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
        console.error("[Subscribe] Kit form subscribe failed:", formRes.status, errText, "KEY:", KIT_API_KEY?.slice(0,4), "FORM:", KIT_FORM_ID);
        // Fall through to FormSubmit fallback instead of failing
        return NextResponse.json({ ok: true, fallback: true, email: sanitizedEmail, name: sanitizedName });
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

    // FALLBACK: No Kit configured — tell frontend to use direct FormSubmit
    return NextResponse.json({ ok: true, fallback: true, email: sanitizedEmail, name: sanitizedName });
  } catch (err) {
    console.error("[Subscribe] Unexpected error:", err);
    return NextResponse.json({ ok: true, fallback: true });
  }
}
