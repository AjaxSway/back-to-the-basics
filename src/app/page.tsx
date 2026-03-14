"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════
   VOICE SYSTEM
   ═══════════════════════════════════════════════════════════ */

const SECTION_IDS = [
  "home","mission","why","pillars","alanwatts","stormtree",
  "founder","education","voices","standard","subscribe",
];

function useVoiceSystem(entered: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const playedRef = useRef(new Set<string>());
  const currentRef = useRef<string | null>(null);
  const unlockedRef = useRef(false);
  const [autoScroll, setAutoScroll] = useState(true); // on by default — full experience
  const autoScrollRef = useRef(true);
  const userScrolledRef = useRef(false);
  const scrollTimerRef = useRef<number | null>(null);
  const transitioningRef = useRef(false); // true during auto-advance gap between sections
  const playAndScrollRef = useRef<((id: string, force?: boolean) => Promise<void>) | null>(null);
  const bootedRef = useRef(false); // true after first section starts — blocks observer during startup
  const highlightTimerRef = useRef<number | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("btb_voice_enabled");
    if (stored === "0") setEnabled(false);
  }, []);

  // Handle manual scroll — small movements ignored, big scrolls switch sections
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let scrollStart: number | null = null;
    let interrupted = false;

    const onScroll = () => {
      // Track how far user has scrolled
      if (scrollStart === null) scrollStart = window.scrollY;
      const distance = Math.abs(window.scrollY - scrollStart);

      // Always pause auto-scroll animation while user is scrolling
      userScrolledRef.current = true;
      clearTimeout(timeout);

      // Only interrupt audio if user scrolled more than 150px (real intentional scroll)
      if (distance > 150 && !interrupted) {
        interrupted = true;
        transitioningRef.current = false;
        if (audioRef.current && !audioRef.current.paused) {
          // Fade out to prevent pop/click
          const a = audioRef.current;
          const fadeOut = () => {
            if (a.volume > 0.05) {
              a.volume = Math.max(0, a.volume - 0.1);
              requestAnimationFrame(fadeOut);
            } else {
              a.volume = 0;
              a.pause();
              a.currentTime = 0;
            }
          };
          fadeOut();
          currentRef.current = null;
          if (scrollTimerRef.current) cancelAnimationFrame(scrollTimerRef.current);
        }
      }

      timeout = setTimeout(() => {
        userScrolledRef.current = false;
        const wasInterrupted = interrupted;
        scrollStart = null;
        interrupted = false;

        if (!wasInterrupted) return; // small scroll — audio kept playing, nothing to do
        // After a real scroll, find and play whatever section they landed on
        if (!unlockedRef.current || !audioRef.current) return;
        if (!audioRef.current.paused) return;
        const sections = document.querySelectorAll("section[id]");
        let bestId: string | null = null;
        let bestRatio = 0;
        sections.forEach((sec) => {
          const r = sec.getBoundingClientRect();
          const vh = window.innerHeight;
          const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
          const ratio = visible / Math.max(1, r.height);
          if (ratio > bestRatio) { bestRatio = ratio; bestId = sec.id; }
        });
        if (bestId && bestRatio >= 0.3) {
          playAndScrollRef.current?.(bestId, true);
        }
      }, 800);
    };
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Play a section and scroll to it
  const playAndScroll = useCallback(
    async (sectionId: string, force = false) => {
      if (!unlockedRef.current) return;
      if (!SECTION_IDS.includes(sectionId)) return;
      if (!force && playedRef.current.has(sectionId)) return;
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (!audioRef.current) return;
      audioRef.current.src = `/audio/${sectionId}.mp3`;
      audioRef.current.playbackRate = 1.0;
      audioRef.current.volume = 0;
      currentRef.current = sectionId;
      setActiveSection(sectionId);
      try {
        await audioRef.current.play();
        // Fade in to prevent pop/click
        const fadeIn = () => {
          if (audioRef.current && audioRef.current.volume < 0.95) {
            audioRef.current.volume = Math.min(1, audioRef.current.volume + 0.05);
            requestAnimationFrame(fadeIn);
          } else if (audioRef.current) {
            audioRef.current.volume = 1;
          }
        };
        fadeIn();
        playedRef.current.add(sectionId);
        bootedRef.current = true;
        // Progressive scroll: glide through the section in sync with the voice
        if (scrollTimerRef.current) cancelAnimationFrame(scrollTimerRef.current);
        const el = document.getElementById(sectionId);
        const audio = audioRef.current;
        if (el && audio && autoScrollRef.current) {
          const sectionHeight = el.scrollHeight;
          const viewHeight = window.innerHeight;
          // Long sections (founder, etc.) — just scroll to top, let user read at their own pace
          if (sectionHeight > viewHeight * 2.5) {
            const rect = el.getBoundingClientRect();
            const sectionTop = window.scrollY + rect.top - 60;
            window.scrollTo({ top: sectionTop, behavior: "smooth" });
          } else {
            // Short/medium sections — glide through in sync with voice
            const tick = () => {
              if (!audio || audio.paused || audio.ended || currentRef.current !== sectionId) return;
              if (!autoScrollRef.current || userScrolledRef.current) {
                scrollTimerRef.current = requestAnimationFrame(tick);
                return;
              }
              const progress = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
              const rect = el.getBoundingClientRect();
              const sectionTop = window.scrollY + rect.top - 60;
              const scrollRange = Math.max(0, sectionHeight - viewHeight + 100);
              const targetY = sectionTop + scrollRange * progress;
              window.scrollTo(0, targetY);
              scrollTimerRef.current = requestAnimationFrame(tick);
            };
            scrollTimerRef.current = requestAnimationFrame(tick);
          }
        }
        // Highlight words as voice reads — wrap every word in a span, light up word-by-word
        if (highlightTimerRef.current) cancelAnimationFrame(highlightTimerRef.current);
        if (el && audio) {
          const textEls = Array.from(el.querySelectorAll("p, h2, h3, h4, .mission-principles, .memorial-text, .pillar-desc p, .testimonial-body, .perk-text")) as HTMLElement[];
          // Wrap each text node's words in spans (only once)
          const allWordSpans: HTMLSpanElement[] = [];
          textEls.forEach(t => {
            if (t.querySelector(".vw")) {
              // Already wrapped — collect existing spans
              allWordSpans.push(...Array.from(t.querySelectorAll(".vw")) as HTMLSpanElement[]);
              return;
            }
            const walker = document.createTreeWalker(t, NodeFilter.SHOW_TEXT, null);
            const textNodes: Text[] = [];
            let node: Text | null;
            while ((node = walker.nextNode() as Text | null)) textNodes.push(node);
            textNodes.forEach(tn => {
              const words = tn.textContent?.split(/(\s+)/) || [];
              const frag = document.createDocumentFragment();
              words.forEach(w => {
                if (/^\s+$/.test(w) || w === "") {
                  frag.appendChild(document.createTextNode(w));
                } else {
                  const span = document.createElement("span");
                  span.className = "vw";
                  span.textContent = w;
                  frag.appendChild(span);
                  allWordSpans.push(span);
                }
              });
              tn.parentNode?.replaceChild(frag, tn);
            });
          });
          if (allWordSpans.length > 0) {
            el.classList.add("voice-reading");
            // Dim all words initially
            allWordSpans.forEach(s => s.classList.add("voice-dim"));
            const hlTick = () => {
              if (!audio || audio.paused || audio.ended || currentRef.current !== sectionId) {
                el.classList.remove("voice-reading");
                allWordSpans.forEach(s => { s.classList.remove("voice-highlight"); s.classList.remove("voice-dim"); });
                return;
              }
              const progress = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
              const activeIdx = Math.min(Math.floor(progress * allWordSpans.length), allWordSpans.length - 1);
              allWordSpans.forEach((s, i) => {
                if (i <= activeIdx) {
                  s.classList.add("voice-highlight");
                  s.classList.remove("voice-dim");
                } else {
                  s.classList.remove("voice-highlight");
                  s.classList.add("voice-dim");
                }
              });
              highlightTimerRef.current = requestAnimationFrame(hlTick);
            };
            highlightTimerRef.current = requestAnimationFrame(hlTick);
          }
        }
      } catch {
        unlockedRef.current = false;
        setActiveSection(null);
      }
    },
    []
  );
  playAndScrollRef.current = playAndScroll;

  // When audio ends, auto-advance to next section
  // Use a ref-based callback so this works even if audioRef is null on first render
  const onEndedRef = useRef<(() => void) | undefined>(undefined);
  onEndedRef.current = () => {
    const finishedId = currentRef.current;
    currentRef.current = null;
    setActiveSection(null);
    if (finishedId) {
      const idx = SECTION_IDS.indexOf(finishedId);
      if (idx >= 0 && idx < SECTION_IDS.length - 1) {
        const nextId = SECTION_IDS[idx + 1];
        // Block the observer from hijacking during the transition gap
        transitioningRef.current = true;
        setTimeout(() => {
          transitioningRef.current = false;
          playAndScroll(nextId, true);
        }, 1200);
      }
    }
  };

  // Attach ended listener inside playAndScroll's try block won't work cleanly,
  // so use a one-time effect that polls for the audio element
  useEffect(() => {
    const handler = () => onEndedRef.current?.();
    const attach = () => {
      const audio = audioRef.current;
      if (!audio) { requestAnimationFrame(attach); return; }
      audio.addEventListener("ended", handler);
    };
    attach();
    return () => audioRef.current?.removeEventListener("ended", handler);
  }, []);

  // Autoplay home audio once user has entered
  useEffect(() => {
    if (!entered || !enabled) return;
    unlockedRef.current = true;
    const timer = setTimeout(() => {
      playAndScroll("home", true);
    }, 800);
    return () => clearTimeout(timer);
  }, [entered, enabled, playAndScroll]);

  const stop = useCallback(() => {
    if (scrollTimerRef.current) cancelAnimationFrame(scrollTimerRef.current);
    if (highlightTimerRef.current) cancelAnimationFrame(highlightTimerRef.current);
    // Clean up all word highlights
    document.querySelectorAll(".voice-reading").forEach(el => el.classList.remove("voice-reading"));
    document.querySelectorAll(".voice-highlight").forEach(el => el.classList.remove("voice-highlight"));
    document.querySelectorAll(".voice-dim").forEach(el => el.classList.remove("voice-dim"));
    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    currentRef.current = null;
    setActiveSection(null);
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("btb_voice_enabled", next ? "1" : "0");
    if (!next) {
      stop();
      return;
    }
    unlockedRef.current = true;
    // Find the most visible section and start reading from there
    const sections = document.querySelectorAll("section[id]");
    let bestId: string | null = null;
    let bestRatio = 0;
    sections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const ratio = visible / Math.max(1, r.height);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = sec.id;
      }
    });
    if (bestId && bestRatio >= 0.35) await playAndScroll(bestId, true);
  }, [enabled, stop, playAndScroll]);

  // When user scrolls to a new section, read it aloud
  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!unlockedRef.current) return;
        // Don't fire during initial startup — autoplay handles the first section
        if (!bootedRef.current) return;
        // Don't hijack during auto-advance transition between sections
        if (transitioningRef.current) return;
        // Don't interrupt audio that's currently playing
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) return;
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best) return;
        const id = (best.target as HTMLElement).id;
        if (!id || id === currentRef.current) return;
        playAndScroll(id, true);
      },
      { threshold: [0.4, 0.6] }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [enabled, playAndScroll]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && audioRef.current.src && currentRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll(prev => {
      const next = !prev;
      autoScrollRef.current = next;
      return next;
    });
  }, []);

  return { audioRef, enabled, activeSection, toggle, pause, resume, autoScroll, toggleAutoScroll };
}

