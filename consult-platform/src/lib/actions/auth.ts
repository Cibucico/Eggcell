"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { siteUrl } from "@/config/brand";
import { isSupabaseConfigured, PREVIEW_MESSAGE } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { safeNextPath } from "@/lib/utils";
import {
  formObject,
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

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured) return preview;

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
  // With email confirmation switched off, Supabase signs the user in at once.
  if (data.session) redirect(next);
  return {
    status: "success",
    message:
      "Almost done. We have sent a confirmation link to your email address. Open it to activate your account.",
  };
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
