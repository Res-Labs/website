const { useState, useEffect, useRef } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "displayFont": "geist",
  "ctaStyle": "glass",
  "tagline": "Verified context for physical products.",
  "ctaLabel": "Work with us",
  "ctaHref": "https://tally.so/r/2EDpd9",
  "tiltGlyph": true
}/*EDITMODE-END*/;

const FONT_STACKS = {
  geist: `"Geist", ui-sans-serif, system-ui, sans-serif`,
  spaceGrotesk: `"Space Grotesk", ui-sans-serif, system-ui, sans-serif`,
  instrument: `"Instrument Serif", "Cormorant Garamond", Georgia, serif`,
  mono: `"Geist Mono", "JetBrains Mono", ui-monospace, monospace`,
};

// useMouseTilt — rAF-eased CSS var writer that drives a 3D rotation toward
// the global cursor position. Pass maxTilt to cap rotation per axis.
function useMouseTilt(ref, { maxTilt = 18, enabled = true } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let raf = 0;
    let targetRX = 0, targetRY = 0;
    let curRX = 0, curRY = 0;
    let specX = 50, specY = 50;
    let targetSpecX = 50, targetSpecY = 50;

    const tick = () => {
      const ease = 0.10;
      curRX += (targetRX - curRX) * ease;
      curRY += (targetRY - curRY) * ease;
      specX += (targetSpecX - specX) * ease;
      specY += (targetSpecY - specY) * ease;
      el.style.setProperty("--rx", curRX.toFixed(2) + "deg");
      el.style.setProperty("--ry", curRY.toFixed(2) + "deg");
      el.style.setProperty("--spec-x", specX.toFixed(1) + "%");
      el.style.setProperty("--spec-y", specY.toFixed(1) + "%");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      const nx = Math.max(-1, Math.min(1, dx));
      const ny = Math.max(-1, Math.min(1, dy));
      targetRY =  nx * maxTilt;
      targetRX = -ny * maxTilt;
      targetSpecX = 50 + nx * 45;
      targetSpecY = 50 + ny * 45;
    };
    const onLeave = () => {
      targetRX = 0; targetRY = 0;
      targetSpecX = 50; targetSpecY = 50;
    };
    // Mobile touch — the first active touch drives the same tilt logic.
    // intentionally do NOT preventDefault so the page still scrolls normally.
    const onTouch = (e) => {
      const t0 = e.touches && e.touches[0];
      if (!t0) return;
      onMove({ clientX: t0.clientX, clientY: t0.clientY });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove",  onTouch, { passive: true });
    window.addEventListener("touchend",   onLeave);
    window.addEventListener("touchcancel", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("touchend",   onLeave);
      window.removeEventListener("touchcancel", onLeave);
    };
  }, [ref, enabled, maxTilt]);
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function Site() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  const prefersReducedMotion = useReducedMotion();
  const displayFont = FONT_STACKS[t.displayFont] || FONT_STACKS.geist;

  return (
    <div className="stage" style={{ "--display-font": displayFont }}>
      {/* Wordmark — anchored top-left of the viewport */}
      <a className="wordmark" href="/" aria-label="Res Labs">
        <img src="assets/logo-white.png" alt="Res Labs" width="326" height="58" />
        <span className="wm-shine" aria-hidden="true" />
      </a>

      <main className="hero-grid">
        {/* LEFT — copy + CTA */}
        <section className="copy">
          <h1 className="tagline">
            {/* Split off a trailing period so we can spin it. Falls back
                gracefully if the user edits the tagline to remove the dot. */}
            {(() => {
              const m = t.tagline.match(/^(.*?)\s*\.\s*$/);
              if (!m) return t.tagline;
              return (
                <>
                  {m[1]}
                  <span className="spin-dot" aria-hidden="true">.</span>
                </>
              );
            })()}
          </h1>
          <p className="subtitle">Res Labs gives physical products a verified digital context, so objects can carry information and identity beyond the shelf.</p>

          <div className="contact-row">
            <CTA variant={t.ctaStyle} href={t.ctaHref}>{t.ctaLabel}</CTA>
          </div>
        </section>

        {/* RIGHT — glyph filled with the video */}
        <section className="glyph-col">
          <GlyphMark tilt={t.tiltGlyph} reduceMotion={prefersReducedMotion} />
        </section>
      </main>

      <Socials />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Type" />
        <TweakSelect
          label="Display font"
          value={t.displayFont}
          onChange={(v) => setTweak("displayFont", v)}
          options={[
            { value: "geist", label: "Geist" },
            { value: "spaceGrotesk", label: "Space Grotesk" },
            { value: "instrument", label: "Instrument Serif" },
            { value: "mono", label: "Geist Mono" },
          ]}
        />
        <TweakText label="Tagline"  value={t.tagline}  onChange={(v) => setTweak("tagline", v)} />

        <TweakSection label="CTA" />
        <TweakRadio
          label="Style"
          value={t.ctaStyle}
          onChange={(v) => setTweak("ctaStyle", v)}
          options={[
            { value: "glass",     label: "Glass" },
            { value: "solid",     label: "Solid" },
            { value: "underline", label: "Under" },
          ]}
        />
        <TweakText label="Label" value={t.ctaLabel} onChange={(v) => setTweak("ctaLabel", v)} />
        <TweakText label="Link"  value={t.ctaHref}  onChange={(v) => setTweak("ctaHref", v)} />

        <TweakSection label="Glyph" />
        <TweakToggle
          label="3D mouse-tilt"
          value={t.tiltGlyph}
          onChange={(v) => setTweak("tiltGlyph", v)}
        />
      </TweaksPanel>
    </div>
  );
}