/* ═══════════════════════════════════════════════════════════
   AMBIENT BACKGROUND MUSIC (Web Audio API — No Copyright)
   Generates soft, ethereal pad tones programmatically
   ═══════════════════════════════════════════════════════════ */

function useAmbientMusic(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const targetVol = 0.045;
  const fadeDuration = 3;

  useEffect(() => {
    const audio = document.createElement("audio");
    audio.src = "/audio/ambient.mp3";
    audio.loop = true;
    audio.volume = targetVol;
    audio.preload = "auto";
    audioRef.current = audio;

    // Crossfade at loop boundaries
    let frameId: number;
    const crossfade = () => {
      if (!audio.duration || audio.paused) { frameId = requestAnimationFrame(crossfade); return; }
      const timeLeft = audio.duration - audio.currentTime;
      if (timeLeft < fadeDuration) {
        audio.volume = Math.max(0, targetVol * (timeLeft / fadeDuration));
      } else if (audio.currentTime < fadeDuration) {
        audio.volume = Math.min(targetVol, targetVol * (audio.currentTime / fadeDuration));
      } else {
        audio.volume = targetVol;
      }
      frameId = requestAnimationFrame(crossfade);
    };
    frameId = requestAnimationFrame(crossfade);

    // Start music — called on user activation events
    const startMusic = () => {
      if (playingRef.current || !enabledRef.current) return;
      audio.volume = targetVol;
      audio.play().then(() => {
        playingRef.current = true;
        cleanup();
      }).catch(() => {});
    };

    // User activation events (these are what browsers actually accept)
    const activationEvents = ["click", "touchstart", "pointerdown", "keydown"];
    const cleanup = () => {
      activationEvents.forEach(e => document.removeEventListener(e, startMusic, true));
    };
    activationEvents.forEach(e => document.addEventListener(e, startMusic, true));

    // Also try autoplay immediately (works on some browsers/domains)
    audio.play().then(() => {
      playingRef.current = true;
      cleanup();
    }).catch(() => {});

    return () => { cleanup(); cancelAnimationFrame(frameId); audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!enabled) {
      audio.pause();
      playingRef.current = false;
    } else {
      audio.volume = targetVol;
      audio.play().then(() => { playingRef.current = true; }).catch(() => {});
    }
  }, [enabled]);
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL HOOK
   ═══════════════════════════════════════════════════════════ */

function useScrollReveal(entered: boolean) {
  useEffect(() => {
    if (!entered) return;
    // Small delay to ensure DOM has rendered
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("active");
          });
        },
        { threshold: 0.1 }
      );
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [entered]);
}

