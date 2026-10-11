import { useId } from "react";

// MosqAI Shield brand mark, drawn flat after the brand artwork: a mosquito in a
// purple ring (the "O" of MOSQAI) with a crescent sweeping around the right.
// Keep in sync with mosqai-mobile/src/components/logo.tsx.

const MOSQUITO = {
  wings: "M18 40 C27 33 40 35 47 40 C40 45 27 46 18 40 Z M82 40 C73 33 60 35 53 40 C60 45 73 46 82 40 Z",
  antennae: "M48.6 33 L42 24 M51.4 33 L58 24",
  legs: "M47 44 L37 53 L32 67 M53 44 L63 53 L68 67 M48 48 L42 59 L40 72 M52 48 L58 59 L60 72",
};

function Mosquito({ body, wing }: { body: string; wing: string }) {
  return (
    <g>
      <path d={MOSQUITO.wings} fill={wing} />
      <path d={MOSQUITO.antennae} stroke={body} strokeWidth="1.8" strokeLinecap="round" />
      <path d={MOSQUITO.legs} stroke={body} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="50" cy="36.5" r="3.8" fill={body} />
      <ellipse cx="50" cy="57" rx="3.4" ry="16" fill={body} />
    </g>
  );
}

/** The mosquito ring on its own: the "O" of the wordmark. */
function RingO({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#3b1a78" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="43" fill="none" stroke={`url(#${id}r)`} strokeWidth="9" />
      <Mosquito body="#2e1760" wing="#7b3fe4" />
    </svg>
  );
}

/** Square mark (ring, mosquito and crescent) for favicons, avatars and tight spaces. */
export function LogoMark({ className, variant = "color" }: { className?: string; variant?: "color" | "white" }) {
  const id = useId();
  const white = variant === "white";
  return (
    <svg viewBox="0 0 120 100" className={className} role="img" aria-label="MosqAI Shield">
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#3b1a78" />
        </linearGradient>
      </defs>
      <path d="M86 6 A46 46 0 0 1 86 94 A38 44 0 0 0 86 6 Z" fill={white ? "#fff" : `url(#${id}r)`} opacity={white ? 0.9 : 1} />
      <circle cx="50" cy="50" r="40" fill="none" stroke={white ? "#fff" : `url(#${id}r)`} strokeWidth="8" />
      <Mosquito body={white ? "#fff" : "#2e1760"} wing={white ? "rgba(255,255,255,0.8)" : "#7b3fe4"} />
    </svg>
  );
}

/**
 * "MOSQAI / Shield" wordmark with the mosquito ring as the O. `lg` adds the
 * crescent and the "Beyond the Capture." line for sign-in and splash screens.
 */
export function Logo({ size = "sm", className = "" }: { size?: "sm" | "lg"; className?: string }) {
  const lg = size === "lg";
  return (
    <span className={`relative inline-flex flex-col ${lg ? "items-center" : "items-start"} ${className}`} aria-label="MosqAI Shield">
      <span className={`relative inline-flex flex-col ${lg ? "items-center pr-8" : "items-start"}`}>
        <span
          aria-hidden
          className={`flex items-center font-display leading-none font-[800] tracking-tight text-brand-deep ${lg ? "text-[44px]" : "text-[21px]"}`}
        >
          M<RingO className="mx-[0.03em] h-[0.84em] w-[0.84em]" />
          SQ<span className="text-accent">AI</span>
        </span>
        <span aria-hidden className={`font-display leading-none font-medium text-brand-deep ${lg ? "mt-1 text-[30px]" : "mt-0.5 text-[14px]"}`}>
          Shield
        </span>
        {lg && (
          <svg viewBox="0 0 40 100" className="absolute top-[-14%] right-[-6%] h-[128%]" aria-hidden>
            <defs>
              <linearGradient id="logo-crescent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#a47cf3" />
                <stop offset="1" stopColor="#4c1d95" />
              </linearGradient>
            </defs>
            <path d="M4 2 C30 14 38 34 38 50 C38 70 26 88 4 98 C20 82 26 66 26 50 C26 32 18 16 4 2 Z" fill="url(#logo-crescent)" />
          </svg>
        )}
      </span>
      {lg && (
        <span aria-hidden className="mt-5 flex items-center gap-3 text-[11px] tracking-[0.32em] text-brand-deep">
          <span className="h-px w-8 bg-accent/70" />
          BEYOND THE CAPTURE.
          <span className="h-px w-8 bg-accent/70" />
        </span>
      )}
    </span>
  );
}
