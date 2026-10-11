"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUser, resetUserPassword, updateUser, type CredentialsResult } from "@/lib/api";
import { BackendError } from "@/lib/backend";
import { can, requireRole } from "@/lib/session";

const ROLES = ["ADMIN", "AUTHORITY_ADMIN", "AUTHORITY_VIEWER"] as const;

export type UserActionResult = ({ ok: true } & Partial<CredentialsResult>) | { ok: false; error: "exists" | "failed" };

const fail = (err: unknown): UserActionResult => ({
  ok: false,
  error: err instanceof BackendError && err.status === 409 ? "exists" : "failed",
});

const createSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.email(), role: z.enum(ROLES) });

export async function createUserAction(input: z.input<typeof createSchema>): Promise<UserActionResult> {
  await requireRole(can.manageUsers);
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "failed" };
  try {
    const result = await createUser(parsed.data);
    revalidatePath("/users");
    return { ok: true, ...result };
  } catch (err) {
    return fail(err);
  }
}

export async function updateUserAction(id: string, patch: { role?: (typeof ROLES)[number]; active?: boolean }): Promise<UserActionResult> {
  await requireRole(can.manageUsers);
  try {
    await updateUser(id, z.object({ role: z.enum(ROLES).optional(), active: z.boolean().optional() }).parse(patch));
    revalidatePath("/users");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function resetPasswordAction(id: string): Promise<UserActionResult> {
  await requireRole(can.manageUsers);
  try {
    const result = await resetUserPassword(id);
    return { ok: true, ...result };
  } catch (err) {
    return fail(err);
  }
}
