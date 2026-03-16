# B2TB Website — Launch Verification Checklist
## Run this EVERY TIME before showing the site to anyone

---

### 1. Site Loads
- [ ] Open: **backtothebasicsmovement.com**
- [ ] Page loads (no blank screen, no "Application Error")

### 2. Enter the Movement
- [ ] Click **Enter the Movement**
- [ ] Page opens, audio/visuals load

### 3. Subscribe Form
- [ ] Scroll to Subscribe section
- [ ] Enter a test email (e.g. test+check@gmail.com)
- [ ] Click **Join**
- [ ] See: **"You're In"** confirmation
- [ ] If you see "Something went wrong" — STOP, tell Claude "Step 3 failed"

### 4. Check Your Inbox
- [ ] Open **contact@backtothebasicsmovement.com** inbox
- [ ] Confirm you received the subscriber notification email

### 5. Check Auto-Reply
- [ ] Check the test email inbox you used in Step 3
- [ ] Confirm it received: "Welcome to Back to the Basics Movement"
- [ ] If no auto-reply arrived — tell Claude "Step 5 failed"

### 6. Share Your Story
- [ ] Fill out the Story form (name + short message)
- [ ] Click **Submit Your Story**
- [ ] See: **"Thank You for Sharing"** confirmation

### 7. Confirm Story Arrived
- [ ] Check **contact@backtothebasicsmovement.com** inbox
- [ ] Confirm the story submission arrived

### 8. Footer Links
- [ ] Click each social link in footer:
  - [ ] Facebook → opens facebook.com/backtothebasicsmovement
  - [ ] Instagram → opens instagram.com/backtothebasicsmovement
  - [ ] X → opens x.com/backtobasics_mv
  - [ ] YouTube → opens youtube.com/@backtothebasicsmovement
  - [ ] TikTok → opens tiktok.com/@george.back2basics

---

## Result

**All 8 pass** → Safe to show anyone.
**Any step fails** → Tell Claude exactly which step number failed. Example: "Step 3 failed — subscribe form returned error"

---

## Automated Developer Check (run in Claude)

Paste this to Claude for a 30-second system-wide health check:

```
Run a full production health check on backtothebasicsmovement.com:
1. HTTP status check on homepage
2. Vercel deployment status
3. POST test to /api/subscribe with test email
4. Check server logs for errors
5. Report pass/fail for each
```
