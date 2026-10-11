export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full flex-col gap-6 px-4 pt-4 pb-10 sm:px-6 lg:px-8">{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