// GlyphMark — the Res Labs glyph rendered as an SVG clip-path that punches a
// hole through a single <video>. Faithful conversion of the official SVG to
// objectBoundingBox coordinates.
function GlyphMark({ tilt, reduceMotion }) {
  const ref = useRef(null);
  useMouseTilt(ref, { maxTilt: 18, enabled: !!tilt && !reduceMotion });

  return (
    <div className="glyph-wrap" ref={ref}>
      {/* SVG defs — lives in the same DOM as the clipped element. */}
      <svg className="glyph-defs" aria-hidden="true">
        <defs>
          <clipPath id="reslabs-glyph" clipPathUnits="objectBoundingBox">
            {/*
              Faithful conversion of the official Res Labs SVG to
              objectBoundingBox coords (0-1 in both axes). Source viewBox
              spans x=[686.06, 1233.94], y=[265.45, 814.55] — essentially
              square. Two subpaths:
                1. The complex L-shape with smooth Bezier curves at
                   top-left and bottom-right (not generic rounded corners).
                2. The standalone rect on the right.
            */}
            <path d="
              M 0.2761 0.2665
              L 0.7378 0.2665
              L 0.7378 0
              L 0.2753 0
              L 0.2753 0.2631
              C 0.1232 0.2634, 0 0.3866, 0 0.5384
              L 0 1
              L 0.4588 1
              C 0.6113 1, 0.7349 0.8767, 0.7349 0.7245
              L 0.2761 0.7245
              L 0.2761 0.2665
              Z
              M 0.7370 0.2680
              L 1 0.2680
              L 1 0.7223
              L 0.7370 0.7223
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      <div className="glyph-3d">
        <video
          className="glyph-video"
          src="assets/hero.mp4?v=2"
          poster="assets/hero-poster.jpg?v=1"
          width="960"
          height="540"
          preload="metadata"
          aria-hidden="true"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
        />
        {/* Subtle specular sheen that follows the mouse when tilt is on */}
        {tilt && !reduceMotion && <div className="glyph-shine" aria-hidden="true" />}
      </div>
    </div>
  );
}

function CTA({ variant, children, href = "#" }) {
  const isExternal = /^https?:\/\//i.test(href);
  const extra = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  if (variant === "glass") {
    return (
      <a href={href} {...extra} className="cta glass-card">
        <span className="glass-distort" aria-hidden="true" />
        <span className="glass-tint"    aria-hidden="true" />
        <span className="glass-spec"    aria-hidden="true" />
        <span className="glass-edge"    aria-hidden="true" />
        <span className="glass-content">
          <span className="cta-label">{children}</span>
          <Arrow />
        </span>
      </a>
    );
  }
  return (
    <a href={href} {...extra} className={`cta cta-${variant}`}>
      <span className="cta-label">{children}</span>
      <Arrow />
    </a>
  );
}

function Arrow() {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

// Social link with the liquid-glass treatment. Same layered spans as the CTA
// so the surface reads identically — just smaller, square, with an icon.
function SocialButton({ href, label, children }) {
  return (
    <a
      className="social glass-card"
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="glass-distort" aria-hidden="true" />
      <span className="glass-tint"    aria-hidden="true" />
      <span className="glass-spec"    aria-hidden="true" />
      <span className="glass-edge"    aria-hidden="true" />
      <span className="glass-content">{children}</span>
    </a>
  );
}

function Socials() {
  return (
    <div className="socials" aria-label="Social links">
      <SocialButton href="https://x.com/reslabs_ai" label="X (@reslabs_ai)">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      </SocialButton>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Site />);
