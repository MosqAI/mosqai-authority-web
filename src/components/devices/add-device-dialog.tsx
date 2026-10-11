"use client";

import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { registerDeviceAction } from "@/app/(console)/devices/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { Area, DeviceType } from "@/lib/types";

const inputClass =
  "w-full rounded-2xl border border-glass-border bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:ring-2 focus:ring-accent/30 focus:outline-none";

/** Register a trap; shows the one-time pairing code the owner types into the mobile app. */
export function AddDeviceDialog({ areas, initialOpen = false }: { areas: Area[]; initialOpen?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<DeviceType>("MOSQUITO_TRAP");
  const [areaName, setAreaName] = useState(areas[0]?.name ?? "");
  const [sector, setSector] = useState("");
  const [result, setResult] = useState<{ id: string; pairingCode: string } | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const open = () => {
    setResult(null);
    setError(false);
    setCopied(false);
    setSector("");
    ref.current?.showModal();
  };
  const close = () => {
    ref.current?.close();
    // Drop ?add=1 so a refresh doesn't reopen the dialog.
    if (initialOpen) router.replace("/devices");
  };

  useEffect(() => {
    if (initialOpen) ref.current?.showModal();
  }, [initialOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerDeviceAction({ type, areaName, sector: sector || areaName });
      if (res.ok) {
        setResult({ id: res.id, pairingCode: res.pairingCode });
        router.refresh();
      } else setError(true);
    });
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.pairingCode).catch(() => {});
    setCopied(true);
  };

  return (
    <>
      <Button onClick={open}>
        <Plus className="size-3.5" aria-hidden /> {t.devices.add}
      </Button>

      <dialog
        ref={ref}
        aria-labelledby="add-device-title"
        className="m-auto w-[min(92vw,30rem)] rounded-[1.75rem] border border-white bg-white p-0 text-ink shadow-2xl backdrop:bg-slate-900/45 backdrop:backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-2">
          <h2 id="add-device-title" className="text-lg font-bold">
            {result ? fmt(t.devices.successTitle, { id: result.id }) : t.devices.addTitle}
          </h2>
          <button type="button" onClick={close} aria-label={t.devices.cancel} className="rounded-full p-1.5 text-ink-faint hover:bg-white hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        {result ? (
          <div className="flex flex-col gap-4 p-6 pt-2">
            <p className="text-sm text-ink-soft">{t.devices.successHint}</p>
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm">
              <KeyRound className="size-5 shrink-0 text-accent" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium tracking-wide text-ink-faint uppercase">{t.devices.pairingCode}</p>
                <p className="font-mono text-xl font-bold tracking-wider text-ink">{result.pairingCode}</p>
              </div>
              <Button variant="secondary" onClick={copy}>
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? t.devices.copied : t.devices.copy}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={close}>{t.devices.done}</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 p-6 pt-2">
            <p className="text-sm text-ink-soft">{t.devices.addHint}</p>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
              {t.devices.type}
              <Select label={t.devices.type} value={type} onChange={(e) => setType(e.target.value as DeviceType)} className="w-full">
                {(Object.keys(t.enums.deviceType) as DeviceType[]).map((k) => (
                  <option key={k} value={k}>
                    {t.enums.deviceType[k]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
              {t.devices.area}
              <Select label={t.devices.area} value={areaName} onChange={(e) => setAreaName(e.target.value)} className="w-full">
                {areas.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
              {t.devices.sector}
              <input className={inputClass} value={sector} onChange={(e) => setSector(e.target.value)} placeholder={t.devices.sectorPlaceholder} maxLength={80} />
            </label>
            {error && <p className="text-sm text-rose-600">{t.devices.failed}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={close}>
                {t.devices.cancel}
              </Button>
              <Button type="submit" disabled={pending || !areaName}>
                {pending ? t.devices.registering : t.devices.register}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
