import { PageContainer } from "@/components/ui/page-header";

/** Shown at once on navigation while the next page loads its data from the backend. */
export default function ConsoleLoading() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-live="polite" className="flex animate-pulse flex-col gap-6">
        <div className="h-8 w-56 rounded-lg bg-slate-200/70" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
      </div>
    </PageContainer>
  );
}