/* ═══════════════════════════════════════════════════════════
   NAV SCROLL HOOK
   ═══════════════════════════════════════════════════════════ */

function useNavScroll() {
  useEffect(() => {
    const handler = () => {
      const nav = document.getElementById("navbar");
      if (!nav) return;
      if (window.scrollY > 80) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function Home() {
  const [entered, setEntered] = useState(false);
  const voice = useVoiceSystem(entered);
  useScrollReveal(entered);
  useNavScroll();
  const [musicEnabled, setMusicEnabled] = useState(true);
  useAmbientMusic(musicEnabled);
  const [mobileNav, setMobileNav] = useState(false);
  const [storySubmitted, setStorySubmitted] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Helper: returns className with voice-reading if this section is active
  const sc = (id: string, base = "") =>
    `${base}${voice.activeSection === id ? " voice-reading" : ""}`.trim();

  const handleEnter = () => { setEntered(true); };

  const [gateAudioPlaying, setGateAudioPlaying] = useState(false);
  const founderVideoRef = useRef<HTMLVideoElement | null>(null);
  const musicWasEnabled = useRef(true);

  // Pause voice + music when video plays, resume when it ends/pauses
  useEffect(() => {
    const video = founderVideoRef.current;
    if (!video) return;
    const onPlay = () => {
      musicWasEnabled.current = musicEnabled;
      voice.pause();
      setMusicEnabled(false);
    };
    const onStop = () => {
      if (musicWasEnabled.current) setMusicEnabled(true);
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onStop);
    video.addEventListener("ended", onStop);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onStop);
      video.removeEventListener("ended", onStop);
    };
  });

  if (!entered) {
    return (
      <div className="enter-gate">
        <button
          className={`gate-sound-control${gateAudioPlaying ? " on" : ""}`}
          onClick={() => setGateAudioPlaying(true)}
          aria-label="Enable sound"
        >
          {gateAudioPlaying ? (
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
          <span className="gate-sound-label">{gateAudioPlaying ? "Sound On" : "Better with Sound"}</span>
        </button>
        <img src="/images/entry-seal.png" alt="Back to the Basics Movement" className="enter-logo" />
        <button className="enter-btn" onClick={handleEnter}>Enter the Movement</button>
      </div>
    );
  }

  return (
    <>
      {/* AUDIO ELEMENT */}
      <audio ref={voice.audioRef} preload="none" />

      {/* NAV */}
      <nav id="navbar">
        <a className="nav-brand" href="#home">Back to the Basics</a>
        <div className="nav-toggle" onClick={() => setMobileNav(!mobileNav)}>
          <span /><span /><span />
        </div>
        <ul className={`nav-links${mobileNav ? " show" : ""}`}>
          <li><a href="#mission" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9670;</span> Mission</a></li>
          <li><a href="#why" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9788;</span> Why</a></li>
          <li><a href="#pillars" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9707;</span> Pillars</a></li>
          <li><a href="#founder" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9733;</span> Founder</a></li>
          <li><a href="#education" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9776;</span> Education</a></li>
          <li><a href="#voices" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9688;</span> Voices</a></li>
          <li><a href="#subscribe" onClick={() => setMobileNav(false)}><span className="nav-icon">&#9993;</span> Subscribe</a></li>
          <li>
            <button
              className={`voice-toggle${voice.enabled ? " on" : ""}`}
              onClick={voice.toggle}
              aria-pressed={voice.enabled}
            >
              Voice: {voice.enabled ? "ON" : "OFF"}
            </button>
          </li>
          <li>
            <button
              className={`autoscroll-toggle${voice.autoScroll ? " on" : ""}`}
              onClick={voice.toggleAutoScroll}
              aria-pressed={voice.autoScroll}
              title="Auto-scroll with voice"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style={{ marginRight: 4, verticalAlign: "middle" }}>
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Scroll: {voice.autoScroll ? "ON" : "OFF"}
            </button>
          </li>
          <li>
            <button
              className={`music-toggle${musicEnabled ? " on" : ""}`}
              onClick={() => setMusicEnabled(!musicEnabled)}
              aria-pressed={musicEnabled}
              title="Toggle background music"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style={{ marginRight: 4, verticalAlign: "middle" }}>
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              {musicEnabled ? "ON" : "OFF"}
            </button>
          </li>
        </ul>
      </nav>

      {/* 1. HERO */}
      <section className={sc("home", "hero")} id="home">
        <img src="/images/hero-seal.png" alt="Back to the Basics Movement Seal" className="hero-seal" />
        <h1 className="hero-title">Back to the Basics</h1>
        <p className="hero-subtitle">Restoring clarity in a distracted world.</p>
        <p className="hero-tagline">Guarded &middot; Grounded &middot; Grateful</p>
        <p style={{ fontSize: "1.15rem", color: "var(--text)", maxWidth: 700, margin: "0 auto 50px", lineHeight: 1.9, animation: "fadeUp 1.5s ease-out 0.9s both" }}>
          A movement dedicated to rebuilding strong individuals, strong families, and strong communities through clarity, discipline, and gratitude.
        </p>
        <div className="hero-buttons">
          <a href="#subscribe" className="btn btn-solid">Join the Movement</a>
          <a href="#voices" className="btn">Share Your Story</a>
          <a href="#education" className="btn">Explore Education</a>
        </div>
      </section>

      {/* 2. MISSION */}
      <section id="mission" className={sc("mission")}>
        <div className="content-mid reveal">
          <span className="section-label">Our Mission</span>
          <h2 className="section-title">Why We Exist</h2>
          <p style={{ textAlign: "center", fontSize: "1.25rem", maxWidth: 720, margin: "0 auto 20px" }}>Back to the Basics Movement exists to restore clarity in a&nbsp;distracted&nbsp;world.</p>
          <p style={{ textAlign: "center", fontSize: "1.25rem", maxWidth: 720, margin: "0 auto 20px" }}>We are not here to add noise. We are here to return to what matters.</p>
          <div className="gold-line" />
          <div className="mission-principles" style={{ textAlign: "center" }}>
            Guarded in Conviction.<br />
            Grounded in Discipline.<br />
            Grateful in Strength.
          </div>
          <p style={{ textAlign: "center", fontSize: "1.2rem", maxWidth: 720, margin: "0 auto 20px" }}>This is not about perfection. It is about alignment. Not about image. About integrity. Not about following blindly. About waking up intentionally.</p>
          <p style={{ textAlign: "center", fontSize: "1.2rem", maxWidth: 720, margin: "0 auto 20px" }}>This movement is personal. This movement is purposeful. This is our&nbsp;foundation.</p>
          <div style={{ textAlign: "center", fontSize: "1.8rem", lineHeight: 2.2, letterSpacing: 1, color: "var(--text-bright)", fontWeight: 400 }}>
            This movement is not built on personality.<br />
            It is built on principle.<br />
            And principles outlive people.
          </div>
        </div>
      </section>

      {/* 3. WHY */}
      <section id="why" className={sc("why")} style={{ borderTop: "1px solid rgba(202,144,61,0.06)", background: "var(--bg-main)" }}>
        <div className="content-mid reveal" style={{ textAlign: "center" }}>
          <span className="section-label">The Purpose</span>
          <h2 className="section-title">Why This Movement Exists</h2>
          <p style={{ fontSize: "1.2rem", lineHeight: 2.1, color: "var(--text)", maxWidth: 720, margin: "0 auto 30px" }}>The Back to the Basics Movement was created in response to a world that has become distracted, reactive, and disconnected from the principles that build strong lives.</p>
          <p style={{ fontSize: "1.15rem", lineHeight: 2, color: "var(--text-muted)", marginBottom: 30 }}>This movement calls people back to the fundamentals:</p>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 300, color: "var(--text-bright)", lineHeight: 2.4, marginBottom: 40 }}>
            Clarity<br />Truth<br />Discipline<br />Gratitude<br />Structure
          </div>
          <div className="gold-line" />
          <p style={{ fontSize: "1.25rem", lineHeight: 2, color: "var(--text)", maxWidth: 700, margin: "30px auto 0" }}>When individuals become stronger, families become stronger.<br />When families become stronger, communities become stronger.</p>
        </div>
      </section>

      {/* 4. PILLARS */}
      <section className={sc("pillars", "pillars")} id="pillars">
        <div className="content-wide reveal">
          <span className="section-label">The Three Pillars</span>
          <h2 className="section-title">What We Stand On</h2>
          <img src="/images/pillars-banner.jpg" alt="Guarded, Grounded, Grateful - The Three Pillars" className="pillars-image" />
          <div className="pillars-descriptions">
            <div className="pillar-desc">
              <h3>Grounded</h3>
              <span className="pillar-trait">Identity Without Noise</span>
              <span className="pillar-trait">Discipline Before Emotion</span>
              <span className="pillar-trait">Structure Before Success</span>
              <p>Roots run deep when you are planted in purpose. Stay connected to your truth, your values, and the things that keep you centered when the world tries to shake you&nbsp;loose.</p>
            </div>
            <div className="pillar-desc">
              <h3>Guarded</h3>
              <span className="pillar-trait">Protection Without Fear</span>
              <span className="pillar-trait">Boundaries Without Bitterness</span>
              <span className="pillar-trait">Strength Without Ego</span>
              <p>Not everyone deserves access to your peace. Being guarded is not about shutting people out. It is about knowing what to let in and having the strength to hold that&nbsp;line.</p>
            </div>
            <div className="pillar-desc">
              <h3>Grateful</h3>
              <span className="pillar-trait">Humility Anchored in Strength</span>
              <span className="pillar-trait">Purpose Without Pride</span>
              <span className="pillar-trait">Fire Without Chaos</span>
              <p>Gratitude shifts everything. When you recognize what you already have, you stop chasing what you do not need. A grateful heart is the richest thing you can&nbsp;carry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALAN WATTS */}
      <section id="alanwatts" className={sc("alanwatts", "anchor-visual-section")}>
        <div className="content-mid reveal" style={{ textAlign: "center" }}>
          <img src="/images/alan_watts_reflection.png" alt="Alan Watts quote over golden sunrise and mountains" className="anchor-visual-img" />
          <p style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "var(--text-bright)", maxWidth: 720, margin: "40px auto 0", letterSpacing: 1 }}>Back to the Basics is about waking&nbsp;up.</p>
        </div>
      </section>

      {/* 6. STORM TREE */}
      <section id="stormtree" className={sc("stormtree", "anchor-visual-section")} style={{ background: "var(--bg-main)" }}>
        <div className="content-mid reveal" style={{ textAlign: "center" }}>
          <img src="/images/storm_tree_anchor.png" alt="A mighty tree standing strong through the storm with lightning" className="anchor-visual-img" />
        </div>
      </section>

      {/* 7. FOUNDER */}
      <section id="founder" className={sc("founder")}>
        <div className="content-mid reveal">
          <div className="founder-section">
            <span className="section-label">The Heart Behind the Foundation</span>
            <h2 className="section-title">The Vision Steward</h2>

            {/* George Bayze */}
            <div style={{ maxWidth: 720, margin: "0 auto 80px", textAlign: "center" }}>
              <img src="/images/founder_lantern_stewardship.png" alt="The Heart Behind the Foundation - Lantern at sunset" className="anchor-visual-img" style={{ maxWidth: 960, marginBottom: 50 }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.2rem", color: "var(--text-bright)", fontWeight: 300, marginBottom: 12 }}>George Bayze</h3>
              <p style={{ fontSize: "1.1rem", color: "var(--gold)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 40 }}>Vision Steward</p>

              {/* FOUNDER VIDEO */}
              <div className="founder-video-wrapper">
                <video ref={founderVideoRef} controls playsInline preload="metadata" poster="/images/hero-seal.png" style={{ background: "var(--bg-deep)" }}>
                  <source src="/video/founder-video.mp4" type="video/mp4" />
                  <track kind="captions" src="/video/founder-video.vtt" srcLang="en" label="English" default />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div style={{ maxWidth: 720, margin: "0 auto", fontSize: "1.1rem", lineHeight: 2.1, color: "var(--text)", textAlign: "center" }}>
                <p>This movement did not start as a business idea. It started as a&nbsp;conviction.</p>
                <p>There were seasons in my life that forced me to slow down and really look at what I was building. Loss changes you. Responsibility changes you. Fatherhood changes&nbsp;you.</p>
                <p>I realized that success without structure collapses. Influence without integrity fades. And faith without discipline becomes&nbsp;noise.</p>
                <p>Back to the Basics began in the quiet mornings at home. In prayer with my wife. In conversations with my daughters about who we are and who we are becoming. It began when I stopped asking what I could achieve and started asking what I could&nbsp;protect.</p>
                <p>I am not a motivational speaker. I am not trying to be a personality. I am a husband. I am a father. I am a brother. I am a man who believes that foundations matter more than finish&nbsp;lines.</p>
                <p>This movement reflects the order of my&nbsp;life.</p>
                <p style={{ color: "var(--gold)", fontSize: "1.2rem", fontWeight: "bold" }}>Faith first. Discipline daily. Gratitude&nbsp;always.</p>
                <p>If what I build cannot hold my family, then it is not worth&nbsp;building.</p>
                <p>My daughters are not part of this brand. They are the reason it&nbsp;exists.</p>
                <p>Everything here is built with them in&nbsp;mind.</p>
                <p style={{ color: "var(--text-bright)", fontStyle: "italic" }}>Because principles outlive people. And foundations outlast&nbsp;applause.</p>
              </div>
            </div>

            <div className="gold-line" />

            {/* Ivette */}
            <div style={{ maxWidth: 720, margin: "60px auto 50px", textAlign: "center" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>The Foundation</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", color: "var(--text-bright)", fontWeight: 300, marginBottom: 8 }}>Ivette Bayze</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Wife &middot; Mother &middot; Foundation</p>
              <div className="gold-line" />
              <div style={{ fontSize: "1.1rem", lineHeight: 2.1, color: "var(--text)", textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
                <p>Ivette is not a memory. She is the&nbsp;anchor.</p>
                <p>Where others shaped this movement through legacy, she shapes it through presence. Every single day. She is the one who holds things steady when life gets heavy. She is the calm when the pressure rises. She is the strength that does not need to announce itself because you can feel it the moment she walks into a&nbsp;room.</p>
                <p>She is the first voice in the morning prayer. She is the hand that reaches across the table to hold yours when words are not enough. She is the one who makes sure the girls know they are protected, that the house has peace, that the family stays rooted no matter what is happening outside those&nbsp;walls.</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontStyle: "italic", color: "var(--text-bright)", lineHeight: 1.9, margin: "30px 0", paddingLeft: 20, borderLeft: "2px solid rgba(202,144,61,0.2)" }}>When she says, &ldquo;Everyone has a Story,&rdquo; she means it. Not as a slogan. As truth. She believes that every person deserves a platform, not to be judged, but to be heard. Not to be fixed, but to be&nbsp;understood.</p>
                <p>There is a kind of strength that does not crack under pressure. It does not perform. It does not seek credit. It just holds. That is Ivette. She is the reason structure begins at home. She is the reason this movement has a heartbeat. She is proof that being Grounded, Guarded, and Grateful is not just a concept you put on a wall. It is a daily choice. And she makes that choice every morning before anyone else wakes&nbsp;up.</p>
                <p style={{ marginTop: 30, color: "var(--gold)", fontSize: "1rem", letterSpacing: 1 }}>This movement stands because she&nbsp;stands.</p>
              </div>
            </div>

            {/* The Why — Daughters */}
            <div style={{ marginTop: 60 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--gold)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 30, textAlign: "center" }}>The Why</p>
              <div style={{ display: "flex", gap: 30, justifyContent: "center", flexWrap: "wrap", marginBottom: 30 }}>
                <div style={{ textAlign: "center", maxWidth: 250 }}>
                  <img src="/images/founder-michele-bayze.jpg" alt="Michele Bayze" style={{ width: 250, borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.4)", border: "1px solid rgba(202,144,61,0.1)" }} />
                  <p style={{ fontSize: "1rem", color: "var(--text-bright)", marginTop: 14, letterSpacing: 1 }}>Michele Bayze</p>
                </div>
                <div style={{ textAlign: "center", maxWidth: 250 }}>
                  <img src="/images/founder-alexis-bayze.jpg" alt="Alexis Bayze" style={{ width: 250, borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.4)", border: "1px solid rgba(202,144,61,0.1)" }} />
                  <p style={{ fontSize: "1rem", color: "var(--text-bright)", marginTop: 14, letterSpacing: 1 }}>Alexis Bayze</p>
                </div>
                <div style={{ textAlign: "center", maxWidth: 250 }}>
                  <img src="/images/founder-emma-bayze.jpg" alt="Emma Bayze" style={{ width: 250, borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.4)", border: "1px solid rgba(202,144,61,0.1)" }} />
                  <p style={{ fontSize: "1rem", color: "var(--text-bright)", marginTop: 14, letterSpacing: 1 }}>Emma Bayze</p>
                </div>
              </div>
              <p style={{ color: "var(--gold)", fontSize: "1.3rem", fontStyle: "italic", marginTop: 30, textAlign: "center", maxWidth: 720, marginLeft: "auto", marginRight: "auto", lineHeight: 1.9 }}>It tells the world this is not ego driven. It is generational. That makes the movement real.</p>
            </div>

            <div className="gold-line" />

            {/* Memorial */}
            <div style={{ marginTop: 80 }}>
              <span className="section-label">The Foundation</span>
              <p style={{ color: "var(--text-muted)", fontSize: "1.15rem", lineHeight: 1.95, maxWidth: 720, margin: "30px auto 60px", textAlign: "center" }}>
                Every movement has a heartbeat. Ours did not start with an idea on paper. It started with the people who shaped us, who challenged us, who loved us in ways that left marks deeper than words could ever describe. This section exists because they deserve more than a memory. They deserve a foundation.
              </p>

              {/* Valerie */}
              <div className="memorial-person clearfix">
                <img src="/images/memorial-valerie.jpg" alt="Valerie Jean McDonald" className="memorial-photo" />
                <p className="memorial-name">Valerie Jean McDonald</p>
                <p className="memorial-families">Smith &middot; Bayze &middot; Rocha</p>
                <p className="memorial-dates">January 15, 1980 &ndash; August 4, 2023</p>
                <p className="memorial-text">Valerie was a quiet soul who relished the simple pleasures of life. She loved reading and writing, listening to Oldies, getting lost in Sunday Night Slow Jams, and spending time with the people she loved. She had an uncanny ability to find happiness in her daily activities, whether it was exploring Tucson or just being present in a room full of family. That was her gift. She did not need the world to be loud. She just needed it to be real.</p>
                <p className="memorial-text">She carried the last names Smith, Bayze, and Rocha not because she had to, but because she believed that the people tied to those names were all one family. She refused to let distance, disagreement, or life&#39;s mess separate the people she loved. She held on. Always.</p>
                <p className="memorial-text">Valerie never married and never had children of her own, but she was great with kids. She loved her siblings and their children fiercely. She was a protector. She helped raise her siblings&#39; kids whenever she had the opportunity, showing up in the quiet ways that mattered most. Not for credit. Not for recognition. Because that is who she was.</p>
                <p className="memorial-text">She lived with severe narcolepsy and other health challenges for most of her life. She carried that weight without complaint, without excuses, with a resilience that most people never saw because she never asked anyone to see it. Eventually, cancer took her from us. And the world got quieter.</p>
                <p className="memorial-text emphasis">Losing her forced a reckoning. You begin to understand how fragile time is. You begin to understand that words matter. That forgiveness matters. That family is not optional. It is sacred. It is the whole point.</p>
                <p className="memorial-text">This movement carries her name because she carried us. Everything we teach about being Grounded was something Valerie already lived before we ever wrote it down. She is woven into the foundation of Back to the Basics. Not as a tribute. As truth.</p>
                <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", fontStyle: "italic", marginTop: 20 }}>Preceded in death by her father Adrian McDonald. Survived by her Mom and Dad, Sigrid and Mario Rocha, brothers George and Jeremy, sister Priscilla, and many friends and family who will love her until the very end.</p>
                <p style={{ color: "var(--gold-dim)", fontSize: "1rem", marginTop: 16, fontStyle: "italic" }}>We love you, Valerie. See you again in the next life.</p>
              </div>

              {/* Betty */}
              <div className="memorial-person clearfix">
                <img src="/images/memorial-betty.jpg" alt="Betty with Tikaani" className="memorial-photo" />
                <p className="memorial-name">Betty J Wittels</p>
                <p className="memorial-dates">April 21, 1951 &ndash; February 10, 2026</p>
                <p className="memorial-text">Betty was a Licensed Professional Counselor and psychotherapist in Tucson, Arizona for over four decades. She worked with children, adolescents, families, and married couples. She specialized in adolescent, marriage, and family therapy. She was fluent in Spanish. Her office was not a sterile room with fluorescent lights. It offered a garden, animals, and an atmosphere designed to make people feel safe enough to be honest. Because that is what Betty demanded. Honesty.</p>
                <p className="memorial-text">She was not the soft voice in the room. She was the one who looked you in the eye and told you the thing nobody else had the courage to say. And she did not care if it was comfortable. She cared if it was true. There are people in your life who tell you what you want to hear because it is easier. Betty was never one of those people.</p>
                <p className="memorial-text">She told you when you were wrong. She told you when you were selling yourself short. She told you when you were making excuses instead of making changes. And she did it with a fire that could fill an entire room. Her presence demanded growth. Her honesty sharpened you. Her energy was something you could feel the moment she walked in.</p>
                <p className="memorial-text emphasis">She was not just light. She was fire. The kind that burns away the things you are hiding behind. The kind that forces you to stand up straight and stop pretending. The kind that leaves you better, even when it stings.</p>
                <p className="memorial-text">Betty did not raise weak people. She believed in truth, even when it made the room quiet. She pushed. She challenged. She demanded more. And because of that, she built strength in others that they did not even know they had. Her voice still echoes in discipline. In honesty. In accountability. In gratitude that is earned, not performative.</p>
                <p className="memorial-text">She believed that one&#39;s reaction to life events is a choice. Whether in the mind, emotions, or spirit, all things are possible. She lived that belief every single day.</p>
                <p className="memorial-text">Back to the Basics exists in part because she refused to let complacency win. This movement carries her courage in everything we say about being Guarded. The willingness to protect what matters. The refusal to water down the truth. The backbone to say the real thing when it would be easier to say nothing.</p>
                <p style={{ color: "var(--gold-dim)", fontSize: "1rem", marginTop: 16, fontStyle: "italic" }}>She lived Guarded, Grounded, and Grateful before we ever wrote it down. She just called it being real.</p>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", marginTop: 20, fontStyle: "italic" }}>Pictured with Tikaani (meaning &ldquo;wolf&rdquo; in Alaskan Inuit), her Akita/Husky and certified service dog who passed December 12, 2018 at age 14. Her spirit still lives.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. EDUCATION */}
      <section className={sc("education", "education")} id="education">
        <div className="content-wide reveal">
          <span className="section-label">Learn and Grow Together</span>
          <h2 className="section-title">Education</h2>
          <p style={{ color: "var(--text-bright)", fontSize: "1.25rem", lineHeight: 2, maxWidth: 720, margin: "0 auto 10px", textAlign: "center" }}>This movement is built on practical understanding.</p>
          <p style={{ color: "var(--text)", fontSize: "1.15rem", lineHeight: 2, maxWidth: 720, margin: "0 auto 10px", textAlign: "center" }}>These resources help people rebuild clarity, discipline, and structure in daily life.</p>
          <p style={{ color: "var(--gold)", fontSize: "1.1rem", lineHeight: 2, maxWidth: 720, margin: "0 auto 30px", textAlign: "center" }}>No cost. No gatekeeping. Only principles.</p>
          <div className="gold-line" />
          <p className="education-quote">&ldquo;Everyone has a Story.&rdquo;</p>
          <p className="education-attr">&mdash; Ivette Bayze</p>
          <p style={{ color: "var(--text)", fontSize: "1.15rem", lineHeight: 2.1, maxWidth: 720, margin: "0 auto 20px", textAlign: "center" }}>Education here does not mean lectures. It means shared experience. It means real people sitting at the table with real lessons learned the hard way. It means your story matters, and someone else needs to hear it just as much as you need to tell it.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.95, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>Because wisdom is not owned. It is shared. And there is power in testimony that no textbook could ever replace.</p>
          <div className="education-grid">
            {[
              { title: "Community Discussions", desc: "Open conversations about life, growth, discipline, and the things most people are afraid to say out loud. No judgment. Just truth and support." },
              { title: "Personal Growth Workshops", desc: "Live sessions focused on building habits, breaking cycles, and strengthening your foundation from the inside out. Real tools for real life." },
              { title: "Story Submissions", desc: "Your story is your power. Submit your experience, your lesson, your turning point. Someone out there needs to hear exactly what you went through." },
              { title: "Discipline Challenges", desc: "Monthly challenges designed to push you past comfort. Accountability, consistency, and growth that you can actually measure week over week." },
              { title: "Faith-Centered Reflections", desc: "Guided reflections that honor the spiritual side of the journey. Rooted in faith, open to all. A space to be still and listen." },
              { title: "Leadership Development", desc: "For those ready to step up. Resources, mentorship opportunities, and frameworks for leading yourself and others with integrity." },
            ].map((card) => (
              <div key={card.title} className="edu-card">
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="edu-buttons">
            <a href="#voices" className="btn">Submit Your Story</a>
            <a href="#subscribe" className="btn">Join a Session</a>
            <a href="#subscribe" className="btn">Explore Resources</a>
          </div>
        </div>
      </section>

      {/* 9. VOICES */}
      <section id="voices" className={sc("voices")}>
        <div className="content-wide reveal">
          <span className="section-label">Voices of the Movement</span>
          <h2 className="section-title">Power Lives in Testimony</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.95, maxWidth: 720, margin: "0 auto 20px", textAlign: "center" }}>This is a living wall. Real people. Real experiences. Real lessons learned. Truth in writing. Strength in vulnerability. Every story here is proof that you are not alone, and that your story matters too.</p>

          <div className="testimonial-wall">
            {[
              { initial: "M", name: "Maria L.", body: "I spent years running from the hard conversations. This movement taught me that being Guarded does not mean hiding. It means protecting what matters while still showing up. That changed everything for me." },
              { initial: "D", name: "Daniel R.", body: "My father passed when I was 19. I spent a decade angry at the world. Grounded brought me back. The discipline challenges forced me to face the things I was avoiding. I am not the same person I was a year ago." },
              { initial: "S", name: "Sandra K.", body: "Grateful is not just a word on this site. It is a practice. The weekly reflections forced me to stop, breathe, and count what I actually have instead of chasing what I thought I needed. Simple. Life changing." },
            ].map((t) => (
              <div key={t.initial} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{t.initial}</div>
                  <div><p className="testimonial-name">{t.name}</p><p className="testimonial-role">Community Member</p></div>
                </div>
                <p className="testimonial-body">{t.body}</p>
              </div>
            ))}
          </div>

          {/* Story Form */}
          <div className="submit-section" style={{ textAlign: "center" }}>
            <h3>Share Your Story</h3>
            <p>Everyone has a story. This is your platform. Not to be judged. To be heard.</p>
            {storySubmitted ? (
              <div className="form-success show">
                <h3>Thank You for Sharing</h3>
                <p>Your story matters. We will review it and feature it on the wall.</p>
              </div>
            ) : (
              <form
                action="https://formspree.io/f/xpzvqkgd"
                method="POST"
                style={{ maxWidth: 600, margin: "0 auto" }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const btn = form.querySelector("button") as HTMLButtonElement;
                  btn.textContent = "SUBMITTING...";
                  btn.disabled = true;
                  try {
                    const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
                    if (res.ok) setStorySubmitted(true);
                    else { btn.textContent = "ERROR — TRY AGAIN"; setTimeout(() => { btn.textContent = "Submit Your Story"; btn.disabled = false; }, 3000); }
                  } catch { btn.textContent = "ERROR — TRY AGAIN"; setTimeout(() => { btn.textContent = "Submit Your Story"; btn.disabled = false; }, 3000); }
                }}
              >
                <input type="hidden" name="_subject" value="New Story Submission — Back to the Basics" />
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" name="name" className="form-input" placeholder="How you would like to be identified" required />
                </div>
                <div className="form-group">
                  <label>Your Story <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>(Max 2,000 characters)</span></label>
                  <textarea className="form-input" name="story" placeholder="Share your experience, your lesson, your turning point. Take your time. Be real." required maxLength={2000} onChange={(e) => setCharCount(e.target.value.length)} />
                  <p className="char-count">{charCount} / 2,000</p>
                </div>
                <div className="form-group">
                  <label>A Quote or Lesson That Stuck With You (Optional)</label>
                  <input type="text" name="quote" className="form-input" placeholder="Something you carry with you" />
                </div>
                <button type="submit" className="btn btn-solid" style={{ marginTop: 16, width: "100%" }}>Submit Your Story</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 10. THE STANDARD */}
      <section id="standard" className={sc("standard")} style={{ background: "linear-gradient(180deg, var(--bg-deep), rgba(28,24,20,0.2) 50%, var(--bg-deep))" }}>
        <div className="content-mid reveal" style={{ textAlign: "center" }}>
          <span className="section-label">The Growth Engine</span>
          <h2 className="section-title">The Standard</h2>
          <p style={{ fontSize: "1.2rem", lineHeight: 2, color: "var(--text)", maxWidth: 720, margin: "0 auto 40px" }}>Each day we return to the same principles.</p>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, color: "var(--text-bright)", lineHeight: 2.6 }}>
            Clarity in thought.<br />
            Truth in action.<br />
            Discipline in habits.<br />
            Gratitude in perspective.<br />
            Structure in life.
          </div>
          <div className="gold-line" />
          <p style={{ fontSize: "1.15rem", lineHeight: 2, color: "var(--text)", maxWidth: 720, margin: "0 auto" }}>The Back to the Basics Movement exists to remind us that strength is built daily through these standards.</p>
        </div>
      </section>

      {/* 11. SUBSCRIBE */}
      <section className={sc("subscribe", "newsletter")} id="subscribe">
        <div className="newsletter-inner reveal">
          <span className="section-label">Stay Connected</span>
          <h2 className="section-title">Stay Connected</h2>
          <p style={{ color: "var(--text)", fontSize: "1.15rem", lineHeight: 2, maxWidth: 720, margin: "0 auto 10px", textAlign: "center" }}>Receive updates, reflections, and practical insights from the Back to the Basics Movement.</p>
          <p style={{ color: "var(--gold)", fontSize: "1.1rem", lineHeight: 2, maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>There is no cost to join. This simply keeps the community connected.</p>
          <div className="why-join">
            <h3>This Is More Than a Newsletter</h3>
            <p>Life gets loud. Distractions pile up. People pull you in directions that do not serve you. Signing up means you are making a decision to invest in yourself. Every week, you get something real delivered to your inbox. Words that challenge you, remind you of your worth, and hold you accountable to the person you are becoming. This is not motivational fluff. This is a community built on purpose, for people who are serious about protecting their peace and building something&nbsp;lasting.</p>
          </div>
          <p style={{ marginBottom: 30, fontSize: "1.15rem", color: "var(--text-muted)" }}>Here is exactly what you get when you join:</p>
          <div className="newsletter-perks">
            <div className="perk">
              <div className="perk-icon"><svg viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.5L10 14.7l-4.9 2.5.9-5.5-4-3.9 5.5-.8z" stroke="#ca903d" strokeWidth="1.5" fill="rgba(202,144,61,0.12)" /></svg></div>
              <div className="perk-text"><strong>Weekly Inspiration</strong>A fresh word to carry with you. Original reflections written from real life experience, not recycled internet quotes.</div>
            </div>
            <div className="perk">
              <div className="perk-icon"><svg viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="#ca903d" strokeWidth="1.5" fill="rgba(202,144,61,0.06)" /><line x1="6" y1="6" x2="14" y2="6" stroke="#ca903d" strokeWidth="1" opacity="0.5" /><line x1="6" y1="9" x2="14" y2="9" stroke="#ca903d" strokeWidth="1" opacity="0.5" /><line x1="6" y1="12" x2="11" y2="12" stroke="#ca903d" strokeWidth="1" opacity="0.5" /></svg></div>
              <div className="perk-text"><strong>Exclusive Reflections</strong>Deeper writings and personal stories that only subscribers experience. These do not get posted anywhere else.</div>
            </div>
            <div className="perk">
              <div className="perk-icon"><svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#ca903d" strokeWidth="1.5" fill="rgba(202,144,61,0.06)" /><path d="M7 7c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5-1.3 2-3 2.5V12" stroke="#ca903d" strokeWidth="1.2" strokeLinecap="round" /><circle cx="10" cy="14" r="0.8" fill="#ca903d" /></svg></div>
              <div className="perk-text"><strong>First Access</strong>New content, events, merch drops, collaborations. Subscribers hear about it first before it goes public.</div>
            </div>
            <div className="perk">
              <div className="perk-icon"><svg viewBox="0 0 20 20" fill="none"><path d="M10 3v7l4.5 2.5" stroke="#ca903d" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="10" r="7.5" stroke="#ca903d" strokeWidth="1.5" fill="rgba(202,144,61,0.06)" /></svg></div>
              <div className="perk-text"><strong>Monthly Challenges</strong>Guided prompts to stretch your mindset, strengthen your foundation, and grow your roots deeper every month.</div>
            </div>
          </div>
          {newsletterSubmitted ? (
            <div className="form-success show">
              <h3>Welcome to the Family</h3>
              <p>Stay rooted. Your first message is on its way.</p>
            </div>
          ) : (
            <form
              className="signup-form"
              action="https://formspree.io/f/mvgkqbpn"
              method="POST"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const btn = form.querySelector("button") as HTMLButtonElement;
                btn.textContent = "JOINING...";
                btn.disabled = true;
                try {
                  const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
                  if (res.ok) setNewsletterSubmitted(true);
                  else { btn.textContent = "ERROR"; setTimeout(() => { btn.textContent = "Join"; btn.disabled = false; }, 3000); }
                } catch { btn.textContent = "ERROR"; setTimeout(() => { btn.textContent = "Join"; btn.disabled = false; }, 3000); }
              }}
            >
              <input type="email" name="email" placeholder="Your email address" required />
              <button type="submit">Join</button>
            </form>
          )}
          <p className="signup-note">No spam. No fluff. Just substance. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand-col">
              <img src="/images/footer-brand-logo.jpg" alt="Back to the Basics" />
              <p className="footer-brand-name">Back to the Basics Movement</p>
              <p className="footer-brand-tag">Guarded &middot; Grounded &middot; Grateful</p>
              <p className="footer-brand-desc">A personal development and education movement rooted in discipline, truth, gratitude, and shared testimony. Not a brand. A structure.</p>
            </div>
            <div className="footer-col">
              <h4>Navigate</h4>
              <a href="#home">Home</a>
              <a href="#mission">Mission</a>
              <a href="#why">Why</a>
              <a href="#pillars">Pillars</a>
              <a href="#founder">Founder</a>
              <a href="#education">Education</a>
              <a href="#voices">Voices</a>
              <a href="#standard">The Standard</a>
              <a href="#subscribe">Subscribe</a>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <span className="footer-email"><a href="mailto:info@backtothebasicsmovement.com">info@backtothebasicsmovement.com</a></span>
              <span className="footer-email"><a href="mailto:support@backtothebasicsmovement.com">support@backtothebasicsmovement.com</a></span>
              <span className="footer-email"><a href="mailto:press@backtothebasicsmovement.com">press@backtothebasicsmovement.com</a></span>
              <span className="footer-email"><a href="mailto:finance@backtothebasicsmovement.com">finance@backtothebasicsmovement.com</a></span>
              <span className="footer-email"><a href="mailto:leadership@backtothebasicsmovement.com">leadership@backtothebasicsmovement.com</a></span>
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: "0.75rem", color: "var(--gold-dim)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Follow</h4>
                <a href="https://www.tiktok.com/@george.back2basics" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>TikTok</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-llc">Back to the Basics Movement LLC</p>
            <p className="footer-copy">&copy; 2026 Back to the Basics Movement. All rights reserved. Structure builds longevity.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
