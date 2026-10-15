"use client";

import { Wrench } from "lucide-react";
import { useId, useRef, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

/** A button for a feature that isn't ready yet: clicking it explains that instead of doing nothing. */
export function UnderDevelopmentButton({
  plain = false,
  variant,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "disabled"> & { plain?: boolean }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => ref.current?.close();

  return (
    <>
      {/* plain: unstyled, for icon buttons inside tables */}
      {plain ? (
        <button type="button" {...props} onClick={() => ref.current?.showModal()} />
      ) : (
        <Button variant={variant} {...props} onClick={() => ref.current?.showModal()} />
      )}
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={(e) => e.target === ref.current && close()}
        className="m-auto w-[min(92vw,24rem)] rounded-[1.75rem] border border-white bg-white p-0 text-ink shadow-2xl backdrop:bg-slate-900/45 backdrop:backdrop-blur-md"
      >
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Wrench className="size-5" aria-hidden />
          </span>
          <h2 id={titleId} className="text-lg font-bold">
            {t.common.underDevTitle}
          </h2>
          <p className="text-sm text-ink-soft">{t.common.underDevText}</p>
          <Button className="mt-2 w-full py-2.5 text-sm" onClick={close}>
            {t.common.ok}
          </Button>
        </div>
      </dialog>
    </>
  );
}
