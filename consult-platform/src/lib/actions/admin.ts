"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { parseResourceForm } from "@/lib/admin/form";
import { getResource } from "@/lib/admin/resources";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { blocksSchema } from "@/lib/blocks";
import { brand, siteUrl } from "@/config/brand";
import { sendEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/**
 * Every action here checks the caller's role first, and the database checks
 * it again through row level security, so neither layer is trusted alone.
 */

const uuid = z.uuid();
const fail = (message: string): ActionState => ({ status: "error", message });

// ---------------------------------------------------------------------------
// Generic content (services, team, case studies, courses, live sessions ...)
// ---------------------------------------------------------------------------

export async function saveResource(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const resource = getResource(String(formData.get("_resource") ?? ""));
  if (!resource) return fail("Unknown content type.");
  await (resource.access === "admin" ? requireAdmin() : requireStaff());

  const idRaw = String(formData.get("_id") ?? "");
  const id = idRaw === "" ? null : uuid.safeParse(idRaw).data;
  if (id === undefined) return fail("This record could not be found.");

  const parsed = parseResourceForm(resource, formData);
  if (!parsed.ok) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.fieldErrors };
  }

  const supabase = await createClient();
  let recordId = id;
  if (id) {
    const { error } = await supabase.from(resource.table).update(parsed.main).eq("id", id);
    if (error) return saveError(error);
  } else {
    const { data, error } = await supabase.from(resource.table).insert(parsed.main).select("id").single();
    if (error) return saveError(error);
    recordId = data.id as string;
  }

  if (resource.companion && recordId) {
    const { error } = await supabase
      .from(resource.companion.table)
      .upsert({ [resource.companion.key]: recordId, ...parsed.companion }, { onConflict: resource.companion.key });
    if (error) return saveError(error);
  }

  if (resource.tag) updateTag(resource.tag);
  if (!id) redirect(`/admin/content/${resource.key}/${recordId}?saved=1`);
  return { status: "success", message: "Saved." };
}

function saveError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: {
        slug: "This web address name is already in use",
        code: "This code already exists",
      },
    };
  }
  if (error.code === "42501") return fail("You do not have permission to change this.");
  console.error("[admin] save failed", error.code, error.message);
  return fail("This could not be saved. Please try again.");
}

export async function deleteResource(formData: FormData) {
  const resource = getResource(String(formData.get("_resource") ?? ""));
  const id = uuid.safeParse(formData.get("_id")).data;
  if (!resource || !id) redirect("/admin");
  await (resource.access === "admin" ? requireAdmin() : requireStaff());

  const supabase = await createClient();
  const { error } = await supabase.from(resource.table).delete().eq("id", id);
  if (error) {
    // Usually a course or session that people have already paid for or joined.
    redirect(`/admin/content/${resource.key}/${id}?error=in-use`);
  }
  if (resource.tag) updateTag(resource.tag);
  redirect(`/admin/content/${resource.key}?deleted=1`);
}

// ---------------------------------------------------------------------------
// Course structure
// ---------------------------------------------------------------------------

const titleSchema = z.string().trim().min(1, "Enter a title").max(200);

export async function addModule(formData: FormData) {
  await requireStaff();
  const courseId = uuid.parse(formData.get("course_id"));
  const title = titleSchema.safeParse(formData.get("title"));
  if (!title.success) redirect(`/admin/courses/${courseId}?error=title`);

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("course_modules")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  await supabase
    .from("course_modules")
    .insert({ course_id: courseId, title: title.data, sort_order: (last?.sort_order ?? 0) + 1 });
  updateTag("courses");
  redirect(`/admin/courses/${courseId}`);
}

export async function renameModule(formData: FormData) {
  await requireStaff();
  const courseId = uuid.parse(formData.get("course_id"));
  const moduleId = uuid.parse(formData.get("module_id"));
  const title = titleSchema.safeParse(formData.get("title"));
  if (title.success) {
    const supabase = await createClient();
    await supabase.from("course_modules").update({ title: title.data }).eq("id", moduleId);
    updateTag("courses");
  }
  redirect(`/admin/courses/${courseId}`);
}

