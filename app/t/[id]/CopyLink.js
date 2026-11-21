"use client";
import { useState } from "react";

export default function CopyLink() {
  const [done, setDone] = useState(false);
  async function go() {
    try {
      if (navigator.share) await navigator.share({ url: location.href, title: "My Hacksat Connect ticket" });
      else {
        await navigator.clipboard.writeText(location.href);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }
    } catch {}
  }
  return (
    <button className="glass btn-glass" onClick={go}>
      {done ? "Link copied" : "Share ticket"}
    </button>
  );
}
