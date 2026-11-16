import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ResourceForm } from "@/components/admin/resource-form";
import { AdminHeader, Feedback, Panel } from "@/components/admin/ui";
import { deleteResource } from "@/lib/actions/admin";
import { toFormValue } from "@/lib/admin/form";
import { getResource } from "@/lib/admin/resources";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ResourceEditPage({
  params,
  searchParams,
}: PageProps<"/admin/content/[resource]/[id]">) {
  const [{ resource: key, id }, query] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource) notFound();
  await (resource.access === "admin" ? requireAdmin() : requireStaff());

  const isNew = id === "new";
  let row: Record<string, unknown> = {};
  if (!isNew) {
    if (!z.uuid().safeParse(id).success) notFound();
    const supabase = await createClient();
    const { data } = await supabase.from(resource.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data;
    if (resource.companion) {
      const { data: extra } = await supabase
        .from(resource.companion.table)
        .select("*")
        .eq(resource.companion.key, id)
        .maybeSingle();
      row = { ...extra, ...row };
    }
  }

  const values: Record<string, string | boolean> = {};
  for (const field of resource.fields) {
    const stored = isNew ? field.initial : row[field.name];
    values[field.name] =
      field.type === "boolean" ? stored === true : isNew ? String(stored ?? "") : toFormValue(field, stored, row.kind);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/content/${resource.key}`}
        prefetch={false}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {resource.label}
      </Link>
      <AdminHeader
        title={isNew ? `New ${resource.singular}` : String(row[resource.titleField] ?? resource.singular)}
        action={
          !isNew && resource.extraLink ? (
            <Link
              href={resource.extraLink.href(id)}
              prefetch={false}
              className="inline-flex h-11 items-center gap-2 rounded-brand bg-accent px-5 text-sm font-semibold text-accent-fg"
            >
              {resource.extraLink.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : undefined
        }
      />
      <Feedback query={query} />
      <Panel className="p-6">
        <ResourceForm resourceKey={resource.key} id={isNew ? null : id} fields={resource.fields} values={values} />
      </Panel>
      {!isNew && (
        <form action={deleteResource} className="mt-6">
          <input type="hidden" name="_resource" value={resource.key} />
          <input type="hidden" name="_id" value={id} />
          <ConfirmButton message={`Delete this ${resource.singular}? This cannot be undone.`}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete this {resource.singular}
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