export async function deleteModule(formData: FormData) {
  await requireStaff();
  const courseId = uuid.parse(formData.get("course_id"));
  const moduleId = uuid.parse(formData.get("module_id"));
  const supabase = await createClient();
  await supabase.from("course_modules").delete().eq("id", moduleId);
  updateTag("courses");
  redirect(`/admin/courses/${courseId}`);
}

export async function addLesson(formData: FormData) {
  await requireStaff();
  const courseId = uuid.parse(formData.get("course_id"));
  const moduleId = uuid.parse(formData.get("module_id"));
  const title = titleSchema.safeParse(formData.get("title"));
  if (!title.success) redirect(`/admin/courses/${courseId}?error=title`);

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      course_id: courseId,
      module_id: moduleId,
      title: title.data,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single();
  if (error || !lesson) redirect(`/admin/courses/${courseId}?error=save`);
  await supabase.from("lesson_contents").insert({ lesson_id: lesson.id, blocks: [] });
  updateTag("courses");
  redirect(`/admin/lessons/${lesson.id}`);
}

export async function deleteLesson(formData: FormData) {
  await requireStaff();
  const courseId = uuid.parse(formData.get("course_id"));
  const lessonId = uuid.parse(formData.get("lesson_id"));
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  updateTag("courses");
  redirect(`/admin/courses/${courseId}`);
}

/** Moves a module or lesson one place up or down by swapping display order with its neighbour. */
export async function moveItem(formData: FormData) {
  await requireStaff();
  const courseId = uuid.parse(formData.get("course_id"));
  const itemId = uuid.parse(formData.get("item_id"));
  const table = formData.get("table") === "lessons" ? "lessons" : "course_modules";
  const direction = formData.get("direction") === "up" ? -1 : 1;

  const supabase = await createClient();
  const { data: item } = await supabase.from(table).select("*").eq("id", itemId).maybeSingle();
  if (item) {
    const scope = table === "lessons" ? "module_id" : "course_id";
    const { data: siblings } = await supabase
      .from(table)
      .select("id, sort_order")
      .eq(scope, item[scope])
      .order("sort_order")
      .order("created_at");
    const list = siblings ?? [];
    const index = list.findIndex((s) => s.id === itemId);
    const other = index + direction;
    if (index !== -1 && other >= 0 && other < list.length) {
      [list[index], list[other]] = [list[other], list[index]];
      // Renumber the whole group so equal or gappy orders are also repaired.
      await Promise.all(
        list.map((s, i) => supabase.from(table).update({ sort_order: i + 1 }).eq("id", s.id)),
      );
      updateTag("courses");
    }
  }
  redirect(`/admin/courses/${courseId}`);
}

const lessonSchema = z.object({
  lesson_id: uuid,
  title: titleSchema,
  duration_minutes: z.coerce.number().int().min(0).max(600),
  is_preview: z.string().optional(),
  blocks: z.string(),
});

export async function saveLesson(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = lessonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  let json: unknown;
  try {
    json = JSON.parse(parsed.data.blocks);
  } catch {
    return fail("The lesson content could not be read. Please reload the page and try again.");
  }
  const blocks = blocksSchema.safeParse(json);
  if (!blocks.success) {
    const issue = blocks.error.issues[0];
    const position = typeof issue.path[0] === "number" ? `Block ${issue.path[0] + 1}: ` : "";
    return fail(`${position}${issue.message}. Fix it and save again.`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      duration_minutes: parsed.data.duration_minutes,
      is_preview: parsed.data.is_preview === "on",
    })
    .eq("id", parsed.data.lesson_id);
  if (error) return fail("The lesson could not be saved. Please try again.");
  const { error: contentError } = await supabase
    .from("lesson_contents")
    .upsert({ lesson_id: parsed.data.lesson_id, blocks: blocks.data }, { onConflict: "lesson_id" });
  if (contentError) return fail("The lesson content could not be saved. Please try again.");

  updateTag("courses");
  return { status: "success", message: "Lesson saved." };
}

