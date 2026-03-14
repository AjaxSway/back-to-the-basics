# Kit Welcome Sequence — Back to the Basics Movement

## Strategy
The 4-email sequence takes a new subscriber from stranger to invested community member.

| Email | Timing | Purpose | Emotional State |
|-------|--------|---------|-----------------|
| 1 | Immediately | Welcome, affirm their decision | "I made the right choice" |
| 2 | 1 day later | Explain the philosophy | "This is deeper than I thought" |
| 3 | 3 days later | Build identity and trust | "This is for people like me" |
| 4 | 6 days later | Invite deeper connection | "I want to stay and grow here" |

---

## Kit Automation Setup

### Form
- **Name**: "Join the Movement"
- **Type**: API-connected (website form submits to Kit via backend)
- **Double opt-in**: OFF (your form already requires intentional action)

### Automation
- **Name**: "Welcome Sequence — New Subscriber"
- **Trigger**: Subscriber added to "Join the Movement" form
- **Steps**:
  1. Send Email 1 (immediately)
  2. Wait 1 day
  3. Send Email 2
  4. Wait 2 days
  5. Send Email 3
  6. Wait 3 days
  7. Send Email 4
  8. Add tag: "Welcome Complete"

### Tags
- `website-subscriber` — applied at signup (use KIT_TAG_ID in env)
- `welcome-complete` — applied after Email 4 finishes
- That is all you need right now. Do not over-tag.

### Duplicate Prevention
- Kit handles this automatically. If someone subscribes again, they are not re-added to the sequence.

---

## Email 1 — Welcome (Immediate)

**Subject:** Welcome to Back to the Basics
**Preview text:** You just made a decision most people avoid.

---

Hello,

Thank you for joining the Back to the Basics Movement.

This movement exists for a simple reason: to return to the principles that build strong lives.

In a world filled with noise, distraction, and endless opinions, many people feel pulled in a thousand directions. Back to the Basics is a reminder that strength is built through a few timeless principles practiced daily.

Over the coming days, you will receive short messages focused on ideas like discipline, integrity, focus, gratitude, and purpose. Nothing complicated. Just clear principles that help build a strong foundation for life.

If something you read resonates with you, pass it on to someone who may need it.

Strength spreads when it is shared.

Guarded · Grounded · Grateful
Back to the Basics Movement

