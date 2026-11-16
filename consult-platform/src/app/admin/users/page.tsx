import { AdminHeader, Feedback, inputClass, Panel } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { setUserRole } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const query = await searchParams;
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, company, role, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Could not load users: ${error.message}`);
  const rows = data ?? [];

  return (
    <>
      <AdminHeader
        title="Users"
        intro="Everyone with an account. Editors can manage courses, live sessions and website content. Admins can do everything, including seeing leads and payments."
      />
      <Feedback query={query} />
      <Panel className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              {["Name", "Company", "Joined", "Role"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3">
                  <span className="font-medium">{row.full_name || "—"}</span>
                  <span className="block text-xs text-muted">{row.email}</span>
                </td>
                <td className="px-4 py-3">{row.company ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(row.created_at)}</td>
                <td className="px-4 py-3">
                  <form action={setUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={row.id} />
                    <select
                      name="role"
                      defaultValue={row.role}
                      aria-label={`Role for ${row.email}`}
                      disabled={row.id === me.id}
                      className={`${inputClass} w-32`}
                    >
                      <option value="member">Member</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {row.id === me.id ? (
                      <span className="text-xs text-muted">You</span>
                    ) : (
                      <button type="submit" className={buttonClass("outline", "sm")}>
                        Save
                      </button>
                    )}
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