// ---------------------------------------------------------------------------
// Leads, bookings and users (admins only)
// ---------------------------------------------------------------------------

const notes = z.string().trim().max(5000).transform((v) => v || null);

export async function updateLead(formData: FormData) {
  await requireAdmin();
  const table = formData.get("table") === "investor_leads" ? "investor_leads" : "enquiries";
  const parsed = z
    .object({ id: uuid, status: z.enum(["new", "in_progress", "closed"]), admin_notes: notes })
    .safeParse(Object.fromEntries(formData));
  const back = table === "enquiries" ? "/admin/enquiries" : "/admin/investors";
  if (!parsed.success) redirect(`${back}?error=1`);
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  await supabase.from(table).update(values).eq("id", id);
  redirect(`${back}?saved=1`);
}

export async function updateBooking(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      id: uuid,
      status: z.enum(["requested", "confirmed", "completed", "cancelled"]),
      meeting_link: z
        .string()
        .trim()
        .max(2000)
        .refine((v) => v === "" || /^https:\/\/\S+$/i.test(v))
        .transform((v) => v || null),
      admin_notes: notes,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/bookings?error=1");
  const { id, ...values } = parsed.data;
  // Hold the consultation in the site's own meeting room.
  if (brand.features.meetingRoom && formData.get("use_room") === "on") {
    values.meeting_link = `${siteUrl}/meeting-room/consultation/${id}`;
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("bookings")
    .select("status, name, email, preferred_date, preferred_time, mode")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("bookings").update(values).eq("id", id);
  if (error || !before) redirect("/admin/bookings?error=1");

  // Tell the client the first time a booking is confirmed.
  if (values.status === "confirmed" && before.status !== "confirmed") {
    await sendEmail({
      to: before.email,
      subject: `Your consultation is confirmed | ${brand.name}`,
      text: [
        `Hello ${before.name},`,
        "",
        `Your consultation with ${brand.name} is confirmed for ${formatDate(before.preferred_date)} at ${before.preferred_time} (South African time).`,
        values.meeting_link ? `\nJoin here: ${values.meeting_link}` : "",
        before.mode === "in_person" && brand.contact.addressLines.length > 0
          ? `\nWhere: ${brand.contact.addressLines.join(", ")}`
          : "",
        "",
        brand.contact.phone
          ? `If you need to change the time, reply to this email or call ${brand.contact.phone}.`
          : "If you need to change the time, reply to this email.",
        "",
        brand.name,
      ].join("\n"),
      replyTo: brand.contact.email,
    });
  }
  redirect("/admin/bookings?saved=1");
}

export async function setUserRole(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ user_id: uuid, role: z.enum(["member", "editor", "admin"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/users?error=1");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", {
    p_user_id: parsed.data.user_id,
    p_role: parsed.data.role,
  });
  redirect(error ? "/admin/users?error=self" : "/admin/users?saved=1");
}

// ---------------------------------------------------------------------------
// Membership approval (women-only sites)
// ---------------------------------------------------------------------------

export async function decideMembership(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      user_id: uuid,
      decision: z.enum(["approved", "rejected"]),
      note: z.string().trim().max(500).optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/users?error=1");

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", parsed.data.user_id)
    .maybeSingle();
  const { error } = await supabase.rpc("set_verification", {
    p_user_id: parsed.data.user_id,
    p_status: parsed.data.decision,
    p_note: parsed.data.note ?? null,
  });
  if (error || !member) redirect("/admin/users?error=1");

  if (parsed.data.decision === "approved") {
    await sendEmail({
      to: member.email,
      subject: `Welcome to ${brand.name}`,
      text: [
        `Hello ${member.full_name || "there"},`,
        "",
        `Your ${brand.name} membership has been approved. You can now join webinars and meetings in our meeting room.`,
        "",
        "Sign in to see what is coming up.",
        "",
        brand.name,
      ].join("\n"),
      replyTo: brand.contact.email,
    });
  }
  redirect("/admin/users?saved=1");
}
