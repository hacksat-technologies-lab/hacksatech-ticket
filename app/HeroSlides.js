"use client";
import { useEffect, useState } from "react";

// Background photos that slide in from the right every `interval` ms, looping.
// Only the first photo loads with the page. Each next photo starts loading one slide
// ahead of time, so a visitor who leaves early never downloads the rest.
export default function HeroSlides({ slides, interval = 5000 }) {
  const [i, setI] = useState(0);
  const [upto, setUpto] = useState(0); // highest slide index allowed to load

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setUpto(1);
    const t = setInterval(() => {
      if (document.hidden) return;
      setI((n) => {
        const next = (n + 1) % slides.length;
        setUpto((u) => Math.max(u, Math.min(next + 1, slides.length - 1)));
        return next;
      });
    }, interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  const prev = (i - 1 + slides.length) % slides.length;
  return (
    <div className="hero-media" aria-hidden="true">
      {slides.map((src, n) =>
        n <= upto ? (
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
