/** Quiet page background: a soft violet wash at the top fading to off-white. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f3eeff_0%,#fbfaff_420px)]" />
      <div className="absolute -top-48 right-[-10rem] h-[30rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgba(226,109,159,0.12),transparent)]" />
      <div className="absolute -top-40 left-[-12rem] h-[28rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.10),transparent)]" />
    </div>
  );
}
