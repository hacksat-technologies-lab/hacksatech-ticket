"use client";
import { useEffect, useState } from "react";

const parts = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [["Days", Math.floor(s / 86400)], ["Hours", Math.floor(s / 3600) % 24], ["Mins", Math.floor(s / 60) % 60], ["Secs", s % 60]];
};

export default function Countdown({ to }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(null); // null on the server: avoids a hydration mismatch
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now !== null && now >= target) return <div className="countdown live">It’s happening today. See you there!</div>;
  return (
    <div className="countdown" role="timer" aria-label="Time until Hacksat Connect starts">
      {parts(now === null ? 0 : target - now).map(([l, v]) => (
        <div key={l}><b>{now === null ? "--" : String(v).padStart(2, "0")}</b><span>{l}</span></div>
      ))}
    </div>
  );
}