**CTA:** [Visit the Movement →](https://backtothebasicsmovement.com)

---

### Alternate Subject Lines
1. You just took a step most people skip
2. Welcome. The foundation starts here.
3. Something different starts today
4. The basics. The beginning. Welcome.
5. You are now part of something real

---

## Email 2 — The Philosophy (Day 1)

**Subject:** Why Back to the Basics exists
**Preview text:** This is not motivation. This is structure.

---

Hello,

Many movements try to create something new.

Back to the Basics does the opposite.

It reminds us of what has always worked.

Strong character. Clear principles. Daily discipline. Gratitude for the gift of life.

These ideas are not complicated, but they are powerful when practiced consistently.

Think about the strongest person you know. Not the loudest. The strongest. They probably live by a few simple rules and never waver from them. That is what this movement is about.

Every day, a short principle is shared as a reminder that the foundation of a strong life is built through small actions repeated over time.

One clear decision today can shape the direction of tomorrow.

Guarded · Grounded · Grateful
Back to the Basics Movement

**CTA:** [Read the Three Pillars →](https://backtothebasicsmovement.com/#pillars)

---

### Alternate Subject Lines
1. The opposite of complicated
2. What the strongest people already know
3. Simple rules. Powerful results.
4. This is what foundations look like
5. Why simplicity wins every time

---

## Email 3 — Identity and Trust (Day 3)

**Subject:** This movement is for a specific kind of person
**Preview text:** Not everyone will get this. That is the point.

---

Hello,

Back to the Basics is not for everyone.

It is for people who are tired of surface-level advice. People who want something they can actually build on. People who know that real strength is quiet, consistent, and earned.

If you have ever felt like the world rewards noise over substance, you are not alone. This community is filled with people who feel the same way and decided to do something about it.

We do not chase trends. We do not sell hype. We practice principles.

Truth. Accountability. Growth.

That is the foundation. Everything else is built on top of it.

You are here because something in you recognized that. Trust that instinct.

Guarded · Grounded · Grateful
Back to the Basics Movement

**CTA:** [Read Stories from the Community →](https://backtothebasicsmovement.com/#voices)

---

### Alternate Subject Lines
1. Not everyone will understand this
2. You recognized something real
3. The kind of person who stays
4. Quiet strength in a loud world
5. Built for people who build

---

## Email 4 — Deeper Connection (Day 6)

**Subject:** One question worth asking
**Preview text:** The answer shapes everything after it.

---

Hello,

One of the ideas behind Back to the Basics is simple:

The quality of your life is shaped by the principles you practice daily.

Not once in a while. Not when it feels convenient. But consistently.

So here is a simple question worth asking today:

Which principle deserves more attention in your life right now?

- Discipline
- Focus
- Integrity
- Gratitude
- Purpose

Small adjustments made today often become powerful changes over time.

Here is how to stay connected to the movement going forward:

- Follow us on [Facebook](https://www.facebook.com/backtothebasicsmovement), [Instagram](https://www.instagram.com/backtothebasicsmovement), [X](https://x.com/backtobasics_mv), or [YouTube](https://www.youtube.com/@backtothebasicsmovement)
- Visit the site anytime at [backtothebasicsmovement.com](https://backtothebasicsmovement.com)
- Reply to any email if you want to share your story or ask a question

This is just the beginning.

Guarded · Grounded · Grateful
Back to the Basics Movement

**CTA:** [Share Your Story →](https://backtothebasicsmovement.com/#voices)

---

### Alternate Subject Lines
1. One adjustment. Everything shifts.
2. The question behind the question
3. Which principle are you missing?
4. Small shifts, lasting change
5. What comes next is up to you

---

## Email Signature (use on all emails)

> Strong lives are rarely built through dramatic moments. They are built through small principles practiced daily. Guard what matters. Stay grounded in what is true. Be grateful for the gift of life.
>
> Guarded · Grounded · Grateful
> Back to the Basics Movement

---

## Implementation Checklist

1. [ ] Log into Kit at [app.kit.com](https://app.kit.com)
2. [ ] Go to **Grow → Landing Pages & Forms** → Create Form
3. [ ] Name it **"Join the Movement"**
4. [ ] Copy the Form ID from the URL (the number after `/forms/`)
5. [ ] Go to **Settings → Developer** → copy your API Key
6. [ ] Paste both into Vercel Environment Variables:
   - `KIT_API_KEY` = your API key
   - `KIT_FORM_ID` = your form ID
7. [ ] Go to **Send → Sequences** → Create Sequence
8. [ ] Name it **"Welcome Sequence — New Subscriber"**
9. [ ] Add 4 emails with the content above
10. [ ] Set delays: Email 1 immediate, Email 2 +1 day, Email 3 +2 days, Email 4 +3 days
11. [ ] Go to **Automate → Visual Automations** → Create Automation
12. [ ] Trigger: "Subscribes to form → Join the Movement"
13. [ ] Action: "Add to sequence → Welcome Sequence"
14. [ ] Activate the automation
15. [ ] Test with your own email
16. [ ] Verify all 4 emails arrive on schedule
17. [ ] Redeploy on Vercel after adding env vars

---

## Best Recommendations

- **Form name**: "Join the Movement"
- **Automation name**: "Welcome Sequence — New Subscriber"
- **Website CTA text**: "Join" (already set)
- **Success message**: "Welcome to the Family. Stay rooted. Your first message is on its way." (already set)
