"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { registerDevice } from "@/lib/api";

const schema = z.object({
  type: z.enum(["MOSQUITO_TRAP", "CAMERA_TRAP", "WEATHER_SENSOR"]),
  areaName: z.string().trim().min(1),
  sector: z.string().trim().min(1).max(80),
});

export type RegisterResult = { ok: true; id: string; pairingCode: string } | { ok: false };

export async function registerDeviceAction(input: z.input<typeof schema>): Promise<RegisterResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  try {
    const { device, pairingCode } = await registerDevice(parsed.data);
    revalidatePath("/devices");
    revalidatePath("/");
    return { ok: true, id: device.id, pairingCode };
  } catch {
    return { ok: false };
  }
}
