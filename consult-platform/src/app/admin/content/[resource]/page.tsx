import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Feedback, Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { getResource, type Field } from "@/lib/admin/resources";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatMoney } from "@/lib/utils";

function cell(field: Field, row: Record<string, unknown>) {
  const value = row[field.name];
  if (field.type === "boolean") {
    return value ? <Badge tone="success">Yes</Badge> : <Badge>No</Badge>;
  }
  if (value === null || value === undefined || value === "") return <span className="text-muted">—</span>;
  if (field.type === "money") return formatMoney(Number(value));
  if (field.type === "datetime") return formatDateTime(String(value));
  if (field.name === "value") {
    return row.kind === "percent" ? `${value}%` : formatMoney(Number(value));
  }
  return String(value);
}

export default async function ResourceListPage({
  params,
  searchParams,
}: PageProps<"/admin/content/[resource]">) {
  const [{ resource: key }, query] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource) notFound();
  await (resource.access === "admin" ? requireAdmin() : requireStaff());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.orderBy.column, { ascending: resource.orderBy.ascending })
    .limit(200);
  if (error) throw new Error(`Could not load ${resource.label.toLowerCase()}: ${error.message}`);
  const rows = (data ?? []) as Record<string, unknown>[];
  const columns = resource.fields.filter((f) => f.column);

  return (
    <>
      <AdminHeader
        title={resource.label}
        action={
          <ButtonLink href={`/admin/content/${resource.key}/new`} prefetch={false}>
            <Plus className="h-4 w-4" aria-hidden />
            New {resource.singular}
          </ButtonLink>
        }
      />
      <Feedback query={query} />
      {rows.length === 0 ? (
        <EmptyState title={`No ${resource.label.toLowerCase()} yet`} text="Create the first one to get started." />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                {columns.map((c) => (
                  <th key={c.name} scope="col" className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b border-line last:border-b-0">
                  {columns.map((c, i) => (
                    <td key={c.name} className="px-4 py-3">
                      {i === 0 ? (
                        <Link
                          href={`/admin/content/${resource.key}/${row.id}`}
                          prefetch={false}
                          className="font-semibold text-primary hover:underline"
                        >
                          {cell(c, row)}
                        </Link>
                      ) : (
                        cell(c, row)
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/content/${resource.key}/${row.id}`}
                      prefetch={false}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  );
}
