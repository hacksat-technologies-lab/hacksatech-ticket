"use client";
import { useEffect, useState } from "react";

// Background photos that slide in from the right every `interval` ms, looping.
// Only the first photo loads with the page; the rest load right after hydration.
export default function HeroSlides({ slides, interval = 5000 }) {
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % slides.length);
    }, interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  const prev = (i - 1 + slides.length) % slides.length;
  return (
    <div className="hero-media" aria-hidden="true">
      {slides.map((src, n) =>
        n === 0 || ready ? (
          <img
            key={src}
            src={src}
            alt=""
            className={n === i ? "on" : n === prev ? "off" : undefined}
            fetchPriority={n === 0 ? "high" : "low"}
            decoding="async"
            width="1280"
            height="850"
          />
        ) : null
      )}
      <div className="hero-dots">
        {slides.map((src, n) => <i key={src} className={n === i ? "on" : undefined} />)}
      </div>
    </div>
  );
}
