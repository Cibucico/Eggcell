"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { brand, siteUrl } from "@/config/brand";
import { notifyTeam } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashIdNumber, ID_MESSAGES, idNumberError } from "@/lib/verification";
import { isSupabaseConfigured, PREVIEW_MESSAGE } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { safeNextPath } from "@/lib/utils";
import {
  formObject,
  idNumberSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  validationError,
} from "@/lib/validation";

const preview: ActionState = { status: "error", message: PREVIEW_MESSAGE };

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured) return preview;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        status: "error",
        message: "Please confirm your email address first. Check your inbox for the link we sent.",
      };
    }
    // Same message for a wrong email or a wrong password, so the form does
    // not reveal which addresses have accounts.
    return { status: "error", message: "The email or password is incorrect." };
  }
  redirect(safeNextPath(String(formData.get("next") ?? "")));
}

/**
 * On women-only sites: checks the ID number and that it is not already in
 * use. Returns the keyed hash to store, or a field error.
 */
async function checkIdForSignUp(
  formData: FormData,
): Promise<{ hash: string } | { error: ActionState }> {
  const parsed = idNumberSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: validationError(parsed.error) };
  const fieldError = (message: string): { error: ActionState } => ({
    error: { status: "error", message: "Please check the highlighted fields.", fieldErrors: { id_number: message } },
  });
  const problem = idNumberError(parsed.data.id_number);
  if (problem) return fieldError(problem);
  let hash: string;
  try {
    hash = hashIdNumber(parsed.data.id_number);
  } catch (err) {
    console.error("[verification]", (err as Error).message);
    return { error: { status: "error", message: ID_MESSAGES.unavailable } };
  }
  const { data: existing, error } = await createAdminClient()
    .from("profiles")
    .select("id")
    .eq("id_number_hash", hash)
    .maybeSingle();
  if (error) return { error: { status: "error", message: ID_MESSAGES.unavailable } };
  if (existing) return fieldError(ID_MESSAGES.taken);
  return { hash };
}

/** Records a checked ID against an account and puts it in the approval queue. */
async function markPending(userId: string, hash: string, name: string, email: string) {
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ id_number_hash: hash, verification_status: "pending" })
    .eq("id", userId);
  if (error) {
    console.error("[verification] could not record ID check", error.code);
    return false;
  }
  await notifyTeam(`New member waiting for approval: ${name}`, [
    `${name} (${email}) has signed up and her ID number has been checked.`,
    "Approve or decline her membership under Admin, Members.",
  ]);
  return true;
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured) return preview;

  let idHash: string | null = null;
  if (brand.features.womenOnly) {
    const checked = await checkIdForSignUp(formData);
    if ("error" in checked) return checked.error;
    idHash = checked.hash;
  }

  const next = safeNextPath(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    if (error.code === "weak_password") {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        fieldErrors: { password: "Choose a stronger password: longer, and not a common one." },
      };
    }
    if (error.code === "over_email_send_rate_limit") {
      return { status: "error", message: "Too many attempts. Please wait a minute and try again." };
    }
    console.error("[auth] sign-up failed", error.code, error.message);
    return { status: "error", message: "We could not create your account. Please try again." };
  }

  // Supabase returns a user with no identities when the email is already
  // registered; there is then nothing to record against.
  if (idHash && data.user && (data.user.identities?.length ?? 0) > 0) {
    await markPending(data.user.id, idHash, parsed.data.full_name, parsed.data.email);
  }

  // With email confirmation switched off, Supabase signs the user in at once.
  if (data.session) redirect(next);
  return {
    status: "success",
    message: brand.features.womenOnly
      ? "Almost done. We have sent a confirmation link to your email address. Open it to activate your account; we will then review your membership."
      : "Almost done. We have sent a confirmation link to your email address. Open it to activate your account.",
  };
}

/** For signed-in members whose account has no ID check yet (or was declined and resubmits). */
export async function submitIdForVerification(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!brand.features.womenOnly || !isSupabaseConfigured) return preview;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, verification_status")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || profile.verification_status === "approved" || profile.verification_status === "pending") {
    redirect("/dashboard");
  }

  const checked = await checkIdForSignUp(formData);
  if ("error" in checked) return checked.error;
  const ok = await markPending(userId, checked.hash, profile.full_name || profile.email, profile.email);
  if (!ok) return { status: "error", message: ID_MESSAGES.unavailable };
  redirect("/dashboard?verification=submitted");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z.object({ email: loginSchema.shape.email }).safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured) return preview;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error) console.error("[auth] reset request failed", error.code);
  // Always the same answer, whether or not the address has an account.
  return {
    status: "success",
    message:
      "If an account exists for that address, we have sent a link to reset the password. It is valid for one hour.",
  };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ password: registerSchema.shape.password, confirm: z.string() })
    .refine((v) => v.password === v.confirm, {
      path: ["confirm"],
      message: "The passwords do not match",
    })
    .safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured) return preview;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return {
      status: "error",
      message: "This reset link has expired. Please request a new one.",
    };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message =
      error.code === "same_password"
        ? "Choose a password you have not used before."
        : error.code === "weak_password"
          ? "Choose a stronger password: longer, and not a common one."
          : "We could not update your password. Please try again.";
    return { status: "error", message };
  }
  redirect("/dashboard?updated=password");
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = profileSchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured) return preview;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login?next=/dashboard/profile");

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", userId);
  if (error) {
    console.error("[profile] update failed", error.message);
    return { status: "error", message: "We could not save your details. Please try again." };
  }
  return { status: "success", message: "Your details have been saved." };
}
